/**
 * DSM Migration Service
 * Comprehensive utility for migrating DSM Software data to Pontifex platform
 */

import { 
  DSMExportFile, 
  DSMMigrationStatus, 
  DSMMigrationOptions, 
  DSMMigrationError, 
  DSMMigrationWarning,
  DSMValidationResult
} from '@/types/dsm-data';
import { dsmParser } from './dsm-parser';
import { 
  dsmPontifexMapper, 
  DSMPontifexMapper, 
  PontifexWorkOrder, 
  PontifexEmployee, 
  PontifexCustomer, 
  PontifexTimeEntry, 
  PontifexAsset, 
  PontifexWorkTypeMapping 
} from './dsm-pontifex-mapper';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export class DSMMigrationService {
  private supabase;
  private mapper: DSMPontifexMapper;
  private migrationStatus: DSMMigrationStatus | null = null;
  private onProgressUpdate?: (status: DSMMigrationStatus) => void;

  constructor(customMapper?: DSMPontifexMapper) {
    this.supabase = createClientComponentClient();
    this.mapper = customMapper || dsmPontifexMapper;
  }

  /**
   * Start a complete migration from DSM export file
   */
  async startMigration(
    file: File, 
    options: DSMMigrationOptions,
    companyId: string,
    userId: string,
    onProgress?: (status: DSMMigrationStatus) => void
  ): Promise<DSMMigrationStatus> {
    
    this.onProgressUpdate = onProgress;
    
    // Initialize migration status
    const startTime = new Date();
    this.migrationStatus = {
      migrationId: this.generateMigrationId(),
      startDate: startTime,
      status: 'in_progress',
      totalRecords: 0,
      processedRecords: 0,
      successfulRecords: 0,
      failedRecords: 0,
      skippedRecords: 0,
      progress: 0,
      currentStep: 'Initializing migration',
      recordsProcessed: 0,
      successCount: 0,
      errorCount: 0,
      warningCount: 0,
      startTime: startTime,
      tables: {
        jobs: { total: 0, processed: 0, successful: 0, failed: 0 },
        employees: { total: 0, processed: 0, successful: 0, failed: 0 },
        customers: { total: 0, processed: 0, successful: 0, failed: 0 },
        timeEntries: { total: 0, processed: 0, successful: 0, failed: 0 },
        materials: { total: 0, processed: 0, successful: 0, failed: 0 },
        workTypes: { total: 0, processed: 0, successful: 0, failed: 0 }
      },
      errors: [],
      warnings: [],
      migrationOptions: options
    };

    try {
      // Step 1: Parse the export file
      this.updateStatus('Parsing DSM export file...');
      const exportData = await dsmParser.parseFile(file);
      
      // Step 2: Validate the data
      this.updateStatus('Validating data...');
      const validationResult = dsmParser.validateData(exportData);
      
      if (!validationResult.isValid && !options.skipDuplicates) {
        throw new Error(`Data validation failed: ${validationResult.errors.join(', ')}`);
      }

      // Add validation warnings
      validationResult.warnings.forEach(warning => {
        this.addWarning('validation', 'general', 'data_loss', warning);
      });

      // Step 3: Calculate total records
      this.calculateTotalRecords(exportData);
      
      // Step 4: Create backup if requested
      if (options.createBackup) {
        this.updateStatus('Creating backup...');
        await this.createBackup(companyId);
      }

      // Step 5: Migrate data in order (to handle dependencies)
      if (options.migrateCustomers && exportData.customers) {
        await this.migrateCustomers(exportData.customers, companyId, userId, options);
      }

      if (options.migrateEmployees && exportData.employees) {
        await this.migrateEmployees(exportData.employees, companyId, userId, options);
      }

      if (options.migrateWorkTypes && exportData.workTypes) {
        await this.migrateWorkTypes(exportData.workTypes, companyId, userId, options);
      }

      if (options.migrateMaterials && exportData.materials) {
        await this.migrateMaterials(exportData.materials, companyId, userId, options);
      }

      if (options.migrateJobs && exportData.jobs) {
        await this.migrateJobs(exportData.jobs, companyId, userId, options);
      }

      if (options.migrateTimeEntries && exportData.timeEntries) {
        await this.migrateTimeEntries(exportData.timeEntries, companyId, userId, options);
      }

      // Step 6: Finalize migration
      this.migrationStatus.endDate = new Date();
      this.migrationStatus.status = this.migrationStatus.failedRecords > 0 ? 'completed' : 'completed';
      this.updateStatus('Migration completed successfully');

    } catch (error) {
      this.migrationStatus.endDate = new Date();
      this.migrationStatus.status = 'failed';
      this.addError('migration', 'general', 'unknown', error instanceof Error ? error.message : 'Unknown error');
      this.updateStatus(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return this.migrationStatus;
  }

  /**
   * Migrate customers
   */
  private async migrateCustomers(
    customers: any[], 
    companyId: string, 
    userId: string, 
    options: DSMMigrationOptions
  ): Promise<void> {
    this.migrationStatus!.tables.customers.total = customers.length;
    this.updateStatus(`Migrating ${customers.length} customers...`);

    for (const [index, dsmCustomer] of customers.entries()) {
      try {
        // Map DSM customer to Pontifex format
        const pontifexCustomer = this.mapper.mapCustomer(dsmCustomer, companyId);
        
        // Check for duplicates
        if (options.skipDuplicates) {
          const existing = await this.findExistingCustomer(pontifexCustomer);
          if (existing) {
            this.migrationStatus!.skippedRecords++;
            this.migrationStatus!.tables.customers.processed++;
            this.addWarning(dsmCustomer.CustomerID, 'customers', 'default_value', 
              `Customer with number ${pontifexCustomer.customer_number} already exists - skipped`);
            continue;
          }
        }

        // Insert into database
        const { data, error } = await this.supabase
          .from('customers')
          .insert(pontifexCustomer)
          .select();

        if (error) {
          throw error;
        }

        // Store ID mapping for later use
        await this.storeIdMapping('customer', dsmCustomer.CustomerID, data[0].id);

        this.migrationStatus!.successfulRecords++;
        this.migrationStatus!.tables.customers.successful++;

      } catch (error) {
        this.migrationStatus!.failedRecords++;
        this.migrationStatus!.tables.customers.failed++;
        this.addError(dsmCustomer.CustomerID, 'customers', 'database', 
          error instanceof Error ? error.message : 'Unknown error');

        if (this.migrationStatus!.errors.length >= options.maxErrors) {
          throw new Error(`Maximum error limit (${options.maxErrors}) reached`);
        }
      }

      this.migrationStatus!.processedRecords++;
      this.migrationStatus!.tables.customers.processed++;
      this.notifyProgress();
    }
  }

  /**
   * Migrate employees
   */
  private async migrateEmployees(
    employees: any[], 
    companyId: string, 
    userId: string, 
    options: DSMMigrationOptions
  ): Promise<void> {
    this.migrationStatus!.tables.employees.total = employees.length;
    this.updateStatus(`Migrating ${employees.length} employees...`);

    for (const [index, dsmEmployee] of employees.entries()) {
      try {
        // Map DSM employee to Pontifex format
        const pontifexEmployee = this.mapper.mapEmployee(dsmEmployee, companyId);
        
        // Check for duplicates
        if (options.skipDuplicates) {
          const existing = await this.findExistingEmployee(pontifexEmployee);
          if (existing) {
            this.migrationStatus!.skippedRecords++;
            this.migrationStatus!.tables.employees.processed++;
            this.addWarning(dsmEmployee.EmployeeID, 'employees', 'default_value', 
              `Employee with number ${pontifexEmployee.employee_number} already exists - skipped`);
            continue;
          }
        }

        // Insert into database
        const { data, error } = await this.supabase
          .from('employees')
          .insert(pontifexEmployee)
          .select();

        if (error) {
          throw error;
        }

        // Store ID mapping for later use
        await this.storeIdMapping('employee', dsmEmployee.EmployeeID, data[0].id);

        this.migrationStatus!.successfulRecords++;
        this.migrationStatus!.tables.employees.successful++;

      } catch (error) {
        this.migrationStatus!.failedRecords++;
        this.migrationStatus!.tables.employees.failed++;
        this.addError(dsmEmployee.EmployeeID, 'employees', 'database', 
          error instanceof Error ? error.message : 'Unknown error');

        if (this.migrationStatus!.errors.length >= options.maxErrors) {
          throw new Error(`Maximum error limit (${options.maxErrors}) reached`);
        }
      }

      this.migrationStatus!.processedRecords++;
      this.migrationStatus!.tables.employees.processed++;
      this.notifyProgress();
    }
  }

  /**
   * Migrate work types
   */
  private async migrateWorkTypes(
    workTypes: any[], 
    companyId: string, 
    userId: string, 
    options: DSMMigrationOptions
  ): Promise<void> {
    this.migrationStatus!.tables.workTypes.total = workTypes.length;
    this.updateStatus(`Migrating ${workTypes.length} work types...`);

    for (const [index, dsmWorkType] of workTypes.entries()) {
      try {
        // Map DSM work type to Pontifex format
        const pontifexWorkType = this.mapper.mapWorkTypeDefinition(dsmWorkType, companyId);
        
        // Check for duplicates
        if (options.skipDuplicates) {
          const existing = await this.findExistingWorkType(pontifexWorkType);
          if (existing) {
            this.migrationStatus!.skippedRecords++;
            this.migrationStatus!.tables.workTypes.processed++;
            this.addWarning(dsmWorkType.WorkTypeID, 'workTypes', 'default_value', 
              `Work type with code ${pontifexWorkType.work_type_code} already exists - skipped`);
            continue;
          }
        }

        // Insert into database
        const { data, error } = await this.supabase
          .from('work_type_mappings')
          .insert(pontifexWorkType)
          .select();

        if (error) {
          throw error;
        }

        // Store ID mapping for later use
        await this.storeIdMapping('workType', dsmWorkType.WorkTypeID, data[0].id);

        this.migrationStatus!.successfulRecords++;
        this.migrationStatus!.tables.workTypes.successful++;

      } catch (error) {
        this.migrationStatus!.failedRecords++;
        this.migrationStatus!.tables.workTypes.failed++;
        this.addError(dsmWorkType.WorkTypeID, 'workTypes', 'database', 
          error instanceof Error ? error.message : 'Unknown error');

        if (this.migrationStatus!.errors.length >= options.maxErrors) {
          throw new Error(`Maximum error limit (${options.maxErrors}) reached`);
        }
      }

      this.migrationStatus!.processedRecords++;
      this.migrationStatus!.tables.workTypes.processed++;
      this.notifyProgress();
    }
  }

  /**
   * Migrate materials/assets
   */
  private async migrateMaterials(
    materials: any[], 
    companyId: string, 
    userId: string, 
    options: DSMMigrationOptions
  ): Promise<void> {
    this.migrationStatus!.tables.materials.total = materials.length;
    this.updateStatus(`Migrating ${materials.length} materials/assets...`);

    for (const [index, dsmMaterial] of materials.entries()) {
      try {
        // Map DSM material to Pontifex format
        const pontifexAsset = this.mapper.mapMaterial(dsmMaterial, companyId);
        
        // Check for duplicates
        if (options.skipDuplicates) {
          const existing = await this.findExistingAsset(pontifexAsset);
          if (existing) {
            this.migrationStatus!.skippedRecords++;
            this.migrationStatus!.tables.materials.processed++;
            this.addWarning(dsmMaterial.MaterialID, 'materials', 'default_value', 
              `Asset with code ${pontifexAsset.asset_code} already exists - skipped`);
            continue;
          }
        }

        // Insert into database
        const { data, error } = await this.supabase
          .from('assets')
          .insert(pontifexAsset)
          .select();

        if (error) {
          throw error;
        }

        // Store ID mapping for later use
        await this.storeIdMapping('material', dsmMaterial.MaterialID, data[0].id);

        this.migrationStatus!.successfulRecords++;
        this.migrationStatus!.tables.materials.successful++;

      } catch (error) {
        this.migrationStatus!.failedRecords++;
        this.migrationStatus!.tables.materials.failed++;
        this.addError(dsmMaterial.MaterialID, 'materials', 'database', 
          error instanceof Error ? error.message : 'Unknown error');

        if (this.migrationStatus!.errors.length >= options.maxErrors) {
          throw new Error(`Maximum error limit (${options.maxErrors}) reached`);
        }
      }

      this.migrationStatus!.processedRecords++;
      this.migrationStatus!.tables.materials.processed++;
      this.notifyProgress();
    }
  }

  /**
   * Migrate jobs/work orders
   */
  private async migrateJobs(
    jobs: any[], 
    companyId: string, 
    userId: string, 
    options: DSMMigrationOptions
  ): Promise<void> {
    this.migrationStatus!.tables.jobs.total = jobs.length;
    this.updateStatus(`Migrating ${jobs.length} jobs...`);

    for (const [index, dsmJob] of jobs.entries()) {
      try {
        // Map DSM job to Pontifex format
        const pontifexWorkOrder = this.mapper.mapJob(dsmJob, companyId, userId);
        
        // Resolve customer ID
        if (dsmJob.CustomerID) {
          const customerId = await this.resolveIdMapping('customer', dsmJob.CustomerID);
          if (customerId) {
            pontifexWorkOrder.customer_id = customerId;
          } else {
            this.addWarning(dsmJob.JobID, 'jobs', 'data_loss', 
              `Customer ID ${dsmJob.CustomerID} not found - using placeholder`);
            pontifexWorkOrder.customer_id = await this.createPlaceholderCustomer(dsmJob.CustomerName, companyId);
          }
        }

        // Resolve project manager ID
        if (dsmJob.ProjectManager) {
          const employeeId = await this.resolveIdMapping('employee', dsmJob.ProjectManager);
          if (employeeId) {
            pontifexWorkOrder.project_manager_id = employeeId;
          } else {
            this.addWarning(dsmJob.JobID, 'jobs', 'data_loss', 
              `Project manager ${dsmJob.ProjectManager} not found - field will be empty`);
            pontifexWorkOrder.project_manager_id = undefined;
          }
        }

        // Check for duplicates
        if (options.skipDuplicates) {
          const existing = await this.findExistingWorkOrder(pontifexWorkOrder);
          if (existing) {
            this.migrationStatus!.skippedRecords++;
            this.migrationStatus!.tables.jobs.processed++;
            this.addWarning(dsmJob.JobID, 'jobs', 'default_value', 
              `Work order with number ${pontifexWorkOrder.work_order_number} already exists - skipped`);
            continue;
          }
        }

        // Insert into database
        const { data, error } = await this.supabase
          .from('work_orders')
          .insert(pontifexWorkOrder)
          .select();

        if (error) {
          throw error;
        }

        // Store ID mapping for later use
        await this.storeIdMapping('job', dsmJob.JobID, data[0].id);

        this.migrationStatus!.successfulRecords++;
        this.migrationStatus!.tables.jobs.successful++;

      } catch (error) {
        this.migrationStatus!.failedRecords++;
        this.migrationStatus!.tables.jobs.failed++;
        this.addError(dsmJob.JobID, 'jobs', 'database', 
          error instanceof Error ? error.message : 'Unknown error');

        if (this.migrationStatus!.errors.length >= options.maxErrors) {
          throw new Error(`Maximum error limit (${options.maxErrors}) reached`);
        }
      }

      this.migrationStatus!.processedRecords++;
      this.migrationStatus!.tables.jobs.processed++;
      this.notifyProgress();
    }
  }

  /**
   * Migrate time entries
   */
  private async migrateTimeEntries(
    timeEntries: any[], 
    companyId: string, 
    userId: string, 
    options: DSMMigrationOptions
  ): Promise<void> {
    this.migrationStatus!.tables.timeEntries.total = timeEntries.length;
    this.updateStatus(`Migrating ${timeEntries.length} time entries...`);

    for (const [index, dsmTimeEntry] of timeEntries.entries()) {
      try {
        // Map DSM time entry to Pontifex format
        const pontifexTimeEntry = this.mapper.mapTimeEntry(dsmTimeEntry, companyId, userId);
        
        // Resolve employee ID
        const employeeId = await this.resolveIdMapping('employee', dsmTimeEntry.EmployeeID);
        if (employeeId) {
          pontifexTimeEntry.employee_id = employeeId;
        } else {
          // Skip time entry if employee not found
          this.migrationStatus!.skippedRecords++;
          this.migrationStatus!.tables.timeEntries.processed++;
          this.addWarning(dsmTimeEntry.TimeEntryID, 'timeEntries', 'data_loss', 
            `Employee ID ${dsmTimeEntry.EmployeeID} not found - time entry skipped`);
          continue;
        }

        // Resolve work order ID
        const workOrderId = await this.resolveIdMapping('job', dsmTimeEntry.JobID);
        if (workOrderId) {
          pontifexTimeEntry.work_order_id = workOrderId;
        } else {
          // Skip time entry if job not found
          this.migrationStatus!.skippedRecords++;
          this.migrationStatus!.tables.timeEntries.processed++;
          this.addWarning(dsmTimeEntry.TimeEntryID, 'timeEntries', 'data_loss', 
            `Job ID ${dsmTimeEntry.JobID} not found - time entry skipped`);
          continue;
        }

        // Insert into database
        const { data, error } = await this.supabase
          .from('time_entries')
          .insert(pontifexTimeEntry)
          .select();

        if (error) {
          throw error;
        }

        this.migrationStatus!.successfulRecords++;
        this.migrationStatus!.tables.timeEntries.successful++;

      } catch (error) {
        this.migrationStatus!.failedRecords++;
        this.migrationStatus!.tables.timeEntries.failed++;
        this.addError(dsmTimeEntry.TimeEntryID, 'timeEntries', 'database', 
          error instanceof Error ? error.message : 'Unknown error');

        if (this.migrationStatus!.errors.length >= options.maxErrors) {
          throw new Error(`Maximum error limit (${options.maxErrors}) reached`);
        }
      }

      this.migrationStatus!.processedRecords++;
      this.migrationStatus!.tables.timeEntries.processed++;
      this.notifyProgress();
    }
  }

  // Helper methods

  private calculateTotalRecords(exportData: DSMExportFile): void {
    let total = 0;
    
    if (exportData.customers) total += exportData.customers.length;
    if (exportData.employees) total += exportData.employees.length;
    if (exportData.jobs) total += exportData.jobs.length;
    if (exportData.timeEntries) total += exportData.timeEntries.length;
    if (exportData.materials) total += exportData.materials.length;
    if (exportData.workTypes) total += exportData.workTypes.length;
    
    this.migrationStatus!.totalRecords = total;
  }

  private async createBackup(companyId: string): Promise<void> {
    // Create a snapshot of current data before migration
    const backupId = `backup_${Date.now()}`;
    
    // This would typically create database snapshots or export current data
    // For now, we'll just log the backup creation
    console.log(`Creating backup ${backupId} for company ${companyId}`);
    
    // In a real implementation, you might:
    // 1. Export current data to a backup location
    // 2. Create database snapshots
    // 3. Store backup metadata
  }

  private async findExistingCustomer(customer: PontifexCustomer): Promise<any> {
    const { data } = await this.supabase
      .from('customers')
      .select('id')
      .eq('customer_number', customer.customer_number)
      .eq('company_id', customer.company_id)
      .single();
    
    return data;
  }

  private async findExistingEmployee(employee: PontifexEmployee): Promise<any> {
    const { data } = await this.supabase
      .from('employees')
      .select('id')
      .eq('employee_number', employee.employee_number)
      .eq('company_id', employee.company_id)
      .single();
    
    return data;
  }

  private async findExistingWorkOrder(workOrder: PontifexWorkOrder): Promise<any> {
    const { data } = await this.supabase
      .from('work_orders')
      .select('id')
      .eq('work_order_number', workOrder.work_order_number)
      .eq('company_id', workOrder.company_id)
      .single();
    
    return data;
  }

  private async findExistingAsset(asset: PontifexAsset): Promise<any> {
    const { data } = await this.supabase
      .from('assets')
      .select('id')
      .eq('asset_code', asset.asset_code)
      .eq('company_id', asset.company_id)
      .single();
    
    return data;
  }

  private async findExistingWorkType(workType: PontifexWorkTypeMapping): Promise<any> {
    const { data } = await this.supabase
      .from('work_type_mappings')
      .select('id')
      .eq('work_type_code', workType.work_type_code)
      .eq('company_id', workType.company_id)
      .single();
    
    return data;
  }

  private async storeIdMapping(type: string, dsmId: string, pontifexId: string): Promise<void> {
    // Store ID mappings for later reference
    const mapping = {
      migration_id: this.migrationStatus!.migrationId,
      dsm_type: type,
      dsm_id: dsmId,
      pontifex_id: pontifexId,
      created_at: new Date().toISOString()
    };

    await this.supabase
      .from('dsm_id_mappings')
      .insert(mapping);
  }

  private async resolveIdMapping(type: string, dsmId: string): Promise<string | null> {
    const { data } = await this.supabase
      .from('dsm_id_mappings')
      .select('pontifex_id')
      .eq('migration_id', this.migrationStatus!.migrationId)
      .eq('dsm_type', type)
      .eq('dsm_id', dsmId)
      .single();

    return data?.pontifex_id || null;
  }

  private async createPlaceholderCustomer(customerName: string, companyId: string): Promise<string> {
    const placeholderCustomer: PontifexCustomer = {
      customer_number: `MIGRATED_${Date.now()}`,
      customer_name: customerName || 'Unknown Customer',
      billing_address_line1: 'Address not available',
      billing_address_city: 'Unknown',
      billing_address_state: 'Unknown',
      billing_address_postal_code: '00000',
      customer_status: 'active',
      created_at: new Date().toISOString(),
      company_id: companyId,
      custom_fields: {
        migration_note: 'Created as placeholder during DSM migration'
      }
    };

    const { data, error } = await this.supabase
      .from('customers')
      .insert(placeholderCustomer)
      .select('id')
      .single();

    if (error) {
      throw error;
    }

    return data.id;
  }

  private updateStatus(message: string): void {
    console.log(`Migration: ${message}`);
  }

  private notifyProgress(): void {
    if (this.onProgressUpdate && this.migrationStatus) {
      this.onProgressUpdate(this.migrationStatus);
    }
  }

  private addError(recordId: string, recordType: string, errorType: DSMMigrationError['errorType'], message: string): void {
    this.migrationStatus!.errors.push({
      recordId,
      recordType,
      errorType,
      errorMessage: message,
      suggestedFix: this.getSuggestedFix(errorType, message)
    });
  }

  private addWarning(recordId: string, recordType: string, warningType: DSMMigrationWarning['warningType'], message: string): void {
    this.migrationStatus!.warnings.push({
      recordId,
      recordType,
      warningType,
      warningMessage: message
    });
  }

  private getSuggestedFix(errorType: DSMMigrationError['errorType'], message: string): string | undefined {
    switch (errorType) {
      case 'validation':
        return 'Check data format and required fields';
      case 'duplicate':
        return 'Enable skip duplicates option or update existing records';
      case 'mapping':
        return 'Review field mappings and custom field configuration';
      case 'database':
        return 'Check database connectivity and permissions';
      default:
        return undefined;
    }
  }

  private generateMigrationId(): string {
    return `dsm_migration_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get migration status
   */
  getMigrationStatus(): DSMMigrationStatus {
    if (!this.migrationStatus) {
      throw new Error('No migration in progress');
    }
    return this.migrationStatus;
  }

  /**
   * Cancel ongoing migration
   */
  async cancelMigration(): Promise<void> {
    if (this.migrationStatus && this.migrationStatus.status === 'in_progress') {
      this.migrationStatus.status = 'cancelled';
      this.migrationStatus.endDate = new Date();
      this.updateStatus('Migration cancelled by user');
    }
  }

  /**
   * Validate migration before starting
   */
  async validateMigration(file: File, options: DSMMigrationOptions): Promise<DSMValidationResult> {
    const exportData = await dsmParser.parseFile(file);
    return dsmParser.validateData(exportData);
  }

  /**
   * Get migration summary report
   */
  generateMigrationReport(): string {
    if (!this.migrationStatus) {
      return 'No migration data available';
    }

    const status = this.migrationStatus;
    const duration = status.endDate ? 
      Math.round((status.endDate.getTime() - status.startDate.getTime()) / 1000) : 
      Math.round((Date.now() - status.startDate.getTime()) / 1000);

    return `
DSM Migration Report
==================
Migration ID: ${status.migrationId}
Status: ${status.status}
Duration: ${duration} seconds
Started: ${status.startDate.toLocaleString()}
${status.endDate ? `Completed: ${status.endDate.toLocaleString()}` : ''}

Summary:
- Total Records: ${status.totalRecords}
- Processed: ${status.processedRecords}
- Successful: ${status.successfulRecords}
- Failed: ${status.failedRecords}
- Skipped: ${status.skippedRecords}

By Table:
- Customers: ${status.tables.customers.successful}/${status.tables.customers.total} successful
- Employees: ${status.tables.employees.successful}/${status.tables.employees.total} successful
- Jobs: ${status.tables.jobs.successful}/${status.tables.jobs.total} successful
- Time Entries: ${status.tables.timeEntries.successful}/${status.tables.timeEntries.total} successful
- Materials: ${status.tables.materials.successful}/${status.tables.materials.total} successful
- Work Types: ${status.tables.workTypes.successful}/${status.tables.workTypes.total} successful

Errors: ${status.errors.length}
Warnings: ${status.warnings.length}

${status.errors.length > 0 ? `
Critical Errors:
${status.errors.slice(0, 10).map(error => `- ${error.recordType}[${error.recordId}]: ${error.errorMessage}`).join('\n')}
${status.errors.length > 10 ? `... and ${status.errors.length - 10} more errors` : ''}
` : ''}

${status.warnings.length > 0 ? `
Warnings:
${status.warnings.slice(0, 10).map(warning => `- ${warning.recordType}[${warning.recordId}]: ${warning.warningMessage}`).join('\n')}
${status.warnings.length > 10 ? `... and ${status.warnings.length - 10} more warnings` : ''}
` : ''}
`;
  }
}

// Export singleton instance
export const dsmMigrationService = new DSMMigrationService();