import React, { useState } from 'react';
import {
  X,
  User,
  Shield,
  Bell,
  Sun,
  Moon,
  Globe,
  HelpCircle,
  FileText,
  LogOut,
  KeyRound,
  Smartphone,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Mail,
  Phone,
  Building2,
  Eye,
  EyeOff,
  ChevronRight,
  Sparkles,
  Info,
  ShieldAlert,
  Save,
  Laptop,
} from 'lucide-react';
import { UserSession } from '../../api/authApi';
import { DevicePermissionsScreen } from '../../components/DevicePermissionsScreen';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: UserSession;
  onUpdateSession: (session: UserSession) => void;
  onSignOut: () => void;
  activeLanguage: 'English' | 'Hindi';
  onLanguageChange: (lang: 'English' | 'Hindi') => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  session,
  onUpdateSession,
  onSignOut,
  activeLanguage,
  onLanguageChange,
}) => {
  const [activeTab, setActiveTab] = useState<
    'account' | 'permissions' | 'security' | 'notifications' | 'appearance' | 'language' | 'help' | 'legal'
  >('account');

  // Sign out confirmation dialog state
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);

  // Account Settings Form State
  const [fullName, setFullName] = useState(session.resident.name);
  const [email, setEmail] = useState(session.resident.email);
  const [mobileNumber, setMobileNumber] = useState(session.resident.phone);
  const [profilePhoto, setProfilePhoto] = useState(
    session.resident.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
  );
  const [accountSaveNotice, setAccountSaveNotice] = useState<string | null>(null);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [securityNotice, setSecurityNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active Sessions
  const [sessionsList, setSessionsList] = useState([
    { id: '1', device: 'Chrome on Windows 11', location: 'Porvorim, Goa', ip: '103.22.45.12', isCurrent: true, lastActive: 'Active Now' },
    { id: '2', device: 'Sapana Park Android App', location: 'Panaji, Goa', ip: '103.22.45.88', isCurrent: false, lastActive: '2 hours ago' },
  ]);

  // Notification Toggles State
  const [notifications, setNotifications] = useState({
    push: true,
    notices: true,
    events: true,
    maintenance: true,
    complaints: true,
    securityAlerts: true,
    emergencyAlerts: true,
    communityUpdates: false,
  });

  // Appearance State
  const [theme, setTheme] = useState<'dark' | 'light' | 'system'>('dark');

  // Help & Support state
  const [helpQuery, setHelpQuery] = useState('');
  const [problemReportText, setProblemReportText] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAccountSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSession: UserSession = {
      ...session,
      resident: {
        ...session.resident,
        name: fullName,
        email: email,
        phone: mobileNumber,
        avatarUrl: profilePhoto,
      },
      userAccount: session.userAccount
        ? {
            ...session.userAccount,
            fullName,
            email,
            mobileNumber,
            profilePhoto,
          }
        : undefined,
    };
    onUpdateSession(updatedSession);
    setAccountSaveNotice('Account details updated successfully!');
    setTimeout(() => setAccountSaveNotice(null), 3000);
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityNotice(null);

    if (newPassword.length < 8) {
      setSecurityNotice({ type: 'error', message: 'New password must be at least 8 characters long.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setSecurityNotice({ type: 'error', message: 'New password and confirm password do not match.' });
      return;
    }

    setSecurityNotice({ type: 'success', message: 'Password updated successfully! Next login will require your new password.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
  };

  const handleSignOutOtherDevices = () => {
    setSessionsList(sessionsList.filter((s) => s.isCurrent));
    setSecurityNotice({ type: 'success', message: 'Signed out from all other active device sessions.' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-950/60 p-4 border-b md:border-b-0 md:border-r border-slate-800 flex shrink-0 flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">App Settings</h2>
                  <p className="text-[10px] text-slate-400">Sapana Park CHS</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1">
              {[
                { id: 'account', label: activeLanguage === 'Hindi' ? 'खाता सेटिंग्स' : 'Account Settings', icon: User },
                { id: 'permissions', label: activeLanguage === 'Hindi' ? 'डिवाइस अनुमतियां' : 'Device Permissions', icon: Smartphone },
                { id: 'security', label: activeLanguage === 'Hindi' ? 'गोपनीयता और सुरक्षा' : 'Privacy & Security', icon: Shield },
                { id: 'notifications', label: activeLanguage === 'Hindi' ? 'सूचना सेटिंग्स' : 'Notification Settings', icon: Bell },
                { id: 'appearance', label: activeLanguage === 'Hindi' ? 'रंग और स्वरूप' : 'Appearance', icon: Sun },
                { id: 'language', label: activeLanguage === 'Hindi' ? 'भाषा (Language)' : 'Language', icon: Globe },
                { id: 'help', label: activeLanguage === 'Hindi' ? 'सहायता और सहायता' : 'Help & Support', icon: HelpCircle },
                { id: 'legal', label: activeLanguage === 'Hindi' ? 'कानूनी नियम' : 'Legal & Terms', icon: FileText },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 opacity-60 ${isActive ? 'inline' : 'hidden'}`} />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sign Out Trigger Button */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={() => setShowSignOutConfirm(true)}
              className="w-full bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2"
            >
              <LogOut className="w-4 h-4 text-rose-400" />
              <span>{activeLanguage === 'Hindi' ? 'साइन आउट करें' : 'Sign Out'}</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2">
              <span>
                {activeTab === 'account' && (activeLanguage === 'Hindi' ? 'खाता विवरण संपादित करें' : 'Account Settings')}
                {activeTab === 'permissions' && (activeLanguage === 'Hindi' ? 'डिवाइस अनुमतियां एवं कनेक्टिविटी' : 'Device Permissions & Integration')}
                {activeTab === 'security' && (activeLanguage === 'Hindi' ? 'सुरक्षा एवं पासवर्ड' : 'Privacy & Security')}
                {activeTab === 'notifications' && (activeLanguage === 'Hindi' ? 'सूचनाएं' : 'Notification Preferences')}
                {activeTab === 'appearance' && (activeLanguage === 'Hindi' ? 'एप थीम्स' : 'Appearance Settings')}
                {activeTab === 'language' && (activeLanguage === 'Hindi' ? 'भाषा चयन' : 'Language & Region')}
                {activeTab === 'help' && (activeLanguage === 'Hindi' ? 'सहायता केंद्र' : 'Help & Support Center')}
                {activeTab === 'legal' && (activeLanguage === 'Hindi' ? 'कानूनी नीतियां' : 'Legal & Community Policies')}
              </span>
            </h3>

            <button
              onClick={onClose}
              className="hidden md:block text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 1. ACCOUNT SETTINGS TAB */}
          {activeTab === 'account' && (
            <div className="space-y-4">
              {accountSaveNotice && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{accountSaveNotice}</span>
                </div>
              )}

              <form onSubmit={handleAccountSave} className="space-y-4">
                <div className="flex items-center space-x-4 bg-slate-800/50 p-3.5 rounded-2xl border border-slate-700/60">
                  <img
                    src={profilePhoto}
                    alt={fullName}
                    className="w-14 h-14 rounded-2xl border-2 border-emerald-500 object-cover"
                  />
                  <div className="flex-1 space-y-1">
                    <label className="block text-xs font-medium text-slate-300">
                      Profile Photo URL
                    </label>
                    <input
                      type="text"
                      value={profilePhoto}
                      onChange={(e) => setProfilePhoto(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="bg-slate-800/40 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs">
                  <span className="text-slate-400 font-semibold block text-[11px] uppercase tracking-wider font-mono">
                    Colony Flat Association (Verified)
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div>
                      <span className="text-slate-500 text-[10px]">Society:</span>
                      <p className="font-bold text-white">Sapana Park CHS</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Flat / Wing:</span>
                      <p className="font-bold text-emerald-400">{session.resident.flatNumber} ({session.resident.wing})</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Resident Type:</span>
                      <p className="font-bold text-slate-200">{session.resident.residentType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[10px]">Committee Role:</span>
                      <p className="font-bold text-amber-300">{session.role}</p>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center space-x-2 shadow-lg"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Account Settings</span>
                </button>
              </form>
            </div>
          )}

          {/* 2. DEVICE PERMISSIONS & CONNECTIVITY TAB */}
          {activeTab === 'permissions' && <DevicePermissionsScreen />}

          {/* 2. PRIVACY & SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              {securityNotice && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                    securityNotice.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                >
                  {securityNotice.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{securityNotice.message}</span>
                </div>
              )}

              {/* Change Password Form */}
              <form onSubmit={handleChangePasswordSubmit} className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-emerald-400" />
                  <span>Change Password</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-medium text-slate-300 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      New Password (8+ chars)
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-300 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white py-2 px-3 rounded-xl text-xs font-bold transition mt-2"
                >
                  Update Password
                </button>
              </form>

              {/* Active Sessions & Login Activity */}
              <div className="space-y-3 bg-slate-800/40 p-4 rounded-2xl border border-slate-800">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-1.5">
                    <Laptop className="w-4 h-4 text-sky-400" />
                    <span>Active Sessions & Login Activity</span>
                  </h4>
                  {sessionsList.length > 1 && (
                    <button
                      onClick={handleSignOutOtherDevices}
                      className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Sign Out Other Devices
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  {sessionsList.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between bg-slate-800 p-2.5 rounded-xl text-xs border border-slate-700/60"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center space-x-2">
                          <span>{s.device}</span>
                          {s.isCurrent && (
                            <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                              THIS DEVICE
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {s.location} • IP: {s.ip}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{s.lastActive}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 3. NOTIFICATION SETTINGS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">
                Choose which colony push notifications, emergency alerts, and updates you wish to receive.
              </p>

              <div className="space-y-2 divide-y divide-slate-800">
                {[
                  { key: 'push', title: 'Push Notifications', desc: 'Enable browser and mobile device push alerts.' },
                  { key: 'notices', title: 'Society Notices & Circulars', desc: 'Instant alerts when committee publishes new official notices.' },
                  { key: 'events', title: 'Community Events & Festival Invites', desc: 'Reminders for upcoming colony gatherings and celebrations.' },
                  { key: 'maintenance', title: 'Maintenance Bills & Reminders', desc: 'Due date alerts and payment receipt confirmations.' },
                  { key: 'complaints', title: 'Helpdesk & Complaint Updates', desc: 'Notifications when your raised complaint status changes.' },
                  { key: 'securityAlerts', title: 'Security & Gate Entry Alerts', desc: 'Visitor approval requests from main gate security.' },
                  { key: 'emergencyAlerts', title: 'Emergency SOS Broadcasts', desc: 'High priority alerts for water line, power, or security emergencies.' },
                  { key: 'communityUpdates', title: 'Resident Discussion Forum', desc: 'Replies and highlights from community chat topics.' },
                ].map((item) => (
                  <div key={item.key} className="pt-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">{item.title}</div>
                      <div className="text-[10px] text-slate-400">{item.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setNotifications((prev) => ({
                          ...prev,
                          [item.key as keyof typeof notifications]: !prev[item.key as keyof typeof notifications],
                        }))
                      }
                      className={`w-10 h-6 flex items-center rounded-full p-1 transition ${
                        notifications[item.key as keyof typeof notifications] ? 'bg-emerald-600' : 'bg-slate-700'
                      }`}
                    >
                      <div
                        className={`bg-white w-4 h-4 rounded-full shadow-md transform transition ${
                          notifications[item.key as keyof typeof notifications] ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Select visual theme preference for Sapana Park CHS portal.</p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'dark', name: 'Dark Twilight', icon: Moon, desc: 'Eye-friendly twilight navy theme' },
                  { id: 'light', name: 'Light Mode', icon: Sun, desc: 'High contrast clean white canvas' },
                  { id: 'system', name: 'System Default', icon: Laptop, desc: 'Sync with OS device preference' },
                ].map((item) => {
                  const Icon = item.icon;
                  const isSel = theme === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setTheme(item.id as any)}
                      className={`p-4 rounded-2xl border text-left space-y-2 transition ${
                        isSel
                          ? 'bg-emerald-950/40 border-emerald-500 text-white'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isSel ? 'text-emerald-400' : 'text-slate-500'}`} />
                      <div>
                        <div className="text-xs font-bold">{item.name}</div>
                        <div className="text-[10px] text-slate-400">{item.desc}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. LANGUAGE TAB */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-400">Select language preference across the portal application.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {[
                  { code: 'English', native: 'English', desc: 'Default Primary Language', flag: '🇬🇧' },
                  { code: 'Hindi', native: 'हिन्दी', desc: 'भारतीय राष्ट्रीय भाषा', flag: '🇮🇳' },
                  { code: 'Marathi', native: 'मराठी', desc: 'महाराष्ट्र राज्य भाषा', flag: '🇮🇳' },
                  { code: 'Gujarati', native: 'ગુજરાતી', desc: 'ગુજરાતી રાજ્ય ભાષા', flag: '🇮🇳' },
                  { code: 'Bengali', native: 'বাংলা', desc: 'বাংলা আঞ্চলিক ভাষা', flag: '🇮🇳' },
                  { code: 'Tamil', native: 'தமிழ்', desc: 'தமிழ் மாநில மொழி', flag: '🇮🇳' },
                  { code: 'Telugu', native: 'తెలుగు', desc: 'తెలుగు రాష్ట్ర భాష', flag: '🇮🇳' },
                  { code: 'Kannada', native: 'ಕನ್ನಡ', desc: 'ಕರ್ನಾಟಕ ರಾಜ್ಯ ಭಾಷೆ', flag: '🇮🇳' },
                  { code: 'Malayalam', native: 'മലയാളം', desc: 'കേരള സംസ്ഥാന ഭാഷ', flag: '🇮🇳' },
                  { code: 'Punjabi', native: 'ਪੰਜਾਬੀ', desc: 'ਪੰਜਾਬੀ ਖੇਤਰੀ ਭਾਸ਼ਾ', flag: '🇮🇳' },
                  { code: 'Urdu', native: 'اردو', desc: 'اردو قومی زبان', flag: '🇵🇰' },
                ].map((langItem) => {
                  const isSel = activeLanguage === langItem.code;
                  return (
                    <button
                      key={langItem.code}
                      onClick={() => onLanguageChange(langItem.code as any)}
                      className={`p-3.5 rounded-2xl border text-left flex items-center justify-between transition ${
                        isSel
                          ? 'bg-emerald-950/40 border-emerald-500 text-white shadow-lg shadow-emerald-950/40'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-xl">{langItem.flag}</span>
                        <div>
                          <div className="text-xs font-extrabold text-white">{langItem.native}</div>
                          <div className="text-[10px] text-slate-400">{langItem.code} ({langItem.desc})</div>
                        </div>
                      </div>
                      {isSel && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. HELP & SUPPORT TAB */}
          {activeTab === 'help' && (
            <div className="space-y-4">
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Report a Problem / Contact Committee
                </h4>

                {reportSuccess ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
                    Thank you! Your ticket has been dispatched to the Managing Committee Admin Desk.
                  </div>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      value={problemReportText}
                      onChange={(e) => setProblemReportText(e.target.value)}
                      placeholder="Describe the problem or query in detail..."
                      rows={3}
                      className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (problemReportText.trim()) {
                          setReportSuccess(true);
                          setProblemReportText('');
                          setTimeout(() => setReportSuccess(false), 4000);
                        }
                      }}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition"
                    >
                      Send Message to Admin
                    </button>
                  </div>
                )}
              </div>

              {/* FAQs Accordion */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Frequently Asked Questions
                </h4>
                <div className="space-y-2 text-xs">
                  <details className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 cursor-pointer">
                    <summary className="font-bold text-white">How do I get my flat maintenance receipt?</summary>
                    <p className="text-slate-400 mt-2">
                      Go to Bills & Finance tab, select your paid month receipt, and click "Download PDF Receipt".
                    </p>
                  </details>
                  <details className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 cursor-pointer">
                    <summary className="font-bold text-white">How do I request a Society NOC for passport or bank loan?</summary>
                    <p className="text-slate-400 mt-2">
                      Go to Bye-Laws & NOCs tab, select "Request Society NOC Form", fill details and submit to Committee.
                    </p>
                  </details>
                </div>
              </div>
            </div>
          )}

          {/* 7. LEGAL & TERMS TAB */}
          {activeTab === 'legal' && (
            <div className="space-y-4 text-xs text-slate-300">
              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Sapana Park CHS Privacy Policy & Data Security</h4>
                <p className="text-slate-400 leading-relaxed">
                  Your personal information, Aadhaar numbers, and vehicle registration data are strictly encrypted and accessible only to authorized society committee members in accordance with the Goa Co-operative Societies Act 2001.
                </p>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="font-bold text-white text-sm">Community Guidelines</h4>
                <ul className="list-disc pl-4 text-slate-400 space-y-1">
                  <li>Quiet hours observed between 10:00 PM and 6:00 AM.</li>
                  <li>Visitor vehicle parking allowed only in designated visitor slots.</li>
                  <li>Monthly maintenance dues payable on or before 10th of every month.</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SIGN OUT CONFIRMATION MODAL */}
      {showSignOutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-sm p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Are you sure you want to sign out?</h3>
              <p className="text-xs text-slate-400 mt-1">
                You will need to log in again to access your resident portal, pay bills, or view notices.
              </p>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={() => setShowSignOutConfirm(false)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 py-2.5 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowSignOutConfirm(false);
                  onSignOut();
                  onClose();
                }}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white py-2.5 rounded-xl text-xs font-bold transition shadow-lg shadow-rose-950/50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
