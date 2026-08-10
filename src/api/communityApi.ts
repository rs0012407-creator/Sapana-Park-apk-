import { CommunityEvent, WomenEmpowermentInitiative, EventRegistration } from '../models/community';

const EVENTS_KEY = 'sapana_park_events_db';

export const INITIAL_EVENTS: CommunityEvent[] = [
  {
    id: 'EVT-101',
    title: 'Goa Liberation & Cultural Independence Night 2026',
    category: 'Festival',
    description: 'Join us for an evening celebrating Konkani music, traditional Goan Fugdi dance performances by children, live brass band, and Goan fish curry & bebinca food stalls.',
    date: '2026-08-22',
    time: '06:00 PM onwards',
    venue: 'Sapana Park Main Lawns & Amphitheatre',
    organizer: 'Rajesh Naik (Cultural Secretary)',
    organizerPhone: '+91 98221 45670',
    bannerColor: 'bg-emerald-600',
    attendeesCount: 48,
    userRSVP: 'Going',
    requiresRegistration: true,
    maxCapacity: 150,
  },
  {
    id: 'EVT-102',
    title: 'Annual General Body Meeting (AGM 2026)',
    category: 'Meeting',
    description: 'Mandatory society general body meeting to review audited financial statements for FY 2025-26, discussion on solar rooftop installation, and managing committee election schedule.',
    date: '2026-08-25',
    time: '10:00 AM - 01:00 PM',
    venue: 'Clubhouse Multipurpose Conference Hall',
    organizer: 'Managing Committee (Secretary Office)',
    organizerPhone: '+91 98220 12345',
    bannerColor: 'bg-slate-700',
    attendeesCount: 65,
    userRSVP: 'Going',
    requiresRegistration: false,
  },
  {
    id: 'EVT-103',
    title: 'Rainwater Harvesting & Waste Segregation Workshop',
    category: 'Cleanliness Drive',
    description: 'Expert session with Bardez Municipal Inspector on wet waste composting, dry plastic recycling, and roof rainwater harvesting recharge pits.',
    date: '2026-08-28',
    time: '10:30 AM - 12:30 PM',
    venue: 'Clubhouse Multipurpose Hall',
    organizer: 'Anand Shinde (Green Cell Head)',
    organizerPhone: '+91 94220 88711',
    bannerColor: 'bg-teal-700',
    attendeesCount: 22,
    userRSVP: null,
    requiresRegistration: true,
    maxCapacity: 50,
  },
  {
    id: 'EVT-104',
    title: 'Ganesh Chaturthi Society Sthapana & Modak Distribution',
    category: 'Festival',
    description: 'Grand welcoming of Lord Ganesha in the society central courtyard with dhol-tasha pathak, maha-aarti, cultural bhajan sandhya, and prasad distribution.',
    date: '2026-09-02',
    time: '08:00 AM onwards',
    venue: 'Sapana Park Central Courtyard Mandap',
    organizer: 'Ganesh Utsav Samiti',
    organizerPhone: '+91 98223 99001',
    bannerColor: 'bg-amber-600',
    attendeesCount: 82,
    userRSVP: 'Going',
    requiresRegistration: true,
  },
  {
    id: 'EVT-105',
    title: 'Annual Table Tennis & Carrom Championship',
    category: 'Sports',
    description: 'Inter-wing tournament across Singles, Doubles, and Junior categories (Under-15). Trophy and medal ceremony with evening high tea.',
    date: '2026-09-08',
    time: '09:00 AM - 05:00 PM',
    venue: 'Clubhouse Sports Arena',
    organizer: 'Youth Sports Club (Sunil Deshmukh)',
    organizerPhone: '+91 98231 00221',
    bannerColor: 'bg-indigo-700',
    attendeesCount: 31,
    userRSVP: null,
    requiresRegistration: true,
    maxCapacity: 40,
  },
];

export const INITIAL_EMPOWERMENT: WomenEmpowermentInitiative[] = [
  {
    id: 'EMP-1',
    title: 'Deshmukh Home Bakes & Traditional Goan Sweets',
    presenter: 'Anjali Deshmukh',
    flatNumber: 'B-101',
    type: 'Home Bakery',
    description: 'Freshly baked Bebinca, Dodol, Pinaca, eggless chocolate truffles, and customized birthday cakes delivered right to your flat doorstep.',
    contactPhone: '9823011223',
    rating: 4.9,
    verifiedBySociety: true,
  },
  {
    id: 'EMP-2',
    title: 'Goan Culinary & Fish Recheado Paste Delights',
    presenter: 'Maria D’Souza',
    flatNumber: 'C-204',
    type: 'Culinary Service',
    description: 'Authentic stone-ground Goan Recheado masala, Cafreal marinade, fish curry paste, and weekend prawn balchão orders.',
    contactPhone: '9422055679',
    rating: 5.0,
    verifiedBySociety: true,
  },
  {
    id: 'EMP-3',
    title: 'Priya’s CBSE & ICSE Mathematics & Science Coaching',
    presenter: 'Priya Naik',
    flatNumber: 'A-302',
    type: 'Tuition & Coaching',
    description: 'Specialized batch for Classes 6th to 10th. Small group size of 6 students for personalized focus and exam prep.',
    contactPhone: '9822145671',
    rating: 4.8,
    verifiedBySociety: true,
  },
];

export function getStoredEvents(): CommunityEvent[] {
  const saved = localStorage.getItem(EVENTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return INITIAL_EVENTS;
}

export function saveEvents(events: CommunityEvent[]): void {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));
}

export function updateRSVP(eventId: string, rsvp: 'Going' | 'Maybe' | 'Not Going'): CommunityEvent[] {
  const events = getStoredEvents();
  const index = events.findIndex((e) => e.id === eventId);
  if (index !== -1) {
    const prev = events[index].userRSVP;
    events[index].userRSVP = rsvp;

    if (rsvp === 'Going' && prev !== 'Going') {
      events[index].attendeesCount += 1;
    } else if (prev === 'Going' && rsvp !== 'Going') {
      events[index].attendeesCount = Math.max(0, events[index].attendeesCount - 1);
    }
    saveEvents(events);
  }
  return events;
}

export function registerUserForEvent(
  eventId: string,
  residentName: string,
  flatNumber: string,
  phone: string,
  seatsCount: number = 1
): { events: CommunityEvent[]; registration: EventRegistration } {
  const events = getStoredEvents();
  const index = events.findIndex((e) => e.id === eventId);
  
  const regId = `REG-SP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const registration: EventRegistration = {
    registrationId: regId,
    eventId,
    eventTitle: index !== -1 ? events[index].title : 'Society Event',
    residentName,
    flatNumber,
    phone,
    seatsBooked: seatsCount,
    registeredAt: new Date().toLocaleString('en-IN'),
  };

  if (index !== -1) {
    const target = events[index];
    if (!target.registrations) {
      target.registrations = [];
    }
    target.registrations.push(registration);
    target.userRSVP = 'Going';
    target.attendeesCount += seatsCount;
    saveEvents(events);
  }

  return { events, registration };
}

export function addNewEvent(newEventData: Omit<CommunityEvent, 'id' | 'attendeesCount' | 'userRSVP'>): CommunityEvent[] {
  const events = getStoredEvents();
  const createdEvent: CommunityEvent = {
    ...newEventData,
    id: `EVT-${Math.floor(200 + Math.random() * 800)}`,
    attendeesCount: 1,
    userRSVP: 'Going',
    registrations: [],
  };
  events.unshift(createdEvent);
  saveEvents(events);
  return events;
}

