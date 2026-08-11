import React from 'react';
import { LayoutDashboard, Wrench, Users, FileText, Contact, ShieldCheck, Building2, IndianRupee } from 'lucide-react';

export type ScreenTab = 'dashboard' | 'finance' | 'booking' | 'complaints' | 'community' | 'documents' | 'directory' | 'admin-users';

interface NavigationTabsProps {
  activeTab: ScreenTab;
  onSelectTab: (tab: ScreenTab) => void;
  unpaidCount?: number;
  openComplaintsCount: number;
  isCommitteeMember?: boolean;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  activeTab,
  onSelectTab,
  unpaidCount = 0,
  openComplaintsCount,
  isCommitteeMember = true,
}) => {
  const tabs: { id: ScreenTab; label: string; icon: React.FC<{ className?: string }>; badge?: number; adminOnly?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'finance', label: 'Bills & Dues', icon: IndianRupee, badge: unpaidCount },
    { id: 'booking', label: 'Room & Facility Booking', icon: Building2 },
    { id: 'complaints', label: 'Complaints', icon: Wrench, badge: openComplaintsCount },
    { id: 'community', label: 'Events & Meetings', icon: Users },
    { id: 'documents', label: 'Bye-Laws & NOCs', icon: FileText },
    { id: 'directory', label: 'Directory', icon: Contact },
    { id: 'admin-users', label: 'User Admin', icon: ShieldCheck, adminOnly: true },
  ];

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-slate-300">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2 no-scrollbar">
          {tabs.map((tab) => {
            if (tab.adminOnly && !isCommitteeMember) return null;
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 ? (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {tab.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
