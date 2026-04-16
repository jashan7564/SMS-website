import express from 'express';
import multer from 'multer';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { bulkSendSms, getMyMessages, sendSingleSms, getStats } from '../controllers/smsController.js';

const router = express.Router();
const upload = multer({ dest: 'src/uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/send', authMiddleware, sendSingleSms);
router.post('/bulk-send', authMiddleware, upload.single('file'), bulkSendSms);
router.get('/my-messages', authMiddleware, getMyMessages);
router.get('/stats', authMiddleware, getStats);
export default router;
