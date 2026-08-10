export interface SocietyMeeting {
  id: string;
  title: string;
  meetingType: 'AGM (Annual General Body)' | 'EGM (Extraordinary General Body)' | 'Managing Committee Review' | 'Resident General Body' | 'Emergency Security & Water';
  status: 'Upcoming' | 'Live Now' | 'Completed';
  date: string;
  time: string;
  venue: string;
  onlineJoinUrl?: string;
  organizer: string;
  organizerRole: string;
  organizerPhone: string;
  agendaItems: string[];
  quorumRequired: number;
  confirmedAttendeesCount: number;
  onlineAttendeesCount: number;
  proxyCount: number;
  userRsvpStatus: 'Attending In-Person' | 'Attending Online' | 'Proxy Submitted' | 'Not Attending' | null;
  agendaPdfName?: string;
  previousMinutesPdfName?: string;
  notesOrResolution?: string;
}
