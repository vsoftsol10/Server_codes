import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import EmployeeMaterialsTab from '../../components/Employee/EmployeeMaterial/EmployeeMaterialsTab';
import EmployeeProjectsTab from '../../components/Employee/EmployeeMaterial/EmployeeProjectsTab';
import EmployeeRequestTab from '../../components/Employee/EmployeeMaterial/EmployeeRequestTab';
import EmployeeModalMaterial from '../../components/Employee/EmployeeMaterial/EmployeeModalMaterial';
import EmployeeMaterialForm from '../../components/Employee/EmployeeMaterial/EmployeeMaterialForm';
import EmployeeNavbar from '../../components/Employee/EmployeeNavbar';

// Import API services
import {
  materialAPI,
  projectMaterialAPI,
  materialRequestAPI,
  usageLogAPI,
  notificationAPI,
  projectAPI
} from '../../api/materialService';

const EmployeeMaterialManagement = () => {
  // State management
  const [materials, setMaterials] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [usageLogs, setUsageLogs] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState(['All']);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [activeTab, setActiveTab] = useState('materials');
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddProjectMaterial, setShowAddProjectMaterial] = useState(false);
  const [showUsageLog, setShowUsageLog] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [requestType, setRequestType] = useState('GLOBAL');

  const [newMaterial, setNewMaterial] = useState({
    name: '',
    category: 'Paint',
    unit: 'piece',
    defaultRate: '',
    vendor: '',
    description: '',
    projectId: '',
    quantity: ''
  });

  const [newProjectMaterial, setNewProjectMaterial] = useState({
    materialId: '',
    assigned: '',
    used: 0,
    status: 'Active'
  });

  const [newUsageLog, setNewUsageLog] = useState({
    date: new Date().toISOString().split('T')[0],
    materialId: '',
    quantity: '',
    remarks: ''
  });

  // ============ DATA FETCHING ============
  
  // Fetch materials
  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const response = await materialAPI.getAll();
      setMaterials(response.materials || []);
    } catch (err) {
      console.error('Failed to fetch materials:', err);
      setError('Failed to load materials');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects
  const fetchProjects = async () => {
    try {
      const response = await projectAPI.getAll();
      setProjects(response.projects || []);
      if (response.projects?.length > 0 && !selectedProject) {
        setSelectedProject(response.projects[0].id);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    }
  };

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await materialAPI.getCategories();
      setCategories(['All', ...(response.categories || [])]);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  // Fetch project materials
  const fetchProjectMaterials = async (projectId) => {
    if (!projectId) return;
    
    try {
      const response = await projectMaterialAPI.getByProject(projectId);
      setProjectMaterials(response.projectMaterials || []);
    } catch (err) {
      console.error('Failed to fetch project materials:', err);
    }
  };

  // Fetch usage logs
  const fetchUsageLogs = async (projectId) => {
    if (!projectId) return;
    
    try {
      const response = await usageLogAPI.getByProject(projectId);
      setUsageLogs(response.usageLogs || []);
    } catch (err) {
      console.error('Failed to fetch usage logs:', err);
    }
  };

  // Fetch material requests
  const fetchMaterialRequests = async () => {
    try {
      const response = await materialRequestAPI.getMyRequests();
      setMaterialRequests(response.requests || []);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    }
  };

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  // ============ EFFECTS ============
  
  // Initial data load
  useEffect(() => {
    fetchMaterials();
    fetchProjects();
    fetchCategories();
    fetchMaterialRequests();
    fetchNotifications();
  }, []);

  // Fetch project-specific data when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchProjectMaterials(selectedProject);
      fetchUsageLogs(selectedProject);
    }
  }, [selectedProject]);

  // ============ HANDLERS ============

  // Submit material request
  const handleSubmitMaterialRequest = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 Current requestType:', requestType);
      console.log('🔍 Current newMaterial:', newMaterial);
      
      const requestData = {
        name: newMaterial.name,
        category: newMaterial.category,
        unit: newMaterial.unit,
        defaultRate: parseFloat(newMaterial.defaultRate),
        vendor: newMaterial.vendor || null,
        description: newMaterial.description || null,
        type: requestType, // This should be 'GLOBAL' or 'PROJECT'
        projectId: requestType === 'PROJECT' ? parseInt(newMaterial.projectId) : null,
        quantity: requestType === 'PROJECT' ? parseFloat(newMaterial.quantity) : null
      };

      console.log('📤 Submitting request:', requestData);
      const response = await materialRequestAPI.create(requestData);
      console.log('✅ Request created:', response);
      
      // Refresh data
      await fetchMaterialRequests();
      await fetchNotifications();
      
      // Reset form
      setNewMaterial({
        name: '',
        category: 'Paint',
        unit: 'piece',
        defaultRate: '',
        vendor: '',
        description: '',
        projectId: '',
        quantity: ''
      });
      setShowAddMaterial(false);
      
      alert('Material request submitted successfully! You will be notified once it is reviewed.');
    } catch (err) {
      console.error('❌ Failed to submit request:', err);
      console.error('❌ Error response:', err.response?.data);
      console.error('❌ Error status:', err.response?.status);
      alert(err.response?.data?.error || 'Failed to submit material request');
    } finally {
      setLoading(false);
    }
  };

  // Add project material request
  const handleAddProjectMaterial = async () => {
    try {
      setLoading(true);
      
      const requestData = {
        name: materials.find(m => m.id === parseInt(newProjectMaterial.materialId))?.name,
        category: materials.find(m => m.id === parseInt(newProjectMaterial.materialId))?.category,
        unit: materials.find(m => m.id === parseInt(newProjectMaterial.materialId))?.unit,
        defaultRate: materials.find(m => m.id === parseInt(newProjectMaterial.materialId))?.defaultRate,
        type: 'PROJECT_MATERIAL',
        projectId: parseInt(selectedProject),
        materialId: parseInt(newProjectMaterial.materialId),
        quantity: parseFloat(newProjectMaterial.assigned)
      };

      await materialRequestAPI.create(requestData);
      
      // Refresh data
      await fetchMaterialRequests();
      await fetchNotifications();
      
      // Reset form
      setNewProjectMaterial({
        materialId: '',
        assigned: '',
        used: 0,
        status: 'Active'
      });
      setShowAddProjectMaterial(false);
      
      alert('Project material request submitted successfully!');
    } catch (err) {
      console.error('Failed to submit request:', err);
      alert(err.response?.data?.error || 'Failed to submit project material request');
    } finally {
      setLoading(false);
    }
  };

  // Add usage log
  const handleAddUsageLog = async () => {
    try {
      setLoading(true);
      
      const logData = {
        projectId: parseInt(selectedProject),
        materialId: parseInt(newUsageLog.materialId),
        quantity: parseFloat(newUsageLog.quantity),
        remarks: newUsageLog.remarks || null,
        date: newUsageLog.date
      };

      const response = await usageLogAPI.create(logData);
      
      if (response.warning) {
        alert(`Warning: ${response.warning}`);
      }
      
      // Refresh data
      await fetchProjectMaterials(selectedProject);
      await fetchUsageLogs(selectedProject);
      
      // Reset form
      setNewUsageLog({
        date: new Date().toISOString().split('T')[0],
        materialId: '',
        quantity: '',
        remarks: ''
      });
      setShowUsageLog(false);
      
      alert('Usage logged successfully!');
    } catch (err) {
      console.error('Failed to log usage:', err);
      alert(err.response?.data?.error || 'Failed to log usage');
    } finally {
      setLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  // ============ COMPUTED VALUES ============

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getProjectMaterialsWithDetails = () => {
    return projectMaterials.map(pm => ({
      ...pm,
      remaining: pm.assigned - pm.used
    }));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />
      
      {/* Header */}
      <div className="bg-white border-b mt-26 border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Management System</h1>
            <p className="text-sm text-gray-600 mt-1">Track and manage materials across all projects</p>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="px-4 py-3 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                      No notifications
                    </div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif.id}
                        onClick={() => markNotificationAsRead(notif.id)}
                        className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <div className={`mt-1 w-2 h-2 rounded-full ${
                            notif.type === 'SUCCESS' ? 'bg-green-500' :
                            notif.type === 'ERROR' ? 'bg-red-500' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notif.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {['materials', 'projects', 'my-requests'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'my-requests' ? 'My Requests' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && activeTab === 'materials' && (
          <EmployeeMaterialsTab
            materials={filteredMaterials}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            onAddMaterial={() => {
              setRequestType('GLOBAL');
              setShowAddMaterial(true);
            }}
          />
        )}

        {!loading && activeTab === 'projects' && (
          <EmployeeProjectsTab
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            projectMaterials={getProjectMaterialsWithDetails()}
            usageLogs={usageLogs}
            onAddProjectMaterial={() => setShowAddProjectMaterial(true)}
            onLogUsage={() => setShowUsageLog(true)}
          />
        )}

        {!loading && activeTab === 'my-requests' && (
          <EmployeeRequestTab
            requests={materialRequests}
          />
        )}
      </div>

      {/* Modals */}
      <EmployeeModalMaterial
        isOpen={showAddMaterial}
        onClose={() => {
          setShowAddMaterial(false);
          setNewMaterial({
            name: '',
            category: 'Paint',
            unit: 'piece',
            defaultRate: '',
            vendor: '',
            description: '',
            projectId: '',
            quantity: ''
          });
        }}
        title={requestType === 'GLOBAL' ? 'Request New Global Material' : 'Request Project-Specific Material'}
        footer={
          <>
            <button
              onClick={() => setShowAddMaterial(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitMaterialRequest}
              disabled={!newMaterial.name || !newMaterial.defaultRate || (requestType === 'PROJECT' && (!newMaterial.projectId || !newMaterial.quantity)) || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </>
        }
      >
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Request Type</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="GLOBAL"
                checked={requestType === 'GLOBAL'}
                onChange={(e) => {
                  setRequestType(e.target.value);
                  setNewMaterial({ ...newMaterial, projectId: '', quantity: '' });
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Global Material (Available for all projects)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="PROJECT"
                checked={requestType === 'PROJECT'}
                onChange={(e) => setRequestType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Project-Specific Material</span>
            </label>
          </div>
        </div>
        
        <EmployeeMaterialForm
          material={newMaterial}
          onChange={setNewMaterial}
          categories={categories.length > 1 ? categories.filter(c => c !== 'All') : ['Paint', 'Wood', 'Flooring', 'Electrical', 'Fabric', 'Hardware', 'Plumbing']}
          isProjectSpecific={requestType === 'PROJECT'}
          projects={projects}
        />
      </EmployeeModalMaterial>

      <EmployeeModalMaterial
        isOpen={showAddProjectMaterial}
        onClose={() => {
          setShowAddProjectMaterial(false);
          setNewProjectMaterial({ materialId: '', assigned: '', used: 0, status: 'Active' });
        }}
        title="Request to Add Material to Project"
        footer={
          <>
            <button
              onClick={() => setShowAddProjectMaterial(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddProjectMaterial}
              disabled={!newProjectMaterial.materialId || !newProjectMaterial.assigned || loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> This request will be sent to your supervisor for approval before the material is added to the project.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Material <span className="text-red-500">*</span>
            </label>
            <select
              value={newProjectMaterial.materialId}
              onChange={(e) => setNewProjectMaterial({...newProjectMaterial, materialId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a material...</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.category} - ₹{m.defaultRate}/{m.unit})
                </option>
              ))}
            </select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newProjectMaterial.assigned}
                onChange={(e) => setNewProjectMaterial({...newProjectMaterial, assigned: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Used Quantity</label>
              <input
                type="number"
                value={newProjectMaterial.used}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </EmployeeModalMaterial>

      <EmployeeModalMaterial
        isOpen={showUsageLog}
        onClose={() => {
          setShowUsageLog(false);
          setNewUsageLog({ date: new Date().toISOString().split('T')[0], materialId: '', quantity: '', remarks: '' });
        }}
        title="Log Material Usage"
        footer={
          <>
            <button
              onClick={() => setShowUsageLog(false)}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleAddUsageLog}
              disabled={!newUsageLog.materialId || !newUsageLog.quantity || loading}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging...' : 'Log Usage'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={newUsageLog.date}
              onChange={(e) => setNewUsageLog({...newUsageLog, date: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Material</label>
            <select
              value={newUsageLog.materialId}
              onChange={(e) => setNewUsageLog({...newUsageLog, materialId: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Choose a material...</option>
              {getProjectMaterialsWithDetails().map(pm => (
                <option key={pm.materialId} value={pm.materialId}>
                  {pm.material?.name} (Remaining: {pm.remaining} {pm.material?.unit})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity Used</label>
            <input
              type="number"
              value={newUsageLog.quantity}
              onChange={(e) => setNewUsageLog({...newUsageLog, quantity: e.target.value})}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks</label>
            <textarea
              value={newUsageLog.remarks}
              onChange={(e) => setNewUsageLog({...newUsageLog, remarks: e.target.value})}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., For Living Room wall"
            />
          </div>
        </div>
      </EmployeeModalMaterial>
    </div>
  );
};

export default EmployeeMaterialManagement;