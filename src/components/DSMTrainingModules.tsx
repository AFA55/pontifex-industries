import React from 'react';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  BookOpen,
  Play,
  Pause,
  CheckCircle,
  Clock,
  Award,
  Target,
  Users,
  Shield,
  Settings,
  BarChart3,
  Smartphone,
  FileText,
  GraduationCap,
  Star,
  ArrowRight,
  ArrowLeft,
  Volume2,
  VolumeX,
  RotateCcw,
  Download,
  Eye,
  Brain,
  Zap,
  AlertTriangle,
  Info,
  TrendingUp,
  Calendar,
  Camera,
  MapPin,
  Wrench
} from 'lucide-react';
import { 
  DSMOnboardingSession,
  TrainingModule,
  TrainingModuleProgress,
  AssessmentScore,
  Certification,
  LearningPath
} from '@/types/dsm-onboarding';
import { useToast } from '@/hooks/use-toast';

interface DSMTrainingModulesProps {
  session: DSMOnboardingSession;
  onSessionUpdate: (session: DSMOnboardingSession) => void;
  onTrainingComplete: (session: DSMOnboardingSession) => void;
}

interface ModuleContent {
  module: TrainingModule;
  title: string;
  description: string;
  icon: any;
  duration: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  prerequisites: TrainingModule[];
  topics: Topic[];
  assessment: Assessment;
  certification?: CertificationConfig;
}

interface Topic {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'interactive' | 'simulation' | 'quiz';
  duration: number; // minutes
  content: any;
  completed: boolean;
}

interface Assessment {
  questions: AssessmentQuestion[];
  passingScore: number;
  timeLimit: number; // minutes
  attempts: number;
}

interface AssessmentQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'scenario' | 'drag_drop';
  question: string;
  options?: string[];
  correctAnswer: any;
  explanation: string;
  points: number;
}

interface CertificationConfig {
  name: string;
  level: 'basic' | 'intermediate' | 'advanced';
  expiryMonths?: number;
  skills: string[];
}

const TRAINING_MODULES: ModuleContent[] = [
  {
    module: 'platform_overview',
    title: 'Pontifex Platform Overview',
    description: 'Introduction to the Pontifex Industries platform and key differences from DSM',
    icon: Target,
    duration: 45,
    difficulty: 'beginner',
    prerequisites: [],
    topics: [
      {
        id: 'intro_video',
        title: 'Welcome to Pontifex Industries',
        type: 'video',
        duration: 10,
        content: {
          videoUrl: '/training/videos/pontifex-intro.mp4',
          transcript: 'Welcome to Pontifex Industries, the future of concrete cutting management...'
        },
        completed: false
      },
      {
        id: 'platform_tour',
        title: 'Interactive Platform Tour',
        type: 'interactive',
        duration: 20,
        content: {
          type: 'guided_tour',
          steps: [
            { element: '.dashboard', description: 'This is your main dashboard' },
            { element: '.nav-jobs', description: 'Manage all your concrete cutting jobs here' },
            { element: '.nav-equipment', description: 'Track your equipment with real-time GPS' }
          ]
        },
        completed: false
      },
      {
        id: 'dsm_comparison',
        title: 'DSM vs Pontifex: Key Differences',
        type: 'reading',
        duration: 15,
        content: {
          sections: [
            {
              title: 'Real-time Asset Tracking',
              content: 'Unlike DSM, Pontifex offers real-time GPS tracking with Bluetooth beacons...'
            },
            {
              title: 'Advanced Analytics',
              content: 'Built-in business intelligence and predictive analytics...'
            }
          ]
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the main advantage of Pontifex over DSM for equipment tracking?',
          options: [
            'Better user interface',
            'Real-time GPS and Bluetooth beacon tracking',
            'Lower cost',
            'Easier installation'
          ],
          correctAnswer: 1,
          explanation: 'Pontifex provides real-time equipment tracking using GPS and Bluetooth beacons, unlike DSM\'s manual check-in system.',
          points: 10
        }
      ],
      passingScore: 80,
      timeLimit: 30,
      attempts: 3
    }
  },
  {
    module: 'dsm_differences',
    title: 'Understanding DSM to Pontifex Transition',
    description: 'Learn the key workflow differences and how to leverage new capabilities',
    icon: ArrowRight,
    duration: 60,
    difficulty: 'intermediate',
    prerequisites: ['platform_overview'],
    topics: [
      {
        id: 'workflow_mapping',
        title: 'Workflow Mapping: DSM to Pontifex',
        type: 'interactive',
        duration: 25,
        content: {
          type: 'workflow_comparison',
          dsmWorkflow: ['Create Estimate', 'Schedule Job', 'Dispatch Crew', 'Manual Time Entry', 'Generate Invoice'],
          pontifexWorkflow: ['Smart Estimate', 'Auto-Schedule', 'Real-time Dispatch', 'Automatic Time Tracking', 'Instant Billing']
        },
        completed: false
      },
      {
        id: 'data_migration_overview',
        title: 'Your Data Migration Explained',
        type: 'video',
        duration: 20,
        content: {
          videoUrl: '/training/videos/data-migration-explained.mp4'
        },
        completed: false
      },
      {
        id: 'new_features',
        title: 'Exclusive Features Not Available in DSM',
        type: 'reading',
        duration: 15,
        content: {
          features: [
            'OSHA Silica Monitoring Compliance',
            'Predictive Equipment Maintenance',
            'Real-time Customer Notifications',
            'Advanced Route Optimization'
          ]
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'scenario',
          question: 'A customer calls asking about job status. In DSM, you would need to call the crew. What would you do in Pontifex?',
          options: [
            'Still call the crew',
            'Check real-time job tracking dashboard',
            'Look at yesterday\'s report',
            'Schedule a callback'
          ],
          correctAnswer: 1,
          explanation: 'Pontifex provides real-time job tracking, so you can instantly see job status and location.',
          points: 15
        }
      ],
      passingScore: 85,
      timeLimit: 45,
      attempts: 3
    }
  },
  {
    module: 'job_management',
    title: 'Advanced Job Management',
    description: 'Master the enhanced job management capabilities for concrete cutting projects',
    icon: FileText,
    duration: 90,
    difficulty: 'intermediate',
    prerequisites: ['dsm_differences'],
    topics: [
      {
        id: 'smart_estimating',
        title: 'Smart Estimating with AI Assistance',
        type: 'simulation',
        duration: 30,
        content: {
          type: 'job_estimator_simulation',
          scenario: 'Wall sawing project at construction site'
        },
        completed: false
      },
      {
        id: 'job_workflows',
        title: 'Concrete Cutting Job Workflows',
        type: 'interactive',
        duration: 25,
        content: {
          workflows: ['Core Drilling', 'Wall Sawing', 'Slab Sawing', 'Demolition']
        },
        completed: false
      },
      {
        id: 'project_tracking',
        title: 'Real-time Project Tracking',
        type: 'video',
        duration: 20,
        content: {
          videoUrl: '/training/videos/project-tracking.mp4'
        },
        completed: false
      },
      {
        id: 'customer_communication',
        title: 'Automated Customer Communication',
        type: 'reading',
        duration: 15,
        content: {
          topics: ['Job status updates', 'Arrival notifications', 'Completion confirmations']
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'When creating an estimate for core drilling, what factors does Pontifex AI consider?',
          options: [
            'Only the number of holes',
            'Hole diameter, depth, concrete type, and reinforcement',
            'Just the customer\'s budget',
            'Previous job history only'
          ],
          correctAnswer: 1,
          explanation: 'Pontifex AI considers multiple factors including technical specifications and site conditions.',
          points: 10
        }
      ],
      passingScore: 80,
      timeLimit: 60,
      attempts: 3
    }
  },
  {
    module: 'customer_management',
    title: 'Enhanced Customer Management',
    description: 'Build stronger customer relationships with advanced CRM features',
    icon: Users,
    duration: 75,
    difficulty: 'intermediate',
    prerequisites: ['job_management'],
    topics: [
      {
        id: 'customer_portal',
        title: 'Customer Self-Service Portal',
        type: 'simulation',
        duration: 25,
        content: {
          type: 'customer_portal_demo'
        },
        completed: false
      },
      {
        id: 'communication_automation',
        title: 'Automated Communication Workflows',
        type: 'interactive',
        duration: 20,
        content: {
          workflows: ['Job scheduling', 'Progress updates', 'Invoice delivery']
        },
        completed: false
      },
      {
        id: 'crm_features',
        title: 'Advanced CRM Features',
        type: 'video',
        duration: 20,
        content: {
          videoUrl: '/training/videos/crm-features.mp4'
        },
        completed: false
      },
      {
        id: 'customer_analytics',
        title: 'Customer Analytics and Insights',
        type: 'reading',
        duration: 10,
        content: {
          metrics: ['Customer lifetime value', 'Project profitability', 'Satisfaction scores']
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'true_false',
          question: 'Customers can view real-time job progress through the customer portal.',
          correctAnswer: true,
          explanation: 'Yes, the customer portal provides real-time job tracking and updates.',
          points: 10
        }
      ],
      passingScore: 80,
      timeLimit: 45,
      attempts: 3
    }
  },
  {
    module: 'equipment_tracking',
    title: 'Real-time Equipment Tracking',
    description: 'Master the advanced asset tracking capabilities with GPS and Bluetooth beacons',
    icon: MapPin,
    duration: 85,
    difficulty: 'intermediate',
    prerequisites: ['customer_management'],
    topics: [
      {
        id: 'gps_tracking',
        title: 'GPS Fleet Tracking',
        type: 'simulation',
        duration: 25,
        content: {
          type: 'gps_tracking_demo'
        },
        completed: false
      },
      {
        id: 'bluetooth_beacons',
        title: 'Bluetooth Beacon Asset Tracking',
        type: 'interactive',
        duration: 30,
        content: {
          type: 'beacon_setup_tutorial'
        },
        completed: false
      },
      {
        id: 'maintenance_tracking',
        title: 'Predictive Maintenance',
        type: 'video',
        duration: 20,
        content: {
          videoUrl: '/training/videos/predictive-maintenance.mp4'
        },
        completed: false
      },
      {
        id: 'utilization_analytics',
        title: 'Equipment Utilization Analytics',
        type: 'reading',
        duration: 10,
        content: {
          metrics: ['Usage hours', 'Efficiency rates', 'Cost per hour']
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the primary benefit of Bluetooth beacons for small equipment?',
          options: [
            'They are cheaper than GPS',
            'They work indoors and provide precise location',
            'They last longer than GPS devices',
            'They are easier to install'
          ],
          correctAnswer: 1,
          explanation: 'Bluetooth beacons provide precise indoor location tracking where GPS signals are weak.',
          points: 10
        }
      ],
      passingScore: 85,
      timeLimit: 50,
      attempts: 3
    }
  },
  {
    module: 'safety_compliance',
    title: 'OSHA Safety & Silica Compliance',
    description: 'Essential training for OSHA compliance and silica exposure monitoring',
    icon: Shield,
    duration: 120,
    difficulty: 'advanced',
    prerequisites: ['equipment_tracking'],
    topics: [
      {
        id: 'osha_requirements',
        title: 'OSHA Concrete Cutting Requirements',
        type: 'reading',
        duration: 30,
        content: {
          regulations: ['29 CFR 1926.1153', 'Respirable crystalline silica standard']
        },
        completed: false
      },
      {
        id: 'silica_monitoring',
        title: 'Automated Silica Exposure Monitoring',
        type: 'simulation',
        duration: 35,
        content: {
          type: 'silica_monitoring_demo'
        },
        completed: false
      },
      {
        id: 'ppe_tracking',
        title: 'PPE Compliance Tracking',
        type: 'interactive',
        duration: 25,
        content: {
          type: 'ppe_checklist_system'
        },
        completed: false
      },
      {
        id: 'incident_reporting',
        title: 'Digital Incident Reporting',
        type: 'simulation',
        duration: 20,
        content: {
          type: 'incident_report_demo'
        },
        completed: false
      },
      {
        id: 'compliance_reports',
        title: 'Automated Compliance Reporting',
        type: 'video',
        duration: 10,
        content: {
          videoUrl: '/training/videos/compliance-reporting.mp4'
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the OSHA permissible exposure limit (PEL) for respirable crystalline silica?',
          options: [
            '25 μg/m³',
            '50 μg/m³',
            '75 μg/m³',
            '100 μg/m³'
          ],
          correctAnswer: 1,
          explanation: 'The OSHA PEL for respirable crystalline silica is 50 μg/m³ as an 8-hour time-weighted average.',
          points: 15
        }
      ],
      passingScore: 90,
      timeLimit: 90,
      attempts: 2
    },
    certification: {
      name: 'OSHA Silica Compliance Specialist',
      level: 'advanced',
      expiryMonths: 12,
      skills: ['OSHA regulations', 'Silica monitoring', 'PPE compliance', 'Incident reporting']
    }
  },
  {
    module: 'mobile_app',
    title: 'Mobile App Mastery',
    description: 'Learn to use the field crew mobile application effectively',
    icon: Smartphone,
    duration: 60,
    difficulty: 'beginner',
    prerequisites: [],
    topics: [
      {
        id: 'app_setup',
        title: 'Mobile App Setup and Login',
        type: 'video',
        duration: 15,
        content: {
          videoUrl: '/training/videos/mobile-setup.mp4'
        },
        completed: false
      },
      {
        id: 'job_management_mobile',
        title: 'Managing Jobs on Mobile',
        type: 'simulation',
        duration: 25,
        content: {
          type: 'mobile_job_demo'
        },
        completed: false
      },
      {
        id: 'photo_documentation',
        title: 'Photo Documentation and Reporting',
        type: 'interactive',
        duration: 15,
        content: {
          type: 'photo_capture_tutorial'
        },
        completed: false
      },
      {
        id: 'offline_capabilities',
        title: 'Working Offline',
        type: 'reading',
        duration: 5,
        content: {
          features: ['Offline job access', 'Data synchronization', 'Cached maps']
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'true_false',
          question: 'The mobile app can work offline and sync data when connection is restored.',
          correctAnswer: true,
          explanation: 'Yes, the mobile app has full offline capabilities with automatic sync.',
          points: 10
        }
      ],
      passingScore: 75,
      timeLimit: 30,
      attempts: 3
    }
  },
  {
    module: 'reporting_analytics',
    title: 'Advanced Reporting & Analytics',
    description: 'Generate insights and reports for business optimization',
    icon: BarChart3,
    duration: 95,
    difficulty: 'advanced',
    prerequisites: ['mobile_app'],
    topics: [
      {
        id: 'dashboard_customization',
        title: 'Customizing Your Analytics Dashboard',
        type: 'interactive',
        duration: 25,
        content: {
          type: 'dashboard_builder'
        },
        completed: false
      },
      {
        id: 'kpi_tracking',
        title: 'Key Performance Indicators for Concrete Cutting',
        type: 'reading',
        duration: 20,
        content: {
          kpis: ['Equipment utilization', 'Crew productivity', 'Project profitability', 'Customer satisfaction']
        },
        completed: false
      },
      {
        id: 'custom_reports',
        title: 'Building Custom Reports',
        type: 'simulation',
        duration: 30,
        content: {
          type: 'report_builder_demo'
        },
        completed: false
      },
      {
        id: 'predictive_analytics',
        title: 'Predictive Analytics for Business Growth',
        type: 'video',
        duration: 20,
        content: {
          videoUrl: '/training/videos/predictive-analytics.mp4'
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'scenario',
          question: 'You want to analyze which jobs are most profitable. Which report would you create?',
          options: [
            'Job profitability by service type',
            'Customer payment history',
            'Equipment maintenance costs',
            'Employee time tracking'
          ],
          correctAnswer: 0,
          explanation: 'A job profitability report by service type would show which concrete cutting services generate the highest margins.',
          points: 15
        }
      ],
      passingScore: 85,
      timeLimit: 60,
      attempts: 3
    }
  },
  {
    module: 'system_administration',
    title: 'System Administration',
    description: 'Advanced configuration and user management for administrators',
    icon: Settings,
    duration: 110,
    difficulty: 'advanced',
    prerequisites: ['reporting_analytics'],
    topics: [
      {
        id: 'user_management',
        title: 'User Roles and Permissions',
        type: 'interactive',
        duration: 30,
        content: {
          type: 'user_management_demo'
        },
        completed: false
      },
      {
        id: 'workflow_configuration',
        title: 'Configuring Workflows for Concrete Cutting',
        type: 'simulation',
        duration: 35,
        content: {
          type: 'workflow_builder'
        },
        completed: false
      },
      {
        id: 'integration_setup',
        title: 'Third-party Integrations',
        type: 'reading',
        duration: 25,
        content: {
          integrations: ['QuickBooks', 'Sage', 'Weather APIs', 'Equipment manufacturer APIs']
        },
        completed: false
      },
      {
        id: 'backup_security',
        title: 'Data Backup and Security',
        type: 'video',
        duration: 20,
        content: {
          videoUrl: '/training/videos/backup-security.mp4'
        },
        completed: false
      }
    ],
    assessment: {
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is the recommended approach for user permissions in a concrete cutting company?',
          options: [
            'Give everyone full access',
            'Role-based permissions by job function',
            'Restrict access to owners only',
            'Use default settings'
          ],
          correctAnswer: 1,
          explanation: 'Role-based permissions ensure users have appropriate access for their job functions while maintaining security.',
          points: 15
        }
      ],
      passingScore: 90,
      timeLimit: 75,
      attempts: 2
    },
    certification: {
      name: 'Pontifex System Administrator',
      level: 'advanced',
      expiryMonths: 24,
      skills: ['User management', 'Workflow configuration', 'System integration', 'Security management']
    }
  }
];

export default function DSMTrainingModules({
  session,
  onSessionUpdate,
  onTrainingComplete
}: DSMTrainingModulesProps) {
  const [currentModule, setCurrentModule] = useState<TrainingModule | null>(null);
  const [currentTopic, setCurrentTopic] = useState<string | null>(null);
  const [trainingProgress, setTrainingProgress] = useState<TrainingModuleProgress>(session.trainingProgress);
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState<{ [key: string]: any }>({});
  const [assessmentScore, setAssessmentScore] = useState<number | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('modules');
  
  const { toast } = useToast();

  const updateTrainingProgress = useCallback((updates: Partial<TrainingModuleProgress>) => {
    const newProgress = { ...trainingProgress, ...updates };
    setTrainingProgress(newProgress);
    
    const updatedSession = {
      ...session,
      trainingProgress: newProgress,
      lastActiveAt: new Date()
    };
    
    onSessionUpdate(updatedSession);
  }, [trainingProgress, session, onSessionUpdate]);

  const isModuleUnlocked = useCallback((module: TrainingModule) => {
    const moduleConfig = TRAINING_MODULES.find(m => m.module === module);
    if (!moduleConfig) return false;
    
    return moduleConfig.prerequisites.every(prereq => 
      trainingProgress.completedModules.includes(prereq)
    );
  }, [trainingProgress.completedModules]);

  const getModuleProgress = useCallback((module: TrainingModule) => {
    // This would typically come from the session data
    // For demo purposes, we'll calculate based on completed topics
    return Math.floor(Math.random() * 100);
  }, []);

  const startModule = useCallback((module: TrainingModule) => {
    if (!isModuleUnlocked(module)) {
      toast({
        title: "Module Locked",
        description: "Complete prerequisite modules first.",
        variant: "destructive"
      });
      return;
    }
    
    setCurrentModule(module);
    const moduleConfig = TRAINING_MODULES.find(m => m.module === module);
    if (moduleConfig && moduleConfig.topics.length > 0) {
      setCurrentTopic(moduleConfig.topics[0].id);
    }
    setAssessmentMode(false);
    setActiveTab('learning');
  }, [isModuleUnlocked, toast]);

  const completeModule = useCallback((module: TrainingModule) => {
    if (!trainingProgress.completedModules.includes(module)) {
      const newCompletedModules = [...trainingProgress.completedModules, module];
      const newProgress = (newCompletedModules.length / TRAINING_MODULES.length) * 100;
      
      updateTrainingProgress({
        completedModules: newCompletedModules,
        overallProgress: newProgress
      });
      
      toast({
        title: "Module Completed!",
        description: `You've successfully completed ${module.replace('_', ' ')}`,
      });
      
      // Check if all modules are complete
      if (newCompletedModules.length === TRAINING_MODULES.length) {
        onTrainingComplete({
          ...session,
          trainingProgress: {
            ...trainingProgress,
            completedModules: newCompletedModules,
            overallProgress: 100,
            status: 'completed'
          }
        });
      }
    }
  }, [trainingProgress, updateTrainingProgress, toast, onTrainingComplete, session]);

  const startAssessment = useCallback(() => {
    setAssessmentMode(true);
    setAssessmentAnswers({});
    setAssessmentScore(null);
  }, []);

  const submitAssessment = useCallback(() => {
    const moduleConfig = TRAINING_MODULES.find(m => m.module === currentModule);
    if (!moduleConfig) return;
    
    let totalPoints = 0;
    let earnedPoints = 0;
    
    moduleConfig.assessment.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = assessmentAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });
    
    const score = (earnedPoints / totalPoints) * 100;
    setAssessmentScore(score);
    
    if (score >= moduleConfig.assessment.passingScore) {
      completeModule(currentModule!);
      
      // Award certification if available
      if (moduleConfig.certification) {
        const certification: Certification = {
          id: `cert_${Date.now()}`,
          name: moduleConfig.certification.name,
          module: currentModule!,
          issuedDate: new Date(),
          expiryDate: moduleConfig.certification.expiryMonths 
            ? new Date(Date.now() + moduleConfig.certification.expiryMonths * 30 * 24 * 60 * 60 * 1000)
            : undefined,
          level: moduleConfig.certification.level,
          skills: moduleConfig.certification.skills,
          verificationCode: `PONTIFEX-${Date.now().toString(36).toUpperCase()}`
        };
        
        updateTrainingProgress({
          certifications: [...trainingProgress.certifications, certification]
        });
        
        toast({
          title: "Certification Earned!",
          description: `You've earned the ${certification.name} certification`,
        });
      }
    } else {
      toast({
        title: "Assessment Failed",
        description: `Score: ${Math.round(score)}%. You need ${moduleConfig.assessment.passingScore}% to pass.`,
        variant: "destructive"
      });
    }
  }, [currentModule, assessmentAnswers, completeModule, updateTrainingProgress, trainingProgress.certifications, toast]);

  const renderModulesOverview = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5" />
            Training Progress Overview
          </CardTitle>
          <CardDescription>
            Master the Pontifex platform with comprehensive training modules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(trainingProgress.overallProgress)}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {trainingProgress.completedModules.length}
              </div>
              <div className="text-sm text-gray-600">Modules Complete</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {trainingProgress.certifications.length}
              </div>
              <div className="text-sm text-gray-600">Certifications</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(trainingProgress.totalTimeSpent / 60)}
              </div>
              <div className="text-sm text-gray-600">Hours Spent</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Training Progress</span>
              <span>{Math.round(trainingProgress.overallProgress)}%</span>
            </div>
            <Progress value={trainingProgress.overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Module Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TRAINING_MODULES.map((moduleConfig) => {
          const isCompleted = trainingProgress.completedModules.includes(moduleConfig.module);
          const isUnlocked = isModuleUnlocked(moduleConfig.module);
          const progress = getModuleProgress(moduleConfig.module);

          return (
            <Card
              key={moduleConfig.module}
              className={`cursor-pointer transition-all ${
                isUnlocked ? 'hover:shadow-lg' : 'opacity-60'
              } ${isCompleted ? 'border-green-200 bg-green-50' : ''}`}
              onClick={() => isUnlocked && startModule(moduleConfig.module)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-2 rounded-lg ${
                    isCompleted ? 'bg-green-100' :
                    isUnlocked ? 'bg-blue-100' :
                    'bg-gray-100'
                  }`}>
                    <moduleConfig.icon className={`h-6 w-6 ${
                      isCompleted ? 'text-green-600' :
                      isUnlocked ? 'text-blue-600' :
                      'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <Badge variant={
                      isCompleted ? 'default' :
                      isUnlocked ? 'secondary' :
                      'outline'
                    }>
                      {isCompleted ? 'Complete' :
                       isUnlocked ? 'Available' :
                       'Locked'}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {moduleConfig.difficulty}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{moduleConfig.title}</CardTitle>
                <CardDescription>{moduleConfig.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Duration: {moduleConfig.duration}min</span>
                    <span>{moduleConfig.topics.length} topics</span>
                  </div>
                  
                  {isUnlocked && !isCompleted && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                  
                  {moduleConfig.prerequisites.length > 0 && (
                    <div className="text-xs text-gray-600">
                      Prerequisites: {moduleConfig.prerequisites.map(p => 
                        p.replace('_', ' ')).join(', ')}
                    </div>
                  )}
                  
                  {moduleConfig.certification && (
                    <div className="flex items-center gap-1 text-xs text-purple-600">
                      <Award className="h-3 w-3" />
                      Certification Available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderCurrentModule = () => {
    if (!currentModule) return null;
    
    const moduleConfig = TRAINING_MODULES.find(m => m.module === currentModule);
    if (!moduleConfig) return null;
    
    if (assessmentMode) {
      return renderAssessment(moduleConfig);
    }
    
    return renderModuleContent(moduleConfig);
  };

  const renderModuleContent = (moduleConfig: ModuleContent) => {
    const currentTopicData = moduleConfig.topics.find(t => t.id === currentTopic);
    
    return (
      <div className="space-y-6">
        {/* Module Header */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <moduleConfig.icon className="h-6 w-6" />
                  {moduleConfig.title}
                </CardTitle>
                <CardDescription>{moduleConfig.description}</CardDescription>
              </div>
              <Button variant="outline" onClick={() => setCurrentModule(null)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Modules
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Topic Navigation */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {moduleConfig.topics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentTopic === topic.id 
                        ? 'bg-blue-100 border-blue-300' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setCurrentTopic(topic.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        topic.completed ? 'bg-green-500 text-white' : 'bg-gray-300'
                      }`}>
                        {topic.completed ? <CheckCircle className="h-3 w-3" /> : index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">{topic.title}</div>
                        <div className="text-xs text-gray-600">{topic.duration}min</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="pt-3 border-t">
                  <Button 
                    onClick={startAssessment}
                    className="w-full"
                    variant="outline"
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Take Assessment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Area */}
          <Card className="lg:col-span-3">
            <CardContent className="p-6">
              {currentTopicData && renderTopicContent(currentTopicData)}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const renderTopicContent = (topic: Topic) => {
    switch (topic.type) {
      case 'video':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">{topic.title}</h3>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">{topic.duration} minutes</span>
              </div>
            </div>
            
            <div className="aspect-video bg-gray-900 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Play className="h-16 w-16 text-white mx-auto mb-4" />
                <p className="text-white">Video: {topic.title}</p>
                <p className="text-gray-300 text-sm mt-2">Training video content would play here</p>
              </div>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline">
                <Volume2 className="h-4 w-4 mr-2" />
                Audio Transcript
              </Button>
              <Button>
                Mark Complete
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 'interactive':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{topic.title}</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <Brain className="h-16 w-16 text-blue-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">Interactive Learning Module</h4>
              <p className="text-gray-600 mb-4">
                This would be an interactive tutorial or simulation
              </p>
              <Button>
                <Play className="h-4 w-4 mr-2" />
                Start Interactive Session
              </Button>
            </div>
          </div>
        );
        
      case 'reading':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{topic.title}</h3>
            <div className="prose max-w-none">
              <p className="text-gray-600 leading-relaxed">
                This section would contain detailed reading material about {topic.title.toLowerCase()}.
                The content would be comprehensive and specifically tailored for concrete cutting professionals
                transitioning from DSM to Pontifex Industries platform.
              </p>
              
              <h4 className="text-lg font-semibold mt-6 mb-3">Key Points:</h4>
              <ul className="list-disc pl-6 space-y-2">
                <li>Understanding the new workflow processes</li>
                <li>Leveraging advanced features not available in DSM</li>
                <li>Best practices for implementation</li>
                <li>Common pitfalls and how to avoid them</li>
              </ul>
              
              <Alert className="mt-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Take notes as you read. Key concepts will be tested in the assessment.
                </AlertDescription>
              </Alert>
            </div>
            
            <div className="flex justify-end">
              <Button>
                Mark as Read
                <CheckCircle className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
        
      case 'simulation':
        return (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">{topic.title}</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
              <Wrench className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h4 className="text-lg font-medium mb-2">Hands-on Simulation</h4>
              <p className="text-gray-600 mb-4">
                Practice real-world scenarios in a safe environment
              </p>
              <Button className="bg-green-600 hover:bg-green-700">
                <Zap className="h-4 w-4 mr-2" />
                Launch Simulation
              </Button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Content type not implemented: {topic.type}</p>
          </div>
        );
    }
  };

  const renderAssessment = (moduleConfig: ModuleContent) => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Assessment: {moduleConfig.title}</CardTitle>
              <CardDescription>
                Passing score: {moduleConfig.assessment.passingScore}% • 
                Time limit: {moduleConfig.assessment.timeLimit} minutes • 
                Attempts allowed: {moduleConfig.assessment.attempts}
              </CardDescription>
            </div>
            <Button variant="outline" onClick={() => setAssessmentMode(false)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Module
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-6">
          {assessmentScore === null ? (
            <div className="space-y-6">
              {moduleConfig.assessment.questions.map((question, index) => (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-3">{question.question}</h4>
                      
                      {question.type === 'multiple_choice' && question.options && (
                        <RadioGroup
                          value={assessmentAnswers[question.id]?.toString()}
                          onValueChange={(value) => setAssessmentAnswers(prev => ({
                            ...prev,
                            [question.id]: parseInt(value)
                          }))}
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                              <Label htmlFor={`${question.id}-${optionIndex}`} className="cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                      
                      {question.type === 'true_false' && (
                        <RadioGroup
                          value={assessmentAnswers[question.id]?.toString()}
                          onValueChange={(value) => setAssessmentAnswers(prev => ({
                            ...prev,
                            [question.id]: value === 'true'
                          }))}
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="true" id={`${question.id}-true`} />
                            <Label htmlFor={`${question.id}-true`} className="cursor-pointer">True</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="false" id={`${question.id}-false`} />
                            <Label htmlFor={`${question.id}-false`} className="cursor-pointer">False</Label>
                          </div>
                        </RadioGroup>
                      )}
                      
                      {question.type === 'scenario' && question.options && (
                        <RadioGroup
                          value={assessmentAnswers[question.id]?.toString()}
                          onValueChange={(value) => setAssessmentAnswers(prev => ({
                            ...prev,
                            [question.id]: parseInt(value)
                          }))}
                        >
                          {question.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center space-x-2">
                              <RadioGroupItem value={optionIndex.toString()} id={`${question.id}-${optionIndex}`} />
                              <Label htmlFor={`${question.id}-${optionIndex}`} className="cursor-pointer">
                                {option}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-end pt-6 border-t">
                <Button onClick={submitAssessment} className="bg-green-600 hover:bg-green-700">
                  Submit Assessment
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                assessmentScore >= moduleConfig.assessment.passingScore 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-red-100 text-red-600'
              }`}>
                {assessmentScore >= moduleConfig.assessment.passingScore ? (
                  <CheckCircle className="h-8 w-8" />
                ) : (
                  <AlertTriangle className="h-8 w-8" />
                )}
              </div>
              
              <h3 className="text-2xl font-bold mb-2">
                {assessmentScore >= moduleConfig.assessment.passingScore ? 'Congratulations!' : 'Try Again'}
              </h3>
              
              <p className="text-gray-600 mb-4">
                You scored {Math.round(assessmentScore)}% 
                {assessmentScore >= moduleConfig.assessment.passingScore 
                  ? ' and passed the assessment!' 
                  : ` but need ${moduleConfig.assessment.passingScore}% to pass.`}
              </p>
              
              <div className="space-y-4">
                {moduleConfig.assessment.questions.map((question, index) => (
                  <div key={question.id} className="text-left p-4 border rounded-lg">
                    <div className="flex items-start gap-2 mb-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                        assessmentAnswers[question.id] === question.correctAnswer 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {assessmentAnswers[question.id] === question.correctAnswer ? '✓' : '✗'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{question.question}</div>
                        {assessmentAnswers[question.id] !== question.correctAnswer && (
                          <div className="mt-2 text-sm text-gray-600">
                            <div className="font-medium">Explanation:</div>
                            {question.explanation}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-center gap-4 mt-6">
                <Button variant="outline" onClick={() => setAssessmentMode(false)}>
                  Back to Module
                </Button>
                {assessmentScore < moduleConfig.assessment.passingScore && (
                  <Button onClick={() => setAssessmentScore(null)}>
                    Retake Assessment
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderCertifications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Your Certifications
          </CardTitle>
          <CardDescription>
            Industry-recognized certifications earned through training completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trainingProgress.certifications.length === 0 ? (
            <div className="text-center py-8">
              <Award className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Certifications Yet</h3>
              <p className="text-gray-600">Complete training modules to earn certifications</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {trainingProgress.certifications.map((cert) => (
                <Card key={cert.id} className="border-2 border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-yellow-800">{cert.name}</CardTitle>
                        <CardDescription>
                          Module: {cert.module.replace('_', ' ')}
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {cert.level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="text-sm">
                        <div className="font-medium">Issued:</div>
                        <div className="text-gray-600">{cert.issuedDate.toLocaleDateString()}</div>
                      </div>
                      
                      {cert.expiryDate && (
                        <div className="text-sm">
                          <div className="font-medium">Expires:</div>
                          <div className="text-gray-600">{cert.expiryDate.toLocaleDateString()}</div>
                        </div>
                      )}
                      
                      <div className="text-sm">
                        <div className="font-medium">Verification Code:</div>
                        <div className="font-mono text-xs bg-white p-2 rounded border">
                          {cert.verificationCode}
                        </div>
                      </div>
                      
                      <div className="text-sm">
                        <div className="font-medium">Skills Validated:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {cert.skills.map((skill, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <Button variant="outline" className="w-full mt-4">
                        <Download className="h-4 w-4 mr-2" />
                        Download Certificate
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">DSM to Pontifex Training</h2>
        <p className="text-gray-600">
          Comprehensive training modules designed for concrete cutting professionals
        </p>
      </div>

      {currentModule ? (
        renderCurrentModule()
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="modules">Training Modules</TabsTrigger>
            <TabsTrigger value="certifications">Certifications</TabsTrigger>
          </TabsList>

          <TabsContent value="modules">
            {renderModulesOverview()}
          </TabsContent>

          <TabsContent value="certifications">
            {renderCertifications()}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}