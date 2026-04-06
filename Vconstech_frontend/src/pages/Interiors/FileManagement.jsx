import { useState, useEffect } from "react";
import {
  Plus,
  File,
  Trash2,
  Upload,
  X,
  Save,
  FolderOpen,
  ChevronRight,
  ExternalLink,
  AlertCircle,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader,
} from "lucide-react";
import SidePannel from "../../components/common/SidePannel";
import Navbar from "../../components/common/Navbar";
import { getAuthToken, getAuthHeaders } from "../../utils/auth";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getFileExtension = (file) =>
  (file?.fileName || file?.filename || "").split(".").pop()?.toLowerCase() || "";

const getFileIcon = (file) => {
  const ext = getFileExtension(file);
  const iconMap = {
    pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊",
    jpg: "🖼️", jpeg: "🖼️", png: "🖼️", dwg: "📐", dxf: "📐",
  };
  return iconMap[ext] || "📎";
};

const getMimeType = (file) => {
  const ext = getFileExtension(file);
  const mimeMap = {
    pdf: "application/pdf",
    jpg: "image/jpeg", jpeg: "image/jpeg",
    png: "image/png", gif: "image/gif", webp: "image/webp",
    doc: "application/msword",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    xls: "application/vnd.ms-excel",
    xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
  return mimeMap[ext] || "application/octet-stream";
};

const isImageFile  = (file) => ["jpg", "jpeg", "png", "gif", "webp"].includes(getFileExtension(file));
const isPdfFile    = (file) => getFileExtension(file) === "pdf";
const isOfficeFile = (file) => ["doc", "docx", "xls", "xlsx"].includes(getFileExtension(file));

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// ─── File Viewer Modal ────────────────────────────────────────────────────────

const FileViewerModal = ({ file, dataUri, rawBlob, onClose, onDownload }) => {
  const [zoom, setZoom]           = useState(1);
  const [rotation, setRotation]   = useState(0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError]   = useState(false);
  const fileName = file?.fileName || file?.filename || "File";

  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    if (!isPdfFile(file)) return;
    const t = setTimeout(() => setPdfLoaded(true), 3000);
    return () => clearTimeout(t);
  }, [file]);

  const renderContent = () => {
    if (isImageFile(file)) {
      return (
        <div className="w-full h-full overflow-auto flex items-center justify-center bg-gray-900 p-4">
          <img
            src={dataUri}
            alt={fileName}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease",
              maxWidth: zoom <= 1 ? "100%" : "none",
              maxHeight: zoom <= 1 ? "100%" : "none",
              objectFit: "contain",
              borderRadius: "6px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}
          />
        </div>
      );
    }
    if (isPdfFile(file)) {
      return (
        <div className="relative w-full h-full bg-gray-200">
          {!pdfLoaded && !pdfError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader size={36} className="animate-spin text-amber-500" />
                <p className="text-sm text-gray-600 font-medium">Loading PDF…</p>
              </div>
            </div>
          )}
          {pdfError ? (
            <FallbackDownload file={file} onDownload={onDownload} message="Your browser could not render this PDF inline." />
          ) : (
            <embed
              src={dataUri}
              type="application/pdf"
              className="w-full h-full"
              onLoad={() => setPdfLoaded(true)}
              onError={() => { setPdfLoaded(true); setPdfError(true); }}
            />
          )}
        </div>
      );
    }
    if (isOfficeFile(file)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center py-12 px-8 max-w-md">
            <span className="text-7xl mb-5 block">{getFileIcon(file)}</span>
            <p className="text-lg font-bold text-gray-800 mb-2">{fileName}</p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{getFileExtension(file).toUpperCase()}</strong> files cannot be previewed in the browser.
            </p>
            <p className="text-xs text-gray-400 mb-6">Download and open with Microsoft Office or LibreOffice.</p>
            <button onClick={onDownload}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2.5 px-6 rounded-lg border-2 border-black flex items-center gap-2 mx-auto transition-colors">
              <Download size={18} /> Download File
            </button>
          </div>
        </div>
      );
    }
    return <FallbackDownload file={file} onDownload={onDownload} message="Preview not available for this file type." />;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "92vw", maxWidth: "1100px", height: "92vh" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-amber-400 bg-amber-50 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{getFileIcon(file)}</span>
            <span className="font-bold text-black text-sm md:text-base truncate max-w-xs md:max-w-lg">{fileName}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isImageFile(file) && (
              <>
                <button onClick={() => setZoom(z => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  className="p-1.5 rounded-lg hover:bg-amber-200 transition-colors" title="Zoom out">
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-medium text-gray-600 w-10 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={() => setZoom(z => Math.min(5, +(z + 0.25).toFixed(2)))}
                  className="p-1.5 rounded-lg hover:bg-amber-200 transition-colors" title="Zoom in">
                  <ZoomIn size={16} />
                </button>
                <button onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-1.5 rounded-lg hover:bg-amber-200 transition-colors" title="Rotate 90°">
                  <RotateCw size={16} />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
              </>
            )}
            <button onClick={onDownload}
              className="flex items-center gap-1.5 bg-green-400 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg border-2 border-black text-xs font-bold transition-colors">
              <Download size={14} /> Download
            </button>
            <button onClick={onClose}
              className="ml-1 p-1.5 rounded-lg hover:bg-red-100 text-red-500 border-2 border-transparent hover:border-red-300 transition-colors"
              title="Close (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">{renderContent()}</div>
      </div>
    </div>
  );
};

const FallbackDownload = ({ file, onDownload, message }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-50">
    <div className="text-center py-16 px-8 max-w-sm">
      <span className="text-6xl mb-4 block">{getFileIcon(file)}</span>
      <p className="text-base font-bold text-gray-700 mb-2">{file?.fileName || file?.filename}</p>
      <p className="text-sm text-gray-500 mb-6">{message}</p>
      <button onClick={onDownload}
        className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2.5 px-6 rounded-lg border-2 border-black flex items-center gap-2 mx-auto transition-colors">
        <Download size={18} /> Download to view
      </button>
    </div>
  </div>
);

// ─── Main Page Component ──────────────────────────────────────────────────────

const FileManagement = () => {
  const [projects, setProjects]               = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFiles, setProjectFiles]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filesLoading, setFilesLoading]       = useState(false);
  const [showAddFileForm, setShowAddFileForm] = useState(false);
  const [saveMessage, setSaveMessage]         = useState("");
  const [errorMessage, setErrorMessage]       = useState("");
  const [viewMode, setViewMode]               = useState("projects");
  const [fileFormData, setFileFormData]       = useState({ documentType: "", file: null, fileName: "" });
  const [viewerState, setViewerState]         = useState(null);
  const [viewLoading, setViewLoading]         = useState(false);

  const documentTypes = ["Contract", "Invoice", "Blueprint", "Report", "Certificate", "Permit", "Drawing", "Specification", "Other"];
  const API_BASE_URL  = import.meta.env.VITE_API_URL || "https://test.vconstech.in/api";

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

  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error("No authentication token found. Please log in again.");
    const response = await fetch(url, { ...options, headers: { ...options.headers, ...getAuthHeaders() } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/projects`);
      setProjects(data.projects || []);
    } catch (e) { showErrorMessage("Failed to load projects: " + e.message); }
    finally     { setLoading(false); }
  };

  const fetchProjectFiles = async (projectId) => {
    try {
      setFilesLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/files`);
      setProjectFiles(data.files || []);
    } catch (e) { showErrorMessage("Failed to load project files: " + e.message); }
    finally     { setFilesLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileFormData((prev) => ({ ...prev, file, fileName: file.name }));
  };

  const handleFileInputChange = (e) => {
    const { name, value } = e.target;
    setFileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddFile = async () => {
    if (!fileFormData.file) { showErrorMessage("Please select a file to upload!"); return; }
    try {
      const token = getAuthToken();
      if (!token) throw new Error("No authentication token found.");
      const formData = new FormData();
      formData.append("file", fileFormData.file);
      if (fileFormData.documentType) formData.append("documentType", fileFormData.documentType);
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
    } catch (e) { showErrorMessage("Failed to upload file: " + e.message); }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetchWithAuth(`${API_BASE_URL}/projects/${selectedProject.id}/files/${fileId}`, { method: "DELETE" });
      showSuccessMessage("File deleted successfully!");
      await fetchProjectFiles(selectedProject.id);
    } catch (e) { showErrorMessage("Failed to delete file: " + e.message); }
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

  const fetchFileData = async (file) => {
    const url = `${API_BASE_URL}/projects/${selectedProject.id}/files/${file.id}/download`;
    const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed: ${response.status} ${response.statusText}`);
    }
    const rawBlob   = await response.blob();
    const mimeType  = getMimeType(file);
    const typedBlob = new Blob([rawBlob], { type: mimeType });
    const dataUri   = await blobToBase64(typedBlob);
    return { rawBlob: typedBlob, dataUri };
  };

  const handleViewFile = async (file) => {
    try {
      if (!file.id) throw new Error("File ID not found");
      setViewLoading(file.id);
      const { rawBlob, dataUri } = await fetchFileData(file);
      setViewerState({ file, dataUri, rawBlob });
    } catch (e) { showErrorMessage("Failed to open file: " + e.message); }
    finally     { setViewLoading(false); }
  };

  const handleModalDownload = () => {
    if (!viewerState) return;
    const { file, rawBlob } = viewerState;
    const blobUrl = window.URL.createObjectURL(rawBlob);
    const link    = document.createElement("a");
    link.href     = blobUrl;
    link.download = file.fileName || file.filename || "download";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      PENDING:       "bg-yellow-200 border-yellow-400 text-yellow-800",
      Pending:       "bg-yellow-200 border-yellow-400 text-yellow-800",
      ONGOING:       "bg-blue-200 border-blue-400 text-blue-800",
      Ongoing:       "bg-blue-200 border-blue-400 text-blue-800",
      "In Progress": "bg-blue-200 border-blue-400 text-blue-800",
      COMPLETED:     "bg-green-200 border-green-400 text-green-800",
      Completed:     "bg-green-200 border-green-400 text-green-800",
    };
    return statusMap[status] || "bg-gray-200 border-gray-400 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* File viewer modal */}
      {viewerState && (
        <FileViewerModal
          file={viewerState.file}
          dataUri={viewerState.dataUri}
          rawBlob={viewerState.rawBlob}
          onClose={() => setViewerState(null)}
          onDownload={handleModalDownload}
        />
      )}

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      {/* SidePannel */}
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      {/* Main content */}
      <div className="pt-16 md:pl-64 md:pt-25">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 pb-24 md:pb-10">

          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
              E-Vault
            </h1>
            <p className="text-sm md:text-base text-gray-700">
              {viewMode === "projects"
                ? "Manage project documents securely"
                : `Files for ${selectedProject?.name}`}
            </p>
          </div>

          {/* Success / Error banners */}
          {saveMessage && (
            <div className="mb-4 p-3 md:p-4 bg-green-100 border-2 border-green-400 rounded-lg text-green-800 text-center font-medium text-sm flex items-center justify-center gap-2">
              <Save size={16} /> {saveMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 md:p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-800 text-center font-medium text-sm flex items-center justify-center gap-2">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          {/* Breadcrumb */}
          {viewMode === "files" && (
            <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
              <button onClick={handleBackToProjects} className="hover:text-black font-medium">
                Projects
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
                  <Upload size={16} /> Upload File
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

          {/* ── Projects list ── */}
          {viewMode === "projects" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700">Loading projects...</p>
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
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-2">No projects found</p>
                  <p className="text-sm text-gray-500">Projects will appear here once they are created</p>
                </div>
              )}
            </div>
          )}

          {/* ── Files list ── */}
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
                                <File size={12} /> {file.documentType}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mb-3">
                            Uploaded: {formatDate(file.uploadedAt || file.createdAt)}
                          </p>
                          <button
                            onClick={() => handleViewFile(file)}
                            disabled={viewLoading === file.id}
                            className="bg-blue-400 hover:bg-blue-500 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg border-2 border-black text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors"
                          >
                            {viewLoading === file.id
                              ? <Loader size={13} className="animate-spin" />
                              : <ExternalLink size={13} />
                            }
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
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-2">No files uploaded yet</p>
                  <p className="text-sm text-gray-500">Click "Upload File" to add documents to this project</p>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FileManagement;