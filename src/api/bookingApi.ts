import { Facility, FacilityBooking, BookingStatus } from '../models/booking';

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'FAC-01',
    name: 'Colony Executive Guest Flat 101',
    roomNumber: 'Flat G-101',
    buildingBlock: 'Block A (Colony Guest Wing)',
    floor: '1st Floor',
    type: 'Guest Room',
    capacity: 4,
    description: 'Fully furnished 2-BHK air-conditioned colony guest flat with double bed, attached washrooms, Wi-Fi, kitchen amenities, and balcony view.',
    photoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
    facilities: ['Air Conditioning', '2 Double Beds', 'Attached Bathrooms', 'High-Speed Wi-Fi', 'Geyser & Microwave', 'TV & Dish', 'Housekeeping'],
    rules: [
      'Mandatory Identity Proof (Aadhaar / Passport / DL) upload required at time of booking.',
      'Only verified residents & their guests allowed.',
      'Check-in: 12:00 PM | Check-out: 11:00 AM.',
      'No illegal activities or loud music after 10:00 PM.'
    ],
    bookingFeeINR: 800,
    securityDepositINR: 1000,
    minDurationHours: 24,
    maxDurationHours: 72,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Full Day (12 PM to 11 AM next day)', 'Morning Slot (09 AM to 02 PM)', 'Evening Slot (04 PM to 10 PM)'],
    cancellationPolicy: '100% refund if cancelled 48 hours prior to booking date.',
    status: 'Available',
  },
  {
    id: 'FAC-02',
    name: 'Colony Deluxe Apartment Suite 202',
    roomNumber: 'Flat B-202',
    buildingBlock: 'Block B (Colony Executive Wing)',
    floor: '2nd Floor',
    type: 'Guest Room',
    capacity: 6,
    description: 'Spacious 3-BHK premium apartment with hall, sofa set, dining table, modular kitchen, central AC, and guest balcony.',
    photoUrl: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600',
    facilities: ['3 Bed Rooms', 'Centralized AC', 'Modular Kitchen', 'Sofa & Dining', 'RO Water Purifier', 'Washing Machine', '24x7 Power Backup'],
    rules: [
      'Identity Verification document required for primary occupant.',
      'Colony Incharge will review attached ID before confirming booking.',
      'Damage deposit refundable upon check-out inspection.'
    ],
    bookingFeeINR: 1200,
    securityDepositINR: 1500,
    minDurationHours: 24,
    maxDurationHours: 120,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Full Day (12 PM to 11 AM next day)'],
    cancellationPolicy: '80% refund if cancelled 3 days in advance.',
    status: 'Available',
  },
  {
    id: 'FAC-03',
    name: 'Colony Studio Guest Flat 102',
    roomNumber: 'Flat G-102',
    buildingBlock: 'Gate Wing Block',
    floor: 'Ground Floor',
    type: 'Guest Room',
    capacity: 2,
    description: 'Cozy single-room studio apartment for short stays, solo guest visitors, or emergency resident relatives.',
    photoUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600',
    facilities: ['1 Queen Bed', 'Air Conditioning', 'Mini Fridge', 'Wi-Fi', 'Coffee Maker', 'Geyser'],
    rules: [
      'Valid identity verification document must be uploaded.',
      'Check-in approval by Colony Incharge required.'
    ],
    bookingFeeINR: 500,
    securityDepositINR: 500,
    minDurationHours: 12,
    maxDurationHours: 48,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Full Day (12 PM to 11 AM next day)', 'Day Slot (08 AM to 08 PM)'],
    cancellationPolicy: 'Free cancellation up to 24 hours prior.',
    status: 'Available',
  },
  {
    id: 'FAC-04',
    name: 'Colony Family Penthouse Apartment 401',
    roomNumber: 'Flat PH-401',
    buildingBlock: 'Top Block C',
    floor: '4th Terrace Floor',
    type: 'Guest Room',
    capacity: 8,
    description: 'Penthouse apartment with terrace garden view, large living area, multiple bedrooms, and family gathering amenities.',
    photoUrl: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=600',
    facilities: ['Terrace Garden Access', 'AC Bedrooms', 'Large Dining Table', 'Sound Bar TV', 'Refrigerator & Stove'],
    rules: [
      'Strict ID Verification document submission required.',
      'Colony Incharge will inspect flat before and after stay.'
    ],
    bookingFeeINR: 2000,
    securityDepositINR: 2500,
    minDurationHours: 24,
    maxDurationHours: 72,
    availableDays: ['Friday', 'Saturday', 'Sunday', 'Monday'],
    timeSlots: ['Full Day (12 PM to 11 AM next day)'],
    cancellationPolicy: '100% refund if cancelled 5 days prior.',
    status: 'Available',
  },
  {
    id: 'FAC-05',
    name: 'Colony VIP Guest Residency Suite 301',
    roomNumber: 'Flat A-301',
    buildingBlock: 'Block A (Main Wing)',
    floor: '3rd Floor',
    type: 'Guest Room',
    capacity: 4,
    description: 'VIP guest flat maintained exclusively for visiting society VIPs, auditors, family dignitaries, and resident guests.',
    photoUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600',
    facilities: ['Luxury Interior', 'King Suite Bed', 'Study Desk', 'Smart TV', 'Balcony Deck', 'Room Service On Request'],
    rules: [
      'Government ID card (Aadhaar/Passport) compulsory.',
      'Approval granted after Colony Incharge verification.'
    ],
    bookingFeeINR: 1000,
    securityDepositINR: 1500,
    minDurationHours: 24,
    maxDurationHours: 96,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Full Day (12 PM to 11 AM next day)'],
    cancellationPolicy: 'Full refund on 48h notice.',
    status: 'Available',
  }
];

export const INITIAL_BOOKINGS: FacilityBooking[] = [
  {
    bookingId: 'BK-SP-2026-0812',
    facilityId: 'FAC-01',
    facilityName: 'Colony Executive Guest Flat 101 (Flat G-101)',
    bookingDate: '2026-08-18',
    startTime: '12:00 PM',
    endTime: '11:00 AM (Next Day)',
    durationHours: 23,
    residentName: 'Rajesh Naik',
    residentEmail: 'rajesh.naik@sapanapark.org',
    residentPhone: '9822145670',
    colonyName: 'Sapana Park Colony',
    flatNumber: 'A-302',
    blockNumber: 'A',
    floorNumber: '3rd Floor',
    residentType: 'Owner',
    memberId: 'SP-A302',
    guestCount: 2,
    purpose: 'Visiting relatives from Mumbai for Independence Day weekend',
    guests: [
      {
        id: 'GST-1',
        guestName: 'Suresh Naik',
        mobileNumber: '9820011223',
        guestCount: 2,
        relationship: 'Brother',
        vehicleNumber: 'MH-02-CD-4512'
      }
    ],
    status: 'Approved',
    bookingFee: 800,
    securityDeposit: 1000,
    totalAmount: 1800,
    paymentStatus: 'Paid',
    paymentMethod: 'UPI / NetBanking',
    rulesAccepted: true,
    idDocumentType: 'Aadhaar Card',
    idDocumentNumber: '9845-1289-4401',
    idDocumentName: 'aadhaar_rajesh_naik.jpg',
    idDocumentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
    idVerificationStatus: 'Verified',
    createdAt: '2026-08-05T10:30:00Z',
    updatedAt: '2026-08-05T11:15:00Z',
    adminNotes: 'Aadhaar ID verified by Colony Incharge. Keys handed over at Gate Office.',
  },
  {
    bookingId: 'BK-SP-2026-0815',
    facilityId: 'FAC-02',
    facilityName: 'Colony Deluxe Apartment Suite 202 (Flat B-202)',
    bookingDate: '2026-08-25',
    startTime: '12:00 PM',
    endTime: '11:00 AM (Next Day)',
    durationHours: 24,
    residentName: 'Anjali Deshmukh',
    residentEmail: 'anjali.d@gmail.com',
    residentPhone: '9823011223',
    colonyName: 'Sapana Park Colony',
    flatNumber: 'B-101',
    blockNumber: 'B',
    floorNumber: '1st Floor',
    residentType: 'Owner',
    memberId: 'SP-B101',
    guestCount: 4,
    purpose: 'Stay for in-laws attending family celebration',
    guests: [
      {
        id: 'GST-2',
        guestName: 'Rohan Deshmukh & Family',
        mobileNumber: '9823011224',
        guestCount: 4,
        relationship: 'Son',
        vehicleNumber: 'GA-03-A-8899'
      }
    ],
    status: 'Pending',
    bookingFee: 1200,
    securityDeposit: 1500,
    totalAmount: 2700,
    paymentStatus: 'Pending',
    paymentMethod: 'Society Counter / Online',
    rulesAccepted: true,
    idDocumentType: 'Driving License',
    idDocumentNumber: 'GA-03-2022-004912',
    idDocumentName: 'dl_anjali_deshmukh.jpg',
    idDocumentUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
    idVerificationStatus: 'Pending',
    createdAt: '2026-08-09T14:20:00Z',
    updatedAt: '2026-08-09T14:20:00Z',
    adminNotes: 'Pending identity verification by Colony Incharge.',
  }
];

const FACILITIES_KEY = 'sapana_park_facilities_data';
const BOOKINGS_KEY = 'sapana_park_bookings_data';

export function getStoredFacilities(): Facility[] {
  const saved = localStorage.getItem(FACILITIES_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return INITIAL_FACILITIES;
}

export function saveFacilities(facilities: Facility[]): void {
  localStorage.setItem(FACILITIES_KEY, JSON.stringify(facilities));
}

export function getStoredBookings(): FacilityBooking[] {
  const saved = localStorage.getItem(BOOKINGS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return INITIAL_BOOKINGS;
}

export function saveBookings(bookings: FacilityBooking[]): void {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

export function checkFacilityAvailability(
  facilityId: string,
  date: string,
  startTime: string
): { available: boolean; conflictingBooking?: FacilityBooking } {
  const bookings = getStoredBookings();
  const conflict = bookings.find(
    (b) =>
      b.facilityId === facilityId &&
      b.bookingDate === date &&
      (b.status === 'Approved' || b.status === 'Pending')
  );
  if (conflict) {
    return { available: false, conflictingBooking: conflict };
  }
  return { available: true };
}

export function createFacilityBooking(bookingData: Omit<FacilityBooking, 'bookingId' | 'createdAt' | 'updatedAt'>): FacilityBooking {
  const bookings = getStoredBookings();
  const newBooking: FacilityBooking = {
    ...bookingData,
    bookingId: `BK-SP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const updated = [newBooking, ...bookings];
  saveBookings(updated);
  return newBooking;
}

export function updateBookingStatusApi(
  bookingId: string,
  newStatus: BookingStatus,
  adminNotes?: string,
  paymentStatus?: FacilityBooking['paymentStatus']
): FacilityBooking[] {
  const bookings = getStoredBookings();
  const updated = bookings.map((b) => {
    if (b.bookingId === bookingId) {
      return {
        ...b,
        status: newStatus,
        adminNotes: adminNotes ?? b.adminNotes,
        paymentStatus: paymentStatus ?? b.paymentStatus,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });
  saveBookings(updated);
  return updated;
}

export function deleteFacilityBooking(bookingId: string): FacilityBooking[] {
  const bookings = getStoredBookings();
  const updated = bookings.filter((b) => b.bookingId !== bookingId);
  saveBookings(updated);
  return updated;
}

export function deleteBookingDocument(bookingId: string): FacilityBooking[] {
  const bookings = getStoredBookings();
  const updated: FacilityBooking[] = bookings.map((b) => {
    if (b.bookingId === bookingId) {
      return {
        ...b,
        idDocumentType: undefined,
        idDocumentNumber: undefined,
        idDocumentName: undefined,
        idDocumentUrl: undefined,
        idVerificationStatus: 'Pending' as const,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });
  saveBookings(updated);
  return updated;
}

export function updateBookingDocument(
  bookingId: string,
  docType: string,
  docNum: string,
  docName: string,
  docUrl: string
): FacilityBooking[] {
  const bookings = getStoredBookings();
  const updated: FacilityBooking[] = bookings.map((b) => {
    if (b.bookingId === bookingId) {
      return {
        ...b,
        idDocumentType: docType,
        idDocumentNumber: docNum,
        idDocumentName: docName,
        idDocumentUrl: docUrl,
        idVerificationStatus: 'Pending' as const,
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });
  saveBookings(updated);
  return updated;
}

export function verifyBookingIdentityApi(
  bookingId: string,
  verificationStatus: 'Verified' | 'Rejected',
  adminNotes?: string
): FacilityBooking[] {
  const bookings = getStoredBookings();
  const updated = bookings.map((b) => {
    if (b.bookingId === bookingId) {
      return {
        ...b,
        idVerificationStatus: verificationStatus,
        adminNotes: adminNotes ?? (verificationStatus === 'Verified' ? 'Identity verification approved by Colony Incharge.' : 'Identity document rejected.'),
        updatedAt: new Date().toISOString(),
      };
    }
    return b;
  });
  saveBookings(updated);
  return updated;
}
