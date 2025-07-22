/**
 * DSM to Pontifex Onboarding Types
 * Specialized for concrete cutting companies migrating from DSM Software
 */

export interface DSMOnboardingSession {
  id: string;
  companyId: string;
  userId: string;
  createdAt: Date;
  startedAt: Date;
  completedAt?: Date;
  lastActiveAt: Date;
  
  // Progress tracking
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalSteps: number;
  progressPercentage: number;
  
  // Company data
  companyProfile: ConcreteCompanyProfile;
  dsmMigrationData: DSMMigrationData;
  
  // Migration progress
  migrationStatus: MigrationStatus;
  dataValidation: DataValidationResults;
  
  // Training progress
  trainingProgress: TrainingModuleProgress;
  
  // System configuration
  systemConfiguration: SystemConfig;
  
  // Support and issues
  supportTickets: SupportTicket[];
  blockers: OnboardingBlocker[];
  
  // Preferences
  preferences: OnboardingPreferences;
}

export type OnboardingStep = 
  | 'welcome'
  | 'company_profile'
  | 'dsm_assessment'
  | 'data_migration'
  | 'system_setup'
  | 'team_configuration'
  | 'training_modules'
  | 'equipment_setup'
  | 'safety_compliance'
  | 'workflow_configuration'
  | 'integration_setup'
  | 'testing_validation'
  | 'go_live_preparation'
  | 'completion';

export interface ConcreteCompanyProfile {
  // Basic company info
  companyName: string;
  businessType: 'concrete_cutting' | 'demolition' | 'construction' | 'specialty_contractor';
  yearsInBusiness: number;
  companySize: CompanySize;
  
  // Contact information
  primaryContact: ContactInfo;
  technicalContact?: ContactInfo;
  billingContact?: ContactInfo;
  
  // Services offered
  concreteServices: ConcreteService[];
  serviceAreas: ServiceArea[];
  averageJobsPerMonth: number;
  peakSeasonMonths: number[];
  
  // Equipment and crew
  equipmentInventory: EquipmentItem[];
  crewSize: number;
  operatorCount: number;
  
  // Current DSM setup
  dsmVersion: string;
  dsmModules: string[];
  dsmDataVolume: DSMDataVolume;
  dsmCustomizations: DSMCustomization[];
  
  // Business requirements
  complianceNeeds: ComplianceRequirement[];
  integrationNeeds: IntegrationRequirement[];
  reportingNeeds: ReportingRequirement[];
  
  // Migration preferences
  migrationTimeline: MigrationTimeline;
  riskTolerance: 'low' | 'medium' | 'high';
  downtime_tolerance: number; // hours
}

export type CompanySize = 'small' | 'medium' | 'large' | 'enterprise';

export interface ContactInfo {
  firstName: string;
  lastName: string;
  title: string;
  email: string;
  phone: string;
  preferredContact: 'email' | 'phone' | 'text';
  timezone: string;
  availability: BusinessHours;
}

export type ConcreteService = 
  | 'core_drilling'
  | 'wall_sawing'
  | 'slab_sawing'
  | 'wire_sawing'
  | 'chain_sawing'
  | 'ring_sawing'
  | 'hand_sawing'
  | 'demolition'
  | 'concrete_breaking'
  | 'surface_preparation'
  | 'joint_sealing'
  | 'anchor_drilling';

export interface ServiceArea {
  region: string;
  states: string[];
  cities: string[];
  radius: number; // miles
  travelFees: boolean;
}

export interface EquipmentItem {
  type: EquipmentType;
  brand: string;
  model: string;
  serialNumber?: string;
  yearManufactured?: number;
  condition: 'excellent' | 'good' | 'fair' | 'needs_repair';
  trackingRequired: boolean;
  maintenanceSchedule?: MaintenanceSchedule;
}

export type EquipmentType = 
  | 'core_drill'
  | 'wall_saw'
  | 'slab_saw'
  | 'wire_saw'
  | 'chain_saw'
  | 'ring_saw'
  | 'hand_saw'
  | 'dust_collector'
  | 'water_tank'
  | 'generator'
  | 'compressor'
  | 'vehicle'
  | 'trailer'
  | 'safety_equipment';

export interface MaintenanceSchedule {
  interval: number; // hours
  lastMaintenance?: Date;
  nextDue?: Date;
  maintenanceType: 'routine' | 'preventive' | 'major_overhaul';
}

export interface DSMDataVolume {
  customers: number;
  jobs: number;
  timeEntries: number;
  invoices: number;
  estimates: number;
  employees: number;
  equipment: number;
  materials: number;
  totalRecords: number;
  dataSize: string; // MB/GB
  oldestRecord: Date;
  newestRecord: Date;
}

export interface DSMCustomization {
  type: 'custom_field' | 'custom_report' | 'workflow' | 'integration' | 'template';
  name: string;
  description: string;
  criticality: 'essential' | 'important' | 'nice_to_have';
  migrationComplexity: 'simple' | 'moderate' | 'complex';
  pontifexEquivalent?: string;
}

export interface ComplianceRequirement {
  type: 'OSHA' | 'EPA' | 'state_regulation' | 'industry_standard' | 'insurance';
  description: string;
  mandatory: boolean;
  documentationRequired: boolean;
  trainingRequired: boolean;
  monitoringRequired: boolean;
}

export interface IntegrationRequirement {
  system: string;
  purpose: string;
  dataFlow: 'import' | 'export' | 'bidirectional';
  frequency: 'real_time' | 'hourly' | 'daily' | 'weekly' | 'monthly';
  criticality: 'essential' | 'important' | 'nice_to_have';
}

export interface ReportingRequirement {
  reportType: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual' | 'on_demand';
  recipients: string[];
  format: 'PDF' | 'Excel' | 'CSV' | 'dashboard';
  automation: boolean;
}

export interface MigrationTimeline {
  preferredStartDate: Date;
  requiredCompletionDate?: Date;
  flexibility: 'rigid' | 'somewhat_flexible' | 'very_flexible';
  blackoutPeriods: DateRange[];
  peakBusinessPeriods: DateRange[];
}

export interface DateRange {
  start: Date;
  end: Date;
  reason: string;
}

export interface BusinessHours {
  monday: TimeSlot;
  tuesday: TimeSlot;
  wednesday: TimeSlot;
  thursday: TimeSlot;
  friday: TimeSlot;
  saturday?: TimeSlot;
  sunday?: TimeSlot;
  holidays: Date[];
}

export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  breaks?: TimeSlot[];
}

export interface DSMMigrationData {
  dataExtracted: boolean;
  extractionDate?: Date;
  dataFiles: DataFile[];
  dataQuality: DataQualityAssessment;
  migrationPlan: MigrationPlan;
  estimatedDuration: number; // hours
  riskFactors: RiskFactor[];
}

export interface DataFile {
  fileName: string;
  fileType: string;
  fileSize: number; // bytes
  recordCount: number;
  uploadedAt: Date;
  validated: boolean;
  validationErrors: ValidationError[];
}

export interface ValidationError {
  severity: 'error' | 'warning' | 'info';
  field: string;
  message: string;
  recordCount: number;
  suggestedFix?: string;
}

export interface DataQualityAssessment {
  overallScore: number; // 0-100
  completeness: number; // 0-100
  accuracy: number; // 0-100
  consistency: number; // 0-100
  duplicates: number;
  missingCriticalFields: string[];
  dataGaps: DataGap[];
  recommendations: QualityRecommendation[];
}

export interface DataGap {
  table: string;
  field: string;
  missingPercentage: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  suggestedResolution: string;
}

export interface QualityRecommendation {
  category: 'cleanup' | 'enrichment' | 'validation' | 'standardization';
  priority: 'high' | 'medium' | 'low';
  description: string;
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
}

export interface MigrationPlan {
  phases: MigrationPhase[];
  totalDuration: number; // hours
  resourceRequirements: ResourceRequirement[];
  dependencies: PhaseDependency[];
  rollbackStrategy: RollbackStrategy;
}

export interface MigrationPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  estimatedDuration: number; // hours
  dataTypes: string[];
  prerequisites: string[];
  deliverables: string[];
  validationCriteria: string[];
  rollbackTriggers: string[];
}

export interface ResourceRequirement {
  role: 'migration_specialist' | 'data_analyst' | 'technical_consultant' | 'customer_resource';
  hoursRequired: number;
  skills: string[];
  availability: 'full_time' | 'part_time' | 'on_call';
}

export interface PhaseDependency {
  dependentPhase: string;
  prerequisitePhase: string;
  dependencyType: 'hard' | 'soft';
  description: string;
}

export interface RollbackStrategy {
  triggers: string[];
  procedures: RollbackProcedure[];
  dataBackupStrategy: string;
  recoveryTimeObjective: number; // hours
}

export interface RollbackProcedure {
  phase: string;
  steps: string[];
  timeRequired: number; // hours
  dataRecovery: boolean;
  impactAssessment: string;
}

export interface RiskFactor {
  category: 'technical' | 'business' | 'timeline' | 'resource' | 'external';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
  contingency: string;
}

export interface MigrationStatus {
  currentPhase?: string;
  phasesCompleted: string[];
  overallProgress: number; // 0-100
  startedAt?: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  
  // Current phase details
  currentPhaseProgress: number; // 0-100
  currentPhaseStarted?: Date;
  currentPhaseEstimatedEnd?: Date;
  
  // Issues and blockers
  activeIssues: MigrationIssue[];
  resolvedIssues: MigrationIssue[];
  blockers: MigrationBlocker[];
  
  // Metrics
  recordsMigrated: number;
  totalRecords: number;
  migrationSpeed: number; // records per hour
  errorRate: number; // percentage
  
  // Quality metrics
  dataIntegrityChecks: IntegrityCheck[];
  validationResults: ValidationResult[];
}

export interface MigrationIssue {
  id: string;
  phase: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'data' | 'system' | 'configuration' | 'performance';
  description: string;
  impact: string;
  status: 'open' | 'investigating' | 'resolved' | 'deferred';
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
  resolution?: string;
}

export interface MigrationBlocker {
  id: string;
  description: string;
  impact: 'minor_delay' | 'major_delay' | 'complete_stop';
  category: 'technical' | 'business' | 'resource' | 'external';
  resolution: string;
  targetResolution: Date;
  assignedTo: string;
  escalationLevel: number;
}

export interface IntegrityCheck {
  checkType: 'record_count' | 'data_validation' | 'referential_integrity' | 'business_rules';
  status: 'passed' | 'failed' | 'warning';
  expectedValue: any;
  actualValue: any;
  discrepancy?: string;
  impact: 'low' | 'medium' | 'high';
}

export interface ValidationResult {
  validator: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  affectedRecords: number;
  fixRequired: boolean;
  autoFixAvailable: boolean;
}

export interface DataValidationResults {
  overallStatus: 'passed' | 'passed_with_warnings' | 'failed';
  validationDate: Date;
  
  // Validation categories
  dataIntegrity: ValidationCategory;
  businessRules: ValidationCategory;
  referentialIntegrity: ValidationCategory;
  dataCompleteness: ValidationCategory;
  
  // Summary
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  warningChecks: number;
  
  // Actions required
  criticalIssues: ValidationIssue[];
  recommendedActions: ValidationAction[];
}

export interface ValidationCategory {
  name: string;
  status: 'passed' | 'passed_with_warnings' | 'failed';
  checks: ValidationCheck[];
  passRate: number; // percentage
}

export interface ValidationCheck {
  name: string;
  description: string;
  status: 'passed' | 'failed' | 'warning';
  details?: string;
  affectedRecords?: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ValidationIssue {
  id: string;
  category: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  resolution: string;
  priority: number;
}

export interface ValidationAction {
  action: string;
  priority: 'immediate' | 'before_go_live' | 'post_go_live';
  effort: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  description: string;
}

export interface TrainingModuleProgress {
  overallProgress: number; // 0-100
  currentModule?: TrainingModule;
  completedModules: TrainingModule[];
  totalModules: number;
  
  // Learning path
  learningPath: LearningPath;
  adaptiveContent: boolean;
  
  // Assessments
  assessmentScores: AssessmentScore[];
  certifications: Certification[];
  
  // Engagement
  totalTimeSpent: number; // minutes
  averageSessionTime: number; // minutes
  lastActivity: Date;
  engagementScore: number; // 0-100
  
  // Support
  helpRequests: number;
  tutoringSessions: TutoringSession[];
}

export type TrainingModule = 
  | 'platform_overview'
  | 'dsm_differences'
  | 'job_management'
  | 'customer_management'
  | 'scheduling_dispatch'
  | 'equipment_tracking'
  | 'safety_compliance'
  | 'reporting_analytics'
  | 'mobile_app'
  | 'billing_invoicing'
  | 'inventory_management'
  | 'team_management'
  | 'system_administration';

export interface LearningPath {
  name: string;
  description: string;
  modules: ModuleSequence[];
  estimatedHours: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  targetRole: string[];
}

export interface ModuleSequence {
  module: TrainingModule;
  order: number;
  required: boolean;
  estimatedMinutes: number;
  prerequisites: TrainingModule[];
}

export interface AssessmentScore {
  module: TrainingModule;
  score: number; // 0-100
  passingScore: number;
  attempts: number;
  lastAttempt: Date;
  timeSpent: number; // minutes
  strengthAreas: string[];
  improvementAreas: string[];
}

export interface Certification {
  id: string;
  name: string;
  module: TrainingModule;
  issuedDate: Date;
  expiryDate?: Date;
  level: 'basic' | 'intermediate' | 'advanced';
  skills: string[];
  verificationCode: string;
}

export interface TutoringSession {
  id: string;
  scheduledDate: Date;
  duration: number; // minutes
  tutor: string;
  topics: string[];
  outcome: string;
  followUpRequired: boolean;
  satisfactionRating: number; // 1-5
}

export interface SystemConfig {
  setupProgress: number; // 0-100
  completedTasks: string[];
  pendingTasks: ConfigTask[];
  
  // Configuration areas
  userManagement: UserManagementConfig;
  workflowConfig: WorkflowConfig;
  equipmentConfig: EquipmentConfig;
  safetyConfig: SafetyConfig;
  integrationConfig: IntegrationConfig;
  
  // Testing
  systemTesting: TestingResults;
  userAcceptanceTesting: UATResults;
  
  // Go-live readiness
  goLiveChecklist: GoLiveItem[];
  readinessScore: number; // 0-100
}

export interface ConfigTask {
  id: string;
  name: string;
  category: 'users' | 'workflows' | 'equipment' | 'safety' | 'integrations' | 'testing';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  assignedTo?: string;
  dueDate?: Date;
}

export interface UserManagementConfig {
  usersCreated: number;
  rolesConfigured: boolean;
  permissionsSet: boolean;
  teamsSetup: boolean;
  accessControlConfigured: boolean;
}

export interface WorkflowConfig {
  workTypesSetup: boolean;
  approvalWorkflowsConfigured: boolean;
  automationRulesSetup: boolean;
  templatesCreated: boolean;
  statusWorkflowsConfigured: boolean;
}

export interface EquipmentConfig {
  assetsRegistered: number;
  categoriesSetup: boolean;
  trackingEnabled: boolean;
  maintenanceSchedulesSetup: boolean;
  beaconsConfigured: number;
}

export interface SafetyConfig {
  complianceFrameworkSetup: boolean;
  oshaConfigured: boolean;
  silicaMonitoringSetup: boolean;
  incidentReportingConfigured: boolean;
  trainingTrackingSetup: boolean;
}

export interface IntegrationConfig {
  accountingIntegration?: IntegrationStatus;
  estimatingIntegration?: IntegrationStatus;
  weatherIntegration?: IntegrationStatus;
  customIntegrations: CustomIntegration[];
}

export interface IntegrationStatus {
  name: string;
  provider: string;
  status: 'not_configured' | 'configured' | 'tested' | 'active' | 'error';
  lastTest?: Date;
  errorDetails?: string;
}

export interface CustomIntegration {
  name: string;
  type: 'api' | 'webhook' | 'file_import' | 'database';
  status: IntegrationStatus['status'];
  configuration: Record<string, any>;
  testResults?: string;
}

export interface TestingResults {
  functionalTesting: TestCategory;
  integrationTesting: TestCategory;
  performanceTesting: TestCategory;
  securityTesting: TestCategory;
  overallStatus: 'not_started' | 'in_progress' | 'completed' | 'failed';
}

export interface TestCategory {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  testCases: number;
  passed: number;
  failed: number;
  coverage: number; // percentage
  startDate?: Date;
  endDate?: Date;
  issues: TestIssue[];
}

export interface TestIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  status: 'open' | 'in_progress' | 'resolved';
  assignedTo?: string;
}

export interface UATResults {
  scenarios: UATScenario[];
  overallSatisfaction: number; // 1-5
  completionRate: number; // percentage
  approvalStatus: 'pending' | 'approved' | 'rejected' | 'conditional';
  feedback: UserFeedback[];
}

export interface UATScenario {
  id: string;
  name: string;
  description: string;
  businessValue: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedUsers: string[];
  results: UATResult[];
}

export interface UATResult {
  userId: string;
  status: 'passed' | 'failed' | 'partial';
  completionTime: number; // minutes
  difficulty: number; // 1-5
  satisfaction: number; // 1-5
  feedback: string;
  issues: string[];
}

export interface UserFeedback {
  userId: string;
  category: 'usability' | 'performance' | 'functionality' | 'training';
  rating: number; // 1-5
  comments: string;
  suggestions: string[];
  timestamp: Date;
}

export interface GoLiveItem {
  id: string;
  name: string;
  category: 'technical' | 'business' | 'training' | 'support';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  responsible: string;
  dueDate?: Date;
  completedDate?: Date;
  verificationRequired: boolean;
  verifiedBy?: string;
}

export interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'training' | 'data' | 'process';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  submittedBy: string;
  submittedAt: Date; // Add for compatibility
  assignedTo?: string;
  createdAt: Date;
  lastUpdated: Date;
  resolvedAt?: Date;
  onboardingStep?: OnboardingStep;
  resolution?: string;
  customerSatisfaction?: number; // 1-5
}

export interface OnboardingBlocker {
  id: string;
  type: 'technical' | 'business' | 'resource' | 'external';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  assignedTo: string;
  targetResolution: Date;
  escalationLevel: number;
}

export interface OnboardingPreferences {
  communicationFrequency: 'daily' | 'weekly' | 'biweekly' | 'as_needed';
  preferredContactMethod: 'email' | 'phone' | 'video_call' | 'chat';
  meetingFrequency: 'daily' | 'weekly' | 'biweekly' | 'as_needed';
  trainingPace: 'self_paced' | 'guided' | 'accelerated';
  supportLevel: 'minimal' | 'standard' | 'premium';
  documentationFormat: 'digital' | 'printed' | 'video' | 'mixed';
  timezone: string;
  businessHours: BusinessHours;
}

// Event tracking for analytics
export interface OnboardingEvent {
  sessionId: string;
  userId: string;
  eventType: OnboardingEventType;
  step?: OnboardingStep;
  timestamp: Date;
  data?: Record<string, any>;
  duration?: number; // milliseconds
}

export type OnboardingEventType = 
  | 'session_started'
  | 'step_started'
  | 'step_completed'
  | 'step_skipped'
  | 'help_requested'
  | 'error_encountered'
  | 'feedback_submitted'
  | 'session_paused'
  | 'session_resumed'
  | 'session_completed'
  | 'support_ticket_created'
  | 'training_module_started'
  | 'training_module_completed'
  | 'assessment_taken'
  | 'certification_earned'
  | 'migration_started'
  | 'migration_completed'
  | 'system_configured'
  | 'go_live_approved';

// Analytics and metrics
export interface OnboardingMetrics {
  completionRate: number; // percentage
  averageCompletionTime: number; // days
  dropOffPoints: StepMetrics[];
  supportTicketRate: number; // tickets per onboarding
  customerSatisfaction: number; // 1-5
  migrationSuccessRate: number; // percentage
  trainingCompletionRate: number; // percentage
  systemAdoptionRate: number; // percentage
}

export interface StepMetrics {
  step: OnboardingStep;
  completionRate: number; // percentage
  averageTime: number; // hours
  dropOffRate: number; // percentage
  helpRequestRate: number; // percentage
  satisfactionScore: number; // 1-5
}