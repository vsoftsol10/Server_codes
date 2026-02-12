import React from 'react';
import BillInformation from './form-section/BillInformation';
import ClientInformation from './form-section/ClientInformation';
import BillSummary from './form-section/BillSummary';
import BillItems from './form-section/BillItems';
import AdditionalInfo from './form-section/AdditionalInfo';
import CompanyInformation from './form-section/CompanyInformation';
import PaymentDetails from './form-section/PaymentDetails';
import TaxAndDeductions from './form-section/TaxAndDeductions';

const BillingForm = ({
  formData,
  activeTab,
  handleInputChange,
  handleClientNameChange,
  selectClient,
  handleItemChange,
  addItem,
  removeItem,
  calculateSubtotal,
  calculateGrossAmount,
  calculateCGST,
  calculateSGST,
  calculateIGST,
  calculateTotalWithTax,
  calculateTDS,
  calculateRetention,
  calculateNetPayable,
  handleGenerateBill,
  clientSuggestions,
  showClientSuggestions,
  setShowClientSuggestions,
  setShowClientModal,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <form onSubmit={handleGenerateBill}>

        {/* Bill Information Section

        <BillInformation
          formData={formData}
          handleInputChange={handleInputChange}
          activeTab={activeTab}
        /> */}

        {/* Client Information Section */}
        <ClientInformation
          formData={formData}
          handleInputChange={handleInputChange}
          handleClientNameChange={handleClientNameChange}
          showClientSuggestions={showClientSuggestions}
          setShowClientSuggestions={setShowClientSuggestions}
          clientSuggestions={clientSuggestions}
          selectClient={selectClient}
          setShowClientModal={setShowClientModal}
        />

        <CompanyInformation
        formData ={formData}
         handleInputChange={handleInputChange}/>

        {/* Project Information */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
            Project Information
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                name="projectName"
                value={formData.projectName}
                onChange={handleInputChange}
                placeholder="Enter project name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Project Location
              </label>
              <input
                type="text"
                name="projectLocation"
                value={formData.projectLocation}
                onChange={handleInputChange}
                placeholder="Enter project location"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Work Order No.
              </label>
              <input
                type="text"
                name="workOrderNo"
                value={formData.workOrderNo}
                onChange={handleInputChange}
                placeholder="Enter work order number"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bill Items Table - Add your items table here */}
        {/* ... */}
        <BillInformation 
        formData={formData}
        handleInputChange={handleInputChange}
        activeTab={activeTab}/>
        
<PaymentDetails
formData={formData} activeTab={activeTab} handleInputChange={handleInputChange}/>


       <BillItems
  formData={formData}
  activeTab={activeTab}
  handleItemChange={handleItemChange}
  addItem={addItem}
  removeItem={removeItem}
/>
 
 <TaxAndDeductions 
 formData={formData}
 handleInputChange={handleInputChange}
 />


        <AdditionalInfo
          formData={formData}
           handleInputChange={handleInputChange} 
           />



        {/* Bill Summary Section */}
        <BillSummary
          formData={formData}
          activeTab={activeTab}
          calculateSubtotal={calculateSubtotal}
          calculateGrossAmount={calculateGrossAmount}
          calculateCGST={calculateCGST}
          calculateSGST={calculateSGST}
          calculateIGST={calculateIGST}
          calculateTotalWithTax={calculateTotalWithTax}
          calculateTDS={calculateTDS}
          calculateRetention={calculateRetention}
          calculateNetPayable={calculateNetPayable}
        />
         

         
        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-[#ffbe2a] text-white px-8 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
          >
            Generate {activeTab === 'invoice' ? 'Invoice' : 'Quotation'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BillingForm;