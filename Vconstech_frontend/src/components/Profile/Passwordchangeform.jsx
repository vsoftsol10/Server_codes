import React, { useState } from "react";
import { Lock } from "lucide-react";

const PasswordChangeForm = ({ onError, onSuccess }) => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      onError("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      onError("Password must be at least 6 characters");
      return;
    }

    setSaving(true);

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
        }
      );

      const data = await response.json();

      if (data.success) {
        onSuccess("Password changed successfully!");
        setShowPasswordChange(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        onError(data.error || "Failed to change password");
      }
    } catch (err) {
      console.error("Password change error:", err);
      onError("An error occurred while changing password");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setShowPasswordChange(false);
    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    onError("");
  };

  return (
    <div className="border-t border-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Security</h3>
          <p className="text-gray-600 text-sm mt-1">Manage your password</p>
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
                setPasswordData({ ...passwordData, currentPassword: e.target.value })
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
                setPasswordData({ ...passwordData, newPassword: e.target.value })
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
                setPasswordData({ ...passwordData, confirmPassword: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffbe2a] outline-none"
              placeholder="Confirm new password"
            />
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCancel}
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
  );
};

export default PasswordChangeForm;