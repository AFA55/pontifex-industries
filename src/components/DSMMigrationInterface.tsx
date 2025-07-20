'use client';

import { useState, useRef, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Upload, 
  FileText, 
  Users, 
  Briefcase, 
  Clock, 
  Package, 
  Settings,
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Download,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Database,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { DSMMigrationOptions, DSMMigrationStatus, DSMValidationResult } from '@/types/dsm-data';
import { dsmMigrationService } from '@/lib/dsm-migration-service';
import { useToast } from '@/hooks/use-toast';

interface DSMMigrationInterfaceProps {
  companyId: string;
  userId: string;
  onMigrationComplete?: (status: DSMMigrationStatus) => void;
}

export default function DSMMigrationInterface({ 
  companyId, 
  userId, 
  onMigrationComplete 
}: DSMMigrationInterfaceProps) {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationResult, setValidationResult] = useState<DSMValidationResult | null>(null);
  const [migrationOptions, setMigrationOptions] = useState<DSMMigrationOptions>({
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
  });
  const [migrationStatus, setMigrationStatus] = useState<DSMMigrationStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = useCallback(async (file: File) => {
    setSelectedFile(file);
    setValidationResult(null);
    setIsUploading(true);

    try {
      // Validate the file
      setIsValidating(true);
      const validation = await dsmMigrationService.validateMigration(file, migrationOptions);
      setValidationResult(validation);
      
      if (validation.isValid) {
        toast({
          title: "File validated successfully",
          description: `Ready to migrate data from ${file.name}`,
        });
        setActiveTab('configure');
      } else {
        toast({
          title: "Validation errors found",
          description: `${validation.errors.length} issues need attention`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Validation failed",
        description: "Unable to process the selected file",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setIsValidating(false);
    }
  }, [migrationOptions, toast]);

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const startMigration = async () => {
    if (!selectedFile || !validationResult) return;

    setIsMigrating(true);
    try {
      const status = await dsmMigrationService.startMigration(
        selectedFile,
        migrationOptions,
        companyId,
        userId
      );
      setMigrationStatus(status);
      setActiveTab('progress');
      
      if (onMigrationComplete) {
        onMigrationComplete(status);
      }
    } catch (error) {
      toast({
        title: "Migration failed",
        description: "Unable to start the migration process",
        variant: "destructive",
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const resetMigration = () => {
    setSelectedFile(null);
    setValidationResult(null);
    setMigrationStatus(null);
    setActiveTab('upload');
    setShowReport(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header with glassmorphism */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Database className="h-8 w-8 text-pontifex-blue" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pontifex-blue to-pontifex-teal-600 bg-clip-text text-transparent">
                  DSM Migration
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {migrationStatus && (
                <Button
                  onClick={resetMigration}
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Start Over
                </Button>
              )}
              
              <Button 
                variant="outline"
                size="sm"
                className="hidden sm:flex"
              >
                <Eye className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Progress Overview */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Migration Progress</h2>
            <div className="flex items-center space-x-2">
              {selectedFile && (
                <Badge variant="outline" className="bg-white/50">
                  {selectedFile.name}
                </Badge>
              )}
              {migrationStatus && (
                <Badge 
                  className={`${
                    migrationStatus.status === 'completed' 
                      ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                      : migrationStatus.status === 'failed'
                      ? 'bg-red-500/10 text-red-600 border-red-500/20'
                      : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                  } border`}
                >
                  {migrationStatus.status}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border ${
                activeTab === 'upload' || selectedFile
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Upload className="h-5 w-5" />
                <span className="font-medium">Upload</span>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border ${
                validationResult
                  ? 'bg-green-500/10 border-green-500/20 text-green-600'
                  : isValidating
                  ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-600'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <CheckCircle className={`h-5 w-5 ${isValidating ? 'animate-spin' : ''}`} />
                <span className="font-medium">Validate</span>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border ${
                activeTab === 'configure' && validationResult
                  ? 'bg-purple-500/10 border-purple-500/20 text-purple-600'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span className="font-medium">Configure</span>
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className={`p-4 rounded-xl border ${
                migrationStatus
                  ? migrationStatus.status === 'completed'
                    ? 'bg-green-500/10 border-green-500/20 text-green-600'
                    : migrationStatus.status === 'failed'
                    ? 'bg-red-500/10 border-red-500/20 text-red-600'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                  : isMigrating
                  ? 'bg-blue-500/10 border-blue-500/20 text-blue-600'
                  : 'bg-gray-100 border-gray-200 text-gray-400'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Play className={`h-5 w-5 ${isMigrating ? 'animate-pulse' : ''}`} />
                <span className="font-medium">Migrate</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/50 rounded-t-2xl border-b border-white/20">
              <TabsTrigger value="upload" className="min-h-[44px]">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </TabsTrigger>
              <TabsTrigger value="configure" disabled={!validationResult} className="min-h-[44px]">
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </TabsTrigger>
              <TabsTrigger value="progress" disabled={!migrationStatus} className="min-h-[44px]">
                <Play className="h-4 w-4 mr-2" />
                Progress
              </TabsTrigger>
              <TabsTrigger value="report" disabled={!migrationStatus} className="min-h-[44px]">
                <FileText className="h-4 w-4 mr-2" />
                Report
              </TabsTrigger>
            </TabsList>

            {/* Upload Tab */}
            <TabsContent value="upload" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Upload DSM Export File
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Select your DSM export file to begin the migration process. Supported formats: .csv, .xlsx, .json
                  </p>
                </div>

                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:border-pontifex-blue hover:bg-blue-50/50 transition-colors cursor-pointer"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.json"
                    onChange={handleFileInputChange}
                  />
                  
                  {isUploading ? (
                    <div className="space-y-4">
                      <RefreshCw className="h-12 w-12 text-pontifex-blue mx-auto animate-spin" />
                      <p className="text-lg font-medium text-pontifex-blue">
                        {isValidating ? 'Validating file...' : 'Processing file...'}
                      </p>
                    </div>
                  ) : selectedFile ? (
                    <div className="space-y-4">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">{selectedFile.name}</p>
                        <p className="text-gray-600">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedFile(null);
                          setValidationResult(null);
                        }}
                        className="min-h-[44px]"
                      >
                        Choose Different File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                      <div>
                        <p className="text-lg font-medium text-gray-900">
                          Drag and drop your DSM file here
                        </p>
                        <p className="text-gray-600">or click to browse</p>
                      </div>
                      <Button 
                        className="bg-gradient-to-r from-pontifex-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 min-h-[44px]"
                      >
                        Select File
                      </Button>
                    </div>
                  )}
                </div>

                {validationResult && (
                  <Alert className={`${
                    validationResult.isValid 
                      ? 'border-green-500/20 bg-green-500/10' 
                      : 'border-red-500/20 bg-red-500/10'
                  }`}>
                    <div className="flex items-start space-x-2">
                      {validationResult.isValid ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <AlertDescription className={
                          validationResult.isValid ? 'text-green-700' : 'text-red-700'
                        }>
                          {validationResult.isValid ? (
                            <div>
                              <p className="font-medium mb-2">File validation successful!</p>
                              <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>Records found: {validationResult.recordCounts.total}</div>
                                <div>Jobs: {validationResult.recordCounts.jobs}</div>
                                <div>Employees: {validationResult.recordCounts.employees}</div>
                                <div>Customers: {validationResult.recordCounts.customers}</div>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <p className="font-medium mb-2">Validation failed</p>
                              <ul className="list-disc list-inside text-sm space-y-1">
                                {validationResult.errors.slice(0, 3).map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                                {validationResult.errors.length > 3 && (
                                  <li>...and {validationResult.errors.length - 3} more issues</li>
                                )}
                              </ul>
                            </div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}

                {validationResult?.isValid && (
                  <div className="flex justify-center">
                    <Button
                      onClick={() => setActiveTab('configure')}
                      className="bg-gradient-to-r from-pontifex-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 min-h-[44px]"
                    >
                      Configure Migration
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Configure Tab */}
            <TabsContent value="configure" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Configure Migration Settings
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Customize how your DSM data will be imported into Pontifex Industries
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Data Types */}
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Package className="h-5 w-5" />
                        <span>Data Types</span>
                      </CardTitle>
                      <CardDescription>
                        Select which data types to migrate
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'migrateJobs', label: 'Jobs', icon: Briefcase },
                          { key: 'migrateEmployees', label: 'Employees', icon: Users },
                          { key: 'migrateCustomers', label: 'Customers', icon: Users },
                          { key: 'migrateTimeEntries', label: 'Time Entries', icon: Clock },
                          { key: 'migrateMaterials', label: 'Materials', icon: Package },
                          { key: 'migrateWorkTypes', label: 'Work Types', icon: Settings }
                        ].map(({ key, label, icon: Icon }) => (
                          <div key={key} className="flex items-center space-x-2">
                            <Checkbox
                              id={key}
                              checked={migrationOptions[key as keyof DSMMigrationOptions] as boolean}
                              onCheckedChange={(checked) => 
                                setMigrationOptions(prev => ({ ...prev, [key]: checked }))
                              }
                            />
                            <Label htmlFor={key} className="flex items-center space-x-2 cursor-pointer">
                              <Icon className="h-4 w-4" />
                              <span>{label}</span>
                            </Label>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Options */}
                  <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Settings className="h-5 w-5" />
                        <span>Migration Options</span>
                      </CardTitle>
                      <CardDescription>
                        Configure how conflicts are handled
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="skipDuplicates"
                            checked={migrationOptions.skipDuplicates}
                            onCheckedChange={(checked) => 
                              setMigrationOptions(prev => ({ ...prev, skipDuplicates: checked as boolean }))
                            }
                          />
                          <Label htmlFor="skipDuplicates" className="cursor-pointer">
                            Skip duplicate records
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="updateExisting"
                            checked={migrationOptions.updateExisting}
                            onCheckedChange={(checked) => 
                              setMigrationOptions(prev => ({ ...prev, updateExisting: checked as boolean }))
                            }
                          />
                          <Label htmlFor="updateExisting" className="cursor-pointer">
                            Update existing records
                          </Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="createBackup"
                            checked={migrationOptions.createBackup}
                            onCheckedChange={(checked) => 
                              setMigrationOptions(prev => ({ ...prev, createBackup: checked as boolean }))
                            }
                          />
                          <Label htmlFor="createBackup" className="cursor-pointer">
                            Create backup before migration
                          </Label>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor="batchSize">Batch Size</Label>
                          <Input
                            id="batchSize"
                            type="number"
                            value={migrationOptions.batchSize}
                            onChange={(e) => 
                              setMigrationOptions(prev => ({ 
                                ...prev, 
                                batchSize: parseInt(e.target.value) || 100 
                              }))
                            }
                            className="bg-white/50 min-h-[44px]"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="maxErrors">Max Errors</Label>
                          <Input
                            id="maxErrors"
                            type="number"
                            value={migrationOptions.maxErrors}
                            onChange={(e) => 
                              setMigrationOptions(prev => ({ 
                                ...prev, 
                                maxErrors: parseInt(e.target.value) || 50 
                              }))
                            }
                            className="bg-white/50 min-h-[44px]"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setActiveTab('upload')}
                    className="min-h-[44px]"
                  >
                    Back to Upload
                  </Button>
                  <Button
                    onClick={startMigration}
                    disabled={isMigrating}
                    className="bg-gradient-to-r from-pontifex-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 min-h-[44px]"
                  >
                    {isMigrating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Starting Migration...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Start Migration
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Progress Tab */}
            <TabsContent value="progress" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Migration in Progress
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Please do not close this window while the migration is running
                  </p>
                </div>

                {migrationStatus && (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-pontifex-blue mb-2">
                        {migrationStatus.progress}%
                      </div>
                      <Progress value={migrationStatus.progress} className="w-full h-3" />
                      <p className="text-gray-600 mt-2">
                        {migrationStatus.currentStep} • {migrationStatus.recordsProcessed} of {migrationStatus.totalRecords} records
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 p-4 text-center"
                      >
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                          {migrationStatus.successCount}
                        </div>
                        <div className="text-sm text-gray-600">Successful</div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 p-4 text-center"
                      >
                        <XCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                          {migrationStatus.errorCount}
                        </div>
                        <div className="text-sm text-gray-600">Errors</div>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 p-4 text-center"
                      >
                        <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                        <div className="text-2xl font-bold text-gray-900">
                          {migrationStatus.warningCount}
                        </div>
                        <div className="text-sm text-gray-600">Warnings</div>
                      </motion.div>
                    </div>

                    {migrationStatus.status === 'completed' && (
                      <Alert className="border-green-500/20 bg-green-500/10">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <AlertDescription className="text-green-700">
                          <p className="font-medium mb-2">Migration completed successfully!</p>
                          <p>Your DSM data has been imported into Pontifex Industries. Click "View Report" to see detailed results.</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    {migrationStatus.status === 'failed' && (
                      <Alert className="border-red-500/20 bg-red-500/10">
                        <XCircle className="h-5 w-5 text-red-600" />
                        <AlertDescription className="text-red-700">
                          <p className="font-medium mb-2">Migration failed</p>
                          <p>The migration process encountered critical errors. Please review the report for details.</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-center space-x-4">
                      {migrationStatus.status !== 'running' && (
                        <Button
                          onClick={() => setActiveTab('report')}
                          className="bg-gradient-to-r from-pontifex-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 min-h-[44px]"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Report
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Report Tab */}
            <TabsContent value="report" className="p-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Migration Report
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Detailed summary of the migration process
                  </p>
                </div>

                {migrationStatus && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-gray-900 mb-1">
                            {migrationStatus.totalRecords}
                          </div>
                          <div className="text-sm text-gray-600">Total Records</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 mb-1">
                            {migrationStatus.successCount}
                          </div>
                          <div className="text-sm text-gray-600">Successful</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600 mb-1">
                            {migrationStatus.errorCount}
                          </div>
                          <div className="text-sm text-gray-600">Errors</div>
                        </CardContent>
                      </Card>
                      
                      <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-yellow-600 mb-1">
                            {migrationStatus.warningCount}
                          </div>
                          <div className="text-sm text-gray-600">Warnings</div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card className="bg-white/80 backdrop-blur-sm border-white/40">
                      <CardHeader>
                        <CardTitle>Migration Details</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label>Status</Label>
                            <Badge 
                              className={`ml-2 ${
                                migrationStatus.status === 'completed' 
                                  ? 'bg-green-500/10 text-green-600 border-green-500/20' 
                                  : migrationStatus.status === 'failed'
                                  ? 'bg-red-500/10 text-red-600 border-red-500/20'
                                  : 'bg-blue-500/10 text-blue-600 border-blue-500/20'
                              } border`}
                            >
                              {migrationStatus.status}
                            </Badge>
                          </div>
                          
                          <div>
                            <Label>Duration</Label>
                            <p className="text-gray-600 mt-1">
                              {migrationStatus.startTime && migrationStatus.endTime && 
                                `${Math.round((new Date(migrationStatus.endTime).getTime() - new Date(migrationStatus.startTime).getTime()) / 1000)}s`
                              }
                            </p>
                          </div>
                          
                          <div>
                            <Label>Current Step</Label>
                            <p className="text-gray-600 mt-1">{migrationStatus.currentStep}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <div className="flex justify-center space-x-4">
                      <Button
                        variant="outline"
                        onClick={() => {
                          // Download report logic here
                          toast({
                            title: "Downloading report",
                            description: "Migration report will be downloaded shortly",
                          });
                        }}
                        className="min-h-[44px]"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Report
                      </Button>
                      
                      <Button
                        onClick={resetMigration}
                        className="bg-gradient-to-r from-pontifex-blue to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg hover:shadow-blue-500/25 min-h-[44px]"
                      >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Start New Migration
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}