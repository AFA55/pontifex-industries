/**
 * DSM to Pontifex Data Mapping System
 * Maps DSM Software data structures to Pontifex platform schema
 */

import { 
  DSMJob, 
  DSMEmployee, 
  DSMCustomer, 
  DSMTimeEntry, 
  DSMMaterial, 
  DSMWorkType,
  DSMCompanySettings 
} from '@/types/dsm-data';

// Pontifex platform types (based on existing schema)
export interface PontifexWorkOrder {
  id?: string;
  work_order_number: string;
  job_title: string;
  customer_id: string;
  project_manager_id?: string;
  
  // Job Details
  description: string;
  work_type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Dates
  created_at: string;
  scheduled_start_date?: string;
  actual_start_date?: string;
  scheduled_completion_date?: string;
  actual_completion_date?: string;
  
  // Location
  site_address: string;
  site_city: string;
  site_state: string;
  site_postal_code: string;
  site_country?: string;
  site_latitude?: number;
  site_longitude?: number;
  
  // Financial
  estimated_cost: number;
  actual_cost?: number;
  billing_rate?: number;
  total_billed?: number;
  
  // Work Specifications
  work_specifications: any; // JSON field
  equipment_required?: string[];
  materials_required?: string;
  special_instructions?: string;
  
  // Safety & Compliance
  safety_requirements?: string;
  osha_required: boolean;
  silica_monitoring_required: boolean;
  permits_required?: string[];
  
  // Custom fields stored as JSON
  custom_fields?: Record<string, any>;
  
  // Metadata
  created_by: string;
  updated_at?: string;
  company_id: string;
}

export interface PontifexEmployee {
  id?: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  
  // Contact
  email?: string;
  phone_primary?: string;
  phone_mobile?: string;
  address_line1?: string;
  address_city?: string;
  address_state?: string;
  address_postal_code?: string;
  
  // Employment
  hire_date: string;
  termination_date?: string;
  employment_status: 'active' | 'inactive' | 'terminated' | 'on_leave';
  department?: string;
  job_title: string;
  supervisor_id?: string;
  
  // Compensation
  base_pay_rate: number;
  pay_type: 'hourly' | 'salary' | 'contract';
  overtime_rate?: number;
  
  // Skills & Certifications
  skills?: string[];
  certifications?: any[]; // JSON array
  license_number?: string;
  license_expiration_date?: string;
  
  // Safety
  safety_training_records?: any[]; // JSON array
  last_safety_training_date?: string;
  
  // Equipment Authorization
  authorized_equipment?: string[];
  
  // Metadata
  created_at: string;
  updated_at?: string;
  company_id: string;
  
  // Custom fields
  custom_fields?: Record<string, any>;
}

export interface PontifexCustomer {
  id?: string;
  customer_number: string;
  customer_name: string;
  company_name?: string;
  
  // Contact
  primary_contact_name?: string;
  email?: string;
  phone_primary?: string;
  phone_fax?: string;
  
  // Billing Address
  billing_address_line1: string;
  billing_address_city: string;
  billing_address_state: string;
  billing_address_postal_code: string;
  billing_address_country?: string;
  
  // Shipping Address
  shipping_address_line1?: string;
  shipping_address_city?: string;
  shipping_address_state?: string;
  shipping_address_postal_code?: string;
  shipping_address_country?: string;
  
  // Business Info
  tax_id?: string;
  credit_limit?: number;
  payment_terms?: string;
  
  // Status
  customer_status: 'active' | 'inactive';
  
  // Metadata
  created_at: string;
  updated_at?: string;
  company_id: string;
  
  // Custom fields
  custom_fields?: Record<string, any>;
}

export interface PontifexTimeEntry {
  id?: string;
  employee_id: string;
  work_order_id: string;
  
  // Time Information
  entry_date: string;
  start_time: string;
  end_time: string;
  total_hours: number;
  overtime_hours?: number;
  break_time_hours?: number;
  
  // Work Details
  work_description: string;
  work_type?: string;
  equipment_used?: string;
  
  // Location
  work_location?: string;
  
  // Billing
  billable_hours?: number;
  hourly_rate?: number;
  billing_rate?: number;
  
  // Status & Approval
  entry_status: 'draft' | 'submitted' | 'approved' | 'rejected';
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  
  // Notes
  notes?: string;
  
  // Metadata
  created_at: string;
  updated_at?: string;
  created_by: string;
  company_id: string;
}

export interface PontifexAsset {
  id?: string;
  asset_code: string;
  asset_name: string;
  description: string;
  category: string;
  
  // Specifications
  manufacturer?: string;
  model?: string;
  serial_number?: string;
  
  // Financial
  purchase_cost?: number;
  current_value?: number;
  depreciation_rate?: number;
  
  // Inventory
  quantity_available?: number;
  unit_of_measure: string;
  warehouse_location?: string;
  
  // Usage Tracking
  total_hours_used?: number;
  last_maintenance_date?: string;
  next_maintenance_due?: string;
  
  // Status
  asset_status: 'available' | 'in_use' | 'maintenance' | 'retired';
  
  // Metadata
  created_at: string;
  updated_at?: string;
  company_id: string;
}

export interface PontifexWorkTypeMapping {
  id?: string;
  work_type_code: string;
  work_type_name: string;
  description: string;
  category: string;
  
  // Pontifex-specific concrete work type
  concrete_work_type?: string; // Maps to ConcreteWorkType enum
  
  // Billing
  default_billing_rate?: number;
  requires_special_equipment: boolean;
  estimated_duration_minutes?: number;
  
  // Safety
  safety_requirements?: string;
  requires_dust_suppression: boolean;
  osha_compliance_required: boolean;
  silica_monitoring_required: boolean;
  
  // Equipment
  default_equipment?: string[];
  calculation_factors?: any; // JSON with material density, cutting speed, etc.
  
  // Metadata
  created_at: string;
  updated_at?: string;
  company_id: string;
  is_active: boolean;
}

// Mapping configuration
export interface DSMPontifexMappingConfig {
  // Company information
  companyMapping: {
    defaultCompanyId: string;
    preserveCompanySettings: boolean;
  };
  
  // Field mappings
  jobFieldMappings: Record<keyof DSMJob, keyof PontifexWorkOrder | null>;
  employeeFieldMappings: Record<keyof DSMEmployee, keyof PontifexEmployee | null>;
  customerFieldMappings: Record<keyof DSMCustomer, keyof PontifexCustomer | null>;
  timeEntryFieldMappings: Record<keyof DSMTimeEntry, keyof PontifexTimeEntry | null>;
  materialFieldMappings: Record<keyof DSMMaterial, keyof PontifexAsset | null>;
  workTypeFieldMappings: Record<keyof DSMWorkType, keyof PontifexWorkTypeMapping | null>;
  
  // Value mappings
  statusMappings: {
    jobStatus: Record<string, PontifexWorkOrder['status']>;
    employmentStatus: Record<string, PontifexEmployee['employment_status']>;
    customerStatus: Record<string, PontifexCustomer['customer_status']>;
    timeEntryStatus: Record<string, PontifexTimeEntry['entry_status']>;
  };
  
  // DSM to Pontifex work type mappings
  workTypeMappings: Record<string, string>; // DSM WorkType -> Pontifex ConcreteWorkType
  
  // Custom field handling
  customFieldMappings: {
    preserveCustomFields: boolean;
    customFieldPrefix: string;
    mapToStandardFields: Record<string, string>; // customField -> standardField
  };
  
  // Data transformation rules
  transformationRules: {
    dateFormat: string;
    currencySymbol: string;
    defaultTimezone: string;
    phoneNumberFormat: string;
  };
}

export class DSMPontifexMapper {
  private config: DSMPontifexMappingConfig;

  constructor(config?: Partial<DSMPontifexMappingConfig>) {
    this.config = {
      // Default configuration
      companyMapping: {
        defaultCompanyId: '',
        preserveCompanySettings: true
      },
      
      jobFieldMappings: {
        JobID: null, // Will be auto-generated
        JobNumber: 'work_order_number',
        JobName: 'job_title',
        CustomerID: 'customer_id',
        CustomerName: null, // Will lookup customer_id
        ProjectManager: 'project_manager_id',
        JobDescription: 'description',
        JobType: 'work_type',
        JobStatus: 'status',
        Priority: 'priority',
        DateCreated: 'created_at',
        DateStarted: 'actual_start_date',
        DateCompleted: 'actual_completion_date',
        DateDue: 'scheduled_completion_date',
        EstimatedStartDate: 'scheduled_start_date',
        EstimatedCompletionDate: 'scheduled_completion_date',
        JobAddress: 'site_address',
        JobCity: 'site_city',
        JobState: 'site_state',
        JobZip: 'site_postal_code',
        JobCountry: 'site_country',
        Latitude: 'site_latitude',
        Longitude: 'site_longitude',
        EstimatedCost: 'estimated_cost',
        ActualCost: 'actual_cost',
        BillingRate: 'billing_rate',
        TotalBilled: 'total_billed',
        WorkType: 'work_type',
        Equipment: null, // Will map to equipment_required array
        MaterialsRequired: 'materials_required',
        SpecialInstructions: 'special_instructions',
        SafetyRequirements: 'safety_requirements',
        PermitsRequired: null, // Will map to permits_required array
        OSHARequired: 'osha_required',
        CustomField1: null, // Will map to custom_fields JSON
        CustomField2: null,
        CustomField3: null,
        CustomField4: null,
        CustomField5: null,
        TimeEntries: null, // Handled separately
        Materials: null, // Handled separately
        Photos: null, // Handled separately
        Notes: null // Handled separately
      },
      
      employeeFieldMappings: {
        EmployeeID: null, // Will be auto-generated
        EmployeeNumber: 'employee_number',
        FirstName: 'first_name',
        LastName: 'last_name',
        MiddleName: 'middle_name',
        Email: 'email',
        Phone: 'phone_primary',
        MobilePhone: 'phone_mobile',
        Address: 'address_line1',
        City: 'address_city',
        State: 'address_state',
        ZipCode: 'address_postal_code',
        HireDate: 'hire_date',
        TerminationDate: 'termination_date',
        EmploymentStatus: 'employment_status',
        Department: 'department',
        Position: 'job_title',
        Supervisor: 'supervisor_id',
        PayRate: 'base_pay_rate',
        PayType: 'pay_type',
        OvertimeRate: 'overtime_rate',
        Skills: 'skills',
        Certifications: 'certifications',
        LicenseNumber: 'license_number',
        LicenseExpiration: 'license_expiration_date',
        SafetyTraining: 'safety_training_records',
        LastSafetyUpdate: 'last_safety_training_date',
        AuthorizedEquipment: 'authorized_equipment',
        CustomField1: null, // Will map to custom_fields JSON
        CustomField2: null,
        CustomField3: null
      },
      
      customerFieldMappings: {
        CustomerID: null, // Will be auto-generated
        CustomerNumber: 'customer_number',
        CustomerName: 'customer_name',
        CompanyName: 'company_name',
        ContactPerson: 'primary_contact_name',
        Email: 'email',
        Phone: 'phone_primary',
        Fax: 'phone_fax',
        BillingAddress: 'billing_address_line1',
        BillingCity: 'billing_address_city',
        BillingState: 'billing_address_state',
        BillingZip: 'billing_address_postal_code',
        ShippingAddress: 'shipping_address_line1',
        ShippingCity: 'shipping_address_city',
        ShippingState: 'shipping_address_state',
        ShippingZip: 'shipping_address_postal_code',
        TaxID: 'tax_id',
        CreditLimit: 'credit_limit',
        PaymentTerms: 'payment_terms',
        CustomerStatus: 'customer_status',
        CustomField1: null, // Will map to custom_fields JSON
        CustomField2: null,
        CustomField3: null
      },
      
      timeEntryFieldMappings: {
        TimeEntryID: null, // Will be auto-generated
        EmployeeID: 'employee_id',
        JobID: 'work_order_id',
        Date: 'entry_date',
        StartTime: 'start_time',
        EndTime: 'end_time',
        TotalHours: 'total_hours',
        OvertimeHours: 'overtime_hours',
        WorkDescription: 'work_description',
        WorkType: 'work_type',
        Equipment: 'equipment_used',
        Location: 'work_location',
        BillableHours: 'billable_hours',
        PayRate: 'hourly_rate',
        BillingRate: 'billing_rate',
        Status: 'entry_status',
        ApprovedBy: 'approved_by',
        ApprovedDate: 'approved_at',
        Notes: 'notes'
      },
      
      materialFieldMappings: {
        MaterialID: null, // Will be auto-generated
        MaterialCode: 'asset_code',
        MaterialName: 'asset_name',
        Description: 'description',
        Category: 'category',
        QuantityOnHand: 'quantity_available',
        UnitOfMeasure: 'unit_of_measure',
        UnitCost: 'purchase_cost',
        SupplierID: null, // Not directly mapped
        SupplierName: null, // Will store in custom_fields
        SupplierPartNumber: null, // Will store in custom_fields
        JobID: null, // Usage tracked separately
        QuantityUsed: null, // Usage tracked separately
        DateUsed: null, // Usage tracked separately
        WarehouseLocation: 'warehouse_location',
        CustomField1: null, // Will map to custom_fields JSON
        CustomField2: null
      },
      
      workTypeFieldMappings: {
        WorkTypeID: null, // Will be auto-generated
        WorkTypeCode: 'work_type_code',
        WorkTypeName: 'work_type_name',
        Description: 'description',
        Category: 'category',
        DefaultBillingRate: 'default_billing_rate',
        RequiresSpecialEquipment: 'requires_special_equipment',
        SafetyRequirements: 'safety_requirements',
        EstimatedDuration: 'estimated_duration_minutes'
      },
      
      statusMappings: {
        jobStatus: {
          'Open': 'pending',
          'In Progress': 'in_progress',
          'Completed': 'completed',
          'Cancelled': 'cancelled',
          'On Hold': 'on_hold'
        },
        employmentStatus: {
          'Active': 'active',
          'Inactive': 'inactive',
          'Terminated': 'terminated',
          'On Leave': 'on_leave'
        },
        customerStatus: {
          'Active': 'active',
          'Inactive': 'inactive'
        },
        timeEntryStatus: {
          'Draft': 'draft',
          'Submitted': 'submitted',
          'Approved': 'approved',
          'Rejected': 'rejected'
        }
      },
      
      workTypeMappings: {
        'Core Drilling': 'core_drill',
        'Wall Sawing': 'wall_saw',
        'Slab Sawing': 'slab_saw',
        'Chain Sawing': 'chain_saw',
        'Ring Sawing': 'ring_saw',
        'Hand Sawing': 'hand_saw',
        'Breaking': 'break_remove',
        'Chipping': 'chipping',
        'Joint Sealing': 'joint_sealing',
        'Demolition': 'demolition'
      },
      
      customFieldMappings: {
        preserveCustomFields: true,
        customFieldPrefix: 'dsm_',
        mapToStandardFields: {}
      },
      
      transformationRules: {
        dateFormat: 'YYYY-MM-DD',
        currencySymbol: '$',
        defaultTimezone: 'UTC',
        phoneNumberFormat: 'US'
      },
      
      ...config
    };
  }

  /**
   * Map DSM job to Pontifex work order
   */
  mapJob(dsmJob: DSMJob, companyId: string, createdBy: string): PontifexWorkOrder {
    const workOrder: PontifexWorkOrder = {
      work_order_number: dsmJob.JobNumber,
      job_title: dsmJob.JobName,
      customer_id: this.mapCustomerId(dsmJob.CustomerID),
      description: dsmJob.JobDescription || '',
      work_type: this.mapWorkType(dsmJob.WorkType),
      status: this.mapJobStatus(dsmJob.JobStatus),
      priority: this.mapPriority(dsmJob.Priority),
      created_at: this.formatDate(dsmJob.DateCreated),
      site_address: dsmJob.JobAddress || '',
      site_city: dsmJob.JobCity || '',
      site_state: dsmJob.JobState || '',
      site_postal_code: dsmJob.JobZip || '',
      estimated_cost: dsmJob.EstimatedCost || 0,
      osha_required: dsmJob.OSHARequired || false,
      silica_monitoring_required: this.requiresSilicaMonitoring(dsmJob.WorkType),
      created_by: createdBy,
      company_id: companyId,
      work_specifications: []
    };

    // Map optional fields
    if (dsmJob.ProjectManager) {
      workOrder.project_manager_id = this.mapEmployeeId(dsmJob.ProjectManager);
    }
    
    if (dsmJob.DateStarted) {
      workOrder.actual_start_date = this.formatDate(dsmJob.DateStarted);
    }
    
    if (dsmJob.DateCompleted) {
      workOrder.actual_completion_date = this.formatDate(dsmJob.DateCompleted);
    }
    
    if (dsmJob.DateDue) {
      workOrder.scheduled_completion_date = this.formatDate(dsmJob.DateDue);
    }
    
    if (dsmJob.EstimatedStartDate) {
      workOrder.scheduled_start_date = this.formatDate(dsmJob.EstimatedStartDate);
    }

    if (dsmJob.ActualCost) {
      workOrder.actual_cost = dsmJob.ActualCost;
    }

    if (dsmJob.BillingRate) {
      workOrder.billing_rate = dsmJob.BillingRate;
    }

    if (dsmJob.TotalBilled) {
      workOrder.total_billed = dsmJob.TotalBilled;
    }

    if (dsmJob.Equipment && dsmJob.Equipment.length > 0) {
      workOrder.equipment_required = dsmJob.Equipment;
    }

    if (dsmJob.MaterialsRequired) {
      workOrder.materials_required = dsmJob.MaterialsRequired;
    }

    if (dsmJob.SpecialInstructions) {
      workOrder.special_instructions = dsmJob.SpecialInstructions;
    }

    if (dsmJob.SafetyRequirements) {
      workOrder.safety_requirements = dsmJob.SafetyRequirements;
    }

    if (dsmJob.PermitsRequired && dsmJob.PermitsRequired.length > 0) {
      workOrder.permits_required = dsmJob.PermitsRequired;
    }

    if (dsmJob.Latitude) {
      workOrder.site_latitude = dsmJob.Latitude;
    }

    if (dsmJob.Longitude) {
      workOrder.site_longitude = dsmJob.Longitude;
    }

    if (dsmJob.JobCountry) {
      workOrder.site_country = dsmJob.JobCountry;
    }

    // Map custom fields
    workOrder.custom_fields = this.mapCustomFields({
      CustomField1: dsmJob.CustomField1,
      CustomField2: dsmJob.CustomField2,
      CustomField3: dsmJob.CustomField3,
      CustomField4: dsmJob.CustomField4,
      CustomField5: dsmJob.CustomField5
    });

    // Create work specifications JSON
    workOrder.work_specifications = {
      originalWorkType: dsmJob.WorkType,
      jobType: dsmJob.JobType,
      estimatedDuration: this.calculateEstimatedDuration(dsmJob.WorkType),
      dustSuppressionRequired: this.requiresDustSuppression(dsmJob.WorkType),
      safetyLevel: this.calculateSafetyLevel(dsmJob.WorkType)
    };

    return workOrder;
  }

  /**
   * Map DSM employee to Pontifex employee
   */
  mapEmployee(dsmEmployee: DSMEmployee, companyId: string): PontifexEmployee {
    const employee: PontifexEmployee = {
      employee_number: dsmEmployee.EmployeeNumber,
      first_name: dsmEmployee.FirstName,
      last_name: dsmEmployee.LastName,
      hire_date: this.formatDate(dsmEmployee.HireDate),
      employment_status: this.mapEmploymentStatus(dsmEmployee.EmploymentStatus),
      job_title: dsmEmployee.Position || 'Worker',
      base_pay_rate: dsmEmployee.PayRate || 0,
      pay_type: this.mapPayType(dsmEmployee.PayType),
      created_at: new Date().toISOString(),
      company_id: companyId
    };

    // Map optional fields
    if (dsmEmployee.MiddleName) {
      employee.middle_name = dsmEmployee.MiddleName;
    }

    if (dsmEmployee.Email) {
      employee.email = dsmEmployee.Email;
    }

    if (dsmEmployee.Phone) {
      employee.phone_primary = this.formatPhoneNumber(dsmEmployee.Phone);
    }

    if (dsmEmployee.MobilePhone) {
      employee.phone_mobile = this.formatPhoneNumber(dsmEmployee.MobilePhone);
    }

    if (dsmEmployee.Address) {
      employee.address_line1 = dsmEmployee.Address;
    }

    if (dsmEmployee.City) {
      employee.address_city = dsmEmployee.City;
    }

    if (dsmEmployee.State) {
      employee.address_state = dsmEmployee.State;
    }

    if (dsmEmployee.ZipCode) {
      employee.address_postal_code = dsmEmployee.ZipCode;
    }

    if (dsmEmployee.TerminationDate) {
      employee.termination_date = this.formatDate(dsmEmployee.TerminationDate);
    }

    if (dsmEmployee.Department) {
      employee.department = dsmEmployee.Department;
    }

    if (dsmEmployee.Supervisor) {
      employee.supervisor_id = this.mapEmployeeId(dsmEmployee.Supervisor);
    }

    if (dsmEmployee.OvertimeRate) {
      employee.overtime_rate = dsmEmployee.OvertimeRate;
    }

    if (dsmEmployee.Skills && dsmEmployee.Skills.length > 0) {
      employee.skills = dsmEmployee.Skills;
    }

    if (dsmEmployee.Certifications && dsmEmployee.Certifications.length > 0) {
      employee.certifications = dsmEmployee.Certifications;
    }

    if (dsmEmployee.LicenseNumber) {
      employee.license_number = dsmEmployee.LicenseNumber;
    }

    if (dsmEmployee.LicenseExpiration) {
      employee.license_expiration_date = this.formatDate(dsmEmployee.LicenseExpiration);
    }

    if (dsmEmployee.SafetyTraining && dsmEmployee.SafetyTraining.length > 0) {
      employee.safety_training_records = dsmEmployee.SafetyTraining;
    }

    if (dsmEmployee.LastSafetyUpdate) {
      employee.last_safety_training_date = this.formatDate(dsmEmployee.LastSafetyUpdate);
    }

    if (dsmEmployee.AuthorizedEquipment && dsmEmployee.AuthorizedEquipment.length > 0) {
      employee.authorized_equipment = dsmEmployee.AuthorizedEquipment;
    }

    // Map custom fields
    employee.custom_fields = this.mapCustomFields({
      CustomField1: dsmEmployee.CustomField1,
      CustomField2: dsmEmployee.CustomField2,
      CustomField3: dsmEmployee.CustomField3
    });

    return employee;
  }

  /**
   * Map DSM customer to Pontifex customer
   */
  mapCustomer(dsmCustomer: DSMCustomer, companyId: string): PontifexCustomer {
    const customer: PontifexCustomer = {
      customer_number: dsmCustomer.CustomerNumber,
      customer_name: dsmCustomer.CustomerName,
      billing_address_line1: dsmCustomer.BillingAddress || '',
      billing_address_city: dsmCustomer.BillingCity || '',
      billing_address_state: dsmCustomer.BillingState || '',
      billing_address_postal_code: dsmCustomer.BillingZip || '',
      customer_status: this.mapCustomerStatus(dsmCustomer.CustomerStatus),
      created_at: new Date().toISOString(),
      company_id: companyId
    };

    // Map optional fields
    if (dsmCustomer.CompanyName) {
      customer.company_name = dsmCustomer.CompanyName;
    }

    if (dsmCustomer.ContactPerson) {
      customer.primary_contact_name = dsmCustomer.ContactPerson;
    }

    if (dsmCustomer.Email) {
      customer.email = dsmCustomer.Email;
    }

    if (dsmCustomer.Phone) {
      customer.phone_primary = this.formatPhoneNumber(dsmCustomer.Phone);
    }

    if (dsmCustomer.Fax) {
      customer.phone_fax = this.formatPhoneNumber(dsmCustomer.Fax);
    }

    if (dsmCustomer.ShippingAddress) {
      customer.shipping_address_line1 = dsmCustomer.ShippingAddress;
      customer.shipping_address_city = dsmCustomer.ShippingCity || '';
      customer.shipping_address_state = dsmCustomer.ShippingState || '';
      customer.shipping_address_postal_code = dsmCustomer.ShippingZip || '';
    }

    if (dsmCustomer.TaxID) {
      customer.tax_id = dsmCustomer.TaxID;
    }

    if (dsmCustomer.CreditLimit) {
      customer.credit_limit = dsmCustomer.CreditLimit;
    }

    if (dsmCustomer.PaymentTerms) {
      customer.payment_terms = dsmCustomer.PaymentTerms;
    }

    // Map custom fields
    customer.custom_fields = this.mapCustomFields({
      CustomField1: dsmCustomer.CustomField1,
      CustomField2: dsmCustomer.CustomField2,
      CustomField3: dsmCustomer.CustomField3
    });

    return customer;
  }

  /**
   * Map DSM time entry to Pontifex time entry
   */
  mapTimeEntry(dsmTimeEntry: DSMTimeEntry, companyId: string, createdBy: string): PontifexTimeEntry {
    const timeEntry: PontifexTimeEntry = {
      employee_id: this.mapEmployeeId(dsmTimeEntry.EmployeeID),
      work_order_id: this.mapJobId(dsmTimeEntry.JobID),
      entry_date: this.formatDate(dsmTimeEntry.Date),
      start_time: dsmTimeEntry.StartTime,
      end_time: dsmTimeEntry.EndTime,
      total_hours: dsmTimeEntry.TotalHours,
      work_description: dsmTimeEntry.WorkDescription || '',
      entry_status: this.mapTimeEntryStatus(dsmTimeEntry.Status),
      created_at: new Date().toISOString(),
      created_by: createdBy,
      company_id: companyId
    };

    // Map optional fields
    if (dsmTimeEntry.OvertimeHours) {
      timeEntry.overtime_hours = dsmTimeEntry.OvertimeHours;
    }

    if (dsmTimeEntry.WorkType) {
      timeEntry.work_type = this.mapWorkType(dsmTimeEntry.WorkType);
    }

    if (dsmTimeEntry.Equipment) {
      timeEntry.equipment_used = dsmTimeEntry.Equipment;
    }

    if (dsmTimeEntry.Location) {
      timeEntry.work_location = dsmTimeEntry.Location;
    }

    if (dsmTimeEntry.BillableHours) {
      timeEntry.billable_hours = dsmTimeEntry.BillableHours;
    }

    if (dsmTimeEntry.PayRate) {
      timeEntry.hourly_rate = dsmTimeEntry.PayRate;
    }

    if (dsmTimeEntry.BillingRate) {
      timeEntry.billing_rate = dsmTimeEntry.BillingRate;
    }

    if (dsmTimeEntry.ApprovedBy) {
      timeEntry.approved_by = this.mapEmployeeId(dsmTimeEntry.ApprovedBy);
    }

    if (dsmTimeEntry.ApprovedDate) {
      timeEntry.approved_at = this.formatDate(dsmTimeEntry.ApprovedDate);
    }

    if (dsmTimeEntry.Notes) {
      timeEntry.notes = dsmTimeEntry.Notes;
    }

    return timeEntry;
  }

  /**
   * Map DSM material to Pontifex asset
   */
  mapMaterial(dsmMaterial: DSMMaterial, companyId: string): PontifexAsset {
    const asset: PontifexAsset = {
      asset_code: dsmMaterial.MaterialCode,
      asset_name: dsmMaterial.MaterialName,
      description: dsmMaterial.Description || '',
      category: dsmMaterial.Category || 'Material',
      unit_of_measure: dsmMaterial.UnitOfMeasure || 'each',
      asset_status: 'available',
      created_at: new Date().toISOString(),
      company_id: companyId
    };

    // Map optional fields
    if (dsmMaterial.UnitCost) {
      asset.purchase_cost = dsmMaterial.UnitCost;
      asset.current_value = dsmMaterial.UnitCost;
    }

    if (dsmMaterial.QuantityOnHand) {
      asset.quantity_available = dsmMaterial.QuantityOnHand;
    }

    if (dsmMaterial.WarehouseLocation) {
      asset.warehouse_location = dsmMaterial.WarehouseLocation;
    }

    // Map supplier information to custom fields
    const supplierInfo: any = {};
    if (dsmMaterial.SupplierName) {
      supplierInfo.supplier_name = dsmMaterial.SupplierName;
    }
    if (dsmMaterial.SupplierPartNumber) {
      supplierInfo.supplier_part_number = dsmMaterial.SupplierPartNumber;
    }

    // Map custom fields including supplier info
    (asset as any).custom_fields = {
      ...this.mapCustomFields({
        CustomField1: dsmMaterial.CustomField1,
        CustomField2: dsmMaterial.CustomField2
      }),
      ...supplierInfo
    };

    return asset;
  }

  /**
   * Map DSM work type to Pontifex work type
   */
  mapWorkTypeDefinition(dsmWorkType: DSMWorkType, companyId: string): PontifexWorkTypeMapping {
    const workType: PontifexWorkTypeMapping = {
      work_type_code: dsmWorkType.WorkTypeCode,
      work_type_name: dsmWorkType.WorkTypeName,
      description: dsmWorkType.Description || '',
      category: dsmWorkType.Category || 'General',
      requires_special_equipment: dsmWorkType.RequiresSpecialEquipment || false,
      requires_dust_suppression: this.requiresDustSuppression(dsmWorkType.WorkTypeName),
      osha_compliance_required: true, // Default to true for safety
      silica_monitoring_required: this.requiresSilicaMonitoring(dsmWorkType.WorkTypeName),
      is_active: true,
      created_at: new Date().toISOString(),
      company_id: companyId
    };

    // Map to Pontifex concrete work type
    workType.concrete_work_type = this.config.workTypeMappings[dsmWorkType.WorkTypeName] || undefined;

    if (dsmWorkType.DefaultBillingRate) {
      workType.default_billing_rate = dsmWorkType.DefaultBillingRate;
    }

    if (dsmWorkType.EstimatedDuration) {
      workType.estimated_duration_minutes = dsmWorkType.EstimatedDuration;
    }

    if (dsmWorkType.SafetyRequirements) {
      workType.safety_requirements = dsmWorkType.SafetyRequirements;
    }

    // Set default equipment based on concrete work type
    if (workType.concrete_work_type) {
      workType.default_equipment = this.getDefaultEquipmentForWorkType(workType.concrete_work_type);
      workType.calculation_factors = this.getCalculationFactorsForWorkType(workType.concrete_work_type);
    }

    return workType;
  }

  // Helper methods for mapping

  private mapJobStatus(dsmStatus: string): PontifexWorkOrder['status'] {
    return this.config.statusMappings.jobStatus[dsmStatus] || 'pending';
  }

  private mapEmploymentStatus(dsmStatus: string): PontifexEmployee['employment_status'] {
    return this.config.statusMappings.employmentStatus[dsmStatus] || 'active';
  }

  private mapCustomerStatus(dsmStatus: string): PontifexCustomer['customer_status'] {
    return this.config.statusMappings.customerStatus[dsmStatus] || 'active';
  }

  private mapTimeEntryStatus(dsmStatus: string): PontifexTimeEntry['entry_status'] {
    return this.config.statusMappings.timeEntryStatus[dsmStatus] || 'draft';
  }

  private mapPriority(dsmPriority: string): PontifexWorkOrder['priority'] {
    const priorityMap: Record<string, PontifexWorkOrder['priority']> = {
      'Low': 'low',
      'Medium': 'medium',
      'High': 'high',
      'Critical': 'critical'
    };
    return priorityMap[dsmPriority] || 'medium';
  }

  private mapPayType(dsmPayType: string): PontifexEmployee['pay_type'] {
    const payTypeMap: Record<string, PontifexEmployee['pay_type']> = {
      'Hourly': 'hourly',
      'Salary': 'salary',
      'Contract': 'contract'
    };
    return payTypeMap[dsmPayType] || 'hourly';
  }

  private mapWorkType(dsmWorkType: string): string {
    return this.config.workTypeMappings[dsmWorkType] || dsmWorkType.toLowerCase().replace(/\s+/g, '_');
  }

  private mapCustomerId(dsmCustomerId: string): string {
    // This would typically involve a lookup table or API call
    // For now, return the original ID with a prefix
    return `migrated_${dsmCustomerId}`;
  }

  private mapEmployeeId(dsmEmployeeId: string): string {
    // This would typically involve a lookup table or API call
    // For now, return the original ID with a prefix
    return `migrated_${dsmEmployeeId}`;
  }

  private mapJobId(dsmJobId: string): string {
    // This would typically involve a lookup table or API call
    // For now, return the original ID with a prefix
    return `migrated_${dsmJobId}`;
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
  }

  private formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber) return '';
    
    // Basic phone number formatting - remove non-digits and format
    const digits = phoneNumber.replace(/\D/g, '');
    
    if (digits.length === 10) {
      return `(${digits.substr(0, 3)}) ${digits.substr(3, 3)}-${digits.substr(6, 4)}`;
    } else if (digits.length === 11 && digits[0] === '1') {
      return `+1 (${digits.substr(1, 3)}) ${digits.substr(4, 3)}-${digits.substr(7, 4)}`;
    }
    
    return phoneNumber; // Return original if can't format
  }

  private mapCustomFields(customFields: Record<string, string | undefined>): Record<string, any> {
    const mapped: Record<string, any> = {};
    
    if (!this.config.customFieldMappings.preserveCustomFields) {
      return mapped;
    }
    
    Object.entries(customFields).forEach(([key, value]) => {
      if (value && value.trim()) {
        // Check if there's a mapping to a standard field
        const standardField = this.config.customFieldMappings.mapToStandardFields[key];
        if (standardField) {
          mapped[standardField] = value;
        } else {
          // Store with prefix
          const prefixedKey = `${this.config.customFieldMappings.customFieldPrefix}${key}`;
          mapped[prefixedKey] = value;
        }
      }
    });
    
    return mapped;
  }

  private requiresDustSuppression(workType: string): boolean {
    const dustSuppressionRequired = [
      'Core Drilling', 'Wall Sawing', 'Slab Sawing', 'Chain Sawing', 
      'Ring Sawing', 'Hand Sawing', 'Breaking', 'Chipping', 'Demolition'
    ];
    return dustSuppressionRequired.some(type => workType.toLowerCase().includes(type.toLowerCase()));
  }

  private requiresSilicaMonitoring(workType: string): boolean {
    // All concrete cutting work typically requires silica monitoring
    return this.requiresDustSuppression(workType);
  }

  private calculateEstimatedDuration(workType: string): number {
    // Basic duration estimates in minutes
    const durationMap: Record<string, number> = {
      'Core Drilling': 60,
      'Wall Sawing': 120,
      'Slab Sawing': 90,
      'Chain Sawing': 180,
      'Ring Sawing': 45,
      'Hand Sawing': 30,
      'Breaking': 240,
      'Chipping': 120,
      'Joint Sealing': 30,
      'Demolition': 480
    };
    
    for (const [type, duration] of Object.entries(durationMap)) {
      if (workType.toLowerCase().includes(type.toLowerCase())) {
        return duration;
      }
    }
    
    return 60; // Default 1 hour
  }

  private calculateSafetyLevel(workType: string): 'low' | 'medium' | 'high' | 'critical' {
    const highRiskTypes = ['Demolition', 'Chain Sawing', 'Wall Sawing'];
    const mediumRiskTypes = ['Slab Sawing', 'Core Drilling', 'Breaking'];
    const lowRiskTypes = ['Joint Sealing', 'Hand Sawing', 'Chipping'];
    
    for (const type of highRiskTypes) {
      if (workType.toLowerCase().includes(type.toLowerCase())) {
        return 'critical';
      }
    }
    
    for (const type of mediumRiskTypes) {
      if (workType.toLowerCase().includes(type.toLowerCase())) {
        return 'high';
      }
    }
    
    for (const type of lowRiskTypes) {
      if (workType.toLowerCase().includes(type.toLowerCase())) {
        return 'medium';
      }
    }
    
    return 'medium'; // Default
  }

  private getDefaultEquipmentForWorkType(concreteWorkType: string): string[] {
    const equipmentMap: Record<string, string[]> = {
      'core_drill': ['Core Drill Rig', 'Diamond Core Bits', 'Water Supply'],
      'wall_saw': ['Wall Saw System', 'Diamond Blade', 'Track System', 'Water Supply'],
      'slab_saw': ['Floor Saw', 'Diamond Blade', 'Water Tank'],
      'chain_saw': ['Concrete Chain Saw', 'Diamond Chain', 'Water Supply'],
      'ring_saw': ['Ring Saw', 'Diamond Ring Blade', 'Dust Attachment'],
      'hand_saw': ['Handheld Saw', 'Diamond Blade', 'Vacuum Attachment'],
      'break_remove': ['Breaker', 'Jackhammer', 'Dust Vacuum'],
      'chipping': ['Chipping Hammer', 'Chisel Bits', 'Dust Vacuum'],
      'joint_sealing': ['Joint Cleaning Tools', 'Backer Rod', 'Sealant Gun'],
      'demolition': ['Demolition Robot', 'Breaker', 'Crusher', 'Water Cannon']
    };
    
    return equipmentMap[concreteWorkType] || ['Standard Equipment'];
  }

  private getCalculationFactorsForWorkType(concreteWorkType: string): any {
    const factorsMap: Record<string, any> = {
      'core_drill': {
        materialDensity: 2400,
        cuttingSpeed: 25,
        bitWearRate: 0.5,
        waterUsage: 3,
        powerRequirement: 2.2
      },
      'wall_saw': {
        materialDensity: 2400,
        cuttingSpeed: 0.5,
        bitWearRate: 0.3,
        waterUsage: 8,
        powerRequirement: 15
      },
      'slab_saw': {
        materialDensity: 2400,
        cuttingSpeed: 1.2,
        bitWearRate: 0.4,
        waterUsage: 12,
        powerRequirement: 35
      }
      // Add more as needed
    };
    
    return factorsMap[concreteWorkType] || {
      materialDensity: 2400,
      cuttingSpeed: 1.0,
      bitWearRate: 0.5,
      waterUsage: 5,
      powerRequirement: 5
    };
  }
}

// Export singleton instance with default configuration
export const dsmPontifexMapper = new DSMPontifexMapper();