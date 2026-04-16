import express from 'express';
import { msg91StatusWebhook, twilioStatusWebhook } from '../controllers/webhookController.js';

const router = express.Router();
router.post('/twilio/status', twilioStatusWebhook);
router.post('/msg91/status', msg91StatusWebhook);

export default router;