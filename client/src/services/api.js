const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

export const api = {
  // DASHBOARD
  async getDashboardStats(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/dashboard/stats${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return await res.json();
  },

  // ORDERS
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  },

  async getNextBillNumber() {
    const res = await fetch(`${API_BASE}/orders/next-bill-number`);
    if (!res.ok) throw new Error('Failed to get bill sequence');
    return await res.json();
  },

  async lookupCustomer(phone) {
    const query = new URLSearchParams({ phone }).toString();
    const res = await fetch(`${API_BASE}/orders/customer-lookup?${query}`);
    if (!res.ok) throw new Error('Failed to lookup customer');
    return await res.json();
  },

  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create order');
    return data;
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data;
  },

  async deleteOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete order');
    return data;
  },

  // STOCKS
  async getStocks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/stocks${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch stock items');
    return await res.json();
  },

  async createStock(stockData) {
    const res = await fetch(`${API_BASE}/stocks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create stock item');
    return data;
  },

  async updateStock(id, stockData) {
    const res = await fetch(`${API_BASE}/stocks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stockData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update stock');
    return data;
  },

  async adjustStock(id, adjustment, reason) {
    const res = await fetch(`${API_BASE}/stocks/${id}/adjust`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ adjustment, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to adjust stock');
    return data;
  },

  async deleteStock(id) {
    const res = await fetch(`${API_BASE}/stocks/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete stock');
    return data;
  },

  // EXPENSES
  async getExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/expenses${query ? `?${query}` : ''}`);
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return await res.json();
  },

  async createExpense(expenseData) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(expenseData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record expense');
    return data;
  },

  async deleteExpense(id) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete expense');
    return data;
  },
};
