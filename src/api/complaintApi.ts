import { Complaint, ComplaintCategory, ComplaintPriority, ComplaintStatus } from '../models/complaint';

const COMPLAINTS_KEY = 'sapana_park_complaints_db';

export const INITIAL_COMPLAINTS: Complaint[] = [
  {
    id: 'CMP-2026-104',
    title: 'Main Overhead Tank Pump Noise & Pressure Drop',
    category: 'Plumbing & Water Supply',
    priority: 'High',
    status: 'In Progress',
    description: 'The automated water pump serving Wing A & B is making excessive grinding noise during 6:00 AM fills, and top floor flats (A-302, A-402) are experiencing low water pressure.',
    flatNumber: 'A-302',
    residentName: 'Rajesh Naik',
    residentPhone: '9822145670',
    createdAt: '2026-08-08 07:30 AM',
    updatedAt: '2026-08-09 11:15 AM',
    assignedVendor: 'Goa Electro-Plumb Services (Mr. Francis)',
    estimatedResolutionDate: '2026-08-11',
    timeline: [
      {
        id: 'TL-1',
        timestamp: '2026-08-08 07:30 AM',
        updatedBy: 'Resident (Rajesh Naik)',
        status: 'Open',
        note: 'Ticket raised via Sapana Park Portal with recorded video audio.',
        isPublic: true,
      },
      {
        id: 'TL-2',
        timestamp: '2026-08-08 10:15 AM',
        updatedBy: 'Society Admin (Estate Mgr)',
        status: 'In Progress',
        note: 'Inspected pump house. Bearing wear identified. Vendor Mr. Francis engaged to replace impeller shaft assembly.',
        isPublic: true,
      },
      {
        id: 'TL-3',
        timestamp: '2026-08-09 11:15 AM',
        updatedBy: 'Vendor (Goa Electro-Plumb)',
        status: 'In Progress',
        note: 'Replacement bearing received from Panaji warehouse. Installation scheduled for Monday 10:00 AM.',
        isPublic: true,
      },
    ],
  },
  {
    id: 'CMP-2026-102',
    title: 'Wing C Elevator Door Sensor Intermittent Re-opening',
    category: 'Lift Maintenance',
    priority: 'Medium',
    status: 'Resolved',
    description: 'Wing C lift door infra-red light curtain safety sensor was misaligned, causing doors to retract 3-4 times before closing.',
    flatNumber: 'C-204',
    residentName: 'David D’Souza',
    residentPhone: '9422055678',
    createdAt: '2026-08-02 04:20 PM',
    updatedAt: '2026-08-03 02:00 PM',
    assignedVendor: 'Schindler Goa Maintenance Division',
    estimatedResolutionDate: '2026-08-03',
    resolutionSummary: 'Optic sensor cleaned, recalibrated, and door timing delay adjusted. Safety audit passed.',
    timeline: [
      {
        id: 'TL-101',
        timestamp: '2026-08-02 04:20 PM',
        updatedBy: 'Resident (David D’Souza)',
        status: 'Open',
        note: 'Ticket logged.',
        isPublic: true,
      },
      {
        id: 'TL-102',
        timestamp: '2026-08-03 02:00 PM',
        updatedBy: 'Secretary (Rajesh Naik)',
        status: 'Resolved',
        note: 'Technician completed realignment. Tested with 10 door cycles.',
        isPublic: true,
      },
    ],
  },
  {
    id: 'CMP-2026-101',
    title: 'Clubhouse Outer Corridor Light Fixture Flicker',
    category: 'Electrical & Generator',
    priority: 'Low',
    status: 'Open',
    description: 'LED choke fixture outside clubhouse entrance flickering constantly in the evening.',
    flatNumber: 'B-101',
    residentName: 'Anjali Deshmukh',
    residentPhone: '9823011223',
    createdAt: '2026-08-09 08:10 PM',
    updatedAt: '2026-08-09 08:10 PM',
    timeline: [
      {
        id: 'TL-201',
        timestamp: '2026-08-09 08:10 PM',
        updatedBy: 'Resident (Anjali Deshmukh)',
        status: 'Open',
        note: 'Ticket submitted.',
        isPublic: true,
      },
    ],
  },
];

export function getStoredComplaints(): Complaint[] {
  const saved = localStorage.getItem(COMPLAINTS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return INITIAL_COMPLAINTS;
}

export function deleteComplaint(complaintId: string): Complaint[] {
  const complaints = getStoredComplaints().filter((c) => c.id !== complaintId);
  saveComplaints(complaints);
  return complaints;
}

export function saveComplaints(complaints: Complaint[]): void {
  localStorage.setItem(COMPLAINTS_KEY, JSON.stringify(complaints));
}

export function createComplaint(
  data: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt' | 'timeline' | 'status'>
): Complaint {
  const complaints = getStoredComplaints();
  const id = `CMP-2026-${105 + complaints.length}`;
  const now = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const newComplaint: Complaint = {
    ...data,
    id,
    status: 'Open',
    createdAt: now,
    updatedAt: now,
    timeline: [
      {
        id: `TL-${Date.now()}`,
        timestamp: now,
        updatedBy: `Resident (${data.residentName})`,
        status: 'Open',
        note: 'Ticket submitted via Sapana Park App.',
        isPublic: true,
      },
    ],
  };

  complaints.unshift(newComplaint);
  saveComplaints(complaints);
  return newComplaint;
}

export function updateComplaintStatus(
  complaintId: string,
  newStatus: ComplaintStatus,
  updaterName: string,
  note: string,
  assignedVendor?: string
): Complaint | null {
  const complaints = getStoredComplaints();
  const index = complaints.findIndex((c) => c.id === complaintId);
  if (index === -1) return null;

  const now = new Date().toLocaleString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const target = complaints[index];
  target.status = newStatus;
  target.updatedAt = now;
  if (assignedVendor) {
    target.assignedVendor = assignedVendor;
  }

  target.timeline.push({
    id: `TL-${Date.now()}`,
    timestamp: now,
    updatedBy: updaterName,
    status: newStatus,
    note,
    isPublic: true,
  });

  complaints[index] = target;
  saveComplaints(complaints);
  return target;
}
