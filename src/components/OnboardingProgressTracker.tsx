'use client';

import React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Users,
  AlertTriangle,
  Calendar,
  Award,
  BookOpen,
  Database,
  Settings,
  Shield,
  Smartphone,
  BarChart3,
  Download,
  Eye,
  RefreshCw,
  ArrowRight,
  Star,
  MessageSquare,
  HelpCircle,
  Zap,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Activity,
  Play
} from 'lucide-react';
import { 
  OnboardingSession,
  OnboardingStep,
  OnboardingMetrics,
  StepMetrics,
  OnboardingEvent,
  OnboardingEventType
} from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';

interface OnboardingProgressTrackerProps {
  session: OnboardingSession;
  onSessionUpdate: (session: OnboardingSession) => void;
  adminView?: boolean;
}

interface CompletionCriteria {
  step: OnboardingStep;
  requirements: CompletionRequirement[];
  verificationMethod: 'automatic' | 'manual' | 'mixed';
  estimatedTime: number; // minutes
}

interface CompletionRequirement {
  id: string;
  type: 'task_completion' | 'data_validation' | 'user_confirmation' | 'system_check' | 'training_completion';
  description: string;
  required: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  verificationData?: any;
  completedAt?: Date;
  verifiedBy?: string;
}

interface StepVerification {
  step: OnboardingStep;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationMethod: string;
  notes?: string;
  issues?: VerificationIssue[];
}

interface VerificationIssue {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  resolution?: string;
  status: 'open' | 'resolved' | 'deferred';
}

const COMPLETION_CRITERIA: CompletionCriteria[] = [
  {
    step: 'welcome',
    requirements: [
      {
        id: 'welcome_viewed',
        type: 'user_confirmation',
        description: 'User has viewed welcome content',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'automatic',
    estimatedTime: 5
  },
  {
    step: 'company_profile',
    requirements: [
      {
        id: 'company_info_complete',
        type: 'data_validation',
        description: 'All required company information provided',
        required: true,
        status: 'pending'
      },
      {
        id: 'services_selected',
        type: 'data_validation',
        description: 'At least one concrete cutting service selected',
        required: true,
        status: 'pending'
      },
      {
        id: 'contact_info_complete',
        type: 'data_validation',
        description: 'Primary contact information complete and valid',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'automatic',
    estimatedTime: 15
  },
  {
    step: 'dsm_assessment',
    requirements: [
      {
        id: 'dsm_data_uploaded',
        type: 'task_completion',
        description: 'DSM export file uploaded successfully',
        required: true,
        status: 'pending'
      },
      {
        id: 'data_assessment_complete',
        type: 'system_check',
        description: 'Automated data assessment completed',
        required: true,
        status: 'pending'
      },
      {
        id: 'migration_plan_approved',
        type: 'user_confirmation',
        description: 'User has reviewed and approved migration plan',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'mixed',
    estimatedTime: 20
  },
  {
    step: 'data_migration',
    requirements: [
      {
        id: 'migration_completed',
        type: 'system_check',
        description: 'Data migration process completed successfully',
        required: true,
        status: 'pending'
      },
      {
        id: 'data_validation_passed',
        type: 'system_check',
        description: 'Migrated data validation passed all checks',
        required: true,
        status: 'pending'
      },
      {
        id: 'user_data_review',
        type: 'user_confirmation',
        description: 'User has reviewed migrated data for accuracy',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'mixed',
    estimatedTime: 60
  },
  {
    step: 'system_setup',
    requirements: [
      {
        id: 'user_accounts_created',
        type: 'system_check',
        description: 'All user accounts created and configured',
        required: true,
        status: 'pending'
      },
      {
        id: 'permissions_configured',
        type: 'system_check',
        description: 'User permissions and roles properly configured',
        required: true,
        status: 'pending'
      },
      {
        id: 'workflows_setup',
        type: 'task_completion',
        description: 'Basic workflows configured for concrete cutting operations',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'automatic',
    estimatedTime: 30
  },
  {
    step: 'team_setup',
    requirements: [
      {
        id: 'team_members_added',
        type: 'data_validation',
        description: 'Team members added with appropriate roles',
        required: true,
        status: 'pending'
      },
      {
        id: 'notification_preferences',
        type: 'task_completion',
        description: 'Team notification preferences configured',
        required: false,
        status: 'pending'
      }
    ],
    verificationMethod: 'automatic',
    estimatedTime: 20
  },
  {
    step: 'training_modules',
    requirements: [
      {
        id: 'essential_training_complete',
        type: 'training_completion',
        description: 'All essential training modules completed',
        required: true,
        status: 'pending'
      },
      {
        id: 'assessments_passed',
        type: 'training_completion',
        description: 'All required assessments passed with minimum scores',
        required: true,
        status: 'pending'
      },
      {
        id: 'safety_certification',
        type: 'training_completion',
        description: 'Safety compliance certification earned',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'automatic',
    estimatedTime: 120
  },
  {
    step: 'equipment_configuration',
    requirements: [
      {
        id: 'equipment_registered',
        type: 'data_validation',
        description: 'All equipment registered in asset management system',
        required: true,
        status: 'pending'
      },
      {
        id: 'beacons_configured',
        type: 'system_check',
        description: 'Bluetooth beacons configured for asset tracking',
        required: false,
        status: 'pending'
      },
      {
        id: 'maintenance_schedules',
        type: 'task_completion',
        description: 'Maintenance schedules set up for all equipment',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'mixed',
    estimatedTime: 45
  },
  {
    step: 'safety_setup',
    requirements: [
      {
        id: 'safety_framework_configured',
        type: 'system_check',
        description: 'Safety compliance framework fully configured',
        required: true,
        status: 'pending'
      },
      {
        id: 'silica_monitoring_setup',
        type: 'system_check',
        description: 'Silica monitoring system configured and tested',
        required: true,
        status: 'pending'
      },
      {
        id: 'incident_reporting_tested',
        type: 'task_completion',
        description: 'Incident reporting workflow tested and verified',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'mixed',
    estimatedTime: 30
  },
  {
    step: 'workflow_customization',
    requirements: [
      {
        id: 'work_types_configured',
        type: 'data_validation',
        description: 'Concrete cutting work types properly configured',
        required: true,
        status: 'pending'
      },
      {
        id: 'approval_workflows',
        type: 'task_completion',
        description: 'Job approval workflows configured and tested',
        required: true,
        status: 'pending'
      },
      {
        id: 'automation_rules',
        type: 'task_completion',
        description: 'Basic automation rules configured',
        required: false,
        status: 'pending'
      }
    ],
    verificationMethod: 'mixed',
    estimatedTime: 45
  },
  {
    step: 'integration_setup',
    requirements: [
      {
        id: 'accounting_integration',
        type: 'system_check',
        description: 'Accounting software integration configured',
        required: false,
        status: 'pending'
      },
      {
        id: 'api_connections_tested',
        type: 'system_check',
        description: 'All API connections tested and verified',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'automatic',
    estimatedTime: 30
  },
  {
    step: 'go_live_checklist',
    requirements: [
      {
        id: 'system_performance_verified',
        type: 'system_check',
        description: 'System performance meets requirements',
        required: true,
        status: 'pending'
      },
      {
        id: 'user_acceptance_signed',
        type: 'user_confirmation',
        description: 'User acceptance testing completed and signed off',
        required: true,
        status: 'pending'
      },
      {
        id: 'support_contact_verified',
        type: 'task_completion',
        description: 'Support contact information verified',
        required: true,
        status: 'pending'
      },
      {
        id: 'backup_procedures_tested',
        type: 'system_check',
        description: 'Backup and recovery procedures tested',
        required: true,
        status: 'pending'
      }
    ],
    verificationMethod: 'mixed',
    estimatedTime: 15
  },
  {
    step: 'completion',
    requirements: [
      {
        id: 'all_steps_verified',
        type: 'system_check',
        description: 'All previous steps verified and completed',
        required: true,
        status: 'pending'
      },
      {
        id: 'feedback_submitted',
        type: 'user_confirmation',
        description: 'Onboarding feedback submitted',
        required: false,
        status: 'pending'
      }
    ],
    verificationMethod: 'automatic',
    estimatedTime: 5
  }
];

export default function OnboardingProgressTracker({
  session,
  onSessionUpdate,
  adminView = false
}: OnboardingProgressTrackerProps) {
  const [verificationStatus, setVerificationStatus] = useState<{ [key: string]: StepVerification }>({});
  const [completionRequirements, setCompletionRequirements] = useState<{ [key: string]: CompletionRequirement[] }>({});
  const [metrics, setMetrics] = useState<OnboardingMetrics | null>(null);
  const [activeTab, setActiveTab] = useState('progress');
  const [events, setEvents] = useState<OnboardingEvent[]>([]);
  
  const { toast } = useToast();

  // Initialize completion requirements
  useEffect(() => {
    const initialRequirements: { [key: string]: CompletionRequirement[] } = {};
    COMPLETION_CRITERIA.forEach(criteria => {
      initialRequirements[criteria.step] = criteria.requirements.map(req => ({
        ...req,
        status: session.completedSteps.includes(criteria.step) ? 'completed' : 'pending'
      }));
    });
    setCompletionRequirements(initialRequirements);
  }, [session.completedSteps]);

  // Auto-verify completed steps
  useEffect(() => {
    session.completedSteps.forEach(step => {
      if (!verificationStatus[step]) {
        verifyStepCompletion(step);
      }
    });
  }, [session.completedSteps]);

  const verifyStepCompletion = useCallback(async (step: OnboardingStep) => {
    const criteria = COMPLETION_CRITERIA.find(c => c.step === step);
    if (!criteria) return;

    const requirements = completionRequirements[step] || criteria.requirements;
    const allRequiredMet = requirements.every(req => 
      !req.required || req.status === 'completed'
    );

    const verification: StepVerification = {
      step,
      verified: allRequiredMet,
      verifiedAt: allRequiredMet ? new Date() : undefined,
      verifiedBy: 'system',
      verificationMethod: criteria.verificationMethod,
      notes: allRequiredMet ? 'All requirements met' : 'Some requirements pending',
      issues: allRequiredMet ? [] : [
        {
          id: `issue_${Date.now()}`,
          severity: 'medium',
          description: 'Not all requirements completed',
          status: 'open'
        }
      ]
    };

    setVerificationStatus(prev => ({ ...prev, [step]: verification }));

    if (allRequiredMet) {
      addEvent({
        sessionId: session.id,
        userId: session.userId,
        eventType: 'step_completed',
        step,
        timestamp: new Date(),
        data: { verification }
      });

      toast({
        title: "Step Verified",
        description: `${step.replace('_', ' ')} has been completed and verified`,
      });
    }
  }, [completionRequirements, session]);

  const addEvent = useCallback((event: OnboardingEvent) => {
    setEvents(prev => [event, ...prev].slice(0, 50)); // Keep last 50 events
  }, []);

  const updateRequirementStatus = useCallback((
    step: OnboardingStep, 
    requirementId: string, 
    status: CompletionRequirement['status'],
    verificationData?: any
  ) => {
    setCompletionRequirements(prev => ({
      ...prev,
      [step]: prev[step]?.map(req => 
        req.id === requirementId 
          ? { 
              ...req, 
              status, 
              completedAt: status === 'completed' ? new Date() : undefined,
              verificationData 
            }
          : req
      ) || []
    }));

    // Re-verify step after requirement update
    setTimeout(() => verifyStepCompletion(step), 100);
  }, [verifyStepCompletion]);

  const manuallyVerifyStep = useCallback((step: OnboardingStep, notes?: string) => {
    const verification: StepVerification = {
      step,
      verified: true,
      verifiedAt: new Date(),
      verifiedBy: session.userId,
      verificationMethod: 'manual',
      notes: notes || 'Manually verified by user',
      issues: []
    };

    setVerificationStatus(prev => ({ ...prev, [step]: verification }));

    // Mark all requirements as completed
    const requirements = completionRequirements[step] || [];
    requirements.forEach(req => {
      updateRequirementStatus(step, req.id, 'completed');
    });

    addEvent({
      sessionId: session.id,
      userId: session.userId,
      eventType: 'step_completed',
      step,
      timestamp: new Date(),
      data: { verification, manual: true }
    });

    toast({
      title: "Step Manually Verified",
      description: `${step.replace('_', ' ')} has been manually verified`,
    });
  }, [session, completionRequirements, updateRequirementStatus, addEvent]);

  const calculateCompletionPercentage = useCallback(() => {
    const totalSteps = COMPLETION_CRITERIA.length;
    const verifiedSteps = Object.values(verificationStatus).filter(v => v.verified).length;
    return (verifiedSteps / totalSteps) * 100;
  }, [verificationStatus]);

  const generateCompletionReport = useCallback(() => {
    const report = {
      sessionId: session.id,
      generatedAt: new Date(),
      overallCompletion: calculateCompletionPercentage(),
      stepVerifications: verificationStatus,
      requirements: completionRequirements,
      events: events,
      timeline: {
        started: session.startedAt,
        lastActive: session.lastActiveAt,
        completed: session.completedAt,
        totalTime: session.completedAt ? 
          (session.completedAt.getTime() - session.startedAt.getTime()) / (1000 * 60 * 60) : // hours
          (session.lastActiveAt.getTime() - session.startedAt.getTime()) / (1000 * 60 * 60)
      },
      metrics: metrics
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onboarding_report_${session.id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Report Generated",
      description: "Onboarding completion report downloaded",
    });
  }, [session, verificationStatus, completionRequirements, events, metrics, calculateCompletionPercentage]);

  const renderProgressOverview = () => {
    const completionPercentage = calculateCompletionPercentage();
    const verifiedSteps = Object.values(verificationStatus).filter(v => v.verified).length;
    const totalSteps = COMPLETION_CRITERIA.length;

    return (
      <div className="space-y-6">
        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Overall Progress
            </CardTitle>
            <CardDescription>
              Onboarding completion status and verification
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {verifiedSteps}
                </div>
                <div className="text-sm text-gray-600">Steps Verified</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {Math.round(completionPercentage)}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {session.trainingProgress.certifications.length}
                </div>
                <div className="text-sm text-gray-600">Certifications</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round((session.lastActiveAt.getTime() - session.startedAt.getTime()) / (1000 * 60 * 60))}
                </div>
                <div className="text-sm text-gray-600">Hours Spent</div>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span>Overall Completion</span>
                <span>{Math.round(completionPercentage)}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
            </div>

            <div className="flex justify-between">
              <Badge variant={session.completedAt ? "default" : "secondary"}>
                {session.completedAt ? "Completed" : "In Progress"}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" onClick={generateCompletionReport}>
                  <Download className="h-4 w-4 mr-2" />
                  Download Report
                </Button>
                {adminView && (
                  <Button variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Admin View
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Step Verification Status
            </CardTitle>
            <CardDescription>
              Detailed verification status for each onboarding step
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {COMPLETION_CRITERIA.map((criteria, index) => {
                const verification = verificationStatus[criteria.step];
                const requirements = completionRequirements[criteria.step] || criteria.requirements;
                const isCurrentStep = session.currentStep === criteria.step;
                const completedRequirements = requirements.filter(r => r.status === 'completed').length;
                const totalRequirements = requirements.length;
                const requiredRequirements = requirements.filter(r => r.required).length;
                const completedRequired = requirements.filter(r => r.required && r.status === 'completed').length;

                return (
                  <div
                    key={criteria.step}
                    className={`p-4 border rounded-lg ${
                      verification?.verified ? 'border-green-200 bg-green-50' :
                      isCurrentStep ? 'border-blue-200 bg-blue-50' :
                      'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          verification?.verified ? 'bg-green-100' :
                          isCurrentStep ? 'bg-blue-100' :
                          'bg-gray-100'
                        }`}>
                          {verification?.verified ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : isCurrentStep ? (
                            <Clock className="h-5 w-5 text-blue-600" />
                          ) : (
                            <div className="h-5 w-5 rounded-full border-2 border-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {criteria.step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </div>
                          <div className="text-sm text-gray-600">
                            {completedRequired}/{requiredRequirements} required • {completedRequirements}/{totalRequirements} total
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Badge variant={
                          verification?.verified ? "default" :
                          isCurrentStep ? "secondary" :
                          "outline"
                        }>
                          {verification?.verified ? "Verified" :
                           isCurrentStep ? "Current" :
                           "Pending"}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          ~{criteria.estimatedTime}min
                        </span>
                      </div>
                    </div>

                    {/* Requirements List */}
                    <div className="space-y-2 mb-3">
                      {requirements.map((req, reqIndex) => (
                        <div key={req.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              req.status === 'completed' ? 'bg-green-500' :
                              req.status === 'in_progress' ? 'bg-blue-500' :
                              req.status === 'failed' ? 'bg-red-500' :
                              'bg-gray-300'
                            }`} />
                            <span className={req.required ? 'font-medium' : 'text-gray-600'}>
                              {req.description}
                            </span>
                            {req.required && (
                              <Badge variant="outline" >Required</Badge>
                            )}
                          </div>
                          <Badge variant="outline" >
                            {req.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    {/* Verification Info */}
                    {verification && (
                      <div className="text-xs text-gray-600 border-t pt-2">
                        Verified: {verification.verifiedAt?.toLocaleString()} • 
                        Method: {verification.verificationMethod} • 
                        By: {verification.verifiedBy}
                        {verification.notes && (
                          <div className="mt-1">Notes: {verification.notes}</div>
                        )}
                      </div>
                    )}

                    {/* Manual Verification Button (Admin) */}
                    {adminView && !verification?.verified && (
                      <div className="mt-3 pt-3 border-t">
                        <Button
                          
                          variant="outline"
                          onClick={() => manuallyVerifyStep(criteria.step)}
                        >
                          Manually Verify Step
                        </Button>
                      </div>
                    )}

                    {/* Issues */}
                    {verification?.issues && verification.issues.length > 0 && (
                      <div className="mt-3 pt-3 border-t">
                        <div className="text-sm font-medium text-red-600 mb-2">Issues:</div>
                        {verification.issues.map((issue, issueIndex) => (
                          <Alert key={issue.id} variant="destructive" className="mb-2">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              <div className="flex justify-between">
                                <span>{issue.description}</span>
                                <Badge variant="outline" >
                                  {issue.severity}
                                </Badge>
                              </div>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderEventTimeline = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Event Timeline
          </CardTitle>
          <CardDescription>
            Chronological log of onboarding activities and milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No events recorded yet
              </div>
            ) : (
              events.map((event, index) => (
                <div key={`${event.timestamp.getTime()}_${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="p-1 rounded-full bg-blue-100 mt-1">
                    {getEventIcon(event.eventType)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{formatEventTitle(event.eventType, event.step)}</div>
                        <div className="text-sm text-gray-600">
                          {event.timestamp.toLocaleString()}
                        </div>
                      </div>
                      <Badge variant="outline" >
                        {event.eventType.replace('_', ' ')}
                      </Badge>
                    </div>
                    {event.data && (
                      <div className="mt-2 text-sm text-gray-600">
                        {formatEventData(event.data)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderMetrics = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Onboarding Metrics
          </CardTitle>
          <CardDescription>
            Performance analytics and completion metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Metrics calculation in progress...
          </div>
        </CardContent>
      </Card>
    </div>
  );

  function getEventIcon(eventType: OnboardingEventType) {
    const iconMap: { [key in OnboardingEventType]: React.ReactElement } = {
      session_started: <Play className="h-3 w-3 text-blue-600" />,
      step_started: <ArrowRight className="h-3 w-3 text-blue-600" />,
      step_completed: <CheckCircle className="h-3 w-3 text-green-600" />,
      step_skipped: <ArrowRight className="h-3 w-3 text-gray-600" />,
      help_requested: <HelpCircle className="h-3 w-3 text-orange-600" />,
      error_encountered: <AlertTriangle className="h-3 w-3 text-red-600" />,
      feedback_submitted: <MessageSquare className="h-3 w-3 text-blue-600" />,
      session_paused: <Clock className="h-3 w-3 text-yellow-600" />,
      session_resumed: <Play className="h-3 w-3 text-green-600" />,
      session_completed: <Star className="h-3 w-3 text-green-600" />,
      support_ticket_created: <HelpCircle className="h-3 w-3 text-red-600" />,
      training_module_started: <BookOpen className="h-3 w-3 text-blue-600" />,
      training_module_completed: <CheckCircle className="h-3 w-3 text-green-600" />,
      assessment_taken: <FileText className="h-3 w-3 text-purple-600" />,
      certification_earned: <Award className="h-3 w-3 text-yellow-600" />,
      migration_started: <Database className="h-3 w-3 text-blue-600" />,
      migration_completed: <CheckCircle className="h-3 w-3 text-green-600" />,
      system_configured: <Settings className="h-3 w-3 text-blue-600" />,
      go_live_approved: <Zap className="h-3 w-3 text-green-600" />
    };
    return iconMap[eventType] || <Activity className="h-3 w-3 text-gray-600" />;
  }

  function formatEventTitle(eventType: OnboardingEventType, step?: OnboardingStep): string {
    const baseTitle = eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    if (step) {
      const stepName = step.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${baseTitle}: ${stepName}`;
    }
    return baseTitle;
  }

  function formatEventData(data: any): string {
    if (typeof data === 'string') return data;
    if (typeof data === 'object') {
      return Object.entries(data)
        .slice(0, 3)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    }
    return JSON.stringify(data);
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Onboarding Progress Tracker</h2>
        <p className="text-gray-600">
          Comprehensive tracking and verification of onboarding completion
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="progress">Progress & Verification</TabsTrigger>
          <TabsTrigger value="timeline">Event Timeline</TabsTrigger>
          <TabsTrigger value="metrics">Metrics & Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="progress">
          {renderProgressOverview()}
        </TabsContent>

        <TabsContent value="timeline">
          {renderEventTimeline()}
        </TabsContent>

        <TabsContent value="metrics">
          {renderMetrics()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
