import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  Bell,
  Calendar,
  Wrench,
  IndianRupee,
  Shield,
  FileText,
  Sliders,
  Activity,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Lock,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Pin,
  Clock,
  Send,
  UserCheck,
} from 'lucide-react';
import { AdminUserManagementScreen } from './AdminUserManagementScreen';

export const AdminControlPanelScreen: React.FC = () => {
  const [activeAdminTab, setActiveAdminTab] = useState<
    | 'dashboard'
    | 'users'
    | 'colony'
    | 'notices'
    | 'events'
    | 'complaints'
    | 'maintenance'
    | 'security'
    | 'documents'
    | 'control-center'
    | 'roles'
    | 'audit-logs'
  >('dashboard');

  // State notice feedback
  const [adminNotice, setAdminNotice] = useState<string | null>(null);

  // Colony Management State
  const [colonyDetails, setColonyDetails] = useState({
    name: 'Sapana Park CHS Ltd.',
    registrationNo: 'HSG-452-GOA-2004',
    address: "Chogm Road, Near O'Coqueiro Junction, Porvorim, Goa - 403521",
    blocksCount: 4,
    totalFlats: 120,
    officeTimings: 'Mon-Sat: 09:00 AM - 06:00 PM (Lunch 1:00-2:00 PM)',
    emergencyHelpline: '+91 98221 00000',
    presidentName: 'Shri V. S. Rane',
    secretaryName: 'Rajesh Naik',
    treasurerName: 'Anjali Deshmukh',
  });

  // Application Control Center Feature Switches
  const [featureSwitches, setFeatureSwitches] = useState({
    enableEvents: true,
    enableComplaints: true,
    enableMaintenance: true,
    enableVisitorManagement: true,
    enablePolls: true,
    enableGallery: true,
    enableDocuments: true,
    enableChat: true,
    enableNotifications: true,
  });

  // Notice Management State
  const [notices, setNotices] = useState([
    {
      id: 'NOT-101',
      title: 'Annual General Body Meeting (AGM) 2026',
      audience: 'All Residents',
      date: '2026-08-15',
      pinned: true,
      status: 'Published',
      author: 'Secretary',
    },
    {
      id: 'NOT-102',
      title: 'Water Supply Line Maintenance Shutdown',
      audience: 'All Residents',
      date: '2026-08-12',
      pinned: true,
      status: 'Published',
      author: 'Estate Manager',
    },
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeAudience, setNewNoticeAudience] = useState('All Residents');

  // Event Management State
  const [events, setEvents] = useState([
    {
      id: 'EVT-01',
      title: 'Ganesh Chaturthi Cultural Evening & Aarti',
      date: '2026-09-02',
      time: '06:30 PM Onwards',
      location: 'Community Clubhouse',
      registrations: 42,
      status: 'Published',
    },
  ]);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDate, setNewEventDate] = useState('');

  // Complaint Management State
  const [adminComplaints, setAdminComplaints] = useState([
    {
      id: 'CMP-201',
      resident: 'Ramesh Sawant (A-102)',
      category: 'Plumbing',
      title: 'Main riser pipe leakage in A-wing shaft',
      assignedTo: 'Mahesh Plumbing Services',
      status: 'In Progress',
    },
    {
      id: 'CMP-202',
      resident: 'Pooja Hegde (B-304)',
      category: 'Electrical',
      title: 'Clubhouse corridor lights flickering',
      assignedTo: 'Unassigned',
      status: 'New',
    },
  ]);

  // Roles & Permissions Matrix
  const [rolePermissions, setRolePermissions] = useState([
    { feature: 'User Management', superAdmin: true, admin: true, resident: false, security: false },
    { feature: 'Publish Notices', superAdmin: true, admin: true, resident: false, security: false },
    { feature: 'Create Complaints', superAdmin: true, admin: true, resident: true, security: false },
    { feature: 'Visitor Gate Entry', superAdmin: true, admin: true, resident: true, security: true },
    { feature: 'App Control Center', superAdmin: true, admin: false, resident: false, security: false },
  ]);

  // Audit Logs State
  const [auditLogs] = useState([
    { id: 'LOG-881', user: 'Secretary (Rajesh Naik)', action: 'Approved Resident Registration (B-101)', timestamp: '2026-08-10 10:15 AM' },
    { id: 'LOG-880', user: 'Treasurer (Anjali Deshmukh)', action: 'Issued August 2026 Maintenance Receipts', timestamp: '2026-08-09 04:30 PM' },
    { id: 'LOG-879', user: 'Super Admin', action: 'Updated Feature Switch: Enable Polls = True', timestamp: '2026-08-08 02:10 PM' },
  ]);

  const showNotice = (msg: string) => {
    setAdminNotice(msg);
    setTimeout(() => setAdminNotice(null), 3500);
  };

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoticeTitle.trim()) return;
    const created = {
      id: `NOT-${Date.now().toString().slice(-3)}`,
      title: newNoticeTitle,
      audience: newNoticeAudience,
      date: new Date().toISOString().split('T')[0],
      pinned: false,
      status: 'Published',
      author: 'Admin',
    };
    setNotices([created, ...notices]);
    setNewNoticeTitle('');
    showNotice('New Society Circular Notice published successfully!');
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;
    const created = {
      id: `EVT-${Date.now().toString().slice(-3)}`,
      title: newEventTitle,
      date: newEventDate || '2026-08-25',
      time: '05:00 PM',
      location: 'Main Lawn',
      registrations: 0,
      status: 'Published',
    };
    setEvents([created, ...events]);
    setNewEventTitle('');
    setNewEventDate('');
    showNotice('Community Event published successfully!');
  };

  const toggleFeature = (key: keyof typeof featureSwitches) => {
    setFeatureSwitches((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      showNotice(`Feature switch "${String(key)}" set to ${updated[key] ? 'ENABLED' : 'DISABLED'}`);
      return updated;
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 py-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-emerald-950 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-bold mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Sapana Park CHS • Managing Committee</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Application Control Panel
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Complete administrative authority over users, society notices, events, maintenance, and app feature switches.
            </p>
          </div>
        </div>
      </div>

      {adminNotice && (
        <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold rounded-2xl flex items-center justify-between shadow-lg">
          <span>{adminNotice}</span>
          <button onClick={() => setAdminNotice(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Admin Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 p-2 rounded-2xl shadow-md overflow-x-auto no-scrollbar">
        <div className="flex space-x-1 min-w-max">
          {[
            { id: 'dashboard', label: 'Overview', icon: Activity },
            { id: 'users', label: 'User Directory', icon: Users },
            { id: 'colony', label: 'Colony Setup', icon: Building2 },
            { id: 'notices', label: 'Notices', icon: Bell },
            { id: 'events', label: 'Events', icon: Calendar },
            { id: 'complaints', label: 'Complaints', icon: Wrench },
            { id: 'maintenance', label: 'Finance', icon: IndianRupee },
            { id: 'security', label: 'Gate Security', icon: Shield },
            { id: 'documents', label: 'Documents', icon: FileText },
            { id: 'control-center', label: 'Control Center', icon: Sliders },
            { id: 'roles', label: 'Roles Matrix', icon: ShieldCheck },
            { id: 'audit-logs', label: 'Audit Logs', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeAdminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveAdminTab(tab.id as any)}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW DASHBOARD */}
      {activeAdminTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Total Registered Users</div>
              <div className="text-2xl font-extrabold text-white mt-1 font-mono">128</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">102 Verified Owners</div>
            </div>
            <div className="bg-slate-900 border border-amber-500/30 p-4 rounded-2xl bg-amber-500/5">
              <div className="text-xs text-amber-300">Pending User Approvals</div>
              <div className="text-2xl font-extrabold text-amber-400 mt-1 font-mono">2</div>
              <div className="text-[10px] text-amber-300/70 mt-0.5">Requires Verification</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">August Maintenance Collection</div>
              <div className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">₹2,88,000</div>
              <div className="text-[10px] text-slate-400 mt-0.5">82% Recovery Rate</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
              <div className="text-xs text-slate-400">Active Complaints</div>
              <div className="text-2xl font-extrabold text-sky-400 mt-1 font-mono">3</div>
              <div className="text-[10px] text-slate-400 mt-0.5">1 Unassigned</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Bell className="w-4 h-4 text-emerald-400" />
                <span>Active Society Notices</span>
              </h3>
              <div className="space-y-2">
                {notices.map((n) => (
                  <div key={n.id} className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 text-xs flex justify-between items-center">
                    <div>
                      <div className="font-bold text-white">{n.title}</div>
                      <div className="text-[10px] text-slate-400">{n.audience} • {n.date}</div>
                    </div>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                      {n.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Activity className="w-4 h-4 text-sky-400" />
                <span>Recent Admin Activity</span>
              </h3>
              <div className="space-y-2 text-xs">
                {auditLogs.map((log) => (
                  <div key={log.id} className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 flex justify-between">
                    <div>
                      <div className="font-bold text-slate-200">{log.action}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{log.user}</div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">{log.timestamp.split(' ')[1]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER DIRECTORY MANAGEMENT */}
      {activeAdminTab === 'users' && <AdminUserManagementScreen />}

      {/* TAB 3: COLONY MANAGEMENT */}
      {activeAdminTab === 'colony' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>Society Configuration Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 block mb-1">Society Name</label>
              <input
                type="text"
                value={colonyDetails.name}
                onChange={(e) => setColonyDetails({ ...colonyDetails, name: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Registration No.</label>
              <input
                type="text"
                value={colonyDetails.registrationNo}
                onChange={(e) => setColonyDetails({ ...colonyDetails, registrationNo: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-slate-400 block mb-1">Address</label>
              <input
                type="text"
                value={colonyDetails.address}
                onChange={(e) => setColonyDetails({ ...colonyDetails, address: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Office Timings</label>
              <input
                type="text"
                value={colonyDetails.officeTimings}
                onChange={(e) => setColonyDetails({ ...colonyDetails, officeTimings: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Emergency Helpline</label>
              <input
                type="text"
                value={colonyDetails.emergencyHelpline}
                onChange={(e) => setColonyDetails({ ...colonyDetails, emergencyHelpline: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 font-mono"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => showNotice('Colony profile configuration updated successfully!')}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
          >
            Save Colony Settings
          </button>
        </div>
      )}

      {/* TAB 4: NOTICE MANAGEMENT */}
      {activeAdminTab === 'notices' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateNotice} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Create & Publish Notice</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newNoticeTitle}
                  onChange={(e) => setNewNoticeTitle(e.target.value)}
                  placeholder="Notice Title (e.g. Lift Maintenance Schedule)"
                  required
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs"
                />
              </div>
              <select
                value={newNoticeAudience}
                onChange={(e) => setNewNoticeAudience(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs"
              >
                <option value="All Residents">All Residents</option>
                <option value="Owners">Flat Owners</option>
                <option value="Tenants">Tenants</option>
                <option value="Security">Security Staff</option>
              </select>
            </div>
            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
              Publish Notice
            </button>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-white font-mono">Published Circulars ({notices.length})</h4>
            {notices.map((n) => (
              <div key={n.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{n.title}</div>
                  <div className="text-[10px] text-slate-400">Target: {n.audience} • Date: {n.date}</div>
                </div>
                <button
                  onClick={() => {
                    setNotices(notices.filter((item) => item.id !== n.id));
                    showNotice('Notice deleted.');
                  }}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: EVENT MANAGEMENT */}
      {activeAdminTab === 'events' && (
        <div className="space-y-4">
          <form onSubmit={handleCreateEvent} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Publish Society Event</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                value={newEventTitle}
                onChange={(e) => setNewEventTitle(e.target.value)}
                placeholder="Event Name (e.g. Diwali Rangoli Competition)"
                required
                className="bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs"
              />
              <input
                type="date"
                value={newEventDate}
                onChange={(e) => setNewEventDate(e.target.value)}
                required
                className="bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs"
              />
            </div>
            <button type="submit" className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-xs font-bold transition">
              Publish Event
            </button>
          </form>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
            <h4 className="text-xs font-bold text-white font-mono">Active Colony Events</h4>
            {events.map((e) => (
              <div key={e.id} className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/60 text-xs flex justify-between items-center">
                <div>
                  <div className="font-bold text-white">{e.title}</div>
                  <div className="text-[10px] text-slate-400">{e.date} • {e.location} • {e.registrations} Residents Registered</div>
                </div>
                <button
                  onClick={() => {
                    setEvents(events.filter((item) => item.id !== e.id));
                    showNotice('Event deleted.');
                  }}
                  className="text-rose-400 p-1"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: APPLICATION CONTROL CENTER */}
      {activeAdminTab === 'control-center' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Super Admin Feature Switches</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Enable or disable specific features across the resident portal instantly. Disabled modules are automatically hidden.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 divide-y sm:divide-y-0 divide-slate-800">
            {[
              { key: 'enableEvents', title: 'Events & Cultural Calendar' },
              { key: 'enableComplaints', title: 'Resident Helpdesk & Complaints' },
              { key: 'enableMaintenance', title: 'Maintenance Bills & Online Payments' },
              { key: 'enableVisitorManagement', title: 'Visitor Gate Entry & Pass' },
              { key: 'enablePolls', title: 'Resident Voting & Polls' },
              { key: 'enableGallery', title: 'Colony Photo Gallery' },
              { key: 'enableDocuments', title: 'Bye-Laws & NOC Document Library' },
              { key: 'enableNotifications', title: 'Push & Broadcast Notifications' },
            ].map((f) => {
              const isEnabled = featureSwitches[f.key as keyof typeof featureSwitches];
              return (
                <div key={f.key} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{f.title}</span>
                  <button
                    onClick={() => toggleFeature(f.key as keyof typeof featureSwitches)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold font-mono transition ${
                      isEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {isEnabled ? 'ENABLED' : 'DISABLED'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 11: ROLES MATRIX */}
      {activeAdminTab === 'roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Role-Based Access Control Matrix</span>
          </h3>

          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left text-slate-300">
              <thead className="bg-slate-800 uppercase font-mono text-[10px]">
                <tr>
                  <th className="p-3">Feature Capability</th>
                  <th className="p-3">Super Admin</th>
                  <th className="p-3">Admin / Committee</th>
                  <th className="p-3">Resident</th>
                  <th className="p-3">Security Guard</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rolePermissions.map((rp, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="p-3 font-bold text-white">{rp.feature}</td>
                    <td className="p-3 text-emerald-400 font-bold">{rp.superAdmin ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-emerald-400 font-bold">{rp.admin ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-slate-400">{rp.resident ? 'Yes' : 'No'}</td>
                    <td className="p-3 text-slate-400">{rp.security ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 12: AUDIT LOGS */}
      {activeAdminTab === 'audit-logs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-white font-mono flex items-center space-x-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Administrative Audit & Security Logs</span>
          </h3>

          <div className="space-y-2 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3 bg-slate-800/40 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-mono text-emerald-400 font-bold text-[10px] mr-2">{log.id}</span>
                  <span className="text-white font-medium">{log.action}</span>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">By {log.user}</div>
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{log.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
