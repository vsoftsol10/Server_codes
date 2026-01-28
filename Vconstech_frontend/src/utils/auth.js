// src/utils/auth.js
// Centralized authentication utilities to prevent token mismatch issues

// ============================================
// CONFIGURATION - Use the same key everywhere
// ============================================
const TOKEN_KEY = 'token'; // ✅ Changed from 'authToken' to 'token' to match login components

// ============================================
// TOKEN MANAGEMENT
// ============================================
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    console.log('✅ Auth token saved');
  }
};

export const getAuthToken = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.warn('⚠️ No auth token found');
  }
  return token;
};

export const removeAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  console.log('🗑️ Auth token removed');
};

// ============================================
// USER DATA MANAGEMENT
// ============================================
export const setUserData = (userData) => {
  if (userData) {
    localStorage.setItem('userId', userData.id || '');
    localStorage.setItem('userName', userData.name || '');
    localStorage.setItem('userRole', userData.role || '');
    localStorage.setItem('userType', userData.type || '');
    localStorage.setItem('companyId', userData.companyId || '');
    
    // Also store the full user/engineer object for backward compatibility
    if (userData.empId) {
      localStorage.setItem('engineer', JSON.stringify(userData));
    } else {
      localStorage.setItem('user', JSON.stringify(userData));
    }
    
    console.log('✅ User data saved:', {
      id: userData.id,
      name: userData.name,
      role: userData.role,
      type: userData.type
    });
  }
};

export const getUserData = () => {
  return {
    id: localStorage.getItem('userId'),
    name: localStorage.getItem('userName'),
    role: localStorage.getItem('userRole'),
    type: localStorage.getItem('userType'),
    companyId: localStorage.getItem('companyId')
  };
};

// ============================================
// LOGIN HANDLER
// ============================================
export const handleLoginSuccess = (response) => {
  console.log('🔐 Processing login...');
  
  // Clear any existing auth data first
  logout();
  
  // Save new token
  if (response.token) {
    setAuthToken(response.token);
  }
  
  // Save user data
  if (response.user) {
    setUserData(response.user);
  } else if (response.engineer) {
    // For engineer login
    setUserData({
      id: response.engineer.id,
      name: response.engineer.name,
      role: 'Site_Engineer',
      type: 'engineer',
      companyId: response.engineer.companyId,
      empId: response.engineer.empId, // Include empId for engineer identification
      ...response.engineer // Include all engineer data
    });
  }
  
  console.log('✅ Login successful');
  return true;
};

// ============================================
// LOGOUT HANDLER
// ============================================
export const logout = (navigate = null) => {
  console.log('🔐 Logging out...');
  
  // Clear all authentication data
  removeAuthToken();
  
  // Also clear any legacy token keys (cleanup)
  localStorage.removeItem('authToken'); // Legacy key
  
  // Clear user data
  localStorage.removeItem('userId');
  localStorage.removeItem('userName');
  localStorage.removeItem('userRole');
  localStorage.removeItem('userType');
  localStorage.removeItem('companyId');
  localStorage.removeItem('user');
  localStorage.removeItem('engineer');
  
  // Clear any cached data
  localStorage.removeItem('currentProject');
  localStorage.removeItem('projects');
  
  console.log('✅ All auth data cleared');
  
  // Navigate to home if navigate function provided
  if (navigate) {
    if(isAdmin){
      navigate('/');
      window.location.reload();
    }
    else if(isEngineer){
      navigate('/employee-login')
    }
  }
};

// ============================================
// AUTHENTICATION CHECK
// ============================================
export const isAuthenticated = () => {
  const token = getAuthToken();
  return !!token;
};

// ============================================
// API HEADERS HELPER
// ============================================
export const getAuthHeaders = () => {
  const token = getAuthToken();
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// ============================================
// ROLE CHECK
// ============================================
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

export const isAdmin = () => {
  return getUserRole() === 'Admin';
};

export const isEngineer = () => {
  return getUserRole() === 'Site_Engineer';
};