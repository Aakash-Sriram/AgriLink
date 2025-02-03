import { ReportHandler } from 'web-vitals';

interface PerformanceMetrics {
  duration: number;
  timestamp: number;
}

interface ThresholdConfig {
  warning: number;
  critical: number;
}

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetrics[]> = new Map();
  private static thresholds: Map<string, ThresholdConfig> = new Map();
  private static readonly MAX_SAMPLES = 100;
  private static readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private static reporter: ((metrics: Record<string, unknown>) => void) | null = null;

  static initialize(reporter?: (metrics: Record<string, unknown>) => void): void {
    this.reporter = reporter || null;
    this.setupWebVitals();
    this.setupPeriodicCleanup();
  }

  static setThreshold(id: string, warning: number, critical: number): void {
    this.thresholds.set(id, { warning, critical });
  }

  static startMeasure(id: string): void {
    if (!id) throw new Error('Performance measurement ID is required');
    performance.mark(`${id}-start`);
  }

  static endMeasure(id: string): number {
    if (!id) throw new Error('Performance measurement ID is required');
    
    try {
      performance.mark(`${id}-end`);
      performance.measure(id, `${id}-start`, `${id}-end`);
      const measure = performance.getEntriesByName(id).pop();
      const duration = measure?.duration || 0;

      this.recordMetric(id, duration);
      this.checkThreshold(id, duration);

      return duration;
    } finally {
      // Cleanup marks and measures
      performance.clearMarks(`${id}-start`);
      performance.clearMarks(`${id}-end`);
      performance.clearMeasures(id);
    }
  }

  private static recordMetric(id: string, duration: number): void {
    const metrics = this.metrics.get(id) || [];
    metrics.push({
      duration,
      timestamp: Date.now()
    });

    // Maintain sample size limit
    if (metrics.length > this.MAX_SAMPLES) {
      metrics.shift();
    }

    this.metrics.set(id, metrics);
    this.reportMetrics(id);
  }

  private static checkThreshold(id: string, duration: number): void {
    const threshold = this.thresholds.get(id);
    if (!threshold) return;

    if (duration > threshold.critical) {
      this.reportCriticalPerformance(id, duration);
    } else if (duration > threshold.warning) {
      this.reportWarningPerformance(id, duration);
    }
  }

  static getMetrics(id: string, timeWindow?: number): PerformanceMetrics[] {
    const metrics = this.metrics.get(id) || [];
    if (!timeWindow) return metrics;

    const cutoff = Date.now() - timeWindow;
    return metrics.filter(m => m.timestamp >= cutoff);
  }

  static getAverageDuration(id: string, timeWindow?: number): number {
    const metrics = this.getMetrics(id, timeWindow);
    if (metrics.length === 0) return 0;
    
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }

  static getPercentile(id: string, percentile: number, timeWindow?: number): number {
    const metrics = this.getMetrics(id, timeWindow);
    if (metrics.length === 0) return 0;

    const sorted = metrics.map(m => m.duration).sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private static setupWebVitals(): void {
    const reportWebVitals: ReportHandler = (metric) => {
      const { name, value } = metric;
      this.recordMetric(`webVitals-${name}`, value);
    };

    // Report Core Web Vitals
    import('web-vitals').then(({ getCLS, getFID, getLCP }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getLCP(reportWebVitals);
    });
  }

  private static setupPeriodicCleanup(): void {
    setInterval(() => {
      const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
      for (const [id, metrics] of this.metrics.entries()) {
        const filtered = metrics.filter(m => m.timestamp > cutoff);
        if (filtered.length === 0) {
          this.metrics.delete(id);
        } else {
          this.metrics.set(id, filtered);
        }
      }
    }, this.CLEANUP_INTERVAL);
  }

  private static reportMetrics(id: string): void {
    if (!this.reporter) return;

    const metrics = this.getMetrics(id);
    const avg = this.getAverageDuration(id);
    const p95 = this.getPercentile(id, 95);
    const p99 = this.getPercentile(id, 99);

    this.reporter({
      id,
      timestamp: Date.now(),
      sampleCount: metrics.length,
      average: avg,
      p95,
      p99,
      threshold: this.thresholds.get(id)
    });
  }

  private static reportWarningPerformance(id: string, duration: number): void {
    if (!this.reporter) return;
    this.reporter({
      type: 'performance_warning',
      id,
      duration,
      timestamp: Date.now(),
      threshold: this.thresholds.get(id)?.warning
    });
  }

  private static reportCriticalPerformance(id: string, duration: number): void {
    if (!this.reporter) return;
    this.reporter({
      type: 'performance_critical',
      id,
      duration,
      timestamp: Date.now(),
      threshold: this.thresholds.get(id)?.critical
    });
  }
}