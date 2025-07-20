'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building2,
  Users,
  Settings,
  Database,
  GraduationCap,
  Shield,
  Wrench,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  Info,
  Clock,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Target,
  Zap,
  FileText,
  Download,
  Upload
} from 'lucide-react';
import { 
  DSMOnboardingSession,
  OnboardingStep,
  ConcreteCompanyProfile,
  ConcreteService,
  EquipmentType,
  CompanySize,
  ContactInfo,
  ServiceArea,
  EquipmentItem,
  DSMDataVolume,
  ComplianceRequirement,
  MigrationTimeline
} from '@/types/dsm-onboarding';
import { useToast } from '@/hooks/use-toast';

interface DSMOnboardingWizardProps {
  onSessionUpdate: (session: DSMOnboardingSession) => void;
  onComplete: (session: DSMOnboardingSession) => void;
  initialSession?: Partial<DSMOnboardingSession>;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'company_profile',
  'dsm_assessment',
  'data_migration',
  'system_setup',
  'team_configuration',
  'training_modules',
  'equipment_setup',
  'safety_compliance',
  'workflow_configuration',
  'integration_setup',
  'testing_validation',
  'go_live_preparation',
  'completion'
];

const CONCRETE_SERVICES: { value: ConcreteService; label: string; description: string }[] = [
  { value: 'core_drilling', label: 'Core Drilling', description: 'Precision holes for utilities and anchoring' },
  { value: 'wall_sawing', label: 'Wall Sawing', description: 'Vertical cuts in concrete walls' },
  { value: 'slab_sawing', label: 'Slab Sawing', description: 'Horizontal cuts in concrete slabs' },
  { value: 'wire_sawing', label: 'Wire Sawing', description: 'Large cuts in thick concrete sections' },
  { value: 'chain_sawing', label: 'Chain Sawing', description: 'Deep cuts and corner cutting' },
  { value: 'ring_sawing', label: 'Ring Sawing', description: 'Precision circular cuts' },
  { value: 'hand_sawing', label: 'Hand Sawing', description: 'Small precision cuts and touch-ups' },
  { value: 'demolition', label: 'Demolition', description: 'Controlled concrete removal' },
  { value: 'concrete_breaking', label: 'Concrete Breaking', description: 'Hydraulic and pneumatic breaking' },
  { value: 'surface_preparation', label: 'Surface Preparation', description: 'Grinding and surface treatment' },
  { value: 'joint_sealing', label: 'Joint Sealing', description: 'Waterproofing and expansion joints' },
  { value: 'anchor_drilling', label: 'Anchor Drilling', description: 'Structural anchor installation' }
];

const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: 'core_drill', label: 'Core Drills' },
  { value: 'wall_saw', label: 'Wall Saws' },
  { value: 'slab_saw', label: 'Slab Saws' },
  { value: 'wire_saw', label: 'Wire Saws' },
  { value: 'chain_saw', label: 'Chain Saws' },
  { value: 'ring_saw', label: 'Ring Saws' },
  { value: 'hand_saw', label: 'Hand Saws' },
  { value: 'dust_collector', label: 'Dust Collectors' },
  { value: 'water_tank', label: 'Water Tanks' },
  { value: 'generator', label: 'Generators' },
  { value: 'compressor', label: 'Compressors' },
  { value: 'vehicle', label: 'Vehicles' },
  { value: 'trailer', label: 'Trailers' },
  { value: 'safety_equipment', label: 'Safety Equipment' }
];

export default function DSMOnboardingWizard({
  onSessionUpdate,
  onComplete,
  initialSession
}: DSMOnboardingWizardProps) {
  const [session, setSession] = useState<DSMOnboardingSession>(() => ({
    id: initialSession?.id || `onboarding_${Date.now()}`,
    companyId: initialSession?.companyId || '',
    userId: initialSession?.userId || '',
    createdAt: new Date(),
    startedAt: new Date(),
    lastActiveAt: new Date(),
    currentStep: 'welcome',
    completedSteps: [],
    totalSteps: ONBOARDING_STEPS.length,
    progressPercentage: 0,
    companyProfile: {
      companyName: '',
      businessType: 'concrete_cutting',
      yearsInBusiness: 0,
      companySize: 'small',
      primaryContact: {
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        preferredContact: 'email',
        timezone: 'America/New_York',
        availability: {
          monday: { start: '08:00', end: '17:00' },
          tuesday: { start: '08:00', end: '17:00' },
          wednesday: { start: '08:00', end: '17:00' },
          thursday: { start: '08:00', end: '17:00' },
          friday: { start: '08:00', end: '17:00' },
          holidays: []
        }
      },
      concreteServices: [],
      serviceAreas: [],
      averageJobsPerMonth: 0,
      peakSeasonMonths: [],
      equipmentInventory: [],
      crewSize: 0,
      operatorCount: 0,
      dsmVersion: '',
      dsmModules: [],
      dsmDataVolume: {
        customers: 0,
        jobs: 0,
        timeEntries: 0,
        invoices: 0,
        estimates: 0,
        employees: 0,
        equipment: 0,
        materials: 0,
        totalRecords: 0,
        dataSize: '',
        oldestRecord: new Date(),
        newestRecord: new Date()
      },
      dsmCustomizations: [],
      complianceNeeds: [],
      integrationNeeds: [],
      reportingNeeds: [],
      migrationTimeline: {
        preferredStartDate: new Date(),
        flexibility: 'somewhat_flexible',
        blackoutPeriods: [],
        peakBusinessPeriods: []
      },
      riskTolerance: 'medium',
      downtime_tolerance: 4
    },
    dsmMigrationData: {
      dataExtracted: false,
      dataFiles: [],
      dataQuality: {
        overallScore: 0,
        completeness: 0,
        accuracy: 0,
        consistency: 0,
        duplicates: 0,
        missingCriticalFields: [],
        dataGaps: [],
        recommendations: []
      },
      migrationPlan: {
        phases: [],
        totalDuration: 0,
        resourceRequirements: [],
        dependencies: [],
        rollbackStrategy: {
          triggers: [],
          procedures: [],
          dataBackupStrategy: '',
          recoveryTimeObjective: 0
        }
      },
      estimatedDuration: 0,
      riskFactors: []
    },
    migrationStatus: {
      phasesCompleted: [],
      overallProgress: 0,
      activeIssues: [],
      resolvedIssues: [],
      blockers: [],
      recordsMigrated: 0,
      totalRecords: 0,
      migrationSpeed: 0,
      errorRate: 0,
      dataIntegrityChecks: [],
      validationResults: []
    },
    dataValidation: {
      overallStatus: 'passed',
      validationDate: new Date(),
      dataIntegrity: {
        name: 'Data Integrity',
        status: 'passed',
        checks: [],
        passRate: 100
      },
      businessRules: {
        name: 'Business Rules',
        status: 'passed',
        checks: [],
        passRate: 100
      },
      referentialIntegrity: {
        name: 'Referential Integrity',
        status: 'passed',
        checks: [],
        passRate: 100
      },
      dataCompleteness: {
        name: 'Data Completeness',
        status: 'passed',
        checks: [],
        passRate: 100
      },
      totalChecks: 0,
      passedChecks: 0,
      failedChecks: 0,
      warningChecks: 0,
      criticalIssues: [],
      recommendedActions: []
    },
    trainingProgress: {
      overallProgress: 0,
      completedModules: [],
      totalModules: 13,
      learningPath: {
        name: 'Concrete Cutting Professional',
        description: 'Complete training path for concrete cutting companies',
        modules: [],
        estimatedHours: 40,
        difficulty: 'intermediate',
        targetRole: ['operator', 'supervisor', 'administrator']
      },
      adaptiveContent: true,
      assessmentScores: [],
      certifications: [],
      totalTimeSpent: 0,
      averageSessionTime: 0,
      lastActivity: new Date(),
      engagementScore: 0,
      helpRequests: 0,
      tutoringSessions: []
    },
    systemConfiguration: {
      setupProgress: 0,
      completedTasks: [],
      pendingTasks: [],
      userManagement: {
        usersCreated: 0,
        rolesConfigured: false,
        permissionsSet: false,
        teamsSetup: false,
        accessControlConfigured: false
      },
      workflowConfig: {
        workTypesSetup: false,
        approvalWorkflowsConfigured: false,
        automationRulesSetup: false,
        templatesCreated: false,
        statusWorkflowsConfigured: false
      },
      equipmentConfig: {
        assetsRegistered: 0,
        categoriesSetup: false,
        trackingEnabled: false,
        maintenanceSchedulesSetup: false,
        beaconsConfigured: 0
      },
      safetyConfig: {
        complianceFrameworkSetup: false,
        oshaConfigured: false,
        silicaMonitoringSetup: false,
        incidentReportingConfigured: false,
        trainingTrackingSetup: false
      },
      integrationConfig: {
        customIntegrations: []
      },
      systemTesting: {
        functionalTesting: {
          status: 'not_started',
          testCases: 0,
          passed: 0,
          failed: 0,
          coverage: 0,
          issues: []
        },
        integrationTesting: {
          status: 'not_started',
          testCases: 0,
          passed: 0,
          failed: 0,
          coverage: 0,
          issues: []
        },
        performanceTesting: {
          status: 'not_started',
          testCases: 0,
          passed: 0,
          failed: 0,
          coverage: 0,
          issues: []
        },
        securityTesting: {
          status: 'not_started',
          testCases: 0,
          passed: 0,
          failed: 0,
          coverage: 0,
          issues: []
        },
        overallStatus: 'not_started'
      },
      userAcceptanceTesting: {
        scenarios: [],
        overallSatisfaction: 0,
        completionRate: 0,
        approvalStatus: 'pending',
        feedback: []
      },
      goLiveChecklist: [],
      readinessScore: 0
    },
    supportTickets: [],
    blockers: [],
    preferences: {
      communicationFrequency: 'weekly',
      preferredContactMethod: 'email',
      meetingFrequency: 'weekly',
      trainingPace: 'guided',
      supportLevel: 'standard',
      documentationFormat: 'digital',
      timezone: 'America/New_York',
      businessHours: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        holidays: []
      }
    },
    ...initialSession
  }));

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const currentStep = ONBOARDING_STEPS[currentStepIndex];

  // Update session whenever it changes
  useEffect(() => {
    const updatedSession = {
      ...session,
      currentStep,
      progressPercentage: (session.completedSteps.length / session.totalSteps) * 100,
      lastActiveAt: new Date()
    };
    setSession(updatedSession);
    onSessionUpdate(updatedSession);
  }, [session.completedSteps, currentStep]);

  const validateCurrentStep = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    switch (currentStep) {
      case 'welcome':
        // No validation required for welcome step
        break;

      case 'company_profile':
        if (!session.companyProfile.companyName.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        if (!session.companyProfile.primaryContact.firstName.trim()) {
          newErrors.firstName = 'First name is required';
        }
        if (!session.companyProfile.primaryContact.lastName.trim()) {
          newErrors.lastName = 'Last name is required';
        }
        if (!session.companyProfile.primaryContact.email.trim()) {
          newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(session.companyProfile.primaryContact.email)) {
          newErrors.email = 'Email is invalid';
        }
        if (!session.companyProfile.primaryContact.phone.trim()) {
          newErrors.phone = 'Phone number is required';
        }
        if (session.companyProfile.concreteServices.length === 0) {
          newErrors.services = 'At least one service must be selected';
        }
        break;

      case 'dsm_assessment':
        if (!session.companyProfile.dsmVersion.trim()) {
          newErrors.dsmVersion = 'DSM version is required';
        }
        if (session.companyProfile.dsmDataVolume.totalRecords === 0) {
          newErrors.dataVolume = 'Data volume information is required';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [currentStep, session]);

  const updateSession = useCallback((updates: Partial<DSMOnboardingSession>) => {
    setSession(prev => ({ ...prev, ...updates }));
  }, []);

  const updateCompanyProfile = useCallback((updates: Partial<ConcreteCompanyProfile>) => {
    setSession(prev => ({
      ...prev,
      companyProfile: { ...prev.companyProfile, ...updates }
    }));
  }, []);

  const updateContact = useCallback((updates: Partial<ContactInfo>) => {
    setSession(prev => ({
      ...prev,
      companyProfile: {
        ...prev.companyProfile,
        primaryContact: { ...prev.companyProfile.primaryContact, ...updates }
      }
    }));
  }, []);

  const nextStep = useCallback(async () => {
    if (!validateCurrentStep()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before continuing.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Mark current step as completed
      const updatedCompletedSteps = [...session.completedSteps];
      if (!updatedCompletedSteps.includes(currentStep)) {
        updatedCompletedSteps.push(currentStep);
      }

      updateSession({ completedSteps: updatedCompletedSteps });

      // Move to next step
      if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
        toast({
          title: "Step Completed",
          description: `${currentStep.replace('_', ' ')} completed successfully!`,
        });
      } else {
        // Complete onboarding
        const completedSession = {
          ...session,
          completedAt: new Date(),
          completedSteps: updatedCompletedSteps,
          progressPercentage: 100
        };
        setSession(completedSession);
        onComplete(completedSession);
        toast({
          title: "Onboarding Complete!",
          description: "Welcome to Pontifex Industries! Your migration will begin shortly.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to proceed to next step. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [currentStep, currentStepIndex, session, validateCurrentStep, updateSession, onComplete, toast]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setErrors({});
    }
  }, [currentStepIndex]);

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-pontifex-blue mb-4">
          Welcome to Pontifex Industries
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Your journey from DSM to the industry's most advanced concrete cutting platform starts here.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="text-center">
            <Database className="h-12 w-12 mx-auto text-pontifex-blue mb-2" />
            <CardTitle>Seamless Migration</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Automated data migration from your DSM system with zero data loss and minimal downtime.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-pontifex-teal mb-2" />
            <CardTitle>Expert Training</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Comprehensive training modules designed specifically for concrete cutting professionals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="text-center">
            <Zap className="h-12 w-12 mx-auto text-orange-500 mb-2" />
            <CardTitle>Advanced Features</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Real-time asset tracking, OSHA compliance, and advanced analytics that DSM can't match.
            </p>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This onboarding process will take approximately 2-3 hours to complete. You can save your progress and return at any time.
        </AlertDescription>
      </Alert>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-3">What to Expect:</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Company Profile Setup</div>
              <div className="text-sm text-gray-600">Tell us about your concrete cutting business</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">DSM Data Assessment</div>
              <div className="text-sm text-gray-600">Analyze your current DSM data for migration</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Automated Migration</div>
              <div className="text-sm text-gray-600">Secure transfer of all your business data</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
            <div>
              <div className="font-medium">Team Training</div>
              <div className="text-sm text-gray-600">Get your team up to speed with interactive modules</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompanyProfileStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Company Profile</h2>
        <p className="text-gray-600">Tell us about your concrete cutting business to customize your experience.</p>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Company Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  value={session.companyProfile.companyName}
                  onChange={(e) => updateCompanyProfile({ companyName: e.target.value })}
                  className={errors.companyName ? 'border-red-500' : ''}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="businessType">Business Type</Label>
                  <Select
                    value={session.companyProfile.businessType}
                    onValueChange={(value: any) => updateCompanyProfile({ businessType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="concrete_cutting">Concrete Cutting</SelectItem>
                      <SelectItem value="demolition">Demolition</SelectItem>
                      <SelectItem value="construction">General Construction</SelectItem>
                      <SelectItem value="specialty_contractor">Specialty Contractor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select
                    value={session.companyProfile.companySize}
                    onValueChange={(value: CompanySize) => updateCompanyProfile({ companySize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small (1-10 employees)</SelectItem>
                      <SelectItem value="medium">Medium (11-50 employees)</SelectItem>
                      <SelectItem value="large">Large (51-200 employees)</SelectItem>
                      <SelectItem value="enterprise">Enterprise (200+ employees)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="yearsInBusiness">Years in Business</Label>
                <Input
                  id="yearsInBusiness"
                  type="number"
                  min="0"
                  value={session.companyProfile.yearsInBusiness}
                  onChange={(e) => updateCompanyProfile({ yearsInBusiness: parseInt(e.target.value) || 0 })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Primary Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={session.companyProfile.primaryContact.firstName}
                    onChange={(e) => updateContact({ firstName: e.target.value })}
                    className={errors.firstName ? 'border-red-500' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={session.companyProfile.primaryContact.lastName}
                    onChange={(e) => updateContact({ lastName: e.target.value })}
                    className={errors.lastName ? 'border-red-500' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={session.companyProfile.primaryContact.title}
                  onChange={(e) => updateContact({ title: e.target.value })}
                  placeholder="e.g., Owner, Operations Manager, Project Manager"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={session.companyProfile.primaryContact.email}
                    onChange={(e) => updateContact({ email: e.target.value })}
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={session.companyProfile.primaryContact.phone}
                    onChange={(e) => updateContact({ phone: e.target.value })}
                    className={errors.phone ? 'border-red-500' : ''}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500 mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label>Preferred Contact Method</Label>
                <RadioGroup
                  value={session.companyProfile.primaryContact.preferredContact}
                  onValueChange={(value: any) => updateContact({ preferredContact: value })}
                  className="flex space-x-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="contact-email" />
                    <Label htmlFor="contact-email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="contact-phone" />
                    <Label htmlFor="contact-phone" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      Phone
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="text" id="contact-text" />
                    <Label htmlFor="contact-text">Text</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Services Offered
              </CardTitle>
              <CardDescription>
                Select the concrete cutting services your company provides. This helps us customize workflows and pricing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {CONCRETE_SERVICES.map((service) => (
                  <div key={service.value} className="flex items-start space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={service.value}
                      checked={session.companyProfile.concreteServices.includes(service.value)}
                      onCheckedChange={(checked) => {
                        const services = checked
                          ? [...session.companyProfile.concreteServices, service.value]
                          : session.companyProfile.concreteServices.filter(s => s !== service.value);
                        updateCompanyProfile({ concreteServices: services });
                      }}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor={service.value} className="font-medium cursor-pointer">
                        {service.label}
                      </Label>
                      <p className="text-xs text-gray-600">
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              {errors.services && (
                <p className="text-sm text-red-500 mt-2">{errors.services}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Operations Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="averageJobs">Average Jobs per Month</Label>
                  <Input
                    id="averageJobs"
                    type="number"
                    min="0"
                    value={session.companyProfile.averageJobsPerMonth}
                    onChange={(e) => updateCompanyProfile({ averageJobsPerMonth: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <Label htmlFor="crewSize">Total Crew Size</Label>
                  <Input
                    id="crewSize"
                    type="number"
                    min="0"
                    value={session.companyProfile.crewSize}
                    onChange={(e) => updateCompanyProfile({ crewSize: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="operatorCount">Number of Equipment Operators</Label>
                <Input
                  id="operatorCount"
                  type="number"
                  min="0"
                  value={session.companyProfile.operatorCount}
                  onChange={(e) => updateCompanyProfile({ operatorCount: parseInt(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>Peak Season Months</Label>
                <div className="grid grid-cols-6 gap-2 mt-2">
                  {[
                    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
                  ].map((month, index) => (
                    <div key={month} className="flex items-center space-x-2">
                      <Checkbox
                        id={`month-${index}`}
                        checked={session.companyProfile.peakSeasonMonths.includes(index + 1)}
                        onCheckedChange={(checked) => {
                          const months = checked
                            ? [...session.companyProfile.peakSeasonMonths, index + 1]
                            : session.companyProfile.peakSeasonMonths.filter(m => m !== index + 1);
                          updateCompanyProfile({ peakSeasonMonths: months });
                        }}
                      />
                      <Label htmlFor={`month-${index}`} className="text-sm">
                        {month}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderDSMAssessmentStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">DSM Assessment</h2>
        <p className="text-gray-600">Help us understand your current DSM setup for a smooth migration.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Current DSM Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="dsmVersion">DSM Version *</Label>
            <Input
              id="dsmVersion"
              value={session.companyProfile.dsmVersion}
              onChange={(e) => updateCompanyProfile({ dsmVersion: e.target.value })}
              placeholder="e.g., DSM 2023, DSM Professional 2022"
              className={errors.dsmVersion ? 'border-red-500' : ''}
            />
            {errors.dsmVersion && (
              <p className="text-sm text-red-500 mt-1">{errors.dsmVersion}</p>
            )}
          </div>

          <div>
            <Label>DSM Modules Currently Used</Label>
            <div className="grid md:grid-cols-2 gap-2 mt-2">
              {[
                'Job Management',
                'Customer Management',
                'Scheduling',
                'Time Tracking',
                'Equipment Management',
                'Inventory Management',
                'Billing & Invoicing',
                'Reporting',
                'Estimating',
                'Document Management',
                'Mobile App',
                'GPS Tracking'
              ].map((module) => (
                <div key={module} className="flex items-center space-x-2">
                  <Checkbox
                    id={`module-${module}`}
                    checked={session.companyProfile.dsmModules.includes(module)}
                    onCheckedChange={(checked) => {
                      const modules = checked
                        ? [...session.companyProfile.dsmModules, module]
                        : session.companyProfile.dsmModules.filter(m => m !== module);
                      updateCompanyProfile({ dsmModules: modules });
                    }}
                  />
                  <Label htmlFor={`module-${module}`} className="text-sm">
                    {module}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Data Volume Estimation
          </CardTitle>
          <CardDescription>
            Help us estimate your data volume for migration planning. Approximate numbers are fine.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="customers">Number of Customers</Label>
              <Input
                id="customers"
                type="number"
                min="0"
                value={session.companyProfile.dsmDataVolume.customers}
                onChange={(e) => updateCompanyProfile({
                  dsmDataVolume: {
                    ...session.companyProfile.dsmDataVolume,
                    customers: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>

            <div>
              <Label htmlFor="jobs">Number of Jobs</Label>
              <Input
                id="jobs"
                type="number"
                min="0"
                value={session.companyProfile.dsmDataVolume.jobs}
                onChange={(e) => updateCompanyProfile({
                  dsmDataVolume: {
                    ...session.companyProfile.dsmDataVolume,
                    jobs: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>

            <div>
              <Label htmlFor="employees">Number of Employees</Label>
              <Input
                id="employees"
                type="number"
                min="0"
                value={session.companyProfile.dsmDataVolume.employees}
                onChange={(e) => updateCompanyProfile({
                  dsmDataVolume: {
                    ...session.companyProfile.dsmDataVolume,
                    employees: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>

            <div>
              <Label htmlFor="invoices">Number of Invoices</Label>
              <Input
                id="invoices"
                type="number"
                min="0"
                value={session.companyProfile.dsmDataVolume.invoices}
                onChange={(e) => updateCompanyProfile({
                  dsmDataVolume: {
                    ...session.companyProfile.dsmDataVolume,
                    invoices: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>

            <div>
              <Label htmlFor="estimates">Number of Estimates</Label>
              <Input
                id="estimates"
                type="number"
                min="0"
                value={session.companyProfile.dsmDataVolume.estimates}
                onChange={(e) => updateCompanyProfile({
                  dsmDataVolume: {
                    ...session.companyProfile.dsmDataVolume,
                    estimates: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>

            <div>
              <Label htmlFor="equipment">Number of Equipment Items</Label>
              <Input
                id="equipment"
                type="number"
                min="0"
                value={session.companyProfile.dsmDataVolume.equipment}
                onChange={(e) => updateCompanyProfile({
                  dsmDataVolume: {
                    ...session.companyProfile.dsmDataVolume,
                    equipment: parseInt(e.target.value) || 0
                  }
                })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="dataSize">Estimated Database Size</Label>
            <Select
              value={session.companyProfile.dsmDataVolume.dataSize}
              onValueChange={(value) => updateCompanyProfile({
                dsmDataVolume: {
                  ...session.companyProfile.dsmDataVolume,
                  dataSize: value
                }
              })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select approximate size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small (< 100 MB)</SelectItem>
                <SelectItem value="medium">Medium (100 MB - 1 GB)</SelectItem>
                <SelectItem value="large">Large (1 GB - 10 GB)</SelectItem>
                <SelectItem value="very_large">Very Large (> 10 GB)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errors.dataVolume && (
            <p className="text-sm text-red-500">{errors.dataVolume}</p>
          )}
        </CardContent>
      </Card>

      <Alert>
        <Upload className="h-4 w-4" />
        <AlertDescription>
          <strong>Next Step:</strong> We'll guide you through exporting your DSM data for analysis and migration planning.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'company_profile':
        return renderCompanyProfileStep();
      case 'dsm_assessment':
        return renderDSMAssessmentStep();
      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Step Under Construction</h2>
            <p className="text-gray-600 mb-6">
              The {currentStep.replace('_', ' ')} step is being developed.
            </p>
            <Badge variant="outline">Coming Soon</Badge>
          </div>
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center mb-4">
            <div>
              <CardTitle className="text-xl">DSM to Pontifex Migration</CardTitle>
              <CardDescription>
                Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}: {currentStep.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </CardDescription>
            </div>
            <Badge variant="outline">
              {Math.round(session.progressPercentage)}% Complete
            </Badge>
          </div>
          <Progress value={session.progressPercentage} className="h-2" />
        </CardHeader>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardContent className="p-6">
          {renderCurrentStep()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={previousStep}
              disabled={currentStepIndex === 0}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStepIndex < ONBOARDING_STEPS.length - 1 ? (
                <Button onClick={nextStep} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              ) : (
                <Button onClick={nextStep} disabled={isLoading} className="bg-green-600 hover:bg-green-700">
                  {isLoading ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Completing...
                    </>
                  ) : (
                    <>
                      Complete Onboarding
                      <CheckCircle className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}