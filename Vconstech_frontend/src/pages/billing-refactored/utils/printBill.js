// printBill.js - Clean Version

export const printBill = (bill) => {
  if (!bill) {
    alert('Invalid bill data');
    return;
  }

  const printWindow = window.open('', '_blank');
  const items = Array.isArray(bill?.BillItem) ? bill.BillItem : 
                Array.isArray(bill?.items) ? bill.items : [];

  if (items.length === 0) {
    alert('No items found in this bill');
    printWindow.close();
    return;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const billNumber = bill.billId || bill.billNumber || 'N/A';
  const billDate = formatDate(bill.billDate);
  const dueDate = formatDate(bill.dueDate);
  const billType = bill.billType || 'invoice';
  const documentTitle = billType === 'quotation' ? 'QUOTATION' : 'TAX INVOICE';
  
  // Try multiple possible locations for the logo
  const companyLogo = bill.company?.logo || 
                      bill.companyLogo || 
                      bill.user?.company?.logo || 
                      null;
  
  // Get API base URL
  let API_BASE_URL = 'http://localhost:5000';
  
  if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) {
    API_BASE_URL = import.meta.env.VITE_API_URL.replace('/api', '');
  } else if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    API_BASE_URL = process.env.VITE_API_URL.replace('/api', '');
  }

  // Calculate amounts
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item?.amount || 0),
    0
  );

  const grossAmount =
    subtotal +
    Number(bill?.labourCharges || 0) +
    Number(bill?.transportCharges || 0) +
    Number(bill?.otherCharges || 0);

  const cgstPercent = Number(bill?.cgstPercent || bill?.cgst || 0);
  const sgstPercent = Number(bill?.sgstPercent || bill?.sgst || 0);
  const igstPercent = Number(bill?.igstPercent || bill?.igst || 0);
  const tdsPercent = Number(bill?.tdsPercent || bill?.tds || 0);
  const retentionPercent = Number(bill?.retentionPercent || bill?.retention || 0);

  const cgst = (grossAmount * cgstPercent) / 100;
  const sgst = (grossAmount * sgstPercent) / 100;
  const igst = (grossAmount * igstPercent) / 100;

  const totalWithTax = grossAmount + cgst + sgst + igst;

  const tds = (totalWithTax * tdsPercent) / 100;
  const retention = (totalWithTax * retentionPercent) / 100;

  const netPayable =
    totalWithTax -
    tds -
    retention -
    Number(bill?.advancePaid || 0) +
    Number(bill?.previousBills || 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${billType === 'quotation' ? 'Quotation' : 'Invoice'} - ${billNumber}</title>
      <style>
        @media print {
          @page { 
            margin: 1cm; 
            size: A4;
          }
          body {
            margin: 0;
            padding: 0;
          }
          .print-button { 
            display: none !important; 
          }
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', Arial, sans-serif;
          padding: 20px;
          max-width: 210mm;
          margin: 0 auto;
          background: #f5f5f5;
        }
        
        .invoice-container {
          background: white;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
        }
        
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 4px solid #ffbe2a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .logo-section {
          flex: 0 0 auto;
        }
        
        .logo-placeholder {
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .logo-placeholder img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .header-center {
          flex: 1;
          text-align: center;
          padding: 0 20px;
        }
        
        .header-center h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 10px;
          letter-spacing: 2px;
          font-weight: 700;
        }
        
        .header-right {
          flex: 0 0 auto;
          text-align: right;
          min-width: 200px;
        }
        
        .bill-details {
          background: #f9f9f9;
          padding: 15px;
          border-left: 4px solid #ffbe2a;
          border-radius: 4px;
        }
        
        .bill-details p {
          margin: 8px 0;
          font-size: 13px;
          color: #555;
          display: flex;
          justify-content: space-between;
          gap: 15px;
        }
        
        .bill-details strong {
          color: #333;
          font-weight: 600;
          min-width: 80px;
        }
        
        .bill-details .value {
          color: #000;
          font-weight: 600;
        }
        
        .info-section {
          margin-bottom: 25px;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #ffbe2a;
        }
        
        .section-title {
          font-weight: 700;
          font-size: 14px;
          color: #333;
          text-transform: uppercase;
          margin-bottom: 12px;
          letter-spacing: 1px;
        }
        
        .info-section p {
          margin: 6px 0;
          font-size: 13px;
          color: #555;
          line-height: 1.6;
        }
        
        .info-section strong {
          color: #333;
          font-weight: 600;
        }
        
        .two-column {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 25px;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 13px;
        }
        
        th {
          background: #333;
          color: white;
          padding: 12px 10px;
          text-align: left;
          font-weight: 600;
          text-transform: uppercase;
          font-size: 11px;
          letter-spacing: 0.5px;
        }
        
        td {
          border: 1px solid #ddd;
          padding: 10px;
          color: #555;
        }
        
        tbody tr:nth-child(even) {
          background: #f9f9f9;
        }
        
        tbody tr:hover {
          background: #f0f0f0;
        }
        
        .text-right { 
          text-align: right; 
        }
        
        .text-center { 
          text-align: center; 
        }
        
        .summary-table {
          margin-top: 30px;
          width: 100%;
          max-width: 800px;
          margin-left: auto;
        }
        
        .summary-table td {
          padding: 8px 15px;
          border: none;
          border-bottom: 1px solid #eee;
        }
        
        .summary-table tr:last-child td {
          border-bottom: none;
        }
        
        .summary-table .label {
          font-weight: 500;
          color: #555;
        }
        
        .summary-table .value {
          text-align: right;
          font-weight: 600;
          color: #333;
        }
        
        .summary-table .subtotal-row {
          border-top: 2px solid #ddd;
        }
        
        .summary-table .total-row {
          background: #333;
          color: white;
          font-size: 16px;
        }
        
        .summary-table .total-row td {
          padding: 12px 15px;
          border-bottom: none;
        }
        
        .net-payable-row {
          background: #ffbe2a !important;
          font-size: 18px !important;
          font-weight: 700 !important;
        }
        
        .net-payable-row td {
          padding: 15px !important;
          color: #000 !important;
        }
        
        .additional-info {
          margin-top: 30px;
          padding: 15px;
          background: #f9f9f9;
          border-left: 4px solid #ffbe2a;
        }
        
        .additional-info h4 {
          font-size: 13px;
          color: #333;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .additional-info p {
          font-size: 12px;
          color: #555;
          line-height: 1.6;
          white-space: pre-wrap;
          word-wrap: break-word;
          word-break: break-word;
          overflow-wrap: break-word;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          padding-top: 20px;
          border-top: 2px solid #eee;
          position: relative;
        }
        
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin-top: 60px;
          margin-bottom: 20px;
        }
        
        .signature-box {
          margin-top: 100px;
          width: 250px;
          margin-left: auto;
          text-align: center;
        }
        
        .signature-line {
          border-top: 2px solid #333;
          margin-bottom: 10px;
          margin-top: 50px;
        }
        
        .signature-label {
          font-size: 12px;
          color: #666;
          font-weight: 600;
        }
        
        .footer p {
          font-size: 11px;
          color: #999;
          font-style: italic;
        }
        
        .print-button {
          background: #333;
          color: white;
          padding: 12px 30px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s;
        }
        
        .print-button:hover {
          background: #ffbe2a;
          color: #000;
        }
      </style>
    </head>
    <body>
      <button class="print-button" onclick="window.print()">
        🖨️ Print ${billType === 'quotation' ? 'Quotation' : 'Invoice'}
      </button>
      
      <div class="invoice-container">
        <div class="header">
          <div class="logo-section">
            <div class="logo-placeholder">
              ${companyLogo ? 
                `<img src="${API_BASE_URL}${companyLogo}" alt="Company Logo" />` : 
                ''
              }
            </div>
          </div>
          
          <div class="header-center">
            <h1>${documentTitle}</h1>
          </div>
          
          <div class="header-right">
            <div class="bill-details">
              <p>
                <strong>${billType === 'quotation' ? 'Quote No:' : 'Invoice No:'}</strong>
                <span class="value">${billNumber}</span>
              </p>
              <p>
                <strong>Date:</strong>
                <span class="value">${billDate}</span>
              </p>
              ${billType === 'invoice' && dueDate !== 'N/A' ? `
              <p>
                <strong>Due Date:</strong>
                <span class="value">${dueDate}</span>
              </p>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="two-column">
          <div class="info-section">
            <div class="section-title">FROM (Contractor/Company)</div>
            <p><strong>${bill.companyName || 'N/A'}</strong></p>
            ${bill.companyAddress ? `<p>${bill.companyAddress}</p>` : ''}
            ${bill.companyGST ? `<p><strong>GST:</strong> ${bill.companyGST}</p>` : ''}
            ${bill.companyPhone ? `<p><strong>Phone:</strong> ${bill.companyPhone}</p>` : ''}
            ${bill.companyEmail ? `<p><strong>Email:</strong> ${bill.companyEmail}</p>` : ''}
          </div>

          <div class="info-section">
            <div class="section-title">TO (Client)</div>
            <p><strong>${bill.clientName || 'N/A'}</strong></p>
            ${bill.clientAddress ? `<p>${bill.clientAddress}</p>` : ''}
            ${bill.clientGST ? `<p><strong>GST:</strong> ${bill.clientGST}</p>` : ''}
            ${bill.clientPhone ? `<p><strong>Phone:</strong> ${bill.clientPhone}</p>` : ''}
            ${bill.clientEmail ? `<p><strong>Email:</strong> ${bill.clientEmail}</p>` : ''}
          </div>
        </div>

        <div class="info-section">
          <div class="section-title">PROJECT DETAILS</div>
          <p><strong>Project:</strong> ${bill.projectName || 'N/A'}</p>
          ${bill.projectLocation ? `<p><strong>Location:</strong> ${bill.projectLocation}</p>` : ''}
          ${bill.workOrderNo ? `<p><strong>Work Order No:</strong> ${bill.workOrderNo}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50px;">S.No</th>
              <th>Description of Work</th>
              <th style="width: 80px;">HSN/SAC</th>
              <th style="width: 80px;">Unit</th>
              <th style="width: 80px;" class="text-right">Qty</th>
              <th style="width: 100px;" class="text-right">Rate</th>
              <th style="width: 120px;" class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, index) => `
              <tr>
                <td class="text-center">${index + 1}</td>
                <td>${item.description || 'N/A'}</td>
                <td class="text-center">${item.HSN || '-'}</td>
                <td class="text-center">${item.unit || 'Nos'}</td>
                <td class="text-right">${Number(item.quantity || 0).toFixed(2)}</td>
                <td class="text-right">₹ ${Number(item.rate || 0).toFixed(2)}</td>
                <td class="text-right">₹ ${Number(item.amount || 0).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <table class="summary-table">
          <tr>
            <td class="label">Subtotal (Items)</td>
            <td class="value">₹ ${subtotal.toFixed(2)}</td>
          </tr>
          ${bill.labourCharges > 0 ? `
            <tr>
              <td class="label">Labour Charges</td>
              <td class="value">₹ ${Number(bill.labourCharges).toFixed(2)}</td>
            </tr>
          ` : ''}
          ${bill.transportCharges > 0 ? `
            <tr>
              <td class="label">Transport Charges</td>
              <td class="value">₹ ${Number(bill.transportCharges).toFixed(2)}</td>
            </tr>
          ` : ''}
          ${bill.otherCharges > 0 ? `
            <tr>
              <td class="label">Other Charges${bill.otherChargesDescription ? ' (' + bill.otherChargesDescription + ')' : ''}</td>
              <td class="value">₹ ${Number(bill.otherCharges).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="subtotal-row">
            <td class="label"><strong>Gross Amount</strong></td>
            <td class="value"><strong>₹ ${grossAmount.toFixed(2)}</strong></td>
          </tr>
          ${cgstPercent > 0 ? `
            <tr>
              <td class="label">CGST (${cgstPercent}%)</td>
              <td class="value">₹ ${cgst.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${sgstPercent > 0 ? `
            <tr>
              <td class="label">SGST (${sgstPercent}%)</td>
              <td class="value">₹ ${sgst.toFixed(2)}</td>
            </tr>
          ` : ''}
          ${igstPercent > 0 ? `
            <tr>
              <td class="label">IGST (${igstPercent}%)</td>
              <td class="value">₹ ${igst.toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td style="color: #fff;"><strong>Total with Tax</strong></td>
            <td style="color: #fff; text-align: right;"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td>
          </tr>

          ${billType === 'invoice' ? `
            ${tdsPercent > 0 ? `
              <tr style="color: #d32f2f;">
                <td class="label">Less: TDS (${tdsPercent}%)</td>
                <td class="value">- ₹ ${tds.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${retentionPercent > 0 ? `
              <tr style="color: #d32f2f;">
                <td class="label">Less: Retention (${retentionPercent}%)</td>
                <td class="value">- ₹ ${retention.toFixed(2)}</td>
              </tr>
            ` : ''}
            ${bill.advancePaid > 0 ? `
              <tr style="color: #d32f2f;">
                <td class="label">Less: Advance Paid</td>
                <td class="value">- ₹ ${Number(bill.advancePaid).toFixed(2)}</td>
              </tr>
            ` : ''}
            ${bill.previousBills > 0 ? `
              <tr style="color: #2e7d32;">
                <td class="label">Add: Previous Bills</td>
                <td class="value">+ ₹ ${Number(bill.previousBills).toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr class="net-payable-row">
              <td><strong>NET PAYABLE AMOUNT</strong></td>
              <td style="text-align: right;"><strong>₹ ${netPayable.toFixed(2)}</strong></td>
            </tr>
          ` : `
            <tr class="net-payable-row">
              <td><strong>TOTAL QUOTED AMOUNT</strong></td>
              <td style="text-align: right;"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td>
            </tr>
          `}
        </table>

        ${billType === 'quotation' && bill.advancePaid > 0 ? `
          <div class="additional-info" style="margin-top: 20px; background: #e3f2fd; border-left: 4px solid #2196f3;">
            <h4 style="color: #1565c0;">Payment Information</h4>
            <p style="font-size: 14px; color: #333;"><strong>Advance to be Paid:</strong> ₹ ${Number(bill.advancePaid).toFixed(2)}</p>
          </div>
        ` : ''}

        ${bill.remarks ? `
          <div class="additional-info">
            <h4>Remarks</h4>
            <p>${bill.remarks}</p>
          </div>
        ` : ''}

        ${bill.termsAndConditions ? `
          <div class="additional-info">
            <h4>Terms & Conditions</h4>
            <p>${bill.termsAndConditions}</p>
          </div>
        ` : ''}

        <div class="signature-box">
          <div class="signature-line"></div>
          <div class="signature-label">Authorized Signature</div>
        </div>

        <div class="footer">
          <p>This is a computer-generated ${billType === 'quotation' ? 'quotation' : 'invoice'} and does not require a signature</p>
          <p>Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};