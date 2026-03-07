const {
  formatMs,
  formatCls,
  formatBytes,
  getStatus,
  calculateOverallStatus,
  statusClass,
  formatTimeStamp
} = require('./utils');

function updateMetrics(metrics) {
  const mapping = [
    { key: 'LCP', valueEl: 'metric-lcp', statusEl: 'metric-lcp-status', formatter: formatMs },
    { key: 'FCP', valueEl: 'metric-fcp', statusEl: 'metric-fcp-status', formatter: formatMs },
    { key: 'CLS', valueEl: 'metric-cls', statusEl: 'metric-cls-status', formatter: formatCls },
    { key: 'INP', valueEl: 'metric-inp', statusEl: 'metric-inp-status', formatter: formatMs }
  ];

  mapping.forEach(({ key, valueEl, statusEl, formatter }) => {
    const value = metrics[key];
    const metricValue = document.getElementById(valueEl);
    const metricStatus = document.getElementById(statusEl);
    if (!metricValue || !metricStatus) return;

    metricValue.textContent = formatter(value);
    const supported = metrics.supports ? metrics.supports[key] : true;
    const status = getStatus(key, value, supported);
    metricStatus.textContent = status.label;
    metricStatus.className = `metric-status ${status.className}`;
  });
}

function updateSummary(metrics) {
  const overall = calculateOverallStatus(metrics);
  const indicator = document.getElementById('overall-status-indicator');
  const statusText = document.getElementById('overall-status');
  const note = document.getElementById('overall-status-note');

  if (indicator) {
    indicator.textContent = overall;
    indicator.className = `status-indicator ${statusClass(overall)}`;
  }

  if (statusText) {
    statusText.textContent = overall;
    statusText.className = `status-text status-${statusClass(overall)}`;
  }

  if (note) {
    if (overall === 'Collecting') {
      note.textContent = 'Waiting for the first readings to come in.';
    } else if (overall === 'Good') {
      note.textContent = 'Vitals look within the recommended thresholds for this session.';
    } else if (overall === 'Needs Improvement') {
      note.textContent = 'At least one vital is outside the target range.';
    } else {
      note.textContent = 'Several vitals are out of range. LCP, INP, and layout stability are the likely culprits.';
    }
  }
}

function updateNavigation(timings) {
  if (!timings) return;

  const formatNavValue = (value) => (value === null || value === undefined ? 'Collecting' : formatMs(value));
  const formatNavBytes = (value) => (value === null || value === undefined ? 'Collecting' : formatBytes(value));

  const map = [
    { id: 'summary-ttfb', value: formatNavValue(timings.ttfb) },
    { id: 'summary-dom', value: formatNavValue(timings.domContentLoaded) },
    { id: 'summary-load', value: formatNavValue(timings.load) },
    { id: 'nav-ttfb', value: formatNavValue(timings.ttfb) },
    { id: 'nav-response', value: formatNavValue(timings.response) },
    { id: 'nav-interactive', value: formatNavValue(timings.domInteractive) },
    { id: 'nav-dom', value: formatNavValue(timings.domContentLoaded) },
    { id: 'nav-load', value: formatNavValue(timings.load) },
    { id: 'nav-transfer', value: formatNavBytes(timings.transferSize) }
  ];

  map.forEach(({ id, value }) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });
}

function updateA11y(report) {
  const list = document.getElementById('a11y-list');
  const score = document.getElementById('a11y-score');
  const issues = document.getElementById('a11y-issues');
  const manual = document.getElementById('a11y-manual');
  const lastRun = document.getElementById('a11y-last-run');

  if (score) score.textContent = `${report.passed} / ${report.checks.length}`;
  if (issues) issues.textContent = report.issues;
  if (manual) manual.textContent = report.manual ?? 0;
  if (lastRun) lastRun.textContent = formatTimeStamp();

  if (!list) return;
  list.innerHTML = '';

  report.checks.forEach((check) => {
    const item = document.createElement('div');
    const statusClassName =
      check.status === 'Good' ? 'good' : check.status === 'Needs Improvement' ? 'needs' : 'manual';
    item.className = `a11y-item ${statusClassName}`;

    const title = document.createElement('div');
    title.className = 'a11y-title';
    title.textContent = check.title;

    const detail = document.createElement('div');
    detail.className = 'a11y-detail';
    detail.textContent = check.detail;

    const status = document.createElement('div');
    status.className = `metric-status status-${statusClassName}`;
    status.textContent = check.status;

    item.appendChild(title);
    item.appendChild(detail);
    item.appendChild(status);
    list.appendChild(item);
  });
}

function updateLastUpdate() {
  const lastUpdate = document.getElementById('last-update');
  if (lastUpdate) {
    lastUpdate.textContent = formatTimeStamp();
  }
}

function updateSessionMeta() {
  const sessionStart = document.getElementById('session-start');
  const viewport = document.getElementById('viewport-size');
  const network = document.getElementById('network-info');

  if (sessionStart && performance && performance.timeOrigin) {
    sessionStart.textContent = formatTimeStamp(new Date(performance.timeOrigin));
  }

  if (viewport) {
    viewport.textContent = `${window.innerWidth} × ${window.innerHeight}`;
  }

  if (network) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection && connection.effectiveType) {
      const downlink = connection.downlink ? `${connection.downlink}Mb/s` : 'n/a';
      network.textContent = `${connection.effectiveType.toUpperCase()} · ${downlink}`;
    } else {
      network.textContent = 'Unknown';
    }
  }
}

module.exports = {
  updateMetrics,
  updateSummary,
  updateNavigation,
  updateA11y,
  updateLastUpdate,
  updateSessionMeta
};
