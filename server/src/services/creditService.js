import { pool } from '../config/db.js';

export const getUserCredits = async (userId) => {
  const [rows] = await pool.query('SELECT credits FROM users WHERE id = ?', [userId]);
  return rows[0]?.credits ?? 0;
};

export const deductCredits = async (userId, amount, description = 'SMS sent') => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT credits FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!rows.length) throw new Error('User not found');

    const currentCredits = rows[0].credits;
    if (currentCredits < amount) throw new Error('Insufficient credits');

    const newBalance = currentCredits - amount;

    await connection.query('UPDATE users SET credits = ? WHERE id = ?', [newBalance, userId]);
    await connection.query(
      'INSERT INTO credit_transactions (user_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'credit_deduct', amount, newBalance, description]
    );

    await connection.commit();
    return newBalance;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

export const addCredits = async (userId, amount, description = 'Admin credit added') => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query('SELECT credits FROM users WHERE id = ? FOR UPDATE', [userId]);
    if (!rows.length) throw new Error('User not found');

    const currentCredits = rows[0].credits;
    const newBalance = currentCredits + amount;

    await connection.query('UPDATE users SET credits = ? WHERE id = ?', [newBalance, userId]);
    await connection.query(
      'INSERT INTO credit_transactions (user_id, type, amount, balance_after, description) VALUES (?, ?, ?, ?, ?)',
      [userId, 'credit_add', amount, newBalance, description]
    );

    await connection.commit();
    return newBalance;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};