import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { getImageUrl, processHtmlImages } from '../../utils/imageHelper';
import { 
  ClipboardCheck, Search, Filter, CheckCircle2, XCircle, AlertCircle, 
  Clock, User, Award, FileText, ArrowRight, X, Loader2, RefreshCw, 
  Eye, Check, HelpCircle, Calendar, ShieldAlert, Phone, Mail, Layers, 
  BookOpen, UserCheck, AlertTriangle, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import Swal from 'sweetalert2';

const SubmissionsManagement = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); 
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'objective', 'subjective'// 'all', 'pending', 'graded'
  
  // Review Modal State
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [gradingQuestionId, setGradingQuestionId] = useState(null);
  const [notification, setNotification] = useState(null);
  const [questionViewMode, setQuestionViewMode] = useState('all'); // Default to 'all' to show objective answers too

  // New Pagination & Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [topicId, setTopicId] = useState('');
  const [topics, setTopics] = useState([]);
  const [limit, setLimit] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAttemptIds, setSelectedAttemptIds] = useState([]);

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await api.get('/api/admin/topics');
        setTopics(res.data);
      } catch (err) {
        console.error("Failed to fetch topics", err);
      }
    };
    fetchTopics();
  }, []);

  const fetchAttempts = async () => {
    setLoading(true);
    try {
      let url = `/api/admin/attempts?page=${currentPage}&limit=${limit}&status_filter=${statusFilter}&type_filter=${typeFilter}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (topicId) url += `&topic_id=${topicId}`;
      
      const res = await api.get(url);
      setAttempts(res.data.items || []);
      setTotalItems(res.data.total || 0);
    } catch (err) {
      console.error("Failed to load attempts:", err);
      showNotification('error', 'Failed to load student submissions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttempts();
  }, [currentPage, limit, statusFilter, typeFilter, startDate, endDate, topicId]);

  useEffect(() => {
    setSelectedAttemptIds([]);
    setCurrentPage(1);
  }, [statusFilter, typeFilter, searchTerm, startDate, endDate, topicId, limit]);

  const handleSelectAll = (e, filteredList) => {
    if (e.target.checked) {
      setSelectedAttemptIds(filteredList.map(a => a.id));
    } else {
      setSelectedAttemptIds([]);
    }
  };

  const handleSelectAttempt = (id) => {
    setSelectedAttemptIds(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };

  const handleDeleteSingle = async (attemptId) => {
    const result = await Swal.fire({
      title: 'Delete Submission?',
      text: "This will permanently delete this student submission/attempt and all associated answers. This cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/admin/attempts/${attemptId}`);
      showNotification('success', 'Submission deleted successfully.');
      setSelectedAttemptIds(prev => prev.filter(id => id !== attemptId));
      fetchAttempts();
    } catch (err) {
      console.error("Failed to delete submission:", err);
      showNotification('error', 'Failed to delete submission.');
    }
  };

  const handleBulkDelete = async () => {
    const result = await Swal.fire({
      title: 'Delete Selected Submissions?',
      text: `You are about to delete ${selectedAttemptIds.length} selected student submissions. This cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete all!'
    });
    if (!result.isConfirmed) return;

    try {
      await api.post('/api/admin/attempts/bulk-delete', { attempt_ids: selectedAttemptIds });
      showNotification('success', `Successfully deleted ${selectedAttemptIds.length} submissions.`);
      setSelectedAttemptIds([]);
      fetchAttempts();
    } catch (err) {
      console.error("Failed bulk delete:", err);
      showNotification('error', 'Failed to delete selected submissions.');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenReview = async (attempt) => {
    setSelectedAttempt(attempt);
    setReviewLoading(true);
    setReviewData(null);
    setQuestionViewMode('all'); // Default to showing all questions (objective + subjective)
    try {
      const res = await api.get(`/api/admin/attempts/${attempt.id}/review`);
      setReviewData(res.data);
    } catch (err) {
      console.error("Failed to fetch review data:", err);
      showNotification('error', 'Could not load attempt review details.');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCloseReview = () => {
    setSelectedAttempt(null);
    setReviewData(null);
    // Refresh list to show updated scores
    fetchAttempts();
  };
  const handleGradeQuestion = async (questionId, isCorrect) => {
    if (!selectedAttempt) return;
    setGradingQuestionId(questionId);
    try {
      const res = await api.post(`/api/admin/attempts/${selectedAttempt.id}/grade/${questionId}?is_correct=${isCorrect}`);
      setReviewData(res.data);
      showNotification('success', isCorrect ? 'Marked as Correct! Full marks assigned.' : 'Marked as Incorrect! Marks deducted.');
    } catch (err) {
      console.error("Error grading question:", err);
      showNotification('error', 'Failed to update grade on the server.');
    } finally {
      setGradingQuestionId(null);
    }
  };
  const handleRestartAttempt = async (attemptId) => {
    if (!window.confirm("Are you sure you want to completely restart this test attempt? This will permanently delete the current attempt and allow the student to start fresh.")) return;
    try {
      await api.post(`/api/admin/attempts/${attemptId}/restart`);
      showNotification('success', 'Test attempt restarted successfully.');
      fetchAttempts();
    } catch (err) {
      console.error("Failed to restart attempt:", err);
      showNotification('error', 'Failed to restart attempt.');
    }
  };

  const handleCancelAttempt = async (attemptId) => {
    if (!window.confirm("Are you sure you want to forcefully cancel this test attempt? It will be marked as cancelled due to cheating.")) return;
    try {
      await api.post(`/api/admin/attempts/${attemptId}/cancel`);
      showNotification('success', 'Test attempt cancelled successfully.');
      fetchAttempts();
    } catch (err) {
      console.error("Failed to cancel attempt:", err);
      showNotification('error', 'Failed to cancel attempt.');
    }
  };

  // Filter attempts (local search term only)
  const filteredAttempts = attempts.filter(att => {
    const matchesSearch = (
      (att.student_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.student_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.student_mobile || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.mock_test_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (att.topic_names && att.topic_names.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())))
    );
    return matchesSearch;
  });

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
  const totalPages = Math.ceil(totalItems / limit);
  // paginatedAttempts is simply the filteredAttempts from the backend page response
  const paginatedAttempts = filteredAttempts;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Notification Toast */}
        {notification && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl transition-all duration-300 ${
            notification.type === 'error' 
              ? 'bg-rose-500 text-white' 
              : 'bg-emerald-600 text-white'
          }`}>
            {notification.type === 'error' ? <XCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-xl">
                <ClipboardCheck className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Submissions & Violations Console</span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
                    Submissions & Alerts
                  </span>
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5 text-sm">
                  Showing exam submissions, student responses, and any tests flagged for cheating violations.
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={fetchAttempts}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm font-medium shadow-sm transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Submissions</span>
          </button>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col gap-4 bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2">Filter Status:</span>
              {['all', 'pending', 'pass', 'fail', 'violation'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all whitespace-nowrap ${
                    statusFilter === filter
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 font-semibold'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {filter === 'all' ? 'All Submissions' 
                    : filter === 'pending' ? '⏳ Pending' 
                    : filter === 'pass' ? '✅ Pass'
                    : filter === 'fail' ? '❌ Fail'
                    : '⚠️ Violations'}
                </button>
              ))}
            </div>
            
            <div className="relative w-full md:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search within page..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:text-white transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Date Range:</span>
              <input 
                type="date" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm dark:text-white"
              />
              <span className="text-slate-400">to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm dark:text-white"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Topic / Skill:</span>
              <select
                value={topicId}
                onChange={e => setTopicId(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm dark:text-white min-w-[150px]"
              >
                <option value="">All Topics</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Test Type:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-sm dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="objective">Objective Only</option>
                <option value="subjective">Subjective Included</option>
              </select>
            </div>
          </div>

        </div>

        {/* Bulk Actions Banner */}
        {selectedAttemptIds.length > 0 && (
          <div className="flex items-center justify-between bg-purple-50 dark:bg-purple-950/20 p-4 rounded-[24px] border border-purple-200 dark:border-purple-800/60 shadow-sm animate-fade-in">
            <span className="text-sm font-bold text-purple-700 dark:text-purple-400">
              {selectedAttemptIds.length} submission(s) selected
            </span>
            <div className="flex gap-2">
              <button 
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Selected</span>
              </button>
            </div>
          </div>
        )}

        {/* Submissions List Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading subjective test submissions...</p>
            </div>
          ) : filteredAttempts.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto text-purple-500">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-slate-700 dark:text-slate-200 font-bold text-base">No subjective test attempts found</p>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Only student attempts for mock tests that contain subjective paragraph questions appear here for manual checking.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    <th className="py-4 px-6 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={filteredAttempts.length > 0 && selectedAttemptIds.length === filteredAttempts.length}
                        onChange={(e) => handleSelectAll(e, filteredAttempts)}
                        className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                      />
                    </th>
                    <th className="py-4 px-6 font-semibold">Student Details</th>
                    <th className="py-4 px-6 font-semibold">Exam / Topic Being Checked</th>
                    <th className="py-4 px-6 font-semibold">Questions Status</th>
                    <th className="py-4 px-6 font-semibold">Score / Pass</th>
                    <th className="py-4 px-6 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60 text-sm">
                  {paginatedAttempts.map((attempt) => {
                    const hasResult = attempt.result && attempt.result.score !== null;
                    const isPassed = attempt.result && attempt.result.is_passed;
                    const needsGrading = attempt.pending_subjective_count > 0;
                    
                    return (
                      <tr key={attempt.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={selectedAttemptIds.includes(attempt.id)}
                            onChange={() => handleSelectAttempt(attempt.id)}
                            className="rounded border-slate-300 dark:border-slate-700 text-purple-600 focus:ring-purple-500 w-4 h-4 cursor-pointer"
                          />
                        </td>
                        
                        {/* Student Details Column */}
                        <td className="py-4 px-6">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-base flex-shrink-0 mt-0.5">
                              {(attempt.student_name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="space-y-0.5">
                              <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                <span>{attempt.student_name || 'Unknown Student'}</span>
                                <span className="text-[10px] font-normal px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                                  ID: #{attempt.user_id}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{attempt.student_email || 'No email'}</span>
                              </div>
                              {attempt.student_mobile && attempt.student_mobile !== 'N/A' && (
                                <div className="text-xs text-slate-400 flex items-center gap-1">
                                  <Phone className="w-3 h-3 text-slate-400" />
                                  <span>{attempt.student_mobile}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Exam / Topic Column */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-800 dark:text-slate-200">
                            {attempt.mock_test_title || 'Unknown Test'}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                              <Layers className="w-3 h-3" />
                              <span>{attempt.topic_names?.length > 0 ? attempt.topic_names.join(', ') : 'General'}</span>
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              • Total: {attempt.mock_test_total_marks || 0}m
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-1.5">
                            <Calendar className="w-3 h-3" />
                            <span>Submitted: {formatDate(attempt.end_time || attempt.start_time)}</span>
                          </div>
                        </td>

                        {/* Subjective Qs Status */}
                        <td className="py-4 px-6">
                          {attempt.status === 'cancelled_cheating' ? (
                            <span className="text-xs font-semibold text-slate-500 italic">Not Applicable</span>
                          ) : (
                            <div className="space-y-1.5">
                              <div className="flex gap-4">
                                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                  📝 Subj Qs: <span className="font-bold text-purple-600 dark:text-purple-400">{attempt.subjective_questions_count || 0}</span>
                                </div>
                                <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                  🎯 Obj Qs: <span className="font-bold text-blue-600 dark:text-blue-400">{attempt.objective_questions_count || 0}</span>
                                </div>
                              </div>
                              {needsGrading ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 animate-pulse">
                                  <Clock className="w-3.5 h-3.5" />
                                  <span>{attempt.pending_subjective_count} Pending Review</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>All Evaluated</span>
                                </span>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Score / Pass */}
                        <td className="py-4 px-6">
                          {attempt.status === 'cancelled_cheating' ? (
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Cheating Detected</span>
                              </span>
                              <div className="text-[11px] text-red-500 font-semibold pl-1">
                                {attempt.warnings_count || 0} Warnings
                              </div>
                            </div>
                          ) : hasResult ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                                  isPassed 
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                }`}>
                                  {isPassed ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                                  <span>{attempt.result.score} / {attempt.mock_test_total_marks} ({attempt.result.percentage}%)</span>
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 pl-1">
                                Status: <span className="font-semibold text-slate-700 dark:text-slate-300">{isPassed ? 'PASSED' : 'FAILED'}</span>
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-500">
                              Calculating...
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {attempt.status === 'cancelled_cheating' ? (
                              <>
                                <button 
                                  onClick={() => handleRestartAttempt(attempt.id)}
                                  className="px-3 py-1.5 rounded-lg font-bold text-xs bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                                >
                                  Restart
                                </button>
                                <button 
                                  onClick={() => handleCancelAttempt(attempt.id)}
                                  className="px-3 py-1.5 rounded-lg font-bold text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                >
                                  Confirm Cancel
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleOpenReview(attempt)}
                                className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                  needsGrading
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-500/25 ring-2 ring-purple-400/50'
                                    : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
                                }`}
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span>{needsGrading ? 'Check & Grade Now' : 'Review Answers'}</span>
                                <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteSingle(attempt.id)}
                              className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-all flex items-center justify-center"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/20">
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Showing <strong className="text-slate-800 dark:text-white">{totalItems === 0 ? 0 : (currentPage - 1) * limit + 1}</strong> to <strong className="text-slate-800 dark:text-white">{Math.min(currentPage * limit, totalItems)}</strong> of <strong className="text-slate-800 dark:text-white">{totalItems}</strong> submissions
                  </span>
                  
                  <select
                    value={limit}
                    onChange={(e) => {
                      setLimit(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-xs dark:text-white cursor-pointer outline-none"
                  >
                    <option value={25}>25 per page</option>
                    <option value={50}>50 per page</option>
                    <option value={100}>100 per page</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center"
                  >
                    <ChevronLeft className="h-3.5 w-3.5 mr-1" /> Previous
                  </button>
                  <span className="text-xs font-medium px-2 text-slate-500">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center"
                  >
                    Next <ChevronRight className="h-3.5 w-3.5 ml-1" />
                  </button>
                </div>
              </div>
            )}
          </>
          )}
        </div>

        {/* Interactive Attempt Grading Drawer / Modal */}
        {selectedAttempt && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex justify-center p-3 sm:p-6 md:p-10 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-scale-up">
              
              {/* Modal Top Banner */}
              <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-purple-500/20 text-purple-300 rounded-2xl border border-purple-500/30">
                    <ClipboardCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-black tracking-tight flex items-center gap-2">
                      <span>Subjective Evaluation Console</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-600 text-white">
                        Attempt #{selectedAttempt.id}
                      </span>
                    </h2>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Reviewing student details and grading paragraph answers in real-time.
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
                      
                      {/* Card 1: Who am I checking? (Student Details) */}
                      <div className="p-5 rounded-2xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800/60 space-y-3 shadow-sm">
                        <div className="flex items-center justify-between border-b border-purple-200/60 dark:border-purple-800/40 pb-2">
                          <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                            <UserCheck className="w-4 h-4 text-purple-600" />
                            <span>Student Profile Details</span>
                          </span>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-800 text-purple-900 dark:text-purple-100">
                            Student ID: #{reviewData.attempt.user_id}
                          </span>
                        </div>

                        <div className="flex items-center gap-3.5 pt-1">
                          <div className="w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center font-black text-xl shadow-md">
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

                      {/* Card 2: Which Test am I checking? (Exam Summary) */}
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
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Test Title:</span>
                            <span className="font-bold text-slate-900 dark:text-white">{reviewData.attempt.mock_test_title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Topic Domain:</span>
                            <span className="font-bold text-blue-600 dark:text-blue-400">{reviewData.attempt.topic_name || 'General'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Subjective Questions:</span>
                            <span className="font-bold text-purple-600 dark:text-purple-400">
                              {reviewData.attempt.subjective_questions_count} Total ({reviewData.attempt.pending_subjective_count} Pending Review)
                            </span>
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
                          Real-Time Evaluated Score
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

                    {/* Question Type View Mode Toggle */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div>
                        <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-5 h-5 text-purple-600" />
                          <span>Student Answer Sheet & Grading Controls</span>
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Click Tick Correct or Tick Incorrect to award or deduct marks. Scores update instantly.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                        <button
                          onClick={() => setQuestionViewMode('subjective')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            questionViewMode === 'subjective'
                              ? 'bg-purple-600 text-white shadow-md'
                              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                          }`}
                        >
                          📝 Subjective Questions Only ({reviewData.answers.filter(a => a.question_type === 'text').length})
                        </button>
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
                      </div>
                    </div>

                    {/* Questions & Answers List */}
                    <div className="space-y-5">
                      {reviewData.answers
                        .filter(ans => questionViewMode === 'all' || ans.question_type === 'text')
                        .map((ans, idx) => {
                          const isSubjective = ans.question_type === 'text';
                          const isPending = ans.is_correct === null || ans.is_correct === undefined;
                          const isMarkedCorrect = ans.is_correct === true;
                          const isMarkedWrong = ans.is_correct === false;
                          const isBeingGraded = gradingQuestionId === ans.question_id;

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
                              {/* Question Top Info */}
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex items-center gap-2.5">
                                  <span className="w-8 h-8 rounded-lg bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow">
                                    Q{idx + 1}
                                  </span>
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                    isSubjective
                                      ? 'bg-purple-600 text-white shadow-sm'
                                      : 'bg-blue-600 text-white shadow-sm'
                                  }`}>
                                    {isSubjective ? 'Subjective Paragraph' : 'Multiple Choice'}
                                  </span>
                                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-200 dark:bg-slate-700 px-2 py-0.5 rounded">
                                    {ans.marks} Marks
                                  </span>
                                </div>

                                {/* Current Status Pill */}
                                <div>
                                  {isMarkedCorrect ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-emerald-600 text-white shadow-md">
                                      <CheckCircle2 className="w-4 h-4" />
                                      <span>Marked Correct (+{ans.marks} Marks)</span>
                                    </span>
                                  ) : isMarkedWrong ? (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-rose-600 text-white shadow-md">
                                      <XCircle className="w-4 h-4" />
                                      <span>Marked Incorrect (0 Marks)</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3.5 py-1.5 rounded-full bg-amber-600 text-white shadow-lg animate-pulse">
                                      <Clock className="w-4 h-4" />
                                      <span>⏳ Needs Admin Grading</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Question Text */}
                              <div 
                                className="font-semibold text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed prose dark:prose-invert max-w-none"
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

                              {/* Student Answer Box */}
                              <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3 mb-5 shadow-inner">
                                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                  <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                                    <User className="w-3.5 h-3.5" />
                                    <span>Student's Submitted Response:</span>
                                  </span>
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    Submitted by {reviewData.attempt.student_name}
                                  </span>
                                </div>

                                {isSubjective ? (
                                  <>
                                    <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-mono whitespace-pre-wrap leading-relaxed bg-purple-50/50 dark:bg-purple-950/20 p-4 rounded-xl border-l-4 border-purple-600 shadow-sm mb-3">
                                      {ans.text_answer ? (
                                        ans.text_answer
                                      ) : (
                                        <span className="text-slate-400 not-italic font-sans">No paragraph response written by student.</span>
                                      )}
                                    </div>
                                    {ans.correct_answer && (
                                      <div className="text-sm sm:text-base text-slate-900 dark:text-slate-100 font-mono whitespace-pre-wrap leading-relaxed bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-xl border-l-4 border-emerald-600 shadow-sm">
                                        <span className="block text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">Expected Answer:</span>
                                        {ans.correct_answer}
                                      </div>
                                    )}
                                  </>
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

                                {/* Explanation / Model Answer if available */}
                                {ans.explanation && (
                                  <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex items-start gap-1.5">
                                    <span className="font-bold text-slate-900 dark:text-slate-200 flex-shrink-0">Admin Rubric / Model Answer:</span>
                                    <span>{ans.explanation}</span>
                                  </div>
                                )}
                              </div>

                              {/* Interactive Two-Tick Console */}
                              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                <div className="text-xs text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1.5">
                                  <span>👉 Action Required:</span>
                                  <span className="font-normal text-slate-500">Click a tick button below to evaluate this answer:</span>
                                </div>
                                
                                <div className="flex items-center gap-3 w-full sm:w-auto">
                                  {/* Tick Correct Button */}
                                  <button
                                    disabled={isBeingGraded}
                                    onClick={() => handleGradeQuestion(ans.question_id, true)}
                                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                                      isMarkedCorrect
                                        ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/40 shadow-lg scale-105'
                                        : 'bg-emerald-100 dark:bg-emerald-950/60 hover:bg-emerald-600 hover:text-white text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                    }`}
                                  >
                                    {isBeingGraded ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 stroke-[3]" />}
                                    <span>Two Tick Correct (+{ans.marks}m)</span>
                                  </button>

                                  {/* Tick Incorrect Button */}
                                  <button
                                    disabled={isBeingGraded}
                                    onClick={() => handleGradeQuestion(ans.question_id, false)}
                                    className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-extrabold text-xs transition-all ${
                                      isMarkedWrong
                                        ? 'bg-rose-600 text-white ring-4 ring-rose-500/40 shadow-lg scale-105'
                                        : 'bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-600 hover:text-white text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-700'
                                    }`}
                                  >
                                    {isBeingGraded ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 stroke-[3]" />}
                                    <span>Two Tick Incorrect (0m)</span>
                                  </button>
                                </div>
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
                  {reviewData && `Showing student ${reviewData.attempt.student_name}'s submission for ${reviewData.attempt.mock_test_title}`}
                </div>
                <button
                  onClick={handleCloseReview}
                  className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-md transition-all hover:scale-[1.02]"
                >
                  Save & Close Console
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default SubmissionsManagement;
