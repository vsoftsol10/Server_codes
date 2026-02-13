import React, { useState, useEffect } from "react";
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Home,
  Package,
  Users,
  Edit2,
  Lock,
  Save,
  X,
  Upload,
  Image,
} from "lucide-react"; // ✅ Add Upload and Image icons
import Navbar from "../../components/common/Navbar";
import SidePannel from "../../components/common/SidePannel";

// InfoField component - pass all required props
const InfoField = ({
  icon: Icon,
  label,
  value,
  editable,
  field,
  isEditing,
  editedUser,
  setEditedUser,
}) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
      {label}
    </label>
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <div className="w-10 h-10 rounded-lg bg-[#ffbe2a] flex items-center justify-center">
        <Icon className="w-5 h-5 text-black" />
      </div>
    {isEditing && editable ? (
  field === "address" ? (
    <textarea
      value={editedUser[field] || ""}
      onChange={(e) =>
        setEditedUser({ ...editedUser, [field]: e.target.value })
      }
      className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ffbe2a] outline-none text-sm"
      rows={3}
    />
  ) : (
    <input
      type={
        field === "email"
          ? "email"
          : field === "phoneNumber"
            ? "tel"
            : "text"
      }
      value={editedUser[field] || ""}
      onChange={(e) =>
        setEditedUser({ ...editedUser, [field]: e.target.value })
      }
      className="flex-1 min-w-0 bg-white border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#ffbe2a] outline-none text-sm"
    />
  )
) : (
  <p className="flex-1 min-w-0 text-gray-900 font-medium break-words text-sm">
    {value || "Not provided"}
  </p>
)}
    </div>
  </div>
);
const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // ✅ NEW: Logo upload states
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      if (!userId) {
        setError("User not logged in");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/users/profile/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setUserInfo(data.user);
        setEditedUser(data.user);

        // ✅ Update localStorage with fresh data
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        if (data.user.phoneNumber)
          localStorage.setItem("userPhone", data.user.phoneNumber);
        if (data.user.city) localStorage.setItem("userCity", data.user.city);
        if (data.user.company?.name)
          localStorage.setItem("companyName", data.user.company.name);
      } else {
        setError(data.error || "Failed to load profile");
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError("An error occurred while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB");
        return;
      }

      setLogoFile(file);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ NEW: Upload logo
  const handleLogoUpload = async () => {
    if (!logoFile) {
      setError("Please select a logo file");
      return;
    }

    setUploadingLogo(true);
    setError("");
    setSuccess("");

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("logo", logoFile);

      const response = await fetch(`${API_URL}/users/upload-logo/${userId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSuccess("Logo uploaded successfully!");
        setLogoFile(null);
        setLogoPreview(null);

        // Refresh profile to get new logo
        await fetchUserProfile();

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to upload logo");
      }
    } catch (err) {
      console.error("Logo upload error:", err);
      setError("An error occurred while uploading logo");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({
      ...userInfo,
      companyName: userInfo.company?.name || "",
    });
    setError("");
    setSuccess("");
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedUser({ ...userInfo });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/users/profile/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editedUser.name,
          email: editedUser.email,
          phoneNumber: editedUser.phoneNumber,
          city: editedUser.city,
          address: editedUser.address,
          companyName: editedUser.companyName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setUserInfo(data.user);
        setEditedUser(data.user);
        setIsEditing(false);
        setSuccess("Profile updated successfully!");

        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        if (data.user.company?.name) {
          localStorage.setItem("companyName", data.user.company.name);

          // ✅ IMPORTANT: Dispatch custom event to notify Navbar
          window.dispatchEvent(new Event("companyNameUpdated"));
        }

        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error("Update error:", err);
      setError("An error occurred while updating your profile");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const API_URL =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";
      const userId = localStorage.getItem("userId");
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_URL}/users/change-password/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        },
      );

      const data = await response.json();

      if (data.success) {
        setSuccess("Password changed successfully!");
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (err) {
      console.error("Password change error:", err);
      setError("An error occurred while changing password");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="fixed top-0 left-0 right-0 z-50 h-16">
          <Navbar />
        </nav>

        <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
          <SidePannel />
        </aside>

        <div className="pt-20 pl-16 md:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#ffbe2a] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <nav className="fixed top-0 left-0 right-0 z-50 h-16">
          <Navbar />
        </nav>

        <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
          <SidePannel />
        </aside>

        <div className="pt-20 pl-16 md:pl-64 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600 text-lg">Failed to load profile</p>
            <button
              onClick={fetchUserProfile}
              className="mt-4 px-6 py-2 bg-[#ffbe2a] text-black font-semibold rounded-lg hover:shadow-lg"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") ||
    "http://localhost:5000";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="pt-20 pl-16 md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
                <p className="text-gray-600 mt-1">
                  Manage your account information
                </p>
              </div>
              {!isEditing ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 px-6 py-3 bg-[#ffbe2a] text-black font-semibold rounded-xl hover:shadow-lg transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-3 bg-[#ffbe2a] text-black font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              )}
            </div>

            {/* Alerts */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-xl">
                <p className="text-sm font-medium text-green-900">{success}</p>
              </div>
            )}

            {/* Profile Card */}
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
              {/* Profile Header */}

              <div className="bg-[#ffbe2a]  p-8">
                <div className="flex items-center gap-6">
                  {/* Company Logo or Default User Icon */}
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden">
                    {userInfo.company?.logo ? (
                      <img
                        src={`${API_BASE_URL}${userInfo.company.logo}`}
                        alt="Company logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <User className="w-12 h-12 text-[#ffbe2a]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-gray-900">
                      {userInfo.name}
                    </h2>
                    <p className="text-gray-700 font-medium mt-1">
                      {userInfo.role?.replace("_", " ")}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Building className="w-4 h-4 text-gray-700" />
                      <span className="text-gray-700 font-medium">
                        {userInfo.company?.name || "No Company"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  Personal Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField
                    icon={User}
                    label="Full Name"
                    value={userInfo.name}
                    editable={true}
                    field="name"
                    isEditing={isEditing}
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                  />
                  <InfoField
                    icon={Mail}
                    label="Email Address"
                    value={userInfo.email}
                    editable={true}
                    field="email"
                    isEditing={isEditing}
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                  />
                  <InfoField
                    icon={Phone}
                    label="Phone Number"
                    value={userInfo.phoneNumber}
                    editable={true}
                    field="phoneNumber"
                    isEditing={isEditing}
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                  />
                  <InfoField
                    icon={MapPin}
                    label="City"
                    value={userInfo.city}
                    editable={true}
                    field="city"
                    isEditing={isEditing}
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                  />
                  <InfoField
                    icon={Building}
                    label="Company"
                    value={userInfo.company?.name}
                    editable={true}
                    field="companyName"
                    isEditing={isEditing}
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                  />
                  <InfoField
                    icon={Package}
                    label="Package"
                    value={userInfo.package}
                    editable={false}
                    isEditing={isEditing}
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                  />
                  {userInfo.package === "Premium" && userInfo.customMembers && (
                    <InfoField
                      icon={Users}
                      label="Site Engineers"
                      value={userInfo.customMembers}
                      editable={false}
                      isEditing={isEditing}
                      editedUser={editedUser}
                      setEditedUser={setEditedUser}
                    />
                  )}
                </div>

                <div className="mt-6">
                  <InfoField
                    icon={Home}
                    label="Address"
                    value={userInfo.address}
                    editable={true}
                    field="address"
                    isEditing={isEditing}
                    editedUser={editedUser}
                    setEditedUser={setEditedUser}
                  />
                </div>
              </div>

            
 {/* ✅ NEW: Company Logo Section (Admin Only) */}
{userInfo.role === "Admin" && (
  <div className="border-t border-gray-200 p-4 sm:p-6 lg:p-8">
    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">
      Company Logo
    </h3>

    <div className="flex flex-col md:flex-row gap-4 sm:gap-6 items-start">
      {/* Current Logo Display */}
      <div className="flex-shrink-0 w-full md:w-auto">
        <div className="w-full max-w-[200px] h-48 sm:w-48 sm:h-48 mx-auto md:mx-0 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                        {logoPreview ? (
                          <img
                            src={logoPreview}
                            alt="Logo preview"
                            className="w-full h-full object-contain"
                          />
                        ) : userInfo.company?.logo ? (
                          <img
                            src={`${API_BASE_URL}${userInfo.company.logo}`}
                            alt="Company logo"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="text-center text-gray-400">
                            <Image className="w-16 h-16 mx-auto mb-2" />
                            <p className="text-sm">No logo uploaded</p>
                          </div>
                        )}
                      </div>
                    </div>
{/* Upload Controls */}
<div className="flex-1 w-full">
  <div className="space-y-4">
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        Upload New Logo
      </label>
      <input
        type="file"
        accept="image/*"
        onChange={handleLogoChange}
        className="block w-full text-xs sm:text-sm text-gray-500
          file:mr-2 sm:file:mr-4 file:py-2 file:px-3 sm:file:px-4
          file:rounded-lg file:border-0
          file:text-xs sm:file:text-sm file:font-semibold
          file:bg-[#ffbe2a] file:text-black
          hover:file:bg-[#ffa500]
          cursor-pointer"
      />
      <p className="mt-2 text-xs sm:text-sm text-gray-500">
        Accepted formats: JPG, PNG, GIF, WebP (Max 5MB)
      </p>
    </div>

    {logoFile && (
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleLogoUpload}
          disabled={uploadingLogo}
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 bg-[#ffbe2a] text-black font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm"
        >
          <Upload className="w-4 h-4" />
          {uploadingLogo ? "Uploading..." : "Upload Logo"}
        </button>
        <button
          onClick={() => {
            setLogoFile(null);
            setLogoPreview(null);
          }}
          disabled={uploadingLogo}
          className="px-4 sm:px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50 text-sm"
        >
          Cancel
        </button>
      </div>
    )}
  </div>
</div>
                  </div>
                </div>
              )}
{/* Security Section */}
<div className="border-t border-gray-200 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Security
                    </h3>
                    <p className="text-gray-600 text-sm mt-1">
                      Manage your password
                    </p>
                  </div>
                  {!showPasswordChange && (
                    <button
                      onClick={() => setShowPasswordChange(true)}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      <Lock className="w-4 h-4" />
                      Change Password
                    </button>
                  )}
                </div>

                {showPasswordChange && (
                  <div className="bg-gray-50 rounded-xl p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            currentPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                        placeholder="Enter current password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            newPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                        placeholder="Enter new password"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({
                            ...passwordData,
                            confirmPassword: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
                        placeholder="Confirm new password"
                      />
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={() => {
                          setShowPasswordChange(false);
                          setPasswordData({
                            currentPassword: "",
                            newPassword: "",
                            confirmPassword: "",
                          });
                          setError("");
                        }}
                        disabled={saving}
                        className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all disabled:opacity-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handlePasswordChange}
                        disabled={saving}
                        className="flex-1 px-4 py-3 bg-[#ffbe2a] text-black font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {saving ? "Changing..." : "Change Password"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;