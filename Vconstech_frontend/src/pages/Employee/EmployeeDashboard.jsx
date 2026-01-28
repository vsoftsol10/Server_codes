import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, Plus, Upload, FolderOpen, X, ExternalLink, Percent, FileDown } from 'lucide-react';
import EmployeeNavbar from '../../components/Employee/EmployeeNavbar';
import { projectAPI } from '../../api/projectAPI';
import { materialRequestAPI } from '../../api/materialService';
import costCalculationService from '../../api/costCalculationService';
import projectReportService from '../../services/projectReportService';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState('Loading...');
  const [assignedProjects, setAssignedProjects] = useState([]);
  const [materialRequests, setMaterialRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

const [showProgressSlider, setShowProgressSlider] = useState({});
const [tempProgress, setTempProgress] = useState({});
const [isUpdatingProgress, setIsUpdatingProgress] = useState({});
  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
  
  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const fetchRecentFiles = async (projects, token) => {
    try {
      if (projects.length === 0) {
        setRecentFiles([]);
        return;
      }

      const filePromises = projects.map(project =>
        fetch(`${API_BASE_URL}/projects/${project.id}/files`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        .then(res => res.json())
        .then(data => ({
          projectName: project.name,
          files: data.files || []
        }))
        .catch(() => ({ projectName: project.name, files: [] }))
      );

      const projectFilesData = await Promise.all(filePromises);
      
      const allFiles = projectFilesData.flatMap(({ projectName, files }) =>
        files.map(file => ({ ...file, projectName }))
      );

      const sortedFiles = allFiles
        .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt))
        .slice(0, 5);

      setRecentFiles(sortedFiles);
    } catch (error) {
      console.error('Error fetching recent files:', error);
      setRecentFiles([]);
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return '📎';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const iconMap = {
      pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', dwg: '📐', dxf: '📐'
    };
    return iconMap[ext] || '📎';
  };

  const getFileType = (fileName) => {
    if (!fileName) return 'FILE';
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleViewFile = async (file) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!file.fileUrl) throw new Error('File URL not found');
      
      const baseUrl = API_BASE_URL.replace('/api', '');
      const fileUrl = file.fileUrl.startsWith('http') 
        ? file.fileUrl 
        : `${baseUrl}${file.fileUrl}`;
      
      const response = await fetch(fileUrl, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error(`Failed to download file (${response.status})`);
      }

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error('Error viewing file:', error);
      alert('Failed to open file: ' + error.message);
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-IN');
  };

  // Progress Update Functions
const handleProgressUpdate = async (projectId) => {
  const newProgress = tempProgress[projectId];
  const currentProgress = assignedProjects.find(p => p.id === projectId)?.progress || 0;
  
  if (newProgress === currentProgress) {
    setShowProgressSlider({ ...showProgressSlider, [projectId]: false });
    return;
  }

  setIsUpdatingProgress({ ...isUpdatingProgress, [projectId]: true });
  try {
    // Use projectId directly - it's already the database ID
    await projectAPI.updateProjectProgress(projectId, newProgress);
    
    // Update local state immediately for better UX
    setAssignedProjects(prev => 
      prev.map(p => p.id === projectId ? { ...p, progress: newProgress } : p)
    );
    
    setShowProgressSlider({ ...showProgressSlider, [projectId]: false });
    alert(`Progress updated to ${newProgress}%`);
  } catch (error) {
    console.error('Error updating progress:', error);
    alert(error.error || 'Failed to update progress. Please try again.');
  } finally {
    setIsUpdatingProgress({ ...isUpdatingProgress, [projectId]: false });
  }
};

const openProgressSlider = (projectId, currentProgress) => {
  setTempProgress({ ...tempProgress, [projectId]: currentProgress });
  setShowProgressSlider({ ...showProgressSlider, [projectId]: true });
};

const closeProgressSlider = (projectId) => {
  setShowProgressSlider({ ...showProgressSlider, [projectId]: false });
};
  
// Report Download Handler
const handleDownloadReport = async (project) => {
  try {
    console.log('📊 Project data being sent to report:', {
      name: project.name,
      id: project.id,
      dbId: project.dbId,
      clientName: project.clientName,
      projectType: project.projectType,
      assignedEngineerName: project.assignedEngineerName,
      budget: project.budget,
      spent: project.spent
    });
    
    const html = await projectReportService.generateReport(project);
    projectReportService.downloadReport(html, project.name);
    
    console.log('✅ Report downloaded successfully');
  } catch (error) {
    console.error('❌ Error generating report:', error);
    alert(`Failed to generate report: ${error.message}`);
  }
};
  useEffect(() => {
    const fetchEmployeeData = async () => {
  try {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!token) {
      setError('Authentication required. Please login.');
      return;
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('authToken', token);

    const profileResponse = await fetch(`${API_BASE_URL.replace('/api', '')}/api/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (!profileResponse.ok) throw new Error('Failed to fetch profile');

    const profileData = await profileResponse.json();
    setEmployeeName(profileData.user.name || 'Employee');
    const engineerId = profileData.user.id;

    let myProjects = [];
    try {
      const projectsData = await projectAPI.getProjects();
      console.log('🔍 Full projects data:', projectsData); // Debug log
      
      myProjects = projectsData.projects
        .filter(project => project.assignedEngineer?.id === engineerId)
        .map(project => ({
          ...project,
          // ✅ Ensure progress is properly mapped
          progress: project.actualProgress ?? project.progress ?? 0,
          dbId: project.id // This is the database ID for API calls
        }));
      
      console.log('🔍 Filtered projects for engineer:', myProjects); // Debug log
      
      setAssignedProjects(myProjects);
      await fetchRecentFiles(myProjects, token);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setAssignedProjects([]);
    }

    // ... rest of your material requests code stays the same
    try {
      const requestsData = await materialRequestAPI.getMyRequests();
      
      const sortedRequests = (requestsData.requests || [])
        .filter(req => req.material && req.project)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
      
      setMaterialRequests(sortedRequests);
      
      const requestNotifications = sortedRequests.map(req => {
        const timeAgo = getTimeAgo(new Date(req.createdAt));
        const materialName = req.material?.name || 'Unknown Material';
        const status = req.status.toLowerCase();
        
        if (status === 'approved') {
          return {
            type: 'approval',
            message: `Material request for ${materialName} approved`,
            time: timeAgo
          };
        } else if (status === 'rejected') {
          return {
            type: 'rejection',
            message: `Material request for ${materialName} rejected - ${req.rejectionReason || 'See comments'}`,
            time: timeAgo
          };
        } else {
          return {
            type: 'update',
            message: `Material request for ${materialName} is pending`,
            time: timeAgo
          };
        }
      });
      
      setNotifications(requestNotifications);
    } catch (err) {
      console.error('Error fetching material requests:', err);
      setMaterialRequests([]);
    }

  } catch (error) {
    console.error('Error fetching employee data:', error);
    setError('Failed to load dashboard data. Please try again.');
    setEmployeeName('Employee');
  } finally {
    setLoading(false);
  }
};

    fetchEmployeeData();
  }, []); 

  const validRequests = materialRequests.filter(r => r.material && r.project);
  const approvedCount = validRequests.filter(r => r.status.toLowerCase() === 'approved').length;
  const pendingCount = validRequests.filter(r => r.status.toLowerCase() === 'pending').length;
  const rejectedCount = validRequests.filter(r => r.status.toLowerCase() === 'rejected').length;

  const kpiData = [
    { 
      icon: FolderOpen, 
      label: 'Active Projects', 
      value: loading ? '...' : assignedProjects.length.toString(), 
      color: 'bg-blue-500', 
      trend: `${assignedProjects.length} assigned` 
    },
    { 
      icon: AlertCircle, 
      label: 'Material Requests', 
      value: loading ? '...' : validRequests.length.toString(), 
      color: 'bg-purple-500', 
      trend: `${pendingCount} pending` 
    },
  ];

  const getStatusColor = (status) => {
    const statusLower = status?.toLowerCase();
    const colorMap = {
      'active': 'bg-green-100 text-green-800',
      'ongoing': 'bg-green-100 text-green-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'on hold': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colorMap[statusLower] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplay = (status) => {
    const statusMap = {
      'PENDING': 'Planning',
      'ONGOING': 'In Progress',
      'COMPLETED': 'Completed',
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return statusMap[status] || status;
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <EmployeeNavbar/>
        <div className="mt-26 flex items-center justify-center p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-lg font-semibold text-red-900">Error Loading Dashboard</h2>
            </div>
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar/>
      
      <div className="mt-26">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Hello, {employeeName} 👷‍♂️</h1>
              <p className="text-sm text-gray-600 mt-1">{currentDate}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                {employeeName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {kpiData.map((kpi, index) => (
            <div key={index} className="bg-white rounded-lg text-center shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-start justify-center">
                <div className={`${kpi.color} p-3 rounded-lg`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">{kpi.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                <p className="text-xs text-gray-500 mt-1">{kpi.trend}</p>
              </div>
            </div>
          ))}
        </div>

        {assignedProjects.length > 0 && (
  <>
    {console.log('📊 Projects being rendered:', assignedProjects.map(p => ({
      id: p.id,
      name: p.name,
      progress: p.progress,
      actualProgress: p.actualProgress
    })))}
    
    {/* <div className="space-y-4"> */}
      {/* {assignedProjects.map((project) => ( */}
      {/* <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors"> */}
          {/* Your existing project card JSX */}
        {/* </div> */}
      {/* ))} */}
    {/* </div> */}
  </>
)}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Progress */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">My Assigned Projects</h2>
                {/* <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View All</button> */}
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading projects...</div>
              ) : assignedProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No projects assigned yet</div>
              ) : (
                <div className="space-y-4">
                  {assignedProjects.map((project) => (
                    <div key={project.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                   <div className="flex justify-between items-start mb-2">
  <div className="flex-1">
    <h3 className="font-semibold text-gray-900">{project.name}</h3>
    <p className="text-sm text-gray-600">{project.clientName}</p>
  </div>
  <div className="flex items-center gap-2 flex-shrink-0">
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
      {getStatusDisplay(project.status)}
    </span>
    <button 
      onClick={() => handleDownloadReport(project)}
      className="flex items-center gap-1 px-3 py-1.5 text-xs text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
      title="Download Project Report"
    >
      <FileDown className="w-4 h-4" />
      <span className="hidden sm:inline">Report</span>
    </button>
  </div>
</div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <p className="text-gray-600">Type</p>
                          <p className="font-medium text-gray-900">{project.projectType || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium text-gray-900">{project.location || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Deadline</p>
                          <p className="font-medium text-gray-900">
                            {project.endDate ? new Date(project.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                          </p>
                        </div>
                      </div>
                      {project.budget && (
                        <div className="text-sm text-gray-600">
                          Budget: ₹{parseFloat(project.budget).toLocaleString('en-IN')}
                        </div>
                      )}

                      {/* Progress Section - ADD THIS */}
<div className= " mt-5 mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
  <div className="flex items-center justify-between mb-2">
    <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
      <Percent className="w-4 h-4" />
      Project Progress
    </span>
    <div className="flex items-center gap-2">
      <span className="text-base font-bold text-blue-600">{project.progress || 0}%</span>
      {!showProgressSlider[project.id] && (
        <button
          onClick={() => openProgressSlider(project.id, project.progress || 0)}
          className="text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Update
        </button>
      )}
    </div>
  </div>
  
  {/* Progress Bar */}
  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
    <div
      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300"
      style={{ width: `${project.progress || 0}%` }}
    />
  </div>

  {/* Progress Update Slider */}
  {showProgressSlider[project.id] && (
    <div className="mt-3 p-3 bg-white rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-gray-700">
          Update Progress: {tempProgress[project.id]}%
        </label>
        <div className="flex gap-2">
          <button
            onClick={() => closeProgressSlider(project.id)}
            className="text-xs px-2 py-1 text-gray-600 hover:bg-gray-100 rounded"
            disabled={isUpdatingProgress[project.id]}
          >
            Cancel
          </button>
         <button
  onClick={() => handleProgressUpdate(project.id)}  // ✅ Fixed - only pass project.id
  disabled={isUpdatingProgress[project.id] || tempProgress[project.id] === project.progress}
  className="text-xs px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
>
  {isUpdatingProgress[project.id] ? 'Saving...' : 'Save'}
</button>
        </div>
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={tempProgress[project.id]}
        onChange={(e) => setTempProgress({ ...tempProgress, [project.id]: parseInt(e.target.value) })}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        disabled={isUpdatingProgress[project.id]}
      />
      <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )}
</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Material Request Insights */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Material Request Status</h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600 font-medium">✓ {approvedCount} Approved</span>
                  <span className="text-orange-600 font-medium flex gap-1">
                    <AlertCircle size={15} className='mt-1'/> {pendingCount} Pending
                  </span>
                  <span className="text-red-600 font-medium flex gap-1">
                    <X size={15} className='mt-1'/> {rejectedCount} Rejected
                  </span>
                </div>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading requests...</div>
              ) : materialRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No material requests yet</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Material</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Project</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Quantity</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date</th>
                        <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {materialRequests.map((request) => (
                        <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-2 text-sm text-gray-900">
                            {request.material?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {request.project?.name || 'N/A'}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {request.quantity} {request.material?.unit || ''}
                          </td>
                          <td className="py-3 px-2 text-sm text-gray-600">
                            {new Date(request.createdAt).toLocaleDateString('en-IN')}
                          </td>
                          <td className="py-3 px-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                              {getStatusDisplay(request.status)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Recent Files */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Recent File Uploads</h2>
                <button
                  onClick={() => navigate('/employee/file-management')} 
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All Files
                </button>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading files...</div>
              ) : recentFiles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                  <p>No files uploaded yet</p>
                  <p className="text-xs mt-1">Upload files to your assigned projects to see them here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentFiles.map((file) => (
                    <div 
                      key={file.id} 
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                      onClick={() => handleViewFile(file)}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-100 rounded text-2xl flex-shrink-0">
                          {getFileIcon(file.fileName)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {file.fileName || 'Unnamed File'}
                          </p>
                          <p className="text-xs text-gray-600 truncate">
                            {file.projectName}
                            {file.uploaderName && ` • ${file.uploaderName}`}
                          </p>
                          {file.documentType && (
                            <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                              {file.documentType}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 ml-3">
                        <p className="text-xs text-gray-500">
                          {new Date(file.uploadedAt).toLocaleDateString('en-IN')}
                        </p>
                        <span className="text-xs text-gray-400">
                          {getFileType(file.fileName)}
                        </span>
                        {file.fileSize && (
                          <p className="text-xs text-gray-400">
                            {formatFileSize(file.fileSize)}
                          </p>
                        )}
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Notifications */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Notifications</h2>
              
              {loading ? (
                <div className="text-center py-4 text-gray-500">Loading notifications...</div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No notifications</div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif, index) => (
                    <div key={index} className="p-3 border-l-4 border-blue-500 bg-blue-50 rounded">
                      <p className="text-sm text-gray-900">{notif.message}</p>
                      <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-2">
                <button 
                  onClick={() => navigate('/employee/material-management')}
                  className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span className="font-medium">Raise Material Request</span>
                </button>
                <button 
                  onClick={() => navigate('/employee/file-management')}
                  className="w-full flex items-center gap-3 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  <span className="font-medium">Upload File</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;