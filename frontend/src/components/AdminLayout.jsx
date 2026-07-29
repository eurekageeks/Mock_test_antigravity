import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BarChart, User, Layers, BookOpen, Database, LogOut, ShieldCheck, ChevronRight, ClipboardCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const isActive = (path) => {
    if (path === '/admin/tests' && location.pathname.includes('/questions')) {
      return true;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    {
      label: 'Control Center Stats',
      path: '/admin/dashboard',
      icon: BarChart,
      iconColor: 'text-brand-500',
      activeBg: 'bg-brand-500 text-white shadow-lg shadow-brand-500/25',
    },
    {
      label: 'Students List',
      path: '/admin/students',
      icon: User,
      iconColor: 'text-indigo-500',
      activeBg: 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25',
    },
    {
      label: 'Topic Domains',
      path: '/admin/topics',
      icon: Layers,
      iconColor: 'text-emerald-500',
      activeBg: 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/25',
    },
    {
      label: 'Mock Exam Sheets',
      path: '/admin/tests',
      icon: BookOpen,
      iconColor: 'text-amber-500',
      activeBg: 'bg-amber-600 text-white shadow-lg shadow-amber-500/25',
    },
    {
      label: 'Subjective Mock Test',
      path: '/admin/submissions',
      icon: ClipboardCheck,
      iconColor: 'text-purple-500',
      activeBg: 'bg-purple-600 text-white shadow-lg shadow-purple-500/25',
    },
    {
      label: 'Backup & Restore',
      path: '/admin/backup',
      icon: Database,
      iconColor: 'text-teal-500',
      activeBg: 'bg-teal-600 text-white shadow-lg shadow-teal-500/25',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      {/* 1. Top Horizontal Navbar */}
      <Navbar />

      {/* 2. Dual-Menu Layout (Left Vertical Sidebar + Right Main Content) */}
      <div className="flex flex-1 w-full max-w-[1700px] mx-auto">
        {/* Persistent Left Vertical Sidebar (Inspired by W3Schools & Enterprise Consoles) */}
        <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200/80 dark:border-slate-700/80 p-4 shrink-0 hidden lg:flex flex-col justify-between sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="space-y-6">
            {/* Header Badge */}
            <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60 pb-4">
              <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-extrabold text-xs uppercase tracking-wider mb-1">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>Admin Console</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Manage exams, students & system backups.
              </p>
            </div>

            {/* Vertical Navigation List */}
            <nav className="space-y-1.5">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 pb-1">
                Menu Directory
              </div>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold transition-all duration-200 group ${
                      active
                        ? `${item.activeBg} scale-[1.02]`
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-750 hover:translate-x-1'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${active ? 'text-white' : item.iconColor}`} />
                      <span>{item.label}</span>
                    </div>
                    {active && <ChevronRight className="h-4 w-4 shrink-0 animate-pulse" />}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Admin Info & Logout */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-700/60 space-y-3">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-850 border border-slate-200/60 dark:border-slate-700/60 flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-brand-500/15 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                AD
              </div>
              <div className="overflow-hidden min-w-0 flex-1">
                <span className="text-xs font-bold text-slate-800 dark:text-white block truncate">
                  {user?.full_name || 'System Admin'}
                </span>
                <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Verified Access
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold transition-all duration-200"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out Portal</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-x-hidden p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>

      {/* 3. Bottom Footer */}
      <Footer />
    </div>
  );
};

export default AdminLayout;
