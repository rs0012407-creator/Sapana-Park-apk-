import { ByeLawChapter, NOCApplication, NOCType } from '../models/document';

const NOC_KEY = 'sapana_park_noc_db';

export const INITIAL_NOCS: NOCApplication[] = [
  {
    id: 'NOC-2026-44',
    type: 'Tenant Verification & Lease',
    applicantName: 'Vikram & Swati Sharma',
    flatNumber: 'D-401',
    applicantPhone: '8390123456',
    applicantEmail: 'vikram.sharma@techgoa.in',
    submissionDate: '2026-08-01',
    purposeReason: 'Leave and License agreement for 11 months tenant registration with Porvorim Police Station.',
    status: 'Approved',
    approvedBy: 'Rajesh Naik (Hon. Secretary)',
    approvedDate: '2026-08-03',
    generatedCertificateNumber: 'SP-NOC-2026-T401',
    documentsAttached: ['Leave_and_License_Agreement.pdf', 'Tenant_Aadhaar_Copies.pdf', 'Police_Verification_Ack.pdf'],
  },
  {
    id: 'NOC-2026-42',
    type: 'Flat Renovation & Interior Work',
    applicantName: 'David D’Souza',
    flatNumber: 'C-204',
    applicantPhone: '9422055678',
    applicantEmail: 'david.dsouza@outlook.com',
    submissionDate: '2026-08-05',
    purposeReason: 'Bathroom waterproofing, tiling upgrade, and kitchen modular woodwork fitting.',
    status: 'Under Review',
    documentsAttached: ['Architect_Drawing.pdf', 'Debris_Disposal_Plan.pdf'],
  },
];

export const BYE_LAW_CHAPTERS: ByeLawChapter[] = [
  {
    id: 'BL-1',
    chapterNumber: 1,
    title: 'Preliminary, Objects & Membership Rights',
    summary: 'Defines active members, associate members, occupancy rights, and voting eligibility in General Body meetings under the Goa Co-operative Societies Act 2001.',
    fullText: 'Section 1.1: Every member of Sapana Park CHS shall enjoy full right of quiet enjoyment of their flat. Section 1.2: Share certificate transfers must be submitted on Form I with requisite transfer premium fee.',
    relevantSections: ['Sec 14 Goa Act', 'Rule 18 Goa Rules'],
  },
  {
    id: 'BL-2',
    chapterNumber: 2,
    title: 'Levy of Maintenance, Sinking Fund & Non-Occupancy',
    summary: 'Rules governing monthly billing calculation, interest on overdue payments (max 18% p.a.), and non-occupancy charges capped at 10% of service charges for rented units.',
    fullText: 'Section 2.1: Maintenance bills are payable by the 20th of every month. Section 2.2: Late payment interest shall be levied at 18% p.a. pro-rata from the 21st day. Section 2.3: Non-occupancy charges shall strictly abide by Goa Act Sec 69.',
    relevantSections: ['Sec 69 Goa Act', 'Bye-law 67(a)'],
  },
  {
    id: 'BL-3',
    chapterNumber: 3,
    title: 'Parking Slot Allocation & Vehicle Traffic',
    summary: 'Allocation guidelines for stilt 4-wheeler slots, open slots, EV charging point installations, visitor parking timing, and speed limits inside compound (15 km/h).',
    fullText: 'Section 3.1: Stilt parking slots are allotted based on seniority and flat size. Section 3.2: EV Charger installation requires prior society technical NOC from certified electrician. Section 3.3: Overnight visitor parking requires security guard logging.',
    relevantSections: ['Rule 42 Goa Rules', 'Internal Circular 04/2024'],
  },
  {
    id: 'BL-4',
    chapterNumber: 4,
    title: 'NOC Guidelines, Tenant Verification & Alterations',
    summary: 'Mandatory police verification procedures, noise limits for renovation (9 AM to 6 PM), debris removal rules, and mandatory NOCs for flat sale, loan, or tenancy.',
    fullText: 'Section 4.1: No structural wall, pillar, or RCC column shall be chipped or modified. Section 4.2: Tenants must complete Porvorim Police Station verification before keys handed over. Section 4.3: Debris must be removed at owner expense within 48 hours.',
    relevantSections: ['Form N-1 Police Rules', 'Bye-law 104'],
  },
];

export function getStoredNOCs(): NOCApplication[] {
  const saved = localStorage.getItem(NOC_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return INITIAL_NOCS;
}

export function saveNOCs(nocs: NOCApplication[]): void {
  localStorage.setItem(NOC_KEY, JSON.stringify(nocs));
}

export function submitNOCApplication(
  type: NOCType,
  applicantName: string,
  flatNumber: string,
  applicantPhone: string,
  applicantEmail: string,
  purposeReason: string,
  documentsAttached: string[]
): NOCApplication {
  const nocs = getStoredNOCs();
  const id = `NOC-2026-${45 + nocs.length}`;
  const today = new Date().toISOString().split('T')[0];

  const newNoc: NOCApplication = {
    id,
    type,
    applicantName,
    flatNumber,
    applicantPhone,
    applicantEmail,
    submissionDate: today,
    purposeReason,
    status: 'Submitted',
    documentsAttached,
  };

  nocs.unshift(newNoc);
  saveNOCs(nocs);
  return newNoc;
}

export function approveNOC(nocId: string, approverName: string): NOCApplication | null {
  const nocs = getStoredNOCs();
  const index = nocs.findIndex((n) => n.id === nocId);
  if (index === -1) return null;

  const today = new Date().toISOString().split('T')[0];
  const certNo = `SP-NOC-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  nocs[index] = {
    ...nocs[index],
    status: 'Approved',
    approvedBy: approverName,
    approvedDate: today,
    generatedCertificateNumber: certNo,
  };

  saveNOCs(nocs);
  return nocs[index];
}
