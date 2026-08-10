import React, { useState } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  MapPin,
  MessageSquare,
  Bell,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Smartphone,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface PermissionsModalProps {
  onClose: () => void;
}

export const PermissionsModal: React.FC<PermissionsModalProps> = ({ onClose }) => {
  const [permissions, setPermissions] = useState({
    camera: true,
    gallery: true,
    location: true,
    sms: true,
    notifications: true,
    promotions: false,
  });

  const togglePermission = (key: keyof typeof permissions) => {
    setPermissions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleRequestNativePermission = async (type: string) => {
    if (type === 'location' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          alert(`Location granted: Lat ${pos.coords.latitude.toFixed(4)}, Long ${pos.coords.longitude.toFixed(4)}`);
        },
        (err) => alert(`Location permission status: ${err.message}`)
      );
    } else if (type === 'notifications' && 'Notification' in window) {
      const res = await Notification.requestPermission();
      alert(`Notification permission: ${res}`);
    } else if (type === 'camera') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        alert('Camera access granted successfully!');
        stream.getTracks().forEach((t) => t.stop());
      } catch (e: any) {
        alert('Camera access status: ' + e.message);
      }
    } else {
      alert(`${type.toUpperCase()} permission active.`);
    }
  };

  const items = [
    {
      key: 'camera' as const,
      title: 'Camera Access',
      description: 'Required to capture real-time photo evidence of maintenance issues and document scans.',
      icon: Camera,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    },
    {
      key: 'gallery' as const,
      title: 'Gallery & Photo Library',
      description: 'Required to attach saved photos to complaint tickets and upload verification PDFs.',
      icon: ImageIcon,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/30',
    },
    {
      key: 'location' as const,
      title: 'Location (GPS)',
      description: 'Used during Emergency SOS broadcast to share precise building gate coordinates with security.',
      icon: MapPin,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      key: 'sms' as const,
      title: 'SMS Alerts & OTP',
      description: 'Required to auto-read visitor gate OTPs and receive offline SMS payment confirmations.',
      icon: MessageSquare,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      key: 'notifications' as const,
      title: 'Push Notifications',
      description: 'Receive real-time alerts for water cut notices, maintenance due dates, and visitor arrival.',
      icon: Bell,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      key: 'promotions' as const,
      title: 'Society Event Promotions & Offers',
      description: 'Receive cultural fest invitations, women empowerment workshops, and neighborhood deals.',
      icon: Smartphone,
      color: 'text-teal-400 bg-teal-500/10 border-teal-500/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg my-auto p-6 shadow-2xl relative text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">App Permissions & Device Controls</h2>
              <p className="text-xs text-slate-400">Manage Camera, Gallery, Location, SMS & Notification access</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permissions List */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {items.map((item) => {
            const Icon = item.icon;
            const isAllowed = permissions[item.key];
            return (
              <div
                key={item.key}
                className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-start justify-between gap-3 text-xs"
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2.5 rounded-xl border ${item.color} shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <strong className="text-white font-bold">{item.title}</strong>
                      <span
                        className={`text-[9px] px-2 py-0.2 rounded-full font-bold uppercase ${
                          isAllowed
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isAllowed ? 'Allowed' : 'Disabled'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.description}</p>
                    
                    {isAllowed && (
                      <button
                        type="button"
                        onClick={() => handleRequestNativePermission(item.key)}
                        className="text-[10px] text-emerald-400 hover:underline mt-1 font-semibold flex items-center space-x-1"
                      >
                        <span>Test / Verify Device Access</span>
                      </button>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => togglePermission(item.key)}
                  className="p-1 text-slate-400 hover:text-white transition shrink-0 mt-1"
                >
                  {isAllowed ? (
                    <ToggleRight className="w-7 h-7 text-emerald-400" />
                  ) : (
                    <ToggleLeft className="w-7 h-7 text-slate-600" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-500">Privacy & Data encryption active</span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2 rounded-xl transition shadow"
          >
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
