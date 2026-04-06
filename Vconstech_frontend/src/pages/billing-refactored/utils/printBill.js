// printBill.js
// Screen preview: splits content across real A4 cards (794×1123px each).
// Print:          browser handles pagination naturally via @page margins.

export const printBill = (bill) => {
  if (!bill) { alert("Invalid bill data"); return; }

  const printWindow = window.open("", "_blank");
  const items = Array.isArray(bill?.BillItem)
    ? bill.BillItem
    : Array.isArray(bill?.items)
      ? bill.items
      : [];

  if (items.length === 0) {
    alert("No items found in this bill");
    printWindow.close();
    return;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit", month: "short", year: "numeric",
    });
  };

  const billNumber    = bill.billId || bill.billNumber || "N/A";
  const billDate      = formatDate(bill.billDate);
  const dueDate       = formatDate(bill.dueDate);
  const billType      = bill.billType || "invoice";
  const documentTitle = billType === "quotation" ? "QUOTATION" : "TAX INVOICE";
  const companyLogo   = bill.company?.logo || bill.companyLogo || bill.user?.company?.logo || null;

  let API_BASE_URL = "  http://localhost:5000";
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL)
    API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");
  else if (typeof process !== "undefined" && process.env?.VITE_API_URL)
    API_BASE_URL = process.env.VITE_API_URL.replace("/api", "");

  const subtotal     = items.reduce((s, i) => s + Number(i?.amount || 0), 0);
  const grossAmount  = subtotal
    + Number(bill?.labourCharges    || 0)
    + Number(bill?.transportCharges || 0)
    + Number(bill?.otherCharges     || 0);

  const cgstPercent      = Number(bill?.cgstPercent      || bill?.cgst      || 0);
  const sgstPercent      = Number(bill?.sgstPercent      || bill?.sgst      || 0);
  const igstPercent      = Number(bill?.igstPercent      || bill?.igst      || 0);
  const tdsPercent       = Number(bill?.tdsPercent       || bill?.tds       || 0);
  const retentionPercent = Number(bill?.retentionPercent || bill?.retention || 0);

  const cgst         = (grossAmount  * cgstPercent)      / 100;
  const sgst         = (grossAmount  * sgstPercent)      / 100;
  const igst         = (grossAmount  * igstPercent)      / 100;
  const totalWithTax = grossAmount + cgst + sgst + igst;
  const tds          = (totalWithTax * tdsPercent)       / 100;
  const retention    = (totalWithTax * retentionPercent) / 100;
  const advance      = Number(bill?.advancePaid || 0);

  const netPayable = billType === "quotation"
    ? totalWithTax - tds - retention + advance + Number(bill?.previousBills || 0)
    : totalWithTax - tds - retention - advance + Number(bill?.previousBills || 0);

  const companyPhone = bill.companyPhone || "";
  const companyEmail = bill.companyEmail || "";

  // ─── Shared HTML fragments ────────────────────────────────────────────────

  const footerHTML = `
    <div class="doc-footer">
      <div class="footer-contact">
        ${companyPhone ? `<div class="contact-item"><div class="icon">📞</div><span>${companyPhone}</span></div>` : ""}
        ${companyEmail ? `<div class="contact-item"><div class="icon">✉</div><span>${companyEmail}</span></div>` : ""}
      </div>
      <div class="tagline">Thank You For Your Business</div>
    </div>`;

  const headerHTML = `
    <div class="header">
      <div class="logo-area">
        <div class="logo-box">
          ${companyLogo
            ? `<img src="${API_BASE_URL}${companyLogo}" alt="Logo" />`
            : `<svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="48" height="48" rx="4" fill="#1a1a1a"/>
                <text x="50%" y="58%" dominant-baseline="middle" text-anchor="middle"
                  font-family="Arial" font-weight="900" font-size="22" fill="#f5b800">
                  ${(bill.companyName || "C").charAt(0).toUpperCase()}
                </text>
              </svg>`}
        </div>
        <div class="company-name-header">${bill.companyName || "COMPANY"}</div>
      </div>
      <div class="header-right">
        <div class="doc-title">${documentTitle}</div>
        <div class="bill-meta">
          <div class="meta-row">
            <span class="meta-label">${billType === "quotation" ? "Quote No:" : "Invoice No:"}</span>
            <span class="meta-value">${billNumber}</span>
          </div>
          <div class="meta-row"><span class="meta-label">Date:</span><span class="meta-value">${billDate}</span></div>
          ${billType === "invoice" && dueDate !== "N/A"
            ? `<div class="meta-row"><span class="meta-label">Due Date:</span><span class="meta-value">${dueDate}</span></div>`
            : ""}
        </div>
      </div>
    </div>`;

  const mainBodyHTML = `
    <div class="body-content" id="mainBody">
      <div class="two-column">
        <div class="from-col">
          <div class="col-title">From <span>(Contractor / Company)</span></div>
          ${bill.companyName    ? `<div class="info-line"><span class="lbl">Name:</span><span class="val">${bill.companyName}</span></div>` : `<div class="info-line"><span class="lbl">Name:</span><span class="val">N/A</span></div>`}
          ${bill.companyAddress ? `<div class="info-line"><span class="lbl">Address:</span><span class="val">${bill.companyAddress}</span></div>` : ""}
          ${bill.companyGST     ? `<div class="info-line"><span class="lbl">GST:</span><span class="val">${bill.companyGST}</span></div>` : ""}
          ${bill.companyPhone   ? `<div class="info-line"><span class="lbl">Phone:</span><span class="val">${bill.companyPhone}</span></div>` : ""}
          ${bill.companyEmail   ? `<div class="info-line"><span class="lbl">Email:</span><span class="val">${bill.companyEmail}</span></div>` : ""}
        </div>
        <div class="to-col">
          <div class="col-title">To <span>(Client)</span></div>
          ${bill.clientName    ? `<div class="info-line"><span class="lbl">Name:</span><span class="val">${bill.clientName}</span></div>` : `<div class="info-line"><span class="lbl">Name:</span><span class="val">N/A</span></div>`}
          ${bill.clientAddress ? `<div class="info-line"><span class="lbl">Address:</span><span class="val">${bill.clientAddress}</span></div>` : ""}
          ${bill.clientGST     ? `<div class="info-line"><span class="lbl">GST:</span><span class="val">${bill.clientGST}</span></div>` : ""}
          ${bill.clientPhone   ? `<div class="info-line"><span class="lbl">Phone:</span><span class="val">${bill.clientPhone}</span></div>` : ""}
          ${bill.clientEmail   ? `<div class="info-line"><span class="lbl">Email:</span><span class="val">${bill.clientEmail}</span></div>` : ""}
        </div>
      </div>

      <div class="project-section">
        <div class="section-heading">Project Details</div>
        <div class="project-grid">
          <div class="proj-row"><span class="proj-lbl">Project:</span><span class="proj-val">${bill.projectName || "N/A"}</span></div>
          ${bill.projectLocation ? `<div class="proj-row"><span class="proj-lbl">Location:</span><span class="proj-val">${bill.projectLocation}</span></div>` : ""}
          ${bill.workOrderNo     ? `<div class="proj-row"><span class="proj-lbl">Work Order:</span><span class="proj-val">${bill.workOrderNo}</span></div>` : ""}
        </div>
      </div>

      <table class="items-table">
        <colgroup>
          <col class="col-sno"/><col class="col-description"/>
          <col class="col-hsn"/><col class="col-unit"/>
          <col class="col-qty"/><col class="col-rate"/><col class="col-amount"/>
        </colgroup>
        <thead>
          <tr>
            <th class="text-center">S.No</th><th>Description</th>
            <th class="text-center">HSN/SAC</th><th class="text-center">Unit</th>
            <th class="text-right">Qty</th><th class="text-right">Rate</th>
            <th class="text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item, i) => `
            <tr>
              <td class="text-center">${String(i + 1).padStart(2, "0")}</td>
              <td>${item.description || "N/A"}</td>
              <td class="text-center">${item.HSN || "-"}</td>
              <td class="text-center">${item.unit || "Nos"}</td>
              <td class="text-right">${Number(item.quantity || 0).toFixed(2)}</td>
              <td class="text-right">₹ ${Number(item.rate || 0).toFixed(2)}</td>
              <td class="text-right">₹ ${Number(item.amount || 0).toFixed(2)}</td>
            </tr>`).join("")}
        </tbody>
      </table>

      <div class="summary-wrapper">
        <table class="summary-table">
          <tr><td class="s-label">Subtotal:</td><td class="s-value">₹ ${subtotal.toFixed(2)}</td></tr>
          ${bill.labourCharges    > 0 ? `<tr><td class="s-label">Labour Charges:</td><td class="s-value">₹ ${Number(bill.labourCharges).toFixed(2)}</td></tr>` : ""}
          ${bill.transportCharges > 0 ? `<tr><td class="s-label">Transport Charges:</td><td class="s-value">₹ ${Number(bill.transportCharges).toFixed(2)}</td></tr>` : ""}
          ${bill.otherCharges     > 0 ? `<tr><td class="s-label">Other Charges${bill.otherChargesDescription ? " (" + bill.otherChargesDescription + ")" : ""}:</td><td class="s-value">₹ ${Number(bill.otherCharges).toFixed(2)}</td></tr>` : ""}
          ${(bill.labourCharges > 0 || bill.transportCharges > 0 || bill.otherCharges > 0)
            ? `<tr class="subtotal-row"><td class="s-label"><strong>Gross Amount:</strong></td><td class="s-value"><strong>₹ ${grossAmount.toFixed(2)}</strong></td></tr>` : ""}
          ${cgstPercent > 0 ? `<tr><td class="s-label">CGST Amount (${cgstPercent}%):</td><td class="s-value">₹ ${cgst.toFixed(2)}</td></tr>` : ""}
          ${sgstPercent > 0 ? `<tr><td class="s-label">SGST Amount (${sgstPercent}%):</td><td class="s-value">₹ ${sgst.toFixed(2)}</td></tr>` : ""}
          ${igstPercent > 0 ? `<tr><td class="s-label">IGST Amount (${igstPercent}%):</td><td class="s-value">₹ ${igst.toFixed(2)}</td></tr>` : ""}
          ${(cgstPercent > 0 || sgstPercent > 0 || igstPercent > 0)
            ? `<tr><td class="s-label">Total Tax:</td><td class="s-value">₹ ${(cgst + sgst + igst).toFixed(2)}</td></tr>` : ""}
          <tr class="total-row">
            <td><strong>Total with Tax:</strong></td>
            <td style="text-align:right;"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td>
          </tr>
          ${billType === "invoice" ? `
            ${tdsPercent       > 0 ? `<tr class="deduction-row"><td class="s-label">TDS (${tdsPercent}%):</td><td class="s-value">- ₹ ${tds.toFixed(2)}</td></tr>` : ""}
            ${retentionPercent > 0 ? `<tr class="deduction-row"><td class="s-label">Retention (${retentionPercent}%):</td><td class="s-value">- ₹ ${retention.toFixed(2)}</td></tr>` : ""}
            ${bill.advancePaid  > 0 ? `<tr class="deduction-row"><td class="s-label">Advance Paid:</td><td class="s-value">- ₹ ${Number(bill.advancePaid).toFixed(2)}</td></tr>` : ""}
            ${bill.previousBills > 0 ? `<tr class="addition-row"><td class="s-label">Previous Bills:</td><td class="s-value">+ ₹ ${Number(bill.previousBills).toFixed(2)}</td></tr>` : ""}
            <tr class="net-payable-row">
              <td><strong>FINAL TOTAL:</strong></td>
              <td style="text-align:right;"><strong>₹ ${netPayable.toFixed(2)}</strong></td>
            </tr>
          ` : `
            <tr class="net-payable-row">
              <td><strong>FINAL TOTAL:</strong></td>
              <td style="text-align:right;"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td>
            </tr>
          `}
        </table>
      </div>

      ${billType === "quotation" && bill.advancePaid > 0 ? `
        <div class="additional-info" style="background:#e3f2fd;border-left:3px solid #2196f3;">
          <h4 style="color:#1565c0;">Payment Information</h4>
          <p><strong>Advance to be Paid:</strong> ₹ ${Number(bill.advancePaid).toFixed(2)}</p>
        </div>` : ""}

      ${bill.remarks ? `<div class="additional-info"><h4>Remarks</h4><p>${bill.remarks}</p></div>` : ""}

      ${bill.termsAndConditions ? `
        <div class="additional-info tc-inline">
          <div class="section-heading" style="margin-bottom:8px;">Terms &amp; Conditions</div>
          <p>${bill.termsAndConditions}</p>
        </div>` : ""}

      <div class="bottom-area">
        <div class="terms-note">
          This is a computer-generated ${billType === "quotation" ? "quotation" : "invoice"} and does not require a physical signature.<br>
          Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </div>
        <div class="signature-box">
          <div style="height:38px;"></div>
          <div class="signature-line"></div>
          <div class="signature-label">Authorised Sign</div>
        </div>
      </div>
    </div>`;

  // ─── Full HTML document ───────────────────────────────────────────────────
  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${billType === "quotation" ? "Quotation" : "Invoice"} - ${billNumber}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    /* ============================================================
       PRINT
       ============================================================ */
    @media print {
      @page { size: A4 portrait; margin: 10mm 12mm; }
      html, body {
        margin: 0 !important; padding: 0 !important;
        background: white !important;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 12px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
        width: 100% !important;
      }
      /* Hide screen shell; show only the hidden print wrapper */
      .screen-toolbar,
      #screenScroll       { display: none !important; }
      #printOnlyWrapper   { display: block !important; }

      table.items-table tr   { break-inside: avoid !important; page-break-inside: avoid !important; }
      table.items-table thead { display: table-header-group; }
      .tc-inline { page-break-inside: auto; }
    }

    /* ============================================================
       RESET
       ============================================================ */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    /* ============================================================
       SCREEN — dark scaffold
       ============================================================ */
    body { font-family: 'Segoe UI', Arial, sans-serif; background: #606060; }

    .screen-toolbar {
      position: fixed; top: 0; left: 0; right: 0; height: 50px;
      background: #1a1a1a;
      display: flex; align-items: center; justify-content: flex-end;
      padding: 0 20px; z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,.5);
    }
    .print-btn {
      background: #f5b800; color: #000;
      padding: 9px 22px; border: none; border-radius: 3px;
      cursor: pointer; font-size: 13px; font-weight: 700;
      display: inline-flex; align-items: center; gap: 7px;
      letter-spacing: 0.3px; transition: background .2s;
    }
    .print-btn:hover { background: #ffd033; }

    /* ============================================================
       SCREEN SCROLL AREA
       ============================================================ */
    #screenScroll {
      margin-top: 50px;
      padding: 28px 0 48px;
      display: flex; flex-direction: column; align-items: center;
      gap: 22px;
    }

    /* ============================================================
       A4 CARD — 794 × 1123 px (96 dpi)
       Each card is an exact A4 sheet. Content is measured after
       render and distributed across cards by the JS paginator.
       ============================================================ */
    .a4-card {
      background: white;
      width: 794px;
      height: 1123px;           /* hard A4 height — no min-height */
      overflow: hidden;         /* never overflow the card boundary */
      box-shadow: 0 3px 18px rgba(0,0,0,.45);
      position: relative;
      display: flex;
      flex-direction: column;
      font-size: 12px;
    }

    /* page-body scrolls virtually; footer is always pinned at bottom */
    .a4-card .page-body   { flex: 1; overflow: hidden; position: relative; }
    .a4-card .doc-footer  { flex-shrink: 0; }

    /* badge */
    .page-badge {
      text-align: right; font-size: 9px; color: #999;
      letter-spacing: .4px; user-select: none;
      padding: 3px 10px 0;
    }

    /* ============================================================
       MEASUREMENT SANDBOX — off-screen, full width, no height cap
       ============================================================ */
    #measureSandbox {
      position: fixed;
      top: 0; left: -9999px;
      width: 794px;
      visibility: hidden;
      pointer-events: none;
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 12px;
      background: white;
    }

    /* ============================================================
       HEADER
       ============================================================ */
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 18px 22px 16px 22px;
      border-bottom: 3px solid #f5b800;
      background: #fff;
      overflow: hidden; position: relative;
    }
    .header::after {
      content: "";
      position: absolute; top: 0; right: 0;
      width: 80px; height: 50px;
      background: linear-gradient(135deg, transparent 40%, #1a1a1a 40%, #1a1a1a 65%, #f5b800 65%);
      pointer-events: none; z-index: 0;
    }
    .logo-area  { display: flex; align-items: center; gap: 10px; z-index: 2; flex: 1; }
    .logo-box   { width: 52px; height: 52px; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0; }
    .logo-box img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .company-name-header { font-size: 20px; font-weight: 800; color: #1a1a1a; letter-spacing: 1px; text-transform: uppercase; }
    .header-right { flex-shrink: 0; text-align: right; z-index: 2; position: relative; padding-left: 20px; }
    .doc-title  { font-size: 26px; font-weight: 800; color: #f5b800; letter-spacing: 2px; text-transform: uppercase; line-height: 1; margin-bottom: 10px; margin-right: 90px; }
    .bill-meta  { font-size: 11.5px; color: #555; line-height: 2; }
    .bill-meta .meta-row   { display: flex; justify-content: flex-end; align-items: center; gap: 8px; }
    .bill-meta .meta-label { color: #777; font-weight: 500; white-space: nowrap; }
    .bill-meta .meta-value { color: #111; font-weight: 600; border-bottom: 1px solid #ccc; min-width: 110px; text-align: right; padding-bottom: 1px; white-space: nowrap; }

    /* ============================================================
       BODY CONTENT
       ============================================================ */
    .body-content { padding: 16px 22px; }

    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 0; margin-bottom: 14px; border: 1px solid #e0e0e0; }
    .from-col, .to-col { padding: 12px 14px; }
    .from-col { border-right: 1px solid #e0e0e0; }
    .col-title { font-size: 12.5px; font-weight: 700; color: #1a1a1a; margin-bottom: 8px; padding-bottom: 5px; border-bottom: 2px solid #f5b800; text-transform: uppercase; letter-spacing: 0.5px; }
    .col-title span { color: #f5b800; }
    .info-line { display: flex; gap: 6px; font-size: 11.5px; color: #555; margin-bottom: 4px; line-height: 1.5; }
    .info-line .lbl { color: #888; font-weight: 500; min-width: 56px; }
    .info-line .val { color: #222; font-weight: 600; }

    .project-section { margin-bottom: 14px; }
    .section-heading { font-size: 13px; font-weight: 800; color: #1a1a1a; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 2px solid #f5b800; display: inline-block; }
    .project-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 24px; font-size: 11.5px; color: #555; }
    .project-grid .proj-row  { display: flex; gap: 6px; align-items: baseline; }
    .project-grid .proj-lbl  { color: #888; font-weight: 500; min-width: 72px; }
    .project-grid .proj-val  { color: #222; font-weight: 600; }

    table.items-table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 12px; table-layout: fixed; }
    col.col-sno         { width: 6%;  }
    col.col-description { width: 34%; }
    col.col-hsn         { width: 10%; }
    col.col-unit        { width: 8%;  }
    col.col-qty         { width: 9%;  }
    col.col-rate        { width: 14%; }
    col.col-amount      { width: 19%; }
    table.items-table th { background: #f5b800; color: #1a1a1a; padding: 9px 8px; text-align: left; font-weight: 700; text-transform: uppercase; font-size: 11px; letter-spacing: 0.3px; }
    table.items-table td { border: 1px solid #e8e8e8; padding: 9px 8px; color: #444; word-wrap: break-word; overflow-wrap: break-word; }
    table.items-table tbody tr:nth-child(even) { background: #fafafa; }
    table.items-table tbody tr:nth-child(odd)  { background: #fff;    }

    .summary-wrapper { display: flex; justify-content: flex-end; margin-bottom: 14px; }
    table.summary-table { width: 55%; border-collapse: collapse; font-size: 12px; }
    table.summary-table td { padding: 6px 10px; border-bottom: 1px solid #eee; }
    table.summary-table tr:last-child td { border-bottom: none; }
    table.summary-table .s-label { font-weight: 500; color: #555; width: 65%; }
    table.summary-table .s-value { text-align: right; font-weight: 600; color: #333; white-space: nowrap; }
    table.summary-table .subtotal-row td { border-top: 2px solid #ddd; background: #f9f9f9; font-weight: 700; color: #111; }
    .total-row { background: #2a2a2a !important; }
    .total-row td { color: #fff !important; padding: 8px 10px !important; border-bottom: none !important; font-weight: 700 !important; font-size: 12.5px; }
    .net-payable-row { background: #f5b800 !important; }
    .net-payable-row td { color: #111 !important; padding: 10px !important; font-size: 14px; font-weight: 800 !important; letter-spacing: 0.3px; border-bottom: none !important; }
    .deduction-row td { color: #c0392b !important; }
    .addition-row  td { color: #1a7d2e !important; }

    .additional-info { margin-bottom: 12px; padding: 10px 12px; background: #fafafa; border-left: 3px solid #f5b800; font-size: 12px; }
    .additional-info h4 { font-size: 12px; color: #1a1a1a; margin-bottom: 5px; text-transform: uppercase; letter-spacing: .5px; font-weight: 700; }
    .additional-info p  { font-size: 12px; color: #555; line-height: 1.6; white-space: pre-wrap; word-wrap: break-word; }
    .tc-inline { margin-top: 14px; margin-bottom: 14px; }
    .tc-inline .section-heading { display: block; margin-bottom: 8px; }

    .bottom-area { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 20px; padding-top: 12px; border-top: 1px solid #eee; }
    .terms-note    { font-size: 10.5px; color: #999; font-style: italic; max-width: 55%; line-height: 1.5; }
    .signature-box { text-align: center; min-width: 160px; }
    .signature-line  { border-top: 2px solid #1a1a1a; margin-bottom: 6px; }
    .signature-label { font-size: 12px; color: #444; font-weight: 600; letter-spacing: 0.3px; }

    .doc-footer { background: #1a1a1a; color: #fff; padding: 12px 22px; display: flex; justify-content: space-between; align-items: center; font-size: 11.5px; }
    .doc-footer .footer-contact { display: flex; align-items: center; gap: 18px; }
    .doc-footer .contact-item   { display: flex; align-items: center; gap: 6px; color: #ccc; }
    .doc-footer .contact-item .icon { width: 20px; height: 20px; border-radius: 50%; background: #f5b800; display: flex; align-items: center; justify-content: center; font-size: 10px; color: #1a1a1a; font-weight: 700; flex-shrink: 0; }
    .doc-footer .tagline { font-size: 12px; font-weight: 600; color: #f5b800; letter-spacing: 0.5px; text-transform: uppercase; }

    .text-right  { text-align: right;  }
    .text-center { text-align: center; }
  </style>
</head>
<body>

  <!-- SCREEN TOOLBAR -->
  <div class="screen-toolbar">
    <button class="print-btn" onclick="window.print()">
      🖨️ Print ${billType === "quotation" ? "Quotation" : "Invoice"}
    </button>
  </div>

  <!-- OFF-SCREEN MEASUREMENT SANDBOX -->
  <div id="measureSandbox"></div>

  <!-- SCREEN PAGE CARDS — built dynamically by paginator -->
  <div id="screenScroll"></div>

  <!-- PRINT-ONLY WRAPPER — single continuous flow, browser paginates -->
  <div id="printOnlyWrapper" style="display:none;">
    <div style="font-family:'Segoe UI',Arial,sans-serif; font-size:12px;">
      ${headerHTML}
      ${mainBodyHTML}
      ${footerHTML}
    </div>
  </div>

  <script>
  (function () {

    /* ================================================================
       CONSTANTS
       A4 at 96 dpi = 794 × 1123 px
       Footer height ≈ 46 px (measured once)
       Header height: measured per card (first card has full header;
       continuation cards repeat the header for context)
       ================================================================ */
    var A4_W = 794;
    var A4_H = 1123;

    /* ----------------------------------------------------------------
       Measure an HTML string in the sandbox, return its rendered height
       ---------------------------------------------------------------- */
    function measureHTML(html) {
      var sandbox = document.getElementById('measureSandbox');
      sandbox.innerHTML = html;
      var h = sandbox.scrollHeight;
      sandbox.innerHTML = '';
      return h;
    }

    /* ----------------------------------------------------------------
       Build a footer element and return [element, height]
       ---------------------------------------------------------------- */
    var footerHTML = ${JSON.stringify(footerHTML)};
    var headerHTML = ${JSON.stringify(headerHTML)};

    function makeFooter() {
      var el = document.createElement('div');
      el.innerHTML = footerHTML;
      return el.firstElementChild;
    }
    function makeHeader() {
      var el = document.createElement('div');
      el.innerHTML = headerHTML;
      return el.firstElementChild;
    }

    /* ----------------------------------------------------------------
       Measure fixed heights once
       ---------------------------------------------------------------- */
    var footerHeight = measureHTML(footerHTML);
    var headerHeight = measureHTML(headerHTML);
    // Badge row: 14 px
    var BADGE_H = 14;

    /* ----------------------------------------------------------------
       Build the screen preview cards
       ---------------------------------------------------------------- */
    window.addEventListener('load', function () {

      // 1. Render the full body-content into the sandbox to get a live
      //    DOM we can slice children from.
      var sandbox = document.getElementById('measureSandbox');
      sandbox.innerHTML = ${JSON.stringify(mainBodyHTML)};
      var bodyContent = sandbox.querySelector('#mainBody');

      // Collect top-level children of .body-content (each is a "block")
      var blocks = Array.from(bodyContent.children);

      var scroll    = document.getElementById('screenScroll');
      var pageIndex = 0;        // 0-based page counter
      var pages     = [];       // array of { card, pageBody, usedHeight }

      /* ---- helper: create a fresh A4 card ---- */
      function newCard() {
        var card = document.createElement('div');
        card.className = 'a4-card';

        var badge = document.createElement('div');
        badge.className = 'page-badge';
        card.appendChild(badge);

        // header
        card.appendChild(makeHeader());

        // page-body container
        var pageBody = document.createElement('div');
        pageBody.className = 'page-body';
        var inner = document.createElement('div');
        inner.className = 'body-content';
        pageBody.appendChild(inner);
        card.appendChild(pageBody);

        // footer
        card.appendChild(makeFooter());

        scroll.appendChild(card);
        pageIndex++;

        // available height for content on this card
        var available = A4_H - BADGE_H - headerHeight - footerHeight - 32; // 32 = body padding top+bottom
        pages.push({ card: card, inner: inner, usedHeight: 0, available: available });
        return pages[pages.length - 1];
      }

      /* ---- start first card ---- */
      var current = newCard();

      /* ---- distribute blocks across cards ---- */
      blocks.forEach(function (block) {
        // Clone the block so we can measure it
        var clone = block.cloneNode(true);

        // Measure its height
        sandbox.innerHTML = '';
        var wrapper = document.createElement('div');
        wrapper.style.width = A4_W + 'px';
        wrapper.style.padding = '0 22px';
        wrapper.style.fontSize = '12px';
        wrapper.style.fontFamily = "'Segoe UI', Arial, sans-serif";
        wrapper.appendChild(clone.cloneNode(true));
        sandbox.appendChild(wrapper);
        var blockH = wrapper.scrollHeight;
        sandbox.innerHTML = '';

        // If it doesn't fit, open a new card
        if (current.usedHeight + blockH > current.available && current.usedHeight > 0) {
          current = newCard();
        }

        // Append original block (from sandbox DOM) to current card
        current.inner.appendChild(block.cloneNode(true));
        current.usedHeight += blockH;
      });

      /* ---- stamp page badges ---- */
      var total = pages.length;
      pages.forEach(function (p, i) {
        var badge = p.card.querySelector('.page-badge');
        if (badge) badge.textContent = 'Page ' + (i + 1) + ' of ' + total;
      });

      /* ---- clean up sandbox ---- */
      sandbox.innerHTML = '';
    });

    /* ----------------------------------------------------------------
       Print swap
       ---------------------------------------------------------------- */
    window.addEventListener('beforeprint', function () {
      document.getElementById('screenScroll').style.display = 'none';
      document.getElementById('printOnlyWrapper').style.display = 'block';
    });
    window.addEventListener('afterprint', function () {
      document.getElementById('screenScroll').style.display = '';
      document.getElementById('printOnlyWrapper').style.display = 'none';
    });

  })();
  </script>

</body>
</html>`);

  printWindow.document.close();
};