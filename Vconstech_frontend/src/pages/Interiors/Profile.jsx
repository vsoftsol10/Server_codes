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
  Save,
  X,
  FileText,
} from "lucide-react";
import Navbar from "../../components/common/Navbar";
import SidePannel from "../../components/common/SidePannel";
import InfoField from "../../components/Profile/InfoField";
import ProfileHeader from "../../components/Profile/ProfileHeader";
import CompanyLogoUpload from "../../components/Profile/CompanyLogoUpload";
import PasswordChangeForm from "../../components/Profile/PasswordChangeForm";

const Profile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const API_BASE_URL =
    import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

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
        localStorage.setItem("userName", data.user.name);
        localStorage.setItem("userEmail", data.user.email);
        if (data.user.phoneNumber)
          localStorage.setItem("userPhone", data.user.phoneNumber);
        if (data.user.city)
          localStorage.setItem("userCity", data.user.city);
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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedUser({ ...userInfo, companyName: userInfo.company?.name || "" });
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
          gstNumber: editedUser.gstNumber,
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
          window.dispatchEvent(new Event("companyNameUpdated"));
        }
        window.dispatchEvent(new Event("profileUpdated"));
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

  const handleLogoUploadSuccess = async () => {
    setSuccess("Logo uploaded successfully!");
    await fetchUserProfile();
    window.dispatchEvent(new Event("profileUpdated"));
    setTimeout(() => setSuccess(""), 3000);
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
                <p className="text-gray-600 mt-1">Manage your account information</p>
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

              <ProfileHeader userInfo={userInfo} apiBaseUrl={API_BASE_URL} />

              {/* Personal Information */}
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InfoField icon={User} label="Full Name" value={userInfo.name} editable field="name" isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  <InfoField icon={Mail} label="Email Address" value={userInfo.email} editable field="email" isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  <InfoField icon={Phone} label="Phone Number" value={userInfo.phoneNumber} editable field="phoneNumber" isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  <InfoField icon={MapPin} label="City" value={userInfo.city} editable field="city" isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  <InfoField icon={FileText} label="GST Number" value={userInfo.gstNumber} editable field="gstNumber" isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  <InfoField icon={Building} label="Company" value={userInfo.company?.name} editable field="companyName" isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  <InfoField icon={Package} label="Package" value={userInfo.package} editable={false} isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  {userInfo.package === "Premium" && userInfo.customMembers && (
                    <InfoField icon={Users} label="Site Engineers" value={userInfo.customMembers} editable={false} isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                  )}
                </div>

                <div className="mt-6">
                  <InfoField icon={Home} label="Address" value={userInfo.address} editable field="address" isEditing={isEditing} editedUser={editedUser} setEditedUser={setEditedUser} />
                </div>
              </div>

              {/* Company Logo (Admin Only) */}
              {userInfo.role === "Admin" && (
                <CompanyLogoUpload
                  userInfo={userInfo}
                  apiBaseUrl={API_BASE_URL}
                  onUploadSuccess={handleLogoUploadSuccess}
                  onError={setError}
                />
              )}

              {/* Security */}
              <PasswordChangeForm onError={setError} onSuccess={(msg) => { setSuccess(msg); setTimeout(() => setSuccess(""), 3000); }} />

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;