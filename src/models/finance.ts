export type BillStatus = 'Unpaid' | 'Paid' | 'Overdue' | 'Processing';

export interface MaintenanceBreakdown {
  serviceCharges: number; // Maintenance & security
  buildingRepairFund: number;
  sinkingFund: number;
  waterSupplyCharges: number;
  parkingCharges: number;
  nonOccupancyCharges: number; // For rented flats
  clubhouseGymFee: number;
  lateFeeInterest: number;
  cgst: number;
  sgst: number;
}

export interface MaintenanceBill {
  id: string; // e.g., "BILL-2026-08-A302"
  flatNumber: string;
  residentName: string;
  monthYear: string; // e.g. "August 2026"
  billingDate: string;
  dueDate: string;
  breakdown: MaintenanceBreakdown;
  totalAmount: number;
  status: BillStatus;
  paidOn?: string;
  paymentMode?: 'UPI' | 'NetBanking' | 'CreditCard' | 'Cheque' | 'Cash';
  transactionRef?: string;
  receiptNumber?: string;
}

export interface SocietyFundSummary {
  totalCollectedThisMonth: number;
  totalOutstanding: number;
  sinkingFundBalance: number;
  repairFundBalance: number;
  generalFundBalance: number;
}
