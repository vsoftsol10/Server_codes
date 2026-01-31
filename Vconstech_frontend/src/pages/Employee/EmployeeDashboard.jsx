import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, AlertCircle, FolderOpen } from 'lucide-react';
import EmployeeNavbar from '../../components/Employee/EmployeeNavbar';
import projectReportService from '../../services/projectReportService';
import useEmployeeDashboard from '../../hooks/useEmployeeDashboard';
import {
  getFileIcon,
  getFileType,
  formatFileSize,
  getStatusColor,
  getStatusDisplay,
  handleViewFile,
  generatePrintContent
} from '../../utils/dashboardUtils';

// Import extracted components
import KPICard from '../../components/Employee/EmployeeDashboard/KPICard';
import ProjectCard from '../../components/Employee/EmployeeDashboard/ProjectCard';
import MaterialRequestTable from '../../components/Employee/EmployeeDashboard/MaterialRequestTable';
import RecentFiles from '../../components/Employee/EmployeeDashboard/RecentFiles';
import DailyProgressHistory from '../../components/Employee/EmployeeDashboard/DailyProgressHistory';
import Notifications from '../../components/Employee/EmployeeDashboard//Notifications';
import QuickActions from '../../components/Employee/EmployeeDashboard//QuickActions';

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
  
  const {
    employeeName,
    assignedProjects,
    materialRequests,
    notifications,
    recentFiles,
    loading,
    error,
    showProgressSlider,
    tempProgress,
    isUpdatingProgress,
    showProgressMessage,
    progressMessage,
    isSubmittingMessage,
    dailyProgressHistory,
    loadingHistory,
    setShowProgressSlider,
    setTempProgress,
    setShowProgressMessage,
    setProgressMessage,
    handleProgressUpdate,
    handleSubmitProgressMessage,
    fetchDailyProgressHistory
  } = useEmployeeDashboard();

  const currentDate = new Date().toLocaleDateString('en-IN', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Progress handlers
  const openProgressSlider = (projectId, currentProgress) => {
    setTempProgress({ ...tempProgress, [projectId]: currentProgress });
    setShowProgressSlider({ ...showProgressSlider, [projectId]: true });
  };

  const closeProgressSlider = (projectId) => {
    setShowProgressSlider({ ...showProgressSlider, [projectId]: false });
  };

  const handleProgressChange = (projectId, value) => {
    setTempProgress({ ...tempProgress, [projectId]: value });
  };

  const toggleProgressMessage = (projectId) => {
    setShowProgressMessage({ 
      ...showProgressMessage, 
      [projectId]: !showProgressMessage[projectId] 
    });
  };

  const closeProgressMessage = (projectId) => {
    setShowProgressMessage({ ...showProgressMessage, [projectId]: false });
    setProgressMessage({ ...progressMessage, [projectId]: '' });
  };

  const handleProgressMessageChange = (projectId, value) => {
    setProgressMessage({ ...progressMessage, [projectId]: value });
  };

  // Report download handler
  const handleDownloadReport = async (project) => {
    try {
      const html = await projectReportService.generateReport(project);
      projectReportService.downloadReport(html, project.name);
    } catch (error) {
      console.error('❌ Error generating report:', error);
      alert(`Failed to generate report: ${error.message}`);
    }
  };

  // Print handler
  const handlePrintHistory = () => {
    const printWindow = window.open('', '_blank');
    const printContent = generatePrintContent(dailyProgressHistory, employeeName);
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  // Calculate stats
  const validRequests = materialRequests.filter(r => r.material && r.project);
  const approvedCount = validRequests.filter(r => r.status.toLowerCase() === 'approved').length;
  const pendingCount = validRequests.filter(r => r.status.toLowerCase() === 'pending').length;
  const rejectedCount = validRequests.filter(r => r.status.toLowerCase() === 'rejected').length;
  const completedProjectsCount = assignedProjects.filter(
  p => p.status?.toLowerCase() === 'completed'
).length;
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
  { 
    icon: FileText, // or use CheckCircle if you import it
    label: 'Completed Projects', 
    value: loading ? '...' : completedProjectsCount.toString(), 
    color: 'bg-green-500', 
    trend: `${completedProjectsCount} finished` 
  },
];

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
      
      {/* Header */}
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {kpiData.map((kpi, index) => (
            <KPICard key={index} {...kpi} />
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">My Assigned Projects</h2>
              </div>
              
              {loading ? (
                <div className="text-center py-8 text-gray-500">Loading projects...</div>
              ) : assignedProjects.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No projects assigned yet</div>
              ) : (
                <div className="space-y-4">
                  {assignedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      showProgressSlider={showProgressSlider}
                      tempProgress={tempProgress}
                      isUpdatingProgress={isUpdatingProgress}
                      showProgressMessage={showProgressMessage}
                      progressMessage={progressMessage}
                      isSubmittingMessage={isSubmittingMessage}
                      onOpenProgressSlider={openProgressSlider}
                      onCloseProgressSlider={closeProgressSlider}
                      onUpdateProgress={handleProgressUpdate}
                      onProgressChange={handleProgressChange}
                      onToggleProgressMessage={toggleProgressMessage}
                      onCloseProgressMessage={closeProgressMessage}
                      onSubmitProgressMessage={handleSubmitProgressMessage}
                      onProgressMessageChange={handleProgressMessageChange}
                      onDownloadReport={handleDownloadReport}
                      getStatusColor={getStatusColor}
                      getStatusDisplay={getStatusDisplay}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Material Requests */}
            <MaterialRequestTable
              materialRequests={materialRequests}
              loading={loading}
              approvedCount={approvedCount}
              pendingCount={pendingCount}
              rejectedCount={rejectedCount}
              getStatusColor={getStatusColor}
              getStatusDisplay={getStatusDisplay}
            />

            {/* Recent Files */}
            <RecentFiles
              recentFiles={recentFiles}
              loading={loading}
              onViewFile={(file) => handleViewFile(file, API_BASE_URL)}
              onNavigateToFiles={() => navigate('/employee/file-management')}
              getFileIcon={getFileIcon}
              getFileType={getFileType}
              formatFileSize={formatFileSize}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <Notifications notifications={notifications} loading={loading} />
            
            <QuickActions
              onMaterialRequest={() => navigate('/employee/material-management')}
              onFileUpload={() => navigate('/employee/file-management')}
            />

            <DailyProgressHistory
              dailyProgressHistory={dailyProgressHistory}
              loadingHistory={loadingHistory}
              onPrintHistory={handlePrintHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;