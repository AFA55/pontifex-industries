'use client';

import React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  FileText,
  HelpCircle,
  Home,
  MapPin,
  Settings,
  Shield,
  Target,
  Users,
  Wrench,
  Zap,
  Building,
  Phone,
  Mail,
  Calendar,
  TrendingUp,
  Database,
  Smartphone,
  Wifi,
  Award,
  BookOpen,
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { 
  OnboardingSession,
  OnboardingStep,
  CompanyProfile,
  ConcreteService,
  EquipmentType,
  BudgetRange,
  MigrationGoal,
  DSMDataVolume
} from '@/types/onboarding';
import { useToast } from '@/hooks/use-toast';

interface OnboardingWizardProps {
  companyId: string;
  userId: string;
  onComplete?: (session: OnboardingSession) => void;
  onStepChange?: (step: OnboardingStep) => void;
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  'welcome',
  'company_profile',
  'dsm_assessment', 
  'data_migration',
  'system_setup',
  'team_setup',
  'training_modules',
  'equipment_configuration',
  'safety_setup',
  'workflow_customization',
  'integration_setup',
  'go_live_checklist',
  'completion'
];

const CONCRETE_SERVICES: { value: ConcreteService; label: string; description: string }[] = [
  { value: 'core_drilling', label: 'Core Drilling', description: 'Precision concrete coring with diamond bits' },
  { value: 'wall_sawing', label: 'Wall Sawing', description: 'Vertical and horizontal concrete cutting' },
  { value: 'slab_sawing', label: 'Slab Sawing', description: 'Flat surface concrete cutting and removal' },
  { value: 'wire_sawing', label: 'Wire Sawing', description: 'Large-scale concrete cutting with diamond wire' },
  { value: 'chain_sawing', label: 'Chain Sawing', description: 'Hydraulic chain sawing for complex cuts' },
  { value: 'ring_sawing', label: 'Ring Sawing', description: 'Precision ring cutting for openings' },
  { value: 'hand_sawing', label: 'Hand Sawing', description: 'Portable handheld concrete cutting' },
  { value: 'demolition', label: 'Controlled Demolition', description: 'Structural concrete demolition services' },
  { value: 'breaking', label: 'Concrete Breaking', description: 'Pneumatic and hydraulic breaking' },
  { value: 'chipping', label: 'Surface Chipping', description: 'Surface preparation and texture removal' },
  { value: 'joint_sealing', label: 'Joint Sealing', description: 'Expansion joint sealing and repair' },
  { value: 'surface_preparation', label: 'Surface Preparation', description: 'Concrete surface preparation services' }
];

const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: 'core_drills', label: 'Core Drilling Equipment' },
  { value: 'wall_saws', label: 'Wall Saws' },
  { value: 'slab_saws', label: 'Slab Saws' },
  { value: 'wire_saws', label: 'Wire Saws' },
  { value: 'chain_saws', label: 'Chain Saws' },
  { value: 'ring_saws', label: 'Ring Saws' },
  { value: 'hand_saws', label: 'Hand/Walk-Behind Saws' },
  { value: 'dust_collectors', label: 'Dust Collection Systems' },
  { value: 'water_tanks', label: 'Water Supply Systems' },
  { value: 'generators', label: 'Generators' },
  { value: 'compressors', label: 'Air Compressors' },
  { value: 'vehicles', label: 'Service Vehicles' },
  { value: 'trailers', label: 'Equipment Trailers' },
  { value: 'other', label: 'Other Equipment' }
];

export default function OnboardingWizard({
  companyId,
  userId,
  onComplete,
  onStepChange
}: OnboardingWizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [session, setSession] = useState<OnboardingSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const { toast } = useToast();

  const currentStep = ONBOARDING_STEPS[currentStepIndex];
  const progressPercentage = ((currentStepIndex + 1) / ONBOARDING_STEPS.length) * 100;

  // Initialize onboarding session
  useEffect(() => {
    initializeSession();
  }, [companyId, userId]);

  const initializeSession = useCallback(async () => {
    setLoading(true);
    
    try {
      // Check if there's an existing session
      const existingSession = await loadExistingSession();
      
      if (existingSession) {
        setSession(existingSession);
        const stepIndex = ONBOARDING_STEPS.indexOf(existingSession.currentStep);
        setCurrentStepIndex(stepIndex >= 0 ? stepIndex : 0);
      } else {
        // Create new session
        const newSession: OnboardingSession = {
          id: generateSessionId(),
          companyId,
          userId,
          startedAt: new Date(),
          lastActiveAt: new Date(),
          currentStep: 'welcome',
          completedSteps: [],
          totalSteps: ONBOARDING_STEPS.length,
          progressPercentage: 0,
          companyProfile: getDefaultCompanyProfile(),
          migrationStatus: {
            status: 'not_started',
            phasesCompleted: [],
            dataValidated: false,
            testingCompleted: false,
            backupCreated: false,
            rollbackPlan: false,
            issues: [],
            warningsCount: 0,
            errorsCount: 0,
            assistanceRequested: false,
            supportTickets: []
          },
          trainingProgress: {
            status: 'not_started',
            completedModules: [],
            totalModules: 20,
            progressPercentage: 0,
            learningPath: getDefaultLearningPath(),
            adaptivePath: true,
            personalizedContent: true,
            assessmentScores: [],
            certifications: [],
            skillsAcquired: [],
            timeSpent: 0,
            sessionsCompleted: 0,
            averageScore: 0,
            engagementLevel: 'medium',
            helpRequestsCount: 0,
            tutoringSessions: [],
            lastActivity: new Date()
          },
          systemSetup: {
            status: 'not_started',
            setupTasks: [],
            completedTasks: [],
            totalTasks: 25,
            progressPercentage: 0,
            userManagement: {
              usersCreated: 0,
              rolesConfigured: false,
              permissionsSet: false,
              teamStructureSetup: false,
              accessLevelsConfigured: false,
              securityPoliciesSet: false
            },
            workOrderSetup: {
              workTypesConfigured: false,
              workflowsSetup: false,
              approvalProcessesSetup: false,
              automationRulesConfigured: false,
              templatesCreated: false,
              statusesCustomized: false,
              pricingSetup: false
            },
            equipmentSetup: {
              assetsRegistered: 0,
              categoriesSetup: false,
              maintenanceSchedulesConfigured: false,
              beaconsAssigned: 0,
              trackingConfigured: false,
              utilizationMetricsSetup: false,
              alertsConfigured: false
            },
            safetySetup: {
              complianceFrameworkSetup: false,
              silicaMonitoringConfigured: false,
              ppeRequirementsSetup: false,
              incidentReportingConfigured: false,
              trainingRequirementsSetup: false,
              auditSchedulesSetup: false,
              alertsConfigured: false
            },
            integrationSetup: {
              customIntegrations: []
            },
            mobileSetup: {
              mobileAppDownloaded: false,
              devicesConfigured: 0,
              offlineCapabilityTested: false,
              pushNotificationsSetup: false,
              locationServicesEnabled: false,
              cameraPermissionsGranted: false,
              fieldTesting: {
                testScenariosCompleted: 0,
                totalTestScenarios: 10,
                connectivityTested: false,
                usabilityTested: false,
                performanceTested: false,
                userFeedback: []
              }
            },
            systemTesting: {
              functionalTesting: getEmptyTestingResult(),
              integrationTesting: getEmptyTestingResult(),
              performanceTesting: getEmptyTestingResult(),
              securityTesting: getEmptyTestingResult(),
              userAcceptanceTesting: getEmptyTestingResult(),
              regressionTesting: getEmptyTestingResult()
            },
            userAcceptanceTesting: {
              scenarios: [],
              usersParticipating: 0,
              scenariosCompleted: 0,
              overallSatisfaction: 0,
              approvalStatus: 'pending',
              feedback: []
            },
            goLiveChecklist: [],
            readinessScore: 0,
            blockers: []
          },
          supportTickets: [],
          hasCompletedTour: false,
          needsAssistance: false,
          preferences: getDefaultPreferences(),
          notifications: []
        };
        
        setSession(newSession);
        await saveSession(newSession);
      }
      
      onStepChange?.(currentStep);
    } catch (error) {
      toast({
        title: "Initialization Error",
        description: "Failed to initialize onboarding session",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, userId]);

  const nextStep = useCallback(async () => {
    if (currentStepIndex < ONBOARDING_STEPS.length - 1) {
      const newStepIndex = currentStepIndex + 1;
      const newStep = ONBOARDING_STEPS[newStepIndex];
      
      // Mark current step as completed
      if (session) {
        const updatedSession = {
          ...session,
          currentStep: newStep,
          completedSteps: [...session.completedSteps, currentStep],
          progressPercentage: ((newStepIndex + 1) / ONBOARDING_STEPS.length) * 100,
          lastActiveAt: new Date()
        };
        
        setSession(updatedSession);
        await saveSession(updatedSession);
        
        setCurrentStepIndex(newStepIndex);
        onStepChange?.(newStep);
        
        // Show step completion notification
        toast({
          title: "Step Completed",
          description: `Successfully completed ${getStepTitle(currentStep)}`,
        });
      }
    }
  }, [currentStepIndex, session, currentStep, onStepChange]);

  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const newStepIndex = currentStepIndex - 1;
      const newStep = ONBOARDING_STEPS[newStepIndex];
      
      setCurrentStepIndex(newStepIndex);
      onStepChange?.(newStep);
      
      if (session) {
        const updatedSession = {
          ...session,
          currentStep: newStep,
          lastActiveAt: new Date()
        };
        setSession(updatedSession);
        saveSession(updatedSession);
      }
    }
  }, [currentStepIndex, session, onStepChange]);

  const jumpToStep = useCallback((step: OnboardingStep) => {
    const stepIndex = ONBOARDING_STEPS.indexOf(step);
    if (stepIndex >= 0) {
      setCurrentStepIndex(stepIndex);
      onStepChange?.(step);
      
      if (session) {
        const updatedSession = {
          ...session,
          currentStep: step,
          lastActiveAt: new Date()
        };
        setSession(updatedSession);
        saveSession(updatedSession);
      }
    }
  }, [session, onStepChange]);

  const updateCompanyProfile = useCallback(async (updates: Partial<CompanyProfile>) => {
    if (session) {
      const updatedSession = {
        ...session,
        companyProfile: { ...session.companyProfile, ...updates },
        lastActiveAt: new Date()
      };
      
      setSession(updatedSession);
      await saveSession(updatedSession);
    }
  }, [session]);

  const saveAndNext = useCallback(async () => {
    setSaving(true);
    try {
      await saveSession(session!);
      await nextStep();
    } catch (error) {
      toast({
        title: "Save Error",
        description: "Failed to save progress",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  }, [session, nextStep]);

  const completeOnboarding = useCallback(async () => {
    if (session) {
      const completedSession = {
        ...session,
        completedAt: new Date(),
        currentStep: 'completion' as OnboardingStep,
        completedSteps: ONBOARDING_STEPS.filter(step => step !== 'completion'),
        progressPercentage: 100,
        lastActiveAt: new Date()
      };
      
      setSession(completedSession);
      await saveSession(completedSession);
      
      toast({
        title: "Onboarding Complete!",
        description: "Welcome to Pontifex Industries platform",
      });
      
      onComplete?.(completedSession);
    }
  }, [session, onComplete]);

  if (loading || !session) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-pontifex-blue"></div>
          <span>Initializing onboarding...</span>
        </div>
      </div>
    );
  }

  const renderWelcomeStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-pontifex-blue/10 rounded-full">
            <Sparkles className="h-12 w-12 text-pontifex-blue" />
          </div>
        </div>
        <h2 className="text-3xl font-bold mb-2">Welcome to Pontifex Industries</h2>
        <p className="text-xl text-gray-600 mb-4">
          The superior concrete cutting management platform
        </p>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We're excited to help you transition from DSM Software to our advanced platform. 
          This guided onboarding will help you migrate your data, set up your systems, 
          and train your team for success.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            What We'll Accomplish Together
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-pontifex-blue mt-1" />
                <div>
                  <h4 className="font-semibold">Seamless Data Migration</h4>
                  <p className="text-sm text-gray-600">
                    Transfer all your DSM data including customers, jobs, employees, and time entries
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Settings className="h-5 w-5 text-pontifex-blue mt-1" />
                <div>
                  <h4 className="font-semibold">System Configuration</h4>
                  <p className="text-sm text-gray-600">
                    Set up work types, equipment tracking, safety compliance, and workflows
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-pontifex-blue mt-1" />
                <div>
                  <h4 className="font-semibold">Team Training</h4>
                  <p className="text-sm text-gray-600">
                    Interactive training modules designed specifically for concrete cutting workflows
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Smartphone className="h-5 w-5 text-pontifex-blue mt-1" />
                <div>
                  <h4 className="font-semibold">Mobile Setup</h4>
                  <p className="text-sm text-gray-600">
                    Configure mobile apps for field crews with offline capabilities
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-pontifex-blue mt-1" />
                <div>
                  <h4 className="font-semibold">Safety Compliance</h4>
                  <p className="text-sm text-gray-600">
                    OSHA compliance, silica monitoring, and automated safety reporting
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Zap className="h-5 w-5 text-pontifex-blue mt-1" />
                <div>
                  <h4 className="font-semibold">Advanced Features</h4>
                  <p className="text-sm text-gray-600">
                    Real-time analytics, equipment tracking, and predictive maintenance
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Timeline & Expectations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-pontifex-blue mb-1">2-3 Days</div>
              <div className="text-sm text-gray-600">Data Migration & Setup</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-pontifex-blue mb-1">1-2 Weeks</div>
              <div className="text-sm text-gray-600">Team Training & Testing</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-pontifex-blue mb-1">Ongoing</div>
              <div className="text-sm text-gray-600">Support & Optimization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <HeartHandshake className="h-4 w-4" />
        <AlertDescription>
          <strong>Dedicated Support:</strong> You'll have a dedicated migration specialist throughout 
          the process. We're here to help ensure your success every step of the way.
        </AlertDescription>
      </Alert>
    </div>
  );

  const renderCompanyProfileStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Tell Us About Your Company</h2>
        <p className="text-gray-600">
          Help us understand your business so we can customize your setup
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                value={session.companyProfile.companyName}
                onChange={(e) => updateCompanyProfile({ companyName: e.target.value })}
                placeholder="Enter your company name"
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Primary Industry</Label>
              <Select 
                value={session.companyProfile.industry}
                onValueChange={(value) => updateCompanyProfile({ industry: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="concrete_cutting">Concrete Cutting</SelectItem>
                  <SelectItem value="demolition">Demolition</SelectItem>
                  <SelectItem value="construction">General Construction</SelectItem>
                  <SelectItem value="mixed">Mixed Services</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="companySize">Company Size</Label>
              <Select 
                value={session.companyProfile.companySize}
                onValueChange={(value) => updateCompanyProfile({ companySize: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select company size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (1-10 employees)</SelectItem>
                  <SelectItem value="medium">Medium (11-50 employees)</SelectItem>
                  <SelectItem value="large">Large (50+ employees)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                value={session.companyProfile.yearsInBusiness}
                onChange={(e) => updateCompanyProfile({ yearsInBusiness: parseInt(e.target.value) || 0 })}
                placeholder="Years operating"
              />
            </div>
          </CardContent>
        </Card>

        {/* Services Offered */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Services Offered
            </CardTitle>
            <CardDescription>
              Select all concrete cutting services your company provides
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-3 max-h-96 overflow-y-auto">
              {CONCRETE_SERVICES.map((service) => (
                <div key={service.value} className="flex items-start space-x-3">
                  <Checkbox
                    id={service.value}
                    checked={session.companyProfile.servicesOffered.includes(service.value)}
                    onCheckedChange={(checked) => {
                      const current = session.companyProfile.servicesOffered;
                      const updated = checked 
                        ? [...current, service.value]
                        : current.filter(s => s !== service.value);
                      updateCompanyProfile({ servicesOffered: updated });
                    }}
                  />
                  <div className="space-y-1 leading-none">
                    <Label htmlFor={service.value} className="font-medium">
                      {service.label}
                    </Label>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Primary Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={session.companyProfile.primaryContact.firstName}
                  onChange={(e) => updateCompanyProfile({
                    primaryContact: {
                      ...session.companyProfile.primaryContact,
                      firstName: e.target.value
                    }
                  })}
                  placeholder="First name"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={session.companyProfile.primaryContact.lastName}
                  onChange={(e) => updateCompanyProfile({
                    primaryContact: {
                      ...session.companyProfile.primaryContact,
                      lastName: e.target.value
                    }
                  })}
                  placeholder="Last name"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={session.companyProfile.primaryContact.email}
                onChange={(e) => updateCompanyProfile({
                  primaryContact: {
                    ...session.companyProfile.primaryContact,
                    email: e.target.value
                  }
                })}
                placeholder="Email address"
              />
            </div>
            
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={session.companyProfile.primaryContact.phone}
                onChange={(e) => updateCompanyProfile({
                  primaryContact: {
                    ...session.companyProfile.primaryContact,
                    phone: e.target.value
                  }
                })}
                placeholder="Phone number"
              />
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={session.companyProfile.primaryContact.title}
                onChange={(e) => updateCompanyProfile({
                  primaryContact: {
                    ...session.companyProfile.primaryContact,
                    title: e.target.value
                  }
                })}
                placeholder="Job title"
              />
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="projectSize">Typical Project Size</Label>
              <Select 
                value={session.companyProfile.typicalProjectSize}
                onValueChange={(value) => updateCompanyProfile({ typicalProjectSize: value as any })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small (Under $10K)</SelectItem>
                  <SelectItem value="medium">Medium ($10K - $50K)</SelectItem>
                  <SelectItem value="large">Large ($50K+)</SelectItem>
                  <SelectItem value="mixed">Mixed Project Sizes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="jobsPerMonth">Average Jobs Per Month</Label>
              <Input
                id="jobsPerMonth"
                type="number"
                value={session.companyProfile.averageJobsPerMonth}
                onChange={(e) => updateCompanyProfile({ averageJobsPerMonth: parseInt(e.target.value) || 0 })}
                placeholder="Number of jobs"
              />
            </div>
            
            <div>
              <Label htmlFor="serviceRadius">Service Radius (miles)</Label>
              <Input
                id="serviceRadius"
                type="number"
                value={session.companyProfile.serviceRadius}
                onChange={(e) => updateCompanyProfile({ serviceRadius: parseInt(e.target.value) || 0 })}
                placeholder="Miles from base"
              />
            </div>
            
            <div>
              <Label htmlFor="estimatedUsers">Estimated Platform Users</Label>
              <Input
                id="estimatedUsers"
                type="number"
                value={session.companyProfile.estimatedUsers}
                onChange={(e) => updateCompanyProfile({ estimatedUsers: parseInt(e.target.value) || 0 })}
                placeholder="Number of users"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderNavigationButtons = () => (
    <div className="flex justify-between items-center pt-6">
      <Button
        variant="outline"
        onClick={previousStep}
        disabled={currentStepIndex === 0}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" >
          <HelpCircle className="h-4 w-4 mr-2" />
          Get Help
        </Button>
        <Button variant="ghost"  disabled={!saving}>
          {saving ? 'Saving...' : 'Save Progress'}
        </Button>
      </div>
      
      {currentStepIndex === ONBOARDING_STEPS.length - 1 ? (
        <Button onClick={completeOnboarding} className="flex items-center gap-2">
          Complete Onboarding
          <CheckCircle className="h-4 w-4" />
        </Button>
      ) : (
        <Button onClick={saveAndNext} disabled={saving} className="flex items-center gap-2">
          Next
          <ArrowRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 'welcome':
        return renderWelcomeStep();
      case 'company_profile':
        return renderCompanyProfileStep();
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              Step "{currentStep}" implementation in progress
            </div>
            <Button onClick={nextStep} variant="outline">
              Continue to Next Step
            </Button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-pontifex-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">P</span>
            </div>
            <span className="font-bold text-lg">Pontifex Industries</span>
          </div>
          <Badge variant="outline">DSM Migration Wizard</Badge>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}
            </span>
            <span className="text-sm text-gray-600">
              {Math.round(progressPercentage)}% Complete
            </span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
          <div className="flex justify-between mt-2">
            <span className="text-sm text-gray-600">{getStepTitle(currentStep)}</span>
            <span className="text-sm text-gray-600">
              Estimated time: {getStepEstimatedTime(currentStep)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardContent className="p-8">
          {renderStepContent()}
          {renderNavigationButtons()}
        </CardContent>
      </Card>

      {/* Side Panel with Step Overview */}
      <Card className="lg:absolute lg:right-6 lg:top-6 lg:w-80">
        <CardHeader>
          <CardTitle className="text-lg">Onboarding Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {ONBOARDING_STEPS.map((step, index) => (
              <div
                key={step}
                className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors ${
                  index === currentStepIndex 
                    ? 'bg-pontifex-blue/10 border border-pontifex-blue/20' 
                    : session.completedSteps.includes(step)
                    ? 'bg-green-50 border border-green-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => jumpToStep(step)}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  index === currentStepIndex
                    ? 'bg-pontifex-blue text-white'
                    : session.completedSteps.includes(step)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {session.completedSteps.includes(step) ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className={`text-sm ${
                  index === currentStepIndex ? 'font-medium' : ''
                }`}>
                  {getStepTitle(step)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Helper functions
  function loadExistingSession(): Promise<OnboardingSession | null> {
    // Implementation would load from database or localStorage
    return Promise.resolve(null);
  }

  function saveSession(session: OnboardingSession): Promise<void> {
    // Implementation would save to database
    return Promise.resolve();
  }

  function generateSessionId(): string {
    return `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  function getDefaultCompanyProfile(): CompanyProfile {
    return {
      companyName: '',
      industry: 'concrete_cutting',
      companySize: 'small',
      yearsInBusiness: 0,
      primaryContact: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        preferredContactMethod: 'email',
        timezone: 'America/New_York'
      },
      servicesOffered: [],
      typicalProjectSize: 'mixed',
      averageJobsPerMonth: 0,
      peakSeasonMonths: [],
      primaryServiceArea: {
        city: '',
        state: '',
        zipCodes: [],
        counties: []
      },
      serviceRadius: 50,
      multipleLocations: false,
      dsmLicenseType: '',
      dsmModulesUsed: [],
      dsmDataVolume: {
        customers: 0,
        jobs: 0,
        employees: 0,
        timeEntries: 0,
        invoices: 0,
        estimates: 0,
        materials: 0,
        totalRecords: 0,
        dataSize: '0 MB',
        oldestRecord: new Date(),
        newestRecord: new Date()
      },
      customFieldsUsed: 0,
      integrationsCurrent: [],
      estimatedUsers: 1,
      userRoles: [],
      accessLevels: [],
      equipmentTypes: [],
      inventoryManagement: 'basic',
      assetTrackingNeeds: [],
      oshaCompliance: true,
      silicaMonitoringRequired: true,
      stateRegulations: [],
      insuranceRequirements: [],
      certificationRequirements: [],
      currentTechStack: {
        operatingSystem: 'windows',
        mobileDevices: 0,
        tablets: 0,
        desktopComputers: 1,
        serverInfrastructure: 'cloud',
        existingSoftware: []
      },
      mobileDeviceTypes: [],
      internetConnectivity: 'standard',
      cloudReadiness: true,
      migrationGoals: [],
      successMetrics: [],
      timeline: {
        preferredStartDate: new Date(),
        flexibility: 'flexible',
        businessConstraints: [],
        blackoutDates: []
      },
      budgetRange: '15k_to_30k'
    };
  }

  function getDefaultLearningPath(): any {
    return {
      name: 'Concrete Cutting Professional',
      description: 'Complete training path for concrete cutting operations',
      recommendedForRole: ['operator', 'supervisor', 'admin'],
      modules: [],
      estimatedDuration: 8,
      difficulty: 'intermediate',
      prerequisites: []
    };
  }

  function getEmptyTestingResult(): any {
    return {
      status: 'not_started',
      testCases: 0,
      passed: 0,
      failed: 0,
      blocked: 0,
      coverage: 0,
      issues: []
    };
  }

  function getDefaultPreferences(): any {
    return {
      communicationFrequency: 'weekly',
      preferredContactMethod: 'email',
      trainingPace: 'self_paced',
      supportLevel: 'standard',
      businessHours: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' }
      },
      timezone: 'America/New_York',
      language: 'en',
      customizationLevel: 'moderate',
      integrationPriority: 'medium',
      dataMigrationUrgency: 'standard',
      goLiveApproach: 'phased'
    };
  }

  function getStepTitle(step: OnboardingStep): string {
    const titles: Record<OnboardingStep, string> = {
      welcome: 'Welcome',
      company_profile: 'Company Profile',
      dsm_assessment: 'DSM Assessment',
      data_migration: 'Data Migration',
      system_setup: 'System Setup',
      team_setup: 'Team Setup',
      training_modules: 'Training',
      equipment_configuration: 'Equipment Config',
      safety_setup: 'Safety Setup',
      workflow_customization: 'Workflows',
      integration_setup: 'Integrations',
      go_live_checklist: 'Go-Live Checklist',
      completion: 'Completion'
    };
    return titles[step];
  }

  function getStepEstimatedTime(step: OnboardingStep): string {
    const times: Record<OnboardingStep, string> = {
      welcome: '5 min',
      company_profile: '15 min',
      dsm_assessment: '10 min',
      data_migration: '2-4 hours',
      system_setup: '30 min',
      team_setup: '20 min',
      training_modules: '2-4 hours',
      equipment_configuration: '45 min',
      safety_setup: '30 min',
      workflow_customization: '45 min',
      integration_setup: '30 min',
      go_live_checklist: '15 min',
      completion: '5 min'
    };
    return times[step];
  }
}
