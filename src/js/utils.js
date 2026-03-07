const THRESHOLDS = {
  LCP: { good: 2500, needs: 4000 },
  FCP: { good: 1800, needs: 3000 },
  CLS: { good: 0.1, needs: 0.25 },
  INP: { good: 200, needs: 500 }
};

function formatMs(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }
  if (value < 1000) {
    return `${Math.round(value)} ms`;
  }
  return `${(value / 1000).toFixed(2)} s`;
}

function formatCls(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }
  return value.toFixed(3);
}

function formatBytes(value) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '--';
  }
  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function getStatus(metric, value, supported = true) {
  if (!supported) {
    return { label: 'Not Supported', className: 'status-unsupported' };
  }
  const threshold = THRESHOLDS[metric];
  if (!threshold || value === null || value === undefined || Number.isNaN(value)) {
    if (metric === 'INP') {
      return { label: 'Awaiting interaction', className: 'status-awaiting' };
    }
    return { label: 'Collecting', className: 'status-collecting' };
  }
  if (value <= threshold.good) {
    return { label: 'Good', className: 'status-good' };
  }
  if (value <= threshold.needs) {
    return { label: 'Needs Improvement', className: 'status-needs' };
  }
  return { label: 'Poor', className: 'status-poor' };
}

function calculateOverallStatus(metrics) {
  const order = { Good: 1, 'Needs Improvement': 2, Poor: 3 };
  let highest = 1;
  let label = 'Good';
  let hasValues = false;

  Object.keys(THRESHOLDS).forEach((metric) => {
    if (metrics.supports && metrics.supports[metric] === false) {
      return;
    }
    const value = metrics[metric];
    if (value === null || value === undefined || Number.isNaN(value)) {
      return;
    }
    hasValues = true;
    const { label: metricLabel } = getStatus(metric, value, true);
    const rank = order[metricLabel] || 2;
    if (rank > highest) {
      highest = rank;
      label = metricLabel;
    }
  });

  return hasValues ? label : 'Collecting';
}

function statusClass(label) {
  if (label === 'Good') return 'good';
  if (label === 'Needs Improvement') return 'needs';
  if (label === 'Collecting') return 'collecting';
  return 'poor';
}

function formatTimeStamp(date = new Date()) {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function debounce(fn, wait = 150) {
  let timeoutId;
  return (...args) => {
    if (timeoutId) window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), wait);
  };
}

module.exports = {
  THRESHOLDS,
  formatMs,
  formatCls,
  formatBytes,
  getStatus,
  calculateOverallStatus,
  statusClass,
  formatTimeStamp,
  debounce
};
