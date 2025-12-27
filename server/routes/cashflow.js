import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all cash flow entries
router.get('/', (req, res) => {
  const entries = db.prepare('SELECT * FROM cash_flow ORDER BY date DESC').all();
  res.json(entries);
});

// Get or create entry for a specific date
router.get('/date/:date', (req, res) => {
  let entry = db.prepare('SELECT * FROM cash_flow WHERE date = ?').get(req.params.date);
  if (!entry) {
    entry = { date: req.params.date, cash_amount: 0, upi_amount: 0 };
  }
  res.json(entry);
});

// Upsert cash flow entry
router.post('/', (req, res) => {
  const { date, cash_amount, upi_amount } = req.body;

  db.prepare(`
    INSERT INTO cash_flow (date, cash_amount, upi_amount)
    VALUES (?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      cash_amount = excluded.cash_amount,
      upi_amount = excluded.upi_amount
  `).run(date, cash_amount || 0, upi_amount || 0);

  res.json({ message: 'Saved' });
});

// Delete entry
router.delete('/:date', (req, res) => {
  db.prepare('DELETE FROM cash_flow WHERE date = ?').run(req.params.date);
  res.json({ message: 'Deleted' });
});

// Get monthly summary
router.get('/summary/monthly', (req, res) => {
  const { month, year } = req.query;
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;

  const result = db.prepare(`
    SELECT COALESCE(SUM(cash_amount + upi_amount), 0) as total_sales
    FROM cash_flow
    WHERE date BETWEEN ? AND ?
  `).get(startDate, endDate);

  res.json(result);
});

export default router;
