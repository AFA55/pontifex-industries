'use client';

import React from 'react';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { 
  Play as PlayIcon, 
  Pause as PauseIcon, 
  Square as StopIcon, 
  BarChart3 as BarChart3Icon, 
  TrendingUp as TrendingUpIcon, 
  TrendingDown as TrendingDownIcon,
  Plus as PlusIcon,
  Edit as EditIcon,
  Trash as TrashIcon,
  Users as UsersIcon,
  Target as TargetIcon
} from 'lucide-react';
import { 
  ABTest, 
  ABVariant, 
  ABTestResults, 
  abTestingService,
  createOnboardingTest,
  createSafetyComplianceTest
} from '@/lib/ab-testing';
import { useToast } from '@/hooks/use-toast';

interface ABTestingManagerProps {
  onTestCreate?: (test: ABTest) => void;
  onTestUpdate?: (test: ABTest) => void;
  onTestDelete?: (testId: string) => void;
}

export default function ABTestingManager({
  onTestCreate,
  onTestUpdate,
  onTestDelete
}: ABTestingManagerProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [tests, setTests] = useState<ABTest[]>([]);
  const [selectedTest, setSelectedTest] = useState<ABTest | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [testResults, setTestResults] = useState<Map<string, ABTestResults>>(new Map());

  const { toast } = useToast();

  useEffect(() => {
    // Load initial test data (in real app, this would fetch from API)
    loadTestData();
  }, []);

  const loadTestData = () => {
    // Mock data for demonstration
    const mockTests: ABTest[] = [
      {
        id: 'test_onboarding_001',
        name: 'Onboarding Flow Optimization',
        description: 'Testing simplified vs. standard onboarding for new contractors',
        status: 'active',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        trafficAllocation: 50,
        variants: [
          {
            id: 'control',
            name: 'Standard Onboarding',
            description: 'Current 6-step onboarding process',
            trafficSplit: 50,
            isControl: true,
            config: { onboarding: { steps: 6, skipEnabled: false } }
          },
          {
            id: 'simplified',
            name: 'Simplified Onboarding',
            description: 'Streamlined 3-step process',
            trafficSplit: 50,
            isControl: false,
            config: { onboarding: { steps: 3, skipEnabled: true } }
          }
        ],
        targetAudience: {
          betaGroups: ['beta', 'gamma'],
          companyTypes: ['micro', 'small']
        },
        primaryMetric: 'task_completion',
        secondaryMetrics: ['satisfaction', 'engagement'],
        minimumSampleSize: 30
      },
      {
        id: 'test_safety_002',
        name: 'Safety Compliance UI',
        description: 'Testing different safety compliance workflows',
        status: 'draft',
        startDate: new Date(),
        trafficAllocation: 75,
        variants: [
          {
            id: 'control',
            name: 'Current Safety Flow',
            description: 'Standard form-based approach',
            trafficSplit: 40,
            isControl: true,
            config: { safety: { layout: 'form' } }
          },
          {
            id: 'wizard',
            name: 'Guided Wizard',
            description: 'Step-by-step wizard',
            trafficSplit: 30,
            isControl: false,
            config: { safety: { layout: 'wizard' } }
          },
          {
            id: 'smart',
            name: 'Smart Assistant',
            description: 'AI-powered recommendations',
            trafficSplit: 30,
            isControl: false,
            config: { safety: { layout: 'smart' } }
          }
        ],
        targetAudience: {
          betaGroups: ['alpha', 'beta'],
          companyTypes: ['medium', 'large'],
          workTypes: ['core_drill', 'wall_saw']
        },
        primaryMetric: 'task_completion',
        secondaryMetrics: ['satisfaction', 'error_rate'],
        minimumSampleSize: 50
      }
    ];

    setTests(mockTests);

    // Generate mock results for active tests
    const results = new Map<string, ABTestResults>();
    mockTests.filter(test => test.status === 'active').forEach(test => {
      const result = abTestingService.analyzeTest(test.id);
      if (result) {
        results.set(test.id, result);
      }
    });
    setTestResults(results);
  };

  const handleCreateTest = (templateType?: 'onboarding' | 'safety') => {
    let testTemplate;
    
    if (templateType === 'onboarding') {
      testTemplate = createOnboardingTest();
    } else if (templateType === 'safety') {
      testTemplate = createSafetyComplianceTest();
    } else {
      testTemplate = {
        name: 'New A/B Test',
        description: 'Test description',
        status: 'draft' as const,
        startDate: new Date(),
        trafficAllocation: 50,
        variants: [
          {
            id: 'control',
            name: 'Control',
            description: 'Current implementation',
            trafficSplit: 50,
            isControl: true,
            config: {}
          },
          {
            id: 'variant_a',
            name: 'Variant A',
            description: 'New implementation',
            trafficSplit: 50,
            isControl: false,
            config: {}
          }
        ],
        targetAudience: {
          betaGroups: ['beta'] as ('alpha' | 'beta' | 'gamma')[],
          companyTypes: ['small', 'medium'] as ('micro' | 'small' | 'medium' | 'large')[]
        },
        primaryMetric: 'task_completion' as const,
        secondaryMetrics: ['satisfaction'],
        minimumSampleSize: 30
      };
    }

    const newTest = abTestingService.createTest(testTemplate);
    setTests(prev => [...prev, newTest]);
    setSelectedTest(newTest);
    setIsCreating(true);
    
    if (onTestCreate) {
      onTestCreate(newTest);
    }

    toast({
      title: "Test Created",
      description: `New A/B test "${newTest.name}" has been created.`
    });
  };

  const handleStartTest = (testId: string) => {
    if (abTestingService.startTest(testId)) {
      setTests(prev => 
        prev.map(test => 
          test.id === testId 
            ? { ...test, status: 'active' as const, startDate: new Date() }
            : test
        )
      );

      toast({
        title: "Test Started",
        description: "A/B test is now active and collecting data."
      });
    }
  };

  const handleStopTest = (testId: string) => {
    setTests(prev => 
      prev.map(test => 
        test.id === testId 
          ? { ...test, status: 'completed' as const, endDate: new Date() }
          : test
      )
    );

    const result = abTestingService.analyzeTest(testId);
    if (result) {
      setTestResults(prev => new Map(prev.set(testId, result)));
    }

    toast({
      title: "Test Completed",
      description: "A/B test has been stopped and results are available."
    });
  };

  const handleDeleteTest = (testId: string) => {
    setTests(prev => prev.filter(test => test.id !== testId));
    setTestResults(prev => {
      const newResults = new Map(prev);
      newResults.delete(testId);
      return newResults;
    });

    if (selectedTest?.id === testId) {
      setSelectedTest(null);
    }

    if (onTestDelete) {
      onTestDelete(testId);
    }

    toast({
      title: "Test Deleted",
      description: "A/B test has been permanently deleted."
    });
  };

  const getStatusBadge = (status: ABTest['status']) => {
    const variants = {
      draft: { color: 'secondary', label: 'Draft' },
      active: { color: 'default', label: 'Active' },
      paused: { color: 'outline', label: 'Paused' },
      completed: { color: 'secondary', label: 'Completed' }
    };

    const variant = variants[status];
    return <Badge variant={variant.color as any}>{variant.label}</Badge>;
  };

  const calculateTestProgress = (test: ABTest): number => {
    if (test.status === 'completed') return 100;
    if (test.status === 'draft') return 0;
    
    const daysSinceStart = (Date.now() - test.startDate.getTime()) / (1000 * 60 * 60 * 24);
    const estimatedDuration = 14; // Assume 14-day test duration
    return Math.min(100, (daysSinceStart / estimatedDuration) * 100);
  };

  const renderTestOverview = () => (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <BarChart3Icon className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tests</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'active').length}</p>
              </div>
              <PlayIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{tests.filter(t => t.status === 'completed').length}</p>
              </div>
              <StopIcon className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Win Rate</p>
                <p className="text-2xl font-bold">67%</p>
              </div>
              <TrendingUpIcon className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test List */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>All A/B Tests</CardTitle>
            <div className="flex gap-2">
              <Button
                
                variant="outline"
                onClick={() => handleCreateTest('onboarding')}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Onboarding Test
              </Button>
              <Button
                
                variant="outline"
                onClick={() => handleCreateTest('safety')}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Safety Test
              </Button>
              <Button
                
                onClick={() => handleCreateTest()}
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Custom Test
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedTest(test)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium">{test.name}</h3>
                    {getStatusBadge(test.status)}
                    <Badge variant="outline">
                      {test.targetAudience.betaGroups.join(', ').toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{test.description}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span>{test.variants.length} variants</span>
                    <span>{test.trafficAllocation}% traffic</span>
                    <span>Primary: {test.primaryMetric}</span>
                  </div>
                  {test.status === 'active' && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{calculateTestProgress(test).toFixed(0)}%</span>
                      </div>
                      <Progress value={calculateTestProgress(test)} className="h-1" />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {test.status === 'draft' && (
                    <Button
                      
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartTest(test.id);
                      }}
                    >
                      <PlayIcon className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {test.status === 'active' && (
                    <Button
                      
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStopTest(test.id);
                      }}
                    >
                      <StopIcon className="h-4 w-4" />
                    </Button>
                  )}

                  <Button
                    
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedTest(test);
                      setIsCreating(true);
                    }}
                  >
                    <EditIcon className="h-4 w-4" />
                  </Button>

                  <Button
                    
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTest(test.id);
                    }}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTestResults = () => {
    const activeResults = Array.from(testResults.entries())
      .map(([testId, result]) => ({ testId, result }));

    return (
      <div className="space-y-6">
        {activeResults.map(({ testId, result }) => {
          const test = tests.find(t => t.id === testId);
          if (!test) return null;

          return (
            <Card key={testId}>
              <CardHeader>
                <CardTitle>{test.name} - Results</CardTitle>
                <CardDescription>
                  {result.totalParticipants} participants • 
                  {result.confidence.toFixed(0)}% confidence
                  {result.winner && ` • Winner: ${test.variants.find(v => v.id === result.winner)?.name}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Variant Comparison */}
                  <div className="grid gap-4">
                    {result.variantResults.map((variantResult) => {
                      const variant = test.variants.find(v => v.id === variantResult.variantId);
                      if (!variant) return null;

                      const isWinner = result.winner === variant.id;
                      
                      return (
                        <div
                          key={variant.id}
                          className={`p-4 border rounded-lg ${isWinner ? 'border-green-500 bg-green-50' : ''}`}
                        >
                          <div className="flex justify-between items-center mb-3">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{variant.name}</h4>
                              {variant.isControl && <Badge variant="outline">Control</Badge>}
                              {isWinner && <Badge variant="default">Winner</Badge>}
                            </div>
                            <div className="text-sm text-gray-600">
                              {variantResult.participants} participants
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-gray-600">Primary Metric</div>
                              <div className="font-bold">{variantResult.primaryMetricValue.toFixed(2)}</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Conversion Rate</div>
                              <div className="font-bold">{variantResult.conversionRate.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Task Completion</div>
                              <div className="font-bold">{variantResult.taskCompletionRate.toFixed(1)}%</div>
                            </div>
                            <div>
                              <div className="text-gray-600">Satisfaction</div>
                              <div className="font-bold">{variantResult.satisfactionScore.toFixed(1)}/10</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Insights and Recommendations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Insights</h4>
                      <ul className="space-y-1 text-sm">
                        {result.insights.map((insight, index) => (
                          <li key={index} className="text-gray-600">• {insight}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Recommendations</h4>
                      <ul className="space-y-1 text-sm">
                        {result.recommendations.map((recommendation, index) => (
                          <li key={index} className="text-gray-600">• {recommendation}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {activeResults.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <BarChart3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Results Available</h3>
              <p className="text-gray-600">Start some A/B tests to see results here.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">A/B Testing Manager</h2>
        <Badge variant="outline">{tests.length} tests configured</Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderTestOverview()}
        </TabsContent>

        <TabsContent value="results">
          {renderTestResults()}
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Test Analytics</CardTitle>
              <CardDescription>Performance metrics and trends across all tests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3Icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Advanced analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Test Detail/Edit Modal would go here */}
      {selectedTest && isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-4">
              {selectedTest.status === 'draft' ? 'Edit Test' : 'Test Details'}
            </h3>
            <div className="space-y-4">
              <div>
                <Label>Test Name</Label>
                <Input value={selectedTest.name} readOnly />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={selectedTest.description} readOnly />
              </div>
              <div>
                <Label>Status</Label>
                <div className="mt-1">
                  {getStatusBadge(selectedTest.status)}
                </div>
              </div>
              <div>
                <Label>Variants</Label>
                <div className="space-y-2 mt-1">
                  {selectedTest.variants.map((variant, index) => (
                    <div key={variant.id} className="flex justify-between items-center p-2 border rounded">
                      <span>{variant.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{variant.trafficSplit}%</span>
                        {variant.isControl && <Badge variant="outline">Control</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Close
              </Button>
              {selectedTest.status === 'draft' && (
                <Button onClick={() => handleStartTest(selectedTest.id)}>
                  Start Test
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
