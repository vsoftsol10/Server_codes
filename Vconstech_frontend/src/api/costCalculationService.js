// src/services/costCalculationService.js
import { financialAPI } from '../api/financialAPI.js';
import { materialAPI } from '../api/materialService.js';
import { projectAPI } from '../api/projectAPI.js';
import labourApi from './labourAPI.js';
import { getContractsByProject } from '../api/contractAPI.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const getAuthToken = () => localStorage.getItem('token');

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

/**
 * Unified Cost Calculation Service
 * Aggregates costs from ALL sources: Financial expenses + Material usage + Labour payments + Contract costs
 */
export const costCalculationService = {
  /**
   * Calculate total spent for a single project
   * @param {number} projectId - Project ID
   * @returns {Object} { totalSpent, breakdown: { financial, materials, labour, contracts } }
   */
  calculateProjectSpent: async (projectId) => {
    try {
      console.log(`💰 Calculating total spent for project ${projectId}...`);
      
      // 1. Get financial expenses
      let financialSpent = 0;
      try {
        const financialData = await financialAPI.getProjectById(projectId);
        if (financialData.success && financialData.project) {
          // Sum all expenses
          financialSpent = financialData.project.expenses?.reduce(
            (sum, exp) => sum + parseFloat(exp.amount || 0), 
            0
          ) || 0;
        }
      } catch (err) {
        console.warn('No financial data found for project:', projectId, err.message);
      }
      
      // 2. Get material costs from usage logs
      let materialSpent = 0;
      try {
        const usageLogs = await materialAPI.usageLogAPI.getByProject(projectId);
        if (usageLogs.success && usageLogs.logs) {
          // Sum: quantity * unit_price for each log
          materialSpent = usageLogs.logs.reduce((sum, log) => {
            const qty = parseFloat(log.quantity || 0);
            const price = parseFloat(log.material?.unit_price || log.material?.defaultRate || 0);
            return sum + (qty * price);
          }, 0);
        }
      } catch (err) {
        console.warn('No material usage found for project:', projectId, err.message);
      }
      
      // 3. Get labour costs (total payments made)
      let labourSpent = 0;
      try {
        const labourData = await labourApi.getLabourersByProject(projectId);
        if (labourData.success && labourData.labourers) {
          // Sum total paid amount for each labourer
          labourSpent = labourData.labourers.reduce((sum, labourer) => {
            // Sum all payments for this labourer
            const labourerTotal = labourer.payments?.reduce(
              (pSum, payment) => pSum + parseFloat(payment.amount || 0),
              0
            ) || parseFloat(labourer.totalPaid || 0) || 0;
            
            return sum + labourerTotal;
          }, 0);
        }
      } catch (err) {
        console.warn('No labour data found for project:', projectId, err.message);
      }
      
      // 4. Get contract costs (paid amounts)
      let contractSpent = 0;
      try {
        const contractData = await getContractsByProject(projectId);
        if (contractData.success && contractData.contracts) {
          // Sum paid amount for each contract
          contractSpent = contractData.contracts.reduce((sum, contract) => {
            return sum + parseFloat(contract.paidAmount || 0);
          }, 0);
        }
      } catch (err) {
        console.warn('No contract data found for project:', projectId, err.message);
      }
      
      // Calculate total
      const totalSpent = financialSpent + materialSpent + labourSpent + contractSpent;
      
      console.log(`✅ Project ${projectId} total spent: ₹${totalSpent.toFixed(2)}`);
      console.log(`   - Financial: ₹${financialSpent.toFixed(2)}`);
      console.log(`   - Materials: ₹${materialSpent.toFixed(2)}`);
      console.log(`   - Labour: ₹${labourSpent.toFixed(2)}`);
      console.log(`   - Contracts: ₹${contractSpent.toFixed(2)}`);
      
      return {
        totalSpent,
        breakdown: {
          financial: financialSpent,
          materials: materialSpent,
          labour: labourSpent,
          contracts: contractSpent
        }
      };
    } catch (error) {
      console.error('Error calculating project spent:', error);
      throw error;
    }
  },

  /**
   * Calculate spent for all projects
   * @returns {Object} Map of projectId -> { totalSpent, breakdown }
   */
  calculateAllProjectsSpent: async () => {
    try {
      const projects = await projectAPI.getProjects();
      const spentMap = {};
      
      // Calculate spent for each project in parallel
      const calculations = projects.projects.map(async (project) => {
        try {
          const spent = await costCalculationService.calculateProjectSpent(project.id);
          spentMap[project.id] = spent;
        } catch (err) {
          console.warn(`Failed to calculate spent for project ${project.id}:`, err);
          spentMap[project.id] = {
            totalSpent: 0,
            breakdown: { financial: 0, materials: 0, labour: 0, contracts: 0 }
          };
        }
      });
      
      await Promise.all(calculations);
      
      return spentMap;
    } catch (error) {
      console.error('Error calculating all projects spent:', error);
      throw error;
    }
  },

  /**
   * Update project's spent field in database
   * @param {number} projectId - Project ID
   * @returns {Object} Updated project
   */
  updateProjectSpent: async (projectId) => {
    try {
      const token = getAuthToken();
      
      // Calculate current spent
      const { totalSpent, breakdown } = await costCalculationService.calculateProjectSpent(projectId);
      
      // Update project with new spent value
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}/spent`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ spent: totalSpent })
      });
      
      const result = await handleResponse(response);
      
      console.log(`✅ Updated project ${projectId} spent to ₹${totalSpent}`);
      console.log(`   Breakdown:`, breakdown);
      
      return result;
    } catch (error) {
      console.error('Error updating project spent:', error);
      throw error;
    }
  },

  /**
   * Get enriched project data with calculated spent
   * @param {number} projectId - Project ID
   * @returns {Object} Project with spent details
   */
  getProjectWithSpent: async (projectId) => {
    try {
      // Get project details
      const projectData = await projectAPI.getProjectById(projectId);
      
      // Calculate spent
      const spentData = await costCalculationService.calculateProjectSpent(projectId);
      
      // Merge data
      return {
        ...projectData.project,
        spent: spentData.totalSpent,
        spentBreakdown: spentData.breakdown,
        budgetUtilization: projectData.project.budget 
          ? ((spentData.totalSpent / projectData.project.budget) * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      console.error('Error getting project with spent:', error);
      throw error;
    }
  },

  /**
   * Get all projects with calculated spent
   * @returns {Array} Projects with spent data
   */
  getAllProjectsWithSpent: async () => {
    try {
      // Get all projects
      const projectsData = await projectAPI.getProjects();
      
      // Calculate spent for all projects in parallel
      const enrichedProjects = await Promise.all(
        projectsData.projects.map(async (project) => {
          try {
            const spentData = await costCalculationService.calculateProjectSpent(project.id);
            return {
              ...project,
              spent: spentData.totalSpent,
              spentBreakdown: spentData.breakdown,
              budgetUtilization: project.budget 
                ? ((spentData.totalSpent / project.budget) * 100).toFixed(2)
                : 0
            };
          } catch (err) {
            console.warn(`Failed to calculate spent for project ${project.id}:`, err);
            // Return project with original spent value if calculation fails
            return {
              ...project,
              spentBreakdown: { financial: 0, materials: 0, labour: 0, contracts: 0 },
              budgetUtilization: 0
            };
          }
        })
      );
      
      return enrichedProjects;
    } catch (error) {
      console.error('Error getting all projects with spent:', error);
      throw error;
    }
  },

  /**
   * Get spending breakdown summary for a project
   * @param {number} projectId - Project ID
   * @returns {Object} Detailed breakdown with percentages
   */
  getSpendingBreakdown: async (projectId) => {
    try {
      const { totalSpent, breakdown } = await costCalculationService.calculateProjectSpent(projectId);
      
      // Calculate percentages
      const percentages = {
        financial: totalSpent > 0 ? ((breakdown.financial / totalSpent) * 100).toFixed(1) : 0,
        materials: totalSpent > 0 ? ((breakdown.materials / totalSpent) * 100).toFixed(1) : 0,
        labour: totalSpent > 0 ? ((breakdown.labour / totalSpent) * 100).toFixed(1) : 0,
        contracts: totalSpent > 0 ? ((breakdown.contracts / totalSpent) * 100).toFixed(1) : 0
      };
      
      return {
        totalSpent,
        breakdown,
        percentages,
        categories: [
          { name: 'Financial', amount: breakdown.financial, percentage: percentages.financial },
          { name: 'Materials', amount: breakdown.materials, percentage: percentages.materials },
          { name: 'Labour', amount: breakdown.labour, percentage: percentages.labour },
          { name: 'Contracts', amount: breakdown.contracts, percentage: percentages.contracts }
        ]
      };
    } catch (error) {
      console.error('Error getting spending breakdown:', error);
      throw error;
    }
  }
};

/**
 * Hook to automatically update spent when expenses/usage changes
 * Call this after:
 * - Adding/updating/deleting financial expenses
 * - Adding/updating/deleting material usage logs
 * - Adding/updating labour payments
 * - Adding/updating contract payments
 */
export const triggerSpentRecalculation = async (projectId) => {
  try {
    console.log(`🔄 Triggering spent recalculation for project ${projectId}...`);
    await costCalculationService.updateProjectSpent(projectId);
    console.log(`✅ Spent recalculation completed for project ${projectId}`);
  } catch (error) {
    console.error('Failed to recalculate spent:', error);
    throw error;
  }
};

export default costCalculationService;
