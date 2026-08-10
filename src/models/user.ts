export type ResidentType = 'Owner' | 'Tenant' | 'Family Member' | 'Shop Owner';
export type VerificationStatus = 'Pending Verification' | 'Verified' | 'Rejected';
export type AccountStatus = 'Active' | 'Suspended';
export type UserRole = 'Resident' | 'Secretary' | 'Treasurer' | 'Admin';
export type AuthProvider = 'Email' | 'Google';

export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  passwordHash?: string;
  salt?: string;
  authProvider: AuthProvider;
  googleId?: string;
  colonyName: string;
  flatNumber: string;
  blockNumber: string;
  floorNumber: string;
  residentType: ResidentType;
  profilePhoto?: string;
  verificationStatus: VerificationStatus;
  accountStatus: AccountStatus;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  resetToken?: string;
  resetTokenExpiry?: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserAccount;
  requiresColonyCompletion?: boolean;
}
