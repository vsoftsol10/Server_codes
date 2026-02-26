import React, { useState, useEffect } from 'react';
import {
  Plus, File, Trash2, Upload, X, Save, ChevronRight,
  FolderOpen, ExternalLink, AlertCircle, Download,
  ZoomIn, ZoomOut, RotateCw, Loader
} from 'lucide-react';
import SidePannel from '../../components/common/SidePannel';
import Navbar from '../../components/common/Navbar';
import { getAuthToken, getAuthHeaders } from '../../utils/auth';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getFileExtension = (file) =>
  (file?.fileName || file?.filename || '').split('.').pop()?.toLowerCase() || '';

const getFileIcon = (file) => {
  const ext = getFileExtension(file);
  const iconMap = {
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', dwg: '📐', dxf: '📐'
  };
  return iconMap[ext] || '📎';
};

const getMimeType = (file) => {
  const ext = getFileExtension(file);
  const mimeMap = {
    pdf:  'application/pdf',
    jpg:  'image/jpeg',
    jpeg: 'image/jpeg',
    png:  'image/png',
    gif:  'image/gif',
    webp: 'image/webp',
    doc:  'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls:  'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return mimeMap[ext] || 'application/octet-stream';
};

const isImageFile  = (file) => ['jpg','jpeg','png','gif','webp'].includes(getFileExtension(file));
const isPdfFile    = (file) => getFileExtension(file) === 'pdf';
const isOfficeFile = (file) => ['doc','docx','xls','xlsx'].includes(getFileExtension(file));

// Convert Blob → base64 data URI
const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload  = () => resolve(reader.result); // already a data URI string
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });

// ─── File Viewer Modal ────────────────────────────────────────────────────────

const FileViewerModal = ({ file, dataUri, rawBlob, onClose, onDownload }) => {
  const [zoom, setZoom]         = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [pdfError, setPdfError]   = useState(false);

  const fileName = file?.fileName || file?.filename || 'File';

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  // PDF: auto-timeout — if embed hasn't signalled loaded after 8s, assume it worked anyway
  useEffect(() => {
    if (!isPdfFile(file)) return;
    const t = setTimeout(() => setPdfLoaded(true), 3000);
    return () => clearTimeout(t);
  }, [file]);

  const renderContent = () => {
    // ── Images ──────────────────────────────────────────────────────────────
    if (isImageFile(file)) {
      return (
        <div className="w-full h-full overflow-auto flex items-center justify-center bg-gray-900 p-4">
          <img
            src={dataUri}
            alt={fileName}
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              maxWidth:  zoom <= 1 ? '100%' : 'none',
              maxHeight: zoom <= 1 ? '100%' : 'none',
              objectFit: 'contain',
              borderRadius: '6px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            }}
          />
        </div>
      );
    }

    // ── PDF ──────────────────────────────────────────────────────────────────
    // Use <embed> with a base64 data URI — most reliable cross-browser approach.
    // <iframe> with blob:// can silently fail on some browsers/OS combos.
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
            <FallbackDownload file={file} onDownload={onDownload}
              message="Your browser could not render this PDF inline." />
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

    // ── Office (DOC / DOCX / XLS / XLSX) ────────────────────────────────────
    // Browsers have no native Office renderer. We try Microsoft Office Online
    // Viewer as a last resort — but it requires a public URL, which a data URI
    // is not. So we show a friendly fallback immediately with download + tip.
    if (isOfficeFile(file)) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-50">
          <div className="text-center py-12 px-8 max-w-md">
            <span className="text-7xl mb-5 block">{getFileIcon(file)}</span>
            <p className="text-lg font-bold text-gray-800 mb-2">{fileName}</p>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{getFileExtension(file).toUpperCase()}</strong> files cannot be previewed
              directly in the browser.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Download and open with Microsoft Office, LibreOffice, or upload to Google Drive to view online.
            </p>
            <button onClick={onDownload}
              className="bg-amber-400 hover:bg-amber-500 text-black font-bold py-2.5 px-6 rounded-lg border-2 border-black flex items-center gap-2 mx-auto transition-colors">
              <Download size={18} /> Download File
            </button>
          </div>
        </div>
      );
    }

    // ── Unknown ──────────────────────────────────────────────────────────────
    return <FallbackDownload file={file} onDownload={onDownload} message="Preview not available for this file type." />;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        style={{ width: '92vw', maxWidth: '1100px', height: '92vh' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b-2 border-amber-400 bg-amber-50 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl">{getFileIcon(file)}</span>
            <span className="font-bold text-black text-sm md:text-base truncate max-w-xs md:max-w-lg">
              {fileName}
            </span>
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

        {/* Body */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

// Small reusable fallback card
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
  const [projects, setProjects]         = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showAddFileForm, setShowAddFileForm] = useState(false);
  const [saveMessage, setSaveMessage]   = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileFormData, setFileFormData] = useState({ documentType: '', file: null, fileName: '' });

  // viewerState: { file, dataUri, rawBlob }
  const [viewerState, setViewerState]   = useState(null);
  const [viewLoading, setViewLoading]   = useState(false);

  const documentTypes = ['Contract','Invoice','Blueprint','Report','Certificate','Permit','Drawing','Specification','Other'];
  const API_BASE_URL  = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const showMessage = (message, isError = false) => {
    if (isError) {
      setErrorMessage(message); setSaveMessage('');
      setTimeout(() => setErrorMessage(''), 5000);
    } else {
      setSaveMessage(message); setErrorMessage('');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found. Please log in again.');
    const response = await fetch(url, { ...options, headers: { ...options.headers, ...getAuthHeaders() } });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/projects`);
      setProjects(data.projects || []);
    } catch (e) { showMessage('Failed to load projects: ' + e.message, true); }
    finally     { setLoading(false); }
  };

  const fetchProjectFiles = async (projectId) => {
    try {
      setFilesLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/files`);
      setProjectFiles(data.files || []);
    } catch (e) { showMessage('Failed to load project files: ' + e.message, true); }
    finally     { setFilesLoading(false); }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setFileFormData(prev => ({ ...prev, file, fileName: file.name }));
  };

  const handleAddFile = async () => {
    if (!fileFormData.file) { showMessage('Please select a file to upload!', true); return; }
    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found.');
      const formData = new FormData();
      formData.append('file', fileFormData.file);
      if (fileFormData.documentType) formData.append('documentType', fileFormData.documentType);
      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/files`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload file');
      showMessage('File uploaded successfully!');
      setFileFormData({ documentType: '', file: null, fileName: '' });
      setShowAddFileForm(false);
      await fetchProjectFiles(selectedProject.id);
    } catch (e) { showMessage('Failed to upload file: ' + e.message, true); }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await fetchWithAuth(`${API_BASE_URL}/projects/${selectedProject.id}/files/${fileId}`, { method: 'DELETE' });
      showMessage('File deleted successfully!');
      await fetchProjectFiles(selectedProject.id);
    } catch (e) { showMessage('Failed to delete file: ' + e.message, true); }
  };

  const handleOpenProject = async (project) => {
    setSelectedProject(project);
    await fetchProjectFiles(project.id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null); setShowAddFileForm(false); setProjectFiles([]);
  };

  // Fetch file → return { rawBlob, dataUri }
  const fetchFileData = async (file) => {
    const url = `${API_BASE_URL}/projects/${selectedProject.id}/files/${file.id}/download`;
    const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `Failed: ${response.status} ${response.statusText}`);
    }
    const rawBlob  = await response.blob();
    const mimeType = getMimeType(file);
    const typedBlob = new Blob([rawBlob], { type: mimeType });
    const dataUri   = await blobToBase64(typedBlob);   // reliable base64 data URI
    return { rawBlob: typedBlob, dataUri };
  };

  const handleViewFile = async (file) => {
    try {
      if (!file.id) throw new Error('File ID not found');
      setViewLoading(true);
      const { rawBlob, dataUri } = await fetchFileData(file);
      setViewerState({ file, dataUri, rawBlob });
    } catch (e) {
      showMessage('Failed to open file: ' + e.message, true);
    } finally {
      setViewLoading(false);
    }
  };

  const handleDownloadFile = async (file) => {
    try {
      if (!file.id) throw new Error('File ID not found');
      showMessage('Downloading…');
      const { rawBlob } = await fetchFileData(file);
      const blobUrl = window.URL.createObjectURL(rawBlob);
      const link    = document.createElement('a');
      link.href     = blobUrl;
      link.download = file.fileName || file.filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      showMessage('File downloaded successfully!');
    } catch (e) { showMessage('Failed to download file: ' + e.message, true); }
  };

  // Download from inside the modal (reuse already-fetched blob)
  const handleModalDownload = () => {
    if (!viewerState) return;
    const { file, rawBlob } = viewerState;
    const blobUrl = window.URL.createObjectURL(rawBlob);
    const link    = document.createElement('a');
    link.href     = blobUrl;
    link.download = file.fileName || file.filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
  };

  const closeViewer = () => setViewerState(null);

  const getStatusBadgeColor = (status) => {
    const map = {
      PENDING: 'bg-yellow-100 text-yellow-800', ONGOING: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-green-100 text-green-800', Planning: 'bg-yellow-100 text-yellow-800',
      'In Progress': 'bg-blue-100 text-blue-800', Completed: 'bg-green-100 text-green-800',
    };
    return map[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const isFilesView = !!selectedProject;

  return (
    <div className="min-h-screen bg-gray-50">

      {viewerState && (
        <FileViewerModal
          file={viewerState.file}
          dataUri={viewerState.dataUri}
          rawBlob={viewerState.rawBlob}
          onClose={closeViewer}
          onDownload={handleModalDownload}
        />
      )}

      <nav className="fixed top-0 left-0 right-0 z-50 h-16"><Navbar /></nav>
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto"><SidePannel /></aside>

      <div className="mt-16 pl-16 md:pl-64 p-4 md:p-15 bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto">

          <div className="mb-6 md:mb-8 text-center px-2 mt-6 sm:mt-10">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-black mb-2">E-Vault</h1>
            <p className="text-xs sm:text-sm md:text-base text-gray-700">
              {isFilesView ? `Files for ${selectedProject.name}` : 'Manage project documents securely'}
            </p>
          </div>

          {saveMessage && (
            <div className="mb-4 p-3 md:p-4 bg-green-100 border-2 border-green-400 rounded-lg text-green-800 text-center font-medium text-xs sm:text-sm md:text-base mx-2 flex items-center justify-center gap-2">
              <Save size={16} /> {saveMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 md:p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-800 text-center font-medium text-xs sm:text-sm md:text-base mx-2 flex items-center justify-center gap-2">
              <AlertCircle size={16} /> {errorMessage}
            </div>
          )}

          {isFilesView && (
            <div className="mb-4 px-2 flex items-center gap-2 text-sm md:text-base text-gray-600">
              <button onClick={handleBackToProjects} className="hover:text-black font-medium">Projects</button>
              <ChevronRight size={16} />
              <span className="text-black font-semibold truncate">{selectedProject.name}</span>
            </div>
          )}

          {isFilesView && !showAddFileForm && (
            <div className="mb-6 px-2 flex gap-2">
              <button onClick={handleBackToProjects} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors">
                <X size={20} /><span className="text-sm md:text-base hidden sm:inline">Back</span>
              </button>
              <button onClick={() => setShowAddFileForm(true)} className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 md:py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors">
                <Plus size={24} /><span className="text-sm md:text-base">Upload Files</span>
              </button>
            </div>
          )}

          {showAddFileForm && (
            <div className="mb-6 p-4 md:p-6 bg-white border-2 border-amber-400 rounded-lg space-y-4 mx-2">
              <h3 className="text-lg md:text-xl font-bold text-black mb-4">Upload File to {selectedProject?.name}</h3>
              <div>
                <label className="block text-xs md:text-sm font-medium text-black mb-1.5 md:mb-2">Document Type (Optional)</label>
                <div className="relative">
                  <select name="documentType" value={fileFormData.documentType}
                    onChange={(e) => setFileFormData(prev => ({ ...prev, documentType: e.target.value }))}
                    className="w-full px-3 md:px-4 py-2.5 md:py-3 text-sm md:text-base border-2 border-black rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white text-black appearance-none cursor-pointer transition-all hover:border-amber-400 pr-10">
                    <option value="">Select document type</option>
                    {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-black">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs md:text-sm font-medium text-black mb-1.5 md:mb-2">Attach File *</label>
                <div className="border-2 border-dashed border-amber-400 rounded-lg p-4 md:p-6 lg:p-8 text-center bg-amber-50">
                  <input type="file" id="file-upload" onChange={handleFileChange} className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.dwg,.dxf" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload size={32} className="mx-auto text-amber-600 mb-2 md:w-10 md:h-10" />
                    <p className="text-xs sm:text-sm md:text-base font-medium text-black break-words px-2">
                      {fileFormData.fileName || 'Click to upload file'}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 px-2">PDF, DOC, DOCX, JPG, PNG, XLSX, DWG, DXF supported</p>
                  </label>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={handleAddFile}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 md:py-3 px-4 md:px-6 text-sm md:text-base rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors border-2 border-black">
                  <Upload size={16} className="md:w-5 md:h-5" /> Upload File
                </button>
                <button onClick={() => { setShowAddFileForm(false); setFileFormData({ documentType: '', file: null, fileName: '' }); }}
                  className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 md:py-3 px-3 md:px-6 rounded-lg border-2 border-black shadow-lg flex items-center justify-center transition-colors">
                  <X size={16} className="md:w-5 md:h-5" /><span className="hidden sm:inline ml-2">Cancel</span>
                </button>
              </div>
            </div>
          )}

          {/* Projects list */}
          {!isFilesView && (
            <div className="space-y-4 px-2">
              {loading ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-base md:text-lg font-medium text-gray-700">Loading projects...</p>
                </div>
              ) : projects.length > 0 ? projects.map(project => (
                <div key={project.id} className="bg-white border-2 border-amber-400 rounded-xl p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenProject(project)}>
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
                      <div className="bg-amber-400 p-3 md:p-4 rounded-lg flex-shrink-0">
                        <FolderOpen size={24} className="text-black md:w-8 md:h-8" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-black text-base md:text-xl mb-2 break-words">{project.name}</h3>
                        {project.description && <p className="text-xs md:text-sm text-gray-700 mb-3 break-words">{project.description}</p>}
                        <div className="flex flex-wrap gap-2 items-center mb-3">
                          <span className={`text-xs md:text-sm px-2 md:px-3 py-1 md:py-1.5 rounded-md font-medium ${getStatusBadgeColor(project.status)}`}>{project.status}</span>
                          {project.projectType && <span className="text-xs md:text-sm bg-gray-100 text-gray-700 px-2 md:px-3 py-1 md:py-1.5 rounded-md font-medium">{project.projectType}</span>}
                        </div>
                        <div className="text-xs md:text-sm text-gray-700 space-y-1">
                          {project.clientName && <p><span className="font-medium">Client:</span> {project.clientName}</p>}
                          {(project.startDate || project.endDate) && (
                            <p><span className="font-medium">Timeline:</span> {formatDate(project.startDate)} – {formatDate(project.endDate)}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleOpenProject(project); }}
                      className="w-full sm:w-auto bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors flex-shrink-0">
                      <Plus size={20} /><span>Upload Files</span>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <FolderOpen size={48} className="md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-2">No projects found</p>
                  <p className="text-sm text-gray-500 px-4">Projects will appear here once they are created</p>
                </div>
              )}
            </div>
          )}

          {/* Files list */}
          {isFilesView && (
            <div className="space-y-4 px-2">
              {filesLoading ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-base md:text-lg font-medium text-gray-700">Loading files...</p>
                </div>
              ) : projectFiles.length > 0 ? projectFiles.map(file => (
                <div key={file.id} className="bg-white border-2 border-amber-400 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-4 flex-1 w-full">
                      <div className="bg-amber-400 p-3 md:p-4 rounded-lg border-2 border-black flex-shrink-0 text-xl md:text-2xl">
                        {getFileIcon(file)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-black text-sm md:text-lg mb-2 break-all">{file.fileName || file.filename}</h4>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {file.documentType && (
                            <span className="inline-flex items-center gap-1.5 text-xs md:text-sm bg-amber-200 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border-2 border-amber-400 font-medium">
                              <File size={14} />{file.documentType}
                            </span>
                          )}
                        </div>
                        <p className="text-xs md:text-sm text-gray-600 mb-3">
                          Uploaded: {formatDate(file.uploadedAt || file.createdAt)}
                        </p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewFile(file)}
                            disabled={viewLoading}
                            className="bg-blue-400 hover:bg-blue-500 disabled:opacity-60 text-white px-3 py-1.5 rounded-lg border-2 border-black text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors"
                          >
                            {viewLoading ? <Loader size={14} className="animate-spin" /> : <ExternalLink size={14} />}
                            View
                          </button>
                          <button
                            onClick={() => handleDownloadFile(file)}
                            className="bg-green-400 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg border-2 border-black text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors"
                          >
                            <Download size={14} /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="w-full sm:w-auto bg-red-400 hover:bg-red-500 p-2 md:p-3 rounded-lg border-2 border-black transition-colors flex items-center justify-center gap-2"
                    >
                      <Trash2 size={18} className="text-white md:w-5 md:h-5" />
                      <span className="sm:hidden text-white font-medium">Delete File</span>
                    </button>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <File size={48} className="md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-2">No files uploaded yet</p>
                  <p className="text-sm text-gray-500 px-4">Click "Upload Files" to add documents to this project</p>
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