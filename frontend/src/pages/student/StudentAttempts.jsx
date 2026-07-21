import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { FileText, Clock, Award, ChevronRight, CheckCircle, RotateCcw } from 'lucide-react';

const StudentAttempts = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAttempts = async () => {
      try {
        const res = await api.get('/api/student/attempts');
        setAttempts(res.data);
      } catch (err) {
        console.error("Failed to load attempt logs:", err);
      } finally {
        setLoading(false);
      }
    };
    loadAttempts();
  }, []);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Attempt Records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Exam Attempt History</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Review your past scores, times taken, and access detailed answer logs.</p>
        </div>

        {/* Table of Attempts */}
        {attempts.length > 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50/50 dark:bg-slate-900/30">
                    <th className="py-4 px-6">Attempt ID</th>
                    <th className="py-4 px-6">Mock Exam Name</th>
                    <th className="py-4 px-6">Date Attempted</th>
                    <th className="py-4 px-6">Time Spent</th>
                    <th className="py-4 px-6">Score & Passing Status</th>
                    <th className="py-4 px-6 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-sm font-medium">
                  {attempts.map((attempt) => (
                    <tr key={attempt.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-750/10 transition-colors">
                      <td className="py-5 px-6 font-bold text-slate-400">#{attempt.id}</td>
                      <td className="py-5 px-6">
                        <span className="block text-slate-900 dark:text-white font-bold">{attempt.mock_test_title}</span>
                      </td>
                      <td className="py-5 px-6 text-slate-500 text-xs">
                        {new Date(attempt.start_time).toLocaleDateString()} at {new Date(attempt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="py-5 px-6 text-slate-500 font-mono text-xs">
                        {attempt.status === 'submitted' ? formatDuration(attempt.time_taken_seconds) : 'N/A'}
                      </td>
                      <td className="py-5 px-6">
                        {attempt.result ? (
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                              attempt.result.is_passed 
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                            }`}>
                              {attempt.result.is_passed ? 'PASSED' : 'FAILED'}
                            </span>
                            <span className="text-xs text-slate-700 dark:text-slate-300">
                              {attempt.result.score} Marks ({attempt.result.percentage}%)
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs font-bold text-amber-500">IN PROGRESS</span>
                        )}
                      </td>
                      <td className="py-5 px-6 text-center">
                        {attempt.status === 'submitted' ? (
                          <Link 
                            to={`/student/test-results/${attempt.id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-brand-500 hover:text-brand-600 hover:underline"
                          >
                            <span>Review Result</span> <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        ) : (
                          <Link
                            to={`/student/test-attempt/${attempt.id}`}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-amber-500 hover:text-amber-600 hover:underline"
                          >
                            <span>Resume Test</span> <ChevronRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700 max-w-md mx-auto">
            <RotateCcw className="h-12 w-12 text-slate-350 dark:text-slate-655 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Attempt Records</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
              You haven't attempted any exams yet. Once you complete your first mock assessment, its statistics and grade review will show here.
            </p>
            <Link
              to="/student/tests"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Browse Catalog
            </Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentAttempts;
