import React, { useState, useEffect } from 'react';
import { learningApi } from '../../services/learningApi';
import api from '../../services/api';
import { 
  BookOpen, Layers, FolderTree, FileText, Plus, ChevronRight, Save, Edit3, Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

import LessonBuilder from './LessonBuilder';

export default function LearningManagement() {
  const [topics, setTopics] = useState([]);
  const [lessons, setLessons] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState(null);

  const [editingLessonId, setEditingLessonId] = useState(null);
  const [isBuildingLesson, setIsBuildingLesson] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const res = await api.get('/api/admin/topics');
      setTopics(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadLevelData = async (level, id) => {
    try {
      if (level === 'topic') {
        const res = await learningApi.getLessons();
        setLessons(res.data.filter(l => l.topic_id === id));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async (level, parentId) => {
    if (level === 'Topic') {
      Swal.fire('Info', 'Please manage topics in the Mock Tests > Topics section.', 'info');
      return;
    }
  };

  const handleDelete = async (level, id) => {
    if (level === 'Lesson') {
      const { isConfirmed } = await Swal.fire({
        title: 'Delete Lesson?',
        text: 'Are you sure you want to delete this lesson?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
      });
      if (isConfirmed) {
        try {
          await learningApi.deleteLesson(id);
          loadLevelData('topic', selectedTopic);
          Swal.fire('Deleted!', 'Lesson has been deleted.', 'success');
        } catch (error) {
          Swal.fire('Error', 'Failed to delete lesson', 'error');
        }
      }
    }
  };

  if (isBuildingLesson) {
    return (
      <LessonBuilder 
        lessonId={editingLessonId} 
        topicId={selectedTopic} 
        onBack={() => {
          setIsBuildingLesson(false);
          setEditingLessonId(null);
          loadLevelData('topic', selectedTopic);
        }} 
      />
    );
  }

  const renderColumn = (title, items, selectedItem, onSelect, onAdd, parentId, emptyMsg, currentLevel) => (
    <div className="flex-[1] min-w-[320px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 flex flex-col h-[calc(100vh-180px)] shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-10 relative">
      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-50 dark:bg-brand-500/10 rounded-lg">
            {currentLevel === 'Topic' ? <Layers className="text-brand-600 dark:text-brand-400" size={18} /> : <FileText className="text-emerald-600 dark:text-emerald-400" size={18} />}
          </div>
          <h3 className="font-extrabold text-slate-800 dark:text-white text-base tracking-tight">{title}</h3>
        </div>
        <button 
          onClick={() => {
            if (currentLevel === 'Lesson') {
              setIsBuildingLesson(true);
            } else {
              onAdd(currentLevel, parentId);
            }
          }}
          disabled={currentLevel !== 'Topic' && !parentId}
          className="p-2 rounded-xl bg-slate-900 text-white dark:bg-brand-500 dark:text-white hover:bg-brand-600 hover:shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          title={`Add ${currentLevel}`}
        >
          <Plus size={16} strokeWidth={3} />
        </button>
      </div>
      
      <div className="p-3 overflow-y-auto flex-1 space-y-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-slate-400 dark:text-slate-500 space-y-3">
            <FolderTree size={32} className="opacity-20" />
            <p className="text-sm font-medium">{emptyMsg}</p>
          </div>
        ) : (
          items.map(item => (
            <div 
              key={item.id}
              onClick={() => onSelect(item.id)}
              className={`group flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all duration-300 border ${
                selectedItem === item.id 
                  ? 'bg-brand-50 border-brand-200 dark:bg-brand-500/20 dark:border-brand-500/30 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] scale-[1.02]' 
                  : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-200 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-4 flex-1 overflow-hidden">
                <div className={`p-2 rounded-lg transition-colors ${
                  selectedItem === item.id ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700'
                }`}>
                  {currentLevel === 'Lesson' ? (
                    <FileText size={16} className={selectedItem === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'} />
                  ) : (
                    <BookOpen size={16} className={selectedItem === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500'} />
                  )}
                </div>
                <div className="truncate pr-4">
                  <span className={`block text-sm font-bold truncate transition-colors ${
                    selectedItem === item.id ? 'text-brand-700 dark:text-brand-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                  }`}>
                    {item.title || item.name}
                  </span>
                  {currentLevel === 'Lesson' && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${item.is_published ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      {item.is_published ? 'Published' : 'Draft'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {currentLevel === 'Lesson' && (
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setEditingLessonId(item.id); setIsBuildingLesson(true); }}
                      className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleDelete(currentLevel, item.id); }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
                {currentLevel !== 'Lesson' && (
                  <ChevronRight size={18} className={`transition-transform duration-300 ${
                    selectedItem === item.id ? 'text-brand-500 translate-x-1' : 'text-slate-300 dark:text-slate-600'
                  }`} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="h-full bg-slate-50/50 dark:bg-slate-900/50 -mx-6 -mt-6 p-6 overflow-hidden">
      <div className="max-w-[1600px] mx-auto h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              Learning Curriculum
              <span className="px-3 py-1 bg-brand-100 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300 text-sm font-bold rounded-full border border-brand-200 dark:border-brand-500/30">
                Builder
              </span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">Manage your topics and lessons.</p>
          </div>
        </div>
        
        <div className="flex gap-1 h-full rounded-3xl overflow-hidden border border-slate-200/60 dark:border-slate-700/60 shadow-2xl bg-slate-100 dark:bg-slate-950 p-1">
          {renderColumn("Topics", topics, selectedTopic, (id) => { setSelectedTopic(id); loadLevelData('topic', id); }, handleCreate, null, "No topics found", "Topic")}
          
          <div className={`transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${selectedTopic ? 'flex-[1] opacity-100 translate-x-0' : 'flex-[0] opacity-0 translate-x-8 overflow-hidden'}`}>
            {renderColumn("Lessons", lessons, null, () => {}, handleCreate, selectedTopic, "Select a topic to view lessons", "Lesson")}
          </div>
        </div>
      </div>
    </div>
  );
}
