import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { learningApi } from '../../services/learningApi';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeft, CheckCircle, Clock, Video, BookOpen, BrainCircuit, ArrowRight } from 'lucide-react';
import Swal from 'sweetalert2';

export default function LessonViewer() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeSpent, setTimeSpent] = useState(0);

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await learningApi.getLessonDetail(lessonId);
        setLesson(res.data);
      } catch (error) {
        console.error(error);
        Swal.fire('Error', 'Lesson not found', 'error');
        navigate('/student/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, navigate]);

  // Track time spent
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleMarkComplete = async () => {
    if (!user) {
      Swal.fire({
        title: 'Sign Up to Track Progress',
        text: 'Create a free account to track your learning progress across the entire platform!',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sign Up',
        cancelButtonText: 'Maybe Later'
      }).then((result) => {
        if (result.isConfirmed) {
          navigate('/login');
        }
      });
      return;
    }
    
    try {
      await learningApi.markLessonComplete(lessonId, timeSpent);
      Swal.fire({
        title: 'Awesome!',
        text: 'You have completed this lesson. Keep up the great work!',
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire('Error', 'Could not save progress', 'error');
    }
  };

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  const handleAskAI = async (prompt) => {
    if (!user) {
      setChatMessages(prev => [...prev, { role: 'ai', content: '🔒 Please log in or create an account to use the AI Personal Tutor.' }]);
      return;
    }
    
    setChatOpen(true);
    const newMsg = { role: 'user', content: prompt };
    setChatMessages(prev => [...prev, newMsg]);
    setIsAiTyping(true);

    try {
      const res = await learningApi.askAITutor(lessonId, prompt);
      setChatMessages(prev => [...prev, { role: 'ai', content: res.data.response }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'ai', content: 'Sorry, I am having trouble connecting to my neural network right now.' }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const submitChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const prompt = chatInput;
    setChatInput('');
    handleAskAI(prompt);
  };

  const openAITutor = () => {
    if (!user) {
      Swal.fire({
        title: 'AI Personal Tutor',
        text: 'Sign up to ask our AI mentor any questions you have about this lesson!',
        icon: 'info',
        showCancelButton: true,
        confirmButtonText: 'Sign Up'
      }).then(res => {
        if (res.isConfirmed) navigate('/login');
      });
      return;
    }
    
    setChatOpen(true);
    if (chatMessages.length === 0) {
      setChatMessages([
        { role: 'ai', content: `Hi! I am your AI Mentor. How can I help you with "${lesson?.title || 'this lesson'}"?` }
      ]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!lesson) return null;

  // Extract YouTube ID if possible to use embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const embedUrl = getEmbedUrl(lesson.video_url);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-yellow-200 dark:bg-yellow-900 pb-20 relative">
      {/* Sticky Header */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="container mx-auto px-6 max-w-5xl py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft size={18} className="text-slate-700 dark:text-slate-300"/>
            </button>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">{lesson.title}</h1>
              <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1"><Clock size={12}/> {lesson.estimated_time_minutes} min read</span>
                {lesson.video_url && <span className="flex items-center gap-1"><Video size={12}/> Video included</span>}
              </div>
            </div>
          </div>
          
          <button onClick={handleMarkComplete} className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition-all hover:shadow-md">
            <CheckCircle size={18} /> Mark Complete
          </button>
        </div>
      </div>

      <div className="container mx-auto px-6 max-w-4xl py-12">
        {/* Description */}
        {lesson.description && (
          <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-10 border-l-4 border-brand-500 pl-6 py-1">
            {lesson.description}
          </p>
        )}

        {/* Video Player */}
        {embedUrl && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-700 bg-black aspect-video relative">
            <iframe 
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              title="Lesson Video"
            ></iframe>
          </div>
        )}

        {/* Rich HTML Content */}
        {lesson.content_html && (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 md:p-12 shadow-sm border border-slate-200 dark:border-slate-700">
            <div 
              className="prose prose-slate dark:prose-invert prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: lesson.content_html.replace(/&nbsp;/g, ' ') }}
            />
          </div>
        )}
      </div>

      {/* Floating AI Button */}
      {!chatOpen && (
        <button 
          onClick={openAITutor}
          className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-full shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center gap-3 group z-50 transform hover:-translate-y-1"
        >
          <BrainCircuit size={24} className="group-hover:animate-pulse" />
          <span className="font-bold hidden md:block">Ask AI Tutor</span>
        </button>
      )}

      {/* AI Chat Widget */}
      {chatOpen && (
        <div className="fixed bottom-8 right-8 w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[500px] z-50 transition-all">
          <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BrainCircuit size={20} />
              <span className="font-bold">AI Mentor</span>
            </div>
            <button onClick={() => setChatOpen(false)} className="text-white/80 hover:text-white p-1">
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900/50">
            {chatMessages.length === 1 && (
              <div className="space-y-2 mb-6">
                <button onClick={() => handleAskAI("Explain this to me like I'm a beginner")} className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 text-sm font-medium text-slate-700 dark:text-slate-300">🤔 Explain like I'm a beginner</button>
                <button onClick={() => handleAskAI("Generate 3 practice questions for this topic")} className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 text-sm font-medium text-slate-700 dark:text-slate-300">📝 Generate practice questions</button>
                <button onClick={() => handleAskAI("Summarize the key takeaways")} className="w-full text-left p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-brand-500 text-sm font-medium text-slate-700 dark:text-slate-300">⚡ Summarize key takeaways</button>
              </div>
            )}
            
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-br-none' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-bl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isAiTyping && (
              <div className="flex justify-start">
                <div className="max-w-[85%] p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-bl-none flex items-center gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={submitChat} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex gap-2">
            <input 
              type="text" 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 bg-slate-100 dark:bg-slate-900 border-none rounded-full text-sm outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button type="submit" disabled={isAiTyping || !chatInput.trim()} className="p-2 bg-brand-600 text-white rounded-full disabled:opacity-50">
              <ArrowRight size={18} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
