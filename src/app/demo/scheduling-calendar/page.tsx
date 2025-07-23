'use client';

import React from 'react';

import { SchedulingCalendar } from '@/components/SchedulingCalendar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  Clock, 
  Users, 
  Shield, 
  MapPin,
  Activity,
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';

export default function SchedulingCalendarDemo() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-[1800px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-8 w-8 text-pontifex-blue" />
          <h1 className="text-3xl font-bold">Smart Scheduling Calendar</h1>
          <Badge className="bg-gradient-to-r from-pontifex-blue to-pontifex-teal-600 text-white">
            🚀 DSM Killer
          </Badge>
        </div>
        <p className="text-muted-foreground">
          AI-powered job scheduling with real-time crew optimization • Makes DSM's text-based scheduling obsolete
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pontifex-blue/10 rounded-lg">
                <Calendar className="h-5 w-5 text-pontifex-blue" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Drag-Drop Scheduling</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Visual job scheduling vs DSM's primitive text lists
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-pontifex-teal-100 rounded-lg">
                <Users className="h-5 w-5 text-pontifex-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Crew Optimization</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Smart crew assignment based on skills & availability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <MapPin className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Real-time Location</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Live crew tracking with beacon integration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Zap className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Instant Updates</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time sync across all devices and team members
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitive Advantage Alert */}
      <Alert className="mb-8 border-pontifex-blue bg-gradient-to-r from-pontifex-blue/5 to-pontifex-teal-50">
        <Target className="h-4 w-4" />
        <AlertTitle className="text-pontifex-blue-900">🎯 How We Destroy DSM's Scheduling</AlertTitle>
        <AlertDescription>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div>
              <h4 className="font-semibold text-pontifex-blue-800 mb-2">DSM Software (Outdated)</h4>
              <ul className="text-sm space-y-1 text-red-700">
                <li>❌ Text-based job lists</li>
                <li>❌ Manual crew assignment</li>
                <li>❌ No real-time updates</li>
                <li>❌ Desktop-only interface</li>
                <li>❌ No location tracking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-pontifex-teal-700 mb-2">Pontifex Industries (2025)</h4>
              <ul className="text-sm space-y-1 text-emerald-700">
                <li>✅ Visual drag-drop calendar</li>
                <li>✅ AI-powered optimization</li>
                <li>✅ Live team collaboration</li>
                <li>✅ Mobile-first design</li>
                <li>✅ Beacon location tracking</li>
              </ul>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Calendar Component */}
      <SchedulingCalendar />

      {/* Advanced Features */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-pontifex-blue" />
              Productivity Analytics
            </CardTitle>
            <CardDescription>
              Track team efficiency and optimize scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Average Job Completion</span>
                <Badge variant="outline">94% On-Time</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Crew Utilization</span>
                <Badge variant="outline">87% Efficiency</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Schedule Conflicts</span>
                <Badge className="bg-emerald-500">Zero Today</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-pontifex-teal-600" />
              Live Team Status
            </CardTitle>
            <CardDescription>
              Real-time crew locations and availability
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">On-Site Crews</span>
                <Badge className="bg-green-500">8 Active</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Available Workers</span>
                <Badge variant="outline">12 Ready</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Equipment Ready</span>
                <Badge className="bg-pontifex-blue">15 Units</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-600" />
              Safety Compliance
            </CardTitle>
            <CardDescription>
              Automated safety verification for all jobs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Certifications Valid</span>
                <Badge className="bg-emerald-500">100%</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Safety Inspections</span>
                <Badge variant="outline">All Current</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">PPE Compliance</span>
                <Badge className="bg-pontifex-teal-600">Verified</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
