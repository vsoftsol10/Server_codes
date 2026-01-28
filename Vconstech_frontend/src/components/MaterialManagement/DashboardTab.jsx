import React, { useState, useEffect } from "react";
import { Package, TrendingUp, IndianRupee, Loader2, Plus, X } from "lucide-react";
import MetricCard from "./MetricCard";
import { materialAPI, materialRequestAPI } from "../../api/materialAPI";
import { projectAPI } from "../../api/projectAPI";

// Modal Component
const EmployeeModalMaterial = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const DashboardTab = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      totalMaterials: 0,
      activeMaterials: 0,
      totalCost: 0
    },
    usageLogs: []
  });

  // Projects data from database
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  // User role (you should get this from your auth context or localStorage)
  const [userRole, setUserRole] = useState(null);

  // New state for modal
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState({
    requestType: 'global',
    projectId: '',
    name: '',
    category: '',
    unit: 'piece',
    defaultRate: '',
    quantityNeeded: '',
    vendor: '',
    description: ''
  });

  const units = ['piece', 'kg', 'liters', 'sq ft', 'boxes', 'meters', 'bags'];

  useEffect(() => {
    // Get user role from localStorage or auth context
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role); // Assuming role is 'ADMIN' or 'SITE_ENGINEER'
    
    fetchDashboardData();
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const result = await projectAPI.getProjects();
      
      // Map backend response to frontend format
      const mappedProjects = result.projects?.map(p => ({
        id: p.id,
        name: p.name
      })) || [];
      
      setProjects(mappedProjects);
      console.log('✅ Projects loaded:', mappedProjects);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      // Fallback to empty array if fetch fails
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await materialAPI.getDashboardData();
      
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.error || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMaterial = async () => {
    try {
      setSubmitting(true);
      
      console.log('🔍 Current user role:', userRole);
      console.log('🔍 Material data:', newMaterial);
      
      // Check if user is Admin or Site Engineer
      if (userRole === 'ADMIN' || userRole === 'Admin') {
        // ADMIN: Add material directly to database
        if (newMaterial.requestType === 'global') {
          // Create global material
          console.log('📤 Creating global material...');
          const result = await materialAPI.create(newMaterial);
          console.log('✅ Material created:', result);
          alert('✅ Global material added successfully!');
        } else {
          // Create global material first, then add to project
          console.log('📤 Creating material for project...');
          const materialResult = await materialAPI.create(newMaterial);
          console.log('✅ Material created:', materialResult);
          
          // Add material to specific project
          console.log('📤 Adding material to project...');
          await materialAPI.addToProject({
            materialId: materialResult.material.id,
            projectId: newMaterial.projectId,
            quantityNeeded: newMaterial.quantityNeeded
          });
          
          alert('✅ Project-specific material added successfully!');
        }
      } else {
        // SITE ENGINEER: Create material request (needs admin approval)
        console.log('📤 Creating material request...');
        await materialRequestAPI.create(newMaterial);
        alert('✅ Material request submitted successfully! Waiting for admin approval.');
      }
      
      // Reset form
      setNewMaterial({
        requestType: 'global',
        projectId: '',
        name: '',
        category: '',
        unit: 'piece',
        defaultRate: '',
        quantityNeeded: '',
        vendor: '',
        description: ''
      });
      
      setShowAddMaterial(false);
      
      // Refresh dashboard
      fetchDashboardData();
    } catch (err) {
      console.error('❌ Failed to add material:', err);
      console.error('❌ Error details:', {
        status: err.status,
        error: err.error,
        details: err.details,
        message: err.message
      });
      
      // Show detailed error message
      const errorMsg = err.details 
        ? `${err.error}\n\nDetails: ${JSON.stringify(err.details, null, 2)}`
        : (err.error || err.message || 'Unknown error occurred');
      
      alert(`❌ Failed to add material:\n\n${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 font-medium">Error loading dashboard</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { metrics, usageLogs } = dashboardData;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Add Material Button */}
      <div className="flex justify-between items-center">
        <div>
          {userRole === 'ADMIN' ? (
            <span className="text-sm text-gray-600">
              Add materials directly to the database
            </span>
          ) : (
            <span className="text-sm text-gray-600">
              Submit material requests for admin approval
            </span>
          )}
        </div>
        <button
          onClick={() => setShowAddMaterial(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
        >
          <Plus className="w-5 h-5" />
          Add Material
        </button>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <MetricCard
          title="Total Materials"
          value={metrics.totalMaterials}
          icon={Package}
          iconColor="text-blue-600"
        />
        <MetricCard
          title="Active in Projects"
          value={metrics.activeMaterials}
          icon={TrendingUp}
          iconColor="text-green-600"
        />
        <MetricCard
          title="Total Cost (Used)"
          value={`₹${metrics.totalCost.toLocaleString()}`}
          icon={IndianRupee}
          iconColor="text-emerald-600"
        />
      </div>

      {/* Recent Material Usage Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Recent Material Usage
          </h2>
        </div>
        
        {usageLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No material usage recorded yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Material
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {usageLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                      {new Date(log.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                      {log.projectName}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                      {log.materialName}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-900">
                      {log.quantity} {log.unit}
                    </td>
                    <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-700">
                      {log.userName}
                    </td>
                    <td className="px-4 sm:px-6 py-3 text-gray-600 break-words max-w-[200px]">
                      {log.remarks || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Material Modal */}
      <EmployeeModalMaterial
        isOpen={showAddMaterial}
        onClose={() => {
          setShowAddMaterial(false);
          setNewMaterial({
            requestType: 'global',
            projectId: '',
            name: '',
            category: '',
            unit: 'piece',
            defaultRate: '',
            quantityNeeded: '',
            vendor: '',
            description: ''
          });
        }}
        title={
          userRole === 'ADMIN'
            ? (newMaterial.requestType === 'global' ? 'Add New Global Material' : 'Add Project-Specific Material')
            : (newMaterial.requestType === 'global' ? 'Request New Global Material' : 'Request Project-Specific Material')
        }
        footer={
          <>
            <button
              onClick={() => setShowAddMaterial(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitMaterial}
              disabled={
                !newMaterial.name || 
                !newMaterial.category || 
                (newMaterial.requestType === 'global' ? !newMaterial.defaultRate : (!newMaterial.defaultRate || !newMaterial.quantityNeeded || !newMaterial.projectId)) || 
                submitting
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Material
            </button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Request Type
            </label>
            <div className="flex items-center gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  value="global"
                  checked={newMaterial.requestType === 'global'}
                  onChange={(e) => setNewMaterial({...newMaterial, requestType: e.target.value, projectId: '', quantityNeeded: ''})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Global Material (Available for all projects)
                </span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  value="project"
                  checked={newMaterial.requestType === 'project'}
                  onChange={(e) => setNewMaterial({...newMaterial, requestType: e.target.value})}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Project-Specific Material
                </span>
              </label>
            </div>
          </div>

          {/* Project Dropdown - Only shown for Project-Specific */}
          {newMaterial.requestType === 'project' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              {loadingProjects ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading projects...</span>
                </div>
              ) : (
                <select
                  value={newMaterial.projectId}
                  onChange={(e) => setNewMaterial({...newMaterial, projectId: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Asian Paints Premium"
            />
          </div>

          {/* Category and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newMaterial.category}
                onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paint"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unit
              </label>
              <select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Default Rate / Project Price and Quantity Needed */}
          {newMaterial.requestType === 'global' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newMaterial.defaultRate}
                onChange={(e) => setNewMaterial({...newMaterial, defaultRate: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="450"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newMaterial.defaultRate}
                  onChange={(e) => setNewMaterial({...newMaterial, defaultRate: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="450"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newMaterial.quantityNeeded}
                  onChange={(e) => setNewMaterial({...newMaterial, quantityNeeded: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="100"
                />
              </div>
            </div>
          )}

          {/* Vendor/Supplier */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vendor/Supplier
            </label>
            <input
              type="text"
              value={newMaterial.vendor}
              onChange={(e) => setNewMaterial({...newMaterial, vendor: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Asian Paints"
            />
          </div>

          {/* Description/Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description/Remarks
            </label>
            <textarea
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Additional details about the material..."
            />
          </div>
        </div>
      </EmployeeModalMaterial>
    </div>
  );
};

export default DashboardTab;