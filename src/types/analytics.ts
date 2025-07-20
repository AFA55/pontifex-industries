/**
 * Real-time Analytics Types and Interfaces
 * Superior to DSM's static reporting with live data streams and predictive analytics
 */

// Time Range Types
export type TimeRange = '1h' | '4h' | '8h' | '24h' | '7d' | '30d' | 'custom';
export type RefreshRate = 'realtime' | '10s' | '30s' | '1m' | '5m' | 'manual';
export type AggregationInterval = '1m' | '5m' | '15m' | '30m' | '1h' | '1d';

// Real-time Job Progress Analytics
export interface JobProgressMetrics {
  jobId: string;
  workOrderNumber: string;
  jobTitle: string;
  customerName: string;
  
  // Progress Indicators
  overallProgress: number; // 0-100%
  milestoneProgress: JobMilestone[];
  estimatedCompletion: Date;
  confidenceScore: number; // 0-100% confidence in estimate
  
  // Real-time Status
  currentPhase: string;
  activeCrewCount: number;
  activeEquipmentCount: number;
  currentLocation: LocationData;
  
  // Performance vs Plan
  scheduleVariance: number; // days ahead/behind
  budgetVariance: number; // percentage over/under
  productivityIndex: number; // actual vs planned productivity
  
  // Live Activity
  lastActivityTime: Date;
  currentActivity: string;
  recentEvents: JobEvent[];
  
  // Risk Indicators
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  
  // Quality Metrics
  qualityScore: number; // 0-100
  safetyScore: number; // 0-100
  reworkPercentage: number;
}

export interface JobMilestone {
  name: string;
  plannedDate: Date;
  actualDate?: Date;
  projectedDate?: Date;
  percentComplete: number;
  dependencies: string[];
  criticalPath: boolean;
}

export interface JobEvent {
  timestamp: Date;
  type: 'progress' | 'safety' | 'equipment' | 'crew' | 'material' | 'weather';
  description: string;
  impact: 'positive' | 'neutral' | 'negative';
  severity: 'low' | 'medium' | 'high';
}

export interface RiskFactor {
  type: 'schedule' | 'safety' | 'weather' | 'resource' | 'compliance';
  description: string;
  probability: number; // 0-100%
  impact: number; // 1-10
  mitigation: string;
}

// Equipment Utilization Analytics
export interface EquipmentUtilizationMetrics {
  equipmentId: string;
  assetCode: string;
  assetName: string;
  category: string;
  
  // Real-time Status (from Bluetooth beacons)
  currentStatus: 'idle' | 'active' | 'maintenance' | 'transit' | 'offline';
  currentLocation: LocationData;
  currentOperator?: string;
  currentJob?: string;
  lastSeen: Date;
  batteryLevel?: number;
  signalStrength?: number;
  
  // Utilization Metrics
  utilizationRate: number; // 0-100% for current period
  activeHours: number;
  idleHours: number;
  maintenanceHours: number;
  
  // Productivity Metrics
  productivityScore: number; // 0-100
  outputRate: number; // units per hour
  efficiencyRating: number; // actual vs optimal
  
  // Historical Trends
  utilizationTrend: TrendData;
  dailyUtilization: HourlyUtilization[];
  weeklyPattern: DayOfWeekPattern[];
  
  // Predictive Analytics
  nextMaintenanceDue: Date;
  maintenanceUrgency: 'routine' | 'soon' | 'urgent' | 'overdue';
  failureProbability: number; // 0-100%
  recommendedAction?: string;
  
  // Cost Analysis
  operatingCostPerHour: number;
  revenuePerHour: number;
  profitabilityIndex: number;
  
  // Compliance
  certificationStatus: 'valid' | 'expiring' | 'expired';
  operatorCertified: boolean;
  safetyCheckStatus: 'passed' | 'pending' | 'failed';
}

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: Date;
  source: 'gps' | 'beacon' | 'manual';
  siteName?: string;
  zoneId?: string;
}

export interface TrendData {
  direction: 'up' | 'down' | 'stable';
  percentageChange: number;
  periodComparison: string; // e.g., "vs last week"
  sparklineData: number[];
}

export interface HourlyUtilization {
  hour: number; // 0-23
  utilization: number; // 0-100%
  jobs: number;
  revenue: number;
}

export interface DayOfWeekPattern {
  dayOfWeek: number; // 0-6
  averageUtilization: number;
  peakHours: number[];
  typicalJobs: string[];
}

// Crew Productivity Analytics
export interface CrewProductivityMetrics {
  employeeId: string;
  employeeName: string;
  role: string;
  team?: string;
  
  // Real-time Status (from beacons + time tracking)
  currentStatus: 'on-site' | 'nearby' | 'off-site' | 'break' | 'offline';
  currentLocation: LocationData;
  currentJob?: string;
  currentTask?: string;
  checkInTime?: Date;
  
  // Productivity Metrics
  productivityScore: number; // 0-100
  hoursWorked: number;
  billableHours: number;
  utilizationRate: number; // billable/total
  
  // Performance Indicators
  tasksCompleted: number;
  tasksAssigned: number;
  completionRate: number;
  averageTaskTime: number;
  speedIndex: number; // vs team average
  
  // Quality Metrics
  qualityScore: number; // 0-100
  reworkRate: number;
  customerSatisfaction: number;
  safetyScore: number;
  
  // Skills & Efficiency
  skillLevel: 'apprentice' | 'journeyman' | 'expert' | 'master';
  certifications: CertificationStatus[];
  strengthAreas: string[];
  improvementAreas: string[];
  
  // Trend Analysis
  productivityTrend: TrendData;
  weeklyPattern: WeeklyProductivityPattern;
  monthlyGoalProgress: number; // 0-100%
  
  // Team Collaboration
  teamworkScore: number;
  communicationFrequency: number;
  peerRating: number;
  leadershipScore?: number;
  
  // Predictive Insights
  burnoutRisk: 'low' | 'medium' | 'high';
  trainingRecommendations: string[];
  optimalTaskAssignments: string[];
}

export interface CertificationStatus {
  name: string;
  status: 'valid' | 'expiring' | 'expired';
  expiryDate?: Date;
  renewalRequired: boolean;
}

export interface WeeklyProductivityPattern {
  mondayIndex: number;
  tuesdayIndex: number;
  wednesdayIndex: number;
  thursdayIndex: number;
  fridayIndex: number;
  saturdayIndex: number;
  sundayIndex: number;
  peakDay: string;
  lowDay: string;
}

// Safety Compliance Analytics
export interface SafetyComplianceMetrics {
  // Overall Compliance Score
  overallComplianceScore: number; // 0-100
  complianceStatus: 'compliant' | 'warning' | 'violation' | 'critical';
  lastAuditDate: Date;
  nextAuditDue: Date;
  
  // Real-time Safety Monitoring
  activeHazards: SafetyHazard[];
  activeViolations: SafetyViolation[];
  nearMissEvents: NearMissEvent[];
  
  // OSHA Compliance
  oshaCompliance: {
    status: 'compliant' | 'non-compliant';
    score: number;
    violations: OSHAViolation[];
    lastInspection: Date;
    recordableIncidents: number;
    daysWithoutIncident: number;
  };
  
  // Silica Monitoring (Concrete-specific)
  silicaMonitoring: {
    currentExposureLevel: number; // mg/m³
    permissibleLimit: number;
    complianceStatus: 'safe' | 'warning' | 'danger';
    activeControls: string[];
    monitoringDevices: SilicaMonitor[];
    workerExposures: WorkerExposure[];
  };
  
  // PPE Compliance
  ppeCompliance: {
    overallRate: number; // 0-100%
    byType: PPEComplianceByType[];
    violations: PPEViolation[];
    photoVerifications: number;
  };
  
  // Training & Certification
  trainingCompliance: {
    overallRate: number;
    overdueTrainings: OverdueTraining[];
    upcomingExpirations: CertificationExpiry[];
    completionRate: number;
  };
  
  // Equipment Safety
  equipmentSafety: {
    inspectionCompliance: number;
    overdueInspections: EquipmentInspection[];
    safetyIssues: EquipmentSafetyIssue[];
    lockoutTagoutCompliance: number;
  };
  
  // Environmental Compliance
  environmentalCompliance: {
    dustSuppressionActive: boolean;
    waterManagementScore: number;
    noiseLevel: number; // dB
    wasteDisposalCompliance: number;
  };
  
  // Trends & Predictions
  safetyTrend: TrendData;
  incidentPrediction: {
    riskLevel: 'low' | 'medium' | 'high';
    probability: number;
    factors: string[];
    preventiveMeasures: string[];
  };
}

export interface SafetyHazard {
  id: string;
  type: string;
  location: LocationData;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  reportedBy: string;
  reportedAt: Date;
  status: 'active' | 'mitigated' | 'resolved';
  assignedTo?: string;
}

export interface SafetyViolation {
  id: string;
  type: string;
  violator?: string;
  location: LocationData;
  timestamp: Date;
  description: string;
  correctiveAction: string;
  status: 'open' | 'addressed' | 'closed';
  severity: 'minor' | 'major' | 'critical';
}

export interface NearMissEvent {
  id: string;
  timestamp: Date;
  location: LocationData;
  description: string;
  potentialSeverity: 'low' | 'medium' | 'high' | 'catastrophic';
  rootCause?: string;
  correctiveActions: string[];
}

export interface OSHAViolation {
  standardCode: string;
  description: string;
  severity: 'de-minimis' | 'other' | 'serious' | 'willful' | 'repeat';
  fineAmount?: number;
  abatementDate?: Date;
  status: 'open' | 'abated' | 'contested';
}

export interface SilicaMonitor {
  deviceId: string;
  location: LocationData;
  currentReading: number;
  status: 'normal' | 'warning' | 'alert';
  lastCalibration: Date;
  batteryLevel: number;
}

export interface WorkerExposure {
  employeeId: string;
  employeeName: string;
  exposureLevel: number;
  duration: number; // minutes
  date: Date;
  protectionUsed: string[];
  complianceStatus: 'compliant' | 'exceeded';
}

export interface PPEComplianceByType {
  ppeType: string;
  requiredCount: number;
  compliantCount: number;
  complianceRate: number;
}

export interface PPEViolation {
  employeeId: string;
  ppeType: string;
  timestamp: Date;
  location: LocationData;
  photoEvidence?: string;
}

export interface OverdueTraining {
  employeeId: string;
  employeeName: string;
  trainingType: string;
  dueDate: Date;
  daysOverdue: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface CertificationExpiry {
  employeeId: string;
  employeeName: string;
  certification: string;
  expiryDate: Date;
  daysUntilExpiry: number;
  renewalStatus: 'not-started' | 'in-progress' | 'completed';
}

export interface EquipmentInspection {
  equipmentId: string;
  equipmentName: string;
  inspectionType: string;
  dueDate: Date;
  daysOverdue: number;
  lastInspection?: Date;
  priority: 'routine' | 'important' | 'critical';
}

export interface EquipmentSafetyIssue {
  equipmentId: string;
  issueType: string;
  severity: 'minor' | 'major' | 'critical';
  reportedDate: Date;
  status: 'open' | 'in-progress' | 'resolved';
  estimatedDowntime?: number;
}

// Aggregated Dashboard Data
export interface RealTimeAnalyticsDashboard {
  // Meta Information
  lastUpdated: Date;
  refreshRate: RefreshRate;
  timeRange: TimeRange;
  
  // High-Level KPIs
  kpis: {
    activeJobs: number;
    onTimeDelivery: number; // percentage
    equipmentUtilization: number; // percentage
    crewProductivity: number; // percentage
    safetyCompliance: number; // percentage
    revenue: number;
    profitability: number; // percentage
  };
  
  // Job Progress Overview
  jobProgress: {
    summary: JobProgressSummary;
    activeJobs: JobProgressMetrics[];
    criticalPath: JobProgressMetrics[];
    atRiskJobs: JobProgressMetrics[];
  };
  
  // Equipment Utilization Overview
  equipmentUtilization: {
    summary: EquipmentUtilizationSummary;
    byCategory: EquipmentCategoryUtilization[];
    topPerformers: EquipmentUtilizationMetrics[];
    underutilized: EquipmentUtilizationMetrics[];
    maintenanceAlerts: EquipmentUtilizationMetrics[];
  };
  
  // Crew Productivity Overview
  crewProductivity: {
    summary: CrewProductivitySummary;
    byTeam: TeamProductivity[];
    topPerformers: CrewProductivityMetrics[];
    improvementNeeded: CrewProductivityMetrics[];
    realTimeActivity: CrewActivityFeed[];
  };
  
  // Safety Compliance Overview
  safetyCompliance: {
    summary: SafetyComplianceSummary;
    criticalAlerts: SafetyAlert[];
    complianceByCategory: ComplianceCategory[];
    recentIncidents: SafetyIncident[];
    upcomingRequirements: SafetyRequirement[];
  };
  
  // Predictive Analytics
  predictions: {
    jobCompletions: JobCompletionPrediction[];
    equipmentFailures: EquipmentFailurePrediction[];
    safetyRisks: SafetyRiskPrediction[];
    resourceShortages: ResourceShortagePrediction[];
  };
  
  // Alerts & Notifications
  alerts: AnalyticsAlert[];
  
  // Trend Analysis
  trends: {
    productivity: TrendAnalysis;
    safety: TrendAnalysis;
    equipment: TrendAnalysis;
    financial: TrendAnalysis;
  };
}

// Summary Types
export interface JobProgressSummary {
  totalActive: number;
  onSchedule: number;
  behind: number;
  ahead: number;
  averageProgress: number;
  completedToday: number;
  startedToday: number;
}

export interface EquipmentUtilizationSummary {
  totalEquipment: number;
  activeNow: number;
  averageUtilization: number;
  maintenanceNeeded: number;
  offline: number;
  roi: number;
}

export interface CrewProductivitySummary {
  totalCrew: number;
  onSiteNow: number;
  averageProductivity: number;
  overtimeHours: number;
  billableRate: number;
}

export interface SafetyComplianceSummary {
  overallScore: number;
  activeViolations: number;
  daysWithoutIncident: number;
  upcomingAudits: number;
  trainingCompliance: number;
}

// Supporting Types
export interface EquipmentCategoryUtilization {
  category: string;
  equipmentCount: number;
  averageUtilization: number;
  revenue: number;
  topEquipment: string;
}

export interface TeamProductivity {
  teamName: string;
  memberCount: number;
  averageProductivity: number;
  projectsActive: number;
  hoursToday: number;
}

export interface CrewActivityFeed {
  timestamp: Date;
  employeeName: string;
  activity: string;
  location: string;
  impact: 'positive' | 'neutral' | 'negative';
}

export interface SafetyAlert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: LocationData;
  affectedPersonnel: string[];
  timestamp: Date;
  actionRequired: string;
}

export interface ComplianceCategory {
  category: string;
  score: number;
  status: 'compliant' | 'warning' | 'violation';
  issues: number;
  lastChecked: Date;
}

export interface SafetyIncident {
  id: string;
  type: string;
  severity: string;
  timestamp: Date;
  location: LocationData;
  involvedPersonnel: string[];
  description: string;
  status: 'open' | 'investigating' | 'closed';
}

export interface SafetyRequirement {
  type: string;
  description: string;
  dueDate: Date;
  affectedPersonnel: string[];
  complianceStatus: 'pending' | 'in-progress' | 'completed';
}

// Predictive Analytics Types
export interface JobCompletionPrediction {
  jobId: string;
  jobTitle: string;
  currentProgress: number;
  predictedCompletion: Date;
  confidence: number;
  riskFactors: string[];
}

export interface EquipmentFailurePrediction {
  equipmentId: string;
  equipmentName: string;
  failureProbability: number;
  predictedDate?: Date;
  recommendedMaintenance: string;
  estimatedDowntime: number;
}

export interface SafetyRiskPrediction {
  riskType: string;
  probability: number;
  location?: LocationData;
  contributingFactors: string[];
  preventiveMeasures: string[];
}

export interface ResourceShortagePrediction {
  resourceType: 'equipment' | 'crew' | 'material';
  resourceName: string;
  shortageDate: Date;
  impactedJobs: string[];
  recommendedAction: string;
}

// Analytics Alert
export interface AnalyticsAlert {
  id: string;
  category: 'job' | 'equipment' | 'crew' | 'safety' | 'financial';
  type: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: Date;
  data?: any;
  actions?: AlertAction[];
  acknowledged: boolean;
}

export interface AlertAction {
  label: string;
  action: string;
  primary?: boolean;
}

// Trend Analysis
export interface TrendAnalysis {
  period: string;
  currentValue: number;
  previousValue: number;
  change: number;
  changePercentage: number;
  trend: 'improving' | 'stable' | 'declining';
  forecast: ForecastPoint[];
  seasonality?: SeasonalityPattern;
}

export interface ForecastPoint {
  date: Date;
  value: number;
  confidence: number;
  upperBound: number;
  lowerBound: number;
}

export interface SeasonalityPattern {
  type: 'daily' | 'weekly' | 'monthly' | 'yearly';
  peakPeriods: string[];
  lowPeriods: string[];
  impact: number; // percentage impact
}

// Real-time Event Types for WebSocket
export interface RealTimeEvent {
  id: string;
  timestamp: Date;
  category: 'job' | 'equipment' | 'crew' | 'safety';
  type: string;
  data: any;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

// Filter and Configuration Types
export interface AnalyticsFilters {
  timeRange: TimeRange;
  jobIds?: string[];
  equipmentIds?: string[];
  employeeIds?: string[];
  teams?: string[];
  locations?: string[];
  categories?: string[];
  minScore?: number;
  alertTypes?: string[];
}

export interface DashboardConfiguration {
  layout: 'default' | 'compact' | 'detailed' | 'custom';
  refreshRate: RefreshRate;
  widgets: WidgetConfiguration[];
  theme: 'light' | 'dark' | 'auto';
  notifications: NotificationSettings;
}

export interface WidgetConfiguration {
  id: string;
  type: string;
  position: { x: number; y: number; w: number; h: number };
  settings: any;
  visible: boolean;
}

export interface NotificationSettings {
  enableDesktop: boolean;
  enableEmail: boolean;
  enableSMS: boolean;
  alertThresholds: {
    safety: 'all' | 'high' | 'critical';
    equipment: 'all' | 'high' | 'critical';
    productivity: 'all' | 'high' | 'critical';
  };
}