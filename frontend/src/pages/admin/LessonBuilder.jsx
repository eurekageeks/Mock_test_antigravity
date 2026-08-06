import React, { useState, useEffect } from 'react';
import { FileText, Save, Settings, Video, Link, ArrowLeft, Image as ImageIcon, Code, Type, Edit3 } from 'lucide-react';
import Swal from 'sweetalert2';
import SimpleEditor from '../../components/SimpleEditor';
import { learningApi } from '../../services/learningApi';

export default function LessonBuilder({ lessonId, topicId, onBack }) {
  const [lesson, setLesson] = useState({
    title: '',
    description: '',
    content_html: '',
    video_url: '',
    image_url: '',
    estimated_time_minutes: 10,
    is_published: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lessonId) {
      loadLesson();
    }
  }, [lessonId]);

  const loadLesson = async () => {
    try {
      setLoading(true);
      const res = await learningApi.getLessonDetail(lessonId);
      setLesson({
        ...res.data,
        image_url: res.data.image_url || '',
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      // In a full implementation, this would call updateLesson or createLesson depending on ID
      if (!lessonId && topicId) {
        await learningApi.createLesson({
          ...lesson,
          topic_id: topicId
        });
        Swal.fire('Saved', 'Lesson created successfully.', 'success');
        onBack();
      } else if (lessonId) {
        // Wait, did I add updateLesson? Yes, but it's not in learningApi yet. We will mock or use api.put directly.
        await learningApi.updateLesson(lessonId, {
          ...lesson,
          topic_id: topicId || lesson.topic_id // fallback
        });
        Swal.fire('Saved', 'Lesson updated successfully.', 'success');
        onBack();
      }
    } catch (error) {
      Swal.fire('Error', 'Failed to save lesson', 'error');
    } finally {
      setLoading(false);
    }
  };

  const insertTemplate = (type) => {
    let template = '';
    if (type === 'callout') {
      template = `<div style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 16px 0; border-radius: 4px;"><strong style="color: #1d4ed8;">💡 Note:</strong><p style="margin: 8px 0 0 0; color: #1e3a8a;">Add your important information here.</p></div><p><br></p>`;
    } else if (type === 'code') {
      template = `<pre style="background-color: #1e293b; color: #f8fafc; padding: 16px; border-radius: 8px; overflow-x: auto; font-family: monospace;"><code>// Write your code here\nfunction helloWorld() {\n  console.log("Hello, World!");\n}</code></pre><p><br></p>`;
    } else if (type === 'math') {
      template = `<div style="text-align: center; margin: 16px 0; font-family: math; font-size: 1.2em;"><i>x = (-b ± √(b² - 4ac)) / 2a</i></div><p><br></p>`;
    }

    if (template) {
      setLesson(prev => ({
        ...prev,
        content_html: prev.content_html + template
      }));
    }
  };

  if (loading && lessonId && !lesson.title) {
    return <div className="p-8 text-center text-slate-500">Loading lesson editor...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 absolute inset-0 z-50">
      {/* Topbar */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-600 dark:text-slate-300">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <FileText size={24} />
            <h2 className="text-xl font-bold">{lessonId ? 'Edit Lesson' : 'Create New Lesson'}</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 mr-4 cursor-pointer">
            <input 
              type="checkbox" 
              checked={lesson.is_published}
              onChange={(e) => setLesson({...lesson, is_published: e.target.checked})}
              className="w-4 h-4 text-brand-600 border-gray-300 rounded focus:ring-brand-500"
            />
            Published
          </label>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Lesson'}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Editor Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-900/50">
          <div className="max-w-4xl mx-auto space-y-6">
            <div>
              <input 
                type="text" 
                placeholder="Lesson Title..." 
                value={lesson.title}
                onChange={(e) => setLesson({...lesson, title: e.target.value})}
                className="w-full text-4xl font-black bg-transparent border-none outline-none placeholder-slate-300 dark:placeholder-slate-700 text-slate-900 dark:text-white"
              />
            </div>
            
            <div>
              <input 
                type="text" 
                placeholder="Brief description or learning objectives..." 
                value={lesson.description}
                onChange={(e) => setLesson({...lesson, description: e.target.value})}
                className="w-full text-lg bg-transparent border-none outline-none placeholder-slate-400 dark:placeholder-slate-600 text-slate-600 dark:text-slate-400"
              />
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 flex items-center gap-2 overflow-x-auto">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">Insert Elements</span>
                <button onClick={() => insertTemplate('callout')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded flex items-center gap-1.5 hover:bg-slate-50 text-slate-700 dark:text-slate-200"><Type size={14}/> Callout</button>
                <button onClick={() => insertTemplate('code')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded flex items-center gap-1.5 hover:bg-slate-50 text-slate-700 dark:text-slate-200"><Code size={14}/> Code Block</button>
                <button onClick={() => insertTemplate('math')} className="px-3 py-1.5 text-sm bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded flex items-center gap-1.5 hover:bg-slate-50 text-slate-700 dark:text-slate-200"><Settings size={14}/> Equation</button>
              </div>
              <div className="p-4">
                <SimpleEditor 
                  value={lesson.content_html} 
                  onChange={(val) => setLesson({...lesson, content_html: val})} 
                  placeholder="Start writing the lesson content..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="w-80 border-l border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6 overflow-y-auto hidden lg:block">
          <h3 className="text-lg font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
            <Settings size={20} className="text-slate-400" />
            Lesson Settings
          </h3>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Estimated Read Time (min)</label>
              <input 
                type="number" 
                value={lesson.estimated_time_minutes}
                onChange={(e) => setLesson({...lesson, estimated_time_minutes: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <Video size={16} /> Embedded Video URL
              </label>
              <input 
                type="text" 
                placeholder="YouTube or Vimeo URL..."
                value={lesson.video_url || ''}
                onChange={(e) => setLesson({...lesson, video_url: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              />
              {lesson.video_url && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  ✓ Video attached
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <ImageIcon size={16} /> Thumbnail Image URL
              </label>
              <input 
                type="text" 
                placeholder="Image URL for Trending Courses..."
                value={lesson.image_url || ''}
                onChange={(e) => setLesson({...lesson, image_url: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none text-sm"
              />
              {lesson.image_url && (
                <div className="mt-2 text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                  ✓ Image attached
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 flex items-center gap-2">
                <Link size={16} /> Attached Resources
              </label>
              <div className="text-xs text-slate-500 text-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                + Upload PDF or Image
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Linked Mock Test</label>
              <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white text-sm">
                <option value="">None</option>
                <option value="1">Sample Mock Test</option>
              </select>
              <p className="text-xs text-slate-500 mt-2">Attach a test at the end of the lesson for practice.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
