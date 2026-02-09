import React, { useState } from "react";
import {
  Lock,
  User,
  Mail,
  Building,
  UserCog,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff,
  UserPlus,
  Edit,
  Trash2,
  X,
  Phone,
  MapPin,
  Home,
  Package,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import SuperNav from "../../components/SuperAdmin/SuperNav";
import { useEffect } from "react";

const CreateUser = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    role: "",
    companyName: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    city: "",
    address: "",
    package: "",
    customMembers: "",
  });
  const [isFocused, setIsFocused] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://test.vconstech.in";
      const response = await fetch(`${API_URL}/superadmin/users`);
      const data = await response.json();

      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Real-time validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    if (!/^\d+$/.test(phone)) return "Phone number must contain only digits";
    if (phone.length !== 10) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validatePassword = (password) => {
    if (!password) return "Password is required";
    if (password.length < 6) return "Password must be at least 6 characters";
    if (password.length > 50) return "Password must be less than 50 characters";
    return "";
  };

  const validateConfirmPassword = (password, confirmPassword) => {
    if (!confirmPassword) return "Please confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";
    return "";
  };

  const validateName = (name) => {
    if (!name) return "Name is required";
    if (name.length < 2) return "Name must be at least 2 characters";
    if (name.length > 100) return "Name must be less than 100 characters";
    return "";
  };

  const validateCompanyName = (companyName) => {
    if (!companyName) return "Company name is required";
    if (companyName.length < 2) return "Company name must be at least 2 characters";
    return "";
  };

  const validateCity = (city) => {
    if (!city) return "City is required";
    if (city.length < 2) return "City name must be at least 2 characters";
    return "";
  };

  const validateAddress = (address) => {
    if (!address) return "Address is required";
    if (address.length < 10) return "Please enter a complete address";
    return "";
  };

  const validateCustomMembers = (members) => {
    if (!members) return "Number of site engineers is required";
    const num = parseInt(members);
    if (isNaN(num) || num < 1) return "Must be at least 1";
    if (num > 1000) return "Must be less than 1000";
    return "";
  };

  // Handle field changes with validation
  const handleFieldChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
    
    // Clear field-specific error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors({ ...fieldErrors, [field]: "" });
    }
    
    // Real-time validation
    let error = "";
    switch (field) {
      case "email":
        error = validateEmail(value);
        break;
      case "phoneNumber":
        error = validatePhone(value);
        break;
      case "password":
        error = validatePassword(value);
        if (userData.confirmPassword) {
          const confirmError = validateConfirmPassword(value, userData.confirmPassword);
          setFieldErrors({ ...fieldErrors, confirmPassword: confirmError });
        }
        break;
      case "confirmPassword":
        error = validateConfirmPassword(userData.password, value);
        break;
      case "name":
        error = validateName(value);
        break;
      case "companyName":
        error = validateCompanyName(value);
        break;
      case "city":
        error = validateCity(value);
        break;
      case "address":
        error = validateAddress(value);
        break;
      case "customMembers":
        error = validateCustomMembers(value);
        break;
      default:
        break;
    }
    
    if (error) {
      setFieldErrors({ ...fieldErrors, [field]: error });
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});

    // Comprehensive validation
    const errors = {};
    
    errors.name = validateName(userData.name);
    errors.email = validateEmail(userData.email);
    errors.phoneNumber = validatePhone(userData.phoneNumber);
    errors.companyName = validateCompanyName(userData.companyName);
    errors.city = validateCity(userData.city);
    errors.address = validateAddress(userData.address);
    errors.password = validatePassword(userData.password);
    errors.confirmPassword = validateConfirmPassword(userData.password, userData.confirmPassword);

    if (!userData.role) errors.role = "Please select a role";
    if (!userData.package) errors.package = "Please select a package";
    
    if (userData.package === "Premium") {
      errors.customMembers = validateCustomMembers(userData.customMembers);
    }

    // Filter out empty errors
    const validErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== "")
    );

    if (Object.keys(validErrors).length > 0) {
      setFieldErrors(validErrors);
      setError("Please fix all validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://test.vconstech.in";

      const response = await fetch(`${API_URL}/superadmin/create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: userData.name,
          email: userData.email,
          role: userData.role,
          companyName: userData.companyName,
          password: userData.password,
          city: userData.city,
          phoneNumber: userData.phoneNumber,
          address: userData.address,
          package: userData.package,
          customMembers: userData.package === "Premium" ? userData.customMembers : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to create user");
      }

      setSuccess(data.message || "User created successfully!");
      setUserData({
        name: "",
        email: "",
        role: "",
        companyName: "",
        password: "",
        confirmPassword: "",
        phoneNumber: "",
        city: "",
        address: "",
        package: "",
        customMembers: "",
      });
      setFieldErrors({});
      fetchUsers();
    } catch (err) {
      console.error("Create user error:", err);
      setError(err.message || "An error occurred while creating the user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser({
      ...user,
      companyName: user.company?.name || "",
      password: "",
      confirmPassword: "",
    });
    setShowEditModal(true);
    setError("");
    setSuccess("");
    setFieldErrors({});
  };

  const handleUpdate = async () => {
    setError("");
    setSuccess("");
    setFieldErrors({});

    // Validation for edit
    const errors = {};
    
    errors.name = validateName(editingUser.name);
    errors.email = validateEmail(editingUser.email);
    errors.phoneNumber = validatePhone(editingUser.phoneNumber);
    errors.companyName = validateCompanyName(editingUser.companyName);
    errors.city = validateCity(editingUser.city);
    errors.address = validateAddress(editingUser.address);

    if (!editingUser.role) errors.role = "Please select a role";
    if (!editingUser.package) errors.package = "Please select a package";

    if (editingUser.package === "Premium") {
      errors.customMembers = validateCustomMembers(editingUser.customMembers);
    }

    if (editingUser.password) {
      errors.password = validatePassword(editingUser.password);
      errors.confirmPassword = validateConfirmPassword(editingUser.password, editingUser.confirmPassword);
    }

    // Filter out empty errors
    const validErrors = Object.fromEntries(
      Object.entries(errors).filter(([_, value]) => value !== "")
    );

    if (Object.keys(validErrors).length > 0) {
      setFieldErrors(validErrors);
      setError("Please fix all validation errors before updating");
      return;
    }

    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://test.vconstech.in";

      const response = await fetch(`${API_URL}/superadmin/update-user/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          companyName: editingUser.companyName,
          password: editingUser.password || undefined,
          city: editingUser.city,
          phoneNumber: editingUser.phoneNumber,
          address: editingUser.address,
          package: editingUser.package,
          customMembers: editingUser.package === "Premium" ? editingUser.customMembers : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to update user");
      }

      setSuccess(data.message || "User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
      setFieldErrors({});
      fetchUsers();
    } catch (err) {
      console.error("Update user error:", err);
      setError(err.message || "An error occurred while updating the user");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!userToDelete) return;

    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://test.vconstech.in";

      const response = await fetch(`${API_URL}/superadmin/delete-user/${userToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Failed to delete user");
      }

      setSuccess(data.message || "User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.message || "An error occurred while deleting the user");
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (field, focused) => {
    setIsFocused({ ...isFocused, [field]: focused });
  };

  const handleLogout = () => {
    navigate("/SuperAdmin/login");
  };

  const roles = ["Admin"];

  const renderInputField = (field, label, type, placeholder, icon, value, onChange) => {
    const Icon = icon;
    const hasError = fieldErrors[field];
    
    return (
      <div className="space-y-3">
        <label className="block text-sm font-bold text-gray-800 tracking-wide">
          {label} <span className="text-red-500">*</span>
        </label>
        <div
          className={`relative rounded-2xl transition-all duration-300 ${
            hasError
              ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20"
              : isFocused[field]
              ? "ring-2 ring-[#ffbe2a] shadow-lg shadow-[#ffbe2a]/20"
              : "ring-1 ring-gray-200 hover:ring-gray-300"
          }`}
        >
          <div className="flex items-center px-5 py-4 bg-gray-50 rounded-2xl">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                hasError
                  ? "bg-red-500 shadow-md"
                  : isFocused[field]
                  ? "bg-[#ffbe2a] shadow-md"
                  : "bg-white"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${
                  hasError
                    ? "text-white"
                    : isFocused[field]
                    ? "text-black"
                    : "text-gray-400"
                }`}
              />
            </div>
            <input
              type={type}
              value={value}
              onChange={(e) => onChange(field, e.target.value)}
              onFocus={() => handleFocus(field, true)}
              onBlur={() => handleFocus(field, false)}
              className="flex-1 ml-4 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
              placeholder={placeholder}
              disabled={loading}
            />
          </div>
        </div>
        {hasError && (
          <p className="text-red-500 text-xs font-medium mt-1 ml-1">{hasError}</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#ffbe2a] py-12 px-4">
      <SuperNav />

      <div className="max-w-6xl mx-auto pt-24 md:pt-32">
        {/* Header Section */}
        <div className="mb-10">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-[#fff] flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover:scale-105">
                <User className="w-10 h-10 text-black" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-white text-lg font-bold">+</span>
              </div>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Create New User
              </h1>
              <p className="text-gray-600 text-lg">
                Add a new user to the ERP system
              </p>
            </div>
          </div>
        </div>

        {/* Main Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-10">
            {/* Error Alert */}
            {error && (
              <div className="mb-8 p-5 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-start shadow-md">
                <div className="w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-bold text-red-900">{error}</p>
                </div>
              </div>
            )}

            {/* Success Alert */}
            {success && (
              <div className="mb-8 p-5 bg-green-50 border-l-4 border-green-500 rounded-2xl flex items-start shadow-md">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-bold text-green-900">{success}</p>
                </div>
              </div>
            )}

            {/* Form Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Client Name */}
              {renderInputField(
                "name",
                "Client Name",
                "text",
                "Enter full name",
                User,
                userData.name,
                handleFieldChange
              )}

              {/* Email */}
              {renderInputField(
                "email",
                "Email",
                "email",
                "Enter email address",
                Mail,
                userData.email,
                handleFieldChange
              )}

              {/* Contact Number */}
              {renderInputField(
                "phoneNumber",
                "Contact Number",
                "tel",
                "Enter 10-digit phone number",
                Phone,
                userData.phoneNumber,
                handleFieldChange
              )}

              {/* Role */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 tracking-wide">
                  Role <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded-2xl transition-all duration-300 ${
                    fieldErrors.role
                      ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20"
                      : isFocused.role
                      ? "ring-2 ring-[#ffbe2a] shadow-lg shadow-[#ffbe2a]/20"
                      : "ring-1 ring-gray-200 hover:ring-gray-300"
                  }`}
                >
                  <div className="flex items-center px-5 py-4 bg-gray-50 rounded-2xl">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        fieldErrors.role
                          ? "bg-red-500 shadow-md"
                          : isFocused.role
                          ? "bg-[#ffbe2a] shadow-md"
                          : "bg-white"
                      }`}
                    >
                      <UserCog
                        className={`w-5 h-5 ${
                          fieldErrors.role
                            ? "text-white"
                            : isFocused.role
                            ? "text-black"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <select
                      value={userData.role}
                      onChange={(e) => handleFieldChange("role", e.target.value)}
                      onFocus={() => handleFocus("role", true)}
                      onBlur={() => handleFocus("role", false)}
                      className="flex-1 ml-4 bg-transparent text-gray-900 outline-none font-medium cursor-pointer"
                      disabled={loading}
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {fieldErrors.role && (
                  <p className="text-red-500 text-xs font-medium mt-1 ml-1">{fieldErrors.role}</p>
                )}
              </div>

              {/* Company Name */}
              {renderInputField(
                "companyName",
                "Company Name",
                "text",
                "Enter company name",
                Building,
                userData.companyName,
                handleFieldChange
              )}

              {/* City */}
              {renderInputField(
                "city",
                "City",
                "text",
                "Enter city name",
                MapPin,
                userData.city,
                handleFieldChange
              )}

              {/* Package */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 tracking-wide">
                  Package <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded-2xl transition-all duration-300 ${
                    fieldErrors.package
                      ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20"
                      : isFocused.package
                      ? "ring-2 ring-[#ffbe2a] shadow-lg shadow-[#ffbe2a]/20"
                      : "ring-1 ring-gray-200 hover:ring-gray-300"
                  }`}
                >
                  <div className="flex items-center px-5 py-4 bg-gray-50 rounded-2xl">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        fieldErrors.package
                          ? "bg-red-500 shadow-md"
                          : isFocused.package
                          ? "bg-[#ffbe2a] shadow-md"
                          : "bg-white"
                      }`}
                    >
                      <Package
                        className={`w-5 h-5 ${
                          fieldErrors.package
                            ? "text-white"
                            : isFocused.package
                            ? "text-black"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <select
                      value={userData.package}
                      onChange={(e) => {
                        handleFieldChange("package", e.target.value);
                        setUserData({ ...userData, package: e.target.value, customMembers: "" });
                      }}
                      onFocus={() => handleFocus("package", true)}
                      onBlur={() => handleFocus("package", false)}
                      className="flex-1 ml-4 bg-transparent text-gray-900 outline-none font-medium cursor-pointer"
                      disabled={loading}
                    >
                      <option value="">Select package</option>
                      <option value="Classic">Classic (5 members)</option>
                      <option value="Pro">Pro (10 members)</option>
                      <option value="Premium">Premium (Custom members)</option>
                    </select>
                  </div>
                </div>
                {fieldErrors.package && (
                  <p className="text-red-500 text-xs font-medium mt-1 ml-1">{fieldErrors.package}</p>
                )}
              </div>

              {/* Custom Members */}
              {userData.package === "Premium" && (
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-gray-800 tracking-wide">
                    Number of Site Engineers <span className="text-red-500">*</span>
                  </label>
                  <div
                    className={`relative rounded-2xl transition-all duration-300 ${
                      fieldErrors.customMembers
                        ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20"
                        : isFocused.customMembers
                        ? "ring-2 ring-[#ffbe2a] shadow-lg shadow-[#ffbe2a]/20"
                        : "ring-1 ring-gray-200 hover:ring-gray-300"
                    }`}
                  >
                    <div className="flex items-center px-5 py-4 bg-gray-50 rounded-2xl">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                          fieldErrors.customMembers
                            ? "bg-red-500 shadow-md"
                            : isFocused.customMembers
                            ? "bg-[#ffbe2a] shadow-md"
                            : "bg-white"
                        }`}
                      >
                        <Users
                          className={`w-5 h-5 ${
                            fieldErrors.customMembers
                              ? "text-white"
                              : isFocused.customMembers
                              ? "text-black"
                              : "text-gray-400"
                          }`}
                        />
                      </div>
                      <input
                        type="number"
                        value={userData.customMembers}
                        onChange={(e) => handleFieldChange("customMembers", e.target.value)}
                        onFocus={() => handleFocus("customMembers", true)}
                        onBlur={() => handleFocus("customMembers", false)}
                        className="flex-1 ml-4 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                        placeholder="Enter number of site engineers"
                        min="1"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  {fieldErrors.customMembers && (
                    <p className="text-red-500 text-xs font-medium mt-1 ml-1">{fieldErrors.customMembers}</p>
                  )}
                </div>
              )}

              {/* Password */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 tracking-wide">
                  Password <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded-2xl transition-all duration-300 ${
                    fieldErrors.password
                      ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20"
                      : isFocused.password
                      ? "ring-2 ring-[#ffbe2a] shadow-lg shadow-[#ffbe2a]/20"
                      : "ring-1 ring-gray-200 hover:ring-gray-300"
                  }`}
                >
                  <div className="flex items-center px-5 py-4 bg-gray-50 rounded-2xl">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        fieldErrors.password
                          ? "bg-red-500 shadow-md"
                          : isFocused.password
                          ? "bg-[#ffbe2a] shadow-md"
                          : "bg-white"
                      }`}
                    >
                      <Lock
                        className={`w-5 h-5 ${
                          fieldErrors.password
                            ? "text-white"
                            : isFocused.password
                            ? "text-black"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={userData.password}
                      onChange={(e) => handleFieldChange("password", e.target.value)}
                      onFocus={() => handleFocus("password", true)}
                      onBlur={() => handleFocus("password", false)}
                      className="flex-1 ml-4 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                      placeholder="Min 6 characters"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs font-medium mt-1 ml-1">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-3">
                <label className="block text-sm font-bold text-gray-800 tracking-wide">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div
                  className={`relative rounded-2xl transition-all duration-300 ${
                    fieldErrors.confirmPassword
                      ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20"
                      : isFocused.confirmPassword
                      ? "ring-2 ring-[#ffbe2a] shadow-lg shadow-[#ffbe2a]/20"
                      : "ring-1 ring-gray-200 hover:ring-gray-300"
                  }`}
                >
                  <div className="flex items-center px-5 py-4 bg-gray-50 rounded-2xl">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        fieldErrors.confirmPassword
                          ? "bg-red-500 shadow-md"
                          : isFocused.confirmPassword
                          ? "bg-[#ffbe2a] shadow-md"
                          : "bg-white"
                      }`}
                    >
                      <Lock
                        className={`w-5 h-5 ${
                          fieldErrors.confirmPassword
                            ? "text-white"
                            : isFocused.confirmPassword
                            ? "text-black"
                            : "text-gray-400"
                        }`}
                      />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={userData.confirmPassword}
                      onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
                      onFocus={() => handleFocus("confirmPassword", true)}
                      onBlur={() => handleFocus("confirmPassword", false)}
                      className="flex-1 ml-4 bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium"
                      placeholder="Re-enter password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="text-red-500 text-xs font-medium mt-1 ml-1">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>

            {/* Address - Full Width */}
            <div className="space-y-3 mt-8">
              <label className="block text-sm font-bold text-gray-800 tracking-wide">
                Address <span className="text-red-500">*</span>
              </label>
              <div
                className={`relative rounded-2xl transition-all duration-300 ${
                  fieldErrors.address
                    ? "ring-2 ring-red-500 shadow-lg shadow-red-500/20"
                    : isFocused.address
                    ? "ring-2 ring-[#ffbe2a] shadow-lg shadow-[#ffbe2a]/20"
                    : "ring-1 ring-gray-200 hover:ring-gray-300"
                }`}
              >
                <div className="flex items-start px-5 py-4 bg-gray-50 rounded-2xl">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      fieldErrors.address
                        ? "bg-red-500 shadow-md"
                        : isFocused.address
                        ? "bg-[#ffbe2a] shadow-md"
                        : "bg-white"
                    }`}
                  >
                    <Home
                      className={`w-5 h-5 ${
                        fieldErrors.address
                          ? "text-white"
                          : isFocused.address
                          ? "text-black"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <textarea
                    value={userData.address}
                    onChange={(e) => handleFieldChange("address", e.target.value)}
                    rows={4}
                    onFocus={() => handleFocus("address", true)}
                    onBlur={() => handleFocus("address", false)}
                    className="flex-1 ml-4 w-full bg-transparent text-gray-900 placeholder-gray-400 outline-none font-medium resize-y"
                    placeholder="Enter full address"
                    disabled={loading}
                  />
                </div>
              </div>
              {fieldErrors.address && (
                <p className="text-red-500 text-xs font-medium mt-1 ml-1">{fieldErrors.address}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-5 mt-10">
              <button
                onClick={handleLogout}
                disabled={loading}
                className="flex-1 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-2xl transition-all duration-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-[#ffbe2a] text-black font-bold py-4 rounded-2xl transition-all duration-200 hover:shadow-2xl shadow-[#ffbe2a]/30 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating User...
                  </span>
                ) : (
                  "Create User"
                )}
              </button>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-lg shadow-md mt-8">
              <div className="overflow-x-auto">
                <table className="border w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Role
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Company
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        City
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Package
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Members
                      </th>
                      <th className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan="9" className="border-2 border-[#ffbe2a] p-8 text-center">
                          <div className="flex items-center justify-center">
                            <svg
                              className="animate-spin h-8 w-8 text-[#ffbe2a]"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span className="ml-3 text-gray-600">Loading users...</span>
                          </div>
                        </td>
                      </tr>
                    ) : users.length === 0 ? (
                      <tr>
                        <td
                          colSpan="9"
                          className="border-2 border-[#ffbe2a] p-8 text-center text-gray-500"
                        >
                          No users found
                        </td>
                      </tr>
                    ) : (
                      users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                          <td className="border-2 border-[#ffbe2a] p-3">{user.name}</td>
                          <td className="border-2 border-[#ffbe2a] p-3">{user.email}</td>
                          <td className="border-2 border-[#ffbe2a] p-3">{user.phoneNumber}</td>
                          <td className="border-2 border-[#ffbe2a] p-3">
                            {user.role.replace("_", " ")}
                          </td>
                          <td className="border-2 border-[#ffbe2a] p-3">
                            {user.company?.name || "N/A"}
                          </td>
                          <td className="border-2 border-[#ffbe2a] p-3">{user.city}</td>
                          <td className="border-2 border-[#ffbe2a] p-3">{user.package || "N/A"}</td>
                          <td className="border-2 border-[#ffbe2a] p-3">
                            {user.package === "Classic"
                              ? "5"
                              : user.package === "Pro"
                              ? "10"
                              : user.customMembers || "N/A"}
                          </td>
                          <td className="border-2 border-[#ffbe2a] p-3">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                title="Edit User"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(user)}
                                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                title="Delete User"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-gray-900">Edit User</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setError("");
                    setFieldErrors({});
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Error Alert in Modal */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <p className="ml-3 text-sm font-medium text-red-900">{error}</p>
                </div>
              )}

              {/* Edit Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Client Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.name ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                      placeholder="Enter full name"
                    />
                  </div>
                  {fieldErrors.name && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.name}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Mail className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={editingUser.email}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, email: e.target.value })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.email ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                      placeholder="Enter email address"
                    />
                  </div>
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.email}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Contact Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Phone className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      value={editingUser.phoneNumber}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, phoneNumber: e.target.value })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.phoneNumber ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                      placeholder="Enter phone number"
                    />
                  </div>
                  {fieldErrors.phoneNumber && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.phoneNumber}</p>
                  )}
                </div>

                {/* Role */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Role <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <UserCog className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      value={editingUser.role}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, role: e.target.value })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.role ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none cursor-pointer`}
                    >
                      <option value="">Select role</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                  {fieldErrors.role && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.role}</p>
                  )}
                </div>

                {/* Company */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Building className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={editingUser.companyName}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, companyName: e.target.value })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.companyName ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                      placeholder="Enter company name"
                    />
                  </div>
                  {fieldErrors.companyName && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.companyName}</p>
                  )}
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    City <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={editingUser.city}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, city: e.target.value })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.city ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                      placeholder="Enter city"
                    />
                  </div>
                  {fieldErrors.city && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.city}</p>
                  )}
                </div>

                {/* Package */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Package <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      value={editingUser.package}
                      onChange={(e) =>
                        setEditingUser({
                          ...editingUser,
                          package: e.target.value,
                          customMembers: "",
                        })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.package ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none cursor-pointer`}
                    >
                      <option value="">Select package</option>
                      <option value="Classic">Classic (5 members)</option>
                      <option value="Pro">Pro (10 members)</option>
                      <option value="Premium">Premium (Custom members)</option>
                    </select>
                  </div>
                  {fieldErrors.package && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.package}</p>
                  )}
                </div>

                {/* Custom Members */}
                {editingUser.package === "Premium" && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-800">
                      Number of Site Engineers <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Users className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={editingUser.customMembers}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, customMembers: e.target.value })
                        }
                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                          fieldErrors.customMembers ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                        placeholder="Enter number"
                        min="1"
                      />
                    </div>
                    {fieldErrors.customMembers && (
                      <p className="text-red-500 text-xs font-medium">{fieldErrors.customMembers}</p>
                    )}
                  </div>
                )}

                {/* Password (Optional) */}
                <div className="space-y-2">
                  <label className="block text-sm font-bold text-gray-800">
                    New Password <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      value={editingUser.password || ""}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, password: e.target.value })
                      }
                      className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                        fieldErrors.password ? "border-red-500" : "border-gray-200"
                      } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                      placeholder="New password"
                    />
                  </div>
                  {fieldErrors.password && (
                    <p className="text-red-500 text-xs font-medium">{fieldErrors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                {editingUser.password && (
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-800">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={editingUser.confirmPassword || ""}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, confirmPassword: e.target.value })
                        }
                        className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                          fieldErrors.confirmPassword ? "border-red-500" : "border-gray-200"
                        } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`}
                        placeholder="Confirm password"
                      />
                    </div>
                    {fieldErrors.confirmPassword && (
                      <p className="text-red-500 text-xs font-medium">{fieldErrors.confirmPassword}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="space-y-2 mt-6">
                <label className="block text-sm font-bold text-gray-800">
                  Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-3">
                    <Home className="w-5 h-5 text-gray-400" />
                  </div>
                  <textarea
                    value={editingUser.address}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, address: e.target.value })
                    }
                    rows={4}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                      fieldErrors.address ? "border-red-500" : "border-gray-200"
                    } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none resize-y`}
                    placeholder="Enter full address"
                  />
                </div>
                {fieldErrors.address && (
                  <p className="text-red-500 text-xs font-medium">{fieldErrors.address}</p>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    setError("");
                    setFieldErrors({});
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex-1 bg-[#ffbe2a] text-black font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? "Updating..." : "Update User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Delete User</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete <span className="font-semibold">{userToDelete.name}</span>? This action cannot be undone.
              </p>

              <div className="flex gap-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white font-bold py-3 rounded-xl hover:bg-red-600 transition-colors disabled:opacity-50"
                >
                  {loading ? "Deleting..." : "Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateUser;