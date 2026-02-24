import React from "react";
import { User, Building } from "lucide-react";

const ProfileHeader = ({ userInfo, apiBaseUrl }) => (
  <div className="bg-[#ffbe2a] p-8">
    <div className="flex items-center gap-6">
      <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-lg overflow-hidden">
        {userInfo.company?.logo ? (
          <img
            src={`${apiBaseUrl}${userInfo.company.logo}`}
            alt="Company logo"
            className="w-full h-full object-contain p-2"
          />
        ) : (
          <User className="w-12 h-12 text-[#ffbe2a]" />
        )}
      </div>
      <div className="flex-1">
        <h2 className="text-3xl font-bold text-gray-900">{userInfo.name}</h2>
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
);

export default ProfileHeader;