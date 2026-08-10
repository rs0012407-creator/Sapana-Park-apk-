import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  Phone,
  User,
  ShieldCheck,
  Building2,
  Ambulance,
  Flame,
  Zap,
  Droplet,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Siren,
  MapPin,
  Share2,
} from 'lucide-react';

interface EmergencyContact {
  id: string;
  title: string;
  subtitle: string;
  phone: string;
  category: 'Colony Incharge' | 'Security Guard' | 'Govt Helpline' | 'Society Admin' | 'Custom';
  isDefault?: boolean;
}

interface EmergencyModalProps {
  onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose }) => {
  const INITIAL_CONTACTS: EmergencyContact[] = [
    {
      id: 'EMG-1',
      title: 'Colony Incharge / Estate Manager',
      subtitle: 'Rajesh Naik (Sapana Park Committee)',
      phone: '+91 98221 45670',
      category: 'Colony Incharge',
      isDefault: true,
    },
    {
      id: 'EMG-2',
      title: 'Society Security Guard / Main Gate Patrol',
      subtitle: 'Head Guard - Suresh Gaonkar (Gate 1 & 2)',
      phone: '+91 98220 01100',
      category: 'Security Guard',
      isDefault: true,
    },
    {
      id: 'EMG-3',
      title: 'Society Night Watchman / Patrol Guard',
      subtitle: 'Pradeep Kerkar (Night Patrol Duty)',
      phone: '+91 94220 88711',
      category: 'Security Guard',
      isDefault: true,
    },
    {
      id: 'EMG-4',
      title: 'Society Hon. Chairman & Managing Office',
      subtitle: 'Shri Anand Shinde (A-401)',
      phone: '+91 98230 11223',
      category: 'Society Admin',
      isDefault: true,
    },
    {
      id: 'EMG-5',
      title: 'Emergency Ambulance & Medical Response',
      subtitle: 'Goa Medical College Emergency / 108',
      phone: '108',
      category: 'Govt Helpline',
      isDefault: true,
    },
    {
      id: 'EMG-6',
      title: 'Mapusa / Anjuna Police Station',
      subtitle: 'Control Room & PCR Van',
      phone: '+91 832 227 3233',
      category: 'Govt Helpline',
      isDefault: true,
    },
    {
      id: 'EMG-7',
      title: 'Schindler Elevator Emergency Intercom',
      subtitle: '24/7 Lift Rescue Operator',
      phone: '1800 200 4545',
      category: 'Society Admin',
      isDefault: true,
    },
  ];

  const [contacts, setContacts] = useState<EmergencyContact[]>(() => {
    const saved = localStorage.getItem('sapana_park_emergency_contacts');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // Fallback
      }
    }
    return INITIAL_CONTACTS;
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubtitle, setNewSubtitle] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCategory, setNewCategory] = useState<EmergencyContact['category']>('Colony Incharge');

  const saveContactsToStorage = (updated: EmergencyContact[]) => {
    setContacts(updated);
    localStorage.setItem('sapana_park_emergency_contacts', JSON.stringify(updated));
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newPhone.trim()) return;

    const created: EmergencyContact = {
      id: `EMG-${Date.now()}`,
      title: newTitle,
      subtitle: newSubtitle || 'Society Incharge / Representative',
      phone: newPhone,
      category: newCategory,
      isDefault: false,
    };

    const updated = [created, ...contacts];
    saveContactsToStorage(updated);

    setNewTitle('');
    setNewSubtitle('');
    setNewPhone('');
    setShowAddForm(false);
  };

  const handleDeleteContact = (id: string) => {
    if (window.confirm('Are you sure you want to delete this emergency contact?')) {
      const updated = contacts.filter((c) => c.id !== id);
      saveContactsToStorage(updated);
    }
  };

  const handleBroadcastSOS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        alert(
          `🚨 SOS EMERGENCY BROADCAST SENT!\n\nSecurity Guard and Colony Incharge notified.\nCoordinates: Lat ${pos.coords.latitude.toFixed(
            4
          )}, Long ${pos.coords.longitude.toFixed(4)}\nSapana Park Gate Guard alerted via siren.`
        );
      });
    } else {
      alert('🚨 SOS EMERGENCY BROADCAST SENT to Colony Incharge & Main Gate Guard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg my-auto p-6 shadow-2xl relative text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-rose-600/20 text-rose-400 border border-rose-500/40 rounded-2xl animate-pulse">
              <Siren className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h2 className="text-base font-black text-white">Emergency Helplines & Colony Contacts</h2>
              <p className="text-xs text-rose-300">Colony Incharge, Main Gate Guard, Fire & Police</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Red Panic SOS Button */}
        <button
          onClick={handleBroadcastSOS}
          className="w-full bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white font-black py-3.5 px-4 rounded-2xl transition shadow-xl shadow-rose-950/60 flex items-center justify-center space-x-2 border border-rose-400/30 group"
        >
          <ShieldAlert className="w-5 h-5 text-amber-300 group-hover:scale-110 transition" />
          <span className="text-sm tracking-wide">ONE-TAP EMERGENCY SOS TO GATE GUARD & INCHARGE</span>
        </button>

        {/* Section Action Bar */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Helpline Directory
          </span>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shadow"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Incharge / Guard Number</span>
          </button>
        </div>

        {/* Add Contact Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddContact}
            className="bg-slate-950 p-4 rounded-2xl border border-emerald-500/40 space-y-3 animate-in fade-in duration-150 text-xs"
          >
            <h4 className="font-bold text-emerald-300 flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>Add Custom Incharge / Guard Contact</span>
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Colony Incharge">Colony Incharge</option>
                  <option value="Security Guard">Security Guard</option>
                  <option value="Society Admin">Society Admin</option>
                  <option value="Govt Helpline">Govt Helpline</option>
                  <option value="Custom">Custom Service</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Title / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Block B Guard / Plumber"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Name / Subtitle</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={newSubtitle}
                  onChange={(e) => setNewSubtitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 block mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98221 00000"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow"
              >
                Save Contact
              </button>
            </div>
          </form>
        )}

        {/* Contacts List */}
        <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className={`p-3.5 rounded-2xl border transition flex items-center justify-between text-xs ${
                contact.category === 'Colony Incharge'
                  ? 'bg-gradient-to-r from-emerald-950/60 to-slate-900 border-emerald-500/40'
                  : contact.category === 'Security Guard'
                  ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-sky-950/40 border-sky-500/40'
                  : 'bg-slate-950 border-slate-800'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    contact.category === 'Colony Incharge'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : contact.category === 'Security Guard'
                      ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                      : 'bg-slate-800 text-rose-400 border-slate-700'
                  }`}
                >
                  {contact.category === 'Security Guard' ? (
                    <ShieldCheck className="w-4 h-4" />
                  ) : contact.category === 'Colony Incharge' ? (
                    <Building2 className="w-4 h-4" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                </div>

                <div>
                  <div className="flex items-center space-x-1.5">
                    <strong className="text-white font-bold">{contact.title}</strong>
                    <span className="text-[9px] px-2 py-0.2 rounded-full font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {contact.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{contact.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={`tel:${contact.phone}`}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shadow"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call {contact.phone}</span>
                </a>

                {!contact.isDefault && (
                  <button
                    onClick={() => handleDeleteContact(contact.id)}
                    title="Delete contact"
                    className="p-1.5 bg-slate-800 hover:bg-rose-900 text-slate-400 hover:text-rose-200 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
