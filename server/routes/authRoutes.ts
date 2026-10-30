import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';
import { validateRequest } from '../middleware/validateRequest.ts';
import { loginSchema, registerSchema } from '../utils/zodSchemas.ts';

const router = Router();

router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/register', validateRequest(registerSchema), authController.register);
router.get('/me', authMiddleware, authController.me);

export default router;
