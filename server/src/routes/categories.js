const express = require('express');
const { pool } = require('../db/pool');

const router = express.Router();

router.get('/', async (_request, response, next) => {
  try {
    const [categories] = await pool.query(
      'SELECT id, name, slug FROM categories ORDER BY name ASC',
    );
    response.json({ data: categories });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
