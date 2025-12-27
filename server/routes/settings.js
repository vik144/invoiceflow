import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all settings
router.get('/', (req, res) => {
  const settings = db.prepare('SELECT * FROM settings').all();
  const result = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  res.json(result);
});

// Get single setting
router.get('/:key', (req, res) => {
  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get(req.params.key);
  res.json({ value: setting?.value || null });
});

// Set a setting
router.post('/', (req, res) => {
  const { key, value } = req.body;
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
  res.json({ message: 'Saved' });
});

export default router;
