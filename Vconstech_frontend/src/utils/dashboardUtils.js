// File utility functions
export const getFileIcon = (fileName) => {
  if (!fileName) return '📎';
  const ext = fileName.split('.').pop()?.toLowerCase();
  const iconMap = {
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', dwg: '📐', dxf: '📐'
  };
  return iconMap[ext] || '📎';
};

export const getFileType = (fileName) => {
  if (!fileName) return 'FILE';
  return fileName.split('.').pop()?.toUpperCase() || 'FILE';
};

export const formatFileSize = (bytes) => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

// Status utility functions
export const getStatusColor = (status) => {
  const statusLower = status?.toLowerCase();
  const colorMap = {
    'active': 'bg-green-100 text-green-800',
    'ongoing': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'on hold': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-blue-100 text-blue-800',
    'approved': 'bg-green-100 text-green-800',
    'rejected': 'bg-red-100 text-red-800'
  };
  return colorMap[statusLower] || 'bg-gray-100 text-gray-800';
};

export const getStatusDisplay = (status) => {
  const statusMap = {
    'PENDING': 'Planning',
    'ONGOING': 'In Progress',
    'COMPLETED': 'Completed',
    'pending': 'Pending',
    'approved': 'Approved',
    'rejected': 'Rejected'
  };
  return statusMap[status] || status;
};

// File viewing handler
export const handleViewFile = (file, API_BASE_URL) => {
  const fileUrl = file.fileUrl || file.url || file.filePath;
  if (!fileUrl) return alert('File URL not found');

  const base = API_BASE_URL.replace('/api', '');
  const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${base}${fileUrl}`;

  const ext = fileUrl.split('.').pop()?.toLowerCase();
  const viewableInBrowser = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'svg'];

  if (viewableInBrowser.includes(ext)) {
    window.open(fullUrl, '_blank');
  } else {
    // Force download for doc, docx, xls etc.
    const a = document.createElement('a');
    a.href = fullUrl;
    a.download = file.fileName || 'download';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
};

// Print daily progress history
export const generatePrintContent = (dailyProgressHistory, employeeName) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Daily Progress History - ${employeeName}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
          }
          .header h1 {
            margin: 0;
            color: #2563eb;
          }
          .header p {
            margin: 5px 0;
            color: #666;
          }
          .update-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }
          .update-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
          }
          .project-name {
            font-weight: bold;
            color: #1f2937;
            font-size: 16px;
          }
          .date {
            color: #6b7280;
            font-size: 14px;
          }
          .message {
            margin-top: 10px;
            line-height: 1.6;
            color: #374151;
          }
          .section-title {
            font-weight: bold;
            color: #4b5563;
            margin-top: 10px;
            margin-bottom: 5px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 10px;
          }
          @media print {
            .no-print {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Daily Progress History</h1>
          <p><strong>Engineer:</strong> ${employeeName}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString('en-IN')}</p>
        </div>
        
        ${dailyProgressHistory.map(update => `
          <div class="update-card">
            <div class="update-header">
              <div class="project-name">${update.Project?.name || 'Unknown Project'}</div>
              <div class="date">${new Date(update.createdAt).toLocaleDateString('en-IN', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}</div>
            </div>
            
            ${update.message ? `
              <div class="section-title">Progress Update:</div>
              <div class="message">${update.message}</div>
            ` : ''}
            
            ${update.workDone ? `
              <div class="section-title">Work Done:</div>
              <div class="message">${update.workDone}</div>
            ` : ''}
            
            ${update.challenges ? `
              <div class="section-title">Challenges:</div>
              <div class="message">${update.challenges}</div>
            ` : ''}
            
            ${update.nextSteps ? `
              <div class="section-title">Next Steps:</div>
              <div class="message">${update.nextSteps}</div>
            ` : ''}
          </div>
        `).join('')}
        
        <div class="footer">
          <p>This is a system-generated report</p>
          <p>Total Updates: ${dailyProgressHistory.length}</p>
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          }
        </script>
      </body>
    </html>
  `;
};