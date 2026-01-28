import React from 'react'
import { X } from 'lucide-react';

// Project Details Modal Component
const ProjectDetailsModal = ({ project, onClose, getStatusColor, getStatusIcon, onQuickAction }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
          <div className="min-w-0 flex-1">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{project.name}</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">Project ID: {project.id}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Client</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">{project.client}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Type</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">{project.type}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Status</p>
              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {getStatusIcon(project.status)}
                {project.status}
              </span>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">{project.progress}%</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Timeline</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">{project.startDate} to {project.endDate}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Budget</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">₹{project.budget.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Spent</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">₹{project.spent.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">Team Members</p>
              <p className="text-sm sm:text-base font-medium text-gray-900">
                {project.team.length > 0 ? project.team.join(', ') : 'No team assigned'}
              </p>
            </div>
            {project.description && (
              <div className="sm:col-span-2">
                <p className="text-xs sm:text-sm text-gray-600 mb-1">Description</p>
                <p className="text-sm sm:text-base text-gray-900">{project.description}</p>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsModal 