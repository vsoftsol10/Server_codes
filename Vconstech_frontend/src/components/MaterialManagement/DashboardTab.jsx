// import React, { useState, useEffect } from "react";
// import { Package, TrendingUp, IndianRupee, Loader2, Plus, X } from "lucide-react";
// import MetricCard from "./MetricCard";
// import { materialAPI, materialRequestAPI } from "../../api/materialAPI";
// import { projectAPI } from "../../api/projectAPI";

// // Modal Component
// const EmployeeModalMaterial = ({ isOpen, onClose, title, children, footer }) => {
//   if (!isOpen) return null;
  
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
//       <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
//         <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
//           <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
//           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//             <X className="w-6 h-6" />
//           </button>
//         </div>
//         <div className="p-6">{children}</div>
//         {footer && (
//           <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
//             {footer}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// const emptyMaterial = {
//   requestType: 'global',
//   projectId: '',
//   name: '',
//   category: '',
//   unit: 'piece',
//   defaultRate: '',
//   quantityNeeded: '',
//   vendor: '',
//   description: '',
//   dueDate: ''
// };

// // Shared input class for consistent light gray styling across all fields
// const inputClass = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black placeholder-gray-500 font-normal";

// const DashboardTab = () => {
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);
//   const [dashboardData, setDashboardData] = useState({
//     metrics: { totalMaterials: 0, activeMaterials: 0, totalCost: 0 },
//     usageLogs: []
//   });

//   const [projects, setProjects] = useState([]);
//   const [loadingProjects, setLoadingProjects] = useState(false);
//   const [userRole, setUserRole] = useState(null);
//   const [showAddMaterial, setShowAddMaterial] = useState(false);
//   const [newMaterial, setNewMaterial] = useState(emptyMaterial);

//   const units = ['piece', 'kg', 'liters', 'sq ft', 'boxes', 'meters', 'bags'];

//   useEffect(() => {
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     setUserRole(user.role);
//     fetchDashboardData();
//     fetchProjects();
//   }, []);

//   const fetchProjects = async () => {
//     try {
//       setLoadingProjects(true);
//       const result = await projectAPI.getProjects();
//       const mappedProjects = result.projects?.map(p => ({ id: p.id, name: p.name })) || [];
//       setProjects(mappedProjects);
//     } catch (err) {
//       console.error('❌ Error fetching projects:', err);
//       setProjects([]);
//     } finally {
//       setLoadingProjects(false);
//     }
//   };

//   const fetchDashboardData = async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const data = await materialAPI.getDashboardData();
//       setDashboardData(data);
//     } catch (err) {
//       console.error('Error fetching dashboard data:', err);
//       setError(err.error || err.message || 'Failed to load dashboard data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmitMaterial = async () => {
//     try {
//       setSubmitting(true);
//       if (userRole === 'ADMIN' || userRole === 'Admin') {
//         if (newMaterial.requestType === 'global') {
//           await materialAPI.create(newMaterial);
//           alert('✅ Global material added successfully!');
//         } else {
//           const materialResult = await materialAPI.create(newMaterial);
//           await materialAPI.addToProject({
//             materialId: materialResult.material.id,
//             projectId: newMaterial.projectId,
//             quantityNeeded: newMaterial.quantityNeeded
//           });
//           alert('✅ Project-specific material added successfully!');
//         }
//       } else {
//         await materialRequestAPI.create(newMaterial);
//         alert('✅ Material request submitted successfully! Waiting for admin approval.');
//       }
//       setNewMaterial(emptyMaterial);
//       setShowAddMaterial(false);
//       fetchDashboardData();
//     } catch (err) {
//       console.error('❌ Failed to add material:', err);
//       const errorMsg = err.details
//         ? `${err.error}\n\nDetails: ${JSON.stringify(err.details, null, 2)}`
//         : (err.error || err.message || 'Unknown error occurred');
//       alert(`❌ Failed to add material:\n\n${errorMsg}`);
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-[400px]">
//         <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
//         <span className="ml-3 text-gray-600">Loading dashboard...</span>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-6">
//         <div className="bg-red-50 border border-red-200 rounded-lg p-4">
//           <p className="text-red-800 font-medium">Error loading dashboard</p>
//           <p className="text-red-600 text-sm mt-1">{error}</p>
//           <button onClick={fetchDashboardData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
//             Retry
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const { metrics, usageLogs } = dashboardData;

//   return (
//     <div className="space-y-6 p-4 sm:p-6">

//       {/* Add Material Button */}
//       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
  
//   <span className="text-sm text-gray-600 leading-relaxed sm:max-w-[70%]">
//     {userRole === 'ADMIN'
//       ? 'Add materials directly to the database'
//       : 'Submit material requests for admin approval'}
//   </span>

//   <button
//     onClick={() => setShowAddMaterial(true)}
//     className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg cursor-pointer transition-colors shadow-md hover:shadow-lg w-full sm:w-auto"
//   >
//     <Plus className="w-5 h-5" />
//     Add Material
//   </button>

// </div>

//       {/* Metrics Section */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
//         <MetricCard title="Total Materials" value={metrics.totalMaterials} icon={Package} iconColor="text-blue-600" />
//         <MetricCard title="Active in Projects" value={metrics.activeMaterials} icon={TrendingUp} iconColor="text-green-600" />
//         <MetricCard title="Total Cost (Used)" value={`₹${metrics.totalCost.toLocaleString()}`} icon={IndianRupee} iconColor="text-emerald-600" />
//       </div>

//       {/* Recent Material Usage Table */}
//       <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//         <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
//           <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Material Usage</h2>
//         </div>
//         {usageLogs.length === 0 ? (
//           <div className="p-8 text-center text-gray-500">
//             <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//             <p>No material usage recorded yet</p>
//           </div>
//         ) : (
//           <div className="overflow-x-auto">
//             <table className="min-w-full divide-y divide-gray-200 text-sm sm:text-base">
//               <thead className="bg-yellow-500">
//                 <tr>
//                   {['Date', 'Project', 'Material', 'Quantity', 'User', 'Remarks'].map(h => (
//                     <th key={h} className="px-4 sm:px-6 py-3 text-left font-bold text-black uppercase tracking-wider">{h}</th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody className="bg-white divide-y divide-gray-200">
//                 {usageLogs.map((log) => (
//                   <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-200">
//                     <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{new Date(log.date).toLocaleDateString()}</td>
//                     <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{log.projectName}</td>
//                     <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{log.materialName}</td>
//                     <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{log.quantity} {log.unit}</td>
//                     <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{log.userName}</td>
//                     <td className="px-4 sm:px-6 py-3 text-gray-600 break-words max-w-[200px]">{log.remarks || "-"}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         )}
//       </div>

//       {/* Add Material Modal */}
//       <EmployeeModalMaterial
//         isOpen={showAddMaterial}
//         onClose={() => { setShowAddMaterial(false); setNewMaterial(emptyMaterial); }}
//         title={
//           userRole === 'ADMIN'
//             ? (newMaterial.requestType === 'global' ? 'Add New Global Material' : 'Add Project-Specific Material')
//             : (newMaterial.requestType === 'global' ? 'Request New Global Material' : 'Request Project-Specific Material')
//         }
//         footer={
//           <>
//             <button
//               onClick={() => setShowAddMaterial(false)}
//               className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleSubmitMaterial}
//               disabled={
//                 !newMaterial.name ||
//                 !newMaterial.category ||
//                 (newMaterial.requestType === 'global'
//                   ? !newMaterial.defaultRate
//                   : (!newMaterial.defaultRate || !newMaterial.quantityNeeded || !newMaterial.projectId)) ||
//                 submitting
//               }
//               className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             >
//               Add Material
//             </button>
//           </>
//         }
//       >
//         <div className="space-y-4">

//           {/* Request Type */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">Request Type</label>
//             <div className="flex items-center gap-6">
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="radio"
//                   name="requestType"
//                   value="global"
//                   checked={newMaterial.requestType === 'global'}
//                   onChange={(e) => setNewMaterial({...newMaterial, requestType: e.target.value, projectId: '', quantityNeeded: ''})}
//                   className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">Global Material (Available for all projects)</span>
//               </label>
//               <label className="flex items-center cursor-pointer">
//                 <input
//                   type="radio"
//                   name="requestType"
//                   value="project"
//                   checked={newMaterial.requestType === 'project'}
//                   onChange={(e) => setNewMaterial({...newMaterial, requestType: e.target.value})}
//                   className="w-4 h-4 text-blue-600 focus:ring-blue-500"
//                 />
//                 <span className="ml-2 text-sm text-gray-700">Project-Specific Material</span>
//               </label>
//             </div>
//           </div>

//           {/* Project Dropdown */}
//           {newMaterial.requestType === 'project' && (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Project <span className="text-red-500">*</span>
//               </label>
//               {loadingProjects ? (
//                 <div className="flex items-center gap-2 text-gray-500">
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   <span className="text-sm">Loading projects...</span>
//                 </div>
//               ) : (
//                 <select
//                   value={newMaterial.projectId}
//                   onChange={(e) => setNewMaterial({...newMaterial, projectId: e.target.value})}
//                   className={inputClass}
//                 >
//                   <option value="">Select Project</option>
//                   {projects.map(project => (
//                     <option key={project.id} value={project.id}>{project.name}</option>
//                   ))}
//                 </select>
//               )}
//             </div>
//           )}

//           {/* Material Name */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Material Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               type="text"
//               value={newMaterial.name}
//               onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
//               className={inputClass}
//               placeholder="e.g., Asian Paints Premium"
//             />
//           </div>

//           {/* Category and Unit */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Category <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={newMaterial.category}
//                 onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
//                 className={inputClass}
//                 placeholder="Paint"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
//               <select
//                 value={newMaterial.unit}
//                 onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
//                 className={inputClass}
//               >
//                 {units.map(unit => (
//                   <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
//                 ))}
//               </select>
//             </div>
//           </div>

//           {/* Default Rate / Project Price and Quantity Needed */}
//           {newMaterial.requestType === 'global' ? (
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Default Rate (₹) <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="number"
//                 value={newMaterial.defaultRate}
//                 onChange={(e) => setNewMaterial({...newMaterial, defaultRate: e.target.value})}
//                 className={inputClass}
//                 placeholder="450"
//               />
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 gap-4">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Material Price (₹) <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={newMaterial.defaultRate}
//                   onChange={(e) => setNewMaterial({...newMaterial, defaultRate: e.target.value})}
//                   className={inputClass}
//                   placeholder="450"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Quantity Needed <span className="text-red-500">*</span>
//                 </label>
//                 <input
//                   type="number"
//                   value={newMaterial.quantityNeeded}
//                   onChange={(e) => setNewMaterial({...newMaterial, quantityNeeded: e.target.value})}
//                   className={inputClass}
//                   placeholder="100"
//                 />
//               </div>
//             </div>
//           )}

//           {/* Vendor/Supplier and Due Date */}
//           <div className="grid grid-cols-2 gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-900 mb-2">Vendor/Supplier</label>
//               <input
//                 type="text"
//                 value={newMaterial.vendor}
//                 onChange={(e) => setNewMaterial({...newMaterial, vendor: e.target.value})}
//                 className={inputClass}
//                 placeholder="e.g., Asian Paints"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
//               <input
//                 type="date"
//                 value={newMaterial.dueDate}
//                 onChange={(e) => setNewMaterial({...newMaterial, dueDate: e.target.value})}
//                 className={inputClass}
//               />
//             </div>
//           </div>

//           {/* Description/Remarks */}
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Description/Remarks</label>
//             <textarea
//               value={newMaterial.description}
//               onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
//               rows="3"
//               className={inputClass}
//               placeholder="Additional details about the material.."
//             />
//           </div>

//         </div>
//       </EmployeeModalMaterial>
//     </div>
//   );
// };

// export default DashboardTab;

import React, { useState, useEffect, useRef } from "react";
import {
  Package,
  TrendingUp,
  IndianRupee,
  ClipboardList,
  Loader2,
  Plus,
  X,
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  LabelList,
} from "recharts";
import { materialAPI, materialRequestAPI } from "../../api/materialAPI";
import { projectAPI } from "../../api/projectAPI";
import Pagination from "../../components/common/Pagination";

const ROWS_PER_PAGE = 8;

// Modal Component
const EmployeeModalMaterial = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity duration-300 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto shadow-lg">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const emptyMaterial = {
  requestType: 'global',
  projectId: '',
  name: '',
  category: '',
  unit: 'piece',
  defaultRate: '',
  quantityNeeded: '',
  vendor: '',
  description: '',
  dueDate: ''
};

// Shared input class for consistent light gray styling across all fields — theme-matched focus ring
const inputClass = "w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-black placeholder-gray-500 font-normal";

// Stat card styled to match icon-chip + sparkline layout
const StatCard = ({ icon: Icon, iconBg, iconColor, label, value, sublabel, sparklineColor, sparklinePoints }) => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 sm:p-3.5">
    <div className="flex items-center justify-between mb-2">
      <span className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </span>
      {sparklinePoints && (
        <svg viewBox="0 0 100 32" className="w-14 h-5" preserveAspectRatio="none">
          <polyline points={sparklinePoints} fill="none" stroke={sparklineColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500">{label}</p>
    </div>
    <p className="text-[11px] text-gray-400">{sublabel}</p>
  </div>
);

// Static demo series for the trends chart — replace with real API data when available
const trendData = [
  { year: '2020', materials: 20, cost: 1.2 },
  { year: '2021', materials: 35, cost: 1.8 },
  { year: '2022', materials: 50, cost: 2.6 },
  { year: '2023', materials: 65, cost: 3.2 },
  { year: '2024', materials: 78, cost: 3.8 },
  { year: '2025', materials: 70, cost: 3.1 },
];

const MaterialTrendsChart = () => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Material Trends</h2>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={trendData} margin={{ top: 20, right: 20, left: 0, bottom: 0 }} barGap={6}>
          <CartesianGrid stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="year" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            label={{ value: 'Total Materials (Count)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#2563eb' }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v.toFixed(1)}L`}
            label={{ value: 'Total Cost (Used) (₹ in Lakh)', angle: 90, position: 'insideRight', fontSize: 11, fill: '#ef4444' }}
          />
          <Tooltip formatter={(value, name) => name === 'cost' ? [`₹${value}L`, 'Total Cost (Used)'] : [value, 'Total Materials']} />
          <Legend
            formatter={(value) => (value === 'materials' ? 'Total Materials' : 'Total Cost (Used)')}
            wrapperStyle={{ fontSize: 13 }}
          />
          <Bar yAxisId="left" dataKey="materials" fill="#2563eb" radius={[6, 6, 0, 0]} maxBarSize={28}>
            <LabelList dataKey="materials" position="top" fontSize={11} fill="#2563eb" />
          </Bar>
          <Bar yAxisId="right" dataKey="cost" fill="#ef4444" radius={[6, 6, 0, 0]} maxBarSize={28}>
            <LabelList dataKey="cost" position="top" fontSize={11} fill="#ef4444" formatter={(v) => `${v}L`} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-gray-400 mt-2">
        Demo data shown — connect real historical figures once your API provides them.
      </p>
    </div>
  );
};

const DashboardTab = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    metrics: { totalMaterials: 0, activeMaterials: 0, totalCost: 0 },
    usageLogs: []
  });

  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [showAddMaterial, setShowAddMaterial] = useState(false);
  const [newMaterial, setNewMaterial] = useState(emptyMaterial);
  const [searchTerm, setSearchTerm] = useState('');

  // UI-only: pagination state for Recent Material Usage table
  const [usageLogsPage, setUsageLogsPage] = useState(1);

  // UI-only: "Filter" button state — filters the usage log table by project
  const [projectFilter, setProjectFilter] = useState("All");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // UI-only: date range picker state — filters the usage log table by log.date
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedDateFrom, setAppliedDateFrom] = useState("");
  const [appliedDateTo, setAppliedDateTo] = useState("");
  const [isDateOpen, setIsDateOpen] = useState(false);
  const dateRef = useRef(null);

  const units = ['piece', 'kg', 'liters', 'sq ft', 'boxes', 'meters', 'bags'];

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role);
    fetchDashboardData();
    fetchProjects();
  }, []);

  // IMPORTANT: this hook must stay above any early "return" below it
  // (loading / error screens), otherwise React sees a different number
  // of hooks between renders and throws "Rendered more hooks than
  // during the previous render."
  useEffect(() => {
    setUsageLogsPage(1);
  }, [searchTerm, projectFilter, appliedDateFrom, appliedDateTo, dashboardData.usageLogs.length]);

  // Close the filter/date dropdowns when clicking outside them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const result = await projectAPI.getProjects();
      const mappedProjects = result.projects?.map(p => ({ id: p.id, name: p.name })) || [];
      setProjects(mappedProjects);
    } catch (err) {
      console.error('❌ Error fetching projects:', err);
      setProjects([]);
    } finally {
      setLoadingProjects(false);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await materialAPI.getDashboardData();
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(err.error || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMaterial = async () => {
    try {
      setSubmitting(true);
      if (userRole === 'ADMIN' || userRole === 'Admin') {
        if (newMaterial.requestType === 'global') {
          await materialAPI.create(newMaterial);
          alert('✅ Global material added successfully!');
        } else {
          const materialResult = await materialAPI.create(newMaterial);
          await materialAPI.addToProject({
            materialId: materialResult.material.id,
            projectId: newMaterial.projectId,
            quantityNeeded: newMaterial.quantityNeeded
          });
          alert('✅ Project-specific material added successfully!');
        }
      } else {
        await materialRequestAPI.create(newMaterial);
        alert('✅ Material request submitted successfully! Waiting for admin approval.');
      }
      setNewMaterial(emptyMaterial);
      setShowAddMaterial(false);
      fetchDashboardData();
    } catch (err) {
      console.error('❌ Failed to add material:', err);
      const errorMsg = err.details
        ? `${err.error}\n\nDetails: ${JSON.stringify(err.details, null, 2)}`
        : (err.error || err.message || 'Unknown error occurred');
      alert(`❌ Failed to add material:\n\n${errorMsg}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-500" />
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-red-800 font-medium">Error loading dashboard</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button onClick={fetchDashboardData} className="mt-3 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { metrics, usageLogs } = dashboardData;

  // Unique project names for the Filter dropdown — derived from the logs already in state
  const usageProjectNames = [
    ...new Set(usageLogs.map((log) => log.projectName).filter(Boolean)),
  ];

  // Client-side search + project + date-range filter over the visible usage log table — purely UI, no API change
  const filteredUsageLogs = usageLogs
    .filter((log) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        log.materialName?.toLowerCase().includes(term) ||
        log.projectName?.toLowerCase().includes(term)
      );
    })
    .filter((log) => {
      if (projectFilter === "All") return true;
      return log.projectName === projectFilter;
    })
    .filter((log) => {
      if (!appliedDateFrom && !appliedDateTo) return true;
      if (!log.date) return false;
      const logDate = new Date(log.date);
      if (appliedDateFrom && logDate < new Date(appliedDateFrom)) return false;
      if (appliedDateTo) {
        // include the entire "to" day
        const toEnd = new Date(appliedDateTo);
        toEnd.setHours(23, 59, 59, 999);
        if (logDate > toEnd) return false;
      }
      return true;
    });

  // UI-only: paginated slice rendered in the table below
  const paginatedUsageLogs = filteredUsageLogs.slice(
    (usageLogsPage - 1) * ROWS_PER_PAGE,
    usageLogsPage * ROWS_PER_PAGE
  );

  // UI-only: label shown on the date range button
  const formatShort = (isoDate) =>
    new Date(isoDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const dateRangeLabel =
    appliedDateFrom && appliedDateTo
      ? `${formatShort(appliedDateFrom)} – ${formatShort(appliedDateTo)}`
      : appliedDateFrom
      ? `From ${formatShort(appliedDateFrom)}`
      : appliedDateTo
      ? `Until ${formatShort(appliedDateTo)}`
      : "Date Range";

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">

      {/* Add Material row */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <span className="text-sm text-gray-600 leading-relaxed sm:max-w-[70%]">
          {userRole === 'ADMIN'
            ? 'Add materials directly to the database'
            : 'Submit material requests for admin approval'}
        </span>

        <button
          onClick={() => setShowAddMaterial(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-400 text-black rounded-xl font-semibold cursor-pointer transition-colors shadow-sm hover:bg-yellow-500 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Material
        </button>
      </div>

      {/* Search / Filter / Date row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search materials, category, or project..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent shadow-sm"
          />
        </div>
        <div className="relative" ref={filterRef}>
          <button
            type="button"
            onClick={() => setIsFilterOpen((open) => !open)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-colors shadow-sm w-full sm:w-auto ${
              projectFilter !== "All"
                ? "border-yellow-400 text-yellow-800 bg-yellow-50"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className={`w-4 h-4 ${projectFilter !== "All" ? "text-yellow-600" : "text-gray-500"}`} />
            {projectFilter === "All" ? "Filter" : projectFilter}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 z-10 mt-1 w-56 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
              <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wide border-b border-gray-50">
                Filter by Project
              </div>
              <div className="max-h-60 overflow-y-auto">
                <button
                  type="button"
                  onClick={() => { setProjectFilter("All"); setIsFilterOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                    projectFilter === "All"
                      ? "bg-yellow-50 text-yellow-800 font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  All Projects
                  {projectFilter === "All" && <Check className="w-4 h-4 text-yellow-600" />}
                </button>
                {usageProjectNames.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-gray-400">No projects found</div>
                ) : (
                  usageProjectNames.map((name) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => { setProjectFilter(name); setIsFilterOpen(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                        projectFilter === name
                          ? "bg-yellow-50 text-yellow-800 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="truncate">{name}</span>
                      {projectFilter === name && <Check className="w-4 h-4 text-yellow-600 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={dateRef}>
          <button
            type="button"
            onClick={() => {
              // seed the draft inputs with whatever's currently applied
              setDateFrom(appliedDateFrom);
              setDateTo(appliedDateTo);
              setIsDateOpen((open) => !open);
            }}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-medium transition-colors whitespace-nowrap shadow-sm w-full sm:w-auto ${
              appliedDateFrom || appliedDateTo
                ? "border-yellow-400 text-yellow-800 bg-yellow-50"
                : "border-gray-200 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Calendar className={`w-4 h-4 ${appliedDateFrom || appliedDateTo ? "text-yellow-600" : "text-gray-500"}`} />
            {dateRangeLabel}
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isDateOpen && (
            <div className="absolute right-0 z-10 mt-1 w-72 bg-white border border-gray-100 rounded-xl shadow-lg p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                Filter by Date
              </p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setDateFrom("");
                    setDateTo("");
                    setAppliedDateFrom("");
                    setAppliedDateTo("");
                    setIsDateOpen(false);
                  }}
                  className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAppliedDateFrom(dateFrom);
                    setAppliedDateTo(dateTo);
                    setIsDateOpen(false);
                  }}
                  className="flex-1 px-3 py-2 bg-yellow-400 text-black text-sm font-semibold rounded-xl shadow-sm hover:bg-yellow-500 transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          icon={Package}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          label="Total Materials"
          value={metrics.totalMaterials}
          sublabel="All Materials"
          sparklineColor="#7c3aed"
          sparklinePoints="0,26 20,20 40,22 60,10 80,14 100,4"
        />
        <StatCard
          icon={TrendingUp}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          label="Active in Projects"
          value={metrics.activeMaterials}
          sublabel="Currently Used"
          sparklineColor="#16a34a"
          sparklinePoints="0,24 20,22 40,16 60,18 80,8 100,12"
        />
        <StatCard
          icon={IndianRupee}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          label="Total Cost (Used)"
          value={`₹${metrics.totalCost.toLocaleString()}`}
          sublabel="This Period"
          sparklineColor="#f97316"
          sparklinePoints="0,22 20,24 40,14 60,20 80,10 100,6"
        />
        <StatCard
          icon={ClipboardList}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          label="Pending Requests"
          value="—"
          sublabel="Awaiting Approval"
          sparklineColor="#2563eb"
          sparklinePoints="0,28 20,20 40,22 60,12 80,16 100,4"
        />
      </div>

      {/* Material Trends Chart */}
      <MaterialTrendsChart />

      {/* Recent Material Usage Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Recent Material Usage</h2>
          
        </div>
        {filteredUsageLogs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No material usage recorded yet</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-yellow-400">
                  <tr>
                    {['Material', 'Project', 'Quantity', 'Unit', 'Used By', 'Date & Time'].map(h => (
                      <th key={h} className="px-4 sm:px-6 py-3 text-left font-bold text-black text-xs uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {paginatedUsageLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 transition-colors duration-200">
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-800 font-medium">{log.materialName}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-yellow-700 hover:underline cursor-pointer">{log.projectName}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{log.quantity}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{log.unit}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-600">{log.userName}</td>
                      <td className="px-4 sm:px-6 py-3 whitespace-nowrap text-gray-500">
                        {new Date(log.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                        {log.date && `, ${new Date(log.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={usageLogsPage}
              totalItems={filteredUsageLogs.length}
              pageSize={ROWS_PER_PAGE}
              onPageChange={setUsageLogsPage}
            />
          </>
        )}
      </div>

      {/* Add Material Modal */}
      <EmployeeModalMaterial
        isOpen={showAddMaterial}
        onClose={() => { setShowAddMaterial(false); setNewMaterial(emptyMaterial); }}
        title={
          userRole === 'ADMIN'
            ? (newMaterial.requestType === 'global' ? 'Add New Global Material' : 'Add Project-Specific Material')
            : (newMaterial.requestType === 'global' ? 'Request New Global Material' : 'Request Project-Specific Material')
        }
        footer={
          <>
            <button
              onClick={() => setShowAddMaterial(false)}
              className="px-6 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmitMaterial}
              disabled={
                !newMaterial.name ||
                !newMaterial.category ||
                (newMaterial.requestType === 'global'
                  ? !newMaterial.defaultRate
                  : (!newMaterial.defaultRate || !newMaterial.quantityNeeded || !newMaterial.projectId)) ||
                submitting
              }
              className="px-6 py-2 bg-yellow-400 text-black font-semibold rounded-xl hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              Add Material
            </button>
          </>
        }
      >
        <div className="space-y-4">

          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Request Type</label>
            <div className="flex items-center gap-6">
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  value="global"
                  checked={newMaterial.requestType === 'global'}
                  onChange={(e) => setNewMaterial({...newMaterial, requestType: e.target.value, projectId: '', quantityNeeded: ''})}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-400"
                />
                <span className="ml-2 text-sm text-gray-700">Global Material (Available for all projects)</span>
              </label>
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="requestType"
                  value="project"
                  checked={newMaterial.requestType === 'project'}
                  onChange={(e) => setNewMaterial({...newMaterial, requestType: e.target.value})}
                  className="w-4 h-4 text-yellow-500 focus:ring-yellow-400"
                />
                <span className="ml-2 text-sm text-gray-700">Project-Specific Material</span>
              </label>
            </div>
          </div>

          {/* Project Dropdown */}
          {newMaterial.requestType === 'project' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project <span className="text-red-500">*</span>
              </label>
              {loadingProjects ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading projects...</span>
                </div>
              ) : (
                <select
                  value={newMaterial.projectId}
                  onChange={(e) => setNewMaterial({...newMaterial, projectId: e.target.value})}
                  className={inputClass}
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}

          {/* Material Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Material Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newMaterial.name}
              onChange={(e) => setNewMaterial({...newMaterial, name: e.target.value})}
              className={inputClass}
              placeholder="e.g., Asian Paints Premium"
            />
          </div>

          {/* Category and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newMaterial.category}
                onChange={(e) => setNewMaterial({...newMaterial, category: e.target.value})}
                className={inputClass}
                placeholder="Paint"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
              <select
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial({...newMaterial, unit: e.target.value})}
                className={inputClass}
              >
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit.charAt(0).toUpperCase() + unit.slice(1)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Default Rate / Project Price and Quantity Needed */}
          {newMaterial.requestType === 'global' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Rate (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={newMaterial.defaultRate}
                onChange={(e) => setNewMaterial({...newMaterial, defaultRate: e.target.value})}
                className={inputClass}
                placeholder="450"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Price (₹) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newMaterial.defaultRate}
                  onChange={(e) => setNewMaterial({...newMaterial, defaultRate: e.target.value})}
                  className={inputClass}
                  placeholder="450"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity Needed <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={newMaterial.quantityNeeded}
                  onChange={(e) => setNewMaterial({...newMaterial, quantityNeeded: e.target.value})}
                  className={inputClass}
                  placeholder="100"
                />
              </div>
            </div>
          )}

          {/* Vendor/Supplier and Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">Vendor/Supplier</label>
              <input
                type="text"
                value={newMaterial.vendor}
                onChange={(e) => setNewMaterial({...newMaterial, vendor: e.target.value})}
                className={inputClass}
                placeholder="e.g., Asian Paints"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
              <input
                type="date"
                value={newMaterial.dueDate}
                onChange={(e) => setNewMaterial({...newMaterial, dueDate: e.target.value})}
                className={inputClass}
              />
            </div>
          </div>

          {/* Description/Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description/Remarks</label>
            <textarea
              value={newMaterial.description}
              onChange={(e) => setNewMaterial({...newMaterial, description: e.target.value})}
              rows="3"
              className={inputClass}
              placeholder="Additional details about the material.."
            />
          </div>

        </div>
      </EmployeeModalMaterial>
    </div>
  );
};

export default DashboardTab;
