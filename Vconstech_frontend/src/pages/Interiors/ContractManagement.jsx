import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Save, X } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import SidePannel from '../../components/common/SidePannel';
import * as contractAPI from '../../api/contractAPI';

export default function ContractManagement() {
  const [contracts, setContracts] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [newContract, setNewContract] = useState({
    projectId: '',
    contractorName: '',
    contactNumber: '',
    contractAmount: '',
    workStatus: 'Pending',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    details: ''
  });

  // Fetch contracts from API
  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractAPI.getAllContracts();
      if (data.success) {
        setContracts(data.contracts);
      }
    } catch (error) {
      console.error('Error fetching contracts:', error);
      alert(error.error || 'Failed to fetch contracts');
    } finally {
      setLoading(false);
    }
  };

  // Fetch projects for dropdown
  const fetchProjects = async () => {
    try {
      const data = await contractAPI.getAllProjects();
      if (data.projects) {
        setProjects(data.projects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  };

  useEffect(() => {
    fetchContracts();
    fetchProjects();
  }, []);

  const handleEdit = (contract) => {
    setEditingId(contract.id);
    setEditForm({ ...contract });
  };

  const handleSave = async (id) => {
    try {
      const data = await contractAPI.updateContract(id, {
        contractorName: editForm.contractorName,
        contactNumber: editForm.contactNumber,
        contractAmount: parseFloat(editForm.contractAmount),
        workStatus: editForm.workStatus,
        startDate: editForm.startDate,
        endDate: editForm.endDate,
        details: editForm.details
      });

      if (data.success) {
        await fetchContracts();
        setEditingId(null);
        setEditForm({});
        alert('Contract updated successfully!');
      }
    } catch (error) {
      console.error('Error updating contract:', error);
      alert(error.error || 'Failed to update contract');
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        const data = await contractAPI.deleteContract(id);
        if (data.success) {
          await fetchContracts();
          alert('Contract deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting contract:', error);
        alert(error.error || 'Failed to delete contract');
      }
    }
  };

  const handleAddNew = async () => {
    if (!newContract.projectId || !newContract.contractorName || 
        !newContract.contactNumber || !newContract.contractAmount) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const data = await contractAPI.createContract({
        projectId: parseInt(newContract.projectId),
        contractorName: newContract.contractorName,
        contactNumber: newContract.contactNumber,
        contractAmount: parseFloat(newContract.contractAmount),
        workStatus: newContract.workStatus,
        startDate: newContract.startDate,
        endDate: newContract.endDate,
        details: newContract.details
      });

      if (data.success) {
        await fetchContracts();
        setNewContract({
          projectId: '',
          contractorName: '',
          contactNumber: '',
          contractAmount: '',
          workStatus: 'Pending',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          details: ''
        });
        setShowAddForm(false);
        alert('Contract added successfully!');
      }
    } catch (error) {
      console.error('Error adding contract:', error);
      alert(error.error || 'Failed to add contract');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading contracts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      <aside className="bg-ambefixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>

      <div className="pt-25 pl-16 md:pl-64">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800">
                Contract Management
              </h1>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center justify-center gap-2 bg-[#FFbe2a] text-black font-semibold px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg hover:bg-[#f5b621] transition-colors shadow-lg w-full sm:w-auto"
              >
                <Plus size={20} />
                <span className="hidden sm:inline">Add New Contract</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>

            {showAddForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border-4 border-black max-h-[90vh] overflow-y-auto">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800">New Contract Details</h2>
                    <button 
                      onClick={() => setShowAddForm(false)} 
                      className="text-gray-500 hover:text-gray-700 p-1"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Project <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={newContract.projectId}
                        onChange={(e) => setNewContract({ ...newContract, projectId: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      >
                        <option value="">Select Project</option>
                        {projects.map(project => (
                          <option key={project.id} value={project.id}>
                            {project.name} ({project.projectId})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contractor Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contractor Name"
                        value={newContract.contractorName}
                        onChange={(e) => setNewContract({ ...newContract, contractorName: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contact Number <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contact Number"
                        value={newContract.contactNumber}
                        onChange={(e) => setNewContract({ ...newContract, contactNumber: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Contract Amount <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        placeholder="Contract Amount"
                        value={newContract.contractAmount}
                        onChange={(e) => setNewContract({ ...newContract, contractAmount: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Work Status</label>
                      <select
                        value={newContract.workStatus}
                        onChange={(e) => setNewContract({ ...newContract, workStatus: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={newContract.startDate}
                        onChange={(e) => setNewContract({ ...newContract, startDate: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={newContract.endDate}
                        onChange={(e) => setNewContract({ ...newContract, endDate: e.target.value })}
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Details</label>
                      <textarea
                        placeholder="Contract details..."
                        value={newContract.details}
                        onChange={(e) => setNewContract({ ...newContract, details: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 mt-6">
                    <button
                      onClick={handleAddNew}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#FFbe2a] text-black font-semibold px-4 py-3 rounded-lg hover:bg-[#f5b621] transition-colors"
                    >
                      <Save size={18} />
                      Add Contract
                    </button>
                    <button
                      onClick={() => setShowAddForm(false)}
                      className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white px-4 py-3 rounded-lg hover:bg-gray-900 transition-colors"
                    >
                      <X size={18} />
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">Project Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">Contractor Name</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">Contact Number</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">Contract Amount</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold whitespace-nowrap">Work Status</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {contracts.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          No contracts found. Add your first contract!
                        </td>
                      </tr>
                    ) : (
                      contracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-gray-50 transition">
                          {editingId === contract.id ? (
                            <>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={editForm.projectName}
                                  disabled
                                  className="border border-gray-300 rounded px-2 py-1 w-full bg-gray-100"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={editForm.contractorName}
                                  onChange={(e) => setEditForm({ ...editForm, contractorName: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="text"
                                  value={editForm.contactNumber}
                                  onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={editForm.contractAmount}
                                  onChange={(e) => setEditForm({ ...editForm, contractAmount: parseFloat(e.target.value) })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                />
                              </td>
                              <td className="px-4 py-3">
                                <select
                                  value={editForm.workStatus}
                                  onChange={(e) => setEditForm({ ...editForm, workStatus: e.target.value })}
                                  className="border border-gray-300 rounded px-2 py-1 w-full"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleSave(contract.id)}
                                    className="bg-[#FFbe2a] text-black p-2 rounded hover:bg-[#f5b621] transition"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="bg-gray-800 text-white p-2 rounded hover:bg-gray-900 transition"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-4 py-3 font-medium text-gray-900">{contract.projectName}</td>
                              <td className="px-4 py-3 text-gray-700">{contract.contractorName}</td>
                              <td className="px-4 py-3 text-gray-700">{contract.contactNumber}</td>
                              <td className="px-4 py-3 text-gray-900 font-semibold">
                                ₹ {contract.contractAmount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(contract.workStatus)}`}>
                                  {contract.workStatus}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                  <button
                                    onClick={() => handleEdit(contract)}
                                    className="bg-[#FFbe2a] text-black p-2 rounded hover:bg-[#FFbe2a] transition"
                                  >
                                    <Edit2 size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(contract.id)}
                                    className="bg-black text-[#ffbe2a] p-2 rounded hover:bg-red-700 transition"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 bg-white rounded-lg shadow-md p-4">
              <div className="text-gray-600 text-sm">
                Total Contracts: <span className="font-semibold text-gray-800">{contracts.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}