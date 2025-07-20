-- Concrete Work Types Schema Extension
-- This extends the existing schema to support DSM-specific concrete cutting and drilling work types

-- Create enum for concrete work types
CREATE TYPE concrete_work_type AS ENUM (
  'break_remove',
  'core_drill',
  'wall_saw',
  'slab_saw',
  'chain_saw',
  'ring_saw',
  'hand_saw',
  'chipping',
  'joint_sealing',
  'demolition'
);

-- Create enum for work categories
CREATE TYPE work_category AS ENUM (
  'drilling',
  'sawing',
  'breaking',
  'finishing'
);

-- Extend assets table to support concrete work assignments
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS assigned_work_type concrete_work_type,
ADD COLUMN IF NOT EXISTS last_work_completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS total_work_hours DECIMAL(10,2) DEFAULT 0;

-- Create work orders table for tracking concrete cutting jobs
CREATE TABLE IF NOT EXISTS work_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  work_type concrete_work_type NOT NULL,
  category work_category NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  
  -- Job details
  client_name VARCHAR(255),
  site_address TEXT,
  scheduled_date DATE,
  
  -- Dimensions and calculations
  length_mm INTEGER,
  depth_mm INTEGER,
  width_mm INTEGER,
  calculated_volume DECIMAL(10,6), -- m³
  calculated_duration INTEGER, -- minutes
  calculated_water_required INTEGER, -- liters
  calculated_power_consumption DECIMAL(10,2), -- kWh
  
  -- Equipment assignments
  assigned_equipment JSONB DEFAULT '[]',
  job_size VARCHAR(20) CHECK (job_size IN ('small', 'medium', 'large')),
  
  -- Safety and compliance
  dust_suppression_method VARCHAR(100),
  safety_requirements JSONB DEFAULT '[]',
  permits_required BOOLEAN DEFAULT false,
  
  -- Tracking
  created_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  
  -- Metadata
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create equipment usage tracking
CREATE TABLE IF NOT EXISTS equipment_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id),
  
  -- Usage details
  equipment_name VARCHAR(255) NOT NULL,
  model VARCHAR(100),
  power_rating DECIMAL(5,2), -- kW
  
  -- Time tracking
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  duration_minutes INTEGER,
  
  -- Wear and maintenance
  wear_percentage DECIMAL(5,2),
  maintenance_notes TEXT,
  
  -- Consumables
  blade_type VARCHAR(100),
  blade_size VARCHAR(50),
  water_used_liters INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create cutting calculations log
CREATE TABLE IF NOT EXISTS cutting_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Input parameters
  work_type concrete_work_type NOT NULL,
  length_mm INTEGER NOT NULL,
  depth_mm INTEGER NOT NULL,
  width_mm INTEGER,
  
  -- Calculated results
  volume_m3 DECIMAL(10,6),
  duration_minutes INTEGER,
  water_required_liters INTEGER,
  equipment_wear_percentage DECIMAL(5,2),
  dust_generated_kg DECIMAL(10,2),
  power_consumption_kwh DECIMAL(10,2),
  
  -- Context
  calculated_by UUID REFERENCES profiles(id),
  calculated_at TIMESTAMP DEFAULT NOW()
);

-- Create safety compliance tracking
CREATE TABLE IF NOT EXISTS safety_compliance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Dust suppression
  dust_suppression_verified BOOLEAN DEFAULT false,
  water_supply_adequate BOOLEAN,
  vacuum_system_used BOOLEAN,
  containment_installed BOOLEAN,
  
  -- PPE verification
  hearing_protection BOOLEAN DEFAULT false,
  eye_protection BOOLEAN DEFAULT false,
  respiratory_protection BOOLEAN DEFAULT false,
  other_ppe JSONB DEFAULT '[]',
  
  -- Environmental
  slurry_disposal_plan TEXT,
  noise_mitigation TEXT,
  
  -- Verification
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_work_orders_work_type ON work_orders(work_type);
CREATE INDEX idx_work_orders_status ON work_orders(status);
CREATE INDEX idx_work_orders_scheduled_date ON work_orders(scheduled_date);
CREATE INDEX idx_equipment_usage_asset ON equipment_usage(asset_id);
CREATE INDEX idx_equipment_usage_dates ON equipment_usage(start_time, end_time);

-- Create view for active work orders with equipment
CREATE OR REPLACE VIEW active_work_orders AS
SELECT 
  wo.*,
  COUNT(DISTINCT eu.asset_id) as equipment_count,
  COALESCE(SUM(eu.duration_minutes), 0) as total_equipment_minutes,
  COALESCE(SUM(eu.water_used_liters), 0) as total_water_used,
  json_agg(DISTINCT 
    jsonb_build_object(
      'asset_id', eu.asset_id,
      'equipment_name', eu.equipment_name,
      'duration_minutes', eu.duration_minutes
    )
  ) FILTER (WHERE eu.asset_id IS NOT NULL) as equipment_details
FROM work_orders wo
LEFT JOIN equipment_usage eu ON wo.id = eu.work_order_id
WHERE wo.status IN ('pending', 'in_progress', 'scheduled')
GROUP BY wo.id;

-- Create view for equipment utilization by work type
CREATE OR REPLACE VIEW equipment_utilization_by_type AS
SELECT 
  wo.work_type,
  wo.category,
  COUNT(DISTINCT eu.id) as usage_count,
  COUNT(DISTINCT eu.asset_id) as unique_equipment_count,
  AVG(eu.duration_minutes) as avg_duration_minutes,
  SUM(eu.duration_minutes) as total_duration_minutes,
  AVG(eu.wear_percentage) as avg_wear_percentage,
  SUM(eu.water_used_liters) as total_water_used
FROM work_orders wo
JOIN equipment_usage eu ON wo.id = eu.work_order_id
WHERE wo.completed_at IS NOT NULL
GROUP BY wo.work_type, wo.category;

-- Add trigger to update asset work hours
CREATE OR REPLACE FUNCTION update_asset_work_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    UPDATE assets 
    SET 
      total_work_hours = COALESCE(total_work_hours, 0) + (NEW.duration_minutes / 60.0),
      last_work_completed_at = NEW.end_time
    WHERE id = NEW.asset_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_asset_work_hours
AFTER UPDATE ON equipment_usage
FOR EACH ROW
EXECUTE FUNCTION update_asset_work_hours();

-- Add RLS policies
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cutting_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_compliance ENABLE ROW LEVEL SECURITY;

-- Work orders policies
CREATE POLICY "Users can view work orders from their company" ON work_orders
  FOR SELECT USING (
    created_by IN (
      SELECT id FROM profiles WHERE company_id = (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create work orders" ON work_orders
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their company's work orders" ON work_orders
  FOR UPDATE USING (
    created_by IN (
      SELECT id FROM profiles WHERE company_id = (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  );

-- Equipment usage policies
CREATE POLICY "Users can view equipment usage from their company" ON equipment_usage
  FOR SELECT USING (
    work_order_id IN (
      SELECT id FROM work_orders WHERE created_by IN (
        SELECT id FROM profiles WHERE company_id = (
          SELECT company_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can manage equipment usage" ON equipment_usage
  FOR ALL USING (
    work_order_id IN (
      SELECT id FROM work_orders WHERE created_by IN (
        SELECT id FROM profiles WHERE company_id = (
          SELECT company_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view calculations from their company" ON cutting_calculations
  FOR SELECT USING (calculated_by = auth.uid() OR work_order_id IN (
    SELECT id FROM work_orders WHERE created_by IN (
      SELECT id FROM profiles WHERE company_id = (
        SELECT company_id FROM profiles WHERE id = auth.uid()
      )
    )
  ));

CREATE POLICY "Users can create calculations" ON cutting_calculations
  FOR INSERT WITH CHECK (calculated_by = auth.uid());

CREATE POLICY "Users can manage safety compliance" ON safety_compliance
  FOR ALL USING (
    work_order_id IN (
      SELECT id FROM work_orders WHERE created_by IN (
        SELECT id FROM profiles WHERE company_id = (
          SELECT company_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );