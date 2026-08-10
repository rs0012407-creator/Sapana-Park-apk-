import React from 'react';
import { Ticket, X, Calendar, MapPin, Phone, User, CheckCircle2, Download, Building2, QrCode } from 'lucide-react';
import { CommunityEvent, EventRegistration } from '../models/community';

interface EventPassModalProps {
  event: CommunityEvent;
  registration: EventRegistration;
  onClose: () => void;
}

export const EventPassModal: React.FC<EventPassModalProps> = ({
  event,
  registration,
  onClose,
}) => {
  const handleDownloadPass = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative text-slate-100 flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Badge */}
        <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Ticket className="w-4 h-4" />
          <span>Official Event Registration Pass</span>
        </div>

        <h3 className="text-lg font-extrabold text-white">Sapana Park CHS</h3>
        <p className="text-xs text-slate-400">Entry Pass • Resident Registration Ticket</p>

        {/* Ticket Pass Card */}
        <div className="w-full bg-slate-950 border-2 border-dashed border-emerald-500/40 rounded-2xl p-5 my-4 text-left relative overflow-hidden shadow-inner">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-mono block">Pass Reference ID</span>
              <span className="font-mono font-black text-amber-300 text-base">{registration.registrationId}</span>
            </div>
            <div className="bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-500/30 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>CONFIRMED</span>
            </div>
          </div>

          <div className="mt-3 space-y-2 text-xs">
            <div>
              <span className="text-slate-400 text-[10px]">Event Title:</span>
              <h4 className="font-bold text-white text-sm leading-snug">{event.title}</h4>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-900">
              <div>
                <span className="text-slate-400 text-[10px] block">Date & Time:</span>
                <span className="text-emerald-300 font-semibold">{event.date} • {event.time}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Venue / Location:</span>
                <span className="text-slate-200 font-semibold">{event.venue}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
              <div>
                <span className="text-slate-400 text-[10px] block">Registered Resident:</span>
                <span className="text-white font-bold">{registration.residentName}</span>
                <span className="text-slate-400 text-[10px] block">Flat {registration.flatNumber}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Event Organizer:</span>
                <span className="text-slate-200 font-semibold">{event.organizer}</span>
                {event.organizerPhone && (
                  <a href={`tel:${event.organizerPhone}`} className="text-emerald-400 text-[11px] font-mono block hover:underline">
                    {event.organizerPhone}
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Barcode representation */}
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-center">
            <div className="space-y-0.5">
              <div className="font-mono text-[10px] tracking-widest text-slate-500">||||||||||||||||||||||||||||||||</div>
              <div className="text-[9px] text-slate-400 font-mono">{registration.registeredAt}</div>
            </div>
            <div className="bg-white p-1.5 rounded-lg shrink-0">
              <QrCode className="w-8 h-8 text-slate-950" />
            </div>
          </div>
        </div>

        <button
          onClick={handleDownloadPass}
          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-3 px-4 rounded-xl transition flex items-center justify-center space-x-2 shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Save / Print Digital Event Pass</span>
        </button>
      </div>
    </div>
  );
};
