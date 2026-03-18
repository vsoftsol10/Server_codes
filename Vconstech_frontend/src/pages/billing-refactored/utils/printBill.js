// printBill.js - Fixed Print Alignment + Summary Table

export const printBill = (bill) => {
  if (!bill) {
    alert("Invalid bill data");
    return;
  }

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
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const billNumber    = bill.billId || bill.billNumber || "N/A";
  const billDate      = formatDate(bill.billDate);
  const dueDate       = formatDate(bill.dueDate);
  const billType      = bill.billType || "invoice";
  const documentTitle = billType === "quotation" ? "QUOTATION" : "TAX INVOICE";

  const companyLogo =
    bill.company?.logo || bill.companyLogo || bill.user?.company?.logo || null;

  let API_BASE_URL = "http://https://test.vconstech.in";
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    API_BASE_URL = import.meta.env.VITE_API_URL.replace("/api", "");
  } else if (typeof process !== "undefined" && process.env?.VITE_API_URL) {
    API_BASE_URL = process.env.VITE_API_URL.replace("/api", "");
  }

  const subtotal     = items.reduce((sum, item) => sum + Number(item?.amount || 0), 0);
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

  const netPayable =
    billType === "quotation"
      ? totalWithTax - tds - retention + advance + Number(bill?.previousBills || 0)
      : totalWithTax - tds - retention - advance + Number(bill?.previousBills || 0);

  printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <title>${billType === "quotation" ? "Quotation" : "Invoice"} - ${billNumber}</title>
  <style>
    /* =============================================================
       PRINT STYLES
       Key fixes:
       1. @page margin: 0  →  removes browser date/title/page-num headers
       2. body padding handles margins instead
       3. Single content div flows naturally — browser handles page breaks
       4. No min-height anywhere in print
       ============================================================= */
    @media print {
      /* margin:0 + named margin boxes = no browser date/URL/page headers */
      @page {
        size: A4 portrait;
        margin: 12mm 14mm;
      }
      @top-left    { content: ""; }
      @top-center  { content: ""; }
      @top-right   { content: ""; }
      @bottom-left { content: ""; }
      @bottom-center { content: ""; }
      @bottom-right  { content: ""; }

      html, body {
        margin: 0 !important;
        padding: 0 !important;
        background: white !important;
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 13px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        color-adjust: exact;
      }

      .screen-toolbar,
      .page-badge,
      .screen-scroll-wrapper {
        display: none !important;
      }

      /*
        .print-content uses padding to simulate page margins.
        Since @page margin is 0, we add padding here.
        Left/right padding applies to every line on every page.
        Top padding applies once (page 1 top).
        For subsequent page tops — we accept the 0 top gap since
        @page named boxes are cleared, keeping content flush but clean.
        A repeating top margin is NOT achievable with padding alone;
        it requires @page margin which brings back browser headers.
        Compromise: use 10mm top padding so page 1 looks good, and
        accept that page 2+ starts right at the top edge.
        To fix page 2 top: we use a large enough font/line-height so
        content doesn't start at the absolute edge visually.
      */
      .print-content {
        display: block !important;
        width: 210mm !important;
        padding: 0 !important;
        margin: 0 !important;
        box-sizing: border-box !important;
      }

      /* ── Items table: allow natural row breaks ── */
      table.items-table tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      table.items-table thead {
        display: table-header-group;
      }

      /* ── Summary: flow naturally, only rows stay intact ── */
      .summary-wrapper {
        display: block !important;
        width: 100% !important;
        /* NO break-inside avoid — let it flow after the table */
      }
      .summary-heading {
        break-after: avoid !important;
        page-break-after: avoid !important;
      }
      table.summary-table {
        width: 100% !important;
      }
      table.summary-table tr {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .total-row,
      .net-payable-row {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* ── Small blocks: keep together ── */
      .header {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .additional-info {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .signature-box {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .footer {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }

      /* ── Let two-column and info sections flow ── */
      .two-column,
      .info-section {
        break-inside: auto !important;
        page-break-inside: auto !important;
      }
    }

    /* =============================================================
       RESET
       ============================================================= */
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

    /* =============================================================
       SCREEN — PDF viewer shell
       ============================================================= */
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #606060;
    }

    /* Print-only div is hidden on screen */
    .print-content {
      display: none;
    }

    .screen-toolbar {
      position: fixed;
      top: 0; left: 0; right: 0; height: 50px;
      background: #3c3c3c;
      display: flex; align-items: center; justify-content: flex-end;
      padding: 0 20px;
      z-index: 1000;
      box-shadow: 0 2px 8px rgba(0,0,0,.5);
    }

    .print-btn {
      background: #ffbe2a; color: #000;
      padding: 9px 22px; border: none; border-radius: 4px;
      cursor: pointer; font-size: 13px; font-weight: 700;
      display: inline-flex; align-items: center; gap: 7px;
      transition: background .2s;
    }
    .print-btn:hover { background: #ffd166; }

    .screen-scroll-wrapper {
      margin-top: 50px;
      padding: 28px 0 48px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    /* A4 page card — screen only */
    .a4-card {
      background: white;
      width: 210mm;
      min-height: 297mm;
      padding: 12mm 15mm;
      box-shadow: 0 3px 18px rgba(0,0,0,.45);
      position: relative;
      margin-bottom: 22px;
    }

    .page-badge {
      position: absolute; top: 5mm; right: 6mm;
      font-size: 9px; color: #aaa;
      letter-spacing: .4px; user-select: none;
    }

    /* =============================================================
       SHARED CONTENT STYLES  (used in both .a4-card and .print-content)
       ============================================================= */

    /* Header */
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 4px solid #ffbe2a;
      padding-bottom: 18px; margin-bottom: 22px;
    }
    .logo-placeholder {
      width: 120px; height: 120px;
      display: flex; align-items: center; justify-content: center; overflow: hidden;
      flex-shrink: 0;
    }
    .logo-placeholder img { max-width: 100%; max-height: 100%; object-fit: contain; }
    .header-center { flex: 1; text-align: center; padding: 0 16px; }
    .header-center h1 { font-size: 36px; color: #333; letter-spacing: 2px; font-weight: 700; }
    .header-right { flex-shrink: 0; text-align: right; min-width: 175px; }

    .bill-details {
      background: #f9f9f9; padding: 11px 13px;
      border-left: 4px solid #ffbe2a; border-radius: 3px;
    }
    .bill-details p {
      margin: 6px 0; font-size: 14px; color: #555;
      display: flex; justify-content: space-between; gap: 12px;
    }
    .bill-details strong { color: #333; font-weight: 600; min-width: 72px; }
    .bill-details .value { color: #000; font-weight: 600; }

    /* Info sections */
    .info-section {
      margin-bottom: 16px; padding: 11px 13px;
      background: #f9f9f9; border-left: 4px solid #ffbe2a;
    }
    .section-title {
      font-weight: 700; font-size: 13px; color: #333;
      text-transform: uppercase; margin-bottom: 9px; letter-spacing: 1px;
    }
    .info-section p { margin: 4px 0; font-size: 13px; color: #555; line-height: 1.5; }
    .info-section strong { color: #333; font-weight: 600; }
    .two-column {
      display: grid; grid-template-columns: 1fr 1fr;
      gap: 14px; margin-bottom: 16px;
    }

    /* Items table */
    table.items-table {
      width: 100%; border-collapse: collapse;
      margin: 14px 0 0; font-size: 14px; table-layout: fixed;
    }
    col.col-sno         { width: 5%;  }
    col.col-description { width: 35%; }
    col.col-hsn         { width: 10%; }
    col.col-unit        { width: 8%;  }
    col.col-qty         { width: 9%;  }
    col.col-rate        { width: 14%; }
    col.col-amount      { width: 19%; }

    table.items-table th {
      background: #333; color: white;
      padding: 10px 8px; text-align: left;
      font-weight: 600; text-transform: uppercase; font-size: 11px; letter-spacing: .4px;
      word-wrap: break-word;
    }
    table.items-table td {
      border: 1px solid #ddd; padding: 11px 9px; color: #555;
      word-wrap: break-word; overflow-wrap: break-word;
    }
    table.items-table tbody tr:nth-child(even) { background: #f9f9f9; }

    /* Summary wrapper — full width block */
    .summary-wrapper {
      display: block;
      width: 100%;
      margin-top: 18px;
    }

    /* Summary heading */
    .summary-heading {
      font-weight: 700; font-size: 13px; color: #333;
      text-transform: uppercase; letter-spacing: 1px;
      padding: 9px 13px;
      background: #f9f9f9;
      border-left: 4px solid #ffbe2a;
      margin-bottom: 0;
    }

    /* Summary table — full width, bordered */
    table.summary-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
      border: 1px solid #ddd;
    }
    table.summary-table td {
      padding: 12px 16px;
      border-bottom: 1px solid #eee;
    }
    table.summary-table tr:last-child td { border-bottom: none; }
    table.summary-table .label { font-weight: 500; color: #555; width: 75%; }
    table.summary-table .value { text-align: right; font-weight: 600; color: #333; width: 25%; white-space: nowrap; }
    table.summary-table .subtotal-row td { border-top: 2px solid #ddd; background: #f9f9f9; }

    .total-row { background: #333 !important; }
    .total-row td {
      color: #fff !important; padding: 10px 12px !important;
      border-bottom: none !important; font-size: 15px;
    }
    .net-payable-row { background: #ffbe2a !important; }
    .net-payable-row td {
      color: #000 !important; padding: 12px !important;
      font-size: 16px; font-weight: 700 !important;
    }

    /* Additional info */
    .additional-info {
      margin-top: 18px; padding: 11px 13px;
      background: #f9f9f9; border-left: 4px solid #ffbe2a;
    }
    .additional-info h4 {
      font-size: 13px; color: #333; margin-bottom: 6px;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .additional-info p {
      font-size: 13px; color: #555; line-height: 1.6;
      white-space: pre-wrap; word-wrap: break-word;
    }

    /* Signature */
    .signature-box { width: 220px; margin-left: auto; margin-top: 55px; text-align: center; }
    .signature-line { border-top: 2px solid #333; margin-top: 38px; margin-bottom: 7px; }
    .signature-label { font-size: 13px; color: #666; font-weight: 600; }

    /* Footer */
    .footer {
      margin-top: 24px; text-align: center;
      padding-top: 14px; border-top: 2px solid #eee;
    }
    .footer p { font-size: 12px; color: #999; font-style: italic; margin: 2px 0; }

    .text-right  { text-align: right;  }
    .text-center { text-align: center; }
  </style>
</head>
<body>

  <!-- ============================================================
       SCREEN TOOLBAR (hidden on print)
       ============================================================ -->
  <div class="screen-toolbar">
    <button class="print-btn" onclick="window.print()">
      🖨️ Print ${billType === "quotation" ? "Quotation" : "Invoice"}
    </button>
  </div>

  <!-- ============================================================
       SCREEN PREVIEW  (hidden on print via .screen-scroll-wrapper)
       JS splits #page1 into multiple A4 cards after load
       ============================================================ -->
  <div class="screen-scroll-wrapper" id="screenScroll">
    <div class="a4-card" id="page1">
      <span class="page-badge" id="badge1">Page 1</span>
      <div id="invoiceContent">
        ${invoiceHTML(bill, billNumber, billDate, dueDate, billType, documentTitle, companyLogo, API_BASE_URL, items, subtotal, grossAmount, cgstPercent, sgstPercent, igstPercent, cgst, sgst, igst, totalWithTax, tdsPercent, retentionPercent, tds, retention, advance, netPayable)}
      </div>
    </div>
  </div>

  <!-- ============================================================
       PRINT-ONLY CONTENT  (hidden on screen, shown on print)
       This is a clean single div — no A4 card wrappers, no JS splitting.
       The browser flows it naturally across A4 pages.
       ============================================================ -->
  <div class="print-content" id="printContent">
    ${invoiceHTML(bill, billNumber, billDate, dueDate, billType, documentTitle, companyLogo, API_BASE_URL, items, subtotal, grossAmount, cgstPercent, sgstPercent, igstPercent, cgst, sgst, igst, totalWithTax, tdsPercent, retentionPercent, tds, retention, advance, netPayable)}
  </div>

  <script>
  /* ── inline template helper — defined before use ── */
  /* (the HTML was pre-rendered server-side in the template literal above) */

  /* ============================================================
     SCREEN-ONLY PAGINATOR
     Splits #page1 into multiple A4 cards for the preview.
     Print uses .print-content exclusively — this never affects print.
     ============================================================ */
  (function () {
    function mmToPx(mm) {
      const d = document.createElement('div');
      d.style.cssText = 'position:absolute;visibility:hidden;width:' + mm + 'mm';
      document.body.appendChild(d);
      const px = d.offsetWidth;
      document.body.removeChild(d);
      return px;
    }

    window.addEventListener('load', function () {
      const A4_H  = mmToPx(297);
      const PAD_V = mmToPx(12) * 2;
      const AVAIL = A4_H - PAD_V;

      const scroll  = document.getElementById('screenScroll');
      const page1   = document.getElementById('page1');
      const content = document.getElementById('invoiceContent');

      // Collect direct children of invoiceContent
      const allChildren = Array.from(content.children);
      allChildren.forEach(el => content.removeChild(el));

      let pageNum     = 1;
      let currentContent = content;
      let usedH       = 0;

      function makeCard(num) {
        const card = document.createElement('div');
        card.className = 'a4-card';
        card.id = 'page' + num;

        const badge = document.createElement('span');
        badge.className = 'page-badge';
        badge.id = 'badge' + num;
        card.appendChild(badge);

        const inner = document.createElement('div');
        card.appendChild(inner);
        scroll.appendChild(card);
        return inner;
      }

      for (const child of allChildren) {
        currentContent.appendChild(child);
        void currentContent.offsetHeight;
        const h = child.getBoundingClientRect().height;

        if (usedH > 0 && usedH + h > AVAIL) {
          currentContent.removeChild(child);
          pageNum++;
          currentContent = makeCard(pageNum);
          usedH = 0;
          currentContent.appendChild(child);
        }
        usedH += h;
      }

      // Update badges
      for (let i = 1; i <= pageNum; i++) {
        const b = document.getElementById(i === 1 ? 'badge1' : 'badge' + i);
        if (b) b.textContent = 'Page ' + i + ' of ' + pageNum;
      }
    });
  })();
  </script>

</body>
</html>`);

  printWindow.document.close();
};

/* ================================================================
   SHARED HTML BUILDER — renders once for screen, once for print
   ================================================================ */
function invoiceHTML(
  bill, billNumber, billDate, dueDate, billType, documentTitle,
  companyLogo, API_BASE_URL, items,
  subtotal, grossAmount,
  cgstPercent, sgstPercent, igstPercent,
  cgst, sgst, igst, totalWithTax,
  tdsPercent, retentionPercent,
  tds, retention, advance, netPayable
) {
  return `
    <!-- HEADER -->
    <div class="header">
      <div class="logo-placeholder">
        ${companyLogo ? `<img src="${API_BASE_URL}${companyLogo}" alt="Company Logo" />` : ""}
      </div>
      <div class="header-center"><h1>${documentTitle}</h1></div>
      <div class="header-right">
        <div class="bill-details">
          <p>
            <strong>${billType === "quotation" ? "Quote No:" : "Invoice No:"}</strong>
            <span class="value">${billNumber}</span>
          </p>
          <p><strong>Date:</strong><span class="value">${billDate}</span></p>
          ${billType === "invoice" && dueDate !== "N/A"
            ? `<p><strong>Due Date:</strong><span class="value">${dueDate}</span></p>`
            : ""}
        </div>
      </div>
    </div>

    <!-- FROM / TO -->
    <div class="two-column">
      <div class="info-section">
        <div class="section-title">FROM (Contractor/Company)</div>
        <p><strong>${bill.companyName || "N/A"}</strong></p>
        ${bill.companyAddress ? `<p>${bill.companyAddress}</p>` : ""}
        ${bill.companyGST    ? `<p><strong>GST:</strong> ${bill.companyGST}</p>` : ""}
        ${bill.companyPhone  ? `<p><strong>Phone:</strong> ${bill.companyPhone}</p>` : ""}
        ${bill.companyEmail  ? `<p><strong>Email:</strong> ${bill.companyEmail}</p>` : ""}
      </div>
      <div class="info-section">
        <div class="section-title">TO (Client)</div>
        <p><strong>${bill.clientName || "N/A"}</strong></p>
        ${bill.clientAddress ? `<p>${bill.clientAddress}</p>` : ""}
        ${bill.clientGST    ? `<p><strong>GST:</strong> ${bill.clientGST}</p>` : ""}
        ${bill.clientPhone  ? `<p><strong>Phone:</strong> ${bill.clientPhone}</p>` : ""}
        ${bill.clientEmail  ? `<p><strong>Email:</strong> ${bill.clientEmail}</p>` : ""}
      </div>
    </div>

    <!-- PROJECT DETAILS -->
    <div class="info-section">
      <div class="section-title">PROJECT DETAILS</div>
      <p><strong>Project:</strong> ${bill.projectName || "N/A"}</p>
      ${bill.projectLocation ? `<p><strong>Location:</strong> ${bill.projectLocation}</p>` : ""}
      ${bill.workOrderNo ? `<p><strong>Work Order No:</strong> ${bill.workOrderNo}</p>` : ""}
    </div>

    <!-- ITEMS TABLE -->
    <table class="items-table">
      <colgroup>
        <col class="col-sno" /><col class="col-description" />
        <col class="col-hsn" /><col class="col-unit" />
        <col class="col-qty" /><col class="col-rate" /><col class="col-amount" />
      </colgroup>
      <thead>
        <tr>
          <th class="text-center">S.No</th>
          <th>Description of Work</th>
          <th class="text-center">HSN/SAC</th>
          <th class="text-center">Unit</th>
          <th class="text-right">Qty</th>
          <th class="text-right">Rate</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${items.map((item, i) => `
          <tr>
            <td class="text-center">${i + 1}</td>
            <td>${item.description || "N/A"}</td>
            <td class="text-center">${item.HSN || "-"}</td>
            <td class="text-center">${item.unit || "Nos"}</td>
            <td class="text-right">${Number(item.quantity || 0).toFixed(2)}</td>
            <td class="text-right">₹ ${Number(item.rate || 0).toFixed(2)}</td>
            <td class="text-right">₹ ${Number(item.amount || 0).toFixed(2)}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <!-- SUMMARY TABLE -->
    <div class="summary-wrapper">
      <div class="summary-heading">Amount Summary</div>
      <table class="summary-table">
        <tr>
          <td class="label">Subtotal (Items)</td>
          <td class="value">₹ ${subtotal.toFixed(2)}</td>
        </tr>
        ${bill.labourCharges    > 0 ? `<tr><td class="label">Labour Charges</td><td class="value">₹ ${Number(bill.labourCharges).toFixed(2)}</td></tr>` : ""}
        ${bill.transportCharges > 0 ? `<tr><td class="label">Transport Charges</td><td class="value">₹ ${Number(bill.transportCharges).toFixed(2)}</td></tr>` : ""}
        ${bill.otherCharges     > 0 ? `<tr><td class="label">Other Charges${bill.otherChargesDescription ? " (" + bill.otherChargesDescription + ")" : ""}</td><td class="value">₹ ${Number(bill.otherCharges).toFixed(2)}</td></tr>` : ""}
        <tr class="subtotal-row">
          <td class="label"><strong>Gross Amount</strong></td>
          <td class="value"><strong>₹ ${grossAmount.toFixed(2)}</strong></td>
        </tr>
        ${cgstPercent > 0 ? `<tr><td class="label">CGST (${cgstPercent}%)</td><td class="value">₹ ${cgst.toFixed(2)}</td></tr>` : ""}
        ${sgstPercent > 0 ? `<tr><td class="label">SGST (${sgstPercent}%)</td><td class="value">₹ ${sgst.toFixed(2)}</td></tr>` : ""}
        ${igstPercent > 0 ? `<tr><td class="label">IGST (${igstPercent}%)</td><td class="value">₹ ${igst.toFixed(2)}</td></tr>` : ""}
        <tr class="total-row">
          <td><strong>Total with Tax</strong></td>
          <td style="text-align:right;"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td>
        </tr>
        ${billType === "invoice" ? `
          ${tdsPercent       > 0 ? `<tr style="color:#d32f2f;"><td class="label">TDS (${tdsPercent}%)</td><td class="value">- ₹ ${tds.toFixed(2)}</td></tr>` : ""}
          ${retentionPercent > 0 ? `<tr style="color:#d32f2f;"><td class="label">Retention (${retentionPercent}%)</td><td class="value">- ₹ ${retention.toFixed(2)}</td></tr>` : ""}
          ${bill.advancePaid  > 0 ? `<tr style="color:#d32f2f;"><td class="label">Advance Paid</td><td class="value">- ₹ ${Number(bill.advancePaid).toFixed(2)}</td></tr>` : ""}
          ${bill.previousBills > 0 ? `<tr style="color:#2e7d32;"><td class="label">Previous Bills</td><td class="value">+ ₹ ${Number(bill.previousBills).toFixed(2)}</td></tr>` : ""}
          <tr class="net-payable-row">
            <td><strong>NET PAYABLE AMOUNT</strong></td>
            <td style="text-align:right;"><strong>₹ ${netPayable.toFixed(2)}</strong></td>
          </tr>
        ` : `
          <tr class="net-payable-row">
            <td><strong>TOTAL QUOTED AMOUNT</strong></td>
            <td style="text-align:right;"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td>
          </tr>
        `}
      </table>
    </div>

    ${billType === "quotation" && bill.advancePaid > 0 ? `
      <div class="additional-info" style="background:#e3f2fd;border-left:4px solid #2196f3;margin-top:18px;">
        <h4 style="color:#1565c0;">Payment Information</h4>
        <p style="font-size:13px;color:#333;"><strong>Advance to be Paid:</strong> ₹ ${Number(bill.advancePaid).toFixed(2)}</p>
      </div>
    ` : ""}

    ${bill.remarks ? `
      <div class="additional-info"><h4>Remarks</h4><p>${bill.remarks}</p></div>
    ` : ""}

    ${bill.termsAndConditions ? `
      <div class="additional-info"><h4>Terms &amp; Conditions</h4><p>${bill.termsAndConditions}</p></div>
    ` : ""}

    <div class="signature-box">
      <div class="signature-line"></div>
      <div class="signature-label">Authorized Signature</div>
    </div>

    <div class="footer">
      <p>This is a computer-generated ${billType === "quotation" ? "quotation" : "invoice"} and does not require a signature</p>
      <p>Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
    </div>
  `;
}