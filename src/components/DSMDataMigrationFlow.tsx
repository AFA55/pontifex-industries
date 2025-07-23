'use client';

import React from 'react';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Database,
  Download,
  Upload,
  CheckCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  Play,
  Pause,
  Square,
  FileText,
  Shield,
  Zap,
  Target,
  Users,
  Settings,
  BarChart3,
  Activity,
  AlertCircle,
  Info,
  TrendingUp,
  Calendar,
  ArrowRight,
  Eye,
  Filter,
  Search
} from 'lucide-react';
import { 
  DSMOnboardingSession,
  MigrationPhase,
  MigrationStatus,
  MigrationIssue,
  DataFile,
  ValidationResult,
  DSMDataVolume
} from '@/types/dsm-onboarding';
import { useToast } from '@/hooks/use-toast';

interface DSMDataMigrationFlowProps {
  session: DSMOnboardingSession;
  onSessionUpdate: (session: DSMOnboardingSession) => void;
  onMigrationComplete: (session: DSMOnboardingSession) => void;
}

interface MigrationPhaseConfig {
  id: string;
  name: string;
  description: string;
  icon: any;
  estimatedMinutes: number;
  dependencies: string[];
  dataTypes: string[];
  validationChecks: string[];
  rollbackStrategy: string;
}

const MIGRATION_PHASES: MigrationPhaseConfig[] = [
  {
    id: 'preparation',
    name: 'Pre-Migration Preparation',
    description: 'System health checks and backup verification',
    icon: Shield,
    estimatedMinutes: 30,
    dependencies: [],
    dataTypes: ['system_config'],
    validationChecks: ['system_access', 'backup_integrity', 'disk_space'],
    rollbackStrategy: 'No rollback needed - preparation phase only'
  },
  {
    id: 'data_export',
    name: 'DSM Data Export',
    description: 'Extracting data from DSM database',
    icon: Download,
    estimatedMinutes: 45,
    dependencies: ['preparation'],
    dataTypes: ['customers', 'jobs', 'employees', 'equipment', 'financials'],
    validationChecks: ['export_completeness', 'data_integrity', 'file_format'],
    rollbackStrategy: 'Delete exported files and reset export status'
  },
  {
    id: 'data_validation',
    name: 'Data Quality Validation',
    description: 'Analyzing exported data for quality and completeness',
    icon: CheckCircle,
    estimatedMinutes: 20,
    dependencies: ['data_export'],
    dataTypes: ['all_exported_data'],
    validationChecks: ['schema_validation', 'referential_integrity', 'business_rules'],
    rollbackStrategy: 'Mark validation as failed and require re-export'
  },
  {
    id: 'customers_migration',
    name: 'Customer Data Migration',
    description: 'Migrating customer information and contact details',
    icon: Users,
    estimatedMinutes: 15,
    dependencies: ['data_validation'],
    dataTypes: ['customers', 'contacts', 'addresses'],
    validationChecks: ['customer_count', 'contact_validation', 'duplicate_check'],
    rollbackStrategy: 'Delete migrated customers and reset customer sequence'
  },
  {
    id: 'employees_migration',
    name: 'Employee Data Migration',
    description: 'Migrating employee records and user accounts',
    icon: Users,
    estimatedMinutes: 10,
    dependencies: ['customers_migration'],
    dataTypes: ['employees', 'user_accounts', 'permissions'],
    validationChecks: ['employee_count', 'user_account_creation', 'permission_assignment'],
    rollbackStrategy: 'Delete migrated employees and user accounts'
  },
  {
    id: 'work_types_migration',
    name: 'Work Types & Services',
    description: 'Migrating concrete cutting work types and service definitions',
    icon: Settings,
    estimatedMinutes: 15,
    dependencies: ['employees_migration'],
    dataTypes: ['work_types', 'services', 'pricing'],
    validationChecks: ['work_type_mapping', 'pricing_validation', 'service_completeness'],
    rollbackStrategy: 'Reset work types to default configuration'
  },
  {
    id: 'jobs_migration',
    name: 'Job Data Migration',
    description: 'Migrating job records, estimates, and work orders',
    icon: FileText,
    estimatedMinutes: 60,
    dependencies: ['work_types_migration'],
    dataTypes: ['jobs', 'estimates', 'work_orders', 'job_notes'],
    validationChecks: ['job_count', 'customer_association', 'status_mapping'],
    rollbackStrategy: 'Delete migrated jobs and reset job numbering'
  },
  {
    id: 'time_entries_migration',
    name: 'Time Entry Migration',
    description: 'Migrating time tracking and labor data',
    icon: Clock,
    estimatedMinutes: 30,
    dependencies: ['jobs_migration'],
    dataTypes: ['time_entries', 'labor_records', 'overtime'],
    validationChecks: ['time_validation', 'employee_association', 'job_association'],
    rollbackStrategy: 'Delete migrated time entries'
  },
  {
    id: 'materials_migration',
    name: 'Materials & Inventory',
    description: 'Migrating materials, inventory, and equipment records',
    icon: Database,
    estimatedMinutes: 25,
    dependencies: ['time_entries_migration'],
    dataTypes: ['materials', 'inventory', 'equipment', 'maintenance_records'],
    validationChecks: ['inventory_quantities', 'equipment_status', 'material_costs'],
    rollbackStrategy: 'Reset inventory levels and equipment status'
  },
  {
    id: 'financial_migration',
    name: 'Financial Data Migration',
    description: 'Migrating invoices, payments, and financial records',
    icon: BarChart3,
    estimatedMinutes: 40,
    dependencies: ['materials_migration'],
    dataTypes: ['invoices', 'payments', 'expenses', 'financial_reports'],
    validationChecks: ['invoice_totals', 'payment_matching', 'financial_integrity'],
    rollbackStrategy: 'Delete financial records and reset accounting sequences'
  },
  {
    id: 'documents_migration',
    name: 'Document Migration',
    description: 'Migrating documents, photos, and attachments',
    icon: FileText,
    estimatedMinutes: 35,
    dependencies: ['financial_migration'],
    dataTypes: ['documents', 'photos', 'attachments', 'reports'],
    validationChecks: ['file_integrity', 'document_association', 'storage_verification'],
    rollbackStrategy: 'Delete migrated documents and reset storage'
  },
  {
    id: 'validation_testing',
    name: 'Post-Migration Validation',
    description: 'Comprehensive validation of all migrated data',
    icon: Target,
    estimatedMinutes: 45,
    dependencies: ['documents_migration'],
    dataTypes: ['all_migrated_data'],
    validationChecks: ['data_completeness', 'referential_integrity', 'business_rule_validation'],
    rollbackStrategy: 'Full system rollback to pre-migration state'
  },
  {
    id: 'user_acceptance_testing',
    name: 'User Acceptance Testing',
    description: 'Customer validation of migrated data accuracy',
    icon: Eye,
    estimatedMinutes: 120,
    dependencies: ['validation_testing'],
    dataTypes: ['sample_data_sets'],
    validationChecks: ['customer_approval', 'data_accuracy_confirmation', 'workflow_testing'],
    rollbackStrategy: 'Address identified issues and re-run validation'
  },
  {
    id: 'go_live',
    name: 'Go-Live Activation',
    description: 'Activating the new system and finalizing migration',
    icon: Zap,
    estimatedMinutes: 15,
    dependencies: ['user_acceptance_testing'],
    dataTypes: ['system_activation'],
    validationChecks: ['system_availability', 'user_access', 'data_accessibility'],
    rollbackStrategy: 'Emergency rollback to DSM system'
  },
  {
    id: 'post_migration_support',
    name: 'Post-Migration Support',
    description: 'Monitoring and support during transition period',
    icon: Activity,
    estimatedMinutes: 240,
    dependencies: ['go_live'],
    dataTypes: ['system_monitoring'],
    validationChecks: ['system_stability', 'user_adoption', 'performance_metrics'],
    rollbackStrategy: 'Extended support and issue resolution'
  }
];

export default function DSMDataMigrationFlow({
  session,
  onSessionUpdate,
  onMigrationComplete
}: DSMDataMigrationFlowProps) {
  const [currentPhase, setCurrentPhase] = useState<string | null>(null);
  const [migrationStatus, setMigrationStatus] = useState<MigrationStatus>(session.migrationStatus);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhase, setSelectedPhase] = useState<string | null>(null);
  
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const updateMigrationStatus = useCallback((updates: Partial<MigrationStatus>) => {
    const newStatus = { ...migrationStatus, ...updates };
    setMigrationStatus(newStatus);
    
    const updatedSession = {
      ...session,
      migrationStatus: newStatus,
      lastActiveAt: new Date()
    };
    
    onSessionUpdate(updatedSession);
  }, [migrationStatus, session, onSessionUpdate]);

  const addLog = useCallback((message: string, level: 'info' | 'warning' | 'error' | 'success' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${level.toUpperCase()}: ${message}`;
    setLogs(prev => [logEntry, ...prev].slice(0, 100)); // Keep last 100 logs
  }, []);

  const simulateMigrationPhase = useCallback(async (phaseConfig: MigrationPhaseConfig) => {
    setCurrentPhase(phaseConfig.id);
    addLog(`Starting ${phaseConfig.name}`, 'info');
    
    // Simulate phase progress
    const totalSteps = 10;
    const stepDuration = (phaseConfig.estimatedMinutes * 60 * 1000) / totalSteps; // Convert to milliseconds per step
    
    for (let step = 1; step <= totalSteps; step++) {
      if (isPaused) {
        addLog(`Migration paused at ${phaseConfig.name} - Step ${step}/${totalSteps}`, 'warning');
        return false;
      }
      
      await new Promise(resolve => setTimeout(resolve, stepDuration));
      
      const progress = Math.round((step / totalSteps) * 100);
      updateMigrationStatus({
        currentPhaseProgress: progress,
        overallProgress: Math.round(
          ((migrationStatus.phasesCompleted.length + (step / totalSteps)) / MIGRATION_PHASES.length) * 100
        )
      });
      
      addLog(`${phaseConfig.name} - Step ${step}/${totalSteps} completed (${progress}%)`, 'info');
      
      // Simulate occasional warnings or minor issues
      if (step === 5 && Math.random() > 0.7) {
        const issue: MigrationIssue = {
          id: `issue_${Date.now()}`,
          phase: phaseConfig.id,
          severity: 'low',
          category: 'data',
          description: `Minor data format inconsistency detected in ${phaseConfig.name}`,
          impact: 'Data will be automatically cleaned during processing',
          status: 'resolved',
          createdAt: new Date(),
          resolvedAt: new Date(),
          resolution: 'Automatic data formatting applied'
        };
        
        updateMigrationStatus({
          activeIssues: [...migrationStatus.activeIssues, issue]
        });
        
        addLog(`Minor issue detected and resolved: ${issue.description}`, 'warning');
      }
    }
    
    // Complete phase
    updateMigrationStatus({
      phasesCompleted: [...migrationStatus.phasesCompleted, phaseConfig.id],
      currentPhaseProgress: 100,
      recordsMigrated: migrationStatus.recordsMigrated + Math.floor(Math.random() * 1000) + 500
    });
    
    addLog(`${phaseConfig.name} completed successfully`, 'success');
    return true;
  }, [isPaused, migrationStatus, updateMigrationStatus, addLog]);

  const startMigration = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setIsPaused(false);
    addLog('Starting DSM data migration process', 'info');
    
    updateMigrationStatus({
      startedAt: new Date(),
      estimatedCompletion: new Date(Date.now() + MIGRATION_PHASES.reduce((acc, phase) => acc + phase.estimatedMinutes, 0) * 60 * 1000)
    });
    
    try {
      for (const phase of MIGRATION_PHASES) {
        if (migrationStatus.phasesCompleted.includes(phase.id)) {
          addLog(`Skipping already completed phase: ${phase.name}`, 'info');
          continue;
        }
        
        // Check dependencies
        const unmetDependencies = phase.dependencies.filter(dep => 
          !migrationStatus.phasesCompleted.includes(dep)
        );
        
        if (unmetDependencies.length > 0) {
          addLog(`Cannot start ${phase.name}: missing dependencies ${unmetDependencies.join(', ')}`, 'error');
          break;
        }
        
        const success = await simulateMigrationPhase(phase);
        if (!success) {
          break; // Migration was paused or failed
        }
        
        // Brief pause between phases
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      if (migrationStatus.phasesCompleted.length === MIGRATION_PHASES.length) {
        updateMigrationStatus({
          actualCompletion: new Date(),
          overallProgress: 100
        });
        addLog('Migration completed successfully!', 'success');
        onMigrationComplete({
          ...session,
          migrationStatus: {
            ...migrationStatus,
            actualCompletion: new Date(),
            overallProgress: 100
          }
        });
        
        toast({
          title: "Migration Complete!",
          description: "Your DSM data has been successfully migrated to Pontifex Industries.",
        });
      }
    } catch (error) {
      addLog(`Migration error: ${error}`, 'error');
      toast({
        title: "Migration Error",
        description: "An error occurred during migration. Please contact support.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      setCurrentPhase(null);
    }
  }, [isRunning, migrationStatus, simulateMigrationPhase, updateMigrationStatus, addLog, onMigrationComplete, session, toast]);

  const pauseMigration = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    addLog('Migration paused by user', 'warning');
    toast({
      title: "Migration Paused",
      description: "You can resume the migration at any time.",
    });
  }, [addLog, toast]);

  const resumeMigration = useCallback(() => {
    setIsPaused(false);
    startMigration();
    addLog('Migration resumed', 'info');
  }, [startMigration, addLog]);

  const stopMigration = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentPhase(null);
    addLog('Migration stopped by user', 'error');
    toast({
      title: "Migration Stopped",
      description: "The migration has been stopped. Progress has been saved.",
      variant: "destructive"
    });
  }, [addLog, toast]);

  const getPhaseStatus = (phaseId: string) => {
    if (migrationStatus.phasesCompleted.includes(phaseId)) return 'completed';
    if (currentPhase === phaseId) return 'in_progress';
    return 'pending';
  };

  const getPhaseIcon = (phaseConfig: MigrationPhaseConfig) => {
    const status = getPhaseStatus(phaseConfig.id);
    const IconComponent = phaseConfig.icon;
    
    return (
      <div className={`p-2 rounded-full ${
        status === 'completed' ? 'bg-green-100 text-green-600' :
        status === 'in_progress' ? 'bg-blue-100 text-blue-600' :
        'bg-gray-100 text-gray-400'
      }`}>
        <IconComponent className="h-5 w-5" />
      </div>
    );
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Migration Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migration Control Panel
          </CardTitle>
          <CardDescription>
            Control and monitor your DSM to Pontifex data migration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            {!isRunning && !isPaused && (
              <Button onClick={startMigration} className="bg-green-600 hover:bg-green-700">
                <Play className="h-4 w-4 mr-2" />
                Start Migration
              </Button>
            )}
            
            {isRunning && (
              <Button onClick={pauseMigration} variant="outline">
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
            )}
            
            {isPaused && (
              <Button onClick={resumeMigration} className="bg-blue-600 hover:bg-blue-700">
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            
            {(isRunning || isPaused) && (
              <Button onClick={stopMigration} variant="destructive">
                <Square className="h-4 w-4 mr-2" />
                Stop
              </Button>
            )}
          </div>

          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{migrationStatus.overallProgress}%</span>
            </div>
            <Progress value={migrationStatus.overallProgress} className="h-3" />
          </div>

          {currentPhase && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Phase: {MIGRATION_PHASES.find(p => p.id === currentPhase)?.name}</span>
                <span>{migrationStatus.currentPhaseProgress || 0}%</span>
              </div>
              <Progress value={migrationStatus.currentPhaseProgress || 0} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Migration Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {migrationStatus.phasesCompleted.length}
            </div>
            <div className="text-sm text-gray-600">Phases Complete</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {migrationStatus.recordsMigrated.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Records Migrated</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {migrationStatus.activeIssues.length}
            </div>
            <div className="text-sm text-gray-600">Active Issues</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {Math.round(migrationStatus.errorRate * 100) / 100}%
            </div>
            <div className="text-sm text-gray-600">Error Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Migration Timeline</CardTitle>
          <CardDescription>
            Estimated completion times for each migration phase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MIGRATION_PHASES.map((phase, index) => {
              const status = getPhaseStatus(phase.id);
              return (
                <div
                  key={phase.id}
                  className={`flex items-center gap-4 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPhase === phase.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedPhase(selectedPhase === phase.id ? null : phase.id)}
                >
                  {getPhaseIcon(phase)}
                  
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{phase.name}</div>
                        <div className="text-sm text-gray-600">{phase.description}</div>
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          status === 'completed' ? 'default' :
                          status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {status === 'completed' ? 'Complete' :
                           status === 'in_progress' ? 'In Progress' :
                           'Pending'}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          ~{phase.estimatedMinutes}min
                        </div>
                      </div>
                    </div>
                    
                    {selectedPhase === phase.id && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <div className="grid md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <div className="font-medium">Data Types:</div>
                            <div className="text-gray-600">{phase.dataTypes.join(', ')}</div>
                          </div>
                          <div>
                            <div className="font-medium">Validation Checks:</div>
                            <div className="text-gray-600">{phase.validationChecks.join(', ')}</div>
                          </div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">Rollback Strategy:</div>
                          <div className="text-sm text-gray-600">{phase.rollbackStrategy}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLogsTab = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Migration Logs
        </CardTitle>
        <CardDescription>
          Real-time logging of migration activities and events
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96">
          <div className="space-y-1">
            {logs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No logs available. Start the migration to see activity.
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className={`text-sm p-2 rounded font-mono ${
                    log.includes('ERROR') ? 'bg-red-50 text-red-700' :
                    log.includes('WARNING') ? 'bg-yellow-50 text-yellow-700' :
                    log.includes('SUCCESS') ? 'bg-green-50 text-green-700' :
                    'bg-gray-50 text-gray-700'
                  }`}
                >
                  {log}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );

  const renderIssuesTab = () => (
    <div className="space-y-4">
      {migrationStatus.activeIssues.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Active Issues</h3>
            <p className="text-gray-600">All migration processes are running smoothly.</p>
          </CardContent>
        </Card>
      ) : (
        migrationStatus.activeIssues.map((issue) => (
          <Card key={issue.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className={`h-5 w-5 ${
                      issue.severity === 'critical' ? 'text-red-500' :
                      issue.severity === 'high' ? 'text-orange-500' :
                      issue.severity === 'medium' ? 'text-yellow-500' :
                      'text-blue-500'
                    }`} />
                    {issue.description}
                  </CardTitle>
                  <CardDescription>
                    Phase: {issue.phase} • Category: {issue.category}
                  </CardDescription>
                </div>
                <Badge variant={
                  issue.severity === 'critical' ? 'destructive' :
                  issue.severity === 'high' ? 'secondary' :
                  'outline'
                }>
                  {issue.severity}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <div className="font-medium">Impact:</div>
                  <div className="text-sm text-gray-600">{issue.impact}</div>
                </div>
                {issue.resolution && (
                  <div>
                    <div className="font-medium">Resolution:</div>
                    <div className="text-sm text-gray-600">{issue.resolution}</div>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Created: {issue.createdAt.toLocaleString()}</span>
                  <span>Status: {issue.status}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">DSM Data Migration</h2>
        <p className="text-gray-600">
          Automated migration of your data from DSM to Pontifex Industries platform
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Migration Overview</TabsTrigger>
          <TabsTrigger value="logs">Activity Logs</TabsTrigger>
          <TabsTrigger value="issues">Issues & Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="logs">
          {renderLogsTab()}
        </TabsContent>

        <TabsContent value="issues">
          {renderIssuesTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
