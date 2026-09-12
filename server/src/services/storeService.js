import { Stock } from '../models/Stock.js';
import { Order } from '../models/Order.js';
import { Expense } from '../models/Expense.js';
import { getDBStatus } from '../config/db.js';
import { initialStockData, initialExpenseData, initialOrderData } from '../utils/seeder.js';
import { getDateRange } from '../utils/dateHelper.js';

// In-memory fallback dataset
let memStocks = initialStockData.map((item, idx) => ({
  ...item,
  _id: `mem_stock_${idx + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let memExpenses = initialExpenseData.map((item, idx) => ({
  ...item,
  _id: `mem_exp_${idx + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

let memOrders = initialOrderData.map((item, idx) => ({
  ...item,
  _id: `mem_ord_${idx + 1}`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

export const Store = {
  // STOCKS
  async getStocks(filters = {}) {
    if (getDBStatus()) {
      const query = {};
      if (filters.search) {
        query.$or = [
          { name: { $regex: filters.search, $options: 'i' } },
          { sku: { $regex: filters.search, $options: 'i' } },
          { category: { $regex: filters.search, $options: 'i' } },
        ];
      }
      if (filters.category && filters.category !== 'All') {
        query.category = filters.category;
      }
      return await Stock.find(query).sort({ createdAt: -1 });
    }

    let result = [...memStocks];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(s) ||
          item.sku.toLowerCase().includes(s) ||
          item.category.toLowerCase().includes(s)
      );
    }
    if (filters.category && filters.category !== 'All') {
      result = result.filter((item) => item.category === filters.category);
    }
    return result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async getStockById(id) {
    if (getDBStatus()) {
      return await Stock.findById(id);
    }
    return memStocks.find((item) => item._id.toString() === id.toString());
  },

  async createStock(data) {
    if (getDBStatus()) {
      const newStock = new Stock(data);
      return await newStock.save();
    }
    const newStock = {
      ...data,
      _id: `mem_stock_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memStocks.unshift(newStock);
    return newStock;
  },

  async updateStock(id, data) {
    if (getDBStatus()) {
      return await Stock.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    const index = memStocks.findIndex((s) => s._id.toString() === id.toString());
    if (index === -1) return null;
    memStocks[index] = { ...memStocks[index], ...data, updatedAt: new Date().toISOString() };
    return memStocks[index];
  },

  async deleteStock(id) {
    if (getDBStatus()) {
      return await Stock.findByIdAndDelete(id);
    }
    const index = memStocks.findIndex((s) => s._id.toString() === id.toString());
    if (index === -1) return null;
    const deleted = memStocks.splice(index, 1);
    return deleted[0];
  },

  async adjustStockQuantity(id, adjustment, reason) {
    if (getDBStatus()) {
      const stock = await Stock.findById(id);
      if (!stock) return null;
      stock.quantity = Math.max(0, stock.quantity + adjustment);
      return await stock.save();
    }
    const index = memStocks.findIndex((s) => s._id.toString() === id.toString());
    if (index === -1) return null;
    memStocks[index].quantity = Math.max(0, memStocks[index].quantity + adjustment);
    memStocks[index].updatedAt = new Date().toISOString();
    return memStocks[index];
  },

  // ORDERS
  async getOrders(filters = {}) {
    const dateRange = getDateRange(filters);

    if (getDBStatus()) {
      const query = {};
      if (filters.search) {
        query.$or = [
          { billNumber: { $regex: filters.search, $options: 'i' } },
          { 'customer.name': { $regex: filters.search, $options: 'i' } },
          { 'customer.phone': { $regex: filters.search, $options: 'i' } },
        ];
      }
      if (filters.status && filters.status !== 'All') {
        query.status = filters.status;
      }
      if (dateRange) {
        query.orderDate = { $gte: dateRange.start, $lte: dateRange.end };
      }
      return await Order.find(query).sort({ orderDate: -1, createdAt: -1 });
    }

    let result = [...memOrders];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (o) =>
          o.billNumber.toLowerCase().includes(s) ||
          o.customer.name.toLowerCase().includes(s) ||
          o.customer.phone.toLowerCase().includes(s)
      );
    }
    if (filters.status && filters.status !== 'All') {
      result = result.filter((o) => o.status === filters.status);
    }
    if (dateRange) {
      result = result.filter((o) => {
        const d = new Date(o.orderDate || o.createdAt);
        return d >= dateRange.start && d <= dateRange.end;
      });
    }
    return result.sort((a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt));
  },

  async getOrderById(id) {
    if (getDBStatus()) {
      return await Order.findById(id);
    }
    return memOrders.find((o) => o._id.toString() === id.toString());
  },

  async getOrderByBillNumber(billNumber) {
    if (!billNumber) return null;
    if (getDBStatus()) {
      return await Order.findOne({ billNumber: billNumber.trim().toUpperCase() });
    }
    return memOrders.find(
      (o) => (o.billNumber || '').toUpperCase() === billNumber.trim().toUpperCase()
    );
  },

  async getCustomerByPhone(phone) {
    if (!phone) return null;
    const cleanDigits = phone.toString().replace(/\D/g, '');
    const cleanPhone = phone.toString().trim().toLowerCase();

    // Fetch all orders
    let allOrders = [];
    if (getDBStatus()) {
      allOrders = await Order.find().sort({ orderDate: -1, createdAt: -1 });
    } else {
      allOrders = [...memOrders].sort(
        (a, b) => new Date(b.orderDate || b.createdAt) - new Date(a.orderDate || a.createdAt)
      );
    }

    const customerOrders = allOrders.filter((o) => {
      if (!o.customer?.phone) return false;
      const orderPhoneDigits = o.customer.phone.toString().replace(/\D/g, '');
      const orderPhone = o.customer.phone.toString().trim().toLowerCase();

      if (cleanDigits.length >= 7 && orderPhoneDigits.length >= 7) {
        if (
          orderPhoneDigits.endsWith(cleanDigits) ||
          cleanDigits.endsWith(orderPhoneDigits)
        ) {
          return true;
        }
      }
      return orderPhone === cleanPhone || orderPhone.includes(cleanPhone);
    });

    if (customerOrders.length === 0) return null;

    const latestOrder = customerOrders[0];
    const totalPurchased = customerOrders
      .filter((o) => o.status !== 'Cancelled')
      .reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    return {
      exists: true,
      customer: {
        name: latestOrder.customer?.name || '',
        phone: latestOrder.customer?.phone || phone,
        address: latestOrder.customer?.address || '',
        email: latestOrder.customer?.email || '',
      },
      totalOrders: customerOrders.length,
      totalPurchased: Math.round(totalPurchased),
      lastOrderDate: latestOrder.orderDate || latestOrder.createdAt,
      orders: customerOrders.map((o) => ({
        _id: o._id,
        billNumber: o.billNumber,
        orderDate: o.orderDate || o.createdAt,
        totalAmount: o.totalAmount,
        status: o.status,
        itemsCount: (o.items || []).length,
      })),
    };
  },

  async createOrder(data) {
    // Deduct stock if items reference stock
    for (const item of data.items || []) {
      if (item.stockId) {
        await this.adjustStockQuantity(item.stockId, -item.quantity, `Order: ${data.billNumber}`);
      } else if (item.sku) {
        // Find stock by sku
        if (getDBStatus()) {
          const matchedStock = await Stock.findOne({ sku: item.sku });
          if (matchedStock) {
            matchedStock.quantity = Math.max(0, matchedStock.quantity - item.quantity);
            await matchedStock.save();
          }
        } else {
          const matchedStock = memStocks.find((s) => s.sku === item.sku);
          if (matchedStock) {
            matchedStock.quantity = Math.max(0, matchedStock.quantity - item.quantity);
          }
        }
      }
    }

    if (getDBStatus()) {
      const order = new Order(data);
      return await order.save();
    }
    const newOrder = {
      ...data,
      _id: `mem_ord_${Date.now()}`,
      orderDate: data.orderDate || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memOrders.unshift(newOrder);
    return newOrder;
  },

  async updateOrderStatus(id, status) {
    if (getDBStatus()) {
      const order = await Order.findById(id);
      if (!order) return null;

      // If cancelled, restock items
      if (status === 'Cancelled' && order.status !== 'Cancelled') {
        for (const item of order.items) {
          if (item.stockId) {
            await this.adjustStockQuantity(item.stockId, item.quantity, `Order Cancelled: ${order.billNumber}`);
          }
        }
      }
      order.status = status;
      return await order.save();
    }

    const order = memOrders.find((o) => o._id.toString() === id.toString());
    if (!order) return null;
    if (status === 'Cancelled' && order.status !== 'Cancelled') {
      for (const item of order.items) {
        if (item.stockId) {
          await this.adjustStockQuantity(item.stockId, item.quantity, `Order Cancelled: ${order.billNumber}`);
        }
      }
    }
    order.status = status;
    order.updatedAt = new Date().toISOString();
    return order;
  },

  async deleteOrder(id) {
    if (getDBStatus()) {
      return await Order.findByIdAndDelete(id);
    }
    const idx = memOrders.findIndex((o) => o._id.toString() === id.toString());
    if (idx === -1) return null;
    const removed = memOrders.splice(idx, 1);
    return removed[0];
  },

  // EXPENSES
  async getExpenses(filters = {}) {
    const dateRange = getDateRange(filters);

    if (getDBStatus()) {
      const query = {};
      if (filters.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: 'i' } },
          { category: { $regex: filters.search, $options: 'i' } },
          { receiptNumber: { $regex: filters.search, $options: 'i' } },
        ];
      }
      if (filters.category && filters.category !== 'All') {
        query.category = filters.category;
      }
      if (dateRange) {
        query.date = { $gte: dateRange.start, $lte: dateRange.end };
      }
      return await Expense.find(query).sort({ date: -1, createdAt: -1 });
    }

    let result = [...memExpenses];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(s) ||
          e.category.toLowerCase().includes(s) ||
          (e.receiptNumber && e.receiptNumber.toLowerCase().includes(s))
      );
    }
    if (filters.category && filters.category !== 'All') {
      result = result.filter((e) => e.category === filters.category);
    }
    if (dateRange) {
      result = result.filter((e) => {
        const d = new Date(e.date || e.createdAt);
        return d >= dateRange.start && d <= dateRange.end;
      });
    }
    return result.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
  },

  async createExpense(data) {
    if (getDBStatus()) {
      const expense = new Expense(data);
      return await expense.save();
    }
    const newExp = {
      ...data,
      _id: `mem_exp_${Date.now()}`,
      date: data.date || new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    memExpenses.unshift(newExp);
    return newExp;
  },

  async deleteExpense(id) {
    if (getDBStatus()) {
      return await Expense.findByIdAndDelete(id);
    }
    const idx = memExpenses.findIndex((e) => e._id.toString() === id.toString());
    if (idx === -1) return null;
    const removed = memExpenses.splice(idx, 1);
    return removed[0];
  },

  // DASHBOARD AGGREGATES
  async getDashboardAnalytics(filters = {}) {
    const orders = await this.getOrders(filters);
    const stocks = await this.getStocks();
    const expenses = await this.getExpenses(filters);
    const dateRange = getDateRange(filters);

    // Total Revenue (excluding cancelled orders)
    const validOrders = orders.filter((o) => o.status !== 'Cancelled');
    const totalRevenue = validOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);
    const totalOrders = orders.length;

    // Total Expenses
    const totalExpenseAmount = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);

    // Stock Analytics (current snapshot)
    const totalStockUnits = stocks.reduce((acc, s) => acc + (s.quantity || 0), 0);
    const totalStockCostValue = stocks.reduce((acc, s) => acc + (s.quantity || 0) * (s.costPrice || 0), 0);
    const totalStockRetailValue = stocks.reduce((acc, s) => acc + (s.quantity || 0) * (s.sellingPrice || 0), 0);
    const lowStockItems = stocks.filter((s) => s.quantity <= (s.lowStockThreshold || 5));

    // Net Profit Estimation
    const netProfit = totalRevenue - totalExpenseAmount;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : 0;

    // Monthly Trends (Past 6 Months mockup/real)
    const months = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
    const monthlyTrends = months.map((month, i) => {
      const baseRev = 45000 + i * 14000;
      const baseExp = 28000 + i * 5000;
      return {
        month,
        revenue: i === 5 ? Math.round(totalRevenue || 75000) : baseRev,
        expense: i === 5 ? Math.round(totalExpenseAmount || 38000) : baseExp,
        profit: (i === 5 ? totalRevenue : baseRev) - (i === 5 ? totalExpenseAmount : baseExp),
      };
    });

    // Category Sales breakdown
    const categorySales = {};
    validOrders.forEach((o) => {
      (o.items || []).forEach((it) => {
        const cat = it.category || 'Apparel';
        categorySales[cat] = (categorySales[cat] || 0) + (it.total || 0);
      });
    });

    // Expense Category Breakdown
    const expenseByCategory = {};
    expenses.forEach((e) => {
      expenseByCategory[e.category] = (expenseByCategory[e.category] || 0) + (e.amount || 0);
    });

    const expensePieData = Object.keys(expenseByCategory).map((cat) => ({
      name: cat,
      value: expenseByCategory[cat],
    }));

    return {
      overview: {
        totalRevenue: Math.round(totalRevenue),
        totalOrders,
        totalStockUnits,
        totalStockCostValue: Math.round(totalStockCostValue),
        totalStockRetailValue: Math.round(totalStockRetailValue),
        totalExpenseAmount: Math.round(totalExpenseAmount),
        netProfit: Math.round(netProfit),
        profitMargin: Number(profitMargin),
        lowStockCount: lowStockItems.length,
      },
      lowStockItems: lowStockItems.slice(0, 6),
      recentOrders: orders.slice(0, 5),
      monthlyTrends,
      expensePieData,
      activeFilter: dateRange ? dateRange.label : 'All Time',
    };
  },
};
