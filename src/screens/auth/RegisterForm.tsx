import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff, Building2, CheckCircle2, ShieldAlert, Upload, Camera } from 'lucide-react';
import { ResidentType, UserAccount } from '../../models/user';
import { registerUserApi, mapUserAccountToResident, saveSession, UserSession } from '../../api/authApi';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess: (session: UserSession) => void;
  onGoogleClick: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSwitchToLogin,
  onSuccess,
  onGoogleClick,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [colonyName, setColonyName] = useState('Sapana Park CHS');
  const [flatNumber, setFlatNumber] = useState('');
  const [blockNumber, setBlockNumber] = useState('Wing A');
  const [floorNumber, setFloorNumber] = useState('1');
  const [residentType, setResidentType] = useState<ResidentType>('Owner');
  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Validation Checks
  const hasMinLength = password.length >= 8;
  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const isPasswordValid = hasMinLength && hasUpper && hasLower && hasNumber && passwordsMatch;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProfilePhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Please enter your Full Name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Email Address.');
      return;
    }

    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit Mobile Number.');
      return;
    }

    if (!isPasswordValid) {
      setErrorMsg('Please ensure your password satisfies all security requirements.');
      return;
    }

    if (!flatNumber.trim()) {
      setErrorMsg('Please enter your Flat/House Number.');
      return;
    }

    setLoading(true);
    const res = await registerUserApi({
      fullName: fullName.trim(),
      email: email.trim(),
      mobileNumber: mobileNumber.trim(),
      password,
      colonyName: colonyName.trim(),
      flatNumber: flatNumber.toUpperCase().trim(),
      blockNumber: blockNumber.trim(),
      floorNumber: floorNumber.trim(),
      residentType,
      profilePhoto,
      authProvider: 'Email',
    });
    setLoading(false);

    if (res.success && res.user) {
      const residentObj = mapUserAccountToResident(res.user);
      const sessionObj: UserSession = {
        resident: residentObj,
        userAccount: res.user,
        role: 'Resident',
        isLoggedIn: true,
      };
      saveSession(sessionObj);
      onSuccess(sessionObj);
    } else {
      setErrorMsg(res.message || 'Registration failed.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Continue with Google button */}
      <button
        type="button"
        onClick={onGoogleClick}
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
        <span>Register using Google Account</span>
      </button>

      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-800 w-full" />
        <span className="bg-slate-900 px-3 text-[10px] text-slate-500 uppercase font-mono font-semibold">
          OR REGISTER WITH EMAIL / MOBILE
        </span>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Profile Photo Option */}
        <div className="flex items-center space-x-3 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
          <div className="relative w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile Preview" className="w-full h-full object-cover" />
            ) : (
              <User className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div className="flex-1">
            <label className="block text-[11px] font-semibold text-slate-300">
              Optional Profile Photo
            </label>
            <label className="cursor-pointer text-xs text-emerald-400 hover:text-emerald-300 flex items-center space-x-1 mt-0.5">
              <Upload className="w-3.5 h-3.5" />
              <span>{profilePhoto ? 'Change Photo' : 'Upload / Capture Photo'}</span>
              <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
            </label>
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Full Name *
          </label>
          <div className="relative">
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kulkarni"
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Email & Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Email Address *
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Mobile Number *
            </label>
            <div className="relative">
              <input
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="10-digit mobile"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
              />
              <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Create Password & Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Create Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, 1 uppercase, 1 num"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-8 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Confirm Password *
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                required
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono text-xs"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Password Requirements List */}
        <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-[10px] space-y-1">
          <div className="font-semibold text-slate-400 mb-0.5">Password Security Requirements:</div>
          <div className="grid grid-cols-2 gap-1">
            <div className={`flex items-center space-x-1 ${hasMinLength ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>Min 8 characters</span>
            </div>
            <div className={`flex items-center space-x-1 ${hasUpper ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>At least 1 uppercase</span>
            </div>
            <div className={`flex items-center space-x-1 ${hasLower ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>At least 1 lowercase</span>
            </div>
            <div className={`flex items-center space-x-1 ${hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
              <CheckCircle2 className="w-3 h-3" />
              <span>At least 1 number</span>
            </div>
          </div>
          <div className={`flex items-center space-x-1 pt-0.5 ${passwordsMatch ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3 h-3" />
            <span>Confirm Password matches</span>
          </div>
        </div>

        {/* Colony & Flat details */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Colony / Society Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={colonyName}
              onChange={(e) => setColonyName(e.target.value)}
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-emerald-500"
            />
            <Building2 className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Flat / House No. *
            </label>
            <input
              type="text"
              value={flatNumber}
              onChange={(e) => setFlatNumber(e.target.value.toUpperCase())}
              placeholder="e.g. A-302"
              required
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Block / Tower
            </label>
            <select
              value={blockNumber}
              onChange={(e) => setBlockNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Wing A">Wing A</option>
              <option value="Wing B">Wing B</option>
              <option value="Wing C">Wing C</option>
              <option value="Wing D">Wing D</option>
              <option value="Commercial Shop">Commercial Shop</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Floor Number
            </label>
            <select
              value={floorNumber}
              onChange={(e) => setFloorNumber(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Ground Floor">Ground Floor</option>
              <option value="1">1st Floor</option>
              <option value="2">2nd Floor</option>
              <option value="3">3rd Floor</option>
              <option value="4">4th Floor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Resident Type
            </label>
            <select
              value={residentType}
              onChange={(e) => setResidentType(e.target.value as ResidentType)}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
            >
              <option value="Owner">Owner</option>
              <option value="Tenant">Tenant</option>
              <option value="Family Member">Family Member</option>
              <option value="Shop Owner">Shop Owner</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !isPasswordValid}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition shadow-lg flex items-center justify-center space-x-2 mt-2 ${
            isPasswordValid
              ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
          }`}
        >
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <span>Submit Registration & Create Account</span>
          )}
        </button>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-xs text-slate-400 hover:text-emerald-400 transition"
          >
            Already have an account? <span className="font-bold underline text-emerald-400">Log In Here</span>
          </button>
        </div>
      </form>
    </div>
  );
};
