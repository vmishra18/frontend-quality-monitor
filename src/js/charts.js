const Chart = require('chart.js/auto');
const { formatMs, getStatus } = require('./utils');

const STATUS_COLORS = {
  Good: '#2e7d32',
  'Needs Improvement': '#c56a00',
  Poor: '#c62828',
  Collecting: '#8aa1b4',
  'Awaiting interaction': '#8aa1b4',
  'Not Supported': '#8aa1b4'
};

function createCharts() {
  const vitalsCtx = document.getElementById('vitals-chart');
  const navCtx = document.getElementById('navigation-chart');

  if (!vitalsCtx || !navCtx) {
    return {
      updateVitals: () => {},
      updateNavigation: () => {}
    };
  }

  let vitalsChart;
  try {
    vitalsChart = new Chart(vitalsCtx, {
    type: 'bar',
    data: {
      labels: ['LCP', 'FCP', 'INP'],
      datasets: [
        {
          label: 'Current',
          data: [0, 0, 0],
          backgroundColor: ['#2f6fed', '#5f6c7b', '#2f6fed'],
          borderRadius: 8,
          barThickness: 26
        }
      ]
    },
    options: {
      responsive: true,
      layout: {
        padding: {
          top: 10
        }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label(context) {
              const label = context.label;
              const value = context.raw;
              if (value === null || value === undefined) {
                return `${label}: Not available`;
              }
              return `${label}: ${formatMs(value)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: '#3d4853'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: '#3d4853',
            callback(value) {
              return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : value;
            }
          }
        }
      }
    }
  });
  } catch (error) {
    console.warn('Frontend Quality Monitor: vitals chart failed to render.', error);
    return {
      updateVitals: () => {},
      updateNavigation: () => {}
    };
  }

  let navChart;
  try {
    navChart = new Chart(navCtx, {
    type: 'bar',
    data: {
      labels: ['TTFB', 'Response', 'DOM Interactive', 'DOMContentLoaded', 'Load'],
      datasets: [
        {
          label: 'Milliseconds',
          data: [0, 0, 0, 0, 0],
          backgroundColor: '#2f6fed',
          borderRadius: 8,
          barThickness: 18,
          barPercentage: 0.6,
          categoryPercentage: 0.7
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      layout: {
        padding: {
          top: 6,
          bottom: 6
        }
      },
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: '#3d4853',
            callback(value) {
              return value >= 1000 ? `${(value / 1000).toFixed(1)}s` : value;
            }
          }
        },
        y: {
          ticks: {
            color: '#3d4853'
          }
        }
      }
    }
  });
  } catch (error) {
    console.warn('Frontend Quality Monitor: navigation chart failed to render.', error);
    return {
      updateVitals: () => {},
      updateNavigation: () => {}
    };
  }

  const updateVitals = (metrics) => {
    const supports = metrics.supports || {};
    const toChartValue = (key) => {
      if (supports[key] === false) return null;
      const value = metrics[key];
      return value === null || value === undefined || Number.isNaN(value) ? null : value;
    };
    const metricKeys = ['LCP', 'FCP', 'INP'];
    const data = metricKeys.map((key) => toChartValue(key));
    const colors = metricKeys.map((key) => {
      const supported = supports[key] !== false;
      const value = metrics[key];
      const status = getStatus(key, value, supported).label;
      return STATUS_COLORS[status] || '#8aa1b4';
    });
    vitalsChart.data.datasets[0].data = data;
    vitalsChart.data.datasets[0].backgroundColor = colors;
    vitalsChart.update();
  };

  const updateNavigation = (nav) => {
    if (!nav) return;
    navChart.data.datasets[0].data = [nav.ttfb, nav.response, nav.domInteractive, nav.domContentLoaded, nav.load];
    navChart.update();
  };

  return {
    updateVitals,
    updateNavigation
  };
}

module.exports = { createCharts };
