'use client';

import { useReportWebVitals } from 'next/web-vitals';
import { Telemetry } from '@/core/monitoring/telemetry';

/**
 * WebVitalsReporter reports core web vitals performance metrics back to our Telemetry logger.
 */
export function WebVitalsReporter() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useReportWebVitals((metric: any) => {
    // 1. Map Next.js performance names to human-readable terms
    const { name, value, delta, id } = metric;
    
    // 2. Identify if metrics are outside of acceptable performance budget thresholds
    let status: 'good' | 'needs-improvement' | 'poor' = 'good';
    let threshold = 0;

    switch (name) {
      case 'CLS': // Cumulative Layout Shift
        threshold = 0.1;
        status = value <= 0.1 ? 'good' : value <= 0.25 ? 'needs-improvement' : 'poor';
        break;
      case 'LCP': // Largest Contentful Paint
        threshold = 2500;
        status = value <= 2500 ? 'good' : value <= 4000 ? 'needs-improvement' : 'poor';
        break;
      case 'FID': // First Input Delay
        threshold = 100;
        status = value <= 100 ? 'good' : value <= 300 ? 'needs-improvement' : 'poor';
        break;
      case 'FCP': // First Contentful Paint
        threshold = 1800;
        status = value <= 1800 ? 'good' : value <= 3000 ? 'needs-improvement' : 'poor';
        break;
      case 'TTFB': // Time to First Byte
        threshold = 800;
        status = value <= 800 ? 'good' : value <= 1800 ? 'needs-improvement' : 'poor';
        break;
      case 'INP': // Interaction to Next Paint
        threshold = 200;
        status = value <= 200 ? 'good' : value <= 500 ? 'needs-improvement' : 'poor';
        break;
      default:
        break;
    }

    // 3. Log metric timings
    Telemetry.logEvent({
      name: `web_vital_${name.toLowerCase()}`,
      category: 'performance',
      metadata: {
        id,
        metricValue: value,
        metricDelta: delta,
        status,
        threshold,
        warning: status !== 'good' ? `Metric ${name} is degraded: value is ${value}` : undefined,
      },
    });
  });

  return null;
}
export default WebVitalsReporter;
