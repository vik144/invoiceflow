import express from 'express';
import db from '../db.js';

const router = express.Router();

// Get all invoices
router.get('/', (req, res) => {
  const { company_id, status } = req.query;

  let query = 'SELECT * FROM invoices';
  const conditions = [];
  const params = [];

  if (company_id) {
    conditions.push('company_id = ?');
    params.push(company_id);
  }

  if (status === 'paid') {
    conditions.push('is_paid = 1');
  } else if (status === 'pending') {
    conditions.push('is_paid = 0');
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY date DESC';

  const invoices = db.prepare(query).all(...params);

  // Get items for each invoice
  const getItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?');
  const result = invoices.map(inv => ({
    ...inv,
    items: getItems.all(inv.id)
  }));

  res.json(result);
});

// Get single invoice
router.get('/:id', (req, res) => {
  const invoice = db.prepare('SELECT * FROM invoices WHERE id = ?').get(req.params.id);
  if (!invoice) return res.status(404).json({ error: 'Not found' });

  invoice.items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoice.id);
  res.json(invoice);
});

// Create invoice
router.post('/', (req, res) => {
  const { invoice_number, company, distributor, company_id, distributor_id, date, items } = req.body;

  // Calculate total
  const total_amount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0);

  // Set reminder for 10 days from invoice date
  const invoiceDate = new Date(date);
  invoiceDate.setDate(invoiceDate.getDate() + 10);
  const reminder_date = invoiceDate.toISOString().split('T')[0];

  // Support both old (company/distributor text) and new (company_id/distributor_id) formats
  const result = db.prepare(`
    INSERT INTO invoices (invoice_number, company, distributor, company_id, distributor_id, date, total_amount, reminder_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(invoice_number, company || null, distributor || null, company_id || null, distributor_id || null, date, total_amount, reminder_date);

  const invoiceId = result.lastInsertRowid;

  // Insert items
  const insertItem = db.prepare(`
    INSERT INTO invoice_items (invoice_id, item_name, quantity, price, free_qty)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const item of items) {
    insertItem.run(invoiceId, item.item_name, item.quantity, item.price, item.free_qty || 0);
  }

  res.json({ id: invoiceId, message: 'Invoice created' });
});

// Update invoice paid status
router.patch('/:id/paid', (req, res) => {
  const { is_paid } = req.body;
  db.prepare('UPDATE invoices SET is_paid = ? WHERE id = ?').run(is_paid ? 1 : 0, req.params.id);
  res.json({ message: 'Updated' });
});

// Delete invoice
router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM invoice_items WHERE invoice_id = ?').run(req.params.id);
  db.prepare('DELETE FROM invoices WHERE id = ?').run(req.params.id);
  res.json({ message: 'Deleted' });
});

// Export invoices as CSV with date filters
router.get('/export/csv', (req, res) => {
  const { filter, month, year, startDate, endDate } = req.query;

  let whereClause = '';
  let params = [];

  if (filter === 'monthly' && month && year) {
    const start = `${year}-${month.padStart(2, '0')}-01`;
    const end = `${year}-${month.padStart(2, '0')}-31`;
    whereClause = 'WHERE date BETWEEN ? AND ?';
    params = [start, end];
  } else if (filter === 'range' && startDate && endDate) {
    whereClause = 'WHERE date BETWEEN ? AND ?';
    params = [startDate, endDate];
  }
  // filter === 'all' or no filter = no WHERE clause

  const invoices = db.prepare(`
    SELECT * FROM invoices ${whereClause} ORDER BY date DESC
  `).all(...params);

  const getItems = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?');

  // Build CSV
  const headers = ['Invoice Number', 'Company', 'Distributor', 'Date', 'Items', 'Total Amount', 'Status', 'Reminder Date'];
  const rows = invoices.map(inv => {
    const items = getItems.all(inv.id);
    const itemsSummary = items.map(i =>
      `${i.item_name} (${i.quantity} x ${i.price}${i.free_qty ? ` +${i.free_qty} free` : ''})`
    ).join('; ');

    return [
      inv.invoice_number,
      inv.company,
      inv.distributor,
      inv.date,
      `"${itemsSummary}"`,
      inv.total_amount,
      inv.is_paid ? 'Paid' : 'Unpaid',
      inv.reminder_date
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename=invoices-${filter || 'all'}-${new Date().toISOString().split('T')[0]}.csv`);
  res.send(csv);
});

// Get monthly summary (for profit calculation)
router.get('/summary/monthly', (req, res) => {
  const { month, year } = req.query;
  const startDate = `${year}-${month.padStart(2, '0')}-01`;
  const endDate = `${year}-${month.padStart(2, '0')}-31`;

  const result = db.prepare(`
    SELECT COALESCE(SUM(total_amount), 0) as total_purchases
    FROM invoices
    WHERE date BETWEEN ? AND ?
  `).get(startDate, endDate);

  res.json(result);
});

export default router;
