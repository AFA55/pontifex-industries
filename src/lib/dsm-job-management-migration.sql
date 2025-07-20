-- Pontifex Industries DSM Job Management Extension Migration
-- This extends the existing beacon/asset tracking system with comprehensive job management
-- Run these commands in Supabase SQL Editor AFTER the base schema is set up

-- =============================================================================
-- CORE FOUNDATION TABLES (assumed to exist or created by Supabase Auth)
-- =============================================================================

-- Base profiles table extension (add columns to existing table)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS emergency_contact VARCHAR(200),
ADD COLUMN IF NOT EXISTS certification_expiry DATE,
ADD COLUMN IF NOT EXISTS hourly_rate DECIMAL(8,2),
ADD COLUMN IF NOT EXISTS employment_type VARCHAR(20) DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'temporary')),
ADD COLUMN IF NOT EXISTS hire_date DATE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Base assets table (assumed to exist)
CREATE TABLE IF NOT EXISTS assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  asset_type VARCHAR(100),
  serial_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'available' CHECK (status IN ('available', 'in_use', 'maintenance', 'retired')),
  assigned_location VARCHAR(200),
  purchase_date DATE,
  purchase_cost DECIMAL(12,2),
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- JOB MANAGEMENT CORE TABLES
-- =============================================================================

-- 1. Work Types - Define different types of construction work
CREATE TABLE IF NOT EXISTS work_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50), -- e.g., 'electrical', 'plumbing', 'structural', 'hvac'
  default_duration_hours INTEGER, -- Estimated time to complete
  skill_requirements JSONB DEFAULT '[]'::jsonb, -- Required skills/certifications
  risk_level VARCHAR(20) DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  requires_permit BOOLEAN DEFAULT false,
  company_id UUID,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Safety Requirements - Safety protocols and certifications
CREATE TABLE IF NOT EXISTS safety_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  requirement_type VARCHAR(50) CHECK (requirement_type IN ('certification', 'training', 'equipment', 'procedure')),
  is_mandatory BOOLEAN DEFAULT true,
  renewal_period_months INTEGER, -- For certifications that expire
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Work Type Safety Requirements - Link work types to safety requirements
CREATE TABLE IF NOT EXISTS work_type_safety_requirements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_type_id UUID REFERENCES work_types(id) ON DELETE CASCADE,
  safety_requirement_id UUID REFERENCES safety_requirements(id) ON DELETE CASCADE,
  is_mandatory BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(work_type_id, safety_requirement_id)
);

-- 4. Employee Certifications - Track employee safety certifications
CREATE TABLE IF NOT EXISTS employee_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  safety_requirement_id UUID REFERENCES safety_requirements(id) ON DELETE CASCADE,
  certification_date DATE NOT NULL,
  expiry_date DATE,
  certification_number VARCHAR(100),
  issuing_authority VARCHAR(200),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PROJECT AND JOB MANAGEMENT
-- =============================================================================

-- 5. Projects - High-level construction projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  description TEXT,
  client_name VARCHAR(200),
  project_manager_id UUID REFERENCES profiles(id),
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed', 'cancelled')),
  location VARCHAR(300),
  coordinates POINT,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Jobs - Individual work tasks within projects
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  work_type_id UUID REFERENCES work_types(id),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  estimated_hours DECIMAL(6,2),
  location VARCHAR(300),
  special_instructions TEXT,
  requires_approval BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Job Assignments - Assign employees to jobs
CREATE TABLE IF NOT EXISTS job_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'worker', -- 'lead', 'worker', 'supervisor', 'inspector'
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  assigned_by UUID REFERENCES profiles(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(job_id, employee_id)
);

-- 8. Job Asset Assignments - Assign assets/equipment to jobs
CREATE TABLE IF NOT EXISTS job_asset_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  asset_id UUID REFERENCES assets(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  returned_at TIMESTAMPTZ,
  assigned_by UUID REFERENCES profiles(id),
  condition_at_assignment VARCHAR(100),
  condition_at_return VARCHAR(100),
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- TIME TRACKING AND SCHEDULING
-- =============================================================================

-- 9. Time Entries - Track actual work time
CREATE TABLE IF NOT EXISTS time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  break_duration_minutes INTEGER DEFAULT 0,
  description TEXT,
  location VARCHAR(300),
  coordinates POINT,
  entry_type VARCHAR(20) DEFAULT 'manual' CHECK (entry_type IN ('manual', 'beacon', 'gps', 'nfc')),
  is_approved BOOLEAN DEFAULT false,
  approved_by UUID REFERENCES profiles(id),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Employee Schedules - Planned work schedules
CREATE TABLE IF NOT EXISTS employee_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,
  shift_type VARCHAR(20) DEFAULT 'regular' CHECK (shift_type IN ('regular', 'overtime', 'weekend', 'holiday')),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Shift Patterns - Define recurring work patterns
CREATE TABLE IF NOT EXISTS shift_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  days_of_week INTEGER[] DEFAULT '{1,2,3,4,5}', -- 1=Monday, 7=Sunday
  is_active BOOLEAN DEFAULT true,
  company_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- INTEGRATION WITH EXISTING BEACON SYSTEM
-- =============================================================================

-- 12. Job Beacon Zones - Define beacon zones for job sites
CREATE TABLE IF NOT EXISTS job_beacon_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  zone_name VARCHAR(100) NOT NULL,
  beacon_ids VARCHAR(50)[], -- Array of beacon IDs that define this zone
  zone_type VARCHAR(50) DEFAULT 'work_area' CHECK (zone_type IN ('work_area', 'safety_zone', 'equipment_zone', 'break_area')),
  auto_clock_in BOOLEAN DEFAULT false,
  auto_clock_out BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Beacon Time Tracking - Automatic time tracking via beacons
CREATE TABLE IF NOT EXISTS beacon_time_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
  beacon_id VARCHAR(50) NOT NULL,
  zone_id UUID REFERENCES job_beacon_zones(id),
  entry_time TIMESTAMPTZ NOT NULL,
  exit_time TIMESTAMPTZ,
  duration_minutes INTEGER,
  entry_type VARCHAR(20) DEFAULT 'proximity' CHECK (entry_type IN ('proximity', 'manual', 'nfc_tap')),
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- PERFORMANCE VIEWS AND MATERIALIZED VIEWS
-- =============================================================================

-- 14. Job Progress View - Real-time job status with time tracking
CREATE OR REPLACE VIEW job_progress_view AS
SELECT 
  j.id,
  j.title,
  j.status,
  j.priority,
  j.scheduled_start,
  j.scheduled_end,
  j.actual_start,
  j.actual_end,
  j.estimated_hours,
  p.name as project_name,
  wt.name as work_type_name,
  wt.risk_level,
  
  -- Assignment counts
  (SELECT COUNT(*) FROM job_assignments ja WHERE ja.job_id = j.id AND ja.is_active = true) as assigned_employees,
  (SELECT COUNT(*) FROM job_asset_assignments jaa WHERE jaa.job_id = j.id AND jaa.is_active = true) as assigned_assets,
  
  -- Time tracking
  COALESCE(
    (SELECT SUM(
      CASE 
        WHEN te.end_time IS NOT NULL THEN 
          EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600.0 - (te.break_duration_minutes / 60.0)
        ELSE 0 
      END
    ) FROM time_entries te WHERE te.job_id = j.id AND te.is_approved = true), 0
  ) as actual_hours,
  
  -- Progress percentage
  CASE 
    WHEN j.status = 'completed' THEN 100
    WHEN j.status = 'cancelled' THEN 0
    WHEN j.estimated_hours > 0 THEN 
      LEAST(100, (
        COALESCE(
          (SELECT SUM(
            CASE 
              WHEN te.end_time IS NOT NULL THEN 
                EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600.0 - (te.break_duration_minutes / 60.0)
              ELSE 0 
            END
          ) FROM time_entries te WHERE te.job_id = j.id AND te.is_approved = true), 0
        ) / j.estimated_hours * 100
      ))
    ELSE 0
  END as progress_percentage,
  
  -- Safety compliance
  (SELECT COUNT(*) FROM work_type_safety_requirements wtsr WHERE wtsr.work_type_id = j.work_type_id) as required_certifications,
  
  j.created_at,
  j.updated_at
FROM jobs j
LEFT JOIN projects p ON j.project_id = p.id
LEFT JOIN work_types wt ON j.work_type_id = wt.id;

-- 15. Employee Workload View - Current workload per employee
CREATE OR REPLACE VIEW employee_workload_view AS
SELECT 
  pr.id,
  pr.full_name,
  pr.email,
  pr.role,
  
  -- Current assignments
  (SELECT COUNT(*) FROM job_assignments ja 
   JOIN jobs j ON ja.job_id = j.id 
   WHERE ja.employee_id = pr.id AND ja.is_active = true 
   AND j.status IN ('assigned', 'in_progress')) as active_jobs,
  
  -- This week's scheduled hours
  COALESCE(
    (SELECT SUM(EXTRACT(EPOCH FROM (es.scheduled_end - es.scheduled_start)) / 3600.0)
     FROM employee_schedules es 
     WHERE es.employee_id = pr.id 
     AND es.scheduled_start >= date_trunc('week', NOW())
     AND es.scheduled_start < date_trunc('week', NOW()) + interval '7 days'
     AND es.status IN ('scheduled', 'confirmed')), 0
  ) as scheduled_hours_this_week,
  
  -- This week's actual hours
  COALESCE(
    (SELECT SUM(
      CASE 
        WHEN te.end_time IS NOT NULL THEN 
          EXTRACT(EPOCH FROM (te.end_time - te.start_time)) / 3600.0 - (te.break_duration_minutes / 60.0)
        ELSE 0 
      END
    ) FROM time_entries te 
    WHERE te.employee_id = pr.id 
    AND te.start_time >= date_trunc('week', NOW())
    AND te.start_time < date_trunc('week', NOW()) + interval '7 days'
    AND te.is_approved = true), 0
  ) as actual_hours_this_week,
  
  -- Certification status
  (SELECT COUNT(*) FROM employee_certifications ec 
   WHERE ec.employee_id = pr.id AND ec.is_active = true 
   AND (ec.expiry_date IS NULL OR ec.expiry_date > NOW())) as active_certifications,
  
  (SELECT COUNT(*) FROM employee_certifications ec 
   WHERE ec.employee_id = pr.id AND ec.is_active = true 
   AND ec.expiry_date IS NOT NULL AND ec.expiry_date <= NOW() + interval '30 days') as expiring_certifications,
  
  pr.is_active,
  pr.updated_at
FROM profiles pr
WHERE pr.role != 'admin';

-- 16. Asset Utilization View - Asset usage across jobs
CREATE OR REPLACE VIEW asset_utilization_view AS
SELECT 
  a.id,
  a.name,
  a.asset_type,
  a.status,
  
  -- Current assignment
  (SELECT j.title FROM job_asset_assignments jaa 
   JOIN jobs j ON jaa.job_id = j.id 
   WHERE jaa.asset_id = a.id AND jaa.is_active = true 
   AND j.status IN ('assigned', 'in_progress') LIMIT 1) as current_job,
  
  -- Usage statistics
  (SELECT COUNT(*) FROM job_asset_assignments jaa WHERE jaa.asset_id = a.id) as total_assignments,
  
  -- Last 30 days utilization
  COALESCE(
    (SELECT COUNT(*) FROM job_asset_assignments jaa 
     WHERE jaa.asset_id = a.id AND jaa.assigned_at >= NOW() - interval '30 days'), 0
  ) as assignments_last_30_days,
  
  -- Beacon tracking info
  ab.beacon_id,
  ab.battery_level,
  ab.last_seen,
  CASE 
    WHEN ab.last_seen > NOW() - INTERVAL '5 minutes' THEN 'online'
    WHEN ab.last_seen > NOW() - INTERVAL '1 hour' THEN 'recently_seen'
    ELSE 'offline'
  END as beacon_status,
  
  a.created_at,
  a.updated_at
FROM assets a
LEFT JOIN asset_beacons ab ON a.id = ab.asset_id AND ab.is_active = true;

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Job management indexes
CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON jobs(project_id);
CREATE INDEX IF NOT EXISTS idx_jobs_work_type_id ON jobs(work_type_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_start ON jobs(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_jobs_priority ON jobs(priority);

-- Assignment indexes
CREATE INDEX IF NOT EXISTS idx_job_assignments_job_id ON job_assignments(job_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_employee_id ON job_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_job_assignments_active ON job_assignments(is_active);

-- Time tracking indexes
CREATE INDEX IF NOT EXISTS idx_time_entries_employee_id ON time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_job_id ON time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_start_time ON time_entries(start_time);
CREATE INDEX IF NOT EXISTS idx_time_entries_approved ON time_entries(is_approved);

-- Scheduling indexes
CREATE INDEX IF NOT EXISTS idx_employee_schedules_employee_id ON employee_schedules(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_job_id ON employee_schedules(job_id);
CREATE INDEX IF NOT EXISTS idx_employee_schedules_start_time ON employee_schedules(scheduled_start);

-- Certification indexes
CREATE INDEX IF NOT EXISTS idx_employee_certifications_employee_id ON employee_certifications(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_expiry ON employee_certifications(expiry_date);
CREATE INDEX IF NOT EXISTS idx_employee_certifications_active ON employee_certifications(is_active);

-- Beacon integration indexes
CREATE INDEX IF NOT EXISTS idx_beacon_time_entries_employee_id ON beacon_time_entries(employee_id);
CREATE INDEX IF NOT EXISTS idx_beacon_time_entries_job_id ON beacon_time_entries(job_id);
CREATE INDEX IF NOT EXISTS idx_beacon_time_entries_beacon_id ON beacon_time_entries(beacon_id);
CREATE INDEX IF NOT EXISTS idx_beacon_time_entries_entry_time ON beacon_time_entries(entry_time);

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Function to automatically update job status based on time entries
CREATE OR REPLACE FUNCTION update_job_status_from_time_entries()
RETURNS TRIGGER AS $$
BEGIN
  -- If this is the first time entry for a job, mark it as in_progress
  IF NEW.start_time IS NOT NULL AND OLD.start_time IS NULL THEN
    UPDATE jobs 
    SET status = 'in_progress', 
        actual_start = COALESCE(actual_start, NEW.start_time),
        updated_at = NOW()
    WHERE id = NEW.job_id AND status = 'assigned';
  END IF;
  
  -- If time entry is completed and job has no more active time entries, check if job should be completed
  IF NEW.end_time IS NOT NULL AND OLD.end_time IS NULL THEN
    -- Check if this was the last active time entry for this job
    IF NOT EXISTS (
      SELECT 1 FROM time_entries 
      WHERE job_id = NEW.job_id AND end_time IS NULL AND id != NEW.id
    ) THEN
      -- Update job's actual_end if not already set
      UPDATE jobs 
      SET actual_end = COALESCE(actual_end, NEW.end_time),
          updated_at = NOW()
      WHERE id = NEW.job_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic job status updates
CREATE TRIGGER trigger_update_job_status_from_time_entries
  AFTER UPDATE ON time_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_job_status_from_time_entries();

-- Function to create automatic time entries from beacon proximity
CREATE OR REPLACE FUNCTION create_time_entry_from_beacon()
RETURNS TRIGGER AS $$
DECLARE
  job_record RECORD;
  employee_record RECORD;
  zone_record RECORD;
BEGIN
  -- Find if this beacon is associated with a job zone
  SELECT jbz.* INTO zone_record
  FROM job_beacon_zones jbz
  WHERE NEW.beacon_id = ANY(jbz.beacon_ids)
  AND jbz.auto_clock_in = true;
  
  IF zone_record.id IS NOT NULL THEN
    -- Get job and employee info from beacon proximity
    SELECT j.* INTO job_record
    FROM jobs j
    WHERE j.id = zone_record.job_id
    AND j.status IN ('assigned', 'in_progress');
    
    -- This would require additional logic to determine which employee
    -- For now, we'll just create a beacon time entry
    INSERT INTO beacon_time_entries (
      job_id,
      beacon_id,
      zone_id,
      entry_time,
      entry_type,
      confidence_score
    ) VALUES (
      job_record.id,
      NEW.beacon_id,
      zone_record.id,
      NEW.recorded_at,
      'proximity',
      NEW.confidence_score
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic time tracking from beacon readings
CREATE TRIGGER trigger_create_time_entry_from_beacon
  AFTER INSERT ON beacon_location_readings
  FOR EACH ROW
  EXECUTE FUNCTION create_time_entry_from_beacon();

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE work_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_type_safety_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_asset_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_beacon_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE beacon_time_entries ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (adjust based on your auth implementation)
-- These assume you have a function to get the current user's company_id

-- CREATE OR REPLACE FUNCTION get_current_user_company_id()
-- RETURNS UUID AS $$
-- BEGIN
--   RETURN (SELECT company_id FROM profiles WHERE id = auth.uid());
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sample policies (uncomment and adjust after implementing auth functions):
-- CREATE POLICY "Users can view their company's jobs" ON jobs
--   FOR SELECT USING (
--     project_id IN (SELECT id FROM projects WHERE company_id = get_current_user_company_id())
--   );

-- CREATE POLICY "Users can view their own time entries" ON time_entries
--   FOR SELECT USING (
--     employee_id = auth.uid() OR 
--     job_id IN (
--       SELECT j.id FROM jobs j 
--       JOIN projects p ON j.project_id = p.id 
--       WHERE p.company_id = get_current_user_company_id()
--     )
--   );

-- =============================================================================
-- SAMPLE DATA FOR TESTING
-- =============================================================================

-- Insert sample work types
INSERT INTO work_types (name, description, category, default_duration_hours, skill_requirements, risk_level) VALUES
('Electrical Installation', 'Install electrical systems and components', 'electrical', 8, '["electrical_license", "safety_training"]', 'high'),
('Plumbing Repair', 'Fix plumbing issues and installations', 'plumbing', 4, '["plumbing_license"]', 'medium'),
('Concrete Pouring', 'Pour and finish concrete structures', 'structural', 6, '["concrete_finishing"]', 'medium'),
('HVAC Installation', 'Install heating, ventilation, and air conditioning systems', 'hvac', 10, '["hvac_certification"]', 'medium'),
('Safety Inspection', 'Conduct safety inspections and audits', 'safety', 2, '["safety_officer_cert"]', 'low');

-- Insert sample safety requirements
INSERT INTO safety_requirements (name, description, requirement_type, renewal_period_months) VALUES
('Hard Hat Required', 'Must wear approved hard hat at all times', 'equipment', NULL),
('Safety Harness Training', 'Training on proper use of safety harnesses', 'training', 24),
('First Aid Certification', 'Current first aid and CPR certification', 'certification', 24),
('Confined Space Entry', 'Certification for working in confined spaces', 'certification', 36),
('Electrical Safety Training', 'Training on electrical safety procedures', 'training', 12);

-- Link work types to safety requirements
INSERT INTO work_type_safety_requirements (work_type_id, safety_requirement_id, is_mandatory) 
SELECT 
  wt.id,
  sr.id,
  true
FROM work_types wt, safety_requirements sr
WHERE (wt.name = 'Electrical Installation' AND sr.name IN ('Hard Hat Required', 'Electrical Safety Training'))
   OR (wt.name = 'Concrete Pouring' AND sr.name IN ('Hard Hat Required', 'First Aid Certification'))
   OR (wt.name = 'HVAC Installation' AND sr.name IN ('Hard Hat Required', 'Confined Space Entry'));

-- Insert sample shift patterns
INSERT INTO shift_patterns (name, description, start_time, end_time, days_of_week) VALUES
('Standard Day Shift', 'Regular 8-hour day shift', '08:00:00', '16:00:00', '{1,2,3,4,5}'),
('Night Shift', 'Night shift for continuous operations', '22:00:00', '06:00:00', '{1,2,3,4,5}'),
('Weekend Maintenance', 'Weekend maintenance shift', '09:00:00', '17:00:00', '{6,7}');

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

-- Migration completed successfully!
-- This schema extension provides:
-- 1. Comprehensive job management with work types and safety requirements
-- 2. Employee assignment and certification tracking
-- 3. Time tracking with both manual and beacon-based entry
-- 4. Integration with existing asset and beacon tracking
-- 5. Performance-optimized views for dashboards
-- 6. Automatic triggers for status updates
-- 7. Row-level security setup (policies need to be customized)

-- Next steps:
-- 1. Implement authentication functions for RLS policies
-- 2. Add custom business logic triggers as needed
-- 3. Create materialized views for complex reporting
-- 4. Add audit logging for compliance tracking