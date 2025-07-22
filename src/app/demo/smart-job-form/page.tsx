import React from 'react';
'use client';

import { SmartJobForm } from '@/components/SmartJobForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Mic, 
  Brain, 
  Zap, 
  Shield,
  Activity,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2
} from 'lucide-react';

export default function SmartJobFormDemo() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-[1600px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-pontifex-blue" />
          <h1 className="text-3xl font-bold">Smart Job Entry</h1>
          <Badge className="bg-gradient-to-r from-pontifex-blue to-pontifex-teal-600 text-white">
            🎯 10x Faster than DSM
          </Badge>
        </div>
        <p className="text-muted-foreground">
          AI-powered job creation with voice input • Complete jobs in under 60 seconds vs DSM's 5-10 minutes
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-pontifex-blue to-pontifex-teal-600 rounded-lg">
                <Mic className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Voice Input</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Speak naturally to fill forms instantly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Suggestions</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Smart predictions based on history
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">One-Click Setup</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Templates for common job types
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Auto Compliance</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Safety requirements auto-filled
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg">
                <Activity className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Live Validation</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time error prevention
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Speed Comparison Alert */}
      <Alert className="mb-8 border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full">
            <TrendingUp className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-800 flex items-center gap-2">
              ⚡ Speed Comparison: Pontifex vs DSM
              <Badge className="bg-emerald-600 text-white">95% Faster</Badge>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-red-600" />
                  <span className="font-semibold text-red-700">DSM Software</span>
                </div>
                <ul className="text-sm space-y-1 text-red-600">
                  <li>• 5-10 minutes per job</li>
                  <li>• Multiple screens</li>
                  <li>• Manual data entry</li>
                  <li>• No smart features</li>
                </ul>
              </div>
              <div className="bg-white/70 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-4 w-4 text-emerald-600" />
                  <span className="font-semibold text-emerald-700">Pontifex Smart Form</span>
                </div>
                <ul className="text-sm space-y-1 text-emerald-600">
                  <li>• Under 60 seconds</li>
                  <li>• Single screen</li>
                  <li>• Voice + AI assist</li>
                  <li>• Auto-fills everything</li>
                </ul>
              </div>
              <div className="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                  <span className="font-semibold text-emerald-800">Time Saved</span>
                </div>
                <div className="text-2xl font-bold text-emerald-700">8+ hours</div>
                <div className="text-sm text-emerald-600">per week per user</div>
              </div>
            </div>
          </div>
        </div>
      </Alert>

      {/* Form Component */}
      <SmartJobForm />

      {/* Bottom Features */}
      <div className="mt-8 p-6 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-pontifex-teal-600" />
          <h3 className="font-semibold">AI Features That Leave DSM in the Dust</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-white rounded-lg p-3">
            <strong className="text-pontifex-blue">🎤 Voice Commands:</strong>
            <p className="text-muted-foreground mt-1">
              "Schedule a wall cutting job for ABC Construction tomorrow at 8 AM with John and Mike"
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <strong className="text-pontifex-blue">🧠 Smart Predictions:</strong>
            <p className="text-muted-foreground mt-1">
              AI learns your patterns and suggests crew, equipment, and duration automatically
            </p>
          </div>
          <div className="bg-white rounded-lg p-3">
            <strong className="text-pontifex-blue">⚡ Instant Templates:</strong>
            <p className="text-muted-foreground mt-1">
              One-click job creation from your most common job types and configurations
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}