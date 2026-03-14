import { useEffect, useState } from "react";
import {
  Plus,
  Folder,
  File,
  Trash2,
  Upload,
  X,
  Save,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import EmployeeNavbar from "../../components/Employee/EmployeeNavbar";

const EmployeeFileManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showAddFileForm, setShowAddFileForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [viewMode, setViewMode] = useState("projects");

  const [fileFormData, setFileFormData] = useState({
    documentType: "",
    file: null,
    fileName: "",
  });

  const documentTypes = [
    "Contract",
    "Invoice",
    "Blueprint",
    "Report",
    "Certificate",
    "Permit",
    "Drawing",
    "Specification",
    "Other",
  ];

  const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

  const getAuthToken = () => localStorage.getItem("authToken");

  const showSuccessMessage = (message) => {
    setSaveMessage(message);
    setErrorMessage("");
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const showErrorMessage = (message) => {
    setErrorMessage(message);
    setSaveMessage("");
    setTimeout(() => setErrorMessage(""), 5000);
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/engineers/my-projects`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch assigned projects");
      setProjects(data.projects || []);
    } catch (error) {
      console.error("Error fetching assigned projects:", error);
      showErrorMessage("Failed to load assigned projects: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectFiles = async (projectId) => {
    try {
      setFilesLoading(true);
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/files`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch files");
      setProjectFiles(data.files || []);
    } catch (error) {
      console.error("Error fetching project files:", error);
      showErrorMessage("Failed to load project files: " + error.message);
    } finally {
      setFilesLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileFormData((prev) => ({ ...prev, file, fileName: file.name }));
    }
  };

  const handleFileInputChange = (e) => {
    const { name, value } = e.target;
    setFileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFile = async () => {
    if (!fileFormData.file) {
      showErrorMessage("Please select a file to upload!");
      return;
    }
    try {
      const token = getAuthToken();
      const formData = new FormData();
      formData.append("file", fileFormData.file);
      if (fileFormData.documentType) {
        formData.append("documentType", fileFormData.documentType);
      }
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/files`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to upload file");
      showSuccessMessage("File uploaded successfully!");
      setFileFormData({ documentType: "", file: null, fileName: "" });
      setShowAddFileForm(false);
      await fetchProjectFiles(selectedProject.id);
    } catch (error) {
      console.error("Error uploading file:", error);
      showErrorMessage("Failed to upload file: " + error.message);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      const token = getAuthToken();
      const response = await fetch(
        `${API_BASE_URL}/projects/${selectedProject.id}/files/${fileId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        }
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete file");
      showSuccessMessage("File deleted successfully!");
      await fetchProjectFiles(selectedProject.id);
    } catch (error) {
      console.error("Error deleting file:", error);
      showErrorMessage("Failed to delete file: " + error.message);
    }
  };

  const handleOpenProject = async (project) => {
    setSelectedProject(project);
    setViewMode("files");
    await fetchProjectFiles(project.id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setViewMode("projects");
    setShowAddFileForm(false);
    setProjectFiles([]);
  };

  const handleCancelFile = () => {
    setShowAddFileForm(false);
    setFileFormData({ documentType: "", file: null, fileName: "" });
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      PENDING: "bg-yellow-200 border-yellow-400 text-yellow-800",
      ONGOING: "bg-blue-200 border-blue-400 text-blue-800",
      COMPLETED: "bg-green-200 border-green-400 text-green-800",
      Planning: "bg-yellow-200 border-yellow-400 text-yellow-800",
      "In Progress": "bg-blue-200 border-blue-400 text-blue-800",
      Completed: "bg-green-200 border-green-400 text-green-800",
    };
    return statusMap[status] || "bg-gray-200 border-gray-400 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getFileIcon = (file) => {
    const filename = file.fileName || file.filename || "";
    const ext = filename.split(".").pop()?.toLowerCase();
    const iconMap = {
      pdf: "📄", doc: "📝", docx: "📝",
      xls: "📊", xlsx: "📊",
      jpg: "🖼️", jpeg: "🖼️", png: "🖼️",
      dwg: "📐", dxf: "📐",
    };
    return iconMap[ext] || "📎";
  };

  const handleViewFile = async (file) => {
    try {
      const token = getAuthToken();
      let fileUrl;
      if (file.fileUrl) {
        const baseUrl = API_BASE_URL.replace("/api", "");
        fileUrl = file.fileUrl.startsWith("http") ? file.fileUrl : `${baseUrl}${file.fileUrl}`;
      } else if (file.filepath) {
        fileUrl = file.filepath.startsWith("http")
          ? file.filepath
          : `${API_BASE_URL.replace("/api", "")}${file.filepath}`;
      } else {
        throw new Error("File URL not found");
      }
      const response = await fetch(fileUrl, {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Failed to download file (${response.status})`);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
    } catch (error) {
      console.error("Error viewing file:", error);
      showErrorMessage("Failed to open file: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />

      {/* ── Page wrapper: mt-16 clears fixed navbar, consistent padding ── */}
      <div className="mt-25 min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
              E-Vault
            </h1>
            <p className="text-sm md:text-base text-gray-700">
              {viewMode === "projects"
                ? "My Assigned Projects — Manage documents securely"
                : `Files for ${selectedProject?.name}`}
            </p>
          </div>

          {/* Success / Error banners */}
          {saveMessage && (
            <div className="mb-4 p-3 md:p-4 bg-green-100 border-2 border-green-400 rounded-lg text-green-800 text-center font-medium text-sm flex items-center justify-center gap-2">
              <Save size={16} />
              {saveMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 md:p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-800 text-center font-medium text-sm flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {/* Breadcrumb */}
          {viewMode === "files" && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <button onClick={handleBackToProjects} className="hover:text-black font-medium">
                My Projects
              </button>
              <ChevronRight size={16} />
              <span className="text-black font-semibold truncate">{selectedProject?.name}</span>
            </div>
          )}

          {/* Files action bar */}
          {viewMode === "files" && !showAddFileForm && (
            <div className="mb-6 flex gap-2">
              <button
                onClick={handleBackToProjects}
                className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 px-4 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <X size={20} />
                <span className="hidden sm:inline text-sm">Back</span>
              </button>
              <button
                onClick={() => setShowAddFileForm(true)}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={22} />
                <span className="text-sm md:text-base">Upload File</span>
              </button>
            </div>
          )}

          {/* Upload form */}
          {showAddFileForm && (
            <div className="mb-6 p-4 md:p-6 bg-white border-2 border-amber-400 rounded-lg space-y-4">
              <h3 className="text-lg md:text-xl font-bold text-black mb-4">
                Upload File to {selectedProject?.name}
              </h3>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Document Type (Optional)
                </label>
                <select
                  name="documentType"
                  value={fileFormData.documentType}
                  onChange={handleFileInputChange}
                  className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-black rounded-lg focus:ring-2 focus:ring-black bg-white text-black"
                >
                  <option value="">Select document type</option>
                  {documentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Attach File *
                </label>
                <div className="border-2 border-dashed border-amber-400 rounded-lg p-6 md:p-8 text-center bg-amber-50">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.dwg,.dxf"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload size={40} className="mx-auto text-amber-600 mb-2" />
                    <p className="text-sm md:text-base font-medium text-black">
                      {fileFormData.fileName || "Click to upload file"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      PDF, DOC, DOCX, JPG, PNG, XLSX, DWG, DXF supported
                    </p>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleAddFile}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2.5 md:py-3 px-4 md:px-6 text-sm md:text-base rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors border-2 border-black"
                >
                  <Upload size={16} />
                  Upload File
                </button>
                <button
                  onClick={handleCancelFile}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2.5 md:py-3 px-4 rounded-lg border-2 border-black shadow-lg flex items-center justify-center transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Projects list */}
          {viewMode === "projects" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700">
                    Loading your assigned projects...
                  </p>
                </div>
              ) : projects.length > 0 ? (
                projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white border-2 border-amber-400 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleOpenProject(project)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="bg-amber-400 p-2.5 md:p-4 rounded-lg border-2 border-black flex-shrink-0">
                          <FolderOpen size={22} className="md:w-8 md:h-8 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-black text-sm md:text-lg mb-1 break-words">
                            {project.name}
                          </h4>
                          {project.description && (
                            <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className={`text-xs px-2 py-1 rounded-md font-medium border ${getStatusBadgeColor(project.status)}`}>
                              {project.status.charAt(0).toUpperCase() + project.status.slice(1).toLowerCase()}
                            </span>
                            {project.projectType && (
                              <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md font-medium">
                                {project.projectType}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 space-y-0.5">
                            {project.clientName && (
                              <p><span className="font-medium">Client:</span> {project.clientName}</p>
                            )}
                            {(project.startDate || project.endDate) && (
                              <p>
                                <span className="font-medium">Timeline:</span>{" "}
                                {formatDate(project.startDate)} – {formatDate(project.endDate)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Upload button — icon-only on mobile, label on md+ */}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenProject(project); }}
                        className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-500 text-black font-medium px-2.5 md:px-3 py-2 rounded-lg border-2 border-black transition-colors flex-shrink-0 text-xs md:text-sm"
                      >
                        <Plus size={16} />
                        <span className="hidden md:inline">Upload Files</span>
                        <span className="md:hidden">Upload</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-2">
                    No projects assigned yet
                  </p>
                  <p className="text-sm text-gray-500">
                    You will see projects here once they are assigned to you
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Files list */}
          {viewMode === "files" && selectedProject && (
            <div className="space-y-4">
              {filesLoading ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700">Loading files...</p>
                </div>
              ) : projectFiles.length > 0 ? (
                projectFiles.map((file) => (
                  <div
                    key={file.id}
                    className="bg-white border-2 border-amber-400 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 md:gap-4 flex-1 min-w-0">
                        <div className="bg-amber-400 p-2.5 md:p-4 rounded-lg border-2 border-black flex-shrink-0 text-xl md:text-2xl leading-none flex items-center justify-center w-10 h-10 md:w-14 md:h-14">
                          {getFileIcon(file)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-black text-sm md:text-lg mb-2 break-words">
                            {file.fileName || file.filename}
                          </h4>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {file.documentType && (
                              <span className="inline-flex items-center gap-1.5 text-xs bg-amber-200 px-2.5 py-1 rounded-lg border-2 border-amber-400 font-medium">
                                <File size={12} />
                                {file.documentType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-3">
                            Uploaded: {formatDate(file.uploadedAt || file.createdAt)}
                          </p>
                          <button
                            onClick={() => handleViewFile(file)}
                            className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg border-2 border-black text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <ExternalLink size={13} />
                            View / Download
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteFile(file.id)}
                        className="bg-red-400 hover:bg-red-500 p-2 md:p-3 rounded-lg border-2 border-black transition-colors flex-shrink-0"
                        title="Delete File"
                      >
                        <Trash2 size={16} className="md:w-5 md:h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <File size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-2">
                    No files uploaded yet
                  </p>
                  <p className="text-sm text-gray-500">
                    Click "Upload File" to add documents to this project
                  </p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default EmployeeFileManagement;