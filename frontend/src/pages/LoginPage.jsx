import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Swal from 'sweetalert2';
import { GraduationCap, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';

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

  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');

  const newPasswordValidations = {
    length: newPassword.length >= 8,
    number: /\d/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword)
  };
  const isNewPasswordValid = newPasswordValidations.length && newPasswordValidations.number && newPasswordValidations.special;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      Swal.fire({
        icon: 'info',
        title: 'Demo Email Delivery',
        text: `We simulated sending an email! Your verification OTP is: ${res.data.otp}`,
        confirmButtonColor: '#4f46e5',
        confirmButtonText: 'Got it!'
      });
      setForgotStep(2);
    } catch (err) {
      console.error("Forgot password error:", err);
      setForgotError(err.response?.data?.detail || "Failed to generate verification code.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!isNewPasswordValid) {
      setForgotError("Please ensure your new password meets all requirements.");
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    try {
      const res = await api.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: otpCode,
        new_password: newPassword
      });
      Swal.fire({
        icon: 'success',
        title: 'Password Reset!',
        text: res.data.message,
        confirmButtonColor: '#10b981'
      });
      setShowForgotModal(false);
      setEmail(forgotEmail);
      setPassword('');
    } catch (err) {
      console.error("Reset password error:", err);
      setForgotError(err.response?.data?.detail || "Invalid code or failed to reset password.");
    } finally {
      setForgotLoading(false);
    }
  };

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
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
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

          <div className="flex justify-center pt-1">
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setForgotStep(1);
                setForgotEmail(email);
                setForgotError('');
              }}
              className="text-sm font-bold text-brand-500 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
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

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative animate-scale-up">
            
            <div className="text-center mb-6">
              <span className="inline-flex p-3 rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 mb-3">
                <KeyRound className="h-7 w-7" />
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Reset Password</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {forgotStep === 1 
                  ? "Enter your registered email address to receive a validation code." 
                  : "Enter the verification code and set your new password."}
              </p>
            </div>

            {forgotError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl mb-4 text-xs font-semibold text-center">
                {forgotError}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white"
                    placeholder="name@example.com"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="py-3 text-center text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-md text-sm transition-all disabled:opacity-50"
                  >
                    {forgotLoading ? 'Sending...' : 'Send Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Verification Code (6 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white tracking-widest font-mono text-center font-bold"
                    placeholder="123456"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">New Password</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onFocus={() => setNewPasswordFocused(true)}
                    onBlur={() => setNewPasswordFocused(false)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white"
                    placeholder="••••••••"
                  />
                  {newPasswordFocused && (
                    <div className="absolute z-20 left-0 top-full mt-2 w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl text-xs space-y-1.5 animate-fade-in">
                      <div className="font-bold text-slate-700 dark:text-slate-300 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1">Password Requirements:</div>
                      <div className={`flex items-center space-x-2 ${newPasswordValidations.length ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        <CheckCircle className="h-3.5 w-3.5" /> <span>At least 8 characters</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${newPasswordValidations.number ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        <CheckCircle className="h-3.5 w-3.5" /> <span>Contains a number</span>
                      </div>
                      <div className={`flex items-center space-x-2 ${newPasswordValidations.special ? 'text-emerald-500' : 'text-slate-500 dark:text-slate-400'}`}>
                        <CheckCircle className="h-3.5 w-3.5" /> <span>Contains a special character</span>
                      </div>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="py-3 text-center text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md text-sm transition-all disabled:opacity-50 flex items-center justify-center"
                  >
                    <CheckCircle className="h-4 w-4 mr-1.5" /> Reset
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};

export default LoginPage;
