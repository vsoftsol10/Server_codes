import { printBill } from '../utils/printBill';



export const useBillingActions = ({
  formData,
  setFormData,
  bills,
  setBills,
  clients,
  setClients,
  setLoading,
  setShowClientModal,
  setShowEditModal,
  setEditingBill,
  setClientSuggestions,
  setShowClientSuggestions,
  newClient,
  setNewClient,
  activeTab,
}) => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Fetch bills
  const fetchBills = async () => {
    setLoading(true);
    try {
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

  // Fetch clients
  const fetchClients = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clients`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok && data.success) {
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle client name input with autocomplete
  const handleClientNameChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, clientName: value }));

    if (value.trim().length > 0) {
      const filtered = clients.filter(client =>
        client.clientName.toLowerCase().includes(value.toLowerCase())
      );
      setClientSuggestions(filtered);
      setShowClientSuggestions(true);
    } else {
      setShowClientSuggestions(false);
    }
  };

  // Select client from suggestions
  const selectClient = (client) => {
    setFormData(prev => ({
      ...prev,
      clientName: client.clientName,
      clientAddress: client.clientAddress || '',
      clientGST: client.clientGST || '',
      clientPhone: client.clientPhone || '',
      clientEmail: client.clientEmail || '',
    }));
    setShowClientSuggestions(false);
  };

  // Handle item changes
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

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

  // Add item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { 
        sno: prev.items.length + 1,
        description: "", 
        HSN: 0,
        unit: "Nos", 
        quantity: 0, 
        rate: 0, 
        amount: 0 
      }],
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      updatedItems.forEach((item, idx) => {
        item.sno = idx + 1;
      });
      setFormData((prev) => ({
        ...prev,
        items: updatedItems,
      }));
    }
  };

  // Calculation functions
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
    
    return total - tds - retention - advance + previous;
  };

  // Generate bill
  const handleGenerateBill = async (isDraft = false) => {
    if (!formData.billNumber || !formData.billDate || !formData.clientName || !formData.projectName) {
      alert("Please fill in all required fields (Bill Number, Bill Date, Client Name, Project Name)");
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].description) {
      alert("Please add at least one bill item");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const billData = {
        ...formData,
        status: isDraft ? 'draft' : formData.status
      };

      const response = await fetch(`${API_URL}/bills`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(billData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const actionText = isDraft ? 'saved as draft' : 'created';
        alert(`✅ ${formData.billType === 'invoice' ? 'Invoice' : 'Quotation'} ${formData.billNumber} ${actionText} successfully!`);
        
        fetchBills();
        resetForm();
      } else {
        alert(`❌ Error: ${data.error || 'Failed to create bill'}`);
      }
    } catch (error) {
      console.error('Error creating bill:', error);
      alert('❌ Failed to create bill. Please try again.');
    }
  };

  // Update bill
  const handleUpdateBill = async (isDraft = false, editingBill) => {
    if (!editingBill) return;

    try {
      const token = localStorage.getItem('token');
      const billData = {
        ...formData,
        status: isDraft ? 'draft' : formData.status
      };

      const response = await fetch(`${API_URL}/bills/${editingBill._id || editingBill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(billData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert(`✅ Bill updated successfully!`);
        fetchBills();
        setShowEditModal(false);
        setEditingBill(null);
        resetForm();
      } else {
        alert(`❌ Error: ${data.error || 'Failed to update bill'}`);
      }
    } catch (error) {
      console.error('Error updating bill:', error);
      alert('❌ Failed to update bill. Please try again.');
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      billType: activeTab,
      billNumber: "",
      billDate: "",
      dueDate: "",
      companyName: "",
      companyAddress: "",
      companyGST: "",
      companyPhone: "",
      companyEmail: "",
      clientName: "",
      clientAddress: "",
      clientGST: "",
      clientPhone: "",
      clientEmail: "",
      projectName: "",
      projectLocation: "",
      workOrderNo: "",
      items: [{ 
        sno: 1,
        description: "", 
        HSN: 0,
        unit: "Nos", 
        quantity: 0, 
        rate: 0, 
        amount: 0 
      }],
      labourCharges: 0,
      transportCharges: 0,
      otherCharges: 0,
      otherChargesDescription: "",
      cgst: 9,
      sgst: 9,
      igst: 0,
      tds: 2,
      retention: 0,
      advancePaid: 0,
      previousBills: 0,
      remarks: "",
      termsAndConditions: "",
      status: "open",
    });
  };

  // Edit bill
  const handleEditBill = (bill) => {
    setEditingBill(bill);
    
    setFormData({
      billType: bill.billType || 'invoice',
      billNumber: bill.billId || bill.billNumber || "",
      billDate: bill.billDate ? bill.billDate.split('T')[0] : "",
      dueDate: bill.dueDate ? bill.dueDate.split('T')[0] : "",
      companyName: bill.companyName || "",
      companyAddress: bill.companyAddress || "",
      companyGST: bill.companyGST || "",
      companyPhone: bill.companyPhone || "",
      companyEmail: bill.companyEmail || "",
      clientName: bill.clientName || "",
      clientAddress: bill.clientAddress || "",
      clientGST: bill.clientGST || "",
      clientPhone: bill.clientPhone || "",
      clientEmail: bill.clientEmail || "",
      projectName: bill.projectName || "",
      projectLocation: bill.projectLocation || "",
      workOrderNo: bill.workOrderNo || "",
      items: bill.BillItem || bill.items || [{ 
        sno: 1,
        description: "", 
        HSN: 0,
        unit: "Nos", 
        quantity: 0, 
        rate: 0, 
        amount: 0 
      }],
      labourCharges: bill.labourCharges || 0,
      transportCharges: bill.transportCharges || 0,
      otherCharges: bill.otherCharges || 0,
      otherChargesDescription: bill.otherChargesDescription || "",
      cgst: bill.cgstPercent || bill.cgst || 9,
      sgst: bill.sgstPercent || bill.sgst || 9,
      igst: bill.igstPercent || bill.igst || 0,
      tds: bill.tdsPercent || bill.tds || 2,
      retention: bill.retentionPercent || bill.retention || 0,
      advancePaid: bill.advancePaid || 0,
      previousBills: bill.previousBills || 0,
      remarks: bill.remarks || "",
      termsAndConditions: bill.termsAndConditions || "",
      status: bill.status || "open",
    });
    
    setShowEditModal(true);
  };

  // Print bill
  // const handlePrintBill = (bill) => {
  //   // Implementation remains the same as original
  //   // ... (keeping the original print logic)
  // };

  // Delete bill
  const handleDeleteBill = async (billId) => {
    if (!billId) {
      alert('Invalid bill ID');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this bill?')) {
      return;
    }

    try {
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

  // Update status
  const handleUpdateStatus = async (billId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/bills/${billId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        fetchBills();
      } else {
        alert(`❌ Error: ${data.error || 'Failed to update status'}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status. Please try again.');
    }
  };

  // Add client
  const handleAddClient = async () => {
    if (!newClient.clientName) {
      alert('Please enter client name');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/clients`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newClient)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('✅ Client added successfully!');
        fetchClients();
        setShowClientModal(false);
        
        setNewClient({
          clientName: "",
          clientAddress: "",
          clientGST: "",
          clientPhone: "",
          clientEmail: "",
        });
      } else {
        alert(`❌ Error: ${data.error || 'Failed to add client'}`);
      }
    } catch (error) {
      console.error('Error adding client:', error);
      alert('❌ Failed to add client. Please try again.');
    }
  };


  const handlePrintBill = (bill) => {
  printBill(bill);
};

  return {
    fetchBills,
    fetchClients,
    handleInputChange,
    handleClientNameChange,
    selectClient,
    handleItemChange,
    addItem,
    removeItem,
    handleGenerateBill,
    handleUpdateBill,
    resetForm,
    handleEditBill,
    handlePrintBill,
    handleDeleteBill,
    handleUpdateStatus,
    handleAddClient,
    calculateSubtotal,
    calculateGrossAmount,
    calculateCGST,
    calculateSGST,
    calculateIGST,
    calculateTotalWithTax,
    calculateTDS,
    calculateRetention,
    calculateNetPayable,
  };
};