// import { useState, useEffect, useMemo, useRef } from "react";
// import {
//   Plus,
//   Trash2,
//   Upload,
//   X,
//   Save,
//   FolderOpen,
//   ChevronRight,
//   ExternalLink,
//   AlertCircle,
//   Download,
//   ZoomIn,
//   ZoomOut,
//   RotateCw,
//   Loader,
//   Search,
//   Filter,
//   ArrowUpDown,
//   LayoutGrid,
//   List,
//   FolderPlus,
//   ChevronDown,
//   CheckCircle2,
//   XCircle,
// } from "lucide-react";
// import SidePannel from "../../components/common/SidePannel";
// import Navbar from "../../components/common/Navbar";
// import Pagination, { DEFAULT_PAGE_SIZE } from "../../components/common/Pagination";
// import { getAuthToken, getAuthHeaders } from "../../utils/auth";

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// const getFileExtension = (file) =>
//   (file?.fileName || file?.filename || file?.name || "").split(".").pop()?.toLowerCase() || "";

// const getFileIcon = (file) => {
//   const ext = getFileExtension(file);
//   const iconMap = {
//     pdf: "📄", doc: "📝", docx: "📝", xls: "📊", xlsx: "📊",
//     ppt: "📙", pptx: "📙",
//     jpg: "🖼️", jpeg: "🖼️", png: "🖼️", dwg: "📐", dxf: "📐",
//   };
//   return iconMap[ext] || "📎";
// };

// const getMimeType = (file) => {
//   const ext = getFileExtension(file);
//   const mimeMap = {
//     pdf: "application/pdf",
//     jpg: "image/jpeg", jpeg: "image/jpeg",
//     png: "image/png", gif: "image/gif", webp: "image/webp",
//     doc: "application/msword",
//     docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     xls: "application/vnd.ms-excel",
//     xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//   };
//   return mimeMap[ext] || "application/octet-stream";
// };

// const isImageFile  = (file) => ["jpg", "jpeg", "png", "gif", "webp"].includes(getFileExtension(file));
// const isPdfFile    = (file) => getFileExtension(file) === "pdf";
// const isOfficeFile = (file) => ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(getFileExtension(file));

// const blobToBase64 = (blob) =>
//   new Promise((resolve, reject) => {
//     const reader = new FileReader();
//     reader.onload  = () => resolve(reader.result);
//     reader.onerror = reject;
//     reader.readAsDataURL(blob);
//   });

// // Maps a file extension to a visual "type" badge, matching the reference design
// const FILE_TYPE_META = {
//   pdf:  { label: "PDF",        badge: "bg-red-100 text-red-600" },
//   doc:  { label: "Word",       badge: "bg-blue-100 text-blue-600" },
//   docx: { label: "Word",       badge: "bg-blue-100 text-blue-600" },
//   xls:  { label: "Excel",      badge: "bg-green-100 text-green-600" },
//   xlsx: { label: "Excel",      badge: "bg-green-100 text-green-600" },
//   ppt:  { label: "PowerPoint", badge: "bg-orange-100 text-orange-600" },
//   pptx: { label: "PowerPoint", badge: "bg-orange-100 text-orange-600" },
//   jpg:  { label: "Image",      badge: "bg-purple-100 text-purple-600" },
//   jpeg: { label: "Image",      badge: "bg-purple-100 text-purple-600" },
//   png:  { label: "Image",      badge: "bg-purple-100 text-purple-600" },
//   dwg:  { label: "CAD",        badge: "bg-slate-100 text-slate-600" },
//   dxf:  { label: "CAD",        badge: "bg-slate-100 text-slate-600" },
// };
// const getFileTypeMeta = (file) =>
//   FILE_TYPE_META[getFileExtension(file)] || { label: "File", badge: "bg-gray-100 text-gray-600" };

// // Buckets a file into one of the tab categories shown in the reference design
// const getFileTabCategory = (file) => {
//   const ext = getFileExtension(file);
//   if (ext === "pdf") return "pdfs";
//   if (["doc", "docx"].includes(ext)) return "documents";
//   if (["xls", "xlsx"].includes(ext)) return "spreadsheets";
//   if (["ppt", "pptx"].includes(ext)) return "presentations";
//   return "documents";
// };

// // Maps a file to the filter categories required by the Filter dropdown
// const getFileCategory = (file) => {
//   const ext = getFileExtension(file);
//   if (ext === "pdf") return "pdf";
//   if (["doc", "docx"].includes(ext)) return "word";
//   if (["xls", "xlsx"].includes(ext)) return "excel";
//   if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
//   if (["dwg", "dxf"].includes(ext)) return "cad";
//   if (["zip", "rar", "7z"].includes(ext)) return "zip";
//   return "other";
// };

// const FILTER_OPTIONS = [
//   { key: "",      label: "All Files" },
//   { key: "pdf",   label: "PDF" },
//   { key: "word",  label: "Word" },
//   { key: "excel", label: "Excel" },
//   { key: "image", label: "Image" },
//   { key: "cad",   label: "CAD" },
//   { key: "zip",   label: "ZIP" },
//   { key: "other", label: "Other" },
// ];

// // Card accent colors cycled across project cards on the landing grid
// const CARD_ACCENTS = [
//   "bg-emerald-100 text-emerald-600",
//   "bg-blue-100 text-blue-600",
//   "bg-violet-100 text-violet-600",
//   "bg-orange-100 text-orange-600",
//   "bg-pink-100 text-pink-600",
//   "bg-teal-100 text-teal-600",
//   "bg-slate-100 text-slate-600",
//   "bg-amber-100 text-amber-600",
// ];

// const TABS = [
//   { key: "all", label: "All" },
//   { key: "folders", label: "Folders" },
//   { key: "documents", label: "Documents" },
//   { key: "spreadsheets", label: "Spreadsheets" },
//   { key: "presentations", label: "Presentations" },
//   { key: "pdfs", label: "PDFs" },
// ];

// // ─── File Viewer Modal ────────────────────────────────────────────────────────

// const FileViewerModal = ({ file, dataUri, rawBlob, onClose, onDownload }) => {
//   const [zoom, setZoom]           = useState(1);
//   const [rotation, setRotation]   = useState(0);
//   const [pdfLoaded, setPdfLoaded] = useState(false);
//   const [pdfError, setPdfError]   = useState(false);
//   const fileName = file?.fileName || file?.filename || "File";

//   useEffect(() => {
//     const handleKey = (e) => { if (e.key === "Escape") onClose(); };
//     window.addEventListener("keydown", handleKey);
//     return () => window.removeEventListener("keydown", handleKey);
//   }, [onClose]);

//   useEffect(() => {
//     if (!isPdfFile(file)) return;
//     const t = setTimeout(() => setPdfLoaded(true), 3000);
//     return () => clearTimeout(t);
//   }, [file]);

//   const renderContent = () => {
//     if (isImageFile(file)) {
//       return (
//         <div className="w-full h-full overflow-auto flex items-center justify-center bg-gray-900 p-4">
//           <img
//             src={dataUri}
//             alt={fileName}
//             style={{
//               transform: `scale(${zoom}) rotate(${rotation}deg)`,
//               transformOrigin: "center center",
//               transition: "transform 0.2s ease",
//               maxWidth: zoom <= 1 ? "100%" : "none",
//               maxHeight: zoom <= 1 ? "100%" : "none",
//               objectFit: "contain",
//               borderRadius: "12px",
//               boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
//             }}
//           />
//         </div>
//       );
//     }
//     if (isPdfFile(file)) {
//       return (
//         <div className="relative w-full h-full bg-gray-200">
//           {!pdfLoaded && !pdfError && (
//             <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
//               <div className="flex flex-col items-center gap-3">
//                 <Loader size={36} className="animate-spin text-yellow-500" />
//                 <p className="text-sm text-gray-600 font-medium">Loading PDF…</p>
//               </div>
//             </div>
//           )}
//           {pdfError ? (
//             <FallbackDownload file={file} onDownload={onDownload} message="Your browser could not render this PDF inline." />
//           ) : (
//             <embed
//               src={dataUri}
//               type="application/pdf"
//               className="w-full h-full"
//               onLoad={() => setPdfLoaded(true)}
//               onError={() => { setPdfLoaded(true); setPdfError(true); }}
//             />
//           )}
//         </div>
//       );
//     }
//     if (isOfficeFile(file)) {
//       return (
//         <div className="w-full h-full flex items-center justify-center bg-gray-50">
//           <div className="text-center py-12 px-8 max-w-md">
//             <span className="text-7xl mb-5 block">{getFileIcon(file)}</span>
//             <p className="text-lg font-bold text-gray-800 mb-2">{fileName}</p>
//             <p className="text-sm text-gray-500 mb-1">
//               <strong>{getFileExtension(file).toUpperCase()}</strong> files cannot be previewed in the browser.
//             </p>
//             <p className="text-xs text-gray-400 mb-6">Download and open with Microsoft Office or LibreOffice.</p>
//             <button onClick={onDownload}
//               className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 px-6 rounded-xl shadow-sm flex items-center gap-2 mx-auto transition-colors">
//               <Download size={18} /> Download File
//             </button>
//           </div>
//         </div>
//       );
//     }
//     return <FallbackDownload file={file} onDownload={onDownload} message="Preview not available for this file type." />;
//   };

//   return (
//     <div
//       className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
//       onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
//     >
//       <div
//         className="relative bg-white rounded-2xl border border-gray-100 shadow-2xl flex flex-col overflow-hidden"
//         style={{ width: "92vw", maxWidth: "1100px", height: "92vh" }}
//       >
//         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-yellow-50 flex-shrink-0">
//           <div className="flex items-center gap-2 min-w-0">
//             <span className="text-xl">{getFileIcon(file)}</span>
//             <span className="font-bold text-black text-sm md:text-base truncate max-w-xs md:max-w-lg">{fileName}</span>
//           </div>
//           <div className="flex items-center gap-1.5 flex-shrink-0">
//             {isImageFile(file) && (
//               <>
//                 <button onClick={() => setZoom(z => Math.max(0.25, +(z - 0.25).toFixed(2)))}
//                   className="p-1.5 rounded-lg hover:bg-yellow-200 transition-colors" title="Zoom out">
//                   <ZoomOut size={16} />
//                 </button>
//                 <span className="text-xs font-medium text-gray-600 w-10 text-center select-none">
//                   {Math.round(zoom * 100)}%
//                 </span>
//                 <button onClick={() => setZoom(z => Math.min(5, +(z + 0.25).toFixed(2)))}
//                   className="p-1.5 rounded-lg hover:bg-yellow-200 transition-colors" title="Zoom in">
//                   <ZoomIn size={16} />
//                 </button>
//                 <button onClick={() => setRotation(r => (r + 90) % 360)}
//                   className="p-1.5 rounded-lg hover:bg-yellow-200 transition-colors" title="Rotate 90°">
//                   <RotateCw size={16} />
//                 </button>
//                 <div className="w-px h-5 bg-gray-300 mx-1" />
//               </>
//             )}
//             <button onClick={onDownload}
//               className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors">
//               <Download size={14} /> Download
//             </button>
//             <button onClick={onClose}
//               className="ml-1 p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
//               title="Close (Esc)">
//               <X size={18} />
//             </button>
//           </div>
//         </div>
//         <div className="flex-1 overflow-hidden">{renderContent()}</div>
//       </div>
//     </div>
//   );
// };

// const FallbackDownload = ({ file, onDownload, message }) => (
//   <div className="w-full h-full flex items-center justify-center bg-gray-50">
//     <div className="text-center py-16 px-8 max-w-sm">
//       <span className="text-6xl mb-4 block">{getFileIcon(file)}</span>
//       <p className="text-base font-bold text-gray-700 mb-2">{file?.fileName || file?.filename}</p>
//       <p className="text-sm text-gray-500 mb-6">{message}</p>
//       <button onClick={onDownload}
//         className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 px-6 rounded-xl shadow-sm flex items-center gap-2 mx-auto transition-colors">
//         <Download size={18} /> Download to view
//       </button>
//     </div>
//   </div>
// );

// // ─── Main Page Component ──────────────────────────────────────────────────────

// const FileManagement = () => {
//   const [projects, setProjects]               = useState([]);
//   const [projectFileCounts, setProjectFileCounts] = useState({});
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [projectFiles, setProjectFiles]       = useState([]);
//   const [loading, setLoading]                 = useState(true);
//   const [filesLoading, setFilesLoading]       = useState(false);
//   const [showAddFileForm, setShowAddFileForm] = useState(false);
//   const [saveMessage, setSaveMessage]         = useState("");
//   const [errorMessage, setErrorMessage]       = useState("");
//   const [viewMode, setViewMode]               = useState("projects");
//   const [fileFormData, setFileFormData]       = useState({ documentType: "", files: [] });
//   const [viewerState, setViewerState]         = useState(null);
//   const [viewLoading, setViewLoading]         = useState(false);

//   // Upload progress tracking (per selected-file index)
//   const [uploadProgress, setUploadProgress]   = useState({}); // { [index]: { percent, status: 'uploading'|'done'|'failed' } }
//   const [isUploading, setIsUploading]         = useState(false);

//   // UI-only state for the redesigned layout (search / sort / filter / view / tabs / pagination)
//   const [searchQuery, setSearchQuery]   = useState("");
//   const [sortOption, setSortOption]     = useState("date-desc");
//   const [showSortMenu, setShowSortMenu] = useState(false);
//   const [filterType, setFilterType]     = useState("");
//   const [showFilterMenu, setShowFilterMenu] = useState(false);
//   const [layoutMode, setLayoutMode]     = useState("list"); // "list" | "grid"
//   const [activeTab, setActiveTab]       = useState("all");
//   const [currentPage, setCurrentPage]   = useState(1);
//   const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

//   const folderInputRef = useRef(null);

//   const documentTypes = ["Contract", "Invoice", "Blueprint", "Report", "Certificate", "Permit", "Drawing", "Specification", "Other"];
//   const API_BASE_URL  = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

//   useEffect(() => {
//     document.title = "Vconstech - Admin";
//   }, []);

//   useEffect(() => {
//     if (folderInputRef.current) {
//       folderInputRef.current.setAttribute("webkitdirectory", "");
//       folderInputRef.current.setAttribute("directory", "");
//     }
//   }, []);

//   const showSuccessMessage = (message) => {
//     setSaveMessage(message);
//     setErrorMessage("");
//     setTimeout(() => setSaveMessage(""), 3000);
//   };

//   const showErrorMessage = (message) => {
//     setErrorMessage(message);
//     setSaveMessage("");
//     setTimeout(() => setErrorMessage(""), 5000);
//   };

//   const fetchWithAuth = async (url, options = {}) => {
//     const token = getAuthToken();
//     if (!token) throw new Error("No authentication token found. Please log in again.");
//     const response = await fetch(url, { ...options, headers: { ...options.headers, ...getAuthHeaders() } });
//     const data = await response.json();
//     if (!response.ok) throw new Error(data.error || "Request failed");
//     return data;
//   };

//   // Fetches file counts per project (reuses the existing files endpoint) so the
//   // landing page cards can show "X files" like the reference design.
//   const fetchAllFileCounts = async (projectList) => {
//     try {
//       const entries = await Promise.all(
//         projectList.map(async (p) => {
//           try {
//             const data = await fetchWithAuth(`${API_BASE_URL}/projects/${p.id}/files`);
//             return [p.id, (data.files || []).length];
//           } catch {
//             return [p.id, 0];
//           }
//         })
//       );
//       setProjectFileCounts(Object.fromEntries(entries));
//     } catch {
//       // Non-fatal — cards just fall back to showing no count
//     }
//   };

//   const fetchProjects = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchWithAuth(`${API_BASE_URL}/projects`);
//       const list = data.projects || [];
//       setProjects(list);
//       fetchAllFileCounts(list);
//     } catch (e) { showErrorMessage("Failed to load projects: " + e.message); }
//     finally     { setLoading(false); }
//   };

//   const fetchProjectFiles = async (projectId) => {
//     try {
//       setFilesLoading(true);
//       const data = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/files`);
//       setProjectFiles(data.files || []);
//     } catch (e) { showErrorMessage("Failed to load project files: " + e.message); }
//     finally     { setFilesLoading(false); }
//   };

//   useEffect(() => { fetchProjects(); }, []);

//   // Appends newly selected files (from either Browse Files or Browse Folder) to the list
//   const handleFileChange = (e) => {
//     const newFiles = Array.from(e.target.files || []);
//     if (newFiles.length === 0) return;
//     setFileFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
//     e.target.value = ""; // allow re-selecting the same file/folder again if removed
//   };

//   const handleFileInputChange = (e) => {
//     const { name, value } = e.target;
//     setFileFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleRemoveSelectedFile = (index) => {
//     setFileFormData((prev) => ({
//       ...prev,
//       files: prev.files.filter((_, i) => i !== index),
//     }));
//     setUploadProgress((prev) => {
//       const next = { ...prev };
//       delete next[index];
//       return next;
//     });
//   };

//   // Uploads a single file via XHR (instead of fetch) so we can report real progress,
//   // while hitting the exact same endpoint/body/auth as before.
//   const uploadSingleFileWithProgress = (singleFile, index) =>
//     new Promise((resolve, reject) => {
//       const token = getAuthToken();
//       if (!token) { reject(new Error("No authentication token found.")); return; }

//       const formData = new FormData();
//       formData.append("file", singleFile);
//       if (fileFormData.documentType) formData.append("documentType", fileFormData.documentType);

//       const xhr = new XMLHttpRequest();
//       xhr.open("POST", `${API_BASE_URL}/projects/${selectedProject.id}/files`);
//       xhr.setRequestHeader("Authorization", `Bearer ${token}`);

//       xhr.upload.onprogress = (event) => {
//         if (!event.lengthComputable) return;
//         const percent = Math.round((event.loaded / event.total) * 100);
//         setUploadProgress((prev) => ({
//           ...prev,
//           [index]: { percent, status: "uploading" },
//         }));
//       };

//       xhr.onload = () => {
//         let data = {};
//         try { data = JSON.parse(xhr.responseText || "{}"); } catch { /* ignore parse errors */ }
//         if (xhr.status >= 200 && xhr.status < 300) {
//           setUploadProgress((prev) => ({ ...prev, [index]: { percent: 100, status: "done" } }));
//           resolve(data);
//         } else {
//           setUploadProgress((prev) => ({ ...prev, [index]: { percent: prev[index]?.percent || 0, status: "failed" } }));
//           reject(new Error(data.error || `Failed to upload ${singleFile.name}`));
//         }
//       };

//       xhr.onerror = () => {
//         setUploadProgress((prev) => ({ ...prev, [index]: { percent: prev[index]?.percent || 0, status: "failed" } }));
//         reject(new Error(`Network error while uploading ${singleFile.name}`));
//       };

//       xhr.send(formData);
//     });

//   const handleAddFile = async () => {
//     if (!fileFormData.files || fileFormData.files.length === 0) {
//       showErrorMessage("Please select a file to upload!");
//       return;
//     }
//     setIsUploading(true);
//     setUploadProgress({});
//     let failedCount = 0;

//     for (let i = 0; i < fileFormData.files.length; i++) {
//       try {
//         await uploadSingleFileWithProgress(fileFormData.files[i], i);
//       } catch {
//         failedCount += 1;
//       }
//     }

//     setIsUploading(false);

//     if (failedCount === 0) {
//       showSuccessMessage("File(s) uploaded successfully!");
//       setFileFormData({ documentType: "", files: [] });
//       setUploadProgress({});
//       setShowAddFileForm(false);
//     } else {
//       showErrorMessage(`${failedCount} file(s) failed to upload. You can remove them and try again.`);
//     }

//     await fetchProjectFiles(selectedProject.id);
//     fetchAllFileCounts(projects);
//   };

//   const handleDeleteFile = async (fileId) => {
//     if (!window.confirm("Are you sure you want to delete this file?")) return;
//     try {
//       await fetchWithAuth(`${API_BASE_URL}/projects/${selectedProject.id}/files/${fileId}`, { method: "DELETE" });
//       showSuccessMessage("File deleted successfully!");
//       await fetchProjectFiles(selectedProject.id);
//       fetchAllFileCounts(projects);
//     } catch (e) { showErrorMessage("Failed to delete file: " + e.message); }
//   };

//   const handleOpenProject = async (project) => {
//     setSelectedProject(project);
//     setViewMode("files");
//     setSearchQuery("");
//     setActiveTab("all");
//     setFilterType("");
//     setCurrentPage(1);
//     await fetchProjectFiles(project.id);
//   };

//   const handleBackToProjects = () => {
//     setSelectedProject(null);
//     setViewMode("projects");
//     setShowAddFileForm(false);
//     setProjectFiles([]);
//   };

//   const handleCancelFile = () => {
//     if (isUploading) return; // avoid closing mid-upload
//     setShowAddFileForm(false);
//     setFileFormData({ documentType: "", files: [] });
//     setUploadProgress({});
//   };

//   const fetchFileData = async (file) => {
//     const url = `${API_BASE_URL}/projects/${selectedProject.id}/files/${file.id}/download`;
//     const response = await fetch(url, { method: "GET", headers: getAuthHeaders() });
//     if (!response.ok) {
//       const err = await response.json().catch(() => ({}));
//       throw new Error(err.error || `Failed: ${response.status} ${response.statusText}`);
//     }
//     const rawBlob   = await response.blob();
//     const mimeType  = getMimeType(file);
//     const typedBlob = new Blob([rawBlob], { type: mimeType });
//     const dataUri   = await blobToBase64(typedBlob);
//     return { rawBlob: typedBlob, dataUri };
//   };

//   const handleViewFile = async (file) => {
//     try {
//       if (!file.id) throw new Error("File ID not found");
//       setViewLoading(file.id);
//       const { rawBlob, dataUri } = await fetchFileData(file);
//       setViewerState({ file, dataUri, rawBlob });
//     } catch (e) { showErrorMessage("Failed to open file: " + e.message); }
//     finally     { setViewLoading(false); }
//   };

//   const handleModalDownload = () => {
//     if (!viewerState) return;
//     const { file, rawBlob } = viewerState;
//     const blobUrl = window.URL.createObjectURL(rawBlob);
//     const link    = document.createElement("a");
//     link.href     = blobUrl;
//     link.download = file.fileName || file.filename || "download";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//     setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
//   };

//   const getStatusBadgeColor = (status) => {
//     const statusMap = {
//       PENDING:       "bg-yellow-100 border-yellow-300 text-yellow-800",
//       Pending:       "bg-yellow-100 border-yellow-300 text-yellow-800",
//       ONGOING:       "bg-blue-100 border-blue-300 text-blue-800",
//       Ongoing:       "bg-blue-100 border-blue-300 text-blue-800",
//       "In Progress": "bg-blue-100 border-blue-300 text-blue-800",
//       COMPLETED:     "bg-green-100 border-green-300 text-green-800",
//       Completed:     "bg-green-100 border-green-300 text-green-800",
//     };
//     return statusMap[status] || "bg-gray-100 border-gray-300 text-gray-800";
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return "N/A";
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric", month: "short", day: "numeric",
//     });
//   };

//   // ── Derived data for the files page: search + tab + filter + sort + pagination ──
//   const visibleFiles = useMemo(() => {
//     let list = [...projectFiles];

//     if (activeTab === "folders") return [];
//     if (activeTab !== "all") list = list.filter((f) => getFileTabCategory(f) === activeTab);

//     // Search by File Name, Project Name, Uploaded By
//     if (searchQuery.trim()) {
//       const q = searchQuery.trim().toLowerCase();
//       list = list.filter((f) => {
//         const nameMatch = (f.fileName || f.filename || "").toLowerCase().includes(q);
//         const projectMatch = (selectedProject?.name || "").toLowerCase().includes(q);
//         const uploaderMatch = (f.uploadedBy || f.uploaderName || f.uploaderEmail || "")
//           .toLowerCase()
//           .includes(q);
//         return nameMatch || projectMatch || uploaderMatch;
//       });
//     }

//     // Filter by file category (PDF / Word / Excel / Image / CAD / ZIP / Other)
//     if (filterType) list = list.filter((f) => getFileCategory(f) === filterType);

//     list.sort((a, b) => {
//       const nameA = (a.fileName || a.filename || "").toLowerCase();
//       const nameB = (b.fileName || b.filename || "").toLowerCase();
//       const dateA = new Date(a.uploadedAt || a.createdAt || 0).getTime();
//       const dateB = new Date(b.uploadedAt || b.createdAt || 0).getTime();
//       const sizeA = a.size ?? a.fileSize ?? 0;
//       const sizeB = b.size ?? b.fileSize ?? 0;
//       switch (sortOption) {
//         case "name-asc":  return nameA.localeCompare(nameB);
//         case "name-desc": return nameB.localeCompare(nameA);
//         case "date-asc":  return dateA - dateB;
//         case "size-desc": return sizeB - sizeA;
//         case "size-asc":  return sizeA - sizeB;
//         case "date-desc":
//         default:          return dateB - dateA;
//       }
//     });

//     return list;
//   }, [projectFiles, activeTab, searchQuery, filterType, sortOption, selectedProject]);

//   const totalPages = Math.max(1, Math.ceil(visibleFiles.length / itemsPerPage));
//   const paginatedFiles = visibleFiles.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   useEffect(() => { setCurrentPage(1); }, [searchQuery, activeTab, filterType, sortOption]);

//   const sortLabels = {
//     "date-desc": "Latest",
//     "date-asc":  "Oldest",
//     "name-asc":  "Name (A-Z)",
//     "name-desc": "Name (Z-A)",
//     "size-desc": "Largest File",
//     "size-asc":  "Smallest File",
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">

//       {/* File viewer modal */}
//       {viewerState && (
//         <FileViewerModal
//           file={viewerState.file}
//           dataUri={viewerState.dataUri}
//           rawBlob={viewerState.rawBlob}
//           onClose={() => setViewerState(null)}
//           onDownload={handleModalDownload}
//         />
//       )}

//       {/* Navbar */}
//       <nav className="fixed top-0 left-0 right-0 z-50 h-16">
//         <Navbar />
//       </nav>

//       {/* SidePannel */}
//       <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
//         <SidePannel />
//       </aside>

//       {/* Main content */}
//       <div className="pt-20 md:pl-64 md:pt-25">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-10">

//           {/* Success / Error banners */}
//           {saveMessage && (
//             <div className="mb-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-center font-medium text-sm flex items-center justify-center gap-2 shadow-sm">
//               <Save size={16} /> {saveMessage}
//             </div>
//           )}
//           {errorMessage && (
//             <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-center font-medium text-sm flex items-center justify-center gap-2 shadow-sm">
//               <AlertCircle size={16} /> {errorMessage}
//             </div>
//           )}

//           {/* ══════════════════════════ Breadcrumb ══════════════════════════ */}
//           <div className="mb-4 flex items-center gap-1.5 text-sm">
//             <button
//               onClick={handleBackToProjects}
//               className={viewMode === "projects" ? "font-semibold text-black" : "text-gray-500 hover:text-black"}
//             >
//               File Management
//             </button>
//             {viewMode === "files" && (
//               <>
//                 <ChevronRight size={15} className="text-gray-400" />
//                 <span className="font-semibold text-black truncate max-w-[220px]">{selectedProject?.name}</span>
//               </>
//             )}
//           </div>

//           {/* ══════════════════════════ Header row ══════════════════════════ */}
//           {viewMode === "projects" ? (
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//               <div>
//                 <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 mb-1">File Management</h1>
//                 <p className="text-sm text-gray-500">Access and manage all your project documents in one place.</p>
//               </div>
//               <div className="flex items-center gap-2 flex-shrink-0">
//                 <button
//                   onClick={() => showErrorMessage("Open a project to create a folder inside it.")}
//                   className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black font-semibold text-sm py-2.5 px-4 rounded-xl border border-gray-200 shadow-sm transition-colors"
//                 >
//                   <FolderPlus size={16} /> New Folder
//                 </button>
//                 <button
//                   onClick={() => showErrorMessage("Open a project first, then upload files to it.")}
//                   className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-colors"
//                 >
//                   <Upload size={16} /> Upload Files
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
//               <div className="flex items-start gap-3">
//                 <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${CARD_ACCENTS[(projects.findIndex(p => p.id === selectedProject?.id)) % CARD_ACCENTS.length] || CARD_ACCENTS[0]}`}>
//                   <FolderOpen size={26} />
//                 </div>
//                 <div>
//                   <h1 className="text-xl md:text-2xl font-bold text-black">{selectedProject?.name}</h1>
//                   <p className="text-sm text-gray-500 mt-0.5">
//                     {visibleFiles.length} {visibleFiles.length === 1 ? "file" : "files"}
//                     {activeTab !== "all" ? ` in ${TABS.find(t => t.key === activeTab)?.label}` : ""}
//                   </p>
//                   {selectedProject?.description && (
//                     <p className="text-sm text-gray-500 mt-1 max-w-lg">{selectedProject.description}</p>
//                   )}
//                 </div>
//               </div>
//               <div className="flex items-center gap-2 flex-shrink-0">
//                 <button
//                   onClick={() => showErrorMessage("Folder creation isn't available yet.")}
//                   className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black font-semibold text-sm py-2.5 px-4 rounded-xl border border-gray-200 shadow-sm transition-colors"
//                 >
//                   <FolderPlus size={16} /> New Folder
//                 </button>
//                 <button
//                   onClick={() => setShowAddFileForm(true)}
//                   className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-colors"
//                 >
//                   <Upload size={16} /> Upload Files
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* ══════════════════════════ Upload form (modal) ══════════════════════════ */}
//           {showAddFileForm && (
//             <div
//               className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 p-4"
//               onClick={(e) => { if (e.target === e.currentTarget) handleCancelFile(); }}
//             >
//               <div className="relative bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg overflow-hidden">

//                 {/* Header */}
//                 <div className="flex items-start justify-between p-5 md:p-6 border-b border-[#E5E7EB]">
//                   <div className="flex items-center gap-4">
//                     <div className="w-12 h-12 rounded-2xl bg-[#FFF6E0] flex items-center justify-center flex-shrink-0">
//                       <Upload size={22} className="text-[#FFBE2A]" />
//                     </div>
//                     <div>
//                       <h3 className="text-lg font-bold text-[#1F2937]">Upload Files</h3>
//                       <p className="text-sm text-gray-500 mt-0.5">
//                         Upload files for the selected project.
//                       </p>
//                     </div>
//                   </div>
//                   <button
//                     onClick={handleCancelFile}
//                     disabled={isUploading}
//                     className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#1F2937] transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
//                   >
//                     <X size={18} />
//                   </button>
//                 </div>

//                 {/* Body */}
//                 <div className="p-5 md:p-6 space-y-5">

//                   {/* Existing project info */}
//                   {selectedProject?.name && (
//                     <div className="flex items-center gap-2 text-sm text-gray-500">
//                       <FolderOpen size={15} className="text-[#FFBE2A]" />
//                       <span>
//                         Uploading to <span className="font-semibold text-[#1F2937]">{selectedProject.name}</span>
//                       </span>
//                     </div>
//                   )}

//                   {/* Document type */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#1F2937] mb-2">
//                       Document Type
//                     </label>
//                     <select
//                       name="documentType"
//                       value={fileFormData.documentType}
//                       onChange={handleFileInputChange}
//                       disabled={isUploading}
//                       className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFBE2A] bg-white text-[#1F2937] shadow-sm transition-colors disabled:opacity-60"
//                     >
//                       <option value="">Select document type</option>
//                       {documentTypes.map((type) => (
//                         <option key={type} value={type}>{type}</option>
//                       ))}
//                     </select>
//                   </div>

//                   {/* Upload area */}
//                   <div>
//                     <label className="block text-sm font-medium text-[#1F2937] mb-2">
//                       Attach Files
//                     </label>
//                     <div className="border-2 border-dashed border-[#FFBE2A]/50 rounded-2xl p-8 md:p-10 text-center bg-[#FFF6E0]/50 hover:bg-[#FFF6E0] transition-colors">
//                       <input
//                         type="file"
//                         id="file-upload"
//                         multiple
//                         onChange={handleFileChange}
//                         className="hidden"
//                         accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.dwg,.dxf"
//                         disabled={isUploading}
//                       />
//                       <input
//                         type="file"
//                         id="folder-upload"
//                         multiple
//                         ref={folderInputRef}
//                         onChange={handleFileChange}
//                         className="hidden"
//                         disabled={isUploading}
//                       />
//                       <div className="w-14 h-14 rounded-2xl bg-[#FFF1C6] flex items-center justify-center mx-auto mb-3">
//                         <Upload size={26} className="text-[#B8860B]" />
//                       </div>
//                       <p className="text-sm font-semibold text-[#1F2937] mb-1">
//                         Drag &amp; drop your files here
//                       </p>
//                       <p className="text-xs text-gray-500 mb-4">or</p>
//                       <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
//                         <label
//                           htmlFor="file-upload"
//                           className={`inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#1F2937] font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-colors ${
//                             isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
//                           }`}
//                         >
//                           <FolderOpen size={16} /> Browse Files
//                         </label>
//                         <label
//                           htmlFor="folder-upload"
//                           className={`inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#1F2937] font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-colors ${
//                             isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
//                           }`}
//                         >
//                           <FolderOpen size={16} /> Browse Folder
//                         </label>
//                       </div>
//                       <p className="text-xs text-gray-400 mt-4">
//                         PDF, DOC, DOCX, JPG, PNG, XLSX, DWG, DXF supported
//                       </p>
//                     </div>
//                   </div>

//                   {/* Selected files list */}
//                   {fileFormData.files.length > 0 && (
//                     <div>
//                       <p className="text-sm font-medium text-[#1F2937] mb-2">
//                         Selected Files ({fileFormData.files.length})
//                       </p>
//                       <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
//                         {fileFormData.files.map((f, index) => {
//                           const progress = uploadProgress[index];
//                           return (
//                             <div
//                               key={`${f.name}-${f.lastModified}-${index}`}
//                               className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl shadow-sm hover:shadow-md transition-shadow"
//                             >
//                               <div className="flex items-center gap-3">
//                                 <div
//                                   className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase ${
//                                     getFileTypeMeta({ fileName: f.name }).badge
//                                   }`}
//                                 >
//                                   {getFileExtension({ fileName: f.name }) || "file"}
//                                 </div>
//                                 <div className="min-w-0 flex-1">
//                                   <p className="text-sm font-medium text-[#1F2937] truncate">{f.name}</p>
//                                   <p className="text-xs text-gray-500">
//                                     {getFileTypeMeta({ fileName: f.name }).label}
//                                     {f.size ? ` • ${(f.size / (1024 * 1024)).toFixed(2)} MB` : ""}
//                                   </p>
//                                 </div>

//                                 {!progress && (
//                                   <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
//                                     <CheckCircle2 size={12} /> Ready
//                                   </span>
//                                 )}
//                                 {progress?.status === "done" && (
//                                   <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
//                                     <CheckCircle2 size={12} /> Uploaded
//                                   </span>
//                                 )}
//                                 {progress?.status === "failed" && (
//                                   <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full flex-shrink-0">
//                                     <XCircle size={12} /> Failed
//                                   </span>
//                                 )}
//                                 {progress?.status === "uploading" && (
//                                   <span className="text-xs font-medium text-gray-500 flex-shrink-0">
//                                     {progress.percent}%
//                                   </span>
//                                 )}

//                                 <button
//                                   onClick={() => handleRemoveSelectedFile(index)}
//                                   disabled={isUploading}
//                                   className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
//                                   title="Remove file"
//                                 >
//                                   <Trash2 size={15} />
//                                 </button>
//                               </div>

//                               {/* Per-file progress bar (shown only while uploading/after attempt) */}
//                               {progress && (
//                                 <div className="mt-2.5 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                                   <div
//                                     className={`h-full rounded-full transition-all duration-200 ${
//                                       progress.status === "failed" ? "bg-red-400" : "bg-[#FFBE2A]"
//                                     }`}
//                                     style={{ width: `${progress.percent}%` }}
//                                   />
//                                 </div>
//                               )}
//                             </div>
//                           );
//                         })}
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* Footer */}
//                 <div className="flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-[#E5E7EB] bg-gray-50/60">
//                   <button
//                     onClick={handleCancelFile}
//                     disabled={isUploading}
//                     className="font-semibold text-sm py-2.5 px-5 rounded-xl border border-[#E5E7EB] text-[#1F2937] bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleAddFile}
//                     disabled={isUploading || fileFormData.files.length === 0}
//                     className="flex items-center gap-2 bg-[#FFBE2A] hover:bg-[#F0AE1A] text-black font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                   >
//                     {isUploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
//                     {isUploading
//                       ? "Uploading..."
//                       : fileFormData.files.length > 1
//                         ? `Upload ${fileFormData.files.length} Files`
//                         : "Upload File"}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* ══════════════════════════ Projects grid (landing page) ══════════════════════════ */}
//           {viewMode === "projects" && (
//             <div>
//               {loading ? (
//                 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
//                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-4" />
//                   <p className="text-sm font-medium text-gray-600">Loading projects...</p>
//                 </div>
//               ) : projects.length > 0 ? (
//                 <>
//                   <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Projects</h2>
//                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//                     {projects.map((project, idx) => (
//                       <div
//                         key={project.id}
//                         onClick={() => handleOpenProject(project)}
//                         className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer"
//                       >
//                         <div className="flex items-start justify-between mb-4">
//                           <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${CARD_ACCENTS[idx % CARD_ACCENTS.length]}`}>
//                             <FolderOpen size={20} />
//                           </div>
//                           <ChevronRight size={18} className="text-gray-300 mt-2" />
//                         </div>
//                         <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{project.name}</h3>
//                         <p className="text-xs text-gray-500 mb-3">
//                           {projectFileCounts[project.id] ?? "…"} files
//                         </p>
//                         <div className="flex flex-wrap gap-2 items-center mb-2">
//                           <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${getStatusBadgeColor(project.status)}`}>
//                             {project.status?.charAt(0).toUpperCase() + project.status?.slice(1).toLowerCase()}
//                           </span>
//                         </div>
//                         <p className="text-sm text-gray-500 line-clamp-2">
//                           {project.description || "Project documents and files"}
//                         </p>
//                       </div>
//                     ))}
//                   </div>
//                 </>
//               ) : (
//                 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
//                   <FolderOpen size={44} className="mx-auto text-gray-300 mb-4" />
//                   <p className="text-base font-medium text-gray-700 mb-1">No projects found</p>
//                   <p className="text-sm text-gray-500">Projects will appear here once they are created</p>
//                 </div>
//               )}
//             </div>
//           )}

//           {/* ══════════════════════════ Files page ══════════════════════════ */}
//           {viewMode === "files" && selectedProject && (
//             <div>
//               {/* Search + Filter + Sort + View toggle */}
//               <div className="flex flex-col sm:flex-row gap-3 mb-4">
//                 <div className="relative flex-1">
//                   <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
//                   <input
//                     type="text"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     placeholder="Search files..."
//                     className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white shadow-sm"
//                   />
//                 </div>

//                 {/* Filter dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={() => { setShowFilterMenu((s) => !s); setShowSortMenu(false); }}
//                     className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border shadow-sm transition-colors ${
//                       filterType
//                         ? "bg-yellow-50 border-yellow-300 text-yellow-800"
//                         : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
//                     }`}
//                   >
//                     <Filter size={15} /> {filterType ? FILTER_OPTIONS.find(o => o.key === filterType)?.label : "Filter"}
//                   </button>
//                   {showFilterMenu && (
//                     <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
//                       {FILTER_OPTIONS.map((opt) => (
//                         <button
//                           key={opt.key}
//                           onClick={() => { setFilterType(opt.key); setShowFilterMenu(false); }}
//                           className={`w-full text-left px-3 py-2 text-sm ${
//                             filterType === opt.key
//                               ? "bg-yellow-50 text-yellow-800 font-medium"
//                               : "hover:bg-gray-50 text-gray-700"
//                           }`}
//                         >
//                           {opt.label}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* Sort dropdown */}
//                 <div className="relative">
//                   <button
//                     onClick={() => { setShowSortMenu((s) => !s); setShowFilterMenu(false); }}
//                     className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
//                   >
//                     <ArrowUpDown size={15} /> Sort: {sortLabels[sortOption]} <ChevronDown size={14} />
//                   </button>
//                   {showSortMenu && (
//                     <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
//                       {Object.entries(sortLabels).map(([key, label]) => (
//                         <button
//                           key={key}
//                           onClick={() => { setSortOption(key); setShowSortMenu(false); }}
//                           className={`w-full text-left px-3 py-2 text-sm ${
//                             sortOption === key
//                               ? "bg-yellow-50 text-yellow-800 font-medium"
//                               : "hover:bg-gray-50 text-gray-700"
//                           }`}
//                         >
//                           {label}
//                         </button>
//                       ))}
//                     </div>
//                   )}
//                 </div>

//                 {/* List / Grid segmented toggle */}
//                 <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 flex-shrink-0">
//                   <button
//                     onClick={() => setLayoutMode("list")}
//                     className={`p-2 rounded-lg transition-colors ${
//                       layoutMode === "list" ? "bg-yellow-400 text-black" : "text-gray-500 hover:text-black"
//                     }`}
//                     title="List view"
//                   >
//                     <List size={16} />
//                   </button>
//                   <button
//                     onClick={() => setLayoutMode("grid")}
//                     className={`p-2 rounded-lg transition-colors ${
//                       layoutMode === "grid" ? "bg-yellow-400 text-black" : "text-gray-500 hover:text-black"
//                     }`}
//                     title="Grid view"
//                   >
//                     <LayoutGrid size={16} />
//                   </button>
//                 </div>
//               </div>

//               {/* Tabs */}
//               <div className="flex items-center gap-5 border-b border-gray-200 mb-4 overflow-x-auto">
//                 {TABS.map((tab) => (
//                   <button
//                     key={tab.key}
//                     onClick={() => setActiveTab(tab.key)}
//                     className={`pb-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
//                       activeTab === tab.key
//                         ? "border-yellow-400 text-black"
//                         : "border-transparent text-gray-500 hover:text-black"
//                     }`}
//                   >
//                     {tab.label}
//                   </button>
//                 ))}
//               </div>

//               {/* Content */}
//               {filesLoading ? (
//                 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
//                   <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-4" />
//                   <p className="text-sm font-medium text-gray-600">Loading files...</p>
//                 </div>
//               ) : activeTab === "folders" ? (
//                 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
//                   <FolderOpen size={44} className="mx-auto text-gray-300 mb-4" />
//                   <p className="text-base font-medium text-gray-700 mb-1">No folders yet</p>
//                   <p className="text-sm text-gray-500">Folder organization isn't available yet.</p>
//                 </div>
//               ) : visibleFiles.length === 0 ? (
//                 <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
//                   <Filter size={44} className="mx-auto text-gray-300 mb-4" />
//                   <p className="text-base font-medium text-gray-700 mb-1">
//                     {searchQuery || filterType ? "No files match your search" : "No files uploaded yet"}
//                   </p>
//                   <p className="text-sm text-gray-500">
//                     {searchQuery || filterType ? "Try a different search or filter." : "Click \"Upload Files\" to add documents to this project"}
//                   </p>
//                 </div>
//               ) : layoutMode === "list" ? (
//                 <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
//                   <table className="w-full text-sm">
//                     <thead>
//                       <tr className="bg-yellow-400 text-left text-black">
//                         <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs">Name</th>
//                         <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs hidden sm:table-cell">Type</th>
//                         <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs hidden md:table-cell">Uploaded</th>
//                         <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs text-center w-32">Actions</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {paginatedFiles.map((file) => {
//                         const meta = getFileTypeMeta(file);
//                         return (
//                           <tr key={file.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
//                             <td className="py-3 px-4">
//                               <div className="flex items-center gap-3 min-w-0">
//                                 <span className="font-medium text-gray-900 truncate">{file.fileName || file.filename}</span>
//                                 {file.documentType && (
//                                   <span className="hidden lg:inline text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md font-medium flex-shrink-0">
//                                     {file.documentType}
//                                   </span>
//                                 )}
//                               </div>
//                             </td>
//                             <td className="py-3 px-4 hidden sm:table-cell">
//                               <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${meta.badge}`}>
//                                 {meta.label}
//                               </span>
//                             </td>
//                             <td className="py-3 px-4 hidden md:table-cell text-gray-500">
//                               {formatDate(file.uploadedAt || file.createdAt)}
//                             </td>
//                             <td className="py-3 px-4 w-32">
//                               <div className="flex items-center justify-center gap-2">
//                                 <button
//                                   onClick={() => handleViewFile(file)}
//                                   disabled={viewLoading === file.id}
//                                   className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
//                                 >
//                                   {viewLoading === file.id
//                                     ? <Loader size={13} className="animate-spin" />
//                                     : <ExternalLink size={13} />
//                                   }
//                                   <span className="hidden sm:inline">View</span>
//                                 </button>
//                                 <button
//                                   onClick={() => handleDeleteFile(file.id)}
//                                   className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
//                                   title="Delete File"
//                                 >
//                                   <Trash2 size={14} />
//                                 </button>
//                               </div>
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {paginatedFiles.map((file) => {
//                     const meta = getFileTypeMeta(file);
//                     return (
//                       <div key={file.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
//                         <div className="flex items-start justify-between mb-3">
//                           <span className="text-3xl">{getFileIcon(file)}</span>
//                           <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${meta.badge}`}>{meta.label}</span>
//                         </div>
//                         <p className="font-medium text-gray-900 text-sm mb-1 truncate">{file.fileName || file.filename}</p>
//                         <p className="text-xs text-gray-500 mb-3">{formatDate(file.uploadedAt || file.createdAt)}</p>
//                         <div className="flex items-center gap-2">
//                           <button
//                             onClick={() => handleViewFile(file)}
//                             disabled={viewLoading === file.id}
//                             className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 text-blue-600 py-1.5 rounded-lg text-xs font-medium transition-colors"
//                           >
//                             {viewLoading === file.id
//                               ? <Loader size={13} className="animate-spin" />
//                               : <ExternalLink size={13} />
//                             }
//                             View
//                           </button>
//                           <button
//                             onClick={() => handleDeleteFile(file.id)}
//                             className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
//                             title="Delete File"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}

//               {/* Pagination */}
//               {visibleFiles.length > 0 && (
//                 <Pagination
//                   currentPage={currentPage}
//                   totalItems={visibleFiles.length}
//                   pageSize={itemsPerPage}
//                   onPageChange={setCurrentPage}
//                   onPageSizeChange={setItemsPerPage}
//                   className="mt-4 px-0 sm:px-0"
//                 />
//               )}
//             </div>
//           )}

//         </div>
//       </div>
//     </div>
//   );
// };

// export default FileManagement;
import { useState, useEffect, useMemo } from "react";
import {
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
  Search,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  FolderPlus,
  ChevronDown,
} from "lucide-react";
import SidePannel from "../../components/common/SidePannel";
import Navbar from "../../components/common/Navbar";
import Pagination, { DEFAULT_PAGE_SIZE } from "../../components/common/Pagination";
import UploadFilesModal from "../../components/common/UploadFilesModal";
import { getAuthHeaders } from "../../utils/auth";
import {
  getFileExtension,
  getFileIcon,
  getMimeType,
  isImageFile,
  isPdfFile,
  isOfficeFile,
  blobToBase64,
  getFileTypeMeta,
  getFileTabCategory,
  getFileCategory,
  FILTER_OPTIONS,
  CARD_ACCENTS,
  TABS,
} from "../billing-refactored/utils/fileManagementHelpers";

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
              borderRadius: "12px",
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
                <Loader size={36} className="animate-spin text-yellow-500" />
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
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 px-6 rounded-xl shadow-sm flex items-center gap-2 mx-auto transition-colors">
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
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl border border-gray-100 shadow-2xl flex flex-col overflow-hidden"
        style={{ width: "92vw", maxWidth: "1100px", height: "92vh" }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-yellow-50 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{getFileIcon(file)}</span>
            <span className="font-bold text-black text-sm md:text-base truncate max-w-xs md:max-w-lg">{fileName}</span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {isImageFile(file) && (
              <>
                <button onClick={() => setZoom(z => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  className="p-1.5 rounded-lg hover:bg-yellow-200 transition-colors" title="Zoom out">
                  <ZoomOut size={16} />
                </button>
                <span className="text-xs font-medium text-gray-600 w-10 text-center select-none">
                  {Math.round(zoom * 100)}%
                </span>
                <button onClick={() => setZoom(z => Math.min(5, +(z + 0.25).toFixed(2)))}
                  className="p-1.5 rounded-lg hover:bg-yellow-200 transition-colors" title="Zoom in">
                  <ZoomIn size={16} />
                </button>
                <button onClick={() => setRotation(r => (r + 90) % 360)}
                  className="p-1.5 rounded-lg hover:bg-yellow-200 transition-colors" title="Rotate 90°">
                  <RotateCw size={16} />
                </button>
                <div className="w-px h-5 bg-gray-300 mx-1" />
              </>
            )}
            <button onClick={onDownload}
              className="flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-colors">
              <Download size={14} /> Download
            </button>
            <button onClick={onClose}
              className="ml-1 p-1.5 rounded-lg hover:bg-red-100 text-red-500 transition-colors"
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
        className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2.5 px-6 rounded-xl shadow-sm flex items-center gap-2 mx-auto transition-colors">
        <Download size={18} /> Download to view
      </button>
    </div>
  </div>
);

// ─── Main Page Component ──────────────────────────────────────────────────────

const FileManagement = () => {
  const [projects, setProjects]               = useState([]);
  const [projectFileCounts, setProjectFileCounts] = useState({});
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFiles, setProjectFiles]       = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [filesLoading, setFilesLoading]       = useState(false);
  const [showAddFileForm, setShowAddFileForm] = useState(false);
  const [saveMessage, setSaveMessage]         = useState("");
  const [errorMessage, setErrorMessage]       = useState("");
  const [viewMode, setViewMode]               = useState("projects");
  const [viewerState, setViewerState]         = useState(null);
  const [viewLoading, setViewLoading]         = useState(false);

  // UI-only state for the redesigned layout (search / sort / filter / view / tabs / pagination)
  const [searchQuery, setSearchQuery]   = useState("");
  const [sortOption, setSortOption]     = useState("date-desc");
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [filterType, setFilterType]     = useState("");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [layoutMode, setLayoutMode]     = useState("list"); // "list" | "grid"
  const [activeTab, setActiveTab]       = useState("all");
  const [currentPage, setCurrentPage]   = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGE_SIZE);

  const API_BASE_URL  = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

  useEffect(() => {
    document.title = "Vconstech - Admin";
  }, []);

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
    const token = getAuthHeaders ? null : null; // no-op guard, token check happens via getAuthHeaders below
    const response = await fetch(url, { ...options, headers: { ...options.headers, ...getAuthHeaders() } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
  };

  // Fetches file counts per project (reuses the existing files endpoint) so the
  // landing page cards can show "X files" like the reference design.
  const fetchAllFileCounts = async (projectList) => {
    try {
      const entries = await Promise.all(
        projectList.map(async (p) => {
          try {
            const data = await fetchWithAuth(`${API_BASE_URL}/projects/${p.id}/files`);
            return [p.id, (data.files || []).length];
          } catch {
            return [p.id, 0];
          }
        })
      );
      setProjectFileCounts(Object.fromEntries(entries));
    } catch {
      // Non-fatal — cards just fall back to showing no count
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/projects`);
      const list = data.projects || [];
      setProjects(list);
      fetchAllFileCounts(list);
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

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await fetchWithAuth(`${API_BASE_URL}/projects/${selectedProject.id}/files/${fileId}`, { method: "DELETE" });
      showSuccessMessage("File deleted successfully!");
      await fetchProjectFiles(selectedProject.id);
      fetchAllFileCounts(projects);
    } catch (e) { showErrorMessage("Failed to delete file: " + e.message); }
  };

  const handleOpenProject = async (project) => {
    setSelectedProject(project);
    setViewMode("files");
    setSearchQuery("");
    setActiveTab("all");
    setFilterType("");
    setCurrentPage(1);
    await fetchProjectFiles(project.id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setViewMode("projects");
    setShowAddFileForm(false);
    setProjectFiles([]);
  };

  // Called by UploadFilesModal after every upload attempt to refresh the file list/counts
  const handleUploadSuccess = async () => {
    await fetchProjectFiles(selectedProject.id);
    fetchAllFileCounts(projects);
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
      PENDING:       "bg-yellow-100 border-yellow-300 text-yellow-800",
      Pending:       "bg-yellow-100 border-yellow-300 text-yellow-800",
      ONGOING:       "bg-blue-100 border-blue-300 text-blue-800",
      Ongoing:       "bg-blue-100 border-blue-300 text-blue-800",
      "In Progress": "bg-blue-100 border-blue-300 text-blue-800",
      COMPLETED:     "bg-green-100 border-green-300 text-green-800",
      Completed:     "bg-green-100 border-green-300 text-green-800",
    };
    return statusMap[status] || "bg-gray-100 border-gray-300 text-gray-800";
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });
  };

  // ── Derived data for the files page: search + tab + filter + sort + pagination ──
  const visibleFiles = useMemo(() => {
    let list = [...projectFiles];

    if (activeTab === "folders") return [];
    if (activeTab !== "all") list = list.filter((f) => getFileTabCategory(f) === activeTab);

    // Search by File Name, Project Name, Uploaded By
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter((f) => {
        const nameMatch = (f.fileName || f.filename || "").toLowerCase().includes(q);
        const projectMatch = (selectedProject?.name || "").toLowerCase().includes(q);
        const uploaderMatch = (f.uploadedBy || f.uploaderName || f.uploaderEmail || "")
          .toLowerCase()
          .includes(q);
        return nameMatch || projectMatch || uploaderMatch;
      });
    }

    // Filter by file category (PDF / Word / Excel / Image / CAD / ZIP / Other)
    if (filterType) list = list.filter((f) => getFileCategory(f) === filterType);

    list.sort((a, b) => {
      const nameA = (a.fileName || a.filename || "").toLowerCase();
      const nameB = (b.fileName || b.filename || "").toLowerCase();
      const dateA = new Date(a.uploadedAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.uploadedAt || b.createdAt || 0).getTime();
      const sizeA = a.size ?? a.fileSize ?? 0;
      const sizeB = b.size ?? b.fileSize ?? 0;
      switch (sortOption) {
        case "name-asc":  return nameA.localeCompare(nameB);
        case "name-desc": return nameB.localeCompare(nameA);
        case "date-asc":  return dateA - dateB;
        case "size-desc": return sizeB - sizeA;
        case "size-asc":  return sizeA - sizeB;
        case "date-desc":
        default:          return dateB - dateA;
      }
    });

    return list;
  }, [projectFiles, activeTab, searchQuery, filterType, sortOption, selectedProject]);

  const totalPages = Math.max(1, Math.ceil(visibleFiles.length / itemsPerPage));
  const paginatedFiles = visibleFiles.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => { setCurrentPage(1); }, [searchQuery, activeTab, filterType, sortOption]);

  const sortLabels = {
    "date-desc": "Latest",
    "date-asc":  "Oldest",
    "name-asc":  "Name (A-Z)",
    "name-desc": "Name (Z-A)",
    "size-desc": "Largest File",
    "size-asc":  "Smallest File",
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
      <div className="pt-20 md:pl-64 md:pt-25">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-24 md:pb-10">

          {/* Success / Error banners */}
          {saveMessage && (
            <div className="mb-4 p-3 md:p-4 bg-green-50 border border-green-200 rounded-2xl text-green-800 text-center font-medium text-sm flex items-center justify-center gap-2 shadow-sm">
              <Save size={16} /> {saveMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 md:p-4 bg-red-50 border border-red-200 rounded-2xl text-red-800 text-center font-medium text-sm flex items-center justify-center gap-2 shadow-sm">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          {/* ══════════════════════════ Breadcrumb ══════════════════════════ */}
          <div className="mb-4 flex items-center gap-1.5 text-sm">
            <button
              onClick={handleBackToProjects}
              className={viewMode === "projects" ? "font-semibold text-black" : "text-gray-500 hover:text-black"}
            >
              File Management
            </button>
            {viewMode === "files" && (
              <>
                <ChevronRight size={15} className="text-gray-400" />
                <span className="font-semibold text-black truncate max-w-[220px]">{selectedProject?.name}</span>
              </>
            )}
          </div>

          {/* ══════════════════════════ Header row ══════════════════════════ */}
          {viewMode === "projects" ? (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900 mb-1">File Management</h1>
                <p className="text-sm text-gray-500">Access and manage all your project documents in one place.</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                
                <button
                  onClick={() => showErrorMessage("Open a project first, then upload files to it.")}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-colors"
                >
                  <Upload size={16} /> Upload Files
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
              <div className="flex items-start gap-3">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${CARD_ACCENTS[(projects.findIndex(p => p.id === selectedProject?.id)) % CARD_ACCENTS.length] || CARD_ACCENTS[0]}`}>
                  <FolderOpen size={26} />
                </div>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-black">{selectedProject?.name}</h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {visibleFiles.length} {visibleFiles.length === 1 ? "file" : "files"}
                    {activeTab !== "all" ? ` in ${TABS.find(t => t.key === activeTab)?.label}` : ""}
                  </p>
                  {selectedProject?.description && (
                    <p className="text-sm text-gray-500 mt-1 max-w-lg">{selectedProject.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => showErrorMessage("Folder creation isn't available yet.")}
                  className="flex items-center gap-2 bg-white hover:bg-gray-50 text-black font-semibold text-sm py-2.5 px-4 rounded-xl border border-gray-200 shadow-sm transition-colors"
                >
                  <FolderPlus size={16} /> New Folder
                </button>
                <button
                  onClick={() => setShowAddFileForm(true)}
                  className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-colors"
                >
                  <Upload size={16} /> Upload Files
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════ Upload form (modal, now its own component) ══════════════════════════ */}
          {showAddFileForm && (
            <UploadFilesModal
              selectedProject={selectedProject}
              apiBaseUrl={API_BASE_URL}
              onClose={() => setShowAddFileForm(false)}
              onUploadSuccess={handleUploadSuccess}
              showSuccessMessage={showSuccessMessage}
              showErrorMessage={showErrorMessage}
            />
          )}

          {/* ══════════════════════════ Projects grid (landing page) ══════════════════════════ */}
          {viewMode === "projects" && (
            <div>
              {loading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">Loading projects...</p>
                </div>
              ) : projects.length > 0 ? (
                <>
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Projects</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {projects.map((project, idx) => (
                      <div
                        key={project.id}
                        onClick={() => handleOpenProject(project)}
                        className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 hover:shadow-md hover:border-yellow-300 transition-all cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${CARD_ACCENTS[idx % CARD_ACCENTS.length]}`}>
                            <FolderOpen size={20} />
                          </div>
                          <ChevronRight size={18} className="text-gray-300 mt-2" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-base mb-1 truncate">{project.name}</h3>
                        <p className="text-xs text-gray-500 mb-3">
                          {projectFileCounts[project.id] ?? "…"} files
                        </p>
                        <div className="flex flex-wrap gap-2 items-center mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${getStatusBadgeColor(project.status)}`}>
                            {project.status?.charAt(0).toUpperCase() + project.status?.slice(1).toLowerCase()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2">
                          {project.description || "Project documents and files"}
                        </p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <FolderOpen size={44} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-base font-medium text-gray-700 mb-1">No projects found</p>
                  <p className="text-sm text-gray-500">Projects will appear here once they are created</p>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════ Files page ══════════════════════════ */}
          {viewMode === "files" && selectedProject && (
            <div>
              {/* Search + Filter + Sort + View toggle */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 bg-white shadow-sm"
                  />
                </div>

                {/* Filter dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setShowFilterMenu((s) => !s); setShowSortMenu(false); }}
                    className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium border shadow-sm transition-colors ${
                      filterType
                        ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Filter size={15} /> {filterType ? FILTER_OPTIONS.find(o => o.key === filterType)?.label : "Filter"}
                  </button>
                  {showFilterMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
                      {FILTER_OPTIONS.map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => { setFilterType(opt.key); setShowFilterMenu(false); }}
                          className={`w-full text-left px-3 py-2 text-sm ${
                            filterType === opt.key
                              ? "bg-yellow-50 text-yellow-800 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => { setShowSortMenu((s) => !s); setShowFilterMenu(false); }}
                    className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm transition-colors"
                  >
                    <ArrowUpDown size={15} /> Sort: {sortLabels[sortOption]} <ChevronDown size={14} />
                  </button>
                  {showSortMenu && (
                    <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-20 py-1">
                      {Object.entries(sortLabels).map(([key, label]) => (
                        <button
                          key={key}
                          onClick={() => { setSortOption(key); setShowSortMenu(false); }}
                          className={`w-full text-left px-3 py-2 text-sm ${
                            sortOption === key
                              ? "bg-yellow-50 text-yellow-800 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* List / Grid segmented toggle */}
                <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 flex-shrink-0">
                  <button
                    onClick={() => setLayoutMode("list")}
                    className={`p-2 rounded-lg transition-colors ${
                      layoutMode === "list" ? "bg-yellow-400 text-black" : "text-gray-500 hover:text-black"
                    }`}
                    title="List view"
                  >
                    <List size={16} />
                  </button>
                  <button
                    onClick={() => setLayoutMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${
                      layoutMode === "grid" ? "bg-yellow-400 text-black" : "text-gray-500 hover:text-black"
                    }`}
                    title="Grid view"
                  >
                    <LayoutGrid size={16} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-5 border-b border-gray-200 mb-4 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`pb-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? "border-yellow-400 text-black"
                        : "border-transparent text-gray-500 hover:text-black"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              {filesLoading ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-4" />
                  <p className="text-sm font-medium text-gray-600">Loading files...</p>
                </div>
              ) : activeTab === "folders" ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <FolderOpen size={44} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-base font-medium text-gray-700 mb-1">No folders yet</p>
                  <p className="text-sm text-gray-500">Folder organization isn't available yet.</p>
                </div>
              ) : visibleFiles.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  <Filter size={44} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-base font-medium text-gray-700 mb-1">
                    {searchQuery || filterType ? "No files match your search" : "No files uploaded yet"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {searchQuery || filterType ? "Try a different search or filter." : "Click \"Upload Files\" to add documents to this project"}
                  </p>
                </div>
              ) : layoutMode === "list" ? (
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-yellow-400 text-left text-black">
                        <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs">Name</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs hidden sm:table-cell">Type</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs hidden md:table-cell">Uploaded</th>
                        <th className="py-3 px-4 font-bold uppercase tracking-wide text-xs text-center w-32">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedFiles.map((file) => {
                        const meta = getFileTypeMeta(file);
                        return (
                          <tr key={file.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3 min-w-0">
                                <span className="font-medium text-gray-900 truncate">{file.fileName || file.filename}</span>
                                {file.documentType && (
                                  <span className="hidden lg:inline text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-md font-medium flex-shrink-0">
                                    {file.documentType}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell">
                              <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${meta.badge}`}>
                                {meta.label}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell text-gray-500">
                              {formatDate(file.uploadedAt || file.createdAt)}
                            </td>
                            <td className="py-3 px-4 w-32">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleViewFile(file)}
                                  disabled={viewLoading === file.id}
                                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 text-blue-600 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                >
                                  {viewLoading === file.id
                                    ? <Loader size={13} className="animate-spin" />
                                    : <ExternalLink size={13} />
                                  }
                                  <span className="hidden sm:inline">View</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteFile(file.id)}
                                  className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                                  title="Delete File"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedFiles.map((file) => {
                    const meta = getFileTypeMeta(file);
                    return (
                      <div key={file.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-3xl">{getFileIcon(file)}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${meta.badge}`}>{meta.label}</span>
                        </div>
                        <p className="font-medium text-gray-900 text-sm mb-1 truncate">{file.fileName || file.filename}</p>
                        <p className="text-xs text-gray-500 mb-3">{formatDate(file.uploadedAt || file.createdAt)}</p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewFile(file)}
                            disabled={viewLoading === file.id}
                            className="flex-1 flex items-center justify-center gap-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 text-blue-600 py-1.5 rounded-lg text-xs font-medium transition-colors"
                          >
                            {viewLoading === file.id
                              ? <Loader size={13} className="animate-spin" />
                              : <ExternalLink size={13} />
                            }
                            View
                          </button>
                          <button
                            onClick={() => handleDeleteFile(file.id)}
                            className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors"
                            title="Delete File"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {visibleFiles.length > 0 && (
                <Pagination
                  currentPage={currentPage}
                  totalItems={visibleFiles.length}
                  pageSize={itemsPerPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setItemsPerPage}
                  className="mt-4 px-0 sm:px-0"
                />
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default FileManagement;
