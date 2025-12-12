/**
 * Production-ready analytics tracking
 */

import { getConfig } from './productionConfig';
import { errorReporter } from './errorReporting';

type EventProps = Record<string, unknown>;

interface AnalyticsEvent {
  name: string;
  properties?: EventProps;
  userId?: string;
  timestamp: number;
}

interface PageView {
  page: string;
  title: string;
  userId?: string;
  timestamp: number;
  referrer?: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private pageViews: PageView[] = [];
  private config = getConfig();

  constructor() {
    this.initializeAnalytics();
  }

  private initializeAnalytics() {
    if (!this.config.enableAnalytics) {
      return;
    }

    // Track page views automatically
    this.trackPageView();
    
    // Listen for route changes
    window.addEventListener('popstate', () => {
      this.trackPageView();
    });

    // Send analytics data periodically
    setInterval(() => {
      this.sendBatchData();
    }, 30000); // Every 30 seconds

    // Send data before page unload
    window.addEventListener('beforeunload', () => {
      this.sendBatchData();
    });
  }

  trackEvent(name: string, properties?: EventProps) {
    if (!this.config.enableAnalytics) {
      return;
    }

    const event: AnalyticsEvent = {
      name,
  properties: properties ?? undefined,
      userId: this.getCurrentUserId(),
      timestamp: Date.now()
    };

    this.events.push(event);

    // Also log to console in development
    if (import.meta.env.DEV) {
      // Production: Send to analytics service
      // In development: Silent logging
    }
  }

  trackPageView(page?: string, title?: string) {
    if (!this.config.enableAnalytics) {
      return;
    }

    const pageView: PageView = {
      page: page || window.location.pathname,
      title: title || document.title,
      userId: this.getCurrentUserId(),
      timestamp: Date.now(),
      referrer: document.referrer || undefined
    };

    this.pageViews.push(pageView);
  }

  trackUserAction(action: string, target: string, properties?: EventProps) {
    this.trackEvent('user_action', {
      action,
      target,
      ...properties
    });
  }

  trackVideoEvent(eventType: 'play' | 'pause' | 'end' | 'seek', videoId: string, currentTime?: number) {
    this.trackEvent('video_interaction', {
      event_type: eventType,
      video_id: videoId,
      current_time: currentTime,
      timestamp: Date.now()
    } as EventProps);
  }

  trackSearchEvent(query: string, resultsCount: number, selectedResult?: string) {
    this.trackEvent('search', {
      query,
      results_count: resultsCount,
      selected_result: selectedResult
    } as EventProps);
  }

  trackDownloadEvent(contentId: string, contentType: string, quality: string) {
    this.trackEvent('download', {
      content_id: contentId,
      content_type: contentType,
      quality
    } as EventProps);
  }

  trackError(error: Error, component?: string) {
    this.trackEvent('error', {
      error_message: error.message,
      error_stack: error.stack,
      component
    } as EventProps);
  }

  private getCurrentUserId(): string | undefined {
    try {
      const user = localStorage.getItem('supabase.auth.token');
      if (user) {
        const parsed = JSON.parse(user) as unknown;
        if (parsed && typeof parsed === 'object' && 'user' in (parsed as Record<string, unknown>)) {
          const p = parsed as { user?: { id?: string } };
          return p.user?.id;
        }
      }
    } catch {
      // Ignore errors
    }
    return undefined;
  }

  private async sendBatchData() {
    if (this.events.length === 0 && this.pageViews.length === 0) {
      return;
    }

    // Local-only analytics - data is kept in memory for the session
    // No external API calls to avoid network errors
    // This can be extended later with proper analytics backend
    
    // Clear old data to prevent memory leaks
    this.events = [];
    this.pageViews = [];
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  }

  // Performance tracking
  trackPerformance(metric: string, value: number, details?: EventProps) {
    this.trackEvent('performance', {
      metric,
      value,
      ...(details || {})
    } as EventProps);
  }

  // Feature usage tracking
  trackFeatureUsage(feature: string, action: 'enabled' | 'disabled' | 'used') {
    this.trackEvent('feature_usage', {
      feature,
      action
    });
  }

  // Conversion tracking
  trackConversion(type: 'signup' | 'premium_upgrade' | 'download' | 'share', value?: number) {
    this.trackEvent('conversion', {
      type,
      value
    });
  }
}

// Create singleton instance
export const analytics = new Analytics();

// Convenience functions
export const trackEvent = (name: string, properties?: EventProps) => {
  analytics.trackEvent(name, properties);
};

export const trackPageView = (page?: string, title?: string) => {
  analytics.trackPageView(page, title);
};

export const trackUserAction = (action: string, target: string, properties?: EventProps) => {
  analytics.trackUserAction(action, target, properties);
};

export default analytics;