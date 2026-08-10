/**
 * Reference Guidelines for Sapana Park CHS under the Goa Co-operative Societies Act, 2001
 * & Goa Co-operative Societies Rules, 2003.
 */

export interface GoaActSection {
  sectionNo: string;
  topic: string;
  keyRequirement: string;
  penaltyNotice: string;
}

export const GOA_SOCIETY_ACT_HIGHLIGHTS: GoaActSection[] = [
  {
    sectionNo: 'Section 69',
    topic: 'Maintenance Charges & Non-Occupancy Charges',
    keyRequirement:
      'Non-occupancy charges levied on rented flats cannot exceed 10% of the service charges (excluding municipal taxes, water & electricity consumption charges).',
    penaltyNotice: 'Arbitrary excess levy is appealable before the Registrar of Co-operative Societies, Panaji.',
  },
  {
    sectionNo: 'Section 78',
    topic: 'Annual General Meeting (AGM) Compliance',
    keyRequirement:
      'Every housing society must hold its AGM within 6 months of the close of the financial year (before 30th September). 14 days prior notice is mandatory.',
    penaltyNotice: 'Delay in holding AGM without Registrar extension leads to disqualification of managing committee.',
  },
  {
    sectionNo: 'Section 82',
    topic: 'Member Audit & Financial Books',
    keyRequirement:
      'Accounts must be audited annually by an auditor approved by the Registrar. Members have right to inspect books during office hours.',
    penaltyNotice: 'Failure to present audited statements within prescribed timeline.',
  },
  {
    sectionNo: 'Section 106',
    topic: 'Dispute Resolution & Bye-Law Enforcement',
    keyRequirement:
      'Internal disputes regarding maintenance arrears, parking allotment, or unauthorised alterations must first be submitted to the Society Grievance Committee.',
    penaltyNotice: 'Unresolved disputes move to Cooperative Court, Margao / Panaji.',
  },
];

export const COMPLIANCE_FORMS_LIST = [
  {
    formCode: 'Form I',
    name: 'Application for Membership of Society by Transferor & Transferee',
    description: 'Mandatory for flat resale and name registration in society share certificate.',
  },
  {
    formCode: 'Form L',
    name: 'Nomination Form under Section 30 of Goa Act',
    description: 'Designates nominee(s) for flat ownership transfer upon member demise.',
  },
  {
    formCode: 'Form N-1',
    name: 'Tenant / Licensee Information & Police Verification Intimation',
    description: 'Required before tenant move-in as per Goa Police & Society Bye-Laws.',
  },
  {
    formCode: 'Form NOC-1',
    name: 'No Objection Certificate for Renovation & Structural Work',
    description: 'Safety declaration guaranteeing no structural pillars or load-bearing walls are modified.',
  },
];
