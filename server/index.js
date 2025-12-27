import express from 'express';
import cors from 'cors';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import invoicesRouter from './routes/invoices.js';
import cashflowRouter from './routes/cashflow.js';
import settingsRouter from './routes/settings.js';
import entitiesRouter from './routes/entities.js';
import { checkAndSendReminders } from './emailer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/invoices', invoicesRouter);
app.use('/api/cashflow', cashflowRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/entities', entitiesRouter);

// Serve static files from the dist directory (production build)
app.use(express.static(path.join(__dirname, '../dist')));

// SPA fallback - serve index.html for all non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Check for payment reminders every day at 9 AM
cron.schedule('0 9 * * *', () => {
  console.log('Checking for payment reminders...');
  checkAndSendReminders();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
