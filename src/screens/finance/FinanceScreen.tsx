import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  Printer,
  QrCode,
  CreditCard,
  Building,
  PieChart,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  Check,
} from 'lucide-react';
import { MaintenanceBill, SocietyFundSummary } from '../../models/finance';
import { payMaintenanceBill, getSocietyFundSummary } from '../../api/financeApi';
import { formatINR } from '../../utils/currency';
import { printMaintenanceReceipt } from '../../utils/pdfGenerator';
import { UserSession } from '../../api/authApi';
import { UpiQrCodeModal } from '../../components/UpiQrCodeModal';

interface FinanceScreenProps {
  session: UserSession;
  bills: MaintenanceBill[];
  onRefreshBills: () => void;
}

export const FinanceScreen: React.FC<FinanceScreenProps> = ({
  session,
  bills,
  onRefreshBills,
}) => {
  const [selectedBillForPay, setSelectedBillForPay] = useState<MaintenanceBill | null>(null);
  const [qrModalBill, setQrModalBill] = useState<MaintenanceBill | null>(null);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'NetBanking' | 'CreditCard'>('UPI');
  const [upiRef, setUpiRef] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [expandedBillId, setExpandedBillId] = useState<string | null>(null);

  // In-modal payment QR data URL
  const [modalQrUrl, setModalQrUrl] = useState<string>('');
  const [modalQrSaved, setModalQrSaved] = useState<boolean>(false);

  const myBills = bills.filter((b) => b.flatNumber === session.resident.flatNumber);
  const committeeView = session.role === 'Secretary' || session.role === 'Treasurer';
  const fundSummary: SocietyFundSummary = getSocietyFundSummary();

  // Generate dynamic QR code URL whenever selectedBillForPay changes
  useEffect(() => {
    if (selectedBillForPay) {
      const upiVpa = 'sapanapark.chs@upi';
      const payeeName = 'Sapana Park CHS Ltd';
      const note = `Flat ${selectedBillForPay.flatNumber} ${selectedBillForPay.monthYear} Maintenance`;
      const upiUri = `upi://pay?pa=${encodeURIComponent(upiVpa)}&pn=${encodeURIComponent(
        payeeName
      )}&am=${selectedBillForPay.totalAmount}&tn=${encodeURIComponent(note)}&cu=INR`;

      QRCode.toDataURL(upiUri, {
        width: 220,
        margin: 2,
        color: { dark: '#090d16', light: '#ffffff' },
      })
        .then((url) => setModalQrUrl(url))
        .catch((err) => console.error('Error generating inline QR code:', err));
    } else {
      setModalQrUrl('');
      setModalQrSaved(false);
    }
  }, [selectedBillForPay]);

  const handleDownloadInlineQr = () => {
    if (!modalQrUrl || !selectedBillForPay) return;
    const link = document.createElement('a');
    link.href = modalQrUrl;
    link.download = `SapanaPark_UPI_QR_Flat_${selectedBillForPay.flatNumber}_${selectedBillForPay.monthYear.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setModalQrSaved(true);
    setTimeout(() => setModalQrSaved(false), 2500);
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBillForPay) return;

    setIsProcessing(true);
    setTimeout(() => {
      const res = payMaintenanceBill(
        selectedBillForPay.id,
        paymentMode,
        upiRef || `UPI-${Math.floor(100000000 + Math.random() * 900000000)}`
      );

      setIsProcessing(false);
      setSelectedBillForPay(null);
      setUpiRef('');
      onRefreshBills();

      if (res.bill) {
        printMaintenanceReceipt(res.bill);
      }
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Title & Role Context Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <IndianRupee className="w-5 h-5 text-emerald-400" />
            <span>Society Maintenance & Treasury Finance</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Official billing and collections portal for Flat <span className="text-emerald-300 font-mono font-bold">{session.resident.flatNumber}</span> • Sapana Park CHS
          </p>
        </div>

        {committeeView && (
          <div className="bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs px-3 py-1.5 rounded-xl flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Managing Committee Treasury View Active</span>
          </div>
        )}
      </div>

      {/* If Committee View: Show Society Fund Ledger Overview */}
      {committeeView && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Total August Collections</div>
            <div className="text-xl font-bold text-emerald-400 mt-1">
              {formatINR(fundSummary.totalCollectedThisMonth)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Maintenance & Service Dues</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Sinking Fund Balance (Sec 69)</div>
            <div className="text-xl font-bold text-teal-300 mt-1">
              {formatINR(fundSummary.sinkingFundBalance)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Audited Fixed Deposit Ledger</div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
            <div className="text-xs text-slate-400">Building Repair & Painting Fund</div>
            <div className="text-xl font-bold text-sky-300 mt-1">
              {formatINR(fundSummary.repairFundBalance)}
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Reserved for External Facade Painting</div>
          </div>
        </div>
      )}

      {/* Resident Bills Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
        <h3 className="text-white font-bold text-base mb-4 flex items-center justify-between">
          <span>Maintenance Bills for Flat {session.resident.flatNumber}</span>
          <span className="text-xs font-normal text-slate-400">{myBills.length} Bill Records</span>
        </h3>

        <div className="space-y-4">
          {myBills.map((bill) => {
            const isUnpaid = bill.status === 'Unpaid' || bill.status === 'Overdue';
            const isExpanded = expandedBillId === bill.id;

            return (
              <div
                key={bill.id}
                className={`border rounded-xl p-5 transition ${
                  isUnpaid
                    ? 'bg-slate-800/80 border-amber-500/40'
                    : 'bg-slate-800/40 border-slate-700/60'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg font-bold text-white">{bill.monthYear}</span>
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                          isUnpaid
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {bill.status}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3">
                      <span>Bill ID: <span className="font-mono text-slate-300">{bill.id}</span></span>
                      <span>Due Date: <span className="text-slate-200">{bill.dueDate}</span></span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div className="text-right">
                      <div className="text-xs text-slate-400">Total Payable</div>
                      <div className="text-xl font-extrabold text-white">
                        {formatINR(bill.totalAmount)}
                      </div>
                    </div>

                    {/* Quick UPI QR Code Modal Trigger */}
                    <button
                      onClick={() => setQrModalBill(bill)}
                      title="View & Save Dynamic UPI QR Code"
                      className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 p-2.5 rounded-xl border border-slate-700/80 transition flex items-center space-x-1 text-xs font-semibold"
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="hidden sm:inline">QR Code</span>
                    </button>

                    {isUnpaid ? (
                      <button
                        onClick={() => setSelectedBillForPay(bill)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition shadow-lg shadow-emerald-950/40"
                      >
                        Pay Bill
                      </button>
                    ) : (
                      <button
                        onClick={() => printMaintenanceReceipt(bill)}
                        className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold px-3 py-2 rounded-xl transition flex items-center space-x-1.5"
                      >
                        <Printer className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden sm:inline">Print Receipt</span>
                      </button>
                    )}

                    <button
                      onClick={() => setExpandedBillId(isExpanded ? null : bill.id)}
                      className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Itemized Breakdown */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-700/60 text-xs space-y-2 text-slate-300 bg-slate-950/40 p-4 rounded-xl">
                    <div className="font-bold text-slate-200 mb-2">Itemized Fee Particulars</div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Service Maintenance</span>
                        <span className="font-semibold text-slate-200">{formatINR(bill.breakdown.serviceCharges)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Repair Fund</span>
                        <span className="font-semibold text-slate-200">{formatINR(bill.breakdown.buildingRepairFund)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Sinking Fund (Goa Act)</span>
                        <span className="font-semibold text-slate-200">{formatINR(bill.breakdown.sinkingFund)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Water Pumping Charges</span>
                        <span className="font-semibold text-slate-200">{formatINR(bill.breakdown.waterSupplyCharges)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Parking Slot Charge</span>
                        <span className="font-semibold text-slate-200">{formatINR(bill.breakdown.parkingCharges)}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">Clubhouse & Gym</span>
                        <span className="font-semibold text-slate-200">{formatINR(bill.breakdown.clubhouseGymFee)}</span>
                      </div>
                      {bill.breakdown.nonOccupancyCharges > 0 && (
                        <div>
                          <span className="text-slate-500 block text-[10px]">Non-Occupancy (Tenant)</span>
                          <span className="font-semibold text-amber-300">{formatINR(bill.breakdown.nonOccupancyCharges)}</span>
                        </div>
                      )}
                    </div>

                    {!isUnpaid && bill.receiptNumber && (
                      <div className="mt-3 pt-2 border-t border-slate-800 text-[11px] text-emerald-400 flex items-center justify-between">
                        <span>Receipt No: <strong>{bill.receiptNumber}</strong></span>
                        <span>Paid on: {bill.paidOn} via {bill.paymentMode} ({bill.transactionRef})</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Standalone Dynamic UPI QR Modal */}
      {qrModalBill && (
        <UpiQrCodeModal
          bill={qrModalBill}
          onClose={() => setQrModalBill(null)}
          onProceedPayment={() => {
            const billToPay = qrModalBill;
            setQrModalBill(null);
            setSelectedBillForPay(billToPay);
          }}
        />
      )}

      {/* Payment Modal */}
      {selectedBillForPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1">
              Pay Maintenance Bill: {selectedBillForPay.monthYear}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Flat {selectedBillForPay.flatNumber} • Total Amount: <strong className="text-emerald-400">{formatINR(selectedBillForPay.totalAmount)}</strong>
            </p>

            <form onSubmit={handlePaySubmit} className="space-y-4">
              {/* Payment Method Selector */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMode('UPI')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    paymentMode === 'UPI'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <QrCode className="w-5 h-5 mx-auto mb-1" />
                  <span>UPI / QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('NetBanking')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    paymentMode === 'NetBanking'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <Building className="w-5 h-5 mx-auto mb-1" />
                  <span>NetBanking</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMode('CreditCard')}
                  className={`p-3 rounded-xl border text-xs font-semibold text-center transition ${
                    paymentMode === 'CreditCard'
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mx-auto mb-1" />
                  <span>Card</span>
                </button>
              </div>

              {/* Dynamic UPI QR Display */}
              {paymentMode === 'UPI' && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-center space-y-3">
                  <div className="bg-white p-3 rounded-2xl inline-block shadow-lg border-2 border-slate-700">
                    {modalQrUrl ? (
                      <img
                        src={modalQrUrl}
                        alt="Dynamic UPI QR Code"
                        className="w-44 h-44 object-contain rounded"
                      />
                    ) : (
                      <div className="w-44 h-44 flex items-center justify-center text-slate-800 text-xs font-mono">
                        Generating QR...
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-300 font-mono font-semibold">
                    UPI VPA: <span className="text-emerald-400">sapanapark.chs@upi</span>
                  </div>

                  {/* Save QR to Gallery Button */}
                  <button
                    type="button"
                    onClick={handleDownloadInlineQr}
                    className="inline-flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition border border-slate-700"
                  >
                    {modalQrSaved ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400 font-bold">Saved to Gallery!</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Save QR Image to Gallery</span>
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-slate-400">
                    Scan with Google Pay, PhonePe, Paytm, or BHIM.
                  </p>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Transaction Reference Number (Optional for test)
                </label>
                <input
                  type="text"
                  value={upiRef}
                  onChange={(e) => setUpiRef(e.target.value)}
                  placeholder="e.g. 98230149812"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedBillForPay(null)}
                  className="flex-1 bg-slate-800 text-slate-300 hover:text-white py-2.5 rounded-xl font-medium text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-bold text-xs transition shadow-lg flex items-center justify-center space-x-1"
                >
                  {isProcessing ? (
                    <span>Processing Payment...</span>
                  ) : (
                    <span>Confirm Payment ₹{selectedBillForPay.totalAmount}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
