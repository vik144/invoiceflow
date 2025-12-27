import nodemailer from 'nodemailer';
import db from './db.js';

function getSettings() {
  const settings = db.prepare('SELECT * FROM settings').all();
  const result = {};
  for (const s of settings) {
    result[s.key] = s.value;
  }
  return result;
}

export async function checkAndSendReminders() {
  const settings = getSettings();

  // Use environment variables with database settings as fallback
  const emailUser = process.env.EMAIL_USER || settings.email_user;
  const emailPass = process.env.EMAIL_PASS || settings.email_pass;
  const reminderEmail = process.env.REMINDER_EMAIL || settings.reminder_email;

  if (!emailUser || !emailPass || !reminderEmail) {
    console.log('Email not configured, skipping reminders');
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  // Find unpaid invoices with reminder_date <= today
  const dueInvoices = db.prepare(`
    SELECT * FROM invoices
    WHERE is_paid = 0 AND reminder_date <= ?
  `).all(today);

  if (dueInvoices.length === 0) {
    console.log('No payment reminders due');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser,
      pass: emailPass
    }
  });

  for (const invoice of dueInvoices) {
    const items = db.prepare('SELECT * FROM invoice_items WHERE invoice_id = ?').all(invoice.id);

    const itemsList = items.map(i =>
      `  - ${i.item_name}: ${i.quantity} x ₹${i.price} = ₹${i.quantity * i.price}${i.free_qty ? ` (+ ${i.free_qty} free)` : ''}`
    ).join('\n');

    const message = `
Payment Reminder!

Invoice #${invoice.invoice_number}
Company: ${invoice.company}
Distributor: ${invoice.distributor}
Date: ${invoice.date}

Items:
${itemsList}

Total: ₹${invoice.total_amount}

This payment was due on ${invoice.reminder_date}.
    `.trim();

    try {
      await transporter.sendMail({
        from: emailUser,
        to: reminderEmail,
        subject: `Payment Reminder: Invoice #${invoice.invoice_number} - ₹${invoice.total_amount}`,
        text: message
      });
      console.log(`Reminder sent for invoice #${invoice.invoice_number}`);
    } catch (err) {
      console.error(`Failed to send reminder for invoice #${invoice.invoice_number}:`, err.message);
    }
  }
}

export function formatInvoiceForSharing(invoice, items) {
  const itemsList = items.map(i =>
    `${i.item_name}: ${i.quantity} x ₹${i.price} = ₹${i.quantity * i.price}${i.free_qty ? ` (+${i.free_qty} free)` : ''}`
  ).join('\n');

  const totalFree = items.reduce((sum, i) => sum + (i.free_qty || 0), 0);

  return `
📋 Invoice #${invoice.invoice_number}
━━━━━━━━━━━━━━━━━━━━
🏢 ${invoice.company}
📦 ${invoice.distributor}
📅 ${invoice.date}

📝 Items:
${itemsList}

💰 Total: ₹${invoice.total_amount}
🎁 Free items: ${totalFree}
━━━━━━━━━━━━━━━━━━━━
  `.trim();
}
