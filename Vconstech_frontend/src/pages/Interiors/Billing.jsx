import React, { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Navbar from '../../components/common/Navbar';
import SidePannel from '../../components/common/SidePannel';
import BillingTabs from "../billing-refactored/components/BillingTabs";
import BillingForm from "../billing-refactored/components/BillingForm";
import BillsListSection from "../billing-refactored/components/BillsListSection";
import AddClientModal from "../billing-refactored/components/form-section/AddClientModal";
import EditBillModal from "../billing-refactored/components/EditBillModal";
import { useBillingState } from '../billing-refactored/hooks/useBillingState';
import { useBillingActions } from '../billing-refactored/hooks/useBillingActions';


const Billing = () => {
  // State management
  const {
    activeTab,
    setActiveTab,
    activeSection,
    setActiveSection,
    formData,
    setFormData,
    bills,
    setBills,
    clients,
    setClients,
    loading,
    setLoading,
    showClientModal,
    setShowClientModal,
    showEditModal,
    setShowEditModal,
    editingBill,
    setEditingBill,
    searchTerm,
    setSearchTerm,
    dateFilter,
    setDateFilter,
    customDateRange,
    setCustomDateRange,
    showFilterDropdown,
    setShowFilterDropdown,
    clientSuggestions,
    setClientSuggestions,
    showClientSuggestions,
    setShowClientSuggestions,
    newClient,
    setNewClient,
  } = useBillingState();

  // Actions
  const {
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
  } = useBillingActions({
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
  });

  // Fetch data on mount
  useEffect(() => {
    fetchBills();
    fetchClients();
  }, []);

  // Update billType when tab changes
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      billType: activeTab
    }));
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

<div className="pt-20 pl-16 md:pl-64">
  <div className="p-4 sm:p-6 lg:p-8 min-w-0">
    <div className="w-full">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6 w-full">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="w-8 h-8 text-[#ffbe2a]" />
          <h1 className="text-3xl font-bold text-gray-800">Billing Management</h1>
        </div>
        <p className="text-gray-600">Generate professional invoices and quotations</p>
      </div>

            <div className="w-full">
        <BillingTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

            {/* Billing Form */}
          <div className="w-full">
        <BillingForm
          formData={formData}
          activeTab={activeTab}
              handleInputChange={handleInputChange}
              handleClientNameChange={handleClientNameChange}
              selectClient={selectClient}
              handleItemChange={handleItemChange}
              addItem={addItem}
              removeItem={removeItem}
              calculateSubtotal={calculateSubtotal}
              calculateGrossAmount={calculateGrossAmount}
              calculateCGST={calculateCGST}
              calculateSGST={calculateSGST}
              calculateIGST={calculateIGST}
              calculateTotalWithTax={calculateTotalWithTax}
              calculateTDS={calculateTDS}
              calculateRetention={calculateRetention}
              calculateNetPayable={calculateNetPayable}
              handleGenerateBill={handleGenerateBill}
              clientSuggestions={clientSuggestions}
              showClientSuggestions={showClientSuggestions}
              setShowClientSuggestions={setShowClientSuggestions}
              setShowClientModal={setShowClientModal}
            />
            </div>

            {/* Bills List Section */}
      <div className="w-full">
        <BillsListSection
          activeSection={activeSection}
              setActiveSection={setActiveSection}
              bills={bills}
              loading={loading}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customDateRange={customDateRange}
              setCustomDateRange={setCustomDateRange}
              showFilterDropdown={showFilterDropdown}
              setShowFilterDropdown={setShowFilterDropdown}
              handleEditBill={handleEditBill}
              handlePrintBill={handlePrintBill}
              handleDeleteBill={handleDeleteBill}
              handleUpdateStatus={handleUpdateStatus}
            />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AddClientModal
        showClientModal={showClientModal}
        setShowClientModal={setShowClientModal}
        newClient={newClient}
        setNewClient={setNewClient}
        handleAddClient={handleAddClient}
      />

      <EditBillModal
        showEditModal={showEditModal}
        setShowEditModal={setShowEditModal}
        editingBill={editingBill}
        setEditingBill={setEditingBill}
        formData={formData}
        handleInputChange={handleInputChange}
        handleItemChange={handleItemChange}
        addItem={addItem}
        removeItem={removeItem}
        handleUpdateBill={handleUpdateBill}
        resetForm={resetForm}
      />
    </div>
  );
};

export default Billing;