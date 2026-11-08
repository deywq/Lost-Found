const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegistration(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }
  const { name, email, password } = body;
  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 150) {
    return { error: 'name must be between 2 and 150 characters' };
  }
  if (typeof email !== 'string' || email.length > 254 || !emailPattern.test(email.trim())) {
    return { error: 'A valid email address is required' };
  }
  if (typeof password !== 'string' || password.length < 12 || password.length > 72) {
    return { error: 'password must be between 12 and 72 characters' };
  }
  return { value: { name: name.trim(), email: email.trim().toLowerCase(), password } };
}

function validateLogin(body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a JSON object' };
  }
  const { email, password } = body;
  if (typeof email !== 'string' || email.length > 254 || !emailPattern.test(email.trim())) {
    return { error: 'A valid email address is required' };
  }
  if (typeof password !== 'string' || password.length < 1 || password.length > 72) {
    return { error: 'A valid password is required' };
  }
  return { value: { email: email.trim().toLowerCase(), password } };
}

module.exports = { validateLogin, validateRegistration };
