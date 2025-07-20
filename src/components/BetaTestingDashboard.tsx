'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Activity, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3,
  Settings,
  Download,
  RefreshCw,
  Calendar,
  Target,
  Zap
} from 'lucide-react';

// Import our beta testing components
import BetaOnboarding from './BetaOnboarding';
import BetaFeedbackSystem from './BetaFeedbackSystem';
import BetaPerformanceMonitoring from './BetaPerformanceMonitoring';
import ABTestingManager from './ABTestingManager';
import BetaTesterManager from './BetaTesterManager';
import { metricsService } from '@/lib/metrics-collection';

interface BetaTestingDashboardProps {
  userRole: 'admin' | 'contractor' | 'tester';
  userId: string;
  userContext?: {
    betaGroup: 'alpha' | 'beta' | 'gamma';
    companySize: 'micro' | 'small' | 'medium' | 'large';
    companyName: string;
    signupDate: Date;
  };
}

interface DashboardMetrics {
  totalTesters: number;
  activeTesters: number;
  completedOnboarding: number;
  avgSatisfactionScore: number;
  totalFeedback: number;
  criticalIssues: number;
  activeABTests: number;
  featureAdoptionRate: number;
  retentionRate: number;
  lastUpdated: Date;
}

export default function BetaTestingDashboard({
  userRole,
  userId,
  userContext
}: BetaTestingDashboardProps) {
  const [activeTab, setActiveTab] = useState(userRole === 'admin' ? 'overview' : 'testing');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalTesters: 15,
    activeTesters: 12,
    completedOnboarding: 13,
    avgSatisfactionScore: 7.8,
    totalFeedback: 47,
    criticalIssues: 2,
    activeABTests: 3,
    featureAdoptionRate: 73,
    retentionRate: 82,
    lastUpdated: new Date()
  });

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Initialize metrics collection if user context is available
    if (userContext) {
      metricsService.initialize(userId, {
        betaGroup: userContext.betaGroup,
        companySize: userContext.companySize,
        signupDate: userContext.signupDate
      });
    }

    // Load dashboard data
    loadDashboardData();
  }, [userId, userContext, timeRange]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from API
      // For now, we'll use mock data with some realistic variations
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

      const mockMetrics: DashboardMetrics = {
        totalTesters: 15 + Math.floor(Math.random() * 5),
        activeTesters: 12 + Math.floor(Math.random() * 3),
        completedOnboarding: 13 + Math.floor(Math.random() * 2),
        avgSatisfactionScore: 7.8 + (Math.random() - 0.5) * 0.4,
        totalFeedback: 47 + Math.floor(Math.random() * 10),
        criticalIssues: Math.floor(Math.random() * 4),
        activeABTests: 3,
        featureAdoptionRate: 73 + Math.floor(Math.random() * 15),
        retentionRate: 82 + Math.floor(Math.random() * 10),
        lastUpdated: new Date()
      };

      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed:', data);
    setShowOnboarding(false);
    
    // Track onboarding completion
    metricsService.trackBusiness({
      event: 'feature_adopted',
      featureName: 'onboarding',
      success: true,
      timeToComplete: Date.now() - data.startTime
    });

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      completedOnboarding: prev.completedOnboarding + 1
    }));
  };

  const handleFeedbackSubmit = (feedback: any) => {
    console.log('Feedback submitted:', feedback);
    setShowFeedback(false);
    
    // Track feedback submission
    metricsService.trackBusiness({
      event: 'feature_adopted',
      featureName: 'feedback',
      success: true
    });

    metricsService.trackSatisfaction(
      feedback.overallRating,
      feedback.featureUsed,
      feedback.description
    );

    // Update metrics
    setMetrics(prev => ({
      ...prev,
      totalFeedback: prev.totalFeedback + 1,
      avgSatisfactionScore: (prev.avgSatisfactionScore * prev.totalFeedback + feedback.overallRating) / (prev.totalFeedback + 1)
    }));
  };

  const getStatusBadge = (value: number, type: 'count' | 'percentage' | 'rating') => {
    let color = 'secondary';
    let status = 'Normal';

    switch (type) {
      case 'count':
        if (value === 0) {
          color = 'default';
          status = 'Good';
        } else if (value > 3) {
          color = 'destructive';
          status = 'High';
        } else {
          color = 'outline';
          status = 'Some';
        }
        break;
      case 'percentage':
        if (value >= 80) {
          color = 'default';
          status = 'Excellent';
        } else if (value >= 60) {
          color = 'secondary';
          status = 'Good';
        } else {
          color = 'destructive';
          status = 'Needs Work';
        }
        break;
      case 'rating':
        if (value >= 8) {
          color = 'default';
          status = 'Excellent';
        } else if (value >= 6) {
          color = 'secondary';
          status = 'Good';
        } else {
          color = 'destructive';
          status = 'Poor';
        }
        break;
    }

    return <Badge variant={color as any}>{status}</Badge>;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Testers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalTesters}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.activeTesters} active this {timeRange}
            </p>
            <div className="mt-2">
              <Progress 
                value={(metrics.activeTesters / metrics.totalTesters) * 100} 
                className="h-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.avgSatisfactionScore.toFixed(1)}/10</div>
            <div className="mt-2">
              {getStatusBadge(metrics.avgSatisfactionScore, 'rating')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feature Adoption</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.featureAdoptionRate}%</div>
            <div className="mt-2">
              {getStatusBadge(metrics.featureAdoptionRate, 'percentage')}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.criticalIssues}</div>
            <div className="mt-2">
              {getStatusBadge(metrics.criticalIssues, 'count')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for beta testing management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setShowOnboarding(true)}
            >
              <Users className="h-6 w-6" />
              <span>New Tester Setup</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setShowFeedback(true)}
            >
              <BarChart3 className="h-6 w-6" />
              <span>Collect Feedback</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={() => setActiveTab('ab-testing')}
            >
              <Zap className="h-6 w-6" />
              <span>Start A/B Test</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-auto p-4 flex flex-col items-center gap-2"
              onClick={loadDashboardData}
              disabled={isLoading}
            >
              {isLoading ? (
                <RefreshCw className="h-6 w-6 animate-spin" />
              ) : (
                <Download className="h-6 w-6" />
              )}
              <span>Generate Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest events from your beta testing program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New tester completed onboarding</p>
                <p className="text-xs text-gray-600">Precision Concrete Cutting • 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">A/B test "Safety Flow" reached significance</p>
                <p className="text-xs text-gray-600">95% confidence, Variant B winning • 4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">High-priority feedback received</p>
                <p className="text-xs text-gray-600">Metro Diamond Drilling • Safety compliance issue • 6 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Weekly metrics report generated</p>
                <p className="text-xs text-gray-600">73% feature adoption, 8.2/10 satisfaction • 1 day ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderContractorView = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome to Beta Testing</CardTitle>
          <CardDescription>
            Thank you for participating in the Pontifex Industries beta testing program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium">Beta Group</p>
                <p className="text-sm text-gray-600">{userContext?.betaGroup.toUpperCase()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-blue-500" />
              <div>
                <p className="font-medium">Company Size</p>
                <p className="text-sm text-gray-600 capitalize">{userContext?.companySize}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-purple-500" />
              <div>
                <p className="font-medium">Started</p>
                <p className="text-sm text-gray-600">
                  {userContext?.signupDate.toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex gap-4">
              <Button onClick={() => setShowFeedback(true)}>
                Share Feedback
              </Button>
              <Button variant="outline" onClick={() => setActiveTab('resources')}>
                View Resources
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Your Testing Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Features Explored</span>
              <span className="font-bold">7/12</span>
            </div>
            <Progress value={58} className="h-2" />
            
            <div className="flex justify-between items-center">
              <span>Feedback Provided</span>
              <span className="font-bold">3 submissions</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span>Test Duration</span>
              <span className="font-bold">14 days</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">
            {userRole === 'admin' ? 'Beta Testing Dashboard' : 'Beta Testing Program'}
          </h1>
          <p className="text-gray-600">
            {userRole === 'admin' 
              ? 'Manage and monitor your beta testing program' 
              : `Welcome ${userContext?.companyName || 'Beta Tester'}`
            }
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={(value: any) => setTimeRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" size="sm" onClick={loadDashboardData} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {userRole === 'admin' ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="testers">Testers</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            {renderOverview()}
          </TabsContent>

          <TabsContent value="testers">
            <BetaTesterManager />
          </TabsContent>

          <TabsContent value="performance">
            <BetaPerformanceMonitoring 
              timeRange={timeRange}
              onTimeRangeChange={setTimeRange}
              onBetaGroupChange={() => {}}
            />
          </TabsContent>

          <TabsContent value="ab-testing">
            <ABTestingManager />
          </TabsContent>

          <TabsContent value="feedback">
            <Card>
              <CardHeader>
                <CardTitle>Feedback Management</CardTitle>
                <CardDescription>Review and analyze feedback from beta testers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Feedback management interface coming soon</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="testing">Testing</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="testing">
            {renderContractorView()}
          </TabsContent>

          <TabsContent value="feedback">
            <BetaFeedbackSystem
              userId={userId}
              betaGroup={userContext?.betaGroup || 'beta'}
              onSubmit={handleFeedbackSubmit}
            />
          </TabsContent>

          <TabsContent value="resources">
            <Card>
              <CardHeader>
                <CardTitle>Beta Testing Resources</CardTitle>
                <CardDescription>Guides and documentation for beta testers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Getting Started Guide</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Complete walkthrough of all platform features and testing procedures
                    </p>
                    <Button size="sm" variant="outline">View Guide</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Feature Documentation</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Detailed documentation for each concrete cutting feature
                    </p>
                    <Button size="sm" variant="outline">Browse Docs</Button>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <h3 className="font-medium mb-2">Support & FAQ</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      Common questions and troubleshooting information
                    </p>
                    <Button size="sm" variant="outline">Get Help</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Modals */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <BetaOnboarding
            onComplete={handleOnboardingComplete}
            onSkip={() => setShowOnboarding(false)}
          />
        </div>
      )}

      {showFeedback && userContext && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <BetaFeedbackSystem
            userId={userId}
            betaGroup={userContext.betaGroup}
            onSubmit={handleFeedbackSubmit}
            onClose={() => setShowFeedback(false)}
          />
        </div>
      )}

      {/* Status Bar */}
      <div className="text-xs text-gray-500 text-center py-2 border-t">
        Last updated: {metrics.lastUpdated.toLocaleString()} • 
        Beta Testing Dashboard v1.0 • 
        {userRole === 'admin' ? `${metrics.totalTesters} testers` : `${userContext?.betaGroup.toUpperCase()} group`}
      </div>
    </div>
  );
}