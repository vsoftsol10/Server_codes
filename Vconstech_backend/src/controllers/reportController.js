import PDFDocument from 'pdfkit';

/**
 * Generate Material Usage Report PDF
 * POST /api/reports/usage-pdf
 */
export const generateUsageReportPDF = async (req, res) => {
  try {
    const {
      projectName,
      generatedDate,
      generatedTime,
      usageLogs,
      totalEntries,
      grandTotal
    } = req.body;

    // Validation
    console.log('Received request body:', req.body);
    console.log('Usage logs count:', usageLogs?.length);
    
    if (!usageLogs || usageLogs.length === 0) {
      console.error('No usage logs provided');
      return res.status(400).json({ error: 'No usage logs provided' });
    }

    // Create a document
    const doc = new PDFDocument({
      size: 'A4',
      margins: {
        top: 50,
        bottom: 50,
        left: 50,
        right: 50
      }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${projectName.replace(/\s+/g, '_')}_Usage_Report_${new Date().toISOString().split('T')[0]}.pdf`
    );

    // Pipe the PDF to the response
    doc.pipe(res);

    // Colors
    const primaryColor = '#1e40af';
    const secondaryColor = '#3b82f6';
    const textColor = '#374151';
    const lightGray = '#f3f4f6';
    const borderColor = '#d1d5db';

    // ==================== HEADER ====================
    
    // Title
    doc
      .fontSize(24)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('MATERIAL USAGE REPORT', 50, 50, {
        align: 'center',
        width: 495
      });

    // Project Name
    doc
      .fontSize(16)
      .fillColor(secondaryColor)
      .text(projectName, {
        align: 'center'
      });

    doc.moveDown(0.5);

    // ==================== INFO BOX ====================
    
    const infoBoxY = doc.y + 10;
    const infoBoxHeight = 80;

    // Draw info box background
    doc
      .rect(50, infoBoxY, 495, infoBoxHeight)
      .fill(lightGray);
    
    doc
      .rect(50, infoBoxY, 495, infoBoxHeight)
      .stroke(borderColor);

    // Info content
    doc
      .fontSize(10)
      .fillColor(textColor)
      .font('Helvetica-Bold')
      .text('Report Generated:', 70, infoBoxY + 15, { continued: true })
      .font('Helvetica')
      .text(` ${generatedDate} at ${generatedTime}`, { continued: false });

    doc
      .font('Helvetica-Bold')
      .text('Total Entries:', 70, infoBoxY + 35, { continued: true })
      .font('Helvetica')
      .text(` ${totalEntries}`, { continued: false });

    doc
      .font('Helvetica-Bold')
      .text('Grand Total Cost:', 70, infoBoxY + 55, { continued: true })
      .font('Helvetica')
      .text(` ₹${grandTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`, { continued: false });

    // ==================== TABLE SECTION ====================
    
    // Section Header
    const tableStartY = infoBoxY + infoBoxHeight + 30;
    
    doc
      .fontSize(14)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('USAGE DETAILS', 50, tableStartY);

    // Table configuration
    const tableTop = tableStartY + 30;
    const tableLeft = 50;
    const tableWidth = 495;
    
    // Column widths (adjusted for better fit)
    const columns = [
      { key: 'date', label: 'Date', width: 60, x: 50 },
      { key: 'material', label: 'Material', width: 100, x: 110 },
      { key: 'category', label: 'Category', width: 70, x: 210 },
      { key: 'quantity', label: 'Qty', width: 40, x: 280 },
      { key: 'unit', label: 'Unit', width: 45, x: 320 },
      { key: 'rate', label: 'Rate (₹)', width: 60, x: 365 },
      { key: 'cost', label: 'Cost (₹)', width: 80, x: 425 }
    ];

    const rowHeight = 25;
    let currentY = tableTop;

    // Draw table header
    doc
      .rect(tableLeft, currentY, tableWidth, 30)
      .fill(primaryColor);

    doc
      .fontSize(9)
      .fillColor('#ffffff')
      .font('Helvetica-Bold');

    columns.forEach(col => {
      doc.text(
        col.label,
        col.x + 5,
        currentY + 10,
        {
          width: col.width - 10,
          align: 'center'
        }
      );
    });

    currentY += 30;

    // Draw data rows
    console.log('Processing usage logs for PDF...');
    
    usageLogs.forEach((log, index) => {
      console.log(`Processing log ${index + 1}:`, log);
      
      // Check if we need a new page
      if (currentY > 700) {
        doc.addPage();
        currentY = 50;
        
        // Redraw header on new page
        doc
          .rect(tableLeft, currentY, tableWidth, 30)
          .fill(primaryColor);

        doc
          .fontSize(9)
          .fillColor('#ffffff')
          .font('Helvetica-Bold');

        columns.forEach(col => {
          doc.text(col.label, col.x + 5, currentY + 10, {
            width: col.width - 10,
            align: 'center'
          });
        });
        
        currentY += 30;
      }

      // Alternating row background
      const bgColor = (index % 2 === 0) ? '#ffffff' : lightGray;
      doc
        .rect(tableLeft, currentY, tableWidth, rowHeight)
        .fill(bgColor);
      
      doc
        .rect(tableLeft, currentY, tableWidth, rowHeight)
        .stroke(borderColor);

      // Set text style for data
      doc
        .fontSize(8)
        .fillColor(textColor)
        .font('Helvetica');

      // Date
      doc.text(
        log.date || 'N/A',
        columns[0].x + 5,
        currentY + 8,
        { width: columns[0].width - 10, align: 'center', lineBreak: false }
      );

      // Material Name
      const materialName = log.materialName || 'N/A';
      doc.text(
        materialName.length > 18 ? materialName.substring(0, 15) + '...' : materialName,
        columns[1].x + 5,
        currentY + 8,
        { width: columns[1].width - 10, align: 'left', lineBreak: false }
      );

      // Category
      doc.text(
        log.category || 'N/A',
        columns[2].x + 5,
        currentY + 8,
        { width: columns[2].width - 10, align: 'center', lineBreak: false }
      );

      // Quantity
      doc.text(
        log.quantity ? log.quantity.toFixed(2) : '0.00',
        columns[3].x + 5,
        currentY + 8,
        { width: columns[3].width - 10, align: 'right', lineBreak: false }
      );

      // Unit
      doc.text(
        log.unit || 'unit',
        columns[4].x + 5,
        currentY + 8,
        { width: columns[4].width - 10, align: 'center', lineBreak: false }
      );

      // Rate
      doc.text(
        log.rate ? log.rate.toFixed(2) : '0.00',
        columns[5].x + 5,
        currentY + 8,
        { width: columns[5].width - 10, align: 'right', lineBreak: false }
      );

      // Cost
      doc.text(
        log.cost ? log.cost.toFixed(2) : '0.00',
        columns[6].x + 5,
        currentY + 8,
        { width: columns[6].width - 10, align: 'right', lineBreak: false }
      );

      currentY += rowHeight;
    });

    // ==================== SUMMARY SECTION ====================

currentY += 15;

// Summary box background
doc
  .rect(tableLeft, currentY, tableWidth, 60)
  .fill(primaryColor);

// Now draw the text ON TOP of the background
doc
  .fontSize(12)
  .fillColor('#ffffff')
  .font('Helvetica-Bold')
  .text('SUMMARY', tableLeft + 20, currentY + 15, { lineBreak: false });

doc
  .fontSize(10)
  .font('Helvetica')
  .text(
    `Total Entries: ${totalEntries}`,
    tableLeft + 20,
    currentY + 35,
    { lineBreak: false }
  );

// Grand Total - positioned on the right side
doc
  .fontSize(14)
  .font('Helvetica-Bold')
  .text(
    `GRAND TOTAL: ₹${grandTotal.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`,
    tableLeft + 200,
    currentY + 32,
    { 
      width: 275,
      align: 'right',
      lineBreak: false 
    }
  );

    // ==================== FOOTER ====================
    
    const pageHeight = doc.page.height;
    doc
      .fontSize(8)
      .fillColor('#6b7280')
      .font('Helvetica')
      .text(
        `Generated on ${generatedDate} at ${generatedTime} | Material Management System`,
        50,
        pageHeight - 30,
        { align: 'center', width: 495 }
      );

    // Finalize the PDF
    doc.end();
    
    console.log('PDF generation completed successfully');

  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate PDF report', details: error.message });
    }
  }
};