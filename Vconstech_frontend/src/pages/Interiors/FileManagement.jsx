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
    jpg:  'image/jpeg', jpeg: 'image/jpeg',
    png:  'image/png',  gif: 'image/gif', webp: 'image/webp',
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
  const fileName = file?.fileName || file?.filename || 'File';

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
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
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease',
              maxWidth: zoom <= 1 ? '100%' : 'none',
              maxHeight: zoom <= 1 ? '100%' : 'none',
              objectFit: 'contain',
              borderRadius: '6px',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
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
        style={{ width: '92vw', maxWidth: '1100px', height: '92vh' }}
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
  const [saveMessage, setSaveMessage]         = useState('');
  const [errorMessage, setErrorMessage]       = useState('');
  const [fileFormData, setFileFormData]       = useState({ documentType: '', file: null, fileName: '' });
  const [viewerState, setViewerState]         = useState(null);
  const [viewLoading, setViewLoading]         = useState(false);

  const documentTypes = ['Contract','Invoice','Blueprint','Report','Certificate','Permit','Drawing','Specification','Other'];
  const API_BASE_URL  = import.meta.env.VITE_API_URL || 'http://https://test.vconstech.in/api';

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

  const fetchFileData = async (file) => {
    const url = `${API_BASE_URL}/projects/${selectedProject.id}/files/${file.id}/download`;
    const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
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
      if (!file.id) throw new Error('File ID not found');
      setViewLoading(true);
      const { rawBlob, dataUri } = await fetchFileData(file);
      setViewerState({ file, dataUri, rawBlob });
    } catch (e) { showMessage('Failed to open file: ' + e.message, true); }
    finally     { setViewLoading(false); }
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

      {/* SidePannel — renders desktop sidebar + mobile bottom nav internally */}
         <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      {/* Main content */}
      <div className="pt-16 md:pl-64 md:pt-25">
        <div className="px-3 sm:px-4 lg:px-8 pt-4 pb-24 md:pb-10 max-w-6xl mx-auto">

          {/* Page heading */}
          <div className="text-center mb-5 mt-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">E-Vault</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              {isFilesView ? `Files for ${selectedProject.name}` : 'Manage project documents securely'}
            </p>
          </div>

          {/* Toast messages */}
          {saveMessage && (
            <div className="mb-4 p-3 bg-green-50 border border-green-300 rounded-xl text-green-800 text-center text-sm flex items-center justify-center gap-2">
              <Save size={15} /> {saveMessage}
            </div>
          )}
          {errorMessage && (
            <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-xl text-red-700 text-center text-sm flex items-center justify-center gap-2">
              <AlertCircle size={15} /> {errorMessage}
            </div>
          )}

          {/* Breadcrumb */}
          {isFilesView && (
            <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
              <button onClick={handleBackToProjects} className="hover:text-gray-900 font-medium transition-colors">Projects</button>
              <ChevronRight size={14} />
              <span className="text-gray-900 font-semibold truncate">{selectedProject.name}</span>
            </div>
          )}

          {/* Action bar (files view) */}
          {isFilesView && !showAddFileForm && (
            <div className="mb-4 flex gap-2">
              <button
                onClick={handleBackToProjects}
                className="flex items-center gap-1.5 bg-gray-200 hover:bg-gray-300 text-black font-medium py-2.5 px-4 rounded-xl text-sm transition-colors"
              >
                <X size={16} /> Back
              </button>
              <button
                onClick={() => setShowAddFileForm(true)}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <Plus size={18} /> Upload Files
              </button>
            </div>
          )}

          {/* Upload form */}
          {showAddFileForm && (
            <div className="mb-5 bg-white border-2 border-amber-400 rounded-xl p-4 sm:p-5 space-y-4">
              <h3 className="text-base font-bold text-gray-900">Upload File to {selectedProject?.name}</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Document Type (Optional)</label>
                <select
                  value={fileFormData.documentType}
                  onChange={(e) => setFileFormData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-3 py-2.5 text-sm border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-white"
                >
                  <option value="">Select document type</option>
                  {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Attach File *</label>
                <div className="border-2 border-dashed border-amber-400 rounded-xl p-5 text-center bg-amber-50">
                  <input type="file" id="file-upload" onChange={handleFileChange} className="hidden"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.dwg,.dxf" />
                  <label htmlFor="file-upload" className="cursor-pointer block">
                    <Upload size={28} className="mx-auto text-amber-500 mb-2" />
                    <p className="text-sm font-medium text-gray-800 break-words">
                      {fileFormData.fileName || 'Tap to select a file'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG, XLSX, DWG, DXF</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowAddFileForm(false); setFileFormData({ documentType: '', file: null, fileName: '' }); }}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddFile}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2.5 px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Upload size={15} /> Upload File
                </button>
              </div>
            </div>
          )}

          {/* ── Projects list ── */}
          {!isFilesView && (
            <div className="space-y-3">
              {loading ? (
                <div className="text-center py-14 bg-white rounded-xl border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Loading projects...</p>
                </div>
              ) : projects.length > 0 ? projects.map(project => (
                <div
                  key={project.id}
                  className="bg-white border-2 border-amber-400 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer active:scale-[0.99]"
                  onClick={() => handleOpenProject(project)}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-amber-400 p-2.5 rounded-lg flex-shrink-0">
                      <FolderOpen size={20} className="text-black" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{project.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${getStatusBadgeColor(project.status)}`}>
                          {project.status}
                        </span>
                      </div>
                      {project.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                      )}
                      <div className="mt-2 space-y-0.5 text-xs text-gray-500">
                        {project.clientName && <p><span className="font-medium">Client:</span> {project.clientName}</p>}
                        {(project.startDate || project.endDate) && (
                          <p><span className="font-medium">Timeline:</span> {formatDate(project.startDate)} – {formatDate(project.endDate)}</p>
                        )}
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleOpenProject(project); }}
                        className="mt-3 w-full bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 px-4 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Plus size={14} /> Upload Files
                      </button>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-14 bg-white rounded-xl border-2 border-amber-400">
                  <FolderOpen size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-600">No projects found</p>
                  <p className="text-xs text-gray-400 mt-1 px-4">Projects will appear here once they are created</p>
                </div>
              )}
            </div>
          )}

          {/* ── Files list ── */}
          {isFilesView && (
            <div className="space-y-3">
              {filesLoading ? (
                <div className="text-center py-14 bg-white rounded-xl border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amber-500 mx-auto mb-3" />
                  <p className="text-sm text-gray-600 font-medium">Loading files...</p>
                </div>
              ) : projectFiles.length > 0 ? projectFiles.map(file => (
                <div key={file.id} className="bg-white border-2 border-amber-400 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl flex-shrink-0 mt-0.5">{getFileIcon(file)}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm break-all leading-tight">
                        {file.fileName || file.filename}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {file.documentType && (
                          <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                            <File size={10} />{file.documentType}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          {formatDate(file.uploadedAt || file.createdAt)}
                        </span>
                      </div>
                      {/* Action buttons */}
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          onClick={() => handleViewFile(file)}
                          disabled={viewLoading}
                          className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {viewLoading ? <Loader size={12} className="animate-spin" /> : <ExternalLink size={12} />}
                          View
                        </button>
                        <button
                          onClick={() => handleDownloadFile(file)}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Download size={12} /> Download
                        </button>
                        <button
                          onClick={() => handleDeleteFile(file.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                          title="Delete file"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-14 bg-white rounded-xl border-2 border-amber-400">
                  <File size={40} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm font-medium text-gray-600">No files uploaded yet</p>
                  <p className="text-xs text-gray-400 mt-1 px-4">Click "Upload Files" to add documents</p>
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