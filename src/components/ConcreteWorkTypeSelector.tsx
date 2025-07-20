'use client';

import { useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  Droplets, 
  Shield, 
  Wrench,
  AlertTriangle,
  Clock,
  Zap,
  Package
} from 'lucide-react';
import {
  ConcreteWorkType,
  calculateCutting,
  suggestEquipment,
  getDustSuppressionRequirements,
  CuttingCalculation
} from '@/types/concrete-work-types';
import { useConcreteWorkTypes } from '@/hooks/useConcreteWorkTypes';

interface ConcreteWorkTypeSelectorProps {
  onSelect: (workType: ConcreteWorkType, calculation?: CuttingCalculation) => void;
  selectedType?: ConcreteWorkType;
}

export function ConcreteWorkTypeSelector({ onSelect, selectedType }: ConcreteWorkTypeSelectorProps) {
  const [activeTab, setActiveTab] = useState<'drilling' | 'sawing' | 'breaking' | 'finishing'>('drilling');
  const [showCalculator, setShowCalculator] = useState(false);
  const [dimensions, setDimensions] = useState({
    length: 0,
    depth: 0,
    width: 0
  });
  const [jobSize, setJobSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [calculation, setCalculation] = useState<CuttingCalculation | null>(null);

  // Use optimized hook for work types
  const { workTypes: filteredWorkTypes, getWorkTypeById } = useConcreteWorkTypes(activeTab);

  const handleWorkTypeSelect = (workType: ConcreteWorkType) => {
    if (selectedType === workType) {
      setShowCalculator(!showCalculator);
    } else {
      onSelect(workType);
      setShowCalculator(true);
      setCalculation(null);
    }
  };

  const handleCalculate = () => {
    if (selectedType && dimensions.length > 0 && dimensions.depth > 0) {
      const calc = calculateCutting(selectedType, dimensions);
      setCalculation(calc);
      onSelect(selectedType, calc);
    }
  };

  const selectedWorkType = selectedType ? getWorkTypeById(selectedType) : null;
  const equipment = selectedType ? suggestEquipment(selectedType, jobSize) : [];
  const dustRequirements = selectedType ? getDustSuppressionRequirements(selectedType) : [];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'drilling' | 'sawing' | 'breaking' | 'finishing')}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="drilling">Drilling</TabsTrigger>
          <TabsTrigger value="sawing">Sawing</TabsTrigger>
          <TabsTrigger value="breaking">Breaking</TabsTrigger>
          <TabsTrigger value="finishing">Finishing</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWorkTypes.map((workType) => (
              <Card
                key={workType.id}
                className={`cursor-pointer transition-all hover:shadow-lg ${
                  selectedType === workType.id ? 'ring-2 ring-pontifex-blue' : ''
                }`}
                onClick={() => handleWorkTypeSelect(workType.id)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="text-2xl mr-2">{workType.icon}</span>
                    {workType.name}
                  </CardTitle>
                  <CardDescription>{workType.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {workType.requiresDustSuppression && (
                      <Badge variant="secondary" className="text-xs">
                        <Droplets className="w-3 h-3 mr-1" />
                        Dust Control
                      </Badge>
                    )}
                    {workType.calculationFactors.powerRequirement && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {workType.calculationFactors.powerRequirement}kW
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {selectedWorkType && showCalculator && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Job Calculator - {selectedWorkType.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="length">Length (mm)</Label>
                <Input
                  id="length"
                  type="number"
                  value={dimensions.length}
                  onChange={(e) => setDimensions({ ...dimensions, length: Number(e.target.value) })}
                  placeholder="Enter length"
                />
              </div>
              <div>
                <Label htmlFor="depth">Depth (mm)</Label>
                <Input
                  id="depth"
                  type="number"
                  value={dimensions.depth}
                  onChange={(e) => setDimensions({ ...dimensions, depth: Number(e.target.value) })}
                  placeholder="Enter depth"
                />
              </div>
              {selectedType && ['core_drill', 'demolition'].includes(selectedType) && (
                <div>
                  <Label htmlFor="width">Width/Diameter (mm)</Label>
                  <Input
                    id="width"
                    type="number"
                    value={dimensions.width}
                    onChange={(e) => setDimensions({ ...dimensions, width: Number(e.target.value) })}
                    placeholder="Enter width"
                  />
                </div>
              )}
            </div>

            <div>
              <Label>Job Size</Label>
              <div className="flex gap-2 mt-2">
                {(['small', 'medium', 'large'] as const).map((size) => (
                  <Button
                    key={size}
                    variant={jobSize === size ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setJobSize(size)}
                  >
                    {size.charAt(0).toUpperCase() + size.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={handleCalculate} className="w-full">
              Calculate Requirements
            </Button>

            {calculation && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                <div className="text-center">
                  <Package className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Volume</p>
                  <p className="font-semibold">{calculation.volume.toFixed(3)} m³</p>
                </div>
                <div className="text-center">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{calculation.duration} min</p>
                </div>
                <div className="text-center">
                  <Droplets className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Water</p>
                  <p className="font-semibold">{calculation.waterRequired}L</p>
                </div>
                <div className="text-center">
                  <Wrench className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Tool Wear</p>
                  <p className="font-semibold">{calculation.equipmentWearPercentage}%</p>
                </div>
                <div className="text-center">
                  <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Dust</p>
                  <p className="font-semibold">{calculation.dustGenerated}kg</p>
                </div>
                <div className="text-center">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Power</p>
                  <p className="font-semibold">{calculation.powerConsumption}kWh</p>
                </div>
              </div>
            )}

            <Tabs defaultValue="equipment" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="dust">Dust Control</TabsTrigger>
                <TabsTrigger value="safety">Safety</TabsTrigger>
              </TabsList>

              <TabsContent value="equipment" className="space-y-2">
                <h4 className="font-medium mb-2">Recommended Equipment</h4>
                {equipment.map((eq, index) => (
                  <Card key={index} className={eq.recommended ? 'border-pontifex-blue' : ''}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{eq.name}</p>
                          <p className="text-sm text-muted-foreground">{eq.model}</p>
                          {eq.reason && (
                            <p className="text-sm text-pontifex-blue mt-1">{eq.reason}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={eq.recommended ? 'default' : 'outline'}>
                            {eq.powerRating}kW
                          </Badge>
                          {eq.recommended && (
                            <p className="text-xs text-green-600 mt-1">Recommended</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="dust" className="space-y-2">
                <h4 className="font-medium mb-2">Dust Suppression Requirements</h4>
                {dustRequirements.length > 0 ? (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        {dustRequirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </AlertDescription>
                  </Alert>
                ) : (
                  <p className="text-muted-foreground">No specific dust suppression required for this work type.</p>
                )}
              </TabsContent>

              <TabsContent value="safety" className="space-y-2">
                <h4 className="font-medium mb-2">Safety Requirements</h4>
                <div className="space-y-2">
                  {selectedWorkType.safetyRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <span>{req}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Memoize component to prevent unnecessary re-renders
export const ConcreteWorkTypeSelectorMemo = memo(ConcreteWorkTypeSelector);