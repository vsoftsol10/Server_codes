
// Material Form Component
const EmployeeMaterialForm = ({ material, onChange, categories, isProjectSpecific = false, projects = [] }) => (
  <div className="space-y-4">
    {isProjectSpecific && (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Project <span className="text-red-500">*</span>
        </label>
        <select
          value={material.projectId || ''}
          onChange={(e) => onChange({ ...material, projectId: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Project</option>
          {projects.map(proj => (
            <option key={proj.id} value={proj.id}>{proj.name}</option>
          ))}
        </select>
      </div>
    )}

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Material Name <span className="text-red-500">*</span>
      </label>
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
        <input
        type="text"
        value={material.category}
        onChange={(e) => onChange({ ...material, category: e.target.value })}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        placeholder="e.g., Flooring"
      />
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
          <option value="kilogram">Kilogram</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isProjectSpecific ? 'Project Price (₹)' : 'Default Rate (₹)'} <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={material.defaultRate}
          onChange={(e) => onChange({ ...material, defaultRate: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="450"
        />
      </div>

      {isProjectSpecific && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quantity Needed <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={material.quantity || ''}
            onChange={(e) => onChange({ ...material, quantity: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="100"
          />
        </div>
      )}
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

export default EmployeeMaterialForm