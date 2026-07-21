import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  FileText, Plus, Edit3, Trash2, BookOpen, Clock, 
  Award, ShieldAlert, Check, X, Eye, HelpCircle, Save 
} from 'lucide-react';

const MockTestManagement = () => {
  const [tests, setTests] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form trigger states
  const [showFormModal, setShowFormModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(null);
  const [editingTest, setEditingTest] = useState(null);

  // Form Fields
  const [topicId, setTopicId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [passingMarks, setPassingMarks] = useState(15.0);
  const [totalMarks, setTotalMarks] = useState(30.0);
  const [instructions, setInstructions] = useState('');
  const [status, setStatus] = useState('draft');

  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCatalog = async () => {
    try {
      const [testsRes, topicsRes] = await Promise.all([
        api.get('/api/admin/tests'),
        api.get('/api/admin/topics')
      ]);
      setTests(testsRes.data);
      setTopics(topicsRes.data);
      if (topicsRes.data.length > 0 && !topicId) {
        setTopicId(topicsRes.data[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load test metrics catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, []);

  const openCreateModal = () => {
    setEditingTest(null);
    setTitle('');
    setDescription('');
    setDurationMinutes(30);
    setPassingMarks(15);
    setTotalMarks(30);
    setInstructions('');
    setStatus('draft');
    if (topics.length > 0) setTopicId(topics[0].id.toString());
    setShowFormModal(true);
  };

  const openEditModal = (test) => {
    setEditingTest(test);
    setTopicId(test.topic_id.toString());
    setTitle(test.title);
    setDescription(test.description || '');
    setDurationMinutes(test.duration_minutes);
    setPassingMarks(test.passing_marks);
    setTotalMarks(test.total_marks);
    setInstructions(test.instructions || '');
    setStatus(test.status);
    setShowFormModal(true);
  };

  const handleCreateOrUpdateTest = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    const payload = {
      topic_id: parseInt(topicId),
      title,
      description,
      duration_minutes: parseInt(durationMinutes),
      passing_marks: parseFloat(passingMarks),
      total_marks: parseFloat(totalMarks),
      instructions,
      status
    };

    try {
      if (editingTest) {
        await api.put(`/api/admin/tests/${editingTest.id}`, payload);
        setMessage({ text: "Mock test details updated successfully!", type: 'success' });
      } else {
        await api.post('/api/admin/tests', payload);
        setMessage({ text: "New mock test added successfully!", type: 'success' });
      }
      setShowFormModal(false);
      fetchCatalog();
    } catch (err) {
      console.error("Failed to save mock test:", err);
      setMessage({ text: "Failed to save mock test configuration.", type: 'error' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleTogglePublish = async (test) => {
    setMessage({ text: '', type: '' });
    const action = test.status === 'published' ? 'unpublish' : 'publish';
    try {
      await api.put(`/api/admin/tests/${test.id}/${action}`);
      setMessage({ text: `Mock test ${test.status === 'published' ? 'unpublished' : 'published'} successfully!`, type: 'success' });
      fetchCatalog();
    } catch (err) {
      console.error("Failed to toggle publish:", err);
      setMessage({ text: "Failed to update publish settings.", type: 'error' });
    }
  };

  const handleDeleteTest = async (id) => {
    if (!window.confirm("Are you sure you want to delete this mock test? This deletes all associated questions and attempts. This cannot be undone.")) return;
    setMessage({ text: '', type: '' });
    try {
      await api.delete(`/api/admin/tests/${id}`);
      setMessage({ text: "Mock test deleted successfully.", type: 'success' });
      fetchCatalog();
    } catch (err) {
      console.error("Failed to delete mock test:", err);
      setMessage({ text: "Failed to delete mock test.", type: 'error' });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Mock Test Configuration</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">CRUD mock tests, configure passing criteria, toggle active publishing, and manage question sheets.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs self-start"
          >
            <Plus className="h-4.5 w-4.5 mr-2" /> Add Mock Test
          </button>
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

        {/* Catalog list */}
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : tests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tests.map((test) => (
              <div 
                key={test.id} 
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 hover:border-brand-500/30 dark:hover:border-brand-500/30 shadow-sm hover:shadow-lg transition-all duration-350 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400">
                      {test.topic_name || "General"}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      test.status === 'published' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-350'
                    }`}>
                      {test.status}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">{test.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">{test.description}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
                    <span className="flex items-center"><Clock className="h-4 w-4 mr-1 text-slate-400" /> {test.duration_minutes} Min</span>
                    <span className="flex items-center"><BookOpen className="h-4 w-4 mr-1 text-slate-400" /> {test.question_count} Qs</span>
                    <span className="flex items-center"><Award className="h-4 w-4 mr-1 text-slate-400" /> {test.total_marks} Marks</span>
                  </div>
                  
                  {/* Action row controls */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-750/30">
                    <Link
                      to={`/admin/tests/${test.id}/questions`}
                      className="w-full inline-flex items-center justify-center py-2.5 px-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      Questions
                    </Link>
                    
                    <div className="flex items-center space-x-1.5 justify-end">
                      <button
                        onClick={() => setShowPreviewModal(test)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Preview instructions"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleTogglePublish(test)}
                        className={`p-2 rounded-xl border transition-colors ${
                          test.status === 'published'
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                            : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                        }`}
                        title={test.status === 'published' ? 'Unpublish Test' : 'Publish Test'}
                      >
                        {test.status === 'published' ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                      </button>

                      <button
                        onClick={() => openEditModal(test)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Edit test options"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => handleDeleteTest(test.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete mock test"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700 max-w-md mx-auto">
            <BookOpen className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Tests Configured</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Create your first mock test exam details using the button in top right.</p>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md"
            >
              Add Mock Test
            </button>
          </div>
        )}

      </div>

      {/* CRUD Mock Test Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-2xl rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {editingTest ? 'Edit Mock Test' : 'Create Mock Test'}
              </h3>
              <button 
                onClick={() => setShowFormModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateTest} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Test Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                    placeholder="e.g. Kotlin Basics Assessment"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic Category</label>
                  <select
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium dark:bg-slate-800"
                  >
                    {topics.map((t) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                  placeholder="e.g. Test baseline loops, ranges, and object-oriented syntax."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Duration (Minutes)</label>
                  <input
                    type="number"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Total Marks</label>
                  <input
                    type="number"
                    required
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-355 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Passing Marks</label>
                  <input
                    type="number"
                    required
                    value={passingMarks}
                    onChange={(e) => setPassingMarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-355 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Instructions</label>
                  <textarea
                    rows={4}
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                    placeholder="Enter guidelines to display before exam starts..."
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium dark:bg-slate-800"
                  >
                    <option value="draft">Draft (Invisible to Students)</option>
                    <option value="published">Published (Instantly Available)</option>
                  </select>
                </div>
              </div>

              {/* Modal footer controls */}
              <div className="border-t border-slate-100 dark:border-slate-700/50 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-6 py-3.5 border border-slate-300 dark:border-slate-700 text-sm font-semibold rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/15 transition-all duration-200 text-sm flex items-center"
                >
                  <Save className="h-4.5 w-4.5 mr-2" /> {submitting ? 'Saving...' : editingTest ? 'Update Test' : 'Create Test'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Preview Instructions Modal */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 w-full max-w-lg rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative animate-scale-up">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-6">
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">Mock Test Guidelines Preview</h3>
              <button 
                onClick={() => setShowPreviewModal(null)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white text-base">{showPreviewModal.title}</h4>
                <p className="text-xs text-slate-400 mt-1">Status: <span className="font-bold text-brand-500 uppercase">{showPreviewModal.status}</span></p>
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Guidelines Block:</span>
                {showPreviewModal.instructions ? (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/40 dark:border-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
                    {showPreviewModal.instructions}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No custom guidelines written. Default instructions will show for students.</p>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-700/50 pt-6 mt-6 flex justify-end">
              <button
                onClick={() => setShowPreviewModal(null)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-850 dark:text-slate-200 font-bold rounded-2xl text-xs transition-colors"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default MockTestManagement;
