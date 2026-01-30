// src/services/projectReportService.js

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
      const token = localStorage.getItem('token');
      
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
   * Generate consolidated report for all projects
   * @param {Array} projects - Array of project data
   * @returns {Promise<string>} HTML report
   */
  downloadAllProjectsReport: async (projects) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!Array.isArray(projects) || projects.length === 0) {
        throw new Error('No projects available to generate report');
      }

      console.log('📊 Generating consolidated report for', projects.length, 'projects');

      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
          style: 'currency',
          currency: 'INR',
          maximumFractionDigits: 0
        }).format(amount || 0);
      };

      // Calculate totals across all projects
      const totalBudget = projects.reduce((sum, p) => sum + (parseFloat(p.budget) || 0), 0);
      const totalSpent = projects.reduce((sum, p) => sum + (parseFloat(p.spent) || 0), 0);
      const totalRemaining = totalBudget - totalSpent;

      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>All Projects Report</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
      padding: 40px;
      background: #f5f5f5;
      color: #1f2937;
    }
    .container { 
      max-width: 1200px;
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
      font-size: 32px;
      margin-bottom: 10px;
    }
    .header-meta {
      color: #6b7280;
      font-size: 14px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      margin-bottom: 40px;
    }
    .summary-card {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #bae6fd;
    }
    .summary-label {
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .summary-value {
      color: #1e40af;
      font-size: 24px;
      font-weight: 700;
    }
    table { 
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
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
      position: sticky;
      top: 0;
    }
    tr:hover { background: #f9fafb; }
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
      height: 20px;
      background: #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    }
    .progress-fill { 
      height: 100%;
      background: linear-gradient(90deg, #3b82f6, #2563eb);
      color: white;
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .footer { 
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
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
      <h1>All Projects Report</h1>
      <div class="header-meta">
        Total Projects: ${projects.length} | Generated: ${new Date().toLocaleString('en-IN', { 
          dateStyle: 'medium', 
          timeStyle: 'short' 
        })}
      </div>
    </div>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-label">Total Budget</div>
        <div class="summary-value">${formatCurrency(totalBudget)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Total Spent</div>
        <div class="summary-value">${formatCurrency(totalSpent)}</div>
      </div>
      <div class="summary-card">
        <div class="summary-label">Total Remaining</div>
        <div class="summary-value">${formatCurrency(totalRemaining)}</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Project ID</th>
          <th>Project Name</th>
          <th>Client</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Budget</th>
          <th>Spent</th>
          <th>Remaining</th>
          <th>Engineer</th>
        </tr>
      </thead>
      <tbody>
        ${projects.map(project => {
          const budget = parseFloat(project.budget) || 0;
          const spent = parseFloat(project.spent) || 0;
          const remaining = budget - spent;
          const progress = project.progress || 0;
          
          return `
          <tr>
            <td>${project.id || 'N/A'}</td>
            <td><strong>${project.name || 'Unnamed Project'}</strong></td>
            <td>${project.clientName || project.client || 'N/A'}</td>
            <td><span class="status-badge">${project.status || 'N/A'}</span></td>
            <td>
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%">${progress}%</div>
              </div>
            </td>
            <td>${formatCurrency(budget)}</td>
            <td>${formatCurrency(spent)}</td>
            <td style="color: ${remaining < 0 ? '#dc2626' : '#059669'}">${formatCurrency(remaining)}</td>
            <td>${project.assignedEngineer?.name || project.engineerName || project.engineer?.name || 'Not Assigned'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>

    <div class="footer">
      <p>This consolidated report was automatically generated on ${new Date().toLocaleString('en-IN', { 
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
      console.error('❌ Error generating all projects report:', error);
      throw error;
    }
  },

  downloadReport: (html, projectName) => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const sanitizedName = projectName.replace(/[^a-z0-9]/gi, '_');
    const date = new Date().toISOString().split('T')[0];
    a.download = `${sanitizedName}_Report_${date}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

export default projectReportService;