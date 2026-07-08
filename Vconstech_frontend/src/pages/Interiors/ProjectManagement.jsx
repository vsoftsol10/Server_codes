// import React, { useState, useEffect } from "react";
// import {
//   Plus,
//   Search,
//   Filter,
//   IndianRupee,
//   FileText,
//   CheckCircle,
//   Clock,
//   AlertCircle,
// } from "lucide-react";
// import Navbar from "../../components/common/Navbar";
// import SidePannel from "../../components/common/SidePannel";
// import StatsCard from "../../components/ProjectManagement/StatsCard";
// import ProjectCard from "../../components/ProjectManagement/ProjectCard";
// import ProjectFormModal from "../../components/ProjectManagement/ProjectFormModal";
// import ProjectDetailsModal from "../../components/ProjectManagement/ProjectDetailsModal";
// import { projectAPI } from "../../api/projectAPI";
// import costCalculationService from "../../api/costCalculationService";
// import projectReportService from "../../services/projectReportService";
// import { Download } from "lucide-react";
// import LoadingScreen from "../../components/common/Loadingscreen";

// const ProjectManagement = () => {
//   const [activeTab, setActiveTab] = useState("all");
//   const [showNewProjectModal, setShowNewProjectModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [showFilterDropdown, setShowFilterDropdown] = useState(false);
//   const [filterType, setFilterType] = useState("all");
//   const [editingProject, setEditingProject] = useState(null);
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [packageInfo, setPackageInfo] = useState(null);

//   const [newProject, setNewProject] = useState({
//     name: "",
//     projectId: "",
//     client: "",
//     type: "Residential",
//     budget: "",
//     quotationAmount: "",
//     startDate: "",
//     endDate: "",
//     location: "",
//     assignedEmployee: "",
//     description: "",
//   });

//   const fetchPackageInfo = async () => {
//   const user = JSON.parse(localStorage.getItem("user") || "{}");
//   if (user.package) {
//     const pkg = user.package.toLowerCase();
//     const limit = pkg === "free" ? 2 : pkg === "basic" ? 5 : pkg === "premium" ? 15 : pkg === "advanced" ? (user.customMembers || 999) : 1;
//     setPackageInfo({ package: user.package, limit });
//   } else {
//     try {
//       const token = getAuthToken();
//       const response = await fetch("/api/engineers/me", {
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       if (response.ok) {
//         const data = await response.json();
//         if (data.success && data.user) {
//           const pkg = data.user.package?.toLowerCase();
//           const limit = pkg === "free" ? 1 : pkg === "basic" ? 5 : pkg === "premium" ? 15 : pkg === "advanced" ? (data.user.customMembers || 999) : 1;
//           setPackageInfo({ package: data.user.package, limit });
//           localStorage.setItem("user", JSON.stringify(data.user));
//         }
//       }
//     } catch (err) { console.error("Error fetching package info:", err); }
//   }
// };
//   useEffect(() => {
//       document.title = "Vconstech - Admin";
//     }, []);

//   useEffect(() => {
//     let mounted = true;
//     const fetchData = async () => {
//       if (mounted) {
//       await loadProjects();
//       await fetchPackageInfo(); // add this
//     }
//     };
//     fetchData();
//     return () => { mounted = false; };
//   }, []);

//   const handleStatusChangeInline = async (projectId, newStatus) => {
//     try {
//       const project = projects.find((p) => p.id === projectId);
//       if (!project) throw new Error("Project not found");
//       const backendStatus = transformStatusToBackend(newStatus);
//       await projectAPI.updateProjectStatus(project.dbId, backendStatus);
//       await loadProjects();
//     } catch (err) {
//       console.error("Failed to update status:", err);
//       alert(err.error || "Failed to update project status");
//       throw err;
//     }
//   };

//   const loadProjects = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const enrichedProjects = await costCalculationService.getAllProjectsWithSpent();
//       const transformedProjects = enrichedProjects.map((project) => ({
//         id: project.projectId,
//         dbId: project.id,
//         name: project.name,
//         client: project.clientName,
//         type: project.projectType,
//         status: transformStatus(project.status),
//         progress: project.actualProgress || 0,
//         budget: project.budget || 0,
//         spent: project.spent || 0,
//         spentBreakdown: project.spentBreakdown,
//         startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
//         endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
//         location: project.location || "",
//         team: project.assignedEngineer ? [project.assignedEngineer.name] : [],
//         assignedEmployee: project.assignedEngineer ? project.assignedEngineer.id.toString() : "",
//         assignedEngineerName: project.assignedEngineer ? project.assignedEngineer.name : "",
//         assignedEngineerEmpId: project.assignedEngineer ? project.assignedEngineer.empId : "",
//         tasks: { total: project._count?.materialUsed || 0, completed: 0 },
//         description: project.description || "",
//       }));
//       setProjects(transformedProjects);
//     } catch (err) {
//       console.error("Failed to load projects:", err);
//       setError(err.error || "Failed to load projects");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const transformStatus = (status) => {
//     const statusMap = { PENDING: "Planning", ONGOING: "In Progress", COMPLETED: "Completed" };
//     return statusMap[status] || status;
//   };

//   const transformStatusToBackend = (status) => {
//     const statusMap = { Planning: "PENDING", "In Progress": "ONGOING", Completed: "COMPLETED" };
//     return statusMap[status] || "PENDING";
//   };

//   const stats = {
//     total: projects.length,
//     inProgress: projects.filter((p) => p.status === "In Progress").length,
//     completed: projects.filter((p) => p.status === "Completed").length,
//     planning: projects.filter((p) => p.status === "Planning").length,
//     totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
//     totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
//   };

//   const getStatusColor = (status) => {
//     switch (status) {
//       case "Completed": return "bg-green-100 text-green-700";
//       case "In Progress": return "bg-blue-100 text-blue-700";
//       case "Planning": return "bg-yellow-100 text-yellow-700";
//       default: return "bg-gray-100 text-gray-700";
//     }
//   };

//   const getStatusIcon = (status) => {
//     switch (status) {
//       case "Completed": return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
//       case "In Progress": return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
//       case "Planning": return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
//       default: return null;
//     }
//   };

//   const filteredProjects = projects.filter((project) => {
//     const matchesSearch =
//       project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       project.client.toLowerCase().includes(searchQuery.toLowerCase());
//     const matchesTab =
//       activeTab === "all" ||
//       project.status.toLowerCase().replace(" ", "-") === activeTab;
//     const matchesFilter = filterType === "all" || project.type === filterType;
//     return matchesSearch && matchesTab && matchesFilter;
//   });

//   const handleNewProjectClick = () => {
//   if (packageInfo && projects.length >= packageInfo.limit) {
//     alert(
//       `Cannot add more projects. Your ${packageInfo.package} package allows ${packageInfo.limit} projects. Please upgrade to add more.`
//     );
//     return;
//   }
//   setShowNewProjectModal(true);
// };

//   const handleDownloadReport = async (project) => {
//     try {
//       const html = await projectReportService.generateReport(project);
//       projectReportService.downloadReport(html, project.name);
//     } catch (error) {
//       alert("Failed to generate report: " + error.message);
//     }
//   };

//   const handleProgressUpdate = async () => {
//     try {
//       await loadProjects();
//     } catch (err) {
//       console.error("❌ Failed to reload projects:", err);
//     }
//   };

//   const handleCreateProject = async (file) => {
//     if (!newProject.name || !newProject.client || !newProject.location) {
//       throw new Error("Please fill in all required fields (Name, ID, Client, and Location)");
//     }
//     try {
//       const result = await projectAPI.createProject(newProject, file);
//       await loadProjects();
//       setShowNewProjectModal(false);
//       setNewProject({
//         name: "", projectId: "", client: "", type: "Residential",
//         budget: "", startDate: "", endDate: "", location: "",
//         assignedEmployee: "", description: "",
//       });
//       alert("Project created successfully!");
//     } catch (err) {
//       console.error("❌ Create project failed:", err);
//       alert(`Failed to create project: ${err.message || err.error || "Unknown error"}`);
//       throw err;
//     }
//   };

//   const handleEditProject = (project) => {
//     setEditingProject({ ...project, client: project.client, status: project.status, progress: project.progress || 0 });
//     setShowEditModal(true);
//   };

//   const handleUpdateProject = async (file) => {
//     if (!editingProject.name || !editingProject.client) {
//       throw new Error("Please fill in all required fields");
//     }
//     try {
//       const projectData = {
//         name: editingProject.name,
//         client: editingProject.client,
//         type: editingProject.type,
//         budget: editingProject.budget,
//         quotationAmount: editingProject.quotationAmount,
//         startDate: editingProject.startDate,
//         endDate: editingProject.endDate,
//         location: editingProject.location,
//         assignedEmployee: editingProject.assignedEmployee,
//         description: editingProject.description,
//         status: editingProject.status ? transformStatusToBackend(editingProject.status) : undefined,
//       };
//       if (editingProject.progress !== undefined && editingProject.progress !== null) {
//         projectData.progress = editingProject.progress;
//       }
//       await projectAPI.updateProject(editingProject.dbId, projectData, file);
//       await loadProjects();
//       setShowEditModal(false);
//       setSelectedProject(null);
//       setEditingProject(null);
//       alert("Project updated successfully!");
//     } catch (err) {
//       console.error("❌ Update failed:", err);
//       throw err;
//     }
//   };

//   const handleDeleteProject = async (projectId) => {
//     if (!window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) return;
//     try {
//       const project = projects.find((p) => p.id === projectId);
//       if (!project) return;
//       await projectAPI.deleteProject(project.dbId);
//       await loadProjects();
//       if (selectedProject && selectedProject.id === projectId) setSelectedProject(null);
//       alert("Project deleted successfully!");
//     } catch (err) {
//       console.error("Failed to delete project:", err);
//       alert(err.error || "Failed to delete project");
//     }
//   };

//   if (loading) {
//   return <LoadingScreen message="Loading Projects..." />;
// }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Top Navbar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 h-16">
//         <Navbar />
//       </nav>

//       {/* SidePannel — renders desktop sidebar + mobile bottom nav internally */}
//          <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
//         <SidePannel />
//       </aside>

//       {/* Main content: push right on desktop, no push on mobile */}
//       <div className="pt-25 md:pl-64">

//         {/* ── Mobile sticky sub-header ── */}
//         <div className="md:hidden bg-white border-b border-gray-200 px-3 py-3 flex items-center justify-between sticky top-16 z-30">
//           <h1 className="text-base font-bold text-gray-900">Projects</h1>
//           <div className="flex items-center gap-2">
//             <button
//               onClick={() => projectReportService.downloadAllProjectsReport(projects)}
//               className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-medium"
//             >
//               <Download className="w-3.5 h-3.5" />
//               Reports
//             </button>
//             <button
//               onClick={handleNewProjectClick}
//               className="flex items-center gap-1 bg-black text-white px-3 py-1.5 rounded-lg text-xs font-medium"
//             >
//               <Plus className="w-3.5 h-3.5" />
//               New
//             </button>
//           </div>
//         </div>

//         {/* ── Desktop header ── */}
//         <div className="hidden md:block bg-white border-b border-gray-200 px-6 py-4">
//           <div className="flex items-start justify-between">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-900">Project Management</h1>
// <p className="text-sm text-gray-600 mt-1">
//   {loading ? "Loading..." : `${projects.length} / ${packageInfo?.limit ?? "..."} Projects`}
// </p>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={handleNewProjectClick}
//                 className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm"
//               >
//                 <Plus className="w-4 h-4" />
//                 New Project
//               </button>
//               <button
//                 onClick={() => projectReportService.downloadAllProjectsReport(projects)}
//                 className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-lg text-sm font-medium"
//               >
//                 <Download className="w-4 h-4" />
//                 Download All Reports
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Error banner */}
//         {error && (
//           <div className="mx-3 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
//             <p className="font-medium">Error loading projects</p>
//             <p className="text-xs mt-0.5">{error}</p>
//             <button onClick={loadProjects} className="mt-1.5 text-xs underline">Try again</button>
//           </div>
//         )}

//         {/* ── Page body ── */}
//         <div className="px-3 sm:px-4 lg:px-6 pt-3 pb-24 md:pb-8 space-y-4">

//           {/* Stats grid — 2 cols mobile, 4 cols desktop */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//             <StatsCard icon={FileText}     label="Total Projects" value={stats.total}      bgColor="bg-blue-100"   iconColor="text-blue-600" />
//             <StatsCard icon={Clock}        label="In Progress"    value={stats.inProgress}  bgColor="bg-yellow-100" iconColor="text-yellow-600" />
//             <StatsCard icon={CheckCircle}  label="Completed"      value={stats.completed}   bgColor="bg-green-100"  iconColor="text-green-600" />
//             <StatsCard icon={IndianRupee}  label="Total Budget"   value={`₹${(stats.totalBudget / 1000).toFixed(0)}k`} bgColor="bg-purple-100" iconColor="text-purple-600" />
//           </div>

//           {/* Search / filter / tabs + project list */}
//           <div className="bg-white rounded-xl shadow-sm border border-gray-200">

//             {/* Search + filter row */}
//             <div className="p-3 sm:p-4 border-b border-gray-200">
//               <div className="flex gap-2">
//                 <div className="flex-1 relative">
//                   <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
//                   <input
//                     type="text"
//                     placeholder="Search projects..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
//                   />
//                 </div>
//                 <div className="relative">
//                   <button
//                     onClick={() => setShowFilterDropdown(!showFilterDropdown)}
//                     className="flex items-center gap-1.5 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
//                   >
//                     <Filter className="w-4 h-4" />
//                     <span className="hidden sm:inline">Filter</span>
//                     {filterType !== "all" && (
//                       <span className="w-2 h-2 bg-yellow-500 rounded-full" />
//                     )}
//                   </button>
//                   {showFilterDropdown && (
//                     <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-200 z-10 py-1">
//                       <p className="text-xs font-semibold text-gray-500 px-3 py-1.5 uppercase tracking-wide">Type</p>
//                       {["all", "Residential", "Commercial", "Industrial", "Renovation"].map((type) => (
//                         <button
//                           key={type}
//                           onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
//                           className={`w-full text-left px-3 py-2 text-sm transition-colors ${
//                             filterType === type ? "bg-yellow-50 text-yellow-800 font-medium" : "hover:bg-gray-50 text-gray-700"
//                           }`}
//                         >
//                           {type === "all" ? "All Types" : type}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Tab pills */}
//             <div className="flex gap-1.5 px-3 py-2 border-b border-gray-200 overflow-x-auto scrollbar-hide">
//               {[
//                 { id: "all", label: "All" },
//                 { id: "in-progress", label: "In Progress" },
//                 { id: "completed", label: "Completed" },
//                 { id: "planning", label: "Planning" },
//               ].map((tab) => (
//                 <button
//                   key={tab.id}
//                   onClick={() => setActiveTab(tab.id)}
//                   className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap text-xs sm:text-sm flex-shrink-0 ${
//                     activeTab === tab.id
//                       ? "bg-yellow-400 text-black"
//                       : "text-gray-600 hover:bg-gray-100"
//                   }`}
//                 >
//                   {tab.label}
//                 </button>
//               ))}
//             </div>

//             {/* Project list */}
//             <div className="divide-y divide-gray-100">
//               {filteredProjects.length === 0 ? (
//                 <div className="p-10 text-center text-gray-400">
//                   <FileText className="w-10 h-10 mx-auto mb-2 text-gray-300" />
//                   <p className="text-sm">No projects found</p>
//                 </div>
//               ) : (
//                 filteredProjects.map((project) => (
//                   <ProjectCard
//                     key={project.id}
//                     project={project}
//                     onView={setSelectedProject}
//                     onEdit={handleEditProject}
//                     onDelete={handleDeleteProject}
//                     getStatusColor={getStatusColor}
//                     getStatusIcon={getStatusIcon}
//                     onStatusChange={handleStatusChangeInline}
//                     onProgressUpdate={handleProgressUpdate}
//                     onDownloadReport={handleDownloadReport}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Modals */}
//       <ProjectFormModal
//         isOpen={showNewProjectModal}
//         onClose={() => setShowNewProjectModal(false)}
//         project={newProject}
//         onChange={setNewProject}
//         onSubmit={handleCreateProject}
//         title="Create New Project"
//         submitLabel="Create Project"
//       />
//       <ProjectFormModal
//         isOpen={showEditModal}
//         onClose={() => setShowEditModal(false)}
//         project={editingProject || {}}
//         onChange={setEditingProject}
//         onSubmit={handleUpdateProject}
//         title="Edit Project"
//         submitLabel="Update Project"
//       />
//       <ProjectDetailsModal
//         project={selectedProject}
//         onClose={() => setSelectedProject(null)}
//         getStatusColor={getStatusColor}
//         getStatusIcon={getStatusIcon}
//         onQuickAction={(action) => alert(`${action} feature will be available soon!`)}
//       />
//     </div>
//   );
// };

// export default ProjectManagement;

import React, { useState, useEffect } from "react";
import {
  Plus, Search, Filter, IndianRupee, FileText,
  CheckCircle, Clock, AlertCircle, ChevronDown,
  LayoutGrid, List, Eye, Pencil, Trash2, MapPin, Calendar,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import SidePannel from "../../components/common/SidePannel";
import ProjectFormModal from "../../components/ProjectManagement/ProjectFormModal";
import ProjectDetailsModal from "../../components/ProjectManagement/ProjectDetailsModal";
import { projectAPI } from "../../api/projectAPI";
import costCalculationService from "../../api/costCalculationService";
import projectReportService from "../../services/projectReportService";
import { Download } from "lucide-react";
import LoadingScreen from "../../components/common/Loadingscreen";
import Pagination, { DEFAULT_PAGE_SIZE } from "../../components/common/Pagination";
import { getToken } from "../../utils/tabToken";

const API_BASE_URL = '/api';

/* ── Kanban column config ── */
const COLUMNS = [
  { status: "Planning",    label: "Planning",    dotColor: "#3b82f6", badgeBg: "bg-blue-50",   badgeText: "text-blue-600"  },
  { status: "In Progress", label: "In Progress", dotColor: "#22c55e", badgeBg: "bg-green-50",  badgeText: "text-green-600" },
  { status: "On Hold",     label: "On Hold",     dotColor: "#f97316", badgeBg: "bg-orange-50", badgeText: "text-orange-600"},
  { status: "Completed",   label: "Completed",   dotColor: "#a855f7", badgeBg: "bg-purple-50", badgeText: "text-purple-600"},
];

/* ── Inline card component (kanban style) ── */
import KanbanProjectCard from "../../components/ProjectManagement/ProjectCard";

/* ── Format helpers (used by table view) ── */
const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const fmtBudget = (v) => {
  if (!v) return "₹0";
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2)}Cr`;
  if (v >= 100000)   return `₹${(v / 100000).toFixed(2)}L`;
  if (v >= 1000)     return `₹${(v / 1000).toFixed(0)}K`;
  return `₹${v}`;
};

const ProjectManagement = () => {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("latest");
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  /* ── NEW: status filter dropdown ── */
  const [filterStatus, setFilterStatus] = useState("all");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  /* ── NEW: table pagination ── */
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE);
  const [editingProject, setEditingProject] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [packageInfo, setPackageInfo] = useState(null);

  /* ── NEW: view mode toggle (cards / table) — UI only, no backend impact ── */
  const [viewMode, setViewMode] = useState("cards");

  const [newProject, setNewProject] = useState({
    name: "", projectId: "", client: "", type: "Residential",
    budget: "", quotationAmount: "", startDate: "", endDate: "",
    location: "", assignedEmployee: "", description: "",
  });

  const getAuthToken = () => getToken();

  const fetchPackageInfo = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.package) {
      const pkg = user.package.toLowerCase();
      const limit = pkg === "free" ? 2 : pkg === "basic" ? 5 : pkg === "premium" ? 15 : pkg === "advanced" ? (user.customMembers || 999) : 1;
      setPackageInfo({ package: user.package, limit });
    } else {
      try {
        const token = getAuthToken();
        const response = await fetch("/api/engineers/me", { headers: { Authorization: `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.user) {
            const pkg = data.user.package?.toLowerCase();
            const limit = pkg === "free" ? 1 : pkg === "basic" ? 5 : pkg === "premium" ? 15 : pkg === "advanced" ? (data.user.customMembers || 999) : 1;
            setPackageInfo({ package: data.user.package, limit });
            localStorage.setItem("user", JSON.stringify(data.user));
          }
        }
      } catch (err) { console.error("Error fetching package info:", err); }
    }
  };

  useEffect(() => { document.title = "Vconstech - Admin"; }, []);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      if (mounted) { await loadProjects(); await fetchPackageInfo(); }
    };
    fetchData();
    return () => { mounted = false; };
  }, []);

  const handleStatusChangeInline = async (projectId, newStatus) => {
    try {
      const project = projects.find((p) => p.id === projectId);
      if (!project) throw new Error("Project not found");
      await projectAPI.updateProjectStatus(project.dbId, transformStatusToBackend(newStatus));
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
    const map = { PENDING: "Planning", ONGOING: "In Progress", ON_HOLD: "On Hold", COMPLETED: "Completed" };
    return map[status] || status;
  };

  const transformStatusToBackend = (status) => {
    const map = { Planning: "PENDING", "In Progress": "ONGOING", "On Hold": "ON_HOLD", Completed: "COMPLETED" };
    return map[status] || "PENDING";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":   return "bg-purple-100 text-purple-700";
      case "In Progress": return "bg-green-100 text-green-700";
      case "Planning":    return "bg-blue-100 text-blue-700";
      case "On Hold":     return "bg-orange-100 text-orange-700";
      default:            return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Completed":   return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "In Progress": return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "Planning":    return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "On Hold":     return <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return null;
    }
  };

  /* NEW: helper only used by table view for progress bar color, mirrors kanban column dot colors */
  const getStatusDotColor = (status) => {
    const col = COLUMNS.find((c) => c.status === status);
    return col ? col.dotColor : "#9ca3af";
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.status === "In Progress").length,
    completed: projects.filter((p) => p.status === "Completed").length,
    planning: projects.filter((p) => p.status === "Planning").length,
    totalBudget: projects.reduce((sum, p) => sum + p.budget, 0),
    totalSpent: projects.reduce((sum, p) => sum + p.spent, 0),
  };

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.client || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || project.type === filterType;
    const matchesStatus = filterStatus === "all" || project.status === filterStatus;
    return matchesSearch && matchesFilter && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    if (sortOrder === "latest") return new Date(b.startDate) - new Date(a.startDate);
    if (sortOrder === "oldest") return new Date(a.startDate) - new Date(b.startDate);
    if (sortOrder === "name") return a.name.localeCompare(b.name);
    return 0;
  });

  const getColumnProjects = (status) => sortedProjects.filter((p) => p.status === status);

  /* ── NEW: pagination derived data (table view only) ── */
  const totalPages = Math.max(1, Math.ceil(sortedProjects.length / rowsPerPage));
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, filterStatus, sortOrder, viewMode]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [totalPages, currentPage]);

  const handleNewProjectClick = () => {
    if (packageInfo && projects.length >= packageInfo.limit) {
      alert(`Cannot add more projects. Your ${packageInfo.package} package allows ${packageInfo.limit} projects. Please upgrade to add more.`);
      return;
    }
    setShowNewProjectModal(true);
  };

  const handleDownloadReport = async (project) => {
    try {
      const html = await projectReportService.generateReport(project);
      await projectReportService.downloadReport(html, project.name);
    } catch (error) {
      alert("Failed to generate report: " + error.message);
    }
  };

  const handleProgressUpdate = async () => {
    try { await loadProjects(); } catch (err) { console.error("Failed to reload projects:", err); }
  };

  const handleCreateProject = async (file) => {
    if (!newProject.name || !newProject.client || !newProject.location) {
      throw new Error("Please fill in all required fields (Name, ID, Client, and Location)");
    }
    try {
      await projectAPI.createProject(newProject, file);
      await loadProjects();
      setShowNewProjectModal(false);
      setNewProject({ name: "", projectId: "", client: "", type: "Residential", budget: "", startDate: "", endDate: "", location: "", assignedEmployee: "", description: "" });
      alert("Project created successfully!");
    } catch (err) {
      console.error("Create project failed:", err);
      alert(`Failed to create project: ${err.message || err.error || "Unknown error"}`);
      throw err;
    }
  };

  const handleEditProject = (project) => {
    setEditingProject({ ...project, client: project.client, status: project.status, progress: project.progress || 0 });
    setShowEditModal(true);
  };

  const handleUpdateProject = async (file) => {
    if (!editingProject.name || !editingProject.client) throw new Error("Please fill in all required fields");
    try {
      const projectData = {
        name: editingProject.name, client: editingProject.client, type: editingProject.type,
        budget: editingProject.budget, quotationAmount: editingProject.quotationAmount,
        startDate: editingProject.startDate, endDate: editingProject.endDate,
        location: editingProject.location, assignedEmployee: editingProject.assignedEmployee,
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
      console.error("Update failed:", err);
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

  if (loading) return <LoadingScreen message="Loading Projects..." />;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="pt-20 md:pl-64 md:pt-25">
        {/* ── Desktop header ── */}
        <div className="hidden md:flex items-center justify-between px-6 pt-4 pb-4">
          <div>
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">Project Management</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {loading ? "Loading..." : `${projects.length} / ${packageInfo?.limit ?? "..."} Projects`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* NEW: Cards / Table view toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm mr-1">
              <button
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "cards" ? "bg-yellow-400 text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <LayoutGrid className="w-4 h-4" /> Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "table" ? "bg-yellow-400 text-black shadow-sm" : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <List className="w-4 h-4" /> Table
              </button>
            </div>

            <button onClick={handleNewProjectClick}
              className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-2.5 rounded-xl hover:bg-yellow-500 transition-colors text-sm font-semibold shadow-sm">
              <Plus className="w-4 h-4" /> New Project
            </button>
            <button onClick={() => projectReportService.downloadAllProjectsReport(projects)}
              className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
              <Download className="w-4 h-4" /> Download All Reports
            </button>
          </div>
        </div>

        {/* ── Mobile sticky header ── */}
        <div className="md:hidden bg-white border-b border-gray-200 px-3 py-3 sticky top-16 z-30">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">Project Management</h1>
              <p className="text-xs text-gray-500">{projects.length} / {packageInfo?.limit ?? "..."} Projects</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => projectReportService.downloadAllProjectsReport(projects)}
                className="flex items-center gap-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-medium">
                <Download className="w-3.5 h-3.5" /> Reports
              </button>
              <button onClick={handleNewProjectClick}
                className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>
          </div>
          {/* NEW: mobile view toggle */}
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 w-fit">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "cards" ? "bg-yellow-400 text-black shadow-sm" : "text-gray-500"
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "table" ? "bg-yellow-400 text-black shadow-sm" : "text-gray-500"
              }`}
            >
              <List className="w-3.5 h-3.5" /> Table
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-4 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            <p className="font-medium">Error loading projects</p>
            <p className="text-xs mt-0.5">{error}</p>
            <button onClick={loadProjects} className="mt-1.5 text-xs underline">Try again</button>
          </div>
        )}

        {/* ── Search + Filter row ── */}
        <div className="px-4 md:px-6 pb-4">
          <div className="flex gap-2">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Filter */}
            <div className="relative">
              <button
                onClick={() => { setShowFilterDropdown(!showFilterDropdown); setShowSortDropdown(false); setShowStatusDropdown(false); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm"
              >
                <Filter className="w-4 h-4" />
                Filter
                {filterType !== "all" && <span className="w-2 h-2 bg-yellow-500 rounded-full" />}
              </button>
              {showFilterDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                  <p className="text-xs font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wide">Type</p>
                  {["all", "Residential", "Commercial", "Industrial", "Renovation"].map((type) => (
                    <button key={type}
                      onClick={() => { setFilterType(type); setShowFilterDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${filterType === type ? "bg-yellow-50 text-yellow-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      {type === "all" ? "All Types" : type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* NEW: Status filter */}
            <div className="relative">
              <button
                onClick={() => { setShowStatusDropdown(!showStatusDropdown); setShowFilterDropdown(false); setShowSortDropdown(false); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm"
              >
                {filterStatus === "all" ? "All Status" : filterStatus}
                <ChevronDown className="w-4 h-4" />
                {filterStatus !== "all" && <span className="w-2 h-2 bg-yellow-500 rounded-full" />}
              </button>
              {showStatusDropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                  <p className="text-xs font-semibold text-gray-400 px-3 py-1.5 uppercase tracking-wide">Status</p>
                  <button
                    onClick={() => { setFilterStatus("all"); setShowStatusDropdown(false); }}
                    className={`w-full text-left px-3 py-2 text-sm transition-colors ${filterStatus === "all" ? "bg-yellow-50 text-yellow-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
                  >
                    All Status
                  </button>
                  {COLUMNS.map((col) => (
                    <button key={col.status}
                      onClick={() => { setFilterStatus(col.status); setShowStatusDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors ${filterStatus === col.status ? "bg-yellow-50 text-yellow-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.dotColor }} />
                      {col.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort */}
            <div className="relative">
              <button
                onClick={() => { setShowSortDropdown(!showSortDropdown); setShowFilterDropdown(false); setShowStatusDropdown(false); }}
                className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm"
              >
                Sort by: {sortOrder === "latest" ? "Latest" : sortOrder === "oldest" ? "Oldest" : "Name"}
                <ChevronDown className="w-4 h-4" />
              </button>
              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1">
                  {[{ val: "latest", label: "Latest" }, { val: "oldest", label: "Oldest" }, { val: "name", label: "Name A–Z" }].map((opt) => (
                    <button key={opt.val}
                      onClick={() => { setSortOrder(opt.val); setShowSortDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm transition-colors ${sortOrder === opt.val ? "bg-yellow-50 text-yellow-800 font-medium" : "hover:bg-gray-50 text-gray-700"}`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── CARDS VIEW (Kanban Board) ── */}
        {viewMode === "cards" && (
          <div className="px-4 md:px-6 pb-24 md:pb-10 overflow-x-auto">
            <div className="flex gap-4 min-w-max md:min-w-0 md:grid md:grid-cols-4">
              {COLUMNS.map((col) => {
                const colProjects = getColumnProjects(col.status);
                return (
                  <div key={col.status} className="w-72 md:w-auto flex flex-col">
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: col.dotColor }} />
                        <span className="font-semibold text-gray-800 text-sm">{col.label}</span>
                        <span className="text-xs font-bold text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                          {colProjects.length}
                        </span>
                      </div>
                      <button className="text-gray-400 hover:text-gray-600 p-0.5">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                        </svg>
                      </button>
                    </div>

                    {/* Cards */}
                    <div className="flex flex-col gap-3 flex-1">
                      {colProjects.map((project) => (
                        <KanbanProjectCard
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
                          columnColor={col.dotColor}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── TABLE VIEW ── */}
        {viewMode === "table" && (
          <div className="px-4 md:px-6 pb-24 md:pb-10">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-yellow-400">
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wide">Project</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wide">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wide hidden md:table-cell">Type</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wide">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wide hidden lg:table-cell">Timeline</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wide">Budget</th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-black uppercase tracking-wide">Progress</th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-black uppercase tracking-wide w-36">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedProjects.map((project) => {
                      const dotColor = getStatusDotColor(project.status);
                      const isOverBudget = project.budget > 0 && (project.spent / project.budget) * 100 > 100;
                      return (
                        <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: dotColor }} />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">{project.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-400">
                                  <span>{project.id}</span>
                                  {project.location && (
                                    <span className="flex items-center gap-0.5 truncate">
                                      <MapPin size={10} /> {project.location}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{project.client}</td>
                          <td className="px-4 py-3 text-sm text-gray-700 hidden md:table-cell">{project.type}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getStatusColor(project.status)}`}>
                              {getStatusIcon(project.status)} {project.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500 hidden lg:table-cell whitespace-nowrap">
                            <span className="flex items-center gap-1">
                              <Calendar size={11} className="text-gray-400" />
                              {fmtDate(project.startDate)} – {fmtDate(project.endDate)}
                            </span>
                          </td>
                          <td className={`px-4 py-3 text-sm font-bold ${isOverBudget ? "text-red-600" : "text-gray-900"}`}>
                            {fmtBudget(project.budget)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 min-w-[110px]">
                              <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                <div className="h-full rounded-full" style={{ width: `${project.progress}%`, backgroundColor: dotColor }} />
                              </div>
                              <span className="text-xs font-bold text-gray-700">{project.progress}%</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 w-36">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setSelectedProject(project)}
                                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                                <Eye size={15} />
                              </button>
                              <button onClick={() => handleEditProject(project)}
                                className="p-1.5 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                <Pencil size={15} />
                              </button>
                              <button onClick={() => handleDeleteProject(project.id)}
                                className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                <Trash2 size={15} />
                              </button>
                              <button onClick={() => handleDownloadReport(project)}
                                className="p-1.5 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 rounded-lg transition-colors" title="Download Report">
                                <Download size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {paginatedProjects.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-10 text-center text-sm text-gray-400">
                          No projects found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* NEW: Pagination bar (replaces the old "Add Project" row) */}
              {sortedProjects.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={sortedProjects.length}
                  pageSize={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setRowsPerPage}
                />
              )}
            </div>
          </div>
        )}
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


