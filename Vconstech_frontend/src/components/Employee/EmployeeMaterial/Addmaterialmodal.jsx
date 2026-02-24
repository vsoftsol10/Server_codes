import { useState } from "react";
import EmployeeModalMaterial from "../../Employee/EmployeeMaterial/EmployeeModalMaterial";
import EmployeeMaterialForm from "../../Employee/EmployeeMaterial/EmployeeMaterialForm";

const EMPTY_MATERIAL = {
  name: "",
  category: "Paint",
  unit: "piece",
  defaultRate: "",
  vendor: "",
  description: "",
  projectId: "",
  quantity: "",
};

const AddMaterialModal = ({ isOpen, onClose, onSubmit, categories, projects, loading }) => {
  const [requestType, setRequestType] = useState("GLOBAL");
  const [newMaterial, setNewMaterial] = useState(EMPTY_MATERIAL);

  const handleClose = () => {
    setNewMaterial(EMPTY_MATERIAL);
    setRequestType("GLOBAL");
    onClose();
  };

  const handleSubmit = async () => {
    await onSubmit(newMaterial, requestType);
    setNewMaterial(EMPTY_MATERIAL);
    setRequestType("GLOBAL");
  };

  const isSubmitDisabled =
    !newMaterial.name ||
    !newMaterial.defaultRate ||
    (requestType === "PROJECT" && (!newMaterial.projectId || !newMaterial.quantity)) ||
    loading;

  return (
    <EmployeeModalMaterial
      isOpen={isOpen}
      onClose={handleClose}
      title={
        requestType === "GLOBAL"
          ? "Request New Global Material"
          : "Request Project-Specific Material"
      }
      footer={
        <>
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Submitting..." : "Submit Request"}
          </button>
        </>
      }
    >
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Request Type
        </label>
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="GLOBAL"
              checked={requestType === "GLOBAL"}
              onChange={() => {
                setRequestType("GLOBAL");
                setNewMaterial((m) => ({ ...m, projectId: "", quantity: "" }));
              }}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">
              Global Material (Available for all projects)
            </span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="PROJECT"
              checked={requestType === "PROJECT"}
              onChange={() => setRequestType("PROJECT")}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Project-Specific Material</span>
          </label>
        </div>
      </div>

      <EmployeeMaterialForm
        material={newMaterial}
        onChange={setNewMaterial}
        categories={
          categories.length > 1
            ? categories.filter((c) => c !== "All")
            : ["Paint", "Wood", "Flooring", "Electrical", "Fabric", "Hardware", "Plumbing"]
        }
        isProjectSpecific={requestType === "PROJECT"}
        projects={projects}
      />
    </EmployeeModalMaterial>
  );
};

export default AddMaterialModal;