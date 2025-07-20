'use client';

import { useState } from 'react';
import { ConcreteJobForm } from '@/components/ConcreteJobForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HardHat, 
  FileText, 
  Shield, 
  CheckCircle2,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ConcreteJobFormDemo() {
  const { toast } = useToast();
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleFormSubmit = (data: any) => {
    console.log('Form submitted:', data);
    setSubmittedData(data);
    
    toast({
      title: 'Job Created Successfully',
      description: 'Concrete cutting job with OSHA compliance plan has been created.',
      action: (
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>View Job</span>
        </div>
      ),
    });
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HardHat className="h-8 w-8 text-pontifex-blue" />
          <h1 className="text-3xl font-bold">Concrete Job Form</h1>
          <Badge className="bg-pontifex-teal-600">
            <Sparkles className="h-3 w-3 mr-1" />
            OSHA Compliant
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Create concrete cutting and drilling jobs with automatic OSHA silica dust compliance
        </p>
      </div>

      {/* Key Features Alert */}
      <Alert className="mb-8 border-pontifex-blue bg-pontifex-blue/5">
        <Shield className="h-4 w-4" />
        <AlertTitle>Intelligent OSHA Compliance System</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Auto-calculates silica dust exposure based on work type, duration, and location</li>
            <li>Generates comprehensive exposure control plans per OSHA standards</li>
            <li>Photo verification for water suppression and respiratory equipment</li>
            <li>Risk-based PPE recommendations and medical surveillance alerts</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Main Content */}
      {!submittedData ? (
        <ConcreteJobForm onSubmit={handleFormSubmit} />
      ) : (
        <div className="space-y-6">
          <Alert>
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Job Created Successfully!</AlertTitle>
            <AlertDescription>
              The concrete cutting job has been created with a comprehensive OSHA compliance plan.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="summary">Job Summary</TabsTrigger>
              <TabsTrigger value="compliance">Compliance Data</TabsTrigger>
              <TabsTrigger value="plan">Control Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Work Type</p>
                      <p className="font-medium">{submittedData.workType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Client</p>
                      <p className="font-medium">{submittedData.clientName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Location</p>
                      <p className="font-medium capitalize">{submittedData.location}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Duration</p>
                      <p className="font-medium">{submittedData.duration} hours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Exposure Assessment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>Exposure Level</span>
                      <Badge variant={submittedData.exposureData.riskLevel === 'low' ? 'default' : 'destructive'}>
                        {submittedData.exposureData.exposureLevel} mg/m³
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Risk Level</span>
                      <Badge className={`uppercase ${
                        submittedData.exposureData.riskLevel === 'low' ? 'bg-green-500' :
                        submittedData.exposureData.riskLevel === 'medium' ? 'bg-yellow-500' :
                        submittedData.exposureData.riskLevel === 'high' ? 'bg-orange-500' :
                        'bg-red-500'
                      }`}>
                        {submittedData.exposureData.riskLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Written Plan Required</span>
                      <span>{submittedData.exposureData.requiresWrittenPlan ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Safety Compliance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {submittedData.safetyCompliance.hearingProtection ? 
                        <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                        <div className="h-4 w-4 rounded-full border-2" />
                      }
                      <span>Hearing Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {submittedData.safetyCompliance.eyeProtection ? 
                        <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                        <div className="h-4 w-4 rounded-full border-2" />
                      }
                      <span>Eye Protection</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {submittedData.safetyCompliance.respiratoryProtection ? 
                        <CheckCircle2 className="h-4 w-4 text-green-500" /> : 
                        <div className="h-4 w-4 rounded-full border-2" />
                      }
                      <span>Respiratory Protection</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="plan">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Generated Exposure Control Plan
                  </CardTitle>
                  <CardDescription>
                    Auto-generated OSHA-compliant exposure control plan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="whitespace-pre-wrap text-sm font-mono bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {submittedData.controlPlan}
                  </pre>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-center">
            <button
              onClick={() => setSubmittedData(null)}
              className="px-6 py-2 bg-pontifex-blue text-white rounded-lg hover:bg-pontifex-blue/90 transition-colors"
            >
              Create Another Job
            </button>
          </div>
        </div>
      )}
    </div>
  );
}