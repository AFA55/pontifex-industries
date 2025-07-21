'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Activity, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Star,
  CheckCircle,
  XCircle,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';

interface BetaTesterMetrics {
  testerId: string;
  companyName: string;
  betaGroup: 'alpha' | 'beta' | 'gamma';
  
  // Engagement Metrics
  sessionsCount: number;
  totalTimeSpent: number; // minutes
  lastActiveDate: Date;
  featureUsageCount: Record<string, number>;
  
  // Performance Metrics
  taskCompletionRate: number; // percentage
  averageTaskTime: number; // minutes
  errorEncounters: number;
  supportTickets: number;
  
  // Feedback Metrics
  feedbackSubmissions: number;
  averageRating: number;
  bugReports: number;
  featureRequests: number;
  
  // System Performance
  averageLoadTime: number; // seconds
  crashCount: number;
  bluetoothSuccessRate: number; // percentage
  
  // Progress Tracking
  onboardingCompleted: boolean;
  tutorialCompleted: boolean;
  firstJobCreated: boolean;
  firstSafetyCheck: boolean;
  photoUploadUsed: boolean;
}

interface AggregatedMetrics {
  totalTesters: number;
  activeTesters: number;
  retentionRate: number;
  overallSatisfaction: number;
  criticalIssues: number;
  featureAdoption: Record<string, number>;
  performanceTrends: {
    date: string;
    loadTime: number;
    errorRate: number;
    satisfaction: number;
  }[];
}

interface BetaPerformanceMonitoringProps {
  timeRange: '7d' | '30d' | '90d';
  betaGroup?: 'alpha' | 'beta' | 'gamma' | 'all';
  onTimeRangeChange: (range: '7d' | '30d' | '90d') => void;
  onBetaGroupChange: (group: 'alpha' | 'beta' | 'gamma' | 'all') => void;
}

// Mock data for demonstration
const generateMockMetrics = (): { testers: BetaTesterMetrics[], aggregated: AggregatedMetrics } => {
  const features = [
    'Job Creation', 'Work Type Selection', 'Safety Compliance', 'Equipment Tracking',
    'Crew Management', 'Photo Upload', 'Progress Tracking', 'Bluetooth Scanning',
    'Dashboard Overview', 'Calculations Engine', 'Reporting'
  ];

  const testers: BetaTesterMetrics[] = Array.from({ length: 15 }, (_, i) => ({
    testerId: `tester-${i + 1}`,
    companyName: `Concrete Co ${i + 1}`,
    betaGroup: ['alpha', 'beta', 'gamma'][i % 3] as 'alpha' | 'beta' | 'gamma',
    sessionsCount: Math.floor(Math.random() * 50) + 10,
    totalTimeSpent: Math.floor(Math.random() * 300) + 60,
    lastActiveDate: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    featureUsageCount: features.reduce((acc, feature) => ({
      ...acc,
      [feature]: Math.floor(Math.random() * 25)
    }), {}),
    taskCompletionRate: Math.floor(Math.random() * 40) + 60,
    averageTaskTime: Math.floor(Math.random() * 10) + 5,
    errorEncounters: Math.floor(Math.random() * 10),
    supportTickets: Math.floor(Math.random() * 3),
    feedbackSubmissions: Math.floor(Math.random() * 8) + 2,
    averageRating: Math.floor(Math.random() * 3) + 7,
    bugReports: Math.floor(Math.random() * 5),
    featureRequests: Math.floor(Math.random() * 8),
    averageLoadTime: Math.random() * 3 + 1,
    crashCount: Math.floor(Math.random() * 3),
    bluetoothSuccessRate: Math.floor(Math.random() * 30) + 70,
    onboardingCompleted: Math.random() > 0.2,
    tutorialCompleted: Math.random() > 0.3,
    firstJobCreated: Math.random() > 0.1,
    firstSafetyCheck: Math.random() > 0.15,
    photoUploadUsed: Math.random() > 0.4
  }));

  const aggregated: AggregatedMetrics = {
    totalTesters: testers.length,
    activeTesters: testers.filter(t => Date.now() - t.lastActiveDate.getTime() < 7 * 24 * 60 * 60 * 1000).length,
    retentionRate: 78,
    overallSatisfaction: testers.reduce((acc, t) => acc + t.averageRating, 0) / testers.length,
    criticalIssues: testers.reduce((acc, t) => acc + (t.crashCount > 1 ? 1 : 0), 0),
    featureAdoption: features.reduce((acc, feature) => ({
      ...acc,
      [feature]: testers.filter(t => t.featureUsageCount[feature] > 0).length
    }), {}),
    performanceTrends: Array.from({ length: 30 }, (_, i) => ({
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      loadTime: Math.random() * 1 + 2,
      errorRate: Math.random() * 5,
      satisfaction: Math.random() * 2 + 7
    })).reverse()
  };

  return { testers, aggregated };
};

export default function BetaPerformanceMonitoring({
  timeRange,
  betaGroup = 'all',
  onTimeRangeChange,
  onBetaGroupChange
}: BetaPerformanceMonitoringProps) {
  const [metrics, setMetrics] = useState(() => generateMockMetrics());
  const [selectedTester, setSelectedTester] = useState<string | null>(null);

  // Filter testers based on beta group
  const filteredTesters = betaGroup === 'all' 
    ? metrics.testers 
    : metrics.testers.filter(t => t.betaGroup === betaGroup);

  const avgMetrics = {
    satisfaction: filteredTesters.reduce((acc, t) => acc + t.averageRating, 0) / filteredTesters.length,
    completionRate: filteredTesters.reduce((acc, t) => acc + t.taskCompletionRate, 0) / filteredTesters.length,
    loadTime: filteredTesters.reduce((acc, t) => acc + t.averageLoadTime, 0) / filteredTesters.length,
    bluetoothSuccess: filteredTesters.reduce((acc, t) => acc + t.bluetoothSuccessRate, 0) / filteredTesters.length
  };

  const getStatusColor = (value: number, type: 'rating' | 'percentage' | 'time') => {
    switch (type) {
      case 'rating':
        return value >= 8 ? 'text-green-600' : value >= 6 ? 'text-yellow-600' : 'text-red-600';
      case 'percentage':
        return value >= 80 ? 'text-green-600' : value >= 60 ? 'text-yellow-600' : 'text-red-600';
      case 'time':
        return value <= 2 ? 'text-green-600' : value <= 4 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (value: number, type: 'rating' | 'percentage' | 'time') => {
    switch (type) {
      case 'rating':
        return value >= 8 ? 'Excellent' : value >= 6 ? 'Good' : 'Needs Attention';
      case 'percentage':
        return value >= 80 ? 'Great' : value >= 60 ? 'Acceptable' : 'Concerning';
      case 'time':
        return value <= 2 ? 'Fast' : value <= 4 ? 'Acceptable' : 'Slow';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Beta Performance Monitoring</h2>
        <div className="flex gap-4">
          <Select value={betaGroup} onValueChange={onBetaGroupChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              <SelectItem value="alpha">Alpha</SelectItem>
              <SelectItem value="beta">Beta</SelectItem>
              <SelectItem value="gamma">Gamma</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={onTimeRangeChange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Testers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.aggregated.activeTesters}</div>
            <p className="text-xs text-muted-foreground">
              of {metrics.aggregated.totalTesters} total testers
            </p>
            <div className="mt-2">
              <Progress 
                value={(metrics.aggregated.activeTesters / metrics.aggregated.totalTesters) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Satisfaction</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(avgMetrics.satisfaction, 'rating')}`}>
              {avgMetrics.satisfaction.toFixed(1)}/10
            </div>
            <Badge variant="outline" className="mt-2">
              {getStatusBadge(avgMetrics.satisfaction, 'rating')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Task Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(avgMetrics.completionRate, 'percentage')}`}>
              {avgMetrics.completionRate.toFixed(0)}%
            </div>
            <Badge variant="outline" className="mt-2">
              {getStatusBadge(avgMetrics.completionRate, 'percentage')}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Load Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getStatusColor(avgMetrics.loadTime, 'time')}`}>
              {avgMetrics.loadTime.toFixed(1)}s
            </div>
            <Badge variant="outline" className="mt-2">
              {getStatusBadge(avgMetrics.loadTime, 'time')}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="testers">Individual Testers</TabsTrigger>
          <TabsTrigger value="features">Feature Adoption</TabsTrigger>
          <TabsTrigger value="issues">Issues & Feedback</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Engagement Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User activity and retention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Retention Rate (7 days)</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold">{metrics.aggregated.retentionRate}%</span>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <Progress value={metrics.aggregated.retentionRate} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Sessions per Tester</span>
                    <span className="font-bold">
                      {(filteredTesters.reduce((acc, t) => acc + t.sessionsCount, 0) / filteredTesters.length).toFixed(1)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Time per Session</span>
                    <span className="font-bold">
                      {(filteredTesters.reduce((acc, t) => acc + t.totalTimeSpent, 0) / filteredTesters.reduce((acc, t) => acc + t.sessionsCount, 0)).toFixed(0)} min
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Technical Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Technical Performance</CardTitle>
                <CardDescription>System reliability and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Bluetooth Success Rate</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${getStatusColor(avgMetrics.bluetoothSuccess, 'percentage')}`}>
                        {avgMetrics.bluetoothSuccess.toFixed(0)}%
                      </span>
                      {avgMetrics.bluetoothSuccess >= 80 ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      }
                    </div>
                  </div>
                  <Progress value={avgMetrics.bluetoothSuccess} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Critical Issues</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-red-600">{metrics.aggregated.criticalIssues}</span>
                      {metrics.aggregated.criticalIssues === 0 ? 
                        <CheckCircle className="h-4 w-4 text-green-600" /> :
                        <XCircle className="h-4 w-4 text-red-600" />
                      }
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg Error Rate</span>
                    <span className="font-bold">
                      {(filteredTesters.reduce((acc, t) => acc + t.errorEncounters, 0) / filteredTesters.length).toFixed(1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Onboarding Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Progress</CardTitle>
              <CardDescription>Completion rates for key onboarding milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { key: 'onboardingCompleted', label: 'Setup Complete' },
                  { key: 'tutorialCompleted', label: 'Tutorial Done' },
                  { key: 'firstJobCreated', label: 'First Job' },
                  { key: 'firstSafetyCheck', label: 'Safety Check' },
                  { key: 'photoUploadUsed', label: 'Photo Upload' }
                ].map(({ key, label }) => {
                  const completed = filteredTesters.filter(t => t[key as keyof BetaTesterMetrics] as boolean).length;
                  const percentage = (completed / filteredTesters.length) * 100;
                  
                  return (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold mb-1">{completed}</div>
                      <div className="text-sm text-gray-600 mb-2">{label}</div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}%</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Individual Tester Performance</CardTitle>
              <CardDescription>Detailed metrics for each beta tester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredTesters.map((tester) => (
                  <React.Fragment key={tester.testerId}>
                    <div 
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedTester(selectedTester === tester.testerId ? null : tester.testerId)}
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{tester.companyName}</div>
                          <div className="text-sm text-gray-600">
                            {tester.sessionsCount} sessions • {tester.totalTimeSpent} min total
                          </div>
                        </div>
                        <Badge variant="outline">{tester.betaGroup.toUpperCase()}</Badge>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={`font-bold ${getStatusColor(tester.averageRating, 'rating')}`}>
                            {tester.averageRating}/10
                          </div>
                          <div className="text-sm text-gray-600">satisfaction</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${getStatusColor(tester.taskCompletionRate, 'percentage')}`}>
                            {tester.taskCompletionRate}%
                          </div>
                          <div className="text-sm text-gray-600">completion</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`font-bold ${getStatusColor(tester.averageLoadTime, 'time')}`}>
                            {tester.averageLoadTime.toFixed(1)}s
                          </div>
                          <div className="text-sm text-gray-600">load time</div>
                        </div>
                      </div>
                    </div>
                    
                    {selectedTester === tester.testerId && (
                      <div className="ml-4 p-4 bg-gray-50 rounded-lg">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Feedback</div>
                            <div>{tester.feedbackSubmissions} submissions</div>
                            <div>{tester.bugReports} bug reports</div>
                            <div>{tester.featureRequests} feature requests</div>
                          </div>
                          <div>
                            <div className="font-medium">Performance</div>
                            <div>{tester.averageTaskTime} min avg task</div>
                            <div>{tester.errorEncounters} errors</div>
                            <div>{tester.crashCount} crashes</div>
                          </div>
                          <div>
                            <div className="font-medium">Bluetooth</div>
                            <div>{tester.bluetoothSuccessRate}% success rate</div>
                          </div>
                          <div>
                            <div className="font-medium">Last Active</div>
                            <div>{tester.lastActiveDate.toLocaleDateString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption Rates</CardTitle>
              <CardDescription>How many testers are using each feature</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(metrics.aggregated.featureAdoption)
                  .sort(([,a], [,b]) => b - a)
                  .map(([feature, count]) => {
                    const percentage = (count / filteredTesters.length) * 100;
                    return (
                      <div key={feature} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{feature}</span>
                        <div className="flex items-center gap-4 w-48">
                          <Progress value={percentage} className="flex-1 h-2" />
                          <span className="text-sm w-16 text-right">
                            {count}/{filteredTesters.length} ({percentage.toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Summary</CardTitle>
                <CardDescription>Overview of reported issues and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Bug Reports</span>
                    <Badge variant="destructive">
                      {filteredTesters.reduce((acc, t) => acc + t.bugReports, 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Feature Requests</span>
                    <Badge variant="secondary">
                      {filteredTesters.reduce((acc, t) => acc + t.featureRequests, 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Support Tickets</span>
                    <Badge variant="outline">
                      {filteredTesters.reduce((acc, t) => acc + t.supportTickets, 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Critical Issues</span>
                    <Badge variant="destructive">
                      {metrics.aggregated.criticalIssues}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Priority</CardTitle>
                <CardDescription>Issues categorized by urgency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span>Critical (blocking)</span>
                    </div>
                    <span className="font-bold">
                      {filteredTesters.filter(t => t.crashCount > 1).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      <span>High (urgent)</span>
                    </div>
                    <span className="font-bold">
                      {filteredTesters.filter(t => t.averageRating < 5).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span>Medium</span>
                    </div>
                    <span className="font-bold">
                      {filteredTesters.filter(t => t.errorEncounters > 5).length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span>Low</span>
                    </div>
                    <span className="font-bold">
                      {filteredTesters.reduce((acc, t) => acc + t.featureRequests, 0)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}