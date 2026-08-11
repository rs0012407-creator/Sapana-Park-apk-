export type ResidentType = 'Owner' | 'Tenant';

export interface VerificationDocument {
  id: string;
  type:
    | 'Aadhaar Card'
    | 'PAN Card'
    | 'Possession Certificate'
    | 'Rent Agreement'
    | 'Police Verification Form N-1'
    | 'Electricity Bill'
    | 'Voter ID'
    | 'Driving License'
    | 'Passport'
    | 'Other';
  documentNumber: string; // e.g. "XXXX-XXXX-1234"
  status: 'Verified' | 'Pending Review' | 'Submitted';
  uploadedDate: string;
  fileName?: string;
  fileDataUrl?: string;
  expiryDate?: string;
  remarks?: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: string; // e.g. "Spouse", "Son", "Daughter", "Father", "Mother", "Relative"
  age: number;
  gender?: 'Male' | 'Female' | 'Other';
  occupation?: string;
  email?: string;
  bloodGroup?: string;
  phone?: string;
  idProofType?: string;
  idProofNumber?: string;
}

export interface Resident {
  id: string;
  name: string;
  email: string;
  phone: string;
  wing: 'A' | 'B' | 'C' | 'D';
  flatNumber: string; // e.g. "A-302"
  residentType: ResidentType;
  memberId: string; // e.g. "SP-A302"
  ownershipShareNo?: string;
  occupantsCount: number;
  familyMembers?: FamilyMember[];
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  moveInDate: string;
  isCommitteeMember?: boolean;
  committeeRole?: string; // e.g., 'Chairman', 'Secretary', 'Treasurer', 'Member'
  verificationDocuments?: VerificationDocument[];
  avatarUrl?: string;
}

export interface TenantDetails {
  tenantName: string;
  tenantPhone: string;
  tenantEmail: string;
  ownerName: string;
  flatNumber: string;
  agreementStartDate: string;
  agreementEndDate: string;
  policeVerificationDone: boolean;
  nocApproved: boolean;
}

