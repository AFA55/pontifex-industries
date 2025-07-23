'use client';

import React from 'react';

import { useState } from 'react';
import { ConcreteWorkTypeSelector } from '@/components/ConcreteWorkTypeSelector';
import { ConcreteWorkType, CuttingCalculation, CONCRETE_WORK_TYPES, calculateCutting } from '@/types/concrete-work-types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calculator, Droplets, Zap, Clock, AlertTriangle, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SampleScenario {
  name: string;
  workType: ConcreteWorkType;
  dimensions: { length: number; depth: number; width?: number };
  description: string;
}

const SAMPLE_SCENARIOS: SampleScenario[] = [
  {
    name: 'Electrical Conduit - Core Drill',
    workType: 'core_drill',
    dimensions: { length: 300, depth: 300, width: 100 },
    description: '100mm diameter hole through 300mm concrete wall'
  },
  {
    name: 'Doorway Opening - Wall Saw',
    workType: 'wall_saw',
    dimensions: { length: 8400, depth: 300 },
    description: 'Standard doorway 2.1m x 1.0m in 300mm wall'
  },
  {
    name: 'Expansion Joint - Slab Saw',
    workType: 'slab_saw',
    dimensions: { length: 50000, depth: 100 },
    description: '50m expansion joint, 100mm deep'
  },
  {
    name: 'HVAC Opening - Ring Saw',
    workType: 'ring_saw',
    dimensions: { length: 2400, depth: 270 },
    description: '600mm x 600mm opening, max depth cut'
  }
];

export default function ConcreteWorkTypesDemo() {
  const [selectedWorkType, setSelectedWorkType] = useState<ConcreteWorkType | undefined>();
  const [calculation, setCalculation] = useState<CuttingCalculation | undefined>();
  const [activeScenario, setActiveScenario] = useState<SampleScenario | undefined>();

  const handleWorkTypeSelect = (workType: ConcreteWorkType, calc?: CuttingCalculation) => {
    setSelectedWorkType(workType);
    setCalculation(calc);
    setActiveScenario(undefined);
  };

  const handleClearSelection = () => {
    setSelectedWorkType(undefined);
    setCalculation(undefined);
    setActiveScenario(undefined);
  };

  const handleScenarioSelect = (scenario: SampleScenario) => {
    setActiveScenario(scenario);
    setSelectedWorkType(scenario.workType);
    const calc = calculateCutting(scenario.workType, scenario.dimensions);
    setCalculation(calc);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Concrete Work Type Selector</h1>
        <p className="text-muted-foreground">
          DSM-specific concrete cutting and drilling work types with intelligent calculations
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Sample Scenarios</CardTitle>
            <Badge variant="outline">Quick Tests</Badge>
          </div>
          <CardDescription>
            Try these real-world scenarios to see the smart calculations in action
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {SAMPLE_SCENARIOS.map((scenario) => (
              <Card
                key={scenario.name}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  activeScenario?.name === scenario.name ? 'ring-2 ring-pontifex-blue' : ''
                }`}
                onClick={() => handleScenarioSelect(scenario)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">
                      {CONCRETE_WORK_TYPES[scenario.workType].icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{scenario.name}</p>
                      <p className="text-sm text-muted-foreground">{scenario.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current Selection</CardTitle>
        </CardHeader>
        <CardContent>
          {selectedWorkType ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Badge variant="default" className="mb-2">
                    {selectedWorkType.replace(/_/g, ' ').toUpperCase()}
                  </Badge>
                  {activeScenario && (
                    <p className="text-sm text-muted-foreground">
                      Scenario: {activeScenario.name}
                    </p>
                  )}
                </div>
                <Button variant="outline"  onClick={handleClearSelection}>
                  Clear Selection
                </Button>
              </div>
              
              {calculation && (
                <>
                  <Separator />
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Volume</p>
                        <p className="text-lg">{calculation.volume.toFixed(3)} m³</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Duration</p>
                        <p className="text-lg">{calculation.duration} min</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Droplets className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Water Required</p>
                        <p className="text-lg">{calculation.waterRequired}L</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calculator className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Equipment Wear</p>
                        <p className="text-lg">{calculation.equipmentWearPercentage}%</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Dust Generated</p>
                        <p className="text-lg">{calculation.dustGenerated}kg</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Power Usage</p>
                        <p className="text-lg">{calculation.powerConsumption}kWh</p>
                      </div>
                    </div>
                  </div>

                  {calculation.waterRequired > 100 && (
                    <Alert>
                      <Droplets className="h-4 w-4" />
                      <AlertDescription>
                        This job requires significant water supply ({calculation.waterRequired}L). 
                        Ensure adequate water source and drainage plan.
                      </AlertDescription>
                    </Alert>
                  )}

                  {calculation.duration > 120 && (
                    <Alert>
                      <Clock className="h-4 w-4" />
                      <AlertDescription>
                        Extended operation time ({Math.round(calculation.duration / 60)} hours). 
                        Plan for operator rotation and equipment cooling periods.
                      </AlertDescription>
                    </Alert>
                  )}
                </>
              )}
            </div>
          ) : (
            <p className="text-muted-foreground">
              Select a sample scenario above or choose a work type below to see calculations.
            </p>
          )}
        </CardContent>
      </Card>

      <ConcreteWorkTypeSelector
        onSelect={handleWorkTypeSelect}
        selectedType={selectedWorkType}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Key Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• <strong>10 DSM Work Types:</strong> Complete coverage of concrete cutting operations</li>
              <li>• <strong>Smart Calculations:</strong> Real-time volume, duration, and resource estimates</li>
              <li>• <strong>Equipment Matching:</strong> Size-appropriate tool recommendations</li>
              <li>• <strong>Dust Control:</strong> Water requirements and vacuum specifications</li>
              <li>• <strong>Safety First:</strong> PPE and hazard requirements by work type</li>
              <li>• <strong>Resource Planning:</strong> Power, water, and time calculations</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Calculation Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• <strong>Material Density:</strong> 2,400 kg/m³ standard concrete</li>
              <li>• <strong>Cutting Speeds:</strong> Based on equipment specifications</li>
              <li>• <strong>Bit Wear Rates:</strong> Per-meter degradation calculations</li>
              <li>• <strong>Water Usage:</strong> Cooling and dust suppression rates</li>
              <li>• <strong>Power Requirements:</strong> Equipment-specific consumption</li>
              <li>• <strong>Dust Generation:</strong> 0.1% material conversion (dry cutting)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}