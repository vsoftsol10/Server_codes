import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';

const RecentFiles = ({ 
  recentFiles, 
  loading, 
  onViewFile, 
  onNavigateToFiles,
  getFileIcon,
  getFileType,
  formatFileSize
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">Recent File Uploads</h2>
        <button
          onClick={onNavigateToFiles} 
          className="text-sm text-yellow-700  font-medium bg-yellow-100 p-2 rounded-md border-yellow-700"
        >
          View All Files
        </button>
      </div>
      
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading files...</div>
      ) : recentFiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p>No files uploaded yet</p>
          <p className="text-xs mt-1">Upload files to your assigned projects to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {recentFiles.map((file) => (
            <div 
              key={file.id} 
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => onViewFile(file)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="p-2 bg-blue-100 rounded text-2xl flex-shrink-0">
                  {getFileIcon(file.fileName)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {file.fileName || 'Unnamed File'}
                  </p>
                  <p className="text-xs text-gray-600 truncate">
                    {file.projectName}
                    {file.uploaderName && ` • ${file.uploaderName}`}
                  </p>
                  {file.documentType && (
                    <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      {file.documentType}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-3">
                <p className="text-xs text-gray-500">
                  {new Date(file.uploadedAt).toLocaleDateString('en-IN')}
                </p>
                <span className="text-xs text-gray-400">
                  {getFileType(file.fileName)}
                </span>
                {file.fileSize && (
                  <p className="text-xs text-gray-400">
                    {formatFileSize(file.fileSize)}
                  </p>
                )}
              </div>
              <ExternalLink className="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentFiles;