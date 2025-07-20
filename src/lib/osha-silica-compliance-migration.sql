-- OSHA Silica Dust Compliance Extension for Concrete Work
-- This extends the concrete work types schema with OSHA compliance tracking

-- Create enum for dust control methods
CREATE TYPE dust_control_method AS ENUM (
  'water_suppression',
  'vacuum',
  'containment',
  'combined'
);

-- Create enum for respirator types
CREATE TYPE respirator_type AS ENUM (
  'n95',
  'p100',
  'half_face',
  'full_face'
);

-- Create enum for silica risk levels
CREATE TYPE silica_risk_level AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);

-- Extend work_orders table for OSHA compliance
ALTER TABLE work_orders 
ADD COLUMN IF NOT EXISTS indoor_outdoor VARCHAR(20) CHECK (indoor_outdoor IN ('indoor', 'outdoor')),
ADD COLUMN IF NOT EXISTS dust_control_method dust_control_method,
ADD COLUMN IF NOT EXISTS water_supply_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS vacuum_hepa_verified BOOLEAN DEFAULT false;

-- Create silica exposure assessments table
CREATE TABLE IF NOT EXISTS silica_exposure_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Exposure data
  exposure_level DECIMAL(6,4), -- mg/m³
  permissible_limit DECIMAL(6,4) DEFAULT 0.05, -- OSHA PEL
  action_level DECIMAL(6,4) DEFAULT 0.025,
  risk_level silica_risk_level NOT NULL,
  requires_written_plan BOOLEAN DEFAULT false,
  estimated_duration DECIMAL(5,2), -- hours
  
  -- Required controls
  required_controls JSONB DEFAULT '[]',
  
  -- Calculation parameters
  base_exposure DECIMAL(6,4),
  control_efficiency DECIMAL(4,3),
  location_factor DECIMAL(3,2),
  
  -- Metadata
  calculated_at TIMESTAMP DEFAULT NOW(),
  calculated_by UUID REFERENCES profiles(id)
);

-- Create safety compliance details table
CREATE TABLE IF NOT EXISTS safety_compliance_details (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- PPE compliance
  hearing_protection BOOLEAN DEFAULT false,
  eye_protection BOOLEAN DEFAULT false,
  respiratory_protection BOOLEAN DEFAULT false,
  respirator_type respirator_type,
  other_ppe JSONB DEFAULT '[]',
  
  -- Photo verification
  water_system_photo_url TEXT,
  respiratory_equipment_photo_url TEXT,
  site_conditions_photo_url TEXT,
  containment_setup_photo_url TEXT,
  
  -- Verification timestamps
  photos_uploaded_at TIMESTAMP,
  photos_verified_by UUID REFERENCES profiles(id),
  photos_verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create exposure control plans table
CREATE TABLE IF NOT EXISTS exposure_control_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id) ON DELETE CASCADE,
  
  -- Plan content
  plan_content TEXT NOT NULL,
  plan_version INTEGER DEFAULT 1,
  
  -- Approval workflow
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'approved', 'rejected')),
  submitted_by UUID REFERENCES profiles(id),
  submitted_at TIMESTAMP,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMP,
  review_comments TEXT,
  
  -- Implementation tracking
  implemented BOOLEAN DEFAULT false,
  implementation_date DATE,
  
  -- Compliance
  osha_compliant BOOLEAN DEFAULT false,
  compliance_notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create medical surveillance records
CREATE TABLE IF NOT EXISTS medical_surveillance_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES profiles(id),
  
  -- Medical exam data
  exam_date DATE NOT NULL,
  exam_type VARCHAR(50) CHECK (exam_type IN ('initial', 'periodic', 'termination')),
  exam_provider VARCHAR(255),
  
  -- Results (summary only, detailed records kept separately)
  fit_for_respirator BOOLEAN,
  restrictions TEXT,
  next_exam_due DATE,
  
  -- Exposure history
  days_exposed_ytd INTEGER DEFAULT 0,
  cumulative_exposure_days INTEGER DEFAULT 0,
  highest_exposure_level DECIMAL(6,4),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create training records for silica hazard
CREATE TABLE IF NOT EXISTS silica_training_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES profiles(id),
  
  -- Training details
  training_date DATE NOT NULL,
  training_type VARCHAR(100),
  trainer_name VARCHAR(255),
  training_duration_hours DECIMAL(4,2),
  
  -- Topics covered
  topics_covered JSONB DEFAULT '[]',
  
  -- Certification
  certificate_number VARCHAR(100),
  certificate_expiry DATE,
  
  -- Verification
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create daily exposure logs
CREATE TABLE IF NOT EXISTS daily_exposure_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  work_order_id UUID REFERENCES work_orders(id),
  employee_id UUID REFERENCES profiles(id),
  log_date DATE NOT NULL,
  
  -- Exposure data
  start_time TIME NOT NULL,
  end_time TIME,
  duration_hours DECIMAL(4,2),
  
  -- Controls used
  dust_controls_used JSONB DEFAULT '[]',
  ppe_used JSONB DEFAULT '[]',
  
  -- Monitoring
  air_monitoring_performed BOOLEAN DEFAULT false,
  monitoring_results DECIMAL(6,4), -- mg/m³
  
  -- Issues
  control_failures TEXT,
  corrective_actions TEXT,
  
  -- Sign-off
  employee_signature_timestamp TIMESTAMP,
  supervisor_id UUID REFERENCES profiles(id),
  supervisor_signature_timestamp TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(work_order_id, employee_id, log_date)
);

-- Create compliance dashboard view
CREATE OR REPLACE VIEW osha_compliance_dashboard AS
SELECT 
  wo.id as work_order_id,
  wo.order_number,
  wo.work_type,
  wo.status,
  wo.scheduled_date,
  wo.indoor_outdoor,
  
  -- Risk assessment
  sea.exposure_level,
  sea.risk_level,
  sea.requires_written_plan,
  
  -- Compliance status
  scd.hearing_protection AND scd.eye_protection AND scd.respiratory_protection as ppe_complete,
  CASE 
    WHEN scd.water_system_photo_url IS NOT NULL OR scd.respiratory_equipment_photo_url IS NOT NULL 
    THEN true ELSE false 
  END as photos_uploaded,
  
  -- Control plan
  ecp.status as control_plan_status,
  ecp.osha_compliant,
  
  -- Active workers
  (SELECT COUNT(DISTINCT employee_id) FROM job_assignments ja WHERE ja.job_id = wo.id) as assigned_workers,
  
  -- Medical surveillance required
  CASE 
    WHEN sea.exposure_level > 0.025 THEN 
      (SELECT COUNT(*) FROM job_assignments ja WHERE ja.job_id = wo.id)
    ELSE 0
  END as workers_requiring_medical,
  
  wo.created_at,
  wo.updated_at
FROM work_orders wo
LEFT JOIN silica_exposure_assessments sea ON wo.id = sea.work_order_id
LEFT JOIN safety_compliance_details scd ON wo.id = scd.work_order_id
LEFT JOIN exposure_control_plans ecp ON wo.id = ecp.work_order_id
WHERE wo.work_type IS NOT NULL;

-- Create worker exposure summary view
CREATE OR REPLACE VIEW worker_exposure_summary AS
SELECT 
  p.id as employee_id,
  p.full_name,
  p.email,
  
  -- Current year exposure
  COALESCE(
    (SELECT SUM(duration_hours) 
     FROM daily_exposure_logs del 
     WHERE del.employee_id = p.id 
     AND del.log_date >= date_trunc('year', NOW())), 0
  ) as hours_exposed_ytd,
  
  -- Days exposed above action level
  COALESCE(
    (SELECT COUNT(DISTINCT log_date) 
     FROM daily_exposure_logs del 
     JOIN work_orders wo ON del.work_order_id = wo.id
     JOIN silica_exposure_assessments sea ON wo.id = sea.work_order_id
     WHERE del.employee_id = p.id 
     AND sea.exposure_level > 0.025
     AND del.log_date >= date_trunc('year', NOW())), 0
  ) as days_above_action_level_ytd,
  
  -- Medical surveillance status
  msr.next_exam_due,
  CASE 
    WHEN msr.next_exam_due < NOW() THEN 'overdue'
    WHEN msr.next_exam_due < NOW() + interval '30 days' THEN 'due_soon'
    ELSE 'current'
  END as medical_status,
  
  -- Training status
  (SELECT MAX(training_date) 
   FROM silica_training_records str 
   WHERE str.employee_id = p.id) as last_training_date,
   
  -- Highest exposure
  (SELECT MAX(sea.exposure_level)
   FROM daily_exposure_logs del
   JOIN work_orders wo ON del.work_order_id = wo.id
   JOIN silica_exposure_assessments sea ON wo.id = sea.work_order_id
   WHERE del.employee_id = p.id) as highest_exposure_level
   
FROM profiles p
LEFT JOIN medical_surveillance_records msr ON p.id = msr.employee_id 
  AND msr.exam_date = (SELECT MAX(exam_date) FROM medical_surveillance_records WHERE employee_id = p.id)
WHERE p.role != 'admin';

-- Create compliance alerts view
CREATE OR REPLACE VIEW compliance_alerts AS
-- Workers needing medical surveillance
SELECT 
  'medical_surveillance_required' as alert_type,
  'high' as priority,
  p.id as employee_id,
  p.full_name as employee_name,
  'Employee has ' || COUNT(*) || ' days above action level - medical surveillance required' as message,
  NOW() as alert_date
FROM profiles p
JOIN daily_exposure_logs del ON p.id = del.employee_id
JOIN work_orders wo ON del.work_order_id = wo.id
JOIN silica_exposure_assessments sea ON wo.id = sea.work_order_id
WHERE sea.exposure_level > 0.025
AND del.log_date >= date_trunc('year', NOW())
GROUP BY p.id, p.full_name
HAVING COUNT(DISTINCT del.log_date) >= 30

UNION ALL

-- Overdue medical exams
SELECT 
  'medical_exam_overdue' as alert_type,
  'critical' as priority,
  msr.employee_id,
  p.full_name as employee_name,
  'Medical exam overdue since ' || msr.next_exam_due as message,
  NOW() as alert_date
FROM medical_surveillance_records msr
JOIN profiles p ON msr.employee_id = p.id
WHERE msr.next_exam_due < NOW()

UNION ALL

-- Missing exposure control plans
SELECT 
  'missing_control_plan' as alert_type,
  'high' as priority,
  NULL as employee_id,
  wo.order_number as employee_name,
  'Work order requires exposure control plan but none exists' as message,
  NOW() as alert_date
FROM work_orders wo
JOIN silica_exposure_assessments sea ON wo.id = sea.work_order_id
LEFT JOIN exposure_control_plans ecp ON wo.id = ecp.work_order_id
WHERE sea.requires_written_plan = true
AND ecp.id IS NULL
AND wo.status IN ('pending', 'in_progress', 'scheduled');

-- Indexes for performance
CREATE INDEX idx_silica_assessments_work_order ON silica_exposure_assessments(work_order_id);
CREATE INDEX idx_silica_assessments_risk_level ON silica_exposure_assessments(risk_level);
CREATE INDEX idx_compliance_details_work_order ON safety_compliance_details(work_order_id);
CREATE INDEX idx_control_plans_work_order ON exposure_control_plans(work_order_id);
CREATE INDEX idx_control_plans_status ON exposure_control_plans(status);
CREATE INDEX idx_medical_surveillance_employee ON medical_surveillance_records(employee_id);
CREATE INDEX idx_medical_surveillance_exam_date ON medical_surveillance_records(exam_date);
CREATE INDEX idx_training_records_employee ON silica_training_records(employee_id);
CREATE INDEX idx_training_records_date ON silica_training_records(training_date);
CREATE INDEX idx_exposure_logs_composite ON daily_exposure_logs(work_order_id, employee_id, log_date);

-- Enable RLS on all tables
ALTER TABLE silica_exposure_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_compliance_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE exposure_control_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_surveillance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE silica_training_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_exposure_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (example for exposure assessments)
CREATE POLICY "Users can view assessments for their company's work orders" ON silica_exposure_assessments
  FOR SELECT USING (
    work_order_id IN (
      SELECT wo.id FROM work_orders wo
      WHERE wo.created_by IN (
        SELECT id FROM profiles WHERE company_id = (
          SELECT company_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Users can create assessments for their company's work orders" ON silica_exposure_assessments
  FOR INSERT WITH CHECK (
    work_order_id IN (
      SELECT wo.id FROM work_orders wo
      WHERE wo.created_by IN (
        SELECT id FROM profiles WHERE company_id = (
          SELECT company_id FROM profiles WHERE id = auth.uid()
        )
      )
    )
  );

-- Function to calculate days exposed for medical surveillance
CREATE OR REPLACE FUNCTION calculate_exposure_days(employee_uuid UUID)
RETURNS TABLE (
  days_exposed_ytd INTEGER,
  days_above_action_level INTEGER,
  requires_medical_surveillance BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  WITH exposure_data AS (
    SELECT 
      COUNT(DISTINCT del.log_date) as total_days,
      COUNT(DISTINCT CASE WHEN sea.exposure_level > 0.025 THEN del.log_date END) as action_level_days
    FROM daily_exposure_logs del
    JOIN work_orders wo ON del.work_order_id = wo.id
    JOIN silica_exposure_assessments sea ON wo.id = sea.work_order_id
    WHERE del.employee_id = employee_uuid
    AND del.log_date >= date_trunc('year', NOW())
  )
  SELECT 
    ed.total_days::INTEGER,
    ed.action_level_days::INTEGER,
    ed.action_level_days >= 30 as requires_medical_surveillance
  FROM exposure_data ed;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update work order status when compliance is complete
CREATE OR REPLACE FUNCTION check_compliance_completion()
RETURNS TRIGGER AS $$
DECLARE
  assessment_exists BOOLEAN;
  plan_approved BOOLEAN;
  photos_uploaded BOOLEAN;
BEGIN
  -- Check if all compliance requirements are met
  SELECT EXISTS(SELECT 1 FROM silica_exposure_assessments WHERE work_order_id = NEW.work_order_id)
  INTO assessment_exists;
  
  SELECT EXISTS(SELECT 1 FROM exposure_control_plans WHERE work_order_id = NEW.work_order_id AND status = 'approved')
  INTO plan_approved;
  
  SELECT (water_system_photo_url IS NOT NULL OR respiratory_equipment_photo_url IS NOT NULL)
  FROM safety_compliance_details
  WHERE work_order_id = NEW.work_order_id
  INTO photos_uploaded;
  
  -- Update work order if compliance is complete
  IF assessment_exists AND plan_approved AND photos_uploaded THEN
    UPDATE work_orders 
    SET updated_at = NOW()
    WHERE id = NEW.work_order_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_compliance_completion
AFTER INSERT OR UPDATE ON safety_compliance_details
FOR EACH ROW
EXECUTE FUNCTION check_compliance_completion();

-- Create storage bucket for safety photos if it doesn't exist
-- Run this in Supabase Storage settings:
-- CREATE BUCKET 'safety-photos' WITH PUBLIC ACCESS;