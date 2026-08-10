export type NOCType =
  | 'Tenant Verification & Lease'
  | 'Flat Renovation & Interior Work'
  | 'Passport Renewal'
  | 'Bank Loan & Flat Mortgage'
  | 'Vehicle Parking Slot Allotment'
  | 'Flat Transfer & Sale';

export type NOCStatus = 'Draft' | 'Submitted' | 'Under Review' | 'Approved' | 'Rejected';

export interface NOCApplication {
  id: string; // e.g. "NOC-2026-44"
  type: NOCType;
  applicantName: string;
  flatNumber: string;
  applicantPhone: string;
  applicantEmail: string;
  submissionDate: string;
  purposeReason: string;
  status: NOCStatus;
  approvedBy?: string; // e.g., "Secretary / Chairman"
  approvedDate?: string;
  rejectionReason?: string;
  generatedCertificateNumber?: string;
  documentsAttached: string[];
}

export interface ByeLawChapter {
  id: string;
  chapterNumber: number;
  title: string;
  summary: string;
  fullText: string;
  relevantSections: string[];
}
