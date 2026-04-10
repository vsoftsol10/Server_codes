import React from "react";

const RequestCardView = ({
  filteredRequests,
  loading,
  materialTypeFilter,
  getRequestReason,
  onViewRequest,
  onAccept,
  onReject,
}) => {
  return (
    <div className="lg:hidden divide-y divide-gray-200">
      {loading ? (
        <div className="px-4 py-8 text-center text-gray-500 text-base">
          Loading...
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="px-4 py-8 text-center text-gray-500 text-base">
          No material requests found
        </div>
      ) : (
        filteredRequests.map((request) => (
          <div key={request.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-base">
                  {request.employee?.name || request.assignedTo || "—"}
                </div>
                <div className="text-gray-500 text-sm mt-0.5">
                  Vendor: {request.vendor || request.vendorName || "—"}
                </div>
                {materialTypeFilter === "project" && (
                  <div className="text-gray-500 text-sm">
                    Project:{" "}
                    {request.project?.name || request.projectName || "—"}
                  </div>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Request:</span>
                <span className="text-gray-900 font-medium">
                  {request.name || "—"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Qty:</span>
                <span className="text-gray-900 font-medium">
                  {request.quantity || "—"} {request.unit || ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date:</span>
                <span className="text-gray-900 font-medium">
                  {request.dueDate
                    ? new Date(request.dueDate).toLocaleDateString("en-IN")
                    : "—"}
                </span>
              </div>
              {request.status !== "PENDING" && (
                <div className="flex justify-between gap-2 text-sm">
                  <span className="text-gray-500 shrink-0">Reason:</span>
                  <span className="text-gray-900 font-medium text-right break-words">
                    {getRequestReason(request)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex gap-2 pt-1">
              {request.status === "PENDING" && (
                <>
                  <button
                    onClick={() => onAccept(request.id)}
                    className="flex-1 px-3 py-2 bg-[#ffbe2a] text-black text-sm font-medium rounded-lg hover:bg-[#e6ab25] transition-colors"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(request.id)}
                    className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => onViewRequest(request)}
                className={`${
                  request.status === "PENDING" ? "px-4" : "flex-1"
                } py-2 bg-[#ffbe2a] text-black text-sm font-semibold rounded-lg hover:bg-[#e6ab25] transition-colors`}
              >
                View
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RequestCardView;
