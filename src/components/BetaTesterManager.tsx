import React from 'react';
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Mail, 
  Phone, 
  Calendar, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  UserPlus,
  MessageSquare,
  Settings,
  Filter,
  Search,
  Download,
  Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BetaTester {
  id: string;
  
  // Basic Information
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactRole: string;
  
  // Classification
  betaGroup: 'alpha' | 'beta' | 'gamma';
  companySize: 'micro' | 'small' | 'medium' | 'large';
  yearsInBusiness: number;
  primaryWorkTypes: string[];
  
  // Onboarding Status
  invitedAt: Date;
  onboardedAt?: Date;
  lastActiveAt?: Date;
  status: 'invited' | 'onboarded' | 'active' | 'inactive' | 'churned';
  
  // Technical Setup
  hasBluetoothSupport: boolean;
  deviceTypes: string[];
  internetReliability: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Performance Metrics
  sessionsCount: number;
  totalTimeSpent: number; // minutes
  feedbackSubmissions: number;
  averageRating: number;
  bugReports: number;
  featureRequests: number;
  
  // Testing Preferences
  testingGoals: string[];
  feedbackFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  allowFollowUp: boolean;
  preferredContactMethod: 'email' | 'phone' | 'in-app';
  
  // Compliance & Safety
  requiresOSHA: boolean;
  requiresSilicaMonitoring: boolean;
  documentationNeeds: string[];
  
  // Notes and Communication
  notes: string[];
  lastContactDate?: Date;
  nextFollowUpDate?: Date;
}

interface TesterCommunication {
  id: string;
  testerId: string;
  type: 'email' | 'phone' | 'in-app' | 'note';
  subject: string;
  content: string;
  sentAt: Date;
  sentBy: string;
  response?: string;
  responseAt?: Date;
  status: 'sent' | 'delivered' | 'opened' | 'responded' | 'failed';
}

interface BetaTesterManagerProps {
  onTesterInvite?: (tester: Partial<BetaTester>) => void;
  onTesterUpdate?: (tester: BetaTester) => void;
  onTesterRemove?: (testerId: string) => void;
}

// Mock data generator
const generateMockTesters = (): BetaTester[] => {
  const companies = [
    'Precision Concrete Cutting', 'Metro Diamond Drilling', 'Coastal Concrete Services',
    'Mountain View Cutting Co', 'Urban Concrete Solutions', 'Elite Diamond Services',
    'Professional Concrete Cutting', 'Advanced Drilling Systems', 'Superior Concrete Works',
    'Diamond Edge Services', 'Concrete Specialists Inc', 'Premier Cutting Solutions',
    'Industrial Concrete Services', 'Expert Diamond Drilling', 'Concrete Cutting Pros'
  ];

  const workTypes = [
    'Core Drilling', 'Wall Sawing', 'Slab Sawing', 'Chain Sawing', 'Ring Sawing',
    'Hand Sawing', 'Breaking & Removal', 'Chipping', 'Joint Sealing', 'Demolition'
  ];

  const testingGoals = [
    'Improve job efficiency', 'Better safety compliance', 'Equipment tracking',
    'Cost reduction', 'Documentation automation', 'Crew management'
  ];

  return Array.from({ length: 15 }, (_, i) => {
    const companyName = companies[i];
    const betaGroups = ['alpha', 'beta', 'gamma'] as const;
    const companySizes = ['micro', 'small', 'medium', 'large'] as const;
    const statuses = ['invited', 'onboarded', 'active', 'inactive'] as const;
    
    const invitedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const isOnboarded = Math.random() > 0.2;
    
    return {
      id: `tester-${i + 1}`,
      companyName,
      contactName: `Contact ${i + 1}`,
      contactEmail: `contact${i + 1}@${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
      contactPhone: `(555) ${String(Math.floor(Math.random() * 900) + 100)}-${String(Math.floor(Math.random() * 9000) + 1000)}`,
      contactRole: ['Owner', 'Project Manager', 'Operations Manager', 'Foreman'][Math.floor(Math.random() * 4)],
      
      betaGroup: betaGroups[i % 3],
      companySize: companySizes[Math.floor(Math.random() * 4)],
      yearsInBusiness: Math.floor(Math.random() * 25) + 1,
      primaryWorkTypes: workTypes.slice(0, Math.floor(Math.random() * 4) + 2),
      
      invitedAt: invitedDate,
      onboardedAt: isOnboarded ? new Date(invitedDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      lastActiveAt: isOnboarded ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined,
      status: statuses[Math.floor(Math.random() * 4)],
      
      hasBluetoothSupport: Math.random() > 0.3,
      deviceTypes: ['Smartphones', 'Tablets', 'Laptops'].slice(0, Math.floor(Math.random() * 3) + 1),
      internetReliability: ['excellent', 'good', 'fair', 'poor'][Math.floor(Math.random() * 4)] as any,
      
      sessionsCount: Math.floor(Math.random() * 50) + 5,
      totalTimeSpent: Math.floor(Math.random() * 300) + 30,
      feedbackSubmissions: Math.floor(Math.random() * 10) + 1,
      averageRating: Math.floor(Math.random() * 4) + 6,
      bugReports: Math.floor(Math.random() * 5),
      featureRequests: Math.floor(Math.random() * 8),
      
      testingGoals: testingGoals.slice(0, Math.floor(Math.random() * 3) + 1),
      feedbackFrequency: ['daily', 'weekly', 'biweekly', 'monthly'][Math.floor(Math.random() * 4)] as any,
      allowFollowUp: Math.random() > 0.1,
      preferredContactMethod: ['email', 'phone', 'in-app'][Math.floor(Math.random() * 3)] as any,
      
      requiresOSHA: Math.random() > 0.3,
      requiresSilicaMonitoring: Math.random() > 0.4,
      documentationNeeds: ['OSHA compliance reports', 'Job progress photos', 'Equipment logs'].slice(0, Math.floor(Math.random() * 3) + 1),
      
      notes: [`Initial contact: ${invitedDate.toLocaleDateString()}`],
      lastContactDate: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000) : undefined,
      nextFollowUpDate: Math.random() > 0.6 ? new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000) : undefined
    };
  });
};

export default function BetaTesterManager({
  onTesterInvite,
  onTesterUpdate,
  onTesterRemove
}: BetaTesterManagerProps) {
  const [testers, setTesters] = useState<BetaTester[]>([]);
  const [filteredTesters, setFilteredTesters] = useState<BetaTester[]>([]);
  const [selectedTester, setSelectedTester] = useState<BetaTester | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [betaGroupFilter, setBetaGroupFilter] = useState<string>('all');
  const [companySizeFilter, setCompanySizeFilter] = useState<string>('all');

  const { toast } = useToast();

  useEffect(() => {
    // Load mock data
    const mockTesters = generateMockTesters();
    setTesters(mockTesters);
    setFilteredTesters(mockTesters);
  }, []);

  useEffect(() => {
    // Apply filters
    let filtered = testers;

    if (searchTerm) {
      filtered = filtered.filter(tester =>
        tester.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tester.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tester.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(tester => tester.status === statusFilter);
    }

    if (betaGroupFilter !== 'all') {
      filtered = filtered.filter(tester => tester.betaGroup === betaGroupFilter);
    }

    if (companySizeFilter !== 'all') {
      filtered = filtered.filter(tester => tester.companySize === companySizeFilter);
    }

    setFilteredTesters(filtered);
  }, [testers, searchTerm, statusFilter, betaGroupFilter, companySizeFilter]);

  const getStatusBadge = (status: BetaTester['status']) => {
    const variants = {
      invited: { color: 'secondary', icon: Mail },
      onboarded: { color: 'default', icon: CheckCircle },
      active: { color: 'default', icon: Activity },
      inactive: { color: 'outline', icon: AlertTriangle },
      churned: { color: 'destructive', icon: XCircle }
    };

    const variant = variants[status];
    const Icon = variant.icon;
    
    return (
      <Badge variant={variant.color as any} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getBetaGroupBadge = (group: BetaTester['betaGroup']) => {
    const colors = {
      alpha: 'destructive',
      beta: 'default',
      gamma: 'secondary'
    };

    return <Badge variant={colors[group] as any}>{group.toUpperCase()}</Badge>;
  };

  const getEngagementScore = (tester: BetaTester): number => {
    const sessionScore = Math.min(tester.sessionsCount / 20, 1) * 30;
    const feedbackScore = Math.min(tester.feedbackSubmissions / 5, 1) * 25;
    const ratingScore = (tester.averageRating / 10) * 25;
    const activityScore = tester.lastActiveAt 
      ? Math.max(0, 1 - (Date.now() - tester.lastActiveAt.getTime()) / (7 * 24 * 60 * 60 * 1000)) * 20
      : 0;

    return Math.round(sessionScore + feedbackScore + ratingScore + activityScore);
  };

  const handleInviteTester = () => {
    // This would open a modal or form to invite a new tester
    toast({
      title: "Invite New Tester",
      description: "Invitation form would open here"
    });
    
    if (onTesterInvite) {
      onTesterInvite({});
    }
  };

  const handleSendMessage = (testerId: string) => {
    toast({
      title: "Send Message",
      description: "Message composition modal would open here"
    });
  };

  const handleExportData = () => {
    // Export filtered tester data
    const csvData = filteredTesters.map(tester => ({
      Company: tester.companyName,
      Contact: tester.contactName,
      Email: tester.contactEmail,
      'Beta Group': tester.betaGroup.toUpperCase(),
      Status: tester.status,
      'Company Size': tester.companySize,
      'Sessions': tester.sessionsCount,
      'Avg Rating': tester.averageRating,
      'Engagement Score': getEngagementScore(tester)
    }));

    toast({
      title: "Export Started",
      description: `Exporting data for ${csvData.length} testers`
    });
  };

  const renderOverview = () => {
    const stats = {
      total: testers.length,
      active: testers.filter(t => t.status === 'active').length,
      onboarded: testers.filter(t => t.status === 'onboarded' || t.status === 'active').length,
      highEngagement: testers.filter(t => getEngagementScore(t) >= 70).length,
      avgRating: testers.reduce((sum, t) => sum + t.averageRating, 0) / testers.length,
      totalFeedback: testers.reduce((sum, t) => sum + t.feedbackSubmissions, 0)
    };

    return (
      <div className="space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Testers</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Users className="h-8 w-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Testers</p>
                  <p className="text-2xl font-bold">{stats.active}</p>
                  <p className="text-xs text-gray-500">
                    {((stats.active / stats.total) * 100).toFixed(0)}% of total
                  </p>
                </div>
                <Activity className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Rating</p>
                  <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}/10</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Feedback</p>
                  <p className="text-2xl font-bold">{stats.totalFeedback}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Beta Testers</CardTitle>
              <div className="flex gap-2">
                <Button  variant="outline" onClick={handleExportData}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button  onClick={handleInviteTester}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Invite Tester
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search testers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="invited">Invited</SelectItem>
                  <SelectItem value="onboarded">Onboarded</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="churned">Churned</SelectItem>
                </SelectContent>
              </Select>

              <Select value={betaGroupFilter} onValueChange={setBetaGroupFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Group" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="alpha">Alpha</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="gamma">Gamma</SelectItem>
                </SelectContent>
              </Select>

              <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sizes</SelectItem>
                  <SelectItem value="micro">Micro</SelectItem>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Testers List */}
            <div className="space-y-4">
              {filteredTesters.map((tester) => {
                const engagementScore = getEngagementScore(tester);
                
                return (
                  <div
                    key={tester.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedTester(tester)}
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          {tester.contactName.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">{tester.companyName}</h3>
                          {getStatusBadge(tester.status)}
                          {getBetaGroupBadge(tester.betaGroup)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {tester.contactName} • {tester.contactEmail}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{tester.sessionsCount} sessions</span>
                          <span>{tester.feedbackSubmissions} feedback</span>
                          <span>{tester.averageRating}/10 rating</span>
                          {tester.lastActiveAt && (
                            <span>Last active: {tester.lastActiveAt.toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Engagement</div>
                        <div className="flex items-center gap-2">
                          <Progress value={engagementScore} className="w-16 h-2" />
                          <span className="text-sm font-bold">{engagementScore}%</span>
                        </div>
                      </div>

                      <div className="flex gap-1">
                        <Button
                          
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendMessage(tester.id);
                          }}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                        <Button
                          
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTester(tester);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTesters.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No testers found</h3>
                <p className="text-gray-600">Try adjusting your filters or search term.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Beta Group Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Beta Group Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['alpha', 'beta', 'gamma'].map((group) => {
                const count = testers.filter(t => t.betaGroup === group).length;
                const percentage = (count / testers.length) * 100;
                
                return (
                  <div key={group} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getBetaGroupBadge(group as any)}
                      <span className="capitalize">{group}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="w-16 h-2" />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Company Size Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Company Size Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {['micro', 'small', 'medium', 'large'].map((size) => {
                const count = testers.filter(t => t.companySize === size).length;
                const percentage = (count / testers.length) * 100;
                
                return (
                  <div key={size} className="flex items-center justify-between">
                    <span className="capitalize">{size}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={percentage} className="w-16 h-2" />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Engagement Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium mb-3">High Engagement (70%+)</h4>
              <div className="space-y-2">
                {testers
                  .filter(t => getEngagementScore(t) >= 70)
                  .slice(0, 5)
                  .map(tester => (
                    <div key={tester.id} className="flex justify-between text-sm">
                      <span>{tester.companyName}</span>
                      <span className="font-medium">{getEngagementScore(tester)}%</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Medium Engagement (40-69%)</h4>
              <div className="space-y-2">
                {testers
                  .filter(t => {
                    const score = getEngagementScore(t);
                    return score >= 40 && score < 70;
                  })
                  .slice(0, 5)
                  .map(tester => (
                    <div key={tester.id} className="flex justify-between text-sm">
                      <span>{tester.companyName}</span>
                      <span className="font-medium">{getEngagementScore(tester)}%</span>
                    </div>
                  ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Low Engagement (&lt;40%)</h4>
              <div className="space-y-2">
                {testers
                  .filter(t => getEngagementScore(t) < 40)
                  .slice(0, 5)
                  .map(tester => (
                    <div key={tester.id} className="flex justify-between text-sm">
                      <span>{tester.companyName}</span>
                      <span className="font-medium text-red-600">{getEngagementScore(tester)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Beta Tester Management</h2>
        <Badge variant="outline">{filteredTesters.length} of {testers.length} testers</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="communication">Communication</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverview()}
        </TabsContent>

        <TabsContent value="analytics">
          {renderAnalytics()}
        </TabsContent>

        <TabsContent value="communication">
          <Card>
            <CardHeader>
              <CardTitle>Communication Center</CardTitle>
              <CardDescription>Manage communications with beta testers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Communication features coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Tester Detail Modal */}
      {selectedTester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold">{selectedTester.companyName}</h3>
                <p className="text-gray-600">{selectedTester.contactName} • {selectedTester.contactEmail}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedTester(null)}>
                ✕
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Status:</span>
                    {getStatusBadge(selectedTester.status)}
                  </div>
                  <div className="flex justify-between">
                    <span>Beta Group:</span>
                    {getBetaGroupBadge(selectedTester.betaGroup)}
                  </div>
                  <div className="flex justify-between">
                    <span>Company Size:</span>
                    <span className="capitalize">{selectedTester.companySize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Years in Business:</span>
                    <span>{selectedTester.yearsInBusiness}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Primary Work Types:</span>
                    <span>{selectedTester.primaryWorkTypes.length}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Performance Metrics</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Sessions:</span>
                    <span className="font-medium">{selectedTester.sessionsCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Time:</span>
                    <span className="font-medium">{selectedTester.totalTimeSpent} min</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Feedback:</span>
                    <span className="font-medium">{selectedTester.feedbackSubmissions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Average Rating:</span>
                    <span className="font-medium">{selectedTester.averageRating}/10</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Engagement Score:</span>
                    <span className="font-medium">{getEngagementScore(selectedTester)}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setSelectedTester(null)}>
                Close
              </Button>
              <Button onClick={() => handleSendMessage(selectedTester.id)}>
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}