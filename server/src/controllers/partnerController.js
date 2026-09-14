import { Store } from '../services/storeService.js';

export const getPartners = async (req, res) => {
  try {
    const { search } = req.query;
    const partners = await Store.getPartners({ search });
    res.json({ success: true, count: partners.length, data: partners });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPartnerById = async (req, res) => {
  try {
    const partner = await Store.getPartnerById(req.params.id);
    if (!partner) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, data: partner });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPartner = async (req, res) => {
  try {
    const partnerData = req.body;
    if (!partnerData.name || !partnerData.name.trim()) {
      return res.status(400).json({ success: false, message: 'Partner name is required' });
    }
    const partner = await Store.createPartner(partnerData);
    res.status(201).json({ success: true, message: 'Partner created successfully', data: partner });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const updated = await Store.updatePartner(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, message: 'Partner updated successfully', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deletePartner = async (req, res) => {
  try {
    const deleted = await Store.deletePartner(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Partner not found' });
    }
    res.json({ success: true, message: 'Partner deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PARTNER INCOMES CONTROLLERS
export const getPartnerIncomes = async (req, res) => {
  try {
    const { partnerId } = req.query;
    const incomes = await Store.getPartnerIncomes({ partnerId });
    res.json({ success: true, count: incomes.length, data: incomes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPartnerIncome = async (req, res) => {
  try {
    const incomeData = req.body;
    if (!incomeData.partnerId) {
      return res.status(400).json({ success: false, message: 'Partner ID is required' });
    }
    if (!incomeData.amount || Number(incomeData.amount) <= 0) {
      return res.status(400).json({ success: false, message: 'Valid income amount is required' });
    }
    const income = await Store.createPartnerIncome({
      ...incomeData,
      amount: Number(incomeData.amount),
    });
    res.status(201).json({ success: true, message: 'Partner income recorded successfully', data: income });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePartnerIncome = async (req, res) => {
  try {
    const deleted = await Store.deletePartnerIncome(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Partner income record not found' });
    }
    res.json({ success: true, message: 'Partner income deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
