import React from "react";

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

export default InfoField;