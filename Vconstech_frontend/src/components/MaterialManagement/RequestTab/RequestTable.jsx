import React from "react";
import ViewButton from "./ViewButton";
import ActionCell from "./ActionCell";

const RequestTable = ({
  headers,
  filteredRequests,
  loading,
  materialTypeFilter,
  getRequestReason,
  onViewRequest,
  onAccept,
  onReject,
}) => {
  return (
    <div className="hidden lg:block overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            {headers.map((header, i) => (
              <th
                key={i}
                className="px-4 lg:px-6 py-3 text-left text-sm font-bold text-gray-900 uppercase tracking-wider bg-white border-b border-gray-200 whitespace-nowrap"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-100">
          {loading ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-6 py-8 text-center text-gray-500 text-base"
              >
                Loading...
              </td>
            </tr>
          ) : filteredRequests.length === 0 ? (
            <tr>
              <td
                colSpan={headers.length}
                className="px-6 py-8 text-center text-gray-500 text-base"
              >
                No material requests found
              </td>
            </tr>
          ) : (
            filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 lg:px-6 py-3 text-gray-700 text-sm font-medium">
                  {request.vendor || request.vendorName || "—"}
                </td>
                <td className="px-4 lg:px-6 py-3 text-gray-700 text-sm font-medium">
                  {request.employee?.name || request.assignedTo || "—"}
                </td>
                {materialTypeFilter === "project" && (
                  <td className="px-4 lg:px-6 py-3 text-gray-700 text-sm font-medium">
                    {request.project?.name || request.projectName || "—"}
                  </td>
                )}
                <td className="px-4 lg:px-6 py-3 text-gray-700 text-sm font-medium whitespace-nowrap">
                  {request.dueDate
                    ? new Date(request.dueDate).toLocaleDateString("en-IN")
                    : "—"}
                </td>
                <td className="px-4 lg:px-6 py-3 text-gray-700 text-sm font-medium">
                  {request.name || "—"}
                </td>
                <td className="px-4 lg:px-6 py-3 text-gray-700 text-sm font-medium whitespace-nowrap">
                  {request.quantity || "—"} {request.unit || ""}
                </td>
                <td className="px-4 lg:px-6 py-3 text-gray-600 text-sm max-w-[180px]">
                  {request.status === "PENDING" ? (
                    <span className="text-gray-400 italic text-sm">—</span>
                  ) : (
                    <span className="break-words text-sm">
                      {getRequestReason(request)}
                    </span>
                  )}
                </td>
                <td className="px-4 lg:px-6 py-3">
                  <ViewButton
                    request={request}
                    onView={onViewRequest}
                  />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RequestTable;
