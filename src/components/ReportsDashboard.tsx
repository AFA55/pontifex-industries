'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  Plus,
  Eye,
  Settings,
  Share2,
  FileText,
  DollarSign,
  Users,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wrench,
  MapPin,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  LineChart as RechartsLineChart, 
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart
} from 'recharts';

// Mock data for charts
const revenueData = [
  { month: 'Jan', revenue: 245000, jobs: 156, avgJobValue: 1571 },
  { month: 'Feb', revenue: 298000, jobs: 178, avgJobValue: 1674 },
  { month: 'Mar', revenue: 342000, jobs: 203, avgJobValue: 1685 },
  { month: 'Apr', revenue: 385000, jobs: 220, avgJobValue: 1750 },
  { month: 'May', revenue: 412000, jobs: 231, avgJobValue: 1784 },
  { month: 'Jun', revenue: 487392, jobs: 234, avgJobValue: 2083 }
];

const jobTypeData = [
  { name: 'Wall Cutting', value: 35, color: '#3b82f6' },
  { name: 'Core Drilling', value: 28, color: '#0d9488' },
  { name: 'Slab Sawing', value: 22, color: '#8b5cf6' },
  { name: 'Demolition', value: 15, color: '#f59e0b' }
];

const crewPerformanceData = [
  { name: 'John Smith', jobs: 45, efficiency: 96, revenue: 98500, safety: 100 },
  { name: 'Mike Johnson', jobs: 38, efficiency: 92, revenue: 76000, safety: 100 },
  { name: 'Sarah Davis', jobs: 42, efficiency: 94, revenue: 89400, safety: 98 },
  { name: 'Tom Wilson', jobs: 35, efficiency: 88, revenue: 68500, safety: 100 }
];

const safetyMetricsData = [
  { week: 'W1', incidents: 0, nearMisses: 1, compliance: 100 },
  { week: 'W2', incidents: 0, nearMisses: 0, compliance: 100 },
  { week: 'W3', incidents: 1, nearMisses: 2, compliance: 95 },
  { week: 'W4', incidents: 0, nearMisses: 1, compliance: 98 }
];

const equipmentUtilizationData = [
  { equipment: 'Wall Saws', utilization: 87, maintenance: 5, idle: 8 },
  { equipment: 'Core Drills', utilization: 78, maintenance: 8, idle: 14 },
  { equipment: 'Floor Saws', utilization: 92, maintenance: 3, idle: 5 },
  { equipment: 'Hand Tools', utilization: 95, maintenance: 2, idle: 3 }
];

interface ReportWidget {
  id: string;
  title: string;
  type: 'chart' | 'metric' | 'table';
  size: 'small' | 'medium' | 'large';
}

const AVAILABLE_WIDGETS: ReportWidget[] = [
  { id: 'revenue-trend', title: 'Revenue Trend', type: 'chart', size: 'large' },
  { id: 'job-distribution', title: 'Job Type Distribution', type: 'chart', size: 'medium' },
  { id: 'crew-performance', title: 'Crew Performance', type: 'table', size: 'large' },
  { id: 'safety-metrics', title: 'Safety Metrics', type: 'chart', size: 'medium' },
  { id: 'equipment-usage', title: 'Equipment Utilization', type: 'chart', size: 'medium' },
  { id: 'kpi-cards', title: 'Key Metrics', type: 'metric', size: 'large' }
];

export function ReportsDashboard() {
  const [dateRange, setDateRange] = useState('last30days');
  const [selectedReport, setSelectedReport] = useState('overview');
  const [isBuilding, setIsBuilding] = useState(false);
  const [activeWidgets, setActiveWidgets] = useState(['revenue-trend', 'job-distribution', 'crew-performance']);

  const renderWidget = (widgetId: string) => {
    switch (widgetId) {
      case 'revenue-trend':
        return (
          <Card className="col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Revenue & Job Trends
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                    name="Revenue ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="jobs"
                    stroke="#0d9488"
                    strokeWidth={2}
                    name="Jobs Completed"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'job-distribution':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Job Type Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={jobTypeData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {jobTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'crew-performance':
        return (
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Crew Performance Matrix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Crew Member</th>
                      <th className="text-center p-2">Jobs</th>
                      <th className="text-center p-2">Efficiency</th>
                      <th className="text-center p-2">Revenue</th>
                      <th className="text-center p-2">Safety Score</th>
                      <th className="text-center p-2">Trend</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewPerformanceData.map((crew) => (
                      <tr key={crew.name} className="border-b hover:bg-muted/50">
                        <td className="p-3">
                          <div className="font-medium">{crew.name}</div>
                        </td>
                        <td className="text-center p-3">
                          <Badge variant="outline">{crew.jobs}</Badge>
                        </td>
                        <td className="text-center p-3">
                          <div className="flex items-center justify-center gap-2">
                            <Progress value={crew.efficiency} className="w-16 h-2" />
                            <span className="text-sm">{crew.efficiency}%</span>
                          </div>
                        </td>
                        <td className="text-center p-3">
                          <span className="font-medium">${crew.revenue.toLocaleString()}</span>
                        </td>
                        <td className="text-center p-3">
                          <Badge className={crew.safety === 100 ? 'bg-green-500' : 'bg-yellow-500'}>
                            {crew.safety}%
                          </Badge>
                        </td>
                        <td className="text-center p-3">
                          <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );

      case 'safety-metrics':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Safety Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <RechartsBarChart data={safetyMetricsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" fill="#ef4444" name="Incidents" />
                  <Bar dataKey="nearMisses" fill="#f59e0b" name="Near Misses" />
                  <Line
                    type="monotone"
                    dataKey="compliance"
                    stroke="#10b981"
                    strokeWidth={2}
                    name="Compliance %"
                  />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );

      case 'equipment-usage':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Equipment Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipmentUtilizationData.map((item) => (
                  <div key={item.equipment} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.equipment}</span>
                      <span className="text-sm text-muted-foreground">{item.utilization}% Active</span>
                    </div>
                    <div className="flex gap-1">
                      <div 
                        className="h-6 bg-green-500 rounded-l"
                        style={{ width: `${item.utilization}%` }}
                      />
                      <div 
                        className="h-6 bg-yellow-500"
                        style={{ width: `${item.maintenance}%` }}
                      />
                      <div 
                        className="h-6 bg-gray-300 rounded-r"
                        style={{ width: `${item.idle}%` }}
                      />
                    </div>
                    <div className="flex gap-4 text-xs">
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-green-500 rounded" />
                        Active
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded" />
                        Maintenance
                      </span>
                      <span className="flex items-center gap-1">
                        <div className="w-3 h-3 bg-gray-300 rounded" />
                        Idle
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={selectedReport} onValueChange={setSelectedReport}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Executive Overview</SelectItem>
                  <SelectItem value="operations">Operations Report</SelectItem>
                  <SelectItem value="financial">Financial Analysis</SelectItem>
                  <SelectItem value="safety">Safety & Compliance</SelectItem>
                  <SelectItem value="custom">Custom Report</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-1" />
                Select Dates
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-1" />
                Share
              </Button>
              <Button 
                className="bg-pontifex-blue hover:bg-pontifex-blue-700"
                onClick={() => setIsBuilding(!isBuilding)}
              >
                <Plus className="h-4 w-4 mr-1" />
                Build Custom
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Report Builder Mode */}
      {isBuilding && (
        <Card className="border-pontifex-teal-600 bg-gradient-to-r from-pontifex-teal-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-pontifex-teal-600" />
              Custom Report Builder
            </CardTitle>
            <CardDescription>
              Drag and drop widgets to build your perfect dashboard - something DSM could never do!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {AVAILABLE_WIDGETS.filter(w => !activeWidgets.includes(w.id)).map((widget) => (
                <motion.button
                  key={widget.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveWidgets([...activeWidgets, widget.id])}
                  className="p-3 bg-white rounded-lg border-2 border-dashed border-gray-300 hover:border-pontifex-blue text-center"
                >
                  <BarChart3 className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                  <span className="text-xs">{widget.title}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {activeWidgets.map((widgetId) => (
          <motion.div
            key={widgetId}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {renderWidget(widgetId)}
          </motion.div>
        ))}
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Options
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start">
              <FileText className="h-4 w-4 mr-2" />
              Export to PDF
            </Button>
            <Button variant="outline" className="justify-start">
              <BarChart3 className="h-4 w-4 mr-2" />
              Export to Excel
            </Button>
            <Button variant="outline" className="justify-start">
              <Share2 className="h-4 w-4 mr-2" />
              Share via Email
            </Button>
            <Button variant="outline" className="justify-start">
              <Settings className="h-4 w-4 mr-2" />
              Schedule Reports
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI-Powered Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <h4 className="font-medium">Growth Opportunity</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Wall cutting jobs are up 45% this month. Consider allocating more resources to this service.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <h4 className="font-medium">Equipment Alert</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Core drill #3 showing 15% efficiency drop. Schedule preventive maintenance.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-emerald-600" />
                <h4 className="font-medium">Performance Leader</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                John Smith's crew completing jobs 23% faster than average with perfect safety record.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}