import React from 'react';
import { X } from 'lucide-react';
// import BillInformation from './form-sections/BillInformation';
// import ClientInformation from './form-sections/ClientInformation';
// import ProjectInformation from './form-sections/ProjectInformation';
// import BillItems from './form-sections/BillItems';

const EditBillModal = ({
  showEditModal,
  setShowEditModal,
  editingBill,
  setEditingBill,
  formData,
  handleInputChange,
  handleItemChange,
  addItem,
  removeItem,
  handleUpdateBill,
  resetForm,
}) => {
  if (!showEditModal) return null;

  const unitOptions = [
    "Nos", "Sqft", "Sqm", "Rft", "Rmt", "Cum", "Cft", 
    "Kg", "Ton", "Litre", "Day", "Month", "Lumpsum","others"
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-lg z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            Edit {formData.billType === 'invoice' ? 'Invoice' : 'Quotation'}
          </h2>
          <button
            onClick={() => {
              setShowEditModal(false);
              setEditingBill(null);
              resetForm();
            }}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 max-h-[80vh] overflow-y-auto">
          <div className="space-y-6">
            {/* Bill Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                Bill Information
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Bill Number
                  </label>
                  <input
                    type="text"
                    name="billNumber"
                    value={formData.billNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="billDate"
                    value={formData.billDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                  />
                </div>
                {formData.billType === 'invoice' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Client Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                Client Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={formData.clientName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client GST
                  </label>
                  <input
                    type="text"
                    name="clientGST"
                    value={formData.clientGST}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Project Information */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                Project Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Order No
                  </label>
                  <input
                    type="text"
                    name="workOrderNo"
                    value={formData.workOrderNo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Bill Items */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
                Bill Items
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-2 py-2 text-left text-xs font-semibold border">S.No</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold border">Description</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold border">Unit</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold border">Qty</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold border">Rate</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold border">Amount</th>
                      <th className="px-2 py-2 text-left text-xs font-semibold border">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-2 py-2 border text-center">{item.sno}</td>
                        <td className="px-2 py-2 border">
                          <textarea
                            value={item.description}
                            onChange={(e) => handleItemChange(index, "description", e.target.value)}
                            rows="2"
                            className="w-full px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 border">
                          <select
                            value={item.unit}
                            onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                            className="w-full px-2 py-1 border rounded text-sm"
                          >
                            {unitOptions.map((unit) => (
                              <option key={unit} value={unit}>{unit}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-2 border">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                            className="w-20 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 border">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                            className="w-24 px-2 py-1 border rounded text-sm"
                          />
                        </td>
                        <td className="px-2 py-2 border">₹ {item.amount.toFixed(2)}</td>
                        <td className="px-2 py-2 border text-center">
                          <button
                            onClick={() => removeItem(index)}
                            disabled={formData.items.length === 1}
                            className={`px-2 py-1 text-xs rounded ${
                              formData.items.length === 1
                                ? "bg-gray-300 cursor-not-allowed"
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
                className="mt-3 px-4 py-2 bg-[#ffbe2a] text-black font-semibold rounded-lg hover:bg-[#e5ab26]"
              >
                + Add Item
              </button>
            </div>
          </div>

          <div className="flex gap-3 mt-6 pt-6 border-t">
            <button
              onClick={() => handleUpdateBill(false, editingBill)}
              className="flex-1 bg-[#ffbe2a] text-black font-semibold py-2 px-4 rounded-lg hover:bg-[#e5ab26] transition-colors"
            >
              Update Bill
            </button>
            <button
              onClick={() => handleUpdateBill(true, editingBill)}
              className="flex-1 bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Save as Draft
            </button>
            <button
              onClick={() => {
                setShowEditModal(false);
                setEditingBill(null);
                resetForm();
              }}
              className="flex-1 bg-gray-200 text-gray-800 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditBillModal;