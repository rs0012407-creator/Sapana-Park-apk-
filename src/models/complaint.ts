export type ComplaintCategory =
  | 'Plumbing & Water Supply'
  | 'Electrical & Generator'
  | 'Lift Maintenance'
  | 'Security & Gate Pass'
  | 'Sanitation & Garbage'
  | 'Civil & Leakage'
  | 'Noise & Disturbance'
  | 'General & Others';

export type ComplaintPriority = 'Low' | 'Medium' | 'High' | 'Emergency';
export type ComplaintStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';

export interface TimelineEvent {
  id: string;
  timestamp: string;
  updatedBy: string; // e.g., "Resident (Rajesh Naik)", "Society Estate Mgr", "Plumber Technician"
  status: ComplaintStatus;
  note: string;
  isPublic: boolean;
}

export interface Complaint {
  id: string; // e.g., "CMP-2026-104"
  title: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  description: string;
  flatNumber: string;
  residentName: string;
  residentPhone: string;
  createdAt: string;
  updatedAt: string;
  assignedVendor?: string;
  estimatedResolutionDate?: string;
  resolutionSummary?: string;
  attachmentUrl?: string;
  photoUrls?: string[]; // Base64 or Object URLs captured from Camera/Gallery
  timeline: TimelineEvent[];
}
