'use client';

import { ReportsDashboard } from '@/components/ReportsDashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  FileText, 
  Download, 
  Filter,
  Activity,
  Sparkles,
  DollarSign,
  Clock,
  Users
} from 'lucide-react';

export default function ReportsDashboardDemo() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-[1800px]">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <BarChart3 className="h-8 w-8 text-pontifex-blue" />
          <h1 className="text-3xl font-bold">Analytics & Reports</h1>
          <Badge className="bg-gradient-to-r from-pontifex-blue to-pontifex-teal-600 text-white">
            📊 Real-time Insights
          </Badge>
        </div>
        <p className="text-muted-foreground">
          Interactive dashboards with custom report builder • DSM's static PDFs can't compete
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Live Analytics</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Real-time data updates vs DSM's daily batches
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg">
                <Filter className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Custom Filters</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Drill down to any metric instantly
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">AI Insights</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Predictive analytics and anomaly detection
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                <Download className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Export Anywhere</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, Excel, API integration ready
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Revenue This Month</p>
                <p className="text-3xl font-bold text-blue-900">$487,392</p>
                <p className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4" />
                  +23% from last month
                </p>
              </div>
              <DollarSign className="h-12 w-12 text-blue-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-green-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-700">Jobs Completed</p>
                <p className="text-3xl font-bold text-emerald-900">234</p>
                <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                  <Activity className="h-4 w-4" />
                  94% on-time delivery
                </p>
              </div>
              <FileText className="h-12 w-12 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Avg Job Duration</p>
                <p className="text-3xl font-bold text-purple-900">4.2h</p>
                <p className="text-sm text-purple-600 flex items-center gap-1 mt-1">
                  <Clock className="h-4 w-4" />
                  -18% improvement
                </p>
              </div>
              <Clock className="h-12 w-12 text-purple-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Active Crews</p>
                <p className="text-3xl font-bold text-orange-900">18</p>
                <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                  <Users className="h-4 w-4" />
                  98% utilization rate
                </p>
              </div>
              <Users className="h-12 w-12 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DSM Comparison Alert */}
      <Alert className="mb-8 border-pontifex-blue bg-gradient-to-r from-pontifex-blue/5 to-pontifex-teal-50">
        <BarChart3 className="h-4 w-4" />
        <AlertTitle className="text-pontifex-blue-900">📊 Why Our Reports Destroy DSM</AlertTitle>
        <AlertDescription>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
            <div className="bg-white/70 rounded-lg p-3">
              <h4 className="font-semibold text-red-700 mb-2">DSM Reports</h4>
              <ul className="text-sm space-y-1 text-red-600">
                <li>❌ Static PDF exports only</li>
                <li>❌ No real-time data</li>
                <li>❌ Fixed report templates</li>
                <li>❌ Manual data entry</li>
              </ul>
            </div>
            <div className="bg-white/70 rounded-lg p-3">
              <h4 className="font-semibold text-emerald-700 mb-2">Pontifex Analytics</h4>
              <ul className="text-sm space-y-1 text-emerald-600">
                <li>✅ Interactive dashboards</li>
                <li>✅ Real-time updates</li>
                <li>✅ Custom report builder</li>
                <li>✅ AI-powered insights</li>
              </ul>
            </div>
            <div className="bg-gradient-to-br from-pontifex-blue/20 to-pontifex-teal-100 rounded-lg p-3">
              <h4 className="font-semibold text-pontifex-blue-800 mb-2">Business Impact</h4>
              <div className="text-2xl font-bold text-pontifex-blue-900">5x</div>
              <div className="text-sm text-pontifex-blue-700">Faster decision making</div>
              <div className="text-sm text-pontifex-blue-600 mt-1">Save 20+ hours/month</div>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Reports Dashboard Component */}
      <ReportsDashboard />
    </div>
  );
}