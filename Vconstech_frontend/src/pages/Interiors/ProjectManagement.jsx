import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  IndianRupee,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import SidePannel from "../../components/common/SidePannel";
import StatsCard from "../../components/ProjectManagement/StatsCard";
import ProjectCard from "../../components/ProjectManagement/ProjectCard";
import ProjectFormModal from "../../components/ProjectManagement/ProjectFormModal";
import ProjectDetailsModal from "../../components/ProjectManagement/ProjectDetailsModal";
import { projectAPI } from "../../api/projectAPI";
import costCalculationService from "../../api/costCalculationService";
import projectReportService from "../../services/projectReportService";
import { Download } from "lucide-react";

const ProjectManagement = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [newProject, setNewProject] = useState({
    name: "",
    projectId: "",
    client: "",
    type: "Residential",
    budget: "",
    quotationAmount: "",
    startDate: "",
    endDate: "",
    location: "",
    assignedEmployee: "",
    description: "",
  });

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (mounted) await loadProjects();
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const handleStatusChangeInline = async (projectId, newStatus) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error("Project not found");
      const backendStatus = transformStatusToBackend(newStatus);
      await projectAPI.updateProjectStatus(project.dbId, backendStatus);
      await loadProjects();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert(err.error || "Failed to update project status");
      throw err;
    }
  };

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const enrichedProjects = await costCalculationService.getAllProjectsWithSpent();
      const transformedProjects = enrichedProjects.map((project) => ({
        id: project.projectId,
        dbId: project.id,
        name: project.name,
        client: project.clientName,
        type: project.projectType,
        status: transformStatus(project.status),
        progress: project.actualProgress || 0,
        budget: project.budget || 0,
        spent: project.spent || 0,
        spentBreakdown: project.spentBreakdown,
        startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
        endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
        location: project.location || "",
        team: project.assignedEngineer ? [project.assignedEngineer.name] : [],
        assignedEmployee: project.assignedEngineer ? project.assignedEngineer.id.toString() : "",
        assignedEngineerName: project.assignedEngineer ? project.assignedEngineer.name : "",
        assignedEngineerEmpId: project.assignedEngineer ? project.assignedEngineer.empId : "",
        tasks: { total: project._count?.materialUsed || 0, completed: 0 },
        description: project.description || "",
      }));
      setProjects(transformedProjects);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError(err.error || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const transformStatus = (status) => {
    const statusMap = { PENDING: "Planning", ONGOING: "In Progress", COMPLETED: "Completed" };
    return statusMap[status] || status;
  };

  const transformStatusToBackend = (status) => {
    const statusMap = { Planning: "PENDING", "In Progress": "ONGOING", Completed: "COMPLETED" };
    return statusMap[status] || "PENDING";
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    planning: projects.filter((p) => p.status === "Planning").length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-700";
      case "In Progress": return "bg-blue-100 text-blue-700";
      case "Planning": return "bg-yellow-100 text-yellow-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed": return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "In Progress": return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Planning": return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return null;
    }
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab =
      activeTab === "all" ||
      project.status.toLowerCase().replace(" ", "-") === activeTab;
    const matchesFilter = filterType === "all" || project.type === filterType;
    return matchesSearch && matchesTab && matchesFilter;
  });

  const handleDownloadReport = async (project) => {
    try {
      const html = await projectReportService.generateReport(project);
      projectReportService.downloadReport(html, project.name);
    } catch (error) {
      alert("Failed to generate report: " + error.message);
    }
  };

  const handleProgressUpdate = async () => {
    try {
      await loadProjects();
    } catch (err) {
      console.error("❌ Failed to reload projects:", err);
    }
  };

  const handleCreateProject = async (file) => {
    if (!newProject.name || !newProject.client || !newProject.location) {
      throw new Error("Please fill in all required fields (Name, ID, Client, and Location)");
    }
    try {
      const result = await projectAPI.createProject(newProject, file);
      await loadProjects();
      setShowNewProjectModal(false);
      setNewProject({
        name: "", projectId: "", client: "", type: "Residential",
        budget: "", startDate: "", endDate: "", location: "",
        assignedEmployee: "", description: "",
      });
      alert("Project created successfully!");
    } catch (err) {
      console.error("❌ Create project failed:", err);
      alert(`Failed to create project: ${err.message || err.error || "Unknown error"}`);
      throw err;
    }
  };

  const handleEditProject = (project) => {
    setEditingProject({ ...project, client: project.client, status: project.status, progress: project.progress || 0 });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (file) => {
    if (!editingProject.name || !editingProject.client) {
      throw new Error("Please fill in all required fields");
    }
    try {
      const projectData = {
        name: editingProject.name,
        client: editingProject.client,
        type: editingProject.type,
        budget: editingProject.budget,
        quotationAmount: editingProject.quotationAmount,
        startDate: editingProject.startDate,
        endDate: editingProject.endDate,
        location: editingProject.location,
        assignedEmployee: editingProject.assignedEmployee,
        description: editingProject.description,
        status: editingProject.status ? transformStatusToBackend(editingProject.status) : undefined,
      };
      if (editingProject.progress !== undefined && editingProject.progress !== null) {
        projectData.progress = editingProject.progress;
      }
      await projectAPI.updateProject(editingProject.dbId, projectData, file);
      await loadProjects();
      setShowEditModal(false);
      setSelectedProject(null);
      setEditingProject(null);
      alert("Project updated successfully!");
    } catch (err) {
      console.error("❌ Update failed:", err);
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;
      await projectAPI.deleteProject(project.dbId);
      await loadProjects();
      if (selectedProject && selectedProject.id === projectId) setSelectedProject(null);
      alert("Project deleted successfully!");
    } catch (err) {
      console.error("Failed to delete project:", err);
      alert(err.error || "Failed to delete project");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      {/* SidePannel — renders desktop sidebar + mobile bottom nav internally */}
      <SidePannel />

      {/* Main content: push right on desktop, no push on mobile */}
      <div className="pt-25 md:pl-64">

        {/* ── Mobile sticky sub-header ── */}
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-3 flex items-center justify-between sticky top-16 z-30">
          <h1 className="text-base font-bold text-gray-900">Projects</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={() => projectReportService.downloadAllProjectsReport(projects)}
              className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              Reports
            </button>
            <button
              onClick={() => setShowNewProjectModal(true)}
              className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              New
            </button>
          </div>
        </div>

        {/* ── Desktop header ── */}
        <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and track all your projects</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
              <button
                onClick={() => projectReportService.downloadAllProjectsReport(projects)}
                className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                Download All Reports
              </button>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <p className="font-medium">Error loading projects</p>
            <p className="text-xs mt-0.5">{error}</p>
            <button onClick={loadProjects} className="mt-1.5 text-xs underline">Try again</button>
          </div>
        )}

        {/* ── Page body ── */}
        <div className="px-3 sm:px-4 lg:px-6 pt-3 pb-24 md:pb-8 space-y-4">

          {/* Stats grid — 2 cols mobile, 4 cols desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatsCard icon={FileText}     label="Total Projects" value={stats.total}      bgColor="bg-blue-100"   iconColor="text-blue-600" />
            <StatsCard icon={Clock}        label="In Progress"    value={stats.inProgress}  bgColor="bg-yellow-100" iconColor="text-yellow-600" />
            <StatsCard icon={CheckCircle}  label="Completed"      value={stats.completed}   bgColor="bg-green-100"  iconColor="text-green-600" />
            <StatsCard icon={IndianRupee}  label="Total Budget"   value={`₹${(stats.totalBudget / 1000).toFixed(0)}k`} bgColor="bg-purple-100" iconColor="text-purple-600" />
          </div>

          {/* Search / filter / tabs + project list */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">

            {/* Search + filter row */}
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {filterType !== "all" && (
                      <span className="w-2 h-2 bg-yellow-500 rounded-full" />
                    )}
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-10 py-1">
                      <p className="text-xs font-semibold text-gray-500 px-3 py-1.5 uppercase tracking-wide">Type</p>
                      {["all", "Residential", "Commercial", "Industrial", "Renovation"].map((type) => (
                        <button
                          key={type}
                          onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                          className={`w-full text-left px-3 py-2 text-sm transition-colors ${
                            filterType === type ? "bg-yellow-50 text-yellow-800 font-medium" : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {type === "all" ? "All Types" : type}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tab pills */}
            <div className="flex gap-1.5 px-3 py-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
              {[
                { id: "all", label: "All" },
                { id: "in-progress", label: "In Progress" },
                { id: "completed", label: "Completed" },
                { id: "planning", label: "Planning" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-xs sm:text-sm flex-shrink-0 ${
                    activeTab === tab.id
                      ? "bg-yellow-400 text-black"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Project list */}
            <div className="divide-y divide-gray-100">
              {filteredProjects.length === 0 ? (
                <div className="p-10 text-center text-gray-400">
                  <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No projects found</p>
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onView={setSelectedProject}
                    onEdit={handleEditProject}
                    onDelete={handleDeleteProject}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                    onStatusChange={handleStatusChangeInline}
                    onProgressUpdate={handleProgressUpdate}
                    onDownloadReport={handleDownloadReport}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ProjectFormModal
        isOpen={showNewProjectModal}
        onClose={() => setShowNewProjectModal(false)}
        project={newProject}
        onChange={setNewProject}
        onSubmit={handleCreateProject}
        title="Create New Project"
        submitLabel="Create Project"
      />
      <ProjectFormModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        project={editingProject || {}}
        onChange={setEditingProject}
        onSubmit={handleUpdateProject}
        title="Edit Project"
        submitLabel="Update Project"
      />
      <ProjectDetailsModal
        project={selectedProject}
        onClose={() => setSelectedProject(null)}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        onQuickAction={(action) => alert(`${action} feature will be available soon!`)}
      />
    </div>
  );
};

export default ProjectManagement;