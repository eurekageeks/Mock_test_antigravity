import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Clock, AlertTriangle, ChevronLeft, ChevronRight, Send } from 'lucide-react';

const MockTestInterface = () => {
  const { attempt_id } = useParams();
  const navigate = useNavigate();

  const [testInfo, setTestInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  
  // Track selected/typed answers locally: { questionId: { selected_option, text_answer } }
  const [localAnswers, setLocalAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);

  const timerRef = useRef(null);

  // 1. Fetch attempt questions and details
  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await api.get(`/api/student/attempts/${attempt_id}`);
        setTestInfo(res.data);
        setQuestions(res.data.questions);
        setTimeLeft(res.data.time_remaining_seconds);
        
        // Load initial answers already saved on database (handles resumes)
        const initialAnswers = {};
        res.data.questions.forEach((q) => {
          if (q.saved_answer) {
            initialAnswers[q.id] = {
              selected_option: q.saved_answer.selected_option || '',
              text_answer: q.saved_answer.text_answer || ''
            };
          } else {
            initialAnswers[q.id] = {
              selected_option: '',
              text_answer: ''
            };
          }
        });
        setLocalAnswers(initialAnswers);
      } catch (err) {
        console.error("Failed to load active exam sheet:", err);
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchAttempt();
  }, [attempt_id]);

  // 2. Ticking down timer
  useEffect(() => {
    if (timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft]);

  const setAnswers = (data) => {
    setLocalAnswers(data);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // 3. Auto-save current question answer to backend
  const saveAnswerToBackend = async (questionId) => {
    const answer = localAnswers[questionId];
    if (!answer) return;

    // Skip saving if answer is completely empty
    if (!answer.selected_option && !answer.text_answer.trim()) return;

    try {
      await api.post(`/api/student/attempts/${attempt_id}/save-answer`, {
        question_id: questionId,
        selected_option: answer.selected_option || null,
        text_answer: answer.text_answer || null
      });
    } catch (err) {
      console.error("Failed to auto-save answer:", err);
    }
  };

  const handleSelectOption = (questionId, optionKey) => {
    const updated = {
      ...localAnswers,
      [questionId]: {
        selected_option: optionKey,
        text_answer: ''
      }
    };
    setAnswers(updated);
    
    // Save to backend immediately on select
    setTimeout(() => saveAnswerToBackend(questionId), 100);
  };

  const handleTextChange = (questionId, val) => {
    const updated = {
      ...localAnswers,
      [questionId]: {
        selected_option: '',
        text_answer: val
      }
    };
    setAnswers(updated);
  };

  const handleTextBlur = (questionId) => {
    saveAnswerToBackend(questionId);
  };

  // Navigate back/forth
  const handleNavigate = (newIdx) => {
    // Save current question answer before moving
    if (questions[currentIdx]) {
      saveAnswerToBackend(questions[currentIdx].id);
    }
    setCurrentIdx(newIdx);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    // Save the current question before submission
    if (questions[currentIdx]) {
      await saveAnswerToBackend(questions[currentIdx].id);
    }

    try {
      await api.post(`/api/student/attempts/${attempt_id}/submit`);
      navigate(`/student/test-results/${attempt_id}`);
    } catch (err) {
      console.error("Error submitting mock test:", err);
      setSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(`/api/student/attempts/${attempt_id}/submit`);
      navigate(`/student/test-results/${attempt_id}`);
    } catch (err) {
      console.error("Error auto-submitting mock test on timer expiry:", err);
      navigate(`/student/test-results/${attempt_id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Preparing Exam Sheet...</p>
        </div>
      </div>
    );
  }

  // Guard: test was published but has no questions yet
  if (!loading && questions.length === 0) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen flex items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg p-10 max-w-sm w-full text-center space-y-4">
          <div className="inline-flex p-4 rounded-full bg-amber-500/10 text-amber-500 mx-auto">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">No Questions Available</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            This test has no questions added yet. Please contact your instructor or check back later.
          </p>
          <button
            onClick={() => navigate('/student/tests')}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl text-sm transition-all duration-200"
          >
            Back to Test Catalog
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIdx];
  const totalQuestions = questions.length;
  
  // Calculate stats for confirmation modal
  const answeredCount = Object.values(localAnswers).filter(
    (ans) => ans.selected_option || (ans.text_answer && ans.text_answer.trim() !== '')
  ).length;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-[calc(100vh-4rem)] flex flex-col md:grid md:grid-cols-12 transition-colors duration-300">
      
      {/* LEFT COLUMN: Question and details (8 cols) */}
      <div className="md:col-span-8 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 p-6 sm:p-8">
        
        {/* Question Header */}
        <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-6">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {currentIdx + 1} of {totalQuestions}</span>
            <h2 className="text-sm font-bold text-slate-500 mt-0.5">Marks: {currentQuestion?.marks}</h2>
          </div>
          <div className="px-3 py-1 bg-brand-500/10 text-brand-500 text-xs font-bold rounded-lg uppercase">
            {currentQuestion?.type === 'mcq' ? 'Multiple Choice' : 'Text Entry'}
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 space-y-6">
          <div className="p-6 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <p className="text-base sm:text-lg font-bold leading-relaxed whitespace-pre-line text-slate-900 dark:text-white">
              {currentQuestion?.question_text}
            </p>
          </div>

          {/* MCQ Options list */}
          {currentQuestion?.type === 'mcq' && (
            <div className="grid grid-cols-1 gap-3">
              {currentQuestion.options.map((opt) => {
                const isSelected = localAnswers[currentQuestion.id]?.selected_option === opt.option_key;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectOption(currentQuestion.id, opt.option_key)}
                    className={`w-full flex items-center p-5 rounded-2xl border text-left font-medium transition-all duration-200 ${
                      isSelected
                        ? 'border-brand-500 bg-brand-500/5 dark:bg-brand-500/10 text-slate-900 dark:text-white ring-2 ring-brand-500/20'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs mr-4 transition-colors ${
                      isSelected
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}>
                      {opt.option_key}
                    </span>
                    <span className="text-sm">{opt.option_text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Text input area */}
          {currentQuestion?.type === 'text' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Your Answer</label>
              <textarea
                rows={5}
                value={localAnswers[currentQuestion.id]?.text_answer || ''}
                onChange={(e) => handleTextChange(currentQuestion.id, e.target.value)}
                onBlur={() => handleTextBlur(currentQuestion.id)}
                className="w-full px-5 py-4 rounded-3xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium shadow-inner"
                placeholder="Type your complete answer here. The answer is saved automatically when clicking Next/Prev or clicking outside."
              />
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="flex items-center justify-between border-t border-slate-200/50 dark:border-slate-800/50 pt-6 mt-8">
          <button
            onClick={() => handleNavigate(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="inline-flex items-center px-5 py-3 border border-slate-300 dark:border-slate-700 text-sm font-bold rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 disabled:opacity-30 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5 mr-1" /> Previous
          </button>
          
          {currentIdx === totalQuestions - 1 ? (
            <button
              onClick={() => setShowConfirmSubmit(true)}
              className="inline-flex items-center px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm animate-pulse-slow"
            >
              Submit Test <Send className="ml-2 h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => handleNavigate(currentIdx + 1)}
              className="inline-flex items-center px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-sm"
            >
              Save & Next <ChevronRight className="ml-1 h-5 w-5" />
            </button>
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Live Timer & Question Navigation Grid (4 cols) */}
      <div className="md:col-span-4 bg-white dark:bg-slate-800/40 p-6 sm:p-8 flex flex-col justify-between">
        
        <div className="space-y-8">
          {/* Live Timer box */}
          <div className="p-5 rounded-[24px] bg-gradient-to-br from-brand-500/10 to-indigo-500/10 border border-brand-500/10 flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-brand-500 text-white rounded-xl shadow-md shadow-brand-500/20 animate-pulse">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Time Remaining</span>
                <span className={`text-2xl font-black font-mono tracking-wider ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {timeLeft < 60 && (
              <span className="inline-flex p-1 bg-red-500/10 text-red-500 rounded-lg text-[10px] font-bold uppercase animate-ping">
                CRITICAL
              </span>
            )}
          </div>

          {/* Test Metadata details */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
            <h4 className="font-extrabold text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200/50 dark:border-slate-700/50 pb-2 mb-2">
              Mock Sheet Details
            </h4>
            <div className="space-y-1">
              <span className="block text-sm font-bold text-slate-900 dark:text-white truncate">{testInfo?.title}</span>
              <span className="text-xs text-slate-400">Total duration limit: {testInfo?.duration_minutes} Minutes</span>
            </div>
          </div>

          {/* Question Grid */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">Question Status Panel</h3>
            <div className="grid grid-cols-5 gap-2.5">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const ans = localAnswers[q.id];
                const isAnswered = ans && (ans.selected_option || (ans.text_answer && ans.text_answer.trim() !== ''));
                
                return (
                  <button
                    key={q.id}
                    onClick={() => handleNavigate(idx)}
                    className={`aspect-square rounded-xl flex items-center justify-center font-bold text-sm transition-all duration-200 hover:scale-105 ${
                      isCurrent
                        ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25 ring-2 ring-brand-500/20'
                        : isAnswered
                        ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Big Submit Button */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6">
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 text-sm flex items-center justify-center"
          >
            <Send className="mr-2 h-4 w-4" /> Submit Exam
          </button>
        </div>

      </div>

      {/* Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative animate-scale-up">
            
            <div className="text-center mb-6">
              <span className="inline-flex p-3 rounded-full bg-emerald-500/10 text-emerald-500 mb-3">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Confirm Submission</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                Are you sure you want to finish and submit your mock test answers? You cannot change your responses after submitting.
              </p>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 mb-8 space-y-2 text-center text-sm font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <span className="text-slate-800 dark:text-white">{totalQuestions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Answered Questions:</span>
                <span className="text-emerald-500">{answeredCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Unanswered Questions:</span>
                <span className="text-red-500">{totalQuestions - answeredCount}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-6">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="w-full py-3.5 text-center text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-2xl transition-all duration-200"
              >
                Back to Test
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all duration-200 text-sm"
              >
                {submitting ? 'Grading...' : 'Yes, Submit'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MockTestInterface;
