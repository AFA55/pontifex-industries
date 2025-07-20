/**
 * Automated Metrics Collection and Reporting System
 * Tracks user interactions, performance, and generates insights for beta testing
 */

export interface MetricEvent {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  
  // Event Classification
  category: 'user_action' | 'performance' | 'error' | 'system' | 'business';
  action: string;
  label?: string;
  value?: number;
  
  // Context
  page: string;
  feature: string;
  userAgent: string;
  deviceType: 'mobile' | 'tablet' | 'desktop';
  
  // Custom Properties
  properties: Record<string, any>;
  
  // A/B Testing Context
  abTests?: Array<{
    testId: string;
    variantId: string;
  }>;
  
  // User Context
  betaGroup: 'alpha' | 'beta' | 'gamma';
  companySize: 'micro' | 'small' | 'medium' | 'large';
  userTenure: number; // days since signup
}

export interface PerformanceMetric {
  id: string;
  timestamp: Date;
  userId: string;
  sessionId: string;
  
  // Performance Data
  metric: 'page_load' | 'feature_load' | 'api_response' | 'error_rate' | 'crash';
  value: number;
  unit: 'ms' | 'seconds' | 'count' | 'percentage';
  
  // Context
  page: string;
  feature?: string;
  apiEndpoint?: string;
  errorType?: string;
  
  // Technical Details
  browser: string;
  browserVersion: string;
  os: string;
  connectionType: string;
  deviceMemory?: number;
  
  // Performance Marks
  navigationTiming?: {
    domContentLoaded: number;
    loadComplete: number;
    firstPaint: number;
    firstContentfulPaint: number;
  };
}

export interface BusinessMetric {
  id: string;
  timestamp: Date;
  userId: string;
  
  // Business Event
  event: 'job_created' | 'safety_check_completed' | 'photo_uploaded' | 'compliance_report_generated' | 'feature_adopted';
  value?: number;
  currency?: string;
  
  // Context
  workType?: string;
  jobSize?: 'small' | 'medium' | 'large';
  complianceType?: string;
  featureName?: string;
  
  // Success/Failure
  success: boolean;
  errorReason?: string;
  
  // Timing
  timeToComplete?: number; // milliseconds
  assistanceRequired?: boolean;
}

export interface SessionMetrics {
  sessionId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  duration?: number; // seconds
  
  // Engagement
  pageViews: number;
  uniquePages: number;
  featuresUsed: string[];
  actionsPerformed: number;
  
  // Quality Metrics
  errorCount: number;
  crashCount: number;
  bounceRate: boolean; // single page session
  
  // Business Activity
  jobsCreated: number;
  safetyChecksCompleted: number;
  photosUploaded: number;
  
  // User Satisfaction
  feedbackGiven: boolean;
  ratingProvided?: number;
  
  // Technical
  deviceType: 'mobile' | 'tablet' | 'desktop';
  browser: string;
  os: string;
  avgPageLoadTime: number;
}

export interface MetricsReport {
  id: string;
  generatedAt: Date;
  reportType: 'daily' | 'weekly' | 'monthly' | 'custom';
  dateRange: {
    start: Date;
    end: Date;
  };
  
  // Overview
  totalUsers: number;
  totalSessions: number;
  totalEvents: number;
  
  // Engagement Metrics
  avgSessionDuration: number;
  avgPagesPerSession: number;
  retentionRate: number;
  dailyActiveUsers: number;
  
  // Performance Metrics
  avgPageLoadTime: number;
  errorRate: number;
  crashRate: number;
  apiResponseTime: number;
  
  // Feature Adoption
  featureUsage: Array<{
    feature: string;
    adoptionRate: number;
    avgUsageTime: number;
    satisfactionScore: number;
  }>;
  
  // Business Metrics
  businessMetrics: {
    jobsCreated: number;
    safetyChecksCompleted: number;
    complianceReportsGenerated: number;
    avgJobCompletionTime: number;
    successRate: number;
  };
  
  // User Segments
  segmentAnalysis: Array<{
    segment: string;
    userCount: number;
    engagementScore: number;
    satisfactionScore: number;
    retentionRate: number;
  }>;
  
  // Top Issues
  topIssues: Array<{
    issue: string;
    frequency: number;
    severity: 'low' | 'medium' | 'high' | 'critical';
    affectedUsers: number;
  }>;
  
  // Recommendations
  insights: string[];
  actionItems: Array<{
    priority: 'low' | 'medium' | 'high' | 'critical';
    category: 'performance' | 'usability' | 'feature' | 'bug';
    description: string;
    estimatedImpact: 'low' | 'medium' | 'high';
  }>;
}

class MetricsCollectionService {
  private events: MetricEvent[] = [];
  private performanceMetrics: PerformanceMetric[] = [];
  private businessMetrics: BusinessMetric[] = [];
  private sessions: Map<string, SessionMetrics> = new Map();
  private currentSessionId: string | null = null;
  private userId: string | null = null;
  private isEnabled: boolean = true;

  /**
   * Initialize metrics collection for a user session
   */
  initialize(userId: string, userContext: {
    betaGroup: 'alpha' | 'beta' | 'gamma';
    companySize: 'micro' | 'small' | 'medium' | 'large';
    signupDate: Date;
  }): void {
    this.userId = userId;
    this.currentSessionId = this.generateSessionId();
    
    // Create new session
    const session: SessionMetrics = {
      sessionId: this.currentSessionId,
      userId,
      startTime: new Date(),
      pageViews: 0,
      uniquePages: 0,
      featuresUsed: [],
      actionsPerformed: 0,
      errorCount: 0,
      crashCount: 0,
      bounceRate: false,
      jobsCreated: 0,
      safetyChecksCompleted: 0,
      photosUploaded: 0,
      feedbackGiven: false,
      deviceType: this.getDeviceType(),
      browser: this.getBrowserInfo().name,
      os: this.getOSInfo(),
      avgPageLoadTime: 0
    };
    
    this.sessions.set(this.currentSessionId, session);
    
    // Track session start
    this.trackEvent({
      category: 'user_action',
      action: 'session_start',
      page: window.location.pathname,
      feature: 'session',
      properties: userContext
    });
  }

  /**
   * Track a user action or system event
   */
  trackEvent(event: Omit<MetricEvent, 'id' | 'timestamp' | 'userId' | 'sessionId' | 'userAgent' | 'deviceType' | 'betaGroup' | 'companySize' | 'userTenure'>): void {
    if (!this.isEnabled || !this.userId || !this.currentSessionId) return;

    const metricEvent: MetricEvent = {
      id: this.generateEventId(),
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.currentSessionId,
      userAgent: navigator.userAgent,
      deviceType: this.getDeviceType(),
      betaGroup: 'beta', // This would come from user context
      companySize: 'medium', // This would come from user context
      userTenure: 0, // This would be calculated
      ...event
    };

    this.events.push(metricEvent);
    this.updateSessionMetrics(event);
    
    // Send to analytics service (in production)
    this.sendToAnalytics(metricEvent);
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: Omit<PerformanceMetric, 'id' | 'timestamp' | 'userId' | 'sessionId' | 'browser' | 'browserVersion' | 'os' | 'connectionType'>): void {
    if (!this.isEnabled || !this.userId || !this.currentSessionId) return;

    const performanceMetric: PerformanceMetric = {
      id: this.generateEventId(),
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.currentSessionId,
      browser: this.getBrowserInfo().name,
      browserVersion: this.getBrowserInfo().version,
      os: this.getOSInfo(),
      connectionType: this.getConnectionType(),
      ...metric
    };

    this.performanceMetrics.push(performanceMetric);
    
    // Update session performance metrics
    this.updateSessionPerformance(performanceMetric);
  }

  /**
   * Track business events
   */
  trackBusiness(event: Omit<BusinessMetric, 'id' | 'timestamp' | 'userId'>): void {
    if (!this.isEnabled || !this.userId) return;

    const businessMetric: BusinessMetric = {
      id: this.generateEventId(),
      timestamp: new Date(),
      userId: this.userId,
      ...event
    };

    this.businessMetrics.push(businessMetric);
    this.updateSessionBusiness(event);
  }

  /**
   * Track page view
   */
  trackPageView(page: string, loadTime?: number): void {
    this.trackEvent({
      category: 'user_action',
      action: 'page_view',
      page,
      feature: 'navigation',
      value: loadTime,
      properties: {
        referrer: document.referrer,
        title: document.title
      }
    });

    if (loadTime) {
      this.trackPerformance({
        metric: 'page_load',
        value: loadTime,
        unit: 'ms',
        page,
        navigationTiming: this.getNavigationTiming()
      });
    }
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(feature: string, action: string, timeSpent?: number, success: boolean = true): void {
    this.trackEvent({
      category: 'user_action',
      action: `feature_${action}`,
      page: window.location.pathname,
      feature,
      value: timeSpent,
      properties: {
        success,
        timeSpent
      }
    });

    // Update session feature usage
    const session = this.sessions.get(this.currentSessionId!);
    if (session && !session.featuresUsed.includes(feature)) {
      session.featuresUsed.push(feature);
    }
  }

  /**
   * Track errors
   */
  trackError(error: Error, context?: Record<string, any>): void {
    this.trackEvent({
      category: 'error',
      action: 'javascript_error',
      page: window.location.pathname,
      feature: 'system',
      label: error.name,
      properties: {
        message: error.message,
        stack: error.stack,
        ...context
      }
    });

    // Update session error count
    const session = this.sessions.get(this.currentSessionId!);
    if (session) {
      session.errorCount++;
    }
  }

  /**
   * Track user satisfaction
   */
  trackSatisfaction(rating: number, feature?: string, feedback?: string): void {
    this.trackEvent({
      category: 'user_action',
      action: 'satisfaction_rating',
      page: window.location.pathname,
      feature: feature || 'general',
      value: rating,
      properties: {
        rating,
        feedback
      }
    });

    // Update session feedback
    const session = this.sessions.get(this.currentSessionId!);
    if (session) {
      session.feedbackGiven = true;
      session.ratingProvided = rating;
    }
  }

  /**
   * End current session
   */
  endSession(): void {
    if (!this.currentSessionId) return;

    const session = this.sessions.get(this.currentSessionId);
    if (session) {
      session.endTime = new Date();
      session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
      session.bounceRate = session.pageViews <= 1;
    }

    this.trackEvent({
      category: 'user_action',
      action: 'session_end',
      page: window.location.pathname,
      feature: 'session',
      value: session?.duration,
      properties: {
        sessionDuration: session?.duration,
        pageViews: session?.pageViews,
        actionsPerformed: session?.actionsPerformed
      }
    });

    this.currentSessionId = null;
  }

  /**
   * Generate metrics report
   */
  generateReport(dateRange: { start: Date; end: Date }, reportType: 'daily' | 'weekly' | 'monthly' | 'custom' = 'custom'): MetricsReport {
    const filteredEvents = this.events.filter(event => 
      event.timestamp >= dateRange.start && event.timestamp <= dateRange.end
    );
    
    const filteredSessions = Array.from(this.sessions.values()).filter(session =>
      session.startTime >= dateRange.start && session.startTime <= dateRange.end
    );
    
    const filteredBusiness = this.businessMetrics.filter(metric =>
      metric.timestamp >= dateRange.start && metric.timestamp <= dateRange.end
    );

    // Calculate metrics
    const uniqueUsers = new Set(filteredEvents.map(e => e.userId)).size;
    const totalSessions = filteredSessions.length;
    const avgSessionDuration = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / totalSessions;
    const avgPagesPerSession = filteredSessions.reduce((sum, s) => sum + s.pageViews, 0) / totalSessions;
    
    // Performance metrics
    const pageLoadMetrics = this.performanceMetrics.filter(m => 
      m.metric === 'page_load' && m.timestamp >= dateRange.start && m.timestamp <= dateRange.end
    );
    const avgPageLoadTime = pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length;
    
    const errorEvents = filteredEvents.filter(e => e.category === 'error');
    const errorRate = (errorEvents.length / filteredEvents.length) * 100;

    // Feature adoption
    const featureUsage = this.calculateFeatureUsage(filteredEvents);
    
    // Business metrics
    const jobsCreated = filteredBusiness.filter(m => m.event === 'job_created').length;
    const safetyChecks = filteredBusiness.filter(m => m.event === 'safety_check_completed').length;
    const complianceReports = filteredBusiness.filter(m => m.event === 'compliance_report_generated').length;
    
    const successfulJobs = filteredBusiness.filter(m => m.event === 'job_created' && m.success).length;
    const successRate = jobsCreated > 0 ? (successfulJobs / jobsCreated) * 100 : 0;

    // Generate insights
    const insights = this.generateInsights(filteredEvents, filteredSessions, filteredBusiness);
    const actionItems = this.generateActionItems(errorRate, avgPageLoadTime, successRate, featureUsage);

    return {
      id: this.generateEventId(),
      generatedAt: new Date(),
      reportType,
      dateRange,
      totalUsers: uniqueUsers,
      totalSessions,
      totalEvents: filteredEvents.length,
      avgSessionDuration,
      avgPagesPerSession,
      retentionRate: 0, // Would need historical data to calculate
      dailyActiveUsers: uniqueUsers, // Simplified for this period
      avgPageLoadTime: avgPageLoadTime || 0,
      errorRate,
      crashRate: 0, // Would track separately
      apiResponseTime: 0, // Would track API calls separately
      featureUsage,
      businessMetrics: {
        jobsCreated,
        safetyChecksCompleted: safetyChecks,
        complianceReportsGenerated: complianceReports,
        avgJobCompletionTime: 0, // Would calculate from job timing data
        successRate
      },
      segmentAnalysis: this.calculateSegmentAnalysis(filteredEvents, filteredSessions),
      topIssues: this.identifyTopIssues(errorEvents),
      insights,
      actionItems
    };
  }

  /**
   * Get real-time metrics
   */
  getRealTimeMetrics(): {
    activeUsers: number;
    activeSessions: number;
    eventsLastHour: number;
    errorRateLastHour: number;
    avgResponseTime: number;
  } {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentEvents = this.events.filter(e => e.timestamp >= oneHourAgo);
    const recentErrors = recentEvents.filter(e => e.category === 'error');
    
    return {
      activeUsers: new Set(recentEvents.map(e => e.userId)).size,
      activeSessions: new Set(recentEvents.map(e => e.sessionId)).size,
      eventsLastHour: recentEvents.length,
      errorRateLastHour: recentEvents.length > 0 ? (recentErrors.length / recentEvents.length) * 100 : 0,
      avgResponseTime: 0 // Would calculate from API timing data
    };
  }

  // Private helper methods

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getBrowserInfo(): { name: string; version: string } {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Chrome')) {
      const match = userAgent.match(/Chrome\/([0-9.]+)/);
      return { name: 'Chrome', version: match ? match[1] : 'unknown' };
    } else if (userAgent.includes('Firefox')) {
      const match = userAgent.match(/Firefox\/([0-9.]+)/);
      return { name: 'Firefox', version: match ? match[1] : 'unknown' };
    } else if (userAgent.includes('Safari')) {
      const match = userAgent.match(/Safari\/([0-9.]+)/);
      return { name: 'Safari', version: match ? match[1] : 'unknown' };
    }
    
    return { name: 'Unknown', version: 'unknown' };
  }

  private getOSInfo(): string {
    const userAgent = navigator.userAgent;
    
    if (userAgent.includes('Windows')) return 'Windows';
    if (userAgent.includes('Mac')) return 'macOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';
    
    return 'Unknown';
  }

  private getConnectionType(): string {
    // @ts-ignore - Navigator connection is not in all TypeScript definitions
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection ? connection.effectiveType || 'unknown' : 'unknown';
  }

  private getNavigationTiming() {
    if (!performance.timing) return undefined;
    
    const timing = performance.timing;
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
      loadComplete: timing.loadEventEnd - timing.navigationStart,
      firstPaint: 0, // Would use Performance Observer for this
      firstContentfulPaint: 0 // Would use Performance Observer for this
    };
  }

  private updateSessionMetrics(event: any): void {
    const session = this.sessions.get(this.currentSessionId!);
    if (!session) return;

    session.actionsPerformed++;
    
    if (event.action === 'page_view') {
      session.pageViews++;
      
      // Track unique pages
      const pages = new Set<string>();
      this.events
        .filter(e => e.sessionId === this.currentSessionId && e.action === 'page_view')
        .forEach(e => pages.add(e.page));
      session.uniquePages = pages.size;
    }
  }

  private updateSessionPerformance(metric: PerformanceMetric): void {
    const session = this.sessions.get(this.currentSessionId!);
    if (!session) return;

    if (metric.metric === 'page_load') {
      const pageLoadMetrics = this.performanceMetrics.filter(m => 
        m.sessionId === this.currentSessionId && m.metric === 'page_load'
      );
      session.avgPageLoadTime = pageLoadMetrics.reduce((sum, m) => sum + m.value, 0) / pageLoadMetrics.length;
    }
  }

  private updateSessionBusiness(event: any): void {
    const session = this.sessions.get(this.currentSessionId!);
    if (!session) return;

    switch (event.event) {
      case 'job_created':
        session.jobsCreated++;
        break;
      case 'safety_check_completed':
        session.safetyChecksCompleted++;
        break;
      case 'photo_uploaded':
        session.photosUploaded++;
        break;
    }
  }

  private calculateFeatureUsage(events: MetricEvent[]) {
    const featureMap = new Map<string, { uses: number; timeSpent: number; ratings: number[] }>();
    
    events.forEach(event => {
      if (event.category === 'user_action' && event.feature) {
        if (!featureMap.has(event.feature)) {
          featureMap.set(event.feature, { uses: 0, timeSpent: 0, ratings: [] });
        }
        
        const feature = featureMap.get(event.feature)!;
        feature.uses++;
        
        if (event.value) {
          feature.timeSpent += event.value;
        }
        
        if (event.action === 'satisfaction_rating' && event.value) {
          feature.ratings.push(event.value);
        }
      }
    });

    return Array.from(featureMap.entries()).map(([feature, data]) => ({
      feature,
      adoptionRate: (data.uses / events.length) * 100,
      avgUsageTime: data.timeSpent / data.uses,
      satisfactionScore: data.ratings.length > 0 
        ? data.ratings.reduce((sum, r) => sum + r, 0) / data.ratings.length 
        : 0
    }));
  }

  private calculateSegmentAnalysis(events: MetricEvent[], sessions: SessionMetrics[]) {
    const segments = ['alpha', 'beta', 'gamma'];
    
    return segments.map(segment => {
      const segmentEvents = events.filter(e => e.betaGroup === segment);
      const segmentSessions = sessions.filter(s => {
        const userEvents = events.filter(e => e.userId === s.userId);
        return userEvents.length > 0 && userEvents[0].betaGroup === segment;
      });
      
      const avgSessionDuration = segmentSessions.reduce((sum, s) => sum + (s.duration || 0), 0) / segmentSessions.length;
      const satisfactionRatings = segmentEvents
        .filter(e => e.action === 'satisfaction_rating' && e.value)
        .map(e => e.value!);
      const avgSatisfaction = satisfactionRatings.length > 0
        ? satisfactionRatings.reduce((sum, r) => sum + r, 0) / satisfactionRatings.length
        : 0;

      return {
        segment,
        userCount: new Set(segmentEvents.map(e => e.userId)).size,
        engagementScore: Math.min(100, (avgSessionDuration / 1800) * 100), // 30 min = 100%
        satisfactionScore: avgSatisfaction,
        retentionRate: 0 // Would need historical data
      };
    });
  }

  private identifyTopIssues(errorEvents: MetricEvent[]) {
    const issueMap = new Map<string, { count: number; users: Set<string> }>();
    
    errorEvents.forEach(event => {
      const issue = event.label || 'Unknown Error';
      if (!issueMap.has(issue)) {
        issueMap.set(issue, { count: 0, users: new Set() });
      }
      
      const issueData = issueMap.get(issue)!;
      issueData.count++;
      issueData.users.add(event.userId);
    });

    return Array.from(issueMap.entries())
      .map(([issue, data]) => ({
        issue,
        frequency: data.count,
        severity: data.count > 10 ? 'high' : data.count > 5 ? 'medium' : 'low' as 'low' | 'medium' | 'high' | 'critical',
        affectedUsers: data.users.size
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);
  }

  private generateInsights(events: MetricEvent[], sessions: SessionMetrics[], business: BusinessMetric[]): string[] {
    const insights: string[] = [];
    
    // User engagement insights
    const avgSessionDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
    if (avgSessionDuration > 1800) { // 30 minutes
      insights.push('Users are highly engaged with average session duration over 30 minutes');
    } else if (avgSessionDuration < 300) { // 5 minutes
      insights.push('Low engagement detected - users spending less than 5 minutes per session');
    }

    // Feature adoption insights
    const featureEvents = events.filter(e => e.category === 'user_action' && e.feature);
    const uniqueFeatures = new Set(featureEvents.map(e => e.feature)).size;
    if (uniqueFeatures < 3) {
      insights.push('Limited feature exploration - users are only using a few core features');
    }

    // Error rate insights
    const errorRate = (events.filter(e => e.category === 'error').length / events.length) * 100;
    if (errorRate > 5) {
      insights.push(`High error rate detected: ${errorRate.toFixed(1)}% of interactions result in errors`);
    }

    // Business success insights
    const successfulJobs = business.filter(b => b.event === 'job_created' && b.success).length;
    const totalJobs = business.filter(b => b.event === 'job_created').length;
    const successRate = totalJobs > 0 ? (successfulJobs / totalJobs) * 100 : 0;
    
    if (successRate > 90) {
      insights.push('Excellent job completion rate - users are successfully completing their tasks');
    } else if (successRate < 70) {
      insights.push(`Job completion rate needs improvement: ${successRate.toFixed(1)}% success rate`);
    }

    return insights;
  }

  private generateActionItems(errorRate: number, avgPageLoadTime: number, successRate: number, featureUsage: any[]): any[] {
    const actionItems: any[] = [];

    // Performance action items
    if (avgPageLoadTime > 3000) {
      actionItems.push({
        priority: 'high' as const,
        category: 'performance' as const,
        description: `Page load time is ${(avgPageLoadTime / 1000).toFixed(1)}s - optimize for better user experience`,
        estimatedImpact: 'high' as const
      });
    }

    // Error rate action items
    if (errorRate > 5) {
      actionItems.push({
        priority: 'critical' as const,
        category: 'bug' as const,
        description: `Error rate is ${errorRate.toFixed(1)}% - investigate and fix critical issues`,
        estimatedImpact: 'high' as const
      });
    }

    // Success rate action items
    if (successRate < 80) {
      actionItems.push({
        priority: 'high' as const,
        category: 'usability' as const,
        description: `Job success rate is ${successRate.toFixed(1)}% - improve user guidance and UX`,
        estimatedImpact: 'medium' as const
      });
    }

    // Feature adoption action items
    const lowAdoptionFeatures = featureUsage.filter(f => f.adoptionRate < 20);
    if (lowAdoptionFeatures.length > 0) {
      actionItems.push({
        priority: 'medium' as const,
        category: 'feature' as const,
        description: `${lowAdoptionFeatures.length} features have low adoption - improve discoverability`,
        estimatedImpact: 'medium' as const
      });
    }

    return actionItems;
  }

  private sendToAnalytics(event: MetricEvent): void {
    // In production, send to analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Analytics Event:', event);
  }
}

// Export singleton instance
export const metricsService = new MetricsCollectionService();

// Auto-track common events
if (typeof window !== 'undefined') {
  // Track page load performance
  window.addEventListener('load', () => {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    metricsService.trackPageView(window.location.pathname, loadTime);
  });

  // Track JavaScript errors
  window.addEventListener('error', (event) => {
    metricsService.trackError(new Error(event.message), {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Track unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    metricsService.trackError(new Error(event.reason), {
      type: 'unhandled_promise_rejection'
    });
  });

  // Track page visibility changes
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      metricsService.trackEvent({
        category: 'user_action',
        action: 'page_hidden',
        page: window.location.pathname,
        feature: 'navigation',
        properties: {}
      });
    } else {
      metricsService.trackEvent({
        category: 'user_action',
        action: 'page_visible',
        page: window.location.pathname,
        feature: 'navigation',
        properties: {}
      });
    }
  });

  // Track session end on page unload
  window.addEventListener('beforeunload', () => {
    metricsService.endSession();
  });
}