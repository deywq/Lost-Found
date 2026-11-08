const express = require('express');
const { pool } = require('../db/pool');
const { requireAuth, requireAdmin } = require('../auth/middleware');

const router = express.Router();

router.put('/items/:id/status', requireAuth, async (request, response, next) => {
  const status = request.body?.status;
  if (!['open', 'returned', 'closed'].includes(status)) {
    return response.status(400).json({ error: 'status must be one of open, returned, or closed' });
  }

  try {
    const [result] = await pool.execute(
      'UPDATE items SET status = ? WHERE id = ? AND user_id = ?',
      [status, request.params.id, request.auth.userId],
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ error: 'Item not found or not owned by the current user' });
    }

    response.json({ data: { id: Number(request.params.id), status } });
  } catch (error) {
    next(error);
  }
});

router.delete('/items/:id', requireAuth, async (request, response, next) => {
  try {
    const [result] = await pool.execute(
      'DELETE FROM items WHERE id = ? AND user_id = ?',
      [request.params.id, request.auth.userId],
    );

    if (result.affectedRows === 0) {
      return response.status(404).json({ error: 'Item not found or not owned by the current user' });
    }

    response.status(204).end();
  } catch (error) {
    next(error);
  }
});

router.get('/items', requireAuth, async (request, response, next) => {
  try {
    const [items] = await pool.query(
      `SELECT items.id, items.type, items.name, items.status, items.item_date AS itemDate,
              categories.name AS category,
              locations.address AS location
       FROM items
       INNER JOIN categories ON categories.id = items.category_id
       LEFT JOIN locations ON locations.id = items.location_id
       WHERE items.user_id = ?
       ORDER BY items.created_at DESC`,
      [request.auth.userId],
    );

    response.json({ data: items });
  } catch (error) {
    next(error);
  }
});

router.get('/reports', requireAuth, requireAdmin, async (_request, response, next) => {
  try {
    const [reports] = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
    response.json({ data: reports });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
