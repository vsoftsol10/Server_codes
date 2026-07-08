import { useState, useEffect, useRef } from "react";
import {
  Upload,
  X,
  FolderOpen,
  Trash2,
  Loader,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getAuthToken } from "../../utils/auth";
import { getFileExtension, getFileTypeMeta, DOCUMENT_TYPES } from "../../pages/billing-refactored/utils/fileManagementHelpers";

// ─── Upload Files Modal ─────────────────────────────────────────────────────
// Self-contained: owns its own form state, progress state, and upload logic.
// Talks to the parent only via props (selectedProject, apiBaseUrl, callbacks).

const UploadFilesModal = ({
  selectedProject,
  apiBaseUrl,
  onClose,
  onUploadSuccess,
  showSuccessMessage,
  showErrorMessage,
}) => {
  const [fileFormData, setFileFormData] = useState({ documentType: "", files: [] });
  const [uploadProgress, setUploadProgress] = useState({}); // { [index]: { percent, status: 'uploading'|'done'|'failed' } }
  const [isUploading, setIsUploading] = useState(false);

  const folderInputRef = useRef(null);

  useEffect(() => {
    if (folderInputRef.current) {
      folderInputRef.current.setAttribute("webkitdirectory", "");
      folderInputRef.current.setAttribute("directory", "");
    }
  }, []);

  // Appends newly selected files (from either Browse Files or Browse Folder) to the list
  const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;
    setFileFormData((prev) => ({ ...prev, files: [...prev.files, ...newFiles] }));
    e.target.value = ""; // allow re-selecting the same file/folder again if removed
  };

  const handleFileInputChange = (e) => {
    const { name, value } = e.target;
    setFileFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRemoveSelectedFile = (index) => {
    setFileFormData((prev) => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
    setUploadProgress((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  // Uploads a single file via XHR (instead of fetch) so we can report real progress,
  // while hitting the exact same endpoint/body/auth as before.
  const uploadSingleFileWithProgress = (singleFile, index) =>
    new Promise((resolve, reject) => {
      const token = getAuthToken();
      if (!token) { reject(new Error("No authentication token found.")); return; }

      const formData = new FormData();
      formData.append("file", singleFile);
      if (fileFormData.documentType) formData.append("documentType", fileFormData.documentType);

      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${apiBaseUrl}/projects/${selectedProject.id}/files`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (!event.lengthComputable) return;
        const percent = Math.round((event.loaded / event.total) * 100);
        setUploadProgress((prev) => ({
          ...prev,
          [index]: { percent, status: "uploading" },
        }));
      };

      xhr.onload = () => {
        let data = {};
        try { data = JSON.parse(xhr.responseText || "{}"); } catch { /* ignore parse errors */ }
        if (xhr.status >= 200 && xhr.status < 300) {
          setUploadProgress((prev) => ({ ...prev, [index]: { percent: 100, status: "done" } }));
          resolve(data);
        } else {
          setUploadProgress((prev) => ({ ...prev, [index]: { percent: prev[index]?.percent || 0, status: "failed" } }));
          reject(new Error(data.error || `Failed to upload ${singleFile.name}`));
        }
      };

      xhr.onerror = () => {
        setUploadProgress((prev) => ({ ...prev, [index]: { percent: prev[index]?.percent || 0, status: "failed" } }));
        reject(new Error(`Network error while uploading ${singleFile.name}`));
      };

      xhr.send(formData);
    });

  const handleAddFile = async () => {
    if (!fileFormData.files || fileFormData.files.length === 0) {
      showErrorMessage("Please select a file to upload!");
      return;
    }
    setIsUploading(true);
    setUploadProgress({});
    let failedCount = 0;

    for (let i = 0; i < fileFormData.files.length; i++) {
      try {
        await uploadSingleFileWithProgress(fileFormData.files[i], i);
      } catch {
        failedCount += 1;
      }
    }

    setIsUploading(false);

    if (failedCount === 0) {
      showSuccessMessage("File(s) uploaded successfully!");
      setFileFormData({ documentType: "", files: [] });
      setUploadProgress({});
      onClose();
    } else {
      showErrorMessage(`${failedCount} file(s) failed to upload. You can remove them and try again.`);
    }

    await onUploadSuccess();
  };

  const handleCancelFile = () => {
    if (isUploading) return; // avoid closing mid-upload
    setFileFormData({ documentType: "", files: [] });
    setUploadProgress({});
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleCancelFile(); }}
    >
      <div className="relative bg-white rounded-2xl border border-[#E5E7EB] shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between p-5 md:p-6 border-b border-[#E5E7EB] flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#FFF6E0] flex items-center justify-center flex-shrink-0">
              <Upload size={22} className="text-[#FFBE2A]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#1F2937]">Upload Files</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                Upload files for the selected project.
              </p>
            </div>
          </div>
          <button
            onClick={handleCancelFile}
            disabled={isUploading}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-[#1F2937] transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body (scrolls internally; header/footer stay pinned) */}
        <div className="p-5 md:p-6 space-y-5 overflow-y-auto flex-1">

          {/* Existing project info */}
          {selectedProject?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <FolderOpen size={15} className="text-[#FFBE2A]" />
              <span>
                Uploading to <span className="font-semibold text-[#1F2937]">{selectedProject.name}</span>
              </span>
            </div>
          )}

          {/* Document type */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Document Type
            </label>
            <select
              name="documentType"
              value={fileFormData.documentType}
              onChange={handleFileInputChange}
              disabled={isUploading}
              className="w-full px-4 py-2.5 text-sm border border-[#E5E7EB] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFBE2A] bg-white text-[#1F2937] shadow-sm transition-colors disabled:opacity-60"
            >
              <option value="">Select document type</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Upload area */}
          <div>
            <label className="block text-sm font-medium text-[#1F2937] mb-2">
              Attach Files
            </label>
            <div className="border-2 border-dashed border-[#FFBE2A]/50 rounded-2xl p-8 md:p-10 text-center bg-[#FFF6E0]/50 hover:bg-[#FFF6E0] transition-colors">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx,.xls,.dwg,.dxf"
                disabled={isUploading}
              />
              <input
                type="file"
                id="folder-upload"
                multiple
                ref={folderInputRef}
                onChange={handleFileChange}
                className="hidden"
                disabled={isUploading}
              />
              <div className="w-14 h-14 rounded-2xl bg-[#FFF1C6] flex items-center justify-center mx-auto mb-3">
                <Upload size={26} className="text-[#B8860B]" />
              </div>
              <p className="text-sm font-semibold text-[#1F2937] mb-1">
                Drag &amp; drop your files here
              </p>
              <p className="text-xs text-gray-500 mb-4">or</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <label
                  htmlFor="file-upload"
                  className={`inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#1F2937] font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-colors ${
                    isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                  }`}
                >
                  <FolderOpen size={16} /> Browse Files
                </label>
                <label
                  htmlFor="folder-upload"
                  className={`inline-flex items-center gap-2 bg-white hover:bg-gray-50 border border-[#E5E7EB] text-[#1F2937] font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-colors ${
                    isUploading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer"
                  }`}
                >
                  <FolderOpen size={16} /> Browse Folder
                </label>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                PDF, DOC, DOCX, JPG, PNG, XLSX, DWG, DXF supported
              </p>
            </div>
          </div>

          {/* Selected files list */}
          {fileFormData.files.length > 0 && (
            <div>
              <p className="text-sm font-medium text-[#1F2937] mb-2">
                Selected Files ({fileFormData.files.length})
              </p>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {fileFormData.files.map((f, index) => {
                  const progress = uploadProgress[index];
                  return (
                    <div
                      key={`${f.name}-${f.lastModified}-${index}`}
                      className="p-3.5 bg-white border border-[#E5E7EB] rounded-xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold uppercase ${
                            getFileTypeMeta({ fileName: f.name }).badge
                          }`}
                        >
                          {getFileExtension({ fileName: f.name }) || "file"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#1F2937] truncate">{f.name}</p>
                          <p className="text-xs text-gray-500">
                            {getFileTypeMeta({ fileName: f.name }).label}
                            {f.size ? ` • ${(f.size / (1024 * 1024)).toFixed(2)} MB` : ""}
                          </p>
                        </div>

                        {!progress && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                            <CheckCircle2 size={12} /> Ready
                          </span>
                        )}
                        {progress?.status === "done" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 px-2.5 py-1 rounded-full flex-shrink-0">
                            <CheckCircle2 size={12} /> Uploaded
                          </span>
                        )}
                        {progress?.status === "failed" && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-50 px-2.5 py-1 rounded-full flex-shrink-0">
                            <XCircle size={12} /> Failed
                          </span>
                        )}
                        {progress?.status === "uploading" && (
                          <span className="text-xs font-medium text-gray-500 flex-shrink-0">
                            {progress.percent}%
                          </span>
                        )}

                        <button
                          onClick={() => handleRemoveSelectedFile(index)}
                          disabled={isUploading}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-500 transition-colors flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                          title="Remove file"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      {/* Per-file progress bar (shown only while uploading/after attempt) */}
                      {progress && (
                        <div className="mt-2.5 w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-200 ${
                              progress.status === "failed" ? "bg-red-400" : "bg-[#FFBE2A]"
                            }`}
                            style={{ width: `${progress.percent}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 md:px-6 py-4 border-t border-[#E5E7EB] bg-gray-50/60 flex-shrink-0">
          <button
            onClick={handleCancelFile}
            disabled={isUploading}
            className="font-semibold text-sm py-2.5 px-5 rounded-xl border border-[#E5E7EB] text-[#1F2937] bg-white hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleAddFile}
            disabled={isUploading || fileFormData.files.length === 0}
            className="flex items-center gap-2 bg-[#FFBE2A] hover:bg-[#F0AE1A] text-black font-semibold text-sm py-2.5 px-5 rounded-xl shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isUploading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
            {isUploading
              ? "Uploading..."
              : fileFormData.files.length > 1
                ? `Upload ${fileFormData.files.length} Files`
                : "Upload File"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFilesModal;
