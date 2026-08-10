import React, { useState } from 'react';
import { X, Calendar, MapPin, Phone, User, Plus, Image as ImageIcon, Sparkles } from 'lucide-react';
import { CommunityEvent } from '../models/community';

interface AddEventModalProps {
  onClose: () => void;
  onAddEvent: (newEvent: Omit<CommunityEvent, 'id' | 'attendeesCount' | 'userRSVP'>) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  onClose,
  onAddEvent,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CommunityEvent['category']>('Cultural');
  const [date, setDate] = useState('2026-08-30');
  const [time, setTime] = useState('06:00 PM onwards');
  const [venue, setVenue] = useState('Sapana Park Clubhouse & Lawns');
  const [organizer, setOrganizer] = useState('Cultural Committee');
  const [organizerPhone, setOrganizerPhone] = useState('+91 98221 45670');
  const [description, setDescription] = useState('');
  const [bannerColor, setBannerColor] = useState('bg-emerald-600');
  const [posterImage, setPosterImage] = useState('');
  const [requiresRegistration, setRequiresRegistration] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    onAddEvent({
      title,
      category,
      date,
      time,
      venue,
      organizer,
      organizerPhone,
      description,
      bannerColor,
      posterImage,
      requiresRegistration,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg my-auto p-6 shadow-2xl relative text-slate-100 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Post New Society Event / Program</h2>
              <p className="text-xs text-slate-400">Add event details, location & organizer contact number</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Event / Program Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Diya Lighting & Rangoli Contest 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="Festival">Festival</option>
                <option value="Meeting">Meeting / AGM</option>
                <option value="Cultural">Cultural Event</option>
                <option value="Sports">Sports Championship</option>
                <option value="Cleanliness Drive">Eco / Cleanliness Drive</option>
                <option value="Workshop">Workshop & Training</option>
                <option value="Program">Community Program</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Event Date</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Time Schedule</label>
              <input
                type="text"
                required
                placeholder="e.g. 05:00 PM - 08:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Venue / Location *</label>
              <input
                type="text"
                required
                placeholder="e.g. Clubhouse Lawns / Amphitheatre"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Organizer Name / Team *</label>
              <input
                type="text"
                required
                placeholder="e.g. Sunita Naik (Cultural Lead)"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Organizer Contact Phone *</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98221 45670"
                value={organizerPhone}
                onChange={(e) => setOrganizerPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] text-slate-400 block mb-1">Event Details & Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide complete event details, schedule, requirements, and highlights..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">Banner Theme Color</label>
              <select
                value={bannerColor}
                onChange={(e) => setBannerColor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white focus:ring-1 focus:ring-emerald-500"
              >
                <option value="bg-emerald-600">Emerald Green</option>
                <option value="bg-teal-700">Teal Blue</option>
                <option value="bg-amber-600">Golden Amber</option>
                <option value="bg-indigo-700">Deep Indigo</option>
                <option value="bg-rose-700">Rose Red</option>
              </select>
            </div>

            <div className="flex items-center pt-5">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={requiresRegistration}
                  onChange={(e) => setRequiresRegistration(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-slate-200 text-xs font-semibold">Generate Resident Registration Passes</span>
              </label>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-lg"
            >
              Publish Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
