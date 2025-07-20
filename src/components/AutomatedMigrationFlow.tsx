'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Database,
  FileText,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Download,
  Upload,
  RefreshCw,
  Eye,
  Play,
  Pause,
  RotateCcw,
  Shield,
  Zap,
  TrendingUp,
  Users,
  Building,
  Wrench,
  Calendar,
  DollarSign,
  Settings,
  Search,
  Filter,
  ArrowRight,
  Info
} from 'lucide-react';
import { 
  OnboardingSession,
  DSMMigrationProgress,
  MigrationPhase,
  DSMDataAssessment,
  MigrationPlan,
  DSMMigrationResults
} from '@/types/onboarding';
import { DSMMigrationOptions, DSMMigrationStatus } from '@/types/dsm-data';
import { dsmMigrationService } from '@/lib/dsm-migration-service';
import { useToast } from '@/hooks/use-toast';

interface AutomatedMigrationFlowProps {
  onboardingSession: OnboardingSession;
  onProgressUpdate: (session: OnboardingSession) => void;
  onComplete: (results: DSMMigrationResults) => void;
}

const MIGRATION_PHASES: { phase: MigrationPhase; title: string; description: string; icon: any }[] = [
  {
    phase: 'preparation',
    title: 'Preparation',
    description: 'Analyzing DSM data and preparing migration environment',
    icon: Database
  },
  {
    phase: 'data_export',
    title: 'Data Export',
    description: 'Exporting data from DSM Software',
    icon: Upload
  },
  {
    phase: 'data_validation',
    title: 'Data Validation',
    description: 'Validating exported data quality and completeness',
    icon: Shield
  },
  {
    phase: 'customers_migration',
    title: 'Customer Migration',
    description: 'Migrating customer records and contact information',
    icon: Building
  },
  {
    phase: 'employees_migration',
    title: 'Employee Migration',
    description: 'Migrating employee records and certifications',
    icon: Users
  },
  {
    phase: 'work_types_migration',
    title: 'Work Types Migration',
    description: 'Migrating and mapping concrete cutting work types',
    icon: Wrench
  },
  {
    phase: 'jobs_migration',
    title: 'Jobs Migration',
    description: 'Migrating work orders and project data',
    icon: FileText
  },
  {
    phase: 'time_entries_migration',
    title: 'Time Entries Migration',
    description: 'Migrating time tracking and labor records',
    icon: Clock
  },
  {
    phase: 'materials_migration',
    title: 'Materials Migration',
    description: 'Migrating equipment and inventory data',
    icon: Database
  },
  {
    phase: 'financial_migration',
    title: 'Financial Migration',
    description: 'Migrating invoices, estimates, and financial data',
    icon: DollarSign
  },
  {
    phase: 'documents_migration',
    title: 'Documents Migration',
    description: 'Migrating files, photos, and attachments',
    icon: FileText
  },
  {
    phase: 'validation_testing',
    title: 'Validation Testing',
    description: 'Comprehensive data validation and integrity testing',
    icon: CheckCircle
  },
  {
    phase: 'user_acceptance_testing',
    title: 'User Testing',
    description: 'User acceptance testing and feedback collection',
    icon: Eye
  },
  {
    phase: 'go_live',
    title: 'Go Live',
    description: 'Final deployment and system activation',
    icon: Zap
  },
  {
    phase: 'post_migration_support',
    title: 'Post-Migration Support',
    description: 'Ongoing support and optimization',
    icon: Settings
  }
];

export default function AutomatedMigrationFlow({
  onboardingSession,
  onProgressUpdate,
  onComplete
}: AutomatedMigrationFlowProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [migrationProgress, setMigrationProgress] = useState<DSMMigrationProgress>(
    onboardingSession.migrationStatus
  );
  const [currentPhase, setCurrentPhase] = useState<MigrationPhase | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [dataAssessment, setDataAssessment] = useState<DSMDataAssessment | null>(null);
  const [migrationPlan, setMigrationPlan] = useState<MigrationPlan | null>(null);
  const [migrationResults, setMigrationResults] = useState<DSMMigrationResults | null>(null);
  
  const { toast } = useToast();

  // Auto-assessment when file is selected
  useEffect(() => {
    if (selectedFile && migrationProgress.status === 'not_started') {
      performDataAssessment();
    }
  }, [selectedFile]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `Selected ${file.name} for migration`,
      });
    }
  }, [toast]);

  const performDataAssessment = useCallback(async () => {
    if (!selectedFile) return;

    setMigrationProgress(prev => ({ ...prev, status: 'assessment' }));
    
    try {
      // Simulate DSM data assessment
      const assessment: DSMDataAssessment = await assessDSMData(selectedFile);
      setDataAssessment(assessment);
      
      // Generate migration plan based on assessment
      const plan: MigrationPlan = generateMigrationPlan(assessment, onboardingSession.companyProfile);
      setMigrationPlan(plan);
      
      setMigrationProgress(prev => ({
        ...prev,
        dsmDataAssessment: assessment,
        migrationPlan: plan
      }));
      
      toast({
        title: "Assessment Complete",
        description: `Data quality score: ${assessment.dataQualityScore}%`,
      });
      
    } catch (error) {
      toast({
        title: "Assessment Failed",
        description: error instanceof Error ? error.message : "Failed to assess DSM data",
        variant: "destructive"
      });
    }
  }, [selectedFile, onboardingSession.companyProfile]);

  const startMigration = useCallback(async () => {
    if (!selectedFile || !migrationPlan) return;

    setIsRunning(true);
    setIsPaused(false);
    setMigrationProgress(prev => ({ 
      ...prev, 
      status: 'in_progress',
      startedAt: new Date()
    }));

    try {
      const migrationOptions: DSMMigrationOptions = {
        skipDuplicates: true,
        updateExisting: false,
        validateOnly: false,
        handleMissingFields: 'warn',
        dateFormat: 'YYYY-MM-DD',
        currencyFormat: 'USD',
        migrateJobs: true,
        migrateEmployees: true,
        migrateCustomers: true,
        migrateTimeEntries: true,
        migrateMaterials: true,
        migrateWorkTypes: true,
        migratePhotos: false,
        migrateNotes: false,
        batchSize: 100,
        maxErrors: 50,
        createBackup: true,
        fieldMappings: {},
        customFieldMappings: {}
      };

      // Execute migration phases sequentially
      for (const phaseDefinition of migrationPlan.phases) {
        if (isPaused) break;
        
        setCurrentPhase(phaseDefinition.phase);
        await executePhase(phaseDefinition.phase, migrationOptions);
        
        setMigrationProgress(prev => ({
          ...prev,
          phasesCompleted: [...prev.phasesCompleted, phaseDefinition.phase]
        }));
      }

      if (!isPaused) {
        const results = await completeMigration();
        setMigrationResults(results);
        
        setMigrationProgress(prev => ({
          ...prev,
          status: 'completed',
          actualCompletion: new Date(),
          migrationResults: results
        }));

        toast({
          title: "Migration Complete!",
          description: `Successfully migrated ${results.summary.migratedRecords} records`,
        });

        onComplete(results);
      }
      
    } catch (error) {
      setMigrationProgress(prev => ({
        ...prev,
        status: 'failed',
        issues: [...prev.issues, {
          id: `error_${Date.now()}`,
          phase: currentPhase || 'preparation',
          severity: 'critical',
          category: 'migration',
          description: error instanceof Error ? error.message : 'Migration failed',
          impact: 'Migration cannot continue',
          status: 'open',
          assignedTo: 'system',
          createdAt: new Date()
        }]
      }));
      
      toast({
        title: "Migration Failed",
        description: error instanceof Error ? error.message : "Migration encountered an error",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentPhase(null);
    }
  }, [selectedFile, migrationPlan, isPaused, currentPhase]);

  const pauseMigration = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    toast({
      title: "Migration Paused",
      description: "Migration has been paused and can be resumed later",
    });
  }, []);

  const resumeMigration = useCallback(() => {
    setIsPaused(false);
    startMigration();
  }, [startMigration]);

  const resetMigration = useCallback(() => {
    setSelectedFile(null);
    setMigrationProgress({
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
    });
    setCurrentPhase(null);
    setIsRunning(false);
    setIsPaused(false);
    setDataAssessment(null);
    setMigrationPlan(null);
    setMigrationResults(null);
    setActiveTab('overview');
  }, []);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            DSM Data Export
          </CardTitle>
          <CardDescription>
            Upload your DSM Software export file to begin the automated migration process
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedFile ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Upload DSM Export File</h3>
                <p className="text-gray-600">
                  Supports CSV, Excel (.xlsx), JSON, and XML formats
                </p>
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls,.json,.xml"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" className="cursor-pointer">
                    Select File
                  </Button>
                </label>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <div className="font-medium">{selectedFile.name}</div>
                  <div className="text-sm text-gray-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </div>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedFile(null)}>
                Remove
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Assessment Results */}
      {dataAssessment && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Data Assessment Results
            </CardTitle>
            <CardDescription>
              Analysis of your DSM data quality and migration readiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {dataAssessment.dataQualityScore}%
                </div>
                <div className="text-sm text-gray-600">Data Quality</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {dataAssessment.completenessScore}%
                </div>
                <div className="text-sm text-gray-600">Completeness</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {dataAssessment.compatibilityScore}%
                </div>
                <div className="text-sm text-gray-600">Compatibility</div>
              </div>
            </div>

            {dataAssessment.recommendations.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Recommendations</h4>
                {dataAssessment.recommendations.slice(0, 3).map((rec, index) => (
                  <Alert key={index}>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      <span className="font-medium">{rec.category}:</span> {rec.description}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Migration Plan */}
      {migrationPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Migration Plan
            </CardTitle>
            <CardDescription>
              Automated migration timeline and resource allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Timeline</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Start Date:</span>
                    <span className="text-sm font-medium">
                      {migrationPlan.timeline.startDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Estimated Completion:</span>
                    <span className="text-sm font-medium">
                      {migrationPlan.timeline.endDate.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Total Duration:</span>
                    <span className="text-sm font-medium">
                      {Math.ceil((migrationPlan.timeline.endDate.getTime() - migrationPlan.timeline.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-3">Resources</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Project Manager:</span>
                    <span className="text-sm font-medium">
                      {migrationPlan.resources.projectManager}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Migration Specialist:</span>
                    <span className="text-sm font-medium">
                      {migrationPlan.resources.migrationSpecialist}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Customer Resources:</span>
                    <span className="text-sm font-medium">
                      {migrationPlan.resources.customerResources.length} people
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <Button 
                onClick={startMigration}
                disabled={isRunning || migrationProgress.status === 'completed'}
                className="w-full"
              >
                {isRunning ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Migration in Progress...
                  </>
                ) : migrationProgress.status === 'completed' ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Migration Completed
                  </>
                ) : isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume Migration
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Automated Migration
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderProgressTab = () => (
    <div className="space-y-6">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Migration Progress
            </span>
            <div className="flex gap-2">
              {isRunning && (
                <Button variant="outline" size="sm" onClick={pauseMigration}>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </Button>
              )}
              {isPaused && (
                <Button variant="outline" size="sm" onClick={resumeMigration}>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={resetMigration}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{migrationProgress.phasesCompleted.length} of {MIGRATION_PHASES.length} phases</span>
            </div>
            <Progress 
              value={(migrationProgress.phasesCompleted.length / MIGRATION_PHASES.length) * 100} 
              className="h-3"
            />
            
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-bold text-green-600">
                  {migrationProgress.phasesCompleted.length}
                </div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div>
                <div className="text-lg font-bold text-yellow-600">
                  {migrationProgress.issues.filter(i => i.status === 'open').length}
                </div>
                <div className="text-sm text-gray-600">Issues</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-600">
                  {migrationProgress.startedAt ? 
                    Math.round((Date.now() - migrationProgress.startedAt.getTime()) / (1000 * 60 * 60)) : 0}
                </div>
                <div className="text-sm text-gray-600">Hours Elapsed</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Phases</CardTitle>
          <CardDescription>
            Detailed progress for each migration phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MIGRATION_PHASES.map((phaseInfo, index) => {
              const isCompleted = migrationProgress.phasesCompleted.includes(phaseInfo.phase);
              const isCurrent = currentPhase === phaseInfo.phase;
              const isPending = !isCompleted && !isCurrent;
              
              const Icon = phaseInfo.icon;
              
              return (
                <div 
                  key={phaseInfo.phase}
                  className={`flex items-center gap-4 p-4 border rounded-lg ${
                    isCurrent ? 'border-blue-200 bg-blue-50' :
                    isCompleted ? 'border-green-200 bg-green-50' :
                    'border-gray-200'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    isCurrent ? 'bg-blue-100' :
                    isCompleted ? 'bg-green-100' :
                    'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : isCurrent ? (
                      <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
                    ) : (
                      <Icon className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{phaseInfo.title}</div>
                    <div className="text-sm text-gray-600">{phaseInfo.description}</div>
                  </div>
                  
                  <Badge variant={
                    isCompleted ? "default" :
                    isCurrent ? "secondary" :
                    "outline"
                  }>
                    {isCompleted ? "Completed" :
                     isCurrent ? "In Progress" :
                     "Pending"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResultsTab = () => (
    <div className="space-y-6">
      {migrationResults ? (
        <>
          {/* Summary Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Migration Results
              </CardTitle>
              <CardDescription>
                Complete summary of the migration process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {migrationResults.summary.migratedRecords.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Migrated Records</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {Math.round(migrationResults.summary.successRate)}%
                  </div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {migrationResults.summary.duration.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">Duration</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600 mb-1">
                    {migrationResults.summary.downtime.toFixed(1)}h
                  </div>
                  <div className="text-sm text-gray-600">Downtime</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Data Integrity:</span>
                  <Badge variant={
                    migrationResults.summary.dataIntegrity === 'verified' ? 'default' :
                    migrationResults.summary.dataIntegrity === 'issues_found' ? 'destructive' :
                    'secondary'
                  }>
                    {migrationResults.summary.dataIntegrity.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>System Performance:</span>
                  <Badge variant={
                    migrationResults.summary.systemPerformance === 'optimal' ? 'default' :
                    migrationResults.summary.systemPerformance === 'acceptable' ? 'secondary' :
                    'outline'
                  }>
                    {migrationResults.summary.systemPerformance}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>User Acceptance:</span>
                  <Badge variant={
                    migrationResults.summary.userAcceptance === 'approved' ? 'default' :
                    migrationResults.summary.userAcceptance === 'pending' ? 'secondary' :
                    'destructive'
                  }>
                    {migrationResults.summary.userAcceptance}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Phase Results */}
          <Card>
            <CardHeader>
              <CardTitle>Phase Results</CardTitle>
              <CardDescription>
                Detailed results for each migration phase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {migrationResults.phaseResults.map((result, index) => (
                  <div key={result.phase} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant={
                        result.status === 'completed' ? 'default' :
                        result.status === 'completed_with_issues' ? 'secondary' :
                        'destructive'
                      }>
                        {result.status.replace('_', ' ')}
                      </Badge>
                      <span className="font-medium">
                        {MIGRATION_PHASES.find(p => p.phase === result.phase)?.title}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{result.recordsProcessed.toLocaleString()} records</div>
                      <div className="text-sm text-gray-600">{Math.round(result.successRate)}% success</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          {migrationResults.recommendations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Post-Migration Recommendations</CardTitle>
                <CardDescription>
                  Suggestions for optimizing your new Pontifex setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {migrationResults.recommendations.map((rec, index) => (
                    <Alert key={index}>
                      <TrendingUp className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{rec.category}:</span> {rec.description}
                            <div className="text-sm text-gray-600 mt-1">
                              Benefits: {rec.benefits}
                            </div>
                          </div>
                          <Badge variant="outline" className="ml-2">
                            {rec.priority}
                          </Badge>
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      ) : migrationProgress.status === 'completed' ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Migration Completed Successfully</h3>
            <p className="text-gray-600 mb-4">
              Your DSM data has been successfully migrated to Pontifex Industries
            </p>
            <Button onClick={() => setActiveTab('progress')}>
              View Migration Details
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Migration Not Started</h3>
            <p className="text-gray-600">
              Start the migration process to see detailed results
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Automated DSM Migration</h2>
        <p className="text-gray-600">
          Seamless data migration from DSM Software to Pontifex Industries platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="progress">
          {renderProgressTab()}
        </TabsContent>

        <TabsContent value="results">
          {renderResultsTab()}
        </TabsContent>
      </Tabs>
    </div>
  );

  // Helper functions
  async function assessDSMData(file: File): Promise<DSMDataAssessment> {
    // Simulate data assessment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      dataQualityScore: Math.floor(Math.random() * 20) + 80, // 80-100%
      completenessScore: Math.floor(Math.random() * 15) + 85, // 85-100%
      consistencyScore: Math.floor(Math.random() * 25) + 75, // 75-100%
      duplicateRecords: Math.floor(Math.random() * 50),
      incompleteRecords: Math.floor(Math.random() * 100),
      dataGaps: [],
      customizations: [],
      compatibilityScore: Math.floor(Math.random() * 10) + 90, // 90-100%
      incompatibleFields: [],
      mappingRequired: [],
      manualReviewNeeded: [],
      recommendations: [
        {
          category: 'data_cleanup',
          priority: 'medium',
          description: 'Clean up duplicate customer records before migration',
          actionRequired: 'Review and merge duplicate customers',
          estimatedTime: '2 hours'
        },
        {
          category: 'preparation',
          priority: 'high',
          description: 'Backup current DSM data before migration',
          actionRequired: 'Create full DSM database backup',
          estimatedTime: '1 hour'
        }
      ],
      estimatedEffort: {
        dataPreparation: 4,
        migration: 8,
        testing: 4,
        training: 6,
        total: 22,
        resourcesRequired: ['Project Manager', 'Migration Specialist'],
        specialistTime: 16,
        customerTime: 6
      },
      riskAssessment: {
        overallRisk: 'low',
        risks: [],
        mitigationStrategies: [],
        contingencyPlans: []
      }
    };
  }

  function generateMigrationPlan(assessment: DSMDataAssessment, companyProfile: any): MigrationPlan {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + assessment.estimatedEffort.total * 60 * 60 * 1000);
    
    return {
      phases: MIGRATION_PHASES.map(phase => ({
        phase: phase.phase,
        name: phase.title,
        description: phase.description,
        duration: 2, // hours
        prerequisites: [],
        deliverables: [`Completed ${phase.title}`],
        successCriteria: [`${phase.title} phase completed successfully`],
        rollbackCriteria: [`Critical error in ${phase.title}`]
      })),
      timeline: {
        startDate,
        endDate,
        phases: MIGRATION_PHASES.map(phase => ({
          phase: phase.phase,
          startDate,
          endDate: new Date(startDate.getTime() + 2 * 60 * 60 * 1000),
          dependencies: [],
          resources: ['Migration Specialist'],
          buffer: 0.5
        })),
        milestones: [
          {
            name: 'Data Assessment Complete',
            date: startDate,
            description: 'Initial data analysis completed',
            deliverables: ['Assessment Report'],
            stakeholders: ['Customer', 'Project Manager']
          }
        ],
        criticalPath: ['data_export', 'data_validation', 'customers_migration']
      },
      resources: {
        projectManager: 'Sarah Johnson',
        migrationSpecialist: 'Mike Chen',
        customerResources: [
          {
            role: 'System Administrator',
            responsibilities: ['Data backup', 'User coordination'],
            timeCommitment: 4
          }
        ]
      },
      dependencies: [],
      rollbackProcedures: []
    };
  }

  async function executePhase(phase: MigrationPhase, options: DSMMigrationOptions): Promise<void> {
    // Simulate phase execution
    const duration = Math.random() * 3000 + 2000; // 2-5 seconds
    await new Promise(resolve => setTimeout(resolve, duration));
    
    // Simulate occasional issues
    if (Math.random() < 0.1) { // 10% chance of issue
      throw new Error(`Simulated error in ${phase} phase`);
    }
  }

  async function completeMigration(): Promise<DSMMigrationResults> {
    const totalRecords = Math.floor(Math.random() * 5000) + 1000;
    const migratedRecords = Math.floor(totalRecords * 0.95);
    const failedRecords = totalRecords - migratedRecords;
    
    return {
      summary: {
        totalRecords,
        migratedRecords,
        failedRecords,
        skippedRecords: 0,
        successRate: (migratedRecords / totalRecords) * 100,
        duration: 8.5,
        downtime: 0.5,
        dataIntegrity: 'verified',
        systemPerformance: 'optimal',
        userAcceptance: 'approved'
      },
      phaseResults: MIGRATION_PHASES.map(phase => ({
        phase: phase.phase,
        status: 'completed' as const,
        duration: 2,
        recordsProcessed: Math.floor(Math.random() * 500) + 100,
        successRate: Math.random() * 10 + 90,
        issues: [],
        notes: `${phase.title} completed successfully`
      })),
      dataValidation: [],
      performanceMetrics: [],
      issues: [],
      recommendations: [
        {
          category: 'optimization',
          priority: 'short_term',
          description: 'Set up automated backup schedules',
          benefits: 'Improved data protection and recovery capabilities',
          effort: 'low',
          timeline: '1 week'
        },
        {
          category: 'training',
          priority: 'immediate',
          description: 'Complete user training modules',
          benefits: 'Faster user adoption and reduced support tickets',
          effort: 'medium',
          timeline: '2 weeks'
        }
      ]
    };
  }
}