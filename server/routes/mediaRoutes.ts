import { Router } from 'express';
import { mediaController } from '../controllers/mediaController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authMiddleware);

router.post('/generate-image', mediaController.generateImage);
router.post('/edit-image', mediaController.editImage);
router.post('/animate-video', mediaController.animateVideo);

export default router;
