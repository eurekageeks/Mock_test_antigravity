import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  Play, RotateCcw, AlertTriangle, CheckCircle, Clock, 
  Award, FileText, ChevronRight, User, Sparkles
} from 'lucide-react';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Skills Modal state
  const [showSkillsModal, setShowSkillsModal] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState([]);
  
  // Available skills to choose from
  const availableSkillsList = [
    "Python", "Java", "AWS", "Docker", "Kubernetes", 
    "DevOps", "Linux", "Networking", "React", "FastAPI", "MySQL", "Git"
  ];

  // One-time initialization: load stats, tests, and pre-populate skills
  const initializeDashboard = async () => {
    try {
      const [statsRes, testsRes, profileRes] = await Promise.all([
        api.get('/api/student/dashboard'),
        api.get('/api/student/tests'),
        api.get('/api/student/profile')
      ]);
      setStats(statsRes.data);
      setTests(testsRes.data);

      // Pre-populate modal with current skills
      if (profileRes.data && profileRes.data.skills) {
        setSelectedSkills(profileRes.data.skills.map(s => s.name));
      }

      // Show skills popup every fresh login session
      const sessionSkipped = sessionStorage.getItem('skipped_skills');
      if (!sessionSkipped) {
        setShowSkillsModal(true);
      }
    } catch (err) {
      console.error("Failed to load student dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // Lightweight refresh after saving skills (does NOT re-trigger the popup)
  const refreshDashboard = async () => {
    try {
      const [statsRes, testsRes] = await Promise.all([
        api.get('/api/student/dashboard'),
        api.get('/api/student/tests')
      ]);
      setStats(statsRes.data);
      setTests(testsRes.data);
    } catch (err) {
      console.error("Failed to refresh dashboard:", err);
    }
  };

  useEffect(() => {
    initializeDashboard();
  }, []);

  const handleSkillToggle = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };


  const handleSaveSkills = async () => {
    try {
      await api.post('/api/student/skills', { skills: selectedSkills });
      // Mark session as done BEFORE refresh so popup doesn't re-show
      sessionStorage.setItem('skipped_skills', 'true');
      setShowSkillsModal(false);
      refreshDashboard();
    } catch (err) {
      console.error("Failed to save skills:", err);
    }
  };

  const handleSkipSkills = () => {
    sessionStorage.setItem('skipped_skills', 'true');
    setShowSkillsModal(false);
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Student Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Welcome Card */}
        <div className="relative overflow-hidden bg-gradient-to-r from-brand-800 to-brand-600 rounded-[32px] p-8 text-white shadow-xl dark:shadow-slate-950/20">
          <div className="absolute right-[-10%] bottom-[-50%] w-[350px] aspect-square rounded-full bg-brand-400/20 blur-[60px] pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <span className="text-brand-200 text-sm font-semibold tracking-wider uppercase block mb-1">Student Area</span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Welcome back, {stats?.welcome_name}!</h1>
              <p className="mt-2 text-brand-100 text-sm max-w-xl">
                Track your mock exams, check performance indicators, and practice coding standards.
              </p>
            </div>
            {stats?.active_attempt_id && (
              <Link
                to={`/student/test-attempt/${stats.active_attempt_id}`}
                className="inline-flex items-center justify-center px-6 py-4 bg-yellow-500 hover:bg-yellow-600 text-slate-900 font-bold rounded-2xl shadow-lg shadow-yellow-500/20 hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
              >
                <Sparkles className="mr-2 h-5 w-5 fill-current" /> Resume Active Test
              </Link>
            )}
          </div>
        </div>

        {/* Profile incomplete warning and stats */}
        {!stats?.has_skills && (
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <strong className="text-sm font-bold block">Complete Your Student Profile!</strong>
                <span className="text-xs text-slate-500 dark:text-slate-400">Add technical skills to unlock custom learning badges and push your completion meter to 100%.</span>
              </div>
            </div>
            <button
              onClick={() => setShowSkillsModal(true)}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-md shadow-amber-500/20 transition-all duration-200 self-start sm:self-center"
            >
              Add Skills Now
            </button>
          </div>
        )}

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Profile completion card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Profile Status</span>
              <User className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.profile_completion_percentage}%</span>
              <span className="text-xs text-slate-400 block mt-1">Profile Completion Meter</span>
              <div className="w-full bg-slate-100 dark:bg-slate-700 h-2 rounded-full mt-3 overflow-hidden mb-4">
                <div 
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats?.profile_completion_percentage}%` }}
                ></div>
              </div>
              <button 
                onClick={() => setShowSkillsModal(true)}
                className="w-full py-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-brand-600 dark:text-brand-400 font-bold rounded-xl text-xs transition-colors"
              >
                Update Skills
              </button>
            </div>
          </div>

          {/* Completed Tests */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Exam History</span>
              <CheckCircle className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.completed_tests_count}</span>
              <span className="text-xs text-slate-400 block mt-1">Mock Exams Completed</span>
              <span className="text-[10px] text-emerald-500 font-semibold block mt-3">Graded immediately on submission</span>
            </div>
          </div>

          {/* Average Score */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Performance Index</span>
              <Award className="h-5 w-5 text-indigo-500" />
            </div>
            <div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">{stats?.average_score}%</span>
              <span className="text-xs text-slate-400 block mt-1">Average Percentage Score</span>
              <span className="text-[10px] text-indigo-500 font-semibold block mt-3">Calculated across all finished exams</span>
            </div>
          </div>
        </div>

        {/* Live Mock Tests Grid */}
        <div className="space-y-6">

          {tests.filter(t => t.is_recommended).length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Show ONLY recommended tests based on skills, up to 6 total */}
              {tests.filter(t => t.is_recommended).slice(0, 6).map((test) => (
                <div 
                  key={test.id} 
                  className={`bg-white dark:bg-slate-800 rounded-3xl p-6 border ${test.is_recommended ? 'border-amber-400/50 shadow-amber-500/10' : 'border-slate-200/60 dark:border-slate-800'} hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                        {test.topic_name || "General"}
                      </span>
                      {test.is_recommended && (
                        <span className="flex items-center text-[10px] font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2.5 py-1 rounded-full">
                          ★ Recommended
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{test.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{test.description}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
                      <span className="flex items-center"><Clock className="h-4 w-4 mr-1 text-slate-400" /> {test.duration_minutes} Mins</span>
                      <span className="flex items-center"><FileText className="h-4 w-4 mr-1 text-slate-400" /> {test.question_count} Qs</span>
                      <span className="flex items-center"><Award className="h-4 w-4 mr-1 text-slate-400" /> {test.total_marks} Marks</span>
                    </div>
                    <Link 
                      to={`/student/test-attempt-start/${test.id}`}
                      className="w-full inline-flex items-center justify-center py-3 px-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md shadow-brand-500/10 transition-all duration-200 text-sm"
                    >
                      <Play className="h-4.5 w-4.5 mr-2 fill-current" /> Start Test
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
              <p className="text-slate-400 dark:text-slate-500 font-semibold">No mock tests currently match your registered skills.</p>
              <p className="text-xs text-slate-400 mt-2">Update your skills profile or visit the full Mock Tests page to browse all exams.</p>
            </div>
          )}
        </div>

        {/* Recent Attempts and Popular Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Recent Attempts */}
          <div className="lg:col-span-8 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
              My Recent Test Submissions
            </h2>
            
            {stats?.recent_attempts && stats.recent_attempts.length > 0 ? (
              <div className="space-y-4">
                {stats.recent_attempts.map((attempt) => (
                  <div 
                    key={attempt.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{attempt.mock_test_title}</h4>
                      <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                        <span>Attempt #{attempt.id}</span>
                        <span>•</span>
                        <span>{new Date(attempt.start_time).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {attempt.result ? (
                        <div className="text-right">
                          <span className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                            attempt.result.is_passed 
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                              : 'bg-red-500/10 text-red-600 dark:text-red-400'
                          }`}>
                            {attempt.result.is_passed ? 'PASSED' : 'FAILED'}
                          </span>
                          <span className="block text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                            {attempt.result.score} Marks ({attempt.result.percentage}%)
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs font-bold text-amber-500">IN PROGRESS</span>
                      )}
                      
                      {attempt.status === 'submitted' && (
                        <Link 
                          to={`/student/test-results/${attempt.id}`}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-750 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          <RotateCcw className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-400 dark:text-slate-500 font-semibold">You have not attempted any tests yet. Click start on any exam above!</p>
              </div>
            )}
          </div>

          {/* Popular Topics card */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-4">
              Explore Topics
            </h2>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-4">
              {stats?.popular_topics && stats.popular_topics.map((top) => (
                <div 
                  key={top.id}
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors cursor-pointer"
                  onClick={() => navigate('/student/tests')}
                >
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{top.name}</span>
                  <span className="text-xs text-slate-400">View Tests</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Skills Selection Modal Popup */}
      {showSkillsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative animate-scale-up">
            
            <div className="text-center mb-6">
              <span className="inline-flex p-3 rounded-full bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 mb-3">
                <Sparkles className="h-8 w-8" />
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">Your Skill Profile</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Review and update your skills to get personalized test recommendations tailored to your learning goals.
              </p>
            </div>

            {/* Badges Selection Grid */}
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {availableSkillsList.map((skill) => {
                const isSelected = selectedSkills.includes(skill);
                return (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isSelected
                        ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-[1.04]'
                        : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Modal Controls */}
            <div className="grid grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-700/50 pt-6">
              <button
                onClick={handleSkipSkills}
                className="w-full py-3.5 text-center text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-500 dark:text-slate-400 rounded-2xl transition-all duration-200"
              >
                Skip for Now
              </button>
              <button
                onClick={handleSaveSkills}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/20 transition-all duration-200 text-sm"
              >
                Save & Finish
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;
