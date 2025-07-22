import React from 'react';
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HardHat,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Camera,
  Shield,
  Users,
  Wrench,
  Activity,
  Battery,
  Bluetooth,
  RefreshCw,
  FileText,
  Timer,
  XCircle,
  Upload,
  Bell,
  TrendingUp,
  Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BluetoothService, BeaconData } from '@/lib/bluetooth';
import { useConcreteJobs } from '@/hooks/useConcreteJobs';
import { CONCRETE_WORK_TYPES, ConcreteWorkType } from '@/types/concrete-work-types';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow, format } from 'date-fns';
import { cn } from '@/lib/utils';

// Real-time update indicator component
function LiveIndicator({ isLive }: { isLive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "h-2 w-2 rounded-full relative",
        isLive ? "bg-green-500" : "bg-gray-400"
      )}>
        {isLive && (
          <div className="h-2 w-2 rounded-full bg-green-500 animate-ping absolute" />
        )}
      </div>
      <span className="text-xs text-muted-foreground">
        {isLive ? 'Live' : 'Offline'}
      </span>
    </div>
  );
}

// Compliance status component
function ComplianceIndicator({ status, label }: { status: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
      <span className="text-sm">{label}</span>
      {status ? (
        <CheckCircle className="h-4 w-4 text-green-500" />
      ) : (
        <XCircle className="h-4 w-4 text-red-500" />
      )}
    </div>
  );
}

// Risk level badge component
function RiskBadge({ level }: { level: string }) {
  const colors = {
    low: 'bg-green-100 text-green-800 border-green-300',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    critical: 'bg-red-100 text-red-800 border-red-300'
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("font-semibold", colors[level as keyof typeof colors])}
    >
      {level.toUpperCase()}
    </Badge>
  );
}

// Job status badge component
function JobStatusBadge({ status }: { status: string }) {
  const config = {
    pending: { color: 'bg-gray-100 text-gray-800', icon: Clock },
    scheduled: { color: 'bg-blue-100 text-blue-800', icon: Clock },
    in_progress: { color: 'bg-green-100 text-green-800', icon: Activity },
    completed: { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
    on_hold: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle }
  };

  const { color, icon: Icon } = config[status as keyof typeof config] || config.pending;

  return (
    <Badge variant="outline" className={cn("gap-1", color)}>
      <Icon className="h-3 w-3" />
      {status.replace('_', ' ')}
    </Badge>
  );
}

// Crew member status component
function CrewMemberStatus({ member }: { member: { 
  id: string; 
  name: string; 
  role: string; 
  status: string;
  location?: string;
  lastSeen?: Date;
}}) {
  const statusColors = {
    on_site: 'bg-green-500',
    nearby: 'bg-yellow-500',
    off_site: 'bg-gray-400'
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card">
      <div className="relative">
        <div className={cn(
          "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold bg-muted",
          member.status === 'on_site' && "ring-2 ring-green-500 ring-offset-2"
        )}>
          {member.name.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <div className={cn(
          "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white",
          statusColors[member.status as keyof typeof statusColors] || 'bg-gray-400'
        )} />
      </div>
      <div className="flex-1">
        <p className="font-medium text-sm">{member.name}</p>
        <p className="text-xs text-muted-foreground">{member.role}</p>
      </div>
      {member.location && (
        <div className="text-right">
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {member.location}
          </p>
          {member.lastSeen && (
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(member.lastSeen, { addSuffix: true })}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// Equipment status component
function EquipmentStatus({ equipment }: { equipment: {
  id: string;
  name: string;
  type: string;
  status: string;
  assignedTo?: string;
  batteryLevel?: number;
  hoursUsed: number;
}}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div>
        <p className="font-medium text-sm">{equipment.name}</p>
        <p className="text-xs text-muted-foreground">{equipment.type}</p>
        {equipment.assignedTo && (
          <p className="text-xs text-pontifex-blue mt-1">
            Assigned: {equipment.assignedTo}
          </p>
        )}
      </div>
      <div className="text-right">
        <Badge 
          variant={equipment.status === 'in_use' ? 'default' : 'outline'}
          className="mb-1"
        >
          {equipment.status.replace('_', ' ')}
        </Badge>
        {equipment.batteryLevel !== undefined && (
          <div className="flex items-center gap-1 text-xs">
            <Battery className={cn(
              "h-3 w-3",
              equipment.batteryLevel < 20 && "text-red-500",
              equipment.batteryLevel >= 20 && equipment.batteryLevel < 50 && "text-yellow-500",
              equipment.batteryLevel >= 50 && "text-green-500"
            )} />
            <span>{equipment.batteryLevel}%</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {equipment.hoursUsed}h used
        </p>
      </div>
    </div>
  );
}

// Main dashboard component
export function ConcreteJobsDashboard() {
  const { toast } = useToast();
  const [bluetoothService] = useState(() => new BluetoothService());
  const [selectedJobId, setSelectedJobId] = useState<string | undefined>(undefined);
  const [isScanning, setIsScanning] = useState(false);
  const [beacons, setBeacons] = useState<BeaconData[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  // Use the custom hook for job data
  const {
    jobs,
    loading,
    error,
    lastUpdate,
    refetch,
    updateJobWithBeaconData
  } = useConcreteJobs({ autoRefresh: true, refreshInterval: 30000 });

  // Calculate dashboard metrics
  const metrics = useMemo(() => {
    const activeJobs = jobs.filter((j: { status: string }) => j.status === 'in_progress');
    const crewOnSite = jobs.reduce((acc: number, job: { crew: Array<{ status: string }> }) => 
      acc + job.crew.filter((c: { status: string }) => c.status === 'on_site').length, 0
    );
    const equipmentInUse = jobs.reduce((acc: number, job: { equipment: Array<{ status: string }> }) => 
      acc + job.equipment.filter((e: { status: string }) => e.status === 'in_use').length, 0
    );
    const totalJobs = jobs.length || 1;
    const compliantJobs = jobs.filter((job: { compliance: { ppeVerified: boolean; dustControlVerified: boolean; controlPlanApproved: boolean } }) => 
      job.compliance.ppeVerified && 
      job.compliance.dustControlVerified && 
      job.compliance.controlPlanApproved
    ).length;
    const complianceRate = (compliantJobs / totalJobs) * 100;
    const avgExposureLevel = jobs.reduce((acc: number, job: { exposureLevel: number }) => 
      acc + job.exposureLevel, 0
    ) / totalJobs;
    const safetyAlerts = jobs.reduce((acc: number, job: { compliance: { issues: string[] }; exposureLevel: number; riskLevel: string }) => 
      acc + job.compliance.issues.length + 
      (job.exposureLevel > 0.05 ? 1 : 0) + // OSHA PEL exceeded
      (job.riskLevel === 'high' || job.riskLevel === 'critical' ? 1 : 0), 0
    );
    const overdueJobs = jobs.filter((job: { progress: { estimatedCompletion: Date }; status: string }) => 
      job.progress.estimatedCompletion < new Date() && 
      job.status !== 'completed'
    ).length;

    return {
      activeJobs: activeJobs.length,
      crewOnSite,
      equipmentInUse,
      complianceRate,
      avgExposureLevel,
      safetyAlerts,
      overdueJobs,
      totalProgress: activeJobs.length > 0 
        ? activeJobs.reduce((acc: number, job: { progress: { percentage: number } }) => acc + job.progress.percentage, 0) / activeJobs.length
        : 0
    };
  }, [jobs]);

  // Get selected job
  const selectedJob = useMemo(() => 
    jobs.find((j: { id: string }) => j.id === selectedJobId) || jobs[0],
    [jobs, selectedJobId]
  );

  // Start beacon scanning
  const startBeaconScan = useCallback(async () => {
    setIsScanning(true);
    try {
      await bluetoothService.startScanning((beacons: BeaconData[]) => {
        setBeacons(beacons);
      });

      toast({
        title: 'Beacon scanning active',
        description: 'Real-time tracking enabled for crew and equipment',
      });
    } catch (error) {
      console.error('Beacon scan error:', error);
      toast({
        title: 'Bluetooth unavailable',
        description: 'Beacon tracking requires Bluetooth permission',
        variant: 'destructive',
      });
    } finally {
      setIsScanning(false);
    }
  }, [bluetoothService, toast]);

  // Update jobs with beacon data
  useEffect(() => {
    if (beacons.length > 0) {
      updateJobWithBeaconData(beacons);
    }
  }, [beacons, updateJobWithBeaconData]);

  // Auto-select first job
  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  // Render loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-pontifex-blue" />
          <p className="text-muted-foreground">Loading job data...</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error loading jobs</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <HardHat className="h-8 w-8 text-pontifex-blue" />
              Concrete Jobs Command Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time monitoring and management of all concrete cutting operations
            </p>
          </div>
          <div className="flex items-center gap-3">
            <LiveIndicator isLive={true} />
            <Button
              variant="outline"
              
              onClick={refetch}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              variant="outline"
              
              onClick={startBeaconScan}
              disabled={isScanning}
              className="gap-2"
            >
              <Bluetooth className="h-4 w-4" />
              {isScanning ? 'Scanning...' : 'Scan Beacons'}
            </Button>
            <Button variant="default"  className="gap-2">
              <Bell className="h-4 w-4" />
              Alerts ({metrics.safetyAlerts})
            </Button>
          </div>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{metrics.activeJobs}</p>
                </div>
                <Activity className="h-8 w-8 text-pontifex-blue" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Crew On-Site</p>
                  <p className="text-2xl font-bold">{metrics.crewOnSite}</p>
                </div>
                <Users className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Equipment</p>
                  <p className="text-2xl font-bold">{metrics.equipmentInUse}</p>
                </div>
                <Wrench className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Compliance</p>
                  <p className="text-2xl font-bold">{metrics.complianceRate.toFixed(0)}%</p>
                </div>
                <Shield className="h-8 w-8 text-pontifex-teal-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                  <p className="text-2xl font-bold">{metrics.totalProgress.toFixed(0)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Exposure</p>
                  <p className="text-2xl font-bold">{metrics.avgExposureLevel.toFixed(3)}</p>
                  <p className="text-xs text-muted-foreground">mg/m³</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Alerts</p>
                  <p className="text-2xl font-bold text-red-600">{metrics.safetyAlerts}</p>
                </div>
                <Bell className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-orange-600">{metrics.overdueJobs}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Safety Alerts */}
      {metrics.safetyAlerts > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Safety Alerts Require Attention</AlertTitle>
          <AlertDescription>
            <div className="mt-2 space-y-1">
              {jobs.filter((j: { exposureLevel: number }) => j.exposureLevel > 0.05).map((job: { id: string; orderNumber: string; exposureLevel: number }) => (
                <p key={job.id} className="text-sm">
                  • Job {job.orderNumber}: Silica exposure exceeds OSHA PEL ({job.exposureLevel} mg/m³)
                </p>
              ))}
              {jobs.filter((j: { compliance: { issues: string[] } }) => j.compliance.issues.length > 0).map((job: { id: string; orderNumber: string; compliance: { issues: string[] } }) => (
                <p key={job.id} className="text-sm">
                  • Job {job.orderNumber}: {job.compliance.issues.join(', ')}
                </p>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Jobs List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Active Jobs</CardTitle>
              <CardDescription>
                {jobs.length} total • {metrics.activeJobs} in progress
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[calc(100vh-400px)]">
                <div className="space-y-2 p-4">
                  {jobs.map((job: {
                    id: string;
                    workType: ConcreteWorkType;
                    orderNumber: string;
                    status: string;
                    clientName: string;
                    riskLevel: string;
                    progress: { percentage: number; estimatedCompletion: Date };
                    crew: Array<{ status: string }>;
                    equipment: Array<{ status: string }>;
                    compliance: { issues: string[] };
                  }) => {
                    const workType = CONCRETE_WORK_TYPES[job.workType];
                    const isSelected = selectedJob?.id === job.id;
                    
                    return (
                      <motion.div
                        key={job.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={cn(
                            "cursor-pointer transition-all",
                            isSelected && "ring-2 ring-pontifex-blue shadow-lg"
                          )}
                          onClick={() => setSelectedJobId(job.id)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-2xl">{workType.icon}</span>
                                <div>
                                  <p className="font-semibold text-sm">{job.orderNumber}</p>
                                  <p className="text-xs text-muted-foreground">{workType.name}</p>
                                </div>
                              </div>
                              <JobStatusBadge status={job.status} />
                            </div>

                            <div className="space-y-2">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-muted-foreground">{job.clientName}</span>
                                <RiskBadge level={job.riskLevel} />
                              </div>
                              
                              {job.status === 'in_progress' && (
                                <>
                                  <Progress value={job.progress.percentage} className="h-1.5" />
                                  <div className="flex items-center justify-between text-xs">
                                    <span>{job.progress.percentage}% complete</span>
                                    <span className="text-muted-foreground">
                                      {formatDistanceToNow(job.progress.estimatedCompletion, { addSuffix: true })}
                                    </span>
                                  </div>
                                </>
                              )}

                              <div className="flex items-center justify-between pt-1">
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1">
                                    <Users className="h-3 w-3" />
                                    {job.crew.filter((c: { status: string }) => c.status === 'on_site').length}/{job.crew.length}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Wrench className="h-3 w-3" />
                                    {job.equipment.filter((e: { status: string }) => e.status === 'in_use').length}/{job.equipment.length}
                                  </span>
                                </div>
                                {job.compliance.issues.length > 0 && (
                                  <Badge variant="destructive" className="h-5 px-1">
                                    <AlertTriangle className="h-3 w-3" />
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Job Details */}
        {selectedJob && (
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-2xl">{CONCRETE_WORK_TYPES[selectedJob.workType as ConcreteWorkType].icon}</span>
                      {selectedJob.orderNumber}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {CONCRETE_WORK_TYPES[selectedJob.workType as ConcreteWorkType].name} • {selectedJob.clientName} • {selectedJob.siteAddress}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <JobStatusBadge status={selectedJob.status} />
                    <RiskBadge level={selectedJob.riskLevel} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="crew">Crew</TabsTrigger>
                    <TabsTrigger value="equipment">Equipment</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                  </TabsList>

                  {/* Overview Tab */}
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Environment
                        </p>
                        <p className="font-medium">{selectedJob.indoor ? 'Indoor' : 'Outdoor'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          Duration
                        </p>
                        <p className="font-medium">
                          {selectedJob.startedAt 
                            ? formatDistanceToNow(selectedJob.startedAt)
                            : 'Not started'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Gauge className="h-3 w-3" />
                          Exposure Level
                        </p>
                        <p className={cn(
                          "font-medium",
                          selectedJob.exposureLevel > 0.05 && "text-red-600"
                        )}>
                          {selectedJob.exposureLevel} mg/m³
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Est. Completion
                        </p>
                        <p className="font-medium">
                          {format(selectedJob.progress.estimatedCompletion, 'h:mm a')}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium">Overall Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Cutting Progress</span>
                          <span className="text-muted-foreground">
                            {selectedJob.progress.completedLength} / {selectedJob.progress.totalLength} mm
                          </span>
                        </div>
                        <Progress value={selectedJob.progress.percentage} className="h-3" />
                        <p className="text-xs text-muted-foreground text-right">
                          {selectedJob.progress.percentage}% complete
                        </p>
                      </div>
                    </div>

                    {selectedJob.status === 'in_progress' && (
                      <Alert>
                        <Activity className="h-4 w-4" />
                        <AlertDescription>
                          Job is currently active. Real-time updates enabled.
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* Crew Tab */}
                  <TabsContent value="crew" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Crew Members ({selectedJob.crew.length})
                      </h4>
                      <Badge variant="outline">
                        {selectedJob.crew.filter((c: { status: string }) => c.status === 'on_site').length} on site
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedJob.crew.map((member: { 
                        id: string; 
                        name: string; 
                        role: string; 
                        status: string;
                        location?: string;
                        lastSeen?: Date;
                      }) => (
                        <CrewMemberStatus key={member.id} member={member} />
                      ))}
                    </div>
                    {beacons.length > 0 && (
                      <Alert>
                        <Bluetooth className="h-4 w-4" />
                        <AlertDescription>
                          {beacons.length} beacon{beacons.length !== 1 ? 's' : ''} detected nearby
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* Equipment Tab */}
                  <TabsContent value="equipment" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Equipment ({selectedJob.equipment.length})
                      </h4>
                      <Badge variant="outline">
                        {selectedJob.equipment.filter((e: { status: string }) => e.status === 'in_use').length} active
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedJob.equipment.map((item: {
                        id: string;
                        name: string;
                        type: string;
                        status: string;
                        assignedTo?: string;
                        batteryLevel?: number;
                        hoursUsed: number;
                      }) => (
                        <EquipmentStatus key={item.id} equipment={item} />
                      ))}
                    </div>
                    {selectedJob.equipment.some((e: { batteryLevel?: number }) => e.batteryLevel && e.batteryLevel < 20) && (
                      <Alert variant="destructive">
                        <Battery className="h-4 w-4" />
                        <AlertDescription>
                          Low battery warning on equipment
                        </AlertDescription>
                      </Alert>
                    )}
                  </TabsContent>

                  {/* Compliance Tab */}
                  <TabsContent value="compliance" className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <ComplianceIndicator 
                        status={selectedJob.compliance.ppeVerified} 
                        label="PPE Verified" 
                      />
                      <ComplianceIndicator 
                        status={selectedJob.compliance.waterSystemActive} 
                        label="Water System Active" 
                      />
                      <ComplianceIndicator 
                        status={selectedJob.compliance.dustControlVerified} 
                        label="Dust Control Verified" 
                      />
                      <ComplianceIndicator 
                        status={selectedJob.compliance.controlPlanApproved} 
                        label="Control Plan Approved" 
                      />
                    </div>

                    {selectedJob.exposureLevel > 0.025 && (
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Action Level Exceeded</AlertTitle>
                        <AlertDescription>
                          Silica exposure ({selectedJob.exposureLevel} mg/m³) exceeds OSHA action level (0.025 mg/m³).
                          Medical surveillance may be required.
                        </AlertDescription>
                      </Alert>
                    )}

                    {selectedJob.compliance.issues.length > 0 && (
                      <Alert variant="destructive">
                        <XCircle className="h-4 w-4" />
                        <AlertTitle>Compliance Issues</AlertTitle>
                        <AlertDescription>
                          <ul className="list-disc list-inside mt-2">
                            {selectedJob.compliance.issues.map((issue: string, idx: number) => (
                              <li key={idx} className="text-sm">{issue}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button  className="flex-1">
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Safety Photos
                      </Button>
                      <Button  variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
                        View Control Plan
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Progress Tab */}
                  <TabsContent value="progress" className="space-y-4">
                    <div className="space-y-3">
                      <h4 className="font-medium">Cutting Progress</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Total Length</span>
                          <span>{selectedJob.progress.totalLength} mm</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Completed</span>
                          <span className="font-medium text-green-600">
                            {selectedJob.progress.completedLength} mm
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span>Remaining</span>
                          <span>
                            {selectedJob.progress.totalLength - selectedJob.progress.completedLength} mm
                          </span>
                        </div>
                      </div>
                      <Progress 
                        value={selectedJob.progress.percentage} 
                        className="h-4" 
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Progress Photos</h4>
                        <Badge variant="outline">
                          {selectedJob.progress.photosUploaded} uploaded
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        {Array.from({ length: 6 }).map((_, idx) => (
                          <div 
                            key={idx} 
                            className="aspect-square bg-muted rounded-lg flex items-center justify-center border-2 border-dashed"
                          >
                            {idx < selectedJob.progress.photosUploaded ? (
                              <Camera className="h-6 w-6 text-muted-foreground" />
                            ) : (
                              <Upload className="h-6 w-6 text-muted-foreground/50" />
                            )}
                          </div>
                        ))}
                      </div>

                      <Button className="w-full" >
                        <Camera className="h-4 w-4 mr-2" />
                        Upload Progress Photo
                      </Button>
                    </div>

                    {selectedJob.progress.lastPhotoTime && (
                      <p className="text-xs text-muted-foreground text-center">
                        Last photo: {formatDistanceToNow(selectedJob.progress.lastPhotoTime, { addSuffix: true })}
                      </p>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Last Update */}
      <div className="flex items-center justify-center text-xs text-muted-foreground">
        <Clock className="h-3 w-3 mr-1" />
        Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
      </div>
    </div>
  );
}