'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Cog,
  Download,
  Eye,
  Filter,
  HardHat,
  LineChart,
  MapPin,
  Play,
  Pause,
  RefreshCw,
  Settings,
  Shield,
  TrendingUp,
  TrendingDown,
  Users,
  Wrench,
  Zap,
  Target,
  DollarSign,
  AlertCircle,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react';
import { 
  RealTimeAnalyticsDashboard as AnalyticsDashboard,
  TimeRange,
  RefreshRate,
  AnalyticsFilters
} from '@/types/analytics';
import { analyticsAggregationService } from '@/lib/analytics-aggregation-service';
import { useToast } from '@/hooks/use-toast';

interface RealTimeAnalyticsDashboardProps {
  companyId: string;
  userId: string;
  initialTimeRange?: TimeRange;
  initialRefreshRate?: RefreshRate;
}

export default function RealTimeAnalyticsDashboard({
  companyId,
  userId,
  initialTimeRange = '24h',
  initialRefreshRate = '30s'
}: RealTimeAnalyticsDashboardProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<TimeRange>(initialTimeRange);
  const [refreshRate, setRefreshRate] = useState<RefreshRate>(initialRefreshRate);
  const [isLive, setIsLive] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({ timeRange });
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  // Initialize analytics service
  useEffect(() => {
    const initializeService = async () => {
      try {
        setLoading(true);
        setError(null);
        
        await analyticsAggregationService.initialize(companyId, timeRange, refreshRate);
        
        // Subscribe to dashboard updates
        analyticsAggregationService.subscribe('dashboard_update', handleDashboardUpdate);
        analyticsAggregationService.subscribe('events', handleRealTimeEvent);
        analyticsAggregationService.subscribe('alerts', handleNewAlert);
        
        // Get initial data
        const initialData = analyticsAggregationService.getAggregatedData();
        if (initialData) {
          setAnalyticsData(initialData);
        }
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize analytics');
        toast({
          title: "Analytics Error",
          description: "Failed to initialize real-time analytics",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeService();

    // Cleanup on unmount
    return () => {
      analyticsAggregationService.cleanup();
    };
  }, [companyId, timeRange, refreshRate]);

  // Handle dashboard updates
  const handleDashboardUpdate = useCallback((data: AnalyticsDashboard) => {
    setAnalyticsData(data);
  }, []);

  // Handle real-time events
  const handleRealTimeEvent = useCallback((event: any) => {
    // Could be used to show live activity feed or update specific metrics
    console.log('Real-time event:', event);
  }, []);

  // Handle new alerts
  const handleNewAlert = useCallback((alert: any) => {
    toast({
      title: `${alert.category.toUpperCase()}: ${alert.title}`,
      description: alert.message,
      variant: alert.severity === 'critical' ? 'destructive' : 'default',
    });
  }, [toast]);

  // Refresh data manually
  const refreshData = useCallback(async () => {
    try {
      setLoading(true);
      await analyticsAggregationService.refreshAllData(companyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  // Update time range
  const handleTimeRangeChange = useCallback(async (newTimeRange: TimeRange) => {
    setTimeRange(newTimeRange);
    setFilters(prev => ({ ...prev, timeRange: newTimeRange }));
    
    // Reinitialize with new time range
    await analyticsAggregationService.cleanup();
    await analyticsAggregationService.initialize(companyId, newTimeRange, refreshRate);
  }, [companyId, refreshRate]);

  // Update refresh rate
  const handleRefreshRateChange = useCallback(async (newRefreshRate: RefreshRate) => {
    setRefreshRate(newRefreshRate);
    
    // Reinitialize with new refresh rate
    await analyticsAggregationService.cleanup();
    await analyticsAggregationService.initialize(companyId, timeRange, newRefreshRate);
  }, [companyId, timeRange]);

  // Toggle live updates
  const toggleLiveUpdates = useCallback(() => {
    setIsLive(prev => !prev);
    if (isLive) {
      analyticsAggregationService.cleanup();
    } else {
      analyticsAggregationService.initialize(companyId, timeRange, refreshRate);
    }
  }, [companyId, timeRange, refreshRate, isLive]);

  // KPI calculations for quick display
  const kpiData = useMemo(() => {
    if (!analyticsData) return null;

    const kpis = analyticsData.kpis;
    return [
      {
        title: 'Active Jobs',
        value: kpis.activeJobs,
        change: '+5%',
        trend: 'up',
        icon: Target,
        color: 'blue'
      },
      {
        title: 'On-Time Delivery',
        value: `${kpis.onTimeDelivery}%`,
        change: '+2.3%',
        trend: 'up',
        icon: CheckCircle,
        color: 'green'
      },
      {
        title: 'Equipment Utilization',
        value: `${kpis.equipmentUtilization}%`,
        change: '+4.1%',
        trend: 'up',
        icon: Wrench,
        color: 'orange'
      },
      {
        title: 'Crew Productivity',
        value: `${kpis.crewProductivity}%`,
        change: '+1.8%',
        trend: 'up',
        icon: Users,
        color: 'purple'
      },
      {
        title: 'Safety Compliance',
        value: `${kpis.safetyCompliance}%`,
        change: '+0.5%',
        trend: 'up',
        icon: Shield,
        color: 'green'
      },
      {
        title: 'Revenue',
        value: `$${(kpis.revenue / 1000).toFixed(0)}K`,
        change: '+12.4%',
        trend: 'up',
        icon: DollarSign,
        color: 'green'
      }
    ];
  }, [analyticsData]);

  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading real-time analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          {error}
          <Button variant="outline" size="sm" onClick={refreshData} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (!analyticsData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No analytics data available. Please check your configuration.
        </AlertDescription>
      </Alert>
    );
  }

  const renderKPICards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
      {kpiData?.map((kpi, index) => {
        const Icon = kpi.icon;
        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{kpi.value}</p>
                    <div className={`flex items-center text-sm ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      )}
                      {kpi.change}
                    </div>
                  </div>
                </div>
                <Icon className={`h-8 w-8 text-${kpi.color}-600`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderJobProgress = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Job Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Job Progress Overview
          </CardTitle>
          <CardDescription>
            Real-time job status and completion tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {analyticsData.jobProgress.summary.onSchedule}
              </div>
              <div className="text-sm text-gray-600">On Schedule</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {analyticsData.jobProgress.summary.behind}
              </div>
              <div className="text-sm text-gray-600">Behind Schedule</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Progress</span>
              <span>{Math.round(analyticsData.jobProgress.summary.averageProgress)}%</span>
            </div>
            <Progress value={analyticsData.jobProgress.summary.averageProgress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Active Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Active Jobs
            </span>
            <Badge variant="outline">
              {analyticsData.jobProgress.summary.totalActive} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.jobProgress.activeJobs.slice(0, 5).map((job, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{job.jobTitle}</div>
                  <div className="text-sm text-gray-600">{job.customerName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={job.overallProgress} className="h-1 flex-1" />
                    <span className="text-xs">{Math.round(job.overallProgress)}%</span>
                  </div>
                </div>
                <div className="ml-4">
                  <Badge variant={
                    job.riskLevel === 'critical' ? 'destructive' :
                    job.riskLevel === 'high' ? 'destructive' :
                    job.riskLevel === 'medium' ? 'secondary' : 'default'
                  }>
                    {job.riskLevel}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderEquipmentUtilization = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Equipment Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Equipment Utilization
          </CardTitle>
          <CardDescription>
            Real-time equipment tracking and utilization metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {analyticsData.equipmentUtilization.summary.activeNow}
              </div>
              <div className="text-sm text-gray-600">Active Now</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {analyticsData.equipmentUtilization.summary.maintenanceNeeded}
              </div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {analyticsData.equipmentUtilization.summary.offline}
              </div>
              <div className="text-sm text-gray-600">Offline</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Utilization</span>
              <span>{Math.round(analyticsData.equipmentUtilization.summary.averageUtilization)}%</span>
            </div>
            <Progress value={analyticsData.equipmentUtilization.summary.averageUtilization} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Equipment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Most efficiently utilized equipment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.equipmentUtilization.topPerformers.slice(0, 5).map((equipment, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{equipment.assetName}</div>
                  <div className="text-sm text-gray-600">{equipment.assetCode}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={
                      equipment.currentStatus === 'active' ? 'default' :
                      equipment.currentStatus === 'maintenance' ? 'secondary' :
                      equipment.currentStatus === 'offline' ? 'destructive' : 'outline'
                    }>
                      {equipment.currentStatus}
                    </Badge>
                    {equipment.batteryLevel && (
                      <span className="text-xs text-gray-600">
                        🔋 {equipment.batteryLevel}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{Math.round(equipment.utilizationRate)}%</div>
                  <div className="text-sm text-gray-600">Utilization</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderCrewProductivity = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Crew Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Crew Productivity
          </CardTitle>
          <CardDescription>
            Real-time crew performance and productivity metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {analyticsData.crewProductivity.summary.onSiteNow}
              </div>
              <div className="text-sm text-gray-600">On Site Now</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {Math.round(analyticsData.crewProductivity.summary.overtimeHours)}
              </div>
              <div className="text-sm text-gray-600">OT Hours</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Average Productivity</span>
              <span>{Math.round(analyticsData.crewProductivity.summary.averageProductivity)}%</span>
            </div>
            <Progress value={analyticsData.crewProductivity.summary.averageProductivity} className="h-2" />
          </div>

          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span>Billable Rate</span>
              <span>{Math.round(analyticsData.crewProductivity.summary.billableRate)}%</span>
            </div>
            <Progress value={analyticsData.crewProductivity.summary.billableRate} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performers
          </CardTitle>
          <CardDescription>
            Most productive crew members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.crewProductivity.topPerformers.slice(0, 5).map((crew, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{crew.employeeName}</div>
                  <div className="text-sm text-gray-600">{crew.role}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={
                      crew.currentStatus === 'on-site' ? 'default' :
                      crew.currentStatus === 'nearby' ? 'secondary' :
                      crew.currentStatus === 'break' ? 'outline' : 'destructive'
                    }>
                      {crew.currentStatus}
                    </Badge>
                    <span className="text-xs text-gray-600">
                      {crew.hoursWorked}h worked
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{Math.round(crew.productivityScore)}%</div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSafetyCompliance = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Safety Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Safety Compliance
          </CardTitle>
          <CardDescription>
            Real-time safety monitoring and compliance tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {analyticsData.safetyCompliance.summary.overallComplianceScore}%
              </div>
              <div className="text-sm text-gray-600">Compliance Score</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {analyticsData.safetyCompliance.summary.oshaCompliance.daysWithoutIncident}
              </div>
              <div className="text-sm text-gray-600">Days Safe</div>
            </div>
          </div>

          {/* Silica Monitoring */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Silica Exposure</span>
              <span className={`font-medium ${
                analyticsData.safetyCompliance.summary.silicaMonitoring.complianceStatus === 'safe' 
                  ? 'text-green-600' 
                  : analyticsData.safetyCompliance.summary.silicaMonitoring.complianceStatus === 'warning'
                  ? 'text-yellow-600'
                  : 'text-red-600'
              }`}>
                {analyticsData.safetyCompliance.summary.silicaMonitoring.complianceStatus.toUpperCase()}
              </span>
            </div>
            <Progress 
              value={(analyticsData.safetyCompliance.summary.silicaMonitoring.currentExposureLevel / 
                     analyticsData.safetyCompliance.summary.silicaMonitoring.permissibleLimit) * 100} 
              className="h-2" 
            />
            <div className="text-xs text-gray-600">
              Current: {analyticsData.safetyCompliance.summary.silicaMonitoring.currentExposureLevel} mg/m³ 
              (Limit: {analyticsData.safetyCompliance.summary.silicaMonitoring.permissibleLimit} mg/m³)
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Safety Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </span>
            <Badge variant="outline">
              {analyticsData.alerts.filter(a => a.category === 'safety').length} Safety
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {analyticsData.alerts
              .filter(alert => alert.category === 'safety')
              .slice(0, 5)
              .map((alert, index) => (
                <div key={index} className={`p-3 border rounded-lg ${
                  alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
                  alert.severity === 'error' ? 'border-orange-200 bg-orange-50' :
                  alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
                  'border-blue-200 bg-blue-50'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm text-gray-600">{alert.message}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'error' ? 'destructive' :
                      alert.severity === 'warning' ? 'secondary' : 'default'
                    }>
                      {alert.severity}
                    </Badge>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderActiveAlerts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            All Active Alerts
          </span>
          <Badge variant="outline">
            {analyticsData.alerts.length} Total
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {analyticsData.alerts.map((alert, index) => (
            <div key={index} className={`p-4 border rounded-lg ${
              alert.severity === 'critical' ? 'border-red-200 bg-red-50' :
              alert.severity === 'error' ? 'border-orange-200 bg-orange-50' :
              alert.severity === 'warning' ? 'border-yellow-200 bg-yellow-50' :
              'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" size="sm">
                      {alert.category}
                    </Badge>
                    <Badge variant={
                      alert.severity === 'critical' ? 'destructive' :
                      alert.severity === 'error' ? 'destructive' :
                      alert.severity === 'warning' ? 'secondary' : 'default'
                    } size="sm">
                      {alert.severity}
                    </Badge>
                  </div>
                  <div className="font-medium mb-1">{alert.title}</div>
                  <div className="text-sm text-gray-600 mb-2">{alert.message}</div>
                  <div className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {alert.actions?.map((action, actionIndex) => (
                    <Button key={actionIndex} variant="outline" size="sm">
                      {action.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Real-Time Analytics</h1>
          <p className="text-gray-600">
            Superior to DSM's static reporting with live data streams and predictive insights
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="4h">Last 4 Hours</SelectItem>
              <SelectItem value="8h">Last 8 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
              <SelectItem value="30d">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          <Select value={refreshRate} onValueChange={handleRefreshRateChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="10s">10 seconds</SelectItem>
              <SelectItem value="30s">30 seconds</SelectItem>
              <SelectItem value="1m">1 minute</SelectItem>
              <SelectItem value="5m">5 minutes</SelectItem>
              <SelectItem value="manual">Manual</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={isLive ? "default" : "outline"}
            onClick={toggleLiveUpdates}
            className="flex items-center gap-2"
          >
            {isLive ? (
              <>
                <Pause className="h-4 w-4" />
                Live
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Paused
              </>
            )}
          </Button>

          <Button variant="outline" onClick={refreshData} disabled={loading}>
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500' : 'bg-gray-400'}`} />
            <span className="text-sm font-medium">
              {isLive ? 'Live Updates' : 'Updates Paused'}
            </span>
          </div>
          {analyticsData.lastUpdated && (
            <div className="text-sm text-gray-600">
              Last updated: {analyticsData.lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="h-4 w-4" />
          Refresh: {refreshRate === 'realtime' ? 'Real-time' : refreshRate}
        </div>
      </div>

      {/* KPI Cards */}
      {renderKPICards()}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Jobs</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="crew">Crew</TabsTrigger>
          <TabsTrigger value="safety">Safety</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {renderJobProgress()}
          {renderEquipmentUtilization()}
        </TabsContent>

        <TabsContent value="jobs" className="space-y-6">
          {renderJobProgress()}
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          {renderEquipmentUtilization()}
        </TabsContent>

        <TabsContent value="crew" className="space-y-6">
          {renderCrewProductivity()}
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          {renderSafetyCompliance()}
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          {renderActiveAlerts()}
        </TabsContent>
      </Tabs>
    </div>
  );
}