import React from 'react';
import { WifiOff, RefreshCw, Database, CheckCircle } from 'lucide-react';
import { getLastOfflineSyncTime } from '../utils/offlineStorage';

interface OfflineNoticeProps {
  isOnline: boolean;
  onRefreshCache?: () => void;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({ isOnline, onRefreshCache }) => {
  const syncTime = getLastOfflineSyncTime();

  if (isOnline) {
    return null;
  }

  return (
    <div className="bg-amber-950/90 border-b border-amber-600/50 text-amber-100 text-xs py-2 px-4 shadow-md backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold text-amber-200">Offline Mode Active</strong> —
            <span> Dashboard, Profile & Society Records are cached & fully viewable offline.</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-amber-300">
          <span className="flex items-center space-x-1 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/50">
            <Database className="w-3 h-3 text-amber-400" />
            <span>Cached at: {syncTime}</span>
          </span>
          {onRefreshCache && (
            <button
              onClick={onRefreshCache}
              className="hover:text-amber-100 flex items-center space-x-1 underline font-medium transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry Connection</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
