import { MaintenanceBill, SocietyFundSummary } from '../models/finance';

const BILLS_KEY = 'sapana_park_bills_db';

export const INITIAL_BILLS: MaintenanceBill[] = [
  {
    id: 'BILL-2026-08-A302',
    flatNumber: 'A-302',
    residentName: 'Rajesh Naik',
    monthYear: 'August 2026',
    billingDate: '2026-08-01',
    dueDate: '2026-08-20',
    status: 'Unpaid',
    breakdown: {
      serviceCharges: 1800,
      buildingRepairFund: 450,
      sinkingFund: 350,
      waterSupplyCharges: 400,
      parkingCharges: 250,
      nonOccupancyCharges: 0,
      clubhouseGymFee: 200,
      lateFeeInterest: 0,
      cgst: 0,
      sgst: 0,
    },
    totalAmount: 3450,
  },
  {
    id: 'BILL-2026-07-A302',
    flatNumber: 'A-302',
    residentName: 'Rajesh Naik',
    monthYear: 'July 2026',
    billingDate: '2026-07-01',
    dueDate: '2026-07-20',
    status: 'Paid',
    paidOn: '2026-07-12',
    paymentMode: 'UPI',
    transactionRef: 'UPI-982341094812',
    receiptNumber: 'SP-REC-2026-07-042',
    breakdown: {
      serviceCharges: 1800,
      buildingRepairFund: 450,
      sinkingFund: 350,
      waterSupplyCharges: 400,
      parkingCharges: 250,
      nonOccupancyCharges: 0,
      clubhouseGymFee: 200,
      lateFeeInterest: 0,
      cgst: 0,
      sgst: 0,
    },
    totalAmount: 3450,
  },
  {
    id: 'BILL-2026-08-B101',
    flatNumber: 'B-101',
    residentName: 'Anjali Deshmukh',
    monthYear: 'August 2026',
    billingDate: '2026-08-01',
    dueDate: '2026-08-20',
    status: 'Paid',
    paidOn: '2026-08-03',
    paymentMode: 'NetBanking',
    transactionRef: 'HDFC-8823104921',
    receiptNumber: 'SP-REC-2026-08-012',
    breakdown: {
      serviceCharges: 1800,
      buildingRepairFund: 450,
      sinkingFund: 350,
      waterSupplyCharges: 400,
      parkingCharges: 250,
      nonOccupancyCharges: 0,
      clubhouseGymFee: 200,
      lateFeeInterest: 0,
      cgst: 0,
      sgst: 0,
    },
    totalAmount: 3450,
  },
  {
    id: 'BILL-2026-08-C204',
    flatNumber: 'C-204',
    residentName: 'David D’Souza',
    monthYear: 'August 2026',
    billingDate: '2026-08-01',
    dueDate: '2026-08-20',
    status: 'Unpaid',
    breakdown: {
      serviceCharges: 1800,
      buildingRepairFund: 450,
      sinkingFund: 350,
      waterSupplyCharges: 450,
      parkingCharges: 250,
      nonOccupancyCharges: 0,
      clubhouseGymFee: 200,
      lateFeeInterest: 0,
      cgst: 0,
      sgst: 0,
    },
    totalAmount: 3500,
  },
  {
    id: 'BILL-2026-08-D401',
    flatNumber: 'D-401',
    residentName: 'Vikram & Swati Sharma',
    monthYear: 'August 2026',
    billingDate: '2026-08-01',
    dueDate: '2026-08-20',
    status: 'Unpaid',
    breakdown: {
      serviceCharges: 1800,
      buildingRepairFund: 450,
      sinkingFund: 350,
      waterSupplyCharges: 400,
      parkingCharges: 250,
      nonOccupancyCharges: 180, // 10% non-occupancy as per Goa Act Sec 69
      clubhouseGymFee: 200,
      lateFeeInterest: 0,
      cgst: 0,
      sgst: 0,
    },
    totalAmount: 3630,
  },
];

export function getStoredBills(): MaintenanceBill[] {
  const saved = localStorage.getItem(BILLS_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // Fallback
    }
  }
  return INITIAL_BILLS;
}

export function saveBills(bills: MaintenanceBill[]): void {
  localStorage.setItem(BILLS_KEY, JSON.stringify(bills));
}

export function payMaintenanceBill(
  billId: string,
  paymentMode: 'UPI' | 'NetBanking' | 'CreditCard' | 'Cheque' | 'Cash',
  transactionRef: string
): { success: boolean; bill?: MaintenanceBill; message: string } {
  const bills = getStoredBills();
  const index = bills.findIndex((b) => b.id === billId);

  if (index === -1) {
    return { success: false, message: 'Bill not found' };
  }

  const receiptNumber = `SP-REC-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

  const updatedBill: MaintenanceBill = {
    ...bills[index],
    status: 'Paid',
    paidOn: new Date().toISOString().split('T')[0],
    paymentMode,
    transactionRef: transactionRef || `TXN-${Math.floor(100000000 + Math.random() * 900000000)}`,
    receiptNumber,
  };

  bills[index] = updatedBill;
  saveBills(bills);

  return {
    success: true,
    bill: updatedBill,
    message: `Payment of ₹${updatedBill.totalAmount} successful! Receipt ${receiptNumber} generated.`,
  };
}

export function getSocietyFundSummary(): SocietyFundSummary {
  const bills = getStoredBills();
  const paidThisMonth = bills
    .filter((b) => b.monthYear === 'August 2026' && b.status === 'Paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const totalOutstanding = bills
    .filter((b) => b.status === 'Unpaid' || b.status === 'Overdue')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return {
    totalCollectedThisMonth: paidThisMonth + 142000, // Total society collection
    totalOutstanding: totalOutstanding + 12400,
    sinkingFundBalance: 1845000,
    repairFundBalance: 920000,
    generalFundBalance: 465000,
  };
}
