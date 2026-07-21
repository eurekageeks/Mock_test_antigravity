import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { Clock, Award, FileText, Search, Play, BookOpen, Star, Zap, User } from 'lucide-react';

const StudentTests = () => {
  const [tests, setTests] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [hasSkills, setHasSkills] = useState(true);

  useEffect(() => {
    const loadFilterData = async () => {
      try {
        const [testsRes, topicsRes, profileRes] = await Promise.all([
          api.get('/api/student/tests'),
          api.get('/api/student/topics'),
          api.get('/api/student/profile')
        ]);
        setTests(testsRes.data);
        setTopics(topicsRes.data);
        setHasSkills(profileRes.data.skills && profileRes.data.skills.length > 0);
      } catch (err) {
        console.error("Failed to load test catalog:", err);
      } finally {
        setLoading(false);
      }
    };
    loadFilterData();
  }, []);

  const filteredTests = tests.filter((test) => {
    const matchesTopic = selectedTopic ? test.topic_id === parseInt(selectedTopic) : true;
    const matchesSearch = test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (test.description && test.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesTopic && matchesSearch;
  });

  const recommendedTests = filteredTests.filter(t => t.is_recommended);
  const otherTests = filteredTests.filter(t => !t.is_recommended);

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Practice Catalog...</p>
        </div>
      </div>
    );
  }

  const TestCard = ({ test, showBadge = false }) => (
    <div
      key={test.id}
      className={`relative bg-white dark:bg-slate-800 rounded-3xl p-6 border shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between ${
        showBadge
          ? 'border-amber-400/50 dark:border-amber-500/30 ring-1 ring-amber-400/20'
          : 'border-slate-200/60 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50'
      }`}
    >
      {showBadge && (
        <div className="absolute -top-3 left-5 flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 text-white text-[10px] font-black rounded-full shadow-md shadow-amber-400/30 uppercase tracking-wider">
          <Star className="h-3 w-3 fill-current" />
          <span>Recommended for You</span>
        </div>
      )}
      <div className={showBadge ? 'mt-2' : ''}>
        <span className="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 mb-4">
          {test.topic_name || "General"}
        </span>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">{test.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{test.description}</p>
      </div>
      <div>
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
          <span className="flex items-center"><Clock className="h-4 w-4 mr-1 text-slate-400" /> {test.duration_minutes} Mins</span>
          <span className="flex items-center"><FileText className="h-4 w-4 mr-1 text-slate-400" /> {test.question_count} Qs</span>
          <span className="flex items-center"><Award className="h-4 w-4 mr-1 text-slate-400" /> {test.total_marks} Marks</span>
        </div>
        <Link
          to={`/student/test-attempt-start/${test.id}`}
          className={`w-full inline-flex items-center justify-center py-3 px-4 font-bold rounded-2xl shadow-md transition-all duration-200 text-sm ${
            showBadge
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20'
              : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/10'
          }`}
        >
          <Play className="h-4 w-4 mr-2 fill-current" /> Start Test
        </Link>
      </div>
    </div>
  );

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">

        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Mock Test Catalog</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {hasSkills
              ? 'Tests marked ⭐ are matched to your skill profile for targeted practice.'
              : 'Browse all available tests. Add skills to your profile to see personalized recommendations.'}
          </p>
        </div>

        {/* No-skills tip */}
        {!hasSkills && (
          <div className="flex items-center gap-4 p-4 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl">
            <div className="p-2 bg-amber-400/20 rounded-xl shrink-0">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-400">Unlock Personalized Recommendations</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5">Add your skills to your profile to see tests tailored to your learning goals.</p>
            </div>
            <Link
              to="/student/profile"
              className="shrink-0 flex items-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl text-xs transition-colors"
            >
              <User className="h-3.5 w-3.5 mr-1.5" /> Update Profile
            </Link>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-white dark:bg-slate-800 p-4 rounded-[24px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
          <div className="relative md:col-span-6">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
              <Search className="h-5 w-5" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
              placeholder="Search by test title or description..."
            />
          </div>
          <div className="relative md:col-span-4">
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium dark:bg-slate-800"
            >
              <option value="">All Topics</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2 flex items-center justify-center bg-slate-50 dark:bg-slate-900 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400">
            {filteredTests.length} Exam(s) found
          </div>
        </div>

        {filteredTests.length > 0 ? (
          <div className="space-y-10">
            {/* Recommended Section */}
            {recommendedTests.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Star className="h-5 w-5 text-amber-400 fill-current" />
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">Recommended for You</h2>
                  <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 rounded-full">
                    {recommendedTests.length} match{recommendedTests.length !== 1 ? 'es' : ''} your skills
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recommendedTests.map(test => (
                    <TestCard key={test.id} test={test} showBadge={true} />
                  ))}
                </div>
              </div>
            )}

            {/* All / Other Tests */}
            {otherTests.length > 0 && (
              <div className="space-y-4">
                {recommendedTests.length > 0 && (
                  <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">All Other Tests</h2>
                )}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {otherTests.map(test => (
                    <TestCard key={test.id} test={test} showBadge={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-[32px] border border-slate-200/50 dark:border-slate-750 shadow-sm max-w-md mx-auto">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Tests Match</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">We couldn't find any exams matching your keywords or topic selection. Try adjusting filters.</p>
            <button
              onClick={() => { setSelectedTopic(''); setSearchQuery(''); }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default StudentTests;
