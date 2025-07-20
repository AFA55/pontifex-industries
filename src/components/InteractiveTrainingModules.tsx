'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { 
  BookOpen,
  Play,
  Pause,
  CheckCircle,
  Award,
  Clock,
  Target,
  Users,
  Shield,
  Wrench,
  Camera,
  Volume2,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  Star,
  Brain,
  Monitor,
  Smartphone,
  HardHat,
  Zap,
  TrendingUp,
  FileText,
  Video,
  Headphones,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  Lightbulb,
  AlertTriangle,
  Database,
  Calendar,
  Settings
} from 'lucide-react';
import { 
  TrainingModule,
  TrainingProgress,
  AssessmentScore,
  Certification,
  TutoringSession,
  LearningPath
} from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';

interface InteractiveTrainingModulesProps {
  userId: string;
  companyId: string;
  trainingProgress: TrainingProgress;
  onProgressUpdate: (progress: TrainingProgress) => void;
  onModuleComplete: (module: TrainingModule, score: number) => void;
}

interface ModuleContent {
  module: TrainingModule;
  title: string;
  description: string;
  icon: any;
  estimatedTime: number; // minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'essential' | 'operational' | 'advanced' | 'safety' | 'admin';
  prerequisites: TrainingModule[];
  sections: TrainingSection[];
  assessment: ModuleAssessment;
  practicalExercise?: PracticalExercise;
  certification?: CertificationInfo;
}

interface TrainingSection {
  id: string;
  title: string;
  type: 'video' | 'interactive' | 'reading' | 'simulation' | 'quiz';
  content: SectionContent;
  duration: number; // minutes
  required: boolean;
}

interface SectionContent {
  videoUrl?: string;
  transcript?: string;
  interactiveDemo?: InteractiveDemo;
  readingMaterial?: ReadingMaterial;
  simulation?: Simulation;
  quiz?: QuizContent;
}

interface InteractiveDemo {
  title: string;
  description: string;
  steps: DemoStep[];
  screenshots: string[];
  clickableAreas: ClickableArea[];
}

interface DemoStep {
  step: number;
  title: string;
  instruction: string;
  screenshot: string;
  highlightArea?: { x: number; y: number; width: number; height: number };
  tooltip?: string;
}

interface ClickableArea {
  x: number;
  y: number;
  width: number;
  height: number;
  action: string;
  tooltip: string;
  nextStep?: number;
}

interface ReadingMaterial {
  title: string;
  content: string;
  keyPoints: string[];
  additionalResources: Resource[];
}

interface Resource {
  title: string;
  type: 'pdf' | 'link' | 'video' | 'document';
  url: string;
  description: string;
}

interface Simulation {
  title: string;
  scenario: string;
  objectives: string[];
  interface: SimulationInterface;
  steps: SimulationStep[];
  successCriteria: string[];
}

interface SimulationInterface {
  type: 'mobile_app' | 'desktop' | 'equipment_control';
  mockData: any;
  availableActions: SimulationAction[];
}

interface SimulationAction {
  id: string;
  label: string;
  type: 'click' | 'input' | 'selection' | 'drag';
  element: string;
  validation?: (value: any) => boolean;
}

interface SimulationStep {
  step: number;
  instruction: string;
  expectedAction: string;
  hint?: string;
  feedback: {
    correct: string;
    incorrect: string;
  };
}

interface QuizContent {
  questions: QuizQuestion[];
  passingScore: number;
  timeLimit?: number; // minutes
  allowRetakes: boolean;
  maxAttempts: number;
}

interface QuizQuestion {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'scenario' | 'drag_drop';
  question: string;
  image?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  category: string;
}

interface ModuleAssessment {
  type: 'quiz' | 'practical' | 'mixed';
  questions: QuizQuestion[];
  practicalTasks?: PracticalTask[];
  passingScore: number;
  timeLimit: number; // minutes
  certificateEligible: boolean;
}

interface PracticalTask {
  id: string;
  title: string;
  description: string;
  steps: string[];
  tools: string[];
  expectedOutcome: string;
  evaluationCriteria: EvaluationCriteria[];
}

interface EvaluationCriteria {
  criterion: string;
  weight: number; // percentage
  description: string;
  scoringRubric: ScoringLevel[];
}

interface ScoringLevel {
  level: 'excellent' | 'good' | 'satisfactory' | 'needs_improvement';
  score: number;
  description: string;
}

interface PracticalExercise {
  title: string;
  scenario: string;
  tasks: PracticalTask[];
  equipment: string[];
  timeLimit: number; // minutes
  submissionFormat: 'photos' | 'video' | 'report' | 'checklist';
}

interface CertificationInfo {
  name: string;
  level: 'basic' | 'intermediate' | 'advanced' | 'expert';
  validityPeriod: number; // months
  renewalRequired: boolean;
  industryRecognition: string[];
}

const TRAINING_MODULES: ModuleContent[] = [
  {
    module: 'platform_overview',
    title: 'Pontifex Platform Overview',
    description: 'Introduction to the Pontifex Industries platform and its advantages over DSM',
    icon: Monitor,
    estimatedTime: 20,
    difficulty: 'beginner',
    category: 'essential',
    prerequisites: [],
    sections: [
      {
        id: 'welcome_video',
        title: 'Welcome to Pontifex',
        type: 'video',
        content: {
          videoUrl: '/training/videos/platform-overview.mp4',
          transcript: 'Welcome to Pontifex Industries...'
        },
        duration: 5,
        required: true
      },
      {
        id: 'platform_tour',
        title: 'Interactive Platform Tour',
        type: 'interactive',
        content: {
          interactiveDemo: {
            title: 'Navigate the Dashboard',
            description: 'Learn to navigate the main dashboard and key features',
            steps: [
              {
                step: 1,
                title: 'Dashboard Overview',
                instruction: 'This is your main dashboard with real-time data',
                screenshot: '/training/screenshots/dashboard.png',
                highlightArea: { x: 0, y: 0, width: 100, height: 100 }
              }
            ],
            screenshots: ['/training/screenshots/dashboard.png'],
            clickableAreas: []
          }
        },
        duration: 10,
        required: true
      },
      {
        id: 'key_differences',
        title: 'Key Differences from DSM',
        type: 'reading',
        content: {
          readingMaterial: {
            title: 'Pontifex vs DSM: What\'s Different',
            content: 'Pontifex offers several key advantages over DSM Software...',
            keyPoints: [
              'Real-time analytics vs static reporting',
              'Mobile-first design for field crews',
              'Integrated safety compliance monitoring',
              'Advanced equipment tracking with beacons',
              'Automated workflow optimization'
            ],
            additionalResources: []
          }
        },
        duration: 5,
        required: true
      }
    ],
    assessment: {
      type: 'quiz',
      questions: [
        {
          id: 'q1',
          type: 'multiple_choice',
          question: 'What is a key advantage of Pontifex over DSM Software?',
          options: [
            'Static reporting capabilities',
            'Real-time analytics and live data',
            'Basic time tracking',
            'Limited mobile access'
          ],
          correctAnswer: 'Real-time analytics and live data',
          explanation: 'Pontifex provides real-time analytics while DSM relies on static reports',
          points: 10,
          category: 'platform_knowledge'
        }
      ],
      passingScore: 80,
      timeLimit: 10,
      certificateEligible: false
    }
  },
  {
    module: 'navigation_basics',
    title: 'Navigation and Interface Basics',
    description: 'Master the Pontifex interface and navigation for efficient daily use',
    icon: Target,
    estimatedTime: 25,
    difficulty: 'beginner',
    category: 'essential',
    prerequisites: ['platform_overview'],
    sections: [
      {
        id: 'interface_basics',
        title: 'Interface Components',
        type: 'interactive',
        content: {
          interactiveDemo: {
            title: 'Interface Elements',
            description: 'Learn about menus, navigation, and key interface elements',
            steps: [],
            screenshots: [],
            clickableAreas: []
          }
        },
        duration: 15,
        required: true
      },
      {
        id: 'navigation_practice',
        title: 'Navigation Practice',
        type: 'simulation',
        content: {
          simulation: {
            title: 'Practice Navigation',
            scenario: 'Navigate through different sections of the platform',
            objectives: [
              'Access the job management section',
              'View customer information',
              'Check equipment status',
              'Review safety compliance'
            ],
            interface: {
              type: 'desktop',
              mockData: {},
              availableActions: []
            },
            steps: [],
            successCriteria: ['All navigation tasks completed successfully']
          }
        },
        duration: 10,
        required: true
      }
    ],
    assessment: {
      type: 'practical',
      questions: [],
      practicalTasks: [
        {
          id: 'nav_task_1',
          title: 'Navigate to Job Management',
          description: 'Use the navigation menu to access job management features',
          steps: [
            'Click on the main menu',
            'Select "Jobs" from the menu',
            'View the job dashboard'
          ],
          tools: ['Pontifex Platform'],
          expectedOutcome: 'Successfully access job management dashboard',
          evaluationCriteria: [
            {
              criterion: 'Navigation Efficiency',
              weight: 50,
              description: 'Ability to navigate quickly and directly',
              scoringRubric: [
                {
                  level: 'excellent',
                  score: 100,
                  description: 'Navigated directly without hesitation'
                },
                {
                  level: 'good',
                  score: 80,
                  description: 'Minor hesitation but correct path'
                }
              ]
            }
          ]
        }
      ],
      passingScore: 75,
      timeLimit: 15,
      certificateEligible: false
    }
  },
  {
    module: 'job_creation',
    title: 'Creating and Managing Jobs',
    description: 'Learn to create, schedule, and manage concrete cutting jobs efficiently',
    icon: FileText,
    estimatedTime: 45,
    difficulty: 'intermediate',
    category: 'operational',
    prerequisites: ['navigation_basics'],
    sections: [
      {
        id: 'job_creation_basics',
        title: 'Job Creation Fundamentals',
        type: 'video',
        content: {
          videoUrl: '/training/videos/job-creation.mp4',
          transcript: 'Learn how to create a new job in Pontifex...'
        },
        duration: 15,
        required: true
      },
      {
        id: 'concrete_work_types',
        title: 'Concrete Cutting Work Types',
        type: 'reading',
        content: {
          readingMaterial: {
            title: 'Understanding Concrete Cutting Services',
            content: 'Pontifex supports all major concrete cutting services...',
            keyPoints: [
              'Core drilling for utilities and anchoring',
              'Wall sawing for openings and modifications',
              'Slab sawing for expansion joints and removals',
              'Wire sawing for large structural elements',
              'Specialized cutting techniques'
            ],
            additionalResources: []
          }
        },
        duration: 10,
        required: true
      },
      {
        id: 'job_creation_practice',
        title: 'Hands-on Job Creation',
        type: 'simulation',
        content: {
          simulation: {
            title: 'Create a Core Drilling Job',
            scenario: 'A customer needs core drilling for a new HVAC installation',
            objectives: [
              'Create a new job record',
              'Set up core drilling work type',
              'Schedule equipment and crew',
              'Add safety requirements'
            ],
            interface: {
              type: 'desktop',
              mockData: {
                customer: 'ABC Construction',
                location: '123 Main St, Boston, MA',
                workType: 'core_drilling'
              },
              availableActions: []
            },
            steps: [],
            successCriteria: ['Job created with all required information']
          }
        },
        duration: 20,
        required: true
      }
    ],
    assessment: {
      type: 'mixed',
      questions: [
        {
          id: 'job_q1',
          type: 'scenario',
          question: 'A customer calls requesting core drilling for 20 holes, 4" diameter, 12" deep in a concrete slab. What work type would you select?',
          correctAnswer: 'core_drilling',
          explanation: 'Core drilling is the appropriate work type for creating precise round holes',
          points: 15,
          category: 'work_types'
        }
      ],
      practicalTasks: [
        {
          id: 'create_job_task',
          title: 'Create Complete Job Record',
          description: 'Create a comprehensive job record for a wall sawing project',
          steps: [
            'Enter customer information',
            'Set up work specifications',
            'Schedule crew and equipment',
            'Add safety requirements',
            'Set pricing and timeline'
          ],
          tools: ['Pontifex Platform'],
          expectedOutcome: 'Complete job record ready for dispatch',
          evaluationCriteria: []
        }
      ],
      passingScore: 85,
      timeLimit: 30,
      certificateEligible: true
    },
    certification: {
      name: 'Pontifex Job Management Specialist',
      level: 'basic',
      validityPeriod: 12,
      renewalRequired: false,
      industryRecognition: ['Concrete Cutting Industry']
    }
  },
  {
    module: 'safety_compliance',
    title: 'Safety Compliance and OSHA Requirements',
    description: 'Master safety compliance features including silica monitoring and incident reporting',
    icon: Shield,
    estimatedTime: 60,
    difficulty: 'intermediate',
    category: 'safety',
    prerequisites: ['job_creation'],
    sections: [
      {
        id: 'osha_overview',
        title: 'OSHA Compliance Overview',
        type: 'video',
        content: {
          videoUrl: '/training/videos/osha-compliance.mp4',
          transcript: 'Understanding OSHA requirements for concrete cutting...'
        },
        duration: 20,
        required: true
      },
      {
        id: 'silica_monitoring',
        title: 'Silica Exposure Monitoring',
        type: 'interactive',
        content: {
          interactiveDemo: {
            title: 'Silica Monitoring System',
            description: 'Learn to use the automated silica monitoring features',
            steps: [],
            screenshots: [],
            clickableAreas: []
          }
        },
        duration: 25,
        required: true
      },
      {
        id: 'incident_reporting',
        title: 'Incident Reporting and Management',
        type: 'simulation',
        content: {
          simulation: {
            title: 'Report a Safety Incident',
            scenario: 'A crew member experiences minor dust exposure during cutting',
            objectives: [
              'Create incident report',
              'Document exposure details',
              'Notify appropriate personnel',
              'Implement corrective actions'
            ],
            interface: {
              type: 'mobile_app',
              mockData: {},
              availableActions: []
            },
            steps: [],
            successCriteria: ['Incident properly documented and reported']
          }
        },
        duration: 15,
        required: true
      }
    ],
    assessment: {
      type: 'mixed',
      questions: [
        {
          id: 'safety_q1',
          type: 'multiple_choice',
          question: 'What is the OSHA permissible exposure limit (PEL) for crystalline silica?',
          options: ['0.025 mg/m³', '0.05 mg/m³', '0.075 mg/m³', '0.1 mg/m³'],
          correctAnswer: '0.05 mg/m³',
          explanation: 'OSHA\'s respirable crystalline silica standard sets the PEL at 50 micrograms per cubic meter',
          points: 20,
          category: 'safety_regulations'
        }
      ],
      passingScore: 90,
      timeLimit: 45,
      certificateEligible: true
    },
    certification: {
      name: 'Pontifex Safety Compliance Certified',
      level: 'intermediate',
      validityPeriod: 12,
      renewalRequired: true,
      industryRecognition: ['OSHA', 'Construction Industry Safety']
    }
  },
  {
    module: 'mobile_app_usage',
    title: 'Mobile App for Field Operations',
    description: 'Master the mobile app for time tracking, job updates, and field documentation',
    icon: Smartphone,
    estimatedTime: 35,
    difficulty: 'beginner',
    category: 'operational',
    prerequisites: ['navigation_basics'],
    sections: [
      {
        id: 'mobile_setup',
        title: 'Mobile App Setup',
        type: 'video',
        content: {
          videoUrl: '/training/videos/mobile-setup.mp4',
          transcript: 'Setting up the Pontifex mobile app...'
        },
        duration: 10,
        required: true
      },
      {
        id: 'field_operations',
        title: 'Field Operations Workflow',
        type: 'simulation',
        content: {
          simulation: {
            title: 'Complete a Field Job',
            scenario: 'Use the mobile app to complete a slab sawing job from start to finish',
            objectives: [
              'Clock in to the job',
              'Update job status',
              'Document work progress',
              'Submit completion photos',
              'Clock out and submit timesheet'
            ],
            interface: {
              type: 'mobile_app',
              mockData: {},
              availableActions: []
            },
            steps: [],
            successCriteria: ['Job completed with full documentation']
          }
        },
        duration: 20,
        required: true
      },
      {
        id: 'offline_capabilities',
        title: 'Working Offline',
        type: 'reading',
        content: {
          readingMaterial: {
            title: 'Offline Mode and Data Sync',
            content: 'The mobile app works offline and syncs when connectivity returns...',
            keyPoints: [
              'Time tracking works without internet',
              'Job updates cached locally',
              'Photos stored until sync',
              'Automatic sync when connected'
            ],
            additionalResources: []
          }
        },
        duration: 5,
        required: true
      }
    ],
    assessment: {
      type: 'practical',
      practicalTasks: [
        {
          id: 'mobile_workflow',
          title: 'Complete Mobile Workflow',
          description: 'Demonstrate proficiency with mobile app field operations',
          steps: [
            'Access job from mobile dashboard',
            'Clock in with location verification',
            'Update job progress throughout work',
            'Document completion with photos',
            'Submit timesheet and job completion'
          ],
          tools: ['Pontifex Mobile App'],
          expectedOutcome: 'Complete job workflow executed via mobile app',
          evaluationCriteria: []
        }
      ],
      passingScore: 80,
      timeLimit: 25,
      certificateEligible: false
    }
  },
  {
    module: 'equipment_management',
    title: 'Equipment Tracking and Management',
    description: 'Learn to track equipment, schedule maintenance, and monitor utilization',
    icon: Wrench,
    estimatedTime: 40,
    difficulty: 'intermediate',
    category: 'operational',
    prerequisites: ['job_creation'],
    sections: [
      {
        id: 'asset_registration',
        title: 'Equipment Registration',
        type: 'interactive',
        content: {
          interactiveDemo: {
            title: 'Register New Equipment',
            description: 'Learn to add equipment to the asset tracking system',
            steps: [],
            screenshots: [],
            clickableAreas: []
          }
        },
        duration: 15,
        required: true
      },
      {
        id: 'beacon_setup',
        title: 'Bluetooth Beacon Setup',
        type: 'video',
        content: {
          videoUrl: '/training/videos/beacon-setup.mp4',
          transcript: 'Setting up Bluetooth beacons for real-time tracking...'
        },
        duration: 10,
        required: true
      },
      {
        id: 'maintenance_scheduling',
        title: 'Maintenance Management',
        type: 'simulation',
        content: {
          simulation: {
            title: 'Schedule Equipment Maintenance',
            scenario: 'A core drill requires its 500-hour maintenance service',
            objectives: [
              'Review maintenance history',
              'Schedule maintenance appointment',
              'Assign maintenance tasks',
              'Update equipment status'
            ],
            interface: {
              type: 'desktop',
              mockData: {},
              availableActions: []
            },
            steps: [],
            successCriteria: ['Maintenance properly scheduled and documented']
          }
        },
        duration: 15,
        required: true
      }
    ],
    assessment: {
      type: 'practical',
      practicalTasks: [
        {
          id: 'equipment_setup',
          title: 'Complete Equipment Setup',
          description: 'Set up a new piece of equipment with full tracking capabilities',
          steps: [
            'Register equipment in system',
            'Configure maintenance schedule',
            'Assign tracking beacon',
            'Set utilization targets',
            'Configure alerts and notifications'
          ],
          tools: ['Pontifex Platform', 'Bluetooth Beacon'],
          expectedOutcome: 'Equipment fully integrated into tracking system',
          evaluationCriteria: []
        }
      ],
      passingScore: 85,
      timeLimit: 30,
      certificateEligible: true
    }
  },
  {
    module: 'reporting_analytics',
    title: 'Reporting and Analytics',
    description: 'Generate reports, analyze performance data, and create custom dashboards',
    icon: TrendingUp,
    estimatedTime: 50,
    difficulty: 'advanced',
    category: 'advanced',
    prerequisites: ['job_creation', 'equipment_management'],
    sections: [
      {
        id: 'dashboard_customization',
        title: 'Custom Dashboard Setup',
        type: 'interactive',
        content: {
          interactiveDemo: {
            title: 'Build Your Dashboard',
            description: 'Create a custom dashboard with KPIs relevant to your role',
            steps: [],
            screenshots: [],
            clickableAreas: []
          }
        },
        duration: 20,
        required: true
      },
      {
        id: 'report_generation',
        title: 'Report Generation',
        type: 'simulation',
        content: {
          simulation: {
            title: 'Generate Monthly Performance Report',
            scenario: 'Create a comprehensive monthly report for management review',
            objectives: [
              'Select relevant metrics',
              'Configure date ranges',
              'Apply appropriate filters',
              'Export in required format'
            ],
            interface: {
              type: 'desktop',
              mockData: {},
              availableActions: []
            },
            steps: [],
            successCriteria: ['Report generated with accurate data and formatting']
          }
        },
        duration: 20,
        required: true
      },
      {
        id: 'analytics_interpretation',
        title: 'Analytics Interpretation',
        type: 'reading',
        content: {
          readingMaterial: {
            title: 'Understanding Key Performance Indicators',
            content: 'Learn to interpret and act on analytics data...',
            keyPoints: [
              'Equipment utilization rates',
              'Job profitability analysis',
              'Crew productivity metrics',
              'Safety compliance scores',
              'Customer satisfaction trends'
            ],
            additionalResources: []
          }
        },
        duration: 10,
        required: true
      }
    ],
    assessment: {
      type: 'mixed',
      questions: [
        {
          id: 'analytics_q1',
          type: 'scenario',
          question: 'Your equipment utilization report shows 65% average utilization. What actions should you consider?',
          correctAnswer: 'Analyze underutilized equipment, consider reallocation, review maintenance schedules',
          explanation: 'Low utilization may indicate scheduling inefficiencies or excess capacity',
          points: 25,
          category: 'data_interpretation'
        }
      ],
      practicalTasks: [
        {
          id: 'create_dashboard',
          title: 'Create Custom Dashboard',
          description: 'Build a dashboard tailored to your operational needs',
          steps: [
            'Identify key metrics for your role',
            'Configure dashboard widgets',
            'Set up automated alerts',
            'Save and share dashboard'
          ],
          tools: ['Pontifex Analytics'],
          expectedOutcome: 'Functional custom dashboard with relevant KPIs',
          evaluationCriteria: []
        }
      ],
      passingScore: 85,
      timeLimit: 40,
      certificateEligible: true
    },
    certification: {
      name: 'Pontifex Analytics Specialist',
      level: 'advanced',
      validityPeriod: 18,
      renewalRequired: false,
      industryRecognition: ['Business Intelligence', 'Construction Analytics']
    }
  }
];

export default function InteractiveTrainingModules({
  userId,
  companyId,
  trainingProgress,
  onProgressUpdate,
  onModuleComplete
}: InteractiveTrainingModulesProps) {
  const [activeModule, setActiveModule] = useState<TrainingModule | null>(null);
  const [currentSection, setCurrentSection] = useState<string | null>(null);
  const [sectionProgress, setSectionProgress] = useState<{ [key: string]: number }>({});
  const [assessmentMode, setAssessmentMode] = useState(false);
  const [assessmentAnswers, setAssessmentAnswers] = useState<{ [key: string]: any }>({});
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  const { toast } = useToast();

  const availableModules = TRAINING_MODULES.filter(module => {
    const hasPrerequisites = module.prerequisites.every(prereq => 
      trainingProgress.completedModules.includes(prereq)
    );
    return hasPrerequisites;
  });

  const currentModuleContent = activeModule ? 
    TRAINING_MODULES.find(m => m.module === activeModule) : null;

  const currentSectionContent = currentModuleContent && currentSection ?
    currentModuleContent.sections.find(s => s.id === currentSection) : null;

  const startModule = useCallback((module: TrainingModule) => {
    setActiveModule(module);
    setCurrentSection(null);
    setAssessmentMode(false);
    setSessionStartTime(new Date());
    setActiveTab('content');
    
    toast({
      title: "Module Started",
      description: `Started training module: ${TRAINING_MODULES.find(m => m.module === module)?.title}`,
    });
  }, []);

  const startSection = useCallback((sectionId: string) => {
    setCurrentSection(sectionId);
    setSectionProgress(prev => ({ ...prev, [sectionId]: 0 }));
  }, []);

  const completeSection = useCallback((sectionId: string) => {
    setSectionProgress(prev => ({ ...prev, [sectionId]: 100 }));
    
    // Auto-advance to next section or assessment
    if (currentModuleContent) {
      const currentIndex = currentModuleContent.sections.findIndex(s => s.id === sectionId);
      const nextSection = currentModuleContent.sections[currentIndex + 1];
      
      if (nextSection) {
        setTimeout(() => setCurrentSection(nextSection.id), 1000);
      } else {
        // All sections completed, move to assessment
        setTimeout(() => setAssessmentMode(true), 1000);
      }
    }
    
    toast({
      title: "Section Complete",
      description: "Moving to next section...",
    });
  }, [currentModuleContent]);

  const submitAssessment = useCallback(async () => {
    if (!activeModule || !currentModuleContent) return;

    const totalPoints = currentModuleContent.assessment.questions.reduce((sum, q) => sum + q.points, 0);
    let earnedPoints = 0;

    // Calculate score
    currentModuleContent.assessment.questions.forEach(question => {
      const userAnswer = assessmentAnswers[question.id];
      if (userAnswer === question.correctAnswer) {
        earnedPoints += question.points;
      }
    });

    const score = (earnedPoints / totalPoints) * 100;
    const passed = score >= currentModuleContent.assessment.passingScore;

    // Update training progress
    const updatedProgress = {
      ...trainingProgress,
      completedModules: passed ? [...trainingProgress.completedModules, activeModule] : trainingProgress.completedModules,
      assessmentScores: [
        ...trainingProgress.assessmentScores,
        {
          module: activeModule,
          score,
          maxScore: 100,
          attempts: 1,
          passedOn: new Date(),
          timeSpent: sessionStartTime ? (Date.now() - sessionStartTime.getTime()) / (1000 * 60) : 0,
          areasMastered: [],
          areasForImprovement: []
        }
      ],
      timeSpent: trainingProgress.timeSpent + (sessionStartTime ? (Date.now() - sessionStartTime.getTime()) / (1000 * 60) : 0),
      sessionsCompleted: trainingProgress.sessionsCompleted + 1,
      lastActivity: new Date()
    };

    onProgressUpdate(updatedProgress);
    onModuleComplete(activeModule, score);

    // Award certification if eligible
    if (passed && currentModuleContent.certification) {
      const certification: Certification = {
        name: currentModuleContent.certification.name,
        module: activeModule,
        issuedDate: new Date(),
        expiryDate: currentModuleContent.certification.renewalRequired ? 
          new Date(Date.now() + currentModuleContent.certification.validityPeriod * 30 * 24 * 60 * 60 * 1000) : 
          undefined,
        certificateId: `CERT_${Date.now()}_${userId}`,
        level: currentModuleContent.certification.level,
        skills: []
      };

      updatedProgress.certifications = [...trainingProgress.certifications, certification];
      onProgressUpdate(updatedProgress);
    }

    toast({
      title: passed ? "Assessment Passed!" : "Assessment Not Passed",
      description: passed ? 
        `Score: ${Math.round(score)}% - Module completed successfully` :
        `Score: ${Math.round(score)}% - Minimum required: ${currentModuleContent.assessment.passingScore}%`,
      variant: passed ? "default" : "destructive"
    });

    if (passed) {
      setActiveModule(null);
      setActiveTab('overview');
    }
  }, [activeModule, currentModuleContent, assessmentAnswers, trainingProgress, sessionStartTime, onProgressUpdate, onModuleComplete, userId]);

  const renderModuleOverview = () => (
    <div className="space-y-6">
      {/* Progress Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Training Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {trainingProgress.completedModules.length}
              </div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(trainingProgress.progressPercentage)}%
              </div>
              <div className="text-sm text-gray-600">Overall Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {trainingProgress.certifications.length}
              </div>
              <div className="text-sm text-gray-600">Certifications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round(trainingProgress.timeSpent)}
              </div>
              <div className="text-sm text-gray-600">Hours Spent</div>
            </div>
          </div>
          
          <Progress value={trainingProgress.progressPercentage} className="h-3" />
        </CardContent>
      </Card>

      {/* Learning Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            {trainingProgress.learningPath.name}
          </CardTitle>
          <CardDescription>
            {trainingProgress.learningPath.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TRAINING_MODULES.map((module, index) => {
              const isCompleted = trainingProgress.completedModules.includes(module.module);
              const isAvailable = availableModules.some(m => m.module === module.module);
              const hasPrerequisites = module.prerequisites.length > 0;
              
              return (
                <div
                  key={module.module}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    isCompleted ? 'border-green-200 bg-green-50' :
                    isAvailable ? 'border-blue-200 hover:bg-blue-50' :
                    'border-gray-200 bg-gray-50 cursor-not-allowed'
                  }`}
                  onClick={() => isAvailable ? startModule(module.module) : null}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      isCompleted ? 'bg-green-100' :
                      isAvailable ? 'bg-blue-100' :
                      'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <module.icon className={`h-5 w-5 ${
                          isAvailable ? 'text-blue-600' : 'text-gray-400'
                        }`} />
                      )}
                    </div>
                    
                    <div>
                      <div className="font-medium">{module.title}</div>
                      <div className="text-sm text-gray-600">{module.description}</div>
                      <div className="flex items-center gap-4 mt-1">
                        <Badge variant="outline" size="sm">
                          {module.difficulty}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {module.category}
                        </Badge>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {module.estimatedTime} min
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {hasPrerequisites && !isAvailable && (
                      <Badge variant="secondary" size="sm">
                        Prerequisites Required
                      </Badge>
                    )}
                    {module.certification && (
                      <Award className="h-4 w-4 text-yellow-600" />
                    )}
                    <ArrowRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Certifications */}
      {trainingProgress.certifications.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Your Certifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              {trainingProgress.certifications.map((cert, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-2">
                    <Award className="h-6 w-6 text-yellow-600" />
                    <div>
                      <div className="font-medium">{cert.name}</div>
                      <div className="text-sm text-gray-600">
                        Level: {cert.level.charAt(0).toUpperCase() + cert.level.slice(1)}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Issued: {cert.issuedDate.toLocaleDateString()}
                  </div>
                  {cert.expiryDate && (
                    <div className="text-sm text-gray-600">
                      Expires: {cert.expiryDate.toLocaleDateString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderModuleContent = () => {
    if (!currentModuleContent) return null;

    if (assessmentMode) {
      return renderAssessment();
    }

    if (!currentSection) {
      return (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <currentModuleContent.icon className="h-6 w-6" />
                {currentModuleContent.title}
              </CardTitle>
              <CardDescription>
                {currentModuleContent.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <Clock className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">{currentModuleContent.estimatedTime} minutes</div>
                  <div className="text-sm text-gray-600">Estimated Time</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                  <div className="font-medium">{currentModuleContent.difficulty}</div>
                  <div className="text-sm text-gray-600">Difficulty</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <CheckCircle className="h-6 w-6 mx-auto mb-2 text-green-600" />
                  <div className="font-medium">{currentModuleContent.assessment.passingScore}%</div>
                  <div className="text-sm text-gray-600">Passing Score</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium">Module Sections:</h4>
                {currentModuleContent.sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => startSection(section.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        {section.type === 'video' && <Video className="h-4 w-4 text-blue-600" />}
                        {section.type === 'interactive' && <Monitor className="h-4 w-4 text-blue-600" />}
                        {section.type === 'reading' && <FileText className="h-4 w-4 text-blue-600" />}
                        {section.type === 'simulation' && <Brain className="h-4 w-4 text-blue-600" />}
                        {section.type === 'quiz' && <HelpCircle className="h-4 w-4 text-blue-600" />}
                      </div>
                      <div>
                        <div className="font-medium">{section.title}</div>
                        <div className="text-sm text-gray-600">{section.duration} minutes</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {section.required && (
                        <Badge variant="outline" size="sm">Required</Badge>
                      )}
                      <ArrowRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
              
              {currentModuleContent.certification && (
                <Alert className="mt-6">
                  <Award className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Certification Available:</strong> Complete this module to earn the 
                    "{currentModuleContent.certification.name}" certification.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return renderSectionContent();
  };

  const renderSectionContent = () => {
    if (!currentSectionContent) return null;

    const progress = sectionProgress[currentSection!] || 0;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{currentSectionContent.title}</span>
              <Button variant="outline" onClick={() => setCurrentSection(null)}>
                Back to Module
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Section Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {currentSectionContent.type === 'video' && (
              <div className="space-y-4">
                <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600">Video Player</p>
                    <p className="text-sm text-gray-500">{currentSectionContent.content.videoUrl}</p>
                  </div>
                </div>
                
                <div className="flex justify-center gap-4">
                  <Button onClick={() => setSectionProgress(prev => ({ ...prev, [currentSection!]: 100 }))}>
                    <Play className="h-4 w-4 mr-2" />
                    Play Video
                  </Button>
                </div>
                
                {progress === 100 && (
                  <Button onClick={() => completeSection(currentSection!)} className="w-full">
                    Complete Section
                  </Button>
                )}
              </div>
            )}

            {currentSectionContent.type === 'reading' && currentSectionContent.content.readingMaterial && (
              <div className="space-y-4">
                <div className="prose max-w-none">
                  <h3>{currentSectionContent.content.readingMaterial.title}</h3>
                  <p>{currentSectionContent.content.readingMaterial.content}</p>
                  
                  {currentSectionContent.content.readingMaterial.keyPoints.length > 0 && (
                    <div>
                      <h4>Key Points:</h4>
                      <ul>
                        {currentSectionContent.content.readingMaterial.keyPoints.map((point, index) => (
                          <li key={index}>{point}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <Button 
                  onClick={() => {
                    setSectionProgress(prev => ({ ...prev, [currentSection!]: 100 }));
                    completeSection(currentSection!);
                  }}
                  className="w-full"
                >
                  Mark as Read
                </Button>
              </div>
            )}

            {currentSectionContent.type === 'interactive' && (
              <div className="space-y-4">
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <Monitor className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Interactive Demo</h3>
                  <p className="text-gray-600 mb-4">
                    {currentSectionContent.content.interactiveDemo?.description}
                  </p>
                  <Button onClick={() => {
                    setSectionProgress(prev => ({ ...prev, [currentSection!]: 100 }));
                    completeSection(currentSection!);
                  }}>
                    Start Interactive Demo
                  </Button>
                </div>
              </div>
            )}

            {currentSectionContent.type === 'simulation' && (
              <div className="space-y-4">
                <div className="p-8 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Simulation Exercise</h3>
                  <p className="text-gray-600 mb-4">
                    {currentSectionContent.content.simulation?.scenario}
                  </p>
                  {currentSectionContent.content.simulation?.objectives && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Objectives:</h4>
                      <ul className="text-sm text-gray-600 text-left max-w-md mx-auto">
                        {currentSectionContent.content.simulation.objectives.map((obj, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <Target className="h-3 w-3" />
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button onClick={() => {
                    setSectionProgress(prev => ({ ...prev, [currentSection!]: 100 }));
                    completeSection(currentSection!);
                  }}>
                    Start Simulation
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAssessment = () => {
    if (!currentModuleContent) return null;

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Module Assessment
            </CardTitle>
            <CardDescription>
              Answer all questions to complete the module. Passing score: {currentModuleContent.assessment.passingScore}%
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {currentModuleContent.assessment.questions.map((question, index) => (
                <div key={question.id} className="p-4 border rounded-lg">
                  <div className="mb-3">
                    <span className="text-sm text-gray-600">Question {index + 1}</span>
                    <h4 className="font-medium">{question.question}</h4>
                    {question.image && (
                      <img src={question.image} alt="Question" className="mt-2 max-w-sm rounded" />
                    )}
                  </div>
                  
                  {question.type === 'multiple_choice' && question.options && (
                    <RadioGroup
                      value={assessmentAnswers[question.id] || ''}
                      onValueChange={(value) => 
                        setAssessmentAnswers(prev => ({ ...prev, [question.id]: value }))
                      }
                    >
                      {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${question.id}_${optionIndex}`} />
                          <Label htmlFor={`${question.id}_${optionIndex}`}>{option}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                  
                  {question.type === 'true_false' && (
                    <RadioGroup
                      value={assessmentAnswers[question.id] || ''}
                      onValueChange={(value) => 
                        setAssessmentAnswers(prev => ({ ...prev, [question.id]: value }))
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="true" id={`${question.id}_true`} />
                        <Label htmlFor={`${question.id}_true`}>True</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="false" id={`${question.id}_false`} />
                        <Label htmlFor={`${question.id}_false`}>False</Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              ))}
              
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setAssessmentMode(false)}>
                  Back to Content
                </Button>
                <Button 
                  onClick={submitAssessment}
                  disabled={currentModuleContent.assessment.questions.some(q => !assessmentAnswers[q.id])}
                >
                  Submit Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Interactive Training Modules</h2>
        <p className="text-gray-600">
          Comprehensive training designed specifically for concrete cutting operations
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Training Overview</TabsTrigger>
          <TabsTrigger value="content" disabled={!activeModule}>
            Module Content {activeModule && `- ${TRAINING_MODULES.find(m => m.module === activeModule)?.title}`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderModuleOverview()}
        </TabsContent>

        <TabsContent value="content">
          {renderModuleContent()}
        </TabsContent>
      </Tabs>
    </div>
  );
}