import React from "react";
import {
  X, AlertCircle, User, Mail, Phone, UserCog,
  Building, MapPin, Package, Users, Lock, Home,
} from "lucide-react";

const ROLES = [{ value: "Admin", label: "Admin" }];
const PACKAGES = [
  { value: "Classic", label: "Classic (5 members)" },
  { value: "Pro", label: "Pro (10 members)" },
  { value: "Premium", label: "Premium (Custom members)" },
];

const Field = ({ label, required = true, error, children }) => (
  <div className="space-y-2">
    <label className="block text-sm font-bold text-gray-800">
      {label}{" "}
      {required && <span className="text-red-500">*</span>}
      {!required && <span className="text-gray-500 text-xs">(Leave blank to keep current)</span>}
    </label>
    {children}
    {error && <p className="text-red-500 text-xs font-medium">{error}</p>}
  </div>
);

const inputClass = (hasError) =>
  `w-full pl-12 pr-4 py-3 bg-gray-50 border ${
    hasError ? "border-red-500" : "border-gray-200"
  } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none`;

const IconWrap = ({ icon: Icon }) => (
  <div className="absolute left-3 top-1/2 -translate-y-1/2">
    <Icon className="w-5 h-5 text-gray-400" />
  </div>
);

const EditUserModal = ({ user, loading, error, fieldErrors, onChange, onUpdate, onClose }) => {
  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Edit User</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
              <p className="ml-3 text-sm font-medium text-red-900">{error}</p>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <Field label="Client Name" error={fieldErrors.name}>
              <div className="relative">
                <IconWrap icon={User} />
                <input type="text" value={user.name} onChange={(e) => onChange("name", e.target.value)}
                  className={inputClass(fieldErrors.name)} placeholder="Enter full name" />
              </div>
            </Field>

            {/* Email */}
            <Field label="Email" error={fieldErrors.email}>
              <div className="relative">
                <IconWrap icon={Mail} />
                <input type="email" value={user.email} onChange={(e) => onChange("email", e.target.value)}
                  className={inputClass(fieldErrors.email)} placeholder="Enter email address" />
              </div>
            </Field>

            {/* Phone */}
            <Field label="Contact Number" error={fieldErrors.phoneNumber}>
              <div className="relative">
                <IconWrap icon={Phone} />
                <input type="tel" value={user.phoneNumber} onChange={(e) => onChange("phoneNumber", e.target.value)}
                  className={inputClass(fieldErrors.phoneNumber)} placeholder="Enter phone number" />
              </div>
            </Field>

            {/* Role */}
            <Field label="Role" error={fieldErrors.role}>
              <div className="relative">
                <IconWrap icon={UserCog} />
                <select value={user.role} onChange={(e) => onChange("role", e.target.value)}
                  className={inputClass(fieldErrors.role)}>
                  <option value="">Select role</option>
                  {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </Field>

            {/* Company */}
            <Field label="Company Name" error={fieldErrors.companyName}>
              <div className="relative">
                <IconWrap icon={Building} />
                <input type="text" value={user.companyName} onChange={(e) => onChange("companyName", e.target.value)}
                  className={inputClass(fieldErrors.companyName)} placeholder="Enter company name" />
              </div>
            </Field>

            {/* City */}
            <Field label="City" error={fieldErrors.city}>
              <div className="relative">
                <IconWrap icon={MapPin} />
                <input type="text" value={user.city} onChange={(e) => onChange("city", e.target.value)}
                  className={inputClass(fieldErrors.city)} placeholder="Enter city" />
              </div>
            </Field>

            {/* Package */}
            <Field label="Package" error={fieldErrors.package}>
              <div className="relative">
                <IconWrap icon={Package} />
                <select value={user.package}
                  onChange={(e) => onChange("package", e.target.value)}
                  className={inputClass(fieldErrors.package)}>
                  <option value="">Select package</option>
                  {PACKAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </Field>

            {/* Custom Members */}
            {user.package === "Premium" && (
              <Field label="Number of Site Engineers" error={fieldErrors.customMembers}>
                <div className="relative">
                  <IconWrap icon={Users} />
                  <input type="number" value={user.customMembers} onChange={(e) => onChange("customMembers", e.target.value)}
                    className={inputClass(fieldErrors.customMembers)} placeholder="Enter number" min="1" />
                </div>
              </Field>
            )}

            {/* Password */}
            <Field label="New Password" required={false} error={fieldErrors.password}>
              <div className="relative">
                <IconWrap icon={Lock} />
                <input type="password" value={user.password || ""} onChange={(e) => onChange("password", e.target.value)}
                  className={inputClass(fieldErrors.password)} placeholder="New password" />
              </div>
            </Field>

            {/* Confirm Password */}
            {user.password && (
              <Field label="Confirm New Password" error={fieldErrors.confirmPassword}>
                <div className="relative">
                  <IconWrap icon={Lock} />
                  <input type="password" value={user.confirmPassword || ""} onChange={(e) => onChange("confirmPassword", e.target.value)}
                    className={inputClass(fieldErrors.confirmPassword)} placeholder="Confirm password" />
                </div>
              </Field>
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
              <textarea value={user.address} onChange={(e) => onChange("address", e.target.value)}
                rows={4} placeholder="Enter full address"
                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border ${
                  fieldErrors.address ? "border-red-500" : "border-gray-200"
                } rounded-xl focus:ring-2 focus:ring-[#ffbe2a] outline-none resize-y`} />
            </div>
            {fieldErrors.address && <p className="text-red-500 text-xs font-medium">{fieldErrors.address}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8">
            <button onClick={onClose} disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 font-bold py-3 rounded-xl hover:bg-gray-300 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button onClick={onUpdate} disabled={loading}
              className="flex-1 bg-[#ffbe2a] text-black font-bold py-3 rounded-xl hover:shadow-lg transition-all disabled:opacity-50">
              {loading ? "Updating..." : "Update User"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;