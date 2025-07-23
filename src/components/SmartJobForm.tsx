'use client';

import React from 'react';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Mic, 
  MicOff,
  Calendar,
  Clock,
  Users,
  MapPin,
  Wrench,
  Shield,
  FileText,
  Save,
  Send,
  Brain,
  Sparkles,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Zap,
  Plus,
  X,
  Camera,
  Bluetooth,
  Timer,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONCRETE_WORK_TYPES } from '@/types/concrete-work-types';
import { useToast } from '@/hooks/use-toast';

interface JobFormData {
  workType: string;
  title: string;
  client: string;
  location: string;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedCrew: string[];
  equipment: string[];
  safetyRequirements: string[];
  specialInstructions: string;
  estimatedCost?: number;
}

interface AIsuggestion {
  field: string;
  value: any;
  confidence: number;
  reason: string;
}

const CREW_MEMBERS = [
  { id: '1', name: 'John Smith', role: 'Lead Operator', skills: ['wall_saw', 'core_drill'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
  { id: '2', name: 'Mike Johnson', role: 'Assistant', skills: ['wall_saw', 'slab_saw'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike' },
  { id: '3', name: 'Sarah Davis', role: 'Safety Officer', skills: ['safety_lead', 'core_drill'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
  { id: '4', name: 'Tom Wilson', role: 'Operator', skills: ['slab_saw', 'demolition'], avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom' }
];

const EQUIPMENT_LIST = [
  'Hilti DST 20-CA Wall Saw',
  'Hilti DD 350-CA Core Drill', 
  'Floor Saw FS 7000-D',
  'Water Supply System',
  'Vacuum System',
  'Safety Barriers',
  'PPE Kit',
  'Dust Collection System'
];

const QUICK_TEMPLATES = [
  { id: '1', name: 'Standard Wall Opening', workType: 'wall_saw', duration: 4, crew: 2 },
  { id: '2', name: 'Core Drilling Job', workType: 'core_drill', duration: 6, crew: 2 },
  { id: '3', name: 'Floor Cutting Project', workType: 'slab_saw', duration: 8, crew: 3 },
  { id: '4', name: 'Emergency Repair', workType: 'hand_saw', duration: 2, crew: 1, priority: 'urgent' }
];

export function SmartJobForm() {
  const { toast } = useToast();
  const [isListening, setIsListening] = useState(false);
  const [formData, setFormData] = useState<JobFormData>({
    workType: '',
    title: '',
    client: '',
    location: '',
    scheduledDate: '',
    scheduledTime: '',
    estimatedDuration: 4,
    priority: 'medium',
    assignedCrew: [],
    equipment: [],
    safetyRequirements: [],
    specialInstructions: '',
    estimatedCost: 0
  });
  const [aiSuggestions, setAiSuggestions] = useState<AIsuggestion[]>([]);
  const [completionProgress, setCompletionProgress] = useState(0);
  const [activeTab, setActiveTab] = useState('details');
  const [isProcessing, setIsProcessing] = useState(false);

  // Voice recognition mock
  const startVoiceInput = () => {
    setIsListening(true);
    toast({
      title: '🎤 Listening...',
      description: 'Say something like "Schedule a wall cutting job for tomorrow"',
    });

    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      // Simulate AI parsing voice input
      setFormData(prev => ({
        ...prev,
        workType: 'wall_saw',
        title: 'Wall Opening - Building Renovation',
        client: 'ABC Construction',
        scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        scheduledTime: '08:00',
        estimatedDuration: 4,
        priority: 'high'
      }));
      
      generateAISuggestions('voice');
      
      toast({
        title: '✅ Voice input processed!',
        description: 'Form fields have been auto-filled based on your voice command',
      });
    }, 3000);
  };

  const generateAISuggestions = (trigger: string) => {
    const suggestions: AIsuggestion[] = [
      {
        field: 'crew',
        value: ['1', '2'],
        confidence: 95,
        reason: 'John and Mike have the highest success rate for wall cutting jobs'
      },
      {
        field: 'equipment',
        value: ['Hilti DST 20-CA Wall Saw', 'Water Supply System', 'PPE Kit'],
        confidence: 98,
        reason: 'Standard equipment set for wall cutting with safety compliance'
      },
      {
        field: 'safetyRequirements',
        value: ['PPE Required', 'Dust Control Active', 'Area Isolation'],
        confidence: 100,
        reason: 'OSHA required safety measures for indoor wall cutting'
      },
      {
        field: 'estimatedCost',
        value: 2500,
        confidence: 85,
        reason: 'Based on similar jobs in the last 30 days'
      }
    ];
    
    setAiSuggestions(suggestions);
  };

  const applyAISuggestion = (suggestion: AIsuggestion) => {
    if (suggestion.field === 'crew') {
      setFormData(prev => ({ ...prev, assignedCrew: suggestion.value }));
    } else if (suggestion.field === 'equipment') {
      setFormData(prev => ({ ...prev, equipment: suggestion.value }));
    } else if (suggestion.field === 'safetyRequirements') {
      setFormData(prev => ({ ...prev, safetyRequirements: suggestion.value }));
    } else if (suggestion.field === 'estimatedCost') {
      setFormData(prev => ({ ...prev, estimatedCost: suggestion.value }));
    }
    
    setAiSuggestions(prev => prev.filter(s => s.field !== suggestion.field));
    
    toast({
      title: '✨ AI suggestion applied',
      description: suggestion.reason,
    });
  };

  const applyTemplate = (template: typeof QUICK_TEMPLATES[0]) => {
    setFormData(prev => ({
      ...prev,
      workType: template.workType,
      title: `${template.name} - ${new Date().toLocaleDateString()}`,
      estimatedDuration: template.duration,
      priority: template.priority || 'medium'
    }));
    
    generateAISuggestions('template');
    
    toast({
      title: '⚡ Template applied',
      description: `${template.name} template loaded with smart defaults`,
    });
  };

  // Calculate form completion
  useEffect(() => {
    const fields = [
      formData.workType,
      formData.title,
      formData.client,
      formData.location,
      formData.scheduledDate,
      formData.scheduledTime,
      formData.assignedCrew.length > 0,
      formData.equipment.length > 0,
      formData.safetyRequirements.length > 0
    ];
    
    const filledFields = fields.filter(Boolean).length;
    setCompletionProgress((filledFields / fields.length) * 100);
  }, [formData]);

  const handleSubmit = async () => {
    setIsProcessing(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsProcessing(false);
      toast({
        title: '🎉 Job created successfully!',
        description: 'Job #CJ-2024-003 has been scheduled and crew notified',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Quick Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Quick Templates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {QUICK_TEMPLATES.map((template) => (
              <motion.button
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => applyTemplate(template)}
                className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg hover:from-pontifex-blue/10 hover:to-pontifex-teal-50 transition-all text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{CONCRETE_WORK_TYPES[template.workType as keyof typeof CONCRETE_WORK_TYPES].icon}</span>
                  <span className="font-medium text-sm">{template.name}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {template.duration}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {template.crew}
                  </span>
                  {template.priority === 'urgent' && (
                    <Badge variant="destructive" className="text-xs">Urgent</Badge>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              New Job Entry
            </CardTitle>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Progress value={completionProgress} className="w-32 h-2" />
                <span className="text-sm text-muted-foreground">{Math.round(completionProgress)}%</span>
              </div>
              <Button
                variant={isListening ? "destructive" : "outline"}
                
                onClick={startVoiceInput}
                disabled={isListening}
              >
                {isListening ? (
                  <>
                    <MicOff className="h-4 w-4 mr-1" />
                    Listening...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-1" />
                    Voice Input
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="details">Job Details</TabsTrigger>
              <TabsTrigger value="crew">Crew & Equipment</TabsTrigger>
              <TabsTrigger value="safety">Safety & Compliance</TabsTrigger>
              <TabsTrigger value="review">Review & Submit</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Work Type</Label>
                  <Select
                    value={formData.workType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, workType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONCRETE_WORK_TYPES).map(([key, type]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">
                        <Badge className="bg-green-500">Low Priority</Badge>
                      </SelectItem>
                      <SelectItem value="medium">
                        <Badge className="bg-yellow-500">Medium Priority</Badge>
                      </SelectItem>
                      <SelectItem value="high">
                        <Badge className="bg-orange-500">High Priority</Badge>
                      </SelectItem>
                      <SelectItem value="urgent">
                        <Badge className="bg-red-500">Urgent</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Job Title</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Wall Opening - Building A Level 3"
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Client</Label>
                  <Input
                    value={formData.client}
                    onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
                    placeholder="Client or company name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="relative">
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Job site address"
                      className="pr-10"
                    />
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Scheduled Date</Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.scheduledDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                      className="pr-10"
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={formData.scheduledTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                      className="pr-10"
                    />
                    <Clock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Duration (hours)</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="number"
                      value={formData.estimatedDuration}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 0 }))}
                      min="1"
                      max="24"
                    />
                    <Timer className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estimated Cost</Label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-3 text-muted-foreground">$</span>
                      <Input
                        type="number"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData(prev => ({ ...prev, estimatedCost: parseFloat(e.target.value) || 0 }))}
                        className="pl-8"
                        placeholder="0.00"
                      />
                    </div>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="crew" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <Label className="mb-3 block">Assign Crew Members</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {CREW_MEMBERS.map((member) => {
                      const isSelected = formData.assignedCrew.includes(member.id);
                      return (
                        <motion.div
                          key={member.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Card 
                            className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-pontifex-blue bg-pontifex-blue/5' : ''}`}
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                assignedCrew: isSelected 
                                  ? prev.assignedCrew.filter(id => id !== member.id)
                                  : [...prev.assignedCrew, member.id]
                              }));
                            }}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarImage src={member.avatar} />
                                  <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <p className="font-medium">{member.name}</p>
                                  <p className="text-sm text-muted-foreground">{member.role}</p>
                                  <div className="flex gap-1 mt-1">
                                    {member.skills.map(skill => (
                                      <Badge key={skill} variant="outline" className="text-xs">
                                        {skill.replace('_', ' ')}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                {isSelected && (
                                  <CheckCircle className="h-5 w-5 text-pontifex-blue" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <Label className="mb-3 block">Select Equipment</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {EQUIPMENT_LIST.map((equipment) => {
                      const isSelected = formData.equipment.includes(equipment);
                      return (
                        <label
                          key={equipment}
                          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                            isSelected ? 'bg-pontifex-blue/10 border-pontifex-blue' : 'hover:bg-muted/50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {
                              setFormData(prev => ({
                                ...prev,
                                equipment: isSelected
                                  ? prev.equipment.filter(e => e !== equipment)
                                  : [...prev.equipment, equipment]
                              }));
                            }}
                            className="sr-only"
                          />
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                            isSelected ? 'bg-pontifex-blue border-pontifex-blue' : 'border-gray-300'
                          }`}>
                            {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                          </div>
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{equipment}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="safety" className="space-y-4 mt-6">
              <div>
                <Label className="mb-3 block">Safety Requirements</Label>
                <div className="space-y-2">
                  {['PPE Required', 'Dust Control Active', 'Area Isolation', 'Safety Briefing', 'Gas Monitoring', 'Fall Protection'].map((requirement) => {
                    const isSelected = formData.safetyRequirements.includes(requirement);
                    return (
                      <label
                        key={requirement}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isSelected ? 'bg-emerald-50 border-emerald-500' : 'hover:bg-muted/50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              safetyRequirements: isSelected
                                ? prev.safetyRequirements.filter(r => r !== requirement)
                                : [...prev.safetyRequirements, requirement]
                            }));
                          }}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                        }`}>
                          {isSelected && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <Shield className="h-4 w-4 text-emerald-600" />
                        <span className="text-sm font-medium">{requirement}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Special Instructions</Label>
                <Textarea
                  value={formData.specialInstructions}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special safety concerns, access requirements, or job-specific instructions..."
                  rows={4}
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-lg">
                <Shield className="h-5 w-5 text-emerald-600" />
                <div className="flex-1">
                  <p className="font-medium text-emerald-800">OSHA Compliance Check</p>
                  <p className="text-sm text-emerald-600">All required safety measures have been selected for this work type</p>
                </div>
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-4 mt-6">
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-pontifex-blue/10 to-pontifex-teal-50 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Job Summary
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Work Type:</span>
                        <span className="font-medium">
                          {formData.workType && CONCRETE_WORK_TYPES[formData.workType as keyof typeof CONCRETE_WORK_TYPES]?.name}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Title:</span>
                        <span className="font-medium">{formData.title || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Client:</span>
                        <span className="font-medium">{formData.client || 'Not set'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Priority:</span>
                        <Badge variant="outline" className={
                          formData.priority === 'urgent' ? 'bg-red-500 text-white' :
                          formData.priority === 'high' ? 'bg-orange-500 text-white' :
                          formData.priority === 'medium' ? 'bg-yellow-500 text-white' :
                          'bg-green-500 text-white'
                        }>
                          {formData.priority}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date & Time:</span>
                        <span className="font-medium">
                          {formData.scheduledDate} at {formData.scheduledTime}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-medium">{formData.estimatedDuration} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Crew Size:</span>
                        <span className="font-medium">{formData.assignedCrew.length} members</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Cost:</span>
                        <span className="font-medium">${formData.estimatedCost?.toLocaleString() || '0'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    className="flex-1 bg-pontifex-blue hover:bg-pontifex-blue-700"
                    onClick={handleSubmit}
                    disabled={isProcessing || completionProgress < 100}
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Creating Job...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Create Job & Notify Crew
                      </>
                    )}
                  </Button>
                  <Button variant="outline">
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Suggestions Panel */}
      {aiSuggestions.length > 0 && (
        <Card className="border-pontifex-teal-600 bg-gradient-to-r from-pontifex-teal-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-pontifex-teal-600" />
              AI Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <Sparkles className="h-5 w-5 text-pontifex-teal-600 mt-0.5" />
                    <div>
                      <p className="font-medium capitalize">{suggestion.field} Recommendation</p>
                      <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                      <Badge variant="outline" className="mt-1">
                        {suggestion.confidence}% confidence
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      
                      onClick={() => applyAISuggestion(suggestion)}
                    >
                      Apply
                    </Button>
                    <Button
                      
                      variant="outline"
                      onClick={() => setAiSuggestions(prev => prev.filter((_, i) => i !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
