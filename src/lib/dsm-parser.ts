/**
 * DSM Data Parser
 * Handles parsing of DSM Software exports in various formats
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  DSMExportFile, 
  DSMExportFormat, 
  DSMJob, 
  DSMEmployee, 
  DSMCustomer,
  DSMTimeEntry,
  DSMMaterial,
  DSMWorkType,
  DSMCompanySettings,
  DSMValidationResult,
  DSMValidationRule
} from '@/types/dsm-data';

export class DSMDataParser {
  private validationRules: Record<string, DSMValidationRule[]> = {
    jobs: [
      { field: 'JobID', required: true, dataType: 'string', minLength: 1 },
      { field: 'JobNumber', required: true, dataType: 'string', minLength: 1 },
      { field: 'JobName', required: true, dataType: 'string', minLength: 1 },
      { field: 'CustomerName', required: true, dataType: 'string', minLength: 1 },
      { field: 'JobStatus', required: true, dataType: 'string', allowedValues: ['Open', 'In Progress', 'Completed', 'Cancelled', 'On Hold'] },
      { field: 'DateCreated', required: true, dataType: 'date' },
      { field: 'EstimatedCost', required: false, dataType: 'number' },
      { field: 'ActualCost', required: false, dataType: 'number' }
    ],
    employees: [
      { field: 'EmployeeID', required: true, dataType: 'string', minLength: 1 },
      { field: 'EmployeeNumber', required: true, dataType: 'string', minLength: 1 },
      { field: 'FirstName', required: true, dataType: 'string', minLength: 1 },
      { field: 'LastName', required: true, dataType: 'string', minLength: 1 },
      { field: 'Email', required: false, dataType: 'email' },
      { field: 'Phone', required: false, dataType: 'phone' },
      { field: 'HireDate', required: true, dataType: 'date' },
      { field: 'PayRate', required: true, dataType: 'number' },
      { field: 'PayType', required: true, dataType: 'string', allowedValues: ['Hourly', 'Salary', 'Contract'] }
    ],
    customers: [
      { field: 'CustomerID', required: true, dataType: 'string', minLength: 1 },
      { field: 'CustomerName', required: true, dataType: 'string', minLength: 1 },
      { field: 'Email', required: false, dataType: 'email' },
      { field: 'Phone', required: false, dataType: 'phone' }
    ],
    timeEntries: [
      { field: 'TimeEntryID', required: true, dataType: 'string', minLength: 1 },
      { field: 'EmployeeID', required: true, dataType: 'string', minLength: 1 },
      { field: 'JobID', required: true, dataType: 'string', minLength: 1 },
      { field: 'Date', required: true, dataType: 'date' },
      { field: 'TotalHours', required: true, dataType: 'number' }
    ]
  };

  /**
   * Parse DSM export file and return structured data
   */
  async parseFile(file: File): Promise<DSMExportFile> {
    const format = this.detectFormat(file);
    
    switch (format) {
      case 'csv':
        return this.parseCSV(file);
      case 'excel':
        return this.parseExcel(file);
      case 'json':
        return this.parseJSON(file);
      case 'xml':
        return this.parseXML(file);
      default:
        throw new Error(`Unsupported file format: ${format}`);
    }
  }

  /**
   * Detect file format based on extension and content
   */
  private detectFormat(file: File): DSMExportFormat {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'csv':
        return 'csv';
      case 'xlsx':
      case 'xls':
        return 'excel';
      case 'json':
        return 'json';
      case 'xml':
        return 'xml';
      default:
        throw new Error(`Unsupported file extension: ${extension}`);
    }
  }

  /**
   * Parse CSV files (most common DSM export format)
   */
  private async parseCSV(file: File): Promise<DSMExportFile> {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => this.normalizeFieldName(header),
        complete: (results) => {
          try {
            const data = this.processCSVData(results.data);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        }
      });
    });
  }

  /**
   * Parse Excel files
   */
  private async parseExcel(file: File): Promise<DSMExportFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          const exportData = this.processExcelWorkbook(workbook);
          resolve(exportData);
        } catch (error) {
          reject(new Error(`Excel parsing error: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read Excel file'));
      };
      
      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Parse JSON files
   */
  private async parseJSON(file: File): Promise<DSMExportFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target?.result as string);
          const exportData = this.processJSONData(jsonData);
          resolve(exportData);
        } catch (error) {
          reject(new Error(`JSON parsing error: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read JSON file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Parse XML files
   */
  private async parseXML(file: File): Promise<DSMExportFile> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const xmlString = e.target?.result as string;
          const parser = new DOMParser();
          const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
          
          const exportData = this.processXMLData(xmlDoc);
          resolve(exportData);
        } catch (error) {
          reject(new Error(`XML parsing error: ${error}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read XML file'));
      };
      
      reader.readAsText(file);
    });
  }

  /**
   * Process CSV data and categorize records
   */
  private processCSVData(rawData: any[]): DSMExportFile {
    // DSM CSV exports often have a specific format
    // We need to detect the type of data based on columns
    const firstRow = rawData[0];
    const dataType = this.detectDataType(Object.keys(firstRow));
    
    const exportData: DSMExportFile = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      format: 'csv',
      totalRecords: rawData.length,
      exportedTables: [dataType],
      customFields: {},
      companyInfo: this.createDefaultCompanySettings()
    };

    switch (dataType) {
      case 'jobs':
        exportData.jobs = rawData.map(row => this.normalizeJobRecord(row));
        break;
      case 'employees':
        exportData.employees = rawData.map(row => this.normalizeEmployeeRecord(row));
        break;
      case 'customers':
        exportData.customers = rawData.map(row => this.normalizeCustomerRecord(row));
        break;
      case 'timeEntries':
        exportData.timeEntries = rawData.map(row => this.normalizeTimeEntryRecord(row));
        break;
      case 'materials':
        exportData.materials = rawData.map(row => this.normalizeMaterialRecord(row));
        break;
      case 'workTypes':
        exportData.workTypes = rawData.map(row => this.normalizeWorkTypeRecord(row));
        break;
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }

    return exportData;
  }

  /**
   * Process Excel workbook with multiple sheets
   */
  private processExcelWorkbook(workbook: XLSX.WorkBook): DSMExportFile {
    const exportData: DSMExportFile = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      format: 'excel',
      totalRecords: 0,
      exportedTables: [],
      customFields: {},
      companyInfo: this.createDefaultCompanySettings()
    };

    // Process each sheet
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      if (jsonData.length < 2) return; // Skip empty sheets or header-only sheets
      
      // Convert to object array with headers
      const headers = (jsonData[0] as string[]).map(h => this.normalizeFieldName(h));
      const rows = jsonData.slice(1).map(row => {
        const obj: any = {};
        headers.forEach((header, index) => {
          obj[header] = (row as any[])[index];
        });
        return obj;
      });

      const dataType = this.detectDataType(headers);
      if (!exportData.exportedTables.includes(dataType)) {
        exportData.exportedTables.push(dataType);
      }
      exportData.totalRecords += rows.length;

      // Process based on detected type
      switch (dataType) {
        case 'jobs':
          exportData.jobs = (exportData.jobs || []).concat(
            rows.map(row => this.normalizeJobRecord(row))
          );
          break;
        case 'employees':
          exportData.employees = (exportData.employees || []).concat(
            rows.map(row => this.normalizeEmployeeRecord(row))
          );
          break;
        case 'customers':
          exportData.customers = (exportData.customers || []).concat(
            rows.map(row => this.normalizeCustomerRecord(row))
          );
          break;
        case 'timeEntries':
          exportData.timeEntries = (exportData.timeEntries || []).concat(
            rows.map(row => this.normalizeTimeEntryRecord(row))
          );
          break;
        case 'materials':
          exportData.materials = (exportData.materials || []).concat(
            rows.map(row => this.normalizeMaterialRecord(row))
          );
          break;
        case 'workTypes':
          exportData.workTypes = (exportData.workTypes || []).concat(
            rows.map(row => this.normalizeWorkTypeRecord(row))
          );
          break;
      }
    });

    return exportData;
  }

  /**
   * Process JSON data
   */
  private processJSONData(jsonData: any): DSMExportFile {
    // Handle different JSON structures
    if (jsonData.DSMExport) {
      // Structured DSM export
      return this.processStructuredJSON(jsonData.DSMExport);
    } else if (Array.isArray(jsonData)) {
      // Simple array format
      return this.processJSONArray(jsonData);
    } else {
      // Object with data arrays
      return this.processJSONObject(jsonData);
    }
  }

  /**
   * Process XML data
   */
  private processXMLData(xmlDoc: Document): DSMExportFile {
    const exportData: DSMExportFile = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      format: 'xml',
      totalRecords: 0,
      exportedTables: [],
      customFields: {},
      companyInfo: this.createDefaultCompanySettings()
    };

    // Look for common DSM XML structures
    const rootElements = ['Jobs', 'Employees', 'Customers', 'TimeEntries', 'Materials', 'WorkTypes'];
    
    rootElements.forEach(elementName => {
      const elements = xmlDoc.getElementsByTagName(elementName);
      if (elements.length > 0) {
        const dataType = elementName.toLowerCase();
        exportData.exportedTables.push(dataType);
        
        const records = Array.from(elements[0].children).map(element => {
          const record: any = {};
          Array.from(element.children).forEach(child => {
            const fieldName = this.normalizeFieldName(child.tagName);
            record[fieldName] = child.textContent;
          });
          return record;
        });

        exportData.totalRecords += records.length;

        switch (dataType) {
          case 'jobs':
            exportData.jobs = records.map(record => this.normalizeJobRecord(record));
            break;
          case 'employees':
            exportData.employees = records.map(record => this.normalizeEmployeeRecord(record));
            break;
          case 'customers':
            exportData.customers = records.map(record => this.normalizeCustomerRecord(record));
            break;
          case 'timeentries':
            exportData.timeEntries = records.map(record => this.normalizeTimeEntryRecord(record));
            break;
          case 'materials':
            exportData.materials = records.map(record => this.normalizeMaterialRecord(record));
            break;
          case 'worktypes':
            exportData.workTypes = records.map(record => this.normalizeWorkTypeRecord(record));
            break;
        }
      }
    });

    return exportData;
  }

  /**
   * Detect data type based on field names
   */
  private detectDataType(fields: string[]): string {
    const normalizedFields = fields.map(f => f.toLowerCase());
    
    // Job indicators
    if (normalizedFields.some(f => f.includes('job') && (f.includes('id') || f.includes('number')))) {
      return 'jobs';
    }
    
    // Employee indicators
    if (normalizedFields.some(f => f.includes('employee') && f.includes('id')) ||
        (normalizedFields.includes('firstname') && normalizedFields.includes('lastname'))) {
      return 'employees';
    }
    
    // Customer indicators
    if (normalizedFields.some(f => f.includes('customer') && f.includes('id'))) {
      return 'customers';
    }
    
    // Time entry indicators
    if (normalizedFields.some(f => f.includes('time') && f.includes('entry')) ||
        normalizedFields.includes('totalhours')) {
      return 'timeEntries';
    }
    
    // Material indicators
    if (normalizedFields.some(f => f.includes('material') && f.includes('id'))) {
      return 'materials';
    }
    
    // Work type indicators
    if (normalizedFields.some(f => f.includes('work') && f.includes('type'))) {
      return 'workTypes';
    }
    
    return 'unknown';
  }

  /**
   * Normalize field names to standard format
   */
  private normalizeFieldName(fieldName: string): string {
    return fieldName
      .replace(/[^a-zA-Z0-9]/g, '')  // Remove special characters
      .replace(/\s+/g, '')           // Remove spaces
      .replace(/^./, c => c.toUpperCase()); // Capitalize first letter
  }

  /**
   * Normalize job record
   */
  private normalizeJobRecord(row: any): DSMJob {
    return {
      JobID: this.getString(row, ['JobID', 'Job_ID', 'Id', 'ID']),
      JobNumber: this.getString(row, ['JobNumber', 'Job_Number', 'Number']),
      JobName: this.getString(row, ['JobName', 'Job_Name', 'Name', 'Title']),
      CustomerID: this.getString(row, ['CustomerID', 'Customer_ID', 'CustomerId']),
      CustomerName: this.getString(row, ['CustomerName', 'Customer_Name', 'Customer']),
      ProjectManager: this.getString(row, ['ProjectManager', 'Project_Manager', 'Manager', 'PM']),
      JobDescription: this.getString(row, ['JobDescription', 'Job_Description', 'Description']),
      JobType: this.getString(row, ['JobType', 'Job_Type', 'Type']),
      JobStatus: this.getString(row, ['JobStatus', 'Job_Status', 'Status']) as any,
      Priority: this.getString(row, ['Priority']) as any,
      DateCreated: this.getDate(row, ['DateCreated', 'Date_Created', 'Created', 'CreateDate']),
      DateStarted: this.getDate(row, ['DateStarted', 'Date_Started', 'Started', 'StartDate']),
      DateCompleted: this.getDate(row, ['DateCompleted', 'Date_Completed', 'Completed', 'CompletedDate']),
      DateDue: this.getDate(row, ['DateDue', 'Date_Due', 'Due', 'DueDate']),
      JobAddress: this.getString(row, ['JobAddress', 'Job_Address', 'Address']),
      JobCity: this.getString(row, ['JobCity', 'Job_City', 'City']),
      JobState: this.getString(row, ['JobState', 'Job_State', 'State']),
      JobZip: this.getString(row, ['JobZip', 'Job_Zip', 'Zip', 'ZipCode', 'PostalCode']),
      EstimatedCost: this.getNumber(row, ['EstimatedCost', 'Estimated_Cost', 'Cost', 'Budget']),
      ActualCost: this.getNumber(row, ['ActualCost', 'Actual_Cost', 'FinalCost']),
      WorkType: this.getString(row, ['WorkType', 'Work_Type', 'ServiceType']),
      CustomField1: this.getString(row, ['CustomField1', 'Custom1', 'CF1']),
      CustomField2: this.getString(row, ['CustomField2', 'Custom2', 'CF2']),
      CustomField3: this.getString(row, ['CustomField3', 'Custom3', 'CF3']),
      CustomField4: this.getString(row, ['CustomField4', 'Custom4', 'CF4']),
      CustomField5: this.getString(row, ['CustomField5', 'Custom5', 'CF5'])
    };
  }

  /**
   * Normalize employee record
   */
  private normalizeEmployeeRecord(row: any): DSMEmployee {
    return {
      EmployeeID: this.getString(row, ['EmployeeID', 'Employee_ID', 'Id', 'ID']),
      EmployeeNumber: this.getString(row, ['EmployeeNumber', 'Employee_Number', 'Number', 'EmpNo']),
      FirstName: this.getString(row, ['FirstName', 'First_Name', 'FName']),
      LastName: this.getString(row, ['LastName', 'Last_Name', 'LName', 'Surname']),
      MiddleName: this.getString(row, ['MiddleName', 'Middle_Name', 'MName']),
      Email: this.getString(row, ['Email', 'EmailAddress', 'E-mail']),
      Phone: this.getString(row, ['Phone', 'PhoneNumber', 'Telephone']),
      MobilePhone: this.getString(row, ['MobilePhone', 'Mobile', 'CellPhone', 'Cell']),
      Address: this.getString(row, ['Address']),
      City: this.getString(row, ['City']),
      State: this.getString(row, ['State']),
      ZipCode: this.getString(row, ['ZipCode', 'Zip', 'PostalCode']),
      HireDate: this.getDate(row, ['HireDate', 'Hire_Date', 'DateHired', 'StartDate']),
      TerminationDate: this.getDate(row, ['TerminationDate', 'Termination_Date', 'DateTerminated', 'EndDate']),
      EmploymentStatus: this.getString(row, ['EmploymentStatus', 'Employment_Status', 'Status']) as any,
      Department: this.getString(row, ['Department', 'Dept']),
      Position: this.getString(row, ['Position', 'Title', 'JobTitle']),
      Supervisor: this.getString(row, ['Supervisor', 'Manager']),
      PayRate: this.getNumber(row, ['PayRate', 'Pay_Rate', 'Rate', 'Wage']),
      PayType: this.getString(row, ['PayType', 'Pay_Type', 'PaymentType']) as any,
      OvertimeRate: this.getNumber(row, ['OvertimeRate', 'Overtime_Rate', 'OTRate']),
      CustomField1: this.getString(row, ['CustomField1', 'Custom1', 'CF1']),
      CustomField2: this.getString(row, ['CustomField2', 'Custom2', 'CF2']),
      CustomField3: this.getString(row, ['CustomField3', 'Custom3', 'CF3'])
    };
  }

  /**
   * Normalize customer record
   */
  private normalizeCustomerRecord(row: any): DSMCustomer {
    return {
      CustomerID: this.getString(row, ['CustomerID', 'Customer_ID', 'Id', 'ID']),
      CustomerNumber: this.getString(row, ['CustomerNumber', 'Customer_Number', 'Number']),
      CustomerName: this.getString(row, ['CustomerName', 'Customer_Name', 'Name']),
      CompanyName: this.getString(row, ['CompanyName', 'Company_Name', 'Company']),
      ContactPerson: this.getString(row, ['ContactPerson', 'Contact_Person', 'Contact']),
      Email: this.getString(row, ['Email', 'EmailAddress']),
      Phone: this.getString(row, ['Phone', 'PhoneNumber']),
      BillingAddress: this.getString(row, ['BillingAddress', 'Billing_Address', 'Address']),
      BillingCity: this.getString(row, ['BillingCity', 'Billing_City', 'City']),
      BillingState: this.getString(row, ['BillingState', 'Billing_State', 'State']),
      BillingZip: this.getString(row, ['BillingZip', 'Billing_Zip', 'Zip']),
      CustomerStatus: this.getString(row, ['CustomerStatus', 'Customer_Status', 'Status']) as any,
      CustomField1: this.getString(row, ['CustomField1', 'Custom1', 'CF1']),
      CustomField2: this.getString(row, ['CustomField2', 'Custom2', 'CF2']),
      CustomField3: this.getString(row, ['CustomField3', 'Custom3', 'CF3'])
    };
  }

  /**
   * Normalize time entry record
   */
  private normalizeTimeEntryRecord(row: any): DSMTimeEntry {
    return {
      TimeEntryID: this.getString(row, ['TimeEntryID', 'TimeEntry_ID', 'Id', 'ID']),
      EmployeeID: this.getString(row, ['EmployeeID', 'Employee_ID', 'EmpID']),
      JobID: this.getString(row, ['JobID', 'Job_ID', 'JobId']),
      Date: this.getDate(row, ['Date', 'WorkDate', 'EntryDate']),
      StartTime: this.getString(row, ['StartTime', 'Start_Time', 'TimeIn']),
      EndTime: this.getString(row, ['EndTime', 'End_Time', 'TimeOut']),
      TotalHours: this.getNumber(row, ['TotalHours', 'Total_Hours', 'Hours']),
      OvertimeHours: this.getNumber(row, ['OvertimeHours', 'Overtime_Hours', 'OTHours']),
      WorkDescription: this.getString(row, ['WorkDescription', 'Work_Description', 'Description', 'Notes']),
      WorkType: this.getString(row, ['WorkType', 'Work_Type']),
      Equipment: this.getString(row, ['Equipment']),
      Status: this.getString(row, ['Status']) as any,
      Notes: this.getString(row, ['Notes', 'Comments'])
    };
  }

  /**
   * Normalize material record
   */
  private normalizeMaterialRecord(row: any): DSMMaterial {
    return {
      MaterialID: this.getString(row, ['MaterialID', 'Material_ID', 'Id', 'ID']),
      MaterialCode: this.getString(row, ['MaterialCode', 'Material_Code', 'Code']),
      MaterialName: this.getString(row, ['MaterialName', 'Material_Name', 'Name']),
      Description: this.getString(row, ['Description']),
      Category: this.getString(row, ['Category']),
      UnitOfMeasure: this.getString(row, ['UnitOfMeasure', 'Unit_Of_Measure', 'UOM', 'Unit']),
      UnitCost: this.getNumber(row, ['UnitCost', 'Unit_Cost', 'Cost']),
      QuantityOnHand: this.getNumber(row, ['QuantityOnHand', 'Quantity_On_Hand', 'QOH', 'Stock']),
      CustomField1: this.getString(row, ['CustomField1', 'Custom1', 'CF1']),
      CustomField2: this.getString(row, ['CustomField2', 'Custom2', 'CF2'])
    };
  }

  /**
   * Normalize work type record
   */
  private normalizeWorkTypeRecord(row: any): DSMWorkType {
    return {
      WorkTypeID: this.getString(row, ['WorkTypeID', 'WorkType_ID', 'Id', 'ID']),
      WorkTypeCode: this.getString(row, ['WorkTypeCode', 'WorkType_Code', 'Code']),
      WorkTypeName: this.getString(row, ['WorkTypeName', 'WorkType_Name', 'Name']),
      Description: this.getString(row, ['Description']),
      Category: this.getString(row, ['Category']),
      DefaultBillingRate: this.getNumber(row, ['DefaultBillingRate', 'Default_Billing_Rate', 'BillingRate', 'Rate'])
    };
  }

  /**
   * Helper methods for data extraction
   */
  private getString(row: any, fieldNames: string[]): string {
    for (const fieldName of fieldNames) {
      if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
        return String(row[fieldName]).trim();
      }
    }
    return '';
  }

  private getNumber(row: any, fieldNames: string[]): number {
    for (const fieldName of fieldNames) {
      if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
        const value = parseFloat(String(row[fieldName]).replace(/[,$]/g, ''));
        if (!isNaN(value)) {
          return value;
        }
      }
    }
    return 0;
  }

  private getDate(row: any, fieldNames: string[]): string {
    for (const fieldName of fieldNames) {
      if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
        const dateStr = String(row[fieldName]).trim();
        const date = new Date(dateStr);
        if (!isNaN(date.getTime())) {
          return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
        }
      }
    }
    return '';
  }

  /**
   * Create default company settings
   */
  private createDefaultCompanySettings(): DSMCompanySettings {
    return {
      CompanyName: 'Imported Company',
      CompanyAddress: '',
      CompanyCity: '',
      CompanyState: '',
      CompanyZip: '',
      CompanyPhone: ''
    };
  }

  /**
   * Process structured JSON export
   */
  private processStructuredJSON(exportData: any): DSMExportFile {
    return {
      exportDate: exportData.exportDate || new Date().toISOString(),
      exportVersion: exportData.exportVersion || '1.0',
      format: 'json',
      companyInfo: exportData.companyInfo || this.createDefaultCompanySettings(),
      jobs: exportData.jobs?.map((job: any) => this.normalizeJobRecord(job)) || [],
      employees: exportData.employees?.map((emp: any) => this.normalizeEmployeeRecord(emp)) || [],
      customers: exportData.customers?.map((cust: any) => this.normalizeCustomerRecord(cust)) || [],
      timeEntries: exportData.timeEntries?.map((entry: any) => this.normalizeTimeEntryRecord(entry)) || [],
      materials: exportData.materials?.map((mat: any) => this.normalizeMaterialRecord(mat)) || [],
      workTypes: exportData.workTypes?.map((wt: any) => this.normalizeWorkTypeRecord(wt)) || [],
      totalRecords: exportData.totalRecords || 0,
      exportedTables: exportData.exportedTables || [],
      customFields: exportData.customFields || {}
    };
  }

  /**
   * Process JSON array
   */
  private processJSONArray(jsonData: any[]): DSMExportFile {
    if (jsonData.length === 0) {
      throw new Error('Empty JSON array');
    }

    const dataType = this.detectDataType(Object.keys(jsonData[0]));
    
    const exportData: DSMExportFile = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      format: 'json',
      totalRecords: jsonData.length,
      exportedTables: [dataType],
      customFields: {},
      companyInfo: this.createDefaultCompanySettings()
    };

    switch (dataType) {
      case 'jobs':
        exportData.jobs = jsonData.map(item => this.normalizeJobRecord(item));
        break;
      case 'employees':
        exportData.employees = jsonData.map(item => this.normalizeEmployeeRecord(item));
        break;
      case 'customers':
        exportData.customers = jsonData.map(item => this.normalizeCustomerRecord(item));
        break;
      case 'timeEntries':
        exportData.timeEntries = jsonData.map(item => this.normalizeTimeEntryRecord(item));
        break;
      case 'materials':
        exportData.materials = jsonData.map(item => this.normalizeMaterialRecord(item));
        break;
      case 'workTypes':
        exportData.workTypes = jsonData.map(item => this.normalizeWorkTypeRecord(item));
        break;
      default:
        throw new Error(`Unknown data type: ${dataType}`);
    }

    return exportData;
  }

  /**
   * Process JSON object with data arrays
   */
  private processJSONObject(jsonData: any): DSMExportFile {
    const exportData: DSMExportFile = {
      exportDate: new Date().toISOString(),
      exportVersion: '1.0',
      format: 'json',
      totalRecords: 0,
      exportedTables: [],
      customFields: {},
      companyInfo: this.createDefaultCompanySettings()
    };

    // Look for data arrays in the object
    const dataKeys = ['jobs', 'employees', 'customers', 'timeEntries', 'materials', 'workTypes'];
    
    dataKeys.forEach(key => {
      if (jsonData[key] && Array.isArray(jsonData[key])) {
        exportData.exportedTables.push(key);
        exportData.totalRecords += jsonData[key].length;
        
        switch (key) {
          case 'jobs':
            exportData.jobs = jsonData[key].map((item: any) => this.normalizeJobRecord(item));
            break;
          case 'employees':
            exportData.employees = jsonData[key].map((item: any) => this.normalizeEmployeeRecord(item));
            break;
          case 'customers':
            exportData.customers = jsonData[key].map((item: any) => this.normalizeCustomerRecord(item));
            break;
          case 'timeEntries':
            exportData.timeEntries = jsonData[key].map((item: any) => this.normalizeTimeEntryRecord(item));
            break;
          case 'materials':
            exportData.materials = jsonData[key].map((item: any) => this.normalizeMaterialRecord(item));
            break;
          case 'workTypes':
            exportData.workTypes = jsonData[key].map((item: any) => this.normalizeWorkTypeRecord(item));
            break;
        }
      }
    });

    return exportData;
  }

  /**
   * Validate parsed data
   */
  validateData(exportData: DSMExportFile): DSMValidationResult {
    const results: DSMValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      fieldResults: {}
    };

    // Validate each data type
    const dataTypes = ['jobs', 'employees', 'customers', 'timeEntries'] as const;
    
    dataTypes.forEach(dataType => {
      const data = exportData[dataType];
      if (data && data.length > 0) {
        const rules = this.validationRules[dataType] || [];
        
        data.forEach((record, index) => {
          rules.forEach(rule => {
            const fieldResult = this.validateField(record, rule);
            const fieldKey = `${dataType}[${index}].${rule.field}`;
            
            results.fieldResults[fieldKey] = fieldResult;
            
            if (!fieldResult.isValid) {
              results.isValid = false;
              results.errors.push(`${dataType}[${index}].${rule.field}: ${fieldResult.error}`);
            }
            
            if (fieldResult.warning) {
              results.warnings.push(`${dataType}[${index}].${rule.field}: ${fieldResult.warning}`);
            }
          });
        });
      }
    });

    return results;
  }

  /**
   * Validate individual field
   */
  private validateField(record: any, rule: DSMValidationRule): { isValid: boolean; error?: string; warning?: string } {
    const value = record[rule.field];
    
    // Check required fields
    if (rule.required && (value === undefined || value === null || value === '')) {
      return { isValid: false, error: 'Required field is missing' };
    }
    
    // Skip validation for empty optional fields
    if (!rule.required && (value === undefined || value === null || value === '')) {
      return { isValid: true };
    }
    
    // Data type validation
    switch (rule.dataType) {
      case 'string':
        if (typeof value !== 'string') {
          return { isValid: false, error: 'Expected string value' };
        }
        if (rule.minLength && value.length < rule.minLength) {
          return { isValid: false, error: `Minimum length is ${rule.minLength}` };
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          return { isValid: false, error: `Maximum length is ${rule.maxLength}` };
        }
        break;
        
      case 'number':
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        if (isNaN(numValue)) {
          return { isValid: false, error: 'Expected numeric value' };
        }
        break;
        
      case 'date':
        const dateValue = new Date(value);
        if (isNaN(dateValue.getTime())) {
          return { isValid: false, error: 'Expected valid date' };
        }
        break;
        
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return { isValid: false, error: 'Expected valid email address' };
        }
        break;
        
      case 'phone':
        const phoneRegex = /^[\d\s\-\(\)\+\.]{10,}$/;
        if (!phoneRegex.test(value)) {
          return { isValid: false, error: 'Expected valid phone number' };
        }
        break;
    }
    
    // Allowed values validation
    if (rule.allowedValues && !rule.allowedValues.includes(value)) {
      return { 
        isValid: false, 
        error: `Value must be one of: ${rule.allowedValues.join(', ')}` 
      };
    }
    
    // Pattern validation
    if (rule.pattern) {
      const regex = new RegExp(rule.pattern);
      if (!regex.test(value)) {
        return { isValid: false, error: 'Value does not match required pattern' };
      }
    }
    
    // Custom validation
    if (rule.customValidator && !rule.customValidator(value)) {
      return { isValid: false, error: 'Custom validation failed' };
    }
    
    return { isValid: true };
  }
}

// Export singleton instance
export const dsmParser = new DSMDataParser();