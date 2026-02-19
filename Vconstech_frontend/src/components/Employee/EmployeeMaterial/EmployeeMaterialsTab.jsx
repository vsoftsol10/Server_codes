import { Plus, Search } from 'lucide-react';

const EmployeeMaterialsTab = ({ 
  materials, 
  searchTerm, 
  setSearchTerm, 
  filterCategory, 
  setFilterCategory, 
  categories,
  onAddMaterial
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Search Materials</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or vendor..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg "
            />
          </div>
        </div>
        <div className="w-full md:w-48">
          <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg "
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onAddMaterial}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request Material
        </button>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow overflow-hidden">
      {materials.length === 0 ? (
        <div className="px-6 py-12 text-center text-gray-500">
          <p>No materials found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-yellow-500">
              <tr>
                <th className="px-6 py-3 text-left text-x font-extrabold text-black-500 uppercase">Material ID</th>
                <th className="px-6 py-3 text-left text-x font-extrabold text-black-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-x font-extrabold text-black-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-x font-extrabold text-black-500 uppercase">Unit</th>
                <th className="px-6 py-3 text-left text-x font-extrabold text-black-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-x font-extrabold text-black-500 uppercase">Vendor</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {materials.map(material => (
                <tr key={material.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {material.materialId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {material.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                      {material.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {material.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    ₹{material.defaultRate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {material.vendor || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  </div>
);

export default EmployeeMaterialsTab;