import React from 'react'
import { Plus,} from 'lucide-react';

// Projects Tab Component
const EmployeeProjectsTab = ({ projects, selectedProject, setSelectedProject, projectMaterials, usageLogs, onAddProjectMaterial, onLogUsage }) => (
  <div className="space-y-6">
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Project</label>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {projects.map(project => (
              <option key={project.id} value={project.id}>{project.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={onAddProjectMaterial}
          className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request Material for Project
        </button>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Project Materials</h3>
        <button
          onClick={onLogUsage}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          Log Usage
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remaining</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projectMaterials.map((pm, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {pm.material?.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    {pm.material?.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {pm.assigned} {pm.material?.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {pm.used} {pm.material?.unit}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className={pm.remaining < 0 ? 'text-red-600 font-semibold' : 'text-gray-900'}>
                    {pm.remaining} {pm.material?.unit}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    pm.status === 'Active' ? 'bg-green-100 text-green-800' :
                    pm.status === 'Completed' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {pm.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Usage History</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usageLogs.map((log, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{log.material?.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {log.quantity} {log.material?.unit}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">{log.remarks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default EmployeeProjectsTab