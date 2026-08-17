import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, BookOpen, Layers, FileText, ChevronRight } from 'lucide-react';
import { learningApi } from '../services/learningApi';
import 'react-quill-new/dist/quill.snow.css';

export default function PublicCatalog() {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedTopicId, setSelectedTopicId] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState(null);
  
  const [lessonDetail, setLessonDetail] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [showQA, setShowQA] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showMockTestTopics, setShowMockTestTopics] = useState(false);

  useEffect(() => {
    loadCatalog();
  }, []);

  const loadCatalog = async () => {
    try {
      setLoading(true);
      const res = await learningApi.getCatalog();
      const fetchedCatalog = res.data || [];
      setCatalog(fetchedCatalog);
      
      // Auto-select first topic and its first lesson if available
      if (fetchedCatalog.length > 0) {
        setSelectedTopicId(fetchedCatalog[0].id);
        if (fetchedCatalog[0].lessons && fetchedCatalog[0].lessons.length > 0) {
          setSelectedLessonId(fetchedCatalog[0].lessons[0].id);
        }
      }
    } catch (err) {
      console.error("Failed to load catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch lesson content whenever selectedLessonId changes
  useEffect(() => {
    const fetchLesson = async () => {
      setShowQA(false);
      if (!selectedLessonId) {
        setLessonDetail(null);
        return;
      }
      try {
        setLoadingLesson(true);
        const res = await learningApi.getLessonDetail(selectedLessonId);
        setLessonDetail(res.data);
      } catch (err) {
        console.error("Failed to fetch lesson detail:", err);
      } finally {
        setLoadingLesson(false);
      }
    };
    fetchLesson();
  }, [selectedLessonId]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6 bg-white flex justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const selectedTopic = catalog.find(t => t.id === selectedTopicId);
  const lessons = selectedTopic?.lessons || [];

  return (
    <div className="min-h-screen pt-16 bg-white text-slate-900 font-sans flex flex-col">
      
      {/* ─── TOP NAVBAR (Topics) ─── */}
      <div className="bg-black text-white overflow-x-auto whitespace-nowrap scrollbar-hide sticky top-16 z-40">
        <div className="flex items-center">
          {catalog.filter(t => t.lessons && t.lessons.length > 0).map(topic => (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedTopicId(topic.id);
                // Auto select first lesson of the newly selected topic
                if (topic.lessons && topic.lessons.length > 0) {
                  setSelectedLessonId(topic.lessons[0].id);
                } else {
                  setSelectedLessonId(null);
                }
                setSidebarOpen(true); // Open sidebar on mobile when topic changes
              }}
              className={`px-6 py-3 font-bold text-sm tracking-wide transition-colors ${
                selectedTopicId === topic.id 
                  ? 'bg-[#0ea5e9] text-white' 
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {topic.name.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Mobile Sidebar Toggle Button */}
        <button 
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-[#0ea5e9] text-white p-4 rounded-full shadow-2xl"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* ─── LEFT SIDEBAR (All Topics & Lessons) ─── */}
        <div className={`
          absolute lg:static inset-y-0 left-0 z-30
          w-72 bg-[#E7E9EB] border-r border-slate-200 overflow-y-auto
          transform transition-transform duration-300 ease-in-out pb-20 custom-scrollbar
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="py-4">
            {catalog.length === 0 ? (
              <div className="px-4 py-4 text-sm text-slate-500 italic">
                No topics available yet.
              </div>
            ) : (
              catalog
                .filter(t => t.lessons && t.lessons.length > 0 && t.id === selectedTopicId)
                .map(topic => (
                  <div key={`sidebar-topic-${topic.id}`} className="mb-6">
                  <h3 className="font-bold text-lg text-slate-800 mb-2 px-4 uppercase tracking-tight">
                    {topic.name} Tutorial
                  </h3>
                  
                  <div className="flex flex-col">
                    {(!topic.lessons || topic.lessons.length === 0) ? (
                      <div className="px-4 py-2 text-sm text-slate-500 italic">
                        No lessons added yet.
                      </div>
                    ) : (
                      topic.lessons.map(lesson => (
                        <button
                          key={`sidebar-lesson-${lesson.id}`}
                          onClick={() => {
                            setSelectedTopicId(topic.id);
                            setSelectedLessonId(lesson.id);
                            setSidebarOpen(false); // Close sidebar on mobile after selection
                          }}
                          className={`w-full text-left px-4 py-1.5 text-[15px] transition-colors ${
                            selectedLessonId === lesson.id 
                              ? 'bg-[#0ea5e9] text-white font-bold' 
                              : 'text-slate-700 hover:bg-slate-300 hover:text-black'
                          }`}
                        >
                          {lesson.title}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* ─── MAIN CONTENT ─── */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-4xl mx-auto p-6 md:p-10 pb-32">
            
            {loadingLesson ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0ea5e9]"></div>
              </div>
            ) : lessonDetail ? (
              <div className="w3-content-wrapper">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
                  <h1 className="text-4xl font-normal text-slate-900">
                    {lessonDetail.title}
                  </h1>
                  
                  {lessonDetail.qa_button_text && (
                    <div className="bg-sky-50 rounded-lg p-3 border border-sky-100 shadow-sm min-w-[200px] text-center shrink-0">
                      <p className="font-bold text-xs text-sky-800 mb-2 uppercase tracking-wide">Interview Preparation</p>
                      <button 
                        onClick={() => setShowQA(!showQA)}
                        className="w-full py-2 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded font-bold text-sm transition-colors shadow-md"
                      >
                        {showQA ? 'Back to Lesson Content' : lessonDetail.qa_button_text}
                      </button>
                    </div>
                  )}
                </div>

                
                {lessonDetail.description && (
                  <div className="text-lg text-slate-700 mb-8 leading-relaxed">
                    {lessonDetail.description}
                  </div>
                )}

                {/* Rich Text / QA Content */}
                {showQA ? (
                  lessonDetail.qa_content_html ? (
                    <div className="ql-container ql-snow border-0">
                      <div 
                        className="ql-editor text-slate-700 text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: lessonDetail.qa_content_html.replace(/&nbsp;/g, ' ') }}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#E7E9EB] p-6 rounded-lg text-slate-600">
                      This lesson does not contain any Q&A content yet.
                    </div>
                  )
                ) : (
                  lessonDetail.content_html ? (
                    <div className="ql-container ql-snow border-0">
                      <div 
                        className="ql-editor text-slate-700 text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: lessonDetail.content_html.replace(/&nbsp;/g, ' ') }}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#E7E9EB] p-6 rounded-lg text-slate-600">
                      This lesson does not contain any text content yet.
                    </div>
                  )
                )}

                {/* Video Content */}
                {lessonDetail.video_url && (
                  <div className="mt-12">
                    <h3 className="text-2xl mb-4">Video Tutorial</h3>
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden shadow-lg">
                      <iframe
                        src={(() => {
                          const url = lessonDetail.video_url;
                          try {
                            if (url.includes('youtube.com/watch')) {
                              const urlObj = new URL(url);
                              const videoId = urlObj.searchParams.get('v');
                              if (videoId) return `https://www.youtube.com/embed/${videoId}`;
                            } else if (url.includes('youtu.be/')) {
                              const videoId = url.split('youtu.be/')[1].split('?')[0];
                              if (videoId) return `https://www.youtube.com/embed/${videoId}`;
                            }
                          } catch (e) {
                            // ignore
                          }
                          return url;
                        })()}
                        title="Video tutorial"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-16 flex justify-between items-center pt-8 border-t border-slate-200">
                  <button className="px-6 py-2 bg-[#0ea5e9] text-white hover:bg-[#059862] rounded font-bold transition-colors shadow-sm">
                    ❮ Previous
                  </button>
                  <button className="px-6 py-2 bg-[#0ea5e9] text-white hover:bg-[#059862] rounded font-bold transition-colors shadow-sm">
                    Next ❯
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-20">
                <BookOpen size={64} className="mx-auto text-slate-300 mb-4" />
                <h2 className="text-2xl text-slate-500">Select a lesson from the sidebar to begin</h2>
              </div>
            )}
            
          </div>
        </div>
        
        {/* ─── RIGHT SIDEBAR (Ads / Info - Hidden on smaller screens) ─── */}
        <div className="hidden xl:block w-72 bg-white border-l border-slate-200 p-6 overflow-y-auto">
          <div className="sticky top-6">
            
            <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest text-center mb-4">Advertisement</h4>
            
            <div className="bg-slate-100 rounded-lg p-4 text-center mb-6 border border-slate-200">
              <p className="font-bold text-sky-600 mb-2">Want to test your skills?</p>
              <p className="text-sm text-slate-600 mb-4">Take a full mock test and see where you stand.</p>
              {!showMockTestTopics ? (
                <button 
                  onClick={() => setShowMockTestTopics(true)}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white rounded font-bold text-sm transition-colors"
                >
                  Start Mock Test
                </button>
              ) : (
                <div className="text-left bg-white border border-slate-200 rounded p-2 max-h-48 overflow-y-auto">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-2">Select a Topic:</p>
                  {catalog.map(t => (
                    <button 
                      key={`mock-${t.id}`}
                      onClick={() => window.location.href = '/login'}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-sky-50 hover:text-sky-600 rounded transition-colors"
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="h-64 bg-slate-100 flex items-center justify-center text-slate-400 rounded border border-slate-200">
              Ad Space
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
