import { Store } from '../services/storeService.js';

export const getExpenses = async (req, res) => {
  try {
    const { search, category } = req.query;
    const expenses = await Store.getExpenses({ search, category });
    res.json({ success: true, count: expenses.length, data: expenses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createExpense = async (req, res) => {
  try {
    const expenseData = req.body;
    if (!expenseData.title || !expenseData.amount) {
      return res.status(400).json({ success: false, message: 'Title and amount are required' });
    }
    const newExpense = await Store.createExpense({
      ...expenseData,
      amount: Number(expenseData.amount),
    });
    res.status(201).json({ success: true, message: 'Expense recorded successfully', data: newExpense });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteExpense = async (req, res) => {
  try {
    const deleted = await Store.deleteExpense(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Expense record not found' });
    }
    res.json({ success: true, message: 'Expense deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
