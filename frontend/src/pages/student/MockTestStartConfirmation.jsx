import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { Clock, Award, FileText, CheckCircle, ChevronLeft, Play } from 'lucide-react';

const MockTestStartConfirmation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const loadTestDetails = async () => {
      try {
        const res = await api.get(`/api/student/tests/${id}`);
        setTest(res.data);
      } catch (err) {
        console.error("Failed to load test details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTestDetails();
  }, [id]);

  const handleStartExam = async () => {
    setStarting(true);
    try {
      const res = await api.post(`/api/student/tests/${id}/start`);
      // Redirect to the live test execution interface using the attempt ID
      navigate(`/student/test-attempt/${res.data.attempt_id}`);
    } catch (err) {
      console.error("Failed to start mock test attempt:", err);
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Preparing Assessment Environment...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-705 shadow-sm max-w-sm mx-auto">
          <p className="text-slate-500 dark:text-slate-400 font-bold mb-4">Exam Sheet Not Found</p>
          <Link to="/student/tests" className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
        
        {/* Back Link */}
        <Link to="/student/tests" className="inline-flex items-center text-sm font-bold text-slate-400 hover:text-slate-600">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to mock test catalog
        </Link>

        {/* Start Card Container */}
        <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-[32px] border border-slate-200/60 dark:border-slate-850 shadow-sm space-y-8">
          
          {/* Header */}
          <div>
            <span className="px-3 py-1 rounded-xl text-xs font-bold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
              {test.topic_name || "General"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-4">{test.title}</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{test.description}</p>
          </div>

          {/* Guidelines Matrix */}
          <div className="grid grid-cols-3 gap-4 border-y border-slate-100 dark:border-slate-700/50 py-6 text-center">
            <div>
              <Clock className="h-6 w-6 mx-auto text-brand-500 mb-2" />
              <span className="block text-sm font-black text-slate-900 dark:text-white">{test.duration_minutes} Minutes</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Exam Duration</span>
            </div>
            <div>
              <FileText className="h-6 w-6 mx-auto text-brand-500 mb-2" />
              <span className="block text-sm font-black text-slate-900 dark:text-white">{test.question_count} Questions</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Total Questions</span>
            </div>
            <div>
              <Award className="h-6 w-6 mx-auto text-brand-500 mb-2" />
              <span className="block text-sm font-black text-slate-900 dark:text-white">{test.passing_marks} / {test.total_marks}</span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Passing Marks</span>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-4">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Attempt Instructions</h3>
            {test.instructions ? (
              <div className="p-5 bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-xs text-slate-650 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {test.instructions}
              </div>
            ) : (
              <ul className="list-disc pl-5 text-xs text-slate-500 dark:text-slate-400 space-y-2">
                <li>Make sure you have a stable internet connection.</li>
                <li>Do not reload, refresh, or close the page while the test is active.</li>
                <li>The countdown timer starts immediately when you press the button below.</li>
                <li>If the timer expires, the test automatically saves and grades whatever you have completed.</li>
              </ul>
            )}
          </div>

          {/* Action Call */}
          <div className="pt-2">
            <button
              onClick={handleStartExam}
              disabled={starting}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 transition-all duration-200 flex items-center justify-center text-sm"
            >
              <Play className="h-4.5 w-4.5 mr-2 fill-current" /> {starting ? 'Loading Exam Environment...' : 'I Agree & Start Mock Test'}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export default MockTestStartConfirmation;
