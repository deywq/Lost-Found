const test = require('node:test');
const assert = require('node:assert/strict');
const { validateLogin, validateRegistration } = require('../src/validation/auth');

test('registration trims the name and normalizes email', () => {
  assert.deepEqual(validateRegistration({
    name: '  Seenit Member ',
    email: ' MEMBER@example.com ',
    password: 'a-strong-password',
  }).value, {
    name: 'Seenit Member',
    email: 'member@example.com',
    password: 'a-strong-password',
  });
});

test('registration rejects short passwords and client-supplied roles are ignored', () => {
  assert.match(validateRegistration({
    name: 'Member', email: 'member@example.com', password: 'short', role: 'admin',
  }).error, /password/);
  assert.equal(validateRegistration({
    name: 'Member', email: 'member@example.com', password: 'a-strong-password', role: 'admin',
  }).value.role, undefined);
});

test('login validates and normalizes the email', () => {
  assert.deepEqual(validateLogin({ email: ' USER@example.com ', password: 'secret' }).value, {
    email: 'user@example.com', password: 'secret',
  });
  assert.match(validateLogin({ email: 'not-an-email', password: 'secret' }).error, /email/);
});
