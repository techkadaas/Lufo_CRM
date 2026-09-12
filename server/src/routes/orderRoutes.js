import express from 'express';
import {
  getOrders,
  getOrderById,
  getNextBillNumber,
  getCustomerLookup,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';

const router = express.Router();

router.get('/', getOrders);
router.get('/next-bill-number', getNextBillNumber);
router.get('/customer-lookup', getCustomerLookup);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.patch('/:id/status', updateOrderStatus);
router.delete('/:id', deleteOrder);

export default router;
