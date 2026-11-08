const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { pool } = require('../db/pool');
const { requireAuth } = require('../auth/middleware');
const { validateNewItem } = require('../validation/items');

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_request, file, callback) => {
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) return callback(new Error('Only JPEG, PNG, and WebP image files are supported'));
    callback(null, true);
  },
});

function uploadImage(file) {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    const error = new Error('Image uploads are not configured. Set the Cloudinary environment variables.');
    error.status = 503;
    throw error;
  }
  cloudinary.config({ cloud_name: process.env.CLOUDINARY_CLOUD_NAME, api_key: process.env.CLOUDINARY_API_KEY, api_secret: process.env.CLOUDINARY_API_SECRET });
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: 'seenit/items', resource_type: 'image' }, (error, result) => {
      if (error) return reject(error);
      resolve({ url: result.secure_url, altText: file.originalname.slice(0, 255) });
    });
    stream.end(file.buffer);
  });
}

function parseLocation(body) {
  if (typeof body.location !== 'string') return null;
  try { body.location = JSON.parse(body.location); return null; }
  catch (_error) { return 'location must be valid JSON'; }
}

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

router.get('/', async (request, response, next) => {
  try {
    const { type, categoryId, search } = request.query;
    const conditions = [];
    const values = [];
    if (type !== undefined) {
      if (!['lost', 'found'].includes(type)) return response.status(400).json({ error: 'type must be lost or found' });
      conditions.push('items.type = ?'); values.push(type);
    }
    if (categoryId !== undefined) {
      const category = Number(categoryId);
      if (!Number.isSafeInteger(category) || category < 1) return response.status(400).json({ error: 'categoryId must be a positive integer' });
      conditions.push('items.category_id = ?'); values.push(category);
    }
    if (search !== undefined) {
      const phrase = String(search).trim();
      if (!phrase || phrase.length > 100) return response.status(400).json({ error: 'search must be between 1 and 100 characters' });
      conditions.push('(items.name LIKE ? OR items.description LIKE ?)'); values.push(`%${phrase}%`, `%${phrase}%`);
    }
    const limit = request.query.limit === undefined ? 25 : Number(request.query.limit);
    if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) return response.status(400).json({ error: 'limit must be an integer between 1 and 100' });
    const [items] = await pool.query(
      `SELECT items.id, items.type, items.name, items.description, items.item_date AS itemDate,
              items.status, items.created_at AS createdAt, categories.id AS categoryId,
              categories.name AS category, locations.address AS location,
              locations.latitude, locations.longitude,
              (SELECT image_url FROM images WHERE images.item_id = items.id ORDER BY id LIMIT 1) AS image
       FROM items INNER JOIN categories ON categories.id = items.category_id
       LEFT JOIN locations ON locations.id = items.location_id
       ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
       ORDER BY items.created_at DESC LIMIT ?`, [...values, limit],
    );
    response.json({ data: items });
  } catch (error) { next(error); }
});

router.get('/:id', async (request, response, next) => {
  const id = validId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Item id must be a positive integer' });
  try {
    const [items] = await pool.query(
      `SELECT items.id, items.type, items.name, items.description, items.item_date AS itemDate,
              items.status, items.created_at AS createdAt, categories.id AS categoryId,
              categories.name AS category, locations.address AS location,
              locations.latitude, locations.longitude
       FROM items INNER JOIN categories ON categories.id = items.category_id
       LEFT JOIN locations ON locations.id = items.location_id WHERE items.id = ?`, [id],
    );
    if (!items.length) return response.status(404).json({ error: 'Item not found' });
    const [images] = await pool.query('SELECT id, image_url AS url, alt_text AS altText FROM images WHERE item_id = ? ORDER BY id', [id]);
    response.json({ data: { ...items[0], images } });
  } catch (error) { next(error); }
});

router.post('/', requireAuth, upload.array('images', 5), async (request, response, next) => {
  const locationError = parseLocation(request.body);
  if (locationError) return response.status(400).json({ error: locationError });
  const validation = validateNewItem(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });
  let connection;
  try {
    const [categories] = await pool.execute('SELECT id FROM categories WHERE id = ?', [validation.value.categoryId]);
    if (!categories.length) return response.status(400).json({ error: 'categoryId does not match an existing category' });
    const images = await Promise.all((request.files || []).map(uploadImage));
    connection = await pool.getConnection();
    await connection.beginTransaction();
    let locationId = null;
    if (validation.value.location) {
      const [result] = await connection.execute('INSERT INTO locations (address, latitude, longitude) VALUES (?, ?, ?)', [validation.value.location.address, validation.value.location.latitude, validation.value.location.longitude]);
      locationId = result.insertId;
    }
    const [result] = await connection.execute(
      `INSERT INTO items (user_id, category_id, location_id, type, name, description, item_date, contact_method)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [request.auth.userId, validation.value.categoryId, locationId, validation.value.type, validation.value.name, validation.value.description, validation.value.itemDate, validation.value.contactMethod],
    );
    for (const image of images) await connection.execute('INSERT INTO images (item_id, image_url, alt_text) VALUES (?, ?, ?)', [result.insertId, image.url, image.altText]);
    await connection.commit();
    response.status(201).json({ data: { id: result.insertId } });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally { if (connection) connection.release(); }
});

router.put('/:id', requireAuth, upload.array('images', 5), async (request, response, next) => {
  const id = validId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Item id must be a positive integer' });
  const locationError = parseLocation(request.body);
  if (locationError) return response.status(400).json({ error: locationError });
  const validation = validateNewItem(request.body);
  if (validation.error) return response.status(400).json({ error: validation.error });
  let connection;
  try {
    const [categories] = await pool.execute('SELECT id FROM categories WHERE id = ?', [validation.value.categoryId]);
    if (!categories.length) return response.status(400).json({ error: 'categoryId does not match an existing category' });
    const images = await Promise.all((request.files || []).map(uploadImage));
    connection = await pool.getConnection();
    await connection.beginTransaction();
    const [owned] = await connection.execute('SELECT id, location_id FROM items WHERE id = ? AND user_id = ? FOR UPDATE', [id, request.auth.userId]);
    if (!owned.length) { await connection.rollback(); return response.status(404).json({ error: 'Item not found or not owned by the current user' }); }
    let locationId = owned[0].location_id;
    if (validation.value.location) {
      const [result] = await connection.execute('INSERT INTO locations (address, latitude, longitude) VALUES (?, ?, ?)', [validation.value.location.address, validation.value.location.latitude, validation.value.location.longitude]);
      locationId = result.insertId;
    }
    await connection.execute(
      `UPDATE items SET category_id = ?, location_id = ?, type = ?, name = ?, description = ?, item_date = ?, contact_method = ? WHERE id = ? AND user_id = ?`,
      [validation.value.categoryId, locationId, validation.value.type, validation.value.name, validation.value.description, validation.value.itemDate, validation.value.contactMethod, id, request.auth.userId],
    );
    if (request.files?.length) {
      await connection.execute('DELETE FROM images WHERE item_id = ?', [id]);
      for (const image of images) await connection.execute('INSERT INTO images (item_id, image_url, alt_text) VALUES (?, ?, ?)', [id, image.url, image.altText]);
    }
    await connection.commit();
    response.json({ data: { id } });
  } catch (error) {
    if (connection) await connection.rollback();
    next(error);
  } finally { if (connection) connection.release(); }
});

router.delete('/:id', requireAuth, async (request, response, next) => {
  const id = validId(request.params.id);
  if (!id) return response.status(400).json({ error: 'Item id must be a positive integer' });
  try {
    const [result] = await pool.execute('DELETE FROM items WHERE id = ? AND user_id = ?', [id, request.auth.userId]);
    if (!result.affectedRows) return response.status(404).json({ error: 'Item not found or not owned by the current user' });
    response.status(204).end();
  } catch (error) { next(error); }
});

module.exports = router;
