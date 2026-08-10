import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { QrCode, Download, Copy, Check, Share2, X, ShieldCheck, IndianRupee, Smartphone } from 'lucide-react';
import { MaintenanceBill } from '../models/finance';
import { formatINR } from '../utils/currency';

interface UpiQrCodeModalProps {
  bill: MaintenanceBill;
  onClose: () => void;
  onProceedPayment?: () => void;
}

export const UpiQrCodeModal: React.FC<UpiQrCodeModalProps> = ({
  bill,
  onClose,
  onProceedPayment,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const upiVpa = 'sapanapark.chs@upi';
  const payeeName = 'Sapana Park CHS Ltd';
  const transactionNote = `Flat ${bill.flatNumber} ${bill.monthYear} Maintenance`;

  // Standard UPI URI scheme
  const upiUrl = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${bill.totalAmount}&tn=${encodeURIComponent(transactionNote)}&cu=INR`;

  useEffect(() => {
    QRCode.toDataURL(upiUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#090d16',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate UPI QR code:', err));
  }, [upiUrl]);

  const handleCopyVpa = () => {
    navigator.clipboard.writeText(upiVpa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `SapanaPark_UPI_QR_Flat_${bill.flatNumber}_${bill.monthYear.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  const handleShareQr = async () => {
    if (!qrDataUrl) return;
    try {
      if (navigator.share && navigator.canShare) {
        // Convert base64 dataUrl to File
        const res = await fetch(qrDataUrl);
        const blob = await res.blob();
        const file = new File([blob], `SapanaPark_UPI_QR_${bill.flatNumber}.png`, { type: 'image/png' });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Sapana Park Maintenance Bill - Flat ${bill.flatNumber}`,
            text: `UPI Payment QR Code for Sapana Park CHS Maintenance (₹${bill.totalAmount}) - Flat ${bill.flatNumber}`,
            files: [file],
          });
          return;
        }
      }
      // Fallback if web share files API is unavailable
      handleDownloadQr();
    } catch (err) {
      console.log('Share canceled or unsupported:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl relative flex flex-col items-center text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-1">
          <ShieldCheck className="w-4 h-4" />
          <span>Official Dynamic UPI Payment QR</span>
        </div>
        <h3 className="text-lg font-extrabold text-white">
          Sapana Park CHS Ltd.
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Flat <strong className="text-emerald-300 font-mono">{bill.flatNumber}</strong> • {bill.monthYear} Maintenance
        </p>

        {/* Amount Badge */}
        <div className="my-4 bg-slate-950 border border-slate-800 rounded-2xl px-6 py-3 w-full">
          <div className="text-[11px] text-slate-400 font-medium">Bill Amount Payable</div>
          <div className="text-2xl font-black text-white flex items-center justify-center space-x-1 mt-0.5">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            <span>{bill.totalAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Due Date: {bill.dueDate}</div>
        </div>

        {/* QR Code Card */}
        <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-slate-800 relative group my-1">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="Dynamic UPI QR Code"
              className="w-56 h-56 object-contain rounded-lg mx-auto"
            />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs font-mono">
              Generating UPI QR...
            </div>
          )}
          <div className="text-[10px] text-slate-900 font-bold font-mono tracking-wider mt-2 bg-slate-100 py-1 px-2 rounded border border-slate-200">
            SCAN WITH ANY UPI APP
          </div>
        </div>

        {/* UPI Details Bar */}
        <div className="w-full bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs my-3 flex items-center justify-between text-left">
          <div>
            <div className="text-[10px] text-slate-500 font-medium">UPI VPA Handle:</div>
            <div className="font-mono font-bold text-slate-200">{upiVpa}</div>
          </div>
          <button
            onClick={handleCopyVpa}
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy VPA</span>
              </>
            )}
          </button>
        </div>

        {/* Action Buttons: Save to Gallery & Share */}
        <div className="grid grid-cols-2 gap-3 w-full">
          <button
            onClick={handleDownloadQr}
            className={`flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold transition shadow-md ${
              downloadSuccess
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Gallery!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Save to Gallery</span>
              </>
            )}
          </button>

          <button
            onClick={handleShareQr}
            className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition border border-slate-700"
          >
            <Share2 className="w-4 h-4 text-emerald-400" />
            <span>Share / Forward</span>
          </button>
        </div>

        {/* Supported Apps List */}
        <div className="flex items-center justify-center space-x-3 text-[10px] text-slate-400 mt-4">
          <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
          <span>Works with Google Pay • PhonePe • Paytm • BHIM • CRED</span>
        </div>

        {onProceedPayment && (
          <button
            onClick={() => {
              onClose();
              onProceedPayment();
            }}
            className="mt-4 text-xs text-emerald-400 hover:underline font-semibold"
          >
            Already scanned & paid? Record Transaction →
          </button>
        )}
      </div>
    </div>
  );
};
