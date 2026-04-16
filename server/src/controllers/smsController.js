import fs from 'fs';
import path from 'path';
import { pool } from '../config/db.js';
import { getUserCredits, deductCredits } from '../services/creditService.js';
import { sendSmsByProvider } from '../services/routingService.js';
import { parseCSV } from '../utils/csvParser.js';
import { parseExcel } from '../utils/excelParser.js';

const isValidPhone = (number) => /^\+?[1-9]\d{7,14}$/.test(String(number || '').trim());

const cleanupFile = (filePath) => {
  try { fs.unlinkSync(filePath); } catch {}
};

export const sendSingleSms = async (req, res) => {
  try {
    const { recipient_number, country, message_text } = req.body;
    const userId = req.user.id;

    if (!recipient_number || !isValidPhone(recipient_number)) {
      return res.status(400).json({ message: 'Invalid phone number format' });
    }
    if (!message_text || message_text.trim().length === 0) {
      return res.status(400).json({ message: 'Message text is required' });
    }
    if (message_text.length > 1600) {
      return res.status(400).json({ message: 'Message too long (max 1600 characters)' });
    }
    if (!country) {
      return res.status(400).json({ message: 'Country is required' });
    }

    const credits = await getUserCredits(userId);
    if (credits < 1) {
      return res.status(400).json({ message: 'Insufficient credits' });
    }

    const result = await sendSmsByProvider({ country, to: recipient_number.trim(), body: message_text.trim() });

    await deductCredits(userId, 1, `SMS to ${recipient_number}`);

    const [dbResult] = await pool.query(
      `INSERT INTO sms_messages (user_id, recipient_number, country, message_text, provider, provider_message_id, status, credits_used, is_bulk)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, recipient_number.trim(), country, message_text.trim(), result.provider, result.providerMessageId, result.status, 1, false]
    );

    // Return updated credits
    const newCredits = await getUserCredits(userId);

    res.status(201).json({
      message: 'SMS sent successfully',
      smsId: dbResult.insertId,
      provider: result.provider,
      status: result.status,
      creditsRemaining: newCredits
    });
  } catch (error) {
    res.status(500).json({ message: 'SMS send failed', error: error.message });
  }
};

export const getMyMessages = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT * FROM sms_messages WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [req.user.id, limit, offset]
    );

    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM sms_messages WHERE user_id = ?',
      [req.user.id]
    );

    res.json({ messages: rows, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
  }
};

export const bulkSendSms = async (req, res) => {
  const file = req.file;
  let bulkUploadId = null;

  try {
    const userId = req.user.id;

    if (!file) {
      return res.status(400).json({ message: 'File is required' });
    }

    const ext = path.extname(file.originalname).toLowerCase();
    let rows = [];

    if (ext === '.csv') {
      rows = await parseCSV(file.path);
    } else if (ext === '.xlsx' || ext === '.xls') {
      rows = parseExcel(file.path);
    } else {
      cleanupFile(file.path);
      return res.status(400).json({ message: 'Only CSV and Excel files are allowed' });
    }

    const totalRows = rows.length;
    const validRows = rows.filter((r) => isValidPhone(r.recipient_number || r.phone || r.number));
    const invalidRows = totalRows - validRows.length;

    if (validRows.length === 0) {
      cleanupFile(file.path);
      return res.status(400).json({ message: 'No valid phone numbers found in file' });
    }

    const creditsNeeded = validRows.length;
    const credits = await getUserCredits(userId);

    if (credits < creditsNeeded) {
      cleanupFile(file.path);
      return res.status(400).json({ message: `Insufficient credits. Need ${creditsNeeded}, have ${credits}` });
    }

    const [bulkResult] = await pool.query(
      'INSERT INTO bulk_uploads (user_id, file_name, total_rows, valid_rows, invalid_rows, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, file.originalname, totalRows, validRows.length, invalidRows, 'processing']
    );
    bulkUploadId = bulkResult.insertId;

    cleanupFile(file.path);

    const sendResults = [];
    let successCount = 0;
    let failCount = 0;

    for (const row of validRows) {
      const recipient_number = String(row.recipient_number || row.phone || row.number || '').trim();
      const country = row.country || 'India';
      const message_text = row.message_text || row.message || 'Hello from SMS Platform';

      try {
        const result = await sendSmsByProvider({ country, to: recipient_number, body: message_text });
        await deductCredits(userId, 1, `Bulk SMS to ${recipient_number}`);
        await pool.query(
          `INSERT INTO sms_messages (user_id, recipient_number, country, message_text, provider, provider_message_id, status, credits_used, is_bulk)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, recipient_number, country, message_text, result.provider, result.providerMessageId, result.status, 1, true]
        );
        sendResults.push({ recipient_number, status: result.status, provider: result.provider });
        successCount++;
      } catch (error) {
        await pool.query(
          `INSERT INTO sms_messages (user_id, recipient_number, country, message_text, provider, provider_message_id, status, error_message, credits_used, is_bulk)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [userId, recipient_number, country, message_text, 'unknown', null, 'failed', error.message, 0, true]
        );
        sendResults.push({ recipient_number, status: 'failed', error: error.message });
        failCount++;
      }
    }

    await pool.query(
      'UPDATE bulk_uploads SET status = ? WHERE id = ?',
      ['completed', bulkUploadId]
    );

    const newCredits = await getUserCredits(userId);

    res.json({
      message: 'Bulk SMS process completed',
      totalRows, validRows: validRows.length, invalidRows,
      successCount, failCount,
      creditsRemaining: newCredits,
      results: sendResults
    });
  } catch (error) {
    if (file) cleanupFile(file.path);
    if (bulkUploadId) {
      await pool.query('UPDATE bulk_uploads SET status = ? WHERE id = ?', ['failed', bulkUploadId]).catch(() => {});
    }
    res.status(500).json({ message: 'Bulk send failed', error: error.message });
  }
};

export const getStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [[stats]] = await pool.query(
      `SELECT
        COUNT(*) as total,
        SUM(status = 'sent') as sent,
        SUM(status = 'delivered') as delivered,
        SUM(status = 'failed') as failed,
        SUM(credits_used) as credits_spent
       FROM sms_messages WHERE user_id = ?`,
      [userId]
    );
    const [[{ credits }]] = await pool.query('SELECT credits FROM users WHERE id = ?', [userId]);
    res.json({ ...stats, credits });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
