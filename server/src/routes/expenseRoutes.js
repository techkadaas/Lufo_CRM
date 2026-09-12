import express from 'express';
import { getExpenses, createExpense, deleteExpense } from '../controllers/expenseController.js';

const router = express.Router();

router.get('/', getExpenses);
router.post('/', createExpense);
router.delete('/:id', deleteExpense);

export default router;
