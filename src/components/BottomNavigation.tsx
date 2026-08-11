import React from 'react';
import { Home, Users, Building2, AlertTriangle, Calendar, User } from 'lucide-react';
import { ScreenTab } from './NavigationTabs';

interface BottomNavigationProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  onOpenProfile: () => void;
  unpaidCount?: number;
  openComplaintsCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
  onOpenProfile,
  openComplaintsCount = 0,
}) => {
  const handleMeetingsClick = () => {
    onSelectTab('community');
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/80 text-slate-300 pt-2 pb-safe px-2 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around text-center">
        {/* Home / Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-2xl transition active:scale-95 ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Home</span>
        </button>

        {/* Meetings */}
        <button
          onClick={handleMeetingsClick}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-2xl transition relative active:scale-95 ${
            activeTab === 'dashboard'
              ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-5 h-5 text-indigo-400" />
          <span className="text-[10px] tracking-tight">Meetings</span>
        </button>

        {/* Facility Booking */}
        <button
          onClick={() => onSelectTab('booking')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-2xl transition active:scale-95 ${
            activeTab === 'booking'
              ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Booking</span>
        </button>

        {/* Complaints */}
        <button
          onClick={() => onSelectTab('complaints')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-2xl transition relative active:scale-95 ${
            activeTab === 'complaints'
              ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Helpdesk</span>
          {openComplaintsCount > 0 && (
            <span className="absolute -top-1 -right-0.5 bg-amber-400 text-slate-950 font-black text-[9px] w-4 h-4 rounded-full flex items-center justify-center border border-slate-900 shadow-sm animate-pulse">
              {openComplaintsCount}
            </span>
          )}
        </button>

        {/* Events */}
        <button
          onClick={() => onSelectTab('community')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2.5 rounded-2xl transition active:scale-95 ${
            activeTab === 'community'
              ? 'text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px] tracking-tight">Events</span>
        </button>

        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-2xl text-slate-400 hover:text-slate-200 transition active:scale-95"
        >
          <User className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px] tracking-tight">Profile</span>
        </button>
      </div>
    </div>
  );
};

