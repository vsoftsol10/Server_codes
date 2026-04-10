import { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import AddMaterialFormInline from "./AddMaterialFormInline";

const EmployeeMaterialsTab = ({ 
  materials, 
  searchTerm, 
  setSearchTerm, 
  filterCategory, 
  setFilterCategory, 
  categories,
  projects,
  loading,
  onAddMaterial
}) => {
  const [sliderOpen, setSliderOpen] = useState(false);

  return (
    <div className="space-y-6 relative">

      {/* Search & Filter Bar */}
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
          <div className="w-full md:w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setSliderOpen(true)}
            className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-5 h-5" />
            Request Material
          </button>
        </div>
      </div>

      {/* Table */}
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
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-black uppercase">Material ID</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-black uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-black uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-black uppercase">Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-black uppercase">Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-extrabold text-black uppercase">Vendor</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {materials.map(material => (
                  <tr key={material.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{material.materialId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{material.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {material.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{material.unit}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">₹{material.defaultRate}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">{material.vendor || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Backdrop */}
      {sliderOpen && (
        <div
          className="fixed inset-0 bg-black/20 bg-opacity-30 z-40"
          onClick={() => setSliderOpen(false)}
        />
      )}

      {/* Slider Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${
          sliderOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Slider Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-base font-semibold text-gray-900">Request Material</h2>
          <button
            onClick={() => setSliderOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slider Body */}
<div className="flex-1  flex flex-col">
  {sliderOpen && (
    <AddMaterialFormInline
      categories={categories}
      projects={projects}
      loading={loading}
      onClose={() => setSliderOpen(false)}
      onSubmit={(data, type) => {
        onAddMaterial(data, type);
        setSliderOpen(false);
      }}
    />
  )}
</div>
      </div>

    </div>
  );
};

export default EmployeeMaterialsTab;