'use client';

import React from 'react';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MapPin,
  Navigation,
  Battery,
  Signal,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw,
  Gauge,
  Thermometer,
  Zap,
  Wrench,
  Eye,
  TrendingUp,
  Target,
  Settings,
  Radio,
  Wifi,
  Smartphone,
  Monitor,
  Truck,
  Building2,
  Timer,
  Calendar,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { DEMO_EQUIPMENT, DEMO_JOBS } from '@/lib/sales-demo-data';
import { 
  DemoEquipment, 
  DemoJob, 
  LiveEquipmentLocation, 
  EquipmentStatus,
  EquipmentAlert
} from '@/types/sales-demo';

interface LiveEquipmentTrackingDemoProps {
  autoUpdate?: boolean;
  showDSMComparison?: boolean;
  focusEquipmentId?: string;
  onEquipmentSelect?: (equipmentId: string) => void;
}

export default function LiveEquipmentTrackingDemo({
  autoUpdate = true,
  showDSMComparison = true,
  focusEquipmentId,
  onEquipmentSelect
}: LiveEquipmentTrackingDemoProps) {
  const [equipment, setEquipment] = useState<DemoEquipment[]>(DEMO_EQUIPMENT);
  const [selectedEquipment, setSelectedEquipment] = useState<DemoEquipment | null>(
    focusEquipmentId ? DEMO_EQUIPMENT.find(eq => eq.id === focusEquipmentId) || null : null
  );
  const [isLiveDemo, setIsLiveDemo] = useState(autoUpdate);
  const [demoTimer, setDemoTimer] = useState(0);
  const [simulatedAlerts, setSimulatedAlerts] = useState<EquipmentAlert[]>([]);
  const [viewMode, setViewMode] = useState<'map' | 'list' | 'dashboard'>('dashboard');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveDemo) {
      interval = setInterval(() => {
        setDemoTimer(prev => prev + 1);
        simulateRealTimeUpdates();
      }, 2000); // Update every 2 seconds for demo
    }
    return () => clearInterval(interval);
  }, [isLiveDemo]);

  const simulateRealTimeUpdates = useCallback(() => {
    setEquipment(prevEquipment => 
      prevEquipment.map(eq => {
        // Simulate small location changes for moving equipment
        if (eq.status === 'in_use' && eq.currentLocation) {
          const newLocation = {
            ...eq.currentLocation,
            lat: eq.currentLocation.lat + (Math.random() - 0.5) * 0.0001,
            lng: eq.currentLocation.lng + (Math.random() - 0.5) * 0.0001,
            timestamp: new Date()
          };

          // Simulate real-time data updates
          const newRealTimeData = eq.realTimeData ? {
            ...eq.realTimeData,
            engineHours: eq.realTimeData.engineHours + Math.random() * 0.1,
            temperature: eq.realTimeData.temperature + (Math.random() - 0.5) * 5,
            vibration: Math.max(0, eq.realTimeData.vibration + (Math.random() - 0.5) * 0.5),
            dustLevel: eq.realTimeData.dustLevel ? Math.max(0, eq.realTimeData.dustLevel + (Math.random() - 0.5) * 0.2) : undefined,
            waterLevel: eq.realTimeData.waterLevel ? Math.max(0, Math.min(100, eq.realTimeData.waterLevel + (Math.random() - 0.5) * 5)) : undefined
          } : undefined;

          // Simulate Bluetooth beacon updates
          const newBeacon = eq.bluetoothBeacon ? {
            ...eq.bluetoothBeacon,
            batteryLevel: Math.max(0, eq.bluetoothBeacon.batteryLevel - Math.random() * 0.1),
            signalStrength: eq.bluetoothBeacon.signalStrength + (Math.random() - 0.5) * 3,
            lastSeen: new Date()
          } : undefined;

          return {
            ...eq,
            currentLocation: newLocation,
            realTimeData: newRealTimeData,
            bluetoothBeacon: newBeacon,
            utilizationRate: Math.max(0, Math.min(100, eq.utilizationRate + (Math.random() - 0.5) * 2))
          };
        }
        return eq;
      })
    );

    // Occasionally generate alerts
    if (Math.random() < 0.1) { // 10% chance each update
      const alertTypes: EquipmentAlert['type'][] = ['maintenance', 'performance', 'location'];
      const severities: EquipmentAlert['severity'][] = ['low', 'medium', 'high'];
      
      const newAlert: EquipmentAlert = {
        type: alertTypes[Math.floor(Math.random() * alertTypes.length)],
        severity: severities[Math.floor(Math.random() * severities.length)],
        message: generateAlertMessage(),
        timestamp: new Date(),
        acknowledged: false
      };

      setSimulatedAlerts(prev => [newAlert, ...prev].slice(0, 5)); // Keep last 5 alerts
    }
  }, []);

  const generateAlertMessage = (): string => {
    const messages = [
      'Equipment utilization below target threshold',
      'Scheduled maintenance due within 48 hours',
      'Equipment idle time exceeding normal parameters',
      'Temperature reading above optimal range',
      'Bluetooth beacon battery level low',
      'GPS signal strength decreased',
      'Equipment movement detected outside job site boundary'
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const handleEquipmentSelect = (equipmentId: string) => {
    const selected = equipment.find(eq => eq.id === equipmentId);
    setSelectedEquipment(selected || null);
    if (onEquipmentSelect) {
      onEquipmentSelect(equipmentId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_use': return 'text-green-600';
      case 'available': return 'text-blue-600';
      case 'maintenance': return 'text-orange-600';
      case 'out_of_service': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_use': return <Activity className="h-4 w-4" />;
      case 'available': return <CheckCircle className="h-4 w-4" />;
      case 'maintenance': return <Wrench className="h-4 w-4" />;
      case 'out_of_service': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const renderEquipmentCard = (eq: DemoEquipment) => (
    <Card 
      key={eq.id}
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedEquipment?.id === eq.id ? 'border-pontifex-blue shadow-lg' : ''
      }`}
      onClick={() => handleEquipmentSelect(eq.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-base">{eq.name}</CardTitle>
            <CardDescription>{eq.model}</CardDescription>
          </div>
          <Badge variant={eq.status === 'in_use' ? 'default' : 'outline'} className={getStatusColor(eq.status)}>
            {getStatusIcon(eq.status)}
            <span className="ml-1">{eq.status.replace('_', ' ')}</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Location Info */}
        {eq.currentLocation && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-green-600" />
              <span>Live Location</span>
              {isLiveDemo && <Badge variant="secondary" className="text-xs animate-pulse">LIVE</Badge>}
            </div>
            <div className="text-xs text-gray-600 font-mono">
              {eq.currentLocation.lat.toFixed(6)}, {eq.currentLocation.lng.toFixed(6)}
            </div>
            <div className="text-xs text-gray-500">
              Accuracy: {eq.currentLocation.accuracy}m • 
              Updated: {eq.currentLocation.timestamp.toLocaleTimeString()}
            </div>
          </div>
        )}

        {/* Bluetooth Beacon */}
        {eq.bluetoothBeacon && (
          <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex justify-between items-center text-sm">
              <span className="flex items-center gap-1">
                <Radio className="h-3 w-3 text-blue-600" />
                Bluetooth Beacon
              </span>
              <span className="text-xs text-gray-600">Range: {eq.bluetoothBeacon.range}m</span>
            </div>
            <div className="flex justify-between text-xs mt-1">
              <span className="flex items-center gap-1">
                <Battery className="h-3 w-3" />
                {eq.bluetoothBeacon.batteryLevel.toFixed(1)}%
              </span>
              <span className="flex items-center gap-1">
                <Signal className="h-3 w-3" />
                {eq.bluetoothBeacon.signalStrength}dBm
              </span>
            </div>
            <Progress value={eq.bluetoothBeacon.batteryLevel} className="h-1 mt-1" />
          </div>
        )}

        {/* Utilization */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Utilization Rate</span>
            <span className="font-medium">{eq.utilizationRate.toFixed(1)}%</span>
          </div>
          <Progress value={eq.utilizationRate} className="h-2" />
        </div>

        {/* Real-time Data */}
        {eq.realTimeData && (
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1">
              <Timer className="h-3 w-3" />
              {eq.realTimeData.engineHours.toFixed(1)}h
            </div>
            <div className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              {eq.realTimeData.temperature.toFixed(0)}°F
            </div>
            {eq.realTimeData.dustLevel && (
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                Dust: {eq.realTimeData.dustLevel.toFixed(1)}
              </div>
            )}
            {eq.realTimeData.waterLevel && (
              <div className="flex items-center gap-1">
                <Activity className="h-3 w-3" />
                Water: {eq.realTimeData.waterLevel.toFixed(0)}%
              </div>
            )}
          </div>
        )}

        {/* Job Assignment */}
        {eq.assignedJob && (
          <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-sm">
            <div className="font-medium text-green-800">Assigned to Job</div>
            <div className="text-green-600 text-xs">
              {DEMO_JOBS.find(job => job.id === eq.assignedJob)?.title || eq.assignedJob}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderDashboardView = () => (
    <div className="space-y-6">
      {/* Live Demo Controls */}
      <Card className="border-pontifex-blue">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Equipment Tracking Demo
            </div>
            <Badge variant={isLiveDemo ? "default" : "outline"} className={isLiveDemo ? "animate-pulse" : ""}>
              {isLiveDemo ? "LIVE" : "PAUSED"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Real-time GPS + Bluetooth tracking shows exact equipment locations and status
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

          {/* Real-time Stats */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {equipment.filter(eq => eq.status === 'in_use').length}
              </div>
              <div className="text-sm text-gray-600">In Use</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {equipment.filter(eq => eq.status === 'available').length}
              </div>
              <div className="text-sm text-gray-600">Available</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {equipment.filter(eq => eq.bluetoothBeacon).length}
              </div>
              <div className="text-sm text-gray-600">Beacon Tracked</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {(equipment.reduce((acc, eq) => acc + eq.utilizationRate, 0) / equipment.length).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Avg. Utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {equipment.map(renderEquipmentCard)}
      </div>

      {/* Recent Alerts */}
      {simulatedAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Equipment Alerts
            </CardTitle>
            <CardDescription>
              Real-time monitoring detects and alerts on equipment issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {simulatedAlerts.map((alert, index) => (
                <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{alert.message}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {alert.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                      <Badge variant={
                        alert.severity === 'high' ? 'destructive' :
                        alert.severity === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {alert.severity}
                      </Badge>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderDSMComparison = () => (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="text-orange-800">DSM Software vs Pontifex Tracking</CardTitle>
        <CardDescription>
          See the dramatic difference in equipment visibility and control
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* DSM Limitations */}
          <div className="space-y-4">
            <h4 className="font-medium text-red-700">DSM Software Limitations</h4>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Manual Check-in/Out Only</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• No real-time location data</li>
                  <li>• Relies on crew memory and reporting</li>
                  <li>• Equipment often "goes missing"</li>
                  <li>• Time-consuming searches</li>
                </ul>
              </div>
              
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="h-4 w-4 text-red-600" />
                  <span className="font-medium text-red-800">Limited Visibility</span>
                </div>
                <ul className="text-sm text-red-700 space-y-1">
                  <li>• No utilization tracking</li>
                  <li>• Manual maintenance logging</li>
                  <li>• No performance monitoring</li>
                  <li>• Reactive maintenance only</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <h5 className="font-medium text-red-800 mb-2">Typical DSM Scenario:</h5>
              <div className="text-sm text-red-700 space-y-1">
                <div>📞 Customer calls about equipment delay</div>
                <div>❓ You don't know where the equipment is</div>
                <div>⏰ 45+ minutes searching multiple job sites</div>
                <div>😤 Frustrated customer, damaged relationship</div>
                <div>💰 Lost productivity and potential revenue</div>
              </div>
            </div>
          </div>

          {/* Pontifex Advantages */}
          <div className="space-y-4">
            <h4 className="font-medium text-green-700">Pontifex Real-time Tracking</h4>
            <div className="space-y-3">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">GPS + Bluetooth Tracking</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Real-time location updates</li>
                  <li>• Indoor/outdoor precision tracking</li>
                  <li>• Geofencing and boundary alerts</li>
                  <li>• Movement history and patterns</li>
                </ul>
              </div>
              
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-600" />
                  <span className="font-medium text-green-800">Complete Visibility</span>
                </div>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Real-time utilization metrics</li>
                  <li>• Automated maintenance alerts</li>
                  <li>• Performance monitoring</li>
                  <li>• Predictive maintenance insights</li>
                </ul>
              </div>
            </div>
            
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <h5 className="font-medium text-green-800 mb-2">Pontifex Solution:</h5>
              <div className="text-sm text-green-700 space-y-1">
                <div>📱 Equipment location visible instantly</div>
                <div>⚡ 2-minute resolution vs 45+ minutes</div>
                <div>😊 Proactive customer communication</div>
                <div>💪 Improved efficiency and satisfaction</div>
                <div>💰 20%+ increase in equipment utilization</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Impact */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 className="font-medium text-blue-800 mb-3">Quantified Business Impact:</h5>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">78%</div>
              <div className="text-blue-700">Equipment Utilization</div>
              <div className="text-xs text-gray-600">vs 65% industry avg</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">$45K</div>
              <div className="text-green-700">Annual Savings</div>
              <div className="text-xs text-gray-600">reduced downtime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">95%</div>
              <div className="text-purple-700">Customer Satisfaction</div>
              <div className="text-xs text-gray-600">vs 82% with DSM</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-pontifex-blue mb-2">
          Live Equipment Tracking Demo
        </h2>
        <p className="text-gray-600">
          Experience real-time GPS + Bluetooth tracking that transforms equipment management
        </p>
      </div>

      {renderDashboardView()}

      {showDSMComparison && renderDSMComparison()}

      {/* Selected Equipment Detail */}
      {selectedEquipment && (
        <Card className="border-pontifex-blue">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Equipment Detail: {selectedEquipment.name}
              </div>
              <Button variant="outline"  onClick={() => setSelectedEquipment(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Real-time Performance</h4>
                  {selectedEquipment.realTimeData && (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span>Engine Hours</span>
                        <span className="font-mono">{selectedEquipment.realTimeData.engineHours.toFixed(1)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Temperature</span>
                        <span className="font-mono">{selectedEquipment.realTimeData.temperature.toFixed(0)}°F</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Vibration</span>
                        <span className="font-mono">{selectedEquipment.realTimeData.vibration.toFixed(1)}</span>
                      </div>
                      {selectedEquipment.realTimeData.dustLevel && (
                        <div className="flex justify-between items-center">
                          <span>Dust Level</span>
                          <span className="font-mono">{selectedEquipment.realTimeData.dustLevel.toFixed(2)}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Maintenance Status</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Last Service</span>
                      <span>{selectedEquipment.lastMaintenance.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Next Due</span>
                      <span>{selectedEquipment.nextMaintenanceDue.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Hours</span>
                      <span>{selectedEquipment.totalHours.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Tracking Technology</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Navigation className="h-4 w-4" />
                        GPS Tracking
                      </span>
                      <Badge variant="default">Active</Badge>
                    </div>
                    {selectedEquipment.bluetoothBeacon && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          <Radio className="h-4 w-4" />
                          Bluetooth Beacon
                        </span>
                        <Badge variant="default">Connected</Badge>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Business Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Utilization Rate</span>
                      <span className="font-bold text-green-600">{selectedEquipment.utilizationRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Efficiency</span>
                      <span className="font-bold text-blue-600">{selectedEquipment.efficiency}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost per Hour</span>
                      <span className="font-bold">${selectedEquipment.costPerHour}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
