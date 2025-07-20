'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Shield,
  Users,
  MapPin,
  Smartphone,
  BarChart3,
  Settings,
  Zap,
  Star,
  Play,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Target,
  Award,
  Activity,
  Eye,
  RefreshCw,
  Database,
  FileText,
  Phone,
  Mail,
  Calendar,
  Building2,
  Wrench,
  Navigation,
  Battery,
  Signal,
  Gauge,
  Timer,
  Calculator
} from 'lucide-react';
import { DSM_COMPARISON } from '@/lib/sales-demo-data';
import { 
  DSMComparison, 
  FeatureComparison, 
  CostComparison, 
  ROICalculation,
  CapabilityScore
} from '@/types/sales-demo';

interface DSMComparisonShowcaseProps {
  interactiveMode?: boolean;
  focusArea?: 'features' | 'costs' | 'roi' | 'all';
  onFeatureSelect?: (feature: string) => void;
}

export default function DSMComparisonShowcase({
  interactiveMode = true,
  focusArea = 'all',
  onFeatureSelect
}: DSMComparisonShowcaseProps) {
  const [comparisonData] = useState<DSMComparison>(DSM_COMPARISON);
  const [selectedFeature, setSelectedFeature] = useState<FeatureComparison | null>(null);
  const [animateScores, setAnimateScores] = useState(false);
  const [activeTab, setActiveTab] = useState('capabilities');
  const [demoStep, setDemoStep] = useState(0);

  useEffect(() => {
    if (interactiveMode) {
      setAnimateScores(true);
    }
  }, [interactiveMode]);

  const handleFeatureClick = (feature: FeatureComparison) => {
    setSelectedFeature(feature);
    if (onFeatureSelect) {
      onFeatureSelect(feature.feature);
    }
  };

  const renderCapabilityScoreCard = (
    title: string, 
    dsmScore: CapabilityScore, 
    pontifexScore: CapabilityScore,
    icon: any
  ) => {
    const IconComponent = icon;
    const improvement = pontifexScore.score - dsmScore.score;
    const improvementPercent = Math.round((improvement / dsmScore.score) * 100);

    return (
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <IconComponent className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Score Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{dsmScore.score}/10</div>
                <div className="text-xs text-red-700">DSM Software</div>
              </div>
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{pontifexScore.score}/10</div>
                <div className="text-xs text-green-700">Pontifex</div>
              </div>
            </div>

            {/* Improvement Badge */}
            {improvement > 0 && (
              <div className="text-center">
                <Badge variant="default" className="bg-green-600">
                  +{improvement} points ({improvementPercent}% improvement)
                </Badge>
              </div>
            )}

            {/* Progress Bars */}
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>DSM</span>
                  <span>{dsmScore.score * 10}%</span>
                </div>
                <Progress value={dsmScore.score * 10} className="h-2 bg-red-100" />
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Pontifex</span>
                  <span>{pontifexScore.score * 10}%</span>
                </div>
                <Progress value={pontifexScore.score * 10} className="h-2" />
              </div>
            </div>

            {/* Feature Lists */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="font-medium text-red-700 mb-1">DSM Features:</div>
                <ul className="space-y-1">
                  {dsmScore.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="text-red-600">• {feature}</li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-medium text-green-700 mb-1">Pontifex Features:</div>
                <ul className="space-y-1">
                  {pontifexScore.features.slice(0, 2).map((feature, index) => (
                    <li key={index} className="text-green-600">• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderCapabilitiesTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Platform Capabilities Comparison</h3>
        <p className="text-gray-600">
          See how Pontifex Industries outperforms DSM Software across all key areas
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {renderCapabilityScoreCard(
          'Job Management',
          comparisonData.dsmComparison.dsm.jobManagement,
          comparisonData.dsmComparison.pontifex.jobManagement,
          FileText
        )}
        
        {renderCapabilityScoreCard(
          'Customer Management',
          comparisonData.dsmComparison.dsm.customerManagement,
          comparisonData.dsmComparison.pontifex.customerManagement,
          Users
        )}
        
        {renderCapabilityScoreCard(
          'Equipment Tracking',
          comparisonData.dsmComparison.dsm.equipmentTracking,
          comparisonData.dsmComparison.pontifex.equipmentTracking,
          MapPin
        )}
        
        {renderCapabilityScoreCard(
          'Safety Compliance',
          comparisonData.dsmComparison.dsm.safetyCompliance,
          comparisonData.dsmComparison.pontifex.safetyCompliance,
          Shield
        )}
        
        {renderCapabilityScoreCard(
          'Reporting & Analytics',
          comparisonData.dsmComparison.dsm.reporting,
          comparisonData.dsmComparison.pontifex.reporting,
          BarChart3
        )}
        
        {renderCapabilityScoreCard(
          'Mobile Access',
          comparisonData.dsmComparison.dsm.mobileAccess,
          comparisonData.dsmComparison.pontifex.mobileAccess,
          Smartphone
        )}
        
        {renderCapabilityScoreCard(
          'Real-time Updates',
          comparisonData.dsmComparison.dsm.realTimeUpdates,
          comparisonData.dsmComparison.pontifex.realTimeUpdates,
          Activity
        )}
        
        {renderCapabilityScoreCard(
          'Automation',
          comparisonData.dsmComparison.dsm.automation,
          comparisonData.dsmComparison.pontifex.automation,
          Zap
        )}
      </div>

      {/* Pontifex Exclusive Features */}
      <Card className="border-pontifex-blue bg-blue-50">
        <CardHeader>
          <CardTitle className="text-pontifex-blue">Exclusive Pontifex Features</CardTitle>
          <CardDescription>
            Advanced capabilities not available in DSM Software
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {renderCapabilityScoreCard(
                'Bluetooth Tracking',
                { score: 0, description: 'Not available', features: ['No indoor tracking'] },
                comparisonData.dsmComparison.pontifex.bluetoothTracking,
                Signal
              )}
              
              {renderCapabilityScoreCard(
                'OSHA Compliance',
                { score: 1, description: 'Manual only', features: ['Paper forms', 'Manual tracking'] },
                comparisonData.dsmComparison.pontifex.oshaCompliance,
                Shield
              )}
            </div>
            
            <div className="space-y-4">
              {renderCapabilityScoreCard(
                'Advanced Analytics',
                { score: 2, description: 'Basic reports', features: ['Standard reports', 'Limited insights'] },
                comparisonData.dsmComparison.pontifex.advancedAnalytics,
                TrendingUp
              )}
              
              {renderCapabilityScoreCard(
                'Predictive Maintenance',
                { score: 0, description: 'Not available', features: ['Manual scheduling'] },
                comparisonData.dsmComparison.pontifex.predictiveMaintenance,
                Wrench
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFeaturesTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Feature-by-Feature Comparison</h3>
        <p className="text-gray-600">
          Detailed analysis of specific features and their business impact
        </p>
      </div>

      <div className="space-y-4">
        {comparisonData.featureComparison.map((comparison) => (
          <Card 
            key={comparison.feature} 
            className={`cursor-pointer transition-all ${
              selectedFeature?.feature === comparison.feature 
                ? 'border-pontifex-blue shadow-lg' 
                : 'hover:shadow-md'
            }`}
            onClick={() => handleFeatureClick(comparison)}
          >
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {comparison.feature}
                <Badge variant="outline">{comparison.impactArea.replace('_', ' ')}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* DSM Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-red-700">DSM Software</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${
                          i < comparison.dsm.rating ? 'text-red-500 fill-current' : 'text-gray-300'
                        }`} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="text-sm text-red-800 mb-2">{comparison.dsm.description}</div>
                    {comparison.dsm.limitations && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-red-700">Limitations:</div>
                        {comparison.dsm.limitations.map((limitation, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs text-red-600">
                            <XCircle className="h-3 w-3" />
                            {limitation}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pontifex Column */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-green-700">Pontifex Industries</h4>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${
                          i < comparison.pontifex.rating ? 'text-green-500 fill-current' : 'text-gray-300'
                        }`} />
                      ))}
                    </div>
                  </div>
                  
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-sm text-green-800 mb-2">{comparison.pontifex.description}</div>
                    {comparison.pontifex.advantages && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-green-700">Advantages:</div>
                        {comparison.pontifex.advantages.map((advantage, index) => (
                          <div key={index} className="flex items-center gap-1 text-xs text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            {advantage}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Impact Area */}
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">
                    Primary Impact: {comparison.impactArea.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCostTab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Total Cost of Ownership</h3>
        <p className="text-gray-600">
          Comprehensive cost analysis showing Pontifex delivers better value
        </p>
      </div>

      {/* Cost Breakdown */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* DSM Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-red-700">DSM Software Costs</CardTitle>
            <CardDescription>Annual costs and one-time fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Annual License</span>
                <span className="font-bold text-red-600">
                  ${comparisonData.costComparison.dsm.licenseCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Implementation</span>
                <span className="font-bold text-red-600">
                  ${comparisonData.costComparison.dsm.implementationCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Training</span>
                <span className="font-bold text-red-600">
                  ${comparisonData.costComparison.dsm.trainingCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Annual Maintenance</span>
                <span className="font-bold text-red-600">
                  ${comparisonData.costComparison.dsm.maintenanceCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="font-medium">Total Year 1</span>
                <span className="font-bold text-red-700 text-lg">
                  ${comparisonData.costComparison.dsm.totalCostPerYear.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pontifex Costs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-700">Pontifex Industries Costs</CardTitle>
            <CardDescription>Annual costs and one-time fees</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Annual License</span>
                <span className="font-bold text-green-600">
                  ${comparisonData.costComparison.pontifex.licenseCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Implementation</span>
                <span className="font-bold text-green-600">
                  ${comparisonData.costComparison.pontifex.implementationCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Training</span>
                <span className="font-bold text-green-600">
                  ${comparisonData.costComparison.pontifex.trainingCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 border rounded-lg">
                <span>Annual Maintenance</span>
                <span className="font-bold text-green-600">
                  ${comparisonData.costComparison.pontifex.maintenanceCost.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <span className="font-medium">Total Year 1</span>
                <span className="font-bold text-green-700 text-lg">
                  ${comparisonData.costComparison.pontifex.totalCostPerYear.toLocaleString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-800 flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Cost Savings with Pontifex
          </CardTitle>
          <CardDescription>
            Lower costs with superior functionality
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-white border border-green-200 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                ${comparisonData.costComparison.savings.yearly.toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Annual Savings</div>
            </div>
            <div className="text-center p-4 bg-white border border-green-200 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {comparisonData.costComparison.savings.percentage}%
              </div>
              <div className="text-sm text-gray-600">Cost Reduction</div>
            </div>
            <div className="text-center p-4 bg-white border border-green-200 rounded-lg">
              <div className="text-3xl font-bold text-green-600">
                {comparisonData.costComparison.savings.breakEvenMonths}
              </div>
              <div className="text-sm text-gray-600">Months to Break Even</div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-white border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-3">3-Year Cost Projection:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <div className="font-medium">DSM Total (3 years):</div>
                <div className="text-red-600">
                  ${((comparisonData.costComparison.dsm.licenseCost + 
                      comparisonData.costComparison.dsm.maintenanceCost) * 3 + 
                      comparisonData.costComparison.dsm.implementationCost + 
                      comparisonData.costComparison.dsm.trainingCost).toLocaleString()}
                </div>
              </div>
              <div>
                <div className="font-medium">Pontifex Total (3 years):</div>
                <div className="text-green-600">
                  ${((comparisonData.costComparison.pontifex.licenseCost + 
                      comparisonData.costComparison.pontifex.maintenanceCost) * 3 + 
                      comparisonData.costComparison.pontifex.implementationCost + 
                      comparisonData.costComparison.pontifex.trainingCost).toLocaleString()}
                </div>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <div className="font-bold text-green-700">
                Total 3-Year Savings: ${(comparisonData.costComparison.savings.yearly * 3).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderROITab = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold mb-2">Return on Investment Analysis</h3>
        <p className="text-gray-600">
          Quantified business benefits and ROI calculations
        </p>
      </div>

      {/* ROI Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-green-600">
              {comparisonData.roiCalculation.timeToROI}
            </div>
            <div className="text-sm text-gray-600">Months to ROI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-blue-600">
              {comparisonData.roiCalculation.yearOneROI}%
            </div>
            <div className="text-sm text-gray-600">Year 1 ROI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-purple-600">
              {comparisonData.roiCalculation.threeYearROI}%
            </div>
            <div className="text-sm text-gray-600">3-Year ROI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="text-center p-6">
            <div className="text-3xl font-bold text-orange-600">
              ${(comparisonData.roiCalculation.totalSavings / 1000).toFixed(0)}K
            </div>
            <div className="text-sm text-gray-600">Total Savings</div>
          </CardContent>
        </Card>
      </div>

      {/* Savings Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Annual Savings Breakdown
          </CardTitle>
          <CardDescription>
            Detailed analysis of where savings come from
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(comparisonData.roiCalculation.savingsBreakdown).map(([category, amount]) => {
              const percentage = (amount / Object.values(comparisonData.roiCalculation.savingsBreakdown)
                .reduce((a, b) => a + b, 0)) * 100;
              
              return (
                <div key={category} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">
                      {category.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase())}
                    </span>
                    <span className="font-bold text-green-600">
                      ${amount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={percentage} className="flex-1 h-2" />
                    <span className="text-sm text-gray-600 w-12">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-bold text-green-800 text-center">
              Total Annual Savings: ${Object.values(comparisonData.roiCalculation.savingsBreakdown)
                .reduce((a, b) => a + b, 0).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Migration Benefits */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Migration Benefits
          </CardTitle>
          <CardDescription>
            Specific benefits of switching from DSM to Pontifex
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {comparisonData.migrationBenefits.map((benefit, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium">{benefit.category}</h4>
                  <Badge variant="outline">{benefit.timeframe}</Badge>
                </div>
                <div className="text-sm text-gray-600 mb-3">{benefit.benefit}</div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Annual Value:</span>
                  <span className="font-bold text-green-600">
                    ${benefit.quantifiedValue.toLocaleString()}
                  </span>
                </div>
                {benefit.demoData && (
                  <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                    Demo data available for interactive presentation
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROI Calculator */}
      <Card className="border-pontifex-blue">
        <CardHeader>
          <CardTitle className="text-pontifex-blue flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Interactive ROI Calculator
          </CardTitle>
          <CardDescription>
            Customize calculations based on your specific business
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Annual Revenue</label>
                <div className="text-lg font-bold">$3.2M</div>
              </div>
              <div>
                <label className="text-sm font-medium">Equipment Count</label>
                <div className="text-lg font-bold">24 units</div>
              </div>
              <div>
                <label className="text-sm font-medium">Employee Count</label>
                <div className="text-lg font-bold">24 people</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Efficiency Gain</label>
                <div className="text-lg font-bold text-green-600">+23%</div>
              </div>
              <div>
                <label className="text-sm font-medium">Cost Reduction</label>
                <div className="text-lg font-bold text-green-600">16.7%</div>
              </div>
              <div>
                <label className="text-sm font-medium">Time to ROI</label>
                <div className="text-lg font-bold text-blue-600">8 months</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">3-Year Savings</label>
                <div className="text-lg font-bold text-purple-600">$54,000</div>
              </div>
              <div>
                <label className="text-sm font-medium">3-Year ROI</label>
                <div className="text-lg font-bold text-orange-600">285%</div>
              </div>
              <Button className="w-full">
                <Calculator className="h-4 w-4 mr-2" />
                Customize for Your Business
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-pontifex-blue mb-2">
          DSM vs Pontifex Industries Comparison
        </h2>
        <p className="text-gray-600">
          See why concrete cutting companies are switching to Pontifex
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="roi">ROI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="capabilities">
          {renderCapabilitiesTab()}
        </TabsContent>

        <TabsContent value="features">
          {renderFeaturesTab()}
        </TabsContent>

        <TabsContent value="costs">
          {renderCostTab()}
        </TabsContent>

        <TabsContent value="roi">
          {renderROITab()}
        </TabsContent>
      </Tabs>

      {/* Call to Action */}
      <Card className="bg-pontifex-blue text-white">
        <CardContent className="text-center p-8">
          <h3 className="text-xl font-bold mb-4">
            Ready to Experience the Pontifex Advantage?
          </h3>
          <p className="mb-6">
            Join the growing number of concrete cutting companies that have made the switch
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="secondary">
              <Play className="h-4 w-4 mr-2" />
              Schedule Live Demo
            </Button>
            <Button variant="outline" className="text-pontifex-blue border-white hover:bg-white">
              <Calculator className="h-4 w-4 mr-2" />
              Get Custom ROI Analysis
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}