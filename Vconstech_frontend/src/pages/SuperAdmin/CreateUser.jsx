import React, { useState, useEffect } from "react";
import { Lock, User, Mail, Building, UserCog, AlertCircle, CheckCircle, Eye, EyeOff, Phone, MapPin, Home, Package, Users, X, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SuperNav from "../../components/SuperAdmin/SuperNav";

import InputField from "../../components/SuperAdmin/Dashboard/Inputfield";
import SelectField from "../../components/SuperAdmin/Dashboard/SelectField";
import { validateCreateForm } from "../../components/SuperAdmin/Dashboard/validation";
import StatsCards from "../../components/SuperAdmin/Dashboard/StatsCards";

const API_URL = import.meta.env.VITE_API_URL || "https://test.vconstech.in";

const INITIAL_FORM = {
  name: "", email: "", role: "", companyName: "", password: "",
  confirmPassword: "", phoneNumber: "", city: "", address: "", package: "", customMembers: "",
};

const ROLES = [{ value: "Admin", label: "Admin" }];
const PACKAGES = [
  { value: "Basic",    label: "Basic (5 members)" },
  { value: "Premium",  label: "Premium (10 members)" },
  { value: "Advanced", label: "Advanced (Custom members)" },
];

// ─── Toast Component ──────────────────────────────────────────────────────────
const Toast = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3500);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <>
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
        @keyframes toastProgress {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-enter { animation: toastIn 0.3s cubic-bezier(.4,0,.2,1) forwards; }
        .toast-progress { animation: toastProgress 3.5s linear forwards; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-[9999] toast-enter">
        <div className="relative bg-white rounded-2xl shadow-2xl border border-green-100 overflow-hidden min-w-[300px] max-w-sm">
          <div className="toast-progress absolute bottom-0 left-0 h-1 bg-green-400 rounded-full" />
          <div className="flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-green-500 flex items-center justify-center shrink-0 shadow-md">
              <CheckCircle className="w-5 h-5 text-white" />
            </div>
            <p className="text-sm font-semibold text-gray-800 flex-1">{message}</p>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Create User Modal ────────────────────────────────────────────────────────
const CreateUserModal = ({ isOpen, onClose, onUserCreated }) => {
  const [userData, setUserData] = useState(INITIAL_FORM);
  const [isFocused, setIsFocused] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const handleFocus = (field, focused) => setIsFocused((prev) => ({ ...prev, [field]: focused }));

  const handleFieldChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleClose = () => {
    setUserData(INITIAL_FORM);
    setFieldErrors({});
    setError("");
    onClose();
  };

  const handleSubmit = async () => {
    setError("");
    const errors = validateCreateForm(userData);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix all validation errors before submitting");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...userData,
          customMembers: userData.package === "Advanced" ? userData.customMembers : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create user");
      setToast(data.message || "User created successfully!");
      setUserData(INITIAL_FORM);
      setFieldErrors({});
      onUserCreated?.(); // ← refresh stats after creating a user
      setTimeout(handleClose, 1500);
    } catch (err) {
      setError(err.message || "An error occurred while creating the user");
    } finally {
      setLoading(false);
    }
  };

  const sharedInputProps = { onChange: handleFieldChange, onFocus: handleFocus, onBlur: handleFocus, disabled: loading };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalSlideIn {
          from { opacity: 0; transform: translateY(40px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .modal-backdrop { animation: backdropIn 0.25s ease forwards; }
        .modal-panel    { animation: modalSlideIn 0.3s cubic-bezier(.4,0,.2,1) forwards; }
      `}</style>

      <div
        className="modal-backdrop fixed inset-0 z-[1000] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
      >
        <div className="modal-panel relative bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-[#ffbe2a] rounded-t-3xl shrink-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/30 backdrop-blur-sm flex items-center justify-center shadow-inner">
                <User className="w-6 h-6 text-gray-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Create New User</h2>
                <p className="text-gray-700 text-sm">Add a new user to the ERP system</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-10 h-10 rounded-xl bg-black/10 hover:bg-black/20 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-gray-900" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="overflow-y-auto flex-1 px-8 py-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-start shadow-sm">
                <div className="w-9 h-9 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <p className="ml-3 text-sm font-bold text-red-900 self-center">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField field="name" label="Client Name" placeholder="Enter full name" icon={User}
                value={userData.name} isFocused={isFocused.name} error={fieldErrors.name} {...sharedInputProps} />

              <InputField field="email" label="Email" type="email" placeholder="Enter email address" icon={Mail}
                value={userData.email} isFocused={isFocused.email} error={fieldErrors.email} {...sharedInputProps} />

              <InputField field="phoneNumber" label="Contact Number" type="tel" placeholder="Enter 10-digit phone number" icon={Phone}
                value={userData.phoneNumber} isFocused={isFocused.phoneNumber} error={fieldErrors.phoneNumber} {...sharedInputProps} />

              <SelectField field="role" label="Role" icon={UserCog} value={userData.role} options={ROLES}
                placeholder="Select role" isFocused={isFocused.role} error={fieldErrors.role} {...sharedInputProps} />

              <InputField field="companyName" label="Company Name" placeholder="Enter company name" icon={Building}
                value={userData.companyName} isFocused={isFocused.companyName} error={fieldErrors.companyName} {...sharedInputProps} />

              <InputField field="city" label="City" placeholder="Enter city name" icon={MapPin}
                value={userData.city} isFocused={isFocused.city} error={fieldErrors.city} {...sharedInputProps} />

              <SelectField field="package" label="Package" icon={Package} value={userData.package} options={PACKAGES}
                placeholder="Select package" isFocused={isFocused.package} error={fieldErrors.package}
                onChange={(field, value) => { handleFieldChange(field, value); setUserData((prev) => ({ ...prev, package: value, customMembers: "" })); }}
                onFocus={handleFocus} onBlur={handleFocus} disabled={loading} />

              {userData.package === "Advanced" && (
                <InputField field="customMembers" label="Number of Site Engineers" type="number"
                  placeholder="Enter number of site engineers" icon={Users} value={userData.customMembers}
                  isFocused={isFocused.customMembers} error={fieldErrors.customMembers} {...sharedInputProps} />
              )}

              <InputField field="password" label="Password" type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters" icon={Lock} value={userData.password}
                isFocused={isFocused.password} error={fieldErrors.password} {...sharedInputProps}>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputField>

              <InputField field="confirmPassword" label="Confirm Password" type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password" icon={Lock} value={userData.confirmPassword}
                isFocused={isFocused.confirmPassword} error={fieldErrors.confirmPassword} {...sharedInputProps}>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputField>
            </div>

            <div className="mt-6">
              <InputField field="address" label="Address" placeholder="Enter full address" icon={Home}
                value={userData.address} isFocused={isFocused.address} error={fieldErrors.address}
                isTextarea rows={4} {...sharedInputProps} />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex gap-4 px-8 py-6 border-t border-gray-100 bg-gray-50/60 rounded-b-3xl shrink-0">
            <button onClick={handleClose} disabled={loading}
              className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-3.5 rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-[#ffbe2a] text-black font-bold py-3.5 rounded-2xl hover:shadow-xl shadow-[#ffbe2a]/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12hz2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating User...
                </span>
              ) : "Create User"}
            </button>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast} onClose={() => setToast("")} />}
    </>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
const CreateUser = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState([]); // ← fetch real users for StatsCards

  const fetchUsers = async () => {
    try {
      const res  = await fetch(`${API_URL}/superadmin/users`);
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Error fetching users for stats:", err);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return (
    <div className="min-h-screen bg-[#ffbe2a] py-12 pl-35">
      <SuperNav />

      <div className="max-w-6xl mx-auto pt-24 md:pt-32 space-y-10">

        {/* Stats Cards — now powered by real API data */}
        <StatsCards users={users} />

        {/* Page Header with Clickable Create Button */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className="relative group focus:outline-none cursor-pointer"
            title="Create New User"
          >
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl group-active:scale-95">
              <User className="w-10 h-10 text-black" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg group-hover:bg-slate-700 transition-colors">
              <Plus className="w-5 h-5 text-white" />
            </div>
          </button>

          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New User</h1>
            <p className="text-gray-600 text-lg">
              Click the icon or the button to add a new user to the ERP system
            </p>
          </div>
        </div>
      </div>

      {/* Modal — onUserCreated refreshes stats */}
      <CreateUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onUserCreated={fetchUsers}
      />
    </div>
  );
};

export default CreateUser;