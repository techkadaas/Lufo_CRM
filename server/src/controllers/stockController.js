import { Store } from '../services/storeService.js';

export const getStocks = async (req, res) => {
  try {
    const { search, category } = req.query;
    const stocks = await Store.getStocks({ search, category });
    res.json({ success: true, count: stocks.length, data: stocks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getStockById = async (req, res) => {
  try {
    const stock = await Store.getStockById(req.params.id);
    if (!stock) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }
    res.json({ success: true, data: stock });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createStock = async (req, res) => {
  try {
    const stockData = req.body;
    
    // Auto-generate SKU if not provided
    if (!stockData.sku) {
      const catPrefix = (stockData.category || 'APP').substring(0, 3).toUpperCase();
      const rand = Math.floor(100 + Math.random() * 900);
      stockData.sku = `LUFO-${catPrefix}-${rand}`;
    } else {
      stockData.sku = stockData.sku.toUpperCase().trim();
    }

    const newStock = await Store.createStock(stockData);
    res.status(201).json({ success: true, message: 'Stock added successfully', data: newStock });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateStock = async (req, res) => {
  try {
    const updated = await Store.updateStock(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }
    res.json({ success: true, message: 'Stock updated successfully', data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const adjustStockQuantity = async (req, res) => {
  try {
    const { adjustment, reason } = req.body;
    if (adjustment === undefined || isNaN(adjustment)) {
      return res.status(400).json({ success: false, message: 'Valid adjustment number is required' });
    }
    const updated = await Store.adjustStockQuantity(req.params.id, Number(adjustment), reason);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }
    res.json({ success: true, message: 'Stock quantity adjusted', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStock = async (req, res) => {
  try {
    const deleted = await Store.deleteStock(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Stock item not found' });
    }
    res.json({ success: true, message: 'Stock item deleted', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
