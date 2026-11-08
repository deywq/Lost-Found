const test = require('node:test');
const assert = require('node:assert/strict');
const { validateNewItem } = require('../src/validation/items');

const validReport = {
  type: 'lost',
  name: 'Black wallet',
  description: 'Leather wallet with a small silver mark.',
  categoryId: '7',
  itemDate: '2026-11-08',
  contactMethod: 'member@example.com',
  location: { address: 'Davao City' },
};

test('validates a report and normalizes its values', () => {
  const result = validateNewItem(validReport);
  assert.equal(result.error, undefined);
  assert.equal(result.value.categoryId, 7);
  assert.equal(result.value.name, 'Black wallet');
  assert.equal(result.value.userId, null);
});

test('rejects invalid report type, calendar date, and coordinates', () => {
  assert.match(validateNewItem({ ...validReport, type: 'unknown' }).error, /type/);
  assert.match(validateNewItem({ ...validReport, itemDate: '2026-02-31' }).error, /valid calendar date/);
  assert.match(validateNewItem({ ...validReport, location: { address: 'Here', latitude: 91, longitude: 0 } }).error, /latitude/);
});

test('rejects malformed or oversized image metadata', () => {
  assert.match(validateNewItem({ ...validReport, images: 'not-an-array' }).error, /images/);
  assert.match(validateNewItem({ ...validReport, images: Array(11).fill({ url: 'https://example.com/image.jpg' }) }).error, /images/);
});
