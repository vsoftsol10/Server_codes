import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import project from "../../assets/Icon/ProjectManagement.png";
import material from "../../assets/Icon/MaterialManagement.png";
import financial from "../../assets/Icon/FinancialManagement.png";
import contract from "../../assets/Icon/ContractManagement.png";
import file from "../../assets/Icon/FileManagement.png";
import labourManage from "../../assets/Icon/LabourManagement.png";
import billing1 from "../../assets/Icon/bill.png";
import AddEngg from "../../assets/Icon/AddEngg.png";
import {
  LogOut,
  X,
  ChevronDown,
  ChevronRight,
  UserCheck,
  LayoutDashboard,
} from "lucide-react";

const SidePannel = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const projectIcon = <img src={project} alt="Project Management" className="w-5 h-5 object-contain" />;
  const materialIcon = <img src={material} alt="Material Management" className="w-5 h-5 object-contain" />;
  const financialIcon = <img src={financial} alt="Financial Management" className="w-5 h-5 object-contain" />;
  const contractIcon = <img src={contract} alt="Contract Management" className="w-5 h-5 object-contain" />;
  const fileIcon = <img src={file} alt="File Management" className="w-5 h-5 object-contain" />;
  const addEngineerIcon = <img src={AddEngg} alt="Add Engineer" className="w-5 h-5 object-contain" />;
  const laborManagementIcon = <img src={labourManage} alt="Labour Management" className="w-5 h-5 object-contain" />;
  const billingIcon = <img src={billing1} alt="Billing" className="w-5 h-5 object-contain" />;

  const sidebarLinks = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Project Management", path: "/project", icon: projectIcon },
    { name: "Add Member", path: "/add-engineers", icon: addEngineerIcon },
    { name: "Material Management", path: "/material", icon: materialIcon },
    {
      name: "Financial Management",
      icon: financialIcon,
      submenu: [
        { name: "Financial Management", path: "/financial-management", icon: financialIcon },
        { name: "Billing", path: "/financial-management/billing", icon: billingIcon },
      ],
    },
    { name: "Contract Management", path: "/contract", icon: contractIcon },
    { name: "File Management", path: "/file-managememt", icon: fileIcon },
    { name: "Labour Management", path: "/labor-managememt", icon: laborManagementIcon },
    { name: "Profile", path: "/profile", icon: <UserCheck size={20} /> },
    { name: "Logout", path: "/", icon: <LogOut size={20} /> },
  ];

  // Mobile bottom nav shows a limited set of key items
  const mobileNavItems = [0, 1, 4, 7, 9]; // indices from sidebarLinks

  useEffect(() => {
    const currentIndex = sidebarLinks.findIndex((item) => {
      if (item.submenu) {
        return item.submenu.some((sub) => location.pathname === sub.path);
      }
      return location.pathname === item.path;
    });

    if (currentIndex !== -1) {
      setActiveIndex(currentIndex);
      const currentLink = sidebarLinks[currentIndex];
      if (currentLink?.submenu) {
        const isSubmenuActive = currentLink.submenu.some(
          (sub) => location.pathname === sub.path
        );
        if (isSubmenuActive) {
          setExpandedMenus((prev) => ({ ...prev, [currentIndex]: true }));
        }
      }
    }
  }, [location.pathname]);

  const handleItemClick = (index, path, hasSubmenu) => {
    if (path === "/") {
      setShowLogoutModal(true);
    } else if (hasSubmenu) {
      setExpandedMenus((prev) => ({ ...prev, [index]: !prev[index] }));
      setActiveIndex(index);
    } else {
      setActiveIndex(index);
      navigate(path);
      setIsMobileMenuOpen(false);
    }
  };

  const handleSubmenuClick = (parentIndex, path) => {
    setActiveIndex(parentIndex);
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const isItemActive = (item, index) =>
    activeIndex === index ||
    (item.submenu && item.submenu.some((sub) => location.pathname === sub.path));

  return (
    <>
      {/* ─────────────── DESKTOP & TABLET SIDEBAR ─────────────── */}
      {/* Hidden on mobile (< 768px), visible from md up */}
      <div
        className="
          fixed top-24 left-0 h-[calc(100vh-5rem)] z-50 bg-white border-r border-gray-200
          overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100
          hidden md:block md:w-64
        "
      >
        <div className="pt-4 flex flex-col pb-6">
          {sidebarLinks.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => handleItemClick(index, item.path, item.submenu)}
                title={item.name}
                className={`
                  flex items-center w-full gap-3 py-3 px-4 text-left cursor-pointer
                  transition-colors duration-200 text-sm font-medium
                  ${item.name === "Logout" ? "mt-0 border-t border-gray-100" : ""}
                  ${
                    isItemActive(item, index)
                      ? "bg-[#ffbe2a] border-l-4 border-black text-black font-semibold"
                      : "text-gray-700 hover:bg-gray-100 border-l-4 border-transparent"
                  }
                `}
              >
                {/* Icon — always visible */}
                <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                  {item.icon}
                </span>

                {/* Label — always visible on md and up */}
                <span className="whitespace-nowrap flex-1 overflow-hidden text-ellipsis">
                  {item.name}
                </span>

                {/* Chevron */}
                {item.submenu && (
                  <span className="flex-shrink-0 ml-auto">
                    {expandedMenus[index] ? <ChevronDown size={16} /> : <ChevronDown size={16} />}
                  </span>
                )}
              </button>

              {/* Submenu */}
              {item.submenu && expandedMenus[index] && (
                <div className="bg-gray-50">
                  {item.submenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => handleSubmenuClick(index, subItem.path)}
                      className={`
                        flex items-center w-full gap-3 py-2.5 pl-10 pr-4 text-left cursor-pointer
                        transition-colors duration-200 text-sm
                        ${
                          location.pathname === subItem.path
                            ? "bg-[#ffbe2a]/50 text-black font-semibold border-l-4 border-black"
                            : "text-gray-600 hover:bg-gray-100 border-l-4 border-transparent"
                        }
                      `}
                    >
                      <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                        {subItem.icon}
                      </span>
                      <span className="whitespace-nowrap overflow-hidden text-ellipsis">
                        {subItem.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ─────────────── MOBILE BOTTOM NAV ─────────────── */}
      {/* Visible only on mobile (< 768px) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="flex items-stretch h-16">
          {mobileNavItems.map((index) => {
            const item = sidebarLinks[index];
            const active = isItemActive(item, index);

            return (
              <button
                key={index}
                onClick={() => {
                  if (item.submenu) {
                    setIsMobileMenuOpen((prev) => !prev);
                    setActiveIndex(index);
                  } else {
                    handleItemClick(index, item.path, item.submenu);
                  }
                }}
                className={`
                  flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium
                  transition-colors duration-150 cursor-pointer
                  ${active ? "text-black bg-[#ffbe2a]/20" : "text-gray-500 hover:bg-gray-50"}
                `}
              >
                <span
                  className={`
                    w-8 h-8 flex items-center justify-center rounded-xl transition-colors
                    ${active ? "bg-[#ffbe2a]" : ""}
                  `}
                >
                  {item.icon}
                </span>
                <span className="truncate max-w-[56px] text-center leading-tight">
                  {item.name === "Financial Management" ? "Finance" : item.name.split(" ")[0]}
                </span>
              </button>
            );
          })}

          {/* More button for full menu */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex-1 flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-500 hover:bg-gray-50 cursor-pointer"
          >
            <span className="w-8 h-8 flex items-center justify-center rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
              </svg>
            </span>
            <span>More</span>
          </button>
        </div>
      </div>

      {/* ─────────────── MOBILE FULL MENU DRAWER ─────────────── */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer panel */}
          <div className="relative bg-white rounded-t-2xl shadow-xl max-h-[75vh] overflow-y-auto pb-20">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-gray-900">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              {sidebarLinks.map((item, index) => (
                <div key={index}>
                  <button
                    onClick={() => handleItemClick(index, item.path, item.submenu)}
                    className={`
                      flex items-center w-full gap-3 px-3 py-3 rounded-xl text-sm font-medium
                      transition-colors duration-150 cursor-pointer mb-0.5
                      ${item.name === "Logout" ? "mt-2 border-t border-gray-100 rounded-none pt-4" : ""}
                      ${
                        isItemActive(item, index)
                          ? "bg-[#ffbe2a] text-black font-semibold"
                          : "text-gray-700 hover:bg-gray-100"
                      }
                    `}
                  >
                    <span className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left">{item.name}</span>
                    {item.submenu && (
                      expandedMenus[index] ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </button>

                  {/* Mobile submenu */}
                  {item.submenu && expandedMenus[index] && (
                    <div className="ml-4 mb-1">
                      {item.submenu.map((subItem, subIndex) => (
                        <button
                          key={subIndex}
                          onClick={() => handleSubmenuClick(index, subItem.path)}
                          className={`
                            flex items-center w-full gap-3 px-3 py-2.5 rounded-xl text-sm mb-0.5
                            transition-colors duration-150 cursor-pointer
                            ${
                              location.pathname === subItem.path
                                ? "bg-[#ffbe2a]/50 text-black font-semibold"
                                : "text-gray-600 hover:bg-gray-100"
                            }
                          `}
                        >
                          <span className="w-4 h-4 flex-shrink-0 flex items-center justify-center">
                            {subItem.icon}
                          </span>
                          <span>{subItem.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────── LOGOUT MODAL ─────────────── */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative">
            <button
              onClick={cancelLogout}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
            >
              <X size={18} />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
                <LogOut className="h-6 w-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-1">Confirm Logout</h3>
              <p className="text-slate-500 text-sm mb-6">Do you really want to logout?</p>

              <div className="flex gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-800 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-4 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm"
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