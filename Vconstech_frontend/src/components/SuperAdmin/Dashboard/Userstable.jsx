import React, { useState } from "react";
import { Edit, Trash2, Download, Loader2 } from "lucide-react";

const UsersTable = ({ users, loading, onEdit, onDelete }) => {
  const [downloadingId, setDownloadingId] = useState(null);

  const getMemberCount = (user) => {
    if (user.package === "Classic") return "5";
    if (user.package === "Pro") return "10";
    return user.customMembers || "N/A";
  };

  const handleDownload = async (user) => {
    setDownloadingId(user.id);
    try {
      const token = localStorage.getItem("token") || "";
      const response = await fetch(`/api/superadmin/users/${user.id}/export`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || "Download failed");
      }

      // Stream blob and trigger browser download
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = (user.name || "user").replace(/[^a-z0-9]/gi, "_");
      a.href = url;
      a.download = `${safeName}_data_${new Date().toISOString().split("T")[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download error:", error);
      alert(`Failed to download data: ${error.message}`);
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-8 overflow-x-auto">
      <table className="border w-full">
        <thead className="bg-gray-100">
          <tr>
            {[
              "Name",
              "Email",
              "Phone",
              "Role",
              "Company",
              "City",
              "Package",
              "Members",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                className="border-2 border-[#ffbe2a] p-3 text-left font-semibold text-gray-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan="9"
                className="border-2 border-[#ffbe2a] p-8 text-center"
              >
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
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
              <tr
                key={user.id}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="border-2 border-[#ffbe2a] p-3">{user.name}</td>
                <td className="border-2 border-[#ffbe2a] p-3">{user.email}</td>
                <td className="border-2 border-[#ffbe2a] p-3">
                  {user.phoneNumber}
                </td>
                <td className="border-2 border-[#ffbe2a] p-3">
                  {user.role.replace("_", " ")}
                </td>
                <td className="border-2 border-[#ffbe2a] p-3">
                  {user.company?.name || "N/A"}
                </td>
                <td className="border-2 border-[#ffbe2a] p-3">{user.city}</td>
                <td className="border-2 border-[#ffbe2a] p-3">
                  {user.package || "N/A"}
                </td>
                <td className="border-2 border-[#ffbe2a] p-3">
                  {getMemberCount(user)}
                </td>
                <td className="border-2 border-[#ffbe2a] p-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => onEdit(user)}
                      className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      title="Edit User"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(user)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDownload(user)}
                      disabled={downloadingId === user.id}
                      className={`p-2 text-white rounded-lg transition-colors flex items-center justify-center ${
                        downloadingId === user.id
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-500 hover:bg-green-600"
                      }`}
                      title="Download User Data as Excel"
                    >
                      {downloadingId === user.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;