import React, { useState, useEffect } from 'react';
import {
  Globe,
  Wifi,
  WifiOff,
  Camera,
  Image as ImageIcon,
  Folder,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Lock,
  ChevronRight,
  HelpCircle,
  Smartphone,
  Info,
  Radio,
} from 'lucide-react';
import { DeviceCameraModal } from './DeviceCameraModal';
import { GalleryPickerModal } from './GalleryPickerModal';
import { FileUploadModal } from './FileUploadModal';

export const DevicePermissionsScreen: React.FC = () => {
  // 1. Network / Internet Connection State
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [connectionDetails, setConnectionDetails] = useState<string>('Detecting...');
  const [isCheckingNetwork, setIsCheckingNetwork] = useState(false);

  // 2. Camera State
  const [cameraStatus, setCameraStatus] = useState<'allowed' | 'denied' | 'prompt'>('prompt');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

  // 3. Gallery / Photos State
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [uploadedGalleryCount, setUploadedGalleryCount] = useState<number>(0);

  // 4. File Storage State
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  const [uploadedFileCount, setUploadedFileCount] = useState<number>(0);

  // Success Feedback Toast
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  // Monitor network status
  const checkNetworkStatus = async () => {
    setIsCheckingNetwork(true);
    setIsOnline(navigator.onLine);

    try {
      const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
      if (conn) {
        setConnectionDetails(`${conn.effectiveType?.toUpperCase() || 'Wi-Fi/4G'} • ~${conn.downlink || '10'} Mbps`);
      } else {
        setConnectionDetails(navigator.onLine ? 'Active Wi-Fi / Mobile Data' : 'Disconnected');
      }
    } catch {
      setConnectionDetails(navigator.onLine ? 'Connected' : 'Offline');
    } finally {
      setTimeout(() => setIsCheckingNetwork(false), 500);
    }
  };

  useEffect(() => {
    checkNetworkStatus();

    const handleOnline = () => {
      setIsOnline(true);
      checkNetworkStatus();
      showToast('Internet connection restored / इंटरनेट कनेक्शन पुनः स्थापित हुआ');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionDetails('No Internet Connection');
      showToast('Offline Mode Active / इंटरनेट कनेक्शन बंद है');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial query for camera permission if browser supports Permissions API
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: 'camera' as any })
        .then((permissionStatus) => {
          setCameraStatus(permissionStatus.state as any);
          permissionStatus.onchange = () => {
            setCameraStatus(permissionStatus.state as any);
          };
        })
        .catch(() => {
          // Fallback if query camera fails
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastNotice(msg);
    setTimeout(() => setToastNotice(null), 3500);
  };

  const handleCameraCaptureComplete = (dataUrl: string) => {
    setCameraStatus('allowed');
    showToast('Camera photo captured successfully / कैमरा फोटो सफलता से खींची गई');
  };

  const handleGalleryUploadComplete = (images: any[]) => {
    setUploadedGalleryCount((prev) => prev + images.length);
    showToast(`${images.length} Photos added from gallery / ${images.length} फोटो गैलरी से जुड़े`);
  };

  const handleFileUploadComplete = (files: any[]) => {
    setUploadedFileCount((prev) => prev + files.length);
    showToast(`${files.length} Files uploaded / ${files.length} फाइल अपलोड हुई`);
  };

  return (
    <div className="space-y-4 font-sans text-slate-100">
      {/* Toast Notice */}
      {toastNotice && (
        <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center space-x-2 animate-in fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Intro Header Card */}
      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-2">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-2xl">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-white">Device Integration & Permissions / डिवाइस अनुमतियां</h2>
            <p className="text-xs text-slate-400">
              Manage Internet connection, Camera, Gallery & Storage access for Sapana Park CHS
            </p>
          </div>
        </div>
      </div>

      {/* PERMISSION STATUS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* CARD 1: Internet Connection */}
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    isOnline
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                  }`}
                >
                  {isOnline ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                    <span>🌐 Internet Connection</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">{connectionDetails}</p>
                </div>
              </div>

              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${
                  isOnline
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                }`}
              >
                {isOnline ? 'Connected' : 'Offline'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <p className="font-semibold text-emerald-300">Why internet access is required / इंटरनेट की आवश्यकता:</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Used to sync society notice boards, maintenance bill payments, complaint status timeline, and Emergency SOS broadcasts.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Wi-Fi & Mobile Data supported</span>
            <button
              type="button"
              onClick={checkNetworkStatus}
              disabled={isCheckingNetwork}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingNetwork ? 'animate-spin' : ''}`} />
              <span>{isCheckingNetwork ? 'Checking...' : 'Check / Retry Connection'}</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Camera Permission */}
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div
                  className={`p-2 rounded-xl border ${
                    cameraStatus === 'allowed'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : cameraStatus === 'denied'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                  }`}
                >
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">📷 Camera Access / कैमरा अनुमति</h3>
                  <p className="text-[10px] text-slate-400">Real-time photo capture for maintenance & verification</p>
                </div>
              </div>

              <span
                className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border ${
                  cameraStatus === 'allowed'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : cameraStatus === 'denied'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {cameraStatus === 'allowed' ? 'Allowed' : cameraStatus === 'denied' ? 'Denied' : 'Action Required'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <p className="font-semibold text-emerald-300">Why camera is required / उपयोग का कारण:</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Required when taking live photo evidence for maintenance complaint tickets or scanning society documents.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">Explicit button tap access only</span>
            <button
              type="button"
              onClick={() => setIsCameraModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Test Camera / फोटो लें</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Photos & Gallery */}
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl border bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">🖼️ Photos & Gallery / फोटो गैलरी</h3>
                  <p className="text-[10px] text-slate-400">Select saved photos from device gallery</p>
                </div>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                Available
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <p className="font-semibold text-indigo-300">Why gallery is required / उपयोग का कारण:</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Attach receipt screenshots, tenant KYC photos, or maintenance pictures from your phone gallery with image compression.
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              {uploadedGalleryCount > 0 ? `${uploadedGalleryCount} photos selected` : 'JPG, PNG, WEBP supported'}
            </span>
            <button
              type="button"
              onClick={() => setIsGalleryModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Open Gallery / गैलरी खोलें</span>
            </button>
          </div>
        </div>

        {/* CARD 4: Storage & Files */}
        <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 space-y-3 flex flex-col justify-between hover:border-slate-700 transition">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl border bg-teal-500/10 text-teal-400 border-teal-500/30">
                  <Folder className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">📁 Files & Documents / दस्तावेज एवं फाइलें</h3>
                  <p className="text-[10px] text-slate-400">Upload PDFs, Word docs & society agreements</p>
                </div>
              </div>

              <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide border bg-teal-500/20 text-teal-300 border-teal-500/30">
                Available
              </span>
            </div>

            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-800/80 text-[11px] text-slate-300 space-y-1">
              <p className="font-semibold text-teal-300">Why file storage is required / उपयोग का कारण:</p>
              <p className="text-slate-400 text-[10px] leading-relaxed">
                Attach NOC documents, police tenant verification forms, or society agreement files (Up to 10MB per file).
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-900 flex items-center justify-between">
            <span className="text-[10px] text-slate-500">
              {uploadedFileCount > 0 ? `${uploadedFileCount} files uploaded` : 'PDF, DOCX, XLSX supported'}
            </span>
            <button
              type="button"
              onClick={() => setIsFileModalOpen(true)}
              className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition flex items-center space-x-1.5 shadow"
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Browse Files / फाइलें अपलोड करें</span>
            </button>
          </div>
        </div>
      </div>

      {/* PRIVACY & SECURITY NOTICE BANNER */}
      <div className="bg-slate-950 p-4 rounded-3xl border border-emerald-500/30 space-y-2">
        <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Privacy & Permission Guarantees / गोपनीयता एवं सुरक्षा नीति</span>
        </div>
        <ul className="text-[11px] text-slate-300 space-y-1.5 pl-6 list-disc">
          <li>
            <strong>User-Initiated Action Only:</strong> Camera, gallery, and file picker open strictly when you press the button.
          </li>
          <li>
            <strong>Zero Silent Background Access:</strong> The app never scans your phone storage or accesses camera/microphone in the background.
          </li>
          <li>
            <strong>Full Control & Encryption:</strong> You choose which files or photos to upload. Unselected files remain untouched on your phone.
          </li>
        </ul>
      </div>

      {/* Camera Capture Modal */}
      <DeviceCameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={handleCameraCaptureComplete}
      />

      {/* Gallery Picker Modal */}
      <GalleryPickerModal
        isOpen={isGalleryModalOpen}
        onClose={() => setIsGalleryModalOpen(false)}
        onUploadImages={handleGalleryUploadComplete}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={isFileModalOpen}
        onClose={() => setIsFileModalOpen(false)}
        onUploadFile={handleFileUploadComplete}
      />
    </div>
  );
};
