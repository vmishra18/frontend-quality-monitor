const { onLCP, onCLS, onFCP, onINP } = require('web-vitals');

function getSupportMap() {
  const supported = (typeof PerformanceObserver !== 'undefined' && PerformanceObserver.supportedEntryTypes) || [];
  return {
    LCP: supported.includes('largest-contentful-paint'),
    FCP: supported.includes('paint'),
    CLS: supported.includes('layout-shift'),
    INP: supported.includes('event')
  };
}

function collectVitals(onUpdate) {
  const supports = getSupportMap();
  const metrics = {
    LCP: null,
    FCP: null,
    CLS: null,
    INP: null,
    supports
  };

  const update = (name, value) => {
    metrics[name] = value;
    onUpdate({ ...metrics });
  };

  if (supports.LCP) {
    onLCP((metric) => update('LCP', metric.value), { reportAllChanges: true });
  }
  if (supports.FCP) {
    onFCP((metric) => update('FCP', metric.value), { reportAllChanges: true });
  }
  if (supports.CLS) {
    onCLS((metric) => update('CLS', metric.value), { reportAllChanges: true });
  }
  if (supports.INP) {
    onINP((metric) => update('INP', metric.value), { reportAllChanges: true });
  }

  return metrics;
}

function getNavigationTimings() {
  const entry = performance.getEntriesByType('navigation')[0];
  if (entry) {
    return {
      ttfb: entry.responseStart,
      response: entry.responseEnd - entry.responseStart,
      domInteractive: entry.domInteractive,
      domContentLoaded: entry.domContentLoadedEventEnd === 0 ? null : entry.domContentLoadedEventEnd,
      load: entry.loadEventEnd === 0 ? null : entry.loadEventEnd,
      transferSize: entry.transferSize
    };
  }

  const timing = performance.timing;
  if (!timing) {
    return null;
  }

  const navigationStart = timing.navigationStart;
  return {
    ttfb: timing.responseStart - navigationStart,
    response: timing.responseEnd - timing.responseStart,
    domInteractive: timing.domInteractive - navigationStart,
    domContentLoaded: timing.domContentLoadedEventEnd === 0 ? null : timing.domContentLoadedEventEnd - navigationStart,
    load: timing.loadEventEnd === 0 ? null : timing.loadEventEnd - navigationStart,
    transferSize: 0
  };
}

module.exports = {
  collectVitals,
  getNavigationTimings
};
