const Chart = require('chart.js/auto');
const { formatMs } = require('./utils');

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
          backgroundColor: '#1f2933',
          borderRadius: 8,
          barThickness: 22
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
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
    const data = [toChartValue('LCP'), toChartValue('FCP'), toChartValue('INP')];
    vitalsChart.data.datasets[0].data = data;
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
