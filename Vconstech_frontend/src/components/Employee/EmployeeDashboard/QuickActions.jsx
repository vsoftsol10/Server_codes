import React from 'react';
import { Plus, Upload } from 'lucide-react';

const QuickActions = ({ onMaterialRequest, onFileUpload }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <button 
          onClick={onMaterialRequest}
          className="w-full flex items-center gap-3 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Raise Material Request</span>
        </button>
        <button 
          onClick={onFileUpload}
          className="w-full flex items-center gap-3 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Upload className="w-5 h-5" />
          <span className="font-medium">Upload File</span>
        </button>
      </div>
    </div>
  );
};

export default QuickActions;