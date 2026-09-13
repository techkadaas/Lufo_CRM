import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { Modal } from '../common/Modal';
import {
  Plus,
  Trash2,
  Receipt,
  User,
  Phone,
  MapPin,
  Mail,
  Sparkles,
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  UserCheck,
  UserPlus,
  History,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const CreateOrderModal = ({ isOpen, onClose }) => {
  const { showToast, triggerRefresh, setSelectedInvoiceOrder } = useApp();
  const [loading, setLoading] = useState(false);
  const [stocksList, setStocksList] = useState([]);
  const [billNumber, setBillNumber] = useState('');

  // Customer State
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    email: '',
  });

  // Customer Verification & History State
  const [customerStatus, setCustomerStatus] = useState({
    checked: false,
    exists: false,
    loading: false,
    data: null,
  });
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);

  const [items, setItems] = useState([
    {
      stockId: '',
      name: '',
      sku: '',
      size: 'M',
      color: '',
      price: 0,
      quantity: 1,
      total: 0,
    },
  ]);

  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [paymentStatus, setPaymentStatus] = useState('Paid');
  const [notes, setNotes] = useState('');

  // Fetch stocks & Next bill number on open
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      const [billRes, stockRes] = await Promise.all([
        api.getNextBillNumber(),
        api.getStocks(),
      ]);
      if (billRes.success) setBillNumber(billRes.billNumber);
      if (stockRes.success) setStocksList(stockRes.data);
    } catch (err) {
      console.error('Error loading modal data:', err);
    }
  };

  // Lookup Customer by Phone Number (with debounce)
  useEffect(() => {
    const cleanDigits = customer.phone.replace(/\D/g, '');
    if (cleanDigits.length < 5) {
      setCustomerStatus({ checked: false, exists: false, loading: false, data: null });
      setShowPurchaseHistory(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setCustomerStatus((prev) => ({ ...prev, loading: true }));
        const res = await api.lookupCustomer(customer.phone);
        if (res.success && res.exists && res.data) {
          setCustomerStatus({
            checked: true,
            exists: true,
            loading: false,
            data: res.data,
          });
          // Auto-fill customer details from past records
          setCustomer((prev) => ({
            ...prev,
            name: res.data.customer?.name || prev.name,
            address: res.data.customer?.address || prev.address,
            email: res.data.customer?.email || prev.email,
          }));
        } else {
          setCustomerStatus({
            checked: true,
            exists: false,
            loading: false,
            data: null,
          });
          setShowPurchaseHistory(false);
        }
      } catch (err) {
        setCustomerStatus({ checked: true, exists: false, loading: false, data: null });
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [customer.phone]);

  const handleStockSelect = (index, selectedStockId) => {
    const selected = stocksList.find((s) => s._id === selectedStockId);
    const newItems = [...items];
    if (selected) {
      newItems[index] = {
        ...newItems[index],
        stockId: selected._id,
        name: selected.name,
        sku: selected.sku,
        size: selected.size,
        color: selected.color,
        price: selected.sellingPrice,
        quantity: 1,
        total: selected.sellingPrice,
      };
    } else {
      newItems[index] = {
        ...newItems[index],
        stockId: '',
      };
    }
    setItems(newItems);
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    if (field === 'price' || field === 'quantity') {
      const price = Number(newItems[index].price) || 0;
      const qty = Number(newItems[index].quantity) || 1;
      newItems[index].total = price * qty;
    }
    setItems(newItems);
  };

  const addItemRow = () => {
    setItems([
      ...items,
      {
        stockId: '',
        name: '',
        sku: '',
        size: 'M',
        color: '',
        price: 0,
        quantity: 1,
        total: 0,
      },
    ]);
  };

  const removeItemRow = (index) => {
    if (items.length === 1) return;
    setItems(items.filter((_, i) => i !== index));
  };

  // Computations
  const subtotal = items.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  const totalAmount = Math.max(0, Number((subtotal - (Number(discount) || 0)).toFixed(2)));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customer.phone.trim()) {
      showToast('Customer mobile number is required', 'warning');
      return;
    }

    if (!customer.name.trim()) {
      showToast('Please enter customer name', 'warning');
      return;
    }

    const validItems = items.filter((it) => it.name.trim() && it.price > 0);
    if (validItems.length === 0) {
      showToast('Please add at least one valid product with name and price', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        billNumber,
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim() || 'Store Direct Sale',
          email: customer.email.trim(),
        },
        items: validItems,
        subtotal,
        discount: Number(discount) || 0,
        taxRate: 0,
        taxAmount: 0,
        totalAmount,
        paymentMethod,
        paymentStatus,
        notes,
        status: 'Pending',
        orderDate: new Date().toISOString(),
      };

      const res = await api.createOrder(payload);
      if (res.success) {
        // Confetti celebration
        try {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch (e) {
          // Ignore
        }

        // Cache order in localStorage so it never disappears on production server restarts
        try {
          const cached = JSON.parse(localStorage.getItem('lufo_crm_cached_orders') || '[]');
          const updated = [res.data, ...cached.filter((o) => o.billNumber !== res.data.billNumber && o._id !== res.data._id)];
          localStorage.setItem('lufo_crm_cached_orders', JSON.stringify(updated));
        } catch (e) {}

        showToast(`Order & Bill ${res.data.billNumber} created successfully!`);
        triggerRefresh();
        onClose();
        // Prompt invoice preview
        setSelectedInvoiceOrder(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to create order', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Boutique Order"
      subtitle="Enter customer phone to auto-fetch history or register a new customer"
      maxWidth="max-w-4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bill Metadata Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-amber-700" />
            <div>
              <span className="text-xs text-amber-800 uppercase font-bold">Auto Bill Number</span>
              <div className="font-mono text-sm sm:text-base font-bold text-amber-900">
                {billNumber || 'Generating...'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">Payment Mode</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-amber-500 outline-none shadow-xs"
              >
                <option value="UPI">UPI / QR Code</option>
                <option value="Cash">Cash on Counter</option>
                <option value="Credit/Debit Card">Credit / Debit Card</option>
                <option value="Bank Transfer">Bank Wire Transfer</option>
                <option value="Store Credit">Store Credit</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-600 font-semibold block mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:border-amber-500 outline-none shadow-xs"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Information Section */}
        <div className="space-y-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-amber-600" /> Customer Information
            </h4>

            {/* Verification Status Indicator */}
            {customerStatus.loading && (
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking CRM records...
              </span>
            )}

            {!customerStatus.loading && customerStatus.checked && customerStatus.exists && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <UserCheck className="w-3 h-3" /> Existing CRM Customer
              </span>
            )}

            {!customerStatus.loading && customerStatus.checked && !customerStatus.exists && customer.phone.length >= 7 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <UserPlus className="w-3 h-3" /> New Customer
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. MOBILE NUMBER (Primary Input) */}
            <div>
              <label className="text-xs text-slate-700 block mb-1 font-semibold flex items-center justify-between">
                <span>
                  Customer Mobile Number <span className="text-rose-500">*</span>
                </span>
                <span className="text-[10px] text-slate-400 font-normal">Lookup past purchases</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="tel"
                  required
                  autoFocus
                  placeholder="e.g. 9876543210"
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-900 font-mono font-medium focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            {/* 2. CUSTOMER NAME (Auto-filled or entered for new client) */}
            <div>
              <label className="text-xs text-slate-700 block mb-1 font-semibold">
                Customer Name <span className="text-rose-500">*</span>
                {customerStatus.exists && (
                  <span className="text-emerald-600 font-normal text-[10px] ml-1.5">(Auto-filled)</span>
                )}
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Singhania"
                value={customer.name}
                onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400 shadow-2xs"
              />
            </div>
          </div>

          {/* Existing Customer Purchase History Badge & Toggle */}
          {customerStatus.exists && customerStatus.data && (
            <div className="mt-2 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-200/80 p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {(customerStatus.data.customer?.name || 'C').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => setShowPurchaseHistory(!showPurchaseHistory)}
                      className="text-xs font-bold text-slate-900 hover:text-amber-800 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
                    >
                      <span>{customerStatus.data.customer?.name}</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        ({customerStatus.data.totalOrders} total order{customerStatus.data.totalOrders > 1 ? 's' : ''})
                      </span>
                    </button>
                    <div className="text-[11px] font-semibold text-amber-900 flex items-center gap-1">
                      <span>Total Purchased:</span>
                      <span className="font-mono font-bold text-amber-700">
                        ₹{(customerStatus.data.totalPurchased || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowPurchaseHistory(!showPurchaseHistory)}
                  className="px-2.5 py-1 rounded-lg bg-white border border-amber-300/80 text-amber-900 hover:bg-amber-50 font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition-all cursor-pointer"
                >
                  <History className="w-3.5 h-3.5 text-amber-700" />
                  <span>{showPurchaseHistory ? 'Hide Purchases' : 'View Purchase History'}</span>
                  {showPurchaseHistory ? (
                    <ChevronUp className="w-3 h-3 text-amber-700" />
                  ) : (
                    <ChevronDown className="w-3 h-3 text-amber-700" />
                  )}
                </button>
              </div>

              {/* Collapsible Purchase History Table */}
              {showPurchaseHistory && customerStatus.data.orders && (
                <div className="mt-3 pt-3 border-t border-amber-200/60 animate-in fade-in duration-150">
                  <div className="text-[11px] font-bold text-slate-700 mb-2 flex items-center justify-between">
                    <span>Past Order History</span>
                    <span className="text-slate-400 font-normal">
                      Last Order: {new Date(customerStatus.data.lastOrderDate).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left text-[11px]">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                        <tr>
                          <th className="py-1.5 px-3">Bill #</th>
                          <th className="py-1.5 px-3">Date</th>
                          <th className="py-1.5 px-3 text-center">Items</th>
                          <th className="py-1.5 px-3 text-center">Status</th>
                          <th className="py-1.5 px-3 text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-slate-700">
                        {customerStatus.data.orders.map((ord) => (
                          <tr key={ord._id} className="hover:bg-slate-50/60">
                            <td className="py-2 px-3 font-mono font-medium text-slate-900">
                              {ord.billNumber}
                            </td>
                            <td className="py-2 px-3 text-slate-500">
                              {new Date(ord.orderDate).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 text-center text-slate-600">
                              {ord.itemsCount}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span
                                className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                                  ord.status === 'Delivered'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : ord.status === 'Cancelled'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {ord.status}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-right font-mono font-bold text-slate-900">
                              ₹{(ord.totalAmount || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Delivery Address & Email Accordion / Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs text-slate-600 block mb-1 font-semibold">
                Delivery / Billing Address <span className="text-slate-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={1}
                placeholder="Suite / Flat No., City, Pincode"
                value={customer.address}
                onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400 resize-none shadow-2xs"
              />
            </div>

            <div>
              <label className="text-xs text-slate-600 block mb-1 font-semibold">
                Email Address <span className="text-slate-400 font-normal">(Optional for E-Receipt)</span>
              </label>
              <input
                type="email"
                placeholder="customer@example.com"
                value={customer.email}
                onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:border-amber-500 focus:bg-white outline-none placeholder:text-slate-400 shadow-2xs"
              />
            </div>
          </div>
        </div>

        {/* Product Items Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Order Items & Stock Allocation
            </h4>
            <button
              type="button"
              onClick={addItemRow}
              className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg border border-amber-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>
          </div>

          <div className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3 min-w-[180px]">Item / Select From Stock</th>
                    <th className="py-2.5 px-3 w-28">SKU / Code</th>
                    <th className="py-2.5 px-3 w-20">Size</th>
                    <th className="py-2.5 px-3 w-24">Color</th>
                    <th className="py-2.5 px-3 w-24 text-right">Price (₹)</th>
                    <th className="py-2.5 px-3 w-16 text-center">Qty</th>
                    <th className="py-2.5 px-3 w-24 text-right">Total (₹)</th>
                    <th className="py-2.5 px-3 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, index) => (
                    <tr key={index} className="hover:bg-slate-50/50">
                      <td className="p-2">
                        {stocksList.length > 0 && (
                          <select
                            value={item.stockId || ''}
                            onChange={(e) => handleStockSelect(index, e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-800 font-medium mb-1.5 focus:border-amber-500 outline-none"
                          >
                            <option value="">-- Choose from live inventory --</option>
                            {stocksList.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name} ({s.size}, {s.color}) - ₹{s.sellingPrice} (Stock: {s.quantity})
                              </option>
                            ))}
                          </select>
                        )}
                        <input
                          type="text"
                          required
                          placeholder="Apparel Name..."
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-semibold focus:border-amber-500 outline-none placeholder:text-slate-400"
                        />
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="S-01"
                          value={item.sku}
                          onChange={(e) => handleItemChange(index, 'sku', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 font-mono focus:border-amber-500 outline-none placeholder:text-slate-400 uppercase"
                        />
                      </td>

                      <td className="p-2">
                        <select
                          value={item.size}
                          onChange={(e) => handleItemChange(index, 'size', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-xs text-slate-900 font-medium focus:border-amber-500 outline-none"
                        >
                          <option value="XS">XS</option>
                          <option value="S">S</option>
                          <option value="M">M</option>
                          <option value="L">L</option>
                          <option value="XL">XL</option>
                          <option value="XXL">XXL</option>
                          <option value="Free Size">Free</option>
                          <option value="Custom">Custom</option>
                        </select>
                      </td>

                      <td className="p-2">
                        <input
                          type="text"
                          placeholder="e.g. Navy"
                          value={item.color}
                          onChange={(e) => handleItemChange(index, 'color', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-slate-900 focus:border-amber-500 outline-none placeholder:text-slate-400"
                        />
                      </td>

                      <td className="p-2 text-right">
                        <input
                          type="number"
                          min="0"
                          required
                          value={item.price || ''}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs text-right text-slate-900 font-mono font-bold focus:border-amber-500 outline-none"
                        />
                      </td>

                      <td className="p-2 text-center">
                        <input
                          type="number"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-xs text-center text-slate-900 font-bold focus:border-amber-500 outline-none"
                        />
                      </td>

                      <td className="p-2 text-right font-mono font-bold text-slate-900 text-xs">
                        ₹{(item.total || 0).toLocaleString()}
                      </td>

                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={items.length === 1}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Order Notes & Bill Financials */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2 border-t border-slate-200">
          <div>
            <label className="text-xs text-slate-700 block mb-1 font-semibold">Special Instructions / Alteration Notes</label>
            <textarea
              rows={3}
              placeholder="e.g. Custom packaging, hem alterations, or gift message..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:border-amber-500 outline-none placeholder:text-slate-400 resize-none shadow-2xs"
            />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-700 font-medium">
              <span>Items Subtotal:</span>
              <span className="font-mono font-bold text-slate-900">₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="text-slate-700 font-medium">Discount (₹):</span>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(e.target.value)}
                className="w-24 bg-white border border-slate-300 rounded-lg px-2 py-1 text-right text-xs text-slate-900 font-bold focus:border-amber-500 outline-none"
              />
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold text-slate-900">
              <span className="text-amber-800 uppercase tracking-wider">Final Total:</span>
              <span className="font-mono text-lg text-amber-700">₹{totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto gold-gradient-btn px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'Creating...' : 'Create Order & Print Bill'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
