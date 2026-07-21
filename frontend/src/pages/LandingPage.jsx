import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, Cpu, Clock, Award, Users, CheckCircle, 
  Mail, Phone, MapPin, ChevronDown, ChevronUp, ArrowRight,
  BookOpen, Star, HelpCircle, FileText
} from 'lucide-react';

const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tests, setTests] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);
  
  // Contact Form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [testsRes, topicsRes] = await Promise.all([
          api.get('/api/student/tests'),
          api.get('/api/student/topics')
        ]);
        setTests(testsRes.data.slice(0, 6)); // Display top 6
        setTopics(topicsRes.data);
      } catch (err) {
        console.error("Failed to load landing page data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSuccess(true);
    setContactName('');
    setContactEmail('');
    setContactMessage('');
    setTimeout(() => setContactSuccess(false), 5000);
  };

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "How do I sign up and start taking exams?",
      a: "Simply click the 'Sign Up' button, fill in your details, and submit. To keep A1tiExam secure, all student accounts start as 'Pending' and must be approved by our administrator before you can log in. Approval typically takes less than an hour."
    },
    {
      q: "Are the mock tests timed?",
      a: "Yes! Every mock test has a set duration configured by the creator. A live countdown timer is displayed during the exam interface, and the backend will automatically grade and submit your work once the timer runs out."
    },
    {
      q: "What types of questions are supported?",
      a: "A1tiExam supports two main question types: Multiple Choice Questions (MCQs) with single options, and Text Answer Questions where you write out your expected response to match the answer criteria."
    },
    {
      q: "Can I review my past test performance?",
      a: "Absolutely! Once your attempt is submitted, you can view your score, passing status, percentage, correct/wrong count, and complete question reviews detailing the expected answers and explanatory notes."
    },
    {
      q: "Is there any fee to register on A1tiExam?",
      a: "No, registration and basic assessments are free. Organizations can seed custom tests and topics through our administrative dashboard."
    }
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen transition-colors duration-300">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pb-28 lg:pt-20">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-20 dark:opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] aspect-square rounded-full bg-brand-400 blur-[120px]"></div>
          <div className="absolute bottom-[20%] right-[-10%] w-[45%] aspect-square rounded-full bg-blue-500 blur-[120px]"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left animate-slide-up">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 mb-6">
                🔥 Empowering Future Technologists
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-none text-slate-900 dark:text-white">
                Accelerate Your Exam Preparation with <span className="bg-gradient-to-r from-brand-500 to-blue-600 bg-clip-text text-transparent">A1TIExam<span className="text-purple-500">Prism</span></span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 font-medium">
                A premium, AI-ready full-stack mock testing platform to evaluate, grade, and sharpen your technical skills. Attempt real-time mock tests on programming, cloud computing, and DevOps.
              </p>
              
              <div className="mt-10 sm:flex sm:justify-center lg:justify-start gap-4">
                {user ? (
                  <Link
                    to={user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'}
                    className="flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-brand-600 hover:bg-brand-700 shadow-lg shadow-brand-500/25 hover:shadow-brand-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    <a
                      href="#tests"
                      className="mt-3 sm:mt-0 flex items-center justify-center px-8 py-4 border border-slate-300 dark:border-slate-700 text-base font-bold rounded-2xl text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
                    >
                      Explore Tests
                    </a>
                  </>
                )}
              </div>
            </div>

            {/* Right Illustration */}
            <div className="mt-12 lg:mt-0 lg:col-span-6 animate-fade-in animate-delay-100">
              <div className="relative mx-auto w-full max-w-lg lg:max-w-none rounded-3xl overflow-hidden glass p-3 border border-white/20 shadow-2xl dark:shadow-slate-950/50">
                <img
                  src="/hero_students.jpg"
                  alt="Students taking online mock test illustration"
                  className="w-full rounded-2xl object-cover hover:scale-[1.01] transition-transform duration-300"
                />
              </div>
            </div>
            
          </div>
        </div>
      </section>

      {/* 2. Popular Topics Section */}
      <section className="py-16 bg-slate-100/50 dark:bg-slate-900/30 border-y border-slate-200/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Popular Test Topics</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Brush up on hot industry domains. Browse practice materials curated for key technical disciplines.
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center space-x-2">
              <div className="h-3 w-3 bg-brand-500 rounded-full animate-bounce"></div>
              <div className="h-3 w-3 bg-brand-500 rounded-full animate-bounce animate-delay-100"></div>
              <div className="h-3 w-3 bg-brand-500 rounded-full animate-bounce animate-delay-200"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {topics.map((t) => (
                <div 
                  key={t.id}
                  className="p-5 text-center bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md hover:scale-[1.03] transition-all duration-200 cursor-pointer"
                  onClick={() => navigate('/login')}
                >
                  <span className="font-bold text-lg text-slate-900 dark:text-white">{t.name}</span>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description || "Browse mock practice exams."}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. Mock Tests Section */}
      <section id="tests" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">Featured Practice Exams</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Ready to test your limits? Log in to attempt any of our featured published exams.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((s) => (
                <div key={s} className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 animate-pulse h-[240px]"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {tests.length > 0 ? (
                tests.map((test) => (
                  <div 
                    key={test.id} 
                    className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200/60 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      <span className="inline-block px-3 py-1 rounded-xl text-xs font-semibold bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 mb-4">
                        {test.topic_name || "General"}
                      </span>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{test.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3">{test.description}</p>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-4 border-t border-slate-100 dark:border-slate-700/50 pt-4">
                        <span className="flex items-center"><Clock className="h-4.5 w-4.5 mr-1 text-slate-400" /> {test.duration_minutes} Mins</span>
                        <span className="flex items-center"><FileText className="h-4.5 w-4.5 mr-1 text-slate-400" /> {test.question_count} Qs</span>
                        <span className="flex items-center"><Award className="h-4.5 w-4.5 mr-1 text-slate-400" /> {test.total_marks} Marks</span>
                      </div>
                      <Link 
                        to="/login"
                        className="w-full inline-flex items-center justify-center py-3 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-semibold rounded-2xl transition-all duration-200 text-sm"
                      >
                        Attempt Test <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-10 bg-slate-100 dark:bg-slate-800/30 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-slate-500 dark:text-slate-400 font-semibold">No mock tests available currently. Seed the database to view sample tests!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 4. Why Choose A1tiExam */}
      <section id="features" className="py-20 bg-slate-100/50 dark:bg-slate-900/40 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Why Choose A1tiExam?</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              We provide a modern platform built with high security standards, responsive interfaces, and full features.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 p-4 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Backend Timer Enforcement</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                No cheating. The count-down timer is strictly synced and verified by our backend server, auto-submitting attempts the moment limit expires.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 p-4 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                <Cpu className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Two Core Question Formats</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Supports Multiple Choice Questions (MCQ) for rapid testing and free-form Text Answer input graded automatically based on expected keywords.
              </p>
            </div>

            <div className="p-8 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm hover:shadow-md transition-all duration-200">
              <div className="bg-brand-500/10 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 p-4 rounded-2xl w-14 h-14 flex items-center justify-center mb-6">
                <Award className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Detailed Answer Explanations</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">
                Don't just verify scores. Get in-depth reviews after grading to see correct answer mappings and detailed text explanations of core concepts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Platform Statistics */}
      <section id="stats" className="py-20 bg-gradient-to-tr from-brand-900 to-brand-700 text-white relative">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <span className="block text-4xl sm:text-5xl font-black mb-2">15,000+</span>
              <span className="text-brand-100 font-semibold uppercase tracking-wider text-xs">Total Students</span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-black mb-2">50,000+</span>
              <span className="text-brand-100 font-semibold uppercase tracking-wider text-xs">Exams Attempted</span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-black mb-2">99.8%</span>
              <span className="text-brand-100 font-semibold uppercase tracking-wider text-xs">Platform Uptime</span>
            </div>
            <div>
              <span className="block text-4xl sm:text-5xl font-black mb-2">200+</span>
              <span className="text-brand-100 font-semibold uppercase tracking-wider text-xs">Verified Mock Tests</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials */}
      <section id="testimonials" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Trusted by Thousands of Students</h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Read how candidates cracked their job placements using the A1tiExam engine.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-slate-100/50 dark:bg-slate-800 rounded-3xl border border-slate-200/30 dark:border-slate-700/30">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((st) => <Star key={st} className="h-4.5 w-4.5 fill-current" />)}
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                "The Live Timer feature made me feel like I was in a real exam room. It automatically submitted when I was typing my last answer, and grading was immediate!"
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-brand-500 text-white font-bold flex items-center justify-center">SK</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Siddharth Kumar</h4>
                  <span className="text-xs text-slate-400">AWS Certified Practitioner</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-100/50 dark:bg-slate-800 rounded-3xl border border-slate-200/30 dark:border-slate-700/30">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((st) => <Star key={st} className="h-4.5 w-4.5 fill-current" />)}
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                "The skills popup reminder kept reminding me to finish my student profile. Once I set up Docker as my skill, I could view tailored Docker tests on my feed."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center">AR</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">Anjali Roy</h4>
                  <span className="text-xs text-slate-400">DevOps Student</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-slate-100/50 dark:bg-slate-800 rounded-3xl border border-slate-200/30 dark:border-slate-700/30">
              <div className="flex items-center space-x-1 text-yellow-400 mb-4">
                {[1, 2, 3, 4, 5].map((st) => <Star key={st} className="h-4.5 w-4.5 fill-current" />)}
              </div>
              <p className="text-slate-600 dark:text-slate-300 italic text-sm leading-relaxed mb-6">
                "Simple, responsive interface that matches premium look of popular educational systems like Unacademy. The light/dark mode switch is buttery smooth."
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center">JD</div>
                <div>
                  <h4 className="font-bold text-sm text-slate-950 dark:text-white">John Doe</h4>
                  <span className="text-xs text-slate-400">Java Developer Candidate</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-20 bg-slate-100/50 dark:bg-slate-900/40 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
            <p className="mt-4 text-slate-500 dark:text-slate-400">Need help? Read answers to common developer queries.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div 
                key={idx} 
                className="bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl overflow-hidden shadow-sm transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-slate-900 dark:text-white">{faq.q}</span>
                  {openFaq === idx ? <ChevronUp className="h-5 w-5 text-brand-500" /> : <ChevronDown className="h-5 w-5 text-slate-400" />}
                </button>
                
                {openFaq === idx && (
                  <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-700/50 text-slate-600 dark:text-slate-400 text-sm leading-relaxed animate-fade-in">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-800 rounded-[32px] shadow-xl dark:shadow-slate-950/20 overflow-hidden lg:grid lg:grid-cols-12">
            
            {/* Contact details */}
            <div className="lg:col-span-5 bg-gradient-to-tr from-brand-900 to-brand-600 text-white p-8 sm:p-12 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-extrabold mb-4">Contact Info</h2>
                <p className="text-brand-100 text-sm leading-relaxed mb-10">
                  Have questions about custom licensing, API access, or administrator settings? Drop us a line.
                </p>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Mail className="h-6 w-6 text-brand-200" />
                    <span className="text-sm font-medium">support@a1tiexam.com</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Phone className="h-6 w-6 text-brand-200" />
                    <span className="text-sm font-medium">+1 (555) 019-2834</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <MapPin className="h-6 w-6 text-brand-200" />
                    <span className="text-sm font-medium">100 Silicon Valley, California, USA</span>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 text-xs text-brand-200">
                A1tiExam Support team is available 24/7.
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-7 p-8 sm:p-12">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send Us a Message</h3>
              
              {contactSuccess && (
                <div className="p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl mb-6 font-semibold text-sm">
                  Success! Your message was sent. Our team will get back to you shortly.
                </div>
              )}
              
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    placeholder="Enter your name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    placeholder="name@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm"
                    placeholder="How can we help you?"
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full py-4 px-6 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:shadow-brand-500/25 transition-all duration-200"
                >
                  Send Message
                </button>
              </form>
            </div>
            
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
