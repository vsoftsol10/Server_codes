// import React, { useState, useEffect } from 'react';
// import { ChevronDown, ChevronUp, Edit2, Printer, Plus, Save, X, AlertTriangle, Trash2 } from 'lucide-react';
// import Navbar from '../../components/common/Navbar';
// import SidePannel from '../../components/common/SidePannel';
// import { financialAPI } from '../../api/financialAPI';
// import LoadingScreen from '../../components/common/Loadingscreen';

// const FinancialManagement = () => {
//   const [projects, setProjects] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedCard, setExpandedCard] = useState(null);
//   const [editingExpense, setEditingExpense] = useState(null);
//   const [addingExpense, setAddingExpense] = useState(null);
//   const [newExpense, setNewExpense] = useState({ category: '', amount: '' });
//   const [showBudgetWarning, setShowBudgetWarning] = useState(false);
//   const [budgetWarningData, setBudgetWarningData] = useState(null);

//   // Load projects from API
//   useEffect(() => {
//     document.title = "Vconstech - Admin";
//     loadProjects();
//   }, []);

//   const loadProjects = async () => {
//     try {
//       setLoading(true);
//       const response = await financialAPI.getProjects();
//       setProjects(response.projects || []);
//     } catch (error) {
//       console.error('Failed to load projects:', error);
//       alert(`Error loading projects: ${error.error || error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const toggleCard = (id) => {
//     setExpandedCard(expandedCard === id ? null : id);
//   };

//   const handleEditExpense = (projectId, expense) => {
//     setEditingExpense({ projectId, ...expense });
//   };

//   const handleSaveExpense = async () => {
//     try {
//       await financialAPI.updateExpense(editingExpense.id, {
//         category: editingExpense.category,
//         amount: parseFloat(editingExpense.amount)
//       });
      
//       // Reload projects to get updated data
//       await loadProjects();
//       setEditingExpense(null);
//       alert('Expense updated successfully!');
//     } catch (error) {
//       console.error('Failed to update expense:', error);
//       alert(`Error: ${error.error || error.message}`);
//     }
//   };

//   const handleDeleteExpense = async (projectId, expenseId) => {
//     if (window.confirm('Are you sure you want to delete this expense?')) {
//       try {
//         await financialAPI.deleteExpense(expenseId);
//         await loadProjects();
//         alert('Expense deleted successfully!');
//       } catch (error) {
//         console.error('Failed to delete expense:', error);
//         alert(`Error: ${error.error || error.message}`);
//       }
//     }
//   };

//   const handleAddExpenseClick = (projectId) => {
//     setAddingExpense(projectId);
//     setNewExpense({ category: '', amount: '' });
//   };

//   const handleAddExpense = async (projectId) => {
//     if (!newExpense.category || !newExpense.amount) {
//       alert('Please fill in both category and amount');
//       return;
//     }

//     const project = projects.find(p => p.id === projectId);
//     const totalSpent = calculateTotalSpent(project.expenses);
//     const newAmount = parseFloat(newExpense.amount);
//     const newTotal = totalSpent + newAmount;
//     const exceedAmount = newTotal - project.budget;

//     if (exceedAmount > 0) {
//       setBudgetWarningData({
//         projectId,
//         exceedAmount,
//         newExpense: { ...newExpense, amount: newAmount }
//       });
//       setShowBudgetWarning(true);
//     } else {
//       await addExpenseToProject(projectId);
//     }
//   };

//   const addExpenseToProject = async (projectId) => {
//     try {
//       await financialAPI.addExpense(projectId, {
//         category: newExpense.category,
//         amount: parseFloat(newExpense.amount)
//       });
      
//       await loadProjects();
//       setAddingExpense(null);
//       setNewExpense({ category: '', amount: '' });
//       setShowBudgetWarning(false);
//       setBudgetWarningData(null);
//       alert('Expense added successfully!');
//     } catch (error) {
//       console.error('Failed to add expense:', error);
//       alert(`Error: ${error.error || error.message}`);
//     }
//   };

//   const handlePrint = (project) => {
//     const printWindow = window.open('', '_blank');
//     const totalSpent = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
//     const remaining = project.budget - totalSpent;
    
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>Project Financial Report - ${project.name}</title>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 40px; }
//             h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
//             h2 { color: #374151; margin-top: 30px; }
//             table { width: 100%; border-collapse: collapse; margin-top: 20px; }
//             th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
//             th { background-color: #f3f4f6; font-weight: bold; }
//             .summary { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
//             .summary-item { display: flex; justify-content: space-between; padding: 8px 0; }
//             .total { font-weight: bold; font-size: 18px; border-top: 2px solid #1e40af; padding-top: 10px; }
//           </style>
//         </head>
//         <body>
//           <h1>Project Financial Report</h1> 
//           <p><strong>Project Name: </strong>${project.name}</p>
//           <p><strong>Due Date:</strong> ${new Date(project.dueDate).toLocaleDateString()}</p>
          
//           <div class="summary">
//             <div class="summary-item">
//               <span>Budget:</span>
//               <span>₹${project.budget.toLocaleString()}</span>
//             </div>
//             <div class="summary-item">
//               <span>Quotation Amount:</span>
//               <span>₹${project.quotationAmount.toLocaleString()}</span>
//             </div>
//             <div class="summary-item">
//               <span>Total Spent:</span>
//               <span>₹${totalSpent.toLocaleString()}</span>
//             </div>
//             <div class="summary-item total">
//               <span>Remaining:</span>
//               <span style="color: ${remaining >= 0 ? '#059669' : '#dc2626'}">₹${remaining.toLocaleString()}</span>
//             </div>
//           </div>

//           <h2>Expense Details</h2>
//           <table>
//             <thead>
//               <tr>
//                 <th>Category</th>
//                 <th>Amount</th>
//               </tr>
//             </thead>
//             <tbody>
//               ${project.expenses.map(exp => `
//                 <tr>
//                   <td>${exp.category}</td>
//                   <td>₹${exp.amount.toLocaleString()}</td>
//                 </tr>
//               `).join('')}
//             </tbody>
//           </table>
          
//           <script>window.print(); window.onafterprint = () => window.close();</script>
//         </body>
//       </html>
//     `);
//     printWindow.document.close();
//   };

//   const calculateTotalSpent = (expenses) => {
//     return expenses.reduce((sum, exp) => sum + exp.amount, 0);
//   };

//  if (loading) return <LoadingScreen message="Loading Projects..." />;

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="fixed top-0 left-0 right-0 z-50 h-16">
//         <Navbar />
//       </nav>

//       <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
//         <SidePannel />
//       </aside>

//       <div className="pt-20 pl-0 md:pl-64 md:pt-25">
//         <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8">
//           <div className="max-w-7xl mx-auto">
//             <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
//               <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">
//                 Financial Management
//               </h1>
//             </div>

//             {/* Budget Warning Modal */}
//             {showBudgetWarning && budgetWarningData && (
//               <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-50 p-4">
//                 <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-red-500">
//                   <div className="flex items-center gap-3 mb-4">
//                     <AlertTriangle size={32} className="text-red-600" />
//                     <h2 className="text-xl sm:text-2xl font-bold text-red-600">Budget Warning!</h2>
//                   </div>
//                   <p className="text-gray-700 mb-6">
//                     Adding this expense will exceed the budget by <span className="font-bold text-red-600">₹{budgetWarningData.exceedAmount.toLocaleString()}</span>
//                   </p>
//                   <p className="text-gray-600 mb-6 text-sm">Do you want to continue?</p>
//                   <div className="flex gap-3">
//                     <button
//                       onClick={() => addExpenseToProject(budgetWarningData.projectId)}
//                       className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
//                     >
//                       Yes, Continue
//                     </button>
//                     <button
//                       onClick={() => {
//                         setShowBudgetWarning(false);
//                         setBudgetWarningData(null);
//                       }}
//                       className="flex-1 bg-gray-300 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Projects List */}
//             <div className="space-y-4">
//               {projects.length === 0 ? (
//                 <div className="bg-white rounded-xl shadow-lg p-8 text-center">
//                   <p className="text-gray-500 text-lg">No projects found.</p>
//                 </div>
//               ) : (
//                 projects.map((project) => {
//                   const totalSpent = calculateTotalSpent(project.expenses);
//                   const remaining = project.budget - totalSpent;
//                   const exceeded = remaining < 0 ? Math.abs(remaining) : 0;
//                   const isExpanded = expandedCard === project.id;

//                   return (
//                     <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
//                       <div
//                         onClick={() => toggleCard(project.id)}
//                         className="p-4 sm:p-6 cursor-pointer hover:bg-amber-50 transition-colors"
//                       >
//                         <div className="flex justify-between items-start sm:items-center gap-4">
//                           <div className="flex-1 min-w-0">
//                             <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 truncate">
//                               {project.name}
//                             </h2>
//                             <div className="flex flex-col sm:flex-row sm:gap-6 lg:gap-8 text-xs sm:text-sm space-y-2 sm:space-y-0">
//                               <div className="flex items-center gap-2">
//                                 <span className="text-gray-500">Budget:</span>
//                                 <span className="font-semibold text-gray-800">₹{project.budget.toLocaleString()}</span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <span className="text-gray-500">Due:</span>
//                                 <span className="font-semibold text-gray-800">
//                                   {new Date(project.dueDate).toLocaleDateString('en-IN', { 
//                                     day: '2-digit', 
//                                     month: 'short', 
//                                     year: 'numeric' 
//                                   })}
//                                 </span>
//                               </div>
//                               <div className="flex items-center gap-2">
//                                 <span className="text-gray-500">Spent:</span>
//                                 <span className="font-semibold text-gray-800">₹{totalSpent.toLocaleString()}</span>
//                               </div>
//                             </div>
//                           </div>
//                           <div className="text-amber-600 flex-shrink-0">
//                             {isExpanded ? <ChevronUp size={24} className="sm:w-7 sm:h-7" /> : <ChevronDown size={24} className="sm:w-7 sm:h-7" />}
//                           </div>
//                         </div>
//                       </div>

//                       {isExpanded && (
//                         <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t-2 border-gray-200 bg-amber-50">
//                           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 mb-4 sm:mb-6">
//                             <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
//                               <p className="text-xs sm:text-sm text-gray-600 mb-1">Quotation Amount</p>
//                               <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{project.quotationAmount.toLocaleString()}</p>
//                             </div>
//                             <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
//                               <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Spent</p>
//                               <p className="text-xl sm:text-2xl font-bold text-green-600">₹{totalSpent.toLocaleString()}</p>
//                             </div>
//                             <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
//                               <p className="text-xs sm:text-sm text-gray-600 mb-1">Remaining Budget</p>
//                               <p className={`text-xl sm:text-2xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
//                                 ₹{remaining.toLocaleString()}
//                               </p>
//                             </div>
//                             {exceeded > 0 && (
//                               <div className="bg-red-50 p-3 sm:p-4 rounded-lg shadow-md border-2 border-red-400">
//                                 <p className="text-xs sm:text-sm text-red-600 mb-1 flex items-center gap-1">
//                                   <AlertTriangle size={16} />
//                                   Budget Exceeded
//                                 </p>
//                                 <p className="text-xl sm:text-2xl font-bold text-red-600">₹{exceeded.toLocaleString()}</p>
//                               </div>
//                             )}
//                           </div>

//                           <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
//                             <h3 className="text-lg sm:text-xl font-bold text-gray-800">Expense Breakdown</h3>
//                             <div className="flex flex-col sm:flex-row gap-2">
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handleAddExpenseClick(project.id);
//                                 }}
//                                 className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
//                               >
//                                 <Plus size={18} />
//                                 <span>Add Expense</span>
//                               </button>
//                               <button
//                                 onClick={(e) => {
//                                   e.stopPropagation();
//                                   handlePrint(project);
//                                 }}
//                                 className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-md"
//                               >
//                                 <Printer size={18} />
//                                 <span>Print Report</span>
//                               </button>
//                             </div>
//                           </div>

//                           {addingExpense === project.id && (
//                             <div className="bg-green-50 p-4 rounded-lg shadow-md mb-4 border-2 border-green-400">
//                               <h4 className="font-semibold text-gray-800 mb-3">Add New Expense</h4>
//                               <div className="space-y-3">
//                                 <input
//                                   type="text"
//                                   value={newExpense.category}
//                                   onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
//                                   className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
//                                   placeholder="Category (e.g., Furniture, Materials)"
//                                 />
//                                 <input
//                                   type="number"
//                                   value={newExpense.amount}
//                                   onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
//                                   className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
//                                   placeholder="Amount"
//                                 />
//                                 <div className="flex gap-2">
//                                   <button
//                                     onClick={() => handleAddExpense(project.id)}
//                                     className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
//                                   >
//                                     <Save size={16} />
//                                     Add Expense
//                                   </button>
//                                   <button
//                                     onClick={() => {
//                                       setAddingExpense(null);
//                                       setNewExpense({ category: '', amount: '' });
//                                     }}
//                                     className="flex-1 flex items-center justify-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
//                                   >
//                                     <X size={16} />
//                                     Cancel
//                                   </button>
//                                 </div>
//                               </div>
//                             </div>
//                           )}

//                           <div className="space-y-3">
//                             {project.expenses.map((expense) => (
//                               <div key={expense.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
//                                 {editingExpense && editingExpense.id === expense.id && editingExpense.projectId === project.id ? (
//                                   <div className="space-y-3">
//                                     <input
//                                       type="text"
//                                       value={editingExpense.category}
//                                       onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
//                                       className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm"
//                                       placeholder="Category"
//                                     />
//                                     <input
//                                       type="number"
//                                       value={editingExpense.amount}
//                                       onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
//                                       className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm"
//                                       placeholder="Amount"
//                                     />
//                                     <div className="flex gap-2">
//                                       <button
//                                         onClick={handleSaveExpense}
//                                         className="flex-1 flex items-center justify-center gap-1 bg-[#ffbe2a] text-[#000000] px-4 py-2 rounded-lg hover:bg-[#f5b621] transition-colors text-sm font-medium"
//                                       >
//                                         <Save size={16} />
//                                         Save
//                                       </button>
//                                       <button
//                                         onClick={() => setEditingExpense(null)}
//                                         className="flex-1 flex items-center justify-center gap-1 bg-[#000] text-[#ffbe2a] px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
//                                       >
//                                         <X size={16} />
//                                         Cancel
//                                       </button>
//                                     </div>
//                                   </div>
//                                 ) : (
//                                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
//                                     <div className="flex-1 min-w-0">
//                                       <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
//                                         <span className="bg-[#FFbe2a] text-black px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
//                                           {expense.category}
//                                         </span>
//                                         <span className="text-lg sm:text-xl font-bold text-gray-800">₹{expense.amount.toLocaleString()}</span>
//                                       </div>
//                                     </div>
//                                     <div className="flex gap-5">
//                                       <button
//                                         onClick={() => handleEditExpense(project.id, expense)}
//                                         className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm"
//                                       >
//                                         <Edit2 size={16} className="sm:w-5 sm:h-5" />
//                                         <span>Edit</span>
//                                       </button>
//                                       <button
//                                         onClick={() => handleDeleteExpense(project.id, expense.id)}
//                                         className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors font-medium text-sm"
//                                       >
//                                         <Trash2 size={16} className="sm:w-5 sm:h-5" />
//                                         <span>Delete</span>
//                                       </button>
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   );
//                 })
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default FinancialManagement;
import React, { useState, useEffect, useRef } from 'react';
import {
  Edit2, Printer, Plus, Save, X, AlertTriangle, Trash2,
  Eye, Search, Filter, ChevronLeft, ChevronRight, ChevronDown,
  FileText, Building2
} from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import SidePannel from '../../components/common/SidePannel';
import { financialAPI } from '../../api/financialAPI';
import LoadingScreen from '../../components/common/Loadingscreen';

/* ── Pagination helper ── */
const getPaginationItems = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
};

/* ── Status badge ── */
const StatusBadge = ({ status }) => {
  const cfg = {
    Active:    'bg-green-100 text-green-700',
    Planning:  'bg-blue-100 text-blue-700',
    'On Hold': 'bg-orange-100 text-orange-700',
    Completed: 'bg-purple-100 text-purple-700',
  }[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cfg}`}>{status || 'Active'}</span>
  );
};

const FinancialManagement = () => {
  const [projects, setProjects]               = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [searchQuery, setSearchQuery]         = useState('');
  const [showFilterDrop, setShowFilterDrop]   = useState(false);
  const [filterStatus, setFilterStatus]       = useState('all');

  /* pagination */
  const [currentPage, setCurrentPage]         = useState(1);
  const [rowsPerPage, setRowsPerPage]         = useState(10);

  /* right drawer */
  const [drawerProject, setDrawerProject]     = useState(null);

  /* expense state */
  const [editingExpense, setEditingExpense]   = useState(null);
  const [addingExpense, setAddingExpense]     = useState(false);
  const [newExpense, setNewExpense]           = useState({ category: '', amount: '' });
  const [expenseSearch, setExpenseSearch]     = useState('');

  /* budget warning */
  const [showBudgetWarning, setShowBudgetWarning]   = useState(false);
  const [budgetWarningData, setBudgetWarningData]   = useState(null);

  useEffect(() => {
    document.title = 'Vconstech - Admin';
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await financialAPI.getProjects();
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to load projects:', error);
      alert(`Error loading projects: ${error.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ── helpers ── */
  const calculateTotalSpent = (expenses = []) =>
    expenses.reduce((sum, e) => sum + e.amount, 0);

  const getProjectStatus = (project) =>
    project.status || 'Active';

  const fmtCurrency = (v) =>
    `₹${Number(v || 0).toLocaleString('en-IN')}`;

  const fmtDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  /* ── filtered + paginated ── */
  const filteredProjects = projects.filter((p) => {
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filterStatus === 'all' || getProjectStatus(p) === filterStatus;
    return matchSearch && matchFilter;
  });

  const totalPages  = Math.max(1, Math.ceil(filteredProjects.length / rowsPerPage));
  const startIdx    = (currentPage - 1) * rowsPerPage;
  const endIdx      = Math.min(startIdx + rowsPerPage, filteredProjects.length);
  const pageProjects = filteredProjects.slice(startIdx, endIdx);

  const handleRowsPerPageChange = (val) => {
    setRowsPerPage(Number(val));
    setCurrentPage(1);
  };

  /* ── drawer open/close ── */
  const openDrawer = (project) => {
    setDrawerProject(project);
    setAddingExpense(false);
    setEditingExpense(null);
    setExpenseSearch('');
    setNewExpense({ category: '', amount: '' });
  };
  const closeDrawer = () => {
    setDrawerProject(null);
    setEditingExpense(null);
    setAddingExpense(false);
  };

  /* sync drawer project when projects reload */
  useEffect(() => {
    if (drawerProject) {
      const updated = projects.find(p => p.id === drawerProject.id);
      if (updated) setDrawerProject(updated);
    }
  }, [projects]);

  /* ── expense handlers (backend unchanged) ── */
  const handleSaveExpense = async () => {
    try {
      await financialAPI.updateExpense(editingExpense.id, {
        category: editingExpense.category,
        amount: parseFloat(editingExpense.amount),
      });
      await loadProjects();
      setEditingExpense(null);
      alert('Expense updated successfully!');
    } catch (error) {
      alert(`Error: ${error.error || error.message}`);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      await financialAPI.deleteExpense(expenseId);
      await loadProjects();
      alert('Expense deleted successfully!');
    } catch (error) {
      alert(`Error: ${error.error || error.message}`);
    }
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount) {
      alert('Please fill in both category and amount');
      return;
    }
    const totalSpent  = calculateTotalSpent(drawerProject.expenses);
    const newAmount   = parseFloat(newExpense.amount);
    const newTotal    = totalSpent + newAmount;
    const exceedAmount = newTotal - drawerProject.budget;
    if (exceedAmount > 0) {
      setBudgetWarningData({ projectId: drawerProject.id, exceedAmount });
      setShowBudgetWarning(true);
    } else {
      await addExpenseToProject(drawerProject.id);
    }
  };

  const addExpenseToProject = async (projectId) => {
    try {
      await financialAPI.addExpense(projectId, {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
      });
      await loadProjects();
      setAddingExpense(false);
      setNewExpense({ category: '', amount: '' });
      setShowBudgetWarning(false);
      setBudgetWarningData(null);
      alert('Expense added successfully!');
    } catch (error) {
      alert(`Error: ${error.error || error.message}`);
    }
  };

  const handlePrint = (project) => {
    const printWindow = window.open('', '_blank');
    const totalSpent = calculateTotalSpent(project.expenses);
    const remaining  = project.budget - totalSpent;
    printWindow.document.write(`
      <html><head><title>Financial Report - ${project.name}</title>
      <style>
        body{font-family:Arial,sans-serif;padding:40px}
        h1{color:#1e40af;border-bottom:3px solid #1e40af;padding-bottom:10px}
        table{width:100%;border-collapse:collapse;margin-top:20px}
        th,td{padding:12px;text-align:left;border-bottom:1px solid #e5e7eb}
        th{background:#f3f4f6;font-weight:bold}
        .summary{background:#f9fafb;padding:20px;border-radius:8px;margin-top:20px}
        .si{display:flex;justify-content:space-between;padding:8px 0}
        .total{font-weight:bold;font-size:18px;border-top:2px solid #1e40af;padding-top:10px}
      </style></head><body>
      <h1>Project Financial Report</h1>
      <p><strong>Project:</strong> ${project.name}</p>
      <p><strong>Due Date:</strong> ${new Date(project.dueDate).toLocaleDateString()}</p>
      <div class="summary">
        <div class="si"><span>Budget:</span><span>${fmtCurrency(project.budget)}</span></div>
        <div class="si"><span>Quotation Amount:</span><span>${fmtCurrency(project.quotationAmount)}</span></div>
        <div class="si"><span>Total Spent:</span><span>${fmtCurrency(totalSpent)}</span></div>
        <div class="si total"><span>Remaining:</span><span style="color:${remaining>=0?'#059669':'#dc2626'}">${fmtCurrency(remaining)}</span></div>
      </div>
      <h2>Expenses</h2>
      <table><thead><tr><th>Category</th><th>Amount</th></tr></thead><tbody>
      ${(project.expenses||[]).map(e=>`<tr><td>${e.category}</td><td>${fmtCurrency(e.amount)}</td></tr>`).join('')}
      </tbody></table>
      <script>window.print();window.onafterprint=()=>window.close();</script>
      </body></html>
    `);
    printWindow.document.close();
  };

  if (loading) return <LoadingScreen message="Loading Financial Data..." />;

  /* ── drawer expense filtered ── */
  const drawerExpenses = (drawerProject?.expenses || []).filter(e =>
    e.category.toLowerCase().includes(expenseSearch.toLowerCase())
  );

  const drawerTotalSpent   = calculateTotalSpent(drawerProject?.expenses || []);
  const drawerRemaining    = (drawerProject?.budget || 0) - drawerTotalSpent;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16"><Navbar /></nav>
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto"><SidePannel /></aside>

      {/* ── Main content ── */}
      <div className="pt-20 md:pl-64 md:pt-25">
        <div className="px-4 md:px-8 pb-10">

          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Financial Management</h1>
              <p className="text-sm text-gray-500 mt-1">Manage all your projects, quotations, budgets, and expenses.</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Project..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 w-56 shadow-sm"
                />
              </div>
              {/* Filter */}
              <div className="relative">
                <button onClick={() => setShowFilterDrop(!showFilterDrop)}
                  className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                  <Filter className="w-4 h-4" /> Filter
                  {filterStatus !== 'all' && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
                </button>
                {showFilterDrop && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowFilterDrop(false)} />
                    <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 py-1 text-sm">
                      {['all', 'Active', 'Planning', 'On Hold', 'Completed'].map(s => (
                        <button key={s} onClick={() => { setFilterStatus(s); setShowFilterDrop(false); setCurrentPage(1); }}
                          className={`w-full text-left px-3 py-2 transition-colors ${filterStatus === s ? 'bg-yellow-50 text-yellow-800 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}>
                          {s === 'all' ? 'All Status' : s}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
              {/* New Project */}
              <button className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> New Project
              </button>
            </div>
          </div>

          {/* All Projects label + count */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base font-bold text-gray-800">All Projects</span>
            <span className="bg-yellow-400 text-black text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredProjects.length}
            </span>
          </div>

          {/* Table card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="bg-yellow-400">
                    {['Project Name', 'Budget (₹)', 'Spent (₹)', 'Remaining (₹)', 'Due Date', 'Status', 'Action'].map((h) => (
                      <th key={h} className="px-5 py-4 text-left text-xs font-bold text-black uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageProjects.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center">
                        <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                        <p className="text-sm text-gray-500">No projects found</p>
                      </td>
                    </tr>
                  ) : pageProjects.map((project) => {
                    const totalSpent = calculateTotalSpent(project.expenses);
                    const remaining  = project.budget - totalSpent;
                    return (
                      <tr key={project.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-semibold text-gray-900">{project.name}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">{fmtCurrency(project.budget)}</td>
                        <td className="px-5 py-4 text-sm text-gray-700">{fmtCurrency(totalSpent)}</td>
                        <td className="px-5 py-4 text-sm font-medium">
                          <span className={remaining >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {fmtCurrency(remaining)}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-700 whitespace-nowrap">{fmtDate(project.dueDate)}</td>
                        <td className="px-5 py-4"><StatusBadge status={getProjectStatus(project)} /></td>
                        <td className="px-5 py-4">
                          <button onClick={() => openDrawer(project)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">
                            <Eye size={14} /> View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
              {/* Left: Showing info + Show rows dropdown */}
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span>
                  Showing {filteredProjects.length === 0 ? 0 : startIdx + 1}–{endIdx} of {filteredProjects.length} Records
                </span>
                <div className="flex items-center gap-1.5">
                  <span>Show:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => handleRowsPerPageChange(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
                  >
                    {[10, 25, 50, 100].map(n => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right: Prev / pages / Next */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Prev
                </button>
                {getPaginationItems(currentPage, totalPages).map((item, i) =>
                  item === '...'
                    ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
                    : <button key={item} onClick={() => setCurrentPage(item)}
                        className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === item ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:bg-gray-100'}`}>
                        {item}
                      </button>
                )}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ── RIGHT DRAWER OVERLAY ── */}
      {/* ══════════════════════════════════════════════════════ */}
      {drawerProject && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-50 transition-opacity"
            onClick={closeDrawer}
          />
          {/* Drawer panel */}
          <div className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white z-50 shadow-2xl flex flex-col overflow-hidden animate-slide-in-right">

            {/* Drawer header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-900">Project Finance Details</h2>
              <button onClick={closeDrawer} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Scrollable drawer body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Project title row */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Building2 size={24} className="text-orange-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{drawerProject.name}</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Budget: {fmtCurrency(drawerProject.budget)}
                    <span className="mx-2 text-gray-300">|</span>
                    Due Date: {fmtDate(drawerProject.dueDate)}
                  </p>
                </div>
              </div>

              {/* 3 summary cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Quotation Amount', value: fmtCurrency(drawerProject.quotationAmount), color: 'text-blue-600',   bg: 'bg-blue-50',   icon: '📋' },
                  { label: 'Total Spent',       value: fmtCurrency(drawerTotalSpent),              color: 'text-green-600', bg: 'bg-green-50',  icon: '💰' },
                  { label: 'Remaining Budget',  value: fmtCurrency(drawerRemaining),               color: drawerRemaining >= 0 ? 'text-orange-500' : 'text-red-600', bg: 'bg-orange-50', icon: '📊' },
                ].map((card) => (
                  <div key={card.label} className={`${card.bg} rounded-xl p-4`}>
                    <p className="text-xs text-gray-500 mb-2">{card.label}</p>
                    <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
                  </div>
                ))}
              </div>

              {/* Expense History section */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-base font-bold text-gray-900">Expense History</h4>
                  <div className="flex items-center gap-2">
                    {/* Expense search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search Expense..."
                        value={expenseSearch}
                        onChange={(e) => setExpenseSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 w-36"
                      />
                    </div>
                    <button className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                      <Filter size={12} /> Filter
                    </button>
                    <button
                      onClick={() => { setAddingExpense(true); setNewExpense({ category: '', amount: '' }); }}
                      className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Plus size={12} /> Add Expense
                    </button>
                  </div>
                </div>

                {/* Add Expense inline form */}
                {addingExpense && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-3">
                    <h5 className="text-sm font-semibold text-gray-800 mb-3">Add New Expense</h5>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={newExpense.category}
                        onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Category (e.g. Materials)"
                      />
                      <input
                        type="number"
                        value={newExpense.amount}
                        onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                        placeholder="Amount (₹)"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleAddExpense}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        <Save size={14} /> Add Expense
                      </button>
                      <button onClick={() => { setAddingExpense(false); setNewExpense({ category: '', amount: '' }); }}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Expense table */}
                <div className="rounded-xl border border-gray-100 overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-amber-50 border-b border-gray-100">
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Expense Name</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Category</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Amount (₹)</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {drawerExpenses.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-sm text-gray-400">
                            No expenses recorded yet
                          </td>
                        </tr>
                      ) : drawerExpenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                          {editingExpense && editingExpense.id === expense.id ? (
                            <td colSpan={5} className="px-4 py-3">
                              <div className="flex gap-2 items-center">
                                <input
                                  type="text"
                                  value={editingExpense.category}
                                  onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                                  className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                  placeholder="Category"
                                />
                                <input
                                  type="number"
                                  value={editingExpense.amount}
                                  onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                  className="w-32 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                  placeholder="Amount"
                                />
                                <button onClick={handleSaveExpense}
                                  className="flex items-center gap-1 bg-yellow-400 text-black px-3 py-1.5 rounded-lg text-xs font-semibold">
                                  <Save size={12} /> Save
                                </button>
                                <button onClick={() => setEditingExpense(null)}
                                  className="flex items-center gap-1 bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg text-xs">
                                  <X size={12} /> Cancel
                                </button>
                              </div>
                            </td>
                          ) : (
                            <>
                              <td className="px-4 py-3 font-medium text-gray-900">{expense.category}</td>
                              <td className="px-4 py-3">
                                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  {expense.category}
                                </span>
                              </td>
                              <td className="px-4 py-3 font-semibold text-gray-900">{fmtCurrency(expense.amount)}</td>
                              <td className="px-4 py-3">
                                <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                                  Paid
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setEditingExpense({ ...expense, projectId: drawerProject.id })}
                                    className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors">
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {drawerExpenses.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2 px-1">
                    Showing 1 to {drawerExpenses.length} of {drawerExpenses.length} expenses
                  </p>
                )}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex-shrink-0">
              <button onClick={() => handlePrint(drawerProject)}
                className="flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                <Printer size={16} /> Print Report
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Budget Warning Modal ── */}
      {showBudgetWarning && budgetWarningData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-red-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-red-600">Budget Warning!</h2>
            </div>
            <p className="text-gray-700 mb-2">
              Adding this expense will exceed the budget by{' '}
              <span className="font-bold text-red-600">{fmtCurrency(budgetWarningData.exceedAmount)}</span>
            </p>
            <p className="text-gray-500 text-sm mb-5">Do you want to continue?</p>
            <div className="flex gap-3">
              <button onClick={() => addExpenseToProject(budgetWarningData.projectId)}
                className="flex-1 bg-red-600 text-white px-4 py-2.5 rounded-xl hover:bg-red-700 transition-colors font-semibold text-sm">
                Yes, Continue
              </button>
              <button onClick={() => { setShowBudgetWarning(false); setBudgetWarningData(null); }}
                className="flex-1 bg-gray-100 text-gray-800 px-4 py-2.5 rounded-xl hover:bg-gray-200 transition-colors font-semibold text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagement;
