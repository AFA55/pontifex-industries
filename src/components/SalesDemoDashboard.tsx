import React from 'react';
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TrendingUp,
  MapPin,
  Users,
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Activity,
  Zap,
  Target,
  Award,
  Eye,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Star,
  Building2,
  Wrench,
  FileText,
  Phone,
  Mail,
  Calendar,
  Navigation,
  Battery,
  Signal,
  Gauge
} from 'lucide-react';
import { SALES_DEMO_DATA } from '@/lib/sales-demo-data';
import { 
  SalesDemoData, 
  DemoJob, 
  DemoEquipment, 
  LiveJobUpdate, 
  DemoScenario,
  FeatureComparison
} from '@/types/sales-demo';

interface SalesDemoDashboardProps {
  scenarioMode?: boolean;
  autoPlay?: boolean;
  onScenarioComplete?: (scenarioId: string, results: any) => void;
}

export default function SalesDemoDashboard({
  scenarioMode = false,
  autoPlay = false,
  onScenarioComplete
}: SalesDemoDashboardProps) {
  const [demoData] = useState<SalesDemoData>(SALES_DEMO_DATA);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [isLiveDemo, setIsLiveDemo] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [demoTimer, setDemoTimer] = useState(0);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveDemo) {
      interval = setInterval(() => {
        setDemoTimer(prev => prev + 1);
        // Simulate real-time updates
        simulateRealTimeUpdates();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isLiveDemo]);

  const simulateRealTimeUpdates = useCallback(() => {
    // Simulate job progress updates
    // This would normally come from real data
  }, []);

  const startScenarioDemo = useCallback((scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    setIsLiveDemo(true);
    setActiveTab('scenarios');
  }, []);

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Company Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {demoData.company.name}
          </CardTitle>
          <CardDescription>
            {demoData.company.type.replace('_', ' ')} • {demoData.company.employees} employees • 
            Est. {demoData.company.established}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                ${(demoData.company.annualRevenue / 1000000).toFixed(1)}M
              </div>
              <div className="text-sm text-gray-600">Annual Revenue</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {demoData.realTimeData.activeJobs}
              </div>
              <div className="text-sm text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {demoData.company.equipment.coredrills + demoData.company.equipment.wallsaws + 
                 demoData.company.equipment.slabsaws + demoData.company.equipment.wiresaws}
              </div>
              <div className="text-sm text-gray-600">Equipment Units</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {demoData.realTimeData.todaysMetrics.customerSatisfaction.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Satisfaction Score</div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3">Current Challenges</h4>
              <div className="space-y-2">
                {demoData.company.currentChallenges.map((challenge, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500" />
                    {challenge}
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Business Goals</h4>
              <div className="space-y-2">
                {demoData.company.goals.map((goal, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-green-500" />
                    {goal}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live Demo Controls */}
      <Card className="border-pontifex-blue">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Demo Control Center
            </div>
            <Badge variant={isLiveDemo ? "default" : "outline"}>
              {isLiveDemo ? "LIVE" : "PAUSED"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Control the live demonstration and showcase real-time capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button 
              onClick={() => setIsLiveDemo(!isLiveDemo)}
              className={isLiveDemo ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {isLiveDemo ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause Demo
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Live Demo
                </>
              )}
            </Button>
            
            <Button variant="outline" onClick={() => setDemoTimer(0)}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <div className="text-sm text-gray-600">
              Demo Time: {Math.floor(demoTimer / 60)}:{(demoTimer % 60).toString().padStart(2, '0')}
            </div>
          </div>

          {isLiveDemo && (
            <Alert>
              <Activity className="h-4 w-4" />
              <AlertDescription>
                Live demo is active. Real-time updates are being simulated across all dashboards.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Quick Scenario Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Scenarios</CardTitle>
          <CardDescription>
            Launch specific scenarios to demonstrate key advantages over DSM
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {demoData.scenarios.map((scenario) => (
              <Button
                key={scenario.id}
                variant="outline"
                className="h-auto p-4 text-left justify-start"
                onClick={() => startScenarioDemo(scenario)}
              >
                <div>
                  <div className="font-medium">{scenario.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{scenario.description}</div>
                  <Badge variant="outline" className="mt-2">
                    {scenario.category}
                  </Badge>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderLiveTrackingTab = () => (
    <div className="space-y-6">
      {/* Real-time Job Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Live Job Tracking
            {isLiveDemo && <Badge variant="default" className="animate-pulse">LIVE</Badge>}
          </CardTitle>
          <CardDescription>
            Real-time visibility into all active concrete cutting operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoData.jobs.filter(job => job.status === 'in_progress').map((job) => (
              <div key={job.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium">{job.title}</div>
                    <div className="text-sm text-gray-600">{job.customer}</div>
                    <div className="text-sm text-gray-500">
                      <MapPin className="h-3 w-3 inline mr-1" />
                      {job.location.address}
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {job.progress}% Complete
                  </Badge>
                </div>
                
                <Progress value={job.progress} className="h-2 mb-3" />
                
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">Crew</div>
                    <div className="text-gray-600">
                      {job.assignedCrew.map(crewId => {
                        const employee = demoData.employees.find(emp => emp.id === crewId);
                        return employee ? `${employee.firstName} ${employee.lastName}` : crewId;
                      }).join(', ')}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Equipment</div>
                    <div className="text-gray-600">
                      {job.assignedEquipment.map(eqId => {
                        const equipment = demoData.equipment.find(eq => eq.id === eqId);
                        return equipment ? equipment.name : eqId;
                      }).join(', ')}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Last Update</div>
                    <div className="text-gray-600">
                      {job.lastUpdate.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {isLiveDemo && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">
                    <Activity className="h-3 w-3 inline text-green-600 mr-1" />
                    <span className="text-green-700">Live update: Progress increased to {job.progress + 2}%</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Equipment Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Real-time Equipment Locations
          </CardTitle>
          <CardDescription>
            GPS + Bluetooth tracking shows exact equipment locations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {demoData.equipment.slice(0, 6).map((equipment) => (
              <div key={equipment.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium">{equipment.name}</div>
                    <div className="text-sm text-gray-600">{equipment.model}</div>
                  </div>
                  <Badge variant={
                    equipment.status === 'in_use' ? 'default' :
                    equipment.status === 'available' ? 'secondary' :
                    'outline'
                  }>
                    {equipment.status.replace('_', ' ')}
                  </Badge>
                </div>
                
                {equipment.currentLocation && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Location:</span>
                      <span className="text-green-600">
                        {equipment.currentLocation.lat.toFixed(4)}, {equipment.currentLocation.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Accuracy:</span>
                      <span>{equipment.currentLocation.accuracy}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Last Update:</span>
                      <span>{equipment.currentLocation.timestamp.toLocaleTimeString()}</span>
                    </div>
                  </div>
                )}
                
                {equipment.bluetoothBeacon && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded">
                    <div className="flex justify-between text-xs">
                      <span className="flex items-center gap-1">
                        <Signal className="h-3 w-3" />
                        Signal: {equipment.bluetoothBeacon.signalStrength}dBm
                      </span>
                      <span className="flex items-center gap-1">
                        <Battery className="h-3 w-3" />
                        {equipment.bluetoothBeacon.batteryLevel}%
                      </span>
                    </div>
                  </div>
                )}
                
                <div className="mt-3 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Utilization:</span>
                    <span>{equipment.utilizationRate}%</span>
                  </div>
                  <Progress value={equipment.utilizationRate} className="h-1" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Safety Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Safety & Compliance Monitoring
          </CardTitle>
          <CardDescription>
            Real-time OSHA compliance and safety alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoData.realTimeData.safetyAlerts.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold text-green-700">All Systems Safe</h3>
                <p className="text-gray-600">No active safety alerts or compliance issues</p>
              </div>
            ) : (
              demoData.realTimeData.safetyAlerts.map((alert) => (
                <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm mt-1">
                          Location: {alert.location.lat.toFixed(4)}, {alert.location.lng.toFixed(4)} • 
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant={alert.acknowledged ? 'default' : 'destructive'}>
                        {alert.acknowledged ? 'Acknowledged' : 'Active'}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))
            )}
          </div>
          
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {demoData.realTimeData.todaysMetrics.ppeComplianceRate}%
              </div>
              <div className="text-sm text-gray-600">PPE Compliance</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {demoData.realTimeData.todaysMetrics.silicaExposureEvents}
              </div>
              <div className="text-sm text-gray-600">Silica Events Today</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {demoData.realTimeData.todaysMetrics.safetyIncidents}
              </div>
              <div className="text-sm text-gray-600">Safety Incidents</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderScenariosTab = () => (
    <div className="space-y-6">
      {selectedScenario ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5" />
              Demo Scenario: {selectedScenario.name}
            </CardTitle>
            <CardDescription>
              {selectedScenario.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* DSM Approach */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-red-600">DSM Software Approach</h3>
                <div className="space-y-3">
                  {selectedScenario.dsmApproach.map((step) => (
                    <div key={step.step} className="border border-red-200 rounded-lg p-3 bg-red-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">Step {step.step}: {step.action}</div>
                        <Badge variant="outline">{step.timeRequired}min</Badge>
                      </div>
                      <div className="text-sm text-gray-600">{step.outcome}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-red-100 border border-red-200 rounded-lg p-4">
                  <h4 className="font-medium text-red-800 mb-2">DSM Limitations:</h4>
                  <ul className="text-sm text-red-700 space-y-1">
                    {selectedScenario.dsmLimitations.map((limitation, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ThumbsDown className="h-3 w-3" />
                        {limitation}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-gray-100 rounded-lg p-4">
                  <h4 className="font-medium mb-2">DSM Results:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Time: {selectedScenario.dsmOutcome.timeToComplete}min</div>
                    <div>Accuracy: {selectedScenario.dsmOutcome.accuracy}%</div>
                    <div>Satisfaction: {selectedScenario.dsmOutcome.customerSatisfaction}/5</div>
                    <div>Cost: ${selectedScenario.dsmOutcome.costImpact}</div>
                  </div>
                </div>
              </div>

              {/* Pontifex Approach */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-green-600">Pontifex Industries Approach</h3>
                <div className="space-y-3">
                  {selectedScenario.pontifexApproach.map((step) => (
                    <div key={step.step} className="border border-green-200 rounded-lg p-3 bg-green-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium">Step {step.step}: {step.action}</div>
                        <Badge variant="outline">{step.timeRequired}min</Badge>
                      </div>
                      <div className="text-sm text-gray-600">{step.outcome}</div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-green-100 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-2">Pontifex Advantages:</h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    {selectedScenario.pontifexAdvantages.map((advantage, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <ThumbsUp className="h-3 w-3" />
                        {advantage}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Pontifex Results:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>Time: {selectedScenario.pontifexOutcome.timeToComplete}min</div>
                    <div>Accuracy: {selectedScenario.pontifexOutcome.accuracy}%</div>
                    <div>Satisfaction: {selectedScenario.pontifexOutcome.customerSatisfaction}/5</div>
                    <div>Cost: ${selectedScenario.pontifexOutcome.costImpact}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-3">Quantified Benefits:</h4>
              <div className="grid md:grid-cols-2 gap-4">
                {selectedScenario.quantifiedBenefits.map((benefit, index) => (
                  <div key={index} className="bg-white rounded-lg p-3">
                    <div className="font-medium">{benefit.metric}</div>
                    <div className="text-sm text-gray-600">
                      DSM: {benefit.dsmValue} → Pontifex: {benefit.pontifexValue}
                    </div>
                    <div className="text-green-600 font-medium">
                      {benefit.improvement}% improvement • ${benefit.annualImpact.toLocaleString()}/year
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-center">
              <Button onClick={() => setSelectedScenario(null)}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Back to Scenarios
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {demoData.scenarios.map((scenario) => (
            <Card key={scenario.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedScenario(scenario)}>
              <CardHeader>
                <CardTitle>{scenario.name}</CardTitle>
                <CardDescription>{scenario.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Badge variant="outline">{scenario.category}</Badge>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="font-medium mb-2">Situation:</div>
                    <div className="text-sm text-gray-600">{scenario.setup.situation}</div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium">Key Benefits:</div>
                    <ul className="mt-1 space-y-1">
                      {scenario.quantifiedBenefits.slice(0, 2).map((benefit, index) => (
                        <li key={index} className="text-green-600">
                          • {benefit.improvement}% improvement in {benefit.metric.toLowerCase()}
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Run Demo Scenario
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  const renderMetricsTab = () => (
    <div className="space-y-6">
      {/* Revenue Growth */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Revenue Growth with Pontifex
          </CardTitle>
          <CardDescription>
            Monthly revenue performance showing consistent growth
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-4 mb-6">
            {demoData.metrics.monthlyRevenue.map((month) => (
              <div key={`${month.month}-${month.year}`} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  ${(month.revenue / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600">{month.month}</div>
                <div className="text-xs text-green-600">+{month.growth}%</div>
              </div>
            ))}
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="font-medium text-green-800 mb-2">Growth Highlights:</div>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>Average monthly growth: 21%</div>
              <div>Total revenue increase: $511K (6 months)</div>
              <div>Profit margin improvement: {demoData.metrics.profitability.grossMargin - 45}%</div>
              <div>Customer retention: {demoData.metrics.customerRetention.rate}%</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Utilization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Equipment Utilization Improvements
          </CardTitle>
          <CardDescription>
            Real-time tracking increases equipment efficiency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoData.metrics.equipmentUtilization.map((equipment) => (
              <div key={equipment.equipmentType} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">
                    {equipment.equipmentType.replace('_', ' ').toUpperCase()}
                  </div>
                  <Badge variant="secondary">+{equipment.improvement}%</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current Utilization</span>
                    <span>{equipment.utilization}%</span>
                  </div>
                  <Progress value={equipment.utilization} className="h-2" />
                  <div className="text-xs text-gray-600">
                    vs. Industry Average: 65% | DSM Previous: {equipment.utilization - equipment.improvement}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Calculation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Return on Investment
          </CardTitle>
          <CardDescription>
            Comprehensive ROI analysis vs DSM Software
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {demoData.comparisons.roiCalculation.timeToROI}
                </div>
                <div className="text-sm text-gray-600">Months to ROI</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {demoData.comparisons.roiCalculation.yearOneROI}%
                </div>
                <div className="text-sm text-gray-600">Year 1 ROI</div>
              </div>
              
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl font-bold text-purple-600">
                  ${(demoData.comparisons.roiCalculation.totalSavings / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600">3-Year Savings</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Savings Breakdown (Annual):</h4>
              {Object.entries(demoData.comparisons.roiCalculation.savingsBreakdown).map(([category, amount]) => (
                <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm">{category.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="font-medium text-green-600">${amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Satisfaction */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Customer Satisfaction Trends
          </CardTitle>
          <CardDescription>
            Improved communication leads to happier customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-4 mb-4">
            {demoData.metrics.customerSatisfaction.map((month) => (
              <div key={month.month} className="text-center p-3 border rounded-lg">
                <div className="text-lg font-bold text-yellow-600">
                  {month.score.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">{month.month}</div>
                {month.improvement > 0 && (
                  <div className="text-xs text-green-600">+{month.improvement}%</div>
                )}
              </div>
            ))}
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="font-medium text-yellow-800 mb-2">Satisfaction Drivers:</div>
            <div className="grid md:grid-cols-2 gap-2 text-sm text-yellow-700">
              <div>• Real-time job updates</div>
              <div>• Proactive communication</div>
              <div>• Accurate arrival times</div>
              <div>• Professional documentation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderComparisonTab = () => (
    <div className="space-y-6">
      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            DSM vs Pontifex Feature Comparison
          </CardTitle>
          <CardDescription>
            Side-by-side comparison of key capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {demoData.comparisons.featureComparison.map((comparison) => (
              <div key={comparison.feature} className="border rounded-lg p-4">
                <div className="font-medium mb-3">{comparison.feature}</div>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* DSM */}
                  <div className="border border-red-200 rounded-lg p-3 bg-red-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-red-800">DSM Software</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${
                            i < comparison.dsm.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-red-700 mb-2">{comparison.dsm.description}</div>
                    {comparison.dsm.limitations && (
                      <div className="text-xs text-red-600">
                        <div className="font-medium">Limitations:</div>
                        <ul className="mt-1 space-y-1">
                          {comparison.dsm.limitations.map((limitation, index) => (
                            <li key={index}>• {limitation}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  
                  {/* Pontifex */}
                  <div className="border border-green-200 rounded-lg p-3 bg-green-50">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-green-800">Pontifex Industries</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${
                            i < comparison.pontifex.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} />
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-green-700 mb-2">{comparison.pontifex.description}</div>
                    {comparison.pontifex.advantages && (
                      <div className="text-xs text-green-600">
                        <div className="font-medium">Advantages:</div>
                        <ul className="mt-1 space-y-1">
                          {comparison.pontifex.advantages.map((advantage, index) => (
                            <li key={index}>• {advantage}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Total Cost of Ownership
          </CardTitle>
          <CardDescription>
            Comprehensive cost analysis over 3 years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3 text-red-700">DSM Software Costs</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>License Cost (Annual)</span>
                  <span>${demoData.comparisons.costComparison.dsm.licenseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Implementation</span>
                  <span>${demoData.comparisons.costComparison.dsm.implementationCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training</span>
                  <span>${demoData.comparisons.costComparison.dsm.trainingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance (Annual)</span>
                  <span>${demoData.comparisons.costComparison.dsm.maintenanceCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Year 1</span>
                  <span>${(demoData.comparisons.costComparison.dsm.licenseCost + 
                            demoData.comparisons.costComparison.dsm.implementationCost + 
                            demoData.comparisons.costComparison.dsm.trainingCost + 
                            demoData.comparisons.costComparison.dsm.maintenanceCost).toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3 text-green-700">Pontifex Industries Costs</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>License Cost (Annual)</span>
                  <span>${demoData.comparisons.costComparison.pontifex.licenseCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Implementation</span>
                  <span>${demoData.comparisons.costComparison.pontifex.implementationCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training</span>
                  <span>${demoData.comparisons.costComparison.pontifex.trainingCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Maintenance (Annual)</span>
                  <span>${demoData.comparisons.costComparison.pontifex.maintenanceCost.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-2">
                  <span>Total Year 1</span>
                  <span>${(demoData.comparisons.costComparison.pontifex.licenseCost + 
                            demoData.comparisons.costComparison.pontifex.implementationCost + 
                            demoData.comparisons.costComparison.pontifex.trainingCost + 
                            demoData.comparisons.costComparison.pontifex.maintenanceCost).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">Cost Savings Summary:</h4>
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">
                  ${demoData.comparisons.costComparison.savings.yearly.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Annual Savings</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {demoData.comparisons.costComparison.savings.percentage}%
                </div>
                <div className="text-sm text-gray-600">Cost Reduction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {demoData.comparisons.costComparison.savings.breakEvenMonths}
                </div>
                <div className="text-sm text-gray-600">Months to Break Even</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-pontifex-blue mb-2">
          Pontifex Industries Sales Demonstration
        </h1>
        <p className="text-gray-600 text-lg">
          Experience the future of concrete cutting management
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="live-tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="scenarios">Demo Scenarios</TabsTrigger>
          <TabsTrigger value="metrics">Business Metrics</TabsTrigger>
          <TabsTrigger value="comparison">DSM Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {renderOverviewTab()}
        </TabsContent>

        <TabsContent value="live-tracking">
          {renderLiveTrackingTab()}
        </TabsContent>

        <TabsContent value="scenarios">
          {renderScenariosTab()}
        </TabsContent>

        <TabsContent value="metrics">
          {renderMetricsTab()}
        </TabsContent>

        <TabsContent value="comparison">
          {renderComparisonTab()}
        </TabsContent>
      </Tabs>
    </div>
  );
}