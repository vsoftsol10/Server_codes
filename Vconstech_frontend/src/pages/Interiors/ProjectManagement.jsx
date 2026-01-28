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
    startDate: "",
    endDate: "",
    location: "",
    assignedEmployee: "",
    description: "",
  });

  // At the top of ProjectManagement.jsx
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (mounted) {
        await loadProjects();
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []); // Empty dependency array

  const handleStatusChangeInline = async (projectId, newStatus) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) {
        throw new Error("Project not found");
      }

      // Transform frontend status to backend format
      const backendStatus = transformStatusToBackend(newStatus);

      // Update status using the dedicated method
      await projectAPI.updateProjectStatus(project.dbId, backendStatus);

      // Reload projects to get fresh data
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

      console.log("🔄 Fetching projects at:", new Date().toISOString());

      // ✅ Use the service that calculates actual spent
      const enrichedProjects =
        await costCalculationService.getAllProjectsWithSpent();

      console.log("📦 Received enriched projects:", enrichedProjects.length);

      // Transform data to match frontend format
      const transformedProjects = enrichedProjects.map((project) => ({
        id: project.projectId,
        dbId: project.id,
        name: project.name,
        client: project.clientName,
        type: project.projectType,
        status: transformStatus(project.status),
        progress: project.actualProgress || 0,
        budget: project.budget || 0,
        spent: project.spent || 0, // ✅ Use calculated spent from service
        spentBreakdown: project.spentBreakdown, // ✅ Include breakdown
        startDate: project.startDate
          ? new Date(project.startDate).toISOString().split("T")[0]
          : "",
        endDate: project.endDate
          ? new Date(project.endDate).toISOString().split("T")[0]
          : "",
        location: project.location || "",
        team: project.assignedEngineer ? [project.assignedEngineer.name] : [],
        assignedEmployee: project.assignedEngineer
          ? project.assignedEngineer.id.toString()
          : "",
        assignedEngineerName: project.assignedEngineer
          ? project.assignedEngineer.name
          : "",
        assignedEngineerEmpId: project.assignedEngineer
          ? project.assignedEngineer.empId
          : "",
        tasks: {
          total: project._count?.materialUsed || 0,
          completed: 0,
        },
        description: project.description || "",
      }));

      console.log("✅ Setting projects with real calculated spent");
      setProjects(transformedProjects);
    } catch (err) {
      console.error("Failed to load projects:", err);
      setError(err.error || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // Transform backend status to frontend format
  const transformStatus = (status) => {
    const statusMap = {
      PENDING: "Planning",
      ONGOING: "In Progress",
      COMPLETED: "Completed",
    };
    return statusMap[status] || status;
  };

  // Transform frontend status to backend format
  const transformStatusToBackend = (status) => {
    const statusMap = {
      Planning: "PENDING",
      "In Progress": "ONGOING",
      Completed: "COMPLETED",
    };
    return statusMap[status] || "PENDING";
  };

  const calculateProgress = (project) => {
    // ✅ Use actualProgress from database
    return project.actualProgress || 0;
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
      case "Completed":
        return "bg-green-100 text-green-700";
      case "In Progress":
        return "bg-blue-100 text-blue-700";
      case "Planning":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "In Progress":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Planning":
        return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return null;
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
      console.log("🔄 Reloading projects after progress update...");
      await loadProjects();
      console.log("✅ Projects reloaded");
    } catch (err) {
      console.error("❌ Failed to reload projects:", err);
    }
  };
  const handleCreateProject = async (file) => {
    if (
      !newProject.name ||
      !newProject.projectId ||
      !newProject.client ||
      !newProject.location ||
      !newProject.assignedEmployee
    ) {
      throw new Error(
        "Please fill in all required fields (Name, ID, Client, Location, and Site Engineer)"
      );
    }

    try {
      console.log("🚀 Starting project creation:", newProject.projectId);

      const result = await projectAPI.createProject(newProject, file);
      console.log("✅ Project created in DB:", result);

      console.log("🔄 Reloading projects list...");
      await loadProjects();
      console.log("✅ Projects reloaded");

      setShowNewProjectModal(false);
      setNewProject({
        name: "",
        projectId: "",
        client: "",
        type: "Residential",
        budget: "",
        startDate: "",
        endDate: "",
        location: "",
        assignedEmployee: "",
        description: "",
      });

      alert("Project created successfully!");
    } catch (err) {
      console.error("❌ Create project failed:", err);
      alert(
        `Failed to create project: ${
          err.message || err.error || "Unknown error"
        }`
      );
      throw err; // Re-throw so the modal can handle it
    }
  };

  const handleEditProject = (project) => {
    // Transform project data for editing - keep frontend status format
    const editData = {
      ...project,
      client: project.client,
      // Keep status in frontend format for the modal
      status: project.status,
    };
    setEditingProject(editData);
    setShowEditModal(true);
  };

  const handleUpdateProject = async (file) => {
    if (!editingProject.name || !editingProject.client) {
      throw new Error("Please fill in all required fields");
    }

    try {
      // ✅ Explicitly include progress in the update
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
        progress: editingProject.progress, // ✅ Include progress
        status: editingProject.status
          ? transformStatusToBackend(editingProject.status)
          : undefined,
      };

      console.log("Updating project with data:", projectData); // Debug log

      await projectAPI.updateProject(editingProject.dbId, projectData, file);

      await loadProjects();

      setShowEditModal(false);
      setSelectedProject(null);
      setEditingProject(null);

      alert("Project updated successfully!");
    } catch (err) {
      console.error("Update failed:", err);
      throw err;
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this project? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) return;

      await projectAPI.deleteProject(project.dbId);

      // ✅ Reload from database instead of just filtering local state
      await loadProjects();

      if (selectedProject && selectedProject.id === projectId) {
        setSelectedProject(null);
      }

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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="fixed left-0 top-16 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="mt-26 pl-16 md:pl-64 min-h-screen">
        <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-16 z-30">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-gray-900">Projects</h1>
          </div>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center gap-1 bg-black text-white px-3 py-2 rounded-lg text-sm hover:bg-gray-800"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden xs:inline">New</span>
          </button>
        </div>

        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Project Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage and track all your interior design projects
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5" />
                New Project
              </button>
              <button
                onClick={() =>
                  projectReportService.downloadAllProjectsReport(projects)
                }
                className="flex items-center gap-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
              >
                <Download className="w-5 h-5" />
                Download All Reports
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            <p className="font-medium">Error loading projects</p>
            <p className="text-sm">{error}</p>
            <button onClick={loadProjects} className="mt-2 text-sm underline">
              Try again
            </button>
          </div>
        )}

        <div className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <StatsCard
              icon={FileText}
              label="Total Projects"
              value={stats.total}
              bgColor="bg-blue-100"
              iconColor="text-blue-600"
            />
            <StatsCard
              icon={Clock}
              label="In Progress"
              value={stats.inProgress}
              bgColor="bg-yellow-100"
              iconColor="text-yellow-600"
            />
            <StatsCard
              icon={CheckCircle}
              label="Completed"
              value={stats.completed}
              bgColor="bg-green-100"
              iconColor="text-green-600"
            />
            <StatsCard
              icon={IndianRupee}
              label="Total Budget"
              value={`₹${(stats.totalBudget / 1000).toFixed(0)}k`}
              bgColor="bg-purple-100"
              iconColor="text-purple-600"
            />
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 sm:mb-6">
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm w-full sm:w-auto"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="hidden sm:inline">Filter</span>
                    {filterType !== "all" && (
                      <span className="bg-blue-500 text-white rounded-full w-2 h-2"></span>
                    )}
                  </button>
                  {showFilterDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-600 px-2 py-1">
                          Filter by Type
                        </p>
                        {[
                          "all",
                          "Residential",
                          "Commercial",
                          "Office",
                          "Renovation",
                        ].map((type) => (
                          <button
                            key={type}
                            onClick={() => {
                              setFilterType(type);
                              setShowFilterDropdown(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-sm ${
                              filterType === type
                                ? "bg-blue-50 text-blue-600"
                                : "hover:bg-gray-50"
                            }`}
                          >
                            {type === "all" ? "All Types" : type}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 px-3 sm:px-4 py-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
              {[
                { id: "all", label: "All" },
                { id: "in-progress", label: "In Progress" },
                { id: "completed", label: "Completed" },
                { id: "planning", label: "Planning" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap text-sm ${
                    activeTab === tab.id
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="divide-y divide-gray-200">
              {filteredProjects.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No projects found</p>
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
  onDownloadReport={handleDownloadReport}  // ✅ Add this line
/>
                ))
              )}
            </div>
          </div>
        </div>

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
          onQuickAction={(action) =>
            alert(`${action} feature will be available soon!`)
          }
        />
      </div>
    </div>
  );
};

export default ProjectManagement;
