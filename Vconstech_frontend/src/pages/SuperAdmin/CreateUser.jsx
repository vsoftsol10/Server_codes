import React, { useState } from "react";
import { Lock, User, Mail, Building, UserCog, AlertCircle, CheckCircle, Eye, EyeOff, Phone, MapPin, Home, Package, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SuperNav from "../../components/SuperAdmin/SuperNav";

import InputField from "../../components/SuperAdmin/Dashboard/Inputfield";
import SelectField from "../../components/SuperAdmin/Dashboard/SelectField";
import { validateCreateForm } from "../../components/SuperAdmin/Dashboard/validation";

const API_URL = import.meta.env.VITE_API_URL || "https://test.vconstech.in";

const INITIAL_FORM = {
  name: "", email: "", role: "", companyName: "", password: "",
  confirmPassword: "", phoneNumber: "", city: "", address: "", package: "", customMembers: "",
};

const ROLES = [{ value: "Admin", label: "Admin" }];
const PACKAGES = [
  { value: "Classic", label: "Classic (5 members)" },
  { value: "Pro", label: "Pro (10 members)" },
  { value: "Premium", label: "Premium (Custom members)" },
];

const CreateUser = () => {
  const [userData, setUserData] = useState(INITIAL_FORM);
  const [isFocused, setIsFocused] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const handleFocus = (field, focused) => setIsFocused((prev) => ({ ...prev, [field]: focused }));

  const handleFieldChange = (field, value) => {
    setUserData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleSubmit = async () => {
    setError(""); setSuccess("");
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
          customMembers: userData.package === "Premium" ? userData.customMembers : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to create user");
      setSuccess(data.message || "User created successfully!");
      setUserData(INITIAL_FORM);
      setFieldErrors({});
    } catch (err) {
      setError(err.message || "An error occurred while creating the user");
    } finally {
      setLoading(false);
    }
  };

  const sharedInputProps = { onChange: handleFieldChange, onFocus: handleFocus, onBlur: handleFocus, disabled: loading };

  return (
    <div className="min-h-screen bg-[#ffbe2a] py-12 px-4">
      <SuperNav />

      <div className="max-w-6xl mx-auto pt-24 md:pt-32">
        {/* Header */}
        <div className="mb-10 flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover:scale-105">
              <User className="w-10 h-10 text-black" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">+</span>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create New User</h1>
            <p className="text-gray-600 text-lg">Add a new user to the ERP system</p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-10">
            {/* Alerts */}
            {error && (
              <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-start shadow-md">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <p className="ml-4 text-sm font-bold text-red-900">{error}</p>
              </div>
            )}
            {success && (
              <div className="mb-8 p-5 bg-green-50 border-l-4 border-green-500 rounded-2xl flex items-start shadow-md">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <p className="ml-4 text-sm font-bold text-green-900">{success}</p>
              </div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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

              {userData.package === "Premium" && (
                <InputField field="customMembers" label="Number of Site Engineers" type="number"
                  placeholder="Enter number of site engineers" icon={Users} value={userData.customMembers}
                  isFocused={isFocused.customMembers} error={fieldErrors.customMembers} {...sharedInputProps} />
              )}

              {/* Password */}
              <InputField field="password" label="Password" type={showPassword ? "text" : "password"}
                placeholder="Min 6 characters" icon={Lock} value={userData.password}
                isFocused={isFocused.password} error={fieldErrors.password} {...sharedInputProps}>
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputField>

              {/* Confirm Password */}
              <InputField field="confirmPassword" label="Confirm Password" type={showConfirmPassword ? "text" : "password"}
                placeholder="Re-enter password" icon={Lock} value={userData.confirmPassword}
                isFocused={isFocused.confirmPassword} error={fieldErrors.confirmPassword} {...sharedInputProps}>
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg">
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </InputField>
            </div>

            {/* Address - full width */}
            <div className="mt-8">
              <InputField field="address" label="Address" placeholder="Enter full address" icon={Home}
                value={userData.address} isFocused={isFocused.address} error={fieldErrors.address}
                isTextarea rows={4} {...sharedInputProps} />
            </div>

            {/* Actions */}
            <div className="flex gap-5 mt-10">
              <button onClick={() => navigate("/SuperAdmin/login")} disabled={loading}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                Cancel
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 bg-[#ffbe2a] text-black font-bold py-4 rounded-2xl hover:shadow-2xl shadow-[#ffbe2a]/30 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating User...
                  </span>
                ) : "Create User"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateUser;