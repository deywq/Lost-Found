const express = require('express');
const { pool } = require('../db/pool');
const { validateNewItem } = require('../validation/items');

const router = express.Router();

router.get('/', async (request, response, next) => {
  try {
    const { type, categoryId, search } = request.query;
    const conditions = [];
    const values = [];

    if (type !== undefined) {
      if (!['lost', 'found'].includes(type)) {
        return response.status(400).json({ error: 'type must be lost or found' });
      }
      conditions.push('items.type = ?');
      values.push(type);
    }

    if (categoryId !== undefined) {
      const parsedCategoryId = Number(categoryId);
      if (!Number.isSafeInteger(parsedCategoryId) || parsedCategoryId < 1) {
        return response.status(400).json({ error: 'categoryId must be a positive integer' });
      }
      conditions.push('items.category_id = ?');
      values.push(parsedCategoryId);
    }

    if (search !== undefined) {
      const phrase = String(search).trim();
      if (!phrase || phrase.length > 100) {
        return response.status(400).json({ error: 'search must be between 1 and 100 characters' });
      }
      conditions.push('(items.name LIKE ? OR items.description LIKE ?)');
      values.push(`%${phrase}%`, `%${phrase}%`);
    }

    const parsedLimit = request.query.limit === undefined ? 25 : Number(request.query.limit);
    if (!Number.isSafeInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 100) {
      return response.status(400).json({ error: 'limit must be an integer between 1 and 100' });
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const [items] = await pool.query(
      `SELECT items.id, items.type, items.name, items.description, items.item_date AS itemDate,
              items.status, items.created_at AS createdAt,
              categories.id AS categoryId, categories.name AS category,
              locations.address AS location, locations.latitude, locations.longitude
       FROM items
       INNER JOIN categories ON categories.id = items.category_id
       LEFT JOIN locations ON locations.id = items.location_id
       ${where}
       ORDER BY items.created_at DESC
       LIMIT ?`,
      [...values, parsedLimit],
    );

    response.json({ data: items });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (request, response, next) => {
  const id = Number(request.params.id);
  if (!Number.isSafeInteger(id) || id < 1) {
    return response.status(400).json({ error: 'Item id must be a positive integer' });
  }

  try {
    const [items] = await pool.query(
      `SELECT items.id, items.type, items.name, items.description, items.item_date AS itemDate,
              items.status, items.created_at AS createdAt,
              categories.id AS categoryId, categories.name AS category,
              locations.address AS location, locations.latitude, locations.longitude
       FROM items
       INNER JOIN categories ON categories.id = items.category_id
       LEFT JOIN locations ON locations.id = items.location_id
       WHERE items.id = ?`,
      [id],
    );

    if (!items.length) {
      return response.status(404).json({ error: 'Item not found' });
    }

    const [images] = await pool.query(
      'SELECT id, image_url AS url, alt_text AS altText FROM images WHERE item_id = ? ORDER BY id',
      [id],
    );
    response.json({ data: { ...items[0], images } });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (request, response, next) => {
  const validation = validateNewItem(request.body);
  if (validation.error) {
    return response.status(400).json({ error: validation.error });
  }

  const item = validation.value;
  let connection;

  try {
    const [categories] = await pool.query('SELECT id FROM categories WHERE id = ?', [item.categoryId]);
    if (!categories.length) {
      return response.status(400).json({ error: 'categoryId does not match an existing category' });
    }

    if (item.userId !== null) {
      const [users] = await pool.query('SELECT id FROM users WHERE id = ?', [item.userId]);
      if (!users.length) {
        return response.status(400).json({ error: 'userId does not match an existing user' });
      }
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    let locationId = null;
    if (item.location) {
      const [locationResult] = await connection.execute(
        'INSERT INTO locations (address, latitude, longitude) VALUES (?, ?, ?)',
        [item.location.address, item.location.latitude, item.location.longitude],
      );
      locationId = locationResult.insertId;
    }

    const [result] = await connection.execute(
      `INSERT INTO items
        (user_id, category_id, location_id, type, name, description, item_date, contact_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.userId, item.categoryId, locationId, item.type, item.name, item.description,
        item.itemDate, item.contactMethod],
    );

    for (const image of item.images) {
      await connection.execute(
        'INSERT INTO images (item_id, image_url, alt_text) VALUES (?, ?, ?)',
        [result.insertId, image.url, image.altText],
      );
    }

    await connection.commit();
    response.status(201).json({ data: { id: result.insertId } });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally {
    if (connection) connection.release();
  }
});

module.exports = router;
