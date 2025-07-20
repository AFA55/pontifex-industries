-- DSM Migration Database Schema
-- Tables and structures needed for DSM Software data migration

-- Table to store ID mappings between DSM and Pontifex records
CREATE TABLE IF NOT EXISTS dsm_id_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_id TEXT NOT NULL,
    dsm_type TEXT NOT NULL, -- 'customer', 'employee', 'job', 'material', etc.
    dsm_id TEXT NOT NULL,
    pontifex_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique mappings per migration
    UNIQUE(migration_id, dsm_type, dsm_id)
);

-- Index for fast lookups during migration
CREATE INDEX IF NOT EXISTS idx_dsm_id_mappings_lookup 
ON dsm_id_mappings(migration_id, dsm_type, dsm_id);

-- Table to store migration history and status
CREATE TABLE IF NOT EXISTS dsm_migrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_id TEXT UNIQUE NOT NULL,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    started_by UUID NOT NULL REFERENCES auth.users(id),
    
    -- Migration details
    source_file_name TEXT NOT NULL,
    source_file_size BIGINT,
    source_format TEXT NOT NULL, -- 'csv', 'excel', 'json', 'xml'
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'cancelled'
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Progress tracking
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    successful_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    skipped_records INTEGER DEFAULT 0,
    
    -- Table-specific progress (stored as JSON)
    table_progress JSONB DEFAULT '{}',
    
    -- Configuration
    migration_options JSONB NOT NULL DEFAULT '{}',
    
    -- Results
    errors JSONB DEFAULT '[]',
    warnings JSONB DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to track individual record migration results
CREATE TABLE IF NOT EXISTS dsm_migration_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    migration_id TEXT NOT NULL REFERENCES dsm_migrations(migration_id),
    
    -- Record identification
    dsm_record_type TEXT NOT NULL,
    dsm_record_id TEXT NOT NULL,
    pontifex_record_id UUID,
    
    -- Migration result
    status TEXT NOT NULL, -- 'success', 'failed', 'skipped'
    error_message TEXT,
    warning_message TEXT,
    
    -- Data transformation details
    source_data JSONB,
    transformed_data JSONB,
    applied_mappings JSONB,
    
    -- Timing
    processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(migration_id, dsm_record_type, dsm_record_id)
);

-- Index for migration record lookups
CREATE INDEX IF NOT EXISTS idx_dsm_migration_records_migration 
ON dsm_migration_records(migration_id);

CREATE INDEX IF NOT EXISTS idx_dsm_migration_records_status 
ON dsm_migration_records(migration_id, status);

-- Table to store custom field mappings for each company
CREATE TABLE IF NOT EXISTS dsm_field_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Mapping configuration
    dsm_table TEXT NOT NULL,
    dsm_field TEXT NOT NULL,
    pontifex_table TEXT NOT NULL,
    pontifex_field TEXT NOT NULL,
    
    -- Transformation rules
    transformation_type TEXT DEFAULT 'direct', -- 'direct', 'lookup', 'calculated', 'conditional'
    transformation_config JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, dsm_table, dsm_field)
);

-- Table to store migration templates/presets
CREATE TABLE IF NOT EXISTS dsm_migration_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL,
    description TEXT,
    
    -- Template configuration
    migration_options JSONB NOT NULL DEFAULT '{}',
    field_mappings JSONB NOT NULL DEFAULT '{}',
    transformation_rules JSONB NOT NULL DEFAULT '{}',
    
    -- Scope
    company_id UUID REFERENCES profiles(company_id), -- NULL means global template
    is_public BOOLEAN DEFAULT false,
    
    -- Usage tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced work_type_mappings table for DSM integration
CREATE TABLE IF NOT EXISTS work_type_mappings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Work type identification
    work_type_code TEXT NOT NULL,
    work_type_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    
    -- Pontifex concrete work type mapping
    concrete_work_type TEXT, -- Maps to ConcreteWorkType enum
    
    -- DSM source information
    dsm_work_type_id TEXT,
    dsm_source_name TEXT,
    
    -- Billing and estimation
    default_billing_rate DECIMAL(10,2),
    estimated_duration_minutes INTEGER,
    requires_special_equipment BOOLEAN DEFAULT false,
    
    -- Safety requirements
    safety_requirements TEXT,
    requires_dust_suppression BOOLEAN DEFAULT true,
    osha_compliance_required BOOLEAN DEFAULT true,
    silica_monitoring_required BOOLEAN DEFAULT true,
    
    -- Equipment and calculations
    default_equipment JSONB DEFAULT '[]',
    calculation_factors JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, work_type_code)
);

-- Enhanced customers table for DSM migration compatibility
-- (Adding columns that might be missing)
DO $$ 
BEGIN
    -- Add customer_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'customer_number') THEN
        ALTER TABLE customers ADD COLUMN customer_number TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_number_company 
        ON customers(customer_number, company_id);
    END IF;
    
    -- Add custom_fields if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'custom_fields') THEN
        ALTER TABLE customers ADD COLUMN custom_fields JSONB DEFAULT '{}';
    END IF;
    
    -- Add company_name if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'company_name') THEN
        ALTER TABLE customers ADD COLUMN company_name TEXT;
    END IF;
    
    -- Add billing address fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'billing_address_line1') THEN
        ALTER TABLE customers ADD COLUMN billing_address_line1 TEXT;
        ALTER TABLE customers ADD COLUMN billing_address_city TEXT;
        ALTER TABLE customers ADD COLUMN billing_address_state TEXT;
        ALTER TABLE customers ADD COLUMN billing_address_postal_code TEXT;
        ALTER TABLE customers ADD COLUMN billing_address_country TEXT;
    END IF;
    
    -- Add shipping address fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'shipping_address_line1') THEN
        ALTER TABLE customers ADD COLUMN shipping_address_line1 TEXT;
        ALTER TABLE customers ADD COLUMN shipping_address_city TEXT;
        ALTER TABLE customers ADD COLUMN shipping_address_state TEXT;
        ALTER TABLE customers ADD COLUMN shipping_address_postal_code TEXT;
        ALTER TABLE customers ADD COLUMN shipping_address_country TEXT;
    END IF;
    
    -- Add business fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'tax_id') THEN
        ALTER TABLE customers ADD COLUMN tax_id TEXT;
        ALTER TABLE customers ADD COLUMN credit_limit DECIMAL(10,2);
        ALTER TABLE customers ADD COLUMN payment_terms TEXT;
    END IF;
    
    -- Add status field if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'customers' AND column_name = 'customer_status') THEN
        ALTER TABLE customers ADD COLUMN customer_status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Enhanced employees table for DSM migration compatibility
DO $$ 
BEGIN
    -- Add employee_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'employee_number') THEN
        ALTER TABLE employees ADD COLUMN employee_number TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_employees_number_company 
        ON employees(employee_number, company_id);
    END IF;
    
    -- Add pay information if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'base_pay_rate') THEN
        ALTER TABLE employees ADD COLUMN base_pay_rate DECIMAL(10,2);
        ALTER TABLE employees ADD COLUMN pay_type TEXT DEFAULT 'hourly';
        ALTER TABLE employees ADD COLUMN overtime_rate DECIMAL(10,2);
    END IF;
    
    -- Add address fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'address_line1') THEN
        ALTER TABLE employees ADD COLUMN address_line1 TEXT;
        ALTER TABLE employees ADD COLUMN address_city TEXT;
        ALTER TABLE employees ADD COLUMN address_state TEXT;
        ALTER TABLE employees ADD COLUMN address_postal_code TEXT;
    END IF;
    
    -- Add phone fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'phone_primary') THEN
        ALTER TABLE employees ADD COLUMN phone_primary TEXT;
        ALTER TABLE employees ADD COLUMN phone_mobile TEXT;
    END IF;
    
    -- Add skills and certifications if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'skills') THEN
        ALTER TABLE employees ADD COLUMN skills JSONB DEFAULT '[]';
        ALTER TABLE employees ADD COLUMN certifications JSONB DEFAULT '[]';
        ALTER TABLE employees ADD COLUMN license_number TEXT;
        ALTER TABLE employees ADD COLUMN license_expiration_date DATE;
    END IF;
    
    -- Add safety fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'safety_training_records') THEN
        ALTER TABLE employees ADD COLUMN safety_training_records JSONB DEFAULT '[]';
        ALTER TABLE employees ADD COLUMN last_safety_training_date DATE;
        ALTER TABLE employees ADD COLUMN authorized_equipment JSONB DEFAULT '[]';
    END IF;
    
    -- Add custom_fields if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'custom_fields') THEN
        ALTER TABLE employees ADD COLUMN custom_fields JSONB DEFAULT '{}';
    END IF;
    
    -- Add employment status if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employees' AND column_name = 'employment_status') THEN
        ALTER TABLE employees ADD COLUMN employment_status TEXT DEFAULT 'active';
    END IF;
END $$;

-- Enhanced work_orders table for DSM migration compatibility
DO $$ 
BEGIN
    -- Add work_order_number if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'work_orders' AND column_name = 'work_order_number') THEN
        ALTER TABLE work_orders ADD COLUMN work_order_number TEXT;
        CREATE UNIQUE INDEX IF NOT EXISTS idx_work_orders_number_company 
        ON work_orders(work_order_number, company_id);
    END IF;
    
    -- Add scheduling fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'work_orders' AND column_name = 'scheduled_start_date') THEN
        ALTER TABLE work_orders ADD COLUMN scheduled_start_date DATE;
        ALTER TABLE work_orders ADD COLUMN actual_start_date DATE;
        ALTER TABLE work_orders ADD COLUMN scheduled_completion_date DATE;
        ALTER TABLE work_orders ADD COLUMN actual_completion_date DATE;
    END IF;
    
    -- Add site location fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'work_orders' AND column_name = 'site_address') THEN
        ALTER TABLE work_orders ADD COLUMN site_address TEXT;
        ALTER TABLE work_orders ADD COLUMN site_city TEXT;
        ALTER TABLE work_orders ADD COLUMN site_state TEXT;
        ALTER TABLE work_orders ADD COLUMN site_postal_code TEXT;
        ALTER TABLE work_orders ADD COLUMN site_country TEXT;
        ALTER TABLE work_orders ADD COLUMN site_latitude DECIMAL(10,8);
        ALTER TABLE work_orders ADD COLUMN site_longitude DECIMAL(11,8);
    END IF;
    
    -- Add financial fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'work_orders' AND column_name = 'estimated_cost') THEN
        ALTER TABLE work_orders ADD COLUMN estimated_cost DECIMAL(10,2);
        ALTER TABLE work_orders ADD COLUMN actual_cost DECIMAL(10,2);
        ALTER TABLE work_orders ADD COLUMN billing_rate DECIMAL(10,2);
        ALTER TABLE work_orders ADD COLUMN total_billed DECIMAL(10,2);
    END IF;
    
    -- Add work specifications if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'work_orders' AND column_name = 'work_specifications') THEN
        ALTER TABLE work_orders ADD COLUMN work_specifications JSONB DEFAULT '{}';
        ALTER TABLE work_orders ADD COLUMN equipment_required JSONB DEFAULT '[]';
        ALTER TABLE work_orders ADD COLUMN materials_required TEXT;
        ALTER TABLE work_orders ADD COLUMN special_instructions TEXT;
    END IF;
    
    -- Add safety fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'work_orders' AND column_name = 'safety_requirements') THEN
        ALTER TABLE work_orders ADD COLUMN safety_requirements TEXT;
        ALTER TABLE work_orders ADD COLUMN osha_required BOOLEAN DEFAULT false;
        ALTER TABLE work_orders ADD COLUMN silica_monitoring_required BOOLEAN DEFAULT false;
        ALTER TABLE work_orders ADD COLUMN permits_required JSONB DEFAULT '[]';
    END IF;
    
    -- Add custom_fields if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'work_orders' AND column_name = 'custom_fields') THEN
        ALTER TABLE work_orders ADD COLUMN custom_fields JSONB DEFAULT '{}';
    END IF;
END $$;

-- Enhanced time_entries table for DSM migration compatibility
DO $$ 
BEGIN
    -- Add entry_date if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_entries' AND column_name = 'entry_date') THEN
        ALTER TABLE time_entries ADD COLUMN entry_date DATE;
    END IF;
    
    -- Add time fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_entries' AND column_name = 'start_time') THEN
        ALTER TABLE time_entries ADD COLUMN start_time TIME;
        ALTER TABLE time_entries ADD COLUMN end_time TIME;
        ALTER TABLE time_entries ADD COLUMN break_time_hours DECIMAL(4,2);
    END IF;
    
    -- Add work details if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_entries' AND column_name = 'work_description') THEN
        ALTER TABLE time_entries ADD COLUMN work_description TEXT;
        ALTER TABLE time_entries ADD COLUMN work_type TEXT;
        ALTER TABLE time_entries ADD COLUMN equipment_used TEXT;
        ALTER TABLE time_entries ADD COLUMN work_location TEXT;
    END IF;
    
    -- Add billing fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_entries' AND column_name = 'billable_hours') THEN
        ALTER TABLE time_entries ADD COLUMN billable_hours DECIMAL(4,2);
        ALTER TABLE time_entries ADD COLUMN hourly_rate DECIMAL(10,2);
        ALTER TABLE time_entries ADD COLUMN billing_rate DECIMAL(10,2);
    END IF;
    
    -- Add approval fields if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'time_entries' AND column_name = 'entry_status') THEN
        ALTER TABLE time_entries ADD COLUMN entry_status TEXT DEFAULT 'draft';
        ALTER TABLE time_entries ADD COLUMN approved_by UUID REFERENCES auth.users(id);
        ALTER TABLE time_entries ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE time_entries ADD COLUMN rejection_reason TEXT;
    END IF;
END $$;

-- Assets table for materials/equipment from DSM
CREATE TABLE IF NOT EXISTS assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES profiles(company_id),
    
    -- Asset identification
    asset_code TEXT NOT NULL,
    asset_name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    
    -- Specifications
    manufacturer TEXT,
    model TEXT,
    serial_number TEXT,
    
    -- Financial
    purchase_cost DECIMAL(10,2),
    current_value DECIMAL(10,2),
    depreciation_rate DECIMAL(5,2),
    
    -- Inventory
    quantity_available INTEGER DEFAULT 0,
    unit_of_measure TEXT DEFAULT 'each',
    warehouse_location TEXT,
    
    -- Usage tracking
    total_hours_used INTEGER DEFAULT 0,
    last_maintenance_date DATE,
    next_maintenance_due DATE,
    
    -- Status
    asset_status TEXT DEFAULT 'available', -- 'available', 'in_use', 'maintenance', 'retired'
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(company_id, asset_code)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_dsm_migrations_company ON dsm_migrations(company_id);
CREATE INDEX IF NOT EXISTS idx_dsm_migrations_status ON dsm_migrations(status);
CREATE INDEX IF NOT EXISTS idx_dsm_migrations_started_by ON dsm_migrations(started_by);

CREATE INDEX IF NOT EXISTS idx_work_type_mappings_company ON work_type_mappings(company_id);
CREATE INDEX IF NOT EXISTS idx_work_type_mappings_active ON work_type_mappings(company_id, is_active);

CREATE INDEX IF NOT EXISTS idx_assets_company ON assets(company_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(company_id, asset_status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(company_id, category);

-- Create RLS policies for security

-- DSM ID Mappings - only accessible during migration
ALTER TABLE dsm_id_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's migration mappings" ON dsm_id_mappings
    FOR ALL USING (
        migration_id IN (
            SELECT migration_id FROM dsm_migrations 
            WHERE company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- DSM Migrations - company scoped
ALTER TABLE dsm_migrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's migrations" ON dsm_migrations
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- DSM Migration Records - linked to company through migration
ALTER TABLE dsm_migration_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's migration records" ON dsm_migration_records
    FOR ALL USING (
        migration_id IN (
            SELECT migration_id FROM dsm_migrations 
            WHERE company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())
        )
    );

-- DSM Field Mappings - company scoped
ALTER TABLE dsm_field_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's field mappings" ON dsm_field_mappings
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- DSM Migration Templates - company scoped or public
ALTER TABLE dsm_migration_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access public templates or their company's templates" ON dsm_migration_templates
    FOR SELECT USING (
        is_public = true OR 
        company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid())
    );
CREATE POLICY "Users can manage their company's templates" ON dsm_migration_templates
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Work Type Mappings - company scoped
ALTER TABLE work_type_mappings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's work type mappings" ON work_type_mappings
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Assets - company scoped
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access their company's assets" ON assets
    FOR ALL USING (company_id = (SELECT company_id FROM profiles WHERE user_id = auth.uid()));

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply the trigger to relevant tables
CREATE TRIGGER update_dsm_migrations_updated_at BEFORE UPDATE ON dsm_migrations 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_work_type_mappings_updated_at BEFORE UPDATE ON work_type_mappings 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_dsm_migration_templates_updated_at BEFORE UPDATE ON dsm_migration_templates 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Add some default work type mappings for common concrete work
INSERT INTO work_type_mappings (
    company_id, work_type_code, work_type_name, description, category, 
    concrete_work_type, requires_dust_suppression, osha_compliance_required, 
    silica_monitoring_required, default_equipment, calculation_factors
) VALUES
-- Only insert if no records exist for this company (to avoid conflicts)
-- This would typically be done per company during setup
-- For now, we'll skip the default inserts to avoid conflicts

-- Create a view for migration status summary
CREATE OR REPLACE VIEW dsm_migration_summary AS
SELECT 
    m.migration_id,
    m.company_id,
    m.source_file_name,
    m.status,
    m.started_at,
    m.completed_at,
    m.total_records,
    m.successful_records,
    m.failed_records,
    m.skipped_records,
    CASE 
        WHEN m.total_records > 0 
        THEN ROUND((m.successful_records::DECIMAL / m.total_records) * 100, 2)
        ELSE 0 
    END as success_rate,
    CASE 
        WHEN m.completed_at IS NOT NULL 
        THEN EXTRACT(EPOCH FROM (m.completed_at - m.started_at))
        ELSE NULL 
    END as duration_seconds,
    jsonb_array_length(m.errors) as error_count,
    jsonb_array_length(m.warnings) as warning_count,
    u.email as started_by_email
FROM dsm_migrations m
LEFT JOIN auth.users u ON m.started_by = u.id;

-- Grant appropriate permissions
GRANT SELECT ON dsm_migration_summary TO authenticated;

-- Comment the tables for documentation
COMMENT ON TABLE dsm_migrations IS 'Tracks DSM Software data migration sessions';
COMMENT ON TABLE dsm_id_mappings IS 'Maps DSM record IDs to Pontifex record IDs';
COMMENT ON TABLE dsm_migration_records IS 'Detailed results for each migrated record';
COMMENT ON TABLE dsm_field_mappings IS 'Custom field mapping configurations per company';
COMMENT ON TABLE dsm_migration_templates IS 'Reusable migration configuration templates';
COMMENT ON TABLE work_type_mappings IS 'Maps DSM work types to Pontifex concrete work types';
COMMENT ON TABLE assets IS 'Equipment, materials, and assets migrated from DSM';