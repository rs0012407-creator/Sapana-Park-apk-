import React from 'react';
import { Home, Grid, Calendar, Building2, User } from 'lucide-react';
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
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 text-slate-300 py-1.5 px-3 shadow-2xl">
      <div className="max-w-md mx-auto flex items-center justify-around text-center">
        {/* Home / Dashboard */}
        <button
          onClick={() => onSelectTab('dashboard')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'dashboard' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">Home</span>
        </button>

        {/* Booking */}
        <button
          onClick={() => onSelectTab('booking')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'booking' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-5 h-5" />
          <span className="text-[10px]">Booking</span>
        </button>

        {/* Complaints */}
        <button
          onClick={() => onSelectTab('complaints')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition relative ${
            activeTab === 'complaints'
              ? 'text-emerald-400 font-bold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-[10px]">Complaints</span>
          {openComplaintsCount > 0 && (
            <span className="absolute top-0 right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
          )}
        </button>

        {/* Events */}
        <button
          onClick={() => onSelectTab('community')}
          className={`flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl transition ${
            activeTab === 'community' ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Events</span>
        </button>

        {/* Profile */}
        <button
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center space-y-0.5 py-1 px-2 rounded-xl text-slate-400 hover:text-slate-200 transition"
        >
          <User className="w-5 h-5 text-emerald-400" />
          <span className="text-[10px]">Profile</span>
        </button>
      </div>
    </div>
  );
};
