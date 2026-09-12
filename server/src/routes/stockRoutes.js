import express from 'express';
import {
  getStocks,
  getStockById,
  createStock,
  updateStock,
  adjustStockQuantity,
  deleteStock,
} from '../controllers/stockController.js';

const router = express.Router();

router.get('/', getStocks);
router.get('/:id', getStockById);
router.post('/', createStock);
router.put('/:id', updateStock);
router.patch('/:id/adjust', adjustStockQuantity);
router.delete('/:id', deleteStock);

export default router;
