import React, { useState, useEffect } from 'react';
import { Plus, File, Trash2, Upload, X, Save, ChevronRight, FolderOpen, ExternalLink, AlertCircle } from 'lucide-react';
import SidePannel from '../../components/common/SidePannel';
import Navbar from '../../components/common/Navbar';
import { getAuthToken, getAuthHeaders } from '../../utils/auth';

const FileManagement = () => {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectFiles, setProjectFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filesLoading, setFilesLoading] = useState(false);
  const [showAddFileForm, setShowAddFileForm] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fileFormData, setFileFormData] = useState({
    documentType: '',
    file: null,
    fileName: ''
  });

  const documentTypes = ['Contract', 'Invoice', 'Blueprint', 'Report', 'Certificate', 'Permit', 'Drawing', 'Specification', 'Other'];
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const showMessage = (message, isError = false) => {
    if (isError) {
      setErrorMessage(message);
      setSaveMessage('');
      setTimeout(() => setErrorMessage(''), 5000);
    } else {
      setSaveMessage(message);
      setErrorMessage('');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    const token = getAuthToken();
    if (!token) throw new Error('No authentication token found. Please log in again.');

    const response = await fetch(url, {
      ...options,
      headers: { ...options.headers, ...getAuthHeaders() }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Request failed');

    return data;
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/projects`);
      setProjects(data.projects || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      showMessage('Failed to load projects: ' + error.message, true);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectFiles = async (projectId) => {
    try {
      setFilesLoading(true);
      const data = await fetchWithAuth(`${API_BASE_URL}/projects/${projectId}/files`);
      setProjectFiles(data.files || []);
    } catch (error) {
      console.error('Error fetching project files:', error);
      showMessage('Failed to load project files: ' + error.message, true);
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
      setFileFormData(prev => ({ ...prev, file, fileName: file.name }));
    }
  };

  const handleAddFile = async () => {
    if (!fileFormData.file) {
      showMessage('Please select a file to upload!', true);
      return;
    }

    try {
      const token = getAuthToken();
      if (!token) throw new Error('No authentication token found. Please log in again.');

      const formData = new FormData();
      formData.append('file', fileFormData.file);
      if (fileFormData.documentType) formData.append('documentType', fileFormData.documentType);

      const response = await fetch(`${API_BASE_URL}/projects/${selectedProject.id}/files`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to upload file');

      showMessage('File uploaded successfully!');
      setFileFormData({ documentType: '', file: null, fileName: '' });
      setShowAddFileForm(false);
      await fetchProjectFiles(selectedProject.id);
    } catch (error) {
      console.error('Error uploading file:', error);
      showMessage('Failed to upload file: ' + error.message, true);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;

    try {
      await fetchWithAuth(`${API_BASE_URL}/projects/${selectedProject.id}/files/${fileId}`, { method: 'DELETE' });
      showMessage('File deleted successfully!');
      await fetchProjectFiles(selectedProject.id);
    } catch (error) {
      console.error('Error deleting file:', error);
      showMessage('Failed to delete file: ' + error.message, true);
    }
  };

  const handleOpenProject = async (project) => {
    setSelectedProject(project);
    await fetchProjectFiles(project.id);
  };

  const handleBackToProjects = () => {
    setSelectedProject(null);
    setShowAddFileForm(false);
    setProjectFiles([]);
  };

  const handleViewFile = async (file) => {
    try {
      if (!file.id) {
        throw new Error('File ID not found');
      }

      console.log('Downloading file:', file.fileName);
      showMessage('Downloading file...', false);

      // Use the new download API endpoint with authentication
      const downloadUrl = `${API_BASE_URL}/projects/${selectedProject.id}/files/${file.id}/download`;
      console.log('Download URL:', downloadUrl);

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to download file: ${response.status} ${response.statusText}`);
      }

      // Get the blob from the response
      const blob = await response.blob();

      // Create a temporary URL for the blob
      const blobUrl = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = file.fileName || file.filename || 'download';
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);

      showMessage('File downloaded successfully!', false);
    } catch (error) {
      console.error('Error downloading file:', error);
      showMessage('Failed to download file: ' + error.message, true);
    }
  };

  const getStatusBadgeColor = (status) => {
    const statusMap = {
      'PENDING': 'bg-yellow-200 border-yellow-400 text-yellow-800',
      'ONGOING': 'bg-blue-200 border-blue-400 text-blue-800',
      'COMPLETED': 'bg-green-200 border-green-400 text-green-800',
      'Planning': 'bg-yellow-200 border-yellow-400 text-yellow-800',
      'In Progress': 'bg-blue-200 border-blue-400 text-blue-800',
      'Completed': 'bg-green-200 border-green-400 text-green-800'
    };
    return statusMap[status] || 'bg-gray-200 border-gray-400 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getFileIcon = (file) => {
    const ext = (file.fileName || file.filename || '').split('.').pop()?.toLowerCase();
    const iconMap = {
      pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
      jpg: '🖼️', jpeg: '🖼️', png: '🖼️', dwg: '📐', dxf: '📐'
    };
    return iconMap[ext] || '📎';
  };

  const isFilesView = !!selectedProject;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

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
              <Save size={16} />
              {saveMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 md:p-4 bg-red-100 border-2 border-red-400 rounded-lg text-red-800 text-center font-medium text-xs sm:text-sm md:text-base mx-2 flex items-center justify-center gap-2">
              <AlertCircle size={16} />
              {errorMessage}
            </div>
          )}

          {isFilesView && (
            <div className="mb-4 px-2 flex items-center gap-2 text-sm md:text-base text-gray-600">
              <button onClick={handleBackToProjects} className="hover:text-black font-medium">Projects</button>
              <ChevronRight size={16} />
              <span className="text-black font-semibold">{selectedProject.name}</span>
            </div>
          )}

          {isFilesView && !showAddFileForm && (
            <div className="mb-6 px-2 flex gap-2">
              <button onClick={handleBackToProjects} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-3 md:py-4 px-4 md:px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors">
                <X size={20} />
                <span className="text-sm md:text-base hidden sm:inline">Back</span>
              </button>
              <button onClick={() => setShowAddFileForm(true)} className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-3 md:py-4 px-6 rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors">
                <Plus size={24} />
                <span className="text-sm md:text-base">Upload File</span>
              </button>
            </div>
          )}

          {showAddFileForm && (
            <div className="mb-6 p-4 md:p-6 bg-white border-2 border-amber-400 rounded-lg space-y-4 mx-2">
              <h3 className="text-lg md:text-xl font-bold text-black mb-4">Upload File to {selectedProject?.name}</h3>

              <div>
                <label className="block text-xs md:text-sm font-medium text-black mb-1.5 md:mb-2">Document Type (Optional)</label>
                <select
                  name="documentType"
                  value={fileFormData.documentType}
                  onChange={(e) => setFileFormData(prev => ({ ...prev, documentType: e.target.value }))}
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-sm md:text-base border-2 border-black rounded-lg focus:ring-2 focus:ring-black focus:border-black bg-white text-black"
                >
                  <option value="">Select document type</option>
                  {documentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs md:text-sm font-medium text-black mb-1.5 md:mb-2">Attach File *</label>
                <div className="border-2 border-dashed border-amber-400 rounded-lg p-6 md:p-8 text-center bg-amber-50">
                  <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.dwg,.dxf" />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload size={40} className="mx-auto text-amber-600 mb-2" />
                    <p className="text-sm md:text-base font-medium text-black">{fileFormData.fileName || 'Click to upload file'}</p>
                    <p className="text-xs text-gray-600 mt-1">PDF, DOC, DOCX, JPG, PNG, XLSX, DWG, DXF supported</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={handleAddFile} className="flex-1 bg-amber-400 hover:bg-amber-500 text-black font-bold py-2 md:py-3 px-4 md:px-6 text-sm md:text-base rounded-lg shadow-lg flex items-center justify-center gap-2 transition-colors border-2 border-black">
                  <Upload size={16} className="md:w-5 md:h-5" />
                  Upload File
                </button>
                <button onClick={() => { setShowAddFileForm(false); setFileFormData({ documentType: '', file: null, fileName: '' }); }} className="bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 md:py-3 px-3 md:px-6 rounded-lg border-2 border-black shadow-lg flex items-center justify-center transition-colors">
                  <X size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          )}

          {!isFilesView && (
            <div className="space-y-4 px-2">
              {loading ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-base md:text-lg font-medium text-gray-700">Loading projects...</p>
                </div>
              ) : projects.length > 0 ? (
                projects.map(project => (
                  <div key={project.id} className="bg-white border-2 border-amber-400 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleOpenProject(project)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        <div className="bg-amber-400 p-3 md:p-4 rounded-lg border-2 border-black flex-shrink-0">
                          <FolderOpen size={24} className="md:w-8 md:h-8 text-black" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-black text-sm md:text-lg mb-1 break-words">{project.name}</h4>
                          {project.description && <p className="text-xs md:text-sm text-gray-600 mb-2 line-clamp-2">{project.description}</p>}
                          <div className="flex flex-wrap gap-2 items-center mb-2">
                            <span className={`text-xs md:text-sm px-3 py-1.5 rounded-lg border-2 font-medium ${getStatusBadgeColor(project.status)}`}>{project.status}</span>
                            {project.projectType && <span className="text-xs md:text-sm bg-gray-200 px-3 py-1.5 rounded-lg border-2 border-gray-400 font-medium">{project.projectType}</span>}
                          </div>
                          <div className="text-xs text-gray-600 space-y-1">
                            {project.clientName && <p><span className="font-medium">Client:</span> {project.clientName}</p>}
                            {(project.startDate || project.endDate) && <p><span className="font-medium">Timeline:</span> {formatDate(project.startDate)} - {formatDate(project.endDate)}</p>}
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <FolderOpen size={48} className="md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
                  <p className="text-base md:text-lg font-medium text-gray-700 mb-2">No projects found</p>
                  <p className="text-sm text-gray-500">Projects will appear here once they are created</p>
                </div>
              )}
            </div>
          )}

          {isFilesView && (
            <div className="space-y-4 px-2">
              {filesLoading ? (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
                  <p className="text-base md:text-lg font-medium text-gray-700">Loading files...</p>
                </div>
              ) : projectFiles.length > 0 ? (
                projectFiles.map(file => (
                  <div key={file.id} className="bg-white border-2 border-amber-400 rounded-lg p-4 md:p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 md:gap-4 flex-1">
                        <div className="bg-amber-400 p-3 md:p-4 rounded-lg border-2 border-black flex-shrink-0 text-2xl">{getFileIcon(file)}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-black text-sm md:text-lg mb-2 break-words">{file.fileName || file.filename}</h4>
                          <div className="flex flex-wrap gap-2 mb-3">
                            {file.documentType && (
                              <span className="inline-flex items-center gap-1.5 text-xs md:text-sm bg-amber-200 px-3 py-1.5 rounded-lg border-2 border-amber-400 font-medium">
                                <File size={14} />
                                {file.documentType}
                              </span>
                            )}
                            {file.fileSize && <span className="text-xs md:text-sm bg-gray-200 px-3 py-1.5 rounded-lg border-2 border-gray-400">{(file.fileSize / 1024).toFixed(2)} KB</span>}
                          </div>
                          <p className="text-xs md:text-sm text-gray-600 mb-2">Uploaded: {formatDate(file.uploadedAt || file.createdAt)}</p>
                          <button onClick={() => handleViewFile(file)} className="bg-blue-400 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg border-2 border-black text-xs md:text-sm font-medium flex items-center gap-1.5 transition-colors">
                            <ExternalLink size={14} />
                            View/Download
                          </button>
                        </div>
                      </div>
                      <button onClick={() => handleDeleteFile(file.id)} className="bg-red-400 hover:bg-red-500 p-2 md:p-3 rounded-lg border-2 border-black transition-colors flex-shrink-0" title="Delete File">
                        <Trash2 size={18} className="md:w-5 md:h-5 text-white" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 md:py-16 bg-white rounded-lg border-2 border-amber-400">
                  <File size={48} className="md:w-16 md:h-16 mx-auto text-gray-400 mb-4" />
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