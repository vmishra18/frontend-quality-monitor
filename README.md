# Frontend Quality Monitor

This is a small, local dashboard that reports on the page it’s running on. It shows Web Vitals, basic navigation timing, and a few quick accessibility checks during development.

Live demo: <https://vmishra18.github.io/frontend-quality-monitor/>

## What it does

- Collects LCP, FCP, CLS, and INP with `web-vitals`
- Reads Navigation Timing (TTFB, DOMContentLoaded, Load Event) from the Performance API
- Runs a small accessibility scan on the current page (labels, headings, landmarks, keyboard reachability)
- Renders the results in a simple dashboard with charts

## Architecture

- `src/js/main.js` bootstraps the app and wires up events
- `src/js/metrics.js` collects Web Vitals and navigation timing
- `src/js/accessibility.js` runs the lightweight accessibility scan
- `src/js/dashboard.js` updates the DOM and UI state
- `src/js/charts.js` renders the Chart.js visualizations

## What it does not do

- It does not scan other websites
- It does not run full WCAG audits
- It does not store results between page reloads

## Trade‑offs

- The accessibility scan is a heuristic pass, not a full audit
- Metrics are session‑based and depend on browser support
- Some metrics aren’t available everywhere (Safari will show “Not Supported” for a few)
- Chart.js is heavier than a custom SVG chart, but it keeps the visuals readable

## Known limitations

- Metrics are page/session dependent, so they are not comparable across different environments.

## What I kept simple

- No framework, no backend, no database
- Single‑page UI with small JS modules
- Only checks that are quick to run and easy to explain

## Next improvements

- Keep a short history for each metric
- Export a JSON report
- Let teams toggle which checks run

## Testing

There’s a small test layer for the utility functions (status calculation and formatting). It’s minimal, but it shows how the logic can be validated.

```bash
npm test
```

## Browser support

The dashboard relies on Web Vitals and the Navigation Timing API.
INP and some timing fields depend on browser support and user interaction.
If a metric isn’t supported, the UI shows “Not Supported” or “Collecting.”
For older browsers, navigation timing falls back to `performance.timing`.

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
