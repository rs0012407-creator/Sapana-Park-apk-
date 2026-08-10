import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { UserAccount, AuthResponse, ResidentType } from '../models/user';

const USERS_FILE_PATH = path.join(process.cwd(), 'users_db.json');

// Password Hash Helper using PBKDF2 (Native Node Crypto, zero external dependency)
export function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const generatedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, generatedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: generatedSalt };
}

export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  const { hash } = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(storedHash, 'hex'));
}

// Password Policy Validation:
// Minimum 8 characters, at least 1 uppercase letter, at least 1 lowercase letter, at least 1 number
export function validatePasswordStrength(password: string): { valid: boolean; message?: string } {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long.' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter (A-Z).' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter (a-z).' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number (0-9).' };
  }
  return { valid: true };
}

// Seed initial colony residents
const INITIAL_USERS: UserAccount[] = [
  {
    id: 'USER-101',
    fullName: 'Rajesh Naik',
    email: 'rajesh.naik@sapanapark.org',
    mobileNumber: '9822145670',
    ...hashPassword('Sapana@2026', 'salt_rajesh'),
    authProvider: 'Email',
    colonyName: 'Sapana Park CHS',
    flatNumber: 'A-302',
    blockNumber: 'Wing A',
    floorNumber: '3',
    residentType: 'Owner',
    profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    verificationStatus: 'Verified',
    accountStatus: 'Active',
    role: 'Secretary',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'USER-102',
    fullName: 'Anjali Deshmukh',
    email: 'anjali.d@gmail.com',
    mobileNumber: '9823011223',
    ...hashPassword('Sapana@2026', 'salt_anjali'),
    authProvider: 'Email',
    colonyName: 'Sapana Park CHS',
    flatNumber: 'B-101',
    blockNumber: 'Wing B',
    floorNumber: '1',
    residentType: 'Owner',
    profilePhoto: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    verificationStatus: 'Verified',
    accountStatus: 'Active',
    role: 'Treasurer',
    createdAt: '2025-02-15T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
    lastLoginAt: new Date().toISOString(),
  },
  {
    id: 'USER-103',
    fullName: 'David D’Souza',
    email: 'david.dsouza@outlook.com',
    mobileNumber: '9422055678',
    ...hashPassword('Sapana@2026', 'salt_david'),
    authProvider: 'Email',
    colonyName: 'Sapana Park CHS',
    flatNumber: 'C-204',
    blockNumber: 'Wing C',
    floorNumber: '2',
    residentType: 'Owner',
    verificationStatus: 'Verified',
    accountStatus: 'Active',
    role: 'Resident',
    createdAt: '2025-03-20T10:00:00Z',
    updatedAt: '2026-08-01T10:00:00Z',
  },
  {
    id: 'USER-104',
    fullName: 'Vikram Sharma',
    email: 'vikram.sharma@techgoa.in',
    mobileNumber: '8390123456',
    ...hashPassword('Sapana@2026', 'salt_vikram'),
    authProvider: 'Email',
    colonyName: 'Sapana Park CHS',
    flatNumber: 'D-401',
    blockNumber: 'Wing D',
    floorNumber: '4',
    residentType: 'Tenant',
    verificationStatus: 'Pending Verification',
    accountStatus: 'Active',
    role: 'Resident',
    createdAt: '2026-07-25T10:00:00Z',
    updatedAt: '2026-07-25T10:00:00Z',
  },
];

class UserAuthManager {
  private users: UserAccount[] = [];

  constructor() {
    this.loadUsers();
  }

  private loadUsers() {
    try {
      if (fs.existsSync(USERS_FILE_PATH)) {
        const fileContent = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
        this.users = JSON.parse(fileContent);
      } else {
        this.users = [...INITIAL_USERS];
        this.saveUsers();
      }
    } catch (e) {
      console.error('Error loading users DB:', e);
      this.users = [...INITIAL_USERS];
    }
  }

  private saveUsers() {
    try {
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(this.users, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving users DB:', e);
    }
  }

  public getAllUsers(): UserAccount[] {
    return this.users.map((u) => {
      const { passwordHash, salt, resetToken, ...safeUser } = u;
      return safeUser as UserAccount;
    });
  }

  public findUserByIdentifier(identifier: string): UserAccount | undefined {
    const clean = identifier.trim().toLowerCase();
    return this.users.find(
      (u) => u.email.toLowerCase() === clean || u.mobileNumber.replace(/\D/g, '') === clean.replace(/\D/g, '')
    );
  }

  public registerUser(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password?: string;
    authProvider?: 'Email' | 'Google';
    googleId?: string;
    colonyName?: string;
    flatNumber?: string;
    blockNumber?: string;
    floorNumber?: string;
    residentType?: ResidentType;
    profilePhoto?: string;
  }): AuthResponse {
    const emailClean = data.email.trim().toLowerCase();
    const mobileClean = data.mobileNumber.replace(/\D/g, '');

    // Check duplicate email or mobile
    const existing = this.users.find(
      (u) => u.email.toLowerCase() === emailClean || u.mobileNumber.replace(/\D/g, '') === mobileClean
    );

    if (existing) {
      return {
        success: false,
        message: 'An account with this Email Address or Mobile Number already exists.',
      };
    }

    let passwordHash = '';
    let salt = '';

    if (data.authProvider !== 'Google') {
      if (!data.password) {
        return { success: false, message: 'Password is required.' };
      }
      const val = validatePasswordStrength(data.password);
      if (!val.valid) {
        return { success: false, message: val.message || 'Invalid password.' };
      }
      const hashed = hashPassword(data.password);
      passwordHash = hashed.hash;
      salt = hashed.salt;
    }

    const newUser: UserAccount = {
      id: `USER-${Date.now()}`,
      fullName: data.fullName,
      email: data.email.trim(),
      mobileNumber: data.mobileNumber.trim(),
      passwordHash: passwordHash || undefined,
      salt: salt || undefined,
      authProvider: data.authProvider || 'Email',
      googleId: data.googleId,
      colonyName: data.colonyName || 'Sapana Park CHS',
      flatNumber: data.flatNumber || 'A-101',
      blockNumber: data.blockNumber || 'Wing A',
      floorNumber: data.floorNumber || '1',
      residentType: data.residentType || 'Owner',
      profilePhoto: data.profilePhoto,
      verificationStatus: 'Pending Verification',
      accountStatus: 'Active',
      role: 'Resident',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.users.push(newUser);
    this.saveUsers();

    const { passwordHash: _, salt: __, resetToken: ___, ...safeUser } = newUser;
    return {
      success: true,
      message: 'Registration successful! Account submitted for Colony Committee Verification.',
      user: safeUser as UserAccount,
    };
  }

  public loginUser(identifier: string, password?: string): AuthResponse {
    const user = this.findUserByIdentifier(identifier);
    if (!user) {
      return { success: false, message: 'Invalid credentials. Please check your Email/Mobile or Register.' };
    }

    if (user.accountStatus === 'Suspended') {
      return {
        success: false,
        message: 'Your account has been suspended by the Colony Admin. Please contact committee office.',
      };
    }

    if (user.verificationStatus === 'Rejected') {
      return {
        success: false,
        message: 'Your registration request was rejected by Colony Admin. Please contact society office.',
      };
    }

    if (user.authProvider === 'Email') {
      if (!password || !user.passwordHash || !user.salt) {
        return { success: false, message: 'Invalid password provided.' };
      }
      const isValid = verifyPassword(password, user.passwordHash, user.salt);
      if (!isValid) {
        return { success: false, message: 'Incorrect password. Please try again.' };
      }
    }

    user.lastLoginAt = new Date().toISOString();
    user.updatedAt = new Date().toISOString();
    this.saveUsers();

    const { passwordHash: _, salt: __, resetToken: ___, ...safeUser } = user;
    return {
      success: true,
      message: `Welcome back, ${user.fullName}!`,
      user: safeUser as UserAccount,
    };
  }

  public googleAuth(googleProfile: {
    googleId: string;
    email: string;
    fullName: string;
    profilePhoto?: string;
  }): AuthResponse {
    const emailClean = googleProfile.email.trim().toLowerCase();
    let user = this.users.find((u) => u.email.toLowerCase() === emailClean);

    if (user) {
      if (user.accountStatus === 'Suspended') {
        return {
          success: false,
          message: 'Your account has been suspended by the Colony Admin.',
        };
      }
      if (user.verificationStatus === 'Rejected') {
        return {
          success: false,
          message: 'Your account verification request was rejected.',
        };
      }

      user.lastLoginAt = new Date().toISOString();
      user.googleId = googleProfile.googleId;
      if (!user.profilePhoto && googleProfile.profilePhoto) {
        user.profilePhoto = googleProfile.profilePhoto;
      }
      this.saveUsers();

      const { passwordHash: _, salt: __, ...safeUser } = user;
      return {
        success: true,
        message: `Welcome back via Google, ${user.fullName}!`,
        user: safeUser as UserAccount,
      };
    } else {
      // Create new Google user - requires finishing colony details
      const newUser: UserAccount = {
        id: `USER-G-${Date.now()}`,
        fullName: googleProfile.fullName,
        email: googleProfile.email,
        mobileNumber: '',
        authProvider: 'Google',
        googleId: googleProfile.googleId,
        colonyName: 'Sapana Park CHS',
        flatNumber: '',
        blockNumber: '',
        floorNumber: '',
        residentType: 'Owner',
        profilePhoto: googleProfile.profilePhoto,
        verificationStatus: 'Pending Verification',
        accountStatus: 'Active',
        role: 'Resident',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      this.users.push(newUser);
      this.saveUsers();

      const { passwordHash: _, salt: __, ...safeUser } = newUser;
      return {
        success: true,
        message: 'Google registration initiated. Please complete your flat & block details.',
        user: safeUser as UserAccount,
        requiresColonyCompletion: true,
      };
    }
  }

  public requestPasswordReset(identifier: string): { success: boolean; message: string; resetToken?: string } {
    const user = this.findUserByIdentifier(identifier);
    if (!user) {
      // Safe error message so email enumeration is limited, but notify success for test
      return {
        success: true,
        message: 'If the account exists, a password reset token/OTP has been issued.',
      };
    }

    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
    user.resetToken = resetOtp;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins expiry
    this.saveUsers();

    return {
      success: true,
      message: `Password reset OTP generated. Test OTP: ${resetOtp}`,
      resetToken: resetOtp,
    };
  }

  public resetPassword(identifier: string, resetToken: string, newPassword: string): AuthResponse {
    const user = this.findUserByIdentifier(identifier);
    if (!user || !user.resetToken) {
      return { success: false, message: 'Invalid or expired password reset request.' };
    }

    if (user.resetToken !== resetToken.trim()) {
      return { success: false, message: 'Incorrect reset OTP code.' };
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < Date.now()) {
      return { success: false, message: 'Reset OTP code has expired. Please request a new one.' };
    }

    const val = validatePasswordStrength(newPassword);
    if (!val.valid) {
      return { success: false, message: val.message || 'Invalid password strength.' };
    }

    const hashed = hashPassword(newPassword);
    user.passwordHash = hashed.hash;
    user.salt = hashed.salt;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    user.updatedAt = new Date().toISOString();
    this.saveUsers();

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return {
      success: true,
      message: 'Password reset successful! You may now login with your new password.',
      user: safeUser as UserAccount,
    };
  }

  public updateUserStatus(
    userId: string,
    verificationStatus?: UserAccount['verificationStatus'],
    accountStatus?: UserAccount['accountStatus'],
    newRole?: UserAccount['role']
  ): UserAccount | null {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;

    if (verificationStatus) user.verificationStatus = verificationStatus;
    if (accountStatus) user.accountStatus = accountStatus;
    if (newRole) user.role = newRole;

    user.updatedAt = new Date().toISOString();
    this.saveUsers();

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return safeUser as UserAccount;
  }

  public updateUserProfile(userId: string, updates: Partial<UserAccount>): UserAccount | null {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return null;

    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.mobileNumber) user.mobileNumber = updates.mobileNumber;
    if (updates.colonyName) user.colonyName = updates.colonyName;
    if (updates.flatNumber) user.flatNumber = updates.flatNumber;
    if (updates.blockNumber) user.blockNumber = updates.blockNumber;
    if (updates.floorNumber) user.floorNumber = updates.floorNumber;
    if (updates.residentType) user.residentType = updates.residentType;
    if (updates.profilePhoto) user.profilePhoto = updates.profilePhoto;

    user.updatedAt = new Date().toISOString();
    this.saveUsers();

    const { passwordHash: _, salt: __, ...safeUser } = user;
    return safeUser as UserAccount;
  }

  public resetUserAccess(userId: string, defaultPassword?: string): { success: boolean; newPass: string } {
    const user = this.findUserByIdentifier(userId) || this.users.find((u) => u.id === userId);
    if (!user) return { success: false, newPass: '' };

    const newPass = defaultPassword || 'SapanaPass@2026';
    const hashed = hashPassword(newPass);
    user.passwordHash = hashed.hash;
    user.salt = hashed.salt;
    user.accountStatus = 'Active';
    user.updatedAt = new Date().toISOString();
    this.saveUsers();

    return { success: true, newPass };
  }

  public deleteUser(userId: string): boolean {
    const idx = this.users.findIndex((u) => u.id === userId);
    if (idx !== -1) {
      this.users.splice(idx, 1);
      this.saveUsers();
      return true;
    }
    return false;
  }
}

export const authManager = new UserAuthManager();
