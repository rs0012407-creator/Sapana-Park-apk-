import React, { useState } from 'react';
import { Building2, CheckCircle2, ShieldAlert, ArrowLeft } from 'lucide-react';
import { ResidentType, UserAccount } from '../../models/user';
import { registerUserApi, mapUserAccountToResident, saveSession, UserSession } from '../../api/authApi';

interface GoogleCompletionViewProps {
  googleProfile: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto?: string;
  };
  onBack: () => void;
  onSuccess: (session: UserSession) => void;
}

export const GoogleCompletionView: React.FC<GoogleCompletionViewProps> = ({
  googleProfile,
  onBack,
  onSuccess,
}) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [colonyName, setColonyName] = useState('Sapana Park CHS');
  const [flatNumber, setFlatNumber] = useState('');
  const [blockNumber, setBlockNumber] = useState('Wing A');
  const [floorNumber, setFloorNumber] = useState('1');
  const [residentType, setResidentType] = useState<ResidentType>('Owner');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!mobileNumber.trim() || mobileNumber.replace(/\D/g, '').length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!flatNumber.trim()) {
      setErrorMsg('Please enter your Flat or House Number (e.g. A-302).');
      return;
    }

    setLoading(true);
    const res = await registerUserApi({
      fullName: googleProfile.fullName,
      email: googleProfile.email,
      mobileNumber: mobileNumber.trim(),
      colonyName: colonyName.trim(),
      flatNumber: flatNumber.toUpperCase().trim(),
      blockNumber: blockNumber.trim(),
      floorNumber: floorNumber.trim(),
      residentType,
      profilePhoto: googleProfile.profilePhoto,
      authProvider: 'Google',
      googleId: googleProfile.googleId,
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
      setErrorMsg(res.message || 'Failed to complete Google account registration.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <button
          onClick={onBack}
          className="flex items-center text-xs text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back
        </button>
        <div className="flex items-center space-x-1 text-xs text-emerald-400 font-semibold">
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
          <span>Google Account Verified</span>
        </div>
      </div>

      <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700/80 flex items-center space-x-3">
        {googleProfile.profilePhoto ? (
          <img
            src={googleProfile.profilePhoto}
            alt={googleProfile.fullName}
            className="w-10 h-10 rounded-full border border-emerald-500/50 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-300 font-bold flex items-center justify-center">
            {googleProfile.fullName.charAt(0)}
          </div>
        )}
        <div>
          <h4 className="text-sm font-bold text-white">{googleProfile.fullName}</h4>
          <p className="text-xs text-slate-400 font-mono">{googleProfile.email}</p>
        </div>
      </div>

      <p className="text-xs text-slate-400">
        Google identity verified! Please provide your colony location details to complete your Sapana Park CHS resident profile.
      </p>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs p-3 rounded-xl flex items-start space-x-2">
          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            placeholder="e.g. 9822145670"
            required
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

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
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold text-sm transition shadow-lg shadow-emerald-950/40 flex items-center justify-center space-x-2 mt-2"
        >
          {loading ? (
            <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" />
              <span>Complete Google Registration</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
