import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import {
  User,
  Shield,
  KeyRound,
  UserPlus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Users,
  RefreshCw,
  Sparkles,
  Handshake,
  Plus,
  Search,
  DollarSign,
  TrendingUp,
  Wallet,
  Phone,
  Mail,
  ExternalLink,
  FileText,
  CreditCard,
  Building2,
} from 'lucide-react';
import { CreatePartnerModal } from '../components/partners/CreatePartnerModal';
import { AddPartnerIncomeModal } from '../components/partners/AddPartnerIncomeModal';
import { PartnerLedgerModal } from '../components/partners/PartnerLedgerModal';
import { EmptyState } from '../components/common/EmptyState';

export const SettingsPage = () => {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'team' | 'partners'

  // Profile Form State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileUsername, setProfileUsername] = useState(user?.username || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Team Management State
  const [usersList, setUsersList] = useState([]);
  const [teamStats, setTeamStats] = useState({ staffCount: 0, maxStaffAccounts: 3, availableSlots: 3 });
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Modal / Form for Team Member
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [memberName, setMemberName] = useState('');
  const [memberUsername, setMemberUsername] = useState('');
  const [memberPassword, setMemberPassword] = useState('');
  const [showMemberPass, setShowMemberPass] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Partner Management State (for Admins)
  const [partners, setPartners] = useState(() => {
    try {
      const saved = localStorage.getItem('lufo_crm_all_partners');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [incomes, setIncomes] = useState(() => {
    try {
      const saved = localStorage.getItem('lufo_crm_partner_incomes');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Partner Modals & Search State
  const [isAddPartnerOpen, setIsAddPartnerOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [isAddIncomeOpen, setIsAddIncomeOpen] = useState(false);
  const [selectedPartnerForIncome, setSelectedPartnerForIncome] = useState(null);
  const [selectedPartnerForLedger, setSelectedPartnerForLedger] = useState(null);
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatusFilter, setPartnerStatusFilter] = useState('All');

  const isAdmin = user?.role === 'admin';

  const fetchPartnersAndIncomes = async () => {
    try {
      const [partnersRes, incomesRes] = await Promise.all([
        api.getPartners(),
        api.getPartnerIncomes(),
      ]);

      let serverPartners = partnersRes.success ? (partnersRes.data || []) : [];
      let serverIncomes = incomesRes.success ? (incomesRes.data || []) : [];

      serverPartners = serverPartners.map((p) => ({ ...p, id: p._id || p.id, _id: p._id || p.id }));
      serverIncomes = serverIncomes.map((i) => ({ ...i, id: i._id || i.id, _id: i._id || i.id }));

      localStorage.setItem('lufo_crm_all_partners', JSON.stringify(serverPartners));
      localStorage.setItem('lufo_crm_partner_incomes', JSON.stringify(serverIncomes));

      setPartners(serverPartners);
      setIncomes(serverIncomes);
    } catch (e) {
      console.warn('Error fetching partners in Settings:', e);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchPartnersAndIncomes();
    }
  }, [isAdmin]);

  // Cross-component sync for partners & incomes
  useEffect(() => {
    const handleSync = () => {
      fetchPartnersAndIncomes();
    };
    window.addEventListener('lufo_partners_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('lufo_partners_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Partner Handlers
  const handleSavePartner = async (partnerData) => {
    try {
      if (editingPartner) {
        const id = editingPartner._id || editingPartner.id;
        const res = await api.updatePartner(id, partnerData);
        if (res.success) {
          showToast('Partner details updated successfully', 'success');
        }
      } else {
        const res = await api.createPartner(partnerData);
        if (res.success) {
          showToast(`Partner "${partnerData.name}" added successfully`, 'success');
        }
      }
      await fetchPartnersAndIncomes();
      window.dispatchEvent(new CustomEvent('lufo_partners_updated'));
    } catch (err) {
      showToast(err.message || 'Failed to save partner', 'error');
    }
    setEditingPartner(null);
    setIsAddPartnerOpen(false);
  };

  const handleDeletePartner = async (id, name) => {
    if (
      !window.confirm(
        `Are you sure you want to remove partner "${name}"? This will also remove their recorded capital/income entries.`
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

  const handleSaveIncome = async (incomeData) => {
    try {
      const res = await api.createPartnerIncome(incomeData);
      if (res.success) {
        const p = partners.find((x) => (x.id === incomeData.partnerId || x._id === incomeData.partnerId));
        showToast(
          `Recorded ₹${Number(incomeData.amount).toLocaleString()} from ${p ? p.name : 'Partner'}`,
          'success'
        );
        await fetchPartnersAndIncomes();
        window.dispatchEvent(new CustomEvent('lufo_partners_updated'));
      }
    } catch (err) {
      showToast(err.message || 'Failed to record partner income', 'error');
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
      showToast(err.message || 'Failed to delete income record', 'error');
    }
  };

  // Calculate stats for partner cards
  const totalPartnerCapital = incomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const partnersWithStats = partners.map((p) => {
    const partnerIncomes = incomes.filter((i) => i.partnerId === p.id);
    const totalAmount = partnerIncomes.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const sharePercent =
      totalPartnerCapital > 0 ? ((totalAmount / totalPartnerCapital) * 100).toFixed(1) : 0;
    const lastIncome = partnerIncomes.sort((a, b) => new Date(b.date) - new Date(a.date))[0];

    return {
      ...p,
      totalMoney: totalAmount,
      sharePercent: Number(sharePercent),
      entriesCount: partnerIncomes.length,
      lastIncomeDate: lastIncome ? lastIncome.date : null,
      lastIncomeAmount: lastIncome ? lastIncome.amount : null,
    };
  });

  const filteredPartners = partnersWithStats.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(partnerSearch.toLowerCase()) ||
      (p.role && p.role.toLowerCase().includes(partnerSearch.toLowerCase())) ||
      (p.phone && p.phone.toLowerCase().includes(partnerSearch.toLowerCase())) ||
      (p.email && p.email.toLowerCase().includes(partnerSearch.toLowerCase()));

    const matchesStatus =
      partnerStatusFilter === 'All' || p.status === partnerStatusFilter;

    return matchesSearch && matchesStatus;
  });

  // Load team users if Admin
  const fetchUsers = async () => {
    if (!isAdmin) return;
    try {
      setLoadingUsers(true);
      const res = await api.getUsers();
      if (res.success) {
        setUsersList(res.users);
        if (res.stats) {
          setTeamStats(res.stats);
        }
      }
    } catch (err) {
      showToast(err.message || 'Failed to load team users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]);

  useEffect(() => {
    if (user) {
      setProfileName(user.name || '');
      setProfileUsername(user.username || '');
    }
  }, [user]);

  // Handle Profile Update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileUsername.trim()) {
      showToast('Username cannot be empty', 'error');
      return;
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters long', 'error');
        return;
      }
      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match', 'error');
        return;
      }
    }

    try {
      setProfileLoading(true);
      const res = await api.updateProfile({
        name: profileName.trim(),
        username: profileUsername.trim(),
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (res.success) {
        updateCurrentUser(res.user, res.token);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        showToast('Profile & credentials updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  // Open Create Sub-user Modal
  const openCreateModal = () => {
    setEditingUser(null);
    setMemberName('');
    setMemberUsername('');
    setMemberPassword('');
    setIsAddUserModalOpen(true);
  };

  // Open Edit Sub-user Modal
  const openEditModal = (u) => {
    setEditingUser(u);
    setMemberName(u.name);
    setMemberUsername(u.username);
    setMemberPassword('');
    setIsAddUserModalOpen(true);
  };

  // Handle Create / Edit Sub-user
  const handleUserModalSubmit = async (e) => {
    e.preventDefault();
    if (!memberName.trim() || !memberUsername.trim()) {
      showToast('Name and username are required', 'error');
      return;
    }

    if (!editingUser && (!memberPassword || memberPassword.length < 6)) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    try {
      setModalLoading(true);
      if (editingUser) {
        const payload = {
          name: memberName.trim(),
          username: memberUsername.trim(),
        };
        if (memberPassword) payload.password = memberPassword;
        const res = await api.updateUser(editingUser._id, payload);
        if (res.success) {
          showToast('Team member updated successfully!', 'success');
          setIsAddUserModalOpen(false);
          fetchUsers();
        }
      } else {
        const res = await api.createUser({
          name: memberName.trim(),
          username: memberUsername.trim(),
          password: memberPassword,
          role: 'staff',
        });
        if (res.success) {
          showToast('Team member account created successfully!', 'success');
          setIsAddUserModalOpen(false);
          fetchUsers();
        }
      }
    } catch (err) {
      showToast(err.message || 'Operation failed', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Handle Delete Sub-user
  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"? This will free up 1 team slot.`)) {
      return;
    }
    try {
      const res = await api.deleteUser(id);
      if (res.success) {
        showToast(res.message || 'User deleted successfully', 'success');
        fetchUsers();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  const distinctGradients = [
    'from-amber-500 to-amber-700',
    'from-emerald-500 to-emerald-700',
    'from-indigo-500 to-indigo-700',
    'from-rose-500 to-rose-700',
    'from-sky-500 to-sky-700',
    'from-purple-500 to-purple-700',
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-600" />
            <span>Settings & Access Control</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your credentials, team member accounts, and business partner configurations.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap bg-slate-100/80 p-1 rounded-xl gap-1 shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>My Profile & Password</span>
          </button>

          {isAdmin && (
            <button
              onClick={() => setActiveTab('team')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'team'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Team Accounts ({teamStats.staffCount}/3)</span>
            </button>
          )}

          {isAdmin && (
            <button
              onClick={() => setActiveTab('partners')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'partners'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              <span>Partners Management ({partners.length})</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Profile & Password Management */}
      {activeTab === 'profile' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left card: Current Profile Summary */}
          <div className="lg:col-span-1 bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-amber-400 font-bold text-lg shadow-inner">
                  {user?.name ? user.name.slice(0, 2).toUpperCase() : 'LF'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{user?.name || 'Ahamed'}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider">
                      {user?.role || 'Admin'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">Active Session</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Current Username</span>
                  <span className="font-medium text-slate-800 font-mono">{user?.username}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50">
                  <span className="text-slate-400">Account Role</span>
                  <span className="font-medium text-slate-800 capitalize">{user?.role}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Access Level</span>
                  <span className="font-medium text-emerald-600 font-semibold">Full CRM Access</span>
                </div>
              </div>
            </div>

            <div className="mt-8 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  You can change your login username and password at any time. The new credentials will take effect immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Right card: Edit Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-slate-100 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-600" />
              <span>Update Credentials & Details</span>
            </h3>

            <form onSubmit={handleProfileSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username (Login ID)
                  </label>
                  <input
                    type="text"
                    value={profileUsername}
                    onChange={(e) => setProfileUsername(e.target.value)}
                    required
                    placeholder="e.g. ahamed@LufoClothing"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                  Change Password (Leave blank to keep unchanged)
                </h4>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Current Password (Optional verification)
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPass ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPass(!showCurrentPass)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPass ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPass(!showNewPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                        >
                          {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repeat new password"
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {profileLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tab 2: Team Accounts Management (Max 3 Users) */}
      {activeTab === 'team' && isAdmin && (
        <div className="space-y-6">
          {/* Slots Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Team Member Accounts</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  You can create and manage up to <strong className="text-slate-800">3 sub-user accounts</strong> for your team.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 px-3.5 py-1.5 rounded-xl text-amber-800 text-xs font-semibold">
                  <span>{teamStats.staffCount} / {teamStats.maxStaffAccounts} Slots Used</span>
                  <span className="text-[10px] text-amber-600">({teamStats.availableSlots} available)</span>
                </div>

                <button
                  onClick={openCreateModal}
                  disabled={teamStats.staffCount >= 3}
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Add Team Account</span>
                </button>
              </div>
            </div>

            {/* Visual Slot indicators */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {[0, 1, 2].map((idx) => {
                const staffUsers = usersList.filter((u) => u.role === 'staff');
                const slotUser = staffUsers[idx];
                return (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-xl border text-xs transition-all ${
                      slotUser
                        ? 'bg-amber-50/40 border-amber-200/80'
                        : 'bg-slate-50 border-dashed border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider">
                        Slot #{idx + 1}
                      </span>
                      {slotUser ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    {slotUser ? (
                      <div>
                        <div className="font-bold text-slate-900 truncate">{slotUser.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono truncate">{slotUser.username}</div>
                      </div>
                    ) : (
                      <div className="text-slate-400 font-medium">Empty Slot (Available)</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* User List Table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-sm">Active System Accounts</h4>
              <button
                onClick={fetchUsers}
                disabled={loadingUsers}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                title="Refresh user list"
              >
                <RefreshCw className={`w-4 h-4 ${loadingUsers ? 'animate-spin text-amber-600' : ''}`} />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3 px-5">User</th>
                    <th className="py-3 px-5">Username</th>
                    <th className="py-3 px-5">Role</th>
                    <th className="py-3 px-5">Status</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                  {usersList.map((u) => {
                    const isMasterAdmin = u.role === 'admin';
                    return (
                      <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-5 font-semibold text-slate-900 flex items-center gap-2.5">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isMasterAdmin
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.name.slice(0, 1).toUpperCase()}
                          </div>
                          <span>{u.name}</span>
                        </td>
                        <td className="py-3.5 px-5 font-mono text-slate-600">{u.username}</td>
                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${
                              isMasterAdmin
                                ? 'bg-slate-900 text-white'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-5">
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          {isMasterAdmin ? (
                            <span className="text-[11px] text-slate-400 italic">Master Account</span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => openEditModal(u)}
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                                title="Edit or Reset Password"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Delete User (Free slot)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Partner Accounts & Business Stakeholders */}
      {activeTab === 'partners' && isAdmin && (
        <div className="space-y-6">
          {/* Top KPI & Controls Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Handshake className="w-4 h-4 text-amber-600" />
                <span>Business Partners & Capital Stakeholders</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, configure, and manage business partners who contribute capital/funds for purchases and stock inventory.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setEditingPartner(null);
                  setIsAddPartnerOpen(true);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Partner</span>
              </button>
            </div>
          </div>

          {/* Partner KPIs Summary Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Partners
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  {partners.length}
                </span>
                <span className="text-[11px] text-slate-500">
                  {partners.filter((p) => p.status === 'Active').length} Active • {partners.filter((p) => p.status === 'Inactive').length} Inactive
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Total Capital Put In
                </span>
                <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
                  ₹{totalPartnerCapital.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {incomes.length} Capital Inflow Entries
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Quick Actions
                </span>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      if (partners.length === 0) {
                        showToast('Please add a partner first before adding capital', 'error');
                        return;
                      }
                      setSelectedPartnerForIncome(partners[0].id);
                      setIsAddIncomeOpen(true);
                    }}
                    className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Capital</span>
                  </button>
                  <a
                    href="#partners"
                    className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Ledger</span>
                  </a>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                placeholder="Search by name, role, phone, or email..."
                className="w-full pl-9 pr-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
              />
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs text-slate-400 font-medium">Status:</span>
              <div className="flex bg-slate-100/80 p-1 rounded-xl gap-1">
                {['All', 'Active', 'Inactive'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setPartnerStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      partnerStatusFilter === st
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Partner Cards List */}
          {filteredPartners.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-xs">
              <EmptyState
                icon={Handshake}
                title={partnerSearch ? 'No matching partners found' : 'No Business Partners Added Yet'}
                description={
                  partnerSearch
                    ? `No partners matched your search "${partnerSearch}". Try adjusting your filters.`
                    : 'Add partners to record their business capital contributions and manage partner shares.'
                }
                actionLabel={partnerSearch ? 'Clear Search' : 'Add First Partner'}
                onAction={
                  partnerSearch
                    ? () => setPartnerSearch('')
                    : () => {
                        setEditingPartner(null);
                        setIsAddPartnerOpen(true);
                      }
                }
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPartners.map((partner, idx) => {
                const gradient = distinctGradients[idx % distinctGradients.length];
                return (
                  <div
                    key={partner.id}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:border-amber-200 hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Top Row: Avatar & Status & Actions */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${gradient} text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0`}
                          >
                            {partner.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                              {partner.name}
                            </h4>
                            <span className="text-[11px] text-slate-500 font-medium block">
                              {partner.role || 'Business Partner'}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                            partner.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {partner.status || 'Active'}
                        </span>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1.5 py-2 text-xs text-slate-600 border-t border-slate-50">
                        {partner.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`tel:${partner.phone}`}
                              className="hover:text-amber-600 transition-colors font-mono text-[11px]"
                            >
                              {partner.phone}
                            </a>
                          </div>
                        )}
                        {partner.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <a
                              href={`mailto:${partner.email}`}
                              className="hover:text-amber-600 transition-colors text-[11px] truncate"
                            >
                              {partner.email}
                            </a>
                          </div>
                        )}
                        {partner.notes && (
                          <p className="text-[11px] text-slate-500 italic line-clamp-2 pt-1">
                            "{partner.notes}"
                          </p>
                        )}
                      </div>

                      {/* Financial / Capital summary */}
                      <div className="mt-3 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                            Capital Contributed
                          </span>
                          <span className="text-base font-bold font-mono text-slate-900">
                            ₹{partner.totalMoney.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                            Total Inflows
                          </span>
                          <span className="text-xs font-semibold text-amber-700">
                            {partner.entriesCount} Deposits
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedPartnerForIncome(partner.id);
                            setIsAddIncomeOpen(true);
                          }}
                          className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Record new capital inflow from this partner"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-600" />
                          <span>+ Money</span>
                        </button>
                        <button
                          onClick={() => setSelectedPartnerForLedger(partner)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer"
                          title="View Capital statement and ledger"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Ledger</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingPartner(partner);
                            setIsAddPartnerOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Partner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePartner(partner.id, partner.name)}
                          className="p-1.5 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Team User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingUser ? 'Edit Team Account' : 'Create Team Account'}
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none cursor-pointer"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleUserModalSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Full Name / Role Title
                </label>
                <input
                  type="text"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  placeholder="e.g. Sales Staff 1"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Username
                </label>
                <input
                  type="text"
                  value={memberUsername}
                  onChange={(e) => setMemberUsername(e.target.value)}
                  placeholder="e.g. staff1@LufoClothing"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  {editingUser ? 'Reset Password (Optional)' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showMemberPass ? 'text' : 'password'}
                    value={memberPassword}
                    onChange={(e) => setMemberPassword(e.target.value)}
                    placeholder={editingUser ? 'Leave blank to keep unchanged' : 'Min 6 characters'}
                    required={!editingUser}
                    className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-amber-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowMemberPass(!showMemberPass)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showMemberPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
                >
                  {modalLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUser ? 'Save Changes' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Partner Modal */}
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

      {/* Add Partner Income / Capital Modal */}
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

      {/* Partner Ledger Modal */}
      {selectedPartnerForLedger && (
        <PartnerLedgerModal
          isOpen={!!selectedPartnerForLedger}
          onClose={() => setSelectedPartnerForLedger(null)}
          partner={selectedPartnerForLedger}
          contributions={incomes}
          onDeleteContribution={handleDeleteIncome}
          onAddMoreMoney={(partnerId) => {
            setSelectedPartnerForLedger(null);
            setSelectedPartnerForIncome(partnerId);
            setIsAddIncomeOpen(true);
          }}
        />
      )}
    </div>
  );
};
