import { Store } from '../services/storeService.js';
import { generateBillNumber } from '../utils/billGenerator.js';

export const getOrders = async (req, res) => {
  try {
    const { search, status, timeRange, startDate, endDate } = req.query;
    const orders = await Store.getOrders({ search, status, timeRange, startDate, endDate });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Store.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNextBillNumber = async (req, res) => {
  try {
    const billNumber = await generateBillNumber();
    res.json({ success: true, billNumber });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCustomerLookup = async (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone) {
      return res.status(400).json({ success: false, message: 'Phone number is required' });
    }
    const customerData = await Store.getCustomerByPhone(phone);
    if (!customerData) {
      return res.json({ success: true, exists: false, data: null });
    }
    return res.json({ success: true, exists: true, data: customerData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createOrder = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Ensure bill number is present and uniquely allocated
    if (!orderData.billNumber) {
      orderData.billNumber = await generateBillNumber();
    } else {
      const existing = await Store.getOrderByBillNumber(orderData.billNumber);
      if (existing) {
        orderData.billNumber = await generateBillNumber();
      }
    }

    // Auto-calculate totals if not passed accurately
    let calculatedSubtotal = 0;
    const processedItems = (orderData.items || []).map((item) => {
      const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
      calculatedSubtotal += lineTotal;
      return {
        ...item,
        price: Number(item.price) || 0,
        quantity: Number(item.quantity) || 1,
        total: lineTotal,
      };
    });

    const subtotal = orderData.subtotal !== undefined ? Number(orderData.subtotal) : calculatedSubtotal;
    const discount = Number(orderData.discount) || 0;
    const totalAmount = Math.max(0, Number((subtotal - discount).toFixed(2)));

    const finalOrder = await Store.createOrder({
      ...orderData,
      items: processedItems,
      subtotal,
      discount,
      taxRate: 0,
      taxAmount: 0,
      totalAmount,
    });

    res.status(201).json({ success: true, message: 'Order created successfully', data: finalOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const updated = await Store.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const deleted = await Store.deleteOrder(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully', data: deleted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
