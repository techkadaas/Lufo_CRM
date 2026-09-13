import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { OrderStatusBadge } from './OrderStatusBadge';
import { EmptyState } from '../common/EmptyState';
import { DateRangeFilter } from '../common/DateRangeFilter';
import { Search, Eye, Trash2, Plus, ShoppingBag, MessageSquare } from 'lucide-react';

export const OrderList = () => {
  const { showToast, triggerRefresh, refreshKey, setIsCreateOrderOpen, setSelectedInvoiceOrder } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState({
    timeRange: 'this_month',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    fetchOrders();
  }, [search, statusFilter, dateFilter, refreshKey]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders({
        search,
        status: statusFilter,
        timeRange: dateFilter.timeRange,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
      });

      let currentOrders = res.success ? res.data : [];

      // Resilient local cache merge to preserve orders across production cold restarts
      try {
        const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_orders') || '[]');
        if (cached && cached.length > 0) {
          const serverIds = new Set(currentOrders.map((o) => o._id || o.billNumber));
          const missingLocals = cached.filter((c) => !serverIds.has(c._id || c.billNumber));
          
          if (missingLocals.length > 0) {
            currentOrders = [...missingLocals, ...currentOrders];
          }
        }
        if (currentOrders.length > 0) {
          localStorage.setItem('lufo_crm_cached_orders', JSON.stringify(currentOrders));
        }
      } catch (e) {}

      setOrders(currentOrders);
    } catch (err) {
      try {
        const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_orders') || '[]');
        if (cached && cached.length > 0) {
          setOrders(cached);
          return;
        }
      } catch (e) {}
      showToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        showToast(`Status updated to ${newStatus}`);
        // Update local cache
        try {
          const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_orders') || '[]');
          const updated = cached.map((o) => (o._id === orderId ? { ...o, status: newStatus } : o));
          localStorage.setItem('lufo_crm_cached_orders', JSON.stringify(updated));
        } catch (e) {}
        fetchOrders();
        triggerRefresh();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update order status', 'error');
    }
  };

  const handleDelete = async (orderId, billNumber) => {
    if (!window.confirm(`Delete order ${billNumber}?`)) return;

    try {
      const res = await api.deleteOrder(orderId);
      if (res.success) {
        showToast(`Order ${billNumber} deleted`);
        // Remove from local cache
        try {
          const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_orders') || '[]');
          const updated = cached.filter((o) => o._id !== orderId && o.billNumber !== billNumber);
          localStorage.setItem('lufo_crm_cached_orders', JSON.stringify(updated));
        } catch (e) {}
        fetchOrders();
        triggerRefresh();
      }
    } catch (err) {
      showToast('Failed to delete order', 'error');
    }
  };

  const statuses = ['All', 'Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

  return (
    <div className="space-y-4 max-w-6xl">
      {/* Search & Filter Toolbar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search orders, phone, customer, bill #..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 outline-none shadow-2xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Filter */}
          <DateRangeFilter
            value={dateFilter.timeRange}
            customRange={{
              startDate: dateFilter.startDate,
              endDate: dateFilter.endDate,
            }}
            onChange={(newFilter) => setDateFilter(newFilter)}
          />

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none shadow-2xs cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Statuses' : s}
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsCreateOrderOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Create Order</span>
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading orders...</div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="No orders found"
            description="Start by creating a new client order."
            actionText="Create Order"
            onAction={() => setIsCreateOrderOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left text-xs min-w-[580px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Bill #</th>
                  <th className="py-3 px-5">Customer</th>
                  <th className="py-3 px-5">Items</th>
                  <th className="py-3 px-5 text-right">Total</th>
                  <th className="py-3 px-5 text-center">Status</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="py-4 px-5 font-mono font-medium text-slate-900">
                      {order.billNumber}
                    </td>

                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-900">{order.customer?.name}</div>
                      <div className="text-[11px] text-slate-400">{order.customer?.phone}</div>
                    </td>

                    <td className="py-4 px-5 text-slate-600">
                      {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? 's' : ''}
                    </td>

                    <td className="py-4 px-5 text-right font-mono font-bold text-slate-900 text-sm">
                      ₹{(order.totalAmount || 0).toLocaleString()}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium outline-none cursor-pointer"
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            let phone = (order.customer?.phone || '').replace(/\D/g, '').replace(/^0+/, '');
                            if (phone.length === 10) phone = `91${phone}`;
                            const itemsText = (order.items || [])
                              .map(
                                (it, idx) =>
                                  `${idx + 1}. *${it.name}* (${it.size || 'M'}${it.color ? `, ${it.color}` : ''}) x ${it.quantity} = ₹${(it.total || 0).toLocaleString()}`
                              )
                              .join('\n');
                            const msg = `*LUFO CLOTHING — INVOICE ${order.billNumber}*\nDate: ${new Date(order.orderDate || order.createdAt).toLocaleDateString()}\nCustomer: ${order.customer?.name || ''}\n\n*ITEMS:*\n${itemsText}\n\n*Total Amount:* ₹${(order.totalAmount || 0).toLocaleString()}\nStatus: ${order.status}\n\nThank you for choosing LUFO Clothing!`;
                            const url = phone
                              ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
                              : `https://wa.me/?text=${encodeURIComponent(msg)}`;
                            window.open(url, '_blank');
                            showToast(`Opening WhatsApp chat with ${order.customer?.name || 'Customer'}...`);
                          }}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                          title="Share Invoice via WhatsApp"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="p-1.5 rounded-lg text-amber-700 hover:bg-amber-50 transition-colors"
                          title="View Bill"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(order._id, order.billNumber)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
