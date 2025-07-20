'use client';

import React, { useState, useEffect } from 'react';
import { WorkTypeSelector } from '@/components/WorkTypeSelector';
import { WorkType } from '@/types/work-types';
import { BeaconData } from '@/lib/bluetooth';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bluetooth, CheckCircle, AlertCircle, Clock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Simulated beacon data for demo
const DEMO_BEACONS: BeaconData[] = [
  {
    id: 'M4P-TOOL-001',
    name: 'Welding Machine Tool Beacon',
    distance: 2.5,
    rssi: -65,
    battery: 85,
    lastSeen: new Date(),
    manufacturer: 'M4P Pro',
  },
  {
    id: 'M4P-TOOL-002',  
    name: 'Circular Saw Tool Station',
    distance: 3.2,
    rssi: -72,
    battery: 90,
    lastSeen: new Date(),
    manufacturer: 'M4P Pro',
  },
  {
    id: 'M4P-EQUIP-003',
    name: 'Excavator Equipment Tracker',
    distance: 5.8,
    rssi: -78,
    battery: 70,
    lastSeen: new Date(),
    manufacturer: 'M4P Pro',
  },
];

export default function WorkTypeSelectorDemo() {
  const { toast } = useToast();
  const [selectedWorkType, setSelectedWorkType] = useState<WorkType | null>(null);
  const [detectedBeacons, setDetectedBeacons] = useState<BeaconData[]>([]);
  const [isSimulatingBeacons, setIsSimulatingBeacons] = useState(false);

  const handleWorkTypeSelect = (workType: WorkType) => {
    setSelectedWorkType(workType);
    toast({
      title: 'Work Type Selected',
      description: `Selected: ${workType.name}`,
      action: <CheckCircle className="h-4 w-4 text-green-600" />,
    });
  };

  const simulateBeaconDetection = () => {
    setIsSimulatingBeacons(true);
    
    // Simulate gradual beacon detection
    setTimeout(() => {
      setDetectedBeacons([DEMO_BEACONS[0]]);
      toast({
        title: 'Beacon Detected',
        description: 'Welding equipment detected nearby',
        action: <Bluetooth className="h-4 w-4 text-blue-600" />,
      });
    }, 500);

    setTimeout(() => {
      setDetectedBeacons([DEMO_BEACONS[0], DEMO_BEACONS[1]]);
      toast({
        title: 'Beacon Detected',
        description: 'Carpentry tools detected nearby',
        action: <Bluetooth className="h-4 w-4 text-blue-600" />,
      });
    }, 1500);

    setTimeout(() => {
      setDetectedBeacons(DEMO_BEACONS);
      toast({
        title: 'Beacon Detected',
        description: 'Heavy equipment detected nearby',
        action: <Bluetooth className="h-4 w-4 text-blue-600" />,
      });
      setIsSimulatingBeacons(false);
    }, 2500);
  };

  const clearBeacons = () => {
    setDetectedBeacons([]);
    toast({
      title: 'Beacons Cleared',
      description: 'All beacon detections have been cleared',
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Work Type Selector Demo</h1>
          <p className="text-muted-foreground">
            DSM-style work type selection with 25+ categories, voice search, and smart beacon-based suggestions
          </p>
        </div>

        {/* Beacon Simulation Controls */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-semibold flex items-center gap-2">
                <Bluetooth className="h-5 w-5 text-blue-600" />
                Beacon Equipment Detection
              </h3>
              <p className="text-sm text-muted-foreground">
                Simulate beacon detection to see smart work type suggestions
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={simulateBeaconDetection}
                disabled={isSimulatingBeacons}
                variant="outline"
              >
                {isSimulatingBeacons ? 'Detecting...' : 'Simulate Beacons'}
              </Button>
              <Button
                onClick={clearBeacons}
                variant="outline"
                disabled={detectedBeacons.length === 0}
              >
                Clear
              </Button>
            </div>
          </div>

          {/* Show detected beacons */}
          {detectedBeacons.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {detectedBeacons.map((beacon) => (
                <Badge key={beacon.id} variant="secondary" className="py-1">
                  <Bluetooth className="h-3 w-3 mr-1" />
                  {beacon.name} ({beacon.distance.toFixed(1)}m)
                </Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Work Type Selector */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Select Work Type</h2>
          <WorkTypeSelector
            onSelect={handleWorkTypeSelect}
            selectedWorkType={selectedWorkType}
            detectedBeacons={detectedBeacons}
          />
        </Card>

        {/* Selected Work Type Details */}
        {selectedWorkType && (
          <Card className="p-6 bg-primary/5 border-primary/20">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Selected Work Type Details
            </h3>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedWorkType.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{selectedWorkType.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Category</p>
                  <Badge variant="outline">{selectedWorkType.category}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Risk Level</p>
                    <p className="font-medium capitalize">{selectedWorkType.riskLevel}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Default Duration</p>
                    <p className="font-medium">{selectedWorkType.defaultDurationHours} hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Required Skills</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedWorkType.skillRequirements.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {skill.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                {selectedWorkType.requiresPermit && (
                  <Badge className="w-fit">Permit Required</Badge>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Instructions */}
        <Card className="p-4 bg-muted/50">
          <h4 className="font-semibold mb-2">Features to Try:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>• Search for work types using the search bar</li>
            <li>• Use voice search by clicking the microphone icon</li>
            <li>• Filter by category using the dropdown</li>
            <li>• Simulate beacon detection to see smart suggestions</li>
            <li>• Click on any work type card to select it</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}