// src/services/projectReportService.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getToken } from '../utils/tabToken';
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const PDF_THEME = {
  primary: '#FFBE2A',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  surface: '#F9FAFB',
  rowAlt: '#FFFDF7',
  white: '#FFFFFF',
  planning: '#F59E0B',
  inProgress: '#3B82F6',
  onHold: '#EF4444',
  completed: '#10B981',
};

const formatReportCurrency = (amount) => (
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount || 0)
);

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
};

const getProjectStatusTone = (status) => {
  const normalized = (status || '').toLowerCase().trim();

  if (normalized === 'planning') {
    return { fill: '#FEF3C7', text: '#92400E', accent: PDF_THEME.planning };
  }

  if (normalized === 'in progress' || normalized === 'ongoing') {
    return { fill: '#DBEAFE', text: '#1D4ED8', accent: PDF_THEME.inProgress };
  }

  if (normalized === 'on hold' || normalized === 'hold') {
    return { fill: '#FEE2E2', text: '#B91C1C', accent: PDF_THEME.onHold };
  }

  if (normalized === 'completed') {
    return { fill: '#D1FAE5', text: '#065F46', accent: PDF_THEME.completed };
  }

  return { fill: '#E5E7EB', text: '#374151', accent: '#9CA3AF' };
};

const drawPdfCard = (doc, x, y, width, height, fillColor, borderColor = PDF_THEME.border) => {
  doc.setFillColor(...hexToRgb(fillColor));
  doc.setDrawColor(...hexToRgb(borderColor));
  doc.roundedRect(x, y, width, height, 4, 4, 'FD');
};

const addProjectReportFooter = (doc, generatedAtText) => {
  const pageCount = doc.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...hexToRgb(PDF_THEME.border));
    doc.line(14, pageHeight - 16, pageWidth - 14, pageHeight - 16);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(PDF_THEME.muted));
    doc.text('Generated automatically by Vconstech ERP', 14, pageHeight - 10);
    doc.text(generatedAtText, pageWidth / 2, pageHeight - 10, { align: 'center' });
    doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
  }
};

/**
 * Project Report Service
 * Generates comprehensive HTML reports for projects
 */
const projectReportService = {
  /**
   * Generate comprehensive project report
   * @param {Object} project - Project data
   * @returns {Promise<string>} HTML report
   */
  generateReport: async (project) => {
    try {
      const token = getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('📊 Generating report for project:', project.name, 'ID:', project.dbId || project.id);
      
      const fetchWithFallback = async (url, fallback) => {
        try {
          console.log('🌐 Fetching:', url);
          
          const response = await fetch(url, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          console.log(`📡 Response status for ${url}:`, response.status);
          
          if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ API Error (${response.status}):`, errorText);
            return fallback;
          }
          
          const data = await response.json();
          console.log(`✅ Data from ${url}:`, JSON.stringify(data).substring(0, 200));
          
          if (!data || typeof data !== 'object') {
            console.warn(`⚠️ Invalid data structure from ${url}`);
            return fallback;
          }
          
          return data;
        } catch (error) {
          console.error(`❌ Fetch error for ${url}:`, error.message);
          return fallback;
        }
      };

      const projectId = project.dbId || project.id;

      if (!projectId) {
        throw new Error('Project ID is missing. Cannot generate report.');
      }

      console.log('📍 Using project ID:', projectId);

      // Fetch full project details to get engineer info
      const projectDetailsRaw = await fetchWithFallback(
        `${API_BASE_URL}/projects/${projectId}`,
        { success: false, project: null }
      );

      // Merge fetched project details with passed project data
      const fullProject = {
        ...project,
        ...(projectDetailsRaw.project || {}),
        // Preserve the original values if they exist
        name: project.name || projectDetailsRaw.project?.name,
        id: project.id || projectDetailsRaw.project?.id
      };

      console.log('📋 Full project data with engineer:', fullProject);

      const [materialsRaw, labourRaw, contractsRaw, financialRaw] = await Promise.all([
        fetchWithFallback(
          `${API_BASE_URL}/usage-logs?projectId=${projectId}`,
          { success: false, usageLogs: [] }
        ),
        fetchWithFallback(
          `${API_BASE_URL}/labours/project/${projectId}`,
          { success: false, data: [] }
        ),
        fetchWithFallback(
          `${API_BASE_URL}/contracts/project/${projectId}`,
          { success: false, contracts: [] }
        ),
        fetchWithFallback(
          `${API_BASE_URL}/financial/projects/${projectId}`,
          { success: false, project: { expenses: [] } }
        )
      ]);

      const materials = {
        success: materialsRaw.success,
        logs: materialsRaw.usageLogs || materialsRaw.logs || []
      };

      const labour = {
        success: labourRaw.success,
        labourers: labourRaw.data || labourRaw.labourers || []
      };

      const contracts = {
        success: contractsRaw.success,
        contracts: contractsRaw.contracts || []
      };

      const financial = {
        success: financialRaw.success,
        project: financialRaw.project || { expenses: [] }
      };

      console.log('📦 Materials logs sample:', materials.logs?.[0]);
      console.log('👷 Labour data sample:', labour.labourers?.[0]);
      console.log('📋 Contracts sample:', contracts.contracts?.[0]);
      console.log('💰 Financial expenses sample:', financial.project?.expenses?.[0]);

      // ✅ FIXED: Calculate material cost using defaultRate
      const materialCost = Array.isArray(materials.logs) 
        ? materials.logs.reduce((sum, log) => {
            const qty = parseFloat(log.quantity) || 0;
            // ✅ FIX: Use defaultRate from material (this is what your schema has!)
            const price = parseFloat(log.material?.defaultRate) || 0;
            
            console.log(`Material: ${log.material?.name}, Qty: ${qty}, Rate: ${price}, Total: ${qty * price}`);
            
            return sum + (qty * price);
          }, 0)
        : 0;

      console.log('💰 Total material cost from usage logs:', materialCost);

      const labourCost = Array.isArray(labour.labourers)
        ? labour.labourers.reduce((sum, lab) => {
            if (Array.isArray(lab.payments)) {
              return sum + lab.payments.reduce((pSum, payment) => 
                pSum + (parseFloat(payment.amount) || 0), 0
              );
            }
            return sum + (parseFloat(lab.totalPaid) || 0);
          }, 0)
        : 0;

      const contractCost = Array.isArray(contracts.contracts)
        ? contracts.contracts.reduce((sum, con) => 
            sum + (parseFloat(con.paidAmount) || 0), 0
          )
        : 0;

      const financialExpenses = Array.isArray(financial.project?.expenses) 
        ? financial.project.expenses 
        : [];
      
      const materialCategories = [
        'material', 'paint', 'cement', 'steel', 'wood', 'tiles', 'hardware',
        'glass', 'glasses', 'window', 'door', 'aluminium', 'aluminum', 'iron',
        'brick', 'sand', 'aggregate', 'marble', 'granite', 'plywood', 'ply',
        'pipe', 'wire', 'cable', 'fixture', 'sanitary', 'plumbing', 'electrical'
      ];
      
      const financialMaterialCost = financialExpenses
        .filter(exp => {
          const category = (exp.category || '').toLowerCase();
          return materialCategories.some(mat => category.includes(mat));
        })
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
      
      const financialOtherCost = financialExpenses
        .filter(exp => {
          const category = (exp.category || '').toLowerCase();
          return !materialCategories.some(mat => category.includes(mat));
        })
        .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

      const totalCalculated = materialCost + financialMaterialCost + labourCost + contractCost + financialOtherCost;

      console.log('💰 Calculated costs:', {
        materialsFromUsageLogs: materialCost,
        materialsFromFinancial: financialMaterialCost,
        totalMaterials: materialCost + financialMaterialCost,
        labour: labourCost,
        contracts: contractCost,
        otherExpenses: financialOtherCost,
        total: totalCalculated
      });

      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(amount || 0);
      };

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Project Report - ${fullProject.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 40px;
      background: #f5f5f5;
      color: #1f2937;
    }
    .container { 
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 8px;
    }
    .header { 
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 { 
      color: #1f2937;
      font-size: 28px;
      margin-bottom: 10px;
    }
    .header-meta {
      color: #6b7280;
      font-size: 14px;
    }
    .section { 
      margin-bottom: 30px;
      page-break-inside: avoid;
    }
    .section-title { 
      color: #1f2937;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .info-grid { 
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item { 
      padding: 12px;
      background: #f9fafb;
      border-radius: 6px;
    }
    .info-label { 
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .info-value { 
      color: #1f2937;
      font-size: 16px;
      font-weight: 600;
    }
    .status-badge { 
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      background: #e5e7eb;
    }
    .progress-bar { 
      width: 100%;
      height: 24px;
      background: #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      margin-top: 8px;
    }
    .progress-fill { 
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
      color: white;
      font-size: 12px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    table { 
      width: 100%;
      border-collapse: collapse;
      margin-top: 15px;
    }
    th, td { 
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }
    th { 
      background: #f9fafb;
      color: #6b7280;
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
    }
    tr:hover { background: #f9fafb; }
    .cost-summary { 
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
      border: 1px solid #bae6fd;
    }
    .cost-row { 
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #bfdbfe;
    }
    .cost-row:last-child { 
      border-bottom: none;
      font-weight: 700;
      font-size: 18px;
      color: #1e40af;
      margin-top: 8px;
      padding-top: 12px;
      border-top: 2px solid #3b82f6;
    }
    .footer { 
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
    }
    .empty { 
      text-align: center;
      padding: 30px;
      color: #9ca3af;
      font-style: italic;
    }
    .warning { 
      background: #fef3c7;
      border: 1px solid #fbbf24;
      padding: 12px;
      border-radius: 6px;
      margin: 10px 0;
      color: #92400e;
      font-size: 14px;
    }
    @media print {
      body { background: white; padding: 0; }
      .container { box-shadow: none; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${fullProject.name}</h1>
      <div class="header-meta">
        Project ID: ${fullProject.id} | Generated: ${new Date().toLocaleString('en-IN', { 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        })}
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Project Overview</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Client</div>
          <div class="info-value">${fullProject.clientName || fullProject.client || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Type</div>
          <div class="info-value">${fullProject.projectType || fullProject.type || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Location</div>
          <div class="info-value">${fullProject.location || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Status</div>
          <div class="info-value">
            <span class="status-badge">${fullProject.status || 'N/A'}</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Site Engineer</div>
          <div class="info-value">${fullProject.assignedEngineer?.name || fullProject.engineerName || fullProject.engineer?.name || 'Not Assigned'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Timeline</div>
          <div class="info-value">${
            fullProject.startDate 
              ? new Date(fullProject.startDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
              : 'N/A'
          } to ${
            fullProject.endDate 
              ? new Date(fullProject.endDate).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata' })
              : 'N/A'
          }</div>
        </div>
      </div>
      <div style="margin-top: 20px;">
        <div class="info-label">Project Progress</div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${fullProject.progress || 0}%">
            ${fullProject.progress || 0}%
          </div>
        </div>
      </div>
    </div>

    <div class="section">
      <h2 class="section-title">Financial Summary</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Total Budget</div>
          <div class="info-value">${formatCurrency(fullProject.budget || 0)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Spent</div>
          <div class="info-value">${formatCurrency(fullProject.spent || totalCalculated)}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Remaining Budget</div>
          <div class="info-value">${formatCurrency((fullProject.budget || 0) - (fullProject.spent || totalCalculated))}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Budget Utilization</div>
          <div class="info-value">${fullProject.budget > 0 ? (((fullProject.spent || totalCalculated) / fullProject.budget) * 100).toFixed(1) : 0}%</div>
        </div>
      </div>
      
      <div class="cost-summary">
        <div class="cost-row">
          <span>Materials Cost</span>
          <span>${formatCurrency(materialCost + financialMaterialCost)}</span>
        </div>
        ${materialCost > 0 ? `
        <div class="cost-row" style="padding-left: 20px; font-size: 14px; color: #6b7280; border: none;">
          <span>└ From Usage Logs</span>
          <span>${formatCurrency(materialCost)}</span>
        </div>
        ` : ''}
        ${financialMaterialCost > 0 ? `
        <div class="cost-row" style="padding-left: 20px; font-size: 14px; color: #6b7280; border: none;">
          <span>└ From Expenses (Material-related)</span>
          <span>${formatCurrency(financialMaterialCost)}</span>
        </div>
        ` : ''}
        <div class="cost-row">
          <span>Labour Cost</span>
          <span>${formatCurrency(labourCost)}</span>
        </div>
        <div class="cost-row">
          <span>Contract Payments</span>
          <span>${formatCurrency(contractCost)}</span>
        </div>
        ${financialOtherCost > 0 ? `
        <div class="cost-row">
          <span>Other Expenses</span>
          <span>${formatCurrency(financialOtherCost)}</span>
        </div>
        ` : ''}
        <div class="cost-row">
          <span>Total Calculated</span>
          <span>${formatCurrency(totalCalculated)}</span>
        </div>
      </div>
    </div>

    ${materials.logs && materials.logs.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Materials Used (${materials.logs.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Material Name</th>
            <th>Quantity</th>
            <th>Unit Rate</th>
            <th>Total Cost</th>
            <th>Date Used</th>
          </tr>
        </thead>
        <tbody>
          ${materials.logs.map(log => {
            const qty = parseFloat(log.quantity) || 0;
            // ✅ FIX: Use defaultRate (the actual field in your schema)
            const rate = parseFloat(log.material?.defaultRate) || 0;
            const total = qty * rate;
            
            // ✅ Better date handling
            let dateStr = 'N/A';
            if (log.date) {
              try {
                dateStr = new Date(log.date).toLocaleDateString('en-IN');
              } catch (e) {
                dateStr = 'Invalid Date';
              }
            }
            
            return `
            <tr>
              <td>${log.material?.name || 'Unknown Material'}</td>
              <td>${qty.toFixed(2)} ${log.material?.unit || ''}</td>
              <td>${formatCurrency(rate)}</td>
              <td>${formatCurrency(total)}</td>
              <td>${dateStr}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <h2 class="section-title">Materials Used</h2>
      <div class="empty">No materials have been used in this project yet.</div>
    </div>
    `}

    ${labour.labourers && labour.labourers.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Labour Details (${labour.labourers.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Total Paid</th>
            <th>Payment Count</th>
          </tr>
        </thead>
        <tbody>
          ${labour.labourers.map(lab => {
            const totalPaid = Array.isArray(lab.payments) 
              ? lab.payments.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
              : parseFloat(lab.totalPaid) || 0;
            return `
            <tr>
              <td>${lab.name || 'N/A'}</td>
              <td>${lab.phone || 'N/A'}</td>
              <td>${formatCurrency(totalPaid)}</td>
              <td>${lab.payments?.length || 0} payments</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <h2 class="section-title">Labour Details</h2>
      <div class="empty">No labour records found for this project.</div>
    </div>
    `}

    ${contracts.contracts && contracts.contracts.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Contracts (${contracts.contracts.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Contractor</th>
            <th>Work Type</th>
            <th>Contract Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${contracts.contracts.map(con => `
            <tr>
              <td>${con.contractorName || 'N/A'}</td>
              <td>${con.workStatus || 'N/A'}</td>
              <td>${formatCurrency(con.contractAmount || 0)}</td>
              <td><span class="status-badge">${con.workStatus || 'N/A'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    ` : `
    <div class="section">
      <h2 class="section-title">Contracts</h2>
      <div class="empty">No contracts found for this project.</div>
    </div>
    `}

    ${financial.project?.expenses && financial.project.expenses.length > 0 ? `
    <div class="section">
      <h2 class="section-title">Financial Expenses Breakdown (${financial.project.expenses.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th>Amount</th>
            <th>Classification</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          ${financial.project.expenses.map(exp => {
            const category = (exp.category || '').toLowerCase();
            const isMaterial = materialCategories.some(mat => category.includes(mat));
            
            let dateStr = 'N/A';
            if (exp.createdAt) {
              try {
                dateStr = new Date(exp.createdAt).toLocaleDateString('en-IN');
              } catch (e) {
                dateStr = 'Invalid Date';
              }
            }
            
            return `
            <tr>
              <td>${exp.category || 'N/A'}</td>
              <td>${formatCurrency(exp.amount || 0)}</td>
              <td>
                <span class="status-badge" style="${isMaterial ? 'background: #dbeafe; color: #1e40af;' : 'background: #fef3c7; color: #92400e;'}">
                  ${isMaterial ? 'Material-related' : 'Other Expense'}
                </span>
              </td>
              <td>${dateStr}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
      <div style="margin-top: 15px; padding: 12px; background: #f0f9ff; border-left: 4px solid #3b82f6; font-size: 14px;">
        <strong>Note:</strong> Expenses with categories like "material", "paint", "cement", etc. are automatically classified as material costs.
      </div>
    </div>
    ` : ''}

    <div class="footer">
      <p>This report was automatically generated on ${new Date().toLocaleString('en-IN', { 
        dateStyle: 'full', 
        timeStyle: 'short' 
      })}</p>
      <p style="margin-top: 8px;">Project Management System</p>
    </div>
  </div>
</body>
</html>`;
      
      return html;
    } catch (error) {
      console.error('❌ Error generating report:', error);
      throw error;
    }
  },

  /**
   * Generate consolidated PDF report for all projects and download it.
   * @param {Array} projects - Array of project data
   * @returns {Promise<boolean>} Success status
   */
  downloadAllProjectsReport: async (projects) => {
    try {
      const token = getToken();

      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!Array.isArray(projects) || projects.length === 0) {
        throw new Error('No projects available to generate report');
      }

      console.log('Generating consolidated PDF report for', projects.length, 'projects');

      const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
      const totalSpent = projects.reduce((sum, p) => sum + (parseFloat(p.spent) || 0), 0);
      const totalRemaining = totalBudget - totalSpent;
      const statusCounts = {
        planning: projects.filter((p) => p.status === 'Planning').length,
        inProgress: projects.filter((p) => p.status === 'In Progress').length,
        onHold: projects.filter((p) => ['On Hold', 'Hold'].includes((p.status || '').trim())).length,
        completed: projects.filter((p) => p.status === 'Completed').length,
      };

      const generatedAt = new Date();
      const generatedAtText = generatedAt.toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const marginX = 14;
      let cursorY = 14;

      drawPdfCard(doc, marginX, cursorY, pageWidth - (marginX * 2), 24, PDF_THEME.white);
      doc.setFillColor(...hexToRgb(PDF_THEME.primary));
      doc.roundedRect(marginX, cursorY, 4, 24, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.setTextColor(...hexToRgb(PDF_THEME.text));
      doc.text('Project Management Report', marginX + 10, cursorY + 9);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...hexToRgb(PDF_THEME.muted));
      doc.text('Vconstech ERP / Project Management', marginX + 10, cursorY + 15);
      doc.text(`Generated Date & Time: ${generatedAtText}`, pageWidth - marginX, cursorY + 15, { align: 'right' });
      cursorY += 32;

      const cardGap = 6;
      const cardWidth = (pageWidth - (marginX * 2) - (cardGap * 3)) / 4;
      const summaryCards = [
        { label: 'Total Projects', value: String(projects.length), fill: '#FFF8E1', text: PDF_THEME.text },
        { label: 'Total Budget', value: formatReportCurrency(totalBudget), fill: '#FFF7D6', text: PDF_THEME.text },
        { label: 'Total Spent', value: formatReportCurrency(totalSpent), fill: PDF_THEME.surface, text: PDF_THEME.text },
        {
          label: 'Remaining Budget',
          value: formatReportCurrency(totalRemaining),
          fill: totalRemaining < 0 ? '#FEE2E2' : '#ECFDF5',
          text: totalRemaining < 0 ? '#B91C1C' : '#047857',
        },
      ];

      summaryCards.forEach((card, index) => {
        const cardX = marginX + index * (cardWidth + cardGap);
        drawPdfCard(doc, cardX, cursorY, cardWidth, 24, card.fill);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(...hexToRgb(PDF_THEME.muted));
        doc.text(card.label.toUpperCase(), cardX + 4, cursorY + 7);
        doc.setFontSize(14);
        doc.setTextColor(...hexToRgb(card.text));
        doc.text(card.value, cardX + 4, cursorY + 17);
      });
      cursorY += 32;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...hexToRgb(PDF_THEME.text));
      doc.text('Project Status Overview', marginX, cursorY);
      cursorY += 5;

      const statusCards = [
        { label: 'Planning', count: statusCounts.planning, fill: '#FFFBEB', accent: PDF_THEME.planning },
        { label: 'In Progress', count: statusCounts.inProgress, fill: '#EFF6FF', accent: PDF_THEME.inProgress },
        { label: 'On Hold', count: statusCounts.onHold, fill: '#FEF2F2', accent: PDF_THEME.onHold },
        { label: 'Completed', count: statusCounts.completed, fill: '#ECFDF5', accent: PDF_THEME.completed },
      ];

      statusCards.forEach((card, index) => {
        const cardX = marginX + index * (cardWidth + cardGap);
        drawPdfCard(doc, cardX, cursorY, cardWidth, 20, card.fill);
        doc.setFillColor(...hexToRgb(card.accent));
        doc.circle(cardX + 6, cursorY + 6, 1.6, 'F');
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...hexToRgb(PDF_THEME.text));
        doc.text(card.label, cardX + 10, cursorY + 7);
        doc.setFontSize(16);
        doc.text(String(card.count), cardX + 4, cursorY + 16);
      });
      cursorY += 28;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...hexToRgb(PDF_THEME.text));
      doc.text('Project Details Table', marginX, cursorY);
      cursorY += 4;

      const tableRows = projects.map((project) => {
        const budget = parseFloat(project.budget) || 0;
        const spent = parseFloat(project.spent) || 0;
        const remaining = budget - spent;
        const progress = project.progress || 0;

        return [
          project.id || 'N/A',
          project.name || 'Unnamed Project',
          project.clientName || project.client || 'N/A',
          project.type || project.projectType || 'N/A',
          project.status || 'N/A',
          `${progress}%`,
          formatReportCurrency(budget),
          formatReportCurrency(spent),
          formatReportCurrency(remaining),
          project.assignedEngineer?.name || project.assignedEngineerName || project.engineerName || project.engineer?.name || 'Not Assigned',
          project.location || 'N/A',
        ];
      });

      autoTable(doc, {
        startY: cursorY,
        margin: { left: marginX, right: marginX, bottom: 22 },
        head: [[
          'Project ID',
          'Project Name',
          'Client',
          'Type',
          'Status',
          'Progress',
          'Budget',
          'Spent',
          'Remaining',
          'Site Engineer',
          'Location',
        ]],
        body: tableRows,
        theme: 'grid',
        styles: {
          font: 'helvetica',
          fontSize: 8,
          textColor: hexToRgb(PDF_THEME.text),
          lineColor: hexToRgb(PDF_THEME.border),
          lineWidth: 0.2,
          cellPadding: 2.8,
          valign: 'middle',
        },
        headStyles: {
          fillColor: hexToRgb(PDF_THEME.primary),
          textColor: hexToRgb(PDF_THEME.text),
          fontStyle: 'bold',
          halign: 'left',
        },
        alternateRowStyles: {
          fillColor: hexToRgb(PDF_THEME.rowAlt),
        },
        bodyStyles: {
          fillColor: hexToRgb(PDF_THEME.white),
        },
        columnStyles: {
          0: { cellWidth: 18 },
          1: { cellWidth: 28 },
          2: { cellWidth: 24 },
          3: { cellWidth: 18 },
          4: { cellWidth: 20, halign: 'center' },
          5: { cellWidth: 16, halign: 'center' },
          6: { cellWidth: 22, halign: 'right' },
          7: { cellWidth: 22, halign: 'right' },
          8: { cellWidth: 24, halign: 'right' },
          9: { cellWidth: 28 },
          10: { cellWidth: 24 },
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 8) {
            const rawValue = String(data.cell.raw || '');
            data.cell.styles.textColor = rawValue.includes('-') ? hexToRgb('#B91C1C') : hexToRgb('#047857');
            data.cell.styles.fontStyle = 'bold';
          }

          if (data.section === 'body' && data.column.index === 4) {
            data.cell.text = [''];
          }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 4) {
            const status = projects[data.row.index]?.status || 'N/A';
            const tone = getProjectStatusTone(status);
            const badgeWidth = Math.min(data.cell.width - 4, Math.max(12, doc.getTextWidth(status) + 8));
            const badgeHeight = 6;
            const badgeX = data.cell.x + (data.cell.width - badgeWidth) / 2;
            const badgeY = data.cell.y + (data.cell.height - badgeHeight) / 2;

            doc.setFillColor(...hexToRgb(tone.fill));
            doc.roundedRect(badgeX, badgeY, badgeWidth, badgeHeight, 3, 3, 'F');
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(7);
            doc.setTextColor(...hexToRgb(tone.text));
            doc.text(status, badgeX + badgeWidth / 2, badgeY + 4, { align: 'center' });
          }
        },
      });

      addProjectReportFooter(doc, generatedAtText);

      const date = generatedAt.toISOString().split('T')[0];
      doc.save(`Project_Management_Report_${date}.pdf`);

      console.log('All projects PDF report downloaded successfully');
      return true;
    } catch (error) {
      console.error('Error generating all projects PDF report:', error);
      throw error;
    }
  },

  downloadReport: async (html, projectName) => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-10000px';
    container.style.top = '0';
    container.style.width = '900px';
    container.innerHTML = html;
    document.body.appendChild(container);

    const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_');
    const date = new Date().toISOString().split('T')[0];
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });

    try {
      await doc.html(container, {
        x: 18,
        y: 18,
        width: 559,
        windowWidth: 900,
        html2canvas: {
          scale: 0.7,
          useCORS: true,
          backgroundColor: '#ffffff',
        },
        autoPaging: 'text',
      });
      doc.save(`${sanitizedName}_Report_${date}.pdf`);
    } finally {
      document.body.removeChild(container);
    }
  }
};

export default projectReportService;
