/**
 * Real-time Analytics Aggregation Service
 * Collects, processes, and streams analytics data from multiple sources
 */

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { 
  RealTimeAnalyticsDashboard,
  JobProgressMetrics,
  EquipmentUtilizationMetrics,
  CrewProductivityMetrics,
  SafetyComplianceMetrics,
  RealTimeEvent,
  TimeRange,
  RefreshRate,
  TrendData,
  LocationData,
  JobEvent,
  SafetyHazard,
  SafetyViolation,
  WorkerExposure,
  AlertAction
} from '@/types/analytics';

export class AnalyticsAggregationService {
  private supabase;
  private channels: Map<string, RealtimeChannel> = new Map();
  private subscribers: Map<string, Set<(data: any) => void>> = new Map();
  private aggregatedData: RealTimeAnalyticsDashboard | null = null;
  private updateInterval: NodeJS.Timeout | null = null;
  private webSocketConnections: Map<string, WebSocket> = new Map();

  constructor() {
    this.supabase = createClientComponentClient();
  }

  /**
   * Initialize the analytics service and start real-time data collection
   */
  async initialize(companyId: string, timeRange: TimeRange = '24h', refreshRate: RefreshRate = '30s'): Promise<void> {
    // Clean up any existing connections
    await this.cleanup();

    // Initialize aggregated data structure
    this.aggregatedData = await this.initializeAggregatedData(companyId, timeRange, refreshRate);

    // Set up real-time subscriptions
    await this.setupRealtimeSubscriptions(companyId);

    // Set up periodic data refresh based on refresh rate
    this.setupPeriodicRefresh(companyId, refreshRate);

    // Set up WebSocket connections for external data sources
    await this.setupWebSocketConnections(companyId);
  }

  /**
   * Initialize the aggregated data structure with current data
   */
  private async initializeAggregatedData(
    companyId: string, 
    timeRange: TimeRange, 
    refreshRate: RefreshRate
  ): Promise<RealTimeAnalyticsDashboard> {
    const [
      jobProgress,
      equipmentUtilization,
      crewProductivity,
      safetyCompliance,
      kpis
    ] = await Promise.all([
      this.fetchJobProgress(companyId, timeRange),
      this.fetchEquipmentUtilization(companyId, timeRange),
      this.fetchCrewProductivity(companyId, timeRange),
      this.fetchSafetyCompliance(companyId, timeRange),
      this.calculateKPIs(companyId, timeRange)
    ]);

    return {
      lastUpdated: new Date(),
      refreshRate,
      timeRange,
      kpis,
      jobProgress,
      equipmentUtilization,
      crewProductivity,
      safetyCompliance,
      predictions: await this.generatePredictions(companyId),
      alerts: await this.fetchActiveAlerts(companyId),
      trends: await this.analyzeTrends(companyId, timeRange)
    };
  }

  /**
   * Set up real-time database subscriptions
   */
  private async setupRealtimeSubscriptions(companyId: string): Promise<void> {
    // Subscribe to work order changes
    const workOrderChannel = this.supabase
      .channel(`work_orders_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'work_orders',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => this.handleWorkOrderChange(payload)
      );

    // Subscribe to time entry changes
    const timeEntryChannel = this.supabase
      .channel(`time_entries_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'time_entries',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => this.handleTimeEntryChange(payload)
      );

    // Subscribe to beacon readings
    const beaconChannel = this.supabase
      .channel(`beacon_readings_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'beacon_location_readings'
        },
        (payload) => this.handleBeaconReading(payload)
      );

    // Subscribe to safety events
    const safetyChannel = this.supabase
      .channel(`safety_events_${companyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'safety_incidents',
          filter: `company_id=eq.${companyId}`
        },
        (payload) => this.handleSafetyEvent(payload)
      );

    // Store channels for cleanup
    this.channels.set('work_orders', workOrderChannel);
    this.channels.set('time_entries', timeEntryChannel);
    this.channels.set('beacon_readings', beaconChannel);
    this.channels.set('safety_events', safetyChannel);

    // Subscribe all channels
    await Promise.all([
      workOrderChannel.subscribe(),
      timeEntryChannel.subscribe(),
      beaconChannel.subscribe(),
      safetyChannel.subscribe()
    ]);
  }

  /**
   * Set up periodic data refresh
   */
  private setupPeriodicRefresh(companyId: string, refreshRate: RefreshRate): void {
    const intervalMs = this.getRefreshIntervalMs(refreshRate);
    
    if (intervalMs > 0) {
      this.updateInterval = setInterval(async () => {
        await this.refreshAllData(companyId);
      }, intervalMs);
    }
  }

  /**
   * Set up WebSocket connections for external data sources
   */
  private async setupWebSocketConnections(companyId: string): Promise<void> {
    // Connect to silica monitoring system
    if (process.env.NEXT_PUBLIC_SILICA_MONITOR_WS_URL) {
      const silicaWs = new WebSocket(process.env.NEXT_PUBLIC_SILICA_MONITOR_WS_URL);
      
      silicaWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleSilicaMonitoringData(data);
      };

      this.webSocketConnections.set('silica_monitor', silicaWs);
    }

    // Connect to equipment telemetry system
    if (process.env.NEXT_PUBLIC_EQUIPMENT_TELEMETRY_WS_URL) {
      const equipmentWs = new WebSocket(process.env.NEXT_PUBLIC_EQUIPMENT_TELEMETRY_WS_URL);
      
      equipmentWs.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleEquipmentTelemetryData(data);
      };

      this.webSocketConnections.set('equipment_telemetry', equipmentWs);
    }
  }

  /**
   * Handle work order changes
   */
  private async handleWorkOrderChange(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
    if (!this.aggregatedData) return;

    const workOrder = payload.new || payload.old;
    const event: RealTimeEvent = {
      id: `wo_${Date.now()}`,
      timestamp: new Date(),
      category: 'job',
      type: payload.eventType,
      data: workOrder,
      priority: this.determineEventPriority(payload)
    };

    // Update job progress metrics
    await this.updateJobProgress(workOrder);

    // Notify subscribers
    this.notifySubscribers('job_progress', event);
    this.notifySubscribers('events', event);
  }

  /**
   * Handle time entry changes
   */
  private async handleTimeEntryChange(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
    if (!this.aggregatedData) return;

    const timeEntry = payload.new || payload.old;
    const event: RealTimeEvent = {
      id: `te_${Date.now()}`,
      timestamp: new Date(),
      category: 'crew',
      type: payload.eventType,
      data: timeEntry,
      priority: 'low'
    };

    // Update crew productivity metrics
    await this.updateCrewProductivity(timeEntry);

    // Notify subscribers
    this.notifySubscribers('crew_productivity', event);
    this.notifySubscribers('events', event);
  }

  /**
   * Handle beacon readings
   */
  private async handleBeaconReading(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
    if (!this.aggregatedData) return;

    const reading = payload.new;
    const event: RealTimeEvent = {
      id: `br_${Date.now()}`,
      timestamp: new Date(),
      category: 'equipment',
      type: 'location_update',
      data: reading,
      priority: 'low'
    };

    // Update equipment utilization based on beacon data
    await this.updateEquipmentLocation(reading);

    // Check for crew location updates
    await this.updateCrewLocation(reading);

    // Notify subscribers
    this.notifySubscribers('equipment_utilization', event);
    this.notifySubscribers('events', event);
  }

  /**
   * Handle safety events
   */
  private async handleSafetyEvent(payload: RealtimePostgresChangesPayload<any>): Promise<void> {
    if (!this.aggregatedData) return;

    const safetyEvent = payload.new || payload.old;
    const event: RealTimeEvent = {
      id: `se_${Date.now()}`,
      timestamp: new Date(),
      category: 'safety',
      type: payload.eventType,
      data: safetyEvent,
      priority: this.determineSafetyPriority(safetyEvent)
    };

    // Update safety compliance metrics
    await this.updateSafetyCompliance(safetyEvent);

    // Generate alerts if necessary
    if (event.priority === 'critical' || event.priority === 'high') {
      await this.generateSafetyAlert(safetyEvent);
    }

    // Notify subscribers
    this.notifySubscribers('safety_compliance', event);
    this.notifySubscribers('events', event);
  }

  /**
   * Handle silica monitoring data from WebSocket
   */
  private handleSilicaMonitoringData(data: any): void {
    if (!this.aggregatedData) return;

    const workerExposure: WorkerExposure = {
      employeeId: data.employeeId,
      employeeName: data.employeeName,
      exposureLevel: data.exposureLevel,
      duration: data.duration,
      date: new Date(data.timestamp),
      protectionUsed: data.ppe || [],
      complianceStatus: data.exposureLevel > 0.05 ? 'exceeded' : 'compliant'
    };

    // Update silica monitoring in safety compliance
    if (!this.aggregatedData.safetyCompliance.summary) return;

    const silicaMonitoring = this.aggregatedData.safetyCompliance.summary.silicaMonitoring;
    silicaMonitoring.currentExposureLevel = data.currentLevel;
    silicaMonitoring.complianceStatus = 
      data.currentLevel > silicaMonitoring.permissibleLimit ? 'danger' :
      data.currentLevel > silicaMonitoring.permissibleLimit * 0.5 ? 'warning' : 'safe';
    
    // Add worker exposure record
    silicaMonitoring.workerExposures.push(workerExposure);

    // Keep only last 100 exposure records
    if (silicaMonitoring.workerExposures.length > 100) {
      silicaMonitoring.workerExposures = silicaMonitoring.workerExposures.slice(-100);
    }

    // Notify subscribers
    const event: RealTimeEvent = {
      id: `sm_${Date.now()}`,
      timestamp: new Date(),
      category: 'safety',
      type: 'silica_monitoring',
      data: workerExposure,
      priority: workerExposure.complianceStatus === 'exceeded' ? 'high' : 'low'
    };

    this.notifySubscribers('safety_compliance', event);
    this.notifySubscribers('events', event);
  }

  /**
   * Handle equipment telemetry data from WebSocket
   */
  private handleEquipmentTelemetryData(data: any): void {
    if (!this.aggregatedData) return;

    // Find the equipment in our utilization metrics
    const equipment = this.aggregatedData.equipmentUtilization.topPerformers
      .find(e => e.assetCode === data.assetCode);

    if (equipment) {
      // Update real-time telemetry data
      equipment.currentStatus = data.status;
      equipment.batteryLevel = data.batteryLevel;
      equipment.signalStrength = data.signalStrength;
      equipment.lastSeen = new Date();

      // Update productivity metrics
      if (data.outputRate) {
        equipment.outputRate = data.outputRate;
        equipment.productivityScore = this.calculateProductivityScore(data);
      }

      // Check for maintenance alerts
      if (data.diagnostics) {
        equipment.maintenanceUrgency = this.determineMaintenanceUrgency(data.diagnostics);
        equipment.failureProbability = data.diagnostics.failureProbability || 0;
      }
    }

    // Notify subscribers
    const event: RealTimeEvent = {
      id: `et_${Date.now()}`,
      timestamp: new Date(),
      category: 'equipment',
      type: 'telemetry_update',
      data: data,
      priority: data.diagnostics?.alertLevel || 'low'
    };

    this.notifySubscribers('equipment_utilization', event);
    this.notifySubscribers('events', event);
  }

  /**
   * Fetch job progress data
   */
  private async fetchJobProgress(companyId: string, timeRange: TimeRange): Promise<any> {
    const startDate = this.getStartDate(timeRange);

    // Fetch active jobs with progress data
    const { data: jobs, error } = await this.supabase
      .from('work_orders')
      .select(`
        *,
        customer:customers(customer_name),
        time_entries(total_hours),
        work_order_milestones(*)
      `)
      .eq('company_id', companyId)
      .in('status', ['pending', 'in_progress', 'on_hold'])
      .gte('created_at', startDate.toISOString())
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching job progress:', error);
      return this.getEmptyJobProgress();
    }

    // Transform to JobProgressMetrics
    const activeJobs = jobs.map(job => this.transformToJobProgressMetrics(job));
    
    // Identify critical path jobs
    const criticalPath = activeJobs.filter(job => 
      job.scheduleVariance < -2 || job.riskLevel === 'critical'
    );

    // Identify at-risk jobs
    const atRiskJobs = activeJobs.filter(job => 
      job.riskLevel === 'high' || job.scheduleVariance < -1
    );

    return {
      summary: {
        totalActive: activeJobs.length,
        onSchedule: activeJobs.filter(j => j.scheduleVariance >= 0).length,
        behind: activeJobs.filter(j => j.scheduleVariance < 0).length,
        ahead: activeJobs.filter(j => j.scheduleVariance > 0).length,
        averageProgress: activeJobs.reduce((sum, j) => sum + j.overallProgress, 0) / activeJobs.length || 0,
        completedToday: 0, // Will be updated from real-time events
        startedToday: 0    // Will be updated from real-time events
      },
      activeJobs: activeJobs.slice(0, 10),
      criticalPath,
      atRiskJobs
    };
  }

  /**
   * Fetch equipment utilization data
   */
  private async fetchEquipmentUtilization(companyId: string, timeRange: TimeRange): Promise<any> {
    const startDate = this.getStartDate(timeRange);

    // Fetch equipment with beacon data and utilization metrics
    const { data: equipment, error } = await this.supabase
      .from('asset_realtime_status')
      .select(`
        *,
        equipment_utilization_stats(*),
        beacon_location_readings(
          latitude,
          longitude,
          rssi,
          battery_level,
          timestamp
        )
      `)
      .eq('company_id', companyId)
      .gte('last_seen', startDate.toISOString())
      .order('utilization_rate', { ascending: false });

    if (error) {
      console.error('Error fetching equipment utilization:', error);
      return this.getEmptyEquipmentUtilization();
    }

    // Transform to EquipmentUtilizationMetrics
    const utilizationMetrics = equipment.map(eq => this.transformToEquipmentUtilizationMetrics(eq));
    
    // Group by category
    const byCategory = this.groupEquipmentByCategory(utilizationMetrics);
    
    // Identify top performers and underutilized
    const topPerformers = utilizationMetrics
      .filter(eq => eq.utilizationRate > 80)
      .slice(0, 5);
    
    const underutilized = utilizationMetrics
      .filter(eq => eq.utilizationRate < 30 && eq.currentStatus !== 'maintenance')
      .slice(0, 5);
    
    const maintenanceAlerts = utilizationMetrics
      .filter(eq => eq.maintenanceUrgency === 'urgent' || eq.maintenanceUrgency === 'overdue');

    return {
      summary: {
        totalEquipment: utilizationMetrics.length,
        activeNow: utilizationMetrics.filter(eq => eq.currentStatus === 'active').length,
        averageUtilization: utilizationMetrics.reduce((sum, eq) => sum + eq.utilizationRate, 0) / utilizationMetrics.length || 0,
        maintenanceNeeded: maintenanceAlerts.length,
        offline: utilizationMetrics.filter(eq => eq.currentStatus === 'offline').length,
        roi: this.calculateEquipmentROI(utilizationMetrics)
      },
      byCategory,
      topPerformers,
      underutilized,
      maintenanceAlerts
    };
  }

  /**
   * Fetch crew productivity data
   */
  private async fetchCrewProductivity(companyId: string, timeRange: TimeRange): Promise<any> {
    const startDate = this.getStartDate(timeRange);

    // Fetch employee productivity data
    const { data: employees, error } = await this.supabase
      .from('employees')
      .select(`
        *,
        time_entries(
          total_hours,
          billable_hours,
          entry_date,
          work_description
        ),
        employee_beacon_assignments(
          beacon:beacons(*)
        ),
        employee_productivity_stats(*)
      `)
      .eq('company_id', companyId)
      .eq('employment_status', 'active')
      .order('last_name');

    if (error) {
      console.error('Error fetching crew productivity:', error);
      return this.getEmptyCrewProductivity();
    }

    // Transform to CrewProductivityMetrics
    const productivityMetrics = employees.map(emp => this.transformToCrewProductivityMetrics(emp));
    
    // Group by team
    const byTeam = this.groupCrewByTeam(productivityMetrics);
    
    // Identify top performers and those needing improvement
    const topPerformers = productivityMetrics
      .sort((a, b) => b.productivityScore - a.productivityScore)
      .slice(0, 5);
    
    const improvementNeeded = productivityMetrics
      .filter(emp => emp.productivityScore < 60 || emp.burnoutRisk === 'high')
      .slice(0, 5);

    // Get real-time activity feed
    const realTimeActivity = await this.getRecentCrewActivity(companyId);

    return {
      summary: {
        totalCrew: productivityMetrics.length,
        onSiteNow: productivityMetrics.filter(emp => emp.currentStatus === 'on-site').length,
        averageProductivity: productivityMetrics.reduce((sum, emp) => sum + emp.productivityScore, 0) / productivityMetrics.length || 0,
        overtimeHours: productivityMetrics.reduce((sum, emp) => sum + (emp.hoursWorked > 40 ? emp.hoursWorked - 40 : 0), 0),
        billableRate: this.calculateBillableRate(productivityMetrics)
      },
      byTeam,
      topPerformers,
      improvementNeeded,
      realTimeActivity
    };
  }

  /**
   * Fetch safety compliance data
   */
  private async fetchSafetyCompliance(companyId: string, timeRange: TimeRange): Promise<any> {
    const startDate = this.getStartDate(timeRange);

    // Fetch comprehensive safety data
    const [
      safetyIncidents,
      safetyAudits,
      trainingRecords,
      ppeViolations,
      silicaReadings,
      equipmentInspections
    ] = await Promise.all([
      this.fetchSafetyIncidents(companyId, startDate),
      this.fetchSafetyAudits(companyId, startDate),
      this.fetchTrainingRecords(companyId, startDate),
      this.fetchPPEViolations(companyId, startDate),
      this.fetchSilicaReadings(companyId, startDate),
      this.fetchEquipmentInspections(companyId, startDate)
    ]);

    // Calculate compliance scores
    const overallComplianceScore = this.calculateOverallComplianceScore({
      safetyIncidents,
      safetyAudits,
      trainingRecords,
      ppeViolations,
      silicaReadings,
      equipmentInspections
    });

    // Determine compliance status
    const complianceStatus = 
      overallComplianceScore >= 95 ? 'compliant' :
      overallComplianceScore >= 85 ? 'warning' :
      overallComplianceScore >= 70 ? 'violation' : 'critical';

    return {
      summary: {
        overallComplianceScore,
        complianceStatus,
        lastAuditDate: safetyAudits[0]?.audit_date || new Date(),
        nextAuditDue: this.calculateNextAuditDate(safetyAudits[0]?.audit_date),
        activeHazards: this.extractActiveHazards(safetyIncidents),
        activeViolations: this.extractActiveViolations(ppeViolations),
        nearMissEvents: this.extractNearMissEvents(safetyIncidents),
        oshaCompliance: this.calculateOSHACompliance(safetyIncidents, safetyAudits),
        silicaMonitoring: this.calculateSilicaCompliance(silicaReadings),
        ppeCompliance: this.calculatePPECompliance(ppeViolations),
        trainingCompliance: this.calculateTrainingCompliance(trainingRecords),
        equipmentSafety: this.calculateEquipmentSafety(equipmentInspections),
        environmentalCompliance: this.calculateEnvironmentalCompliance(),
        safetyTrend: this.calculateSafetyTrend(safetyIncidents),
        incidentPrediction: this.predictIncidentRisk({
          safetyIncidents,
          ppeViolations,
          trainingRecords
        })
      },
      criticalAlerts: this.generateCriticalSafetyAlerts({
        safetyIncidents,
        ppeViolations,
        silicaReadings
      }),
      complianceByCategory: this.calculateComplianceByCategory({
        safetyIncidents,
        safetyAudits,
        trainingRecords,
        ppeViolations,
        equipmentInspections
      }),
      recentIncidents: safetyIncidents.slice(0, 5),
      upcomingRequirements: this.getUpcomingRequirements(trainingRecords, equipmentInspections)
    };
  }

  /**
   * Calculate KPIs
   */
  private async calculateKPIs(companyId: string, timeRange: TimeRange): Promise<any> {
    const startDate = this.getStartDate(timeRange);

    // Fetch aggregated metrics for KPI calculation
    const { data: metrics, error } = await this.supabase
      .rpc('calculate_company_kpis', {
        p_company_id: companyId,
        p_start_date: startDate.toISOString(),
        p_end_date: new Date().toISOString()
      });

    if (error) {
      console.error('Error calculating KPIs:', error);
      return this.getDefaultKPIs();
    }

    return {
      activeJobs: metrics.active_jobs || 0,
      onTimeDelivery: metrics.on_time_delivery_rate || 0,
      equipmentUtilization: metrics.equipment_utilization_rate || 0,
      crewProductivity: metrics.crew_productivity_rate || 0,
      safetyCompliance: metrics.safety_compliance_rate || 0,
      revenue: metrics.total_revenue || 0,
      profitability: metrics.profit_margin || 0
    };
  }

  /**
   * Generate predictions using historical data
   */
  private async generatePredictions(companyId: string): Promise<any> {
    // In a real implementation, this would use ML models
    // For now, we'll use rule-based predictions

    const [
      jobCompletions,
      equipmentFailures,
      safetyRisks,
      resourceShortages
    ] = await Promise.all([
      this.predictJobCompletions(companyId),
      this.predictEquipmentFailures(companyId),
      this.predictSafetyRisks(companyId),
      this.predictResourceShortages(companyId)
    ]);

    return {
      jobCompletions,
      equipmentFailures,
      safetyRisks,
      resourceShortages
    };
  }

  /**
   * Fetch active alerts
   */
  private async fetchActiveAlerts(companyId: string): Promise<any[]> {
    const { data: alerts, error } = await this.supabase
      .from('analytics_alerts')
      .select('*')
      .eq('company_id', companyId)
      .eq('acknowledged', false)
      .order('timestamp', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching alerts:', error);
      return [];
    }

    return alerts.map(alert => ({
      ...alert,
      actions: this.generateAlertActions(alert)
    }));
  }

  /**
   * Analyze trends
   */
  private async analyzeTrends(companyId: string, timeRange: TimeRange): Promise<any> {
    const trends = {
      productivity: await this.analyzeProductivityTrend(companyId, timeRange),
      safety: await this.analyzeSafetyTrend(companyId, timeRange),
      equipment: await this.analyzeEquipmentTrend(companyId, timeRange),
      financial: await this.analyzeFinancialTrend(companyId, timeRange)
    };

    return trends;
  }

  /**
   * Subscribe to real-time updates
   */
  subscribe(channel: string, callback: (data: any) => void): void {
    if (!this.subscribers.has(channel)) {
      this.subscribers.set(channel, new Set());
    }
    this.subscribers.get(channel)!.add(callback);
  }

  /**
   * Unsubscribe from updates
   */
  unsubscribe(channel: string, callback: (data: any) => void): void {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.delete(callback);
    }
  }

  /**
   * Get current aggregated data
   */
  getAggregatedData(): RealTimeAnalyticsDashboard | null {
    return this.aggregatedData;
  }

  /**
   * Refresh all data
   */
  async refreshAllData(companyId: string): Promise<void> {
    if (!this.aggregatedData) return;

    const [
      jobProgress,
      equipmentUtilization,
      crewProductivity,
      safetyCompliance,
      kpis
    ] = await Promise.all([
      this.fetchJobProgress(companyId, this.aggregatedData.timeRange),
      this.fetchEquipmentUtilization(companyId, this.aggregatedData.timeRange),
      this.fetchCrewProductivity(companyId, this.aggregatedData.timeRange),
      this.fetchSafetyCompliance(companyId, this.aggregatedData.timeRange),
      this.calculateKPIs(companyId, this.aggregatedData.timeRange)
    ]);

    this.aggregatedData = {
      ...this.aggregatedData,
      lastUpdated: new Date(),
      kpis,
      jobProgress,
      equipmentUtilization,
      crewProductivity,
      safetyCompliance,
      predictions: await this.generatePredictions(companyId),
      alerts: await this.fetchActiveAlerts(companyId),
      trends: await this.analyzeTrends(companyId, this.aggregatedData.timeRange)
    };

    // Notify all subscribers of the update
    this.notifySubscribers('dashboard_update', this.aggregatedData);
  }

  /**
   * Clean up connections and subscriptions
   */
  async cleanup(): Promise<void> {
    // Clear update interval
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    // Unsubscribe from all channels
    for (const channel of this.channels.values()) {
      await channel.unsubscribe();
    }
    this.channels.clear();

    // Close WebSocket connections
    for (const ws of this.webSocketConnections.values()) {
      ws.close();
    }
    this.webSocketConnections.clear();

    // Clear subscribers
    this.subscribers.clear();

    // Clear aggregated data
    this.aggregatedData = null;
  }

  // Helper methods

  private getRefreshIntervalMs(refreshRate: RefreshRate): number {
    switch (refreshRate) {
      case 'realtime': return 0;
      case '10s': return 10000;
      case '30s': return 30000;
      case '1m': return 60000;
      case '5m': return 300000;
      case 'manual': return 0;
      default: return 30000;
    }
  }

  private getStartDate(timeRange: TimeRange): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h': return new Date(now.getTime() - 60 * 60 * 1000);
      case '4h': return new Date(now.getTime() - 4 * 60 * 60 * 1000);
      case '8h': return new Date(now.getTime() - 8 * 60 * 60 * 1000);
      case '24h': return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d': return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d': return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default: return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private notifySubscribers(channel: string, data: any): void {
    if (this.subscribers.has(channel)) {
      this.subscribers.get(channel)!.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in subscriber callback for ${channel}:`, error);
        }
      });
    }
  }

  private determineEventPriority(payload: RealtimePostgresChangesPayload<any>): RealTimeEvent['priority'] {
    const data = payload.new || payload.old;
    
    if (data.priority === 'critical' || data.status === 'emergency') return 'critical';
    if (data.priority === 'high' || data.schedule_variance < -5) return 'high';
    if (data.priority === 'medium') return 'medium';
    return 'low';
  }

  private determineSafetyPriority(safetyEvent: any): RealTimeEvent['priority'] {
    if (safetyEvent.severity === 'critical' || safetyEvent.type === 'injury') return 'critical';
    if (safetyEvent.severity === 'high' || safetyEvent.type === 'near_miss') return 'high';
    if (safetyEvent.severity === 'medium') return 'medium';
    return 'low';
  }

  private calculateProductivityScore(data: any): number {
    // Simple productivity calculation based on output rate and target
    const targetRate = data.targetOutputRate || 100;
    const actualRate = data.outputRate || 0;
    const efficiency = (actualRate / targetRate) * 100;
    
    return Math.min(100, Math.max(0, efficiency));
  }

  private determineMaintenanceUrgency(diagnostics: any): 'routine' | 'soon' | 'urgent' | 'overdue' {
    if (diagnostics.hoursUntilMaintenance < 0) return 'overdue';
    if (diagnostics.hoursUntilMaintenance < 10) return 'urgent';
    if (diagnostics.hoursUntilMaintenance < 50) return 'soon';
    return 'routine';
  }

  private async updateJobProgress(workOrder: any): Promise<void> {
    // Update job progress metrics in aggregated data
    if (!this.aggregatedData) return;

    const jobIndex = this.aggregatedData.jobProgress.activeJobs
      .findIndex(job => job.jobId === workOrder.id);

    if (jobIndex !== -1) {
      // Update existing job
      const updatedJob = await this.transformToJobProgressMetrics(workOrder);
      this.aggregatedData.jobProgress.activeJobs[jobIndex] = updatedJob;
    } else if (workOrder.status === 'in_progress') {
      // Add new active job
      const newJob = await this.transformToJobProgressMetrics(workOrder);
      this.aggregatedData.jobProgress.activeJobs.push(newJob);
    }

    // Update summary
    this.aggregatedData.jobProgress.summary = this.recalculateJobProgressSummary(
      this.aggregatedData.jobProgress.activeJobs
    );
  }

  private async updateCrewProductivity(timeEntry: any): Promise<void> {
    // Update crew productivity based on new time entry
    if (!this.aggregatedData) return;

    // Find the employee in productivity metrics
    const crewIndex = this.aggregatedData.crewProductivity.topPerformers
      .findIndex(crew => crew.employeeId === timeEntry.employee_id);

    if (crewIndex !== -1) {
      // Update hours worked and billable hours
      const crew = this.aggregatedData.crewProductivity.topPerformers[crewIndex];
      crew.hoursWorked += timeEntry.total_hours || 0;
      crew.billableHours += timeEntry.billable_hours || 0;
      crew.utilizationRate = (crew.billableHours / crew.hoursWorked) * 100;
    }

    // Update summary
    this.aggregatedData.crewProductivity.summary.overtimeHours = 
      this.calculateTotalOvertimeHours(this.aggregatedData.crewProductivity.topPerformers);
  }

  private async updateEquipmentLocation(beaconReading: any): Promise<void> {
    // Update equipment location based on beacon reading
    if (!this.aggregatedData) return;

    const equipment = this.aggregatedData.equipmentUtilization.topPerformers
      .find(eq => eq.equipmentId === beaconReading.asset_id);

    if (equipment) {
      equipment.currentLocation = {
        latitude: beaconReading.latitude,
        longitude: beaconReading.longitude,
        accuracy: beaconReading.accuracy || 5,
        timestamp: new Date(beaconReading.timestamp),
        source: 'beacon'
      };
      equipment.lastSeen = new Date(beaconReading.timestamp);
      equipment.signalStrength = beaconReading.rssi;
      equipment.batteryLevel = beaconReading.battery_level;
    }
  }

  private async updateCrewLocation(beaconReading: any): Promise<void> {
    // Update crew member location if beacon is assigned to employee
    if (!this.aggregatedData) return;

    // Check if this beacon is assigned to an employee
    const { data: assignment } = await this.supabase
      .from('employee_beacon_assignments')
      .select('employee_id')
      .eq('beacon_id', beaconReading.beacon_id)
      .eq('is_active', true)
      .single();

    if (assignment) {
      const crew = this.aggregatedData.crewProductivity.topPerformers
        .find(c => c.employeeId === assignment.employee_id);

      if (crew) {
        crew.currentLocation = {
          latitude: beaconReading.latitude,
          longitude: beaconReading.longitude,
          accuracy: beaconReading.accuracy || 5,
          timestamp: new Date(beaconReading.timestamp),
          source: 'beacon'
        };
        
        // Determine on-site status based on geofencing
        crew.currentStatus = await this.determineCrewStatus(crew.currentLocation);
      }
    }
  }

  private async updateSafetyCompliance(safetyEvent: any): Promise<void> {
    // Update safety compliance metrics
    if (!this.aggregatedData) return;

    const compliance = this.aggregatedData.safetyCompliance.summary;

    // Update incident tracking
    if (safetyEvent.type === 'incident') {
      compliance.oshaCompliance.recordableIncidents++;
      compliance.oshaCompliance.daysWithoutIncident = 0;
    }

    // Update violation tracking
    if (safetyEvent.type === 'violation') {
      compliance.activeViolations.push({
        id: safetyEvent.id,
        type: safetyEvent.violation_type,
        violator: safetyEvent.employee_id,
        location: safetyEvent.location,
        timestamp: new Date(safetyEvent.created_at),
        description: safetyEvent.description,
        correctiveAction: safetyEvent.corrective_action,
        status: safetyEvent.status,
        severity: safetyEvent.severity
      });
    }

    // Recalculate compliance score
    compliance.overallComplianceScore = await this.recalculateComplianceScore();
  }

  private async generateSafetyAlert(safetyEvent: any): Promise<void> {
    if (!this.aggregatedData) return;

    const alert = {
      id: `alert_${Date.now()}`,
      category: 'safety' as const,
      type: safetyEvent.type,
      severity: this.determineSafetyPriority(safetyEvent),
      title: `Safety ${safetyEvent.type === 'incident' ? 'Incident' : 'Violation'} Reported`,
      message: safetyEvent.description || 'New safety event requires attention',
      timestamp: new Date(),
      data: safetyEvent,
      actions: [
        {
          label: 'View Details',
          action: `view_safety_${safetyEvent.id}`,
          primary: true
        },
        {
          label: 'Acknowledge',
          action: `acknowledge_alert_${safetyEvent.id}`
        }
      ],
      acknowledged: false
    };

    this.aggregatedData.alerts.unshift(alert);

    // Keep only recent alerts
    if (this.aggregatedData.alerts.length > 100) {
      this.aggregatedData.alerts = this.aggregatedData.alerts.slice(0, 100);
    }

    // Notify subscribers
    this.notifySubscribers('alerts', alert);
  }

  // Placeholder methods for complex calculations
  // These would be implemented with actual business logic

  private transformToJobProgressMetrics(job: any): JobProgressMetrics {
    // Transform database job to JobProgressMetrics
    // Implementation would map fields and calculate derived metrics
    return {} as JobProgressMetrics;
  }

  private transformToEquipmentUtilizationMetrics(equipment: any): EquipmentUtilizationMetrics {
    // Transform database equipment to EquipmentUtilizationMetrics
    return {} as EquipmentUtilizationMetrics;
  }

  private transformToCrewProductivityMetrics(employee: any): CrewProductivityMetrics {
    // Transform database employee to CrewProductivityMetrics
    return {} as CrewProductivityMetrics;
  }

  private getEmptyJobProgress(): any {
    return { summary: {}, activeJobs: [], criticalPath: [], atRiskJobs: [] };
  }

  private getEmptyEquipmentUtilization(): any {
    return { summary: {}, byCategory: [], topPerformers: [], underutilized: [], maintenanceAlerts: [] };
  }

  private getEmptyCrewProductivity(): any {
    return { summary: {}, byTeam: [], topPerformers: [], improvementNeeded: [], realTimeActivity: [] };
  }

  private getDefaultKPIs(): any {
    return {
      activeJobs: 0,
      onTimeDelivery: 0,
      equipmentUtilization: 0,
      crewProductivity: 0,
      safetyCompliance: 0,
      revenue: 0,
      profitability: 0
    };
  }

  private calculateTotalOvertimeHours(crew: CrewProductivityMetrics[]): number {
    return crew.reduce((sum, emp) => sum + Math.max(0, emp.hoursWorked - 40), 0);
  }

  private async determineCrewStatus(location: LocationData): Promise<CrewProductivityMetrics['currentStatus']> {
    // Implement geofencing logic to determine if crew is on-site
    // This would check against job site boundaries
    return 'on-site';
  }

  private async recalculateComplianceScore(): Promise<number> {
    // Recalculate overall compliance score based on various factors
    return 95;
  }

  private recalculateJobProgressSummary(jobs: JobProgressMetrics[]): any {
    return {
      totalActive: jobs.length,
      onSchedule: jobs.filter(j => j.scheduleVariance >= 0).length,
      behind: jobs.filter(j => j.scheduleVariance < 0).length,
      ahead: jobs.filter(j => j.scheduleVariance > 0).length,
      averageProgress: jobs.reduce((sum, j) => sum + j.overallProgress, 0) / jobs.length || 0,
      completedToday: 0,
      startedToday: 0
    };
  }

  private groupEquipmentByCategory(equipment: EquipmentUtilizationMetrics[]): any[] {
    // Group equipment by category and calculate aggregates
    return [];
  }

  private groupCrewByTeam(crew: CrewProductivityMetrics[]): any[] {
    // Group crew by team and calculate team metrics
    return [];
  }

  private calculateEquipmentROI(equipment: EquipmentUtilizationMetrics[]): number {
    // Calculate return on investment for equipment
    return 0;
  }

  private calculateBillableRate(crew: CrewProductivityMetrics[]): number {
    // Calculate overall billable rate
    const totalBillable = crew.reduce((sum, emp) => sum + emp.billableHours, 0);
    const totalHours = crew.reduce((sum, emp) => sum + emp.hoursWorked, 0);
    return totalHours > 0 ? (totalBillable / totalHours) * 100 : 0;
  }

  private async getRecentCrewActivity(companyId: string): Promise<any[]> {
    // Fetch recent crew activity events
    return [];
  }

  private async fetchSafetyIncidents(companyId: string, startDate: Date): Promise<any[]> {
    const { data } = await this.supabase
      .from('safety_incidents')
      .select('*')
      .eq('company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });
    return data || [];
  }

  private async fetchSafetyAudits(companyId: string, startDate: Date): Promise<any[]> {
    const { data } = await this.supabase
      .from('safety_audits')
      .select('*')
      .eq('company_id', companyId)
      .gte('audit_date', startDate.toISOString())
      .order('audit_date', { ascending: false });
    return data || [];
  }

  private async fetchTrainingRecords(companyId: string, startDate: Date): Promise<any[]> {
    const { data } = await this.supabase
      .from('training_records')
      .select('*')
      .eq('company_id', companyId)
      .gte('completion_date', startDate.toISOString());
    return data || [];
  }

  private async fetchPPEViolations(companyId: string, startDate: Date): Promise<any[]> {
    const { data } = await this.supabase
      .from('ppe_violations')
      .select('*')
      .eq('company_id', companyId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });
    return data || [];
  }

  private async fetchSilicaReadings(companyId: string, startDate: Date): Promise<any[]> {
    const { data } = await this.supabase
      .from('silica_monitoring')
      .select('*')
      .eq('company_id', companyId)
      .gte('reading_time', startDate.toISOString())
      .order('reading_time', { ascending: false });
    return data || [];
  }

  private async fetchEquipmentInspections(companyId: string, startDate: Date): Promise<any[]> {
    const { data } = await this.supabase
      .from('equipment_inspections')
      .select('*')
      .eq('company_id', companyId)
      .gte('inspection_date', startDate.toISOString());
    return data || [];
  }

  private calculateOverallComplianceScore(data: any): number {
    // Complex calculation based on multiple safety factors
    return 95;
  }

  private calculateNextAuditDate(lastAudit: Date | null): Date {
    // Calculate next audit date based on regulations and company policy
    const date = lastAudit || new Date();
    return new Date(date.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days
  }

  private extractActiveHazards(incidents: any[]): SafetyHazard[] {
    // Extract and transform active hazards from incidents
    return [];
  }

  private extractActiveViolations(violations: any[]): SafetyViolation[] {
    // Extract and transform active violations
    return [];
  }

  private extractNearMissEvents(incidents: any[]): any[] {
    // Extract near miss events from incidents
    return incidents.filter(i => i.type === 'near_miss');
  }

  private calculateOSHACompliance(incidents: any[], audits: any[]): any {
    return {
      status: 'compliant',
      score: 98,
      violations: [],
      lastInspection: new Date(),
      recordableIncidents: 0,
      daysWithoutIncident: 45
    };
  }

  private calculateSilicaCompliance(readings: any[]): any {
    return {
      currentExposureLevel: 0.025,
      permissibleLimit: 0.05,
      complianceStatus: 'safe',
      activeControls: ['wet_cutting', 'vacuum_dust_collection'],
      monitoringDevices: [],
      workerExposures: []
    };
  }

  private calculatePPECompliance(violations: any[]): any {
    const totalChecks = 1000; // Example
    const violations_count = violations.length;
    const complianceRate = ((totalChecks - violations_count) / totalChecks) * 100;
    
    return {
      overallRate: complianceRate,
      byType: [],
      violations: violations.slice(0, 10),
      photoVerifications: 0
    };
  }

  private calculateTrainingCompliance(records: any[]): any {
    return {
      overallRate: 92,
      overdueTrainings: [],
      upcomingExpirations: [],
      completionRate: 92
    };
  }

  private calculateEquipmentSafety(inspections: any[]): any {
    return {
      inspectionCompliance: 95,
      overdueInspections: [],
      safetyIssues: [],
      lockoutTagoutCompliance: 98
    };
  }

  private calculateEnvironmentalCompliance(): any {
    return {
      dustSuppressionActive: true,
      waterManagementScore: 90,
      noiseLevel: 78,
      wasteDisposalCompliance: 100
    };
  }

  private calculateSafetyTrend(incidents: any[]): TrendData {
    // Calculate safety trend based on incident history
    return {
      direction: 'up',
      percentageChange: -15, // Negative is good for incidents
      periodComparison: 'vs last month',
      sparklineData: [5, 4, 6, 3, 2, 1, 1]
    };
  }

  private predictIncidentRisk(data: any): any {
    // Predict incident risk based on various factors
    return {
      riskLevel: 'low',
      probability: 12,
      factors: ['weather_conditions', 'new_crew_members'],
      preventiveMeasures: ['additional_safety_briefing', 'ppe_verification']
    };
  }

  private generateCriticalSafetyAlerts(data: any): any[] {
    // Generate critical safety alerts based on current conditions
    return [];
  }

  private calculateComplianceByCategory(data: any): any[] {
    return [
      { category: 'OSHA', score: 98, status: 'compliant', issues: 0, lastChecked: new Date() },
      { category: 'PPE', score: 94, status: 'compliant', issues: 2, lastChecked: new Date() },
      { category: 'Training', score: 92, status: 'compliant', issues: 3, lastChecked: new Date() },
      { category: 'Equipment', score: 95, status: 'compliant', issues: 1, lastChecked: new Date() },
      { category: 'Environmental', score: 90, status: 'compliant', issues: 0, lastChecked: new Date() }
    ];
  }

  private getUpcomingRequirements(training: any[], inspections: any[]): any[] {
    // Get upcoming safety requirements
    return [];
  }

  private async predictJobCompletions(companyId: string): Promise<any[]> {
    // Predict job completion dates using historical data
    return [];
  }

  private async predictEquipmentFailures(companyId: string): Promise<any[]> {
    // Predict equipment failures based on usage patterns
    return [];
  }

  private async predictSafetyRisks(companyId: string): Promise<any[]> {
    // Predict safety risks based on conditions
    return [];
  }

  private async predictResourceShortages(companyId: string): Promise<any[]> {
    // Predict resource shortages based on scheduling
    return [];
  }

  private generateAlertActions(alert: any): AlertAction[] {
    // Generate appropriate actions based on alert type
    return [
      {
        label: 'View Details',
        action: `view_${alert.id}`,
        primary: true
      },
      {
        label: 'Acknowledge',
        action: `acknowledge_${alert.id}`
      }
    ];
  }

  private async analyzeProductivityTrend(companyId: string, timeRange: TimeRange): Promise<any> {
    // Analyze productivity trends
    return {
      period: timeRange,
      currentValue: 85,
      previousValue: 82,
      change: 3,
      changePercentage: 3.7,
      trend: 'improving' as const,
      forecast: [],
      seasonality: undefined
    };
  }

  private async analyzeSafetyTrend(companyId: string, timeRange: TimeRange): Promise<any> {
    // Analyze safety trends
    return {
      period: timeRange,
      currentValue: 95,
      previousValue: 93,
      change: 2,
      changePercentage: 2.2,
      trend: 'improving' as const,
      forecast: [],
      seasonality: undefined
    };
  }

  private async analyzeEquipmentTrend(companyId: string, timeRange: TimeRange): Promise<any> {
    // Analyze equipment utilization trends
    return {
      period: timeRange,
      currentValue: 78,
      previousValue: 75,
      change: 3,
      changePercentage: 4.0,
      trend: 'improving' as const,
      forecast: [],
      seasonality: undefined
    };
  }

  private async analyzeFinancialTrend(companyId: string, timeRange: TimeRange): Promise<any> {
    // Analyze financial trends
    return {
      period: timeRange,
      currentValue: 125000,
      previousValue: 118000,
      change: 7000,
      changePercentage: 5.9,
      trend: 'improving' as const,
      forecast: [],
      seasonality: undefined
    };
  }
}

// Export singleton instance
export const analyticsAggregationService = new AnalyticsAggregationService();