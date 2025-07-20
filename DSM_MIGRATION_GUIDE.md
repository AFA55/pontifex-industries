# DSM Data Import Utility - Complete Guide

## Overview

The DSM Data Import Utility provides a comprehensive solution for migrating data from DSM Software to the Pontifex Industries concrete cutting platform. This utility can parse multiple export formats and automatically migrate job history, employee records, work types, and company settings with full validation and error handling.

## Features

### ✅ **Multi-Format Support**
- **CSV Files**: Standard comma-separated values with headers
- **Excel Files**: .xlsx and .xls files with multiple sheet support
- **JSON Files**: Structured JSON with data arrays
- **XML Files**: Hierarchical XML format

### ✅ **Complete Data Migration**
- **Job History**: Work orders, project details, scheduling, and financial data
- **Employee Records**: Staff information, certifications, pay rates, and safety training
- **Customer Database**: Contact information, billing/shipping addresses, payment terms
- **Time Entries**: Labor tracking, billable hours, and project time allocation
- **Materials/Assets**: Equipment, inventory, and supplier information
- **Work Types**: Service categories with concrete cutting specializations
- **Company Settings**: Business configuration and custom field mappings

### ✅ **Advanced Features**
- **Data Validation**: Comprehensive validation with detailed error reporting
- **Duplicate Detection**: Smart duplicate handling with configurable options
- **Progress Tracking**: Real-time migration progress with detailed status updates
- **Error Recovery**: Robust error handling with suggested fixes
- **Conflict Resolution**: Automated and manual conflict resolution options
- **Backup Creation**: Automatic backup before migration
- **Mapping Customization**: Flexible field mapping and transformation rules

## File Structure

```
src/
├── types/
│   └── dsm-data.ts                    # DSM data type definitions
├── lib/
│   ├── dsm-parser.ts                  # Multi-format parser
│   ├── dsm-pontifex-mapper.ts         # Data mapping engine
│   ├── dsm-migration-service.ts       # Migration orchestration
│   └── dsm-migration-schema.sql       # Database schema
└── components/
    └── DSMMigrationInterface.tsx      # User interface
```

## Quick Start Guide

### 1. **Prepare Your DSM Export**

Export your data from DSM Software in one of the supported formats:

**Recommended: Excel Format**
- Export all tables to separate sheets in one Excel file
- Include headers in the first row
- Ensure consistent date formats (YYYY-MM-DD preferred)

**Alternative: CSV Format**
- Export each data type (jobs, employees, customers) to separate CSV files
- Or use a single CSV file with clear data type identification

### 2. **Access the Migration Interface**

Navigate to the DSM Migration section in your Pontifex admin panel:

```typescript
import DSMMigrationInterface from '@/components/DSMMigrationInterface';

<DSMMigrationInterface 
  companyId={companyId}
  userId={userId}
  onMigrationComplete={(status) => {
    console.log('Migration completed:', status);
  }}
/>
```

### 3. **Upload and Validate**

1. **Upload File**: Drag and drop or select your DSM export file
2. **Automatic Validation**: The system will validate data structure and format
3. **Review Issues**: Address any validation errors before proceeding

### 4. **Configure Migration**

**Data Types Selection:**
- ✅ Customers
- ✅ Employees  
- ✅ Jobs/Projects
- ✅ Time Entries
- ✅ Materials/Assets
- ✅ Work Types

**Data Handling Options:**
- **Skip Duplicates**: Avoid importing duplicate records
- **Update Existing**: Update existing records with new data
- **Create Backup**: Create backup before migration (recommended)
- **Validation Only**: Test migration without making changes

**Advanced Settings:**
- **Batch Size**: Number of records processed at once (default: 100)
- **Max Errors**: Stop migration after this many errors (default: 50)
- **Date Format**: Expected date format in source data
- **Missing Field Handling**: How to handle missing required fields

### 5. **Run Migration**

1. **Start Migration**: Begin the migration process
2. **Monitor Progress**: Watch real-time progress for each data type
3. **Handle Errors**: Address any errors that occur during migration
4. **Review Results**: Examine the final migration report

## Data Mapping

### Job History Migration

**DSM Job Fields → Pontifex Work Orders**
```
JobID → (auto-generated UUID)
JobNumber → work_order_number
JobName → job_title
CustomerID → customer_id (with lookup)
JobDescription → description
JobType → work_type (mapped to concrete work types)
JobStatus → status (Open → pending, In Progress → in_progress, etc.)
DateCreated → created_at
JobAddress → site_address
EstimatedCost → estimated_cost
WorkType → work_type (specialized mapping)
```

**Concrete Work Type Mapping:**
```
DSM Work Type → Pontifex Concrete Type
"Core Drilling" → "core_drill"
"Wall Sawing" → "wall_saw"
"Slab Sawing" → "slab_saw"
"Chain Sawing" → "chain_saw"
"Ring Sawing" → "ring_saw"
"Hand Sawing" → "hand_saw"
"Breaking" → "break_remove"
"Chipping" → "chipping"
"Joint Sealing" → "joint_sealing"
"Demolition" → "demolition"
```

### Employee Records Migration

**DSM Employee Fields → Pontifex Employees**
```
EmployeeID → (auto-generated UUID)
EmployeeNumber → employee_number
FirstName + LastName → first_name, last_name
Email → email
Phone → phone_primary
HireDate → hire_date
Position → job_title
PayRate → base_pay_rate
PayType → pay_type (Hourly → hourly, Salary → salary)
Skills → skills (JSON array)
Certifications → certifications (JSON array)
```

### Customer Database Migration

**DSM Customer Fields → Pontifex Customers**
```
CustomerID → (auto-generated UUID)
CustomerNumber → customer_number
CustomerName → customer_name
BillingAddress → billing_address_line1
BillingCity → billing_address_city
ContactPerson → primary_contact_name
Email → email
PaymentTerms → payment_terms
```

### Time Entries Migration

**DSM Time Entry Fields → Pontifex Time Entries**
```
TimeEntryID → (auto-generated UUID)
EmployeeID → employee_id (with lookup)
JobID → work_order_id (with lookup)
Date → entry_date
StartTime → start_time
EndTime → end_time
TotalHours → total_hours
WorkDescription → work_description
```

## Advanced Configuration

### Custom Field Mapping

Define custom field mappings for your specific DSM setup:

```typescript
const customMappings = {
  // Map DSM custom fields to Pontifex standard fields
  mapToStandardFields: {
    'CustomField1': 'priority',
    'CustomField2': 'project_manager_id'
  },
  
  // Preserve unmapped custom fields with prefix
  preserveCustomFields: true,
  customFieldPrefix: 'dsm_'
};
```

### Work Type Specialization

Configure concrete cutting work type mappings:

```typescript
const workTypeMappings = {
  'Concrete Core Drilling': 'core_drill',
  'Diamond Wall Cutting': 'wall_saw',
  'Floor Saw Operations': 'slab_saw',
  'Hydraulic Chain Saw': 'chain_saw',
  'Precision Ring Cutting': 'ring_saw',
  'Handheld Diamond Cutting': 'hand_saw',
  'Pneumatic Breaking': 'break_remove',
  'Surface Chipping': 'chipping',
  'Expansion Joint Sealing': 'joint_sealing',
  'Controlled Demolition': 'demolition'
};
```

### Validation Rules

Customize validation rules for your data:

```typescript
const validationRules = {
  jobs: [
    { field: 'JobNumber', required: true, pattern: '^[A-Z0-9-]+$' },
    { field: 'EstimatedCost', dataType: 'number', min: 0 }
  ],
  employees: [
    { field: 'Email', dataType: 'email' },
    { field: 'PayRate', dataType: 'number', min: 0 }
  ]
};
```

## Error Handling and Troubleshooting

### Common Issues and Solutions

**1. Data Validation Errors**
```
Error: "Required field is missing"
Solution: Ensure all required fields have values in your DSM export
```

**2. Date Format Issues**
```
Error: "Expected valid date"
Solution: Configure correct date format in migration settings
```

**3. Duplicate Records**
```
Error: "Record already exists"
Solution: Enable "Skip Duplicates" option or use "Update Existing"
```

**4. Foreign Key Constraints**
```
Error: "Customer ID not found"
Solution: Ensure customers are migrated before jobs
```

### Migration Order

**Recommended Migration Sequence:**
1. **Company Settings** (if applicable)
2. **Work Types** (define service categories first)
3. **Customers** (needed for job references)
4. **Employees** (needed for time entry references)
5. **Materials/Assets** (equipment and inventory)
6. **Jobs/Work Orders** (references customers and employees)
7. **Time Entries** (references jobs and employees)

### Recovery Procedures

**If Migration Fails:**
1. **Review Error Log**: Check detailed error messages
2. **Fix Source Data**: Correct issues in DSM export
3. **Restore Backup**: Use automatic backup if needed
4. **Retry Migration**: Re-run with corrected data

**Partial Migration Recovery:**
```sql
-- Check migration status
SELECT * FROM dsm_migration_summary 
WHERE migration_id = 'your_migration_id';

-- View failed records
SELECT * FROM dsm_migration_records 
WHERE migration_id = 'your_migration_id' 
AND status = 'failed';
```

## API Usage

### Programmatic Migration

```typescript
import { dsmMigrationService } from '@/lib/dsm-migration-service';

const options: DSMMigrationOptions = {
  skipDuplicates: true,
  createBackup: true,
  migrateJobs: true,
  migrateEmployees: true,
  migrateCustomers: true,
  batchSize: 50,
  maxErrors: 25
};

const migrationStatus = await dsmMigrationService.startMigration(
  file, 
  options, 
  companyId, 
  userId,
  (progress) => console.log('Progress:', progress)
);
```

### Validation Only

```typescript
// Validate without migrating
const validationResult = await dsmMigrationService.validateMigration(file, options);

if (validationResult.isValid) {
  console.log('Data is valid for migration');
} else {
  console.log('Validation errors:', validationResult.errors);
}
```

## Performance Optimization

### Large Dataset Recommendations

**For datasets > 10,000 records:**
- Use batch size of 50-100 records
- Enable progress tracking
- Consider off-peak migration timing
- Monitor system resources

**Memory Management:**
- Process files in chunks
- Clear temporary data regularly
- Use streaming for large files

**Database Optimization:**
- Ensure proper indexing
- Use batch inserts
- Consider connection pooling

## Security and Compliance

### Data Protection

**During Migration:**
- All data encrypted in transit
- Temporary files securely handled
- Access logged and audited
- RLS policies enforced

**Backup and Recovery:**
- Automatic backup creation
- Point-in-time recovery options
- Rollback capabilities
- Audit trail maintenance

### Access Control

**Who Can Migrate:**
- Company administrators
- Users with migration permissions
- Logged and tracked access

**Data Isolation:**
- Company-scoped data access
- Row-level security (RLS)
- Multi-tenant isolation
- Secure ID mapping

## Post-Migration Tasks

### Data Verification

**Recommended Checks:**
1. **Record Counts**: Verify expected number of records migrated
2. **Key Relationships**: Confirm job-customer-employee links
3. **Financial Data**: Validate cost and billing information
4. **Date Integrity**: Check date fields for accuracy
5. **Custom Fields**: Review custom field preservation

### System Configuration

**After Migration:**
1. **Update User Permissions**: Assign users to migrated data
2. **Configure Workflows**: Set up Pontifex workflows
3. **Test Integrations**: Verify Bluetooth and hardware integration
4. **Train Users**: Provide platform training
5. **Monitor Performance**: Watch system performance

### Cleanup Tasks

**Optional Cleanup:**
1. **Archive Migration Data**: Store migration logs for audit
2. **Remove Temporary Files**: Clean up uploaded files
3. **Update Documentation**: Record any custom mappings
4. **Performance Tuning**: Optimize based on usage patterns

## Migration Report

### Automatic Report Generation

The system generates comprehensive migration reports including:

**Summary Statistics:**
- Total records processed
- Success/failure rates by data type
- Migration duration
- Error and warning counts

**Detailed Results:**
- Record-by-record status
- Error messages with suggestions
- Data transformation details
- Performance metrics

**Export Options:**
- Download as text file
- Email delivery
- Integration with logging systems

## Support and Resources

### Getting Help

**Documentation:**
- This guide (comprehensive overview)
- API documentation (technical details)
- Video tutorials (step-by-step guides)
- FAQ section (common questions)

**Support Channels:**
- Email support for migration issues
- Live chat during business hours
- Community forum for user discussions
- Phone support for critical issues

### Best Practices

**Before Migration:**
- ✅ Backup your existing Pontifex data
- ✅ Review and clean DSM data
- ✅ Test with a small dataset first
- ✅ Plan migration during low-usage periods

**During Migration:**
- ✅ Monitor progress actively
- ✅ Address errors promptly
- ✅ Keep migration logs
- ✅ Communicate with team

**After Migration:**
- ✅ Verify data integrity
- ✅ Test key workflows
- ✅ Train users on new system
- ✅ Monitor system performance

---

## Example Migration Workflow

### Complete Migration Example

```bash
# 1. Prepare DSM Export
DSM Software → Export → All Tables → Excel Format
📁 company_data_export.xlsx

# 2. Upload to Pontifex
Upload → Validate → Configure → Migrate

# 3. Monitor Progress
- Customers: 150/150 ✅
- Employees: 25/25 ✅  
- Jobs: 1,250/1,250 ✅
- Time Entries: 5,500/5,500 ✅
- Materials: 75/75 ✅

# 4. Verify Results
Total: 7,000 records
Success: 6,995 (99.9%)
Failed: 5 (0.1%)
Duration: 12 minutes

# 5. Download Report
📄 dsm_migration_report_20241201.txt
```

This comprehensive DSM Data Import Utility provides everything needed to successfully migrate from DSM Software to the Pontifex Industries platform, ensuring data integrity, security, and seamless transition to modern concrete cutting management capabilities.