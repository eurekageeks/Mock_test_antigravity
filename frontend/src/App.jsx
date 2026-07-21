import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Public Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import StudentTests from './pages/student/StudentTests';
import StudentAttempts from './pages/student/StudentAttempts';
import MockTestStartConfirmation from './pages/student/MockTestStartConfirmation';
import MockTestInterface from './pages/student/MockTestInterface';
import TestResults from './pages/student/TestResults';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentManagement from './pages/admin/StudentManagement';
import TopicManagement from './pages/admin/TopicManagement';
import MockTestManagement from './pages/admin/MockTestManagement';
import QuestionManagement from './pages/admin/QuestionManagement';

// Route Guard Components
const RequireAuth = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const GuestOnly = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />;
  }

  return children;
};

// Layout Wrappers
const WithNavbarFooter = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

const WithNavbarOnly = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

// Full screen (no footer nav for test interface)
const FullScreen = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <Navbar />
    <main className="flex-1">{children}</main>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<WithNavbarFooter><LandingPage /></WithNavbarFooter>} />

      <Route path="/login" element={
        <GuestOnly>
          <WithNavbarFooter><LoginPage /></WithNavbarFooter>
        </GuestOnly>
      } />

      {/* Secret Admin Login — no admin link in navbar or footer */}
      <Route path="/secure-admin-login" element={
        <WithNavbarFooter><LoginPage /></WithNavbarFooter>
      } />

      <Route path="/register" element={
        <GuestOnly>
          <WithNavbarFooter><RegisterPage /></WithNavbarFooter>
        </GuestOnly>
      } />

      {/* ─── Student Routes ─── */}
      <Route path="/student/dashboard" element={
        <RequireAuth requiredRole="student">
          <WithNavbarOnly><StudentDashboard /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/student/profile" element={
        <RequireAuth requiredRole="student">
          <WithNavbarOnly><StudentProfile /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/student/tests" element={
        <RequireAuth requiredRole="student">
          <WithNavbarOnly><StudentTests /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/student/attempts" element={
        <RequireAuth requiredRole="student">
          <WithNavbarOnly><StudentAttempts /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/student/test-attempt-start/:id" element={
        <RequireAuth requiredRole="student">
          <WithNavbarOnly><MockTestStartConfirmation /></WithNavbarOnly>
        </RequireAuth>
      } />

      {/* Full screen interface — no footer padding to maximize exam space */}
      <Route path="/student/test-attempt/:attempt_id" element={
        <RequireAuth requiredRole="student">
          <FullScreen><MockTestInterface /></FullScreen>
        </RequireAuth>
      } />

      <Route path="/student/test-results/:attempt_id" element={
        <RequireAuth requiredRole="student">
          <WithNavbarOnly><TestResults /></WithNavbarOnly>
        </RequireAuth>
      } />

      {/* ─── Admin Routes ─── */}
      <Route path="/admin/dashboard" element={
        <RequireAuth requiredRole="admin">
          <WithNavbarOnly><AdminDashboard /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/admin/students" element={
        <RequireAuth requiredRole="admin">
          <WithNavbarOnly><StudentManagement /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/admin/topics" element={
        <RequireAuth requiredRole="admin">
          <WithNavbarOnly><TopicManagement /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/admin/tests" element={
        <RequireAuth requiredRole="admin">
          <WithNavbarOnly><MockTestManagement /></WithNavbarOnly>
        </RequireAuth>
      } />

      <Route path="/admin/tests/:test_id/questions" element={
        <RequireAuth requiredRole="admin">
          <WithNavbarOnly><QuestionManagement /></WithNavbarOnly>
        </RequireAuth>
      } />

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
