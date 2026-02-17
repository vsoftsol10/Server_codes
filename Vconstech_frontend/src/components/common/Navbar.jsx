import { Bell, LogOut, X, User } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:5000';

const Navbar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSettingsDropdown, setShowSettingsDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [companyName, setCompanyName] = useState('Loading...');
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const [profilePic, setProfilePic] = useState(null);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const notificationsRef = useRef(null);

  // ─── Helpers ────────────────────────────────────────────────────────────────

  const getAuth = () => {
    const token = sessionStorage.getItem('token') || localStorage.getItem('token');
    const userDataString = sessionStorage.getItem('user') || localStorage.getItem('user');
    const userData = userDataString ? JSON.parse(userDataString) : null;
    return { token, userData };
  };

  // First letter of company name for avatar fallback
  const getCompanyFirstLetter = () => {
    const name = companyName;
    if (!name || name === 'Loading...') return '?';
    return name.trim()[0].toUpperCase();
  };

  // ─── Company Name ────────────────────────────────────────────────────────────

  const loadCompanyName = () => {
    try {
      const { userData } = getAuth();
      const storedCompanyName = localStorage.getItem('companyName');

      if (storedCompanyName) { setCompanyName(storedCompanyName); return; }
      if (!userData) { setCompanyName('Interiors'); return; }

      if (userData.companyName)        setCompanyName(userData.companyName);
      else if (userData.company?.name) setCompanyName(userData.company.name);
      else if (userData.companyId)     fetchCompanyName(userData.companyId);
      else                             setCompanyName('Interiors');
    } catch (e) {
      setCompanyName('Interiors');
    }
  };

  const fetchCompanyName = async (companyId) => {
    try {
      const { token } = getAuth();
      const res = await fetch(`${API_BASE}/api/companies/${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setCompanyName(data.name || 'Interiors');
      } else {
        setCompanyName('Interiors');
      }
    } catch {
      setCompanyName('Interiors');
    }
  };

  // ─── Profile / Logo ──────────────────────────────────────────────────────────

  const fetchUserProfile = async () => {
    try {
      const { token, userData } = getAuth();
      if (!token || !userData) return;

      // Cover all common key names the stored user object might use
      const userId = userData.userId || userData.id || userData._id;
      console.log('🔍 userId from storage:', userId, '| keys:', Object.keys(userData));
      if (!userId) return;

      const res = await fetch(`${API_BASE}/api/users/profile/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        console.error('Profile fetch failed:', res.status);
        return;
      }

      const data = await res.json();
      console.log('📦 Profile response:', data);

      if (data.success) {
        const logo = data.user?.company?.logo;
        console.log('🖼️ Logo path from API:', logo);

        if (logo) {
          // Backend stores relative paths like /uploads/logos/file.jpg
          const logoUrl = logo.startsWith('http') ? logo : `${API_BASE}${logo}`;
          console.log('✅ Resolved logo URL:', logoUrl);
          setProfilePic(logoUrl);
        } else {
          setProfilePic(null);
        }
      }
    } catch (e) {
      console.error('fetchUserProfile error:', e);
    }
  };

  // ─── Notifications ───────────────────────────────────────────────────────────

  const fetchNotifications = async () => {
    setIsLoadingNotifications(true);
    try {
      const { token } = getAuth();
      if (!token) return;

      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
      }
    } catch (e) {
      console.error('fetchNotifications error:', e);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const markNotificationAsRead = async (id) => {
    try {
      const { token } = getAuth();
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const markAllAsRead = async () => {
    try {
      const { token } = getAuth();
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const deleteNotification = async (id) => {
    try {
      const { token } = getAuth();
      await fetch(`${API_BASE}/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchNotifications();
    } catch (e) { console.error(e); }
  };

  const formatNotificationDate = (dateString) => {
    const date = new Date(dateString);
    const diffMs    = Date.now() - date;
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays  = Math.floor(diffMs / 86400000);
    if (diffMins  < 1)  return 'Just now';
    if (diffMins  < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays  < 7)  return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    loadCompanyName();
    fetchNotifications();
    fetchUserProfile();
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onStorage      = (e) => { if (e.key === 'companyName' || e.key === 'user') loadCompanyName(); };
    const onCompanyUpdate = () => loadCompanyName();
    const onProfileUpdate = () => fetchUserProfile();

    window.addEventListener('storage', onStorage);
    window.addEventListener('companyNameUpdated', onCompanyUpdate);
    window.addEventListener('profileUpdated', onProfileUpdate);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('companyNameUpdated', onCompanyUpdate);
      window.removeEventListener('profileUpdated', onProfileUpdate);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setShowSettingsDropdown(false);
      if (notificationsRef.current && !notificationsRef.current.contains(e.target))
        setShowNotificationsDropdown(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleLogout = () => { setShowSettingsDropdown(false); setShowLogoutModal(true); };
  const cancelLogout  = () => setShowLogoutModal(false);
  const confirmLogout = () => {
    ['token', 'user'].forEach((k) => {
      sessionStorage.removeItem(k);
      localStorage.removeItem(k);
    });
    setShowLogoutModal(false);
    navigate('/');
    window.location.reload();
  };

  const handleNotification    = () => { setShowNotificationsDropdown((v) => !v); if (!showNotificationsDropdown) fetchNotifications(); };
  const handleProfile          = () => { setShowSettingsDropdown(false); navigate('/profile'); };
  const toggleSettingsDropdown = () => setShowSettingsDropdown((v) => !v);

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 sm:h-20 md:h-24 bg-[#ffbe2a] border-t-2 sm:border-t-4 border-slate-800 shadow-md backdrop-blur-xl">
        <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-2 sm:gap-4">

            {/* Left – Brand */}
            <div className="flex items-center space-x-2 sm:space-x-8 flex-1 min-w-0">
              <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
                <div className="text-xl sm:text-base font-Spartan md:text-xl lg:text-2xl xl:text-3xl uppercase font-black text-slate-900 tracking-tight flex items-center gap-1">
                  <span className="sm:inline whitespace-nowrap">Welcome</span>
                  <span className="text-xl sm:text-base md:text-xl lg:text-2xl xl:text-3xl underline decoration-2 tracking-tight text-black truncate max-w-[150px] sm:max-w-[200px] md:max-w-none inline-block">
                    {companyName}
                  </span>
                  <span>!</span>
                </div>
              </div>
            </div>

            {/* Right – Icons */}
            <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 flex-shrink-0">

              {/* Bell */}
              <div className="relative" ref={notificationsRef}>
                <button
                  onClick={handleNotification}
                  className="p-2 sm:p-2.5 md:p-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-colors duration-200 relative"
                  aria-label="Notifications"
                >
                  <Bell size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full" />
                  )}
                </button>

                {showNotificationsDropdown && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in max-h-[500px] flex flex-col">
                    <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="overflow-y-auto flex-1">
                      {isLoadingNotifications ? (
                        <div className="p-4 text-center text-slate-500">Loading…</div>
                      ) : notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                          <Bell size={40} className="mx-auto mb-2 opacity-30" />
                          <p>No notifications</p>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {notifications.map((n) => (
                            <div key={n.id} className={`p-4 hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50' : ''}`}>
                              <div className="flex justify-between items-start gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm ${!n.read ? 'font-semibold' : ''} text-slate-900`}>{n.message}</p>
                                  <p className="text-xs text-slate-500 mt-1">{formatNotificationDate(n.date)}</p>
                                </div>
                                <div className="flex gap-1 flex-shrink-0">
                                  {!n.read && (
                                    <button onClick={() => markNotificationAsRead(n.id)} className="p-1 text-blue-600 hover:text-blue-800 text-xs" title="Mark as read">✓</button>
                                  )}
                                  <button onClick={() => deleteNotification(n.id)} className="p-1 text-red-600 hover:text-red-800" title="Delete">
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

              {/* Profile Avatar */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={toggleSettingsDropdown}
                  className="flex items-center justify-center rounded-full transition-all duration-200 ring-2 ring-slate-800 hover:ring-4 hover:scale-105 focus:outline-none overflow-hidden"
                  style={{ width: 40, height: 40 }}
                  aria-label="Profile menu"
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt="Company logo"
                      className="w-full h-full object-cover"
                      onError={() => {
                        console.warn('Logo failed to load, showing letter fallback');
                        setProfilePic(null);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-[#ffbe2a] text-base font-black select-none">
                      {getCompanyFirstLetter()}
                    </div>
                  )}
                </button>

                {showSettingsDropdown && (
                  <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 animate-fade-in">
                    <div className="py-2">
                      <button
                        onClick={handleProfile}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-slate-700 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <User size={18} strokeWidth={2} />
                        <span className="text-sm font-medium">Profile</span>
                      </button>

                      <div className="border-t border-gray-200 my-1" />

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors duration-200"
                      >
                        <LogOut size={18} strokeWidth={2} />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-3 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-2xl max-w-[90%] sm:max-w-md w-full p-4 sm:p-5 md:p-6 relative animate-fade-in">
            <button onClick={cancelLogout} className="absolute top-3 right-3 sm:top-4 sm:right-4 text-slate-400 hover:text-slate-600 transition-colors" aria-label="Close">
              <X size={18} className="sm:w-5 sm:h-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-amber-100 mb-3 sm:mb-4">
                <LogOut className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold text-slate-900 mb-2">Confirm Logout</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">Do you really want to logout?</p>
              <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center">
                <button onClick={cancelLogout} className="w-full xs:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-200 text-slate-800 font-semibold hover:bg-slate-300 transition-colors duration-200 uppercase text-xs sm:text-sm tracking-wide rounded-lg">
                  Cancel
                </button>
                <button onClick={confirmLogout} className="w-full xs:w-auto px-4 py-2 sm:px-6 sm:py-2.5 bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors duration-200 uppercase text-xs sm:text-sm tracking-wide rounded-lg">
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

export default Navbar;