import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { adminMiddleware } from '../middleware/adminMiddleware.js';
import { getAllSmsLogs, getAllUsers, setUserStatus, updateUserCredits, getAdminStats } from '../controllers/adminController.js';

const router = express.Router();
router.use(authMiddleware, adminMiddleware);
router.get('/users', getAllUsers);
router.get('/sms-logs', getAllSmsLogs);
router.get('/stats', getAdminStats);
router.post('/credits', updateUserCredits);
router.post('/user-status', setUserStatus);
export default router;
