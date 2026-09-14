const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api`
  : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('lufo_crm_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // AUTH
  async login(username, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    return data;
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data;
  },

  async updateProfile(profileData) {
    const res = await fetch(`${API_BASE}/auth/update-me`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');
    return data;
  },

  async getUsers() {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
    return data;
  },

  async createUser(userData) {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create user');
    return data;
  },

  async updateUser(id, userData) {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update user');
    return data;
  },

  async deleteUser(id) {
    const res = await fetch(`${API_BASE}/auth/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete user');
    return data;
  },

  // DASHBOARD
  async getDashboardStats(params = {}) {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    const res = await fetch(`${API_BASE}/dashboard/stats${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return await res.json();
  },

  // ORDERS
  async getOrders(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/orders${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  },

  async getNextBillNumber() {
    const res = await fetch(`${API_BASE}/orders/next-bill-number`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to get bill sequence');
    return await res.json();
  },

  async lookupCustomer(phone) {
    const query = new URLSearchParams({ phone }).toString();
    const res = await fetch(`${API_BASE}/orders/customer-lookup?${query}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to lookup customer');
    return await res.json();
  },

  async createOrder(orderData) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create order');
    return data;
  },

  async updateOrderStatus(id, status) {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');
    return data;
  },

  async deleteOrder(id) {
    const res = await fetch(`${API_BASE}/orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete order');
    return data;
  },

  // STOCKS
  async getStocks(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/stocks${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch stock items');
    return await res.json();
  },

  async createStock(stockData) {
    const res = await fetch(`${API_BASE}/stocks`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(stockData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create stock item');
    return data;
  },

  async updateStock(id, stockData) {
    const res = await fetch(`${API_BASE}/stocks/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(stockData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update stock');
    return data;
  },

  async adjustStock(id, adjustment, reason) {
    const res = await fetch(`${API_BASE}/stocks/${id}/adjust`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ adjustment, reason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to adjust stock');
    return data;
  },

  async deleteStock(id) {
    const res = await fetch(`${API_BASE}/stocks/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete stock');
    return data;
  },

  // EXPENSES
  async getExpenses(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/expenses${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch expenses');
    return await res.json();
  },

  async createExpense(expenseData) {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(expenseData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record expense');
    return data;
  },

  async deleteExpense(id) {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete expense');
    return data;
  },

  // PARTNERS
  async getPartners(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/partners${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch partners');
    return await res.json();
  },

  async createPartner(partnerData) {
    const res = await fetch(`${API_BASE}/partners`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(partnerData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create partner');
    return data;
  },

  async updatePartner(id, partnerData) {
    const res = await fetch(`${API_BASE}/partners/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(partnerData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update partner');
    return data;
  },

  async deletePartner(id) {
    const res = await fetch(`${API_BASE}/partners/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete partner');
    return data;
  },

  // PARTNER INCOMES
  async getPartnerIncomes(params = {}) {
    const query = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/partners/incomes${query ? `?${query}` : ''}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch partner incomes');
    return await res.json();
  },

  async createPartnerIncome(incomeData) {
    const res = await fetch(`${API_BASE}/partners/incomes`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(incomeData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to record partner income');
    return data;
  },

  async deletePartnerIncome(id) {
    const res = await fetch(`${API_BASE}/partners/incomes/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to delete partner income entry');
    return data;
  },
};


