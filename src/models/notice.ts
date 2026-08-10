export type NoticeCategory =
  | 'AGM & Meetings'
  | 'Maintenance & Repairs'
  | 'Utility Alert'
  | 'Rule & Regulation'
  | 'Festival & Social'
  | 'Security Directive';

export type NoticeUrgency = 'Normal' | 'Important' | 'Urgent';

export interface Notice {
  id: string; // e.g. "NTC-89"
  title: string;
  category: NoticeCategory;
  urgency: NoticeUrgency;
  content: string;
  issuedBy: string; // e.g. "Hon. Secretary - Sapana Park CHS"
  date: string;
  expiryDate?: string;
  attachmentTitle?: string;
  pinned: boolean;
  viewCount: number;
}
