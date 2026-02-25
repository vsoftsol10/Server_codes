import React, { useState, useEffect } from "react";
import { Users } from "lucide-react";
import SuperNav from "../../components/SuperAdmin/SuperNav";
import UsersTable from "../../components/SuperAdmin/Dashboard/UsersTable";
import EditUserModal from "../../components/SuperAdmin/Dashboard/EditUserModal";
import DeleteUserModal from "../../components/SuperAdmin/Dashboard/DeleteUserModal";
import { validateEditForm } from "../../components/SuperAdmin/Dashboard/validation";

const API_URL = import.meta.env.VITE_API_URL || "https://test.vconstech.in";

const UsersPage = () => {
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

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/users`);
      const data = await res.json();
      if (data.success) {
        setUsers([...data.users].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleEdit = (user) => {
    setEditingUser({ ...user, companyName: user.company?.name || "", password: "", confirmPassword: "" });
    setShowEditModal(true);
    setError("");
    setFieldErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditingUser((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleUpdate = async () => {
    setError("");
    const errors = validateEditForm(editingUser);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setError("Please fix all validation errors before updating");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/update-user/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...editingUser,
          password: editingUser.password || undefined,
          customMembers: editingUser.package === "Premium" ? editingUser.customMembers : null,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to update user");
      setSuccess(data.message || "User updated successfully!");
      setShowEditModal(false);
      setEditingUser(null);
      setFieldErrors({});
      fetchUsers();
    } catch (err) {
      setError(err.message || "An error occurred while updating the user");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!userToDelete) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/superadmin/delete-user/${userToDelete.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || "Failed to delete user");
      setSuccess(data.message || "User deleted successfully!");
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers();
    } catch (err) {
      setError(err.message || "An error occurred while deleting the user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#ffbe2a] py-12 px-4">
      <SuperNav />

      <div className="max-w-7xl mx-auto pt-24 md:pt-25">
        {/* Header */}
        <div className="mb-10 flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-xl transform transition-all duration-300 group-hover:scale-105">
              <Users className="w-10 h-10 text-black" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">All Users</h1>
            <p className="text-gray-600 text-lg">Manage all users in the ERP system</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-5 bg-red-50 border-l-4 border-red-500 rounded-2xl flex items-start shadow-md">
            <p className="text-sm font-bold text-red-900">{error}</p>
          </div>
        )}
        {success && (
          <div className="mb-6 p-5 bg-green-50 border-l-4 border-green-500 rounded-2xl flex items-start shadow-md">
            <p className="text-sm font-bold text-green-900">{success}</p>
          </div>
        )}

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-10">
            <UsersTable
              users={users}
              loading={loadingUsers}
              onEdit={handleEdit}
              onDelete={(user) => { setUserToDelete(user); setShowDeleteModal(true); }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditUserModal
          user={editingUser}
          loading={loading}
          error={error}
          fieldErrors={fieldErrors}
          onChange={handleEditChange}
          onUpdate={handleUpdate}
          onClose={() => { setShowEditModal(false); setEditingUser(null); setError(""); setFieldErrors({}); }}
        />
      )}

      {showDeleteModal && (
        <DeleteUserModal
          user={userToDelete}
          loading={loading}
          onConfirm={handleDelete}
          onCancel={() => { setShowDeleteModal(false); setUserToDelete(null); }}
        />
      )}
    </div>
  );
};

export default UsersPage;