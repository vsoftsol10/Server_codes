import React, { useState, useEffect } from 'react'
import { Plus, X, IndianRupee, User, Phone, MapPin, Calendar, Loader2, Edit2, Eye, Trash2 } from 'lucide-react'
import labourApi from '../../api/labourAPI'
import EmployeeNavbar from '../../components/Employee/EmployeeNavbar'

const LabourManagement = () => {
  const [labourers, setLabourers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showViewPaymentsModal, setShowViewPaymentsModal] = useState(false)
  const [selectedLabour, setSelectedLabour] = useState(null)
  
  const [newLabour, setNewLabour] = useState({
    name: '',
    phone: '',
    address: ''
  })
  
  const [editLabour, setEditLabour] = useState({
    id: null,
    name: '',
    phone: '',
    address: ''
  })
  
  const [payment, setPayment] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0]
  })

  const fetchLabourers = async () => {
    try {
      setLoading(true)
      const data = await labourApi.getAllLabourers()
      if (data.success) {
        setLabourers(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch labourers:', error)
      alert('Failed to load labourers: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLabourers()
  }, [])

  const handleAddLabour = async () => {
    if (!newLabour.name || !newLabour.phone) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const data = await labourApi.createLabourer(newLabour)
      
      if (data.success) {
        await fetchLabourers()
        setNewLabour({ name: '', phone: '', address: '' })
        setShowAddForm(false)
        alert('Labourer added successfully!')
      }
    } catch (error) {
      alert('Failed to add labourer: ' + error.message)
    }
  }

  const openEditForm = (labour) => {
    setEditLabour({
      id: labour.id,
      name: labour.name,
      phone: labour.phone,
      address: labour.address || ''
    })
    setShowEditForm(true)
  }

  const handleUpdateLabour = async () => {
    if (!editLabour.name || !editLabour.phone) {
      alert('Please fill in all required fields')
      return
    }

    try {
      const data = await labourApi.updateLabourer(editLabour.id, {
        name: editLabour.name,
        phone: editLabour.phone,
        address: editLabour.address
      })
      
      if (data.success) {
        await fetchLabourers()
        setEditLabour({ id: null, name: '', phone: '', address: '' })
        setShowEditForm(false)
        alert('Labourer updated successfully!')
      }
    } catch (error) {
      alert('Failed to update labourer: ' + error.message)
    }
  }

  const handleAddPayment = async () => {
    if (!payment.amount || !selectedLabour) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const data = await labourApi.addPayment(selectedLabour.id, payment)
      
      if (data.success) {
        await fetchLabourers()
        setPayment({ amount: '', date: new Date().toISOString().split('T')[0] })
        setShowPaymentModal(false)
        setSelectedLabour(null)
        alert('Payment added successfully!')
      }
    } catch (error) {
      alert('Failed to add payment: ' + error.message)
    }
  }

  const openPaymentModal = (labour) => {
    setSelectedLabour(labour)
    setShowPaymentModal(true)
  }

  const openViewPaymentsModal = (labour) => {
    setSelectedLabour(labour)
    setShowViewPaymentsModal(true)
  }

  const deleteLabour = async (id) => {
    if (window.confirm('Are you sure you want to delete this labourer? This will also delete all their payment records.')) {
      try {
        const data = await labourApi.deleteLabourer(id)
        
        if (data.success) {
          await fetchLabourers()
          alert('Labourer deleted successfully!')
        }
      } catch (error) {
        alert('Failed to delete labourer: ' + error.message)
      }
    }
  }

  const getPaymentCount = (labour) => {
    return labour.payments ? labour.payments.length : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-yellow-600" size={48} />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <EmployeeNavbar />
      </nav>
      <div className="max-w-8xl pt-25 mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Labour Management</h1>
              <p className="text-gray-600 mt-1">Manage labourers and track daily payments</p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-[#ffbe2a] text-black px-4 py-2 rounded-lg cursor-pointer hover:bg-[#e5ab26] transition font-medium"
            >
              <Plus size={20} />
              Add Labour
            </button>
          </div>
        </div>

        {/* Add Labour Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add New Labour</h2>
                <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={newLabour.name}
                      onChange={(e) => setNewLabour({ ...newLabour, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={newLabour.phone}
                      onChange={(e) => setNewLabour({ ...newLabour, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      value={newLabour.address}
                      onChange={(e) => setNewLabour({ ...newLabour, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter address"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddLabour}
                    className="flex-1 px-4 py-2 bg-[#ffbe2a] text-black rounded-lg hover:bg-[#e5ab26] transition font-medium"
                  >
                    Add Labour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Labour Modal */}
        {showEditForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Edit Labour Details</h2>
                <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="text"
                      value={editLabour.name}
                      onChange={(e) => setEditLabour({ ...editLabour, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="tel"
                      value={editLabour.phone}
                      onChange={(e) => setEditLabour({ ...editLabour, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter phone number"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                    <textarea
                      value={editLabour.address}
                      onChange={(e) => setEditLabour({ ...editLabour, address: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter address"
                      rows="3"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowEditForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateLabour}
                    className="flex-1 px-4 py-2 bg-[#ffbe2a] text-black rounded-lg hover:bg-[#e5ab26] transition font-medium"
                  >
                    Update Labour
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Payment Modal */}
        {showPaymentModal && selectedLabour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Add Payment</h2>
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedLabour(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">Labour Name</p>
                <p className="font-semibold text-gray-900">{selectedLabour.name}</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={payment.amount}
                      onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="Enter amount"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
                    <input
                      type="date"
                      value={payment.date}
                      onChange={(e) => setPayment({ ...payment, date: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowPaymentModal(false)
                      setSelectedLabour(null)
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPayment}
                    className="flex-1 px-4 py-2 bg-[#ffbe2a] text-black rounded-lg hover:bg-[#e5ab26] transition font-medium"
                  >
                    Add Payment
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Payments Modal */}
        {showViewPaymentsModal && selectedLabour && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedLabour.name}</p>
                </div>
                <button
                  onClick={() => {
                    setShowViewPaymentsModal(false)
                    setSelectedLabour(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Total Amount Summary */}
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-600">Total Amount Paid</p>
                <p className="text-3xl font-bold text-green-600 flex items-center gap-1">
                  <IndianRupee size={24} />
                  {selectedLabour.totalPaid?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {getPaymentCount(selectedLabour)} payment{getPaymentCount(selectedLabour) !== 1 ? 's' : ''}
                </p>
              </div>

              {/* Payments List */}
              <div className="flex-1 overflow-y-auto">
                {!selectedLabour.payments || selectedLabour.payments.length === 0 ? (
                  <div className="text-center py-8">
                    <IndianRupee className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No payments recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedLabour.payments
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map((p) => (
                        <div
                          key={p.id}
                          className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-yellow-100 p-2 rounded">
                              <Calendar size={18} className="text-yellow-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">
                                {new Date(p.date).toLocaleDateString('en-IN', {
                                  weekday: 'short',
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
                              <IndianRupee size={18} />
                              {p.amount.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowViewPaymentsModal(false)
                    setSelectedLabour(null)
                  }}
                  className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table View */}
        {labourers.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <User className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Labourers Yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first labourer</p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 bg-[#ffbe2a] text-black px-6 py-3 rounded-lg hover:bg-[#e5ab26] transition font-medium"
            >
              <Plus size={20} />
              Add First Labour
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-yellow-500 border-b border-black-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      S.No
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {labourers.map((labour, index) => (
                    <tr key={labour.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <span className="font-medium text-gray-900">{labour.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Phone size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600">{labour.phone}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="line-clamp-2">{labour.address || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openViewPaymentsModal(labour)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View Payments"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => openPaymentModal(labour)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Add Payment"
                          >
                            <Plus size={18} />
                          </button>
                          <button
                            onClick={() => openEditForm(labour)}
                            className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => deleteLabour(labour.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LabourManagement