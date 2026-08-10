import { useState, useEffect } from 'react';
import { UserSession } from '../api/authApi';
import { MaintenanceBill } from '../models/finance';
import { Complaint } from '../models/complaint';
import { CommunityEvent } from '../models/community';
import { NOCApplication } from '../models/document';
import { Notice } from '../models/notice';

const KEYS = {
  DASHBOARD_CACHE: 'sapana_park_offline_dashboard_v1',
  PROFILE_CACHE: 'sapana_park_offline_profile_v1',
  APP_STATE_CACHE: 'sapana_park_offline_app_state_v1',
  LAST_SYNC: 'sapana_park_last_offline_sync',
};

export interface CachedDashboardData {
  session: UserSession;
  bills: MaintenanceBill[];
  complaints: Complaint[];
  notices: Notice[];
  events?: CommunityEvent[];
  nocs?: NOCApplication[];
  timestamp: string;
}

export function saveDashboardCache(data: Omit<CachedDashboardData, 'timestamp'>): void {
  try {
    const payload: CachedDashboardData = {
      ...data,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem(KEYS.DASHBOARD_CACHE, JSON.stringify(payload));
    localStorage.setItem(KEYS.LAST_SYNC, new Date().toLocaleString());
  } catch (err) {
    console.error('Failed to save dashboard offline cache:', err);
  }
}

export function getDashboardCache(): CachedDashboardData | null {
  try {
    const raw = localStorage.getItem(KEYS.DASHBOARD_CACHE);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed to read dashboard offline cache:', err);
  }
  return null;
}

export function saveUserProfileCache(session: UserSession): void {
  try {
    localStorage.setItem(KEYS.PROFILE_CACHE, JSON.stringify({
      session,
      timestamp: new Date().toISOString(),
    }));
  } catch (err) {
    console.error('Failed to save profile cache:', err);
  }
}

export function getUserProfileCache(): UserSession | null {
  try {
    const raw = localStorage.getItem(KEYS.PROFILE_CACHE);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.session;
    }
  } catch (err) {
    console.error('Failed to read profile cache:', err);
  }
  return null;
}

export function getLastOfflineSyncTime(): string {
  return localStorage.getItem(KEYS.LAST_SYNC) || 'Just now';
}

/**
 * Custom React Hook to detect online/offline network status seamlessly.
 */
export function useOnlineStatus(): { isOnline: boolean; wasOffline: boolean } {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    function handleOnline() {
      setIsOnline(true);
    }
    function handleOffline() {
      setIsOnline(false);
      setWasOffline(true);
    }

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return { isOnline, wasOffline };
}
