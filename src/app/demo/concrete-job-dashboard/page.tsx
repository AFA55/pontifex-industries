'use client';

import React from 'react';

import { ConcreteJobDashboard } from '@/components/ConcreteJobDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  HardHat, 
  Bluetooth, 
  Users, 
  Shield, 
  Camera,
  Activity,
  MapPin,
  Sparkles
} from 'lucide-react';

export default function ConcreteJobDashboardDemo() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <HardHat className="h-8 w-8 text-pontifex-blue" />
          <h1 className="text-3xl font-bold">Concrete Job Dashboard</h1>
          <Badge className="bg-pontifex-teal-600">
            <Activity className="h-3 w-3 mr-1" />
            Real-time
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Monitor active concrete cutting jobs, crew locations, and safety compliance in real-time
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bluetooth className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Beacon Tracking</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time crew and equipment location via BLE beacons
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">OSHA Compliance</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Live monitoring of PPE, dust control, and safety protocols
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Users className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Crew Management</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Track worker locations, tasks, and certifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Camera className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Progress Photos</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Visual documentation of job progress and compliance
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert className="mb-8 border-pontifex-blue bg-pontifex-blue/5">
        <MapPin className="h-4 w-4" />
        <AlertTitle>Live Dashboard Features</AlertTitle>
        <AlertDescription>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Real-time job progress tracking with completion estimates</li>
            <li>Beacon-based crew and equipment location monitoring</li>
            <li>Live silica exposure levels and risk assessments</li>
            <li>Automatic safety compliance verification</li>
            <li>Equipment utilization and battery status</li>
            <li>Photo-based progress documentation</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Dashboard Component */}
      <ConcreteJobDashboard />

      {/* Additional Info */}
      <div className="mt-8 p-6 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-pontifex-teal-600" />
          <h3 className="font-semibold">Smart Features</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div>
            <strong>Automatic Alerts:</strong>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>High exposure level warnings</li>
              <li>Missing PPE notifications</li>
              <li>Equipment maintenance reminders</li>
              <li>Worker location anomalies</li>
            </ul>
          </div>
          <div>
            <strong>Integration Points:</strong>
            <ul className="list-disc list-inside mt-1 ml-2">
              <li>Supabase real-time subscriptions</li>
              <li>Web Bluetooth API for beacons</li>
              <li>Photo storage with verification</li>
              <li>Automated compliance reporting</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}