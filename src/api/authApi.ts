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
    role: 'Resident',
    isLoggedIn: false,
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

/**
 * Resolves the API Base URL.
 * Priority order:
 * 1. Environment variable VITE_API_BASE_URL or VITE_BACKEND_URL
 * 2. Window location origin (for web app served directly over HTTPS)
 * 3. Default Production HTTPS Backend URL for native Capacitor Android apps
 */
export const DEFAULT_PROD_API_URL = 'https://ais-dev-hm4fxnbs4x4wismfoa7re6-619033421864.asia-southeast1.run.app';

export function getApiBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL;
  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    return envUrl.trim().replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location) {
    const origin = window.location.origin;
    
    // Check if running inside Capacitor Android app or standalone file context
    const isCapacitorOrNativeLocal =
      !origin ||
      origin === 'null' ||
      origin.startsWith('capacitor:') ||
      origin.startsWith('file:') ||
      origin.startsWith('http://localhost') ||
      origin.startsWith('http://127.0.0.1');

    if (isCapacitorOrNativeLocal) {
      // In native Android Capacitor APK, fall back to the live HTTPS backend URL
      return DEFAULT_PROD_API_URL;
    }

    if (origin) {
      return origin.replace(/\/$/, '');
    }
  }

  return DEFAULT_PROD_API_URL;
}

/**
 * Health check helper to clearly distinguish:
 * - Device offline (no internet)
 * - Server unreachable
 * - Server online
 */
export async function checkApiHealth(): Promise<{
  isOnline: boolean;
  isServerReachable: boolean;
  message: string;
}> {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    return {
      isOnline: false,
      isServerReachable: false,
      message: 'No Internet Connection. Please check your mobile data or Wi-Fi connection.',
    };
  }

  try {
    const baseUrl = getApiBaseUrl();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${baseUrl}/api/health`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      return {
        isOnline: true,
        isServerReachable: true,
        message: 'Sapana Park API server is online and reachable.',
      };
    } else {
      return {
        isOnline: true,
        isServerReachable: false,
        message: `Backend server returned status code ${response.status}.`,
      };
    }
  } catch (err: any) {
    return {
      isOnline: true,
      isServerReachable: false,
      message: 'Sapana Park backend server is unreachable. Please verify server status.',
    };
  }
}

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
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, message: 'No Internet Connection. Please connect to Wi-Fi or Mobile Data.' };
  }

  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/auth/register`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const responseText = await response.text();
    let result: any = null;
    try {
      result = responseText ? JSON.parse(responseText) : null;
    } catch {
      result = null;
    }

    if (import.meta.env.DEV) {
      console.log('[Register API Endpoint]:', endpoint);
      console.log('[Register API Response Status]:', response.status);
      console.log(
        '[Register API JSON Result]:',
        result
          ? {
              success: result.success,
              message: result.message,
              userId: result.user?.id,
            }
          : responseText?.slice(0, 100)
      );
    }

    // Handle HTTP 200 / 201 Success
    if (response.status === 200 || response.status === 201) {
      if (result && typeof result === 'object') {
        if (result.success !== false) {
          if (result.user) {
            const resident = mapUserAccountToResident(result.user);
            saveSession({
              resident,
              userAccount: result.user,
              role: result.user.role || 'Resident',
              isLoggedIn: true,
            });
          }
          return {
            success: true,
            message: result.message || 'Registration successful! Account submitted for verification.',
            user: result.user,
          };
        } else {
          return {
            success: false,
            message: result.message || 'Registration failed. Please check your information.',
          };
        }
      }

      return {
        success: true,
        message: 'Registration completed successfully.',
      };
    }

    // Handle HTTP Error status codes (400, 409, 500, etc.)
    if (result && typeof result === 'object' && result.message) {
      return {
        success: false,
        message: result.message,
      };
    }

    if (response.status === 409) {
      return {
        success: false,
        message: 'This Email Address or Mobile Number is already registered in Sapana Park CHS.',
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: 'Invalid registration information provided. Please verify all fields.',
      };
    }

    if (response.status === 500) {
      return {
        success: false,
        message: 'Database or server error during registration. Please try again later.',
      };
    }

    return {
      success: false,
      message: `Registration failed with server status code ${response.status}.`,
    };
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Registration request timed out. Please check your network connection and retry.',
      };
    }

    const health = await checkApiHealth();
    if (!health.isOnline) {
      return { success: false, message: 'No Internet Connection. Please check network settings.' };
    }
    if (!health.isServerReachable) {
      return { success: false, message: 'Sapana Park Backend Server is unavailable. Please check server status.' };
    }

    return { success: false, message: 'Network error during registration. Unable to connect to server.' };
  }
}

export async function loginUserApi(loginIdentifier: string, password?: string): Promise<AuthResponse> {
  const cleanIdentifier = (loginIdentifier || '').trim();
  const cleanPassword = password || '';

  if (!cleanIdentifier) {
    return {
      success: false,
      message: 'Please enter your Email Address or Mobile Number.',
    };
  }

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return {
      success: false,
      message: 'No Internet Connection. Please check your Wi-Fi or Mobile Data.',
    };
  }

  const baseUrl = getApiBaseUrl();
  const endpoint = `${baseUrl}/api/auth/login`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        loginIdentifier: cleanIdentifier,
        password: cleanPassword,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json().catch(() => null);

    if (response.ok && data) {
      return data;
    }

    if (data && data.message) {
      return {
        success: false,
        message: data.message,
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        message: 'Invalid email/mobile or password. Please verify credentials.',
      };
    }

    if (response.status === 400) {
      return {
        success: false,
        message: 'Email or Mobile Number is required for login.',
      };
    }

    return {
      success: false,
      message: `Login failed (HTTP ${response.status}). Please try again later.`,
    };
  } catch (err: any) {
    const health = await checkApiHealth();
    if (!health.isOnline) {
      return {
        success: false,
        message: 'No Internet Connection. Please check your Wi-Fi or Mobile Data.',
      };
    }

    if (!health.isServerReachable) {
      return {
        success: false,
        message: 'Sapana Park Backend Server is unavailable. Please check server status.',
      };
    }

    if (err.name === 'AbortError') {
      return {
        success: false,
        message: 'Login request timed out. Please check network speed and retry.',
      };
    }

    return {
      success: false,
      message: 'Network error during login. Unable to reach server.',
    };
  }
}

export async function googleAuthApi(googleProfile: {
  googleId?: string;
  email: string;
  fullName: string;
  profilePhoto?: string;
}): Promise<AuthResponse> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, message: 'No Internet Connection. Please check network settings.' };
  }

  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(googleProfile),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Google authentication failed.' };
  } catch (err: any) {
    const health = await checkApiHealth();
    if (!health.isOnline) return { success: false, message: 'No Internet Connection.' };
    if (!health.isServerReachable) return { success: false, message: 'Backend server is unavailable.' };
    return { success: false, message: 'Network error during Google login.' };
  }
}

export async function forgotPasswordApi(identifier: string): Promise<{ success: boolean; message: string; resetToken?: string }> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, message: 'No Internet Connection. Please check network.' };
  }

  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identifier }),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Password reset request failed.' };
  } catch (err: any) {
    const health = await checkApiHealth();
    if (!health.isOnline) return { success: false, message: 'No Internet Connection.' };
    if (!health.isServerReachable) return { success: false, message: 'Backend server is unavailable.' };
    return { success: false, message: 'Network error requesting password reset.' };
  }
}

export async function resetPasswordApi(identifier: string, resetToken: string, newPassword: string): Promise<AuthResponse> {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { success: false, message: 'No Internet Connection.' };
  }

  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ identifier, resetToken, newPassword }),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Reset password failed.' };
  } catch (err: any) {
    const health = await checkApiHealth();
    if (!health.isOnline) return { success: false, message: 'No Internet Connection.' };
    if (!health.isServerReachable) return { success: false, message: 'Backend server is unavailable.' };
    return { success: false, message: 'Network error resetting password.' };
  }
}

export async function updateUserProfileApi(userId: string, updates: Partial<UserAccount>): Promise<{ success: boolean; message: string; user?: UserAccount }> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ userId, updates }),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Failed to update profile.' };
  } catch (err: any) {
    return { success: false, message: 'Network error updating profile.' };
  }
}

export async function fetchAdminUsersApi(): Promise<{ success: boolean; users?: UserAccount[]; message?: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/admin/users`, {
      headers: { Accept: 'application/json' },
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Failed to fetch users.' };
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
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ verificationStatus, accountStatus, role }),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Failed to update user status.' };
  } catch (err: any) {
    return { success: false, message: 'Failed to update user status.' };
  }
}

export async function resetUserAccessApi(userId: string, defaultPassword?: string): Promise<{ success: boolean; message: string; newPass?: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/admin/users/${userId}/reset-access`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ defaultPassword }),
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Failed to reset user access.' };
  } catch (err: any) {
    return { success: false, message: 'Failed to reset user access.' };
  }
}

export async function deleteUserApi(userId: string): Promise<{ success: boolean; message: string }> {
  const baseUrl = getApiBaseUrl();
  try {
    const response = await fetch(`${baseUrl}/api/admin/users/${userId}`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
    });
    const result = await response.json().catch(() => null);
    if (response.ok && result) {
      return result;
    }
    return { success: false, message: result?.message || 'Failed to delete user.' };
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
