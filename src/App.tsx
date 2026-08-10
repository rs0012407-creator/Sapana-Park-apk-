import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { NavigationTabs, ScreenTab } from './components/NavigationTabs';
import { BottomNavigation } from './components/BottomNavigation';
import { SmartAIAssistantModal } from './components/SmartAIAssistantModal';
import { OfflineNotice } from './components/OfflineNotice';

// Modals
import { ProfileModal } from './components/ProfileModal';
import { EventPassModal } from './components/EventPassModal';
import { AddEventModal } from './components/AddEventModal';
import { PermissionsModal } from './components/PermissionsModal';
import { EmergencyModal } from './components/EmergencyModal';
import { SettingsModal } from './screens/settings/SettingsModal';

// Screens
import { DashboardScreen } from './screens/home/DashboardScreen';
import { FinanceScreen } from './screens/finance/FinanceScreen';
import { ComplaintsScreen } from './screens/complaints/ComplaintsScreen';
import { CommunityScreen } from './screens/community/CommunityScreen';
import { DocumentsScreen } from './screens/documents/DocumentsScreen';
import { DirectoryScreen } from './screens/directory/DirectoryScreen';
import { AuthModal } from './screens/auth/AuthModal';
import { AdminControlPanelScreen } from './screens/admin/AdminControlPanelScreen';
import { FacilityBookingScreen } from './screens/booking/FacilityBookingScreen';

// APIs & Models
import { getStoredSession, saveSession, clearSession, UserSession, INITIAL_RESIDENTS } from './api/authApi';
import { getStoredBills } from './api/financeApi';
import { getStoredComplaints } from './api/complaintApi';
import { getStoredEvents, addNewEvent } from './api/communityApi';
import { getStoredNOCs } from './api/documentApi';

import { MaintenanceBill } from './models/finance';
import { Complaint } from './models/complaint';
import { CommunityEvent, EventRegistration } from './models/community';
import { NOCApplication } from './models/document';

// Offline Storage & Hooks
import {
  useOnlineStatus,
  saveDashboardCache,
  getDashboardCache,
  saveUserProfileCache,
  getUserProfileCache,
} from './utils/offlineStorage';

export default function App() {
  const { isOnline } = useOnlineStatus();
  const [session, setSession] = useState<UserSession>(() => {
    const cachedProfile = getUserProfileCache();
    return cachedProfile || getStoredSession();
  });
  const [activeTab, setActiveTab] = useState<ScreenTab>('dashboard');
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Profile, Settings, Permissions, Emergency & Event Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [activeLanguage, setActiveLanguage] = useState<'English' | 'Hindi'>('English');
  const [eventPassData, setEventPassData] = useState<{
    event: CommunityEvent;
    registration: EventRegistration;
  } | null>(null);

  // App Data States
  const [bills, setBills] = useState<MaintenanceBill[]>(getStoredBills());
  const [complaints, setComplaints] = useState<Complaint[]>(getStoredComplaints());
  const [events, setEvents] = useState<CommunityEvent[]>(getStoredEvents());
  const [nocs, setNocs] = useState<NOCApplication[]>(getStoredNOCs());

  // Mock Notices
  const notices = [
    {
      id: 'NTC-89',
      title: 'Annual General Body Meeting (AGM 2026) Notice',
      category: 'AGM & Meetings' as const,
      urgency: 'Important' as const,
      content:
        'Notice is hereby given that the 18th Annual General Body Meeting of Sapana Park CHS Ltd. will be held on Sunday, 30th August 2026 at 10:30 AM in the Clubhouse Multipurpose Hall to consider annual audited accounts, appointment of auditor, and election of managing committee.',
      issuedBy: 'Hon. Secretary (Rajesh Naik)',
      date: '2026-08-05',
      pinned: true,
      viewCount: 142,
    },
    {
      id: 'NTC-88',
      title: 'Monsoon Roof Waterproofing & Overhead Water Tank Flushing',
      category: 'Maintenance & Repairs' as const,
      urgency: 'Urgent' as const,
      content:
        'Flushing of Wings A, B, C, D overhead water tanks scheduled for Thursday 13th August from 1:00 PM to 5:00 PM. PWD water supply will be paused during this period. Kindly store adequate domestic water.',
      issuedBy: 'Estate Manager',
      date: '2026-08-08',
      pinned: true,
      viewCount: 98,
    },
    {
      id: 'NTC-87',
      title: 'Driveway Speed Limit (15 km/h) & Stilt Parking Regulations',
      category: 'Rule & Regulation' as const,
      urgency: 'Normal' as const,
      content:
        'All vehicle owners are requested to adhere to 15 km/h speed limit inside compound and ensure RFID tags are affixed on front windshield for automated boom barrier access.',
      issuedBy: 'Security Committee',
      date: '2026-08-01',
      pinned: false,
      viewCount: 65,
    },
  ];

  // Auto-cache dashboard and user profile data to localStorage whenever updated
  useEffect(() => {
    saveDashboardCache({
      session,
      bills,
      complaints,
      notices,
      events,
      nocs,
    });
    saveUserProfileCache(session);
  }, [session, bills, complaints, events, nocs]);

  // Load cached offline data on mount if available
  useEffect(() => {
    const cachedData = getDashboardCache();
    if (cachedData && !isOnline) {
      if (cachedData.session) setSession(cachedData.session);
      if (cachedData.bills) setBills(cachedData.bills);
      if (cachedData.complaints) setComplaints(cachedData.complaints);
      if (cachedData.events) setEvents(cachedData.events);
      if (cachedData.nocs) setNocs(cachedData.nocs);
    }
  }, [isOnline]);

  const refreshBills = () => setBills(getStoredBills());
  const refreshComplaints = () => setComplaints(getStoredComplaints());
  const refreshEvents = () => setEvents(getStoredEvents());
  const refreshNOCs = () => setNocs(getStoredNOCs());

  const handleRoleSwitch = (newRole: 'Resident' | 'Secretary') => {
    const updated: UserSession = { ...session, role: newRole };
    setSession(updated);
    saveSession(updated);
    saveUserProfileCache(updated);
  };

  const handleSignOut = () => {
    clearSession();
    const guestSession: UserSession = {
      resident: INITIAL_RESIDENTS[0],
      role: 'Resident',
      isLoggedIn: false,
    };
    setSession(guestSession);
    setIsProfileModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    saveUserProfileCache(newSession);
    refreshBills();
    refreshComplaints();
    refreshNOCs();
  };

  const handleAddEventSubmit = (newEventData: Omit<CommunityEvent, 'id' | 'attendeesCount' | 'userRSVP'>) => {
    const updatedEvents = addNewEvent(newEventData);
    setEvents(updatedEvents);
  };

  // Badges
  const userFlatBills = bills.filter((b) => b.flatNumber === session.resident.flatNumber);
  const unpaidCount = userFlatBills.filter((b) => b.status === 'Unpaid' || b.status === 'Overdue').length;

  const userComplaints = complaints.filter((c) => c.flatNumber === session.resident.flatNumber);
  const openComplaintsCount = userComplaints.filter((c) => c.status === 'Open' || c.status === 'In Progress').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 pb-16 sm:pb-0">
      {/* Offline Connectivity Status Notice Bar */}
      <OfflineNotice isOnline={isOnline} />

      {/* Top Navbar */}
      <Navbar
        session={session}
        onSwitchRole={handleRoleSwitch}
        onOpenAIHelp={() => setIsAIModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenPermissions={() => setIsPermissionsModalOpen(true)}
        onOpenEmergency={() => setIsEmergencyModalOpen(true)}
        activeScreen={activeTab}
      />

      {/* Screen Navigation Bar */}
      <NavigationTabs
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        unpaidCount={unpaidCount}
        openComplaintsCount={openComplaintsCount}
      />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardScreen
            session={session}
            bills={bills}
            complaints={complaints}
            notices={notices}
            events={events}
            onNavigate={setActiveTab}
            onOpenAIHelp={() => setIsAIModalOpen(true)}
            onOpenProfile={() => setIsProfileModalOpen(true)}
            onOpenEventPass={(evt, reg) => setEventPassData({ event: evt, registration: reg })}
            onOpenAddEvent={() => setIsAddEventModalOpen(true)}
            onOpenEmergencyModal={() => setIsEmergencyModalOpen(true)}
            onRefreshEvents={refreshEvents}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceScreen
            session={session}
            bills={bills}
            onRefreshBills={refreshBills}
          />
        )}

        {activeTab === 'booking' && (
          <FacilityBookingScreen
            session={session}
            activeLanguage={activeLanguage as any}
            onOpenAIHelp={() => setIsAIModalOpen(true)}
          />
        )}

        {activeTab === 'complaints' && (
          <ComplaintsScreen
            session={session}
            complaints={complaints}
            onRefreshComplaints={refreshComplaints}
            onOpenAIHelp={() => setIsAIModalOpen(true)}
          />
        )}

        {activeTab === 'community' && (
          <CommunityScreen
            session={session}
            events={events}
            onRefreshEvents={refreshEvents}
            onOpenEventPass={(evt, reg) => setEventPassData({ event: evt, registration: reg })}
            onOpenAddEvent={() => setIsAddEventModalOpen(true)}
          />
        )}

        {activeTab === 'documents' && (
          <DocumentsScreen
            session={session}
            nocs={nocs}
            onRefreshNOCs={refreshNOCs}
          />
        )}

        {activeTab === 'directory' && <DirectoryScreen />}

        {activeTab === 'admin-users' && <AdminControlPanelScreen />}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavigation
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        unpaidCount={unpaidCount}
        openComplaintsCount={openComplaintsCount}
      />

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 text-xs py-6 mt-12 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="font-bold text-slate-300">Sapana Park Co-operative Housing Society Ltd.</span>
            <br />
            Registration No: HSG-(G)-452 / 2008 • Goa Co-operative Societies Act, 2001 • Porvorim, Bardez, Goa 403521
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="hover:text-emerald-400 underline font-medium transition"
            >
              Switch Account / Flat
            </button>
            <span>•</span>
            <button
              onClick={() => setIsProfileModalOpen(true)}
              className="hover:text-emerald-400 font-medium transition"
            >
              Member Profile & Verification Docs
            </button>
            <span>•</span>
            <button
              onClick={() => setIsAIModalOpen(true)}
              className="hover:text-emerald-400 font-medium transition"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </footer>

      {/* Device Permissions & Settings Modal */}
      {isPermissionsModalOpen && (
        <PermissionsModal onClose={() => setIsPermissionsModalOpen(false)} />
      )}

      {/* Emergency Contacts & Colony Incharge Modal */}
      {isEmergencyModalOpen && (
        <EmergencyModal onClose={() => setIsEmergencyModalOpen(false)} />
      )}

      {/* Profile & Member Verification Modal */}
      {isProfileModalOpen && (
        <ProfileModal
          session={session}
          onClose={() => setIsProfileModalOpen(false)}
          onUpdateSession={(updatedSession) => {
            setSession(updatedSession);
            saveSession(updatedSession);
            saveUserProfileCache(updatedSession);
          }}
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        session={session}
        onUpdateSession={(updatedSession) => {
          setSession(updatedSession);
          saveSession(updatedSession);
          saveUserProfileCache(updatedSession);
        }}
        onSignOut={handleSignOut}
        activeLanguage={activeLanguage}
        onLanguageChange={setActiveLanguage}
      />

      {/* Event Ticket Pass Modal */}
      {eventPassData && (
        <EventPassModal
          event={eventPassData.event}
          registration={eventPassData.registration}
          onClose={() => setEventPassData(null)}
        />
      )}

      {/* Post Event Modal */}
      {isAddEventModalOpen && (
        <AddEventModal
          onClose={() => setIsAddEventModalOpen(false)}
          onAddEvent={handleAddEventSubmit}
        />
      )}

      {/* AI Assistant Modal */}
      <SmartAIAssistantModal
        isOpen={isAIModalOpen}
        onClose={() => setIsAIModalOpen(false)}
        flatNumber={session.resident.flatNumber}
      />

      {/* Auth Switcher Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

