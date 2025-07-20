-- Real-time Analytics Database Schema
-- Additional tables and views to support superior analytics dashboard

-- Analytics alerts table for real-time notifications
CREATE TABLE IF NOT EXISTS analytics_alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Alert classification
    category TEXT NOT NULL CHECK (category IN ('job', 'equipment', 'crew', 'safety', 'financial')),
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    -- Alert content
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Alert data and actions
    data JSONB DEFAULT '{}',
    actions JSONB DEFAULT '[]',
    
    -- Status
    acknowledged BOOLEAN DEFAULT false,
    acknowledged_by UUID REFERENCES auth.users(id),
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    
    -- Source information
    source_table TEXT,
    source_record_id UUID,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for analytics alerts
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_company ON analytics_alerts(company_id);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_category ON analytics_alerts(company_id, category);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_severity ON analytics_alerts(company_id, severity);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_acknowledged ON analytics_alerts(company_id, acknowledged);
CREATE INDEX IF NOT EXISTS idx_analytics_alerts_created ON analytics_alerts(created_at);

-- Equipment utilization statistics table
CREATE TABLE IF NOT EXISTS equipment_utilization_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id),
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Time period
    date DATE NOT NULL,
    hour INTEGER CHECK (hour >= 0 AND hour <= 23),
    
    -- Utilization metrics
    total_minutes INTEGER DEFAULT 0,
    active_minutes INTEGER DEFAULT 0,
    idle_minutes INTEGER DEFAULT 0,
    maintenance_minutes INTEGER DEFAULT 0,
    offline_minutes INTEGER DEFAULT 0,
    
    -- Productivity metrics
    output_units DECIMAL(10,2) DEFAULT 0,
    target_output DECIMAL(10,2) DEFAULT 0,
    efficiency_rate DECIMAL(5,2) DEFAULT 0,
    
    -- Financial metrics
    operating_cost DECIMAL(10,2) DEFAULT 0,
    revenue_generated DECIMAL(10,2) DEFAULT 0,
    
    -- Location and status
    primary_location JSONB,
    status_changes INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(asset_id, date, hour)
);

-- Indexes for equipment utilization stats
CREATE INDEX IF NOT EXISTS idx_equipment_utilization_asset ON equipment_utilization_stats(asset_id);
CREATE INDEX IF NOT EXISTS idx_equipment_utilization_company ON equipment_utilization_stats(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_utilization_date ON equipment_utilization_stats(date);
CREATE INDEX IF NOT EXISTS idx_equipment_utilization_efficiency ON equipment_utilization_stats(company_id, efficiency_rate);

-- Employee productivity statistics table
CREATE TABLE IF NOT EXISTS employee_productivity_stats (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id),
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Time period
    date DATE NOT NULL,
    week_start DATE,
    month_start DATE,
    
    -- Time tracking
    total_hours DECIMAL(4,2) DEFAULT 0,
    billable_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    break_hours DECIMAL(4,2) DEFAULT 0,
    
    -- Task performance
    tasks_assigned INTEGER DEFAULT 0,
    tasks_completed INTEGER DEFAULT 0,
    tasks_overdue INTEGER DEFAULT 0,
    average_task_completion_time DECIMAL(6,2),
    
    -- Quality metrics
    quality_score DECIMAL(5,2) DEFAULT 0,
    rework_incidents INTEGER DEFAULT 0,
    customer_ratings DECIMAL(3,2),
    
    -- Collaboration metrics
    team_interactions INTEGER DEFAULT 0,
    communication_frequency DECIMAL(5,2) DEFAULT 0,
    peer_ratings DECIMAL(3,2),
    
    -- Skills and training
    skills_utilized JSONB DEFAULT '[]',
    training_completed INTEGER DEFAULT 0,
    certifications_earned INTEGER DEFAULT 0,
    
    -- Safety metrics
    safety_incidents INTEGER DEFAULT 0,
    near_misses INTEGER DEFAULT 0,
    ppe_compliance_rate DECIMAL(5,2) DEFAULT 100,
    
    -- Location and mobility
    on_site_percentage DECIMAL(5,2) DEFAULT 0,
    location_changes INTEGER DEFAULT 0,
    travel_time_hours DECIMAL(4,2) DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(employee_id, date)
);

-- Indexes for employee productivity stats
CREATE INDEX IF NOT EXISTS idx_employee_productivity_employee ON employee_productivity_stats(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_productivity_company ON employee_productivity_stats(company_id);
CREATE INDEX IF NOT EXISTS idx_employee_productivity_date ON employee_productivity_stats(date);
CREATE INDEX IF NOT EXISTS idx_employee_productivity_quality ON employee_productivity_stats(company_id, quality_score);

-- Safety incidents table for comprehensive tracking
CREATE TABLE IF NOT EXISTS safety_incidents (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Incident classification
    incident_type TEXT NOT NULL CHECK (incident_type IN ('injury', 'near_miss', 'violation', 'hazard', 'environmental')),
    severity TEXT NOT NULL CHECK (severity IN ('minor', 'moderate', 'major', 'critical', 'catastrophic')),
    category TEXT NOT NULL,
    
    -- Incident details
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    root_cause TEXT,
    contributing_factors TEXT[],
    
    -- Location and timing
    location JSONB,
    work_order_id UUID REFERENCES work_orders(id),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- People involved
    reported_by UUID REFERENCES employees(id),
    injured_person UUID REFERENCES employees(id),
    witnesses UUID[] DEFAULT '{}',
    
    -- Investigation and response
    investigated_by UUID REFERENCES employees(id),
    investigation_completed_at TIMESTAMP WITH TIME ZONE,
    corrective_actions TEXT[],
    preventive_measures TEXT[],
    
    -- Medical and regulatory
    medical_treatment_required BOOLEAN DEFAULT false,
    osha_recordable BOOLEAN DEFAULT false,
    regulatory_notification_required BOOLEAN DEFAULT false,
    
    -- Equipment and environment
    equipment_involved UUID[] DEFAULT '{}',
    weather_conditions JSONB,
    environmental_factors TEXT[],
    
    -- Status tracking
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'closed', 'verified')),
    closed_at TIMESTAMP WITH TIME ZONE,
    closed_by UUID REFERENCES employees(id),
    
    -- Attachments and evidence
    photos TEXT[],
    documents TEXT[],
    witness_statements TEXT[],
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for safety incidents
CREATE INDEX IF NOT EXISTS idx_safety_incidents_company ON safety_incidents(company_id);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_type ON safety_incidents(company_id, incident_type);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_severity ON safety_incidents(company_id, severity);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_status ON safety_incidents(company_id, status);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_occurred ON safety_incidents(occurred_at);
CREATE INDEX IF NOT EXISTS idx_safety_incidents_work_order ON safety_incidents(work_order_id);

-- PPE violations table for compliance tracking
CREATE TABLE IF NOT EXISTS ppe_violations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Violation details
    employee_id UUID NOT NULL REFERENCES employees(id),
    ppe_type TEXT NOT NULL,
    violation_type TEXT NOT NULL CHECK (violation_type IN ('not_wearing', 'improper_use', 'damaged_equipment', 'expired_equipment')),
    
    -- Location and timing
    location JSONB NOT NULL,
    work_order_id UUID REFERENCES work_orders(id),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Detection method
    detected_by TEXT CHECK (detected_by IN ('supervisor', 'peer', 'camera', 'self_report', 'audit')),
    detector_id UUID REFERENCES employees(id),
    
    -- Evidence
    photo_evidence TEXT,
    description TEXT,
    
    -- Resolution
    corrective_action TEXT,
    training_provided BOOLEAN DEFAULT false,
    disciplinary_action TEXT,
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES employees(id),
    
    -- Status
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'addressed', 'closed')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for PPE violations
CREATE INDEX IF NOT EXISTS idx_ppe_violations_company ON ppe_violations(company_id);
CREATE INDEX IF NOT EXISTS idx_ppe_violations_employee ON ppe_violations(employee_id);
CREATE INDEX IF NOT EXISTS idx_ppe_violations_type ON ppe_violations(company_id, ppe_type);
CREATE INDEX IF NOT EXISTS idx_ppe_violations_timestamp ON ppe_violations(timestamp);
CREATE INDEX IF NOT EXISTS idx_ppe_violations_status ON ppe_violations(company_id, status);

-- Silica monitoring table for OSHA compliance
CREATE TABLE IF NOT EXISTS silica_monitoring (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Monitoring device and location
    device_id TEXT NOT NULL,
    device_type TEXT NOT NULL,
    location JSONB NOT NULL,
    work_order_id UUID REFERENCES work_orders(id),
    
    -- Reading details
    reading_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    exposure_level DECIMAL(8,4) NOT NULL, -- mg/m³
    duration_minutes INTEGER NOT NULL,
    
    -- Environmental conditions
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    wind_speed DECIMAL(5,2),
    
    -- Work activity
    activity_type TEXT,
    equipment_used TEXT[],
    dust_suppression_active BOOLEAN DEFAULT false,
    suppression_methods TEXT[],
    
    -- Personnel exposure
    personnel_present UUID[] DEFAULT '{}',
    ppe_used TEXT[],
    
    -- Compliance assessment
    permissible_limit DECIMAL(8,4) DEFAULT 0.05, -- OSHA PEL
    action_level DECIMAL(8,4) DEFAULT 0.025,     -- OSHA AL
    compliance_status TEXT CHECK (compliance_status IN ('compliant', 'action_required', 'exceeded')),
    
    -- Response actions
    actions_taken TEXT[],
    notifications_sent UUID[] DEFAULT '{}',
    
    -- Calibration info
    device_calibrated_at TIMESTAMP WITH TIME ZONE,
    calibration_certificate TEXT,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for silica monitoring
CREATE INDEX IF NOT EXISTS idx_silica_monitoring_company ON silica_monitoring(company_id);
CREATE INDEX IF NOT EXISTS idx_silica_monitoring_device ON silica_monitoring(device_id);
CREATE INDEX IF NOT EXISTS idx_silica_monitoring_time ON silica_monitoring(reading_time);
CREATE INDEX IF NOT EXISTS idx_silica_monitoring_level ON silica_monitoring(exposure_level);
CREATE INDEX IF NOT EXISTS idx_silica_monitoring_compliance ON silica_monitoring(company_id, compliance_status);
CREATE INDEX IF NOT EXISTS idx_silica_monitoring_work_order ON silica_monitoring(work_order_id);

-- Equipment inspections table
CREATE TABLE IF NOT EXISTS equipment_inspections (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    asset_id UUID NOT NULL REFERENCES assets(id),
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Inspection details
    inspection_type TEXT NOT NULL CHECK (inspection_type IN ('daily', 'weekly', 'monthly', 'annual', 'pre_use', 'post_use', 'maintenance')),
    inspection_date DATE NOT NULL,
    inspector_id UUID NOT NULL REFERENCES employees(id),
    
    -- Inspection results
    overall_status TEXT NOT NULL CHECK (overall_status IN ('passed', 'passed_with_notes', 'failed', 'out_of_service')),
    inspection_items JSONB NOT NULL, -- Detailed checklist results
    deficiencies JSONB DEFAULT '[]',
    
    -- Safety assessment
    safety_rating TEXT CHECK (safety_rating IN ('excellent', 'good', 'fair', 'poor', 'unsafe')),
    safety_issues TEXT[],
    immediate_action_required BOOLEAN DEFAULT false,
    
    -- Maintenance recommendations
    maintenance_required BOOLEAN DEFAULT false,
    maintenance_urgency TEXT CHECK (maintenance_urgency IN ('immediate', 'within_week', 'within_month', 'next_scheduled')),
    recommended_actions TEXT[],
    estimated_repair_cost DECIMAL(10,2),
    
    -- Compliance
    regulatory_compliance BOOLEAN DEFAULT true,
    certification_status TEXT,
    next_inspection_due DATE,
    
    -- Documentation
    photos TEXT[],
    documents TEXT[],
    notes TEXT,
    
    -- Follow-up
    corrective_actions_completed BOOLEAN DEFAULT false,
    re_inspection_required BOOLEAN DEFAULT false,
    re_inspection_date DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for equipment inspections
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_asset ON equipment_inspections(asset_id);
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_company ON equipment_inspections(company_id);
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_date ON equipment_inspections(inspection_date);
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_status ON equipment_inspections(overall_status);
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_inspector ON equipment_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_equipment_inspections_due ON equipment_inspections(next_inspection_due);

-- Training records table for compliance tracking
CREATE TABLE IF NOT EXISTS training_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES employees(id),
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Training details
    training_type TEXT NOT NULL,
    training_name TEXT NOT NULL,
    training_provider TEXT,
    training_method TEXT CHECK (training_method IN ('classroom', 'online', 'hands_on', 'simulation', 'mentoring')),
    
    -- Scheduling and completion
    scheduled_date DATE,
    completion_date DATE,
    duration_hours DECIMAL(4,2),
    
    -- Assessment
    assessment_required BOOLEAN DEFAULT false,
    assessment_score DECIMAL(5,2),
    passing_score DECIMAL(5,2) DEFAULT 80,
    passed BOOLEAN DEFAULT true,
    
    -- Certification
    certificate_issued BOOLEAN DEFAULT false,
    certificate_number TEXT,
    certification_expires_date DATE,
    renewal_required BOOLEAN DEFAULT false,
    
    -- Training content
    topics_covered TEXT[],
    competencies_gained TEXT[],
    equipment_authorized TEXT[],
    
    -- Compliance
    regulatory_requirement BOOLEAN DEFAULT false,
    osha_requirement BOOLEAN DEFAULT false,
    company_requirement BOOLEAN DEFAULT true,
    
    -- Trainer information
    trainer_name TEXT,
    trainer_credentials TEXT,
    training_location TEXT,
    
    -- Documentation
    training_materials TEXT[],
    attendance_record TEXT,
    evaluation_form TEXT,
    
    -- Status
    status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'failed', 'expired', 'cancelled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for training records
CREATE INDEX IF NOT EXISTS idx_training_records_employee ON training_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_training_records_company ON training_records(company_id);
CREATE INDEX IF NOT EXISTS idx_training_records_type ON training_records(training_type);
CREATE INDEX IF NOT EXISTS idx_training_records_completion ON training_records(completion_date);
CREATE INDEX IF NOT EXISTS idx_training_records_expiry ON training_records(certification_expires_date);
CREATE INDEX IF NOT EXISTS idx_training_records_status ON training_records(status);

-- Safety audits table
CREATE TABLE IF NOT EXISTS safety_audits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Audit details
    audit_type TEXT NOT NULL CHECK (audit_type IN ('internal', 'external', 'regulatory', 'customer', 'insurance')),
    audit_name TEXT NOT NULL,
    auditor_name TEXT NOT NULL,
    auditor_organization TEXT,
    
    -- Scheduling
    audit_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_hours DECIMAL(4,2),
    
    -- Scope
    scope_description TEXT,
    areas_audited TEXT[],
    processes_audited TEXT[],
    work_orders_reviewed UUID[],
    employees_interviewed UUID[],
    
    -- Results
    overall_score DECIMAL(5,2),
    max_possible_score DECIMAL(5,2) DEFAULT 100,
    compliance_percentage DECIMAL(5,2),
    
    -- Findings
    conformities JSONB DEFAULT '[]',
    non_conformities JSONB DEFAULT '[]',
    observations JSONB DEFAULT '[]',
    best_practices JSONB DEFAULT '[]',
    
    -- Action items
    corrective_actions JSONB DEFAULT '[]',
    preventive_actions JSONB DEFAULT '[]',
    improvement_opportunities JSONB DEFAULT '[]',
    
    -- Status
    audit_status TEXT DEFAULT 'completed' CHECK (audit_status IN ('scheduled', 'in_progress', 'completed', 'report_pending', 'closed')),
    report_issued_date DATE,
    report_file_path TEXT,
    
    -- Follow-up
    follow_up_required BOOLEAN DEFAULT false,
    follow_up_date DATE,
    follow_up_auditor TEXT,
    
    -- Certification impact
    affects_certification BOOLEAN DEFAULT false,
    certification_status TEXT,
    next_audit_due DATE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for safety audits
CREATE INDEX IF NOT EXISTS idx_safety_audits_company ON safety_audits(company_id);
CREATE INDEX IF NOT EXISTS idx_safety_audits_type ON safety_audits(audit_type);
CREATE INDEX IF NOT EXISTS idx_safety_audits_date ON safety_audits(audit_date);
CREATE INDEX IF NOT EXISTS idx_safety_audits_status ON safety_audits(audit_status);
CREATE INDEX IF NOT EXISTS idx_safety_audits_score ON safety_audits(company_id, overall_score);

-- Real-time asset status view (enhanced)
CREATE OR REPLACE VIEW asset_realtime_status AS
SELECT 
    a.id,
    a.company_id,
    a.asset_code,
    a.asset_name,
    a.category,
    a.asset_status,
    
    -- Latest beacon data
    blr.latitude,
    blr.longitude,
    blr.rssi as signal_strength,
    blr.battery_level,
    blr.timestamp as last_seen,
    
    -- Utilization metrics (current day)
    eus.total_minutes,
    eus.active_minutes,
    eus.idle_minutes,
    eus.maintenance_minutes,
    CASE 
        WHEN eus.total_minutes > 0 
        THEN (eus.active_minutes::DECIMAL / eus.total_minutes) * 100
        ELSE 0 
    END as utilization_rate,
    eus.efficiency_rate,
    eus.operating_cost,
    eus.revenue_generated,
    
    -- Maintenance status
    ei.next_inspection_due,
    ei.overall_status as inspection_status,
    ei.maintenance_required,
    ei.maintenance_urgency,
    
    -- Safety status
    CASE 
        WHEN si.id IS NOT NULL THEN 'incident_reported'
        WHEN ei.safety_rating = 'unsafe' THEN 'unsafe'
        WHEN ei.safety_rating = 'poor' THEN 'attention_required'
        ELSE 'safe'
    END as safety_status

FROM assets a

-- Latest beacon reading
LEFT JOIN LATERAL (
    SELECT latitude, longitude, rssi, battery_level, timestamp
    FROM beacon_location_readings blr2
    JOIN asset_beacons ab ON blr2.beacon_id = ab.beacon_id
    WHERE ab.asset_id = a.id
    AND blr2.timestamp >= NOW() - INTERVAL '24 hours'
    ORDER BY blr2.timestamp DESC
    LIMIT 1
) blr ON true

-- Current day utilization stats
LEFT JOIN equipment_utilization_stats eus ON (
    eus.asset_id = a.id 
    AND eus.date = CURRENT_DATE
    AND eus.hour = EXTRACT(hour FROM NOW())
)

-- Latest inspection
LEFT JOIN LATERAL (
    SELECT next_inspection_due, overall_status, maintenance_required, 
           maintenance_urgency, safety_rating
    FROM equipment_inspections ei2
    WHERE ei2.asset_id = a.id
    ORDER BY ei2.inspection_date DESC
    LIMIT 1
) ei ON true

-- Recent safety incidents
LEFT JOIN LATERAL (
    SELECT id
    FROM safety_incidents si2
    WHERE a.id = ANY(si2.equipment_involved)
    AND si2.occurred_at >= NOW() - INTERVAL '30 days'
    AND si2.status != 'closed'
    LIMIT 1
) si ON true;

-- Function to calculate company KPIs
CREATE OR REPLACE FUNCTION calculate_company_kpis(
    p_company_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE,
    p_end_date TIMESTAMP WITH TIME ZONE
)
RETURNS TABLE (
    active_jobs INTEGER,
    on_time_delivery_rate DECIMAL(5,2),
    equipment_utilization_rate DECIMAL(5,2),
    crew_productivity_rate DECIMAL(5,2),
    safety_compliance_rate DECIMAL(5,2),
    total_revenue DECIMAL(10,2),
    profit_margin DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        -- Active jobs count
        (SELECT COUNT(*)::INTEGER 
         FROM work_orders wo 
         WHERE wo.company_id = p_company_id 
         AND wo.status IN ('pending', 'in_progress')
        ) as active_jobs,
        
        -- On-time delivery rate
        (SELECT 
            CASE 
                WHEN COUNT(*) > 0 
                THEN (COUNT(*) FILTER (WHERE actual_completion_date <= scheduled_completion_date)::DECIMAL / COUNT(*)) * 100
                ELSE 0 
            END
         FROM work_orders wo 
         WHERE wo.company_id = p_company_id 
         AND wo.status = 'completed'
         AND wo.actual_completion_date BETWEEN p_start_date AND p_end_date
        ) as on_time_delivery_rate,
        
        -- Equipment utilization rate
        (SELECT 
            CASE 
                WHEN SUM(total_minutes) > 0 
                THEN (SUM(active_minutes)::DECIMAL / SUM(total_minutes)) * 100
                ELSE 0 
            END
         FROM equipment_utilization_stats eus
         JOIN assets a ON eus.asset_id = a.id
         WHERE a.company_id = p_company_id
         AND eus.date BETWEEN p_start_date::DATE AND p_end_date::DATE
        ) as equipment_utilization_rate,
        
        -- Crew productivity rate
        (SELECT 
            CASE 
                WHEN SUM(total_hours) > 0 
                THEN (SUM(billable_hours)::DECIMAL / SUM(total_hours)) * 100
                ELSE 0 
            END
         FROM employee_productivity_stats eps
         JOIN employees e ON eps.employee_id = e.id
         WHERE e.company_id = p_company_id
         AND eps.date BETWEEN p_start_date::DATE AND p_end_date::DATE
        ) as crew_productivity_rate,
        
        -- Safety compliance rate (inverse of incident rate)
        (SELECT 
            CASE 
                WHEN total_exposure_days > 0 
                THEN GREATEST(0, 100 - ((incident_days::DECIMAL / total_exposure_days) * 100))
                ELSE 100 
            END
         FROM (
             SELECT 
                 COUNT(DISTINCT DATE(si.occurred_at)) as incident_days,
                 (p_end_date::DATE - p_start_date::DATE + 1) as total_exposure_days
             FROM safety_incidents si
             WHERE si.company_id = p_company_id
             AND si.occurred_at BETWEEN p_start_date AND p_end_date
             AND si.incident_type = 'injury'
         ) safety_calc
        ) as safety_compliance_rate,
        
        -- Total revenue
        (SELECT COALESCE(SUM(total_billed), 0)
         FROM work_orders wo 
         WHERE wo.company_id = p_company_id 
         AND wo.actual_completion_date BETWEEN p_start_date AND p_end_date
        ) as total_revenue,
        
        -- Profit margin
        (SELECT 
            CASE 
                WHEN SUM(total_billed) > 0 
                THEN ((SUM(total_billed) - SUM(actual_cost))::DECIMAL / SUM(total_billed)) * 100
                ELSE 0 
            END
         FROM work_orders wo 
         WHERE wo.company_id = p_company_id 
         AND wo.actual_completion_date BETWEEN p_start_date AND p_end_date
         AND total_billed IS NOT NULL
         AND actual_cost IS NOT NULL
        ) as profit_margin;
END;
$$ LANGUAGE plpgsql;

-- RLS policies for all new tables

-- Analytics alerts
ALTER TABLE analytics_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's analytics alerts" ON analytics_alerts
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Equipment utilization stats
ALTER TABLE equipment_utilization_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's equipment stats" ON equipment_utilization_stats
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Employee productivity stats
ALTER TABLE employee_productivity_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's productivity stats" ON employee_productivity_stats
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Safety incidents
ALTER TABLE safety_incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's safety incidents" ON safety_incidents
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- PPE violations
ALTER TABLE ppe_violations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's PPE violations" ON ppe_violations
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Silica monitoring
ALTER TABLE silica_monitoring ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's silica monitoring" ON silica_monitoring
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Equipment inspections
ALTER TABLE equipment_inspections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's equipment inspections" ON equipment_inspections
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Training records
ALTER TABLE training_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's training records" ON training_records
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Safety audits
ALTER TABLE safety_audits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's safety audits" ON safety_audits
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Triggers to update timestamps
CREATE TRIGGER update_analytics_alerts_updated_at BEFORE UPDATE ON analytics_alerts 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_equipment_utilization_stats_updated_at BEFORE UPDATE ON equipment_utilization_stats 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_employee_productivity_stats_updated_at BEFORE UPDATE ON employee_productivity_stats 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_safety_incidents_updated_at BEFORE UPDATE ON safety_incidents 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_ppe_violations_updated_at BEFORE UPDATE ON ppe_violations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_silica_monitoring_updated_at BEFORE UPDATE ON silica_monitoring 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_equipment_inspections_updated_at BEFORE UPDATE ON equipment_inspections 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_training_records_updated_at BEFORE UPDATE ON training_records 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_safety_audits_updated_at BEFORE UPDATE ON safety_audits 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Grant permissions
GRANT SELECT ON asset_realtime_status TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_company_kpis(UUID, TIMESTAMP WITH TIME ZONE, TIMESTAMP WITH TIME ZONE) TO authenticated;

-- Comments for documentation
COMMENT ON TABLE analytics_alerts IS 'Real-time alerts and notifications for the analytics dashboard';
COMMENT ON TABLE equipment_utilization_stats IS 'Hourly equipment utilization statistics for analytics';
COMMENT ON TABLE employee_productivity_stats IS 'Daily employee productivity metrics and KPIs';
COMMENT ON TABLE safety_incidents IS 'Comprehensive safety incident tracking and management';
COMMENT ON TABLE ppe_violations IS 'Personal protective equipment violation tracking';
COMMENT ON TABLE silica_monitoring IS 'Real-time silica exposure monitoring for OSHA compliance';
COMMENT ON TABLE equipment_inspections IS 'Equipment safety and maintenance inspection records';
COMMENT ON TABLE training_records IS 'Employee training and certification tracking';
COMMENT ON TABLE safety_audits IS 'Safety audit results and compliance tracking';
COMMENT ON VIEW asset_realtime_status IS 'Real-time view of asset status, location, and utilization';
COMMENT ON FUNCTION calculate_company_kpis IS 'Calculate real-time KPIs for analytics dashboard';