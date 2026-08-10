import React, { useState } from 'react';
import { Users, Calendar, MapPin, Heart, Star, Phone, CheckCircle, Sparkles, Award, Plus, Ticket, Trash2, User } from 'lucide-react';
import { CommunityEvent, EventRegistration, WomenEmpowermentInitiative } from '../../models/community';
import { updateRSVP, INITIAL_EMPOWERMENT, registerUserForEvent, saveEvents } from '../../api/communityApi';
import { UserSession } from '../../api/authApi';

interface CommunityScreenProps {
  session: UserSession;
  events: CommunityEvent[];
  onRefreshEvents: () => void;
  onOpenEventPass: (event: CommunityEvent, registration: EventRegistration) => void;
  onOpenAddEvent: () => void;
}

export const CommunityScreen: React.FC<CommunityScreenProps> = ({
  session,
  events,
  onRefreshEvents,
  onOpenEventPass,
  onOpenAddEvent,
}) => {
  const [activeTab, setActiveTab] = useState<'events' | 'empowerment'>('events');

  const handleRSVPClick = (eventId: string, rsvp: 'Going' | 'Maybe' | 'Not Going') => {
    updateRSVP(eventId, rsvp);
    onRefreshEvents();
  };

  const handleRegister = (evt: CommunityEvent) => {
    const { registration } = registerUserForEvent(
      evt.id,
      session.resident.name,
      session.resident.flatNumber,
      session.resident.phone,
      1
    );
    onRefreshEvents();
    onOpenEventPass(evt, registration);
  };

  const handleDeleteEvent = (eventId: string) => {
    if (window.confirm('Are you sure you want to delete this completed event record?')) {
      const remaining = events.filter((e) => e.id !== eventId);
      saveEvents(remaining);
      onRefreshEvents();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Community Events & Resident Empowerment</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Sapana Park CHS • Cultural celebrations, eco-initiatives & resident entrepreneur showcase
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenAddEvent}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Event</span>
          </button>

          {/* Tab Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('events')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'events' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Society Events
            </button>
            <button
              onClick={() => setActiveTab('empowerment')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'empowerment' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Empowerment
            </button>
          </div>
        </div>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between"
            >
              <div className={`p-4 text-white font-bold flex items-center justify-between ${evt.bannerColor || 'bg-teal-700'}`}>
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider opacity-80 block">
                    {evt.category}
                  </span>
                  <span className="text-base">{evt.title}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-slate-950/40 px-2.5 py-1 rounded-lg text-xs font-mono font-extrabold shrink-0">
                    {evt.attendeesCount} Going
                  </div>
                  <button
                    onClick={() => handleDeleteEvent(evt.id)}
                    title="Delete event details after completion"
                    className="bg-rose-950/60 hover:bg-rose-900 text-rose-300 p-1.5 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-3">
                <p className="text-xs text-slate-300 leading-relaxed">{evt.description}</p>

                <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{evt.date} • {evt.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    <span>{evt.venue}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Organizer: <strong>{evt.organizer}</strong></span>
                  </div>
                  {evt.organizerPhone && (
                    <div className="flex items-center space-x-2 text-emerald-400 font-mono">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" />
                      <a href={`tel:${evt.organizerPhone}`} className="hover:underline">
                        Call {evt.organizerPhone}
                      </a>
                    </div>
                  )}
                </div>

                {/* Registration & RSVP Controls */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-300">Registration:</span>

                  <div className="flex space-x-1.5">
                    {evt.userRSVP === 'Going' ? (
                      <button
                        onClick={() => {
                          const existingReg: EventRegistration = {
                            registrationId: `REG-SP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
                            eventId: evt.id,
                            eventTitle: evt.title,
                            residentName: session.resident.name,
                            flatNumber: session.resident.flatNumber,
                            phone: session.resident.phone,
                            seatsBooked: 1,
                            registeredAt: 'Active',
                          };
                          onOpenEventPass(evt, existingReg);
                        }}
                        className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs px-3 py-1.5 rounded-lg transition font-bold flex items-center space-x-1"
                      >
                        <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Registered (View Pass)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRegister(evt)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition shadow"
                      >
                        Register & Get Pass
                      </button>
                    )}

                    {(['Maybe', 'Not Going'] as const).map((status) => {
                      const isSelected = evt.userRSVP === status;
                      return (
                        <button
                          key={status}
                          onClick={() => handleRSVPClick(evt.id, status)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                            isSelected
                              ? 'bg-slate-700 text-white shadow'
                              : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Women Empowerment & Resident Showcase Tab */}
      {activeTab === 'empowerment' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-emerald-950 to-slate-900 border border-emerald-500/30 p-4 rounded-xl text-xs text-emerald-200 flex items-center space-x-3">
            <Award className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <strong className="text-white text-sm block">Support Local Resident Artisans & Businesses</strong>
              Explore homemade delicacies, home coaching, and Goan artisan products from fellow Sapana Park residents.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {INITIAL_EMPOWERMENT.map((emp) => (
              <div
                key={emp.id}
                className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      {emp.type}
                    </span>
                    <div className="flex items-center text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-current mr-0.5" />
                      <span>{emp.rating}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-white">{emp.title}</h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    By <strong className="text-slate-200">{emp.presenter}</strong> (Flat {emp.flatNumber})
                  </div>

                  <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                    {emp.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-emerald-400 font-semibold flex items-center space-x-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Society Verified</span>
                  </span>
                  <a
                    href={`tel:${emp.contactPhone}`}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold flex items-center space-x-1 transition"
                  >
                    <Phone className="w-3 h-3" />
                    <span>Call {emp.contactPhone}</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

