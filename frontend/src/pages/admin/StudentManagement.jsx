import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { 
  Search, ShieldCheck, ShieldAlert, Trash2, Eye, 
  X, Check, AlertCircle, Clock, Award, FileText, Calendar, ChevronLeft, ChevronRight,
  Mail, Phone, BookOpen, User, CheckCircle2, XCircle, ArrowRight, Loader2, ArrowLeft
} from 'lucide-react';
import Swal from 'sweetalert2';
import { getImageUrl, processHtmlImages } from '../../utils/imageHelper';

const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });
  
  // Date and Pagination states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Bulk Selection State
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  
  // Attempts Modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);

  // Review Attempt Modal state
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [questionViewMode, setQuestionViewMode] = useState('all');

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
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [fromDate, toDate]);

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
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This deletes the student profile and all associated test attempts. This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;
    
    setMessage({ text: '', type: '' });
    try {
      await api.delete(`/api/admin/students/${id}`);
      setMessage({ text: "Student account deleted successfully.", type: 'success' });
      fetchStudents();
      setSelectedStudentIds(prev => prev.filter(sId => sId !== id));
    } catch (err) {
      console.error("Failed to delete student:", err);
      setMessage({ text: "Failed to delete student account.", type: 'error' });
    }
  };

  const handleSelectAll = (e, filteredList) => {
    if (e.target.checked) {
      setSelectedStudentIds(filteredList.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleSelectStudent = (id) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Multiple Students?',
      text: `You are about to delete ${selectedStudentIds.length} selected students. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete all!'
    });
    if (!result.isConfirmed) return;

    setMessage({ text: '', type: '' });
    try {
      await Promise.all(selectedStudentIds.map(id => api.delete(`/api/admin/students/${id}`)));
      setMessage({ text: `Successfully deleted ${selectedStudentIds.length} students.`, type: 'success' });
      fetchStudents();
      setSelectedStudentIds([]);
    } catch (err) {
      console.error("Failed bulk delete:", err);
      setMessage({ text: "Failed to delete some students.", type: 'error' });
    }
  };

  const handleBulkStatus = async (newStatus) => {
    setMessage({ text: '', type: '' });
    try {
      await Promise.all(selectedStudentIds.map(id => api.put(`/api/admin/students/${id}/status`, { status: newStatus })));
      setMessage({ text: `Successfully updated status to '${newStatus}' for ${selectedStudentIds.length} students.`, type: 'success' });
      fetchStudents();
      setSelectedStudentIds([]);
    } catch (err) {
      console.error("Failed bulk status update:", err);
      setMessage({ text: "Failed to update some student statuses.", type: 'error' });
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
      setMessage({ text: 'Failed to fetch exam attempts', type: 'error' });
    } finally {
      setAttemptsLoading(false);
    }
  };

  const handleRestartAttempt = async (attemptId) => {
    if (!window.confirm("Are you sure you want to RESTART this attempt? The student's warnings will be cleared and their test will be unlocked. Any previously generated scorecard for this attempt will be deleted.")) return;
    try {
      await api.post(`/api/admin/attempts/${attemptId}/restart`);
      setMessage({ text: 'Attempt restarted successfully.', type: 'success' });
      if (selectedStudent) handleViewAttempts(selectedStudent);
    } catch (err) {
      setMessage({ text: 'Failed to restart attempt.', type: 'error' });
    }
  };

  const handleCancelAttempt = async (attemptId) => {
    if (!window.confirm("Are you sure you want to CANCEL this attempt due to cheating? This cannot be easily undone by the student.")) return;
    try {
      await api.post(`/api/admin/attempts/${attemptId}/cancel`);
      setMessage({ text: 'Attempt cancelled successfully.', type: 'success' });
      if (selectedStudent) handleViewAttempts(selectedStudent);
    } catch (err) {
      setMessage({ text: 'Failed to cancel attempt.', type: 'error' });
    }
  };

  const handleOpenReview = async (attempt) => {
    setSelectedAttempt(attempt);
    setReviewLoading(true);
    setReviewData(null);
    setQuestionViewMode('all');
    try {
      const res = await api.get(`/api/admin/attempts/${attempt.id}/review`);
      setReviewData(res.data);
    } catch (err) {
      console.error("Failed to fetch review data:", err);
      Swal.fire('Error', 'Could not load attempt review details.', 'error');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCloseReview = () => {
    setSelectedAttempt(null);
    setReviewData(null);
  };



  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      });
    } catch (e) {
      return dateString;
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
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-slate-800 p-4 rounded-[24px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm items-end">
          {/* Search bar */}
          <div className="relative md:col-span-5">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Search Students</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs dark:text-white font-medium"
                placeholder="Name or email..."
              />
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="relative md:col-span-3">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-xs dark:text-white font-medium dark:bg-slate-800"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>

          {/* Date Filters */}
          <div className="relative md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Joined From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs dark:text-white font-medium"
            />
          </div>
          <div className="relative md:col-span-2">
            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Joined To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs dark:text-white font-medium"
            />
          </div>
        </div>

        {/* Bulk Actions Banner */}
        {selectedStudentIds.length > 0 && (
          <div className="flex items-center justify-between bg-brand-50 dark:bg-brand-500/10 p-4 rounded-[24px] border border-brand-200 dark:border-brand-500/20 shadow-sm animate-fade-in">
            <span className="text-sm font-bold text-brand-700 dark:text-brand-400">
              {selectedStudentIds.length} student(s) selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={() => handleBulkStatus('approved')}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-xs font-bold hover:bg-emerald-600 transition-colors"
              >
                Approve All
              </button>
              <button 
                onClick={() => handleBulkStatus('disabled')}
                className="px-4 py-2 bg-amber-500 text-white rounded-xl text-xs font-bold hover:bg-amber-600 transition-colors"
              >
                Disable All
              </button>
              <button 
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors"
              >
                Delete All
              </button>
            </div>
          </div>
        )}

        {/* Students Table */}
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          (() => {
            const dateFilteredStudents = students.filter(st => {
              if (!st.created_at) return true;
              const stDate = new Date(st.created_at).toISOString().split('T')[0];
              if (fromDate && stDate < fromDate) return false;
              if (toDate && stDate > toDate) return false;
              return true;
            });

            const totalPages = Math.max(1, Math.ceil(dateFilteredStudents.length / itemsPerPage));
            const paginatedStudents = dateFilteredStudents.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

            return dateFilteredStudents.length > 0 ? (
              <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                        <th className="py-4 px-6 w-12">
                          <input 
                            type="checkbox" 
                            checked={dateFilteredStudents.length > 0 && selectedStudentIds.length === dateFilteredStudents.length}
                            onChange={(e) => handleSelectAll(e, dateFilteredStudents)}
                            className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-slate-50 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
                          />
                        </th>
                        <th className="py-4 px-6">ID</th>
                        <th className="py-4 px-6">Student Info</th>
                        <th className="py-4 px-6">Mobile</th>
                        <th className="py-4 px-6">Joined Date</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6 text-center">Controls</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm font-medium">
                      {paginatedStudents.map((st) => (
                        <tr key={st.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/10 transition-colors">
                          <td className="py-5 px-6">
                            <input 
                              type="checkbox" 
                              checked={selectedStudentIds.includes(st.id)}
                              onChange={() => handleSelectStudent(st.id)}
                              className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-slate-50 dark:bg-slate-800 dark:border-slate-600 cursor-pointer"
                            />
                          </td>
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

                {/* Pagination Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-100 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Showing <strong className="text-slate-800 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</strong> to <strong className="text-slate-800 dark:text-white">{Math.min(currentPage * itemsPerPage, dateFilteredStudents.length)}</strong> of <strong className="text-slate-800 dark:text-white">{dateFilteredStudents.length}</strong> students
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center"
                    >
                      <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                    </button>
                    <span className="px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl text-xs font-bold">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center"
                    >
                      Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-semibold">No students match your search and date criteria.</p>
              </div>
            );
          })()
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

                    <div className="text-right flex flex-col items-end gap-2">
                      {attempt.status === 'cancelled_cheating' ? (
                        <span className="text-xs font-bold text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">CANCELLED (CHEATING)</span>
                      ) : attempt.result ? (
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

                      <div className="flex flex-wrap gap-2 mt-2">
                        <button 
                          onClick={() => handleOpenReview(attempt)}
                          className="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2.5 py-1.5 rounded hover:bg-purple-100 dark:hover:bg-purple-950/40 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" /> VIEW ANSWERS
                        </button>
                        <button 
                          onClick={() => handleRestartAttempt(attempt.id)}
                          className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded hover:bg-brand-100 transition-colors"
                        >
                          RESTART
                        </button>
                        <button 
                          onClick={() => handleCancelAttempt(attempt.id)}
                          className="text-[10px] font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded hover:bg-red-100 transition-colors"
                        >
                          CANCEL
                        </button>
                      </div>
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

      {/* Interactive Attempt Grading Drawer / Modal */}
      {selectedAttempt && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 md:p-10 animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
            
            {/* Modal Top Banner */}
            <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                    <span>Review Student Answer Sheet</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-600 text-white">
                      Attempt #{selectedAttempt.id}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Reviewing test submission details, student's selected choices, and rubrics.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCloseReview}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                title="Close console"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
              {reviewLoading ? (
                <div className="py-24 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  <p className="text-sm text-slate-500 dark:text-slate-400">Loading student profile and exam answer sheet...</p>
                </div>
              ) : !reviewData ? (
                <div className="py-16 text-center text-slate-500">
                  Could not load review data.
                </div>
              ) : (
                <>
                  {/* DEDICATED STUDENT DETAILS & EXAM SUMMARY (2-Column Grid) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Card 1: Student Details */}
                    <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-purple-200/60 dark:border-purple-800/40 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                          <User className="w-4 h-4 text-purple-600" />
                          <span>Student Profile Details</span>
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
                          Student ID: #{reviewData.attempt.user_id}
                        </span>
                      </div>

                      <div className="flex items-center gap-3.5 pt-1">
                        <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md flex-shrink-0">
                          {(reviewData.attempt.student_name || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div className="space-y-0.5 overflow-hidden">
                          <div className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                            {reviewData.attempt.student_name || 'Unknown Student'}
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 truncate">
                            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span className="truncate">{reviewData.attempt.student_email || 'No email provided'}</span>
                          </div>
                          <div className="text-xs text-slate-600 dark:text-slate-300 flex items-center gap-1.5 pt-0.5">
                            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                            <span>{reviewData.attempt.student_mobile || 'No mobile provided'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Exam Summary */}
                    <div className="p-5 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/60 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between border-b border-blue-200/60 dark:border-blue-800/40 pb-2">
                        <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                          <span>Exam Sheet Summary</span>
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100">
                          Attempt #{reviewData.attempt.id}
                        </span>
                      </div>

                      <div className="space-y-1.5 pt-1 text-xs">
                        <div className="flex justify-between gap-2">
                          <span className="text-slate-500 dark:text-slate-400">Test Title:</span>
                          <span className="font-bold text-slate-900 dark:text-white text-right">{reviewData.attempt.mock_test_title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Topic Domain:</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{reviewData.attempt.topic_name || 'General'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Total Marks:</span>
                          <span className="font-bold text-slate-950 dark:text-white">{reviewData.attempt.mock_test_total_marks} Marks</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">Submitted On:</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {formatDate(reviewData.attempt.end_time || reviewData.attempt.start_time)}
                          </span>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Current Score Banner */}
                  <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-indigo-950 rounded-2xl p-5 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-purple-500/30">
                    <div>
                      <div className="text-xs uppercase tracking-wider font-bold text-purple-300">
                        Real-Time Score Details
                      </div>
                      <div className="text-3xl font-black flex items-baseline gap-2 mt-0.5">
                        <span>{reviewData.attempt.result ? reviewData.attempt.result.score : 0}</span>
                        <span className="text-base font-normal text-slate-300">/ {reviewData.attempt.mock_test_total_marks} Marks</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15">
                      <div className="text-center">
                        <div className="text-[11px] text-purple-200 font-medium">Percentage</div>
                        <div className="font-black text-lg">{reviewData.attempt.result ? reviewData.attempt.result.percentage : 0}%</div>
                      </div>
                      <div className="h-8 w-[1px] bg-white/20"></div>
                      <div className="text-center">
                        <div className="text-[11px] text-purple-200 font-medium">Result Status</div>
                        <div className="font-black text-lg">
                          {reviewData.attempt.result && reviewData.attempt.result.is_passed ? (
                            <span className="text-emerald-400">🎉 PASSED</span>
                          ) : (
                            <span className="text-rose-400">⚠️ FAILED</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Toggle Mode */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <div>
                      <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span>Submitted Answers</span>
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        View questions, student's submitted responses, and correct answers.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                      <button
                        onClick={() => setQuestionViewMode('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          questionViewMode === 'all'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        All Questions ({reviewData.answers.length})
                      </button>
                      <button
                        onClick={() => setQuestionViewMode('subjective')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          questionViewMode === 'subjective'
                            ? 'bg-purple-600 text-white shadow-md'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        Subjective Qs Only ({reviewData.answers.filter(a => a.question_type === 'text').length})
                      </button>
                    </div>
                  </div>

                  {/* Question and Answer Sheets list */}
                  <div className="space-y-5">
                    {reviewData.answers
                      .filter(ans => questionViewMode === 'all' || ans.question_type === 'text')
                      .map((ans, idx) => {
                        const isSubjective = ans.question_type === 'text';
                        const isMarkedCorrect = ans.is_correct === true;
                        const isMarkedWrong = ans.is_correct === false;

                        return (
                          <div
                            key={ans.question_id}
                            className={`p-5 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
                              isMarkedCorrect
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/80 shadow-sm'
                                : isMarkedWrong
                                ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-300 dark:border-rose-800/80 shadow-sm'
                                : 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-400/20'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-4 mb-3">
                              <div className="flex items-center gap-2.5 flex-wrap">
                                <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow">
                                  Q{idx + 1}
                                </span>
                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                  isSubjective
                                    ? 'bg-purple-600 text-white shadow-sm'
                                    : 'bg-blue-600 text-white shadow-sm'
                                }`}>
                                  {isSubjective ? 'Subjective' : 'MCQ'}
                                </span>
                                <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                                  {ans.marks} Marks
                                </span>
                              </div>

                              <div>
                                {isMarkedCorrect ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-600 text-white shadow-md">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Correct (+{ans.marks} Marks)</span>
                                  </span>
                                ) : isMarkedWrong ? (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-rose-600 text-white shadow-md">
                                    <XCircle className="w-4 h-4" />
                                    <span>Incorrect (0 Marks)</span>
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-amber-600 text-white shadow-lg animate-pulse">
                                    <Clock className="w-4 h-4" />
                                    <span>⏳ Needs Evaluation</span>
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Question Text */}
                            <div 
                              className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed prose dark:prose-invert max-w-none mb-3"
                              dangerouslySetInnerHTML={{ __html: processHtmlImages(ans.question_text) }}
                            />

                            {/* Question Images */}
                            {ans.image_urls && ans.image_urls.length > 0 && (
                              <div className="mb-4 flex flex-wrap gap-3">
                                {ans.image_urls.map((url, idx) => (
                                  <img key={idx} src={getImageUrl(url)} alt={`Q Image ${idx+1}`} className="max-w-xs rounded-xl shadow-sm border border-slate-200 dark:border-slate-700" />
                                ))}
                              </div>
                            )}

                            {/* Answer Box */}
                            <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 mb-5 shadow-inner">
                              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                  <User className="w-3.5 h-3.5" />
                                  <span>Student's Response:</span>
                                </span>
                              </div>

                              {isSubjective ? (
                                <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-mono whitespace-pre-wrap leading-relaxed bg-purple-50/55 dark:bg-purple-950/20 p-4 rounded-xl border-l-4 border-purple-600 shadow-sm">
                                  {ans.text_answer ? (
                                    ans.text_answer
                                  ) : (
                                    <span className="text-slate-400 not-italic font-sans">No response written.</span>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                                  <div className="font-semibold">
                                    Selected Option: {' '}
                                    <span className="font-black text-blue-600 dark:text-blue-400 text-base px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800">
                                      {ans.selected_option || 'None (Unanswered)'}
                                    </span>
                                  </div>
                                  <div className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Correct Answer Key: <strong className="text-emerald-600 dark:text-emerald-400 text-sm">{ans.correct_answer}</strong>
                                  </div>
                                </div>
                              )}

                              {ans.explanation && (
                                <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                  <span className="font-bold text-slate-900 dark:text-slate-200 flex-shrink-0">Model Rubric / Answer Key Explanation:</span>
                                  <span>{ans.explanation}</span>
                                </div>
                              )}
                            </div>



                          </div>
                        );
                      })}
                  </div>
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-6 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {reviewData && `Reviewing ${reviewData.attempt.student_name}'s sheet for ${reviewData.attempt.mock_test_title}`}
              </div>
              <button
                onClick={handleCloseReview}
                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md rounded-xl transition-all hover:scale-[1.02]"
              >
                Close Answer Sheet
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentManagement;
