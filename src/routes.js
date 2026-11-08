const express = require('express');
const pool = require('./db');
const { CATEGORIES, validateItem, parseId } = require('./validate');

const router = express.Router();

const format = (row) => ({ ...row, is_claimed: Boolean(row.is_claimed) });

// Wrap async handlers so errors reach the error middleware
const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

// Reject non-numeric ids early
router.param('id', (req, res, next, raw) => {
  const id = parseId(raw);
  if (id === null) return res.status(400).json({ error: 'id must be a positive integer' });
  req.itemId = id;
  next();
});

// 1. GET /api/items  (optional filters: ?category=phone&is_claimed=false)
router.get('/', wrap(async (req, res) => {
  const where = [];
  const params = [];
  if (req.query.category !== undefined) {
    if (!CATEGORIES.includes(req.query.category)) {
      return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` });
    }
    where.push('category = ?');
    params.push(req.query.category);
  }
  if (req.query.is_claimed !== undefined) {
    if (!['true', 'false'].includes(req.query.is_claimed)) {
      return res.status(400).json({ error: 'is_claimed must be true or false' });
    }
    where.push('is_claimed = ?');
    params.push(req.query.is_claimed === 'true' ? 1 : 0);
  }
  const sql = 'SELECT * FROM items' + (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY date_found DESC';
  const [rows] = await pool.execute(sql, params);
  res.status(200).json(rows.map(format));
}));

// 2. GET /api/items/:id
router.get('/:id', wrap(async (req, res) => {
  const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [req.itemId]);
  if (!rows.length) return res.status(404).json({ error: 'Item not found' });
  res.status(200).json(format(rows[0]));
}));

// 3. POST /api/items
router.post('/', wrap(async (req, res) => {
  const { errors, value } = validateItem(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const [result] = await pool.execute(
    `INSERT INTO items (name, category, description, location_found, date_found, is_claimed)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [value.name, value.category, value.description, value.location_found, value.date_found, value.is_claimed]
  );
  const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [result.insertId]);
  res.status(201).location(`/api/items/${result.insertId}`).json(format(rows[0]));
}));

// 4. PUT /api/items/:id  (full update)
router.put('/:id', wrap(async (req, res) => {
  const { errors, value } = validateItem(req.body);
  if (errors.length) return res.status(400).json({ error: 'Validation failed', details: errors });

  const [result] = await pool.execute(
    `UPDATE items SET name = ?, category = ?, description = ?, location_found = ?,
                      date_found = ?, is_claimed = ? WHERE id = ?`,
    [value.name, value.category, value.description, value.location_found,
     value.date_found, value.is_claimed, req.itemId]
  );
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
  const [rows] = await pool.execute('SELECT * FROM items WHERE id = ?', [req.itemId]);
  res.status(200).json(format(rows[0]));
}));

// 5. DELETE /api/items/:id
router.delete('/:id', wrap(async (req, res) => {
  const [result] = await pool.execute('DELETE FROM items WHERE id = ?', [req.itemId]);
  if (result.affectedRows === 0) return res.status(404).json({ error: 'Item not found' });
  res.status(204).send();
}));

module.exports = router;
