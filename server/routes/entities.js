import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all entities (with optional type filter)
router.get('/', (req, res) => {
  const { type } = req.query;

  let query = 'SELECT * FROM entities WHERE is_active = 1';
  const params = [];

  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }

  query += ' ORDER BY name ASC';

  const entities = db.prepare(query).all(...params);
  res.json(entities);
});

// Get companies (type is 'company' or 'both')
router.get('/companies', (req, res) => {
  const companies = db.prepare(`
    SELECT * FROM entities
    WHERE is_active = 1 AND (type = 'company' OR type = 'both')
    ORDER BY name ASC
  `).all();
  res.json(companies);
});

// Get distributors (type is 'distributor' or 'both')
router.get('/distributors', (req, res) => {
  const distributors = db.prepare(`
    SELECT * FROM entities
    WHERE is_active = 1 AND (type = 'distributor' OR type = 'both')
    ORDER BY name ASC
  `).all();
  res.json(distributors);
});

// Get single entity
router.get('/:id', (req, res) => {
  const entity = db.prepare('SELECT * FROM entities WHERE id = ?').get(req.params.id);
  if (!entity) return res.status(404).json({ error: 'Entity not found' });
  res.json(entity);
});

// Create entity
router.post('/', (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  if (!['company', 'distributor', 'both'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be company, distributor, or both' });
  }

  try {
    const result = db.prepare(`
      INSERT INTO entities (name, type)
      VALUES (?, ?)
    `).run(name, type);

    const entity = db.prepare('SELECT * FROM entities WHERE id = ?').get(result.lastInsertRowid);
    res.json(entity);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Entity with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Update entity
router.put('/:id', (req, res) => {
  const { name, type } = req.body;

  if (!name || !type) {
    return res.status(400).json({ error: 'Name and type are required' });
  }

  if (!['company', 'distributor', 'both'].includes(type)) {
    return res.status(400).json({ error: 'Invalid type. Must be company, distributor, or both' });
  }

  try {
    db.prepare(`
      UPDATE entities
      SET name = ?, type = ?
      WHERE id = ?
    `).run(name, type, req.params.id);

    const entity = db.prepare('SELECT * FROM entities WHERE id = ?').get(req.params.id);
    if (!entity) return res.status(404).json({ error: 'Entity not found' });

    res.json(entity);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Entity with this name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Delete entity (soft delete)
router.delete('/:id', (req, res) => {
  // Check if entity is referenced by any invoices
  const usage = db.prepare(`
    SELECT COUNT(*) as count FROM invoices
    WHERE company_id = ? OR distributor_id = ?
  `).get(req.params.id, req.params.id);

  if (usage.count > 0) {
    // Soft delete - set is_active to 0
    db.prepare('UPDATE entities SET is_active = 0 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Entity deactivated (has existing invoices)', deactivated: true });
  } else {
    // Hard delete if not referenced
    db.prepare('DELETE FROM entities WHERE id = ?').run(req.params.id);
    res.json({ message: 'Entity deleted', deleted: true });
  }
});

export default router;
