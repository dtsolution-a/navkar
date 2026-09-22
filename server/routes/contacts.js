import { Router } from 'express';
import db from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

import nodemailer from 'nodemailer';

const router = Router();

// Create reusable transporter (configure with real SMTP details later)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// GET - Debug email configuration
router.get('/test-email', async (req, res) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.SMTP_USER, // send to self
      subject: 'Test Email from Navkar Engineering Server',
      text: 'If you are reading this, the email configuration is working perfectly!'
    };
    
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.send(`<h2>Error: Credentials Missing</h2><p>SMTP_USER or SMTP_PASS is empty in cPanel.</p>`);
    }

    const info = await transporter.sendMail(mailOptions);
    res.send(`<h2>Success!</h2><p>Email sent successfully to ${process.env.SMTP_USER}.</p><pre>${JSON.stringify(info, null, 2)}</pre>`);
  } catch (err) {
    res.send(`<h2>Failed to send email</h2><p>Here is the exact error from Gmail/Server:</p><pre style="color:red; background:#eee; padding:10px;">${err.stack || err.message || JSON.stringify(err)}</pre>`);
  }
});

// POST - Public contact form submission
router.post('/', async (req, res) => {
  const { name, email, phone, company, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // 1. Determine target email based on settings and inquiry type
  let targetEmail = 'info@navkarengineering.com'; // Default fallback
  try {
    const settings = db.prepare('SELECT * FROM settings').all().reduce((acc, row) => {
      acc[row.key] = row.value;
      return acc;
    }, {});

    if (subject && subject.includes('Instrumentation')) {
      targetEmail = settings.email_instrumentation || 'support.inst@navkarengineering.com';
    } else if (subject && subject.includes('Compressor')) {
      targetEmail = settings.email_compressor || 'support.compressor@navkarengineering.com';
    } else {
      targetEmail = settings.email_others || 'info@navkarengineering.com';
    }
  } catch (err) {
    console.error('Error fetching settings for email routing:', err);
  }

  // 2. Save to database
  let result;
  try {
    result = db.prepare(`
      INSERT INTO contacts (name, email, phone, company, subject, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, email, phone || '', company || '', subject || '', message);
  } catch (err) {
    console.error('Error saving contact to DB:', err);
    return res.status(500).json({ error: 'Failed to save enquiry.' });
  }

  // 3. Send Email Notification
  let emailStatus = 'Not sent';
  try {
    const mailOptions = {
      from: process.env.SMTP_USER || '"Navkar Engineering System" <no-reply@navkarengineering.com>',
      to: targetEmail,
      subject: `New Enquiry: ${subject || 'General'}`,
      html: `
        <h2>New Enquiry Received</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Company:</strong> ${company || 'N/A'}</p>
        <p><strong>Subject / Inquiry Type:</strong> ${subject}</p>
        <br/>
        <p><strong>Message / Requirements:</strong></p>
        <p>${message}</p>
      `
    };
    
    // Only attempt to send if auth is configured
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
      await transporter.sendMail(mailOptions);
      emailStatus = 'Sent successfully';
    } else {
      emailStatus = 'Credentials missing in cPanel Environment Variables';
    }
  } catch (err) {
    console.error('Failed to send email:', err);
    emailStatus = err.message || 'Unknown error occurred while sending email';
  }

  res.status(201).json({ 
    id: result.lastInsertRowid, 
    message: 'Thank you for your enquiry. We will get back to you shortly.',
    debug_email_status: emailStatus // Temporary debug info for the user
  });
});

// GET all contacts (protected)
router.get('/', authenticateToken, (req, res) => {
  const { is_read } = req.query;
  let contacts;
  if (is_read !== undefined) {
    contacts = db.prepare('SELECT * FROM contacts WHERE is_read = ? ORDER BY created_at DESC').all(Number(is_read));
  } else {
    contacts = db.prepare('SELECT * FROM contacts ORDER BY created_at DESC').all();
  }
  res.json(contacts);
});

// GET single contact
router.get('/:id', authenticateToken, (req, res) => {
  const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found.' });
  // Mark as read
  db.prepare('UPDATE contacts SET is_read = 1 WHERE id = ?').run(req.params.id);
  res.json(contact);
});

// DELETE contact
router.delete('/:id', authenticateToken, (req, res) => {
  const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found.' });

  db.prepare('DELETE FROM contacts WHERE id = ?').run(req.params.id);
  res.json({ message: 'Contact deleted successfully.' });
});

// Mark as read/unread
router.patch('/:id/read', authenticateToken, (req, res) => {
  const { is_read } = req.body;
  const contact = db.prepare('SELECT id FROM contacts WHERE id = ?').get(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found.' });

  db.prepare('UPDATE contacts SET is_read = ? WHERE id = ?').run(is_read ? 1 : 0, req.params.id);
  res.json({ message: 'Updated successfully.' });
});

export default router;
