import { pool } from '../config/db.js';
import { addCredits } from '../services/creditService.js';

export const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      'SELECT id, name, email, role, credits, status, created_at FROM users ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM users');

    res.json({ users: rows, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

export const updateUserCredits = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount || isNaN(Number(amount))) {
      return res.status(400).json({ message: 'Valid userId and amount are required' });
    }
    const newBalance = await addCredits(Number(userId), Number(amount), 'Admin added credits');
    res.json({ message: 'Credits updated successfully', newBalance });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update credits', error: error.message });
  }
};

export const setUserStatus = async (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      return res.status(400).json({ message: 'Status must be active or suspended' });
    }
    await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, userId]);
    res.json({ message: `User ${status === 'suspended' ? 'suspended' : 'reactivated'} successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update user status', error: error.message });
  }
};

export const getAllSmsLogs = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const [rows] = await pool.query(
      `SELECT s.id, s.recipient_number, s.country, s.message_text, s.provider, s.status,
              s.credits_used, s.is_bulk, s.created_at, u.name, u.email
       FROM sms_messages s
       JOIN users u ON s.user_id = u.id
       ORDER BY s.created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM sms_messages');

    res.json({ logs: rows, total, page, limit, pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch SMS logs', error: error.message });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [[smsStats]] = await pool.query(
      `SELECT COUNT(*) as total_sms, SUM(status='delivered') as delivered,
              SUM(status='failed') as failed, SUM(credits_used) as total_credits_spent FROM sms_messages`
    );
    const [[userStats]] = await pool.query(
      `SELECT COUNT(*) as total_users, SUM(status='active') as active_users,
              SUM(role='admin') as admins, SUM(credits) as total_credits_in_system FROM users`
    );
    res.json({ ...smsStats, ...userStats });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};
