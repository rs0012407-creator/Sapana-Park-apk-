import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle2, AlertTriangle, ShieldCheck, FlipHorizontal, Image as ImageIcon } from 'lucide-react';

interface DeviceCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture?: (capturedDataUrl: string) => void;
  title?: string;
}

export const DeviceCameraModal: React.FC<DeviceCameraModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Take Photo / कैमरा फोटो खींचें',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isInitializing, setIsInitializing] = useState(false);

  // Stop camera tracks cleanly
  const stopCameraStream = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  // Start video stream
  const startCamera = async (mode = facingMode) => {
    setIsInitializing(true);
    setCameraError(null);
    stopCameraStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported on this browser or device.');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      setPermissionState('granted');

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error('Camera Access Error:', err);
      setPermissionState('denied');
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was denied. Please allow camera access in your browser site settings / कैमरे की अनुमति अस्वीकृत की गई है। कृपया ब्राउज़र सेटिंग्स में अनुमति दें।'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on this system / इस डिवाइस पर कोई कैमरा नहीं मिला।');
      } else {
        setCameraError(`Camera Error: ${err.message || 'Unable to access camera.'}`);
      }
    } finally {
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    if (isOpen && !capturedPhoto) {
      startCamera();
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen, facingMode]);

  // Handle stream binding when modal re-opens or video ref mounts
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedPhoto(dataUrl);
      stopCameraStream();
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
    startCamera();
  };

  const handleConfirmPhoto = () => {
    if (capturedPhoto && onCapture) {
      onCapture(capturedPhoto);
    }
    handleCloseModal();
  };

  const handleToggleCamera = () => {
    const newMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newMode);
    startCamera(newMode);
  };

  const handleCloseModal = () => {
    stopCameraStream();
    setCapturedPhoto(null);
    setCameraError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-5 shadow-2xl relative text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/40 rounded-xl">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-white">{title}</h3>
              <p className="text-[11px] text-slate-400">Standard Device Camera • No Background Access</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera View / Captured Preview */}
        <div className="my-4 flex-1 flex flex-col justify-center items-center bg-black rounded-2xl overflow-hidden border border-slate-800 relative min-h-[260px] sm:min-h-[320px]">
          {capturedPhoto ? (
            <div className="w-full h-full relative flex items-center justify-center bg-slate-950">
              <img src={capturedPhoto} alt="Captured preview" className="max-h-[320px] w-auto object-contain rounded-xl" />
              <div className="absolute top-3 left-3 bg-emerald-600/90 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 shadow">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Photo Captured Successfully</span>
              </div>
            </div>
          ) : cameraError ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-bold text-rose-300">Camera Access Denied or Unavailable</h4>
              <p className="text-[11px] text-slate-300 max-w-sm leading-relaxed">{cameraError}</p>

              <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-[10px] text-slate-300 text-left space-y-1">
                <p className="font-bold text-amber-300">How to fix in Chrome/Android:</p>
                <p>1. Tap lock/settings icon near browser URL address bar.</p>
                <p>2. Tap "Permissions" & toggle Camera to "Allow".</p>
                <p>3. Tap "Retry Camera" button below.</p>
              </div>

              <button
                type="button"
                onClick={() => startCamera()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 mx-auto shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Camera Permission</span>
              </button>
            </div>
          ) : (
            <div className="w-full h-full relative flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-[320px] object-cover"
              />

              {isInitializing && (
                <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center text-xs text-slate-300">
                  <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mb-2" />
                  <span>Accessing Device Camera...</span>
                </div>
              )}

              {/* Camera Controls Overlay */}
              {!isInitializing && stream && (
                <div className="absolute top-3 right-3">
                  <button
                    type="button"
                    onClick={handleToggleCamera}
                    className="p-2 bg-slate-900/80 hover:bg-slate-900 text-slate-200 hover:text-white rounded-full border border-slate-700 transition"
                    title="Flip Front / Rear Camera"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 shrink-0 flex items-center justify-between gap-2">
          {capturedPhoto ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake Photo / दोबारा खींचें</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPhoto}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Use Captured Photo</span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCloseModal}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold px-4 py-2.5 rounded-xl transition"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCapture}
                disabled={!stream || isInitializing}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition shadow-lg flex items-center space-x-2"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Photo / फोटो लें</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
