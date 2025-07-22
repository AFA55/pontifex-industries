import React from 'react';
'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  AlertTriangle,
  Shield,
  Droplets,
  Wind,
  Camera,
  FileText,
  MapPin,
  CheckCircle,
  XCircle,
  Upload,
  Loader2,
  Download,
  Eye,
  Sparkles
} from 'lucide-react';
import { ConcreteWorkTypeSelector } from './ConcreteWorkTypeSelector';
import {
  ConcreteWorkType,
  CuttingCalculation,
  CONCRETE_WORK_TYPES
} from '@/types/concrete-work-types';
import { useToast } from '@/hooks/use-toast';
import { createClient } from '@/lib/supabase/client';

const formSchema = z.object({
  workType: z.string().min(1, 'Work type is required'),
  clientName: z.string().min(2, 'Client name is required'),
  siteAddress: z.string().min(5, 'Site address is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  duration: z.number().min(1, 'Duration must be at least 1 hour'),
  location: z.enum(['indoor', 'outdoor']),
  dimensions: z.object({
    length: z.number().min(1, 'Length is required'),
    depth: z.number().min(1, 'Depth is required'),
    width: z.number().optional()
  }),
  dustControl: z.object({
    method: z.enum(['water_suppression', 'vacuum', 'containment', 'combined']),
    waterSupplyVerified: z.boolean(),
    vacuumHepaVerified: z.boolean()
  }),
  safetyCompliance: z.object({
    hearingProtection: z.boolean(),
    eyeProtection: z.boolean(),
    respiratoryProtection: z.boolean(),
    respiratorType: z.enum(['n95', 'p100', 'half_face', 'full_face']).optional(),
    otherPpe: z.array(z.string())
  }),
  photos: z.object({
    waterSystem: z.string().optional(),
    respiratoryEquipment: z.string().optional(),
    siteConditions: z.string().optional(),
    containmentSetup: z.string().optional()
  }),
  notes: z.string().optional()
});

type FormData = z.infer<typeof formSchema>;

interface SilicaExposureData {
  exposureLevel: number; // mg/m³
  permissibleLimit: number; // OSHA PEL: 0.05 mg/m³
  actionLevel: number; // 0.025 mg/m³
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  requiresWrittenPlan: boolean;
  requiredControls: string[];
  estimatedDuration: number; // hours
}

interface ConcreteJobFormProps {
  onSubmit: (data: FormData & { exposureData: SilicaExposureData; controlPlan: string }) => void;
  initialData?: Partial<FormData>;
}

// Create Supabase client outside component to avoid recreating on each render
const supabase = createClient();

export function ConcreteJobForm({ onSubmit, initialData }: ConcreteJobFormProps) {
  const { toast } = useToast();
  const fileInputRefs = {
    waterSystem: useRef<HTMLInputElement>(null),
    respiratoryEquipment: useRef<HTMLInputElement>(null),
    siteConditions: useRef<HTMLInputElement>(null),
    containmentSetup: useRef<HTMLInputElement>(null)
  };

  const [selectedWorkType, setSelectedWorkType] = useState<ConcreteWorkType | undefined>(undefined);
  const [calculation, setCalculation] = useState<CuttingCalculation | undefined>(undefined);
  const [exposureData, setExposureData] = useState<SilicaExposureData | undefined>(undefined);
  const [controlPlan, setControlPlan] = useState<string>('');
  const [uploadingPhotos, setUploadingPhotos] = useState<Record<string, boolean>>({});
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({});

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      location: 'outdoor',
      duration: 1,
      dustControl: {
        method: 'water_suppression',
        waterSupplyVerified: false,
        vacuumHepaVerified: false
      },
      safetyCompliance: {
        hearingProtection: false,
        eyeProtection: false,
        respiratoryProtection: false,
        otherPpe: []
      },
      photos: {}
    }
  });

  const watchedValues = watch();

  // Calculate silica exposure based on work type and conditions
  useEffect(() => {
    if (selectedWorkType && calculation) {
      const workDetails = CONCRETE_WORK_TYPES[selectedWorkType];
      const isIndoor = watchedValues.location === 'indoor';
      const dustMethod = watchedValues.dustControl?.method;
      
      // Base exposure levels (mg/m³) - simplified calculation
      let baseExposure = 0.5; // Default high exposure
      
      // Adjust based on work type
      if (workDetails.calculationFactors.waterUsage && workDetails.calculationFactors.waterUsage > 0) {
        baseExposure = 0.1; // Wet methods reduce exposure
      }
      
      // Adjust based on location
      if (isIndoor) {
        baseExposure *= 2; // Indoor work doubles exposure
      }
      
      // Adjust based on dust control method
      const controlEfficiency = {
        water_suppression: 0.1,
        vacuum: 0.2,
        containment: 0.3,
        combined: 0.05
      };
      
      const actualExposure = baseExposure * (controlEfficiency[dustMethod] || 1);
      const duration = calculation.duration / 60; // Convert to hours
      
      // Determine risk level
      let riskLevel: SilicaExposureData['riskLevel'] = 'low';
      if (actualExposure > 0.25) riskLevel = 'critical';
      else if (actualExposure > 0.1) riskLevel = 'high';
      else if (actualExposure > 0.05) riskLevel = 'medium';
      
      // Required controls based on exposure
      const requiredControls: string[] = [];
      if (actualExposure > 0.025) {
        requiredControls.push('Engineering controls (water/vacuum)');
        requiredControls.push('Respiratory protection');
        requiredControls.push('Written exposure control plan');
      }
      if (actualExposure > 0.05) {
        requiredControls.push('Medical surveillance');
        requiredControls.push('Air monitoring');
        requiredControls.push('Regulated areas');
      }
      if (isIndoor) {
        requiredControls.push('Ventilation system');
        requiredControls.push('Containment barriers');
      }
      
      const exposure: SilicaExposureData = {
        exposureLevel: Math.round(actualExposure * 1000) / 1000,
        permissibleLimit: 0.05,
        actionLevel: 0.025,
        riskLevel,
        requiresWrittenPlan: actualExposure > 0.025,
        requiredControls,
        estimatedDuration: duration
      };
      
      setExposureData(exposure);
      
      // Generate control plan
      generateControlPlan(workDetails, exposure, watchedValues);
    }
  }, [selectedWorkType, calculation, watchedValues.location, watchedValues.dustControl?.method]);

  const generateControlPlan = (
    workType: typeof CONCRETE_WORK_TYPES[ConcreteWorkType],
    exposure: SilicaExposureData,
    formData: FormData
  ) => {
    const plan = `
SILICA DUST EXPOSURE CONTROL PLAN
Generated: ${new Date().toLocaleString()}

PROJECT INFORMATION
-------------------
Work Type: ${workType.name}
Location: ${formData.location === 'indoor' ? 'Indoor' : 'Outdoor'}
Duration: ${exposure.estimatedDuration.toFixed(1)} hours
Client: ${formData.clientName || 'TBD'}
Site: ${formData.siteAddress || 'TBD'}

EXPOSURE ASSESSMENT
------------------
Estimated Exposure Level: ${exposure.exposureLevel} mg/m³
OSHA PEL: ${exposure.permissibleLimit} mg/m³
Action Level: ${exposure.actionLevel} mg/m³
Risk Level: ${exposure.riskLevel.toUpperCase()}

REQUIRED ENGINEERING CONTROLS
----------------------------
Primary Method: ${formData.dustControl?.method.replace(/_/g, ' ').toUpperCase()}
${exposure.requiredControls.map(control => `• ${control}`).join('\n')}

WORK PRACTICE CONTROLS
---------------------
• Minimize cutting time through proper planning
• Use wet cutting methods when possible
• Position workers upwind of dust sources
• Limit access to work area
• Clean up with HEPA vacuum or wet methods
${formData.location === 'indoor' ? '• Ensure adequate ventilation\n• Install plastic barriers' : ''}

RESPIRATORY PROTECTION
---------------------
Required: ${exposure.exposureLevel > 0.05 ? 'YES' : 'RECOMMENDED'}
Type: ${formData.safetyCompliance?.respiratorType?.replace(/_/g, ' ').toUpperCase() || 'N95 MINIMUM'}
• Ensure proper fit testing
• Train workers on proper use
• Establish respiratory protection program

PPE REQUIREMENTS
---------------
${formData.safetyCompliance?.hearingProtection ? '✓' : '✗'} Hearing Protection
${formData.safetyCompliance?.eyeProtection ? '✓' : '✗'} Eye Protection
${formData.safetyCompliance?.respiratoryProtection ? '✓' : '✗'} Respiratory Protection
${formData.safetyCompliance?.otherPpe?.map(ppe => `✓ ${ppe}`).join('\n') || ''}

HOUSEKEEPING
-----------
• No dry sweeping or compressed air
• Use HEPA vacuum or wet methods only
• Dispose of slurry according to local regulations
• Clean tools and equipment before leaving site

TRAINING REQUIREMENTS
-------------------
• Silica hazard awareness
• Proper use of engineering controls
• PPE selection and use
• Exposure control plan review

MEDICAL SURVEILLANCE
------------------
Required: ${exposure.exposureLevel > 0.025 ? 'YES - Employees exposed above action level for 30+ days/year' : 'NO'}
${exposure.exposureLevel > 0.025 ? `• Initial medical exam
• Periodic exams every 3 years
• Include chest X-ray and pulmonary function test` : ''}

RECORDKEEPING
------------
• Maintain exposure records for 30 years
• Medical records for duration of employment + 30 years
• Training records for 3 years
• Daily inspection logs

EMERGENCY PROCEDURES
------------------
• Eye wash stations available on site
• First aid kit location: [SPECIFY]
• Emergency contact: [SPECIFY]
• Nearest medical facility: [SPECIFY]

PLAN APPROVAL
------------
Prepared by: ___________________ Date: ___________
Reviewed by: ___________________ Date: ___________
    `;
    
    setControlPlan(plan);
  };

  const handlePhotoUpload = async (
    type: keyof typeof fileInputRefs,
    file: File
  ) => {
    if (!file) return;

    setUploadingPhotos(prev => ({ ...prev, [type]: true }));

    try {
      // Create unique filename
      const filename = `concrete-jobs/${Date.now()}-${type}-${file.name}`;
      
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from('safety-photos')
        .upload(filename, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('safety-photos')
        .getPublicUrl(filename);

      setPhotoUrls(prev => ({ ...prev, [type]: publicUrl }));
      setValue(`photos.${type}`, publicUrl);
      
      toast({
        title: 'Photo uploaded',
        description: `${type.replace(/([A-Z])/g, ' $1').trim()} photo uploaded successfully`,
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload photo. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploadingPhotos(prev => ({ ...prev, [type]: false }));
    }
  };

  const onFormSubmit = async (data: FormData) => {
    if (!exposureData || !controlPlan) {
      toast({
        title: 'Missing data',
        description: 'Please complete all required fields and calculations',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({
      ...data,
      exposureData,
      controlPlan
    });
  };

  const getRiskLevelStyles = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Work Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Concrete Work Type</CardTitle>
          <CardDescription>
            Choose the type of concrete cutting or drilling work
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ConcreteWorkTypeSelector
            selectedType={selectedWorkType}
            onSelect={(workType, calc) => {
              setSelectedWorkType(workType);
              setCalculation(calc || undefined);
              setValue('workType', workType);
            }}
          />
        </CardContent>
      </Card>

      {/* Job Details */}
      {selectedWorkType && (
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Client Name</Label>
                <Input
                  id="clientName"
                  {...register('clientName')}
                  placeholder="Enter client name"
                />
                {errors.clientName && (
                  <p className="text-sm text-red-500 mt-1">{errors.clientName.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="scheduledDate">Scheduled Date</Label>
                <Input
                  id="scheduledDate"
                  type="date"
                  {...register('scheduledDate')}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-500 mt-1">{errors.scheduledDate.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="siteAddress">Site Address</Label>
              <Textarea
                id="siteAddress"
                {...register('siteAddress')}
                placeholder="Enter complete site address"
                rows={2}
              />
              {errors.siteAddress && (
                <p className="text-sm text-red-500 mt-1">{errors.siteAddress.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location">Work Location</Label>
                <Select
                  onValueChange={(value) => setValue('location', value as 'indoor' | 'outdoor')}
                  defaultValue={watchedValues.location}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="outdoor">
                      <div className="flex items-center gap-2">
                        <Wind className="h-4 w-4" />
                        Outdoor
                      </div>
                    </SelectItem>
                    <SelectItem value="indoor">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        Indoor
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="duration">Estimated Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  {...register('duration', { valueAsNumber: true })}
                  placeholder="Hours"
                />
                {errors.duration && (
                  <p className="text-sm text-red-500 mt-1">{errors.duration.message}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OSHA Compliance & Exposure Assessment */}
      {exposureData && (
        <Card className={`border-2 ${getRiskLevelStyles(exposureData.riskLevel)}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Silica Exposure Assessment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className={getRiskLevelStyles(exposureData.riskLevel)}>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Risk Level: {exposureData.riskLevel.toUpperCase()}</AlertTitle>
              <AlertDescription>
                Estimated exposure: {exposureData.exposureLevel} mg/m³ 
                ({(exposureData.exposureLevel / exposureData.permissibleLimit * 100).toFixed(0)}% of OSHA PEL)
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Exposure Levels</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Current Exposure</span>
                  <span className="font-mono text-sm">{exposureData.exposureLevel} mg/m³</span>
                </div>
                <Progress 
                  value={(exposureData.exposureLevel / exposureData.permissibleLimit) * 100} 
                  className="h-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Action Level: {exposureData.actionLevel}</span>
                  <span>OSHA PEL: {exposureData.permissibleLimit}</span>
                </div>
              </div>
            </div>

            {exposureData.requiresWrittenPlan && (
              <Alert>
                <FileText className="h-4 w-4" />
                <AlertTitle>Written Exposure Control Plan Required</AlertTitle>
                <AlertDescription>
                  This work requires a written exposure control plan per OSHA regulations.
                  A plan has been automatically generated below.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Label>Required Controls</Label>
              <div className="mt-2 space-y-1">
                {exposureData.requiredControls.map((control, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-500" />
                    <span className="text-sm">{control}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Dust Control Methods */}
      {selectedWorkType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Droplets className="h-5 w-5" />
              Dust Control Methods
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Primary Control Method</Label>
              <Select
                onValueChange={(value) => setValue('dustControl.method', value as 'water_suppression' | 'vacuum' | 'containment' | 'combined')}
                defaultValue={watchedValues.dustControl?.method}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="water_suppression">Water Suppression</SelectItem>
                  <SelectItem value="vacuum">HEPA Vacuum System</SelectItem>
                  <SelectItem value="containment">Containment Barriers</SelectItem>
                  <SelectItem value="combined">Combined Methods</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Droplets className="h-4 w-4" />
                  <span>Water supply verified and adequate</span>
                </div>
                <input
                  type="checkbox"
                  {...register('dustControl.waterSupplyVerified')}
                  className="h-5 w-5"
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Wind className="h-4 w-4" />
                  <span>HEPA vacuum system tested</span>
                </div>
                <input
                  type="checkbox"
                  {...register('dustControl.vacuumHepaVerified')}
                  className="h-5 w-5"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Safety Equipment & PPE */}
      {selectedWorkType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Safety Equipment & PPE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium">Required PPE</h4>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Hearing Protection</span>
                    <input
                      type="checkbox"
                      {...register('safetyCompliance.hearingProtection')}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Eye Protection</span>
                    <input
                      type="checkbox"
                      {...register('safetyCompliance.eyeProtection')}
                      className="h-5 w-5"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <span>Respiratory Protection</span>
                    <input
                      type="checkbox"
                      {...register('safetyCompliance.respiratoryProtection')}
                      className="h-5 w-5"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Respirator Type</h4>
                <Select
                  onValueChange={(value) => setValue('safetyCompliance.respiratorType', value as 'n95' | 'p100' | 'half_face' | 'full_face')}
                  disabled={!watchedValues.safetyCompliance?.respiratoryProtection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select respirator type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="n95">N95 Disposable</SelectItem>
                    <SelectItem value="p100">P100 Filter</SelectItem>
                    <SelectItem value="half_face">Half-Face Respirator</SelectItem>
                    <SelectItem value="full_face">Full-Face Respirator</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2">
                  <Label>Additional PPE</Label>
                  <div className="flex flex-wrap gap-2">
                    {['Hard Hat', 'Safety Vest', 'Steel-toe Boots', 'Cut-resistant Gloves'].map((ppe) => (
                      <Badge
                        key={ppe}
                        variant={watchedValues.safetyCompliance?.otherPpe?.includes(ppe) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const current = watchedValues.safetyCompliance?.otherPpe || [];
                          const updated = current.includes(ppe)
                            ? current.filter(p => p !== ppe)
                            : [...current, ppe];
                          setValue('safetyCompliance.otherPpe', updated);
                        }}
                      >
                        {ppe}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Photo Verification */}
      {selectedWorkType && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo Verification
            </CardTitle>
            <CardDescription>
              Upload photos to verify safety equipment and site conditions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries({
                waterSystem: 'Water Suppression System',
                respiratoryEquipment: 'Respiratory Equipment',
                siteConditions: 'Site Conditions',
                containmentSetup: 'Containment Setup'
              }).map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <div className="border-2 border-dashed rounded-lg p-4 text-center">
                    {photoUrls[key] ? (
                      <div className="space-y-2">
                        <img 
                          src={photoUrls[key]} 
                          alt={label}
                          className="w-full h-32 object-cover rounded"
                        />
                        <div className="flex gap-2 justify-center">
                          <Button
                            type="button"
                            
                            variant="outline"
                            onClick={() => window.open(photoUrls[key], '_blank')}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          <Button
                            type="button"
                            
                            variant="outline"
                            onClick={() => {
                              setPhotoUrls(prev => ({ ...prev, [key]: '' }));
                              setValue(`photos.${key as keyof typeof fileInputRefs}`, '');
                            }}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <input
                          ref={fileInputRefs[key as keyof typeof fileInputRefs]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(key as keyof typeof fileInputRefs, file);
                          }}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRefs[key as keyof typeof fileInputRefs].current?.click()}
                          disabled={uploadingPhotos[key]}
                        >
                          {uploadingPhotos[key] ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Photo
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Control Plan */}
      {controlPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Exposure Control Plan
            </CardTitle>
            <CardDescription>
              Auto-generated based on work type, duration, and location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <ScrollArea className="h-96 w-full border rounded p-4">
                <pre className="whitespace-pre-wrap font-mono text-sm">{controlPlan}</pre>
              </ScrollArea>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  AI-generated compliance plan
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const blob = new Blob([controlPlan], { type: 'text/plain' });
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `exposure-control-plan-${new Date().toISOString().split('T')[0]}.txt`;
                    a.click();
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Plan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Notes */}
      {selectedWorkType && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              {...register('notes')}
              placeholder="Any additional notes or special instructions..."
              rows={4}
            />
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      {selectedWorkType && (
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => reset()}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating Job...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Create Job with Compliance Plan
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}