import React, { useState } from 'react';
import { KeyRound, Mail, ArrowLeft, CheckCircle2, ShieldAlert, Eye, EyeOff, Lock } from 'lucide-react';
import { forgotPasswordApi, resetPasswordApi } from '../../api/authApi';

interface ForgotPasswordViewProps {
  onBackToLogin: () => void;
  onSuccessReset: (identifier: string) => void;
}

export const ForgotPasswordView: React.FC<ForgotPasswordViewProps> = ({
  onBackToLogin,
  onSuccessReset,
}) => {
  const [step, setStep] = useState<1 | 2>(1); // 1: Request OTP, 2: Verify & Reset
  const [identifier, setIdentifier] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [demoOtpInfo, setDemoOtpInfo] = useState('');

  // Password Requirements Check
  const hasMinLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!identifier.trim()) {
      setErrorMsg('Please enter your registered Email Address or Mobile Number.');
      return;
    }

    setLoading(true);
    const res = await forgotPasswordApi(identifier);
    setLoading(false);

    if (res.success) {
      setStep(2);
      setSuccessMsg(res.message);
      if (res.resetToken) {
        setDemoOtpInfo(`Verification OTP sent! (Demo OTP: ${res.resetToken})`);
        setResetOtp(res.resetToken);
      }
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!resetOtp.trim()) {
      setErrorMsg('Please enter the 6-digit verification OTP code.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Please fulfill all password security requirements.');
      return;
    }

    setLoading(true);
    const res = await resetPasswordApi(identifier, resetOtp, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Your password has been reset successfully! Redirecting to login...');
      setTimeout(() => {
        onSuccessReset(identifier);
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          onClick={onBackToLogin}
          className="flex items-center text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Login
        </button>
        <span className="text-xs font-semibold text-emerald-400">Password Recovery</span>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs p-3 rounded-xl flex items-start space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p>{successMsg}</p>
            {demoOtpInfo && <p className="mt-1 text-emerald-200 font-mono text-[11px] font-bold">{demoOtpInfo}</p>}
          </div>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <p className="text-xs text-slate-400">
            Enter your registered Email Address or Mobile Number. We will verify your user profile and issue a secure 6-digit password reset OTP.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Registered Email or Mobile Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. rajesh.naik@sapanapark.org or 9822145670"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
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
                <span>Verify Account & Send OTP</span>
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              6-Digit Verification OTP Code
            </label>
            <div className="relative">
              <input
                type="text"
                value={resetOtp}
                onChange={(e) => setResetOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                required
                className="w-full bg-slate-800 border border-slate-700 text-emerald-400 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 font-mono tracking-widest font-bold"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create new strong password"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          {/* Password Validation Checklist */}
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
            <div className="font-semibold text-slate-300 mb-1">Password Requirements:</div>
            <div className={`flex items-center space-x-1.5 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 8 characters long</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 1 uppercase letter (A-Z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 1 lowercase letter (a-z)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>At least 1 number (0-9)</span>
            </div>
            <div className={`flex items-center space-x-1.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Passwords match</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isPasswordValid}
            className={`w-full py-2.5 rounded-xl font-semibold text-sm transition shadow-lg flex items-center justify-center space-x-2 ${
              isPasswordValid
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
            }`}
          >
            {loading ? (
              <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <span>Confirm & Reset Password</span>
            )}
          </button>
        </form>
      )}
    </div>
  );
};
