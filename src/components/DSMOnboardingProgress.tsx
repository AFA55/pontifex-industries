'use client';

import React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
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
  GraduationCap,
  MessageSquare,
  HelpCircle,
  Zap,
  FileText,
  Activity,
  Play,
  Pause,
  CheckSquare,
  XCircle,
  Info,
  MapPin,
  Phone,
  Mail,
  Building2,
  Wrench
} from 'lucide-react';
import { 
  DSMOnboardingSession,
  OnboardingStep,
  OnboardingEvent,
  OnboardingEventType,
  SupportTicket,
  OnboardingBlocker
} from '@/types/dsm-onboarding';
import { useToast } from '@/hooks/use-toast';

interface DSMOnboardingProgressProps {
  session: DSMOnboardingSession;
  onSessionUpdate: (session: DSMOnboardingSession) => void;
  adminView?: boolean;
  showDetailedMetrics?: boolean;
}

interface StepRequirement {
  id: string;
  name: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt?: Date;
  verificationMethod: 'automatic' | 'manual' | 'user_confirmation';
  verifiedBy?: string;
  notes?: string;
}

interface StepConfiguration {
  step: OnboardingStep;
  title: string;
  description: string;
  icon: any;
  estimatedMinutes: number;
  requirements: StepRequirement[];
  dependencies: OnboardingStep[];
  blockers: string[];
}

const ONBOARDING_STEPS_CONFIG: StepConfiguration[] = [
  {
    step: 'welcome',
    title: 'Welcome & Introduction',
    description: 'Get acquainted with Pontifex Industries and the migration process',
    icon: Star,
    estimatedMinutes: 15,
    requirements: [
      {
        id: 'welcome_video_watched',
        name: 'Welcome Video Watched',
        description: 'Completed the welcome and introduction video',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'migration_overview_read',
        name: 'Migration Overview Read',
        description: 'Read through the migration process overview',
        required: true,
        completed: false,
        verificationMethod: 'user_confirmation'
      }
    ],
    dependencies: [],
    blockers: []
  },
  {
    step: 'company_profile',
    title: 'Company Profile Setup',
    description: 'Configure your company information and business details',
    icon: Building2,
    estimatedMinutes: 45,
    requirements: [
      {
        id: 'basic_info_complete',
        name: 'Basic Information Complete',
        description: 'Company name, type, size, and contact information',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'services_configured',
        name: 'Services Configured',
        description: 'Selected concrete cutting services offered',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'contact_info_verified',
        name: 'Contact Information Verified',
        description: 'Primary contact information validated',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'service_areas_defined',
        name: 'Service Areas Defined',
        description: 'Geographic service areas and coverage',
        required: false,
        completed: false,
        verificationMethod: 'user_confirmation'
      }
    ],
    dependencies: ['welcome'],
    blockers: []
  },
  {
    step: 'dsm_assessment',
    title: 'DSM Data Assessment',
    description: 'Analyze your current DSM setup and data for migration planning',
    icon: Database,
    estimatedMinutes: 30,
    requirements: [
      {
        id: 'dsm_version_identified',
        name: 'DSM Version Identified',
        description: 'Current DSM version and modules documented',
        required: true,
        completed: false,
        verificationMethod: 'user_confirmation'
      },
      {
        id: 'data_volume_estimated',
        name: 'Data Volume Estimated',
        description: 'Estimated data volume and complexity assessed',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'custom_fields_documented',
        name: 'Customizations Documented',
        description: 'Custom fields and workflows identified',
        required: false,
        completed: false,
        verificationMethod: 'manual'
      }
    ],
    dependencies: ['company_profile'],
    blockers: []
  },
  {
    step: 'data_migration',
    title: 'Data Migration Execution',
    description: 'Automated migration of your DSM data to Pontifex platform',
    icon: RefreshCw,
    estimatedMinutes: 120,
    requirements: [
      {
        id: 'data_exported',
        name: 'DSM Data Exported',
        description: 'Data successfully exported from DSM system',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'migration_completed',
        name: 'Migration Process Completed',
        description: 'All migration phases completed successfully',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'data_validated',
        name: 'Data Validation Passed',
        description: 'Migrated data passed validation checks',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'user_data_review',
        name: 'User Data Review',
        description: 'Customer has reviewed and approved migrated data',
        required: true,
        completed: false,
        verificationMethod: 'user_confirmation'
      }
    ],
    dependencies: ['dsm_assessment'],
    blockers: []
  },
  {
    step: 'system_setup',
    title: 'System Configuration',
    description: 'Configure system settings and user accounts',
    icon: Settings,
    estimatedMinutes: 60,
    requirements: [
      {
        id: 'user_accounts_created',
        name: 'User Accounts Created',
        description: 'All team member accounts created and configured',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'permissions_configured',
        name: 'Permissions Configured',
        description: 'User roles and permissions properly set',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'workflows_setup',
        name: 'Workflows Configured',
        description: 'Business workflows configured for concrete cutting',
        required: true,
        completed: false,
        verificationMethod: 'manual'
      }
    ],
    dependencies: ['data_migration'],
    blockers: []
  },
  {
    step: 'team_configuration',
    title: 'Team Setup',
    description: 'Configure team members, roles, and access levels',
    icon: Users,
    estimatedMinutes: 45,
    requirements: [
      {
        id: 'team_members_added',
        name: 'Team Members Added',
        description: 'All team members added with appropriate roles',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'notification_preferences',
        name: 'Notification Preferences Set',
        description: 'Team notification preferences configured',
        required: false,
        completed: false,
        verificationMethod: 'user_confirmation'
      },
      {
        id: 'communication_setup',
        name: 'Communication Channels Setup',
        description: 'Email and SMS communication configured',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['system_setup'],
    blockers: []
  },
  {
    step: 'training_modules',
    title: 'Training & Certification',
    description: 'Complete essential training modules for platform mastery',
    icon: GraduationCap,
    estimatedMinutes: 240,
    requirements: [
      {
        id: 'essential_modules_complete',
        name: 'Essential Modules Complete',
        description: 'Core training modules completed successfully',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'assessments_passed',
        name: 'Assessments Passed',
        description: 'All required assessments passed with minimum scores',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'safety_certification',
        name: 'Safety Certification Earned',
        description: 'OSHA safety compliance certification completed',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'advanced_training',
        name: 'Advanced Training Complete',
        description: 'Advanced features and administration training',
        required: false,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['team_configuration'],
    blockers: []
  },
  {
    step: 'equipment_setup',
    title: 'Equipment Configuration',
    description: 'Register and configure your concrete cutting equipment',
    icon: Wrench,
    estimatedMinutes: 90,
    requirements: [
      {
        id: 'equipment_registered',
        name: 'Equipment Registered',
        description: 'All equipment registered in asset management system',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'tracking_devices_setup',
        name: 'Tracking Devices Setup',
        description: 'GPS and Bluetooth tracking devices configured',
        required: false,
        completed: false,
        verificationMethod: 'manual'
      },
      {
        id: 'maintenance_schedules',
        name: 'Maintenance Schedules Setup',
        description: 'Preventive maintenance schedules configured',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['training_modules'],
    blockers: []
  },
  {
    step: 'safety_compliance',
    title: 'Safety & Compliance Setup',
    description: 'Configure OSHA compliance and safety monitoring systems',
    icon: Shield,
    estimatedMinutes: 75,
    requirements: [
      {
        id: 'osha_framework_configured',
        name: 'OSHA Framework Configured',
        description: 'OSHA compliance framework fully configured',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'silica_monitoring_setup',
        name: 'Silica Monitoring Setup',
        description: 'Respirable crystalline silica monitoring configured',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'incident_reporting_tested',
        name: 'Incident Reporting Tested',
        description: 'Incident reporting workflow tested and verified',
        required: true,
        completed: false,
        verificationMethod: 'manual'
      },
      {
        id: 'ppe_tracking_setup',
        name: 'PPE Tracking Setup',
        description: 'Personal protective equipment tracking configured',
        required: false,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['equipment_setup'],
    blockers: []
  },
  {
    step: 'workflow_configuration',
    title: 'Workflow Customization',
    description: 'Customize workflows for your concrete cutting operations',
    icon: ArrowRight,
    estimatedMinutes: 60,
    requirements: [
      {
        id: 'work_types_configured',
        name: 'Work Types Configured',
        description: 'Concrete cutting work types and pricing configured',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'approval_workflows',
        name: 'Approval Workflows Setup',
        description: 'Job approval and change order workflows configured',
        required: true,
        completed: false,
        verificationMethod: 'manual'
      },
      {
        id: 'automation_rules',
        name: 'Automation Rules Configured',
        description: 'Business automation rules and triggers setup',
        required: false,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['safety_compliance'],
    blockers: []
  },
  {
    step: 'integration_setup',
    title: 'System Integrations',
    description: 'Configure integrations with accounting and other business systems',
    icon: Zap,
    estimatedMinutes: 45,
    requirements: [
      {
        id: 'accounting_integration',
        name: 'Accounting Integration',
        description: 'QuickBooks or other accounting software connected',
        required: false,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'api_connections_tested',
        name: 'API Connections Tested',
        description: 'All configured API connections tested and verified',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'data_sync_verified',
        name: 'Data Synchronization Verified',
        description: 'Data synchronization between systems verified',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['workflow_configuration'],
    blockers: []
  },
  {
    step: 'testing_validation',
    title: 'System Testing & Validation',
    description: 'Comprehensive testing of all system functions and workflows',
    icon: CheckSquare,
    estimatedMinutes: 90,
    requirements: [
      {
        id: 'functional_testing',
        name: 'Functional Testing Complete',
        description: 'All core functions tested and verified',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'integration_testing',
        name: 'Integration Testing Complete',
        description: 'System integrations tested end-to-end',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'user_acceptance_testing',
        name: 'User Acceptance Testing',
        description: 'Customer team has tested and approved system',
        required: true,
        completed: false,
        verificationMethod: 'user_confirmation'
      },
      {
        id: 'performance_testing',
        name: 'Performance Testing',
        description: 'System performance under normal load verified',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['integration_setup'],
    blockers: []
  },
  {
    step: 'go_live_preparation',
    title: 'Go-Live Preparation',
    description: 'Final preparations and checks before going live',
    icon: Zap,
    estimatedMinutes: 30,
    requirements: [
      {
        id: 'backup_verified',
        name: 'Backup Strategy Verified',
        description: 'Data backup and recovery procedures verified',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'support_contacts_verified',
        name: 'Support Contacts Verified',
        description: 'Emergency support contact information verified',
        required: true,
        completed: false,
        verificationMethod: 'manual'
      },
      {
        id: 'go_live_checklist',
        name: 'Go-Live Checklist Complete',
        description: 'All go-live checklist items completed',
        required: true,
        completed: false,
        verificationMethod: 'manual'
      },
      {
        id: 'final_sign_off',
        name: 'Final Customer Sign-off',
        description: 'Customer approval for go-live obtained',
        required: true,
        completed: false,
        verificationMethod: 'user_confirmation'
      }
    ],
    dependencies: ['testing_validation'],
    blockers: []
  },
  {
    step: 'completion',
    title: 'Onboarding Complete',
    description: 'Congratulations! Your migration to Pontifex is complete',
    icon: CheckCircle,
    estimatedMinutes: 15,
    requirements: [
      {
        id: 'all_steps_verified',
        name: 'All Steps Verified',
        description: 'All onboarding steps completed and verified',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      },
      {
        id: 'feedback_submitted',
        name: 'Feedback Submitted',
        description: 'Onboarding experience feedback provided',
        required: false,
        completed: false,
        verificationMethod: 'user_confirmation'
      },
      {
        id: 'success_metrics_baseline',
        name: 'Success Metrics Baseline',
        description: 'Initial success metrics and KPIs established',
        required: true,
        completed: false,
        verificationMethod: 'automatic'
      }
    ],
    dependencies: ['go_live_preparation'],
    blockers: []
  }
];

export default function DSMOnboardingProgress({
  session,
  onSessionUpdate,
  adminView = false,
  showDetailedMetrics = false
}: DSMOnboardingProgressProps) {
  const [events, setEvents] = useState<OnboardingEvent[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedStep, setSelectedStep] = useState<OnboardingStep | null>(null);
  
  const { toast } = useToast();

  const addEvent = useCallback((eventType: OnboardingEventType, step?: OnboardingStep, data?: any) => {
    const newEvent: OnboardingEvent = {
      sessionId: session.id,
      userId: session.userId,
      eventType,
      step,
      timestamp: new Date(),
      data
    };
    
    setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events
  }, [session.id, session.userId]);

  const updateSessionProgress = useCallback((updates: Partial<DSMOnboardingSession>) => {
    const updatedSession = {
      ...session,
      ...updates,
      lastActiveAt: new Date()
    };
    onSessionUpdate(updatedSession);
  }, [session, onSessionUpdate]);

  const markStepComplete = useCallback((step: OnboardingStep) => {
    if (!session.completedSteps.includes(step)) {
      const newCompletedSteps = [...session.completedSteps, step];
      const progressPercentage = (newCompletedSteps.length / ONBOARDING_STEPS_CONFIG.length) * 100;
      
      updateSessionProgress({
        completedSteps: newCompletedSteps,
        progressPercentage,
        currentStep: getNextStep(step)
      });
      
      addEvent('step_completed', step);
      
      toast({
        title: "Step Completed!",
        description: `${step.replace('_', ' ')} has been marked as complete`,
      });
    }
  }, [session.completedSteps, updateSessionProgress, addEvent, toast]);

  const getNextStep = (currentStep: OnboardingStep): OnboardingStep => {
    const currentIndex = ONBOARDING_STEPS_CONFIG.findIndex(s => s.step === currentStep);
    const nextIndex = currentIndex + 1;
    return nextIndex < ONBOARDING_STEPS_CONFIG.length 
      ? ONBOARDING_STEPS_CONFIG[nextIndex].step 
      : 'completion';
  };

  const getStepStatus = (step: OnboardingStep) => {
    if (session.completedSteps.includes(step)) return 'completed';
    if (session.currentStep === step) return 'current';
    
    // Check if step is available (dependencies met)
    const stepConfig = ONBOARDING_STEPS_CONFIG.find(s => s.step === step);
    if (stepConfig) {
      const dependenciesMet = stepConfig.dependencies.every(dep => 
        session.completedSteps.includes(dep)
      );
      return dependenciesMet ? 'available' : 'locked';
    }
    
    return 'pending';
  };

  const getStepProgress = (step: OnboardingStep) => {
    const stepConfig = ONBOARDING_STEPS_CONFIG.find(s => s.step === step);
    if (!stepConfig) return 0;
    
    const completedRequirements = stepConfig.requirements.filter(req => req.completed).length;
    const totalRequirements = stepConfig.requirements.length;
    
    return totalRequirements > 0 ? (completedRequirements / totalRequirements) * 100 : 0;
  };

  const getTotalEstimatedTime = () => {
    return ONBOARDING_STEPS_CONFIG.reduce((total, step) => total + step.estimatedMinutes, 0);
  };

  const getCompletedTime = () => {
    return ONBOARDING_STEPS_CONFIG
      .filter(step => session.completedSteps.includes(step.step))
      .reduce((total, step) => total + step.estimatedMinutes, 0);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Onboarding Progress Summary
          </CardTitle>
          <CardDescription>
            Track your DSM to Pontifex migration progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {session.completedSteps.length}
              </div>
              <div className="text-sm text-gray-600">Steps Complete</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(session.progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {session.trainingProgress.certifications.length}
              </div>
              <div className="text-sm text-gray-600">Certifications</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(getCompletedTime() / 60)}
              </div>
              <div className="text-sm text-gray-600">Hours Completed</div>
            </div>
          </div>

          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Overall Completion</span>
              <span>{Math.round(session.progressPercentage)}%</span>
            </div>
            <Progress value={session.progressPercentage} className="h-3" />
          </div>

          <div className="flex justify-between items-center">
            <Badge variant={session.completedAt ? "default" : "secondary"}>
              {session.completedAt ? "Completed" : "In Progress"}
            </Badge>
            <div className="text-sm text-gray-600">
              Estimated remaining: {Math.round((getTotalEstimatedTime() - getCompletedTime()) / 60)} hours
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Step-by-Step Progress
          </CardTitle>
          <CardDescription>
            Detailed progress for each onboarding step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ONBOARDING_STEPS_CONFIG.map((stepConfig, index) => {
              const status = getStepStatus(stepConfig.step);
              const progress = getStepProgress(stepConfig.step);
              const isCurrent = session.currentStep === stepConfig.step;

              return (
                <div
                  key={stepConfig.step}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    status === 'completed' ? 'border-green-200 bg-green-50' :
                    isCurrent ? 'border-blue-200 bg-blue-50' :
                    status === 'available' ? 'border-gray-200 hover:border-gray-300' :
                    'border-gray-100 bg-gray-50'
                  }`}
                  onClick={() => setSelectedStep(selectedStep === stepConfig.step ? null : stepConfig.step)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        status === 'completed' ? 'bg-green-100 text-green-600' :
                        isCurrent ? 'bg-blue-100 text-blue-600' :
                        status === 'available' ? 'bg-gray-100 text-gray-600' :
                        'bg-gray-50 text-gray-400'
                      }`}>
                        {status === 'completed' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Clock className="h-5 w-5" />
                        ) : (
                          <stepConfig.icon className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{stepConfig.title}</div>
                        <div className="text-sm text-gray-600">{stepConfig.description}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant={
                        status === 'completed' ? 'default' :
                        isCurrent ? 'secondary' :
                        status === 'available' ? 'outline' :
                        'outline'
                      }>
                        {status === 'completed' ? 'Complete' :
                         isCurrent ? 'Current' :
                         status === 'available' ? 'Available' :
                         'Locked'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        ~{stepConfig.estimatedMinutes}min
                      </span>
                    </div>
                  </div>

                  {status !== 'locked' && status !== 'pending' && (
                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span>Step Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}

                  {/* Requirements Details */}
                  {selectedStep === stepConfig.step && (
                    <div className="mt-4 pt-4 border-t space-y-3">
                      <div className="font-medium text-sm">Requirements:</div>
                      {stepConfig.requirements.map((req, reqIndex) => (
                        <div key={req.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              req.completed ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className={req.required ? 'font-medium' : 'text-gray-600'}>
                              {req.name}
                            </span>
                            {req.required && (
                              <Badge variant="outline">Required</Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {req.verificationMethod}
                          </div>
                        </div>
                      ))}
                      
                      {stepConfig.dependencies.length > 0 && (
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Dependencies:</span> {
                            stepConfig.dependencies.map(dep => 
                              dep.replace('_', ' ')).join(', ')
                          }
                        </div>
                      )}
                      
                      {adminView && status === 'available' && (
                        <div className="pt-2">
                          <Button 
                             
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              markStepComplete(stepConfig.step);
                            }}
                          >
                            Mark Complete
                          </Button>
                        </div>
                      )}
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

  const renderEventsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Activity Timeline
        </CardTitle>
        <CardDescription>
          Chronological log of onboarding activities and milestones
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-4">
            {events.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No events recorded yet. Activity will appear here as you progress.
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
                      <Badge variant="outline">
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
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderSupportTab = () => (
    <div className="space-y-6">
      {/* Support Tickets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Support Tickets
          </CardTitle>
          <CardDescription>
            Track support requests and assistance during onboarding
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session.supportTickets.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
              <p className="text-gray-600 mb-4">You haven't created any support tickets yet.</p>
              <Button>
                <HelpCircle className="h-4 w-4 mr-2" />
                Request Help
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {session.supportTickets.map((ticket) => (
                <div key={ticket.id} className="p-4 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium">{ticket.title}</div>
                      <div className="text-sm text-gray-600">{ticket.description}</div>
                    </div>
                    <Badge variant={
                      ticket.status === 'resolved' ? 'default' :
                      ticket.status === 'in_progress' ? 'secondary' :
                      'outline'
                    }>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{ticket.category} • Priority: {ticket.priority}</span>
                    <span>{ticket.submittedAt.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Blockers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Active Blockers
          </CardTitle>
          <CardDescription>
            Issues that may be preventing onboarding progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          {session.blockers.length === 0 ? (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-2" />
              <p className="text-gray-600">No active blockers</p>
            </div>
          ) : (
            <div className="space-y-4">
              {session.blockers.map((blocker) => (
                <Alert key={blocker.id} variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between">
                      <span>{blocker.description}</span>
                      <Badge variant="outline">
                        {blocker.impact.replace('_', ' ')}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          )}
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
      session_paused: <Pause className="h-3 w-3 text-yellow-600" />,
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
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">DSM Migration Progress</h2>
        <p className="text-gray-600">
          Track your journey from DSM to Pontifex Industries
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Progress Overview</TabsTrigger>
          <TabsTrigger value="events">Activity Timeline</TabsTrigger>
          <TabsTrigger value="support">Support & Issues</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="events">
          {renderEventsTab()}
        </TabsContent>

        <TabsContent value="support">
          {renderSupportTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}