import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  ShieldCheck,
  Building2,
  RefreshCw,
  Trash2,
  KeyRound,
  Eye,
  UserX,
  Phone,
  Mail,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { UserAccount, VerificationStatus, AccountStatus, ResidentType, UserRole } from '../../models/user';
import {
  fetchAdminUsersApi,
  updateUserStatusApi,
  resetUserAccessApi,
  deleteUserApi,
} from '../../api/authApi';

export const AdminUserManagementScreen: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBlockFilter, setSelectedBlockFilter] = useState<string>('All');
  const [selectedResidentTypeFilter, setSelectedResidentTypeFilter] = useState<string>('All');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');

  // User Profile Detail Modal
  const [selectedUserDetail, setSelectedUserDetail] = useState<UserAccount | null>(null);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    const res = await fetchAdminUsersApi();
    setLoading(false);
    if (res.success && res.users) {
      setUsers(res.users);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleUpdateStatus = async (
    userId: string,
    verificationStatus?: VerificationStatus,
    accountStatus?: AccountStatus,
    role?: UserRole
  ) => {
    const res = await updateUserStatusApi(userId, verificationStatus, accountStatus, role);
    if (res.success && res.user) {
      setActionNotice({ type: 'success', message: res.message });
      setUsers((prev) => prev.map((u) => (u.id === userId ? res.user! : u)));
      if (selectedUserDetail?.id === userId) {
        setSelectedUserDetail(res.user);
      }
    } else {
      setActionNotice({ type: 'error', message: res.message || 'Failed to update user.' });
    }
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleResetAccess = async (userId: string) => {
    if (window.confirm('Reset this resident password to default (SapanaPass@2026)?')) {
      const res = await resetUserAccessApi(userId, 'SapanaPass@2026');
      if (res.success) {
        setActionNotice({ type: 'success', message: res.message });
        loadUsers();
      } else {
        setActionNotice({ type: 'error', message: res.message });
      }
      setTimeout(() => setActionNotice(null), 5000);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (window.confirm(`Are you sure you want to permanently delete user account for "${name}"?`)) {
      const res = await deleteUserApi(userId);
      if (res.success) {
        setActionNotice({ type: 'success', message: `User ${name} deleted successfully.` });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
        if (selectedUserDetail?.id === userId) setSelectedUserDetail(null);
      } else {
        setActionNotice({ type: 'error', message: res.message });
      }
      setTimeout(() => setActionNotice(null), 4000);
    }
  };

  // Filter Users
  const filteredUsers = users.filter((u) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      u.fullName.toLowerCase().includes(query) ||
      u.email.toLowerCase().includes(query) ||
      u.mobileNumber.includes(query) ||
      u.flatNumber.toLowerCase().includes(query);

    const matchesBlock =
      selectedBlockFilter === 'All' || u.blockNumber.toLowerCase() === selectedBlockFilter.toLowerCase();

    const matchesResidentType =
      selectedResidentTypeFilter === 'All' || u.residentType === selectedResidentTypeFilter;

    const matchesStatus =
      selectedStatusFilter === 'All' ||
      (selectedStatusFilter === 'Pending Verification' && u.verificationStatus === 'Pending Verification') ||
      (selectedStatusFilter === 'Verified' && u.verificationStatus === 'Verified') ||
      (selectedStatusFilter === 'Rejected' && u.verificationStatus === 'Rejected') ||
      (selectedStatusFilter === 'Suspended' && u.accountStatus === 'Suspended');

    return matchesSearch && matchesBlock && matchesResidentType && matchesStatus;
  });

  const pendingCount = users.filter((u) => u.verificationStatus === 'Pending Verification').length;
  const verifiedCount = users.filter((u) => u.verificationStatus === 'Verified').length;
  const suspendedCount = users.filter((u) => u.accountStatus === 'Suspended').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Colony Committee Admin Control</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Resident & User Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Verify new flat registrations, manage access credentials, and audit society member accounts.
            </p>
          </div>

          <button
            onClick={loadUsers}
            className="self-start md:self-auto bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center space-x-2 transition shadow-lg"
          >
            <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Directory ({users.length})</span>
          </button>
        </div>
      </div>

      {/* Action Notice */}
      {actionNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-lg ${
            actionNotice.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/50 text-rose-300'
          }`}
        >
          <span>{actionNotice.message}</span>
          <button onClick={() => setActionNotice(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-md">
          <div className="text-xs text-slate-400 font-medium">Total Registered Users</div>
          <div className="text-2xl font-extrabold text-white mt-1 font-mono">{users.length}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Sapana Park CHS Database</div>
        </div>

        <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl shadow-md bg-amber-500/5">
          <div className="text-xs text-amber-300 font-medium">Pending Verification</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">{pendingCount}</div>
          <div className="text-[10px] text-amber-300/70 mt-0.5">Requires Committee Approval</div>
        </div>

        <div className="bg-slate-900 border border-emerald-500/30 p-4 rounded-2xl shadow-md bg-emerald-500/5">
          <div className="text-xs text-emerald-300 font-medium">Verified Residents</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{verifiedCount}</div>
          <div className="text-[10px] text-emerald-300/70 mt-0.5">Active Directory Access</div>
        </div>

        <div className="bg-slate-900 border border-rose-500/30 p-4 rounded-2xl shadow-md bg-rose-500/5">
          <div className="text-xs text-rose-300 font-medium">Suspended Accounts</div>
          <div className="text-2xl font-extrabold text-rose-400 mt-1 font-mono">{suspendedCount}</div>
          <div className="text-[10px] text-rose-300/70 mt-0.5">Blocked from Portal</div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, mobile, flat..."
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-emerald-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>

          {/* Filters Grid */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Block Filter */}
            <select
              value={selectedBlockFilter}
              onChange={(e) => setSelectedBlockFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Blocks / Wings</option>
              <option value="Wing A">Wing A</option>
              <option value="Wing B">Wing B</option>
              <option value="Wing C">Wing C</option>
              <option value="Wing D">Wing D</option>
            </select>

            {/* Resident Type Filter */}
            <select
              value={selectedResidentTypeFilter}
              onChange={(e) => setSelectedResidentTypeFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Resident Types</option>
              <option value="Owner">Owner</option>
              <option value="Tenant">Tenant</option>
              <option value="Family Member">Family Member</option>
              <option value="Shop Owner">Shop Owner</option>
            </select>

            {/* Verification Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Statuses</option>
              <option value="Pending Verification">Pending Verification</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Registered Colony Accounts ({filteredUsers.length})</span>
          </h3>
          <span className="text-xs text-slate-400">Sapana Park CHS Directory</span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <UserX className="w-10 h-10 mx-auto text-slate-600" />
            <p className="text-sm font-semibold text-slate-300">No users match your filter criteria.</p>
            <p className="text-xs">Try adjusting your search query or dropdown filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-slate-400 uppercase font-mono text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Resident</th>
                  <th className="p-3.5">Flat & Block</th>
                  <th className="p-3.5">Type & Role</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5">Account Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/50 transition">
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        {user.profilePhoto ? (
                          <img
                            src={user.profilePhoto}
                            alt={user.fullName}
                            className="w-8 h-8 rounded-full border border-slate-700 object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center font-bold">
                            {user.fullName.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-white flex items-center space-x-1.5">
                            <span>{user.fullName}</span>
                            {user.authProvider === 'Google' && (
                              <span className="text-[9px] bg-sky-500/20 text-sky-300 px-1 rounded font-mono">
                                Google
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="font-mono font-bold text-emerald-400">{user.flatNumber}</div>
                      <div className="text-[10px] text-slate-400">
                        {user.blockNumber} • Floor {user.floorNumber}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span className="inline-block bg-slate-800 border border-slate-700 text-slate-300 px-2 py-0.5 rounded text-[11px] font-medium">
                        {user.residentType}
                      </span>
                      {user.role !== 'Resident' && (
                        <div className="text-[10px] font-mono text-amber-300 font-bold mt-1">
                          ★ {user.role}
                        </div>
                      )}
                    </td>

                    <td className="p-3.5 space-y-0.5 text-[11px]">
                      <div className="flex items-center space-x-1 text-slate-300">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[140px]">{user.email}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-slate-400 font-mono">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>{user.mobileNumber}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      {user.verificationStatus === 'Verified' ? (
                        <span className="inline-flex items-center space-x-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-2 py-1 rounded-lg text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Verified</span>
                        </span>
                      ) : user.verificationStatus === 'Pending Verification' ? (
                        <span className="inline-flex items-center space-x-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-lg text-[10px] font-bold animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Pending Verification</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 bg-rose-500/10 border border-rose-500/30 text-rose-400 px-2 py-1 rounded-lg text-[10px] font-bold">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </td>

                    <td className="p-3.5">
                      {user.accountStatus === 'Active' ? (
                        <span className="text-emerald-400 font-mono text-[11px] font-bold">Active</span>
                      ) : (
                        <span className="text-rose-400 font-mono text-[11px] font-bold">Suspended</span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedUserDetail(user)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-300 p-1.5 rounded-lg transition"
                          title="View Full Profile Details"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                        </button>

                        {/* Verify Button */}
                        {user.verificationStatus !== 'Verified' && (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Verified', 'Active')}
                            className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1"
                            title="Approve & Verify Resident"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Verify</span>
                          </button>
                        )}

                        {/* Reject Button */}
                        {user.verificationStatus === 'Pending Verification' && (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Rejected')}
                            className="bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 px-2 py-1 rounded-lg text-[10px] font-bold transition flex items-center space-x-1"
                            title="Reject Registration Request"
                          >
                            <XCircle className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        )}

                        {/* Suspend / Activate Button */}
                        {user.accountStatus === 'Active' ? (
                          <button
                            onClick={() => handleUpdateStatus(user.id, undefined, 'Suspended')}
                            className="bg-slate-800 hover:bg-slate-700 text-rose-400 p-1.5 rounded-lg transition border border-slate-700"
                            title="Suspend Account Access"
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(user.id, 'Verified', 'Active')}
                            className="bg-emerald-600/20 text-emerald-300 p-1.5 rounded-lg transition border border-emerald-500/40"
                            title="Activate Account Access"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Reset Password */}
                        <button
                          onClick={() => handleResetAccess(user.id)}
                          className="bg-slate-800 hover:bg-slate-700 text-amber-400 p-1.5 rounded-lg transition border border-slate-700"
                          title="Reset Password to Default"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete User */}
                        <button
                          onClick={() => handleDeleteUser(user.id, user.fullName)}
                          className="bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg transition border border-slate-700"
                          title="Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Full User Profile Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center space-x-3">
                {selectedUserDetail.profilePhoto ? (
                  <img
                    src={selectedUserDetail.profilePhoto}
                    alt={selectedUserDetail.fullName}
                    className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-emerald-600/30 text-emerald-300 border-2 border-emerald-500 flex items-center justify-center text-lg font-bold">
                    {selectedUserDetail.fullName.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedUserDetail.fullName}</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    {selectedUserDetail.colonyName} • Flat {selectedUserDetail.flatNumber}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedUserDetail(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60">
                <div>
                  <span className="text-slate-400 text-[10px]">Verification Status</span>
                  <div className="font-bold text-white mt-0.5">{selectedUserDetail.verificationStatus}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Account Status</span>
                  <div className="font-bold text-white mt-0.5">{selectedUserDetail.accountStatus}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Resident Type</span>
                  <div className="font-bold text-emerald-400 mt-0.5">{selectedUserDetail.residentType}</div>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px]">Committee Role</span>
                  <div className="font-bold text-amber-300 mt-0.5">{selectedUserDetail.role}</div>
                </div>
              </div>

              <div className="space-y-2 bg-slate-800/40 p-3 rounded-2xl border border-slate-800">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email Address:</span>
                  <span className="text-white font-mono">{selectedUserDetail.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile Number:</span>
                  <span className="text-white font-mono">{selectedUserDetail.mobileNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Block / Wing:</span>
                  <span className="text-white">{selectedUserDetail.blockNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Floor Number:</span>
                  <span className="text-white">{selectedUserDetail.floorNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Method:</span>
                  <span className="text-sky-300 font-bold">{selectedUserDetail.authProvider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Registration Date:</span>
                  <span className="text-slate-300 font-mono">
                    {new Date(selectedUserDetail.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
                {selectedUserDetail.verificationStatus !== 'Verified' && (
                  <button
                    onClick={() => handleUpdateStatus(selectedUserDetail.id, 'Verified', 'Active')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Verify</span>
                  </button>
                )}

                <button
                  onClick={() => setSelectedUserDetail(null)}
                  className="bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
