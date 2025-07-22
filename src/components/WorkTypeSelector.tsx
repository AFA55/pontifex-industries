'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Mic,
  MicOff,
  X,
  AlertCircle,
  Sparkles,
  Bluetooth,
  ChevronRight,
  Filter,
  Shield,
  Clock,
  Building,
} from 'lucide-react';
import * as Icons from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  WorkType, 
  WorkCategory, 
  DSM_WORK_TYPES, 
  getWorkTypesByEquipment, 
  searchWorkTypes,
  getWorkTypesByCategory 
} from '@/types/work-types';
import { BeaconData } from '@/lib/bluetooth';
import { cn } from '@/lib/utils';

interface WorkTypeSelectorProps {
  onSelect: (workType: WorkType) => void;
  selectedWorkType?: WorkType | null;
  detectedBeacons?: BeaconData[];
  className?: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
}

interface SpeechRecognitionEvent {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionResult {
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

const RISK_LEVEL_CONFIG = {
  low: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  medium: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  high: { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  critical: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
};

const CATEGORY_COLORS: Record<WorkCategory, string> = {
  electrical: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  plumbing: 'bg-blue-100 text-blue-800 border-blue-300',
  hvac: 'bg-cyan-100 text-cyan-800 border-cyan-300',
  structural: 'bg-orange-100 text-orange-800 border-orange-300',
  concrete: 'bg-stone-100 text-stone-800 border-stone-300',
  roofing: 'bg-red-100 text-red-800 border-red-300',
  flooring: 'bg-amber-100 text-amber-800 border-amber-300',
  painting: 'bg-purple-100 text-purple-800 border-purple-300',
  demolition: 'bg-red-100 text-red-800 border-red-300',
  excavation: 'bg-yellow-700 text-white border-yellow-800',
  welding: 'bg-orange-100 text-orange-800 border-orange-300',
  carpentry: 'bg-amber-100 text-amber-800 border-amber-300',
  masonry: 'bg-gray-100 text-gray-800 border-gray-300',
  insulation: 'bg-pink-100 text-pink-800 border-pink-300',
  drywall: 'bg-gray-100 text-gray-800 border-gray-300',
  safety: 'bg-green-100 text-green-800 border-green-300',
  inspection: 'bg-blue-100 text-blue-800 border-blue-300',
  maintenance: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  landscaping: 'bg-green-100 text-green-800 border-green-300',
  equipment: 'bg-yellow-100 text-yellow-800 border-yellow-300',
};

export function WorkTypeSelector({ 
  onSelect, 
  selectedWorkType, 
  detectedBeacons = [],
  className 
}: WorkTypeSelectorProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<WorkCategory | 'all'>('all');
  const [isListening, setIsListening] = useState(false);
  const [suggestedWorkTypes, setSuggestedWorkTypes] = useState<WorkType[]>([]);
  const [filteredWorkTypes, setFilteredWorkTypes] = useState<WorkType[]>(DSM_WORK_TYPES);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Get suggested work types based on detected beacon equipment
  useEffect(() => {
    if (detectedBeacons.length > 0) {
      // Extract equipment names from beacon names
      const detectedEquipment = detectedBeacons
        .map(beacon => beacon.name.toLowerCase())
        .filter(name => name.includes('tool') || name.includes('equipment'));

      const suggestions = getWorkTypesByEquipment(detectedEquipment);
      setSuggestedWorkTypes(suggestions);

      if (suggestions.length > 0) {
        toast({
          title: 'Smart Suggestions Available',
          description: `Found ${suggestions.length} work types based on nearby equipment`,
          action: (
            <div className="flex items-center gap-2">
              <Bluetooth className="h-4 w-4" />
              <span>Via Beacons</span>
            </div>
          ),
        });
      }
    }
  }, [detectedBeacons, toast]);

  // Filter work types based on search and category
  useEffect(() => {
    let filtered = DSM_WORK_TYPES;

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = getWorkTypesByCategory(selectedCategory);
    }

    // Apply search filter
    if (searchQuery) {
      filtered = searchWorkTypes(searchQuery).filter(wt => 
        selectedCategory === 'all' || wt.category === selectedCategory
      );
    }

    setFilteredWorkTypes(filtered);
  }, [searchQuery, selectedCategory]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        
        for (let i = event.results.length - 1; i >= 0; i--) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript = result[0].transcript;
            break;
          }
        }

        if (finalTranscript) {
          setSearchQuery(finalTranscript);
          toast({
            title: 'Voice Search',
            description: `Searching for: "${finalTranscript}"`,
          });
        }
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        toast({
          title: 'Voice Search Error',
          description: 'Unable to process voice input. Please try again.',
          variant: 'destructive',
        });
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast]);

  const toggleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: 'Voice Search Unavailable',
        description: 'Your browser does not support voice search.',
        variant: 'destructive',
      });
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast({
        title: 'Listening...',
        description: 'Speak the work type you want to search for.',
      });
    }
  }, [isListening, toast]);

  const renderWorkTypeCard = (workType: WorkType, isSuggested: boolean = false) => {
    const IconComponent = (Icons[workType.icon as keyof typeof Icons] || Building) as React.FC<{ className?: string }>;
    const riskConfig = RISK_LEVEL_CONFIG[workType.riskLevel];
    const isSelected = selectedWorkType?.id === workType.id;

    return (
      <motion.div
        key={workType.id}
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Card
          className={cn(
            'relative overflow-hidden cursor-pointer transition-all duration-200',
            'hover:shadow-lg hover:border-primary/50',
            isSelected && 'ring-2 ring-primary border-primary',
            isSuggested && 'ring-2 ring-pontifex-teal-600 border-pontifex-teal-600',
            className
          )}
          onClick={() => onSelect(workType)}
        >
          {isSuggested && (
            <div className="absolute top-0 right-0 bg-pontifex-teal-600 text-white px-2 py-1 text-xs rounded-bl-lg flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Suggested
            </div>
          )}

          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                'p-3 rounded-lg',
                `bg-${workType.color}-100 text-${workType.color}-600`
              )}>
                <IconComponent className="h-6 w-6" />
              </div>
              
              <div className="flex flex-col items-end gap-1">
                <Badge 
                  variant="outline" 
                  className={cn('text-xs', CATEGORY_COLORS[workType.category])}
                >
                  {workType.category}
                </Badge>
                <Badge 
                  variant="outline"
                  className={cn('text-xs', riskConfig.bg, riskConfig.color, riskConfig.border)}
                >
                  <AlertCircle className="h-3 w-3 mr-1" />
                  {workType.riskLevel}
                </Badge>
              </div>
            </div>

            <h3 className="font-semibold text-base mb-1">{workType.name}</h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
              {workType.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{workType.defaultDurationHours}h default</span>
                </div>
                {workType.requiresPermit && (
                  <Badge variant="secondary" className="text-xs">
                    Permit Required
                  </Badge>
                )}
              </div>

              {workType.skillRequirements.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  <Shield className="h-3 w-3 text-muted-foreground" />
                  {workType.skillRequirements.slice(0, 2).map((skill, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {skill.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                  {workType.skillRequirements.length > 2 && (
                    <span className="text-xs text-muted-foreground">
                      +{workType.skillRequirements.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {isSelected && (
              <div className="absolute bottom-0 right-0 p-2">
                <ChevronRight className="h-5 w-5 text-primary" />
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    );
  };

  const categories: Array<WorkCategory | 'all'> = [
    'all',
    'electrical',
    'plumbing',
    'hvac',
    'structural',
    'concrete',
    'roofing',
    'flooring',
    'painting',
    'demolition',
    'excavation',
    'welding',
    'carpentry',
    'safety',
    'inspection',
    'equipment',
  ];

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search work types..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button
          variant={isListening ? 'destructive' : 'outline'}
          
          onClick={toggleVoiceSearch}
          className={cn(
            'transition-all duration-200',
            isListening && 'animate-pulse'
          )}
        >
          {isListening ? (
            <MicOff className="h-4 w-4" />
          ) : (
            <Mic className="h-4 w-4" />
          )}
        </Button>

        <Select
          value={selectedCategory}
          onValueChange={(value: string) => setSelectedCategory(value as WorkCategory | 'all')}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Suggested Work Types (if any) */}
      {suggestedWorkTypes.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Bluetooth className="h-5 w-5 text-pontifex-teal-600" />
            <h3 className="font-semibold text-lg">Smart Suggestions</h3>
            <Badge className="bg-pontifex-teal-600">
              Based on nearby equipment
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestedWorkTypes.map((workType) => renderWorkTypeCard(workType, true))}
          </div>
          <hr className="my-4" />
        </div>
      )}

      {/* Work Type Grid */}
      <ScrollArea className="h-[600px] pr-4">
        <AnimatePresence mode="popLayout">
          {filteredWorkTypes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredWorkTypes.map((workType) => 
                renderWorkTypeCard(
                  workType, 
                  suggestedWorkTypes.some(st => st.id === workType.id)
                )
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No work types found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>
    </div>
  );
}