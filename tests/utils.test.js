const test = require('node:test');
const assert = require('node:assert/strict');

const {
  formatMs,
  formatCls,
  formatBytes,
  getStatus,
  calculateOverallStatus
} = require('../src/js/utils');

test('formatMs returns human-readable values', () => {
  assert.equal(formatMs(120), '120 ms');
  assert.equal(formatMs(1420), '1.42 s');
  assert.equal(formatMs(null), '--');
});

test('formatCls returns fixed precision', () => {
  assert.equal(formatCls(0.12345), '0.123');
  assert.equal(formatCls(null), '--');
});

test('formatBytes returns readable sizes', () => {
  assert.equal(formatBytes(300), '300 B');
  assert.equal(formatBytes(2048), '2.0 KB');
});

test('getStatus handles unsupported and collecting states', () => {
  assert.deepEqual(getStatus('INP', null, true), { label: 'Awaiting interaction', className: 'status-awaiting' });
  assert.deepEqual(getStatus('LCP', null, true), { label: 'Collecting', className: 'status-collecting' });
  assert.deepEqual(getStatus('LCP', 1000, false), { label: 'Not Supported', className: 'status-unsupported' });
});

test('calculateOverallStatus skips unsupported and empty metrics', () => {
  const collecting = calculateOverallStatus({ LCP: null, FCP: null, CLS: null, INP: null, supports: {} });
  assert.equal(collecting, 'Collecting');

  const status = calculateOverallStatus({
    LCP: 1000,
    FCP: 2000,
    CLS: 0.2,
    INP: 600,
    supports: {}
  });
  assert.equal(status, 'Poor');
});
