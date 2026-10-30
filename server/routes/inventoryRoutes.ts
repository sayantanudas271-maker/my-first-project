import { Router } from 'express';
import { inventoryController } from '../controllers/inventoryController.ts';
import { authMiddleware } from '../middleware/authMiddleware.ts';

const router = Router();

router.use(authMiddleware);

router.get('/', inventoryController.getInventory);
router.get('/vendors', inventoryController.getVendors);
router.post('/update-stock', inventoryController.updateStock);

export default router;
