import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutGrid, Package, DollarSign, FileText, TrendingUp,
  Calendar, Users, ArrowRight, ChevronLeft, ChevronRight,
  IndianRupee, AlertCircle, Loader, MapPin
} from 'lucide-react';
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
        title: 'Projects',
        value: dashboardData.projects.length,
        subtitle: `${ongoingProjects.length} Ongoing`,
        gradient: 'from-red-400 to-red-600',
        lightBg: 'bg-red-50',
        textColor: 'text-red-600'
      },
      {
        icon: Package,
        title: 'Materials',
        value: dashboardData.materials.metrics?.totalMaterials || 0,
        subtitle: `${dashboardData.materials.usageLogs?.length || 0} Recent`,
        gradient: 'from-orange-400 to-orange-600',
        lightBg: 'bg-orange-50',
        textColor: 'text-orange-600'
      },
      {
        icon: IndianRupee,
        title: 'Finance',
        value: `₹${((totalRevenue + totalContractValue) / 100000).toFixed(1)}L`,
        subtitle: `${dashboardData.financial.count || 0} Projects`,
        gradient: 'from-green-400 to-green-600',
        lightBg: 'bg-green-50',
        textColor: 'text-green-600'
      },
      {
        icon: FileText,
        title: 'Contracts',
        value: dashboardData.contracts.length,
        subtitle: `${activeContracts} Active`,
        gradient: 'from-blue-400 to-blue-600',
        lightBg: 'bg-blue-50',
        textColor: 'text-blue-600'
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
          <Loader className="animate-spin text-yellow-500 mx-auto mb-4" size={40} />
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
          <AlertCircle className="text-red-400 mx-auto mb-3" size={40} />
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Failed to load</h2>
          <p className="text-gray-500 text-sm mb-5">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-500 text-black px-6 py-2 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        <Navbar />
      </nav>

      {/* SidePannel renders both desktop sidebar AND mobile bottom nav internally */}
      <SidePannel />

      {/* Main content */}
      <div className="pt-22 md:pl-64">
        <div className="px-3 sm:px-6 pt-4 pb-24 md:pb-10 max-w-6xl mx-auto space-y-5">

          {/* Page heading */}
          <div className="pt-1">
            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Dashboard Overview</h1>
            <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your projects.</p>
          </div>

          {/* Summary Cards — 2 cols on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {summaryCards.map((card, index) => {
              const Icon = card.icon;
              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${card.gradient} rounded-2xl p-4 shadow-sm relative overflow-hidden cursor-pointer active:scale-95 transition-transform`}
                >
                  {/* Decorative circles */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 bg-white opacity-10 rounded-full" />
                  <div className="absolute -bottom-3 -right-2 w-10 h-10 bg-white opacity-10 rounded-full" />

                  <div className="relative">
                    <div className="bg-white w-10 h-10 rounded-xl flex items-center justify-center mb-3 shadow-sm">
                      <Icon size={24} className="text-gray-700" strokeWidth={2} />
                    </div>
                     <p className="text-white text-l font-semibold mt-1 opacity-90">{card.title}</p>
                    <p className="text-white text-2xl font-bold leading-none">{card.value}</p>
                    <p className="text-white text-xs opacity-70 mt-0.5">{card.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Ongoing Projects Carousel */}
          {ongoingProjects.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Ongoing Projects</h2>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => navSlide(-1)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-yellow-400 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => navSlide(1)}
                    className="p-1.5 rounded-lg bg-gray-100 hover:bg-yellow-400 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {ongoingProjects.map((project) => (
                    <div key={project.id} className="min-w-full p-4">
                      {/* Project card */}
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-4">
                        {/* Badges + name */}
                        <div>
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">
                              {project.projectId}
                            </span>
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                              {project.projectType}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900">{project.name}</h3>
                          {project.description && (
                            <p className="text-xs text-gray-500 mt-1 line-clamp-2">{project.description}</p>
                          )}
                        </div>

                        {/* Info grid — 2 cols on mobile */}
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { icon: Users, label: 'Client', value: project.client, color: 'text-blue-500' },
                            { icon: MapPin, label: 'Location', value: project.location, color: 'text-red-500' },
                            ...(project.budget ? [{ icon: IndianRupee, label: 'Budget', value: `₹${(project.budget / 100000).toFixed(2)}L`, color: 'text-green-500' }] : []),
                            { icon: Calendar, label: 'End Date', value: new Date(project.endDate).toLocaleDateString(), color: 'text-purple-500' }
                          ].map((item, i) => (
                            <div key={i} className="flex items-start gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                              <item.icon size={14} className={`${item.color} mt-0.5 flex-shrink-0`} />
                              <div className="min-w-0">
                                <p className="text-sm text-gray-400">{item.label}</p>
                                <p className="text-xs font-semibold text-gray-800 truncate">{item.value}</p>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Progress bar */}
                        <div className="bg-white rounded-lg border border-gray-100 p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-semibold text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-yellow-600">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-full rounded-full transition-all duration-500"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-xs text-gray-400">
                            <span>Time: {project.timeProgress}%</span>
                            {project.progressStatus === 'ahead' && (
                              <span className="text-green-600 font-medium">↑ Ahead</span>
                            )}
                            {project.progressStatus === 'behind' && (
                              <span className="text-red-500 font-medium">↓ Behind</span>
                            )}
                            {project.progressStatus === 'ontrack' && (
                              <span className="text-blue-500 font-medium">→ On track</span>
                            )}
                          </div>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => navigate('/project')}
                          className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-sm font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 active:scale-95 transition-transform"
                        >
                          View Project Details
                          <ArrowRight size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dot indicators */}
              <div className="flex justify-center gap-1.5 pb-3">
                {ongoingProjects.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === currentSlide ? 'bg-yellow-500 w-6' : 'bg-gray-300 w-2'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Bottom insights — stacked on mobile, side by side on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Contract Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Contract Statistics</h2>
                <div className="bg-blue-50 p-1.5 rounded-lg">
                  <FileText size={16} className="text-blue-500" />
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { label: 'Total Contracts', value: contractStats.total, bg: 'bg-blue-50', dot: 'bg-blue-500', text: 'text-blue-700' },
                  { label: 'Active Contracts', value: contractStats.active, bg: 'bg-green-50', dot: 'bg-green-500', text: 'text-green-700' },
                  { label: 'Pending Contracts', value: contractStats.pending, bg: 'bg-yellow-50', dot: 'bg-yellow-400', text: 'text-yellow-700' },
                  { label: 'Total Value', value: `₹${(contractStats.totalValue / 100000).toFixed(1)}L`, bg: 'bg-gray-50', dot: 'bg-purple-400', text: 'text-purple-700' },
                ].map((stat, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 ${stat.bg} rounded-xl`}>
                    <div className="flex items-center gap-2.5">
                      <div className={`w-2.5 h-2.5 rounded-full ${stat.dot}`} />
                      <span className="text-sm text-gray-700">{stat.label}</span>
                    </div>
                    <span className={`text-base font-bold ${stat.text}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Quick Stats</h2>
                <div className="bg-yellow-50 p-1.5 rounded-lg">
                  <Calendar size={16} className="text-yellow-500" />
                </div>
              </div>
              <div className="space-y-2.5">
                {[
                  { icon: Users, label: 'Active Engineers', value: dashboardData.engineers.length, iconBg: 'bg-blue-50', iconColor: 'text-blue-500', valColor: 'text-blue-700' },
                  { icon: Package, label: 'Total Materials', value: dashboardData.materials.metrics?.totalMaterials || 0, iconBg: 'bg-green-50', iconColor: 'text-green-500', valColor: 'text-green-700' },
                  { icon: IndianRupee, label: 'Total Projects', value: dashboardData.financial.count || 0, iconBg: 'bg-purple-50', iconColor: 'text-purple-500', valColor: 'text-purple-700' },
                ].map((stat, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <div className={`${stat.iconBg} p-1.5 rounded-lg`}>
                        <stat.icon size={15} className={stat.iconColor} />
                      </div>
                      <span className="text-sm text-gray-700">{stat.label}</span>
                    </div>
                    <span className={`text-base font-bold ${stat.valColor}`}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;