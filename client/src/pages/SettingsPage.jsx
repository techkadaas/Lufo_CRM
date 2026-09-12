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
} from 'lucide-react';

export const SettingsPage = () => {
  const { user, updateCurrentUser } = useAuth();
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'team'

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

  const isAdmin = user?.role === 'admin';

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
        // Update
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
        // Create
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

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-amber-600" />
            <span>Account & Access Management</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage your credentials, update your password, and administer team login credentials.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-100/80 p-1 rounded-xl shrink-0 self-start md:self-auto">
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
                  className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-xl font-semibold text-xs tracking-wide transition-all shadow-sm flex items-center gap-2 disabled:opacity-60"
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
                  className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
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
                                className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                                title="Edit or Reset Password"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
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

      {/* Add / Edit User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingUser ? 'Edit Team Account' : 'Create Team Account'}
              </h3>
              <button
                onClick={() => setIsAddUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
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
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showMemberPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-60"
                >
                  {modalLoading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingUser ? 'Save Changes' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
