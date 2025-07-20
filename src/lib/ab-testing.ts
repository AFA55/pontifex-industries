/**
 * A/B Testing Framework for Beta Testing Program
 * Provides feature flags, variant management, and experiment tracking
 */

export interface ABTest {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: Date;
  endDate?: Date;
  
  // Test Configuration
  trafficAllocation: number; // percentage 0-100
  variants: ABVariant[];
  targetAudience: {
    betaGroups: ('alpha' | 'beta' | 'gamma')[];
    companyTypes: ('micro' | 'small' | 'medium' | 'large')[];
    workTypes?: string[];
    minSessionCount?: number;
  };
  
  // Success Metrics
  primaryMetric: 'conversion' | 'engagement' | 'satisfaction' | 'task_completion' | 'error_rate';
  secondaryMetrics: string[];
  minimumSampleSize: number;
  
  // Results
  results?: ABTestResults;
}

export interface ABVariant {
  id: string;
  name: string;
  description: string;
  trafficSplit: number; // percentage of test traffic
  config: Record<string, any>; // Feature configuration
  isControl: boolean;
}

export interface ABTestResults {
  testId: string;
  startDate: Date;
  endDate: Date;
  totalParticipants: number;
  
  variantResults: VariantResults[];
  winner?: string; // variant ID
  confidence: number; // statistical confidence percentage
  significance: number; // p-value
  
  insights: string[];
  recommendations: string[];
}

export interface VariantResults {
  variantId: string;
  participants: number;
  
  // Core Metrics
  primaryMetricValue: number;
  primaryMetricStdDev: number;
  conversionRate: number;
  
  // Secondary Metrics
  secondaryMetrics: Record<string, number>;
  
  // Performance Metrics
  averageLoadTime: number;
  errorRate: number;
  taskCompletionRate: number;
  satisfactionScore: number;
  
  // Engagement Metrics
  sessionDuration: number;
  featureUsage: Record<string, number>;
  retentionRate: number;
}

export interface ABTestParticipant {
  userId: string;
  testId: string;
  variantId: string;
  assignedAt: Date;
  firstExposure: Date;
  
  // Tracking Data
  exposures: ABExposure[];
  conversions: ABConversion[];
  metrics: ParticipantMetrics;
}

export interface ABExposure {
  timestamp: Date;
  feature: string;
  variant: string;
  context: Record<string, any>;
}

export interface ABConversion {
  timestamp: Date;
  event: string;
  value?: number;
  properties: Record<string, any>;
}

export interface ParticipantMetrics {
  sessionCount: number;
  totalTime: number;
  taskCompletions: number;
  errorCount: number;
  satisfactionRatings: number[];
  featureUsage: Record<string, number>;
}

class ABTestingService {
  private tests: Map<string, ABTest> = new Map();
  private participants: Map<string, ABTestParticipant[]> = new Map();
  private exposureLog: ABExposure[] = [];

  /**
   * Create a new A/B test
   */
  createTest(test: Omit<ABTest, 'id'>): ABTest {
    const id = this.generateTestId();
    const newTest: ABTest = {
      ...test,
      id,
      status: 'draft'
    };
    
    this.validateTest(newTest);
    this.tests.set(id, newTest);
    
    return newTest;
  }

  /**
   * Start an A/B test
   */
  startTest(testId: string): boolean {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'draft') {
      return false;
    }

    test.status = 'active';
    test.startDate = new Date();
    
    return true;
  }

  /**
   * Assign a user to a test variant
   */
  assignVariant(userId: string, testId: string, userContext: {
    betaGroup: 'alpha' | 'beta' | 'gamma';
    companyType: 'micro' | 'small' | 'medium' | 'large';
    workTypes: string[];
    sessionCount: number;
  }): string | null {
    const test = this.tests.get(testId);
    if (!test || test.status !== 'active') {
      return null;
    }

    // Check if user matches target audience
    if (!this.matchesTargetAudience(userContext, test.targetAudience)) {
      return null;
    }

    // Check existing assignment
    const existingAssignment = this.getParticipant(userId, testId);
    if (existingAssignment) {
      return existingAssignment.variantId;
    }

    // Assign variant based on traffic allocation and splits
    const hash = this.hashUserId(userId, testId);
    const trafficThreshold = test.trafficAllocation / 100;
    
    if (hash > trafficThreshold) {
      return null; // User not in test
    }

    // Determine variant based on traffic splits
    const variantHash = this.hashUserId(userId + '_variant', testId);
    let cumulativeWeight = 0;
    
    for (const variant of test.variants) {
      cumulativeWeight += variant.trafficSplit / 100;
      if (variantHash <= cumulativeWeight) {
        this.addParticipant(userId, testId, variant.id);
        return variant.id;
      }
    }

    return null;
  }

  /**
   * Track feature exposure
   */
  trackExposure(userId: string, testId: string, feature: string, context: Record<string, any> = {}): void {
    const participant = this.getParticipant(userId, testId);
    if (!participant) return;

    const exposure: ABExposure = {
      timestamp: new Date(),
      feature,
      variant: participant.variantId,
      context
    };

    participant.exposures.push(exposure);
    this.exposureLog.push(exposure);
  }

  /**
   * Track conversion event
   */
  trackConversion(userId: string, testId: string, event: string, value?: number, properties: Record<string, any> = {}): void {
    const participant = this.getParticipant(userId, testId);
    if (!participant) return;

    const conversion: ABConversion = {
      timestamp: new Date(),
      event,
      value,
      properties
    };

    participant.conversions.push(conversion);
  }

  /**
   * Update participant metrics
   */
  updateParticipantMetrics(userId: string, testId: string, metrics: Partial<ParticipantMetrics>): void {
    const participant = this.getParticipant(userId, testId);
    if (!participant) return;

    participant.metrics = { ...participant.metrics, ...metrics };
  }

  /**
   * Get test results and analysis
   */
  analyzeTest(testId: string): ABTestResults | null {
    const test = this.tests.get(testId);
    if (!test) return null;

    const participants = this.participants.get(testId) || [];
    const variantResults = this.calculateVariantResults(test, participants);
    const winner = this.determineWinner(variantResults);
    const { confidence, significance } = this.calculateStatisticalSignificance(variantResults);

    return {
      testId,
      startDate: test.startDate,
      endDate: new Date(),
      totalParticipants: participants.length,
      variantResults,
      winner,
      confidence,
      significance,
      insights: this.generateInsights(test, variantResults),
      recommendations: this.generateRecommendations(test, variantResults, winner)
    };
  }

  /**
   * Get feature configuration for a user
   */
  getFeatureConfig(userId: string, feature: string): Record<string, any> {
    const activeTests = Array.from(this.tests.values()).filter(test => test.status === 'active');
    
    for (const test of activeTests) {
      const participant = this.getParticipant(userId, test.id);
      if (participant) {
        const variant = test.variants.find(v => v.id === participant.variantId);
        if (variant && variant.config[feature]) {
          this.trackExposure(userId, test.id, feature);
          return variant.config[feature];
        }
      }
    }

    return {}; // Default configuration
  }

  /**
   * Check if a feature variant is enabled for a user
   */
  isVariantEnabled(userId: string, testId: string, feature: string): boolean {
    const participant = this.getParticipant(userId, testId);
    if (!participant) return false;

    const test = this.tests.get(testId);
    if (!test) return false;

    const variant = test.variants.find(v => v.id === participant.variantId);
    if (!variant) return false;

    this.trackExposure(userId, testId, feature);
    return !!variant.config[feature]?.enabled;
  }

  // Private helper methods

  private generateTestId(): string {
    return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private validateTest(test: ABTest): void {
    if (test.variants.length < 2) {
      throw new Error('Test must have at least 2 variants');
    }

    const totalSplit = test.variants.reduce((sum, variant) => sum + variant.trafficSplit, 0);
    if (Math.abs(totalSplit - 100) > 0.01) {
      throw new Error('Variant traffic splits must sum to 100%');
    }

    const controlVariants = test.variants.filter(v => v.isControl);
    if (controlVariants.length !== 1) {
      throw new Error('Test must have exactly one control variant');
    }
  }

  private matchesTargetAudience(userContext: any, targetAudience: ABTest['targetAudience']): boolean {
    if (!targetAudience.betaGroups.includes(userContext.betaGroup)) {
      return false;
    }

    if (!targetAudience.companyTypes.includes(userContext.companyType)) {
      return false;
    }

    if (targetAudience.workTypes && targetAudience.workTypes.length > 0) {
      const hasMatchingWorkType = targetAudience.workTypes.some(workType => 
        userContext.workTypes.includes(workType)
      );
      if (!hasMatchingWorkType) {
        return false;
      }
    }

    if (targetAudience.minSessionCount && userContext.sessionCount < targetAudience.minSessionCount) {
      return false;
    }

    return true;
  }

  private hashUserId(input: string, testId: string): number {
    // Simple hash function for demo purposes
    // In production, use a proper hash function like murmurhash
    let hash = 0;
    const str = input + testId;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }

  private getParticipant(userId: string, testId: string): ABTestParticipant | undefined {
    const testParticipants = this.participants.get(testId) || [];
    return testParticipants.find(p => p.userId === userId);
  }

  private addParticipant(userId: string, testId: string, variantId: string): void {
    const participant: ABTestParticipant = {
      userId,
      testId,
      variantId,
      assignedAt: new Date(),
      firstExposure: new Date(),
      exposures: [],
      conversions: [],
      metrics: {
        sessionCount: 0,
        totalTime: 0,
        taskCompletions: 0,
        errorCount: 0,
        satisfactionRatings: [],
        featureUsage: {}
      }
    };

    const testParticipants = this.participants.get(testId) || [];
    testParticipants.push(participant);
    this.participants.set(testId, testParticipants);
  }

  private calculateVariantResults(test: ABTest, participants: ABTestParticipant[]): VariantResults[] {
    return test.variants.map(variant => {
      const variantParticipants = participants.filter(p => p.variantId === variant.id);
      
      if (variantParticipants.length === 0) {
        return {
          variantId: variant.id,
          participants: 0,
          primaryMetricValue: 0,
          primaryMetricStdDev: 0,
          conversionRate: 0,
          secondaryMetrics: {},
          averageLoadTime: 0,
          errorRate: 0,
          taskCompletionRate: 0,
          satisfactionScore: 0,
          sessionDuration: 0,
          featureUsage: {},
          retentionRate: 0
        };
      }

      // Calculate primary metric based on test configuration
      const primaryMetricValues = this.extractPrimaryMetricValues(test.primaryMetric, variantParticipants);
      const primaryMetricValue = primaryMetricValues.reduce((sum, val) => sum + val, 0) / primaryMetricValues.length;
      const primaryMetricStdDev = this.calculateStandardDeviation(primaryMetricValues);

      // Calculate conversion rate
      const conversions = variantParticipants.reduce((sum, p) => sum + p.conversions.length, 0);
      const conversionRate = (conversions / variantParticipants.length) * 100;

      // Calculate other metrics
      const averageLoadTime = variantParticipants.reduce((sum, p) => sum + (p.metrics.totalTime / p.metrics.sessionCount || 0), 0) / variantParticipants.length;
      const errorRate = variantParticipants.reduce((sum, p) => sum + p.metrics.errorCount, 0) / variantParticipants.length;
      const taskCompletionRate = (variantParticipants.reduce((sum, p) => sum + p.metrics.taskCompletions, 0) / variantParticipants.length) * 100;
      
      const allRatings = variantParticipants.flatMap(p => p.metrics.satisfactionRatings);
      const satisfactionScore = allRatings.length > 0 ? allRatings.reduce((sum, rating) => sum + rating, 0) / allRatings.length : 0;

      return {
        variantId: variant.id,
        participants: variantParticipants.length,
        primaryMetricValue,
        primaryMetricStdDev,
        conversionRate,
        secondaryMetrics: {},
        averageLoadTime,
        errorRate,
        taskCompletionRate,
        satisfactionScore,
        sessionDuration: averageLoadTime,
        featureUsage: {},
        retentionRate: 0
      };
    });
  }

  private extractPrimaryMetricValues(primaryMetric: string, participants: ABTestParticipant[]): number[] {
    switch (primaryMetric) {
      case 'conversion':
        return participants.map(p => p.conversions.length);
      case 'engagement':
        return participants.map(p => p.metrics.sessionCount);
      case 'satisfaction':
        return participants.map(p => {
          const ratings = p.metrics.satisfactionRatings;
          return ratings.length > 0 ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length : 0;
        });
      case 'task_completion':
        return participants.map(p => p.metrics.taskCompletions);
      case 'error_rate':
        return participants.map(p => p.metrics.errorCount);
      default:
        return participants.map(() => 0);
    }
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
    return Math.sqrt(avgSquaredDiff);
  }

  private determineWinner(variantResults: VariantResults[]): string | undefined {
    if (variantResults.length < 2) return undefined;

    // Simple winner determination based on primary metric
    const sortedResults = [...variantResults].sort((a, b) => b.primaryMetricValue - a.primaryMetricValue);
    return sortedResults[0].variantId;
  }

  private calculateStatisticalSignificance(variantResults: VariantResults[]): { confidence: number; significance: number } {
    // Simplified statistical significance calculation
    // In production, use proper statistical tests like t-test or chi-square
    if (variantResults.length < 2) return { confidence: 0, significance: 1 };

    const [variant1, variant2] = variantResults;
    const diff = Math.abs(variant1.primaryMetricValue - variant2.primaryMetricValue);
    const pooledStdDev = Math.sqrt((Math.pow(variant1.primaryMetricStdDev, 2) + Math.pow(variant2.primaryMetricStdDev, 2)) / 2);
    
    if (pooledStdDev === 0) return { confidence: 50, significance: 0.5 };

    const effectSize = diff / pooledStdDev;
    const confidence = Math.min(95, effectSize * 30 + 50); // Simplified confidence calculation
    const significance = Math.max(0.01, 1 - (confidence / 100));

    return { confidence, significance };
  }

  private generateInsights(test: ABTest, variantResults: VariantResults[]): string[] {
    const insights: string[] = [];
    
    if (variantResults.length < 2) return insights;

    const [best, ...others] = variantResults.sort((a, b) => b.primaryMetricValue - a.primaryMetricValue);
    
    insights.push(`Best performing variant: ${best.variantId} with ${best.primaryMetricValue.toFixed(2)} ${test.primaryMetric}`);
    
    if (best.participants < test.minimumSampleSize) {
      insights.push(`Sample size (${best.participants}) is below minimum requirement (${test.minimumSampleSize})`);
    }

    const improvementPercentage = others.length > 0 
      ? ((best.primaryMetricValue - others[0].primaryMetricValue) / others[0].primaryMetricValue) * 100
      : 0;
    
    if (improvementPercentage > 5) {
      insights.push(`Significant improvement of ${improvementPercentage.toFixed(1)}% over control`);
    } else {
      insights.push('No significant difference detected between variants');
    }

    return insights;
  }

  private generateRecommendations(test: ABTest, variantResults: VariantResults[], winner?: string): string[] {
    const recommendations: string[] = [];
    
    if (!winner) {
      recommendations.push('No clear winner. Consider running the test longer or increasing sample size.');
      return recommendations;
    }

    const winnerResult = variantResults.find(r => r.variantId === winner);
    if (!winnerResult) return recommendations;

    if (winnerResult.participants >= test.minimumSampleSize) {
      recommendations.push(`Roll out variant ${winner} to all users`);
    } else {
      recommendations.push(`Extend test duration to reach minimum sample size of ${test.minimumSampleSize}`);
    }

    if (winnerResult.errorRate > 5) {
      recommendations.push('Address error rate issues before full rollout');
    }

    if (winnerResult.satisfactionScore < 7) {
      recommendations.push('Consider user experience improvements before rollout');
    }

    return recommendations;
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService();

// Predefined test templates for common concrete cutting scenarios
export const createOnboardingTest = (): Omit<ABTest, 'id'> => ({
  name: 'Onboarding Flow Optimization',
  description: 'Test different onboarding approaches for new contractors',
  status: 'draft',
  startDate: new Date(),
  trafficAllocation: 50,
  variants: [
    {
      id: 'control',
      name: 'Standard Onboarding',
      description: 'Current 6-step onboarding process',
      trafficSplit: 50,
      isControl: true,
      config: {
        onboarding: {
          steps: 6,
          skipEnabled: false,
          progressIndicator: true
        }
      }
    },
    {
      id: 'simplified',
      name: 'Simplified Onboarding',
      description: 'Streamlined 3-step process with smart defaults',
      trafficSplit: 50,
      isControl: false,
      config: {
        onboarding: {
          steps: 3,
          skipEnabled: true,
          progressIndicator: true,
          smartDefaults: true
        }
      }
    }
  ],
  targetAudience: {
    betaGroups: ['beta', 'gamma'],
    companyTypes: ['micro', 'small'],
    minSessionCount: 0
  },
  primaryMetric: 'task_completion',
  secondaryMetrics: ['satisfaction', 'engagement'],
  minimumSampleSize: 30
});

export const createSafetyComplianceTest = (): Omit<ABTest, 'id'> => ({
  name: 'Safety Compliance UI Test',
  description: 'Test different approaches to safety compliance workflows',
  status: 'draft',
  startDate: new Date(),
  trafficAllocation: 75,
  variants: [
    {
      id: 'control',
      name: 'Current Safety Flow',
      description: 'Standard safety compliance form',
      trafficSplit: 40,
      isControl: true,
      config: {
        safety: {
          layout: 'form',
          photoRequired: true,
          validationStrict: true
        }
      }
    },
    {
      id: 'wizard',
      name: 'Guided Safety Wizard',
      description: 'Step-by-step safety compliance wizard',
      trafficSplit: 30,
      isControl: false,
      config: {
        safety: {
          layout: 'wizard',
          photoRequired: true,
          validationStrict: true,
          guidance: true
        }
      }
    },
    {
      id: 'smart',
      name: 'Smart Safety Assistant',
      description: 'AI-powered safety recommendations',
      trafficSplit: 30,
      isControl: false,
      config: {
        safety: {
          layout: 'smart',
          photoRequired: false,
          validationStrict: false,
          aiRecommendations: true
        }
      }
    }
  ],
  targetAudience: {
    betaGroups: ['alpha', 'beta'],
    companyTypes: ['medium', 'large'],
    workTypes: ['core_drill', 'wall_saw', 'slab_saw'],
    minSessionCount: 5
  },
  primaryMetric: 'task_completion',
  secondaryMetrics: ['satisfaction', 'error_rate'],
  minimumSampleSize: 50
});