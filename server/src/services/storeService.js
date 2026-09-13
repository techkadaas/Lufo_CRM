import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { Stock } from '../models/Stock.js';
import { Order } from '../models/Order.js';
import { Expense } from '../models/Expense.js';
import { User } from '../models/User.js';
import { getDBStatus } from '../config/db.js';
import { initialStockData, initialExpenseData, initialOrderData } from '../utils/seeder.js';
import { getDateRange } from '../utils/dateHelper.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORE_DIR = path.join(__dirname, '..', 'store');
const USERS_FILE = path.join(STORE_DIR, 'users_store.json');
const STOCKS_FILE = path.join(STORE_DIR, 'stocks_store.json');
const EXPENSES_FILE = path.join(STORE_DIR, 'expenses_store.json');
const ORDERS_FILE = path.join(STORE_DIR, 'orders_store.json');

// Ensure store directory exists
if (!fs.existsSync(STORE_DIR)) {
  try {
    fs.mkdirSync(STORE_DIR, { recursive: true });
  } catch (e) {}
}

// Load or initialize fallback users
const loadFallbackUsers = () => {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading fallback users file:', err.message);
  }

  // Default initial admin
  const salt = bcrypt.genSaltSync(10);
  const defaultAdmin = {
    _id: 'user_admin_master',
    name: 'Ahamed (Admin)',
    username: 'ahamed@lufoclothing',
    password: bcrypt.hashSync('ahamed@lufo0987', salt),
    role: 'admin',
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify([defaultAdmin], null, 2), 'utf8');
  } catch (e) {}

  return [defaultAdmin];
};

let memUsers = loadFallbackUsers();

const saveFallbackUsers = () => {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(memUsers, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving fallback users:', err.message);
  }
};

// Load or initialize fallback stocks
const loadFallbackStocks = () => {
  try {
    if (fs.existsSync(STOCKS_FILE)) {
      const data = fs.readFileSync(STOCKS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading fallback stocks file:', err.message);
  }

  const initial = initialStockData.map((item, idx) => ({
    ...item,
    _id: `mem_stock_${idx + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  try {
    fs.writeFileSync(STOCKS_FILE, JSON.stringify(initial, null, 2), 'utf8');
  } catch (e) {}

  return initial;
};

let memStocks = loadFallbackStocks();

const saveFallbackStocks = () => {
  try {
    fs.writeFileSync(STOCKS_FILE, JSON.stringify(memStocks, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving fallback stocks:', err.message);
  }
};

// Load or initialize fallback expenses
const loadFallbackExpenses = () => {
  try {
    if (fs.existsSync(EXPENSES_FILE)) {
      const data = fs.readFileSync(EXPENSES_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading fallback expenses file:', err.message);
  }

  const initial = initialExpenseData.map((item, idx) => ({
    ...item,
    _id: `mem_exp_${idx + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(initial, null, 2), 'utf8');
  } catch (e) {}

  return initial;
};

let memExpenses = loadFallbackExpenses();

const saveFallbackExpenses = () => {
  try {
    fs.writeFileSync(EXPENSES_FILE, JSON.stringify(memExpenses, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving fallback expenses:', err.message);
  }
};

// Load or initialize fallback orders
const loadFallbackOrders = () => {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Error reading fallback orders file:', err.message);
  }

  const initial = initialOrderData.map((item, idx) => ({
    ...item,
    _id: `mem_ord_${idx + 1}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }));

  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(initial, null, 2), 'utf8');
  } catch (e) {}

  return initial;
};

let memOrders = loadFallbackOrders();

const saveFallbackOrders = () => {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(memOrders, null, 2), 'utf8');
  } catch (err) {
    console.warn('Error saving fallback orders:', err.message);
  }
};


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
    saveFallbackStocks();
    return newStock;
  },

  async updateStock(id, data) {
    if (getDBStatus()) {
      return await Stock.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }
    const index = memStocks.findIndex((s) => s._id.toString() === id.toString());
    if (index === -1) return null;
    memStocks[index] = { ...memStocks[index], ...data, updatedAt: new Date().toISOString() };
    saveFallbackStocks();
    return memStocks[index];
  },

  async deleteStock(id) {
    if (getDBStatus()) {
      return await Stock.findByIdAndDelete(id);
    }
    const index = memStocks.findIndex((s) => s._id.toString() === id.toString());
    if (index === -1) return null;
    const deleted = memStocks.splice(index, 1);
    saveFallbackStocks();
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
    saveFallbackStocks();
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
    saveFallbackOrders();
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
    saveFallbackOrders();
    return order;
  },

  async deleteOrder(id) {
    if (getDBStatus()) {
      return await Order.findByIdAndDelete(id);
    }
    const idx = memOrders.findIndex((o) => o._id.toString() === id.toString());
    if (idx === -1) return null;
    const removed = memOrders.splice(idx, 1);
    saveFallbackOrders();
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
    saveFallbackExpenses();
    return newExp;
  },

  async deleteExpense(id) {
    if (getDBStatus()) {
      return await Expense.findByIdAndDelete(id);
    }
    const idx = memExpenses.findIndex((e) => e._id.toString() === id.toString());
    if (idx === -1) return null;
    const removed = memExpenses.splice(idx, 1);
    saveFallbackExpenses();
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

    // Monthly Trends (Past 6 Months from real data)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        year: d.getFullYear(),
        monthNum: d.getMonth(),
      });
    }

    const monthlyTrends = months.map(({ name, year, monthNum }) => {
      const monthOrders = validOrders.filter((o) => {
        const d = new Date(o.orderDate || o.createdAt);
        return d.getFullYear() === year && d.getMonth() === monthNum;
      });
      const monthExpenses = expenses.filter((e) => {
        const d = new Date(e.date || e.createdAt);
        return d.getFullYear() === year && d.getMonth() === monthNum;
      });

      const rev = monthOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      const exp = monthExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      return {
        month: name,
        revenue: Math.round(rev),
        expense: Math.round(exp),
        profit: Math.round(rev - exp),
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

  // USERS & AUTH
  async getUserByUsername(username) {
    const cleanUsername = (username || '').trim().toLowerCase();
    if (getDBStatus()) {
      try {
        const user = await User.findOne({ username: cleanUsername });
        if (user) return user;
      } catch (e) {
        console.warn('DB getUserByUsername fallback:', e.message);
      }
    }
    return memUsers.find((u) => u.username.toLowerCase() === cleanUsername) || null;
  },

  async getUserById(id) {
    if (getDBStatus()) {
      try {
        const user = await User.findById(id).select('-password');
        if (user) return user;
      } catch (e) {
        console.warn('DB getUserById fallback:', e.message);
      }
    }
    const mem = memUsers.find((u) => u._id.toString() === id.toString());
    if (mem) {
      const { password, ...safeUser } = mem;
      return safeUser;
    }
    return null;
  },

  async getUserByIdWithPassword(id) {
    if (getDBStatus()) {
      try {
        const user = await User.findById(id);
        if (user) return user;
      } catch (e) {
        console.warn('DB getUserByIdWithPassword fallback:', e.message);
      }
    }
    return memUsers.find((u) => u._id.toString() === id.toString()) || null;
  },

  async getUsers() {
    if (getDBStatus()) {
      try {
        const users = await User.find({}).select('-password').sort({ role: 1, createdAt: -1 });
        if (users && users.length > 0) return users;
      } catch (e) {
        console.warn('DB getUsers fallback:', e.message);
      }
    }
    return memUsers.map(({ password, ...u }) => u);
  },

  async countStaffUsers() {
    if (getDBStatus()) {
      try {
        return await User.countDocuments({ role: 'staff' });
      } catch (e) {
        console.warn('DB countStaffUsers fallback:', e.message);
      }
    }
    return memUsers.filter((u) => u.role === 'staff').length;
  },

  async createUser(data) {
    const cleanUsername = data.username.trim().toLowerCase();
    let createdUser = null;

    if (getDBStatus()) {
      try {
        const newUser = await User.create({
          ...data,
          username: cleanUsername,
        });
        createdUser = newUser.toObject();
        delete createdUser.password;
      } catch (e) {
        console.warn('DB createUser fallback:', e.message);
      }
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);
    const fallbackUser = {
      _id: createdUser ? createdUser._id.toString() : `user_${Date.now()}`,
      name: data.name.trim(),
      username: cleanUsername,
      password: hashedPassword,
      role: data.role === 'admin' ? 'admin' : 'staff',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    memUsers.push(fallbackUser);
    saveFallbackUsers();

    if (createdUser) return createdUser;
    const { password, ...safe } = fallbackUser;
    return safe;
  },

  async updateUser(id, data) {
    let updatedSafe = null;

    if (getDBStatus()) {
      try {
        const user = await User.findById(id);
        if (user) {
          if (data.name) user.name = data.name.trim();
          if (data.username) user.username = data.username.trim().toLowerCase();
          if (data.password) user.password = data.password;
          if (typeof data.isActive === 'boolean') user.isActive = data.isActive;
          if (data.role) user.role = data.role;
          await user.save();
          updatedSafe = user.toObject();
          delete updatedSafe.password;
        }
      } catch (e) {
        console.warn('DB updateUser fallback:', e.message);
      }
    }

    const idx = memUsers.findIndex((u) => u._id.toString() === id.toString());
    if (idx !== -1) {
      if (data.name) memUsers[idx].name = data.name.trim();
      if (data.username) memUsers[idx].username = data.username.trim().toLowerCase();
      if (typeof data.isActive === 'boolean') memUsers[idx].isActive = data.isActive;
      if (data.role) memUsers[idx].role = data.role;
      if (data.password) {
        const salt = await bcrypt.genSalt(10);
        memUsers[idx].password = await bcrypt.hash(data.password, salt);
      }
      memUsers[idx].updatedAt = new Date().toISOString();
      saveFallbackUsers();

      if (!updatedSafe) {
        const { password, ...safe } = memUsers[idx];
        updatedSafe = safe;
      }
    }

    return updatedSafe;
  },

  async deleteUser(id) {
    if (getDBStatus()) {
      try {
        await User.findByIdAndDelete(id);
      } catch (e) {
        console.warn('DB deleteUser fallback:', e.message);
      }
    }

    const idx = memUsers.findIndex((u) => u._id.toString() === id.toString());
    if (idx !== -1) {
      memUsers.splice(idx, 1);
      saveFallbackUsers();
    }
    return true;
  },

  async comparePassword(user, enteredPassword) {
    if (user && typeof user.comparePassword === 'function') {
      return await user.comparePassword(enteredPassword);
    }
    if (user && user.password) {
      return await bcrypt.compare(enteredPassword, user.password);
    }
    return false;
  },
};

