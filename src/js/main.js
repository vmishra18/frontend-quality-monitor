const { collectVitals, getNavigationTimings } = require('./metrics');
const { scanAccessibility } = require('./accessibility');
const { createCharts } = require('./charts');
const {
  updateMetrics,
  updateSummary,
  updateNavigation,
  updateA11y,
  updateLastUpdate,
  updateSessionMeta
} = require('./dashboard');
const { debounce } = require('./utils');

function ensureMount() {
  const root = document.getElementById('fpam-root');
  if (!root) {
    console.warn('Frontend Quality Monitor: missing #fpam-root container.');
    return false;
  }
  return true;
}

function init() {
  if (!ensureMount()) return;
  const charts = createCharts();

  updateSessionMeta();
  window.addEventListener('resize', debounce(updateSessionMeta, 200));

  const navTimings = getNavigationTimings();
  updateNavigation(navTimings);
  charts.updateNavigation(navTimings);

  // Update navigation timing again after full load to capture loadEventEnd.
  window.addEventListener('load', () => {
    const updatedTimings = getNavigationTimings();
    updateNavigation(updatedTimings);
    charts.updateNavigation(updatedTimings);
  });

  const initialMetrics = collectVitals((metrics) => {
    updateMetrics(metrics);
    updateSummary(metrics);
    charts.updateVitals(metrics);
    updateLastUpdate();
  });
  updateMetrics(initialMetrics);
  updateSummary(initialMetrics);
  charts.updateVitals(initialMetrics);

  const runScan = () => {
    const report = scanAccessibility();
    updateA11y(report);
  };

  const button = document.getElementById('run-a11y');
  if (button) {
    button.addEventListener('click', runScan);
  }

  const clsButton = document.getElementById('simulate-cls');
  const clsSpacer = document.getElementById('cls-spacer');
  if (clsButton && clsSpacer) {
    clsButton.addEventListener('click', () => {
      window.setTimeout(() => {
        clsSpacer.classList.add('is-active');
        window.setTimeout(() => clsSpacer.classList.remove('is-active'), 1200);
      }, 700);
    });
  }

  runScan();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
