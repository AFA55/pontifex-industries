'use client';

import React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  HardHat,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Shield,
  Users,
  Wrench,
  Activity,
  Bluetooth,
  RefreshCw,
  Wind,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BluetoothService, BeaconData } from '@/lib/bluetooth';
import { ConcreteWorkType } from '@/types/concrete-work-types';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  beaconId?: string;
  location?: string;
  lastSeen?: Date;
  status: 'on_site' | 'nearby' | 'off_site';
  currentTask?: string;
  certifications: string[];
}

interface Equipment {
  id: string;
  name: string;
  type: string;
  model?: string;
  beaconId?: string;
  status: 'in_use' | 'available' | 'maintenance';
  assignedTo?: string;
  batteryLevel?: number;
  lastMaintenance?: Date;
  hoursUsed: number;
}

interface SafetyCompliance {
  ppeVerified: boolean;
  waterSystemActive: boolean;
  dustControlVerified: boolean;
  controlPlanApproved: boolean;
  lastInspection?: Date;
  issues: string[];
}

interface JobProgress {
  totalLength: number;
  completedLength: number;
  percentage: number;
  estimatedCompletion: Date;
  photosUploaded: number;
  lastPhotoTime?: Date;
}

interface ConcreteJob {
  id: string;
  orderNumber: string;
  workType: ConcreteWorkType;
  clientName: string;
  siteAddress: string;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  scheduledDate: Date;
  startedAt?: Date;
  crew: CrewMember[];
  equipment: Equipment[];
  compliance: SafetyCompliance;
  progress: JobProgress;
  exposureLevel: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  indoor: boolean;
  dimensions: {
    length: number;
    depth: number;
    width?: number;
  };
}

interface DashboardMetrics {
  activeJobs: number;
  crewOnSite: number;
  equipmentInUse: number;
  complianceRate: number;
  avgExposureLevel: number;
  safetyAlerts: number;
}

export function ConcreteJobDashboard() {
  const { toast } = useToast();
  const supabase = createClient();
  const [, setSelectedJob] = useState<ConcreteJob | undefined>(undefined);
  const [jobs, setJobs] = useState<ConcreteJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<ConcreteJob[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeJobs: 0,
    crewOnSite: 0,
    equipmentInUse: 0,
    complianceRate: 0,
    avgExposureLevel: 0,
    safetyAlerts: 0
  });
  const [, setBeacons] = useState<BeaconData[]>([]);
  const [scanning, setScanning] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Status configuration matching main dashboard theme
  const statusConfig = {
    pending: { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20', label: 'Pending' },
    in_progress: { icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20', label: 'In Progress' },
    completed: { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-green-500/20', label: 'Completed' },
    on_hold: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20', label: 'On Hold' }
  };

  const priorityConfig = {
    low: { color: 'text-gray-500', bg: 'bg-gray-500/10', border: 'border-gray-500/20' },
    medium: { color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    high: { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    urgent: { color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' }
  };

  const riskConfig = {
    low: { color: 'text-green-500', bg: 'bg-green-500/10' },
    medium: { color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
    high: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
    critical: { color: 'text-red-500', bg: 'bg-red-500/10' }
  };

  // Search and filter functionality
  useEffect(() => {
    let filtered = [...jobs];
    
    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.siteAddress.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }
    
    setFilteredJobs(filtered);
  }, [jobs, searchTerm, filterStatus]);

  // Mock data for demonstration
  useEffect(() => {
    const mockJobs: ConcreteJob[] = [
      {
        id: '1',
        orderNumber: 'CJ-2024-001',
        workType: 'wall_saw',
        clientName: 'ABC Construction',
        siteAddress: '123 Main St, Building A, Floor 3',
        status: 'in_progress',
        priority: 'high',
        scheduledDate: new Date(),
        startedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        crew: [
          {
            id: '1',
            name: 'John Smith',
            role: 'Lead Operator',
            status: 'on_site',
            currentTask: 'Wall cutting - Section A',
            certifications: ['OSHA 30', 'Silica Awareness']
          },
          {
            id: '2',
            name: 'Mike Johnson',
            role: 'Safety Observer',
            status: 'on_site',
            currentTask: 'Dust monitoring',
            certifications: ['First Aid', 'Safety Management']
          }
        ],
        equipment: [
          {
            id: '1',
            name: 'Hilti DSH 700-X',
            type: 'Wall Saw',
            status: 'in_use',
            batteryLevel: 85,
            hoursUsed: 2.5
          },
          {
            id: '2',
            name: 'Dust Control Unit',
            type: 'Safety Equipment',
            status: 'in_use',
            hoursUsed: 2.5
          }
        ],
        compliance: {
          ppeVerified: true,
          waterSystemActive: true,
          dustControlVerified: true,
          controlPlanApproved: true,
          lastInspection: new Date(Date.now() - 30 * 60 * 1000),
          issues: []
        },
        progress: {
          totalLength: 50,
          completedLength: 32,
          percentage: 64,
          estimatedCompletion: new Date(Date.now() + 3 * 60 * 60 * 1000),
          photosUploaded: 12,
          lastPhotoTime: new Date(Date.now() - 15 * 60 * 1000)
        },
        exposureLevel: 0.045,
        riskLevel: 'medium',
        indoor: true,
        dimensions: {
          length: 50,
          depth: 15,
          width: 200
        }
      },
      {
        id: '2',
        orderNumber: 'CJ-2024-002',
        workType: 'core_drill',
        clientName: 'XYZ Engineering',
        siteAddress: '456 Oak Ave, Basement Level',
        status: 'pending',
        priority: 'urgent',
        scheduledDate: new Date(Date.now() + 4 * 60 * 60 * 1000),
        crew: [
          {
            id: '3',
            name: 'Sarah Wilson',
            role: 'Drill Operator',
            status: 'off_site',
            certifications: ['OSHA 30', 'Core Drilling Certified']
          }
        ],
        equipment: [
          {
            id: '3',
            name: 'Hilti DD 350-CA',
            type: 'Core Drill',
            status: 'available',
            hoursUsed: 0
          }
        ],
        compliance: {
          ppeVerified: false,
          waterSystemActive: false,
          dustControlVerified: false,
          controlPlanApproved: true,
          issues: ['PPE verification pending']
        },
        progress: {
          totalLength: 0,
          completedLength: 0,
          percentage: 0,
          estimatedCompletion: new Date(Date.now() + 32 * 60 * 60 * 1000),
          photosUploaded: 0
        },
        exposureLevel: 0.08,
        riskLevel: 'high',
        indoor: false,
        dimensions: {
          length: 500,
          depth: 400,
          width: 150
        }
      }
    ];

    setJobs(mockJobs);
    setSelectedJob(mockJobs[0]);
    setLoading(false);

    // Calculate metrics
    const activeJobs = mockJobs.filter(j => j.status === 'in_progress').length;
    const crewOnSite = mockJobs.reduce((acc, job) => 
      acc + job.crew.filter(c => c.status === 'on_site').length, 0
    );
    const equipmentInUse = mockJobs.reduce((acc, job) => 
      acc + job.equipment.filter(e => e.status === 'in_use').length, 0
    );
    const complianceRate = mockJobs.reduce((acc, job) => {
      const compliant = job.compliance.ppeVerified && 
                       job.compliance.dustControlVerified && 
                       job.compliance.controlPlanApproved;
      return acc + (compliant ? 1 : 0);
    }, 0) / mockJobs.length * 100;
    const avgExposureLevel = mockJobs.reduce((acc, job) => 
      acc + job.exposureLevel, 0
    ) / mockJobs.length;
    const safetyAlerts = mockJobs.reduce((acc, job) => 
      acc + job.compliance.issues.length, 0
    );

    setMetrics({
      activeJobs,
      crewOnSite,
      equipmentInUse,
      complianceRate,
      avgExposureLevel,
      safetyAlerts
    });
  }, []);

  // Beacon scanning
  const startBeaconScan = useCallback(async () => {
    setScanning(true);
    try {
      const bluetoothService = new BluetoothService();
      await bluetoothService.startScanning((beacons) => {
        setBeacons(beacons);
      });

      toast({
        title: 'Beacon scanning started',
        description: 'Tracking crew and equipment locations',
      });
    } catch (error) {
      console.error('Beacon scan error:', error);
      toast({
        title: 'Beacon scanning unavailable',
        description: 'Using last known locations',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  }, [toast]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setLastUpdate(new Date());
      // In a real app, this would fetch new data
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('job-updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'work_orders'
      }, (payload) => {
        console.log('Job update:', payload);
        // Update jobs state based on changes
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLastUpdate(new Date());
    setRefreshing(false);
    toast({
      title: 'Dashboard refreshed',
      description: 'All data has been updated',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with glassmorphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <HardHat className="h-8 w-8 text-pontifex-blue" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pontifex-blue to-pontifex-teal-600 bg-clip-text text-transparent">
                  Concrete Jobs
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setAutoRefresh(!autoRefresh)}
                variant="outline"
                
                className="hidden sm:flex"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                Auto Refresh
              </Button>
              
              <Button
                onClick={startBeaconScan}
                variant="outline"
                
                disabled={scanning}
                className="hidden sm:flex"
              >
                <Bluetooth className={`h-4 w-4 mr-2 ${scanning ? 'animate-pulse' : ''}`} />
                {scanning ? 'Scanning...' : 'Scan Beacons'}
              </Button>
              
              <Button 
                className="bg-gradient-to-r from-pontifex-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 min-h-[44px]"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Search and Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search jobs by order number, client, or address..."
                  className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontifex-blue focus:border-transparent min-h-[44px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <select
                  className="pl-10 pr-8 py-3 bg-white/50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-pontifex-blue min-h-[44px] appearance-none"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="min-h-[44px]"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-600">
            Last updated: {formatDistanceToNow(lastUpdate, { addSuffix: true })}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeJobs}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                <Activity className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:shadow-green-500/25 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Crew On Site</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.crewOnSite}</p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Equipment In Use</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.equipmentInUse}</p>
              </div>
              <div className="h-12 w-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                <Wrench className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:shadow-purple-500/25 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.complianceRate}%</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Exposure</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.avgExposureLevel.toFixed(1)}μg/m³</p>
              </div>
              <div className="h-12 w-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                <Wind className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg hover:shadow-xl hover:shadow-red-500/25 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Safety Alerts</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.safetyAlerts}</p>
              </div>
              <div className="h-12 w-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Jobs Grid */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Active Jobs</h2>
            <Badge variant="outline" className="bg-white/50">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
            </Badge>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="bg-white/50 rounded-xl p-6 animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12">
              <HardHat className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-500 mb-2">No jobs found</h3>
              <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredJobs.map((job) => {
                const statusData = statusConfig[job.status];
                const StatusIcon = statusData.icon;
                const priorityData = priorityConfig[job.priority];
                const riskData = riskConfig[job.riskLevel];

                return (
                  <motion.div
                    key={job.id}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    onClick={() => setSelectedJob(job)}
                  >
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-bold text-gray-900">{job.orderNumber}</h3>
                          <Badge 
                            className={`${statusData.bg} ${statusData.color} ${statusData.border} border`}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusData.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{job.clientName}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          {job.siteAddress}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline"
                          className={`${priorityData.bg} ${priorityData.color} ${priorityData.border} border text-xs`}
                        >
                          {job.priority.toUpperCase()}
                        </Badge>
                        <Button
                          variant="ghost"
                          
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Work Type and Progress */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Work Type:</span>
                        <span className="font-medium capitalize">{job.workType.replace('_', ' ')}</span>
                      </div>
                      
                      {job.status === 'in_progress' && (
                        <div>
                          <div className="flex items-center justify-between text-sm mb-1">
                            <span className="text-gray-600">Progress:</span>
                            <span className="font-medium">{job.progress.percentage}%</span>
                          </div>
                          <Progress value={job.progress.percentage} className="h-2" />
                        </div>
                      )}
                    </div>

                    {/* Crew and Equipment */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Crew ({job.crew.length})</p>
                        <div className="flex -space-x-1">
                          {job.crew.slice(0, 3).map((member) => (
                            <Avatar key={member.id} className="h-6 w-6 border-2 border-white">
                              <AvatarFallback className="text-xs">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {job.crew.length > 3 && (
                            <div className="h-6 w-6 bg-gray-200 rounded-full border-2 border-white flex items-center justify-center">
                              <span className="text-xs text-gray-600">+{job.crew.length - 3}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Equipment ({job.equipment.length})</p>
                        <div className="flex items-center space-x-1">
                          {job.equipment.slice(0, 2).map((item) => (
                            <div 
                              key={item.id}
                              className="h-6 w-6 bg-blue-100 rounded flex items-center justify-center"
                            >
                              <Wrench className="h-3 w-3 text-blue-600" />
                            </div>
                          ))}
                          {job.equipment.length > 2 && (
                            <span className="text-xs text-gray-600">+{job.equipment.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Safety and Risk */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className={`h-2 w-2 rounded-full ${riskData.color.replace('text-', 'bg-')}`}></div>
                        <span className="text-xs text-gray-600">Risk: {job.riskLevel}</span>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        {job.compliance.issues.length === 0 ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-xs text-gray-600">
                          {job.compliance.issues.length === 0 ? 'Compliant' : `${job.compliance.issues.length} issues`}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          
                          className="h-8 px-3 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJob(job);
                          }}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          
                          className="h-8 px-3 text-xs"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Edit job logic
                          }}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      </div>
                      
                      {job.status === 'in_progress' && (
                        <p className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {job.startedAt && formatDistanceToNow(job.startedAt, { addSuffix: true })}
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
