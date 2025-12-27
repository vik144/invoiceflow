import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, '../data.db'));

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_number TEXT,
    company TEXT,
    distributor TEXT,
    date TEXT,
    total_amount REAL DEFAULT 0,
    reminder_date TEXT,
    is_paid INTEGER DEFAULT 0,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS invoice_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER,
    item_name TEXT,
    quantity INTEGER DEFAULT 0,
    price REAL DEFAULT 0,
    free_qty INTEGER DEFAULT 0,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS cash_flow (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date TEXT UNIQUE,
    cash_amount REAL DEFAULT 0,
    upi_amount REAL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );

  CREATE TABLE IF NOT EXISTS entities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('company', 'distributor', 'both')),
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Add new columns to invoices table if they don't exist
const columns = db.prepare("PRAGMA table_info(invoices)").all();
const hasCompanyId = columns.some(col => col.name === 'company_id');
const hasDistributorId = columns.some(col => col.name === 'distributor_id');

if (!hasCompanyId) {
  db.exec('ALTER TABLE invoices ADD COLUMN company_id INTEGER REFERENCES entities(id)');
}
if (!hasDistributorId) {
  db.exec('ALTER TABLE invoices ADD COLUMN distributor_id INTEGER REFERENCES entities(id)');
}

// Migrate existing company/distributor data to entities table
const migrateData = () => {
  const invoices = db.prepare('SELECT DISTINCT company, distributor FROM invoices WHERE company IS NOT NULL').all();

  const insertEntity = db.prepare('INSERT OR IGNORE INTO entities (name, type) VALUES (?, ?)');
  const getEntityId = db.prepare('SELECT id FROM entities WHERE name = ?');
  const updateInvoice = db.prepare('UPDATE invoices SET company_id = ?, distributor_id = ? WHERE company = ? AND distributor = ?');

  for (const invoice of invoices) {
    if (invoice.company) {
      // Insert company
      insertEntity.run(invoice.company, 'company');
      const companyEntity = getEntityId.get(invoice.company);

      if (invoice.distributor && invoice.distributor !== invoice.company) {
        // Insert distributor
        insertEntity.run(invoice.distributor, 'distributor');
        const distributorEntity = getEntityId.get(invoice.distributor);
        updateInvoice.run(companyEntity.id, distributorEntity.id, invoice.company, invoice.distributor);
      } else if (invoice.distributor === invoice.company) {
        // Company is also distributor - update type to 'both'
        db.prepare("UPDATE entities SET type = 'both' WHERE id = ?").run(companyEntity.id);
        updateInvoice.run(companyEntity.id, companyEntity.id, invoice.company, invoice.distributor);
      } else {
        updateInvoice.run(companyEntity.id, null, invoice.company, invoice.distributor);
      }
    }
  }
};

// Only migrate if there are invoices without company_id
const needsMigration = db.prepare('SELECT COUNT(*) as count FROM invoices WHERE company IS NOT NULL AND company_id IS NULL').get();
if (needsMigration.count > 0) {
  migrateData();
}

export default db;
