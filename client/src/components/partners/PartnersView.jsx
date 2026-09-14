import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import {
  Handshake,
  Plus,
  Search,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  Users,
  Wallet,
  Calendar,
  FileText,
  CreditCard,
  ArrowUpRight,
  PieChart,
  ShoppingBag,
  ExternalLink,
  Phone,
  Mail,
  Receipt,
  Eye,
  Loader2,
} from 'lucide-react';
import { CreatePartnerModal } from './CreatePartnerModal';
import { AddPartnerIncomeModal } from './AddPartnerIncomeModal';
import { PartnerLedgerModal } from './PartnerLedgerModal';
import { EmptyState } from '../common/EmptyState';

export const PartnersView = () => {
  const { showToast } = useApp();

  // Active view tab: 'summary' (Partner Cards & Contributions) | 'ledger' (All Transactions History)
  const [activeTab, setActiveTab] = useState('summary');
  const [loading, setLoading] = useState(true);

  const [partners, setPartners] = useState([]);
  const [incomes, setIncomes] = useState([]);

  // Fetch partners and partner incomes from server
  const fetchPartnersAndIncomes = useCallback(async () => {
    try {
      setLoading(true);
      const [partnersRes, incomesRes] = await Promise.all([
        api.getPartners(),
        api.getPartnerIncomes(),
      ]);

      let serverPartners = partnersRes.success ? (partnersRes.data || []) : [];
      let serverIncomes = incomesRes.success ? (incomesRes.data || []) : [];

      // Normalize IDs
      serverPartners = serverPartners.map((p) => ({ ...p, id: p._id || p.id, _id: p._id || p.id }));
      serverIncomes = serverIncomes.map((i) => ({ ...i, id: i._id || i.id, _id: i._id || i.id }));

      localStorage.setItem('lufo_crm_all_partners', JSON.stringify(serverPartners));
      localStorage.setItem('lufo_crm_partner_incomes', JSON.stringify(serverIncomes));

      setPartners(serverPartners);
      setIncomes(serverIncomes);
    } catch (err) {
      console.error('Failed to load partners data:', err);
      showToast('Failed to load partners data from server', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchPartnersAndIncomes();
  }, [fetchPartnersAndIncomes]);

  // Modal states
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);

  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [selectedPartnerForIncome, setSelectedPartnerForIncome] = useState(null);

  const [selectedPartnerForLedger, setSelectedPartnerForLedger] = useState(null);

  // Search & Filters
  const [partnerSearch, setPartnerSearch] = useState('');
  const [incomeSearch, setIncomeSearch] = useState('');
  const [partnerFilterForIncome, setPartnerFilterForIncome] = useState('All');

  // --- Handlers for Partner Management ---
  const handleSavePartner = async (partnerData) => {
    try {
      if (editingPartner) {
        const id = editingPartner.id || editingPartner._id;
        const res = await api.updatePartner(id, partnerData);
        if (res.success) {
          showToast('Partner details updated successfully', 'success');
          await fetchPartnersAndIncomes();
          window.dispatchEvent(new CustomEvent('lufo_partners_updated'));
        }
      } else {
        const res = await api.createPartner(partnerData);
        if (res.success) {
          showToast('New partner added successfully', 'success');
          await fetchPartnersAndIncomes();
          window.dispatchEvent(new CustomEvent('lufo_partners_updated'));
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to save partner', 'error');
    }
    setEditingPartner(null);
  };

  const handleDeletePartner = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to remove partner "${name}"? This will also remove their recorded income entries.`
      )
    )
      return;

    try {
      const res = await api.deletePartner(id);
      if (res.success) {
        showToast(`Partner "${name}" and their records removed`, 'success');
        const updatedPartners = partners.filter((p) => (p.id || p._id)?.toString() !== id.toString());
        const updatedIncomes = incomes.filter((i) => (i.partnerId || '').toString() !== id.toString());
        setPartners(updatedPartners);
        setIncomes(updatedIncomes);
        localStorage.setItem('lufo_crm_all_partners', JSON.stringify(updatedPartners));
        localStorage.setItem('lufo_crm_partner_incomes', JSON.stringify(updatedIncomes));
        window.dispatchEvent(new CustomEvent('lufo_partners_updated'));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete partner', 'error');
    }
  };

  // --- Handlers for Income / Capital Contribution Entries ---
  const handleSaveIncome = async (incomeData) => {
    try {
      const res = await api.createPartnerIncome(incomeData);
      if (res.success) {
        const partner = partners.find((p) => (p.id || p._id)?.toString() === (incomeData.partnerId)?.toString());
        showToast(
          `Recorded ₹${Number(incomeData.amount).toLocaleString()} from ${partner ? partner.name : 'Partner'}`,
          'success'
        );
        await fetchPartnersAndIncomes();
        window.dispatchEvent(new CustomEvent('lufo_partners_updated'));
      }
    } catch (err) {
      showToast(err.message || 'Failed to record income', 'error');
    }
  };

  const handleDeleteIncome = async (id, amount) => {
    if (!window.confirm(`Delete income record of ₹${(amount || 0).toLocaleString()}?`)) return;
    try {
      const res = await api.deletePartnerIncome(id);
      if (res.success) {
        showToast('Income entry deleted', 'success');
        const updatedIncomes = incomes.filter((i) => (i.id || i._id)?.toString() !== id.toString());
        setIncomes(updatedIncomes);
        localStorage.setItem('lufo_crm_partner_incomes', JSON.stringify(updatedIncomes));
        window.dispatchEvent(new CustomEvent('lufo_partners_updated'));
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete income entry', 'error');
    }
  };

  // --- Calculations ---
  const totalMoneyContributed = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  // Calculate each partner's total money put in
  const partnersWithStats = partners.map((p) => {
    const pId = (p.id || p._id)?.toString();
    const partnerIncomes = incomes.filter((i) => (i.partnerId || '').toString() === pId);
    const totalAmount = partnerIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const sharePercent =
      totalMoneyContributed > 0 ? ((totalAmount / totalMoneyContributed) * 100).toFixed(1) : 0;
    const lastIncome = partnerIncomes.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))[0];

    return {
      ...p,
      id: pId,
      _id: pId,
      totalMoney: totalAmount,
      sharePercent: Number(sharePercent),
      entriesCount: partnerIncomes.length,
      lastIncomeDate: lastIncome ? (lastIncome.date || lastIncome.createdAt) : null,
      lastIncomeAmount: lastIncome ? lastIncome.amount : null,
    };
  });

  // Top contributor
  const topPartner = [...partnersWithStats].sort((a, b) => b.totalMoney - a.totalMoney)[0];

  // Filtered partners
  const filteredPartners = partnersWithStats.filter((p) => {
    const search = partnerSearch.toLowerCase().trim();
    if (!search) return true;
    const matchesSearch =
      (p.name || '').toLowerCase().includes(search) ||
      (p.role && p.role.toLowerCase().includes(search)) ||
      (p.phone && p.phone.toLowerCase().includes(search)) ||
      (p.email && p.email.toLowerCase().includes(search));
    return matchesSearch;
  });

  // Filtered incomes for ledger
  const filteredIncomes = incomes.filter((inc) => {
    const incPartnerId = (inc.partnerId || '').toString();
    const partner = partners.find((p) => (p.id || p._id)?.toString() === incPartnerId);
    const partnerName = partner ? partner.name : '';
    const search = incomeSearch.toLowerCase().trim();
    const matchesSearch =
      !search ||
      partnerName.toLowerCase().includes(search) ||
      (inc.purpose && inc.purpose.toLowerCase().includes(search)) ||
      (inc.paymentMode && inc.paymentMode.toLowerCase().includes(search)) ||
      (inc.referenceNo && inc.referenceNo.toLowerCase().includes(search));
    const matchesPartner =
      partnerFilterForIncome === 'All' || incPartnerId === partnerFilterForIncome.toString();
    return matchesSearch && matchesPartner;
  });

  const distinctColors = [
    'bg-amber-500',
    'bg-emerald-500',
    'bg-indigo-500',
    'bg-rose-500',
    'bg-sky-500',
    'bg-purple-500',
    'bg-teal-500',
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Hero KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Total Partner Capital Put In */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Partner Capital Put In
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              ₹{totalMoneyContributed.toLocaleString()}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Used for fabric & inventory purchases</span>
          </div>
        </div>

        {/* Total Partners */}
        <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Total Partners
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 font-mono">
              {partners.length}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
            <span>{partners.filter((p) => p.status === 'Active').length} Active Partners</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('summary')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'summary'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Partners & Capital Put In</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === 'summary'
                  ? 'bg-slate-800 text-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {partners.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'ledger'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>All Income / Deposit History</span>
            <span
              className={`px-1.5 py-0.5 rounded-md text-[10px] ${
                activeTab === 'ledger'
                  ? 'bg-slate-800 text-amber-300'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {incomes.length}
            </span>
          </button>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingPartner(null);
              setIsAddPartnerOpen(true);
            }}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Add Partner</span>
          </button>
          <button
            onClick={() => {
              setSelectedPartnerForIncome(null);
              setIsAddIncomeOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Partner Income</span>
          </button>
        </div>
      </div>

      {/* Loading state indicator */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="ml-2 text-xs font-medium text-slate-500">Loading partners data...</span>
        </div>
      )}

      {/* ======================= TAB 1: ALL PARTNERS & CAPITAL SUMMARY ======================= */}
      {!loading && activeTab === 'summary' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search partners by name, role, phone..."
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 outline-none shadow-2xs"
              />
            </div>
          </div>

          {/* Partner Cards Grid */}
          {filteredPartners.length === 0 ? (
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs">
              <EmptyState
                icon={Users}
                title="No partners added"
                description="Add business partners and record the income/capital they contribute for purchases."
                actionText="Add Partner"
                onAction={() => {
                  setEditingPartner(null);
                  setIsAddPartnerOpen(true);
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartners.map((p, idx) => {
                const color = distinctColors[idx % distinctColors.length];

                return (
                  <div
                    key={p.id || p._id}
                    className="bg-white border border-slate-100 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-amber-200 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Header */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-900 text-amber-400 font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">
                            {p.name
                              .split(' ')
                              .map((n) => n[0])
                              .slice(0, 2)
                              .join('')
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-slate-900 truncate">{p.name}</h4>
                            <p className="text-[11px] text-slate-400 truncate">{p.role || 'Partner'}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>

                      {/* Financial Calculation Box: Total Money Put In */}
                      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 mb-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] uppercase font-semibold text-slate-400">
                            Total Capital Put In
                          </span>
                          <span className="text-xs font-bold font-mono text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                            {p.sharePercent}% of pool
                          </span>
                        </div>

                        <div className="text-xl font-bold font-mono text-slate-900">
                          ₹{p.totalMoney.toLocaleString()}
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                          <span>{p.entriesCount} Deposits</span>
                          {p.lastIncomeDate && (
                            <span className="text-slate-400">
                              Last: {new Date(p.lastIncomeDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Notes / Purpose */}
                      {p.notes && (
                        <p className="text-[11px] text-slate-500 line-clamp-2 mb-3 bg-white p-2 rounded-lg border border-slate-100">
                          {p.notes}
                        </p>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-1 text-[11px] text-slate-500 mb-4">
                        {p.phone && (
                          <div className="flex items-center gap-2 truncate">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{p.phone}</span>
                          </div>
                        )}
                        {p.email && (
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a href={`mailto:${p.email}`} className="hover:text-amber-600 truncate">
                              {p.email}
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Card Action Buttons */}
                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPartnerForIncome(p.id || p._id);
                            setIsAddIncomeOpen(true);
                          }}
                          className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer border border-emerald-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Money</span>
                        </button>

                        <button
                          onClick={() => setSelectedPartnerForLedger(p)}
                          className="flex-1 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold py-1.5 px-2.5 rounded-xl flex items-center justify-center gap-1 transition-colors cursor-pointer border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-500" />
                          <span>View Statement</span>
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <button
                          onClick={() => {
                            setEditingPartner(p);
                            setIsAddPartnerOpen(true);
                          }}
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDeletePartner(p.id || p._id, p.name)}
                          className="text-xs font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 p-1 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ======================= TAB 2: ALL INCOME / DEPOSIT LEDGER ======================= */}
      {!loading && activeTab === 'ledger' && (
        <div className="space-y-4">
          {/* Filter and Search Bar for Ledger */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search by partner name, purpose, payment mode, ref..."
                value={incomeSearch}
                onChange={(e) => setIncomeSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-amber-600 outline-none shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={partnerFilterForIncome}
                onChange={(e) => setPartnerFilterForIncome(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none shadow-2xs cursor-pointer"
              >
                <option value="All">All Partners</option>
                {partners.map((p) => (
                  <option key={p.id || p._id} value={p.id || p._id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Income Entries Table */}
          <div className="rounded-2xl border border-slate-100 bg-white overflow-hidden shadow-xs">
            {filteredIncomes.length === 0 ? (
              <EmptyState
                icon={Receipt}
                title="No income records found"
                description="Record the money put in by partners to fund fabric and inventory purchases."
                actionText="Add Partner Income"
                onAction={() => {
                  setSelectedPartnerForIncome(null);
                  setIsAddIncomeOpen(true);
                }}
              />
            ) : (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-xs min-w-[620px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                      <th className="py-3 px-5">Date</th>
                      <th className="py-3 px-5">Partner Name</th>
                      <th className="py-3 px-5">Intended Purchase / Usage Purpose</th>
                      <th className="py-3 px-5">Payment Method</th>
                      <th className="py-3 px-5 text-right">Amount Put In</th>
                      <th className="py-3 px-5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {filteredIncomes.map((inc) => {
                      const partner = partners.find((p) => (p.id || p._id)?.toString() === (inc.partnerId)?.toString());

                      return (
                        <tr key={inc.id || inc._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3.5 px-5 text-slate-400 whitespace-nowrap">
                            {new Date(inc.date || inc.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>

                          <td className="py-3.5 px-5">
                            <div className="font-bold text-slate-900">
                              {partner ? partner.name : 'Unknown Partner'}
                            </div>
                            {partner && partner.role && (
                              <div className="text-[10px] text-slate-400">{partner.role}</div>
                            )}
                          </td>

                          <td className="py-3.5 px-5">
                            <div className="font-semibold text-slate-800">{inc.purpose}</div>
                            {inc.referenceNo && (
                              <div className="text-[10px] font-mono text-slate-400">
                                Ref: {inc.referenceNo}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-5 text-slate-500 font-medium">
                            {inc.paymentMode}
                          </td>

                          <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-600 text-sm">
                            ₹{(inc.amount || 0).toLocaleString()}
                          </td>

                          <td className="py-3.5 px-5 text-right">
                            <button
                              onClick={() => handleDeleteIncome(inc.id || inc._id, inc.amount)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete entry"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddPartnerOpen && (
        <CreatePartnerModal
          isOpen={isAddPartnerOpen}
          onClose={() => {
            setIsAddPartnerOpen(false);
            setEditingPartner(null);
          }}
          onSave={handleSavePartner}
          editingPartner={editingPartner}
        />
      )}

      {isAddIncomeOpen && (
        <AddPartnerIncomeModal
          isOpen={isAddIncomeOpen}
          onClose={() => {
            setIsAddIncomeOpen(false);
            setSelectedPartnerForIncome(null);
          }}
          partners={partners}
          defaultPartnerId={selectedPartnerForIncome}
          onSaveIncome={handleSaveIncome}
        />
      )}

      {selectedPartnerForLedger && (
        <PartnerLedgerModal
          isOpen={!!selectedPartnerForLedger}
          onClose={() => setSelectedPartnerForLedger(null)}
          partner={selectedPartnerForLedger}
          contributions={incomes}
          onDeleteContribution={handleDeleteIncome}
          onAddMoreMoney={(pId) => {
            setSelectedPartnerForIncome(pId);
            setIsAddIncomeOpen(true);
          }}
        />
      )}
    </div>
  );
};
