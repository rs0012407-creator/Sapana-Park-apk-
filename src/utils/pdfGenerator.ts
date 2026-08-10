import { MaintenanceBill } from '../models/finance';
import { NOCApplication } from '../models/document';
import { formatINR } from './currency';

export function printMaintenanceReceipt(bill: MaintenanceBill) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt - ${bill.receiptNumber || bill.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 30px; color: #1e293b; line-height: 1.5; }
          .header { text-align: center; border-bottom: 2px solid #0f766e; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { margin: 0; color: #0f766e; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; }
          .header p { margin: 4px 0; color: #475569; font-size: 13px; }
          .receipt-badge { display: inline-block; background: #0f766e; color: white; padding: 4px 12px; font-weight: bold; border-radius: 4px; font-size: 14px; margin-top: 10px; }
          .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; background: #f8fafc; padding: 15px; border-radius: 6px; margin-bottom: 20px; font-size: 14px; border: 1px solid #e2e8f0; }
          .details-grid div p { margin: 4px 0; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px; }
          .table th, .table td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
          .table th { background: #f1f5f9; font-weight: 600; color: #334155; }
          .amount-col { text-align: right !important; }
          .total-row { font-weight: bold; background: #ccfbf1 !important; font-size: 15px; }
          .footer { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #64748b; }
          .sign-box { border-top: 1px solid #94a3b8; text-align: center; width: 180px; padding-top: 5px; font-weight: bold; }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sapana Park Co-operative Housing Society Ltd.</h1>
          <p>Regd. No: HSG-(G)-452 / 2008 | Goa Co-operative Societies Act, 2001</p>
          <p>Off Chogm Road, Porvorim, Bardez, Goa - 403521</p>
          <div class="receipt-badge">OFFICIAL MAINTENANCE PAYMENT RECEIPT</div>
        </div>

        <div class="details-grid">
          <div>
            <p><strong>Receipt No:</strong> ${bill.receiptNumber || 'REC-' + bill.id}</p>
            <p><strong>Flat No:</strong> ${bill.flatNumber}</p>
            <p><strong>Member Name:</strong> ${bill.residentName}</p>
          </div>
          <div>
            <p><strong>Billing Cycle:</strong> ${bill.monthYear}</p>
            <p><strong>Payment Date:</strong> ${bill.paidOn || new Date().toLocaleDateString('en-IN')}</p>
            <p><strong>Payment Mode:</strong> ${bill.paymentMode || 'Online UPI'} (Ref: ${bill.transactionRef || 'TXN-984210'})</p>
          </div>
        </div>

        <h3>Particulars & Fee Breakdown</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Particulars</th>
              <th class="amount-col">Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>Service & Security Maintenance Charges</td><td class="amount-col">${formatINR(bill.breakdown.serviceCharges)}</td></tr>
            <tr><td>Building Repair & Painting Fund</td><td class="amount-col">${formatINR(bill.breakdown.buildingRepairFund)}</td></tr>
            <tr><td>Sinking Fund (Goa Act Sec 69)</td><td class="amount-col">${formatINR(bill.breakdown.sinkingFund)}</td></tr>
            <tr><td>Water Supply & Pumping Charges</td><td class="amount-col">${formatINR(bill.breakdown.waterSupplyCharges)}</td></tr>
            <tr><td>Dedicated Parking Slot Maintenance</td><td class="amount-col">${formatINR(bill.breakdown.parkingCharges)}</td></tr>
            ${bill.breakdown.nonOccupancyCharges > 0 ? `<tr><td>Non-Occupancy Charges (Tenant Flat)</td><td class="amount-col">${formatINR(bill.breakdown.nonOccupancyCharges)}</td></tr>` : ''}
            <tr><td>Clubhouse & Gymnasium Maintenance</td><td class="amount-col">${formatINR(bill.breakdown.clubhouseGymFee)}</td></tr>
            ${bill.breakdown.lateFeeInterest > 0 ? `<tr><td>Late Fee Interest</td><td class="amount-col">${formatINR(bill.breakdown.lateFeeInterest)}</td></tr>` : ''}
            <tr class="total-row">
              <td><strong>TOTAL AMOUNT RECEIVED</strong></td>
              <td class="amount-col"><strong>${formatINR(bill.totalAmount)}</strong></td>
            </tr>
          </tbody>
        </table>

        <p style="font-size: 13px; color: #475569;">
          <em>Received with thanks a sum of <strong>${formatINR(bill.totalAmount)}</strong> towards society maintenance dues. Computer generated e-receipt. No physical signature required.</em>
        </p>

        <div class="footer">
          <div>
            <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
            <p>Sapana Park CHS Portal</p>
          </div>
          <div class="sign-box">
            For Sapana Park CHS Ltd.<br/>
            (Hon. Treasurer / Secretary)
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}

export function printNOCCertificate(noc: NOCApplication) {
  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>NOC Certificate - ${noc.generatedCertificateNumber || noc.id}</title>
        <style>
          body { font-family: 'Times New Roman', Times, serif; margin: 40px; color: #111827; line-height: 1.6; }
          .header { text-align: center; border-bottom: 3px double #0f766e; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #0f766e; font-size: 26px; text-transform: uppercase; font-weight: bold; }
          .header p { margin: 3px 0; font-size: 14px; font-family: sans-serif; color: #4b5563; }
          .title { text-align: center; margin: 25px 0; font-size: 20px; font-weight: bold; text-decoration: underline; letter-spacing: 1px; color: #0f766e; }
          .ref-line { display: flex; justify-content: space-between; font-family: sans-serif; font-size: 13px; margin-bottom: 25px; font-weight: bold; }
          .content { font-size: 16px; text-align: justify; text-indent: 40px; margin-bottom: 20px; }
          .conditions { background: #f8fafc; border-left: 4px solid #0f766e; padding: 15px; margin: 25px 0; font-family: sans-serif; font-size: 13px; }
          .signatures { margin-top: 60px; display: flex; justify-content: space-between; font-family: sans-serif; }
          .sig-box { text-align: center; width: 220px; }
          .seal { border: 2px dashed #0f766e; width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #0f766e; font-size: 11px; text-align: center; font-weight: bold; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Sapana Park Co-operative Housing Society Ltd.</h1>
          <p>Registration No: HSG-(G)-452 / 2008 under Goa Co-operative Societies Act, 2001</p>
          <p>Off Chogm Road, Porvorim, Bardez, Goa - 403521</p>
        </div>

        <div class="ref-line">
          <div>Ref No: ${noc.generatedCertificateNumber || 'SP/NOC/2026/' + noc.id}</div>
          <div>Date: ${noc.approvedDate || new Date().toLocaleDateString('en-IN')}</div>
        </div>

        <div class="title">NO OBJECTION CERTIFICATE</div>

        <p class="content">
          This is to certify that the Managing Committee of <strong>Sapana Park Co-operative Housing Society Ltd.</strong> has NO OBJECTION to the request submitted by member <strong>${noc.applicantName}</strong>, residing/owning Flat No. <strong>${noc.flatNumber}</strong> regarding:
        </p>

        <p style="text-align: center; font-size: 18px; font-weight: bold; color: #0369a1; margin: 15px 0;">
          "${noc.type}"
        </p>

        <p class="content">
          <strong>Purpose / Details:</strong> ${noc.purposeReason}
        </p>

        <div class="conditions">
          <strong>Terms & Society Guidelines:</strong>
          <ol style="margin-top: 5px; padding-left: 20px;">
            <li>All society maintenance and utility dues up to date must remain clear.</li>
            <li>No structural changes or damage to external load-bearing walls/pillars shall be carried out.</li>
            <li>Work hours for interior/renovation work strictly limited between 9:00 AM to 6:00 PM (Monday-Saturday).</li>
            <li>Tenant/Licensee must submit police verification document copy to Society Office before move-in.</li>
          </ol>
        </div>

        <p style="font-size: 14px; font-family: sans-serif;">
          This certificate is issued upon the request of the applicant for submission to concerned authorities.
        </p>

        <div class="signatures">
          <div class="sig-box">
            <div class="seal">SOCIETY<br/>OFFICIAL<br/>SEAL</div>
          </div>
          <div class="sig-box" style="margin-top: 40px;">
            ___________________________<br/>
            <strong>Hon. Secretary</strong><br/>
            Sapana Park CHS Ltd.
          </div>
          <div class="sig-box" style="margin-top: 40px;">
            ___________________________<br/>
            <strong>Hon. Chairman</strong><br/>
            Sapana Park CHS Ltd.
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
