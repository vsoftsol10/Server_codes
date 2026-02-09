import React, { useState, useEffect } from "react";
import { FileText, Building2, User, Calendar, DollarSign, Phone, MapPin, Hash, FileSignature, Printer, Eye, Trash2 } from "lucide-react";
import Navbar from '../../components/common/Navbar';
import SidePannel from '../../components/common/SidePannel';

const Billing = () => {
  const [formData, setFormData] = useState({
    // Bill Information
    billNumber: "",
    billDate: "",
    dueDate: "",
    
    // Company/Contractor Information
    companyName: "",
    companyAddress: "",
    companyGST: "",
    companyPhone: "",
    companyEmail: "",
    
    // Client Information
    clientName: "",
    clientAddress: "",
    clientGST: "",
    clientPhone: "",
    clientEmail: "",
    
    // Project Information
    projectName: "",
    projectLocation: "",
    workOrderNo: "",
    
    // Bill Items
    items: [{ 
      sno: 1,
      description: "", 
      unit: "Nos", 
      quantity: 0, 
      rate: 0, 
      amount: 0 
    }],
    
    // Additional Charges
    labourCharges: 0,
    transportCharges: 0,
    otherCharges: 0,
    otherChargesDescription: "",
    
    // Tax & Deductions
    cgst: 9,
    sgst: 9,
    igst: 0,
    tds: 2,
    retention: 0,
    
    // Payment Details
    advancePaid: 0,
    previousBills: 0,
    
    // Notes
    remarks: "",
    termsAndConditions: "",
  });

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  const unitOptions = [
    "Nos", "Sqft", "Sqm", "Rft", "Rmt", "Cum", "Cft", 
    "Kg", "Ton", "Litre", "Day", "Month", "Lumpsum"
  ];

  // Fetch bills on component mount
  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/bills`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setBills(data.bills || []);
      }
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Calculate amount if quantity or rate changes
    if (field === "quantity" || field === "rate") {
      updatedItems[index].amount =
        parseFloat(updatedItems[index].quantity || 0) *
        parseFloat(updatedItems[index].rate || 0);
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }));
  };

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { 
        sno: prev.items.length + 1,
        description: "", 
        unit: "Nos", 
        quantity: 0, 
        rate: 0, 
        amount: 0 
      }],
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      // Update serial numbers
      updatedItems.forEach((item, idx) => {
        item.sno = idx + 1;
      });
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    }
  };

  const calculateSubtotal = () => {
    return formData.items.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
  };

  const calculateGrossAmount = () => {
    const subtotal = calculateSubtotal();
    const labour = parseFloat(formData.labourCharges || 0);
    const transport = parseFloat(formData.transportCharges || 0);
    const other = parseFloat(formData.otherCharges || 0);
    return subtotal + labour + transport + other;
  };

  const calculateCGST = () => {
    return (calculateGrossAmount() * parseFloat(formData.cgst || 0)) / 100;
  };

  const calculateSGST = () => {
    return (calculateGrossAmount() * parseFloat(formData.sgst || 0)) / 100;
  };

  const calculateIGST = () => {
    return (calculateGrossAmount() * parseFloat(formData.igst || 0)) / 100;
  };

  const calculateTotalWithTax = () => {
    return calculateGrossAmount() + calculateCGST() + calculateSGST() + calculateIGST();
  };

  const calculateTDS = () => {
    return (calculateTotalWithTax() * parseFloat(formData.tds || 0)) / 100;
  };

  const calculateRetention = () => {
    return (calculateTotalWithTax() * parseFloat(formData.retention || 0)) / 100;
  };

  const calculateNetPayable = () => {
    const total = calculateTotalWithTax();
    const tds = calculateTDS();
    const retention = calculateRetention();
    const advance = parseFloat(formData.advancePaid || 0);
    const previous = parseFloat(formData.previousBills || 0);
    return total - tds - retention - advance - previous;
  };

  const handleGenerateBill = async () => {
    // Validation
    if (!formData.billNumber || !formData.billDate || !formData.clientName || !formData.projectName) {
      alert("Please fill in all required fields (Bill Number, Bill Date, Client Name, Project Name)");
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].description) {
      alert("Please add at least one bill item");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const token = localStorage.getItem('token');

      const response = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`✅ Bill ${formData.billNumber} created successfully!`);
        console.log('Created bill:', data.bill);
        
        // Refresh bills list
        fetchBills();
        
        // Optional: Reset form
        // resetForm();
      } else {
        alert(`❌ Error: ${data.error || 'Failed to create bill'}`);
      }

    } catch (error) {
      console.error('Error creating bill:', error);
      alert('❌ Failed to create bill. Please try again.');
    }
  };

 const handlePrintBill = (bill) => {
  if (!bill) {
    alert('Invalid bill data');
    return;
  }

  // Create a new window for printing
  const printWindow = window.open('', '_blank');

  // ✅ Handle both BillItem (from backend) and items (from frontend)
  const items = Array.isArray(bill?.BillItem) ? bill.BillItem : 
                Array.isArray(bill?.items) ? bill.items : [];

  if (items.length === 0) {
    alert('No items found in this bill');
    printWindow.close();
    return;
  }

  // ✅ Format dates properly
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // ✅ Get bill number from correct property
  const billNumber = bill.billId || bill.billNumber || 'N/A';
  const billDate = formatDate(bill.billDate);
  const dueDate = formatDate(bill.dueDate);

  // Calculate totals for the bill using correct property names
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item?.amount || 0),
    0
  );

  const grossAmount =
    subtotal +
    Number(bill?.labourCharges || 0) +
    Number(bill?.transportCharges || 0) +
    Number(bill?.otherCharges || 0);

  // Use the percentage values from backend
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
    Number(bill?.advancePaid || 0) -
    Number(bill?.previousBills || 0);

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bill - ${billNumber}</title>
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
          text-align: center;
          border-bottom: 4px solid #ffbe2a;
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        
        .header h1 {
          font-size: 32px;
          color: #333;
          margin-bottom: 15px;
          letter-spacing: 2px;
        }
        
        .bill-info {
          display: flex;
          justify-content: space-between;
          margin-top: 15px;
        }
        
        .bill-info p {
          font-size: 14px;
          color: #666;
        }
        
        .bill-info strong {
          color: #333;
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
          white-space: pre-line;
        }
        
        .footer {
          margin-top: 40px;
          text-align: center;
          padding-top: 20px;
          border-top: 2px solid #eee;
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
        🖨️ Print Invoice
      </button>
      
      <div class="invoice-container">
        <div class="header">
          <h1>TAX INVOICE</h1>
          <div class="bill-info">
            <p><strong>Bill No:</strong> ${billNumber}</p>
            <p><strong>Date:</strong> ${billDate}</p>
            ${dueDate !== 'N/A' ? `<p><strong>Due Date:</strong> ${dueDate}</p>` : ''}
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
              <th style="width: 80px;">Unit</th>
              <th style="width: 100px;">Quantity</th>
              <th style="width: 120px;">Rate</th>
              <th class="text-right" style="width: 130px;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr>
                <td class="text-center">${idx + 1}</td>
                <td>${item.description || 'N/A'}</td>
                <td class="text-center">${item.unit || 'Nos'}</td>
                <td class="text-center">${Number(item.quantity || 0).toFixed(2)}</td>
                <td class="text-right">₹ ${Number(item.rate || 0).toFixed(2)}</td>
                <td class="text-right"><strong>₹ ${Number(item.amount || 0).toFixed(2)}</strong></td>
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
          <tr class="total-row" >
            <td style="color: #fff;"><strong>Total with Tax</strong></td>
            <td style="color: #fff;"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td>
          </tr>
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
            <tr style="color: #d32f2f;">
              <td class="label">Less: Previous Bills</td>
              <td class="value">- ₹ ${Number(bill.previousBills).toFixed(2)}</td>
            </tr>
          ` : ''}
          <tr class="net-payable-row">
            <td><strong>NET PAYABLE AMOUNT</strong></td>
            <td><strong>₹ ${netPayable.toFixed(2)}</strong></td>
          </tr>
        </table>

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

        <div class="footer">
          <p>This is a computer-generated invoice and does not require a signature</p>
          <p>Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>
    </body>
    </html>
  `);
  
  printWindow.document.close();
};

  const handleDeleteBill = async (billId) => {
  if (!billId) {
    alert('Invalid bill ID');
    return;
  }

  if (!window.confirm('Are you sure you want to delete this bill?')) {
    return;
  }

  try {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const token = localStorage.getItem('token');

    const response = await fetch(`${API_URL}/bills/${billId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert('✅ Bill deleted successfully!');
      fetchBills();
    } else {
      alert(`❌ Error: ${data.error || 'Failed to delete bill'}`);
    }
  } catch (error) {
    console.error('Error deleting bill:', error);
    alert('❌ Failed to delete bill. Please try again.');
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="pt-20 pl-16 md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="w-8 h-8 text-[#ffbe2a]" />
                <h1 className="text-3xl font-bold text-gray-800">Generate Bill</h1>
              </div>
              <p className="text-gray-600">Generate professional bills for your projects</p>
            </div>

            {/* Billing Form */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              
              {/* Bill Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Bill Information
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bill Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="billNumber"
                        value={formData.billNumber}
                        onChange={handleInputChange}
                        placeholder="INV-001"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Bill Date <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="billDate"
                        value={formData.billDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Your Company Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="Your Company Name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      name="companyGST"
                      value={formData.companyGST}
                      onChange={handleInputChange}
                      placeholder="29XXXXXXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Company Address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="companyPhone"
                        value={formData.companyPhone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="companyEmail"
                      value={formData.companyEmail}
                      onChange={handleInputChange}
                      placeholder="company@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Client Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="clientName"
                        value={formData.clientName}
                        onChange={handleInputChange}
                        placeholder="Client/Company Name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client GST Number
                    </label>
                    <input
                      type="text"
                      name="clientGST"
                      value={formData.clientGST}
                      onChange={handleInputChange}
                      placeholder="29XXXXXXXXXXXXX"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client Address
                    </label>
                    <textarea
                      name="clientAddress"
                      value={formData.clientAddress}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="Client Address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client Phone
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="clientPhone"
                        value={formData.clientPhone}
                        onChange={handleInputChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Client Email
                    </label>
                    <input
                      type="email"
                      name="clientEmail"
                      value={formData.clientEmail}
                      onChange={handleInputChange}
                      placeholder="client@example.com"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Project Information */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Project Information
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="projectName"
                        value={formData.projectName}
                        onChange={handleInputChange}
                        placeholder="Project Name"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Work Order No.
                    </label>
                    <div className="relative">
                      <FileSignature className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="workOrderNo"
                        value={formData.workOrderNo}
                        onChange={handleInputChange}
                        placeholder="WO-001"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                      />
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Project Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                      <textarea
                        name="projectLocation"
                        value={formData.projectLocation}
                        onChange={handleInputChange}
                        rows="2"
                        placeholder="Project Site Address"
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Bill Items */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Bill Items
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">S.No</th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">Description of Work</th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">Unit</th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">Quantity</th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">Rate</th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">Amount</th>
                        <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="px-3 py-3 border text-center font-semibold">
                            {item.sno}
                          </td>
                          <td className="px-3 py-3 border">
                            <input
                              type="text"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, "description", e.target.value)}
                              placeholder="Work description"
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="px-3 py-3 border">
                            <select
                              value={item.unit}
                              onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                              className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                            >
                              {unitOptions.map((unit) => (
                                <option key={unit} value={unit}>{unit}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-3 border">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                              min="0"
                              step="0.01"
                              className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="px-3 py-3 border">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                              min="0"
                              step="0.01"
                              className="w-28 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                            />
                          </td>
                          <td className="px-3 py-3 border">
                            <div className="flex items-center gap-1 text-gray-700 font-semibold">
                              ₹ {item.amount.toFixed(2)}
                            </div>
                          </td>
                          <td className="px-3 py-3 border text-center">
                            <button
                              onClick={() => removeItem(index)}
                              disabled={formData.items.length === 1}
                              className={`px-3 py-1 text-xs rounded ${
                                formData.items.length === 1
                                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                  : "bg-red-500 text-white hover:bg-red-600"
                              }`}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={addItem}
                  className="mt-4 px-4 py-2 bg-[#ffbe2a] text-black font-semibold rounded-lg hover:bg-[#e5ab26] transition-colors"
                >
                  + Add Item
                </button>
              </div>

              {/* Additional Charges */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Additional Charges
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Labour Charges (₹)
                    </label>
                    <input
                      type="number"
                      name="labourCharges"
                      value={formData.labourCharges}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Transport Charges (₹)
                    </label>
                    <input
                      type="number"
                      name="transportCharges"
                      value={formData.transportCharges}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Other Charges (₹)
                    </label>
                    <input
                      type="number"
                      name="otherCharges"
                      value={formData.otherCharges}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div className="md:col-span-3">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Other Charges Description
                    </label>
                    <input
                      type="text"
                      name="otherChargesDescription"
                      value={formData.otherChargesDescription}
                      onChange={handleInputChange}
                      placeholder="Describe other charges"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Tax & Deductions */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Tax & Deductions
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      CGST (%)
                    </label>
                    <input
                      type="number"
                      name="cgst"
                      value={formData.cgst}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="9"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      SGST (%)
                    </label>
                    <input
                      type="number"
                      name="sgst"
                      value={formData.sgst}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="9"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      IGST (%)
                    </label>
                    <input
                      type="number"
                      name="igst"
                      value={formData.igst}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      TDS (%)
                    </label>
                    <input
                      type="number"
                      name="tds"
                      value={formData.tds}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Retention (%)
                    </label>
                    <input
                      type="number"
                      name="retention"
                      value={formData.retention}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Details */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Payment Details
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Advance Paid (₹)
                    </label>
                    <input
                      type="number"
                      name="advancePaid"
                      value={formData.advancePaid}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Previous Bills (₹)
                    </label>
                    <input
                      type="number"
                      name="previousBills"
                      value={formData.previousBills}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Remarks and Terms */}
              <div className="mb-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                  Additional Information
                </h2>
                <div className="grid md:grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Remarks
                    </label>
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Any special remarks or notes"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Terms & Conditions
                    </label>
                    <textarea
                      name="termsAndConditions"
                      value={formData.termsAndConditions}
                      onChange={handleInputChange}
                      rows="4"
                      placeholder="Enter payment terms and conditions"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* Bill Summary */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 mb-6 border-2 border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-[#ffbe2a]">
                  Bill Summary
                </h2>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-700 text-l">
                    <span className="font-semibold">Subtotal (Items):</span>
                    <span className="font-bold">₹ {calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  {(formData.labourCharges > 0 || formData.transportCharges > 0 || formData.otherCharges > 0) && (
                    <>
                      {formData.labourCharges > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span className="pl-4">+ Labour Charges:</span>
                          <span>₹ {parseFloat(formData.labourCharges).toFixed(2)}</span>
                        </div>
                      )}
                      {formData.transportCharges > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span className="pl-4">+ Transport Charges:</span>
                          <span>₹ {parseFloat(formData.transportCharges).toFixed(2)}</span>
                        </div>
                      )}
                      {formData.otherCharges > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span className="pl-4">+ Other Charges:</span>
                          <span>₹ {parseFloat(formData.otherCharges).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-700 text-lg pt-2 border-t border-gray-300">
                        <span className="font-semibold">Gross Amount:</span>
                        <span className="font-bold">₹ {calculateGrossAmount().toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  
                  {formData.cgst > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span className="text-l pl-4">+ CGST ({formData.cgst}%):</span>
                      <span>₹ {calculateCGST().toFixed(2)}</span>
                    </div>
                  )}
                  {formData.sgst > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span className="text-l pl-4">+ SGST ({formData.sgst}%):</span>
                      <span>₹ {calculateSGST().toFixed(2)}</span>
                    </div>
                  )}
                  {formData.igst > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span className="text-l pl-4">+ IGST ({formData.igst}%):</span>
                      <span>₹ {calculateIGST().toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-gray-700 text-l pt-2 border-t border-gray-300">
                    <span className="font-semibold">Total with Tax:</span>
                    <span className="font-bold">₹ {calculateTotalWithTax().toFixed(2)}</span>
                  </div>
                  
                  {formData.tds > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className=" text-l pl-4">- TDS ({formData.tds}%):</span>
                      <span>₹ {calculateTDS().toFixed(2)}</span>
                    </div>
                  )}
                  {formData.retention > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="pl-4">- Retention ({formData.retention}%):</span>
                      <span>₹ {calculateRetention().toFixed(2)}</span>
                    </div>
                  )}
                  {formData.advancePaid > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="pl-4">- Advance Paid:</span>
                      <span>₹ {parseFloat(formData.advancePaid).toFixed(2)}</span>
                    </div>
                  )}
                  {formData.previousBills > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span className="pl-4">- Previous Bills:</span>
                      <span>₹ {parseFloat(formData.previousBills).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="border-t-4 border-[#ffbe2a] pt-4 mt-4">
                    <div className="flex justify-between text-l font-bold">
                      <span className="text-gray-900">Net Payable Amount:</span>
                      <span className="text-[#ffbe2a]">₹ {calculateNetPayable().toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Generate Bill Button */}
            <div className="flex justify-center pb-6">
              <button
                onClick={handleGenerateBill}
                className="p-4 bg-black text-white font-bold text-xl rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                Generate Bill
              </button>
            </div>

            {/* Bills List Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-7 h-7 text-[#ffbe2a]" />
                  <h2 className="text-2xl font-bold text-gray-800">Generated Bills</h2>
                </div>
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {bills.length} {bills.length === 1 ? 'bill' : 'bills'}
                </span>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading bills...</p>
                </div>
              ) : bills.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No bills generated yet</p>
                  <p className="text-gray-400 text-sm mt-2">Create your first bill using the form above</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {bills.map((bill) => {
  // Calculate net payable for display
  const items = Array.isArray(bill?.BillItem) ? bill.BillItem : 
                Array.isArray(bill?.items) ? bill.items : [];

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
    Number(bill?.advancePaid || 0) -
    Number(bill?.previousBills || 0);

  // ✅ Use correct bill ID property
  const billId = bill._id || bill.id;
  const billNumber = bill.billId || bill.billNumber || 'N/A';

  return (
    <div key={billId} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-bold text-lg text-gray-800">{billNumber}</h3>
          <p className="text-sm text-gray-500">
            {new Date(bill.billDate).toLocaleDateString('en-IN', { 
              day: '2-digit', 
              month: 'short', 
              year: 'numeric' 
            })}
          </p>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
          ₹{netPayable.toFixed(2)}
        </span>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="flex items-start gap-2">
          <User className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-700 line-clamp-1">{bill.clientName}</p>
        </div>
        <div className="flex items-start gap-2">
          <Building2 className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600 line-clamp-1">{bill.projectName}</p>
        </div>
        {bill.workOrderNo && (
          <div className="flex items-start gap-2">
            <FileSignature className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-gray-500">{bill.workOrderNo}</p>
          </div>
        )}
      </div>

      <div className="flex gap-2 pt-3 border-t border-gray-200">
        <button
          onClick={() => handlePrintBill(bill)}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-[#ffbe2a] text-black text-sm font-semibold rounded hover:bg-[#e5ab26] transition-colors"
        >
          <Printer className="w-4 h-4" />
          Print
        </button>
        <button
          onClick={() => handleDeleteBill(billId)}
          className="flex items-center justify-center px-3 py-2 bg-red-500 text-white text-sm font-semibold rounded hover:bg-red-600 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
})}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;