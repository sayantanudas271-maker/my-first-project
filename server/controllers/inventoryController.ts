import { Response } from 'express';
import { db } from '../models/store.ts';
import { AuthenticatedRequest } from '../middleware/authMiddleware.ts';

export const inventoryController = {
  getInventory: async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const items = db.getInventory();
    res.json({ inventory: items });
  },

  getVendors: async (_req: AuthenticatedRequest, res: Response): Promise<void> => {
    const vendors = db.getVendors();
    res.json({ vendors });
  },

  updateStock: async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const { sku, stockAdjustment } = req.body;
    const updated = db.updateInventoryStock(sku, Number(stockAdjustment));

    if (!updated) {
      res.status(404).json({ error: `Item with SKU ${sku} not found` });
      return;
    }

    res.json({ item: updated });
  },
};
