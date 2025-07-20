'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Bell,
  CheckCircle,
  AlertTriangle,
  Wrench,
  HardHat,
  Activity,
  Bluetooth,
  Eye,
  Edit,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, addDays, startOfWeek, endOfWeek, isSameDay, isToday } from 'date-fns';
import { CONCRETE_WORK_TYPES, ConcreteWorkType } from '@/types/concrete-work-types';

interface CrewMember {
  id: string;
  name: string;
  role: string;
  avatar?: string;
  skills: string[];
  isOnline: boolean;
  currentLocation?: string;
  beaconId?: string;
}

interface JobEvent {
  id: string;
  title: string;
  workType: ConcreteWorkType;
  startTime: Date;
  endTime: Date;
  client: string;
  location: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  assignedCrew: CrewMember[];
  estimatedHours: number;
  actualHours?: number;
  progress: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  equipment: string[];
  safetyRequirements: string[];
  notes?: string;
}

interface TimeSlot {
  time: string;
  hour: number;
}

const TIME_SLOTS: TimeSlot[] = Array.from({ length: 24 }, (_, i) => ({
  time: `${i.toString().padStart(2, '0')}:00`,
  hour: i
}));

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function SchedulingCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'week' | 'day' | 'month'>('week');
  const [selectedJob, setSelectedJob] = useState<JobEvent | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [jobs, setJobs] = useState<JobEvent[]>([]);
  const [crews, setCrews] = useState<CrewMember[]>([]);
  const [draggedJob, setDraggedJob] = useState<JobEvent | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data
  useEffect(() => {
    const mockCrews: CrewMember[] = [
      {
        id: '1',
        name: 'John Smith',
        role: 'Lead Operator',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
        skills: ['wall_saw', 'core_drill', 'safety_lead'],
        isOnline: true,
        currentLocation: 'Downtown Site A',
        beaconId: 'beacon-001'
      },
      {
        id: '2',
        name: 'Mike Johnson',
        role: 'Assistant',
        skills: ['wall_saw', 'slab_saw'],
        isOnline: true,
        currentLocation: 'Industrial Zone B',
        beaconId: 'beacon-002'
      },
      {
        id: '3',
        name: 'Sarah Davis',
        role: 'Safety Officer',
        skills: ['safety_lead', 'core_drill', 'demolition'],
        isOnline: false,
        currentLocation: 'Off-Site'
      }
    ];

    const mockJobs: JobEvent[] = [
      {
        id: '1',
        title: 'Wall Opening - Building A',
        workType: 'wall_saw',
        startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 8, 0),
        endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 12, 0),
        client: 'ABC Construction',
        location: '123 Main St, Building A',
        priority: 'high',
        status: 'in_progress',
        assignedCrew: [mockCrews[0], mockCrews[1]],
        estimatedHours: 4,
        actualHours: 2.5,
        progress: 60,
        riskLevel: 'medium',
        equipment: ['Hilti DST 20-CA', 'Water Supply System'],
        safetyRequirements: ['PPE Required', 'Dust Control', 'OSHA Training']
      },
      {
        id: '2',
        title: 'Core Drilling - Basement',
        workType: 'core_drill',
        startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 9, 0),
        endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1, 15, 0),
        client: 'XYZ Contractors',
        location: '456 Industrial Blvd',
        priority: 'medium',
        status: 'scheduled',
        assignedCrew: [mockCrews[2]],
        estimatedHours: 6,
        progress: 0,
        riskLevel: 'high',
        equipment: ['Hilti DD 350-CA', 'Core Collection System'],
        safetyRequirements: ['Confined Space Cert', 'PPE Required', 'Gas Monitoring']
      },
      {
        id: '3',
        title: 'Slab Cutting - Parking Garage',
        workType: 'slab_saw',
        startTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 7, 0),
        endTime: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 2, 16, 0),
        client: 'Metro Development',
        location: 'Downtown Parking Structure',
        priority: 'urgent',
        status: 'scheduled',
        assignedCrew: [mockCrews[0], mockCrews[1], mockCrews[2]],
        estimatedHours: 8,
        progress: 0,
        riskLevel: 'medium',
        equipment: ['Floor Saw FS 7000-D', 'Vacuum System', 'Cutting Blades'],
        safetyRequirements: ['PPE Required', 'Traffic Control', 'Noise Monitoring']
      }
    ];

    setCrews(mockCrews);
    setJobs(mockJobs);
  }, [currentDate]);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'urgent': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-500';
      case 'in_progress': return 'bg-pontifex-teal-600';
      case 'completed': return 'bg-green-500';
      case 'cancelled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getJobsForDay = (date: Date) => {
    return jobs.filter(job => isSameDay(job.startTime, date));
  };

  const handleJobClick = (job: JobEvent) => {
    setSelectedJob(job);
    setIsJobModalOpen(true);
  };

  const handleDragStart = (job: JobEvent) => {
    setDraggedJob(job);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetDate: Date) => {
    e.preventDefault();
    if (draggedJob) {
      const updatedJobs = jobs.map(job => {
        if (job.id === draggedJob.id) {
          const duration = job.endTime.getTime() - job.startTime.getTime();
          return {
            ...job,
            startTime: targetDate,
            endTime: new Date(targetDate.getTime() + duration)
          };
        }
        return job;
      });
      setJobs(updatedJobs);
      setDraggedJob(null);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const filteredJobs = filterStatus === 'all' ? jobs : jobs.filter(job => job.status === filterStatus);

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(weekStart, 'MMM dd')} - {format(weekEnd, 'MMM dd, yyyy')}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateWeek('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
                <TabsList>
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="day">Day</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-1" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <Search className="h-4 w-4 mr-1" />
                Search
              </Button>
              <Button className="bg-pontifex-blue hover:bg-pontifex-blue-700">
                <Plus className="h-4 w-4 mr-1" />
                New Job
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Calendar */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-0">
              {/* Calendar Grid */}
              <div className="overflow-hidden">
                {/* Days Header */}
                <div className="grid grid-cols-8 border-b bg-muted/50">
                  <div className="p-3 text-center text-sm font-medium border-r">Time</div>
                  {weekDays.map((day, index) => (
                    <div 
                      key={day.toISOString()} 
                      className={`p-3 text-center border-r ${isToday(day) ? 'bg-pontifex-blue/10' : ''}`}
                    >
                      <div className="text-sm font-medium">{DAYS_OF_WEEK[index]}</div>
                      <div className={`text-lg ${isToday(day) ? 'text-pontifex-blue font-bold' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                <ScrollArea className="h-[600px]">
                  <div className="grid grid-cols-8">
                    {/* Time Column */}
                    <div className="border-r">
                      {TIME_SLOTS.slice(6, 20).map((slot) => (
                        <div key={slot.time} className="h-16 p-2 border-b text-xs text-muted-foreground">
                          {slot.time}
                        </div>
                      ))}
                    </div>

                    {/* Day Columns */}
                    {weekDays.map((day) => (
                      <div 
                        key={day.toISOString()} 
                        className="border-r relative"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, day)}
                      >
                        {TIME_SLOTS.slice(6, 20).map((slot) => (
                          <div key={slot.time} className="h-16 border-b hover:bg-muted/30 transition-colors" />
                        ))}
                        
                        {/* Jobs for this day */}
                        <div className="absolute inset-0 pointer-events-none">
                          {getJobsForDay(day).map((job) => {
                            const startHour = job.startTime.getHours();
                            const endHour = job.endTime.getHours();
                            const top = (startHour - 6) * 64; // 64px per hour
                            const height = (endHour - startHour) * 64;
                            const workType = CONCRETE_WORK_TYPES[job.workType];

                            return (
                              <motion.div
                                key={job.id}
                                className="absolute left-1 right-1 pointer-events-auto cursor-pointer"
                                style={{ top: `${top}px`, height: `${height}px` }}
                                draggable
                                onDragStart={() => handleDragStart(job)}
                                onClick={() => handleJobClick(job)}
                                whileHover={{ scale: 1.02, zIndex: 10 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className={`h-full rounded-lg p-2 text-white shadow-lg border-l-4 ${getStatusColor(job.status)}`}>
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xl">{workType.icon}</span>
                                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(job.priority)}`} />
                                  </div>
                                  <div className="text-xs font-medium truncate">{job.title}</div>
                                  <div className="text-xs opacity-90 truncate">{job.client}</div>
                                  <div className="flex items-center gap-1 mt-1">
                                    <Users className="h-3 w-3" />
                                    <span className="text-xs">{job.assignedCrew.length}</span>
                                    {job.progress > 0 && (
                                      <>
                                        <Activity className="h-3 w-3 ml-1" />
                                        <span className="text-xs">{job.progress}%</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Crew Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crew Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {crews.map((crew) => (
                  <div key={crew.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={crew.avatar} />
                        <AvatarFallback>{crew.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${crew.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{crew.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{crew.role}</p>
                      {crew.currentLocation && (
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground truncate">{crew.currentLocation}</span>
                        </div>
                      )}
                    </div>
                    {crew.beaconId && (
                      <Bluetooth className="h-4 w-4 text-pontifex-blue" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Today's Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Active Jobs</span>
                  <Badge className="bg-pontifex-teal-600">
                    {jobs.filter(job => job.status === 'in_progress').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Scheduled Jobs</span>
                  <Badge variant="outline">
                    {jobs.filter(job => job.status === 'scheduled').length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Crews Working</span>
                  <Badge className="bg-green-500">
                    {crews.filter(crew => crew.isOnline).length}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Completion Rate</span>
                  <Badge className="bg-pontifex-blue">94%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule New Job
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Assign Crew
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Wrench className="h-4 w-4 mr-2" />
                  Check Equipment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  View Alerts
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Job Details Modal */}
      <Dialog open={isJobModalOpen} onOpenChange={setIsJobModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedJob && (
                <>
                  <span className="text-2xl">{CONCRETE_WORK_TYPES[selectedJob.workType].icon}</span>
                  {selectedJob.title}
                  <Badge className={getStatusColor(selectedJob.status)}>
                    {selectedJob.status}
                  </Badge>
                </>
              )}
            </DialogTitle>
          </DialogHeader>
          
          {selectedJob && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Job Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Client:</span>
                      <span>{selectedJob.client}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-right">{selectedJob.location}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span>{format(selectedJob.startTime, 'HH:mm')} - {format(selectedJob.endTime, 'HH:mm')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority:</span>
                      <Badge variant="outline" className={getPriorityColor(selectedJob.priority)}>
                        {selectedJob.priority}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Progress</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Completion</span>
                      <span>{selectedJob.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-pontifex-teal-600 h-2 rounded-full transition-all"
                        style={{ width: `${selectedJob.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Estimated:</span>
                      <span>{selectedJob.estimatedHours}h</span>
                    </div>
                    {selectedJob.actualHours && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Actual:</span>
                        <span>{selectedJob.actualHours}h</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Assigned Crew ({selectedJob.assignedCrew.length})</h4>
                <div className="flex gap-2 flex-wrap">
                  {selectedJob.assignedCrew.map((crew) => (
                    <div key={crew.id} className="flex items-center gap-2 bg-muted p-2 rounded-lg">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={crew.avatar} />
                        <AvatarFallback className="text-xs">{crew.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{crew.name}</span>
                      <Badge variant="outline" className="text-xs">{crew.role}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Equipment</h4>
                  <ul className="text-sm space-y-1">
                    {selectedJob.equipment.map((item, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Wrench className="h-3 w-3 text-muted-foreground" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Safety Requirements</h4>
                  <ul className="text-sm space-y-1">
                    {selectedJob.safetyRequirements.map((req, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <HardHat className="h-3 w-3 text-muted-foreground" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-pontifex-blue hover:bg-pontifex-blue-700">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Job
                </Button>
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}