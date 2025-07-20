/**
 * DSM Software Data Types and Structures
 * Based on common DSM exports for construction management software
 */

// DSM Export Formats
export type DSMExportFormat = 'csv' | 'excel' | 'xml' | 'json' | 'database';

// DSM Job/Project Data Structure
export interface DSMJob {
  // Core Job Information
  JobID: string;
  JobNumber: string;
  JobName: string;
  CustomerID: string;
  CustomerName: string;
  ProjectManager: string;
  
  // Job Details
  JobDescription: string;
  JobType: string;
  JobStatus: 'Open' | 'In Progress' | 'Completed' | 'Cancelled' | 'On Hold';
  Priority: 'Low' | 'Medium' | 'High' | 'Critical';
  
  // Dates
  DateCreated: string;
  DateStarted?: string;
  DateCompleted?: string;
  DateDue?: string;
  EstimatedStartDate?: string;
  EstimatedCompletionDate?: string;
  
  // Location
  JobAddress: string;
  JobCity: string;
  JobState: string;
  JobZip: string;
  JobCountry?: string;
  Latitude?: number;
  Longitude?: number;
  
  // Financial
  EstimatedCost: number;
  ActualCost?: number;
  BillingRate?: number;
  TotalBilled?: number;
  
  // Work Details
  WorkType: string;
  Equipment?: string[];
  MaterialsRequired?: string;
  SpecialInstructions?: string;
  
  // Safety & Compliance
  SafetyRequirements?: string;
  PermitsRequired?: string[];
  OSHARequired?: boolean;
  
  // Custom Fields (DSM allows custom fields)
  CustomField1?: string;
  CustomField2?: string;
  CustomField3?: string;
  CustomField4?: string;
  CustomField5?: string;
  
  // Related Records
  TimeEntries?: DSMTimeEntry[];
  Materials?: DSMMaterial[];
  Photos?: DSMPhoto[];
  Notes?: DSMNote[];
}

// DSM Employee/Worker Data Structure
export interface DSMEmployee {
  // Core Employee Information
  EmployeeID: string;
  EmployeeNumber: string;
  FirstName: string;
  LastName: string;
  MiddleName?: string;
  
  // Contact Information
  Email?: string;
  Phone?: string;
  MobilePhone?: string;
  Address?: string;
  City?: string;
  State?: string;
  ZipCode?: string;
  
  // Employment Details
  HireDate: string;
  TerminationDate?: string;
  EmploymentStatus: 'Active' | 'Inactive' | 'Terminated' | 'On Leave';
  Department?: string;
  Position: string;
  Supervisor?: string;
  
  // Pay Information
  PayRate: number;
  PayType: 'Hourly' | 'Salary' | 'Contract';
  OvertimeRate?: number;
  
  // Skills and Certifications
  Skills?: string[];
  Certifications?: DSMCertification[];
  LicenseNumber?: string;
  LicenseExpiration?: string;
  
  // Safety Training
  SafetyTraining?: DSMTraining[];
  LastSafetyUpdate?: string;
  
  // Equipment Authorizations
  AuthorizedEquipment?: string[];
  
  // Custom Fields
  CustomField1?: string;
  CustomField2?: string;
  CustomField3?: string;
}

// DSM Time Entry Structure
export interface DSMTimeEntry {
  TimeEntryID: string;
  EmployeeID: string;
  JobID: string;
  
  // Time Information
  Date: string;
  StartTime: string;
  EndTime: string;
  TotalHours: number;
  OvertimeHours?: number;
  
  // Work Details
  WorkDescription: string;
  WorkType?: string;
  Equipment?: string;
  
  // Location
  Location?: string;
  
  // Billing
  BillableHours?: number;
  PayRate?: number;
  BillingRate?: number;
  
  // Status
  Status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  ApprovedBy?: string;
  ApprovedDate?: string;
  
  // Notes
  Notes?: string;
}

// DSM Material/Equipment Structure
export interface DSMMaterial {
  MaterialID: string;
  MaterialCode: string;
  MaterialName: string;
  Description: string;
  Category: string;
  
  // Inventory
  QuantityOnHand?: number;
  UnitOfMeasure: string;
  UnitCost: number;
  
  // Supplier Information
  SupplierID?: string;
  SupplierName?: string;
  SupplierPartNumber?: string;
  
  // Usage Tracking
  JobID?: string;
  QuantityUsed?: number;
  DateUsed?: string;
  
  // Location
  WarehouseLocation?: string;
  
  // Custom Fields
  CustomField1?: string;
  CustomField2?: string;
}

// DSM Customer Structure
export interface DSMCustomer {
  CustomerID: string;
  CustomerNumber: string;
  CustomerName: string;
  CompanyName?: string;
  
  // Contact Information
  ContactPerson?: string;
  Email?: string;
  Phone?: string;
  Fax?: string;
  
  // Address
  BillingAddress: string;
  BillingCity: string;
  BillingState: string;
  BillingZip: string;
  
  ShippingAddress?: string;
  ShippingCity?: string;
  ShippingState?: string;
  ShippingZip?: string;
  
  // Business Information
  TaxID?: string;
  CreditLimit?: number;
  PaymentTerms?: string;
  
  // Status
  CustomerStatus: 'Active' | 'Inactive';
  
  // Custom Fields
  CustomField1?: string;
  CustomField2?: string;
  CustomField3?: string;
}

// DSM Company Settings Structure
export interface DSMCompanySettings {
  // Company Information
  CompanyName: string;
  CompanyAddress: string;
  CompanyCity: string;
  CompanyState: string;
  CompanyZip: string;
  CompanyPhone: string;
  CompanyEmail?: string;
  Website?: string;
  
  // Tax Information
  TaxID?: string;
  TaxRate?: number;
  
  // Business Settings
  FiscalYearStart?: string;
  DefaultPaymentTerms?: string;
  DefaultBillingRate?: number;
  OvertimeThreshold?: number;
  
  // Time Tracking Settings
  RoundTimeToNearest?: number; // minutes
  RequireTimeApproval?: boolean;
  AllowFutureTimeEntry?: boolean;
  
  // Job Settings
  AutoGenerateJobNumbers?: boolean;
  JobNumberPrefix?: string;
  DefaultJobStatus?: string;
  
  // Custom Field Labels
  CustomFieldLabel1?: string;
  CustomFieldLabel2?: string;
  CustomFieldLabel3?: string;
  CustomFieldLabel4?: string;
  CustomFieldLabel5?: string;
  
  // Integration Settings
  QuickBooksIntegration?: boolean;
  QuickBooksCompanyFile?: string;
  
  // Safety Settings
  RequireOSHACompliance?: boolean;
  DefaultSafetyRequirements?: string;
  
  // Equipment Settings
  TrackEquipmentUsage?: boolean;
  RequireEquipmentInspection?: boolean;
}

// Supporting Structures
export interface DSMCertification {
  CertificationID: string;
  CertificationName: string;
  IssuingOrganization: string;
  IssueDate: string;
  ExpirationDate?: string;
  CertificationNumber?: string;
}

export interface DSMTraining {
  TrainingID: string;
  TrainingName: string;
  TrainingDate: string;
  Instructor?: string;
  ExpirationDate?: string;
  CertificationReceived?: boolean;
}

export interface DSMPhoto {
  PhotoID: string;
  JobID?: string;
  EmployeeID?: string;
  PhotoPath: string;
  Description?: string;
  DateTaken: string;
  GPS_Latitude?: number;
  GPS_Longitude?: number;
}

export interface DSMNote {
  NoteID: string;
  JobID?: string;
  EmployeeID?: string;
  CustomerID?: string;
  NoteText: string;
  CreatedBy: string;
  CreatedDate: string;
  NoteType?: 'General' | 'Safety' | 'Issue' | 'Follow-up';
}

// DSM Work Type Categories (common in DSM software)
export interface DSMWorkType {
  WorkTypeID: string;
  WorkTypeCode: string;
  WorkTypeName: string;
  Description: string;
  Category: string;
  DefaultBillingRate?: number;
  RequiresSpecialEquipment?: boolean;
  SafetyRequirements?: string;
  EstimatedDuration?: number; // minutes
}

// DSM Export File Structure
export interface DSMExportFile {
  exportDate: string;
  exportVersion: string;
  companyInfo: DSMCompanySettings;
  format: DSMExportFormat;
  
  // Data Tables
  jobs?: DSMJob[];
  employees?: DSMEmployee[];
  customers?: DSMCustomer[];
  timeEntries?: DSMTimeEntry[];
  materials?: DSMMaterial[];
  workTypes?: DSMWorkType[];
  photos?: DSMPhoto[];
  notes?: DSMNote[];
  
  // Metadata
  totalRecords: number;
  exportedTables: string[];
  customFields: Record<string, string>; // fieldName -> fieldLabel mapping
}

// Migration Status Tracking
export interface DSMMigrationStatus {
  migrationId: string;
  startDate: Date;
  endDate?: Date;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'cancelled';
  
  // Progress Tracking
  totalRecords: number;
  processedRecords: number;
  successfulRecords: number;
  failedRecords: number;
  skippedRecords: number;
  
  // Table-specific Progress
  tables: {
    jobs: { total: number; processed: number; successful: number; failed: number; };
    employees: { total: number; processed: number; successful: number; failed: number; };
    customers: { total: number; processed: number; successful: number; failed: number; };
    timeEntries: { total: number; processed: number; successful: number; failed: number; };
    materials: { total: number; processed: number; successful: number; failed: number; };
    workTypes: { total: number; processed: number; successful: number; failed: number; };
  };
  
  // Error Tracking
  errors: DSMMigrationError[];
  warnings: DSMMigrationWarning[];
  
  // Configuration
  migrationOptions: DSMMigrationOptions;
}

export interface DSMMigrationError {
  recordId: string;
  recordType: string;
  errorType: 'validation' | 'duplicate' | 'mapping' | 'database' | 'unknown';
  errorMessage: string;
  fieldName?: string;
  suggestedFix?: string;
}

export interface DSMMigrationWarning {
  recordId: string;
  recordType: string;
  warningType: 'data_loss' | 'approximation' | 'default_value' | 'format_change';
  warningMessage: string;
  fieldName?: string;
}

export interface DSMMigrationOptions {
  // General Options
  skipDuplicates: boolean;
  updateExisting: boolean;
  validateOnly: boolean;
  
  // Data Handling
  handleMissingFields: 'error' | 'warn' | 'ignore' | 'default';
  dateFormat: string;
  currencyFormat: string;
  
  // Specific Table Options
  migrateJobs: boolean;
  migrateEmployees: boolean;
  migrateCustomers: boolean;
  migrateTimeEntries: boolean;
  migrateMaterials: boolean;
  migrateWorkTypes: boolean;
  migratePhotos: boolean;
  migrateNotes: boolean;
  
  // Advanced Options
  batchSize: number;
  maxErrors: number;
  createBackup: boolean;
  
  // Field Mapping Overrides
  fieldMappings: Record<string, string>; // dsmField -> pontifexField
  customFieldMappings: Record<string, string>;
}

// Validation Rules
export interface DSMValidationRule {
  field: string;
  required: boolean;
  dataType: 'string' | 'number' | 'date' | 'email' | 'phone' | 'boolean';
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  allowedValues?: string[];
  customValidator?: (value: any) => boolean;
}

export interface DSMValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  fieldResults: Record<string, {
    isValid: boolean;
    error?: string;
    warning?: string;
  }>;
}