import React, { useState } from 'react';
import {
  Building2,
  AlertTriangle,
  IndianRupee,
  Wrench,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Droplet,
  Megaphone,
  Pin,
  CheckCircle2,
  Bell,
  User,
  Users,
  Clock,
  MapPin,
  Phone,
  Ticket,
  ChevronRight,
  ShieldAlert,
  Search,
  ExternalLink,
  Award,
  Heart,
  Plus,
  QrCode,
  Video,
  Download,
  UserCheck,
  MessageSquare,
  FileCheck,
  Radio,
  Share2,
} from 'lucide-react';
import { UserSession } from '../../api/authApi';
import { MaintenanceBill } from '../../models/finance';
import { Complaint } from '../../models/complaint';
import { Notice } from '../../models/notice';
import { CommunityEvent, EventRegistration } from '../../models/community';
import { SocietyMeeting } from '../../models/meeting';
import { getStoredMeetings, updateMeetingRsvp, addNewMeeting } from '../../api/meetingApi';
import { ScreenTab } from '../../components/NavigationTabs';
import { formatINR } from '../../utils/currency';
import { registerUserForEvent, INITIAL_EMPOWERMENT } from '../../api/communityApi';

interface DashboardScreenProps {
  session: UserSession;
  bills: MaintenanceBill[];
  complaints: Complaint[];
  notices: Notice[];
  events: CommunityEvent[];
  onNavigate: (tab: ScreenTab) => void;
  onOpenAIHelp: () => void;
  onOpenProfile: () => void;
  onOpenEventPass: (event: CommunityEvent, registration: EventRegistration) => void;
  onOpenAddEvent: () => void;
  onOpenEmergencyModal?: () => void;
  onOpenVisitorModal?: () => void;
  onRefreshEvents?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  session,
  bills,
  complaints,
  notices,
  events,
  onNavigate,
  onOpenAIHelp,
  onOpenProfile,
  onOpenEventPass,
  onOpenAddEvent,
  onOpenEmergencyModal,
  onOpenVisitorModal,
  onRefreshEvents,
}) => {
  const [selectedEventDetails, setSelectedEventDetails] = useState<CommunityEvent | null>(null);

  // Meetings State
  const [meetings, setMeetings] = useState<SocietyMeeting[]>(() => getStoredMeetings());
  const [meetingFilter, setMeetingFilter] = useState<'All' | 'Upcoming' | 'Live Now' | 'Completed'>('All');
  const [selectedMeetingModal, setSelectedMeetingModal] = useState<SocietyMeeting | null>(null);
  const [isScheduleMeetingModalOpen, setIsScheduleMeetingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New Meeting Form State
  const [newMeetingTitle, setNewMeetingTitle] = useState('');
  const [newMeetingType, setNewMeetingType] = useState<SocietyMeeting['meetingType']>('AGM (Annual General Body)');
  const [newMeetingDate, setNewMeetingDate] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingVenue, setNewMeetingVenue] = useState('Sapana Park Clubhouse');
  const [newMeetingOnlineUrl, setNewMeetingOnlineUrl] = useState('');
  const [newMeetingAgendaInput, setNewMeetingAgendaInput] = useState('');

  const userComplaints = complaints.filter((c) => c.flatNumber === session.resident.flatNumber);
  const openComplaints = userComplaints.filter((c) => c.status === 'Open' || c.status === 'In Progress');

  const liveMeeting = meetings.find((m) => m.status === 'Live Now');
  const nextUpcomingMeeting = meetings.find((m) => m.status === 'Upcoming');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Quick Registration Handler for Events
  const handleRegisterEvent = (evt: CommunityEvent) => {
    const { registration } = registerUserForEvent(
      evt.id,
      session.resident.name,
      session.resident.flatNumber,
      session.resident.phone,
      1
    );
    if (onRefreshEvents) onRefreshEvents();
    onOpenEventPass(evt, registration);
  };

  // RSVP Handler for Meetings
  const handleRsvpChange = (
    meetingId: string,
    rsvp: 'Attending In-Person' | 'Attending Online' | 'Proxy Submitted' | 'Not Attending'
  ) => {
    const updated = updateMeetingRsvp(meetingId, rsvp);
    setMeetings(updated);
    if (selectedMeetingModal && selectedMeetingModal.id === meetingId) {
      const refreshedModal = updated.find((m) => m.id === meetingId);
      if (refreshedModal) setSelectedMeetingModal(refreshedModal);
    }
    showToast(`RSVP status updated to "${rsvp}" successfully!`);
  };

  // Create New Meeting
  const handleCreateMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMeetingTitle.trim() || !newMeetingDate.trim()) return;

    const agendas = newMeetingAgendaInput
      .split('\n')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const updatedList = addNewMeeting({
      title: newMeetingTitle,
      meetingType: newMeetingType,
      status: 'Upcoming',
      date: newMeetingDate,
      time: newMeetingTime || '10:30 AM',
      venue: newMeetingVenue,
      onlineJoinUrl: newMeetingOnlineUrl || undefined,
      organizer: session.resident.name,
      organizerRole: session.role === 'Secretary' ? 'Hon. Secretary' : 'Managing Committee Member',
      organizerPhone: session.resident.phone,
      agendaItems: agendas.length > 0 ? agendas : ['1. General Society Discussion & Budget Review.'],
      quorumRequired: 20,
    });

    setMeetings(updatedList);
    setIsScheduleMeetingModalOpen(false);
    setNewMeetingTitle('');
    setNewMeetingDate('');
    setNewMeetingTime('');
    setNewMeetingOnlineUrl('');
    setNewMeetingAgendaInput('');
    showToast('New Society Meeting scheduled & published to residents!');
  };

  // Filtered Meetings
  const filteredMeetings = meetings.filter((m) => {
    if (meetingFilter === 'All') return true;
    return m.status === meetingFilter;
  });

  // Quick Action Buttons Grid Data
  const quickActions = [
    {
      id: 'meetings',
      title: 'Society Meetings',
      subtitle: `${meetings.filter((m) => m.status !== 'Completed').length} Active / Upcoming`,
      icon: Users,
      color: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/40',
      action: () => {
        const el = document.getElementById('society-meetings-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
    },
    {
      id: 'booking',
      title: 'Room & Facility Booking',
      subtitle: 'Guest Rooms & Halls',
      icon: Building2,
      color: 'from-purple-500/20 to-indigo-500/10 text-purple-300 border-purple-500/30',
      action: () => onNavigate('booking'),
    },
    {
      id: 'notices',
      title: 'Notices',
      subtitle: `${notices.length} Circulars`,
      icon: Megaphone,
      color: 'from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30',
      action: () => onNavigate('documents'),
    },
    {
      id: 'complaints',
      title: 'Complaints',
      subtitle: `${openComplaints.length} Open Tickets`,
      icon: Wrench,
      color: 'from-sky-500/20 to-blue-500/10 text-sky-400 border-sky-500/30',
      action: () => onNavigate('complaints'),
    },
    {
      id: 'visitors',
      title: 'Visitors',
      subtitle: 'Gate Pass & Entry',
      icon: ShieldCheck,
      color: 'from-teal-500/20 to-cyan-500/10 text-teal-300 border-teal-500/30',
      action: () => (onOpenVisitorModal ? onOpenVisitorModal() : onNavigate('directory')),
    },
    {
      id: 'documents',
      title: 'Documents',
      subtitle: 'Bye-Laws & NOCs',
      icon: FileText,
      color: 'from-indigo-500/20 to-purple-500/10 text-indigo-400 border-indigo-500/30',
      action: () => onNavigate('documents'),
    },
    {
      id: 'events',
      title: 'Events',
      subtitle: `${events.length} Upcoming`,
      icon: Calendar,
      color: 'from-amber-500/20 to-yellow-500/10 text-amber-300 border-amber-500/30',
      action: () => onNavigate('community'),
    },
    {
      id: 'emergency',
      title: 'Emergency',
      subtitle: '24/7 Helpline',
      icon: ShieldAlert,
      color: 'from-rose-600/30 to-red-600/20 text-rose-400 border-rose-500/40',
      action: () => (onOpenEmergencyModal ? onOpenEmergencyModal() : onNavigate('directory')),
    },
  ];

  // Jump To Shortcuts
  const jumpToShortcuts = [
    {
      label: 'Jump to Meetings',
      icon: Users,
      customAction: () => {
        const el = document.getElementById('society-meetings-section');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      },
    },
    { label: 'Jump to Notices', tab: 'documents' as ScreenTab, icon: Megaphone },
    { label: 'Jump to Complaints', tab: 'complaints' as ScreenTab, icon: Wrench },
    { label: 'Jump to Events', tab: 'community' as ScreenTab, icon: Calendar },
    { label: 'Jump to Documents', tab: 'documents' as ScreenTab, icon: FileText },
    { label: 'Jump to Visitors', tab: 'directory' as ScreenTab, icon: ShieldCheck },
    { label: 'Jump to Emergency', tab: 'directory' as ScreenTab, icon: Phone },
    { label: 'Jump to Profile', tab: 'dashboard' as ScreenTab, customAction: onOpenProfile, icon: User },
  ];

  // Recent Activity Feed
  const recentActivities = [
    {
      id: 'act-1',
      title: 'AGM 2026 Meeting Notice & Audited Financial Agenda Issued',
      time: '1 hour ago',
      category: 'Meeting',
      icon: Users,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      id: 'act-2',
      title: 'Emergency Water Supply & Security Meeting Virtual Room Created',
      time: '3 hours ago',
      category: 'Meeting',
      icon: Video,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      id: 'act-3',
      title: 'Goa Liberation Cultural Independence Night RSVP Open',
      time: '1 day ago',
      category: 'Event',
      icon: Ticket,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Section */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-3xl p-5 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Building2 className="w-80 h-80 text-emerald-400" />
        </div>

        <div className="relative z-10 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-extrabold shadow-lg">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800/60 inline-block">
                  Goa Regd. No. 452
                </span>
                <h1 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-tight mt-0.5">
                  Sapana Park Co-operative Housing Society
                </h1>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('documents')}
                title="Society Notices & Circulars"
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 rounded-2xl border border-slate-700/80 transition relative"
              >
                <Bell className="w-4 h-4" />
                {notices.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                )}
              </button>

              <button
                onClick={onOpenProfile}
                title="Resident Profile"
                className="p-2 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 rounded-2xl border border-emerald-500/40 transition flex items-center space-x-1.5 px-3"
              >
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold hidden sm:inline">Profile</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Welcome to Sapana Park Society 👋
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm mt-1">
                Resident: <strong className="text-emerald-400">{session.resident.name}</strong> • Flat <strong className="text-white font-mono">{session.resident.flatNumber}</strong> (Wing {session.resident.wing}) • Member ID: <span className="font-mono text-emerald-300">{session.resident.memberId}</span>
              </p>
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={onOpenAIHelp}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-lg shadow-emerald-950/40"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                <span>AI Help Desk</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Society Meeting Alert Banner (Live Now or Next Upcoming AGM) */}
      {liveMeeting ? (
        <div className="bg-gradient-to-r from-rose-950/80 via-slate-900 to-indigo-950 border border-rose-500/60 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 shrink-0 mt-0.5">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-rose-600 text-white text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full animate-pulse">
                  🔴 LIVE NOW
                </span>
                <span className="text-[11px] font-mono font-bold text-rose-300">
                  {liveMeeting.meetingType}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                {liveMeeting.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{liveMeeting.venue}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Organizer: {liveMeeting.organizer}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            {liveMeeting.onlineJoinUrl && (
              <a
                href={liveMeeting.onlineJoinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-none bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg shadow-rose-950/50"
              >
                <Video className="w-4 h-4" />
                <span>Join Virtual Zoom / Meet</span>
              </a>
            )}
            <button
              onClick={() => setSelectedMeetingModal(liveMeeting)}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs px-3.5 py-2.5 rounded-xl border border-slate-700 transition"
            >
              Agenda Details
            </button>
          </div>
        </div>
      ) : nextUpcomingMeeting ? (
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950 border border-emerald-500/50 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start space-x-3.5">
            <div className="p-3 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 shrink-0 mt-0.5">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black uppercase font-mono px-2 py-0.5 rounded-full">
                  Upcoming Meeting
                </span>
                <span className="text-[11px] font-mono font-bold text-emerald-400">
                  {nextUpcomingMeeting.meetingType}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                {nextUpcomingMeeting.title}
              </h3>
              <p className="text-xs text-slate-300 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="flex items-center space-x-1">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{nextUpcomingMeeting.date}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{nextUpcomingMeeting.time}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>{nextUpcomingMeeting.venue}</span>
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 w-full md:w-auto shrink-0">
            <button
              onClick={() => setSelectedMeetingModal(nextUpcomingMeeting)}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 shadow-lg"
            >
              <FileText className="w-4 h-4" />
              <span>View Agenda & RSVP</span>
            </button>
          </div>
        </div>
      ) : null}

      {/* Quick Action Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Quick Actions & Services
          </h3>
          <span className="text-[11px] text-emerald-400 font-semibold">Touch friendly</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((act) => {
            const Icon = act.icon;
            return (
              <div
                key={act.id}
                onClick={act.action}
                className={`bg-gradient-to-br ${act.color} bg-slate-900/80 hover:bg-slate-800 border p-3.5 rounded-2xl cursor-pointer transition-all hover:scale-[1.02] shadow-md flex items-center space-x-3 group`}
              >
                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 shrink-0 group-hover:scale-110 transition">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-extrabold text-sm text-white group-hover:text-emerald-300 transition truncate">
                    {act.title}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">{act.subtitle}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Jump To" Shortcut Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>"Jump To" Shortcut Navigation</span>
          </span>
          <span className="text-[10px] text-slate-500">Fast direct screen access</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {jumpToShortcuts.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => {
                  if (item.customAction) {
                    item.customAction();
                  } else if (item.tab) {
                    onNavigate(item.tab);
                  }
                }}
                className="bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 hover:text-emerald-300 text-xs px-3 py-2 rounded-xl transition flex items-center space-x-2 shrink-0 font-medium group"
              >
                <Icon className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DEDICATED SOCIETY MEETINGS & AGM FEATURE SECTION (बैठक / मीटिंग्स) */}
      <div id="society-meetings-section" className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold mb-1">
              <Users className="w-3.5 h-3.5" />
              <span>Society Governance • बैठक / मीटिंग्स</span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center space-x-2">
              <span>Society Meetings, AGM & Resolutions</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Participate in society general body meetings, review meeting agendas, track quorum, download official minutes, and submit RSVP.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setIsScheduleMeetingModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Meeting</span>
            </button>
          </div>
        </div>

        {/* Meeting Filter Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar">
          {(['All', 'Upcoming', 'Live Now', 'Completed'] as const).map((filter) => {
            const count = filter === 'All' ? meetings.length : meetings.filter((m) => m.status === filter).length;
            const isActive = meetingFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setMeetingFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <span>{filter} Meetings</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-emerald-950 text-emerald-200' : 'bg-slate-900 text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Meetings Grid Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredMeetings.map((mtg) => (
            <div
              key={mtg.id}
              className={`bg-slate-950 border rounded-2xl p-5 shadow-lg flex flex-col justify-between space-y-4 transition ${
                mtg.status === 'Live Now'
                  ? 'border-rose-500/60 ring-1 ring-rose-500/30'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-3">
                {/* Status Badges Header */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {mtg.meetingType}
                  </span>

                  {mtg.status === 'Live Now' ? (
                    <span className="bg-rose-600 text-white text-[10px] font-extrabold uppercase font-mono px-2.5 py-0.5 rounded-full flex items-center space-x-1 animate-pulse">
                      <Radio className="w-3 h-3" />
                      <span>Live Virtual Meeting</span>
                    </span>
                  ) : mtg.status === 'Upcoming' ? (
                    <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                      Upcoming
                    </span>
                  ) : (
                    <span className="bg-slate-800 text-slate-400 text-[10px] font-bold uppercase font-mono px-2.5 py-0.5 rounded-full border border-slate-700">
                      Completed
                    </span>
                  )}
                </div>

                {/* Meeting Title */}
                <h3 className="font-extrabold text-base text-white leading-snug">{mtg.title}</h3>

                {/* Date, Time, Location & Organizer Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-900/80 p-3 rounded-xl border border-slate-800/80">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span className="font-semibold text-slate-200">{mtg.date}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{mtg.time}</span>
                  </div>

                  <div className="flex items-center space-x-2 sm:col-span-2">
                    <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                    <span className="truncate">{mtg.venue}</span>
                  </div>

                  <div className="flex items-center space-x-2 sm:col-span-2 pt-1 border-t border-slate-800 text-[11px] text-slate-400">
                    <UserCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                    <span>
                      Organizer: <strong className="text-slate-200">{mtg.organizer}</strong> ({mtg.organizerRole}) • <a href={`tel:${mtg.organizerPhone}`} className="text-emerald-400 font-mono hover:underline">{mtg.organizerPhone}</a>
                    </span>
                  </div>
                </div>

                {/* Agenda Discussion Points Preview */}
                <div className="space-y-1.5">
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center space-x-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Meeting Agenda Key Discussion Points:</span>
                  </div>
                  <ul className="text-xs text-slate-300 space-y-1 bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                    {mtg.agendaItems.slice(0, 3).map((item, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{item}</span>
                      </li>
                    ))}
                    {mtg.agendaItems.length > 3 && (
                      <li className="text-[11px] text-emerald-400 font-semibold pt-0.5">
                        + {mtg.agendaItems.length - 3} more discussion points...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Attendance & Quorum Tracker */}
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-emerald-400" />
                      <span>In-Person: <strong className="text-white font-mono">{mtg.confirmedAttendeesCount}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Video className="w-3.5 h-3.5 text-sky-400" />
                      <span>Online: <strong className="text-white font-mono">{mtg.onlineAttendeesCount}</strong></span>
                    </div>
                    <div className="flex items-center space-x-1 hidden sm:flex">
                      <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                      <span>Proxy: <strong className="text-white font-mono">{mtg.proxyCount}</strong></span>
                    </div>
                  </div>

                  <span className="text-[10px] bg-slate-800 border border-slate-700 px-2 py-0.5 rounded font-mono font-bold text-emerald-300">
                    Quorum: {mtg.confirmedAttendeesCount + mtg.onlineAttendeesCount}/{mtg.quorumRequired}
                  </span>
                </div>

                {/* User RSVP Quick Selection */}
                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">Your Attendance RSVP:</span>
                    <span className="text-[11px] font-bold text-emerald-400 font-mono">
                      {mtg.userRsvpStatus || 'Not Selected'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px]">
                    {[
                      { key: 'Attending In-Person', label: 'In-Person', icon: Users },
                      { key: 'Attending Online', label: 'Online Zoom', icon: Video },
                      { key: 'Proxy Submitted', label: 'Submit Proxy', icon: FileCheck },
                      { key: 'Not Attending', label: 'Can\'t Attend', icon: CheckCircle2 },
                    ].map((opt) => {
                      const Icon = opt.icon;
                      const isSelected = mtg.userRsvpStatus === opt.key;
                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => handleRsvpChange(mtg.id, opt.key as any)}
                          className={`p-1.5 rounded-lg border transition font-medium flex items-center justify-center space-x-1 ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                              : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-750'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2">
                <div className="flex items-center space-x-2 w-full sm:w-auto">
                  {mtg.onlineJoinUrl && (
                    <a
                      href={mtg.onlineJoinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-sky-600 hover:bg-sky-500 text-white text-xs px-3 py-2 rounded-xl transition font-bold flex items-center space-x-1 shadow"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Call</span>
                    </a>
                  )}

                  {mtg.agendaPdfName && (
                    <button
                      onClick={() => showToast(`Downloading official meeting agenda: ${mtg.agendaPdfName}`)}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700 transition flex items-center space-x-1"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Agenda PDF</span>
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setSelectedMeetingModal(mtg)}
                  className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-emerald-300 hover:text-white font-bold text-xs px-4 py-2 rounded-xl transition border border-slate-700 flex items-center justify-center space-x-1"
                >
                  <span>Full Agenda & Minutes</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated "Upcoming Events" Horizontal Scrolling Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-extrabold text-white">Upcoming Community Cultural Events</h3>
          </div>

          <button
            onClick={onOpenAddEvent}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1 shadow-md"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Event</span>
          </button>
        </div>

        <div className="flex space-x-4 overflow-x-auto pb-2 no-scrollbar">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 shadow-lg min-w-[280px] sm:min-w-[320px] max-w-[320px] flex flex-col justify-between shrink-0 space-y-3"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {evt.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {evt.attendeesCount} Registered
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white line-clamp-2 leading-snug">{evt.title}</h4>
                <p className="text-xs text-slate-300 mt-1.5 line-clamp-2 leading-relaxed">{evt.description}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center space-x-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{evt.date} • {evt.time}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">{evt.venue}</span>
                </div>
                {evt.organizerPhone && (
                  <div className="flex items-center space-x-1.5 text-[11px] text-slate-300">
                    <Phone className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>Org: {evt.organizer} ({evt.organizerPhone})</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => setSelectedEventDetails(evt)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-xl transition flex-1 font-semibold"
                >
                  View Details
                </button>

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
                        registeredAt: 'Just now',
                      };
                      onOpenEventPass(evt, existingReg);
                    }}
                    className="bg-emerald-950 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs px-3 py-1.5 rounded-xl transition font-bold flex items-center space-x-1"
                  >
                    <Ticket className="w-3.5 h-3.5 text-emerald-400" />
                    <span>View Pass</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleRegisterEvent(evt)}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-xl transition font-bold shadow flex-1 text-center"
                  >
                    Register / RSVP
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Grid: Latest Notices & Utility / Status Tracker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Megaphone className="w-5 h-5 text-emerald-400" />
                <h3 className="text-white font-extrabold text-base">Latest Notices & Announcements</h3>
              </div>
              <button
                onClick={() => onNavigate('documents')}
                className="text-xs text-emerald-400 hover:underline font-bold flex items-center space-x-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {notices.slice(0, 3).map((notice) => (
                <div
                  key={notice.id}
                  className={`p-4 rounded-2xl border transition ${
                    notice.pinned
                      ? 'bg-slate-800/90 border-emerald-500/40 shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2">
                      {notice.pinned && <Pin className="w-3.5 h-3.5 text-emerald-400 shrink-0 rotate-45" />}
                      <span className="font-bold text-sm text-slate-100">{notice.title}</span>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase shrink-0 ${
                        notice.urgency === 'Urgent'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : notice.urgency === 'Important'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {notice.urgency}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2 leading-relaxed whitespace-pre-wrap">
                    {notice.content}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-700/50">
                    <span>Issued by: {notice.issuedBy}</span>
                    <span>{notice.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-white font-extrabold text-base">Community Highlights & Women Empowerment</h3>
              </div>
              <button
                onClick={() => onNavigate('community')}
                className="text-xs text-emerald-400 hover:underline font-bold"
              >
                Explore All →
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {INITIAL_EMPOWERMENT.slice(0, 2).map((emp) => (
                <div key={emp.id} className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-bold">
                      {emp.type}
                    </span>
                    <span className="text-amber-400 font-bold">★ {emp.rating}</span>
                  </div>
                  <h4 className="font-bold text-white text-sm">{emp.title}</h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{emp.description}</p>
                  <div className="text-[10px] text-slate-300 pt-1 border-t border-slate-900 flex justify-between items-center">
                    <span>By {emp.presenter} ({emp.flatNumber})</span>
                    <a href={`tel:${emp.contactPhone}`} className="text-emerald-400 font-bold hover:underline">
                      Call {emp.contactPhone}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity & Goa Utility Tracker */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3">
            <h3 className="text-white font-bold text-sm mb-2 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              <span>Recent Society Activities</span>
            </h3>

            <div className="space-y-2.5">
              {recentActivities.map((act) => {
                const Icon = act.icon;
                return (
                  <div key={act.id} className="flex items-start space-x-3 text-xs">
                    <div className={`p-2 rounded-xl border ${act.color} shrink-0 mt-0.5`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200 leading-snug">{act.title}</h4>
                      <span className="text-[10px] text-slate-500">{act.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center space-x-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>Goa Utility Service Status</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Droplet className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-semibold text-slate-200">PWD Water Supply</div>
                    <div className="text-[10px] text-slate-400">Assagao Pumping Line</div>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                  Normal (6-8 AM)
                </span>
              </div>

              <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-semibold text-slate-200">Electricity Grid</div>
                    <div className="text-[10px] text-slate-400">Porvorim Substation 33KV</div>
                  </div>
                </div>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded font-bold border border-emerald-500/30">
                  DG Backup Ready
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>Key Society Emergency Contacts</span>
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Main Security Gate Pass</span>
                <a href="tel:9822001100" className="font-mono text-emerald-400 font-semibold hover:underline">
                  +91 98220 01100
                </a>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Hon. Secretary (Rajesh Naik)</span>
                <a href="tel:9822145670" className="font-mono text-emerald-400 font-semibold hover:underline">
                  +91 98221 45670
                </a>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Plumbing Emergency</span>
                <a href="tel:9422488990" className="font-mono text-emerald-400 font-semibold hover:underline">
                  +91 94224 88990
                </a>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Schindler Lift Helpline</span>
                <a href="tel:18002004545" className="font-mono text-emerald-400 font-semibold hover:underline">
                  1800 200 4545
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SCHEDULE NEW MEETING MODAL */}
      {isScheduleMeetingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-black text-white">Schedule Society Meeting</h3>
              </div>
              <button
                onClick={() => setIsScheduleMeetingModalOpen(false)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMeetingSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold mb-1">Meeting Title *</label>
                <input
                  type="text"
                  value={newMeetingTitle}
                  onChange={(e) => setNewMeetingTitle(e.target.value)}
                  placeholder="e.g. Special Meeting on Terrace Waterproofing & Security"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Meeting Type</label>
                  <select
                    value={newMeetingType}
                    onChange={(e) => setNewMeetingType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="AGM (Annual General Body)">AGM (Annual General Body)</option>
                    <option value="EGM (Extraordinary General Body)">EGM (Extraordinary General Body)</option>
                    <option value="Managing Committee Review">Managing Committee Review</option>
                    <option value="Resident General Body">Resident General Body</option>
                    <option value="Emergency Security & Water">Emergency Security & Water</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Date *</label>
                  <input
                    type="text"
                    value={newMeetingDate}
                    onChange={(e) => setNewMeetingDate(e.target.value)}
                    placeholder="e.g. Sunday, 30th August 2026"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-bold mb-1">Time</label>
                  <input
                    type="text"
                    value={newMeetingTime}
                    onChange={(e) => setNewMeetingTime(e.target.value)}
                    placeholder="e.g. 10:30 AM - 12:30 PM"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Venue / Location</label>
                  <input
                    type="text"
                    value={newMeetingVenue}
                    onChange={(e) => setNewMeetingVenue(e.target.value)}
                    placeholder="e.g. Community Hall & Zoom Online"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Virtual Meeting Link (Zoom / Meet URL)</label>
                <input
                  type="url"
                  value={newMeetingOnlineUrl}
                  onChange={(e) => setNewMeetingOnlineUrl(e.target.value)}
                  placeholder="https://meet.google.com/spk-2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold mb-1">Agenda Points (One per line)</label>
                <textarea
                  value={newMeetingAgendaInput}
                  onChange={(e) => setNewMeetingAgendaInput(e.target.value)}
                  rows={4}
                  placeholder={'1. Confirmation of Previous Minutes\n2. Approval of Financial Maintenance Budget\n3. Elevator AMC Contractor Selection'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white leading-relaxed"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsScheduleMeetingModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow"
                >
                  Publish Meeting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL MEETING DETAILS MODAL */}
      {selectedMeetingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl relative text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-black uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {selectedMeetingModal.meetingType}
                </span>
                <h3 className="text-lg font-black text-white mt-1 leading-snug">
                  {selectedMeetingModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedMeetingModal(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full shrink-0"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-white">{selectedMeetingModal.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{selectedMeetingModal.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                <span>{selectedMeetingModal.venue}</span>
              </div>
              <div className="flex items-center space-x-2">
                <UserCheck className="w-4 h-4 text-teal-400 shrink-0" />
                <span>
                  Organizer: <strong className="text-white">{selectedMeetingModal.organizer}</strong> ({selectedMeetingModal.organizerRole})
                </span>
              </div>
              {selectedMeetingModal.organizerPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Contact Phone: <a href={`tel:${selectedMeetingModal.organizerPhone}`} className="text-emerald-300 font-mono underline">{selectedMeetingModal.organizerPhone}</a>
                  </span>
                </div>
              )}
            </div>

            {/* Agenda Items List */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <span>Official Meeting Agenda Items:</span>
              </h4>
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
                {selectedMeetingModal.agendaItems.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {selectedMeetingModal.notesOrResolution && (
              <div className="bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-500/30 text-xs text-emerald-200 space-y-1">
                <div className="font-bold text-emerald-400 flex items-center space-x-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>Notes & Passed Resolutions:</span>
                </div>
                <p className="leading-relaxed">{selectedMeetingModal.notesOrResolution}</p>
              </div>
            )}

            {/* Attendance & RSVP Selector */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-200">Update Your Attendance RSVP:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {selectedMeetingModal.userRsvpStatus || 'Pending'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { key: 'Attending In-Person', label: 'In-Person', icon: Users },
                  { key: 'Attending Online', label: 'Online Zoom/Meet', icon: Video },
                  { key: 'Proxy Submitted', label: 'Submit Proxy', icon: FileCheck },
                  { key: 'Not Attending', label: 'Cannot Attend', icon: CheckCircle2 },
                ].map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedMeetingModal.userRsvpStatus === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => handleRsvpChange(selectedMeetingModal.id, opt.key as any)}
                      className={`p-2 rounded-xl border transition text-xs font-bold flex items-center justify-center space-x-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-400 shadow'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                {selectedMeetingModal.onlineJoinUrl && (
                  <a
                    href={selectedMeetingModal.onlineJoinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 sm:flex-none bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs px-4 py-2 rounded-xl transition flex items-center justify-center space-x-1.5"
                  >
                    <Video className="w-4 h-4" />
                    <span>Join Online Meeting</span>
                  </a>
                )}
              </div>

              <button
                onClick={() => setSelectedMeetingModal(null)}
                className="w-full sm:w-auto px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEventDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl relative text-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {selectedEventDetails.category}
                </span>
                <h3 className="text-lg font-black text-white mt-1">{selectedEventDetails.title}</h3>
              </div>
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">
              {selectedEventDetails.description}
            </p>

            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>{selectedEventDetails.date} • {selectedEventDetails.time}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-amber-400" />
                <span>{selectedEventDetails.venue}</span>
              </div>
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-sky-400" />
                <span>Organizer: {selectedEventDetails.organizer}</span>
              </div>
              {selectedEventDetails.organizerPhone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-teal-400" />
                  <span>Contact Phone: <a href={`tel:${selectedEventDetails.organizerPhone}`} className="text-emerald-300 font-mono underline">{selectedEventDetails.organizerPhone}</a></span>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const evt = selectedEventDetails;
                  setSelectedEventDetails(null);
                  handleRegisterEvent(evt);
                }}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow"
              >
                Register & Get Pass
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
