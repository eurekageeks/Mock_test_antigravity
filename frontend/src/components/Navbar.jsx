import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, Menu, X, GraduationCap, LogOut, User, BarChart, BookOpen, Layers } from 'lucide-react';

const Navbar = () => {
  const { user, logout, theme, toggleTheme } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive(path)
        ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-premium border-b border-slate-200/50 dark:border-slate-800/50 text-slate-800 dark:text-white transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="bg-gradient-to-tr from-brand-600 to-brand-400 p-2 rounded-xl text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-200">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              A1TIExam<span className="text-brand-500">Prism</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Landing page anchor links - only show on landing page if guest */}
            {!user && (
              <>
                <a href="#features" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">Features</a>
                <a href="#stats" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">Stats</a>
                <a href="#testimonials" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">Reviews</a>
                <a href="#faq" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">FAQ</a>
                <a href="#contact" className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-brand-500 transition-colors">Contact</a>
              </>
            )}

            {/* Student Navigation */}
            {user && user.role === 'student' && (
              <>
                <Link to="/student/dashboard" className={linkClass('/student/dashboard')}>Dashboard</Link>
                <Link to="/student/tests" className={linkClass('/student/tests')}>Mock Tests</Link>
                <Link to="/student/attempts" className={linkClass('/student/attempts')}>History</Link>
                <Link to="/student/profile" className={linkClass('/student/profile')}>My Profile</Link>
              </>
            )}

            {/* Admin Navigation */}
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                  <span className="flex items-center space-x-1"><BarChart className="h-4 w-4" /> <span>Admin Stats</span></span>
                </Link>
                <Link to="/admin/students" className={linkClass('/admin/students')}>
                  <span className="flex items-center space-x-1"><User className="h-4 w-4" /> <span>Students</span></span>
                </Link>
                <Link to="/admin/topics" className={linkClass('/admin/topics')}>
                  <span className="flex items-center space-x-1"><Layers className="h-4 w-4" /> <span>Topics</span></span>
                </Link>
                <Link to="/admin/tests" className={linkClass('/admin/tests')}>
                  <span className="flex items-center space-x-1"><BookOpen className="h-4 w-4" /> <span>Mock Tests</span></span>
                </Link>
              </>
            )}
          </div>

          {/* User Settings & Controls */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-all duration-200"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {user ? (
              <div className="flex items-center space-x-3 border-l border-slate-200 dark:border-slate-800 pl-3">
                <span className="text-sm font-medium max-w-[120px] truncate text-slate-700 dark:text-slate-200">
                  {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 text-sm font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 rounded-xl transition-all duration-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2 border-l border-slate-200 dark:border-slate-800 pl-3">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/5 rounded-xl transition-all duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white rounded-xl shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden glass border-b border-slate-200 dark:border-slate-800 py-3 px-4 animate-scale-up">
          <div className="flex flex-col space-y-2">
            {/* Landing page anchor links - guest */}
            {!user && (
              <>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Features</a>
                <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Stats</a>
                <a href="#testimonials" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Reviews</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">FAQ</a>
                <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">Contact</a>
                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2"></div>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-center text-base font-semibold text-brand-600 dark:text-brand-400 hover:bg-brand-500/5 rounded-lg">Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-center text-base font-semibold bg-brand-600 text-white rounded-lg">Sign Up</Link>
              </>
            )}

            {/* Student Navigation */}
            {user && user.role === 'student' && (
              <>
                <Link to="/student/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">Dashboard</Link>
                <Link to="/student/tests" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">Mock Tests</Link>
                <Link to="/student/attempts" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">History</Link>
                <Link to="/student/profile" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">My Profile</Link>
                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2"></div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                  <LogOut className="h-4 w-4" /> <span>Logout ({user.name})</span>
                </button>
              </>
            )}

            {/* Admin Navigation */}
            {user && user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">Admin Stats</Link>
                <Link to="/admin/students" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">Students</Link>
                <Link to="/admin/topics" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">Topics</Link>
                <Link to="/admin/tests" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded-lg">Mock Tests</Link>
                <div className="h-[1px] bg-slate-200 dark:bg-slate-800 my-2"></div>
                <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-1 px-3 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg">
                  <LogOut className="h-4 w-4" /> <span>Logout Admin</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
