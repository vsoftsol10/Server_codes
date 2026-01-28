// src/api/financialAPI.js
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
import { getAuthToken } from '../utils/auth';

// Helper to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw {
      status: response.status,
      error: data.error || 'An error occurred',
      details: data.details
    };
  }
  
  return data;
};

export const financialAPI = {
  /**
   * Get all projects with financial data
   * @returns {Object} { success, projects, count }
   */
  getProjects: async () => {
    const token = getAuthToken();
    
    console.log('🌐 Fetching financial projects...');
    
    const response = await fetch(`${API_BASE_URL}/financial/projects`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await handleResponse(response);
    console.log('📥 Financial projects:', result);
    return result;
  },

  /**
   * Get single project with expenses
   * @param {number} id - Project ID
   * @returns {Object} { success, project }
   */
  getProjectById: async (id) => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/financial/projects/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },

  /**
   * Create new project
   * @param {Object} projectData - { name, budget, quotationAmount, dueDate }
   * @returns {Object} { success, message, project }
   */
  createProject: async (projectData) => {
    const token = getAuthToken();
    
    console.log('📤 Creating financial project:', projectData);
    
    const response = await fetch(`${API_BASE_URL}/financial/projects`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData)
    });
    
    const result = await handleResponse(response);
    console.log('✅ Project created:', result);
    return result;
  },

  /**
   * Add expense to project
   * @param {number} projectId - Project ID
   * @param {Object} expenseData - { category, amount }
   * @returns {Object} { success, message, expense }
   */
  addExpense: async (projectId, expenseData) => {
    const token = getAuthToken();
    
    console.log('📤 Adding expense to project:', projectId, expenseData);
    
    const response = await fetch(`${API_BASE_URL}/financial/projects/${projectId}/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expenseData)
    });
    
    const result = await handleResponse(response);
    console.log('✅ Expense added:', result);
    return result;
  },

  /**
   * Update expense
   * @param {number} expenseId - Expense ID
   * @param {Object} expenseData - { category, amount }
   * @returns {Object} { success, message, expense }
   */
  updateExpense: async (expenseId, expenseData) => {
    const token = getAuthToken();
    
    console.log('📤 Updating expense:', expenseId, expenseData);
    
    const response = await fetch(`${API_BASE_URL}/financial/expenses/${expenseId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expenseData)
    });
    
    const result = await handleResponse(response);
    console.log('✅ Expense updated:', result);
    return result;
  },

  /**
   * Delete expense
   * @param {number} expenseId - Expense ID
   * @returns {Object} { success, message }
   */
  deleteExpense: async (expenseId) => {
    const token = getAuthToken();
    
    console.log('📤 Deleting expense:', expenseId);
    
    const response = await fetch(`${API_BASE_URL}/financial/expenses/${expenseId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const result = await handleResponse(response);
    console.log('✅ Expense deleted:', result);
    return result;
  },

  /**
   * Get financial summary
   * @returns {Object} { success, summary }
   */
  getSummary: async () => {
    const token = getAuthToken();
    
    const response = await fetch(`${API_BASE_URL}/financial/summary`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  }
};