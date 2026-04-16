import { pool } from '../config/db.js';

export const twilioStatusWebhook = async (req, res) => {
  try {
    const payload = req.body;
    await pool.query('INSERT INTO webhook_logs (provider, payload) VALUES (?, ?)', ['twilio', JSON.stringify(payload)]);

    const messageSid = payload.MessageSid;
    const status = payload.MessageStatus;

    let finalStatus = 'sent';
    if (status === 'delivered') finalStatus = 'delivered';
    if (['failed', 'undelivered'].includes(status)) finalStatus = 'failed';

    await pool.query(
      'UPDATE sms_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE provider = ? AND provider_message_id = ?',
      [finalStatus, 'twilio', messageSid]
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: 'Twilio webhook error', error: error.message });
  }
};

export const msg91StatusWebhook = async (req, res) => {
  try {
    const payload = req.body;
    await pool.query('INSERT INTO webhook_logs (provider, payload) VALUES (?, ?)', ['msg91', JSON.stringify(payload)]);

    const requestId = payload.request_id || payload.id || payload.flow_id;
    const deliveryStatus = String(payload.status || '').toLowerCase();

    let finalStatus = 'sent';
    if (deliveryStatus.includes('deliver')) finalStatus = 'delivered';
    if (deliveryStatus.includes('fail') || deliveryStatus.includes('reject')) finalStatus = 'failed';

    await pool.query(
      'UPDATE sms_messages SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE provider = ? AND provider_message_id = ?',
      [finalStatus, 'msg91', requestId]
    );

    res.sendStatus(200);
  } catch (error) {
    res.status(500).json({ message: 'MSG91 webhook error', error: error.message });
  }
};