import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GraduationCap, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const isAdminRoute = location.pathname === '/secure-admin-login';
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const loggedUser = await login(email, password);
      
      // Route authorization checking
      if (isAdminRoute) {
        if (loggedUser.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          setError("Access Denied: Not an administrator account.");
        }
      } else {
        if (loggedUser.role === 'student') {
          navigate('/student/dashboard');
        } else if (loggedUser.role === 'admin') {
          // Redirect admins to admin dashboard even if logged via regular page
          navigate('/admin/dashboard');
        }
      }
    } catch (err) {
      console.error("Login failure:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        setError(err.response.data.detail);
      } else {
        setError("Invalid email or password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 transition-colors duration-300 relative overflow-hidden">
      
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] aspect-square rounded-full bg-brand-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] aspect-square rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-md bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800/80 p-8 sm:p-10 rounded-[32px] shadow-xl dark:shadow-slate-950/20 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 mb-4 animate-float">
            {isAdminRoute ? <ShieldCheck className="h-7 w-7" /> : <GraduationCap className="h-7 w-7" />}
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {isAdminRoute ? 'Admin Control Login' : 'Student Login'}
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {isAdminRoute ? 'Secure dashboard gateway' : 'Welcome back! Log in to attempt test'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl mb-6 text-sm font-semibold text-center animate-shake">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white"
                placeholder="name@example.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">Password</label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 active:scale-[0.98] disabled:opacity-50 transition-all duration-200 flex justify-center items-center text-sm"
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In</span> <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Registration footer link for students */}
        {!isAdminRoute && (
          <div className="mt-8 text-center border-t border-slate-100 dark:border-slate-700/50 pt-6">
            <span className="text-sm text-slate-500 dark:text-slate-400">New to A1TIExamPrism? </span>
            <Link to="/register" className="text-sm font-bold text-brand-500 hover:underline">
              Create an account
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default LoginPage;
