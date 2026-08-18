import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { learningApi } from '../services/learningApi';
import { useAuth } from '../context/AuthContext';
import { 
  Play, BookOpen, ShieldCheck, Cpu, Code, Activity, Users,
  Search, ArrowRight, Star, FileText, Award, Clock,
  GraduationCap, TrendingUp, Trophy, Target, Zap, ChevronRight,
  BookMarked, BrainCircuit, Building2, Layers, ChevronDown, CheckCircle, Lightbulb, MapPin, Phone, Mail, Check
} from 'lucide-react';

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [topics, setTopics] = useState([]);
  const [learningTopics, setLearningTopics] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFaq, setActiveFaq] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const heroImages = [
    "/hero_students.jpg",
    "/slider_exam.jpg",
    "/slider_dashboard.jpg"
  ];

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(sliderInterval);
  }, [heroImages.length]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [topRes, testRes, learningRes] = await Promise.all([
          api.get('/api/student/topics'),
          api.get('/api/student/tests'),
          learningApi.getCatalog()
        ]);
        setTopics(topRes.data || []);
        setTests(testRes.data || []);
        setLearningTopics(learningRes.data || []);
      } catch (err) {
        console.error("Failed to load topics/tests:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const faqs = [
    { q: "How do I prepare for the coding exam?", a: "Practice regularly with our curated coding problems and mock tests tailored for your exam." },
    { q: "Are the mock tests free?", a: "We offer both free mock tests and premium tests that come with detailed analytics." },
    { q: "What topics are covered in the exams?", a: "We cover a wide range of topics including Programming, DevOps, Cloud Computing, and Aptitude." },
    { q: "Can I access the platform on mobile?", a: "Yes, our platform is fully responsive and can be accessed on any mobile device." },
    { q: "Is there any support if I get stuck?", a: "Our AI Tutor and community forums are available 24/7 to help you with any doubts." }
  ];

  const toggleFaq = (index) => {
    if (activeFaq === index) {
      setActiveFaq(null);
    } else {
      setActiveFaq(index);
    }
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-900 font-sans">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-12 pb-20 lg:pt-16 lg:pb-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#EBF4FA] to-transparent z-0"></div>
        
        <div className="container relative z-10 mx-auto px-6 max-w-7xl">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            
            <div className="flex-1 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
                <SparklesIcon className="w-3 h-3" />
                Empowering Future Technologists
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight text-slate-900">
                Accelerate Your Exam &<br/>
                Interview Preparation with<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
                  A1TIExamPrism
                </span>
              </h1>
              
              <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                A premium, AI-ready full-stack mock testing platform to evaluate, grade, and sharpen your technical skills. Attempt real-time mock tests on programming, cloud computing, and DevOps.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
                <button 
                  onClick={() => navigate(user ? '/student/dashboard' : '/login')}
                  className="px-8 py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-full font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 w-full sm:w-auto"
                >
                  Get Started →
                </button>
                <button 
                  onClick={() => navigate('/catalog')}
                  className="px-8 py-4 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-full font-bold transition-all shadow-sm hover:shadow-md hover:-translate-y-1 w-full sm:w-auto"
                >
                  Explore Tests
                </button>
              </div>
            </div>
            
            <div className="flex-1 relative">
              <div className="absolute inset-0 bg-blue-200 blur-[100px] opacity-40 rounded-full"></div>
              <div className="relative z-10 w-full rounded-3xl shadow-2xl border-4 border-white aspect-[4/3] max-h-[500px] overflow-hidden group">
                {heroImages.map((img, idx) => (
                  <img 
                    key={idx}
                    src={img} 
                    alt={`Hero slide ${idx + 1}`} 
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${currentSlide === idx ? 'opacity-100' : 'opacity-0'}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800";
                    }}
                  />
                ))}
                
                {/* Slider Dots */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {heroImages.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentSlide(idx)}
                      className={`w-3 h-3 rounded-full transition-all ${currentSlide === idx ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── POPULAR MOCK TESTS ─── */}
      <section id="popular-mock-tests" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Popular Mock Tests</h2>
            <p className="text-slate-500">Explore our comprehensive curriculum tailored to your technical skills.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {loading ? (
              <div className="w-full text-center text-slate-400">Loading topics...</div>
            ) : topics.filter(t => tests.some(test => test.topics?.some(topic => topic.id === t.id) && test.status === 'published')).length > 0 ? (
              topics.filter(t => tests.some(test => test.topics?.some(topic => topic.id === t.id) && test.status === 'published')).map(topic => (
                <div 
                  key={`test-${topic.id}`}
                  onClick={() => navigate(user ? '/student/dashboard' : '/login')}
                  className="px-6 py-4 bg-emerald-100 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all flex flex-col items-center justify-center min-w-[200px] group"
                >
                  <h3 className="font-bold text-emerald-900 text-center group-hover:text-emerald-700">{topic.name}</h3>
                  <p className="text-xs text-emerald-600 text-center mt-2 line-clamp-1 max-w-[150px]">{topic.description || "Practice Questions"}</p>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-slate-400">No topics available.</div>
            )}
          </div>
        </div>
      </section>

      {/* ─── POPULAR INTERVIEW NOTES AND EXERCISES ─── */}
      <section className="py-20 bg-emerald-50 border-t border-slate-100">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Popular Interview Notes and Exercises</h2>
            <p className="text-slate-500">Master new concepts with our curated learning paths and video lessons.</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            {loading ? (
              <div className="w-full text-center text-slate-400">Loading learning paths...</div>
            ) : learningTopics.filter(t => t.lessons && t.lessons.length > 0).length > 0 ? (
              learningTopics.filter(t => t.lessons && t.lessons.length > 0).map(topic => (
                <div 
                  key={`learning-${topic.id}`}
                  onClick={() => navigate('/catalog')}
                  className="px-6 py-4 bg-emerald-100 rounded-xl border border-emerald-200 shadow-sm hover:shadow-md hover:border-emerald-500 cursor-pointer transition-all flex flex-col items-center justify-center min-w-[200px] group"
                >
                  <h3 className="font-bold text-emerald-900 text-center group-hover:text-emerald-700">{topic.name}</h3>
                  <p className="text-xs text-emerald-600 text-center mt-2 line-clamp-1 max-w-[150px]">{topic.description || "Interactive Lessons"}</p>
                </div>
              ))
            ) : (
              <div className="w-full text-center text-slate-400">No learning paths available.</div>
            )}
          </div>
        </div>
      </section>

      {/* ─── FEATURED PRACTICE EXAMS ─── */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Featured Practice Exams</h2>
            <p className="text-slate-500">Test your skills with our top mock exams across various domains.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center text-slate-400">Loading exams...</div>
            ) : tests.length > 0 ? (
              tests.slice(0, 6).map((test) => (
                <div 
                  key={test.id}
                  className="bg-emerald-100 rounded-2xl p-6 border border-emerald-200 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all flex flex-col group"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold border border-blue-100 uppercase tracking-wide">
                      {test.topics?.[0]?.name || "Assessment"}
                    </span>
                    <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-xs font-bold border border-amber-100">
                      {test.status === 'published' ? 'Active' : 'Draft'}
                    </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-2 line-clamp-2">{test.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 flex-1">
                    {test.description || "Evaluate your readiness with this comprehensive mock test."}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-6 pt-4 border-t border-slate-100">
                    <span className="flex items-center gap-1"><Clock size={14}/> {test.duration_minutes} mins</span>
                    <span className="flex items-center gap-1"><FileText size={14}/> {test.question_count || 0} Qs</span>
                    <span className="flex items-center gap-1"><Target size={14}/> {test.total_marks} Marks</span>
                  </div>
                  
                  <button 
                    onClick={() => navigate(user ? `/student/test/${test.id}/start` : '/login')}
                    className="w-full py-3 bg-slate-50 hover:bg-[#0284C7] text-slate-700 hover:text-white rounded-xl font-bold transition-colors border border-slate-200 hover:border-transparent text-sm"
                  >
                    Start Exam →
                  </button>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center text-slate-400">No exams available.</div>
            )}
          </div>
        </div>
      </section>

      {/* ─── WHY CHOOSE US ─── */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Why Choose A1TIExamPrism?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Our platform offers a robust and comprehensive environment tailored to your learning and test-taking needs.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Real-world Exam Environment</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Experience a true-to-life exam interface with strictly timed tests and anti-cheating mechanisms to fully prepare you for the actual test day.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-purple-50 text-purple-500 rounded-2xl flex items-center justify-center mb-6">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Comprehensive Test Formats</h3>
              <p className="text-slate-500 text-sm leading-relaxed">Engage with various question types ranging from multiple choice to subjective questions covering diverse topics efficiently and effectively.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-6">
                <Lightbulb size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Detailed Performance Analytics</h3>
              <p className="text-slate-500 text-sm leading-relaxed">After every test, get a comprehensive analysis of your performance to identify weak areas and track your growth over time easily.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section id="stats" className="py-16 bg-[#0B5C95] text-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-white/20">
            <div>
              <div className="text-4xl lg:text-5xl font-black mb-2">15,000+</div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Active Learners</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-black mb-2">50,000+</div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Mock Tests Attempted</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-black mb-2">99.8%</div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Success Rate</div>
            </div>
            <div>
              <div className="text-4xl lg:text-5xl font-black mb-2">200+</div>
              <div className="text-blue-200 text-sm font-semibold uppercase tracking-wider">Topics & Domains</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Trusted by Thousands of Students</h2>
            <p className="text-slate-500">Hear from our successful alumni who aced their exams using A1TIExamPrism.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative">
              <div className="flex text-amber-400 mb-4 gap-1">
                <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/>
              </div>
              <p className="text-slate-600 mb-8 italic">"The real-world exam environment on A1TIExamPrism was a game changer for me. It helped me overcome my exam anxiety and perform at my best."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">S</div>
                <div>
                  <h4 className="font-bold text-slate-900">Sarah Jenkins</h4>
                  <p className="text-xs text-slate-500">Placed at Microsoft</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative">
              <div className="flex text-amber-400 mb-4 gap-1">
                <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/>
              </div>
              <p className="text-slate-600 mb-8 italic">"The detailed performance analytics helped me pinpoint exactly what topics I needed to focus on. Highly recommended for comprehensive preparation!"</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xl">A</div>
                <div>
                  <h4 className="font-bold text-slate-900">Ankit Roy</h4>
                  <p className="text-xs text-slate-500">Software Engineer</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm relative">
              <div className="flex text-amber-400 mb-4 gap-1">
                <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/> <Star size={18} fill="currentColor"/>
              </div>
              <p className="text-slate-600 mb-8 italic">"A1TIExamPrism's coding interface is incredibly robust. Practicing mock tests here felt exactly like my actual technical interview."</p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">M</div>
                <div>
                  <h4 className="font-bold text-slate-900">Meera Iyer</h4>
                  <p className="text-xs text-slate-500">Full Stack Developer</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-slate-500">Find quick answers to common questions about our platform.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                <button 
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 bg-white hover:bg-slate-50 transition-colors text-left font-bold text-slate-800"
                >
                  {faq.q}
                  <ChevronDown className={`transform transition-transform ${activeFaq === idx ? 'rotate-180 text-[#0284C7]' : 'text-slate-400'}`} size={20} />
                </button>
                {activeFaq === idx && (
                  <div className="p-6 pt-0 bg-white text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTACT ─── */}
      <section id="contact" className="py-20 bg-[#F8FAFC]">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-100">
            
            {/* Contact Info (Blue Box) */}
            <div className="md:w-2/5 bg-[#0B5C95] p-12 text-white flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-black mb-4">Contact Info</h3>
                <p className="text-blue-100 mb-12 text-sm leading-relaxed">
                  Have questions or need assistance? Reach out to us using the details below. We are always here to help you succeed!
                </p>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <Mail className="text-blue-300 flex-shrink-0" size={20} />
                    <a href="mailto:a1training167@gmail.com" className="font-bold text-sm hover:underline">a1training167@gmail.com</a>
                  </div>
                  <div className="flex items-center gap-4">
                    <Phone className="text-blue-300 flex-shrink-0" size={20} />
                    <p className="font-bold text-sm">+91 83689 79712 / +91 63804 86914</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <MapPin className="mt-1 text-blue-300 flex-shrink-0" size={20} />
                    <div className="font-bold text-sm leading-relaxed">
                      C-167, Omicron 1, 6% Abadi, Greater Noida<br/>
                      Earthcon Sanskriti, Sector 1, Greater Noida West
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:w-3/5 p-12">
              <h3 className="text-2xl font-black text-slate-900 mb-8">Send Us a Message</h3>
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Name</label>
                  <input type="text" placeholder="Your full name" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                  <input type="email" placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Message</label>
                  <textarea placeholder="How can we help you?" rows="4" className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-[#0284C7] focus:border-transparent outline-none transition-all resize-none"></textarea>
                </div>
                <button type="button" className="w-full py-4 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl font-bold transition-colors shadow-lg hover:shadow-xl">
                  Send Message
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-200 bg-white">
        &copy; {new Date().getFullYear()} A1TIExamPrism - Careers & Community. All rights reserved.
      </footer>

    </div>
  );
}

const SparklesIcon = (props) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    <path d="M5 3v4"/>
    <path d="M19 17v4"/>
    <path d="M3 5h4"/>
    <path d="M17 19h4"/>
  </svg>
)
