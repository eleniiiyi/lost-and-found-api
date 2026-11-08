const CATEGORIES = ['phone', 'keys', 'id_card', 'book', 'bag', 'clothing',
  'electronics', 'wallet', 'other'];

const isNonEmptyString = (v, max) =>
  typeof v === 'string' && v.trim().length > 0 && v.trim().length <= max;

// Accepts "YYYY-MM-DD" or ISO/"YYYY-MM-DD HH:MM[:SS]"; returns MySQL DATETIME string or null
function toMySqlDate(input) {
  if (typeof input !== 'string') return null;
  const s = input.trim().replace(' ', 'T');
  if (!/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:\d{2})?)?$/.test(s)) return null;
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  if (d.getTime() > Date.now() + 60 * 1000) return null; // cannot be in the future
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// Validates a full item body. Returns { errors: [...], value: {...} }
function validateItem(body) {
  const errors = [];
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { errors: ['Request body must be a JSON object'], value: null };
  }
  const { name, category, description, location_found, date_found, is_claimed } = body;

  if (!isNonEmptyString(name, 100)) errors.push('name is required (1-100 characters)');
  if (!CATEGORIES.includes(category)) errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  if (description !== undefined && description !== null &&
      (typeof description !== 'string' || description.length > 2000)) {
    errors.push('description must be a string of at most 2000 characters');
  }
  if (!isNonEmptyString(location_found, 150)) errors.push('location_found is required (1-150 characters)');
  const mysqlDate = toMySqlDate(date_found);
  if (!mysqlDate) errors.push('date_found is required, must be a valid date (YYYY-MM-DD or ISO format) and not in the future');
  if (is_claimed !== undefined && typeof is_claimed !== 'boolean') errors.push('is_claimed must be true or false');

  if (errors.length) return { errors, value: null };
  return {
    errors,
    value: {
      name: name.trim(),
      category,
      description: description ? description.trim() : null,
      location_found: location_found.trim(),
      date_found: mysqlDate,
      is_claimed: is_claimed ? 1 : 0,
    },
  };
}

function parseId(raw) {
  return /^[1-9]\d{0,9}$/.test(raw) ? Number(raw) : null;
}

module.exports = { CATEGORIES, validateItem, parseId };
