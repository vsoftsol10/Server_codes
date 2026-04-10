import React, { useState } from "react";
import { useRequestTabData } from "./RequestTab/useRequestTabData";
import RequestTabHeader from "./RequestTab/RequestTabHeader";
import RequestTable from "./RequestTab/RequestTable";
import RequestCardView from "./RequestTab/RequestCardView";
import ViewModal from "./RequestTab/ViewModal";
import RejectModal from "./RequestTab/RejectModal";
import CommandModal from "./RequestTab/CommandModal";

const RequestTab = () => {
  // Modal states
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewRequest, setViewRequest] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showCommandModal, setShowCommandModal] = useState(false);
  const [commandNote, setCommandNote] = useState("");
  const [selectedProjectFilter, setSelectedProjectFilter] = useState("All");

  // Data and handlers from custom hook
  const {
    requestStatusFilter,
    setRequestStatusFilter,
    materialRequests,
    loading,
    error,
    materialTypeFilter,
    setMaterialTypeFilter,
    handleAcceptConfirm,
    handleRejectClick,
    handleRejectConfirm: hookHandleRejectConfirm,
    handleCommandConfirm: hookHandleCommandConfirm,
  } = useRequestTabData();

  // Helper functions
  const getRequestReason = (request) => {
    if (request.status === "APPROVED") {
      return (
        request.approvalReason ||
        request.notes ||
        request.message ||
        request.adminNote ||
        request.reason ||
        "Approved"
      );
    }
    return (
      request.rejectionReason ||
      request.notes ||
      request.message ||
      request.adminNote ||
      request.reason ||
      "—"
    );
  };

  const getRequestDescription = (request) =>
    request.description ||
    request.engineerNote ||
    request.note ||
    request.remarks ||
    request.comment ||
    "No description provided.";

  // Filtering logic
  const filteredMaterialRequests = materialRequests
    .filter(
      (req) =>
        requestStatusFilter === "All" || req.status === requestStatusFilter,
    )
    .filter((req) => {
      if (materialTypeFilter === "global") {
        return !req.project && !req.projectName && !req.projectId;
      }
      return req.project || req.projectName || req.projectId;
    })
    .filter((req) => {
      if (materialTypeFilter === "project" && selectedProjectFilter !== "All") {
        const projectName = req.project?.name || req.projectName || "";
        return projectName === selectedProjectFilter;
      }
      return true;
    });

  // Unique project names for filter dropdown
  const projectNames = [
    ...new Set(
      materialRequests
        .filter((r) => r.project || r.projectName || r.projectId)
        .map((r) => r.project?.name || r.projectName || "")
        .filter(Boolean),
    ),
  ];

  // Table headers
  const globalHeaders = ["Vendor", "Name", "Date", "Material", "QTY", "Reason", ""];
  const projectHeaders = ["Vendor", "Name", "Project", "Date", "Material", "Qty", "Reason", ""];
  const headers = materialTypeFilter === "global" ? globalHeaders : projectHeaders;

  // Event handlers
  const handleTabSwitch = (tab) => {
    setMaterialTypeFilter(tab);
    setSelectedProjectFilter("All");
    setRequestStatusFilter("All");
  };

  const handleViewRequest = (request) => {
    setViewRequest(request);
    setShowViewModal(true);
  };

  const handleRejectFromModal = (requestId) => {
    handleRejectClick(requestId);
    setShowViewModal(false);
    setViewRequest(null);
    setShowRejectModal(true);
    setRejectReason("");
  };

  const handleRejectConfirm = async () => {
    await hookHandleRejectConfirm(rejectReason);
    setShowRejectModal(false);
    setRejectReason("");
  };

  const handleCommandConfirm = async () => {
    await hookHandleCommandConfirm(commandNote, viewRequest);
    setShowCommandModal(false);
    setCommandNote("");
    setShowViewModal(false);
    setViewRequest(null);
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg md:rounded-xl shadow overflow-hidden">
        <RequestTabHeader
          materialTypeFilter={materialTypeFilter}
          onTabSwitch={handleTabSwitch}
          requestStatusFilter={requestStatusFilter}
          onStatusFilterChange={setRequestStatusFilter}
          selectedProjectFilter={selectedProjectFilter}
          onProjectFilterChange={setSelectedProjectFilter}
          projectNames={projectNames}
        />

        <RequestTable
          headers={headers}
          filteredRequests={filteredMaterialRequests}
          loading={loading}
          materialTypeFilter={materialTypeFilter}
          getRequestReason={getRequestReason}
          onViewRequest={handleViewRequest}
          onAccept={handleAcceptConfirm}
          onReject={handleRejectClick}
        />

        <RequestCardView
          filteredRequests={filteredMaterialRequests}
          loading={loading}
          materialTypeFilter={materialTypeFilter}
          getRequestReason={getRequestReason}
          onViewRequest={handleViewRequest}
          onAccept={handleAcceptConfirm}
          onReject={handleRejectClick}
        />
      </div>

      <ViewModal
        isOpen={showViewModal}
        viewRequest={viewRequest}
        onClose={() => {
          setShowViewModal(false);
          setViewRequest(null);
        }}
        onAccept={async (id) => {
          await handleAcceptConfirm(id);
          setShowViewModal(false);
          setViewRequest(null);
        }}
        onReject={handleRejectFromModal}
        onCommand={() => setShowCommandModal(true)}
        getRequestDescription={getRequestDescription}
      />

      <RejectModal
        isOpen={showRejectModal}
        rejectReason={rejectReason}
        onReasonChange={(e) => setRejectReason(e.target.value)}
        onConfirm={handleRejectConfirm}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectReason("");
        }}
      />

      <CommandModal
        isOpen={showCommandModal}
        commandNote={commandNote}
        onNoteChange={(e) => setCommandNote(e.target.value)}
        onConfirm={handleCommandConfirm}
        onCancel={() => {
          setShowCommandModal(false);
          setCommandNote("");
        }}
      />
    </div>
  );
};

export default RequestTab;
