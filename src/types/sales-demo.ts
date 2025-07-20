/**
 * Sales Demo Types for Pontifex Industries
 * Comprehensive types for showcasing advantages over DSM Software
 */

export interface SalesDemoData {
  company: DemoCompany;
  jobs: DemoJob[];
  equipment: DemoEquipment[];
  employees: DemoEmployee[];
  customers: DemoCustomer[];
  realTimeData: RealTimeDemo;
  metrics: BusinessMetrics;
  comparisons: DSMComparison;
  scenarios: DemoScenario[];
}

export interface DemoCompany {
  id: string;
  name: string;
  type: 'concrete_cutting' | 'demolition' | 'construction';
  location: DemoLocation;
  established: number;
  employees: number;
  annualRevenue: number;
  serviceAreas: string[];
  specialties: ConcreteService[];
  equipment: {
    coredrills: number;
    wallsaws: number;
    slabsaws: number;
    wiresaws: number;
    vehicles: number;
  };
  currentChallenges: string[];
  goals: string[];
}

export interface DemoLocation {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
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
  | 'surface_preparation'
  | 'joint_sealing';

export interface DemoJob {
  id: string;
  jobNumber: string;
  title: string;
  customer: string;
  customerId: string;
  
  // Job details
  service: ConcreteService;
  description: string;
  location: DemoLocation;
  
  // Scheduling
  scheduledDate: Date;
  estimatedDuration: number; // hours
  actualStartTime?: Date;
  actualEndTime?: Date;
  
  // Crew and equipment
  assignedCrew: string[];
  requiredEquipment: string[];
  assignedEquipment: string[];
  
  // Status and progress
  status: JobStatus;
  progress: number; // 0-100
  lastUpdate: Date;
  
  // Financial
  estimatedValue: number;
  actualCost?: number;
  profitMargin?: number;
  
  // Safety and compliance
  safetyBriefingCompleted: boolean;
  silicaMonitoringRequired: boolean;
  ppeRequired: string[];
  incidentsReported: number;
  
  // Photos and documentation
  photos: DemoPhoto[];
  documents: DemoDocument[];
  notes: DemoNote[];
  
  // Real-time data
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  equipmentStatus: EquipmentStatus[];
  
  // Customer communication
  customerNotifications: CustomerNotification[];
  customerSatisfaction?: number; // 1-5
}

export type JobStatus = 
  | 'scheduled'
  | 'in_progress'
  | 'on_hold'
  | 'completed'
  | 'cancelled'
  | 'delayed';

export interface DemoEquipment {
  id: string;
  name: string;
  type: EquipmentType;
  model: string;
  serialNumber: string;
  
  // Status and location
  status: 'available' | 'in_use' | 'maintenance' | 'out_of_service';
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
    accuracy: number;
  };
  
  // Assignment
  assignedJob?: string;
  assignedOperator?: string;
  
  // Maintenance
  lastMaintenance: Date;
  nextMaintenanceDue: Date;
  maintenanceHours: number;
  totalHours: number;
  
  // Performance metrics
  utilizationRate: number; // percentage
  efficiency: number; // percentage
  costPerHour: number;
  
  // Tracking technology
  gpsEnabled: boolean;
  bluetoothBeacon?: BluetoothBeacon;
  
  // Maintenance history
  maintenanceHistory: MaintenanceRecord[];
  
  // Real-time monitoring
  realTimeData?: EquipmentRealTimeData;
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
  | 'trailer';

export interface BluetoothBeacon {
  id: string;
  batteryLevel: number;
  signalStrength: number;
  lastSeen: Date;
  range: number; // meters
}

export interface EquipmentRealTimeData {
  engineHours: number;
  fuelLevel?: number;
  temperature: number;
  vibration: number;
  dustLevel?: number;
  waterLevel?: number;
  pressure?: number;
  alerts: EquipmentAlert[];
}

export interface EquipmentAlert {
  type: 'maintenance' | 'safety' | 'performance' | 'location';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface MaintenanceRecord {
  id: string;
  date: Date;
  type: 'routine' | 'repair' | 'emergency' | 'inspection';
  description: string;
  cost: number;
  technician: string;
  partsReplaced: string[];
  nextServiceDue: Date;
}

export interface EquipmentStatus {
  equipmentId: string;
  status: 'operational' | 'warning' | 'error' | 'offline';
  batteryLevel?: number;
  location?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  performance: {
    efficiency: number;
    utilization: number;
    alerts: number;
  };
}

export interface DemoEmployee {
  id: string;
  firstName: string;
  lastName: string;
  role: EmployeeRole;
  certifications: string[];
  
  // Contact
  email: string;
  phone: string;
  
  // Status
  status: 'active' | 'on_job' | 'off_duty' | 'vacation';
  currentJob?: string;
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  
  // Performance
  hourlyRate: number;
  hoursWorked: number;
  efficiency: number;
  safetyScore: number;
  customerRating: number;
  
  // Training and certifications
  trainingCompleted: string[];
  certificationsExpiring: CertificationExpiry[];
  
  // Time tracking
  clockedIn: boolean;
  clockInTime?: Date;
  timeEntries: TimeEntry[];
}

export type EmployeeRole = 
  | 'operator'
  | 'foreman'
  | 'supervisor'
  | 'safety_officer'
  | 'project_manager'
  | 'estimator'
  | 'office_admin';

export interface CertificationExpiry {
  certification: string;
  expiryDate: Date;
  renewalRequired: boolean;
}

export interface TimeEntry {
  date: Date;
  jobId: string;
  startTime: Date;
  endTime?: Date;
  hours: number;
  type: 'regular' | 'overtime' | 'travel' | 'safety_meeting';
  approved: boolean;
}

export interface DemoCustomer {
  id: string;
  name: string;
  type: 'general_contractor' | 'property_owner' | 'developer' | 'government' | 'industrial';
  
  // Contact information
  primaryContact: {
    name: string;
    title: string;
    email: string;
    phone: string;
  };
  
  // Business details
  address: DemoLocation;
  website?: string;
  industry: string;
  
  // Relationship metrics
  totalJobs: number;
  totalRevenue: number;
  averageJobValue: number;
  paymentTerms: number; // days
  creditRating: 'A' | 'B' | 'C' | 'D';
  
  // Satisfaction and feedback
  satisfactionScore: number; // 1-5
  referrals: number;
  complaints: number;
  
  // Project history
  recentJobs: string[];
  preferredServices: ConcreteService[];
  
  // Communication preferences
  communicationPreferences: {
    jobUpdates: boolean;
    arrivalNotifications: boolean;
    completionAlerts: boolean;
    invoiceDelivery: 'email' | 'mail' | 'portal';
  };
}

export interface DemoPhoto {
  id: string;
  url: string;
  caption: string;
  timestamp: Date;
  location?: {
    lat: number;
    lng: number;
  };
  takenBy: string;
  category: 'before' | 'during' | 'after' | 'safety' | 'equipment' | 'documentation';
}

export interface DemoDocument {
  id: string;
  name: string;
  type: 'permit' | 'drawing' | 'specification' | 'safety_report' | 'invoice' | 'contract';
  url: string;
  uploadedBy: string;
  uploadedAt: Date;
  version: string;
}

export interface DemoNote {
  id: string;
  content: string;
  author: string;
  timestamp: Date;
  category: 'general' | 'safety' | 'technical' | 'customer' | 'billing';
  priority: 'low' | 'medium' | 'high';
}

export interface CustomerNotification {
  id: string;
  type: 'job_scheduled' | 'crew_dispatched' | 'arrival_eta' | 'job_started' | 'job_completed' | 'invoice_ready';
  message: string;
  sentAt: Date;
  method: 'email' | 'sms' | 'push' | 'portal';
  read: boolean;
}

export interface RealTimeDemo {
  activeJobs: number;
  equipmentInUse: number;
  crewsOnSite: number;
  
  // Live tracking
  jobUpdates: LiveJobUpdate[];
  equipmentLocations: LiveEquipmentLocation[];
  safetyAlerts: LiveSafetyAlert[];
  
  // Performance metrics
  todaysMetrics: DailyMetrics;
  liveRevenue: number;
  efficiency: number;
}

export interface LiveJobUpdate {
  jobId: string;
  update: string;
  timestamp: Date;
  location: {
    lat: number;
    lng: number;
  };
  photos?: string[];
}

export interface LiveEquipmentLocation {
  equipmentId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  status: 'moving' | 'stationary' | 'working';
  speed?: number; // mph
  heading?: number; // degrees
}

export interface LiveSafetyAlert {
  id: string;
  type: 'silica_exposure' | 'ppe_violation' | 'equipment_malfunction' | 'environmental';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: {
    lat: number;
    lng: number;
  };
  message: string;
  timestamp: Date;
  acknowledged: boolean;
  jobId?: string;
  equipmentId?: string;
  employeeId?: string;
}

export interface DailyMetrics {
  date: Date;
  
  // Financial
  revenue: number;
  costs: number;
  profit: number;
  profitMargin: number;
  
  // Operational
  jobsCompleted: number;
  jobsInProgress: number;
  equipmentUtilization: number;
  crewEfficiency: number;
  
  // Safety
  safetyIncidents: number;
  silicaExposureEvents: number;
  ppeComplianceRate: number;
  
  // Customer
  customerSatisfaction: number;
  onTimeDelivery: number;
  communicationScore: number;
}

export interface BusinessMetrics {
  // Financial performance
  monthlyRevenue: MonthlyData[];
  profitability: ProfitabilityData;
  
  // Operational efficiency
  equipmentUtilization: UtilizationData[];
  jobCompletionTimes: CompletionTimeData[];
  
  // Customer metrics
  customerSatisfaction: SatisfactionData[];
  customerRetention: RetentionData;
  
  // Safety and compliance
  safetyMetrics: SafetyMetricsData;
  complianceScores: ComplianceData[];
  
  // Competitive advantages
  dsmComparison: CompetitorComparison;
}

export interface MonthlyData {
  month: string;
  year: number;
  revenue: number;
  growth: number; // percentage
}

export interface ProfitabilityData {
  grossMargin: number;
  netMargin: number;
  costReduction: number; // vs DSM
  efficiencyGains: number; // percentage
}

export interface UtilizationData {
  equipmentType: EquipmentType;
  utilization: number; // percentage
  improvement: number; // vs DSM
}

export interface CompletionTimeData {
  service: ConcreteService;
  averageTime: number; // hours
  improvement: number; // percentage vs DSM
}

export interface SatisfactionData {
  month: string;
  score: number;
  improvement: number; // vs DSM
}

export interface RetentionData {
  rate: number; // percentage
  improvement: number; // vs DSM
  valueIncrease: number; // dollar amount
}

export interface SafetyMetricsData {
  incidentRate: number;
  complianceScore: number;
  silicaMonitoring: {
    monitored: number;
    compliant: number;
    alerts: number;
  };
  training: {
    completed: number;
    upToDate: number;
    certifications: number;
  };
}

export interface ComplianceData {
  area: string;
  score: number;
  improvement: number; // vs DSM
}

export interface CompetitorComparison {
  dsm: DSMCapabilities;
  pontifex: PontifexCapabilities;
  advantages: CompetitiveAdvantage[];
}

export interface DSMCapabilities {
  jobManagement: CapabilityScore;
  customerManagement: CapabilityScore;
  equipmentTracking: CapabilityScore;
  safetyCompliance: CapabilityScore;
  reporting: CapabilityScore;
  mobileAccess: CapabilityScore;
  realTimeUpdates: CapabilityScore;
  automation: CapabilityScore;
}

export interface PontifexCapabilities {
  jobManagement: CapabilityScore;
  customerManagement: CapabilityScore;
  equipmentTracking: CapabilityScore;
  safetyCompliance: CapabilityScore;
  reporting: CapabilityScore;
  mobileAccess: CapabilityScore;
  realTimeUpdates: CapabilityScore;
  automation: CapabilityScore;
  advancedAnalytics: CapabilityScore;
  bluetoothTracking: CapabilityScore;
  oshaCompliance: CapabilityScore;
  predictiveMaintenance: CapabilityScore;
}

export interface CapabilityScore {
  score: number; // 1-10
  description: string;
  features: string[];
}

export interface CompetitiveAdvantage {
  category: string;
  advantage: string;
  impact: 'high' | 'medium' | 'low';
  quantifiableBenefit?: string;
  demoScenario?: string;
}

export interface DSMComparison {
  featureComparison: FeatureComparison[];
  costComparison: CostComparison;
  roiCalculation: ROICalculation;
  migrationBenefits: MigrationBenefit[];
}

export interface FeatureComparison {
  feature: string;
  dsm: {
    available: boolean;
    rating: number; // 1-5
    description: string;
    limitations?: string[];
  };
  pontifex: {
    available: boolean;
    rating: number; // 1-5
    description: string;
    advantages?: string[];
  };
  impactArea: 'efficiency' | 'safety' | 'customer_satisfaction' | 'cost_reduction' | 'compliance';
}

export interface CostComparison {
  dsm: {
    licenseCost: number;
    implementationCost: number;
    trainingCost: number;
    maintenanceCost: number;
    totalCostPerYear: number;
  };
  pontifex: {
    licenseCost: number;
    implementationCost: number;
    trainingCost: number;
    maintenanceCost: number;
    totalCostPerYear: number;
  };
  savings: {
    yearly: number;
    percentage: number;
    breakEvenMonths: number;
  };
}

export interface ROICalculation {
  timeToROI: number; // months
  yearOneROI: number; // percentage
  threeYearROI: number; // percentage
  totalSavings: number; // 3 years
  
  savingsBreakdown: {
    operationalEfficiency: number;
    reducedDowntime: number;
    improvedSafety: number;
    customerRetention: number;
    regulatoryCompliance: number;
  };
}

export interface MigrationBenefit {
  category: string;
  benefit: string;
  quantifiedValue: number;
  timeframe: string;
  demoData?: any;
}

export interface DemoScenario {
  id: string;
  name: string;
  description: string;
  category: 'efficiency' | 'safety' | 'customer_experience' | 'cost_savings' | 'compliance';
  
  // Scenario setup
  setup: ScenarioSetup;
  
  // DSM approach
  dsmApproach: ScenarioStep[];
  dsmLimitations: string[];
  dsmOutcome: ScenarioOutcome;
  
  // Pontifex approach
  pontifexApproach: ScenarioStep[];
  pontifexAdvantages: string[];
  pontifexOutcome: ScenarioOutcome;
  
  // Comparison
  keyDifferences: string[];
  quantifiedBenefits: QuantifiedBenefit[];
  
  // Demo data
  demoData: any;
  visualizations: DemoVisualization[];
}

export interface ScenarioSetup {
  situation: string;
  challenges: string[];
  goals: string[];
  constraints: string[];
}

export interface ScenarioStep {
  step: number;
  action: string;
  timeRequired: number; // minutes
  tools: string[];
  outcome: string;
}

export interface ScenarioOutcome {
  timeToComplete: number; // minutes
  accuracy: number; // percentage
  customerSatisfaction: number; // 1-5
  costImpact: number; // dollars
  safetyScore: number; // 1-5
}

export interface QuantifiedBenefit {
  metric: string;
  dsmValue: number;
  pontifexValue: number;
  improvement: number; // percentage
  annualImpact: number; // dollars
}

export interface DemoVisualization {
  type: 'chart' | 'map' | 'dashboard' | 'comparison' | 'timeline';
  title: string;
  data: any;
  insights: string[];
}

// Demo script and presentation types
export interface DemoScript {
  scenarios: DemoScenarioScript[];
  talkingPoints: TalkingPoint[];
  objectionHandling: ObjectionResponse[];
  closingPoints: string[];
}

export interface DemoScenarioScript {
  scenarioId: string;
  introduction: string;
  walkthrough: DemoWalkthrough[];
  keyMessages: string[];
  transitionToNext: string;
}

export interface DemoWalkthrough {
  step: string;
  userAction: string;
  systemResponse: string;
  highlight: string;
  customerBenefit: string;
}

export interface TalkingPoint {
  topic: string;
  message: string;
  supportingData: string[];
  visualAid?: string;
}

export interface ObjectionResponse {
  objection: string;
  response: string;
  supportingData: string[];
  demoEvidence?: string;
}