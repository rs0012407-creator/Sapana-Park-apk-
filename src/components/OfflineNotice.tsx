import React from 'react';
import { WifiOff, RefreshCw, Database } from 'lucide-react';
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
    <div className="bg-amber-950/95 border-b border-amber-600/60 text-amber-100 text-xs py-2.5 px-4 shadow-md backdrop-blur-md sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center space-x-2.5">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
          </span>
          <WifiOff className="w-4 h-4 text-amber-400 shrink-0" />
          <div>
            <strong className="font-bold text-amber-200">No Internet Connection / इंटरनेट डिस्कनेक्ट है</strong> —
            <span className="text-amber-200/80"> Offline Mode active. Cached society data is available.</span>
          </div>
        </div>

        <div className="flex items-center space-x-3 text-[11px] text-amber-300 shrink-0">
          <span className="flex items-center space-x-1 bg-amber-900/60 px-2 py-0.5 rounded border border-amber-700/50 font-mono">
            <Database className="w-3 h-3 text-amber-400" />
            <span>Cached: {syncTime}</span>
          </span>
          {onRefreshCache && (
            <button
              type="button"
              onClick={onRefreshCache}
              className="bg-amber-800/80 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg border border-amber-600/50 flex items-center space-x-1 font-bold transition shadow"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry / रीट्राई करें</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
