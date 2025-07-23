'use client';

import React from 'react';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface BetaOnboardingProps {
  onComplete: (data: BetaTesterData) => void;
  onSkip?: () => void;
}

interface BetaTesterData {
  // Company Information
  companyName: string;
  companySize: 'micro' | 'small' | 'medium' | 'large';
  yearsInBusiness: number;
  primaryWorkTypes: string[];
  
  // Contact Information
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactRole: string;
  
  // Technical Setup
  hasBluetooth: boolean;
  deviceTypes: string[];
  internetReliability: 'excellent' | 'good' | 'fair' | 'poor';
  
  // Testing Preferences
  testingGoals: string[];
  feedbackFrequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  betaGroup: 'alpha' | 'beta' | 'gamma';
  
  // Compliance Requirements
  oshaCompliance: boolean;
  silicaMonitoring: boolean;
  documentationNeeds: string[];
}

const COMPANY_SIZES = [
  { value: 'micro', label: '1-5 employees', description: 'Small operations, simple workflows' },
  { value: 'small', label: '6-20 employees', description: 'Growing business, multiple crews' },
  { value: 'medium', label: '21-100 employees', description: 'Established contractor, complex projects' },
  { value: 'large', label: '100+ employees', description: 'Enterprise operations, advanced requirements' }
];

const WORK_TYPES = [
  'Core Drilling', 'Wall Sawing', 'Slab Sawing', 'Chain Sawing', 'Ring Sawing', 
  'Hand Sawing', 'Breaking & Removal', 'Chipping', 'Joint Sealing', 'Demolition'
];

const TESTING_GOALS = [
  'Improve job efficiency', 'Better safety compliance', 'Equipment tracking',
  'Cost reduction', 'Documentation automation', 'Crew management',
  'Customer reporting', 'Regulatory compliance'
];

const DOCUMENTATION_NEEDS = [
  'OSHA compliance reports', 'Silica exposure tracking', 'Job progress photos',
  'Equipment maintenance logs', 'Time tracking', 'Cost analysis',
  'Customer invoicing', 'Safety incident reports'
];

export default function BetaOnboarding({ onComplete, onSkip }: BetaOnboardingProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<BetaTesterData>>({
    primaryWorkTypes: [],
    deviceTypes: [],
    testingGoals: [],
    documentationNeeds: []
  });
  const { toast } = useToast();

  const totalSteps = 6;
  const progress = (currentStep / totalSteps) * 100;

  const updateFormData = (updates: Partial<BetaTesterData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleArrayToggle = (key: keyof BetaTesterData, value: string) => {
    const currentArray = (formData[key] as string[]) || [];
    const updated = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    updateFormData({ [key]: updated });
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Validate required fields
    if (!formData.companyName || !formData.contactEmail || !formData.companySize) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    // Assign beta group based on company size and work types
    let betaGroup: 'alpha' | 'beta' | 'gamma' = 'beta';
    if (formData.companySize === 'large' || (formData.primaryWorkTypes && formData.primaryWorkTypes.length > 5)) {
      betaGroup = 'alpha';
    } else if (formData.companySize === 'micro') {
      betaGroup = 'gamma';
    }

    const completeData: BetaTesterData = {
      ...formData,
      betaGroup,
      // Set defaults for any missing optional fields
      hasBluetooth: formData.hasBluetooth ?? false,
      oshaCompliance: formData.oshaCompliance ?? false,
      silicaMonitoring: formData.silicaMonitoring ?? false,
      deviceTypes: formData.deviceTypes ?? [],
      testingGoals: formData.testingGoals ?? [],
      documentationNeeds: formData.documentationNeeds ?? []
    } as BetaTesterData;

    onComplete(completeData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Company Information</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName || ''}
                    onChange={(e) => updateFormData({ companyName: e.target.value })}
                    placeholder="Enter your company name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="yearsInBusiness">Years in Business</Label>
                  <Input
                    id="yearsInBusiness"
                    type="number"
                    value={formData.yearsInBusiness || ''}
                    onChange={(e) => updateFormData({ yearsInBusiness: parseInt(e.target.value) || 0 })}
                    placeholder="How long have you been in business?"
                  />
                </div>

                <div>
                  <Label>Company Size *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {COMPANY_SIZES.map((size) => (
                      <Card 
                        key={size.value}
                        className={`cursor-pointer transition-colors ${
                          formData.companySize === size.value 
                            ? 'ring-2 ring-pontifex-blue' 
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => updateFormData({ companySize: size.value as any })}
                      >
                        <CardContent className="p-4">
                          <div className="font-medium">{size.label}</div>
                          <div className="text-sm text-gray-600">{size.description}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Primary Work Types</h3>
              <p className="text-sm text-gray-600 mb-4">
                Select the types of concrete work your company performs most frequently:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {WORK_TYPES.map((workType) => (
                  <div
                    key={workType}
                    className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                      formData.primaryWorkTypes?.includes(workType)
                        ? 'bg-pontifex-blue/10 border-pontifex-blue'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => handleArrayToggle('primaryWorkTypes', workType)}
                  >
                    <Checkbox
                      checked={formData.primaryWorkTypes?.includes(workType) || false}
                      disabled
                    />
                    <span className="text-sm">{workType}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">Contact Name *</Label>
                    <Input
                      id="contactName"
                      value={formData.contactName || ''}
                      onChange={(e) => updateFormData({ contactName: e.target.value })}
                      placeholder="Primary contact person"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactRole">Role/Title</Label>
                    <Input
                      id="contactRole"
                      value={formData.contactRole || ''}
                      onChange={(e) => updateFormData({ contactRole: e.target.value })}
                      placeholder="e.g., Project Manager, Owner"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="contactEmail">Email Address *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail || ''}
                    onChange={(e) => updateFormData({ contactEmail: e.target.value })}
                    placeholder="your.email@company.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="contactPhone">Phone Number</Label>
                  <Input
                    id="contactPhone"
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => updateFormData({ contactPhone: e.target.value })}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Technical Setup</h3>
              <div className="space-y-6">
                <div>
                  <Label>Device Types (select all that apply)</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {['Smartphones', 'Tablets', 'Laptops', 'Desktop Computers'].map((device) => (
                      <div
                        key={device}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.deviceTypes?.includes(device)
                            ? 'bg-pontifex-blue/10 border-pontifex-blue'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleArrayToggle('deviceTypes', device)}
                      >
                        <Checkbox
                          checked={formData.deviceTypes?.includes(device) || false}
                          disabled
                        />
                        <span className="text-sm">{device}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Bluetooth Capability</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Checkbox
                      checked={formData.hasBluetooth || false}
                      onCheckedChange={(checked) => updateFormData({ hasBluetooth: checked as boolean })}
                    />
                    <span className="text-sm">My devices support Bluetooth for beacon tracking</span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="internetReliability">Internet Reliability at Job Sites</Label>
                  <Select
                    value={formData.internetReliability || ''}
                    onValueChange={(value) => updateFormData({ internetReliability: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select reliability level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="excellent">Excellent - Always connected</SelectItem>
                      <SelectItem value="good">Good - Occasional drops</SelectItem>
                      <SelectItem value="fair">Fair - Frequently intermittent</SelectItem>
                      <SelectItem value="poor">Poor - Limited connectivity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Testing Goals & Preferences</h3>
              
              <div className="space-y-6">
                <div>
                  <Label>What are your main goals for testing this platform?</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {TESTING_GOALS.map((goal) => (
                      <div
                        key={goal}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.testingGoals?.includes(goal)
                            ? 'bg-pontifex-blue/10 border-pontifex-blue'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleArrayToggle('testingGoals', goal)}
                      >
                        <Checkbox
                          checked={formData.testingGoals?.includes(goal) || false}
                          disabled
                        />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedbackFrequency">Preferred Feedback Frequency</Label>
                  <Select
                    value={formData.feedbackFrequency || ''}
                    onValueChange={(value) => updateFormData({ feedbackFrequency: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How often would you like to provide feedback?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily - Quick check-ins</SelectItem>
                      <SelectItem value="weekly">Weekly - Detailed reports</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly - Comprehensive reviews</SelectItem>
                      <SelectItem value="monthly">Monthly - Strategic feedback</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Compliance & Documentation</h3>
              
              <div className="space-y-6">
                <div>
                  <Label>Compliance Requirements</Label>
                  <div className="space-y-3 mt-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.oshaCompliance || false}
                        onCheckedChange={(checked) => updateFormData({ oshaCompliance: checked as boolean })}
                      />
                      <span className="text-sm">OSHA compliance reporting required</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        checked={formData.silicaMonitoring || false}
                        onCheckedChange={(checked) => updateFormData({ silicaMonitoring: checked as boolean })}
                      />
                      <span className="text-sm">Silica exposure monitoring required</span>
                    </div>
                  </div>
                </div>

                <div>
                  <Label>Documentation Needs</Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {DOCUMENTATION_NEEDS.map((need) => (
                      <div
                        key={need}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          formData.documentationNeeds?.includes(need)
                            ? 'bg-pontifex-blue/10 border-pontifex-blue'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleArrayToggle('documentationNeeds', need)}
                      >
                        <Checkbox
                          checked={formData.documentationNeeds?.includes(need) || false}
                          disabled
                        />
                        <span className="text-sm">{need}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Review Your Information</h4>
                  <div className="space-y-1 text-sm">
                    <p><strong>Company:</strong> {formData.companyName}</p>
                    <p><strong>Size:</strong> {COMPANY_SIZES.find(s => s.value === formData.companySize)?.label}</p>
                    <p><strong>Contact:</strong> {formData.contactEmail}</p>
                    <p><strong>Work Types:</strong> {formData.primaryWorkTypes?.length || 0} selected</p>
                    <p><strong>Testing Goals:</strong> {formData.testingGoals?.length || 0} selected</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Beta Tester Onboarding</CardTitle>
            <CardDescription>
              Help us customize your testing experience
            </CardDescription>
          </div>
          {onSkip && (
            <Button variant="ghost" onClick={onSkip}>
              Skip Setup
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      </CardHeader>

      <CardContent>
        {renderStep()}
        
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          <Button
            onClick={nextStep}
            className="bg-pontifex-blue hover:bg-pontifex-blue/90"
          >
            {currentStep === totalSteps ? 'Complete Setup' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
