export interface EventRegistration {
  registrationId: string; // e.g. "REG-SP-2026-8819"
  eventId: string;
  eventTitle: string;
  residentName: string;
  flatNumber: string;
  phone: string;
  seatsBooked: number;
  registeredAt: string;
}

export interface CommunityEvent {
  id: string;
  title: string;
  category: 'Festival' | 'Empowerment' | 'Sports' | 'Cleanliness Drive' | 'Cultural' | 'Workshop' | 'Meeting' | 'Program' | 'Announcement';
  description: string;
  date: string;
  time: string;
  venue: string; // e.g. "Sapana Park Clubhouse & Lawns"
  organizer: string;
  organizerPhone?: string; // Contact phone of organizer
  bannerColor?: string;
  posterImage?: string; // Poster URL or Base64 Image
  attendeesCount: number;
  userRSVP: 'Going' | 'Maybe' | 'Not Going' | null;
  requiresRegistration: boolean;
  maxCapacity?: number;
  registrations?: EventRegistration[];
}

export interface WomenEmpowermentInitiative {
  id: string;
  title: string;
  presenter: string;
  flatNumber: string;
  type: 'Home Bakery' | 'Handicrafts' | 'Tuition & Coaching' | 'Yoga & Wellness' | 'Culinary Service';
  description: string;
  contactPhone: string;
  rating: number;
  verifiedBySociety: boolean;
}

