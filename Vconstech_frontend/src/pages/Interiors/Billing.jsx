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
  // Create a new window for printing
  const printWindow = window.open('', '_blank');

  // ✅ Ensure items is always an array
  const items = Array.isArray(bill?.items) ? bill.items : [];

  // Calculate totals for the bill
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item?.amount || 0),
    0
  );

  const grossAmount =
    subtotal +
    Number(bill?.labourCharges || 0) +
    Number(bill?.transportCharges || 0) +
    Number(bill?.otherCharges || 0);

  const cgst = (grossAmount * Number(bill?.cgst || 0)) / 100;
  const sgst = (grossAmount * Number(bill?.sgst || 0)) / 100;
  const igst = (grossAmount * Number(bill?.igst || 0)) / 100;

  const totalWithTax = grossAmount + cgst + sgst + igst;

  const tds = (totalWithTax * Number(bill?.tds || 0)) / 100;
  const retention =
    (totalWithTax * Number(bill?.retention || 0)) / 100;

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
        <title>Bill - ${bill.billNumber}</title>
        <style>
          @media print {
            @page { margin: 0.5cm; }
          }
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 210mm;
            margin: 0 auto;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #ffbe2a;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .company-info, .client-info, .project-info {
            margin-bottom: 15px;
          }
          .section-title {
            font-weight: bold;
            background: #f3f4f6;
            padding: 5px 10px;
            margin-bottom: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          th, td {
            border: 1px solid #ccc;
            padding: 8px;
            text-align: left;
          }
          th {
            background: #f3f4f6;
            font-weight: bold;
          }
          .summary {
            margin-top: 20px;
            border-top: 2px solid #000;
            padding-top: 10px;
          }
          .total-row {
            font-weight: bold;
            font-size: 1.1em;
            background: #ffbe2a;
          }
          .text-right { text-align: right; }
          .print-button {
            background: #000;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            margin-bottom: 20px;
          }
          @media print {
            .print-button { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Print Bill</button>
        
        <div class="header">
          <h1>TAX INVOICE</h1>
          <p><strong>Bill No:</strong> ${bill.billNumber} | <strong>Date:</strong> ${bill.billDate}</p>
          ${bill.dueDate ? `<p><strong>Due Date:</strong> ${bill.dueDate}</p>` : ''}
        </div>

        <div class="company-info">
          <div class="section-title">FROM (Contractor/Company)</div>
          <p><strong>${bill.companyName || 'N/A'}</strong></p>
          <p>${bill.companyAddress || ''}</p>
          ${bill.companyGST ? `<p><strong>GST:</strong> ${bill.companyGST}</p>` : ''}
          ${bill.companyPhone ? `<p><strong>Phone:</strong> ${bill.companyPhone}</p>` : ''}
          ${bill.companyEmail ? `<p><strong>Email:</strong> ${bill.companyEmail}</p>` : ''}
        </div>

        <div class="client-info">
          <div class="section-title">TO (Client)</div>
          <p><strong>${bill.clientName}</strong></p>
          <p>${bill.clientAddress || ''}</p>
          ${bill.clientGST ? `<p><strong>GST:</strong> ${bill.clientGST}</p>` : ''}
          ${bill.clientPhone ? `<p><strong>Phone:</strong> ${bill.clientPhone}</p>` : ''}
          ${bill.clientEmail ? `<p><strong>Email:</strong> ${bill.clientEmail}</p>` : ''}
        </div>

        <div class="project-info">
          <div class="section-title">PROJECT DETAILS</div>
          <p><strong>Project:</strong> ${bill.projectName}</p>
          ${bill.projectLocation ? `<p><strong>Location:</strong> ${bill.projectLocation}</p>` : ''}
          ${bill.workOrderNo ? `<p><strong>Work Order No:</strong> ${bill.workOrderNo}</p>` : ''}
        </div>

        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Description</th>
              <th>Unit</th>
              <th>Quantity</th>
              <th>Rate</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${bill.items.map((item, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${item.description}</td>
                <td>${item.unit}</td>
                <td>${item.quantity}</td>
                <td>₹ ${parseFloat(item.rate).toFixed(2)}</td>
                <td class="text-right">₹ ${parseFloat(item.amount).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <table>
            <tr><td><strong>Subtotal (Items)</strong></td><td class="text-right">₹ ${subtotal.toFixed(2)}</td></tr>
            ${bill.labourCharges > 0 ? `<tr><td>Labour Charges</td><td class="text-right">₹ ${parseFloat(bill.labourCharges).toFixed(2)}</td></tr>` : ''}
            ${bill.transportCharges > 0 ? `<tr><td>Transport Charges</td><td class="text-right">₹ ${parseFloat(bill.transportCharges).toFixed(2)}</td></tr>` : ''}
            ${bill.otherCharges > 0 ? `<tr><td>Other Charges</td><td class="text-right">₹ ${parseFloat(bill.otherCharges).toFixed(2)}</td></tr>` : ''}
            <tr><td><strong>Gross Amount</strong></td><td class="text-right"><strong>₹ ${grossAmount.toFixed(2)}</strong></td></tr>
            ${bill.cgst > 0 ? `<tr><td>CGST (${bill.cgst}%)</td><td class="text-right">₹ ${cgst.toFixed(2)}</td></tr>` : ''}
            ${bill.sgst > 0 ? `<tr><td>SGST (${bill.sgst}%)</td><td class="text-right">₹ ${sgst.toFixed(2)}</td></tr>` : ''}
            ${bill.igst > 0 ? `<tr><td>IGST (${bill.igst}%)</td><td class="text-right">₹ ${igst.toFixed(2)}</td></tr>` : ''}
            <tr><td><strong>Total with Tax</strong></td><td class="text-right"><strong>₹ ${totalWithTax.toFixed(2)}</strong></td></tr>
            ${bill.tds > 0 ? `<tr><td>TDS (${bill.tds}%)</td><td class="text-right">- ₹ ${tds.toFixed(2)}</td></tr>` : ''}
            ${bill.retention > 0 ? `<tr><td>Retention (${bill.retention}%)</td><td class="text-right">- ₹ ${retention.toFixed(2)}</td></tr>` : ''}
            ${bill.advancePaid > 0 ? `<tr><td>Advance Paid</td><td class="text-right">- ₹ ${parseFloat(bill.advancePaid).toFixed(2)}</td></tr>` : ''}
            ${bill.previousBills > 0 ? `<tr><td>Previous Bills</td><td class="text-right">- ₹ ${parseFloat(bill.previousBills).toFixed(2)}</td></tr>` : ''}
            <tr class="total-row"><td><strong>NET PAYABLE AMOUNT</strong></td><td class="text-right"><strong>₹ ${netPayable.toFixed(2)}</strong></td></tr>
          </table>
        </div>

        ${bill.remarks ? `<div style="margin-top: 15px;"><strong>Remarks:</strong><br>${bill.remarks}</div>` : ''}
        ${bill.termsAndConditions ? `<div style="margin-top: 15px;"><strong>Terms & Conditions:</strong><br>${bill.termsAndConditions}</div>` : ''}

        <div style="margin-top: 30px; text-align: center; border-top: 1px solid #ccc; padding-top: 10px;">
          <p><em>This is a computer-generated bill</em></p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
  };

  const handleDeleteBill = async (billId) => {
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
                    const items = bill.items || [];

const subtotal = items.reduce(
  (sum, item) => sum + parseFloat(item.amount || 0),
  0
);

const grossAmount =
  subtotal +
  parseFloat(bill.labourCharges || 0) +
  parseFloat(bill.transportCharges || 0) +
  parseFloat(bill.otherCharges || 0);

const cgst = (grossAmount * parseFloat(bill.cgst || 0)) / 100;
const sgst = (grossAmount * parseFloat(bill.sgst || 0)) / 100;
const igst = (grossAmount * parseFloat(bill.igst || 0)) / 100;

const totalWithTax = grossAmount + cgst + sgst + igst;

const tds = (totalWithTax * parseFloat(bill.tds || 0)) / 100;
const retention =
  (totalWithTax * parseFloat(bill.retention || 0)) / 100;

const netPayable =
  totalWithTax -
  tds -
  retention -
  parseFloat(bill.advancePaid || 0) -
  parseFloat(bill.previousBills || 0);


                    return (
                      <div key={bill._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-bold text-lg text-gray-800">{bill.billNumber}</h3>
                            <p className="text-sm text-gray-500">{new Date(bill.billDate).toLocaleDateString()}</p>
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
                            onClick={() => handleDeleteBill(bill._id)}
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