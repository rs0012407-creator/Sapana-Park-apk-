import { Facility, FacilityBooking, BookingStatus } from '../models/booking';

export const INITIAL_FACILITIES: Facility[] = [
  {
    id: 'FAC-01',
    name: 'Executive Deluxe Guest Suite',
    roomNumber: 'G-101',
    buildingBlock: 'Club House Block',
    floor: '1st Floor',
    type: 'Guest Room',
    capacity: 4,
    description: 'Fully furnished air-conditioned guest room with king bed, attached bathroom, Wi-Fi, and balcony view for resident guests.',
    photoUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600',
    facilities: ['Air Conditioning', 'King Bed', 'Attached Bath', 'Free Wi-Fi', 'Geyser', 'TV & Dish', 'Daily Housekeeping'],
    rules: [
      'Valid Government ID card required for all guests at check-in.',
      'No loud music or noise after 10:00 PM.',
      'Check-in: 12:00 PM | Check-out: 11:00 AM.',
      'Smoking and alcoholic beverages inside room strictly prohibited.'
    ],
    bookingFeeINR: 800,
    securityDepositINR: 1000,
    minDurationHours: 24,
    maxDurationHours: 72,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Full Day (12 PM to 11 AM next day)', 'Morning Slot (09 AM to 02 PM)', 'Evening Slot (04 PM to 10 PM)'],
    cancellationPolicy: '100% refund if cancelled 48 hours prior to booking date. 50% refund if cancelled within 24-48 hours.',
    status: 'Available',
  },
  {
    id: 'FAC-02',
    name: 'Grand Central Community Hall',
    roomNumber: 'CH-MAIN',
    buildingBlock: 'Central Clubhouse',
    floor: 'Ground Floor',
    type: 'Community Hall',
    capacity: 250,
    description: 'Spacious banquet hall with central AC, stage lighting, sound system, dining area, and attached green room for weddings, AGMs, and major events.',
    photoUrl: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600',
    facilities: ['Centralized AC', 'Stage & Sound System', 'Projector Screen', 'Dining Tables & Chairs', 'Green Rooms', 'Kitchen Space', 'Generator Backup'],
    rules: [
      'Hall must be cleaned and vacated by midnight (12:00 AM).',
      'Catering allowed only through authorized caterers or approved vendors.',
      'Firecrackers or pyrotechnics prohibited inside premises.',
      'Decorations must not damage walls or paint.'
    ],
    bookingFeeINR: 3500,
    securityDepositINR: 5000,
    minDurationHours: 4,
    maxDurationHours: 12,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Morning Shift (08 AM to 02 PM)', 'Evening Shift (04 PM to 11 PM)', 'Full Day (08 AM to 11 PM)'],
    cancellationPolicy: '80% refund if cancelled 7 days in advance. 50% refund if cancelled 3 days prior.',
    status: 'Available',
  },
  {
    id: 'FAC-03',
    name: 'Garden Terrace Party Lawn',
    roomNumber: 'PT-01',
    buildingBlock: 'B-Wing Roof Garden',
    floor: 'Terrace Level',
    type: 'Party Hall',
    capacity: 80,
    description: 'Open-air ambient party venue with ambient lighting, barbecue grills, seating, and gazebo for family birthday parties and get-togethers.',
    photoUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=600',
    facilities: ['Ambient Lighting', 'Barbecue Station', 'Gazebo Seating', 'Washrooms', 'Power Outlets', 'Background Music Speakers'],
    rules: [
      'Loud speakers must be shut off by 10:00 PM per Goa Govt rules.',
      'Residents responsible for waste disposal in green bins provided.',
      'Safety around terrace railings strictly monitored.'
    ],
    bookingFeeINR: 1500,
    securityDepositINR: 2000,
    minDurationHours: 3,
    maxDurationHours: 8,
    availableDays: ['Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Evening Party Slot (05 PM to 10 PM)'],
    cancellationPolicy: '100% refund if cancelled 3 days prior to party date.',
    status: 'Available',
  },
  {
    id: 'FAC-04',
    name: 'Boardroom & Conference Facility',
    roomNumber: 'BR-202',
    buildingBlock: 'Society Office Block',
    floor: '2nd Floor',
    type: 'Meeting Room',
    capacity: 20,
    description: 'Modern conference room equipped with 65" 4K Smart Display, video conferencing cam, whiteboards, high-speed Wi-Fi, and coffee machine.',
    photoUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600',
    facilities: ['65" 4K Smart Screen', 'Video Call Cam', 'Ergonomic Executive Chairs', 'High Speed Wi-Fi', 'Coffee/Tea Vending', 'Whiteboard'],
    rules: [
      'Maintain decorum and silence in adjacent society office zone.',
      'Switch off AV equipment and air conditioner after meeting completion.'
    ],
    bookingFeeINR: 400,
    securityDepositINR: 500,
    minDurationHours: 1,
    maxDurationHours: 6,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    timeSlots: ['Hourly Booking (09 AM to 08 PM)'],
    cancellationPolicy: 'Free cancellation up to 6 hours before meeting slot.',
    status: 'Available',
  },
  {
    id: 'FAC-05',
    name: 'Badminton & Table Tennis Arena',
    roomNumber: 'SP-01',
    buildingBlock: 'Sports Complex',
    floor: 'Ground Floor',
    type: 'Sports Area',
    capacity: 15,
    description: 'Indoor wooden court for badminton with synthetic matting, Stiga Table Tennis table, LED floodlights, and spectator seating.',
    photoUrl: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600',
    facilities: ['Wooden Badminton Court', 'Table Tennis Table', 'LED Lighting', 'Locker Room', 'Water Cooler'],
    rules: [
      'Non-marking shoes mandatory on badminton court.',
      'Bring own rackets and shuttles/balls.',
      'Maximum 1 hour booking per flat per day during peak hours.'
    ],
    bookingFeeINR: 100,
    securityDepositINR: 0,
    minDurationHours: 1,
    maxDurationHours: 2,
    availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    timeSlots: ['Morning Slot (06 AM to 10 AM)', 'Evening Slot (04 PM to 09 PM)'],
    cancellationPolicy: 'Free cancellation anytime up to 1 hour before slot.',
    status: 'Available',
  }
];

export const INITIAL_BOOKINGS: FacilityBooking[] = [
  {
    bookingId: 'BK-SP-2026-0812',
    facilityId: 'FAC-01',
    facilityName: 'Executive Deluxe Guest Suite (G-101)',
    bookingDate: '2026-08-18',
    startTime: '12:00 PM',
    endTime: '11:00 AM (Next Day)',
    durationHours: 23,
    residentName: 'Rajesh Naik',
    residentEmail: 'rajesh.naik@sapanapark.org',
    residentPhone: '9822145670',
    colonyName: 'Sapana Park CHS',
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
    createdAt: '2026-08-05T10:30:00Z',
    updatedAt: '2026-08-05T11:15:00Z',
    adminNotes: 'Booking verified and keys assigned to Gate Security Guard.',
  },
  {
    bookingId: 'BK-SP-2026-0815',
    facilityId: 'FAC-02',
    facilityName: 'Grand Central Community Hall',
    bookingDate: '2026-08-25',
    startTime: '04:00 PM',
    endTime: '11:00 PM',
    durationHours: 7,
    residentName: 'Anjali Deshmukh',
    residentEmail: 'anjali.d@gmail.com',
    residentPhone: '9823011223',
    colonyName: 'Sapana Park CHS',
    flatNumber: 'B-101',
    blockNumber: 'B',
    floorNumber: '1st Floor',
    residentType: 'Owner',
    memberId: 'SP-B101',
    guestCount: 120,
    purpose: 'Family Silver Jubilee Anniversary Celebration',
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
    bookingFee: 3500,
    securityDeposit: 5000,
    totalAmount: 8500,
    paymentStatus: 'Pending',
    paymentMethod: 'Society Counter / Online',
    rulesAccepted: true,
    createdAt: '2026-08-09T14:20:00Z',
    updatedAt: '2026-08-09T14:20:00Z',
    adminNotes: 'Awaiting Managing Committee quorum approval for hall decor setup.',
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
