/**
 * Onboarding Types for DSM to Pontifex Migration
 * Specialized for concrete cutting companies
 */

export interface OnboardingSession {
  id: string;
  companyId: string;
  userId: string;
  
  // Session metadata
  startedAt: Date;
  completedAt?: Date;
  lastActiveAt: Date;
  
  // Progress tracking
  currentStep: OnboardingStep;
  completedSteps: OnboardingStep[];
  totalSteps: number;
  progressPercentage: number;
  
  // Company profile
  companyProfile: CompanyProfile;
  
  // Migration status
  migrationStatus: DSMMigrationProgress;
  
  // Training progress
  trainingProgress: TrainingProgress;
  
  // System setup
  systemSetup: SystemSetupProgress;
  
  // Support and assistance
  supportTickets: SupportTicket[];
  hasCompletedTour: boolean;
  needsAssistance: boolean;
  
  // Configuration
  preferences: OnboardingPreferences;
  notifications: OnboardingNotification[];
}

export type OnboardingStep = 
  | 'welcome'
  | 'company_profile' 
  | 'dsm_assessment'
  | 'data_migration'
  | 'system_setup'
  | 'team_setup'
  | 'training_modules'
  | 'equipment_configuration'
  | 'safety_setup'
  | 'workflow_customization'
  | 'integration_setup'
  | 'go_live_checklist'
  | 'completion';

export interface CompanyProfile {
  // Basic information
  companyName: string;
  industry: 'concrete_cutting' | 'demolition' | 'construction' | 'mixed';
  companySize: 'small' | 'medium' | 'large'; // <10, 10-50, 50+ employees
  yearsInBusiness: number;
  
  // Contact information
  primaryContact: ContactInfo;
  billingContact?: ContactInfo;
  technicalContact?: ContactInfo;
  
  // Business details
  servicesOffered: ConcreteService[];
  typicalProjectSize: 'small' | 'medium' | 'large' | 'mixed';
  averageJobsPerMonth: number;
  peakSeasonMonths: number[];
  
  // Geographic information
  primaryServiceArea: ServiceArea;
  serviceRadius: number; // miles
  multipleLocations: boolean;
  locations?: BusinessLocation[];
  
  // Current DSM usage
  dsmLicenseType: string;
  dsmModulesUsed: string[];
  dsmDataVolume: DSMDataVolume;
  customFieldsUsed: number;
  integrationsCurrent: string[];
  
  // Team structure
  estimatedUsers: number;
  userRoles: UserRolePreference[];
  accessLevels: AccessLevelPreference[];
  
  // Equipment and inventory
  equipmentTypes: EquipmentType[];
  inventoryManagement: 'basic' | 'advanced' | 'none';
  assetTrackingNeeds: AssetTrackingPreference[];
  
  // Compliance and safety requirements
  oshaCompliance: boolean;
  silicaMonitoringRequired: boolean;
  stateRegulations: string[];
  insuranceRequirements: InsuranceRequirement[];
  certificationRequirements: string[];
  
  // Technology readiness
  currentTechStack: TechnologyStack;
  mobileDeviceTypes: MobileDevice[];
  internetConnectivity: ConnectivityLevel;
  cloudReadiness: boolean;
  
  // Goals and expectations
  migrationGoals: MigrationGoal[];
  successMetrics: SuccessMetric[];
  timeline: MigrationTimeline;
  budgetRange: BudgetRange;
}

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
  preferredContactMethod: 'email' | 'phone' | 'text';
  timezone: string;
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
  | 'breaking'
  | 'chipping'
  | 'joint_sealing'
  | 'surface_preparation';

export interface ServiceArea {
  city: string;
  state: string;
  zipCodes: string[];
  counties: string[];
  customBoundary?: string; // GeoJSON or description
}

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  locationType: 'headquarters' | 'branch' | 'warehouse' | 'shop';
  isActive: boolean;
}

export interface DSMDataVolume {
  customers: number;
  jobs: number;
  employees: number;
  timeEntries: number;
  invoices: number;
  estimates: number;
  materials: number;
  totalRecords: number;
  dataSize: string; // MB/GB
  oldestRecord: Date;
  newestRecord: Date;
}

export interface UserRolePreference {
  roleName: string;
  permissions: string[];
  estimatedUsers: number;
  description: string;
}

export interface AccessLevelPreference {
  levelName: string;
  dataAccess: 'full' | 'limited' | 'read_only';
  modules: string[];
  estimatedUsers: number;
}

export type EquipmentType = 
  | 'core_drills'
  | 'wall_saws'
  | 'slab_saws'
  | 'wire_saws'
  | 'chain_saws'
  | 'ring_saws'
  | 'hand_saws'
  | 'dust_collectors'
  | 'water_tanks'
  | 'generators'
  | 'compressors'
  | 'vehicles'
  | 'trailers'
  | 'other';

export interface AssetTrackingPreference {
  assetType: EquipmentType;
  trackingLevel: 'basic' | 'advanced' | 'real_time';
  beaconRequired: boolean;
  maintenanceScheduling: boolean;
  utilizationTracking: boolean;
}

export interface InsuranceRequirement {
  type: 'general_liability' | 'workers_comp' | 'equipment' | 'auto' | 'professional';
  required: boolean;
  minimumCoverage?: number;
  carrier?: string;
}

export interface TechnologyStack {
  operatingSystem: 'windows' | 'mac' | 'mixed';
  mobileDevices: number;
  tablets: number;
  desktopComputers: number;
  serverInfrastructure: 'cloud' | 'on_premise' | 'hybrid' | 'none';
  existingSoftware: string[];
  accountingSoftware?: string;
  crmSoftware?: string;
}

export interface MobileDevice {
  type: 'iPhone' | 'Android' | 'iPad' | 'Android_Tablet' | 'Rugged_Device';
  quantity: number;
  osVersion?: string;
}

export type ConnectivityLevel = 'high_speed' | 'standard' | 'limited' | 'variable';

export interface MigrationGoal {
  category: 'efficiency' | 'cost_savings' | 'compliance' | 'growth' | 'technology';
  description: string;
  priority: 'high' | 'medium' | 'low';
  measurable: boolean;
  targetValue?: number;
  timeline?: string;
}

export interface SuccessMetric {
  name: string;
  currentValue?: number;
  targetValue: number;
  unit: string;
  timeframe: string;
  category: 'productivity' | 'cost' | 'quality' | 'safety' | 'customer_satisfaction';
}

export interface MigrationTimeline {
  preferredStartDate: Date;
  requiredCompletionDate?: Date;
  flexibility: 'fixed' | 'flexible' | 'asap';
  businessConstraints: string[];
  blackoutDates: Date[];
}

export type BudgetRange = 
  | 'under_5k'
  | '5k_to_15k'
  | '15k_to_30k'
  | '30k_to_50k'
  | '50k_plus'
  | 'enterprise';

export interface DSMMigrationProgress {
  status: 'not_started' | 'assessment' | 'in_progress' | 'completed' | 'failed';
  
  // Assessment phase
  dsmDataAssessment?: DSMDataAssessment;
  migrationPlan?: MigrationPlan;
  
  // Migration execution
  currentPhase?: MigrationPhase;
  phasesCompleted: MigrationPhase[];
  migrationResults?: DSMMigrationResults;
  
  // Validation and verification
  dataValidated: boolean;
  testingCompleted: boolean;
  backupCreated: boolean;
  rollbackPlan: boolean;
  
  // Timeline tracking
  startedAt?: Date;
  estimatedCompletion?: Date;
  actualCompletion?: Date;
  
  // Issues and resolution
  issues: MigrationIssue[];
  warningsCount: number;
  errorsCount: number;
  
  // Support and assistance
  assistanceRequested: boolean;
  assignedSpecialist?: string;
  supportTickets: string[];
}

export interface DSMDataAssessment {
  dataQualityScore: number; // 0-100
  completenessScore: number; // 0-100
  consistencyScore: number; // 0-100
  
  // Data analysis
  duplicateRecords: number;
  incompleteRecords: number;
  dataGaps: DataGap[];
  customizations: DSMCustomization[];
  
  // Compatibility assessment
  compatibilityScore: number; // 0-100
  incompatibleFields: string[];
  mappingRequired: FieldMapping[];
  manualReviewNeeded: string[];
  
  // Recommendations
  recommendations: AssessmentRecommendation[];
  estimatedEffort: EffortEstimate;
  riskAssessment: RiskAssessment;
}

export interface DataGap {
  table: string;
  field: string;
  missingPercentage: number;
  impact: 'low' | 'medium' | 'high';
  recommendation: string;
}

export interface DSMCustomization {
  type: 'custom_field' | 'custom_report' | 'workflow' | 'integration';
  name: string;
  description: string;
  complexity: 'simple' | 'moderate' | 'complex';
  migrationPlan: string;
}

export interface FieldMapping {
  dsmField: string;
  pontifexField: string;
  transformationRequired: boolean;
  transformationType?: 'format' | 'lookup' | 'calculation' | 'conditional';
  confidence: number; // 0-100
}

export interface AssessmentRecommendation {
  category: 'data_cleanup' | 'preparation' | 'timing' | 'resources';
  priority: 'high' | 'medium' | 'low';
  description: string;
  actionRequired: string;
  estimatedTime: string;
}

export interface EffortEstimate {
  dataPreparation: number; // hours
  migration: number; // hours
  testing: number; // hours
  training: number; // hours
  total: number; // hours
  
  resourcesRequired: string[];
  specialistTime: number; // hours
  customerTime: number; // hours
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  risks: MigrationRisk[];
  mitigationStrategies: string[];
  contingencyPlans: string[];
}

export interface MigrationRisk {
  category: 'data_loss' | 'downtime' | 'compatibility' | 'timeline' | 'resources';
  description: string;
  likelihood: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  mitigation: string;
}

export interface MigrationPlan {
  phases: MigrationPhaseDefinition[];
  timeline: MigrationSchedule;
  resources: ResourceAllocation;
  dependencies: PhaseDependency[];
  rollbackProcedures: RollbackProcedure[];
}

export interface MigrationPhaseDefinition {
  phase: MigrationPhase;
  name: string;
  description: string;
  duration: number; // hours
  prerequisites: string[];
  deliverables: string[];
  successCriteria: string[];
  rollbackCriteria: string[];
}

export type MigrationPhase = 
  | 'preparation'
  | 'data_export'
  | 'data_validation'
  | 'customers_migration'
  | 'employees_migration'
  | 'work_types_migration'
  | 'jobs_migration'
  | 'time_entries_migration'
  | 'materials_migration'
  | 'financial_migration'
  | 'documents_migration'
  | 'validation_testing'
  | 'user_acceptance_testing'
  | 'go_live'
  | 'post_migration_support';

export interface MigrationSchedule {
  startDate: Date;
  endDate: Date;
  phases: PhaseSchedule[];
  milestones: Milestone[];
  criticalPath: string[];
}

export interface PhaseSchedule {
  phase: MigrationPhase;
  startDate: Date;
  endDate: Date;
  dependencies: MigrationPhase[];
  resources: string[];
  buffer: number; // hours
}

export interface Milestone {
  name: string;
  date: Date;
  description: string;
  deliverables: string[];
  stakeholders: string[];
}

export interface ResourceAllocation {
  projectManager: string;
  migrationSpecialist: string;
  dataAnalyst?: string;
  technicalConsultant?: string;
  customerResources: CustomerResource[];
}

export interface CustomerResource {
  role: string;
  name?: string;
  email?: string;
  responsibilities: string[];
  timeCommitment: number; // hours
}

export interface PhaseDependency {
  dependentPhase: MigrationPhase;
  prerequisitePhase: MigrationPhase;
  dependencyType: 'finish_to_start' | 'start_to_start' | 'finish_to_finish';
  description: string;
}

export interface RollbackProcedure {
  phase: MigrationPhase;
  trigger: string;
  steps: string[];
  dataRecovery: string;
  timeRequired: number; // hours
  impactAssessment: string;
}

export interface DSMMigrationResults {
  summary: MigrationSummary;
  phaseResults: PhaseResult[];
  dataValidation: ValidationResult[];
  performanceMetrics: PerformanceMetric[];
  issues: MigrationIssue[];
  recommendations: PostMigrationRecommendation[];
}

export interface MigrationSummary {
  totalRecords: number;
  migratedRecords: number;
  failedRecords: number;
  skippedRecords: number;
  successRate: number; // percentage
  
  duration: number; // hours
  downtime: number; // hours
  
  dataIntegrity: 'verified' | 'issues_found' | 'not_verified';
  systemPerformance: 'optimal' | 'acceptable' | 'needs_attention';
  userAcceptance: 'approved' | 'pending' | 'rejected';
}

export interface PhaseResult {
  phase: MigrationPhase;
  status: 'completed' | 'completed_with_issues' | 'failed';
  duration: number; // hours
  recordsProcessed: number;
  successRate: number; // percentage
  issues: string[];
  notes: string;
}

export interface ValidationResult {
  category: 'data_integrity' | 'business_rules' | 'performance' | 'security';
  testName: string;
  status: 'passed' | 'failed' | 'warning';
  description: string;
  details?: string;
  impact?: 'low' | 'medium' | 'high';
}

export interface PerformanceMetric {
  metric: string;
  value: number;
  unit: string;
  baseline?: number;
  target?: number;
  status: 'meeting_target' | 'below_target' | 'exceeding_target';
}

export interface MigrationIssue {
  id: string;
  phase: MigrationPhase;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: string;
  description: string;
  impact: string;
  resolution?: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
}

export interface PostMigrationRecommendation {
  category: 'optimization' | 'training' | 'workflow' | 'maintenance';
  priority: 'immediate' | 'short_term' | 'long_term';
  description: string;
  benefits: string;
  effort: 'low' | 'medium' | 'high';
  timeline: string;
}

export interface TrainingProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  
  // Module completion tracking
  completedModules: TrainingModule[];
  currentModule?: TrainingModule;
  totalModules: number;
  progressPercentage: number;
  
  // Learning paths
  learningPath: LearningPath;
  adaptivePath: boolean;
  personalizedContent: boolean;
  
  // Assessments and certifications
  assessmentScores: AssessmentScore[];
  certifications: Certification[];
  skillsAcquired: Skill[];
  
  // Engagement metrics
  timeSpent: number; // minutes
  sessionsCompleted: number;
  averageScore: number;
  engagementLevel: 'low' | 'medium' | 'high';
  
  // Support and assistance
  helpRequestsCount: number;
  tutoringSessions: TutoringSession[];
  lastActivity: Date;
}

export type TrainingModule = 
  | 'platform_overview'
  | 'navigation_basics'
  | 'customer_management'
  | 'job_creation'
  | 'scheduling_dispatch'
  | 'time_tracking'
  | 'equipment_management'
  | 'safety_compliance'
  | 'silica_monitoring'
  | 'reporting_analytics'
  | 'mobile_app_usage'
  | 'billing_invoicing'
  | 'project_management'
  | 'inventory_management'
  | 'document_management'
  | 'integration_setup'
  | 'advanced_features'
  | 'admin_functions'
  | 'troubleshooting'
  | 'best_practices';

export interface LearningPath {
  name: string;
  description: string;
  recommendedForRole: string[];
  modules: ModuleSequence[];
  estimatedDuration: number; // hours
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: string[];
}

export interface ModuleSequence {
  module: TrainingModule;
  order: number;
  required: boolean;
  estimatedTime: number; // minutes
  dependencies: TrainingModule[];
}

export interface AssessmentScore {
  module: TrainingModule;
  score: number; // percentage
  maxScore: number;
  attempts: number;
  passedOn: Date;
  timeSpent: number; // minutes
  areasMastered: string[];
  areasForImprovement: string[];
}

export interface Certification {
  name: string;
  module: TrainingModule;
  issuedDate: Date;
  expiryDate?: Date;
  certificateId: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  skills: string[];
}

export interface Skill {
  name: string;
  category: 'navigation' | 'data_entry' | 'reporting' | 'safety' | 'technical';
  level: 'novice' | 'competent' | 'proficient' | 'expert';
  acquiredDate: Date;
  validatedBy: string;
}

export interface TutoringSession {
  id: string;
  scheduledDate: Date;
  duration: number; // minutes
  tutor: string;
  topics: string[];
  materials: string[];
  notes: string;
  followUpRequired: boolean;
  satisfaction: number; // 1-5 rating
}

export interface SystemSetupProgress {
  status: 'not_started' | 'in_progress' | 'completed';
  
  // Core setup tasks
  setupTasks: SetupTask[];
  completedTasks: string[];
  totalTasks: number;
  progressPercentage: number;
  
  // Configuration areas
  userManagement: UserManagementSetup;
  workOrderSetup: WorkOrderSetup;
  equipmentSetup: EquipmentSetup;
  safetySetup: SafetySetup;
  integrationSetup: IntegrationSetup;
  mobileSetup: MobileSetup;
  
  // Testing and validation
  systemTesting: SystemTesting;
  userAcceptanceTesting: UserAcceptanceTesting;
  
  // Go-live preparation
  goLiveChecklist: GoLiveItem[];
  readinessScore: number; // 0-100
  blockers: SystemBlocker[];
}

export interface SetupTask {
  id: string;
  name: string;
  description: string;
  category: 'users' | 'configuration' | 'data' | 'testing' | 'training';
  priority: 'high' | 'medium' | 'low';
  estimatedTime: number; // minutes
  dependencies: string[];
  assignedTo?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  completedAt?: Date;
  notes?: string;
}

export interface UserManagementSetup {
  usersCreated: number;
  rolesConfigured: boolean;
  permissionsSet: boolean;
  teamStructureSetup: boolean;
  accessLevelsConfigured: boolean;
  ssoConfigured?: boolean;
  securityPoliciesSet: boolean;
}

export interface WorkOrderSetup {
  workTypesConfigured: boolean;
  workflowsSetup: boolean;
  approvalProcessesSetup: boolean;
  automationRulesConfigured: boolean;
  templatesCreated: boolean;
  statusesCustomized: boolean;
  pricingSetup: boolean;
}

export interface EquipmentSetup {
  assetsRegistered: number;
  categoriesSetup: boolean;
  maintenanceSchedulesConfigured: boolean;
  beaconsAssigned: number;
  trackingConfigured: boolean;
  utilizationMetricsSetup: boolean;
  alertsConfigured: boolean;
}

export interface SafetySetup {
  complianceFrameworkSetup: boolean;
  silicaMonitoringConfigured: boolean;
  ppeRequirementsSetup: boolean;
  incidentReportingConfigured: boolean;
  trainingRequirementsSetup: boolean;
  auditSchedulesSetup: boolean;
  alertsConfigured: boolean;
}

export interface IntegrationSetup {
  accountingIntegration?: IntegrationStatus;
  crmIntegration?: IntegrationStatus;
  estimatingIntegration?: IntegrationStatus;
  weatherIntegration?: IntegrationStatus;
  telematicsIntegration?: IntegrationStatus;
  customIntegrations: CustomIntegration[];
}

export interface IntegrationStatus {
  name: string;
  status: 'not_configured' | 'configured' | 'tested' | 'active' | 'error';
  provider: string;
  lastSync?: Date;
  errorMessage?: string;
}

export interface CustomIntegration {
  name: string;
  type: 'api' | 'webhook' | 'file_transfer' | 'database';
  status: IntegrationStatus['status'];
  configuration: any;
  testResults?: string;
}

export interface MobileSetup {
  mobileAppDownloaded: boolean;
  devicesConfigured: number;
  offlineCapabilityTested: boolean;
  pushNotificationsSetup: boolean;
  locationServicesEnabled: boolean;
  cameraPermissionsGranted: boolean;
  fieldTesting: FieldTestingStatus;
}

export interface FieldTestingStatus {
  testScenariosCompleted: number;
  totalTestScenarios: number;
  connectivityTested: boolean;
  usabilityTested: boolean;
  performanceTested: boolean;
  userFeedback: UserFeedback[];
}

export interface UserFeedback {
  userId: string;
  scenario: string;
  rating: number; // 1-5
  comments: string;
  issues: string[];
  suggestions: string[];
  timestamp: Date;
}

export interface SystemTesting {
  functionalTesting: TestingResult;
  integrationTesting: TestingResult;
  performanceTesting: TestingResult;
  securityTesting: TestingResult;
  userAcceptanceTesting: TestingResult;
  regressionTesting: TestingResult;
}

export interface TestingResult {
  status: 'not_started' | 'in_progress' | 'completed' | 'failed';
  testCases: number;
  passed: number;
  failed: number;
  blocked: number;
  coverage: number; // percentage
  startDate?: Date;
  endDate?: Date;
  issues: TestIssue[];
}

export interface TestIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  steps: string[];
  expectedResult: string;
  actualResult: string;
  status: 'open' | 'in_progress' | 'resolved' | 'deferred';
  assignedTo?: string;
}

export interface UserAcceptanceTesting {
  scenarios: UATScenario[];
  usersParticipating: number;
  scenariosCompleted: number;
  overallSatisfaction: number; // 1-5
  approvalStatus: 'pending' | 'approved' | 'approved_with_conditions' | 'rejected';
  feedback: UATFeedback[];
}

export interface UATScenario {
  id: string;
  name: string;
  description: string;
  steps: string[];
  expectedOutcome: string;
  businessValue: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignedUsers: string[];
  results: UATResult[];
}

export interface UATResult {
  userId: string;
  status: 'passed' | 'failed' | 'partially_passed';
  timeToComplete: number; // minutes
  difficulty: number; // 1-5
  satisfaction: number; // 1-5
  comments: string;
  issues: string[];
  completedAt: Date;
}

export interface UATFeedback {
  userId: string;
  category: 'usability' | 'performance' | 'functionality' | 'training';
  rating: number; // 1-5
  feedback: string;
  suggestions: string[];
  timestamp: Date;
}

export interface GoLiveItem {
  id: string;
  name: string;
  description: string;
  category: 'technical' | 'business' | 'training' | 'support';
  priority: 'critical' | 'high' | 'medium' | 'low';
  responsible: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  dueDate?: Date;
  completedAt?: Date;
  notes?: string;
  verificationRequired: boolean;
  verifiedBy?: string;
}

export interface SystemBlocker {
  id: string;
  type: 'technical' | 'data' | 'training' | 'resource' | 'external';
  description: string;
  impact: 'low' | 'medium' | 'high' | 'critical';
  resolution: string;
  assignedTo: string;
  targetResolution: Date;
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  escalationLevel?: number;
}

export interface SupportTicket {
  id: string;
  category: 'technical' | 'training' | 'data' | 'process' | 'billing';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  
  assignedTo?: string;
  submittedBy: string;
  submittedAt: Date;
  lastUpdated: Date;
  resolvedAt?: Date;
  
  onboardingStep?: OnboardingStep;
  resolutionTime?: number; // hours
  customerSatisfaction?: number; // 1-5
  
  updates: TicketUpdate[];
  attachments: string[];
  relatedArticles: string[];
}

export interface TicketUpdate {
  id: string;
  author: string;
  type: 'comment' | 'status_change' | 'assignment' | 'resolution';
  content: string;
  timestamp: Date;
  internal: boolean;
  attachments?: string[];
}

export interface OnboardingPreferences {
  communicationFrequency: 'daily' | 'weekly' | 'as_needed';
  preferredContactMethod: 'email' | 'phone' | 'chat' | 'video';
  trainingPace: 'self_paced' | 'guided' | 'intensive';
  supportLevel: 'minimal' | 'standard' | 'premium';
  businessHours: BusinessHours;
  timezone: string;
  language: string;
  
  customizationLevel: 'minimal' | 'moderate' | 'extensive';
  integrationPriority: 'low' | 'medium' | 'high';
  dataMigrationUrgency: 'flexible' | 'standard' | 'urgent';
  goLiveApproach: 'phased' | 'big_bang' | 'pilot';
}

export interface BusinessHours {
  monday: TimeRange;
  tuesday: TimeRange;
  wednesday: TimeRange;
  thursday: TimeRange;
  friday: TimeRange;
  saturday?: TimeRange;
  sunday?: TimeRange;
  holidays: Date[];
}

export interface TimeRange {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface OnboardingNotification {
  id: string;
  type: 'reminder' | 'milestone' | 'alert' | 'tip' | 'update';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  read: boolean;
  actionRequired: boolean;
  actionUrl?: string;
  expiresAt?: Date;
  createdAt: Date;
}

// Event types for tracking onboarding progress
export interface OnboardingEvent {
  sessionId: string;
  userId: string;
  eventType: OnboardingEventType;
  step?: OnboardingStep;
  timestamp: Date;
  data?: any;
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

// Metrics and analytics for onboarding optimization
export interface OnboardingMetrics {
  // Completion metrics
  completionRate: number; // percentage
  averageCompletionTime: number; // days
  dropOffPoints: StepMetrics[];
  
  // Engagement metrics
  sessionDuration: number; // minutes
  stepsPerSession: number;
  returnRate: number; // percentage
  
  // Support metrics
  supportTicketsPerOnboarding: number;
  resolutionTime: number; // hours
  customerSatisfaction: number; // 1-5
  
  // Migration metrics
  migrationSuccessRate: number; // percentage
  dataQualityScore: number; // 0-100
  migrationTime: number; // hours
  
  // Training metrics
  trainingCompletionRate: number; // percentage
  averageAssessmentScore: number; // percentage
  certificationRate: number; // percentage
  
  // System adoption metrics
  featureAdoptionRate: number; // percentage
  activeUserRate: number; // percentage
  systemUtilization: number; // percentage
}

export interface StepMetrics {
  step: OnboardingStep;
  completionRate: number; // percentage
  averageTime: number; // minutes
  dropOffRate: number; // percentage
  helpRequestRate: number; // percentage
  errorRate: number; // percentage
  userSatisfaction: number; // 1-5
}