import React, { useState } from 'react';
import {UNIT_OPTIONS} from "../../constants/billingConstants"

const BillItems = ({ activeTab }) => {

  const [formData, setFormData] = useState({
    items: [
      {
        sno: 1,
        description: "",
        HSN: "",
        unit: "Nos",
        quantity: "",
        rate: "",
        amount: 0
      }
    ]
  });

  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          sno: prev.items.length + 1,
          description: "",
          HSN: "",
          unit: "Nos",
          quantity: "",
          rate: "",
          amount: 0
        }
      ]
    }));
  };

  const removeItem = (index) => {
    setFormData((prev) => {
      const updatedItems = prev.items.filter((_, i) => i !== index);

      return {
        ...prev,
        items: updatedItems.map((item, i) => ({
          ...item,
          sno: i + 1
        }))
      };
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value
      };

      const qty = Number(updatedItems[index].quantity || 0);
      const rate = Number(updatedItems[index].rate || 0);
      updatedItems[index].amount = qty * rate;

      return {
        ...prev,
        items: updatedItems
      };
    });
  };


  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-[#ffbe2a]">
        {activeTab === 'invoice' ? 'Bill' : 'Quote'} Items
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">S.No</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border" style={{minWidth: '300px'}}>Description of Work</th>
              <th className="px-3 py-3 text-left text-sm font-semibold text-gray-700 border">HSN/SAAC</th>
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
                  <textarea
                    value={item.description || ""}
                    onChange={(e) => handleItemChange(index, "description", e.target.value)}
                    placeholder="Enter detailed work description..."
                    rows="3"
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none resize-y"
                    style={{minHeight: '60px'}}
                  />
                </td>
                <td className="px-3 py-3 border">
                  <input
                    type="number"
                    value={item.HSN || ""}
                    onChange={(e) => handleItemChange(index, "HSN", e.target.value)}
                    min="0"
                    placeholder="HSN/SAC"
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                  />
                </td>
                <td className="px-3 py-3 border">
                  <select
                    value={item.unit || "Nos"}
                    onChange={(e) => handleItemChange(index, "unit", e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                  >
                    {UNIT_OPTIONS.map((unit) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-3 border">
                  <input
                    type="number"
                    value={item.quantity || ""}
                    onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                    min="0"
                    step="0.01"
                    className="w-24 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#ffbe2a] focus:border-transparent outline-none"
                  />
                </td>
                <td className="px-3 py-3 border">
                  <input
                    type="number"
                    value={item.rate || ""}
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
      type='number'
        onClick={addItem}
        className="mt-4 px-4 py-2 bg-[#ffbe2a] text-black font-semibold rounded-lg hover:bg-[#e5ab26] transition-colors"
      >
        + Add Item
      </button>
    </div>
  );
}

export default BillItems;