import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, Package, DollarSign, FileText, TrendingUp, Calendar, Users, ArrowRight, ChevronLeft, ChevronRight, IndianRupee, AlertCircle, Loader, MapPin } from 'lucide-react';
import Navbar from '../../components/common/Navbar';
import SidePannel from '../../components/common/SidePannel';

const API_BASE_URL = '/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    projects: [],
    materials: { metrics: {}, usageLogs: [] },
    financial: { projects: [], count: 0 },
    engineers: [],
    contracts: []
  });

  const getAuthToken = () => localStorage.getItem('authToken') || localStorage.getItem('token');

const fetchData = async (endpoint) => {
  const token = getAuthToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  // ✅ Check if response is actually JSON
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    throw new Error(`Expected JSON but got ${contentType || 'unknown'} from ${endpoint}`);
  }
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'An error occurred');
  return data;
};

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const token = getAuthToken();
        if (!token) throw new Error('No authentication token found. Please login.');

        const results = await Promise.allSettled([
          fetchData('/projects'),
          fetchData('/materials/dashboard'),
          fetchData('/financial/projects'),
          fetchData('/employees'),
          fetchData('/contracts')
        ]);

        setDashboardData({
          projects: results[0].status === 'fulfilled' ? results[0].value.projects || [] : [],
          materials: results[1].status === 'fulfilled' ? results[1].value.data || { metrics: {}, usageLogs: [] } : { metrics: {}, usageLogs: [] },
          financial: results[2].status === 'fulfilled' ? { projects: results[2].value.projects || [], count: results[2].value.count || 0 } : { projects: [], count: 0 },
          engineers: results[3].status === 'fulfilled' ? results[3].value.employees || [] : [],
          contracts: results[4].status === 'fulfilled' ? results[4].value.contracts || [] : []
        });

        results.forEach((res, idx) => {
          if (res.status === 'rejected') console.warn(`Failed to fetch data [${idx}]:`, res.reason);
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  const isActiveStatus = (status) => {
    const s = (status || '').toLowerCase().trim();
    return ['in progress', 'inprogress', 'active', 'ongoing'].includes(s);
  };

  const calculateSummaryCards = () => {
    const ongoingProjects = dashboardData.projects.filter(p => ['ONGOING', 'In Progress'].includes(p.status));
    const totalRevenue = dashboardData.financial.projects.reduce((sum, p) => sum + (parseFloat(p.quotationAmount) || 0), 0);
    const totalContractValue = dashboardData.contracts.reduce((sum, c) => sum + (parseFloat(c.contractValue || c.contractAmount || 0)), 0);
    const activeContracts = dashboardData.contracts.filter(c => isActiveStatus(c.status || c.workStatus)).length;

    return [
      {
        icon: LayoutGrid,
        title: 'Project Management',
        value: `${dashboardData.projects.length} Total Projects`,
        subtitle: `${ongoingProjects.length} Ongoing`,
        gradient: 'from-red-400 to-red-600'
      },
      {
        icon: Package,
        title: 'Material Management',
        value: `${dashboardData.materials.metrics?.totalMaterials || 0} Materials`,
        subtitle: `${dashboardData.materials.usageLogs?.length || 0} Recent Updates`,
        gradient: 'from-orange-400 to-orange-600'
      },
      {
        icon: IndianRupee,
        title: 'Financial Management',
        value: `₹${((totalRevenue + totalContractValue) / 100000).toFixed(1)}L Total`,
        subtitle: `${dashboardData.financial.count || 0} Projects + ${dashboardData.contracts.length} Contracts`,
        gradient: 'from-green-400 to-green-600'
      },
      {
        icon: FileText,
        title: 'Contract Management',
        value: `${dashboardData.contracts.length} Contracts`,
        subtitle: `${activeContracts} Active`,
        gradient: 'from-blue-400 to-blue-600'
      }
    ];
  };

  const getOngoingProjects = () => {
    return dashboardData.projects
      .filter(p => ['ONGOING', 'In Progress'].includes(p.status))
      .slice(0, 4)
      .map(project => {
        const actualProgress = project.actualProgress || 0;
        const start = new Date(project.startDate);
        const end = new Date(project.endDate);
        const totalDays = (end - start) / (1000 * 60 * 60 * 24);
        const elapsed = (new Date() - start) / (1000 * 60 * 60 * 24);
        const timeProgress = Math.min(Math.max(Math.round((elapsed / totalDays) * 100), 0), 100);
        const progressStatus = actualProgress > timeProgress + 10 ? 'ahead' : actualProgress < timeProgress - 10 ? 'behind' : 'ontrack';

        return {
          ...project,
          progress: actualProgress,
          timeProgress,
          progressStatus,
          client: project.clientName || 'N/A',
          location: project.location || 'Not specified',
          projectType: project.projectType || 'General'
        };
      });
  };

  const getContractStats = () => {
    const active = dashboardData.contracts.filter(c => isActiveStatus(c.status || c.workStatus)).length;
    const completed = dashboardData.contracts.filter(c => {
      const s = (c.status || c.workStatus || '').toLowerCase().trim();
      return ['completed', 'finished', 'closed', 'done'].includes(s);
    }).length;
    const pending = dashboardData.contracts.filter(c => {
      const s = (c.status || c.workStatus || '').toLowerCase().trim();
      return ['pending', 'draft', 'awaiting', 'not started'].includes(s);
    }).length;
    const totalValue = dashboardData.contracts.reduce((sum, c) => sum + (parseFloat(c.contractValue || c.contractAmount || 0)), 0);

    return { active, completed, pending, totalValue, total: dashboardData.contracts.length };
  };

  useEffect(() => {
    const projects = getOngoingProjects();
    if (projects.length === 0) return;
    
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % projects.length);
    }, 5000);
    
    return () => clearInterval(timer);
  }, [dashboardData.projects]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="animate-spin text-yellow-600 mx-auto mb-4" size={48} />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const summaryCards = calculateSummaryCards();
  const ongoingProjects = getOngoingProjects();
  const contractStats = getContractStats();
  const navSlide = (dir) => setCurrentSlide(prev => (prev + dir + ongoingProjects.length) % ongoingProjects.length);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>
      <aside className="fixed left-0 top-0 bottom-0 w-16 md:w-64 z-40 overflow-y-auto">
        <SidePannel />
      </aside>
      
      <div className="pt-20 pl-16 md:pl-64">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard Overview</h1>
          <p className="text-gray-600">Welcome back! Here's what's happening with your projects.</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {summaryCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div key={index} className={`relative bg-gradient-to-br ${card.gradient} rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group cursor-pointer`}>
                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white bg-opacity-30 p-3 rounded-xl">
                      <Icon className="text-black drop-shadow-lg" size={32} strokeWidth={2.5} />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-white text-3xl font-bold">{card.value}</p>
                    <h3 className="text-white text-sm font-medium opacity-90">{card.title}</h3>
                    <p className="text-white text-xs opacity-75">{card.subtitle}</p>
                  </div>
                  
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-5 rounded-full -mr-10 -mt-10"></div>
                  <div className="absolute bottom-0 right-0 w-16 h-16 bg-white opacity-5 rounded-full -mr-8 -mb-8"></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ongoing Projects Carousel */}
        {ongoingProjects.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Ongoing Projects</h2>
              <div className="flex gap-2">
                <button onClick={() => navSlide(-1)} className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-400 hover:text-white transition-colors duration-300">
                  <ChevronLeft size={20} />
                </button>
                <button onClick={() => navSlide(1)} className="p-2 rounded-lg bg-gray-100 hover:bg-yellow-400 hover:text-white transition-colors duration-300">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            <div className="relative overflow-hidden">
              <div className="flex transition-transform duration-500 ease-in-out" style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                {ongoingProjects.map((project) => (
                  <div key={project.id} className="min-w-full px-2">
                    <div className="bg-gradient-to-br from-yellow-50 via-white to-amber-50 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-yellow-100">
                      <div className="p-8">
                        <div className="flex items-start justify-between mb-6">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">{project.projectId}</div>
                              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">{project.projectType}</div>
                              
                            </div>
                            <h3 className="text-2xl font-bold text-gray-800 mb-2">{project.name}</h3>
                            {project.description && <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {[
                            { icon: Users, label: 'Client', value: project.client, color: 'blue' },
                            { icon: MapPin, label: 'Location', value: project.location, color: 'red' },
                            ...(project.budget ? [{ icon: IndianRupee, label: 'Budget', value: `₹${(project.budget / 100000).toFixed(2)}L`, color: 'green' }] : []),
                            { icon: Calendar, label: 'Timeline', value: `${new Date(project.startDate).toLocaleDateString()} - ${new Date(project.endDate).toLocaleDateString()}`, color: 'purple' }
                          ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
                              <item.icon className={`text-${item.color}-600 flex-shrink-0`} size={20} />
                              <div>
                                <p className="text-xs text-gray-500">{item.label}</p>
                                <p className="text-sm font-semibold text-gray-800">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mb-6 p-4 bg-white rounded-lg border border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-gray-700 font-semibold">Actual Project Progress</span>
                            <span className="text-yellow-600 font-bold text-lg">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden mb-2">
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2" style={{ width: `${project.progress}%` }}>
                              {project.progress > 10 && <span className="text-white text-xs font-bold">{project.progress}%</span>}
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                            <span>Time-based progress: {project.timeProgress}%</span>
                            {project.progressStatus === 'ahead' && <span className="text-green-600 font-medium">+{project.progress - project.timeProgress}% ahead</span>}
                            {project.progressStatus === 'behind' && <span className="text-red-600 font-medium">{project.progress - project.timeProgress}% behind</span>}
                          </div>
                        </div>

                        <button onClick={() => navigate('/project')} className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 group">
                          View Project Details
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-2 mt-6">
              {ongoingProjects.map((_, index) => (
                <button key={index} onClick={() => setCurrentSlide(index)} className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-yellow-600 w-8' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        )}

        {/* Insights Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Contract Statistics</h2>
              <FileText className="text-blue-600" size={24} />
            </div>
            <div className="space-y-4">
              {[
                { icon: FileText, label: 'Total Contracts', value: contractStats.total, bg: 'blue', color: 'blue' },
                { icon: null, label: 'Active Contracts', value: contractStats.active, bg: 'green', color: 'green' },
                { icon: null, label: 'Pending Contracts', value: contractStats.pending, bg: 'yellow', color: 'yellow' },
                { icon: IndianRupee, label: 'Total Value', value: `₹${(contractStats.totalValue / 100000).toFixed(1)}L`, bg: 'gray', color: 'purple' }
              ].map((stat, i) => (
                <div key={i} className={`flex items-center justify-between p-4 bg-${stat.bg}-50 rounded-lg`}>
                  <div className="flex items-center gap-3">
                    {stat.icon ? <stat.icon className={`text-${stat.color}-600`} size={20} /> : <div className={`w-3 h-3 bg-${stat.color}-500 rounded-full`}></div>}
                    <span className="text-gray-700 font-medium">{stat.label}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Quick Stats</h2>
              <Calendar className="text-yellow-600" size={24} />
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: Users, label: 'Active Engineers', value: dashboardData.engineers.length, color: 'blue' },
                { icon: Package, label: 'Total Materials', value: dashboardData.materials.metrics?.totalMaterials || 0, color: 'green' },
                { icon: IndianRupee, label: 'Total Projects', value: dashboardData.financial.count || 0, color: 'purple' }
              ].map((stat, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <stat.icon className={`text-${stat.color}-600`} size={20} />
                    <span className="text-gray-700 font-medium">{stat.label}</span>
                  </div>
                  <span className="text-xl font-bold text-gray-800">{stat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;