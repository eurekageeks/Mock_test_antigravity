import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Users, Layers, FileText, CheckCircle, HelpCircle, 
  Settings, ChevronRight, BarChart3, AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await api.get('/api/admin/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error("Failed to load admin stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Administration Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Admin Control Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Control center for topics, mock test sheets, question seeding, and user profiles approval.</p>
        </div>

        {/* Dashboard Alerts / Reminders */}
        {stats?.pending_students > 0 && (
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-3xl flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold block">Action Required: Pending Registrations!</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">There are {stats.pending_students} students waiting for your approval before they can log in.</span>
              </div>
            </div>
            <Link
              to="/admin/students"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Approve Students
            </Link>
          </div>
        )}

        {/* Overview Stats Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Total Students Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center space-x-4">
            <div className="p-4 bg-brand-500/10 text-brand-500 rounded-2xl">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{stats?.total_students}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Students Registered</span>
            </div>
          </div>

          {/* Total Mock Tests */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center space-x-4">
            <div className="p-4 bg-indigo-500/10 text-indigo-500 rounded-2xl">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{stats?.total_mock_tests}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Mock Exams Seeded</span>
            </div>
          </div>

          {/* Total Attempts */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center space-x-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-2xl">
              <BarChart3 className="h-6 w-6" />
            </div>
            <div>
              <span className="block text-2xl font-black text-slate-900 dark:text-white">{stats?.total_attempts}</span>
              <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Exam Attempts</span>
            </div>
          </div>
        </div>

        {/* Student Status details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          
          {/* Card 1: Student Status Metrics */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3">
              Student Registration Breakdown
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">Pending Review</span>
                <span className="text-base font-black text-amber-600">{stats?.pending_students}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Approved Profiles</span>
                <span className="text-base font-black text-emerald-600">{stats?.approved_students}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-rose-500/5 border border-rose-500/10">
                <span className="text-sm font-semibold text-rose-600 dark:text-rose-400">Disabled Profiles</span>
                <span className="text-base font-black text-rose-600">{stats?.disabled_students}</span>
              </div>
            </div>
          </div>

          {/* Card 2: Question Pool statistics */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3">
              Questions & Topics Pool
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center">
                <HelpCircle className="h-6 w-6 text-indigo-500 mx-auto mb-2" />
                <span className="block text-2xl font-black text-slate-900 dark:text-white">{stats?.total_questions}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Questions</span>
              </div>

              <div className="p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl text-center">
                <Layers className="h-6 w-6 text-brand-500 mx-auto mb-2" />
                <span className="block text-2xl font-black text-slate-900 dark:text-white">{stats?.total_mock_tests > 0 ? Math.round(stats.total_questions / stats.total_mock_tests) : 0}</span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Avg Qs per Exam</span>
              </div>
            </div>
          </div>

        </div>

        {/* Shortcuts cards links */}
        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-250 dark:border-slate-800 pb-3">
            Quick Shortcuts
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <Link 
              to="/admin/students"
              className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm flex justify-between items-center group transition-colors duration-200"
            >
              <div>
                <span className="font-bold text-base text-slate-950 dark:text-white block">Student Reviews</span>
                <span className="text-xs text-slate-400 mt-1 block">Approve student status changes.</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-350 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              to="/admin/topics"
              className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm flex justify-between items-center group transition-colors duration-200"
            >
              <div>
                <span className="font-bold text-base text-slate-950 dark:text-white block">Tag Topics</span>
                <span className="text-xs text-slate-400 mt-1 block">Create domain categories.</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-350 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </Link>

            <Link 
              to="/admin/tests"
              className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 hover:border-brand-500 dark:hover:border-brand-500 shadow-sm flex justify-between items-center group transition-colors duration-200"
            >
              <div>
                <span className="font-bold text-base text-slate-950 dark:text-white block">Mock Exam Sheets</span>
                <span className="text-xs text-slate-400 mt-1 block">CRUD exams and seed questions.</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-350 group-hover:text-brand-500 group-hover:translate-x-1 transition-all" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
