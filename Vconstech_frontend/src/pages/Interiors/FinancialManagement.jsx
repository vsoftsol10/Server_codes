import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Edit2, Printer, Plus, Save, X, AlertTriangle, Trash2 } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import SidePannel from '../../components/common/SidePannel';
import { financialAPI } from '../../api/financialAPI';

const FinancialManagement = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCard, setExpandedCard] = useState(null);
  const [editingExpense, setEditingExpense] = useState(null);
  const [addingExpense, setAddingExpense] = useState(null);
  const [newExpense, setNewExpense] = useState({ category: '', amount: '' });
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [budgetWarningData, setBudgetWarningData] = useState(null);

  // Load projects from API
  useEffect(() => {
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

  const toggleCard = (id) => {
    setExpandedCard(expandedCard === id ? null : id);
  };

  const handleEditExpense = (projectId, expense) => {
    setEditingExpense({ projectId, ...expense });
  };

  const handleSaveExpense = async () => {
    try {
      await financialAPI.updateExpense(editingExpense.id, {
        category: editingExpense.category,
        amount: parseFloat(editingExpense.amount)
      });
      
      // Reload projects to get updated data
      await loadProjects();
      setEditingExpense(null);
      alert('Expense updated successfully!');
    } catch (error) {
      console.error('Failed to update expense:', error);
      alert(`Error: ${error.error || error.message}`);
    }
  };

  const handleDeleteExpense = async (projectId, expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await financialAPI.deleteExpense(expenseId);
        await loadProjects();
        alert('Expense deleted successfully!');
      } catch (error) {
        console.error('Failed to delete expense:', error);
        alert(`Error: ${error.error || error.message}`);
      }
    }
  };

  const handleAddExpenseClick = (projectId) => {
    setAddingExpense(projectId);
    setNewExpense({ category: '', amount: '' });
  };

  const handleAddExpense = async (projectId) => {
    if (!newExpense.category || !newExpense.amount) {
      alert('Please fill in both category and amount');
      return;
    }

    const project = projects.find(p => p.id === projectId);
    const totalSpent = calculateTotalSpent(project.expenses);
    const newAmount = parseFloat(newExpense.amount);
    const newTotal = totalSpent + newAmount;
    const exceedAmount = newTotal - project.budget;

    if (exceedAmount > 0) {
      setBudgetWarningData({
        projectId,
        exceedAmount,
        newExpense: { ...newExpense, amount: newAmount }
      });
      setShowBudgetWarning(true);
    } else {
      await addExpenseToProject(projectId);
    }
  };

  const addExpenseToProject = async (projectId) => {
    try {
      await financialAPI.addExpense(projectId, {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount)
      });
      
      await loadProjects();
      setAddingExpense(null);
      setNewExpense({ category: '', amount: '' });
      setShowBudgetWarning(false);
      setBudgetWarningData(null);
      alert('Expense added successfully!');
    } catch (error) {
      console.error('Failed to add expense:', error);
      alert(`Error: ${error.error || error.message}`);
    }
  };

  const handlePrint = (project) => {
    const printWindow = window.open('', '_blank');
    const totalSpent = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const remaining = project.budget - totalSpent;
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Project Financial Report - ${project.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px; }
            h2 { color: #374151; margin-top: 30px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
            th { background-color: #f3f4f6; font-weight: bold; }
            .summary { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 20px; }
            .summary-item { display: flex; justify-content: space-between; padding: 8px 0; }
            .total { font-weight: bold; font-size: 18px; border-top: 2px solid #1e40af; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>Project Financial Report</h1>
          <h2>${project.name}</h2>
          <p><strong>Due Date:</strong> ${new Date(project.dueDate).toLocaleDateString()}</p>
          
          <div class="summary">
            <div class="summary-item">
              <span>Budget:</span>
              <span>₹${project.budget.toLocaleString()}</span>
            </div>
            <div class="summary-item">
              <span>Quotation Amount:</span>
              <span>₹${project.quotationAmount.toLocaleString()}</span>
            </div>
            <div class="summary-item">
              <span>Total Spent:</span>
              <span>₹${totalSpent.toLocaleString()}</span>
            </div>
            <div class="summary-item total">
              <span>Remaining:</span>
              <span style="color: ${remaining >= 0 ? '#059669' : '#dc2626'}">₹${remaining.toLocaleString()}</span>
            </div>
          </div>

          <h2>Expense Details</h2>
          <table>
            <thead>
              <tr>
                <th>Category</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${project.expenses.map(exp => `
                <tr>
                  <td>${exp.category}</td>
                  <td>₹${exp.amount.toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <script>window.print(); window.onafterprint = () => window.close();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const calculateTotalSpent = (expenses) => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl font-semibold text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="pt-20 pl-16 md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                Financial Management
              </h1>
            </div>

            {/* Budget Warning Modal */}
            {showBudgetWarning && budgetWarningData && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-4 border-red-500">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={32} className="text-red-600" />
                    <h2 className="text-xl sm:text-2xl font-bold text-red-600">Budget Warning!</h2>
                  </div>
                  <p className="text-gray-700 mb-6">
                    Adding this expense will exceed the budget by <span className="font-bold text-red-600">₹{budgetWarningData.exceedAmount.toLocaleString()}</span>
                  </p>
                  <p className="text-gray-600 mb-6 text-sm">Do you want to continue?</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => addExpenseToProject(budgetWarningData.projectId)}
                      className="flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors font-semibold"
                    >
                      Yes, Continue
                    </button>
                    <button
                      onClick={() => {
                        setShowBudgetWarning(false);
                        setBudgetWarningData(null);
                      }}
                      className="flex-1 bg-gray-300 text-gray-800 px-4 py-3 rounded-lg hover:bg-gray-400 transition-colors font-semibold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Projects List */}
            <div className="space-y-4">
              {projects.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <p className="text-gray-500 text-lg">No projects found.</p>
                </div>
              ) : (
                projects.map((project) => {
                  const totalSpent = calculateTotalSpent(project.expenses);
                  const remaining = project.budget - totalSpent;
                  const exceeded = remaining < 0 ? Math.abs(remaining) : 0;
                  const isExpanded = expandedCard === project.id;

                  return (
                    <div key={project.id} className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300">
                      <div
                        onClick={() => toggleCard(project.id)}
                        className="p-4 sm:p-6 cursor-pointer hover:bg-amber-50 transition-colors"
                      >
                        <div className="flex justify-between items-start sm:items-center gap-4">
                          <div className="flex-1 min-w-0">
                            <h2 className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 sm:mb-3 truncate">
                              {project.name}
                            </h2>
                            <div className="flex flex-col sm:flex-row sm:gap-6 lg:gap-8 text-xs sm:text-sm space-y-2 sm:space-y-0">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Budget:</span>
                                <span className="font-semibold text-gray-800">₹{project.budget.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Due:</span>
                                <span className="font-semibold text-gray-800">
                                  {new Date(project.dueDate).toLocaleDateString('en-IN', { 
                                    day: '2-digit', 
                                    month: 'short', 
                                    year: 'numeric' 
                                  })}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-gray-500">Spent:</span>
                                <span className="font-semibold text-gray-800">₹{totalSpent.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-amber-600 flex-shrink-0">
                            {isExpanded ? <ChevronUp size={24} className="sm:w-7 sm:h-7" /> : <ChevronDown size={24} className="sm:w-7 sm:h-7" />}
                          </div>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t-2 border-gray-200 bg-amber-50">
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6 mb-4 sm:mb-6">
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">Quotation Amount</p>
                              <p className="text-xl sm:text-2xl font-bold text-blue-600">₹{project.quotationAmount.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">Total Spent</p>
                              <p className="text-xl sm:text-2xl font-bold text-green-600">₹{totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
                              <p className="text-xs sm:text-sm text-gray-600 mb-1">Remaining Budget</p>
                              <p className={`text-xl sm:text-2xl font-bold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ₹{remaining.toLocaleString()}
                              </p>
                            </div>
                            {exceeded > 0 && (
                              <div className="bg-red-50 p-3 sm:p-4 rounded-lg shadow-md border-2 border-red-400">
                                <p className="text-xs sm:text-sm text-red-600 mb-1 flex items-center gap-1">
                                  <AlertTriangle size={16} />
                                  Budget Exceeded
                                </p>
                                <p className="text-xl sm:text-2xl font-bold text-red-600">₹{exceeded.toLocaleString()}</p>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-800">Expense Breakdown</h3>
                            <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddExpenseClick(project.id);
                                }}
                                className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shadow-md"
                              >
                                <Plus size={18} />
                                <span>Add Expense</span>
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handlePrint(project);
                                }}
                                className="flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors shadow-md"
                              >
                                <Printer size={18} />
                                <span>Print Report</span>
                              </button>
                            </div>
                          </div>

                          {addingExpense === project.id && (
                            <div className="bg-green-50 p-4 rounded-lg shadow-md mb-4 border-2 border-green-400">
                              <h4 className="font-semibold text-gray-800 mb-3">Add New Expense</h4>
                              <div className="space-y-3">
                                <input
                                  type="text"
                                  value={newExpense.category}
                                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
                                  placeholder="Category (e.g., Furniture, Materials)"
                                />
                                <input
                                  type="number"
                                  value={newExpense.amount}
                                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-sm"
                                  placeholder="Amount"
                                />
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleAddExpense(project.id)}
                                    className="flex-1 flex items-center justify-center gap-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                  >
                                    <Save size={16} />
                                    Add Expense
                                  </button>
                                  <button
                                    onClick={() => {
                                      setAddingExpense(null);
                                      setNewExpense({ category: '', amount: '' });
                                    }}
                                    className="flex-1 flex items-center justify-center gap-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
                                  >
                                    <X size={16} />
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            {project.expenses.map((expense) => (
                              <div key={expense.id} className="bg-white p-3 sm:p-4 rounded-lg shadow-md">
                                {editingExpense && editingExpense.id === expense.id && editingExpense.projectId === project.id ? (
                                  <div className="space-y-3">
                                    <input
                                      type="text"
                                      value={editingExpense.category}
                                      onChange={(e) => setEditingExpense({ ...editingExpense, category: e.target.value })}
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm"
                                      placeholder="Category"
                                    />
                                    <input
                                      type="number"
                                      value={editingExpense.amount}
                                      onChange={(e) => setEditingExpense({ ...editingExpense, amount: e.target.value })}
                                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm"
                                      placeholder="Amount"
                                    />
                                    <div className="flex gap-2">
                                      <button
                                        onClick={handleSaveExpense}
                                        className="flex-1 flex items-center justify-center gap-1 bg-[#ffbe2a] text-[#000000] px-4 py-2 rounded-lg hover:bg-[#f5b621] transition-colors text-sm font-medium"
                                      >
                                        <Save size={16} />
                                        Save
                                      </button>
                                      <button
                                        onClick={() => setEditingExpense(null)}
                                        className="flex-1 flex items-center justify-center gap-1 bg-[#000] text-[#ffbe2a] px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                                      >
                                        <X size={16} />
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                        <span className="bg-[#FFbe2a] text-black px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                                          {expense.category}
                                        </span>
                                        <span className="text-lg sm:text-xl font-bold text-gray-800">₹{expense.amount.toLocaleString()}</span>
                                      </div>
                                    </div>
                                    <div className="flex gap-5">
                                      <button
                                        onClick={() => handleEditExpense(project.id, expense)}
                                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 transition-colors font-medium text-sm"
                                      >
                                        <Edit2 size={16} className="sm:w-5 sm:h-5" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        onClick={() => handleDeleteExpense(project.id, expense.id)}
                                        className="flex items-center gap-1 text-red-600 hover:text-red-700 transition-colors font-medium text-sm"
                                      >
                                        <Trash2 size={16} className="sm:w-5 sm:h-5" />
                                        <span>Delete</span>
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialManagement;