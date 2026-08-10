import React, { useState } from 'react';
import {
  Building2,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Plus,
  Shield,
  FileText,
  IndianRupee,
  Search,
  Filter,
  Info,
  Check,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  CalendarCheck,
  Sparkles,
  Download,
  AlertCircle,
  Lock,
  Edit,
  Sliders,
} from 'lucide-react';
import { Facility, FacilityBooking, FacilityStatus, BookingStatus } from '../../models/booking';
import {
  getStoredFacilities,
  getStoredBookings,
  createFacilityBooking,
  updateBookingStatusApi,
  checkFacilityAvailability,
  saveFacilities,
} from '../../api/bookingApi';
import { UserSession } from '../../api/authApi';
import { formatINR } from '../../utils/currency';
import { LanguageCode, t } from '../../utils/i18n';

interface FacilityBookingScreenProps {
  session: UserSession;
  activeLanguage: LanguageCode;
  onOpenAIHelp?: () => void;
}

export const FacilityBookingScreen: React.FC<FacilityBookingScreenProps> = ({
  session,
  activeLanguage,
  onOpenAIHelp,
}) => {
  const [activeTab, setActiveTab] = useState<'facilities' | 'calendar' | 'my-bookings' | 'admin-approvals'>('facilities');
  
  // Data State
  const [facilities, setFacilities] = useState<Facility[]>(() => getStoredFacilities());
  const [bookings, setBookings] = useState<FacilityBooking[]>(() => getStoredBookings());
  
  // Selected facility for booking modal
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  
  // Toast notice
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Booking Form Fields
  const [bookingDate, setBookingDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [guestCount, setGuestCount] = useState<number>(2);
  const [purpose, setPurpose] = useState<string>('');
  const [specialRequirements, setSpecialRequirements] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  
  // Guest Info State
  const [guestName, setGuestName] = useState<string>('');
  const [guestMobile, setGuestMobile] = useState<string>('');
  const [guestRelation, setGuestRelation] = useState<string>('Relative / Family Guest');
  const [guestVehicle, setGuestVehicle] = useState<string>('');

  // Rules Acceptance Check
  const [rulesAccepted, setRulesAccepted] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Admin Modal / Action state
  const [selectedBookingDetail, setSelectedBookingDetail] = useState<FacilityBooking | null>(null);
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBookModal = (fac: Facility) => {
    setSelectedFacility(fac);
    setSelectedSlot(fac.timeSlots[0] || 'Full Day');
    setGuestCount(Math.min(fac.capacity, 2));
    setPurpose('');
    setGuestName('');
    setGuestMobile('');
    setGuestVehicle('');
    setRulesAccepted(false);
    setBookingError(null);
    setIsBookingModalOpen(true);
  };

  const handleFormSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedFacility) return;

    if (!rulesAccepted) {
      setBookingError('You must read and accept the facility rules & terms before submitting booking.');
      return;
    }

    if (!purpose.trim()) {
      setBookingError('Please enter the purpose of booking (e.g., Birthday Party, Family Guest Stay).');
      return;
    }

    // Availability Check
    const check = checkFacilityAvailability(selectedFacility.id, bookingDate, selectedSlot);
    if (!check.available) {
      setBookingError(`This facility is already booked for date ${bookingDate}. Please choose another date or slot.`);
      return;
    }

    // Prepare booking record
    const newBooking = createFacilityBooking({
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      bookingDate,
      startTime: selectedSlot,
      endTime: 'As per slot timing',
      durationHours: selectedFacility.minDurationHours,
      
      residentName: session.resident.name,
      residentEmail: session.resident.email,
      residentPhone: session.resident.phone,
      colonyName: 'Sapana Park CHS',
      flatNumber: session.resident.flatNumber,
      blockNumber: session.resident.wing,
      floorNumber: '3rd Floor',
      residentType: session.resident.residentType,
      memberId: session.resident.memberId,

      guestCount,
      purpose,
      specialRequirements,
      additionalNotes,
      guests: guestName.trim()
        ? [
            {
              id: `GST-${Date.now()}`,
              guestName: guestName.trim(),
              mobileNumber: guestMobile.trim() || session.resident.phone,
              guestCount,
              relationship: guestRelation,
              vehicleNumber: guestVehicle.trim(),
            },
          ]
        : [],

      status: 'Pending',
      bookingFee: selectedFacility.bookingFeeINR,
      securityDeposit: selectedFacility.securityDepositINR,
      totalAmount: selectedFacility.bookingFeeINR + selectedFacility.securityDepositINR,
      paymentStatus: 'Pending',
      rulesAccepted: true,
      adminNotes: 'Booking submitted and waiting for Society Manager / Secretary verification.',
    });

    setBookings(getStoredBookings());
    setIsBookingModalOpen(false);
    showToast(`Booking request #${newBooking.bookingId} submitted successfully!`);
    setActiveTab('my-bookings');
  };

  const handleUpdateStatus = (bookingId: string, status: BookingStatus) => {
    const updated = updateBookingStatusApi(bookingId, status, adminNoteInput || undefined);
    setBookings(updated);
    if (selectedBookingDetail) {
      const refreshed = updated.find((b) => b.bookingId === bookingId);
      if (refreshed) setSelectedBookingDetail(refreshed);
    }
    setAdminNoteInput('');
    showToast(`Booking status updated to "${status}".`);
  };

  // Filtered lists
  const myBookings = bookings.filter(
    (b) => b.flatNumber === session.resident.flatNumber || b.residentEmail === session.resident.email
  );

  const filteredFacilities = facilities.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'All' || fac.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const isCommittee = session.role === 'Secretary' || session.role === 'Treasurer' || session.role === 'Admin';

  return (
    <div className="space-y-6 pb-16">
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-950 border border-emerald-500/60 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-extrabold shadow-lg shrink-0">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-800/80 inline-block">
              Colony Facilities & Spaces
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              {t('booking', activeLanguage)}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              Book guest rooms, community hall, party lawn, meeting rooms & sports arena online.
            </p>
          </div>
        </div>

        {onOpenAIHelp && (
          <button
            onClick={onOpenAIHelp}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-950/40 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Facility Guide</span>
          </button>
        )}
      </div>

      {/* Main Screen Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800">
        {[
          { id: 'facilities', label: t('facilities', activeLanguage), icon: Building2, count: facilities.length },
          { id: 'calendar', label: 'Availability Calendar', icon: CalendarIcon },
          { id: 'my-bookings', label: t('my_bookings', activeLanguage), icon: CalendarCheck, count: myBookings.length },
          ...(isCommittee
            ? [
                {
                  id: 'admin-approvals',
                  label: t('admin_booking', activeLanguage),
                  icon: Shield,
                  count: bookings.filter((b) => b.status === 'Pending').length,
                },
              ]
            : []),
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 shrink-0 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-950/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? 'bg-indigo-950 text-indigo-200' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: ALL AVAILABLE FACILITIES */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          {/* Search & Category Filter Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search facility name or features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full sm:w-auto no-scrollbar">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Category:</span>
              {['All', 'Guest Room', 'Community Hall', 'Party Hall', 'Meeting Room', 'Sports Area'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setTypeFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition shrink-0 ${
                    typeFilter === cat
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Facilities Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFacilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition group"
              >
                <div>
                  {/* Photo Header */}
                  <div className="relative h-48 overflow-hidden bg-slate-950">
                    <img
                      src={fac.photoUrl}
                      alt={fac.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/40 text-[10px] font-bold uppercase font-mono px-2.5 py-1 rounded-full shadow">
                      {fac.type}
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-xs font-bold font-mono px-2.5 py-1 rounded-full shadow">
                      {fac.status}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-white leading-snug">{fac.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
                        <span>Room / Block: <strong className="text-slate-200">{fac.roomNumber || 'N/A'}</strong></span>
                        <span>•</span>
                        <span>Capacity: <strong className="text-emerald-400 font-mono">{fac.capacity} Persons</strong></span>
                      </p>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{fac.description}</p>

                    {/* Features Tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {fac.facilities.map((f, i) => (
                        <span
                          key={i}
                          className="bg-slate-800/80 text-slate-300 border border-slate-700 text-[10px] px-2 py-0.5 rounded-lg"
                        >
                          ✓ {f}
                        </span>
                      ))}
                    </div>

                    {/* Financial & Charges Summary */}
                    <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800/80 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400">Booking Fee:</span>
                        <span className="font-extrabold text-amber-400 font-mono">
                          {formatINR(fac.bookingFeeINR)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Refundable Security Deposit:</span>
                        <span className="font-semibold text-slate-300 font-mono">
                          {formatINR(fac.securityDepositINR)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-5 pt-0">
                  <button
                    onClick={() => handleOpenBookModal(fac)}
                    disabled={fac.status !== 'Available'}
                    className={`w-full py-3 rounded-2xl font-bold text-xs transition flex items-center justify-center space-x-2 shadow-lg ${
                      fac.status === 'Available'
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-950/50'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>{fac.status === 'Available' ? 'Book Room / Space Now' : 'Currently Unavailable'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: AVAILABILITY CALENDAR */}
      {activeTab === 'calendar' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-extrabold text-white">Interactive Colony Booking Calendar</h2>
              <p className="text-xs text-slate-400">
                Check date availability for guest rooms and halls before submitting your booking application.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-slate-300">Approved</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                <span className="text-slate-300">Pending</span>
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {bookings.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No bookings recorded yet.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => (
                  <div key={b.bookingId} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded">
                        {b.bookingId}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          b.status === 'Approved'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : b.status === 'Pending'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-white text-sm">{b.facilityName}</h4>
                    <p className="text-xs text-slate-300 flex items-center space-x-2">
                      <CalendarIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{b.bookingDate} ({b.startTime})</span>
                    </p>
                    <p className="text-xs text-slate-400">
                      Booked by: <strong className="text-slate-200">{b.residentName}</strong> (Flat {b.flatNumber})
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: MY BOOKINGS */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">My Facility Bookings</h2>
            <span className="text-xs text-slate-400">Flat: {session.resident.flatNumber}</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Building2 className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Bookings Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You haven't submitted any facility or room booking applications yet.
              </p>
              <button
                onClick={() => setActiveTab('facilities')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Browse & Book Facilities
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((bk) => (
                <div
                  key={bk.bookingId}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">{bk.bookingId}</span>
                        <span className="text-xs text-slate-500">•</span>
                        <span className="text-xs text-slate-400">Applied on {bk.createdAt.split('T')[0]}</span>
                      </div>
                      <h3 className="text-base font-extrabold text-white mt-1">{bk.facilityName}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                          bk.status === 'Approved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                            : bk.status === 'Pending'
                            ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                            : 'bg-rose-950 text-rose-300 border-rose-500/50'
                        }`}
                      >
                        {bk.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-400 block">Date & Time Slot:</span>
                      <strong className="text-white">{bk.bookingDate} ({bk.startTime})</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Total Guest Count:</span>
                      <strong className="text-emerald-400 font-mono">{bk.guestCount} Guests</strong>
                    </div>

                    <div>
                      <span className="text-slate-400 block">Total Payable Fee:</span>
                      <strong className="text-amber-400 font-mono">{formatINR(bk.totalAmount)}</strong>
                    </div>
                  </div>

                  {bk.purpose && (
                    <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <strong>Purpose:</strong> {bk.purpose}
                    </p>
                  )}

                  {bk.adminNotes && (
                    <div className="text-xs text-indigo-300 bg-indigo-950/40 p-3 rounded-xl border border-indigo-800/40 flex items-start space-x-2">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                      <span><strong>Society Admin Note:</strong> {bk.adminNotes}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ADMIN BOOKING APPROVALS DASHBOARD */}
      {activeTab === 'admin-approvals' && isCommittee && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-extrabold text-white">Society Booking Approvals & Control</h2>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                {bookings.filter((b) => b.status === 'Pending').length} Pending Requests
              </span>
            </div>

            <div className="space-y-4">
              {bookings.map((bk) => (
                <div
                  key={bk.bookingId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-md space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">{bk.bookingId}</span>
                        <span className="text-xs text-slate-400">• {bk.facilityName}</span>
                      </div>
                      <h4 className="font-extrabold text-white text-base mt-0.5">
                        Resident: {bk.residentName} (Flat {bk.flatNumber}, Wing {bk.blockNumber})
                      </h4>
                    </div>

                    <span
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border self-start ${
                        bk.status === 'Approved'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-500/50'
                          : bk.status === 'Pending'
                          ? 'bg-amber-950 text-amber-300 border-amber-500/50'
                          : 'bg-rose-950 text-rose-300 border-rose-500/50'
                      }`}
                    >
                      {bk.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 bg-slate-900 p-3 rounded-xl">
                    <div><strong>Date:</strong> {bk.bookingDate} ({bk.startTime})</div>
                    <div><strong>Phone:</strong> {bk.residentPhone}</div>
                    <div><strong>Payable:</strong> {formatINR(bk.totalAmount)}</div>
                  </div>

                  {bk.status === 'Pending' && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        placeholder="Add admin note or key instructions..."
                        value={adminNoteInput}
                        onChange={(e) => setAdminNoteInput(e.target.value)}
                        className="w-full sm:w-auto flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                      <div className="flex items-center space-x-2 w-full sm:w-auto">
                        <button
                          onClick={() => handleUpdateStatus(bk.bookingId, 'Approved')}
                          className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                        >
                          Approve Booking
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(bk.bookingId, 'Rejected')}
                          className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* BOOKING MODAL */}
      {isBookingModalOpen && selectedFacility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto relative max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Book {selectedFacility.name}</h3>
                  <p className="text-xs text-slate-400">Society Facility Application Form</p>
                </div>
              </div>

              <button
                onClick={() => setIsBookingModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleFormSubmitBooking} className="p-6 overflow-y-auto space-y-5">
              {bookingError && (
                <div className="p-3 bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs rounded-2xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{bookingError}</span>
                </div>
              )}

              {/* Step 1: Member Info Display */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>1. Applicant Resident Information</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Name: <strong className="text-white">{session.resident.name}</strong></div>
                  <div>Flat: <strong className="text-white">{session.resident.flatNumber} (Wing {session.resident.wing})</strong></div>
                  <div>Phone: <span className="font-mono">{session.resident.phone}</span></div>
                  <div>Type: <span className="text-emerald-400 font-semibold">{session.resident.residentType}</span></div>
                </div>
              </div>

              {/* Step 2: Date & Slot Selection */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>2. Booking Date & Time Slot</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Select Booking Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Time Slot / Duration</label>
                    <select
                      value={selectedSlot}
                      onChange={(e) => setSelectedSlot(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      {selectedFacility.timeSlots.map((slot, idx) => (
                        <option key={idx} value={slot}>{slot}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 3: Purpose & Guests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>3. Booking Purpose & Guest Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Purpose of Booking *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Relatives stay for wedding, Birthday Party, Committee meeting"
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Number of Guests</label>
                    <input
                      type="number"
                      min={1}
                      max={selectedFacility.capacity}
                      value={guestCount}
                      onChange={(e) => setGuestCount(parseInt(e.target.value) || 1)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Main Guest Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Deshmukh"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Guest Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="e.g. 98220 11223"
                      value={guestMobile}
                      onChange={(e) => setGuestMobile(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Vehicle Number (If bringing car)</label>
                    <input
                      type="text"
                      placeholder="e.g. GA-03-AB-1234"
                      value={guestVehicle}
                      onChange={(e) => setGuestVehicle(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Breakdown Summary */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Booking Charges:</span>
                  <span className="font-mono text-white">{formatINR(selectedFacility.bookingFeeINR)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Refundable Security Deposit:</span>
                  <span className="font-mono text-white">{formatINR(selectedFacility.securityDepositINR)}</span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-sm font-extrabold text-white">
                  <span>Total Payable:</span>
                  <span className="text-amber-400 font-mono text-base">
                    {formatINR(selectedFacility.bookingFeeINR + selectedFacility.securityDepositINR)}
                  </span>
                </div>
              </div>

              {/* Rules & Terms Acceptance */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
                <span className="font-bold text-slate-200 block">Facility Rules & Guidelines:</span>
                <ul className="text-slate-400 space-y-1 list-disc pl-4">
                  {selectedFacility.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>

                <label className="flex items-center space-x-2.5 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rulesAccepted}
                    onChange={(e) => setRulesAccepted(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-200 font-semibold">
                    I confirm that I have read and agree to follow all colony rules for this facility.
                  </span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsBookingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold transition shadow-lg shadow-indigo-950/50 flex items-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Booking Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
