import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Layers, Plus, Edit3, Trash2, X, Check, Save } from 'lucide-react';

const TopicManagement = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [topicName, setTopicName] = useState('');
  const [topicDesc, setTopicDesc] = useState('');
  const [editingTopic, setEditingTopic] = useState(null);
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTopics = async () => {
    try {
      const res = await api.get('/api/admin/topics');
      setTopics(res.data);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopics();
  }, []);

  const handleCreateOrUpdateTopic = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ text: '', type: '' });

    try {
      if (editingTopic) {
        await api.put(`/api/admin/topics/${editingTopic.id}`, {
          name: topicName,
          description: topicDesc
        });
        setMessage({ text: "Topic details updated successfully!", type: 'success' });
      } else {
        await api.post('/api/admin/topics', {
          name: topicName,
          description: topicDesc
        });
        setMessage({ text: "New topic category added successfully!", type: 'success' });
      }
      
      // Reset Form
      setTopicName('');
      setTopicDesc('');
      setEditingTopic(null);
      fetchTopics();
    } catch (err) {
      console.error("Failed to save topic:", err);
      if (err.response && err.response.data && err.response.data.detail) {
        setMessage({ text: err.response.data.detail, type: 'error' });
      } else {
        setMessage({ text: "Failed to save topic category.", type: 'error' });
      }
    } finally {
      setSubmitting(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  const handleEditClick = (topic) => {
    setEditingTopic(topic);
    setTopicName(topic.name);
    setTopicDesc(topic.description || '');
  };

  const handleCancelEdit = () => {
    setEditingTopic(null);
    setTopicName('');
    setTopicDesc('');
  };

  const handleDeleteTopic = async (id) => {
    if (!window.confirm("Are you sure you want to delete this topic category? This deletes all associated mock tests and questions inside them. This cannot be undone.")) return;
    setMessage({ text: '', type: '' });
    try {
      await api.delete(`/api/admin/topics/${id}`);
      setMessage({ text: "Topic category deleted successfully.", type: 'success' });
      fetchTopics();
    } catch (err) {
      console.error("Failed to delete topic:", err);
      setMessage({ text: "Failed to delete topic category.", type: 'error' });
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Exam Topic Management</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Add, update, or remove exam topics from the platform catalog.</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: Add / Edit Topic Form (5 cols) */}
          <div className="lg:col-span-5 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 flex items-center">
              <Layers className="h-5 w-5 mr-2 text-brand-500" /> 
              {editingTopic ? 'Edit Topic Category' : 'Add Topic Category'}
            </h3>

            <form onSubmit={handleCreateOrUpdateTopic} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Topic Name</label>
                <input
                  type="text"
                  required
                  value={topicName}
                  onChange={(e) => setTopicName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                  placeholder="e.g. Python Programming"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={4}
                  value={topicDesc}
                  onChange={(e) => setTopicDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                  placeholder="Summarize topic coverage area..."
                />
              </div>

              <div className="flex gap-3 pt-2">
                {editingTopic && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="w-1/2 py-3.5 border border-slate-300 dark:border-slate-700 text-sm font-semibold rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitting}
                  className={`py-3.5 text-white font-bold rounded-2xl shadow-lg transition-all duration-200 text-sm flex items-center justify-center ${
                    editingTopic 
                      ? 'w-1/2 bg-brand-600 hover:bg-brand-700 shadow-brand-500/10' 
                      : 'w-full bg-brand-600 hover:bg-brand-700 shadow-brand-500/10'
                  }`}
                >
                  {editingTopic ? <Save className="h-4.5 w-4.5 mr-2" /> : <Plus className="h-4.5 w-4.5 mr-2" />}
                  {submitting ? 'Saving...' : editingTopic ? 'Update Topic' : 'Add Topic'}
                </button>
              </div>
            </form>
          </div>

          {/* RIGHT: Topics Table (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              Existing Domain Categories
            </h3>

            {loading ? (
              <div className="h-40 flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : topics.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {topics.map((t) => (
                  <div 
                    key={t.id}
                    className="p-5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-start justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-extrabold text-slate-900 dark:text-white text-base">{t.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">{t.description || "No description provided."}</p>
                    </div>
                    
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => handleEditClick(t)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-350 transition-colors"
                        title="Edit Topic"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTopic(t.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete Topic"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                <p className="text-slate-450 dark:text-slate-500 font-semibold">No topic categories created yet.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default TopicManagement;
