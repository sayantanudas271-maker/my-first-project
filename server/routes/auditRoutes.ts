import { Router } from 'express';
import { auditController } from '../controllers/auditController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authMiddleware);

router.get('/logs', auditController.getAuditLogs);
router.get('/analytics', auditController.getAnalytics);

export default router;
