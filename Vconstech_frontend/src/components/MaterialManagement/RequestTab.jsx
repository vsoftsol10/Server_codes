import React, { useEffect, useState } from 'react'
import { materialRequestAPI, projectMaterialAPI, materialAPI } from '../../api/materialService';
import { projectAPI } from "../../api/projectAPI";

const RequestTab = () => {
  const [requestStatusFilter, setRequestStatusFilter] = useState("All");
  const [materialRequests, setMaterialRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [error, setError] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState(null);

  const filteredMaterialRequests = requestStatusFilter === "All"
    ? materialRequests
    : materialRequests.filter(req => req.status === requestStatusFilter);

  const fetchMaterials = async () => {
    try {
      const data = await materialAPI.getAll();
      if (data.projects || data.success) {
        setMaterials(data.materials || []);
        console.log('Materials fetched:', data.materials);
      }
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const data = await projectAPI.getProjects();
      if (data.projects && Array.isArray(data.projects)) {
        setProjects(data.projects);
        if (data.projects.length > 0) {
          setSelectedProject(data.projects[0].id);
        }
      } else {
        console.error('❌ No projects array in response');
      }
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterialRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      let userRole = 'Site_Engineer';
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userRole = payload.role;
        } catch (e) {
          console.error('Error parsing token:', e);
        }
      }
      let data;
      if (userRole.toUpperCase() === 'ADMIN') {
        data = await materialRequestAPI.getAll();
      } else {
        data = await materialRequestAPI.getMyRequests();
      }
      if (data.success) {
        setMaterialRequests(data.requests || []);
      } else {
        setError(data.error || 'Failed to load material requests');
      }
    } catch (err) {
      console.error('Error fetching material requests:', err);
      if (err.response?.status === 403) {
        try {
          const data = await materialRequestAPI.getMyRequests();
          if (data.success) {
            setMaterialRequests(data.requests || []);
          }
        } catch (retryErr) {
          setError('Failed to load material requests');
        }
      } else {
        setError('Failed to load material requests');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await materialRequestAPI.approve(requestId, 'Request approved');
      fetchMaterialRequests();
      if (selectedProject) {
        fetchProjectMaterials(selectedProject);
      }
    } catch (err) {
      console.error('Error accepting request:', err);
      alert(`Failed to accept request: ${err.response?.data?.error || err.message}`);
    }
  };

  const handleRejectClick = (requestId) => {
    setSelectedRequestId(requestId);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    if (rejectReason.trim() && selectedRequestId) {
      try {
        await materialRequestAPI.reject(selectedRequestId, rejectReason);
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedRequestId(null);
        fetchMaterialRequests();
      } catch (err) {
        console.error('Error rejecting request:', err);
        alert(`Failed to reject request: ${err.response?.data?.error || err.message}`);
      }
    }
  };

  const handleRejectCancel = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setSelectedRequestId(null);
  };

  const fetchProjectMaterials = async (projectId) => {
    try {
      setLoading(true);
      const data = await projectMaterialAPI.getByProject(projectId);
      if (data.success) {
        setProjectMaterials(data.projectMaterials || []);
      }
    } catch (err) {
      console.error('Error fetching project materials:', err);
      setError('Failed to load project materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
      } catch (e) {
        console.error('Error parsing token:', e);
        setUserRole('Site_Engineer');
      }
    }
    fetchProjects();
    fetchMaterialRequests();
    fetchMaterials();
  }, []);

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg md:rounded-xl shadow overflow-hidden">
        <div className="px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-gray-200">
          <h2 className="text-sm sm:text-base md:text-lg font-semibold text-gray-900 mb-3">
            Material Requests
          </h2>
          <div className="flex gap-2 flex-wrap">
            {["All", "PENDING", "APPROVED", "REJECTED"].map((status) => (
              <button
                key={status}
                onClick={() => setRequestStatusFilter(status)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  requestStatusFilter === status
                    ? "bg-yellow-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {status.charAt(0) + status.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block mx-2 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {["Engineer", "Project Name", "Due Date", "Material Requested", "Quantity", "Status", "Action"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-4 lg:px-6 py-3 text-left bg-yellow-500 font-sans text-black uppercase tracking-wider text-x whitespace-nowrap"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-4 lg:px-6 py-8 text-center text-gray-500 text-sm">
                    Loading...
                  </td>
                </tr>
              ) : filteredMaterialRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-4 lg:px-6 py-8 text-center text-gray-500 text-sm">
                    No material requests yet
                  </td>
                </tr>
              ) : (
                filteredMaterialRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50 transition-colors duration-200">
                    <td className="px-4 lg:px-6 py-3 text-gray-600 font-sans font-medium text-sm">
                      {request.employee?.name || 'N/A'}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 font-sans font-medium text-sm">
                      {request.project?.name || request.projectName || 'N/A'}
                    </td>
                    {/* ✅ Due Date column */}
                    <td className="px-4 lg:px-6 py-3 text-gray-600 font-medium whitespace-nowrap text-sm">
                      {request.dueDate
                        ? new Date(request.dueDate).toLocaleDateString('en-IN')
                        : '—'}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 font-sans font-medium text-sm">
                      {request.name}
                    </td>
                    <td className="px-4 lg:px-6 py-3 text-gray-600 font-medium whitespace-nowrap text-sm">
                      {request.quantity || 'N/A'} {request.unit}
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      <span
                        className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                          request.status === "APPROVED"
                            ? "bg-green-100 text-green-800"
                            : request.status === "REJECTED"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {request.status}
                      </span>
                    </td>
                    <td className="px-4 lg:px-6 py-3">
                      {request.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAcceptRequest(request.id)}
                            className="px-3 py-1.5 bg-[#ffbe2a] text-black text-xs font-medium rounded-lg hover:bg-[#e6ab25] transition-colors whitespace-nowrap"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleRejectClick(request.id)}
                            className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors whitespace-nowrap"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">{request.status}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile/Tablet Card View */}
        <div className="lg:hidden divide-y divide-gray-200">
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">Loading...</div>
          ) : filteredMaterialRequests.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500 text-sm">No material requests yet</div>
          ) : (
            filteredMaterialRequests.map((request) => (
              <div key={request.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 text-sm">{request.employee?.name || 'N/A'}</div>
                    <div className="text-gray-600 text-sm mt-0.5">{request.project?.name || request.projectName || 'N/A'}</div>
                  </div>
                  <span
                    className={`inline-block px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ml-2 flex-shrink-0 ${
                      request.status === "APPROVED"
                        ? "bg-green-100 text-green-800"
                        : request.status === "REJECTED"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Material:</span>
                    <span className="text-gray-900 font-medium">{request.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity:</span>
                    <span className="text-gray-900 font-medium">{request.quantity || 'N/A'} {request.unit}</span>
                  </div>
                  {/* ✅ Due Date in mobile card */}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="text-gray-900 font-medium">
                      {request.dueDate
                        ? new Date(request.dueDate).toLocaleDateString('en-IN')
                        : '—'}
                    </span>
                  </div>
                </div>
                {request.status === "PENDING" && (
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 px-3 py-2 bg-[#ffbe2a] text-black text-sm font-medium rounded-lg hover:bg-[#e6ab25] transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleRejectClick(request.id)}
                      className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Reject Material Request
            </h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Please provide a reason for rejecting this material request:
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
              rows="4"
              autoFocus
            />
            <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
              <button
                onClick={handleRejectCancel}
                className="flex-1 px-3 sm:px-4 py-2 bg-gray-200 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectConfirm}
                disabled={!rejectReason.trim()}
                className="flex-1 px-3 sm:px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestTab;