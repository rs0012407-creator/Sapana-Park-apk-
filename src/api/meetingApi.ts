import { SocietyMeeting } from '../models/meeting';

const MEETINGS_STORAGE_KEY = 'sapana_park_society_meetings_v1';

export const INITIAL_MEETINGS: SocietyMeeting[] = [
  {
    id: 'MTG-2026-01',
    title: 'Annual General Body Meeting (AGM 2026) & Financial Audit Approval',
    meetingType: 'AGM (Annual General Body)',
    status: 'Upcoming',
    date: 'Sunday, 23rd August 2026',
    time: '10:30 AM - 01:00 PM (Fellowship Lunch Follows)',
    venue: 'Sapana Park Community Clubhouse Hall & Google Meet Online',
    onlineJoinUrl: 'https://meet.google.com/spk-agm-2026',
    organizer: 'Shri Rajesh Naik',
    organizerRole: 'Hon. Secretary',
    organizerPhone: '+91 98221 45670',
    agendaItems: [
      '1. Confirmation of Minutes of previous AGM held on 10th August 2025.',
      '2. Review & Approval of Audited Financial Balance Sheet for FY 2025-26.',
      '3. Approval of Revised Monthly Maintenance Charges & Sink Fund allocation.',
      '4. Selection & Renewal of Elevator AMC Contractor (Schindler Lift Services).',
      '5. Terrace Waterproofing Tender Bids evaluation for Wing A & Wing B.',
      '6. Election / Re-constitution of Sub-Committees (Cultural, Security & Maintenance).',
    ],
    quorumRequired: 50,
    confirmedAttendeesCount: 42,
    onlineAttendeesCount: 14,
    proxyCount: 6,
    userRsvpStatus: 'Attending In-Person',
    agendaPdfName: 'Sapana_Park_AGM_2026_Notice_Agenda.pdf',
    previousMinutesPdfName: 'AGM_2025_Approved_Minutes.pdf',
    notesOrResolution: 'All resident owners are requested to attend in person or online. Refreshments & fellowship lunch will be served.',
  },
  {
    id: 'MTG-2026-02',
    title: 'Emergency Security & Water Supply Infrastructure Special Meeting',
    meetingType: 'Emergency Security & Water',
    status: 'Live Now',
    date: 'Today, 10th August 2026',
    time: '06:30 PM Onwards (Live Stream Active)',
    venue: 'Society Managing Office & Zoom Virtual Conference Room',
    onlineJoinUrl: 'https://zoom.us/j/9822100000?pwd=SapanaParkMeeting',
    organizer: 'Shri V. S. Rane',
    organizerRole: 'Society President',
    organizerPhone: '+91 98221 00000',
    agendaItems: [
      '1. Installation of Automated Overhead Tank Sensors for PWD Water Line.',
      '2. Reviewing Night Guard Shift Attendance & Main Gate Automatic RFID Barrier.',
      '3. Solar Grid Expansion for Common Area Corridor & Garden Illumination.',
    ],
    quorumRequired: 20,
    confirmedAttendeesCount: 22,
    onlineAttendeesCount: 18,
    proxyCount: 2,
    userRsvpStatus: 'Attending Online',
    agendaPdfName: 'Emergency_Water_Security_Meeting_Notice.pdf',
    notesOrResolution: 'Virtual Zoom room is currently active. Click Join Online Meeting to participate.',
  },
  {
    id: 'MTG-2026-03',
    title: 'August Monthly Managing Committee Review & Complaints Resolution',
    meetingType: 'Managing Committee Review',
    status: 'Completed',
    date: '02nd August 2026',
    time: '07:00 PM - 08:30 PM',
    venue: 'Society Office, Clubhouse',
    organizer: 'Anjali Deshmukh',
    organizerRole: 'Hon. Treasurer',
    organizerPhone: '+91 98221 88900',
    agendaItems: [
      '1. Recovery status of July 2026 Maintenance Receipts.',
      '2. Monsoon Organic Pest Control & Anti-Mosquito Fogging Schedule.',
      '3. Review of Plumbing Shaft Repair Quotes for Block B.',
    ],
    quorumRequired: 7,
    confirmedAttendeesCount: 12,
    onlineAttendeesCount: 4,
    proxyCount: 0,
    userRsvpStatus: 'Attending In-Person',
    previousMinutesPdfName: 'Committee_Meeting_August_Minutes.pdf',
    notesOrResolution: 'Resolution Passed: Mosquito fogging every Wednesday. Maintenance recovery reached 92%.',
  },
];

export function getStoredMeetings(): SocietyMeeting[] {
  try {
    const raw = localStorage.getItem(MEETINGS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to load meetings:', err);
  }
  return INITIAL_MEETINGS;
}

export function saveStoredMeetings(meetings: SocietyMeeting[]): void {
  try {
    localStorage.setItem(MEETINGS_STORAGE_KEY, JSON.stringify(meetings));
  } catch (err) {
    console.error('Failed to save meetings:', err);
  }
}

export function updateMeetingRsvp(
  meetingId: string,
  newRsvp: 'Attending In-Person' | 'Attending Online' | 'Proxy Submitted' | 'Not Attending'
): SocietyMeeting[] {
  const current = getStoredMeetings();
  const updated = current.map((m) => {
    if (m.id === meetingId) {
      const oldRsvp = m.userRsvpStatus;
      let inPerson = m.confirmedAttendeesCount;
      let online = m.onlineAttendeesCount;
      let proxy = m.proxyCount;

      // Decrement old count
      if (oldRsvp === 'Attending In-Person' && inPerson > 0) inPerson--;
      if (oldRsvp === 'Attending Online' && online > 0) online--;
      if (oldRsvp === 'Proxy Submitted' && proxy > 0) proxy--;

      // Increment new count
      if (newRsvp === 'Attending In-Person') inPerson++;
      if (newRsvp === 'Attending Online') online++;
      if (newRsvp === 'Proxy Submitted') proxy++;

      return {
        ...m,
        userRsvpStatus: newRsvp,
        confirmedAttendeesCount: inPerson,
        onlineAttendeesCount: online,
        proxyCount: proxy,
      };
    }
    return m;
  });
  saveStoredMeetings(updated);
  return updated;
}

export function addNewMeeting(meetingData: Omit<SocietyMeeting, 'id' | 'confirmedAttendeesCount' | 'onlineAttendeesCount' | 'proxyCount' | 'userRsvpStatus'>): SocietyMeeting[] {
  const current = getStoredMeetings();
  const created: SocietyMeeting = {
    ...meetingData,
    id: `MTG-2026-${String(current.length + 1).padStart(2, '0')}`,
    confirmedAttendeesCount: 1,
    onlineAttendeesCount: 0,
    proxyCount: 0,
    userRsvpStatus: null,
  };
  const updated = [created, ...current];
  saveStoredMeetings(updated);
  return updated;
}
