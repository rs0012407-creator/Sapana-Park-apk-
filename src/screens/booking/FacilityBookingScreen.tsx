import React, { useState } from 'react';
import {
  Building2,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  FileText,
  IndianRupee,
  Search,
  Info,
  X,
  User,
  Phone,
  Mail,
  CalendarCheck,
  Sparkles,
  AlertCircle,
  Trash2,
  Eye,
  Upload,
  MessageSquare,
  ExternalLink,
  FileCheck,
  BadgeCheck,
  Paperclip,
  Check,
  Building,
  Key,
  ShieldCheck,
  PhoneCall,
  UserCheck,
} from 'lucide-react';
import { Facility, FacilityBooking, BookingStatus } from '../../models/booking';
import {
  getStoredFacilities,
  getStoredBookings,
  createFacilityBooking,
  updateBookingStatusApi,
  checkFacilityAvailability,
  deleteFacilityBooking,
  deleteBookingDocument,
  updateBookingDocument,
  verifyBookingIdentityApi,
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
  const [facilities] = useState<Facility[]>(() => getStoredFacilities());
  const [bookings, setBookings] = useState<FacilityBooking[]>(() => getStoredBookings());

  // Selected facility for booking modal
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Document Preview Modal
  const [viewDocBooking, setViewDocBooking] = useState<FacilityBooking | null>(null);

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

  // Guest Info State
  const [guestName, setGuestName] = useState<string>('');
  const [guestMobile, setGuestMobile] = useState<string>('');
  const [guestRelation, setGuestRelation] = useState<string>('Relative / Family Guest');
  const [guestVehicle, setGuestVehicle] = useState<string>('');

  // Identity Verification Document States
  const [idDocumentType, setIdDocumentType] = useState<string>('Aadhaar Card');
  const [idDocumentNumber, setIdDocumentNumber] = useState<string>('');
  const [idDocumentName, setIdDocumentName] = useState<string>('');
  const [idDocumentUrl, setIdDocumentUrl] = useState<string>('');

  // Rules Acceptance Check
  const [rulesAccepted, setRulesAccepted] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  // Admin Modal / Action state
  const [adminNoteInput, setAdminNoteInput] = useState<string>('');

  // Filter & Search
  const [searchQuery, setSearchQuery] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenBookModal = (fac: Facility) => {
    setSelectedFacility(fac);
    setSelectedSlot(fac.timeSlots[0] || 'Full Day (12 PM to 11 AM next day)');
    setGuestCount(Math.min(fac.capacity, 2));
    setPurpose('');
    setGuestName('');
    setGuestMobile('');
    setGuestVehicle('');
    setIdDocumentType('Aadhaar Card');
    setIdDocumentNumber('');
    setIdDocumentName('');
    setIdDocumentUrl('');
    setRulesAccepted(false);
    setBookingError(null);
    setIsBookingModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIdDocumentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setIdDocumentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAttachSampleDoc = () => {
    setIdDocumentName('aadhaar_card_proof_sample.jpg');
    setIdDocumentUrl('https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600');
    if (!idDocumentNumber) setIdDocumentNumber('9845-8812-3300');
    showToast('Sample Identity Verification Document attached!');
  };

  const handleRemoveFormDoc = () => {
    setIdDocumentName('');
    setIdDocumentUrl('');
  };

  const handleFormSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError(null);

    if (!selectedFacility) return;

    if (!idDocumentName.trim() || !idDocumentUrl.trim()) {
      setBookingError('Identity Verification Document is mandatory. Please upload your Aadhaar/Passport/DL image or document file.');
      return;
    }

    if (!idDocumentNumber.trim()) {
      setBookingError('Please enter your Identity Document Number (e.g. Aadhaar Number / Driving License Number).');
      return;
    }

    if (!rulesAccepted) {
      setBookingError('You must read and accept the colony apartment rules & terms before submitting booking.');
      return;
    }

    if (!purpose.trim()) {
      setBookingError('Please enter the purpose of booking (e.g., Visiting Family, Relatives Stay).');
      return;
    }

    // Availability Check
    const check = checkFacilityAvailability(selectedFacility.id, bookingDate, selectedSlot);
    if (!check.available) {
      setBookingError(`This colony apartment is already booked for date ${bookingDate}. Please choose another date or apartment.`);
      return;
    }

    // Prepare booking record
    const newBooking = createFacilityBooking({
      facilityId: selectedFacility.id,
      facilityName: selectedFacility.name,
      bookingDate,
      startTime: selectedSlot,
      endTime: '11:00 AM Next Day',
      durationHours: selectedFacility.minDurationHours,

      residentName: session.resident.name,
      residentEmail: session.resident.email,
      residentPhone: session.resident.phone,
      colonyName: 'Sapana Park Colony',
      flatNumber: session.resident.flatNumber,
      blockNumber: session.resident.wing,
      floorNumber: '3rd Floor',
      residentType: session.resident.residentType,
      memberId: session.resident.memberId,

      guestCount,
      purpose,
      specialRequirements,
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

      idDocumentType,
      idDocumentNumber: idDocumentNumber.trim(),
      idDocumentName,
      idDocumentUrl,
      idVerificationStatus: 'Pending',

      adminNotes: 'Booking submitted with Identity Proof. Awaiting Colony Incharge verification.',
    });

    setBookings(getStoredBookings());
    setIsBookingModalOpen(false);
    showToast(`Colony Apartment Booking #${newBooking.bookingId} submitted successfully!`);
    setActiveTab('my-bookings');
  };

  const handleUpdateStatus = (bookingId: string, status: BookingStatus) => {
    const updated = updateBookingStatusApi(bookingId, status, adminNoteInput || undefined);
    setBookings(updated);
    setAdminNoteInput('');
    showToast(`Booking status updated to "${status}".`);
  };

  const handleDeleteBookingClick = (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel and delete this colony apartment booking?')) {
      const updated = deleteFacilityBooking(bookingId);
      setBookings(updated);
      showToast('Booking deleted successfully.');
    }
  };

  const handleDeleteDocumentClick = (bookingId: string) => {
    if (window.confirm('Are you sure you want to delete the attached Identity Verification Document?')) {
      const updated = deleteBookingDocument(bookingId);
      setBookings(updated);
      showToast('Identity Verification Document deleted.');
    }
  };

  const handleVerifyIdentityClick = (bookingId: string, status: 'Verified' | 'Rejected') => {
    const updated = verifyBookingIdentityApi(bookingId, status);
    setBookings(updated);
    showToast(`Identity Verification status updated to ${status}.`);
  };

  // Filtered lists
  const myBookings = bookings.filter(
    (b) => b.flatNumber === session.resident.flatNumber || b.residentEmail === session.resident.email
  );

  const filteredFacilities = facilities.filter((fac) => {
    const matchesSearch =
      fac.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fac.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (fac.roomNumber && fac.roomNumber.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
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
            <Building className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-bold text-indigo-400 bg-indigo-950 px-2.5 py-0.5 rounded-full border border-indigo-800/80 inline-block">
              Colony Apartment & Guest Flats Booking
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1">
              Colony Apartment Booking
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-0.5">
              Book colony apartments with mandatory identity document verification & Colony Incharge connect.
            </p>
          </div>
        </div>

        {onOpenAIHelp && (
          <button
            onClick={onOpenAIHelp}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-lg shadow-indigo-950/40 shrink-0"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            <span>AI Booking Guide</span>
          </button>
        )}
      </div>

      {/* Main Navigation Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800">
        {[
          { id: 'facilities', label: 'Colony Apartments', icon: Building2, count: facilities.length },
          { id: 'calendar', label: 'Availability Calendar', icon: CalendarIcon },
          { id: 'my-bookings', label: 'My Bookings & ID Proofs', icon: CalendarCheck, count: myBookings.length },
          ...(isCommittee
            ? [
                {
                  id: 'admin-approvals',
                  label: 'Colony Incharge Approvals',
                  icon: ShieldCheck,
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

      {/* TAB 1: ALL COLONY APARTMENTS */}
      {activeTab === 'facilities' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-md flex items-center justify-between gap-3">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search colony apartment name, block or flat number..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Colony Apartments Cards Grid */}
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
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md text-indigo-300 border border-indigo-500/40 text-[10px] font-bold uppercase font-mono px-2.5 py-1 rounded-full shadow flex items-center space-x-1">
                      <Building className="w-3 h-3 text-indigo-400" />
                      <span>{fac.roomNumber || 'Colony Flat'}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md text-emerald-400 border border-emerald-500/40 text-xs font-bold font-mono px-2.5 py-1 rounded-full shadow">
                      {fac.status}
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <h3 className="text-lg font-black text-white leading-snug">{fac.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center space-x-2 mt-1">
                        <span>Block: <strong className="text-slate-200">{fac.buildingBlock}</strong></span>
                        <span>•</span>
                        <span>Capacity: <strong className="text-emerald-400 font-mono">{fac.capacity} Guests</strong></span>
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
                        <span className="text-slate-400">Daily Rent Fee:</span>
                        <span className="font-extrabold text-amber-400 font-mono">
                          {formatINR(fac.bookingFeeINR)} / day
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
                    <Key className="w-4 h-4 text-amber-300" />
                    <span>{fac.status === 'Available' ? 'Book Colony Apartment' : 'Currently Booked / Maintenance'}</span>
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
              <h2 className="text-lg font-extrabold text-white">Interactive Colony Apartment Booking Calendar</h2>
              <p className="text-xs text-slate-400">
                Check date availability for colony guest flats before submitting your application.
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

      {/* TAB 3: MY BOOKINGS & ID PROOFS */}
      {activeTab === 'my-bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-white">My Apartment Bookings & Identity Proofs</h2>
            <span className="text-xs text-slate-400">Flat: {session.resident.flatNumber}</span>
          </div>

          {myBookings.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
              <Building className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-white">No Apartment Bookings Found</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                You haven't submitted any colony apartment or flat booking applications yet.
              </p>
              <button
                onClick={() => setActiveTab('facilities')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Browse Colony Apartments
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {myBookings.map((bk) => (
                <div
                  key={bk.bookingId}
                  className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-lg space-y-4"
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

                  {/* Attached Identity Verification Document Section */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Identity Verification Document:</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            bk.idVerificationStatus === 'Verified'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {bk.idVerificationStatus || 'Pending Verification'}
                        </span>
                      </div>

                      {bk.idDocumentName && (
                        <button
                          onClick={() => handleDeleteDocumentClick(bk.bookingId)}
                          className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Document</span>
                        </button>
                      )}
                    </div>

                    {bk.idDocumentName ? (
                      <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                        <div className="flex items-center space-x-2">
                          <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                          <span><strong>{bk.idDocumentType}:</strong> {bk.idDocumentNumber} ({bk.idDocumentName})</span>
                        </div>
                        {bk.idDocumentUrl && (
                          <button
                            onClick={() => setViewDocBooking(bk)}
                            className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-indigo-500/40 flex items-center space-x-1"
                          >
                            <Eye className="w-3 h-3" />
                            <span>View Proof</span>
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-rose-400 italic">No Identity Document Attached.</p>
                    )}
                  </div>

                  {bk.purpose && (
                    <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
                      <strong>Purpose:</strong> {bk.purpose}
                    </p>
                  )}

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleDeleteBookingClick(bk.bookingId)}
                      className="bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 text-xs font-bold px-3.5 py-2 rounded-xl border border-rose-800/60 transition flex items-center space-x-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Cancel & Delete Booking</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: COLONY INCHARGE APPROVALS & CONNECT DASHBOARD */}
      {activeTab === 'admin-approvals' && isCommittee && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <div>
                  <h2 className="text-lg font-extrabold text-white">Colony Incharge Verification & Resident Connect</h2>
                  <p className="text-xs text-slate-400">
                    Verify applicant identity documents, inspect booking details, and connect directly with residents.
                  </p>
                </div>
              </div>
              <span className="text-xs text-emerald-400 font-mono font-bold">
                {bookings.filter((b) => b.status === 'Pending').length} Pending
              </span>
            </div>

            <div className="space-y-4">
              {bookings.map((bk) => (
                <div
                  key={bk.bookingId}
                  className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono font-bold text-indigo-400">{bk.bookingId}</span>
                        <span className="text-xs text-slate-400">• {bk.facilityName}</span>
                      </div>
                      <h4 className="font-extrabold text-white text-base mt-0.5">
                        Applicant: {bk.residentName} (Flat {bk.flatNumber}, Wing {bk.blockNumber})
                      </h4>
                    </div>

                    <div className="flex items-center space-x-2">
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
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300 bg-slate-900 p-3 rounded-xl">
                    <div><strong>Booking Date:</strong> {bk.bookingDate}</div>
                    <div><strong>Phone:</strong> {bk.residentPhone}</div>
                    <div><strong>Payable:</strong> {formatINR(bk.totalAmount)}</div>
                  </div>

                  {/* Attached Identity Verification Document for Colony Incharge */}
                  <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <BadgeCheck className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-bold text-white">Identity Verification Document:</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            bk.idVerificationStatus === 'Verified'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {bk.idVerificationStatus || 'Pending'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        {bk.idDocumentName && (
                          <button
                            onClick={() => setViewDocBooking(bk)}
                            className="bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 text-xs font-bold px-2.5 py-1 rounded-lg border border-indigo-500/40 flex items-center space-x-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect ID Proof</span>
                          </button>
                        )}
                        {bk.idDocumentName && (
                          <button
                            onClick={() => handleDeleteDocumentClick(bk.bookingId)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center space-x-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete ID</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-300">
                      <strong>Document Type:</strong> {bk.idDocumentType || 'Not Specified'} • <strong>Number:</strong> {bk.idDocumentNumber || 'N/A'}
                    </p>

                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        onClick={() => handleVerifyIdentityClick(bk.bookingId, 'Verified')}
                        className="bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700 text-emerald-200 text-[11px] font-bold px-3 py-1 rounded-lg transition"
                      >
                        ✓ Mark Identity Verified
                      </button>
                      <button
                        onClick={() => handleVerifyIdentityClick(bk.bookingId, 'Rejected')}
                        className="bg-rose-950/80 hover:bg-rose-900 border border-rose-700 text-rose-200 text-[11px] font-bold px-3 py-1 rounded-lg transition"
                      >
                        ✕ Reject Identity Proof
                      </button>
                    </div>
                  </div>

                  {/* Direct Colony Incharge Connect Section */}
                  <div className="bg-indigo-950/40 border border-indigo-800/40 p-3.5 rounded-xl space-y-2">
                    <span className="text-xs font-bold text-indigo-300 flex items-center space-x-1.5">
                      <PhoneCall className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Colony Incharge Direct Connect Options:</span>
                    </span>

                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${bk.residentPhone}`}
                        className="bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call {bk.residentName}</span>
                      </a>

                      <a
                        href={`https://wa.me/91${bk.residentPhone}?text=Hello%20${encodeURIComponent(
                          bk.residentName
                        )},%20this%20is%20Colony%20Incharge%20regarding%20your%20apartment%20booking%20(${bk.bookingId}).`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>WhatsApp Connect</span>
                      </a>

                      <a
                        href={`mailto:${bk.residentEmail}?subject=Colony%20Apartment%20Booking%20Verification%20${bk.bookingId}`}
                        className="bg-slate-800 hover:bg-slate-700 text-sky-300 border border-sky-500/30 text-xs font-bold px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email Resident</span>
                      </a>
                    </div>
                  </div>

                  {/* Status Change & Deletion */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
                    <input
                      type="text"
                      placeholder="Add admin note or check-in instructions..."
                      value={adminNoteInput}
                      onChange={(e) => setAdminNoteInput(e.target.value)}
                      className="w-full sm:w-auto flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleUpdateStatus(bk.bookingId, 'Approved')}
                        className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
                      >
                        Approve Booking
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(bk.bookingId, 'Rejected')}
                        className="flex-1 sm:flex-none bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition shadow"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleDeleteBookingClick(bk.bookingId)}
                        className="bg-slate-800 hover:bg-rose-900/60 text-rose-400 p-2 rounded-xl border border-slate-700 transition"
                        title="Delete Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* INSPECT IDENTITY DOCUMENT MODAL */}
      {viewDocBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-base text-white">Identity Verification Document Proof</h3>
              </div>
              <button
                onClick={() => setViewDocBooking(null)}
                className="text-slate-400 hover:text-white p-1 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <p><strong>Resident Name:</strong> {viewDocBooking.residentName} (Flat {viewDocBooking.flatNumber})</p>
              <p><strong>Document Type:</strong> {viewDocBooking.idDocumentType}</p>
              <p><strong>Document ID Number:</strong> <span className="font-mono text-emerald-300">{viewDocBooking.idDocumentNumber}</span></p>
              <p><strong>File Name:</strong> {viewDocBooking.idDocumentName}</p>
            </div>

            {viewDocBooking.idDocumentUrl ? (
              <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 max-h-72 flex items-center justify-center">
                <img
                  src={viewDocBooking.idDocumentUrl}
                  alt="Identity Verification Document Proof"
                  className="max-h-64 object-contain rounded-xl w-full"
                />
              </div>
            ) : (
              <p className="text-xs text-rose-400">No Document File attached.</p>
            )}

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  handleDeleteDocumentClick(viewDocBooking.bookingId);
                  setViewDocBooking(null);
                }}
                className="bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete ID Document</span>
              </button>

              <button
                onClick={() => setViewDocBooking(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
              >
                Done
              </button>
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
                  <Building className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base">Book {selectedFacility.name}</h3>
                  <p className="text-xs text-slate-400">Colony Guest Flat Application Form</p>
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
                  <span>1. Applicant Resident Details</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                  <div>Name: <strong className="text-white">{session.resident.name}</strong></div>
                  <div>Flat: <strong className="text-white">{session.resident.flatNumber} (Wing {session.resident.wing})</strong></div>
                  <div>Phone: <span className="font-mono">{session.resident.phone}</span></div>
                  <div>Type: <span className="text-emerald-400 font-semibold">{session.resident.residentType}</span></div>
                </div>
              </div>

              {/* MANDATORY STEP: IDENTITY VERIFICATION DOCUMENT UPLOAD */}
              <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-950 p-4 rounded-2xl border border-indigo-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-400" />
                    <span>2. Mandatory Identity Verification Document</span>
                  </h4>
                  <span className="text-[10px] font-bold text-rose-400 bg-rose-950 px-2 py-0.5 rounded border border-rose-800">
                    Required
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Select Document Type *</label>
                    <select
                      value={idDocumentType}
                      onChange={(e) => setIdDocumentType(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="Aadhaar Card">Aadhaar Card</option>
                      <option value="Voter ID Card">Voter ID Card</option>
                      <option value="Driving License">Driving License</option>
                      <option value="Passport">Passport</option>
                      <option value="Colony Resident ID / Rent Agreement">Colony Resident ID / Rent Agreement</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Document ID Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 12-digit Aadhaar / DL No."
                      value={idDocumentNumber}
                      onChange={(e) => setIdDocumentNumber(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Upload or Sample Attachment */}
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-slate-300">Upload Identity Proof File / Photo *</label>

                  {idDocumentName ? (
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-emerald-500/40 text-xs text-slate-200">
                      <div className="flex items-center space-x-2 truncate">
                        <Paperclip className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="truncate font-medium">{idDocumentName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFormDoc}
                        className="text-rose-400 hover:text-rose-300 text-xs font-bold ml-2 shrink-0 flex items-center space-x-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <label className="w-full sm:w-auto flex-1 bg-slate-950 hover:bg-slate-900 border border-dashed border-indigo-500/50 rounded-xl p-3 text-center cursor-pointer transition">
                        <Upload className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                        <span className="text-xs text-indigo-300 font-bold block">Choose File / Take Photo</span>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={handleAttachSampleDoc}
                        className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3.5 py-3 rounded-xl border border-slate-700 transition shrink-0"
                      >
                        + Use Sample ID Proof
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 3: Date & Slot Selection */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>3. Booking Date & Time Slot</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Select Check-in Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">Duration Slot</label>
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

              {/* Step 4: Purpose & Guests */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span>4. Purpose & Guest Details</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-300 mb-1">Purpose of Booking *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Relatives staying for family function"
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
                </div>
              </div>

              {/* Fee Breakdown Summary */}
              <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-4 rounded-2xl border border-indigo-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Apartment Rent:</span>
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
                <span className="font-bold text-slate-200 block">Colony Apartment Rules:</span>
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
                    I confirm that the uploaded identity document is authentic and I agree to colony guidelines.
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
                  <span>Submit Apartment Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
