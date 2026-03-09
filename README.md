# Frontend Quality Monitor

I built this as a lightweight, local dashboard to keep performance and accessibility visible while you’re developing. It runs on the page it’s loaded into and doesn’t send data anywhere.

Live demo: <https://vmishra18.github.io/frontend-quality-monitor/>

## What it shows

- Web Vitals: LCP, FCP, CLS, INP
- Navigation Timing: TTFB, DOMContentLoaded, Load Event
- Quick a11y checks: labels, headings, landmarks, keyboard reachability

## How it’s organized

- `src/js/main.js` boots the app and wires events
- `src/js/metrics.js` collects Web Vitals + navigation timing
- `src/js/accessibility.js` runs the lightweight a11y scan
- `src/js/dashboard.js` updates the UI state
- `src/js/charts.js` renders Chart.js charts
- `src/scss/` holds layout + component styles

## Limitations

- Only reports on the current page
- A11y scan is heuristic, not a full WCAG audit
- Metrics are session-based and vary by environment
- Some metrics rely on browser performance APIs, so results can vary between browsers. For example, Safari doesn’t support all of these APIs yet, so a few values may not appear there.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## GitHub Pages

This repo uses `docs/` for GitHub Pages. After building, copy `dist/` into `docs/` and push.

```bash
npm run build
rsync -a --delete dist/ docs/
```

## Future improvements

- Separate the monitoring logic from the dashboard UI so the metrics collection layer can run independently across different pages
- Introduce a lightweight floating widget that surfaces key performance and accessibility metrics directly on the monitored page
- Support two UI layers for the same metrics
- Widget UI for quick insights on the page being monitored
- Expanded dashboard UI for detailed analysis
- Expand unit and integration test coverage
