import { Resident } from '../models/resident';
import { UserAccount, AuthResponse, ResidentType } from '../models/user';

export interface UserSession {
  resident: Resident;
  userAccount?: UserAccount;
  role: 'Resident' | 'Secretary' | 'Treasurer' | 'Admin';
  isLoggedIn: boolean;
}

export const INITIAL_RESIDENTS: Resident[] = [
  {
    id: 'RES-101',
    name: 'Rajesh Naik',
    email: 'rajesh.naik@sapanapark.org',
    phone: '9822145670',
    wing: 'A',
    flatNumber: 'A-302',
    residentType: 'Owner',
    memberId: 'SP-A302',
    ownershipShareNo: 'SHARE-042',
    occupantsCount: 4,
    emergencyContact: {
      name: 'Priya Naik',
      relation: 'Spouse',
      phone: '9822145671',
    },
    moveInDate: '2014-06-15',
    isCommitteeMember: true,
    committeeRole: 'Secretary',
  },
  {
    id: 'RES-102',
    name: 'Anjali Deshmukh',
    email: 'anjali.d@gmail.com',
    phone: '9823011223',
    wing: 'B',
    flatNumber: 'B-101',
    residentType: 'Owner',
    memberId: 'SP-B101',
    ownershipShareNo: 'SHARE-018',
    occupantsCount: 3,
    emergencyContact: {
      name: 'Rohan Deshmukh',
      relation: 'Son',
      phone: '9823011224',
    },
    moveInDate: '2016-11-20',
    isCommitteeMember: true,
    committeeRole: 'Treasurer',
  },
  {
    id: 'RES-103',
    name: 'David D’Souza',
    email: 'david.dsouza@outlook.com',
    phone: '9422055678',
    wing: 'C',
    flatNumber: 'C-204',
    residentType: 'Owner',
    memberId: 'SP-C204',
    ownershipShareNo: 'SHARE-089',
    occupantsCount: 2,
    emergencyContact: {
      name: 'Maria D’Souza',
      relation: 'Spouse',
      phone: '9422055679',
    },
    moveInDate: '2018-02-10',
    isCommitteeMember: false,
  },
  {
    id: 'RES-104',
    name: 'Vikram & Swati Sharma',
    email: 'vikram.sharma@techgoa.in',
    phone: '8390123456',
    wing: 'D',
    flatNumber: 'D-401',
    residentType: 'Tenant',
    memberId: 'SP-D401-T',
    occupantsCount: 2,
    emergencyContact: {
      name: 'Sunil Sharma',
      relation: 'Father',
      phone: '9822998877',
    },
    moveInDate: '2025-01-01',
    isCommitteeMember: false,
  },
];

const SESSION_KEY = 'sapana_park_user_session';

export function mapUserAccountToResident(user: UserAccount): Resident {
  const wingMatch = user.blockNumber || user.flatNumber.charAt(0) || 'A';
  const rawWing = wingMatch.replace(/Wing\s*/i, '').trim().toUpperCase();
  const validWing: 'A' | 'B' | 'C' | 'D' = ['A', 'B', 'C', 'D'].includes(rawWing)
    ? (rawWing as 'A' | 'B' | 'C' | 'D')
    : 'A';

  return {
    id: user.id,
    name: user.fullName,
    email: user.email,
    phone: user.mobileNumber,
    wing: validWing,
    flatNumber: user.flatNumber || 'A-101',
    residentType: (user.residentType as 'Owner' | 'Tenant') || 'Owner',
    memberId: `SP-${user.flatNumber || 'A101'}`,
    ownershipShareNo: user.residentType === 'Owner' ? `SHARE-${user.id.slice(-3)}` : undefined,
    occupantsCount: 3,
    emergencyContact: {
      name: 'Sunita Naik (Family)',
      relation: 'Spouse',
      phone: user.mobileNumber,
    },
    moveInDate: user.createdAt.split('T')[0],
    isCommitteeMember: user.role === 'Secretary' || user.role === 'Treasurer' || user.role === 'Admin',
    committeeRole: user.role === 'Secretary' ? 'Secretary' : user.role === 'Treasurer' ? 'Treasurer' : undefined,
    avatarUrl: user.profilePhoto,
  };
}

export function getStoredSession(): UserSession {
  const saved = localStorage.getItem(SESSION_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return {
    resident: INITIAL_RESIDENTS[0],
    role: 'Secretary',
    isLoggedIn: true,
  };
}

export function saveSession(session: UserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem('sapana_park_user_profile_cache');
}

// REST API CLIENT CALLS
export async function registerUserApi(data: {
  fullName: string;
  email: string;
  mobileNumber: string;
  password?: string;
  colonyName: string;
  flatNumber: string;
  blockNumber: string;
  floorNumber: string;
  residentType: ResidentType;
  profilePhoto?: string;
  authProvider?: 'Email' | 'Google';
  googleId?: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Network error during registration. Please check connection.' };
  }
}

export async function loginUserApi(loginIdentifier: string, password?: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ loginIdentifier, password }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Network error during login. Please check connection.' };
  }
}

export async function googleAuthApi(googleProfile: {
  googleId?: string;
  email: string;
  fullName: string;
  profilePhoto?: string;
}): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleProfile),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Network error during Google login.' };
  }
}

export async function forgotPasswordApi(identifier: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  try {
    const response = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Network error requesting password reset.' };
  }
}

export async function resetPasswordApi(identifier: string, resetToken: string, newPassword: string): Promise<AuthResponse> {
  try {
    const response = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, resetToken, newPassword }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Network error resetting password.' };
  }
}

export async function updateUserProfileApi(userId: string, updates: Partial<UserAccount>): Promise<{ success: boolean; message: string; user?: UserAccount }> {
  try {
    const response = await fetch('/api/users/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, updates }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Network error updating profile.' };
  }
}

export async function fetchAdminUsersApi(): Promise<{ success: boolean; users?: UserAccount[]; message?: string }> {
  try {
    const response = await fetch('/api/admin/users');
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Failed to connect to backend user management API.' };
  }
}

export async function updateUserStatusApi(
  userId: string,
  verificationStatus?: UserAccount['verificationStatus'],
  accountStatus?: UserAccount['accountStatus'],
  role?: UserAccount['role']
): Promise<{ success: boolean; message: string; user?: UserAccount }> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verificationStatus, accountStatus, role }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Failed to update user status.' };
  }
}

export async function resetUserAccessApi(userId: string, defaultPassword?: string): Promise<{ success: boolean; message: string; newPass?: string }> {
  try {
    const response = await fetch(`/api/admin/users/${userId}/reset-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ defaultPassword }),
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Failed to reset user access.' };
  }
}

export async function deleteUserApi(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: 'DELETE',
    });
    return await response.json();
  } catch (err: any) {
    return { success: false, message: 'Failed to delete user.' };
  }
}

export function loginWithFlatAndOTP(flatNumber: string, otp: string): { success: boolean; message: string; session?: UserSession } {
  const found = INITIAL_RESIDENTS.find(
    (r) => r.flatNumber.toLowerCase() === flatNumber.trim().toLowerCase()
  );

  if (!found) {
    return { success: false, message: 'Flat number not found in Sapana Park directory.' };
  }

  if (otp.trim() !== '1234' && otp.trim() !== '8888') {
    return { success: false, message: 'Invalid OTP. Please use test OTP: 1234' };
  }

  const role = found.isCommitteeMember ? (found.committeeRole as 'Secretary' | 'Treasurer') : 'Resident';
  const session: UserSession = {
    resident: found,
    role,
    isLoggedIn: true,
  };

  saveSession(session);
  return { success: true, message: `Welcome back, ${found.name}!`, session };
}
