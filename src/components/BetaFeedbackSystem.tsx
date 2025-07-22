import React from 'react';
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star as StarIcon, Bug as BugIcon, Lightbulb as LightbulbIcon, AlertTriangle as AlertTriangleIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FeedbackData {
  // Session Information
  sessionId: string;
  timestamp: Date;
  userId: string;
  betaGroup: 'alpha' | 'beta' | 'gamma';
  
  // Feedback Type
  feedbackType: 'bug' | 'feature' | 'usability' | 'performance' | 'safety' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  
  // Core Feedback
  title: string;
  description: string;
  stepsToReproduce?: string;
  expectedBehavior?: string;
  actualBehavior?: string;
  
  // Ratings (1-10 scale)
  overallRating: number;
  easeOfUse: number;
  featureCompleteness: number;
  performanceRating: number;
  designRating: number;
  
  // Context
  deviceInfo: {
    platform: string;
    browser: string;
    screenSize: string;
    bluetoothSupported: boolean;
  };
  
  // Feature-specific feedback
  featureUsed: string;
  taskCompleted: boolean;
  timeToComplete?: number;
  assistanceNeeded: boolean;
  
  // Attachments
  screenshots: File[];
  logs: string[];
  
  // Follow-up
  allowFollowUp: boolean;
  contactMethod: 'email' | 'phone' | 'in-app';
  urgency: 'can-wait' | 'this-week' | 'urgent' | 'blocking';
}

interface BetaFeedbackSystemProps {
  userId: string;
  betaGroup: 'alpha' | 'beta' | 'gamma';
  currentFeature?: string;
  onSubmit: (feedback: FeedbackData) => void;
  onClose?: () => void;
}

const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report', icon: BugIcon, color: 'text-red-600' },
  { value: 'feature', label: 'Feature Request', icon: LightbulbIcon, color: 'text-blue-600' },
  { value: 'usability', label: 'Usability Issue', icon: AlertTriangleIcon, color: 'text-orange-600' },
  { value: 'performance', label: 'Performance Issue', icon: AlertTriangleIcon, color: 'text-yellow-600' },
  { value: 'safety', label: 'Safety Concern', icon: AlertTriangleIcon, color: 'text-red-700' },
  { value: 'general', label: 'General Feedback', icon: StarIcon, color: 'text-gray-600' }
];

const FEATURES = [
  'Job Creation', 'Work Type Selection', 'Safety Compliance', 'Equipment Tracking',
  'Crew Management', 'Photo Upload', 'Progress Tracking', 'Bluetooth Scanning',
  'Dashboard Overview', 'Calculations Engine', 'Reporting', 'Settings'
];

export default function BetaFeedbackSystem({ 
  userId, 
  betaGroup, 
  currentFeature, 
  onSubmit, 
  onClose 
}: BetaFeedbackSystemProps) {
  const [activeTab, setActiveTab] = useState('feedback');
  const [formData, setFormData] = useState<Partial<FeedbackData>>({
    sessionId: crypto.randomUUID(),
    timestamp: new Date(),
    userId,
    betaGroup,
    feedbackType: 'general',
    priority: 'medium',
    overallRating: 7,
    easeOfUse: 7,
    featureCompleteness: 7,
    performanceRating: 7,
    designRating: 7,
    featureUsed: currentFeature || '',
    taskCompleted: true,
    assistanceNeeded: false,
    allowFollowUp: true,
    contactMethod: 'email',
    urgency: 'can-wait',
    screenshots: [],
    logs: [],
    deviceInfo: {
      platform: navigator.platform,
      browser: navigator.userAgent.split(' ').pop() || 'Unknown',
      screenSize: `${window.screen.width}x${window.screen.height}`,
      bluetoothSupported: 'bluetooth' in navigator
    }
  });

  const { toast } = useToast();

  const updateFormData = (updates: Partial<FeedbackData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleRatingChange = (field: string, value: number[]) => {
    updateFormData({ [field]: value[0] });
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).slice(0, 3); // Limit to 3 files
      updateFormData({ screenshots: [...(formData.screenshots || []), ...newFiles] });
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!formData.title || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please provide a title and description for your feedback.",
        variant: "destructive"
      });
      return;
    }

    // Auto-set priority based on feedback type and ratings
    let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    
    if (formData.feedbackType === 'safety' || formData.urgency === 'blocking') {
      priority = 'critical';
    } else if (formData.feedbackType === 'bug' && formData.overallRating! < 4) {
      priority = 'high';
    } else if (formData.overallRating! >= 8 && formData.feedbackType === 'feature') {
      priority = 'low';
    }

    const completeData: FeedbackData = {
      ...formData,
      priority,
      title: formData.title!,
      description: formData.description!,
      deviceInfo: formData.deviceInfo!
    } as FeedbackData;

    onSubmit(completeData);
    
    toast({
      title: "Feedback Submitted",
      description: "Thank you for your feedback! We'll review it and get back to you soon.",
    });

    if (onClose) onClose();
  };

  const selectedType = FEEDBACK_TYPES.find(type => type.value === formData.feedbackType);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              {selectedType && <selectedType.icon className={`h-5 w-5 ${selectedType.color}`} />}
              Beta Feedback System
            </CardTitle>
            <CardDescription>
              Help us improve the platform with your insights
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{betaGroup.toUpperCase()} Tester</Badge>
            {onClose && (
              <Button variant="ghost"  onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="context">Context</TabsTrigger>
          </TabsList>

          <TabsContent value="feedback" className="space-y-6">
            <div>
              <Label>Feedback Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                {FEEDBACK_TYPES.map((type) => (
                  <Card 
                    key={type.value}
                    className={`cursor-pointer transition-colors ${
                      formData.feedbackType === type.value 
                        ? 'ring-2 ring-pontifex-blue' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => updateFormData({ feedbackType: type.value as any })}
                  >
                    <CardContent className="p-4 text-center">
                      <type.icon className={`h-6 w-6 mx-auto mb-2 ${type.color}`} />
                      <div className="text-sm font-medium">{type.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => updateFormData({ title: e.target.value })}
                placeholder="Brief summary of your feedback"
              />
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                value={formData.description || ''}
                onChange={(e) => updateFormData({ description: e.target.value })}
                placeholder="Detailed description of your feedback, issue, or suggestion"
              />
            </div>

            {formData.feedbackType === 'bug' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="stepsToReproduce">Steps to Reproduce</Label>
                  <Textarea
                    id="stepsToReproduce"
                    rows={3}
                    value={formData.stepsToReproduce || ''}
                    onChange={(e) => updateFormData({ stepsToReproduce: e.target.value })}
                    placeholder="1. Go to...\n2. Click on...\n3. Notice that..."
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expectedBehavior">Expected Behavior</Label>
                    <Textarea
                      id="expectedBehavior"
                      rows={2}
                      value={formData.expectedBehavior || ''}
                      onChange={(e) => updateFormData({ expectedBehavior: e.target.value })}
                      placeholder="What should have happened?"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="actualBehavior">Actual Behavior</Label>
                    <Textarea
                      id="actualBehavior"
                      rows={2}
                      value={formData.actualBehavior || ''}
                      onChange={(e) => updateFormData({ actualBehavior: e.target.value })}
                      placeholder="What actually happened?"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="screenshots">Screenshots (optional)</Label>
              <Input
                id="screenshots"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files)}
                className="mt-1"
              />
              {formData.screenshots && formData.screenshots.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {formData.screenshots.length} file(s) selected
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <div className="space-y-6">
              <div>
                <Label>Overall Experience (1-10)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm w-8">Poor</span>
                  <Slider
                    value={[formData.overallRating || 7]}
                    onValueChange={(value) => handleRatingChange('overallRating', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">Excellent</span>
                  <Badge variant="outline">{formData.overallRating}</Badge>
                </div>
              </div>

              <div>
                <Label>Ease of Use (1-10)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm w-8">Hard</span>
                  <Slider
                    value={[formData.easeOfUse || 7]}
                    onValueChange={(value) => handleRatingChange('easeOfUse', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">Easy</span>
                  <Badge variant="outline">{formData.easeOfUse}</Badge>
                </div>
              </div>

              <div>
                <Label>Feature Completeness (1-10)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm w-8">Missing</span>
                  <Slider
                    value={[formData.featureCompleteness || 7]}
                    onValueChange={(value) => handleRatingChange('featureCompleteness', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">Complete</span>
                  <Badge variant="outline">{formData.featureCompleteness}</Badge>
                </div>
              </div>

              <div>
                <Label>Performance (1-10)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm w-8">Slow</span>
                  <Slider
                    value={[formData.performanceRating || 7]}
                    onValueChange={(value) => handleRatingChange('performanceRating', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">Fast</span>
                  <Badge variant="outline">{formData.performanceRating}</Badge>
                </div>
              </div>

              <div>
                <Label>Design & Interface (1-10)</Label>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm w-8">Poor</span>
                  <Slider
                    value={[formData.designRating || 7]}
                    onValueChange={(value) => handleRatingChange('designRating', value)}
                    max={10}
                    min={1}
                    step={1}
                    className="flex-1"
                  />
                  <span className="text-sm w-12">Great</span>
                  <Badge variant="outline">{formData.designRating}</Badge>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Task Completion</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="featureUsed">Feature You Were Using</Label>
                    <Select
                      value={formData.featureUsed || ''}
                      onValueChange={(value) => updateFormData({ featureUsed: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select the feature" />
                      </SelectTrigger>
                      <SelectContent>
                        {FEATURES.map((feature) => (
                          <SelectItem key={feature} value={feature}>{feature}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.taskCompleted || false}
                      onCheckedChange={(checked) => updateFormData({ taskCompleted: checked as boolean })}
                    />
                    <span className="text-sm">I was able to complete my intended task</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.assistanceNeeded || false}
                      onCheckedChange={(checked) => updateFormData({ assistanceNeeded: checked as boolean })}
                    />
                    <span className="text-sm">I needed help or assistance to complete the task</span>
                  </div>

                  {formData.taskCompleted && (
                    <div>
                      <Label htmlFor="timeToComplete">Time to Complete (minutes)</Label>
                      <Input
                        id="timeToComplete"
                        type="number"
                        value={formData.timeToComplete || ''}
                        onChange={(e) => updateFormData({ timeToComplete: parseInt(e.target.value) || undefined })}
                        placeholder="How long did it take?"
                        className="w-32"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="context" className="space-y-6">
            <div>
              <Label>Follow-up Preferences</Label>
              <div className="space-y-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={formData.allowFollowUp || false}
                    onCheckedChange={(checked) => updateFormData({ allowFollowUp: checked as boolean })}
                  />
                  <span className="text-sm">Allow follow-up questions about this feedback</span>
                </div>

                {formData.allowFollowUp && (
                  <div className="ml-6 space-y-3">
                    <div>
                      <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                      <Select
                        value={formData.contactMethod || 'email'}
                        onValueChange={(value) => updateFormData({ contactMethod: value as any })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="in-app">In-app notification</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="urgency">Response Urgency</Label>
                      <Select
                        value={formData.urgency || 'can-wait'}
                        onValueChange={(value) => updateFormData({ urgency: value as any })}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="can-wait">Can wait - low priority</SelectItem>
                          <SelectItem value="this-week">This week would be good</SelectItem>
                          <SelectItem value="urgent">Urgent - affects my work</SelectItem>
                          <SelectItem value="blocking">Blocking - cannot continue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium mb-3">System Information</h4>
              <div className="space-y-2 text-sm">
                <p><strong>Platform:</strong> {formData.deviceInfo?.platform}</p>
                <p><strong>Browser:</strong> {formData.deviceInfo?.browser}</p>
                <p><strong>Screen Size:</strong> {formData.deviceInfo?.screenSize}</p>
                <p><strong>Bluetooth Support:</strong> {formData.deviceInfo?.bluetoothSupported ? 'Yes' : 'No'}</p>
                <p><strong>Beta Group:</strong> {betaGroup.toUpperCase()}</p>
                <p><strong>Session ID:</strong> {formData.sessionId}</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => {
              const tabs = ['feedback', 'ratings', 'context'];
              const currentIndex = tabs.indexOf(activeTab);
              if (currentIndex > 0) {
                setActiveTab(tabs[currentIndex - 1]);
              }
            }}
            disabled={activeTab === 'feedback'}
          >
            Previous
          </Button>
          
          <div className="flex gap-2">
            {activeTab !== 'context' ? (
              <Button
                onClick={() => {
                  const tabs = ['feedback', 'ratings', 'context'];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) {
                    setActiveTab(tabs[currentIndex + 1]);
                  }
                }}
                variant="outline"
              >
                Next
              </Button>
            ) : null}
            
            <Button
              onClick={handleSubmit}
              className="bg-pontifex-blue hover:bg-pontifex-blue/90"
            >
              Submit Feedback
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}