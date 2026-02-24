import { useState } from "react";
import EmployeeMaterialsTab from "../../components/Employee/EmployeeMaterial/EmployeeMaterialsTab";
import EmployeeProjectsTab from "../../components/Employee/EmployeeMaterial/EmployeeProjectsTab";
import EmployeeRequestTab from "../../components/Employee/EmployeeMaterial/EmployeeRequestTab";
import EmployeeNavbar from "../../components/Employee/EmployeeNavbar";
import { materialRequestAPI, usageLogAPI, notificationAPI } from "../../api/materialService";

import useEmployeeMaterialData from "../../hooks/Useemployeematerialdata";
import NotificationsDropdown from "../../components/Employee/EmployeeMaterial/NotificationsDropdown";
import AddMaterialModal from "../../components/Employee/EmployeeMaterial/AddMaterialModal";
import AddProjectMaterialModal from "../../components/Employee/EmployeeMaterial/AddProjectMaterialModal";
import LogUsageModal from "../../components/Employee/EmployeeMaterial/LogUsageModal";

const TABS = ["materials", "projects", "my-requests"];

const EmployeeMaterialManagement = () => {
  const {
    materials, projects, usageLogs, materialRequests, notifications,
    categories, selectedProject, setSelectedProject, loading, setLoading, error,
    fetchProjectMaterials, fetchUsageLogs, fetchMaterialRequests, fetchNotifications,
    getProjectMaterialsWithDetails, unreadCount, getSelectedMaterialRemaining,
  } = useEmployeeMaterialData();

  const [activeTab, setActiveTab] = useState("materials");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [showAddProjectMaterial, setShowAddProjectMaterial] = useState(false);
  const [showUsageLog, setShowUsageLog] = useState(false);

  // ============ COMPUTED ============

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.vendor?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "All" || m.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // ============ HANDLERS ============

  const handleSubmitMaterialRequest = async (newMaterial, requestType) => {
    try {
      setLoading(true);
      const requestData = {
        name: newMaterial.name,
        category: newMaterial.category,
        unit: newMaterial.unit,
        defaultRate: parseFloat(newMaterial.defaultRate),
        vendor: newMaterial.vendor || null,
        description: newMaterial.description || null,
        type: requestType,
        projectId: requestType === "PROJECT" ? parseInt(newMaterial.projectId) : null,
        quantity: requestType === "PROJECT" ? parseFloat(newMaterial.quantity) : null,
      };
      await materialRequestAPI.create(requestData);
      await fetchMaterialRequests();
      await fetchNotifications();
      setShowAddMaterial(false);
      alert("Material request submitted successfully! You will be notified once it is reviewed.");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit material request");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProjectMaterial = async (newProjectMaterial) => {
    try {
      setLoading(true);
      const material = materials.find((m) => m.id === parseInt(newProjectMaterial.materialId));
      const requestData = {
        name: material?.name,
        category: material?.category,
        unit: material?.unit,
        defaultRate: material?.defaultRate,
        type: "PROJECT_MATERIAL",
        projectId: parseInt(selectedProject),
        materialId: parseInt(newProjectMaterial.materialId),
        quantity: parseFloat(newProjectMaterial.assigned),
      };
      await materialRequestAPI.create(requestData);
      await fetchMaterialRequests();
      await fetchNotifications();
      setShowAddProjectMaterial(false);
      alert("Project material request submitted successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit project material request");
    } finally {
      setLoading(false);
    }
  };

  const handleAddUsageLog = async (newUsageLog) => {
    try {
      setLoading(true);
      const projectMaterialsWithDetails = getProjectMaterialsWithDetails();
      const selectedMaterialId = parseInt(newUsageLog.materialId);
      const quantityToLog = parseFloat(newUsageLog.quantity);
      const projectMaterial = projectMaterialsWithDetails.find(
        (pm) => pm.materialId === selectedMaterialId
      );

      if (!projectMaterial) {
        alert("Selected material not found in project!");
        return;
      }

      if (quantityToLog > projectMaterial.remaining) {
        alert(
          `You are trying to log ${quantityToLog - projectMaterial.remaining} ` +
          `${projectMaterial.material?.unit} more than available.\n` +
          `Please reduce the quantity or request more materials.`
        );
        return;
      }

      const response = await usageLogAPI.create({
        projectId: parseInt(selectedProject),
        materialId: selectedMaterialId,
        quantity: quantityToLog,
        remarks: newUsageLog.remarks || null,
        date: newUsageLog.date,
      });

      if (response.warning) alert(`Warning: ${response.warning}`);

      await fetchProjectMaterials(selectedProject);
      await fetchUsageLogs(selectedProject);
      setShowUsageLog(false);
      alert("Usage logged successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to log usage");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUsageLog = async (originalLog, _index, updatedData) => {
    try {
      setLoading(true);
      const projectMaterialsWithDetails = getProjectMaterialsWithDetails();
      const projectMaterial = projectMaterialsWithDetails.find(
        (pm) => pm.materialId === originalLog.materialId
      );

      if (!projectMaterial) {
        alert("Material not found in project!");
        return;
      }

      const newRemaining =
        projectMaterial.remaining + originalLog.quantity - updatedData.quantity;

      if (newRemaining < 0) {
        alert(
          `Cannot update to ${updatedData.quantity} ${projectMaterial.material?.unit}!\n\n` +
          `Current used: ${projectMaterial.used} ${projectMaterial.material?.unit}\n` +
          `Assigned: ${projectMaterial.assigned} ${projectMaterial.material?.unit}\n` +
          `This change would exceed available quantity by ${Math.abs(newRemaining)} ` +
          `${projectMaterial.material?.unit}\n\nPlease use a smaller quantity.`
        );
        return;
      }

      await usageLogAPI.update(originalLog.id, {
        quantity: parseFloat(updatedData.quantity),
        remarks: updatedData.remarks || null,
      });

      await fetchProjectMaterials(selectedProject);
      await fetchUsageLogs(selectedProject);
      alert("Usage log updated successfully!");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update usage log");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    try {
      const selectedProjectData = projects.find((p) => p.id === selectedProject);
      if (usageLogs.length === 0) {
        alert("No usage logs found for this project. Please log some usage first.");
        return;
      }

      const reportData = {
        projectName: selectedProjectData?.name || "Unknown Project",
        generatedDate: new Date().toLocaleDateString("en-IN"),
        generatedTime: new Date().toLocaleTimeString("en-IN"),
        usageLogs: usageLogs.map((log) => {
          const quantity = parseFloat(log.quantity) || 0;
          const rate = parseFloat(log.material?.defaultRate) || 0;
          return {
            date: new Date(log.date).toLocaleDateString("en-IN"),
            materialName: log.material?.name || "N/A",
            category: log.material?.category || "N/A",
            quantity,
            unit: log.material?.unit || "unit",
            rate,
            cost: quantity * rate,
            remarks: log.remarks || "-",
          };
        }),
        totalEntries: usageLogs.length,
        grandTotal: usageLogs.reduce((total, log) => {
          return total + (parseFloat(log.quantity) || 0) * (parseFloat(log.material?.defaultRate) || 0);
        }, 0),
      };

      const response = await fetch("http://localhost:5000/api/reports/usage-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData),
      });

      if (!response.ok) throw new Error("Failed to generate PDF report");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportData.projectName.replace(/\s+/g, "_")}_Usage_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading PDF report:", error);
      alert("Failed to download PDF report. Please try again.");
    }
  };

  const handleMarkNotificationAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      await fetchNotifications();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  // ============ RENDER ============

  return (
    <div className="min-h-screen bg-gray-50">
      <EmployeeNavbar />

      {/* Header */}
      <div className="bg-white border-b mt-26 border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Material Management System</h1>
            <p className="text-sm text-gray-600 mt-1">
              Track and manage materials across all projects
            </p>
          </div>
          <NotificationsDropdown
            notifications={notifications}
            unreadCount={unreadCount}
            show={showNotifications}
            onToggle={() => setShowNotifications((v) => !v)}
            onMarkAsRead={handleMarkNotificationAsRead}
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-2 border-b-2 font-bold text-x transition-colors ${
                activeTab === tab
                  ? "border-yellow-600 text-yellow-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-yellow-300"
              }`}
            >
              {tab === "my-requests"
                ? "My Requests"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {!loading && activeTab === "materials" && (
          <EmployeeMaterialsTab
            materials={filteredMaterials}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterCategory={filterCategory}
            setFilterCategory={setFilterCategory}
            categories={categories}
            onAddMaterial={() => setShowAddMaterial(true)}
          />
        )}

        {!loading && activeTab === "projects" && (
          <EmployeeProjectsTab
            projects={projects}
            selectedProject={selectedProject}
            setSelectedProject={setSelectedProject}
            projectMaterials={getProjectMaterialsWithDetails()}
            usageLogs={usageLogs}
            onAddProjectMaterial={() => setShowAddProjectMaterial(true)}
            onLogUsage={() => setShowUsageLog(true)}
            onEditUsage={handleEditUsageLog}
            onDownloadReport={handleDownloadReport}
          />
        )}

        {!loading && activeTab === "my-requests" && (
          <EmployeeRequestTab requests={materialRequests} />
        )}
      </div>

      {/* Modals */}
      <AddMaterialModal
        isOpen={showAddMaterial}
        onClose={() => setShowAddMaterial(false)}
        onSubmit={handleSubmitMaterialRequest}
        categories={categories}
        projects={projects}
        loading={loading}
      />

      <AddProjectMaterialModal
        isOpen={showAddProjectMaterial}
        onClose={() => setShowAddProjectMaterial(false)}
        onSubmit={handleAddProjectMaterial}
        materials={materials}
        loading={loading}
      />

      <LogUsageModal
        isOpen={showUsageLog}
        onClose={() => setShowUsageLog(false)}
        onSubmit={handleAddUsageLog}
        projectMaterialsWithDetails={getProjectMaterialsWithDetails()}
        getSelectedMaterialRemaining={getSelectedMaterialRemaining}
        loading={loading}
      />
    </div>
  );
};

export default EmployeeMaterialManagement;