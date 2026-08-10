export type FacilityType =
  | 'Guest Room'
  | 'Community Hall'
  | 'Party Hall'
  | 'Club House'
  | 'Meeting Room'
  | 'Sports Area'
  | 'Other Facility';

export type FacilityStatus = 'Available' | 'Temporarily Unavailable' | 'Maintenance' | 'Disabled';

export type BookingStatus = 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';

export type PaymentStatus = 'Pending' | 'Paid' | 'Failed' | 'Refunded';

export interface Facility {
  id: string;
  name: string;
  roomNumber?: string;
  buildingBlock?: string;
  floor?: string;
  type: FacilityType;
  capacity: number;
  description: string;
  photoUrl: string;
  facilities: string[];
  rules: string[];
  bookingFeeINR: number;
  securityDepositINR: number;
  minDurationHours: number;
  maxDurationHours: number;
  availableDays: string[];
  timeSlots: string[];
  cancellationPolicy: string;
  status: FacilityStatus;
}

export interface BookingGuest {
  id: string;
  guestName: string;
  mobileNumber: string;
  guestCount: number;
  relationship: string;
  vehicleNumber?: string;
}

export interface FacilityBooking {
  bookingId: string;
  facilityId: string;
  facilityName: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string; // e.g. "10:00 AM"
  endTime: string; // e.g. "02:00 PM"
  durationHours: number;
  
  // Member Details
  residentName: string;
  residentEmail: string;
  residentPhone: string;
  colonyName: string;
  flatNumber: string;
  blockNumber: string;
  floorNumber: string;
  residentType: string;
  memberId: string;

  // Booking Info
  guestCount: number;
  purpose: string;
  specialRequirements?: string;
  additionalNotes?: string;
  guests: BookingGuest[];

  // Status & Financials
  status: BookingStatus;
  bookingFee: number;
  securityDeposit: number;
  totalAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  rulesAccepted: boolean;
  
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}
