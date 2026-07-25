// src/services/projectReportService.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getToken } from '../utils/tabToken';
import companyLogoUrl from '../assets/constech-logo.png';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const PDF_THEME = {
  primary: '#FFBE2A',
  ink: '#111827',
  text: '#1F2937',
  muted: '#6B7280',
  border: '#E5E7EB',
  surface: '#F9FAFB',
  rowAlt: '#FFFDF7',
  white: '#FFFFFF',
  green: '#10B981',
  red: '#EF4444',
  blue: '#3B82F6',
  amber: '#F59E0B',
};

const MATERIAL_CATEGORIES = [
  'material', 'paint', 'cement', 'steel', 'wood', 'tiles', 'hardware',
  'glass', 'window', 'door', 'aluminium', 'aluminum', 'iron', 'brick',
  'sand', 'aggregate', 'marble', 'granite', 'plywood', 'pipe', 'wire',
  'cable', 'fixture', 'sanitary', 'plumbing', 'electrical',
];

const toArray = (value) => (Array.isArray(value) ? value : []);

const hexToRgb = (hex) => {
  const normalized = hex.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
  ];
};

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const quantityFormatter = new Intl.NumberFormat('en-IN', {
  maximumFractionDigits: 2,
});

const money = (amount) => (
  currencyFormatter.format(Number(amount || 0))
);

const plainMoney = money;

const formatQuantity = (amount) => quantityFormatter.format(Number(amount || 0));

const formatDate = (value) => {
  if (!value) return 'N/A';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
};

const formatDateTime = (value = new Date()) => (
  new Date(value).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  })
);

const textValue = (value, fallback = 'N/A') => {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value === 'object') return value.name || value.fullName || value.title || fallback;
  return String(value);
};

const clampPercent = (value) => Math.max(0, Math.min(100, Number(value) || 0));

const getProjectId = (project = {}) => project.dbId || project.id || project.projectId;

const getProjectName = (project = {}) => (
  project.name || project.projectName || project.title || 'Project Report'
);

const getEngineerName = (project = {}) => (
  project.assignedEngineer?.name
  || project.assignedEmployee?.name
  || project.engineer?.name
  || project.assignedEngineerName
  || project.assignedEmployeeName
  || project.engineerName
  || 'Not Assigned'
);

const getClientName = (project = {}) => (
  project.clientName || project.client || project.customerName || project.customer?.name || 'N/A'
);

const getCompanyName = (company = {}, project = {}) => (
  company.name || project.companyName || project.company?.name || 'Vconstech'
);

const getBudget = (project = {}) => Number(project.totalBudget ?? project.budget ?? project.quotationAmount ?? 0) || 0;

const getSpent = (project = {}, expenses = []) => {
  const explicit = project.totalSpent ?? project.spent ?? project.actualCost;
  if (explicit !== undefined && explicit !== null && explicit !== '') return Number(explicit) || 0;
  return expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
};

const getStatusCounts = (projects) => ({
  planning: projects.filter((item) => String(item.status || '').toLowerCase().trim() === 'planning').length,
  inProgress: projects.filter((item) => ['in progress', 'ongoing'].includes(String(item.status || '').toLowerCase().trim())).length,
  onHold: projects.filter((item) => ['on hold', 'hold'].includes(String(item.status || '').toLowerCase().trim())).length,
  completed: projects.filter((item) => String(item.status || '').toLowerCase().trim() === 'completed').length,
});

const fetchJsonWithFallback = async (token, url, fallback) => {
  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return fallback;

    const data = await response.json();
    return data && typeof data === 'object' ? data : fallback;
  } catch (error) {
    console.error(`Failed to fetch ${url}:`, error);
    return fallback;
  }
};

const normalizeReportData = (report = {}) => {
  const projects = toArray(report.projects);
  const featuredProject = report.featuredProject || projects[0] || {};
  const financialExpenses = toArray(report.financialExpenses);
  const totalBudget = Number(report.totalBudget ?? projects.reduce((sum, item) => sum + getBudget(item), 0) ?? getBudget(featuredProject)) || 0;
  const totalSpent = Number(report.totalSpent ?? projects.reduce((sum, item) => sum + getSpent(item), 0) ?? getSpent(featuredProject, financialExpenses)) || 0;

  return {
    generatedAtText: report.generatedAtText || formatDateTime(),
    company: report.company || featuredProject.company || {},
    projects,
    featuredProject,
    projectMaterials: toArray(report.projectMaterials),
    financialExpenses,
    dailyUpdates: toArray(report.dailyUpdates),
    teamMembers: toArray(report.teamMembers),
    totalBudget,
    totalSpent,
    totalRemaining: Number(report.totalRemaining ?? (totalBudget - totalSpent)) || 0,
    statusCounts: report.statusCounts || getStatusCounts(projects),
  };
};

const getStatusTone = (status) => {
  const normalized = String(status || '').toLowerCase().trim();
  if (normalized === 'planning') return { fill: '#FEF3C7', text: '#92400E', accent: PDF_THEME.amber };
  if (normalized === 'in progress' || normalized === 'ongoing') return { fill: '#DBEAFE', text: '#1D4ED8', accent: PDF_THEME.blue };
  if (normalized === 'on hold' || normalized === 'hold') return { fill: '#FEE2E2', text: '#B91C1C', accent: PDF_THEME.red };
  if (normalized === 'completed') return { fill: '#D1FAE5', text: '#065F46', accent: PDF_THEME.green };
  return { fill: '#E5E7EB', text: '#374151', accent: '#9CA3AF' };
};

const loadImageAsDataUrl = async (src) => {
  if (!src) return null;

  try {
    const response = await fetch(src);
    if (!response.ok) return null;
    const blob = await response.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Company logo could not be loaded for PDF report:', error);
    return null;
  }
};

const addFooter = (doc, generatedAtText) => {
  const pageCount = doc.getNumberOfPages();

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
    doc.setPage(pageNumber);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    doc.setDrawColor(...hexToRgb(PDF_THEME.border));
    doc.line(36, pageHeight - 32, pageWidth - 36, pageHeight - 32);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...hexToRgb(PDF_THEME.muted));
    doc.text('Generated by ERP', 36, pageHeight - 17);
    doc.text(generatedAtText, pageWidth / 2, pageHeight - 17, { align: 'center' });
    doc.text(`Page ${pageNumber} of ${pageCount}`, pageWidth - 36, pageHeight - 17, { align: 'right' });
  }
};

const createPdfContext = (orientation = 'portrait') => {
  const doc = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 36;
  return {
    doc,
    pageWidth,
    pageHeight,
    margin,
    contentWidth: pageWidth - (margin * 2),
    y: 36,
  };
};

const ensureSpace = (ctx, height) => {
  if (ctx.y + height > ctx.pageHeight - 52) {
    ctx.doc.addPage();
    ctx.y = 36;
  }
};

const drawHeader = (ctx, title, subtitle, generatedAtText, company = {}, logoDataUrl = null) => {
  const { doc, margin, contentWidth, pageWidth } = ctx;
  const headerHeight = 86;
  const companyName = getCompanyName(company);

  doc.setFillColor(...hexToRgb(PDF_THEME.white));
  doc.setDrawColor(...hexToRgb(PDF_THEME.border));
  doc.roundedRect(margin, ctx.y, contentWidth, headerHeight, 6, 6, 'FD');
  doc.setFillColor(...hexToRgb(PDF_THEME.ink));
  doc.rect(margin, ctx.y, contentWidth, 8, 'F');
  doc.setFillColor(...hexToRgb(PDF_THEME.white));

  doc.setDrawColor(...hexToRgb(PDF_THEME.border));
  doc.roundedRect(margin + 16, ctx.y + 22, 48, 48, 6, 6, 'D');
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'PNG', margin + 20, ctx.y + 26, 40, 40);
    } catch (error) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(...hexToRgb(PDF_THEME.ink));
      doc.text('VC', margin + 40, ctx.y + 52, { align: 'center' });
    }
  } else {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...hexToRgb(PDF_THEME.ink));
    doc.text('VC', margin + 40, ctx.y + 52, { align: 'center' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...hexToRgb(PDF_THEME.ink));
  doc.text(companyName, margin + 78, ctx.y + 31);
  doc.setFontSize(20);
  doc.text(title, margin + 78, ctx.y + 54);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(PDF_THEME.muted));
  doc.text(`Project: ${subtitle}`, margin + 78, ctx.y + 70);
  doc.setFontSize(9);
  doc.text('Generated Date & Time', pageWidth - margin - 8, ctx.y + 33, { align: 'right' });
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...hexToRgb(PDF_THEME.ink));
  doc.text(generatedAtText, pageWidth - margin - 8, ctx.y + 50, { align: 'right' });
  doc.setFillColor(...hexToRgb(PDF_THEME.primary));
  doc.rect(margin, ctx.y + headerHeight - 4, contentWidth, 4, 'F');
  ctx.y += headerHeight + 18;
};

const drawSectionTitle = (ctx, title) => {
  ensureSpace(ctx, 38);
  const { doc, margin, contentWidth } = ctx;
  doc.setFillColor(...hexToRgb(PDF_THEME.surface));
  doc.setDrawColor(...hexToRgb(PDF_THEME.border));
  doc.roundedRect(margin, ctx.y, contentWidth, 24, 5, 5, 'FD');
  doc.setFillColor(...hexToRgb(PDF_THEME.primary));
  doc.rect(margin, ctx.y, 5, 24, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...hexToRgb(PDF_THEME.ink));
  doc.text(title, margin + 14, ctx.y + 16);
  ctx.y += 34;
};

const drawMetricCards = (ctx, cards) => {
  const { doc, margin, contentWidth } = ctx;
  const gap = 10;
  const cardWidth = (contentWidth - (gap * (cards.length - 1))) / cards.length;
  ensureSpace(ctx, 64);

  cards.forEach((card, index) => {
    const x = margin + index * (cardWidth + gap);
    doc.setFillColor(...hexToRgb(card.fill || '#FFF7D6'));
    doc.setDrawColor(...hexToRgb('#F2CF68'));
    doc.roundedRect(x, ctx.y, cardWidth, 56, 6, 6, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(...hexToRgb(PDF_THEME.muted));
    doc.text(String(card.label).toUpperCase(), x + 8, ctx.y + 16);
    doc.setFontSize(12);
    doc.setTextColor(...hexToRgb(card.text || PDF_THEME.text));
    doc.text(doc.splitTextToSize(String(card.value), cardWidth - 16).slice(0, 2), x + 8, ctx.y + 35);
  });

  ctx.y += 70;
};

const drawKeyValueTable = (ctx, title, rows) => {
  drawSectionTitle(ctx, title);
  autoTable(ctx.doc, {
    startY: ctx.y,
    margin: { left: ctx.margin, right: ctx.margin, bottom: 48 },
    body: rows,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: 6,
      lineColor: hexToRgb(PDF_THEME.border),
      lineWidth: 0.35,
      valign: 'middle',
    },
    columnStyles: {
      0: { cellWidth: 112, fillColor: hexToRgb(PDF_THEME.surface), textColor: hexToRgb(PDF_THEME.muted), fontStyle: 'bold' },
      1: { cellWidth: 155, textColor: hexToRgb(PDF_THEME.text) },
      2: { cellWidth: 112, fillColor: hexToRgb(PDF_THEME.surface), textColor: hexToRgb(PDF_THEME.muted), fontStyle: 'bold' },
      3: { cellWidth: ctx.contentWidth - 379, textColor: hexToRgb(PDF_THEME.text) },
    },
  });
  ctx.y = ctx.doc.lastAutoTable.finalY + 16;
};

const drawTable = (ctx, title, head, body, emptyText, options = {}) => {
  drawSectionTitle(ctx, title);

  if (!body.length) {
    ensureSpace(ctx, 42);
    ctx.doc.setFillColor(...hexToRgb(PDF_THEME.surface));
    ctx.doc.setDrawColor(...hexToRgb(PDF_THEME.border));
    ctx.doc.roundedRect(ctx.margin, ctx.y, ctx.contentWidth, 34, 6, 6, 'FD');
    ctx.doc.setFont('helvetica', 'bold');
    ctx.doc.setFontSize(9);
    ctx.doc.setTextColor(...hexToRgb(PDF_THEME.muted));
    ctx.doc.text(emptyText, ctx.pageWidth / 2, ctx.y + 21, { align: 'center' });
    ctx.y += 48;
    return;
  }

  autoTable(ctx.doc, {
    startY: ctx.y,
    margin: { left: ctx.margin, right: ctx.margin, bottom: 48 },
    head: [head],
    body,
    theme: 'grid',
    styles: {
      font: 'helvetica',
      fontSize: options.fontSize || 8,
      cellPadding: options.cellPadding || 5,
      lineColor: hexToRgb(PDF_THEME.border),
      lineWidth: 0.35,
      valign: 'middle',
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: hexToRgb(PDF_THEME.ink),
      textColor: hexToRgb(PDF_THEME.white),
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: hexToRgb(PDF_THEME.rowAlt),
    },
    columnStyles: options.columnStyles || {},
    didParseCell: options.didParseCell,
    didDrawCell: options.didDrawCell,
  });

  ctx.y = ctx.doc.lastAutoTable.finalY + 16;
};

const drawProgress = (ctx, progress) => {
  drawSectionTitle(ctx, 'Progress');
  const width = ctx.contentWidth;
  ensureSpace(ctx, 42);
  ctx.doc.setFillColor(...hexToRgb('#E5E7EB'));
  ctx.doc.roundedRect(ctx.margin, ctx.y, width, 28, 14, 14, 'F');
  if (progress > 0) {
    ctx.doc.setFillColor(...hexToRgb(PDF_THEME.primary));
    ctx.doc.rect(ctx.margin, ctx.y, (width * progress) / 100, 28, 'F');
  }
  ctx.doc.setFont('helvetica', 'bold');
  ctx.doc.setFontSize(14);
  ctx.doc.setTextColor(...hexToRgb(PDF_THEME.ink));
  ctx.doc.text(`${progress}%`, ctx.pageWidth / 2, ctx.y + 19, { align: 'center' });
  ctx.y += 48;
};

const buildMaterialRows = (materials) => materials.map((item) => {
  const material = item.material || item;
  const quantity = item.quantityNeeded ?? item.quantity ?? item.usedQuantity ?? material.quantity ?? '';
  const rate = material.defaultRate ?? item.defaultRate ?? item.rate ?? item.unitRate ?? 0;
  const total = Number(item.totalCost ?? item.amount ?? ((Number(quantity) || 0) * (Number(rate) || 0))) || 0;
  return [
    textValue(material.name || item.name),
    textValue(material.category || item.category),
    formatQuantity(quantity),
    textValue(material.unit || item.unit, ''),
    money(rate),
    money(total),
    formatDate(item.dueDate || item.createdAt || item.date),
  ];
});

const getMaterialUsageSummary = (materials) => (
  materials.reduce((summary, item) => {
    const material = item.material || item;
    const quantity = Number(item.quantityNeeded ?? item.quantity ?? item.usedQuantity ?? material.quantity ?? 0) || 0;
    const rate = Number(material.defaultRate ?? item.defaultRate ?? item.rate ?? item.unitRate ?? 0) || 0;
    const total = Number(item.totalCost ?? item.amount ?? (quantity * rate)) || 0;

    return {
      totalEntries: summary.totalEntries + 1,
      totalQuantity: summary.totalQuantity + quantity,
      grandTotalCost: summary.grandTotalCost + total,
    };
  }, {
    totalEntries: 0,
    totalQuantity: 0,
    grandTotalCost: 0,
  })
);

const buildExpenseRows = (expenses) => expenses.map((expense) => [
  textValue(expense.description || expense.title || expense.name || expense.category),
  textValue(expense.category),
  money(expense.amount),
  textValue(expense.status || expense.paymentStatus || 'Recorded'),
  formatDate(expense.date || expense.createdAt || expense.expenseDate),
]);

const buildDailyUpdateRows = (updates) => updates.map((update) => [
  formatDate(update.date || update.createdAt),
  textValue(update.workDone || update.update || update.description || update.progressNote || update.notes),
  textValue(update.progress ?? update.progressPercentage ?? update.completionPercentage, 'N/A'),
  textValue(update.createdBy?.name || update.employee?.name || update.user?.name || update.updatedBy),
]);

const buildTeamRows = (teamMembers) => teamMembers.map((member) => [
  textValue(member.name || member.fullName),
  textValue(member.role || member.designation || member.position || 'Team Member'),
  textValue(member.phone || member.mobile || member.email),
]);

const drawSingleProjectReport = (report, logoDataUrl = null) => {
  const normalized = normalizeReportData(report);
  const project = normalized.featuredProject || {};
  const expenses = normalized.financialExpenses;
  const materialSummary = getMaterialUsageSummary(normalized.projectMaterials);
  const budget = getBudget(project) || normalized.totalBudget;
  const spent = getSpent(project, expenses) || normalized.totalSpent;
  const remaining = budget - spent;
  const materialCost = expenses
    .filter((expense) => MATERIAL_CATEGORIES.some((item) => String(expense.category || '').toLowerCase().includes(item)))
    .reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0);
  const progress = clampPercent(project.progress);
  const ctx = createPdfContext('portrait');

  drawHeader(ctx, 'Material Usage Report', getProjectName(project), normalized.generatedAtText, normalized.company, logoDataUrl);
  drawMetricCards(ctx, [
    { label: 'Project Name', value: getProjectName(project) },
    { label: 'Total Entries', value: materialSummary.totalEntries },
    { label: 'Total Quantity', value: formatQuantity(materialSummary.totalQuantity) },
    { label: 'Grand Total Cost', value: money(materialSummary.grandTotalCost), text: PDF_THEME.green },
  ]);

  drawKeyValueTable(ctx, 'Company Information', [
    ['Company', textValue(normalized.company.name || project.companyName || 'Vconstech'), 'Generated By', 'Vconstech ERP'],
    ['Address', textValue(normalized.company.address || project.companyAddress), 'Contact', textValue(normalized.company.phone || normalized.company.email)],
  ]);

  drawKeyValueTable(ctx, 'Customer Information', [
    ['Customer', getClientName(project), 'Phone', textValue(project.clientPhone || project.customerPhone || project.customer?.phone)],
    ['Email', textValue(project.clientEmail || project.customerEmail || project.customer?.email), 'Address', textValue(project.clientAddress || project.customerAddress || project.customer?.address)],
  ]);

  drawKeyValueTable(ctx, 'Project Information', [
    ['Project ID', textValue(project.projectId || project.id), 'Project Name', getProjectName(project)],
    ['Type', textValue(project.projectType || project.type), 'Location', textValue(project.location)],
    ['Site Engineer', getEngineerName(project), 'Description', textValue(project.description)],
  ]);

  drawKeyValueTable(ctx, 'Project Status', [
    ['Status', textValue(project.status), 'Current Progress', `${progress}%`],
    ['Priority', textValue(project.priority), 'Phase', textValue(project.phase || project.stage)],
  ]);

  drawKeyValueTable(ctx, 'Timeline', [
    ['Start Date', formatDate(project.startDate), 'End Date', formatDate(project.endDate)],
    ['Expected Completion', formatDate(project.expectedCompletionDate || project.endDate), 'Contract Date', formatDate(project.contractDate)],
  ]);

  drawProgress(ctx, progress);

  drawKeyValueTable(ctx, 'Budget Summary', [
    ['Quoted Amount', money(project.quotationAmount), 'Approved Budget', money(budget)],
    ['Total Spent', money(spent), 'Remaining Budget', money(remaining)],
  ]);

  drawKeyValueTable(ctx, 'Financial Summary', [
    ['Material Expenses', money(materialCost), 'Other Expenses', money(spent - materialCost)],
    ['Utilization', budget > 0 ? `${((spent / budget) * 100).toFixed(1)}%` : '0.0%', 'Balance Status', remaining < 0 ? 'Over Budget' : 'Within Budget'],
  ]);

  drawTable(
    ctx,
    'Material Usage Details',
    ['Material', 'Category', 'Qty', 'Unit', 'Rate (\u20B9)', 'Cost (\u20B9)', 'Date'],
    buildMaterialRows(normalized.projectMaterials),
    'No materials available for this project.',
    {
      fontSize: 8,
      cellPadding: 5,
      columnStyles: {
        0: { cellWidth: 108 },
        1: { cellWidth: 78 },
        2: { cellWidth: 46, halign: 'center' },
        3: { cellWidth: 44, halign: 'center' },
        4: { cellWidth: 76, halign: 'right' },
        5: { cellWidth: 82, halign: 'right' },
        6: { cellWidth: 88 },
      },
    }
  );
  drawTable(ctx, 'Expense History', ['Expense', 'Category', 'Amount', 'Status', 'Date'], buildExpenseRows(expenses), 'No expenses recorded for this project.');
  drawTable(ctx, 'Team Members', ['Name', 'Role', 'Contact'], buildTeamRows(normalized.teamMembers), 'No team members assigned.');
  drawTable(ctx, 'Daily Updates', ['Date', 'Update', 'Progress', 'Updated By'], buildDailyUpdateRows(normalized.dailyUpdates), 'No daily updates available.');

  addFooter(ctx.doc, normalized.generatedAtText);
  return ctx.doc;
};

const drawAllProjectsReport = (report, logoDataUrl = null) => {
  const normalized = normalizeReportData(report);
  const ctx = createPdfContext('landscape');

  drawHeader(ctx, 'Project Management Report', `${normalized.projects.length} Projects`, normalized.generatedAtText, normalized.company, logoDataUrl);
  drawMetricCards(ctx, [
    { label: 'Total Projects', value: normalized.projects.length },
    { label: 'Total Budget', value: money(normalized.totalBudget) },
    { label: 'Total Spent', value: money(normalized.totalSpent) },
    { label: 'Remaining', value: money(normalized.totalRemaining), text: normalized.totalRemaining < 0 ? PDF_THEME.red : PDF_THEME.green },
  ]);

  drawMetricCards(ctx, [
    { label: 'Planning', value: normalized.statusCounts.planning, fill: '#FEF3C7' },
    { label: 'In Progress', value: normalized.statusCounts.inProgress, fill: '#DBEAFE' },
    { label: 'On Hold', value: normalized.statusCounts.onHold, fill: '#FEE2E2' },
    { label: 'Completed', value: normalized.statusCounts.completed, fill: '#D1FAE5' },
  ]);

  drawTable(
    ctx,
    'Project Portfolio',
    ['Project ID', 'Project', 'Customer', 'Type', 'Status', 'Timeline', 'Progress', 'Budget', 'Spent', 'Engineer', 'Location'],
    normalized.projects.map((project) => {
      const budget = getBudget(project);
      const spent = getSpent(project);
      return [
        textValue(project.projectId || project.id),
        getProjectName(project),
        getClientName(project),
        textValue(project.projectType || project.type),
        textValue(project.status),
        `${formatDate(project.startDate)} to ${formatDate(project.endDate)}`,
        `${clampPercent(project.progress)}%`,
        plainMoney(budget),
        plainMoney(spent),
        getEngineerName(project),
        textValue(project.location),
      ];
    }),
    'No projects available to report.',
    {
      fontSize: 7.5,
      cellPadding: 4,
      columnStyles: {
        0: { cellWidth: 48 },
        1: { cellWidth: 80 },
        2: { cellWidth: 70 },
        3: { cellWidth: 52 },
        4: { cellWidth: 58 },
        5: { cellWidth: 86 },
        6: { cellWidth: 44, halign: 'center' },
        7: { cellWidth: 58, halign: 'right' },
        8: { cellWidth: 58, halign: 'right' },
        9: { cellWidth: 66 },
        10: { cellWidth: 72 },
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 4) {
          const tone = getStatusTone(data.cell.raw);
          data.cell.styles.fillColor = hexToRgb(tone.fill);
          data.cell.styles.textColor = hexToRgb(tone.text);
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.halign = 'center';
        }
      },
    }
  );

  if (normalized.featuredProject && getProjectId(normalized.featuredProject)) {
    drawKeyValueTable(ctx, 'Featured Project Information', [
      ['Project', getProjectName(normalized.featuredProject), 'Customer', getClientName(normalized.featuredProject)],
      ['Timeline', `${formatDate(normalized.featuredProject.startDate)} to ${formatDate(normalized.featuredProject.endDate)}`, 'Engineer', getEngineerName(normalized.featuredProject)],
    ]);
    drawTable(
      ctx,
      'Featured Project Materials',
      ['Material', 'Category', 'Qty', 'Unit', 'Rate (\u20B9)', 'Cost (\u20B9)', 'Date'],
      buildMaterialRows(normalized.projectMaterials),
      'No materials available for the featured project.',
      {
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'center' },
          4: { halign: 'right' },
          5: { halign: 'right' },
        },
      }
    );
    drawTable(ctx, 'Featured Project Expenses', ['Expense', 'Category', 'Amount', 'Status', 'Date'], buildExpenseRows(normalized.financialExpenses), 'No expenses recorded for the featured project.');
    drawTable(ctx, 'Featured Project Daily Updates', ['Date', 'Update', 'Progress', 'Updated By'], buildDailyUpdateRows(normalized.dailyUpdates), 'No daily updates available for the featured project.');
  }

  addFooter(ctx.doc, normalized.generatedAtText);
  return ctx.doc;
};

const buildSingleProjectReportData = async (project) => {
  const authToken = getToken();
  if (!authToken) throw new Error('No authentication token found');

  const selectedProjectId = getProjectId(project);
  if (!selectedProjectId) throw new Error('Project ID is missing. Cannot generate report.');

  const [projectDetailsRaw, financialRaw, projectMaterialsRaw, dailyUpdatesRaw] = await Promise.all([
    fetchJsonWithFallback(authToken, `${API_BASE_URL}/projects/${selectedProjectId}`, { success: false, project: null }),
    fetchJsonWithFallback(authToken, `${API_BASE_URL}/financial/projects/${selectedProjectId}`, { success: false, project: { expenses: [] } }),
    fetchJsonWithFallback(authToken, `${API_BASE_URL}/project-materials/${selectedProjectId}`, { success: false, projectMaterials: [], materials: [], data: [] }),
    fetchJsonWithFallback(authToken, `${API_BASE_URL}/daily-progress/project/${selectedProjectId}`, { success: false, dailyUpdates: [], updates: [], data: [] }),
  ]);

  const fullProject = {
    ...project,
    ...(projectDetailsRaw.project || projectDetailsRaw.data || {}),
  };
  const financialProject = financialRaw.project || financialRaw.data || {};
  const expenses = Array.isArray(financialProject.expenses)
    ? financialProject.expenses
    : toArray(financialRaw.expenses);
  const projectMaterials = toArray(projectMaterialsRaw.projectMaterials || projectMaterialsRaw.materials || projectMaterialsRaw.data);
  const dailyUpdates = toArray(dailyUpdatesRaw.dailyUpdates || dailyUpdatesRaw.updates || dailyUpdatesRaw.data);
  const teamMembers = toArray(fullProject.teamMembers || fullProject.assignedEmployees);
  const assignedEngineer = fullProject.assignedEngineer || projectDetailsRaw.project?.assignedEngineer || project.assignedEngineer;
  if (assignedEngineer && !teamMembers.length) teamMembers.push(assignedEngineer);

  const budget = Number(fullProject.totalBudget ?? fullProject.budget ?? fullProject.quotationAmount ?? financialProject.totalBudget ?? 0) || 0;
  const spent = Number(
    fullProject.totalSpent
    ?? fullProject.spent
    ?? financialProject.totalSpent
    ?? financialProject.spent
    ?? expenses.reduce((sum, expense) => sum + (Number(expense.amount) || 0), 0)
  ) || 0;

  return normalizeReportData({
    generatedAtText: formatDateTime(),
    projects: [fullProject],
    featuredProject: fullProject,
    company: fullProject.company,
    projectMaterials,
    financialExpenses: expenses,
    dailyUpdates,
    teamMembers,
    totalBudget: budget,
    totalSpent: spent,
    totalRemaining: budget - spent,
    statusCounts: getStatusCounts([fullProject]),
  });
};

const projectReportService = {
  generateReport: async (project) => buildSingleProjectReportData(project),

  downloadAllProjectsReport: async (projects) => {
    try {
      const authToken = getToken();
      if (!authToken) throw new Error('No authentication token found');
      if (!Array.isArray(projects) || projects.length === 0) {
        throw new Error('No projects available to generate report');
      }

      const featuredProject = projects[0] || {};
      const featuredProjectId = getProjectId(featuredProject);
      const [financialRaw, projectMaterialsRaw, dailyUpdatesRaw] = await Promise.all([
        featuredProjectId
          ? fetchJsonWithFallback(authToken, `${API_BASE_URL}/financial/projects/${featuredProjectId}`, { success: false, project: { expenses: [] } })
          : Promise.resolve({ success: false, project: { expenses: [] } }),
        featuredProjectId
          ? fetchJsonWithFallback(authToken, `${API_BASE_URL}/project-materials/${featuredProjectId}`, { success: false, projectMaterials: [], materials: [], data: [] })
          : Promise.resolve({ success: false, projectMaterials: [], materials: [], data: [] }),
        featuredProjectId
          ? fetchJsonWithFallback(authToken, `${API_BASE_URL}/daily-progress/project/${featuredProjectId}`, { success: false, dailyUpdates: [], updates: [], data: [] })
          : Promise.resolve({ success: false, dailyUpdates: [], updates: [], data: [] }),
      ]);

      const featuredFinancial = financialRaw.project || financialRaw.data || {};
      const report = normalizeReportData({
        generatedAtText: formatDateTime(),
        projects,
        featuredProject,
        projectMaterials: projectMaterialsRaw.projectMaterials || projectMaterialsRaw.materials || projectMaterialsRaw.data,
        financialExpenses: featuredFinancial.expenses || financialRaw.expenses,
        dailyUpdates: dailyUpdatesRaw.dailyUpdates || dailyUpdatesRaw.updates || dailyUpdatesRaw.data,
        teamMembers: featuredProject.assignedEngineer ? [featuredProject.assignedEngineer] : [],
        totalBudget: projects.reduce((sum, item) => sum + getBudget(item), 0),
        totalSpent: projects.reduce((sum, item) => sum + getSpent(item), 0),
        statusCounts: getStatusCounts(projects),
      });

      const logoDataUrl = await loadImageAsDataUrl(companyLogoUrl);
      const doc = drawAllProjectsReport(report, logoDataUrl);
      doc.save(`Project_Management_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating all projects PDF report:', error);
      throw error;
    }
  },

  downloadReport: async (report, projectName) => {
    try {
      const normalizedReport = typeof report === 'string' ? null : normalizeReportData(report);
      if (!normalizedReport) throw new Error('Project report data is required to generate the PDF');

      const logoDataUrl = await loadImageAsDataUrl(companyLogoUrl);
      const doc = drawSingleProjectReport(normalizedReport, logoDataUrl);
      const sanitizedName = String(projectName || getProjectName(normalizedReport.featuredProject) || 'Project_Report').replace(/[^a-z0-9]/gi, '_');
      doc.save(`${sanitizedName}_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      return true;
    } catch (error) {
      console.error('Error generating project PDF report:', error);
      throw error;
    }
  },
};

export default projectReportService;
