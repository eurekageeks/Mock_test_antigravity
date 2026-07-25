import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  CheckCircle, XCircle, Award, Clock, FileText, ChevronRight, 
  HelpCircle, Home, RotateCcw, ShieldCheck, ShieldAlert
} from 'lucide-react';

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
  const isPassed = attempt.result.is_passed;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Scorecard Header Card */}
        <div className={`relative overflow-hidden rounded-[32px] p-8 text-white shadow-xl ${
          isPassed 
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
                {isPassed ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                <span className="text-xl font-bold uppercase tracking-wide">
                  {isPassed ? 'PASSED assessment' : 'FAILED assessment'}
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
                      {ans.is_correct ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> CORRECT
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400">
                          <XCircle className="h-3.5 w-3.5 mr-1" /> INCORRECT / EMPTY
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="font-bold text-slate-950 dark:text-white text-base leading-relaxed">
                    {ans.question_text}
                  </p>

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
                        <span className={`font-semibold ${ans.is_correct ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'}`}>
                          {ans.text_answer || <span className="italic text-red-500">Unanswered</span>}
                        </span>
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
