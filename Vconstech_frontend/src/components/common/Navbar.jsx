import { Bell, LogOut, User, User2, User2Icon, UserCog2, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [companyName, setCompanyName] = useState('Loading...');
  const navigate = useNavigate();

  // Get company name from stored user data
  useEffect(() => {
    try {
      const userDataString = sessionStorage.getItem('user') || localStorage.getItem('user');
      
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        
        // Get company name from user data (set during login)
        if (userData.companyName) {
          setCompanyName(userData.companyName);
        } else if (userData.company?.name) {
          setCompanyName(userData.company.name);
        } else {
          // Fallback: Fetch from API if not in user data
          fetchCompanyName(userData.companyId);
        }
      } else {
        setCompanyName('Interiors');
      }
    } catch (error) {
      console.error('Error loading company name:', error);
      setCompanyName('Interiors');
    }
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
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // Clear all storage
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Close modal
    setShowLogoutModal(false);
    
    // Navigate and reload
    navigate("/");
    window.location.reload();
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const handleNotification = () => {
    alert('No new notifications');
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-20 sm:h-20 md:h-24 bg-[#ffbe2a] border-t-2 sm:border-t-4 border-slate-800 shadow-md backdrop-blur-xl">      
        <div className="max-w-8xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-2 sm:gap-4">
            {/* Left side - Brand */}
            <div className="flex items-center space-x-2 sm:space-x-8 flex-1 min-w-0">
              <div className="flex-shrink-0 flex items-center gap-1 sm:gap-2 md:gap-3 min-w-0">
                {/* ✅ FIXED: Changed to proper div structure instead of nested headings */}
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
              {/* Notification Icon */}
              <button
                onClick={handleNotification}
                className="p-2 sm:p-2.5 md:p-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-colors duration-200 relative"
                aria-label="Notifications"
              >
                <Bell size={18} className="sm:w-5 sm:h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full"></span>
              </button>

              <button
                onClick={handleNotification}
                className="p-2 sm:p-2.5 md:p-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl sm:rounded-2xl transition-colors duration-200 relative"
                aria-label="Notifications"
              >
                <UserCog2 size={18} className="sm:w-6 sm:h-6 md:w-[35px] md:h-[35px] p-1  rounded-lg" strokeWidth={2.5} />
                {/* <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 md:top-2 md:right-2 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-amber-500 rounded-full"></span> */}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center rounded-xl sm:rounded-2xl gap-1 sm:gap-1.5 md:gap-2 bg-slate-900 text-white px-2.5 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 hover:bg-slate-800 transition-colors duration-200 font-semibold uppercase text-[10px] sm:text-xs md:text-sm tracking-wide"
                aria-label="Logout"
              >
                <span className='text-white hidden xs:inline sm:inline'>Logout</span>
                <LogOut size={14} className="sm:w-4 sm:h-4 md:w-[18px] md:h-[18px]" />
              </button>
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