import React, { useState } from 'react';
import { Building2, KeyRound, Mail, Eye, EyeOff, ShieldCheck, ShieldAlert, Lock, UserPlus, Sparkles, CheckSquare, Square } from 'lucide-react';
import { loginUserApi, googleAuthApi, saveSession, INITIAL_RESIDENTS, UserSession, mapUserAccountToResident } from '../../api/authApi';
import { RegisterForm } from './RegisterForm';
import { ForgotPasswordView } from './ForgotPasswordView';
import { GoogleCompletionView } from './GoogleCompletionView';
import { GoogleAccountPickerModal } from '../../components/GoogleAccountPickerModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (session: UserSession) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'googleCompletion'>('login');
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);
  
  // Login form states
  const [loginIdentifier, setLoginIdentifier] = useState('rajesh.naik@sapanapark.org');
  const [loginPassword, setLoginPassword] = useState('Sapana@2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pending Google profile state
  const [pendingGoogleProfile, setPendingGoogleProfile] = useState<{
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto?: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Please enter your Email Address or Mobile Number.');
      return;
    }

    if (!loginPassword) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);
    const res = await loginUserApi(loginIdentifier, loginPassword);
    setLoading(false);

    if (res.success && res.user) {
      const residentObj = mapUserAccountToResident(res.user);
      const role = res.user.role === 'Admin' ? 'Secretary' : (res.user.role as 'Resident' | 'Secretary' | 'Treasurer');
      const sessionObj: UserSession = {
        resident: residentObj,
        userAccount: res.user,
        role,
        isLoggedIn: true,
      };

      if (rememberMe) {
        saveSession(sessionObj);
      }
      onLoginSuccess(sessionObj);
      onClose();
    } else {
      setErrorMsg(res.message || 'Login failed. Please verify credentials.');
    }
  };

  const handleOpenGoogleAccountPicker = () => {
    setErrorMsg('');
    setIsGooglePickerOpen(true);
  };

  const handleSelectGoogleAccount = async (account: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto: string;
  }) => {
    setIsGooglePickerOpen(false);
    setErrorMsg('');
    setLoading(true);

    const res = await googleAuthApi(account);
    setLoading(false);

    if (res.success) {
      if (res.requiresColonyCompletion) {
        setPendingGoogleProfile(account);
        setActiveTab('googleCompletion');
      } else if (res.user) {
        const residentObj = mapUserAccountToResident(res.user);
        const sessionObj: UserSession = {
          resident: residentObj,
          userAccount: res.user,
          role: 'Resident',
          isLoggedIn: true,
        };
        saveSession(sessionObj);
        onLoginSuccess(sessionObj);
        onClose();
      }
    } else {
      setErrorMsg(res.message || 'Google authentication failed.');
    }
  };

  const handleQuickDemoSelect = (email: string, pass: string) => {
    setLoginIdentifier(email);
    setLoginPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative my-8 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-sky-500 p-0.5 mx-auto mb-3 flex items-center justify-center shadow-lg shadow-emerald-950/50">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <Building2 className="w-7 h-7 text-emerald-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Sapana Park CHS</h2>
          <p className="text-xs text-slate-400 mt-1">Porvorim, Goa • Secure Colony Resident Portal</p>
        </div>

        {/* Auth Mode Tabs (Login / Register) */}
        {activeTab !== 'forgot' && activeTab !== 'googleCompletion' && (
          <div className="flex bg-slate-800/80 p-1 rounded-2xl border border-slate-700/80 mb-5">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'login'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Resident Login
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1 ${
                activeTab === 'register'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Account</span>
            </button>
          </div>
        )}

        {/* TAB CONTENTS */}

        {/* 1. LOGIN TAB */}
        {activeTab === 'login' && (
          <div className="space-y-4">
            {errorMsg && (
              <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Google Login Button */}
            <button
              type="button"
              onClick={handleOpenGoogleAccountPicker}
              disabled={loading}
              className="w-full bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition shadow-md"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-mono font-semibold">
                OR EMAIL / MOBILE LOGIN
              </span>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Email Address or Mobile Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="e.g. rajesh.naik@sapanapark.org or 9822145670"
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
                  />
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('forgot');
                      setErrorMsg('');
                    }}
                    className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center space-x-2 text-xs text-slate-300 hover:text-white"
                >
                  {rememberMe ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-500" />
                  )}
                  <span>Remember Me</span>
                </button>

                <span className="text-[10px] text-slate-500 font-mono">256-bit Hash Encrypted</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Log In to Colony Portal</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Accounts */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-slate-400 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Quick Seed Demo Accounts:</span>
                </p>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">Default Pass: Sapana@2026</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => handleQuickDemoSelect('rajesh.naik@sapanapark.org', 'Sapana@2026')}
                  className="p-2 rounded-xl text-left bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>A-302</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">Secretary</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Rajesh Naik</div>
                </button>

                <button
                  onClick={() => handleQuickDemoSelect('anjali.d@gmail.com', 'Sapana@2026')}
                  className="p-2 rounded-xl text-left bg-slate-800/80 border border-slate-700/80 hover:bg-slate-800 transition"
                >
                  <div className="font-bold text-white flex items-center justify-between">
                    <span>B-101</span>
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">Treasurer</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Anjali Deshmukh</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. REGISTER TAB */}
        {activeTab === 'register' && (
          <RegisterForm
            onSwitchToLogin={() => setActiveTab('login')}
            onSuccess={(session) => {
              onLoginSuccess(session);
              onClose();
            }}
            onGoogleClick={handleOpenGoogleAccountPicker}
          />
        )}

        {/* 3. FORGOT PASSWORD TAB */}
        {activeTab === 'forgot' && (
          <ForgotPasswordView
            onBackToLogin={() => setActiveTab('login')}
            onSuccessReset={(identifier) => {
              setLoginIdentifier(identifier);
              setActiveTab('login');
            }}
          />
        )}

        {/* 4. GOOGLE COMPLETION TAB */}
        {activeTab === 'googleCompletion' && pendingGoogleProfile && (
          <GoogleCompletionView
            googleProfile={pendingGoogleProfile}
            onBack={() => setActiveTab('login')}
            onSuccess={(session) => {
              onLoginSuccess(session);
              onClose();
            }}
          />
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-300 transition"
        >
          Cancel
        </button>
      </div>

      {/* Device Google Accounts Picker Dialog */}
      <GoogleAccountPickerModal
        isOpen={isGooglePickerOpen}
        onClose={() => setIsGooglePickerOpen(false)}
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
};
