import { Bell, LogOut, Settings, X, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [companyName, setCompanyName] = useState('Loading...');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // Function to load company name
  const loadCompanyName = () => {
    try {
      const userDataString = sessionStorage.getItem('user') || localStorage.getItem('user');
      const storedCompanyName = localStorage.getItem('companyName');
      
      if (storedCompanyName) {
        setCompanyName(storedCompanyName);
        return;
      }
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        if (userData.companyName) {
          setCompanyName(userData.companyName);
        } else if (userData.company?.name) {
          setCompanyName(userData.company.name);
        } else {
          fetchCompanyName(userData.companyId);
        }
      } else {
        setCompanyName('Interiors');
      }
    } catch (error) {
      console.error('Error loading company name:', error);
      setCompanyName('Interiors');
    }
  };

  // Fetch notifications from backend
  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      } else {
        console.error('Failed to fetch notifications:', response.status);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  // Mark notification as read
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh notifications after marking as read
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId) => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      const response = await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // Load company name on mount
  useEffect(() => {
    loadCompanyName();
    fetchNotifications(); // Fetch notifications on mount
  }, []);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Listen for storage changes (when Profile updates company name)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'companyName' || e.key === 'user') {
        loadCompanyName();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const handleCustomUpdate = () => {
      loadCompanyName();
    };
    window.addEventListener('companyNameUpdated', handleCustomUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyNameUpdated', handleCustomUpdate);
    };
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSettingsDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotificationsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fallback function to fetch company name from API
  const fetchCompanyName = async (companyId) => {
    if (!companyId) {
      setCompanyName('Interiors');
      return;
    }

    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      const response = await fetch(`/api/companies/${companyId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCompanyName(data.name || 'Interiors');
      } else {
        setCompanyName('Interiors');
      }
    } catch (error) {
      console.error('Error fetching company name:', error);
      setCompanyName('Interiors');
    }
  };

  const handleLogout = () => {
    setShowSettingsDropdown(false);
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    setShowLogoutModal(false);
    navigate("/");
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleNotification = () => {
    setShowNotificationsDropdown(!showNotificationsDropdown);
    if (!showNotificationsDropdown) {
      fetchNotifications(); // Refresh when opening
    }
  };

  const handleProfile = () => {
    setShowSettingsDropdown(false);
    navigate("/profile");
  };

  const toggleSettingsDropdown = () => {
    setShowSettingsDropdown(!showSettingsDropdown);
  };

  // Format date for notifications
  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 sm:h-20 md:h-24 bg-[#ffbe2a] border-t-2 sm:border-t-4 border-slate-800 shadow-md backdrop-blur-xl">      
        <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
            {/* Left side - Brand */}
            <div className="flex items-center space-x-2 sm:space-x-8 flex-1 min-w-0">
              <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
                <div className="text-xl sm:text-base font-Spartan md:text-xl lg:text-2xl xl:text-3xl uppercase font-black text-slate-900 tracking-tight flex items-center gap-1">
                  <span className="sm:inline whitespace-nowrap">Welcome</span>
                  <span className='text-xl sm:text-base md:text-xl lg:text-2xl xl:text-3xl underline decoration-2 tracking-tight text-black truncate max-w-[150px] sm:max-w-[200px] md:max-w-none inline-block'> 
                    {companyName}
                  </span>
                  <span>!</span>
                </div>
              </div>
            </div>

            {/* Right side - Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">
              {/* Notification Icon with Dropdown */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={handleNotification}
                  className="p-2 sm:p-2.5 md:p-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-colors duration-200 relative"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full"></span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in max-h-[500px] flex flex-col">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    {/* Notifications List */}
                    <div className="overflow-y-auto flex-1">
                      {isLoadingNotifications ? (
                        <div className="p-4 text-center text-slate-500">
                          Loading...
                        </div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Bell size={40} className="mx-auto mb-2 opacity-30" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 hover:bg-gray-50 transition-colors ${
                                !notification.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!notification.read ? 'font-semibold' : ''} text-slate-900`}>
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-slate-500 mt-1">
                                    {formatNotificationDate(notification.date)}
                                  </p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  {!notification.read && (
                                    <button
                                      onClick={() => markNotificationAsRead(notification.id)}
                                      className="p-1 text-blue-600 hover:text-blue-800 text-xs"
                                      title="Mark as read"
                                    >
                                      ✓
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteNotification(notification.id)}
                                    className="p-1 text-red-600 hover:text-red-800"
                                    title="Delete"
                                  >
                                    <X size={14} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Settings Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleSettingsDropdown}
                  className="p-2 sm:p-2.5 md:p-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-colors duration-200"
                  aria-label="Settings"
                >
                  <Settings size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                </button>

                {/* Dropdown Menu */}
                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
                    <div className="py-2">
                      {/* Profile Option */}
                      <button
                        onClick={handleProfile}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <User size={18} className="sm:w-5 sm:h-5" strokeWidth={2} />
                        <span className="text-sm sm:text-base font-medium">Profile</span>
                      </button>

                      {/* Divider */}
                      <div className="border-t border-gray-200 my-1"></div>

                      {/* Logout Option */}
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut size={18} className="sm:w-5 sm:h-5" strokeWidth={2} />
                        <span className="text-sm sm:text-base font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-[90%] sm:max-w-md w-full p-4 sm:p-5 md:p-6 relative animate-fade-in">
            <button
              onClick={cancelLogout}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Close"
            >
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-100 mb-3 sm:mb-4">
                <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-2">
                Confirm Logout
              </h3>
              
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
                Do you really want to logout?
              </p>

              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                <button
                  onClick={cancelLogout}
                  className="w-full xs:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors duration-200 uppercase text-xs sm:text-sm tracking-wide rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="w-full xs:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors duration-200 uppercase text-xs sm:text-sm tracking-wide rounded-lg"
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
}

export default Navbar;