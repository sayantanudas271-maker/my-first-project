import { Router } from 'express';
import { copilotController } from '../controllers/copilotController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authMiddleware);

router.post('/chat', copilotController.chat);
router.post('/market-intelligence', copilotController.searchMarket);
router.post('/maps-grounding', copilotController.searchMaps);
router.post('/transcribe-audio', copilotController.transcribeAudio);

export default router;
