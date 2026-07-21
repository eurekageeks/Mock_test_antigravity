import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Search, ShieldCheck, ShieldAlert, Trash2, Eye, 
  X, Check, AlertCircle, Clock, Award, FileText
} from 'lucide-react';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Attempts Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/api/admin/students', {
        params: {
          search: search || undefined,
          status_filter: statusFilter || undefined
        }
      });
      setStudents(res.data);
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (id, newStatus) => {
    setMessage({ text: '', type: '' });
    try {
      await api.put(`/api/admin/students/${id}/status`, { status: newStatus });
      setMessage({ text: `Student status updated to '${newStatus}' successfully!`, type: 'success' });
      fetchStudents();
    } catch (err) {
      console.error("Failed to update status:", err);
      setMessage({ text: "Failed to update student status.", type: 'error' });
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm("Are you sure you want to delete this student profile? This deletes all associated test attempts and cannot be undone.")) return;
    setMessage({ text: '', type: '' });
    try {
      await api.delete(`/api/admin/students/${id}`);
      setMessage({ text: "Student account deleted successfully.", type: 'success' });
      fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      setMessage({ text: "Failed to delete student account.", type: 'error' });
    }
  };

  const handleViewAttempts = async (student) => {
    setSelectedStudent(student);
    setAttemptsLoading(true);
    setAttempts([]);
    try {
      const res = await api.get(`/api/admin/students/${student.id}/attempts`);
      setAttempts(res.data);
    } catch (err) {
      console.error("Failed to fetch student attempts:", err);
    } finally {
      setAttemptsLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Student User Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Approve pending students, disable or enable accounts, and review student test metrics.</p>
        </div>

        {/* Message Banner */}
        {message.text && (
          <div className={`p-4 rounded-2xl border text-sm font-semibold text-center ${
            message.type === 'success' 
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' 
              : 'bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {message.text}
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-slate-800 p-4 rounded-[24px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          {/* Search bar */}
          <div className="relative md:col-span-8">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
              placeholder="Search students by name or email..."
            />
          </div>

          {/* Status Dropdown */}
          <div className="relative md:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium dark:bg-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
        </div>

        {/* Students Table */}
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : students.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                    <th className="py-4 px-6">ID</th>
                    <th className="py-4 px-6">Student Info</th>
                    <th className="py-4 px-6">Mobile</th>
                    <th className="py-4 px-6">Joined Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6 text-center">Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm font-medium">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/10 transition-colors">
                      <td className="py-5 px-6 text-slate-400">#{st.id}</td>
                      <td className="py-5 px-6">
                        <span className="block text-slate-900 dark:text-white font-bold">{st.name}</span>
                        <span className="block text-slate-400 text-xs font-normal">{st.email}</span>
                      </td>
                      <td className="py-5 px-6 text-slate-500 font-mono text-xs">{st.mobile || 'N/A'}</td>
                      <td className="py-5 px-6 text-slate-500 text-xs">
                        {new Date(st.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-5 px-6">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase ${
                          st.status === 'approved'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : st.status === 'pending'
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 animate-pulse'
                            : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                        }`}>
                          {st.status}
                        </span>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          {/* Approve control */}
                          {st.status !== 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(st.id, 'approved')}
                              className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 transition-colors"
                              title="Approve / Enable Student"
                            >
                              <Check className="h-4.5 w-4.5" />
                            </button>
                          )}
                          
                          {/* Disable control */}
                          {st.status === 'approved' && (
                            <button
                              onClick={() => handleUpdateStatus(st.id, 'disabled')}
                              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 transition-colors"
                              title="Disable Student"
                            >
                              <ShieldAlert className="h-4.5 w-4.5" />
                            </button>
                          )}

                          {/* View attempts control */}
                          <button
                            onClick={() => handleViewAttempts(st)}
                            className="p-2 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 transition-colors"
                            title="View Exam Attempts"
                          >
                            <Eye className="h-4.5 w-4.5" />
                          </button>

                          {/* Delete control */}
                          <button
                            onClick={() => handleDeleteStudent(st.id)}
                            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                            title="Delete Student"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
            <p className="text-slate-400 dark:text-slate-500 font-semibold">No students match your query criteria.</p>
          </div>
        )}

      </div>

      {/* Attempts List Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-3xl rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative animate-scale-up">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Exam Attempts History</h3>
                <p className="text-xs text-slate-400 mt-1">Reviewing metrics for: <span className="font-bold text-brand-500">{selectedStudent.name}</span></p>
              </div>
              <button 
                onClick={() => setSelectedStudent(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            {attemptsLoading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : attempts.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                {attempts.map((attempt) => (
                  <div 
                    key={attempt.id}
                    className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{attempt.mock_test_title}</h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>Attempt #{attempt.id}</span>
                        <span>•</span>
                        <span>{new Date(attempt.start_time).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {attempt.result ? (
                        <>
                          <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold ${
                            attempt.result.is_passed 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                          }`}>
                            {attempt.result.is_passed ? 'PASSED' : 'FAILED'}
                          </span>
                          <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {attempt.result.score} Marks ({attempt.result.percentage}%)
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-bold text-amber-500">IN PROGRESS</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <p className="text-slate-400 dark:text-slate-500 font-semibold text-sm">This student has not attempted any mock tests yet.</p>
              </div>
            )}

            {/* Modal Controls */}
            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-6 mt-6 flex justify-end">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors"
              >
                Close View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;
