import { useState, useMemo } from 'react';
import DashboardTab from '../../components/MaterialManagement/DashboardTab';
import ProjectsTab from '../../components/MaterialManagement/ProjectsTab';
import MaterialForm from '../../components/MaterialManagement/MaterialForm';
import ModalMaterial from '../../components/MaterialManagement/ModalMaterial';
import Navbar from '../../components/common/Navbar';
import SidePannel from '../../components/common/SidePannel';
import RequestTab from '../../components/MaterialManagement/RequestTab';

// Main App Component
const MaterialManagement = () => {
  const [materials, setMaterials] = useState([
    { id: 'MAT001', name: 'Asian Paints Premium', category: 'Paint', unit: 'liter', defaultRate: 450, vendor: 'Asian Paints', description: 'Premium interior paint' },
    { id: 'MAT002', name: 'Teak Wood Plywood', category: 'Wood', unit: 'sheet', defaultRate: 2800, vendor: 'Century Ply', description: '8mm marine plywood' },
    { id: 'MAT003', name: 'Ceramic Tiles', category: 'Flooring', unit: 'sq.ft', defaultRate: 65, vendor: 'Kajaria', description: 'Vitrified tiles 2x2' },
    { id: 'MAT004', name: 'LED Lights', category: 'Electrical', unit: 'piece', defaultRate: 350, vendor: 'Philips', description: '12W panel lights' },
  ]);

  const [projects, setProjects] = useState([
    { id: 'PRJ001', name: 'Residential - Adyar', status: 'Active' },
    { id: 'PRJ002', name: 'Office - OMR', status: 'Active' },
    { id: 'PRJ003', name: 'Villa - ECR', status: 'Completed' },
  ]);

  const [projectMaterials, setProjectMaterials] = useState([
    { projectId: 'PRJ001', materialId: 'MAT001', assigned: 50, used: 20, status: 'Active' },
    { projectId: 'PRJ001', materialId: 'MAT002', assigned: 15, used: 15, status: 'Completed' },
    { projectId: 'PRJ001', materialId: 'MAT003', assigned: 1200, used: 800, status: 'Active' },
    { projectId: 'PRJ002', materialId: 'MAT001', assigned: 30, used: 5, status: 'Active' },
    { projectId: 'PRJ002', materialId: 'MAT004', assigned: 25, used: 0, status: 'Not Used' },
  ]);

  const [usageLogs, setUsageLogs] = useState([
    { date: '2025-10-10', projectId: 'PRJ001', materialId: 'MAT001', quantity: 20, remarks: 'For Living Room wall' },
    { date: '2025-10-12', projectId: 'PRJ001', materialId: 'MAT002', quantity: 5, remarks: 'For kitchen cabinets' },
    { date: '2025-10-13', projectId: 'PRJ001', materialId: 'MAT003', quantity: 400, remarks: 'Master bedroom flooring' },
  ]);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedProject, setSelectedProject] = useState('PRJ001');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddProjectMaterial, setShowAddProjectMaterial] = useState(false);
  const [showUsageLog, setShowUsageLog] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const categories = ['All', 'Paint', 'Wood', 'Flooring', 'Electrical', 'Fabric', 'Hardware', 'Plumbing'];

  const [newMaterial, setNewMaterial] = useState({
    name: '', category: '', unit: 'piece', defaultRate: '', vendor: '', description: ''
  });

  const [newProjectMaterial, setNewProjectMaterial] = useState({
    materialId: '', assigned: '', used: 0, status: 'Active'
  });

  const [newUsageLog, setNewUsageLog] = useState({
    date: new Date().toISOString().split('T')[0], materialId: '', quantity: '', remarks: ''
  });

  const dashboardMetrics = useMemo(() => {
    const totalMaterials = materials.length;
    const activeMaterials = projectMaterials.filter(pm => pm.status === 'Active').length;
    const totalCost = projectMaterials.reduce((sum, pm) => {
      const material = materials.find(m => m.id === pm.materialId);
      return sum + (material?.defaultRate || 0) * pm.used;
    }, 0);
    const overusedMaterials = projectMaterials.filter(pm => pm.used > pm.assigned);
    return { totalMaterials, activeMaterials, totalCost, overusedMaterials: overusedMaterials.length };
  }, [materials, projectMaterials]);

  const filteredMaterials = materials.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         m.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'All' || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getProjectMaterialsWithDetails = (projectId) => {
    return projectMaterials
      .filter(pm => pm.projectId === projectId)
      .map(pm => ({
        ...pm,
        material: materials.find(m => m.id === pm.materialId),
        remaining: pm.assigned - pm.used
      }));
  };

  const getProjectUsageLogs = (projectId) => {
    return usageLogs
      .filter(log => log.projectId === projectId)
      .map(log => ({
        ...log,
        material: materials.find(m => m.id === log.materialId)
      }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  };

  const handleAddMaterial = () => {
    const newId = `MAT${String(materials.length + 1).padStart(3, '0')}`;
    setMaterials([...materials, { id: newId, ...newMaterial }]);
    setNewMaterial({ name: '', category: '', unit: 'piece', defaultRate: '', vendor: '', description: '' });
    setShowAddMaterial(false);
  };
   
  const handleUpdateMaterial = () => {
    setMaterials(materials.map(m => m.id === editingMaterial.id ? editingMaterial : m));
    setEditingMaterial(null);
  };

  const handleDeleteMaterial = (id) => {
    if (confirm('Are you sure you want to delete this material?')) {
      setMaterials(materials.filter(m => m.id !== id));
      setProjectMaterials(projectMaterials.filter(pm => pm.materialId !== id));
    }
  };

  const handleAddProjectMaterial = () => {
    setProjectMaterials([...projectMaterials, {
      projectId: selectedProject,
      ...newProjectMaterial,
      used: parseInt(newProjectMaterial.used)
    }]);
    setNewProjectMaterial({ materialId: '', assigned: '', used: 0, status: 'Active' });
    setShowAddProjectMaterial(false);
  };

  const handleUpdateUsage = (projectId, materialId, newUsed) => {
    setProjectMaterials(projectMaterials.map(pm => 
      pm.projectId === projectId && pm.materialId === materialId
        ? { ...pm, used: parseInt(newUsed) }
        : pm
    ));
  };

  const handleAddUsageLog = () => {
    setUsageLogs([...usageLogs, {
      ...newUsageLog,
      projectId: selectedProject,
      quantity: parseInt(newUsageLog.quantity)
    }]);
    
    const currentPM = projectMaterials.find(pm => 
      pm.projectId === selectedProject && pm.materialId === newUsageLog.materialId
    );
    if (currentPM) {
      handleUpdateUsage(selectedProject, newUsageLog.materialId, 
        currentPM.used + parseInt(newUsageLog.quantity));
    }

    setNewUsageLog({ date: new Date().toISOString().split('T')[0], materialId: '', quantity: '', remarks: '' });
    setShowUsageLog(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="fixed left-0 top-16 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="mt-26 pl-16 md:pl-64 min-h-screen">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Material Management System</h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">Track and manage materials across all projects</p>
        </div>

        {/* Tabs Section */}
        <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 overflow-x-auto">
          <div className="flex space-x-4 sm:space-x-8">
            {['dashboard', 'projects', 'Requests'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 sm:py-4 px-2 border-b-2 font-medium text-xs sm:text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div>
          {activeTab === 'dashboard' && (
            <DashboardTab
              metrics={dashboardMetrics}
              usageLogs={usageLogs}
              projects={projects}
              materials={materials}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsTab
              projects={projects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              projectMaterials={getProjectMaterialsWithDetails(selectedProject)}
              usageLogs={getProjectUsageLogs(selectedProject)}
              onAddProjectMaterial={() => setShowAddProjectMaterial(true)}
              onLogUsage={() => setShowUsageLog(true)}
            />
          )}
          {activeTab === 'Requests' && (
            <RequestTab
              projects={projects}
              selectedProject={selectedProject}
              setSelectedProject={setSelectedProject}
              projectMaterials={getProjectMaterialsWithDetails(selectedProject)}
              usageLogs={getProjectUsageLogs(selectedProject)}
              onAddProjectMaterial={() => setShowAddProjectMaterial(true)}
              onLogUsage={() => setShowUsageLog(true)}
            />
          )}
          
        </div>

        {/* Add Material Modal */}
        <ModalMaterial
          isOpen={showAddMaterial}
          onClose={() => setShowAddMaterial(false)}
          title="Add New Material"
          footer={
            <>
              <button
                onClick={() => setShowAddMaterial(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMaterial}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add Material
              </button>
            </>
          }
        >
          <MaterialForm
            material={newMaterial}
            onChange={setNewMaterial}
            categories={categories}
          />
        </ModalMaterial>

        {/* Edit Material Modal */}
        <ModalMaterial
          isOpen={!!editingMaterial}
          onClose={() => setEditingMaterial(null)}
          title="Edit Material"
          footer={
            <>
              <button
                onClick={() => setEditingMaterial(null)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateMaterial}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update Material
              </button>
            </>
          }
        >
          {editingMaterial && (
            <MaterialForm
              material={editingMaterial}
              onChange={setEditingMaterial}
              categories={categories}
            />
          )}
        </ModalMaterial>

        {/* Add Project Material Modal */}
        <ModalMaterial
          isOpen={showAddProjectMaterial}
          onClose={() => setShowAddProjectMaterial(false)}
          title="Add Material to Project"
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
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add to Project
              </button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Material</label>
              <select
                value={newProjectMaterial.materialId}
                onChange={(e) => setNewProjectMaterial({...newProjectMaterial, materialId: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Choose a material...</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.category} - {m.unit})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Quantity</label>
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
                  onChange={(e) => setNewProjectMaterial({...newProjectMaterial, used: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={newProjectMaterial.status}
                onChange={(e) => setNewProjectMaterial({...newProjectMaterial, status: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Not Used">Not Used</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>
        </ModalMaterial>

        {/* Add Usage Log Modal */}
        <ModalMaterial
          isOpen={showUsageLog}
          onClose={() => setShowUsageLog(false)}
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
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Log Usage
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
                {getProjectMaterialsWithDetails(selectedProject).map(pm => (
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
        </ModalMaterial>
      </div>
    </div>
  );
};

export default MaterialManagement;