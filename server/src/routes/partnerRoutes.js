import express from 'express';
import {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  getPartnerIncomes,
  createPartnerIncome,
  deletePartnerIncome,
} from '../controllers/partnerController.js';

const router = express.Router();

// Partner Incomes routes (placed before :id to prevent collision)
router.get('/incomes', getPartnerIncomes);
router.post('/incomes', createPartnerIncome);
router.delete('/incomes/:id', deletePartnerIncome);

// Partner CRUD routes
router.get('/', getPartners);
router.post('/', createPartner);
router.get('/:id', getPartnerById);
router.put('/:id', updatePartner);
router.delete('/:id', deletePartner);

export default router;
