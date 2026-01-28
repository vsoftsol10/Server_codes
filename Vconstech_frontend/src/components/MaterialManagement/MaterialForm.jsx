import React from 'react'

// Material Form Component
const MaterialForm = ({ material, onChange, categories }) => (
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Material Name</label>
      <input
        type="text"
        value={material.name}
        onChange={(e) => onChange({ ...material, name: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="e.g., Asian Paints Premium"
      />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
        <select
          value={material.category}
          onChange={(e) => onChange({ ...material, category: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {categories.filter(c => c !== 'All').map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
        <select
          value={material.unit}
          onChange={(e) => onChange({ ...material, unit: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="piece">Piece</option>
          <option value="liter">Liter</option>
          <option value="sq.ft">Sq.ft</option>
          <option value="meter">Meter</option>
          <option value="sheet">Sheet</option>
          <option value="kg">Kilogram</option>
        </select>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Default Rate (₹)</label>
        <input
          type="number"
          value={material.defaultRate}
          onChange={(e) => onChange({ ...material, defaultRate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="450"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Vendor/Supplier</label>
        <input
          type="text"
          value={material.vendor}
          onChange={(e) => onChange({ ...material, vendor: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Asian Paints"
        />
      </div>
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Description/Remarks</label>
      <textarea
        value={material.description}
        onChange={(e) => onChange({ ...material, description: e.target.value })}
        rows="3"
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="Additional details about the material..."
      />
    </div>
  </div>
);

export default MaterialForm