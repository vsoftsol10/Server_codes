import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import project from "../../assets/Icon/ProjectManagement.png";
import material from "../../assets/Icon/MaterialManagement.png";
import financial from "../../assets/Icon/FinancialManagement.png";
import contract from "../../assets/Icon/ContractManagement.png";
import file from "../../assets/Icon/FileManagement.png";
import labourManage from "../../assets/Icon/LabourManagement.png";
import AddEngg from "../../assets/Icon/AddEngg.png";
import { LogOut, X } from "lucide-react";

const SidePannel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Icons
  const dashboardicon = (
    <svg className="w-6 h-6" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5Zm16 14a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2ZM4 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6Zm16-2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6Z" />
    </svg>
  );

  const projectIcon = (
    <img src={project} alt="Project Management" className="w-6 h-6 object-contain" />
  );

  const materialIcon = (
    <img src={material} alt="Material Management" className="w-6 h-6 object-contain" />
  );

  const financialIcon = (
    <img src={financial} alt="Financial Management" className="w-6 h-6 object-contain" />
  );

  const contractIcon = (
    <img src={contract} alt="Contract Management" className="w-6 h-6 object-contain" />
  );

  const fileIcon = (
    <img src={file} alt="File Management" className="w-6 h-6 object-contain" />
  );

  const addEngineerIcon = (
    <img src={AddEngg} alt="Add Engineer" className="w-6 h-6 object-contain" />
  );

  const laborManagementIcon = (
    <img src={labourManage} alt="Settings" className="w-6 h-6 object-contain" />
  );

  const logout = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );

  const sidebarLinks = [
    { name: "Dashboard", path: "/dashboard", icon: dashboardicon },
    { name: "Project Management", path: "/project", icon: projectIcon },
    { name: "Add Engineer", path: "/add-engineers", icon: addEngineerIcon },
    { name: "Material Management", path: "/material", icon: materialIcon },
    { name: "Financial Management", path: "/financial-management", icon: financialIcon },
    { name: "Contract Management", path: "/contract", icon: contractIcon },
    { name: "File Management", path: "/file-managememt", icon: fileIcon },
    { name: "Labour Management", path: "/labor-managememt", icon: laborManagementIcon },
    { name: "Logout", path: "/", icon: logout },
  ];

  // Sync active link with URL path
  useEffect(() => {
    const currentIndex = sidebarLinks.findIndex(item => location.pathname === item.path);
    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
    }
  }, [location.pathname]);

  const handleItemClick = (index, path) => {
    if (path === "/") {
      // Show confirmation popup for logout
      setShowLogoutModal(true);
    } else {
      setActiveIndex(index);
      navigate(path);
    }
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate("/"); // navigate after confirming
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  return (
    <>
      {/* Sidebar */}
      <div className="fixed top-20 md:w-64 w-16 border-r border-gray-300 min-h-screen bg-white">      
        <div className="pt-6 flex flex-col">
          {sidebarLinks.map((item, index) => (
            <button
              key={index}
              onClick={() => handleItemClick(index, item.path)}
              className={`flex items-center py-4 px-6 gap-3 transition-colors duration-200 text-left cursor-pointer
                ${activeIndex === index
                  ? "border-l-4 bg-[#ffbe2a]/60 border-black text-black font-semibold"
                  : "hover:bg-black/5 text-black"
                }
                ${item.name === "Logout" ? "mt-4" : ""}`}
            >
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <p className="md:block hidden text-base whitespace-nowrap">{item.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6 relative animate-fade-in">
            <button
              onClick={cancelLogout}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                <LogOut className="h-6 w-6 text-amber-600" />
              </div>
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Confirm Logout
              </h3>
              <p className="text-slate-600 mb-6">
                Do you really want to logout?
              </p>

              <div className="flex gap-3 justify-center">
                <button
                  onClick={cancelLogout}
                  className="px-6 py-2.5 bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors duration-200 uppercase text-sm tracking-wide"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="px-6 py-2.5 bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors duration-200 uppercase text-sm tracking-wide"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SidePannel;
