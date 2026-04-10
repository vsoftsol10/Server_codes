import React from "react";

const ViewModal = ({
  isOpen,
  viewRequest,
  onClose,
  onAccept,
  onReject,
  onCommand,
  getRequestDescription,
}) => {
  if (!isOpen || !viewRequest) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-100 rounded-sm shadow-2xl w-full max-w-xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <h3 className="text-lg font-semibold text-gray-900">Request Review</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-200 transition-colors text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Section 1: Request By + Status */}
        <div className="bg-white mx-3 rounded-2xl px-4 py-3 mb-3">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-sm text-gray-500">Request by :</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">
                {viewRequest.employee?.name || viewRequest.assignedTo || "—"}
              </p>
            </div>
            <span
              className={`text-sm font-bold px-5 py-1.5 rounded-lg ${
                viewRequest.status === "APPROVED"
                  ? "bg-green-400 text-white"
                  : viewRequest.status === "REJECTED"
                  ? "bg-red-400 text-white"
                  : "bg-yellow-400 text-white"
              }`}
            >
              {viewRequest.status === "PENDING"
                ? "Pending"
                : viewRequest.status === "APPROVED"
                ? "Approved"
                : "Rejected"}
            </span>
          </div>
          <hr className="border-gray-200 mb-3" />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="10" cy="7" r="4" />
                <path d="M3 19c0-3.866 3.134-7 7-7s7 3.134 7 7" />
              </svg>
              <span className="text-gray-600">Vendor :</span>
              <span className="text-gray-900">{viewRequest.vendor || viewRequest.vendorName || "—"}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M10 18a8 8 0 100-16 8 8 0 000 16z" />
                <path d="M10 6v4l2.5 2.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-gray-600">Status :</span>
              <span className="text-gray-900">
                {viewRequest.status === "PENDING"
                  ? "Pending"
                  : viewRequest.status === "APPROVED"
                  ? "Approved"
                  : "Rejected"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="4" width="14" height="13" rx="2" />
                <path d="M3 9h14M7 3v3M13 3v3" strokeLinecap="round" />
              </svg>
              <span className="text-gray-600">Due Date :</span>
              <span className="text-gray-900">
                {viewRequest.dueDate
                  ? new Date(viewRequest.dueDate).toLocaleDateString("en-IN")
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Material Details */}
        <div className="bg-white mx-3 rounded-2xl px-4 py-3 mb-3">
          <p className="text-sm font-bold text-gray-900 mb-2">Material Details</p>
          <hr className="border-gray-200 mb-3" />
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex gap-2">
              <span className="text-gray-600 w-24 flex-shrink-0">Material :</span>
              <span className="text-gray-900">{viewRequest.name || "—"}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600 w-24 flex-shrink-0">Quantity :</span>
              <span className="text-gray-900">
                {viewRequest.quantity || "—"} {viewRequest.unit || ""}
              </span>
            </div>
            <div className="flex gap-2">
              <span className="text-gray-600 w-24 flex-shrink-0">Price :</span>
              <span className="text-gray-900">
                {viewRequest.defaultRate
                  ? `₹ ${Number(viewRequest.defaultRate).toLocaleString("en-IN")}`
                  : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Description */}
        <div className="bg-white mx-3 rounded-2xl px-4 py-3 mb-4">
          <p className="text-sm font-bold text-gray-900 mb-1.5">Description</p>
          <p className="text-sm text-gray-500 mb-3">
            {getRequestDescription(viewRequest) || "No description provided"}
          </p>
          
        </div>

        {/* Footer Buttons */}
        {/* Footer Buttons */}
{viewRequest.status === "PENDING" && (
  <div className="flex gap-2 px-3 pb-5">
    <button
      onClick={onCommand}
      className="flex-1 py-2.5 bg-yellow-200 text-yellow-800 text-sm font-bold rounded-sm hover:bg-yellow-300 transition-colors"
    >
      View
    </button>
    <button
      onClick={() => onAccept(viewRequest.id)}
      className="flex-1 py-2.5 bg-green-200 text-green-800 text-sm font-bold rounded-sm hover:bg-green-300 transition-colors"
    >
      Accept
    </button>
    <button
      onClick={() => onReject(viewRequest.id)}
      className="flex-1 py-2.5 bg-red-200 text-red-800 text-sm font-bold rounded-sm hover:bg-red-300 transition-colors"
    >
      Reject
    </button>
  </div>
)}

      </div>
    </div>
  );
};

export default ViewModal;