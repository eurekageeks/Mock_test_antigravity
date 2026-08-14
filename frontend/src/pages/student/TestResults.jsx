import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  CheckCircle, XCircle, Award, Clock, FileText, ChevronRight, 
  HelpCircle, Home, RotateCcw, ShieldCheck, ShieldAlert
} from 'lucide-react';
import { processHtmlImages } from '../../utils/imageHelper';

const TestResults = () => {
  const { attempt_id } = useParams();
  
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadResults = async () => {
      try {
        const res = await api.get(`/api/student/attempts/${attempt_id}/result`);
        setData(res.data);
      } catch (err) {
        console.error("Failed to load attempt scorecard:", err);
        setError("Failed to fetch test results. Ensure this test has been submitted.");
      } finally {
        setLoading(false);
      }
    };
    loadResults();
  }, [attempt_id]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    if (m > 0) {
      return `${m}m ${s}s`;
    }
    return `${s}s`;
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Compiling Scorecard Results...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-705 shadow-sm max-w-sm mx-auto">
          <p className="text-red-500 font-bold mb-4">{error || "Attempt results not found."}</p>
          <Link to="/student/dashboard" className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { attempt, answers } = data;
  
  if (attempt.status === 'cancelled_cheating') {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center transition-colors duration-300">
        <div className="max-w-xl mx-auto bg-white dark:bg-slate-800 rounded-[32px] p-8 md:p-12 text-center shadow-xl border-2 border-red-500 animate-fade-in">
          <div className="w-24 h-24 bg-red-100 dark:bg-red-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="h-12 w-12 text-red-600 dark:text-red-500 animate-pulse" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Test Cancelled</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed font-medium">
            Your assessment was automatically cancelled due to multiple violations of the exam rules (navigating away from the exam window).
          </p>
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl mb-8">
            <p className="text-sm font-bold text-red-600 dark:text-red-400">
              Recorded warnings: {attempt.warnings_count}
            </p>
          </div>
          <Link to="/student/dashboard" className="inline-flex items-center px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg transition-all duration-200">
            <Home className="mr-2 h-5 w-5" /> Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const hasPendingSubjective = attempt.pending_subjective_count > 0;
  const isPassed = attempt.result.is_passed;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Scorecard Header Card */}
        <div className={`relative overflow-hidden rounded-[32px] p-8 text-white shadow-xl ${
          hasPendingSubjective
            ? 'bg-gradient-to-tr from-amber-600 to-amber-400 shadow-amber-500/10'
            : isPassed 
              ? 'bg-gradient-to-tr from-emerald-800 to-emerald-500 shadow-emerald-500/10' 
              : 'bg-gradient-to-tr from-rose-800 to-rose-500 shadow-rose-500/10'
        }`}>
          <div className="absolute right-[-10%] bottom-[-50%] w-[350px] aspect-square rounded-full bg-white/10 blur-[60px] pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-xl text-[10px] font-bold bg-white/20 uppercase tracking-wider block w-max mb-3">
                Scorecard summary
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{attempt.mock_test_title}</h1>
              <div className="flex items-center space-x-2 mt-4">
                {hasPendingSubjective ? <Clock className="h-6 w-6" /> : (isPassed ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />)}
                <span className="text-xl font-bold uppercase tracking-wide">
                  {hasPendingSubjective ? (attempt.result?.subjective_score > 0 ? 'PARTIALLY GRADED' : 'Submitted to Admin') : (isPassed ? 'PASSED assessment' : 'FAILED assessment')}
                </span>
              </div>
            </div>
            
            {/* Circle Score */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl text-center self-start md:self-center">
              <span className="text-xs text-white/80 block font-semibold uppercase tracking-wider">Final Grade</span>
              <span className="text-3xl font-black block mt-1">{attempt.result.percentage}%</span>
              <span className="text-[10px] text-white/90 block font-bold mt-1">
                ({attempt.result.score} / {attempt.mock_test_total_marks} Marks)
              </span>
            </div>
          </div>
        </div>

                {/* Detailed Scores Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Objective Score */}
          <div className={`p-4 rounded-3xl border ${attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800/50'}`}>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Objective (MCQ)</p>
            <p className={`text-3xl font-black ${attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'text-emerald-600' : 'text-rose-600'}`}>
              {attempt.result?.objective_score || 0} <span className="text-sm font-medium opacity-60">/ {attempt.result?.objective_total_marks || 0}</span>
            </p>
            <p className={`text-xs font-bold mt-2 ${attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'text-emerald-500' : 'text-rose-500'}`}>
              {attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'PASSED' : 'FAILED'}
            </p>
          </div>

          {/* Subjective Score */}
          <div className={`p-4 rounded-3xl border ${attempt.pending_subjective_count > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/50' : 'bg-sky-50 border-sky-200 dark:bg-sky-900/10 dark:border-sky-800/50'}`}>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Subjective</p>
            <div className="flex flex-col items-center justify-center pb-2">
              <p className={`text-3xl font-black ${attempt.pending_subjective_count > 0 ? 'text-amber-600' : 'text-sky-600'}`}>
                {attempt.result?.subjective_score || 0} <span className="text-sm font-medium opacity-60">/ {attempt.result?.subjective_total_marks || 0}</span>
              </p>
              <p className={`text-xs font-bold mt-2 ${attempt.pending_subjective_count > 0 ? 'text-amber-500 animate-pulse' : 'text-sky-500'}`}>
                {attempt.pending_subjective_count > 0 ? 'PARTIALLY GRADED' : 'GRADED'}
              </p>
            </div>
          </div>

          {/* Final Score */}
          <div className={`p-4 rounded-3xl border ${isPassed ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800/50'}`}>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Final Result</p>
            <div className="flex flex-col items-center justify-center pb-2">
              <p className={`text-3xl font-black ${isPassed ? 'text-emerald-600' : 'text-rose-600'}`}>
                {attempt.result?.score || 0} <span className="text-sm font-medium opacity-60">/ {attempt.mock_test_total_marks || 0}</span>
              </p>
              <p className={`text-xs font-bold mt-2 ${isPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                {attempt.pending_subjective_count > 0 ? (isPassed ? 'PASSED SO FAR' : 'FAILED SO FAR') : (isPassed ? 'PASSED OVERALL' : 'FAILED OVERALL')}
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center">
            <CheckCircle className="h-5 w-5 text-emerald-500 mx-auto mb-2" />
            <span className="block text-lg font-black text-slate-900 dark:text-white">{attempt.result.correct_count}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Correct Answers</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center">
            <XCircle className="h-5 w-5 text-rose-500 mx-auto mb-2" />
            <span className="block text-lg font-black text-slate-900 dark:text-white">{attempt.result.wrong_count}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Wrong Answers</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center">
            <Clock className="h-5 w-5 text-amber-500 mx-auto mb-2" />
            <span className="block text-lg font-black text-slate-900 dark:text-white">{formatDuration(attempt.time_taken_seconds)}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Time Elapsed</span>
          </div>

          <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm text-center">
            <Award className="h-5 w-5 text-indigo-500 mx-auto mb-2" />
            <span className="block text-lg font-black text-slate-900 dark:text-white">#{attempt.result.rank || '1'}</span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Attempt Rank</span>
          </div>
        </div>

        {/* Question Review Grid */}
        <div className="space-y-6">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
            Question & Answer Review
          </h2>
          
          <div className="space-y-6">
            {answers.map((ans, idx) => {
              const isMCQ = ans.question_type === 'mcq';
              return (
                <div 
                  key={ans.id || idx}
                  className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[28px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Question {idx + 1} • {ans.marks} Mark(s)
                    </span>
                    <div className="flex items-center space-x-1">
                      {ans.is_correct === true ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> CORRECT
                        </span>
                      ) : ans.is_correct === false ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5 mr-1" /> INCORRECT / EMPTY
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          <Clock className="h-3.5 w-3.5 mr-1" /> PENDING REVIEW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <div 
                    className="font-bold text-slate-950 dark:text-white text-base leading-relaxed prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: processHtmlImages(ans.question_text) }}
                  />

                  {/* Options List (only if MCQ) */}
                  {isMCQ && ans.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-2">
                      {ans.options.map((opt) => {
                        const isChosen = ans.selected_option === opt.option_key;
                        const isCorrectKey = ans.correct_answer === opt.option_key;
                        
                        let borderStyle = 'border-slate-200 dark:border-slate-800';
                        let badgeStyle = 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-350';
                        
                        if (isCorrectKey) {
                          borderStyle = 'border-emerald-500 bg-emerald-500/5 dark:bg-emerald-500/10';
                          badgeStyle = 'bg-emerald-500 text-white';
                        } else if (isChosen && !isCorrectKey) {
                          borderStyle = 'border-rose-500 bg-rose-500/5 dark:bg-rose-500/10';
                          badgeStyle = 'bg-rose-500 text-white';
                        }

                        return (
                          <div 
                            key={opt.id}
                            className={`flex items-center p-4 rounded-xl border text-sm font-medium ${borderStyle}`}
                          >
                            <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] mr-3 ${badgeStyle}`}>
                              {opt.option_key}
                            </span>
                            <span>{opt.option_text}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Text Answers display */}
                  {!isMCQ && (
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-750/30 text-xs space-y-2">
                      <div>
                        <span className="text-slate-400 block mb-0.5">Your Submitted Text Answer:</span>
                        <div className={`font-mono whitespace-pre-wrap p-3 rounded-lg bg-white dark:bg-slate-800 border ${ans.is_correct ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'}`}>
                          {ans.text_answer || <span className="italic text-red-500">Unanswered</span>}
                        </div>
                      </div>
                      <div className="border-t border-slate-200/50 dark:border-slate-800 pt-2">
                        <span className="text-slate-400 block mb-0.5">Expected Answer:</span>
                        <span className="font-bold text-slate-900 dark:text-white">
                          {ans.correct_answer}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Explanation card */}
                  {ans.explanation && (
                    <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl flex items-start space-x-3 text-xs leading-relaxed">
                      <HelpCircle className="h-4.5 w-4.5 text-indigo-500 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-indigo-600 dark:text-indigo-400 font-bold block mb-1">Explanation Note:</strong>
                        <span className="text-slate-650 dark:text-slate-450">{ans.explanation}</span>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Back Actions */}
        <div className="flex gap-4 pt-4 justify-center border-t border-slate-200 dark:border-slate-800">
          <Link
            to="/student/dashboard"
            className="inline-flex items-center px-6 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
          >
            <Home className="mr-2 h-4.5 w-4.5" /> Dashboard
          </Link>
          <Link
            to="/student/tests"
            className="inline-flex items-center px-6 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl transition-all duration-200 text-sm animate-delay-100"
          >
            Attempt Another Test <ChevronRight className="ml-1 h-4.5 w-4.5" />
          </Link>
        </div>

      </div>
    </div>
  );
};

export default TestResults;
