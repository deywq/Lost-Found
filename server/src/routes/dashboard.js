const express = require('express');
const { pool } = require('../db/pool');
const { requireAuth } = require('../auth/middleware');

const router = express.Router();

router.get('/mine', requireAuth, async (request, response, next) => {
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

    const [messages] = await pool.query(
      `SELECT m.id, m.body, m.created_at AS createdAt,
              u.name AS senderName
       FROM messages m
       INNER JOIN users u ON u.id = m.sender_id
       WHERE m.recipient_id = ?
       ORDER BY m.created_at DESC`,
      [request.auth.userId],
    );

    response.json({ data: { items, messages } });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
