// import React, { useState, useEffect } from 'react'
// import { Plus, X, IndianRupee, User, Phone, MapPin, Calendar, Loader2, Edit2, Eye, Trash2, Briefcase, FolderOpen, Search, Filter } from 'lucide-react'
// import labourApi from '../../api/labourAPI'
// import { projectAPI } from '../../api/projectAPI'
// import Navbar from '../../components/common/Navbar'
// import SidePannel from '../../components/common/SidePannel'
// import LoadingScreen from '../../components/common/Loadingscreen'

// const AdminLabourManagement = () => {
//   const [labourers, setLabourers] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [projects, setProjects] = useState([])
//   const [showAddForm, setShowAddForm] = useState(false)
//   const [showEditForm, setShowEditForm] = useState(false)
//   const [showPaymentModal, setShowPaymentModal] = useState(false)
//   const [showViewPaymentsModal, setShowViewPaymentsModal] = useState(false)
//   const [selectedLabour, setSelectedLabour] = useState(null)
//   const [searchTerm, setSearchTerm] = useState('')
//   const [selectedProjectFilter, setSelectedProjectFilter] = useState('')

//   const [newLabour, setNewLabour] = useState({
//     name: '',
//     phone: '',
//     address: '',
//     designation: '',
//     project: '',
//     projectId: null
//   })

//   const [editLabour, setEditLabour] = useState({
//     id: null,
//     name: '',
//     phone: '',
//     address: '',
//     designation: '',
//     project: '',
//     projectId: null
//   })

//   const [payment, setPayment] = useState({
//     amount: '',
//     date: new Date().toISOString().split('T')[0]
//   })

//   const fetchLabourers = async () => {
//     try {
//       setLoading(true)
//       const data = await labourApi.getAllLabourers()
//       if (data.success) {
//         setLabourers(data.data)
//       }
//     } catch (error) {
//       console.error('Failed to fetch labourers:', error)
//       alert('Failed to load labourers: ' + error.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   const fetchProjects = async () => {
//     try {
//       const data = await projectAPI.getProjects()
//       if (data.projects) {
//         setProjects(data.projects)
//       }
//     } catch (error) {
//       console.error('Failed to fetch projects:', error)
//     }
//   }
// useEffect(() => {
//     document.title = "Vconstech - Admin";
//   }, []);
//   useEffect(() => {
//     fetchLabourers()
//     fetchProjects()
//   }, [])

//   const handleAddLabour = async () => {
//     if (!newLabour.name || !newLabour.phone) {
//       alert('Please fill in all required fields')
//       return
//     }
//     try {
//       const data = await labourApi.createLabourer(newLabour)
//       if (data.success) {
//         await fetchLabourers()
//         setNewLabour({ name: '', phone: '', address: '', designation: '', project: '', projectId: null })
//         setShowAddForm(false)
//         alert('Labourer added successfully!')
//       }
//     } catch (error) {
//       alert('Failed to add labourer: ' + error.message)
//     }
//   }

//   const openEditForm = (labour) => {
//     setEditLabour({
//       id: labour.id,
//       name: labour.name,
//       phone: labour.phone,
//       address: labour.address || '',
//       designation: labour.designation || '',
//       project: labour.projectName || labour.project || '',
//       projectId: labour.projectId || null
//     })
//     setShowEditForm(true)
//   }

//   const handleUpdateLabour = async () => {
//     if (!editLabour.name || !editLabour.phone) {
//       alert('Please fill in all required fields')
//       return
//     }
//     try {
//       const data = await labourApi.updateLabourer(editLabour.id, {
//         name: editLabour.name,
//         phone: editLabour.phone,
//         address: editLabour.address,
//         designation: editLabour.designation,
//         project: editLabour.project,
//         projectId: editLabour.projectId
//       })
//       if (data.success) {
//         await fetchLabourers()
//         setEditLabour({ id: null, name: '', phone: '', address: '', designation: '', project: '', projectId: null })
//         setShowEditForm(false)
//         alert('Labourer updated successfully!')
//       }
//     } catch (error) {
//       alert('Failed to update labourer: ' + error.message)
//     }
//   }

//   const handleAddPayment = async () => {
//     if (!payment.amount || !selectedLabour) {
//       alert('Please enter a valid amount')
//       return
//     }
//     try {
//       const data = await labourApi.addPayment(selectedLabour.id, payment)
//       if (data.success) {
//         await fetchLabourers()
//         setPayment({ amount: '', date: new Date().toISOString().split('T')[0] })
//         setShowPaymentModal(false)
//         setSelectedLabour(null)
//         alert('Payment added successfully!')
//       }
//     } catch (error) {
//       alert('Failed to add payment: ' + error.message)
//     }
//   }

//   const openPaymentModal = (labour) => {
//     setSelectedLabour(labour)
//     setShowPaymentModal(true)
//   }

//   const openViewPaymentsModal = (labour) => {
//     setSelectedLabour(labour)
//     setShowViewPaymentsModal(true)
//   }

//   const deleteLabour = async (id) => {
//     if (window.confirm('Are you sure you want to delete this labourer? This will also delete all their payment records.')) {
//       try {
//         const data = await labourApi.deleteLabourer(id)
//         if (data.success) {
//           await fetchLabourers()
//           alert('Labourer deleted successfully!')
//         }
//       } catch (error) {
//         alert('Failed to delete labourer: ' + error.message)
//       }
//     }
//   }

//   const getPaymentCount = (labour) => {
//     return labour.payments ? labour.payments.length : 0
//   }

//   // Filter labourers based on search term and project filter
//   const filteredLabourers = labourers.filter(labour => {
//   const matchesSearch = !searchTerm ||
//     labour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     labour.phone.includes(searchTerm) ||
//     (labour.designation && labour.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (labour.projectName && labour.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (labour.address && labour.address.toLowerCase().includes(searchTerm.toLowerCase()));

//   const selectedProject = projects.find(p => p.id == selectedProjectFilter);
//   const matchesProject = !selectedProjectFilter ||
//     String(labour.projectId) === String(selectedProjectFilter) ||
//     (selectedProject && (selectedProject.name === labour.projectName || selectedProject.name === labour.project));

//   return matchesSearch && matchesProject;
// });

//   // Reusable form fields
//   const renderLabourFields = (formState, setFormState) => (
//     <div className="space-y-4">
//       {/* Name */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
//         <div className="relative">
//           <User className="absolute left-3 top-3 text-gray-400" size={20} />
//           <input
//             type="text"
//             value={formState.name}
//             onChange={(e) => setFormState({ ...formState, name: e.target.value })}
//             className="w-full pl-10 pr-4 py-2 border font-medium border-gray-300 rounded-lg focus:border-transparent"
//             placeholder="Enter name"
//           />
//         </div>
//       </div>

//       {/* Phone */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
//         <div className="relative">
//           <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
//           <input
//             type="tel"
//             value={formState.phone}
//             onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
//             className="w-full pl-10 pr-4 py-2 border font-medium border-gray-300 rounded-lg focus:border-transparent"
//             placeholder="Enter phone number"
//           />
//         </div>
//       </div>

//       {/* Designation */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
//         <div className="relative">
//           <Briefcase className="absolute left-3 top-3 text-gray-400" size={20} />
//           <input
//             type="text"
//             value={formState.designation}
//             onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
//             className="w-full pl-10 pr-4 py-2 border font-medium border-gray-300 rounded-lg focus:border-transparent"
//             placeholder="e.g. Mason, Electrician, Helper"
//           />
//         </div>
//       </div>

//       {/* Project Dropdown */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Project</label>
//         <div className="relative">
//           <FolderOpen className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={20} />
//           <select
//             value={formState.project}
//             onChange={(e) => {
//               const selectedProject = projects.find(p => p.name === e.target.value)
//               setFormState({
//                 ...formState,
//                 project: e.target.value,
//                 projectId: selectedProject ? selectedProject.id : null
//               })
//             }}
//             className="w-full pl-10 pr-4 py-2 border font-medium border-gray-300 rounded-lg focus:border-transparent bg-white appearance-none"
//           >
//             <option value="">Select a project</option>
//             {projects.map((proj) => (
//               <option key={proj.id} value={proj.name}>
//                 {proj.name} 
//               </option>
//             ))}
//           </select>
//         </div>
//       </div>

//       {/* Address */}
//       <div>
//         <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
//         <div className="relative">
//           <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
//           <textarea
//             value={formState.address}
//             onChange={(e) => setFormState({ ...formState, address: e.target.value })}
//             className="w-full pl-10 pr-4 py-2 border font-medium border-gray-300 rounded-lg focus:border-transparent"
//             placeholder="Enter address"
//             rows="3"
//           />
//         </div>
//       </div>
//     </div>
//   )

//   if (loading) return <LoadingScreen message="Loading billing data..." />;
//   return (
//     <div className="min-h-screen bg-gray-50">
//       <nav className="fixed top-0 left-0 right-0 z-50 h-16">
//         <Navbar />
//       </nav>

//       <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
//         <SidePannel />
//       </aside>

//       <div className="pt-16 pl-3 md:pl-64 md:pt-25 pr-4 pb-20 md:pb-8 min-h-screen">
//         <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//           <div className="flex justify-between items-center">
//             <div>
//               <h1 className="text-3xl font-bold text-gray-900">Labour Management</h1>
//               <p className="text-gray-600 mt-1">Manage labourers and track daily payments</p>
//             </div>
//             <button
//               onClick={() => setShowAddForm(true)}
//               className="flex items-center gap-2 bg-[#ffbe2a] text-black px-4 py-2 rounded-lg transition font-medium cursor-pointer hover:bg-[#e5ab26]"
//             >
//               <Plus size={20} />
//               Add Labour
//             </button>
//           </div>
//         </div>

//         {/* Add Labour Modal */}
//         {showAddForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-2xl font-bold text-gray-900">Add New Labour</h2>
//                 <button onClick={() => setShowAddForm(false)} className="text-gray-500 hover:text-gray-700">
//                   <X size={24} />
//                 </button>
//               </div>
//               {renderLabourFields(newLabour, setNewLabour)}
//               <div className="flex gap-3 mt-6">
//                 <button
//                   onClick={() => setShowAddForm(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleAddLabour}
//                   className="flex-1 px-4 py-2 bg-[#ffbe2a] text-black rounded-lg hover:bg-[#e5ab26] transition font-medium"
//                 >
//                   Add Labour
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Edit Labour Modal */}
//         {showEditForm && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-2xl font-bold text-gray-900">Edit Labour Details</h2>
//                 <button onClick={() => setShowEditForm(false)} className="text-gray-500 hover:text-gray-700">
//                   <X size={24} />
//                 </button>
//               </div>
//               {renderLabourFields(editLabour, setEditLabour)}
//               <div className="flex gap-3 mt-6">
//                 <button
//                   onClick={() => setShowEditForm(false)}
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleUpdateLabour}
//                   className="flex-1 px-4 py-2 bg-[#ffbe2a] text-black rounded-lg hover:bg-[#e5ab26] transition font-medium"
//                 >
//                   Update Labour
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Add Payment Modal */}
//         {showPaymentModal && selectedLabour && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
//               <div className="flex justify-between items-center mb-4">
//                 <h2 className="text-2xl font-bold text-gray-900">Add Payment</h2>
//                 <button
//                   onClick={() => { setShowPaymentModal(false); setSelectedLabour(null) }}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>
//               <div className="mb-4 p-3 bg-gray-50 rounded-lg">
//                 <p className="text-sm text-gray-600">Labour Name</p>
//                 <p className="font-semibold text-gray-900">{selectedLabour.name}</p>
//               </div>
//               <div className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
//                   <div className="relative">
//                     <IndianRupee className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input
//                       type="number"
//                       min="0"
//                       step="0.01"
//                       value={payment.amount}
//                       onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//                       placeholder="Enter amount"
//                     />
//                   </div>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
//                   <div className="relative">
//                     <Calendar className="absolute left-3 top-3 text-gray-400" size={20} />
//                     <input
//                       type="date"
//                       value={payment.date}
//                       onChange={(e) => setPayment({ ...payment, date: e.target.value })}
//                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//                     />
//                   </div>
//                 </div>
//                 <div className="flex gap-3 mt-6">
//                   <button
//                     onClick={() => { setShowPaymentModal(false); setSelectedLabour(null) }}
//                     className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleAddPayment}
//                     className="flex-1 px-4 py-2 bg-[#ffbe2a] text-black rounded-lg hover:bg-[#e5ab26] transition font-medium"
//                   >
//                     Add Payment
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* View Payments Modal */}
//         {showViewPaymentsModal && selectedLabour && (
//           <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//             <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
//               <div className="flex justify-between items-center mb-4">
//                 <div>
//                   <h2 className="text-2xl font-bold text-gray-900">Payment History</h2>
//                   <p className="text-sm text-gray-600 mt-1">{selectedLabour.name}</p>
//                 </div>
//                 <button
//                   onClick={() => { setShowViewPaymentsModal(false); setSelectedLabour(null) }}
//                   className="text-gray-500 hover:text-gray-700"
//                 >
//                   <X size={24} />
//                 </button>
//               </div>

//               <div className="bg-green-50 rounded-lg p-4 mb-4">
//                 <p className="text-sm text-gray-600">Total Amount Paid</p>
//                 <p className="text-3xl font-bold text-green-600 flex items-center gap-1">
//                   <IndianRupee size={24} />
//                   {selectedLabour.totalPaid?.toFixed(2) || '0.00'}
//                 </p>
//                 <p className="text-xs text-gray-500 mt-1">
//                   {getPaymentCount(selectedLabour)} payment{getPaymentCount(selectedLabour) !== 1 ? 's' : ''}
//                 </p>
//               </div>

//               <div className="flex-1 overflow-y-auto">
//                 {!selectedLabour.payments || selectedLabour.payments.length === 0 ? (
//                   <div className="text-center py-8">
//                     <IndianRupee className="mx-auto text-gray-300 mb-3" size={48} />
//                     <p className="text-gray-500">No payments recorded yet</p>
//                   </div>
//                 ) : (
//                   <div className="space-y-2">
//                     {selectedLabour.payments
//                       .sort((a, b) => new Date(b.date) - new Date(a.date))
//                       .map((p) => (
//                         <div key={p.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition">
//                           <div className="flex items-center gap-3">
//                             <div className="bg-yellow-100 p-2 rounded">
//                               <Calendar size={18} className="text-yellow-600" />
//                             </div>
//                             <p className="font-medium text-gray-900">
//                               {new Date(p.date).toLocaleDateString('en-IN', {
//                                 weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
//                               })}
//                             </p>
//                           </div>
//                           <p className="text-xl font-bold text-gray-900 flex items-center gap-1">
//                             <IndianRupee size={18} />
//                             {p.amount.toFixed(2)}
//                           </p>
//                         </div>
//                       ))}
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 pt-4 border-t">
//                 <button
//                   onClick={() => { setShowViewPaymentsModal(false); setSelectedLabour(null) }}
//                   className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium"
//                 >
//                   Close
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Search and Filter Bar */}
//         <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
//           <div className="flex justify-between items-center">
//             <div className="flex-1 max-w-md relative">
//               <Search className="absolute left-3 top-3 text-gray-400" size={20} />
//               <input
//                 type="text"
//                 placeholder="Search labourers by name, phone, designation, project, or address..."
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
//               />
//             </div>
//             <div className="ml-4 flex items-center gap-2">
//               <Filter className="text-gray-400" size={20} />
//               <select
//                 value={selectedProjectFilter}
//                 onChange={(e) => setSelectedProjectFilter(e.target.value)}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white"
//               >
//                 <option value="">All Projects</option>
//                 {projects.map((proj) => (
//                   <option key={proj.id} value={proj.id}>
//                     {proj.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Table View */}
//         {filteredLabourers.length === 0 ? (
//           <div className="bg-white rounded-lg shadow-sm p-12 text-center">
//             <User className="mx-auto text-gray-300 mb-4" size={64} />
//             <h3 className="text-xl font-semibold text-gray-900 mb-2">
//               {labourers.length === 0 ? 'No Labourers Yet' : 'No Labourers Match Your Search/Filters'}
//             </h3>
//             <p className="text-gray-600 mb-6">
//               {labourers.length === 0 ? 'Get started by adding your first labourer' : 'Try adjusting your search or filter criteria'}
//             </p>
//             {labourers.length === 0 && (
//               <button
//                 onClick={() => setShowAddForm(true)}
//                 className="inline-flex items-center gap-2 bg-[#ffbe2a] text-black px-6 py-3 rounded-lg hover:bg-[#e5ab26] transition font-medium"
//               >
//                 <Plus size={20} />
//                 Add First Labour
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="bg-white rounded-lg shadow-sm overflow-hidden">
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead className="bg-yellow-500 border-b border-black-100">
//                   <tr>
//                     <th className="px-6 py-4 text-left text-x font-bold text-black uppercase tracking-wider">S.No</th>
//                     <th className="px-6 py-4 text-left text-x font-bold text-black uppercase tracking-wider">Name</th>
//                     <th className="px-6 py-4 text-left text-x font-bold text-black uppercase tracking-wider">Phone Number</th>
//                     <th className="px-6 py-4 text-left text-x font-bold text-black uppercase tracking-wider">Designation</th>
//                     <th className="px-6 py-4 text-left text-x font-bold text-black uppercase tracking-wider">Project</th>
//                     <th className="px-6 py-4 text-left text-x font-bold text-black uppercase tracking-wider">Address</th>
//                     <th className="px-6 py-4 text-center text-x font-bold text-black uppercase tracking-wider">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-gray-200">
//                   {filteredLabourers.map((labour, index) => (
//                     <tr key={labour.id} className="hover:bg-gray-50 transition">
//                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{index + 1}</td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <User size={16} className="text-gray-400" />
//                           <span className="font-medium text-gray-900">{labour.name}</span>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <Phone size={16} className="text-gray-400" />
//                           <span className="text-sm text-gray-600">{labour.phone}</span>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <Briefcase size={16} className="text-gray-400" />
//                           <span className="text-sm text-gray-600">{labour.designation || 'N/A'}</span>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center gap-2">
//                           <FolderOpen size={16} className="text-gray-400" />
//                           <span className="text-sm text-gray-600">{labour.project || labour.projectName || 'N/A'}</span>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 text-sm text-gray-600">
//                         <div className="flex items-start gap-2">
//                           <MapPin size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
//                           <span className="line-clamp-2">{labour.address || 'N/A'}</span>
//                         </div>
//                       </td>

//                       <td className="px-6 py-4 whitespace-nowrap">
//                         <div className="flex items-center justify-center gap-2">
//                           <button
//                             onClick={() => openViewPaymentsModal(labour)}
//                             className="p-2 text-black hover:bg-yellow-50 rounded-lg transition"
//                             title="View Payments"
//                           >
//                             <Eye size={18} />
//                           </button>
//                           <button
//                             onClick={() => openPaymentModal(labour)}
//                             className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
//                             title="Add Payment"
//                           >
//                             <Plus size={18} />
//                           </button>
//                           <button
//                             onClick={() => openEditForm(labour)}
//                             className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
//                             title="Edit"
//                           >
//                             <Edit2 size={18} />
//                           </button>
//                           <button
//                             onClick={() => deleteLabour(labour.id)}
//                             className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
//                             title="Delete"
//                           >
//                             <Trash2 size={18} />
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default AdminLabourManagement


import React, { useState, useEffect, useRef } from 'react'
import {
  Plus, X, IndianRupee, User, Phone, MapPin, Calendar,
  Edit2, Eye, Trash2, Briefcase, FolderOpen, Search,
  ChevronLeft, ChevronRight, MoreVertical, Upload, Home, ChevronRight as ChevronRightIcon
} from 'lucide-react'
import labourApi from '../../api/labourAPI'
import { projectAPI } from '../../api/projectAPI'
import Navbar from '../../components/common/Navbar'
import SidePannel from '../../components/common/SidePannel'
import LoadingScreen from '../../components/common/Loadingscreen'
import Pagination, { DEFAULT_PAGE_SIZE } from '../../components/common/Pagination'


/* ── Avatar colours by initial ── */
const avatarColors = [
  'bg-blue-200 text-blue-700', 'bg-purple-200 text-purple-700',
  'bg-green-200 text-green-700', 'bg-red-200 text-red-700',
  'bg-orange-200 text-orange-700', 'bg-teal-200 text-teal-700',
  'bg-pink-200 text-pink-700', 'bg-indigo-200 text-indigo-700',
]
const getAvatarColor = (name = '') =>
  avatarColors[(name.charCodeAt(0) || 0) % avatarColors.length]

/* ── Row action dropdown ── */
const RowMenu = ({ labour, onView, onAddPayment, onEdit, onDelete }) => {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const action = (fn) => { fn(); setOpen(false) }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500"
      >
        <MoreVertical size={18} />
      </button>
      {open && (
        <div className="absolute right-0 top-9 bg-white rounded-xl shadow-xl border border-gray-100 z-30 w-44 py-1 text-sm">
          <button onClick={() => action(() => onView(labour))}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
            <Eye size={15} className="text-gray-400" /> View Payments
          </button>
          <button onClick={() => action(() => onAddPayment(labour))}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
            <IndianRupee size={15} className="text-green-500" /> Add Payment
          </button>
          <button onClick={() => action(() => onEdit(labour))}
            className="w-full text-left px-4 py-2.5 hover:bg-gray-50 flex items-center gap-2.5 text-gray-700">
            <Edit2 size={15} className="text-yellow-500" /> Edit
          </button>
          <div className="my-1 border-t border-gray-100" />
          <button onClick={() => action(() => onDelete(labour.id))}
            className="w-full text-left px-4 py-2.5 hover:bg-red-50 flex items-center gap-2.5 text-red-600">
            <Trash2 size={15} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

const AdminLabourManagement = () => {
  const [labourers, setLabourers] = useState([])
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showViewPaymentsModal, setShowViewPaymentsModal] = useState(false)
  const [selectedLabour, setSelectedLabour] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProjectFilter, setSelectedProjectFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [isUploadingLabourList, setIsUploadingLabourList] = useState(false)
  const labourListInputRef = useRef(null)

  const [newLabour, setNewLabour] = useState({ name: '', phone: '', address: '', designation: '', project: '', projectId: null })
  const [editLabour, setEditLabour] = useState({ id: null, name: '', phone: '', address: '', designation: '', project: '', projectId: null })
  const [payment, setPayment] = useState({ amount: '', date: new Date().toISOString().split('T')[0] })

  /* ── Data fetchers (unchanged) ── */
  const fetchLabourers = async () => {
    try {
      setLoading(true)
      const data = await labourApi.getAllLabourers()
      if (data.success) setLabourers(data.data)
    } catch (error) {
      console.error('Failed to fetch labourers:', error)
      alert('Failed to load labourers: ' + error.message)
    } finally { setLoading(false) }
  }

  const fetchProjects = async () => {
    try {
      const data = await projectAPI.getProjects()
      if (data.projects) setProjects(data.projects)
    } catch (error) { console.error('Failed to fetch projects:', error) }
  }

  useEffect(() => { document.title = "Vconstech - Admin" }, [])
  useEffect(() => { fetchLabourers(); fetchProjects() }, [])

  /* ── Handlers (unchanged) ── */
  const handleAddLabour = async () => {
    if (!newLabour.name || !newLabour.phone) { alert('Please fill in all required fields'); return }
    try {
      const data = await labourApi.createLabourer(newLabour)
      if (data.success) {
        await fetchLabourers()
        setNewLabour({ name: '', phone: '', address: '', designation: '', project: '', projectId: null })
        setShowAddForm(false)
        alert('Labourer added successfully!')
      }
    } catch (error) { alert('Failed to add labourer: ' + error.message) }
  }

  const handleUploadLabourList = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsUploadingLabourList(true)
      const data = await labourApi.uploadLabourList(file)
      await fetchLabourers()
      alert(data.message || 'Labour list uploaded successfully!')
    } catch (error) {
      alert('Failed to upload labour list: ' + error.message)
    } finally {
      setIsUploadingLabourList(false)
      event.target.value = ''
    }
  }

  const openEditForm = (labour) => {
    setEditLabour({ id: labour.id, name: labour.name, phone: labour.phone, address: labour.address || '', designation: labour.designation || '', project: labour.projectName || labour.project || '', projectId: labour.projectId || null })
    setShowEditForm(true)
  }

  const handleUpdateLabour = async () => {
    if (!editLabour.name || !editLabour.phone) { alert('Please fill in all required fields'); return }
    try {
      const data = await labourApi.updateLabourer(editLabour.id, { name: editLabour.name, phone: editLabour.phone, address: editLabour.address, designation: editLabour.designation, project: editLabour.project, projectId: editLabour.projectId })
      if (data.success) {
        await fetchLabourers()
        setEditLabour({ id: null, name: '', phone: '', address: '', designation: '', project: '', projectId: null })
        setShowEditForm(false)
        alert('Labourer updated successfully!')
      }
    } catch (error) { alert('Failed to update labourer: ' + error.message) }
  }

  const handleAddPayment = async () => {
    if (!payment.amount || !selectedLabour) { alert('Please enter a valid amount'); return }
    try {
      const data = await labourApi.addPayment(selectedLabour.id, payment)
      if (data.success) {
        await fetchLabourers()
        setPayment({ amount: '', date: new Date().toISOString().split('T')[0] })
        setShowPaymentModal(false)
        setSelectedLabour(null)
        alert('Payment added successfully!')
      }
    } catch (error) { alert('Failed to add payment: ' + error.message) }
  }

  const openPaymentModal = (labour) => { setSelectedLabour(labour); setShowPaymentModal(true) }
  const openViewPaymentsModal = (labour) => { setSelectedLabour(labour); setShowViewPaymentsModal(true) }

  const deleteLabour = async (id) => {
    if (window.confirm('Are you sure you want to delete this labourer? This will also delete all their payment records.')) {
      try {
        const data = await labourApi.deleteLabourer(id)
        if (data.success) { await fetchLabourers(); alert('Labourer deleted successfully!') }
      } catch (error) { alert('Failed to delete labourer: ' + error.message) }
    }
  }

  const getPaymentCount = (labour) => labour.payments ? labour.payments.length : 0

  /* ── Filter ── */
  const filteredLabourers = labourers.filter(labour => {
    const matchesSearch = !searchTerm ||
      labour.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      labour.phone.includes(searchTerm) ||
      (labour.designation && labour.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (labour.projectName && labour.projectName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (labour.address && labour.address.toLowerCase().includes(searchTerm.toLowerCase()))
    const selectedProject = projects.find(p => p.id == selectedProjectFilter)
    const matchesProject = !selectedProjectFilter ||
      String(labour.projectId) === String(selectedProjectFilter) ||
      (selectedProject && (selectedProject.name === labour.projectName || selectedProject.name === labour.project))
    return matchesSearch && matchesProject
  })

  /* ── Pagination ── */
  const totalPages = Math.max(1, Math.ceil(filteredLabourers.length / rowsPerPage))
  const paginatedLabourers = filteredLabourers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
  const startEntry = filteredLabourers.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const endEntry = Math.min(currentPage * rowsPerPage, filteredLabourers.length)

  /* ── Form fields (unchanged logic, refreshed UI) ── */
  const renderLabourFields = (formState, setFormState) => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
        <div className="relative">
          <User className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" value={formState.name} onChange={(e) => setFormState({ ...formState, name: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Enter name" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
        <div className="relative">
          <Phone className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="tel" value={formState.phone} onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Enter phone number" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <input type="text" value={formState.designation} onChange={(e) => setFormState({ ...formState, designation: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="e.g. Mason, Electrician, Helper" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Project</label>
        <div className="relative">
          <FolderOpen className="absolute left-3 top-2.5 text-gray-400 pointer-events-none" size={18} />
          <select value={formState.project}
            onChange={(e) => { const p = projects.find(p => p.name === e.target.value); setFormState({ ...formState, project: e.target.value, projectId: p ? p.id : null }) }}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-yellow-400 appearance-none">
            <option value="">Select a project</option>
            {projects.map(proj => <option key={proj.id} value={proj.name}>{proj.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
        <div className="relative">
          <MapPin className="absolute left-3 top-2.5 text-gray-400" size={18} />
          <textarea value={formState.address} onChange={(e) => setFormState({ ...formState, address: e.target.value })}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Enter address" rows="3" />
        </div>
      </div>
    </div>
  )

  if (loading) return <LoadingScreen message="Loading labour data..." />

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16"><Navbar /></nav>
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto"><SidePannel /></aside>

      <div className="pt-20 md:pl-64 md:pt-25">
        <div className="px-4 md:px-8 pt-4 pb-24 md:pb-10 max-w-7xl mx-auto">

          {/* ── Breadcrumb ── */}
          {/* <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-4">
            <Home size={14} />
            <span>Home</span>
            <ChevronRightIcon size={14} />
            <span className="text-gray-800 font-medium">Labour Management</span>
          </div> */}

          {/* ── Page header ── */}
          <div className="flex items-center justify-between mb-5">
            <h1 className="text-2xl font-bold leading-tight tracking-tight text-gray-900">Labour Management</h1>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowAddForm(true)}
                className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-gray-800 text-gray-800 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors">
                <Plus size={16} /> Add Labour
              </button>
              <input
                ref={labourListInputRef}
                type="file"
                accept=".csv,.xlsx"
                onChange={handleUploadLabourList}
                className="hidden"
              />
              <button
                onClick={() => labourListInputRef.current?.click()}
                disabled={isUploadingLabourList}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-black rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Upload size={16} /> {isUploadingLabourList ? 'Uploading...' : 'Upload Labour List'}
              </button>
              
            </div>
          </div>

          {/* ── Search bar ── */}
          <div className="relative mb-5">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by name, phone number, designation, project..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* ── Table card ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {filteredLabourers.length === 0 ? (
              <div className="py-20 text-center">
                <User className="mx-auto text-gray-300 mb-4" size={56} />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">
                  {labourers.length === 0 ? 'No Labourers Yet' : 'No results found'}
                </h3>
                <p className="text-sm text-gray-400 mb-5">
                  {labourers.length === 0 ? 'Add your first labourer to get started' : 'Try adjusting your search'}
                </p>
                {labourers.length === 0 && (
                  <button onClick={() => setShowAddForm(true)}
                    className="inline-flex items-center gap-2 bg-yellow-400 text-black px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-yellow-500 transition-colors">
                    <Plus size={16} /> Add First Labour
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-yellow-400">
                        {['S.NO', 'NAME', 'PHONE NUMBER', 'DESIGNATION', 'PROJECT', 'ADDRESS', 'ACTIONS'].map((h) => (
                          <th key={h} className="px-5 py-4 text-left text-xs font-bold text-black tracking-wider">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {paginatedLabourers.map((labour, index) => (
                        <tr key={labour.id} className="hover:bg-gray-50 transition-colors">
                          {/* S.No */}
                          <td className="px-5 py-4 text-sm text-gray-500 font-medium">
                            {(currentPage - 1) * rowsPerPage + index + 1}
                          </td>
                          {/* Name + avatar */}
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold overflow-hidden ${getAvatarColor(labour.name)}`}>
                                {labour.profileImage
                                  ? <img src={labour.profileImage} alt={labour.name} className="w-full h-full object-cover rounded-full" />
                                  : labour.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
                                }
                              </div>
                              <span className="text-sm font-semibold text-gray-900">{labour.name}</span>
                            </div>
                          </td>
                          {/* Phone */}
                          <td className="px-5 py-4 text-sm text-gray-700">{labour.phone}</td>
                          {/* Designation */}
                          <td className="px-5 py-4 text-sm text-gray-700">{labour.designation || 'N/A'}</td>
                          {/* Project */}
                          <td className="px-5 py-4 text-sm text-gray-700">{labour.project || labour.projectName || 'N/A'}</td>
                          {/* Address */}
                          <td className="px-5 py-4 text-sm text-gray-600 max-w-[200px] truncate">{labour.address || 'N/A'}</td>
                          {/* Actions */}
                          <td className="px-5 py-4">
                            <RowMenu
                              labour={labour}
                              onView={openViewPaymentsModal}
                              onAddPayment={openPaymentModal}
                              onEdit={openEditForm}
                              onDelete={deleteLabour}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-gray-50">
                  {paginatedLabourers.map((labour, index) => (
                    <div key={labour.id} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0 ${getAvatarColor(labour.name)}`}>
                            {labour.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{labour.name}</p>
                            <p className="text-xs text-gray-500">{labour.designation || 'N/A'}</p>
                          </div>
                        </div>
                        <RowMenu labour={labour} onView={openViewPaymentsModal} onAddPayment={openPaymentModal} onEdit={openEditForm} onDelete={deleteLabour} />
                      </div>
                      <div className="space-y-1 pt-2 border-t border-gray-100 text-xs text-gray-600">
                        <div className="flex items-center gap-2"><Phone size={12} className="text-gray-400" />{labour.phone}</div>
                        <div className="flex items-center gap-2"><FolderOpen size={12} className="text-gray-400" />{labour.project || labour.projectName || 'N/A'}</div>
                        {labour.address && <div className="flex items-center gap-2"><MapPin size={12} className="text-gray-400" />{labour.address}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* ── Pagination footer ── */}
                <Pagination
                  currentPage={currentPage}
                  totalItems={filteredLabourers.length}
                  pageSize={rowsPerPage}
                  onPageChange={setCurrentPage}
                  onPageSizeChange={setRowsPerPage}
                />
                {false && <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">
                    {filteredLabourers.length === 0
                      ? 'No entries'
                      : `Showing ${startEntry} to ${endEntry} of ${filteredLabourers.length} entries`}
                  </p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    {getPaginationItems(currentPage, totalPages).map((item, i) =>
                      item === '...'
                        ? <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-sm text-gray-400">…</span>
                        : <button key={item} onClick={() => setCurrentPage(item)}
                            className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${currentPage === item ? 'bg-yellow-400 text-black' : 'text-gray-500 hover:bg-gray-100'}`}>
                            {item}
                          </button>
                    )}
                    <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}
                      className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Add Labour Modal ── */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add New Labour</h2>
              <button onClick={() => setShowAddForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6">
              {renderLabourFields(newLabour, setNewLabour)}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleAddLabour}
                  className="flex-1 px-4 py-2.5 bg-yellow-400 text-black rounded-xl text-sm font-semibold hover:bg-yellow-500 transition">Add Labour</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Labour Modal ── */}
      {showEditForm && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Edit Labour Details</h2>
              <button onClick={() => setShowEditForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6">
              {renderLabourFields(editLabour, setEditLabour)}
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditForm(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleUpdateLabour}
                  className="flex-1 px-4 py-2.5 bg-yellow-400 text-black rounded-xl text-sm font-semibold hover:bg-yellow-500 transition">Update Labour</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Add Payment Modal ── */}
      {showPaymentModal && selectedLabour && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Add Payment</h2>
              <button onClick={() => { setShowPaymentModal(false); setSelectedLabour(null) }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-xs text-gray-500">Labour Name</p>
                <p className="font-semibold text-gray-900">{selectedLabour.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="number" min="0" step="0.01" value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" placeholder="Enter amount" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 text-gray-400" size={18} />
                  <input type="date" value={payment.date} onChange={(e) => setPayment({ ...payment, date: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowPaymentModal(false); setSelectedLabour(null) }}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition">Cancel</button>
                <button onClick={handleAddPayment}
                  className="flex-1 px-4 py-2.5 bg-yellow-400 text-black rounded-xl text-sm font-semibold hover:bg-yellow-500 transition">Add Payment</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Payments Modal ── */}
      {showViewPaymentsModal && selectedLabour && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                <p className="text-sm text-gray-500 mt-0.5">{selectedLabour.name}</p>
              </div>
              <button onClick={() => { setShowViewPaymentsModal(false); setSelectedLabour(null) }} className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"><X size={20} /></button>
            </div>
            <div className="p-6 flex flex-col flex-1 overflow-hidden">
              <div className="bg-green-50 rounded-xl p-4 mb-4">
                <p className="text-xs text-gray-500 mb-1">Total Amount Paid</p>
                <p className="text-3xl font-bold text-green-600 flex items-center gap-1">
                  <IndianRupee size={22} />{selectedLabour.totalPaid?.toFixed(2) || '0.00'}
                </p>
                <p className="text-xs text-gray-500 mt-1">{getPaymentCount(selectedLabour)} payment{getPaymentCount(selectedLabour) !== 1 ? 's' : ''}</p>
              </div>
              <div className="flex-1 overflow-y-auto space-y-2">
                {!selectedLabour.payments || selectedLabour.payments.length === 0 ? (
                  <div className="text-center py-10">
                    <IndianRupee className="mx-auto text-gray-300 mb-2" size={40} />
                    <p className="text-gray-500 text-sm">No payments recorded yet</p>
                  </div>
                ) : selectedLabour.payments.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => (
                  <div key={p.id} className="flex justify-between items-center bg-gray-50 px-4 py-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-100 p-2 rounded-lg"><Calendar size={16} className="text-yellow-600" /></div>
                      <p className="text-sm font-medium text-gray-800">
                        {new Date(p.date).toLocaleDateString('en-IN', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <p className="font-bold text-gray-900 flex items-center gap-0.5 text-sm">
                      <IndianRupee size={14} />{p.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
              <button onClick={() => { setShowViewPaymentsModal(false); setSelectedLabour(null) }}
                className="mt-4 w-full px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminLabourManagement
