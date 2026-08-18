import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { 
  User, Mail, Phone, BookOpen, Briefcase, Plus, X, 
  CheckCircle, FileText, UploadCloud
} from 'lucide-react';

const StudentProfile = () => {
  const { user, setUser } = useAuth();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Fields state
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState('');
  
  // Skills editing state
  const [skills, setSkills] = useState([]);
  const [newSkill, setNewSkill] = useState('');
  const [availableTopics, setAvailableTopics] = useState([]);
  
  const [message, setMessage] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const [res, topicsRes] = await Promise.all([
          api.get('/api/student/profile'),
          api.get('/api/student/topics')
        ]);
        setProfile(res.data);
        setAvailableTopics(topicsRes.data);
        
        setName(user?.name || '');
        setMobile(user?.mobile || '');
        setEducation(res.data.education || '');
        setExperience(res.data.experience || '');
        setSkills(res.data.skills.map(s => s.name));
      } catch (err) {
        console.error("Failed to load profile details:", err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const cleanSkill = newSkill.trim();
    if (cleanSkill) {
      if (skills.includes(cleanSkill)) {
        Swal.fire({
          icon: 'info',
          title: 'Already Added',
          text: 'You already have this skill in your profile!'
        });
      } else {
        setSkills([...skills, cleanSkill]);
        setNewSkill('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    // Auto-add any pending typed skill that user forgot to click "Add" for
    let finalSkills = [...skills];
    const cleanSkill = newSkill.trim();
    if (cleanSkill && !skills.includes(cleanSkill)) {
      finalSkills.push(cleanSkill);
      setSkills(finalSkills);
      setNewSkill('');
    }

    try {
      // 1. Save core fields
      const profileRes = await api.put('/api/student/profile', {
        name,
        mobile,
        education,
        experience
      });
      
      // 2. Save skills
      const skillsRes = await api.post('/api/student/skills', {
        skills: finalSkills
      });
      
      setProfile(skillsRes.data);
      // Sync auth user state name/mobile
      setUser(prev => ({
        ...prev,
        name: name,
        mobile: mobile
      }));
      
      setMessage({ text: "Profile details updated successfully!", type: "success" });
    } catch (err) {
      console.error("Failed to save profile:", err);
      setMessage({ text: "Failed to update profile. Please verify your entries.", type: "error" });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage({ text: '', type: '' }), 5000);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Candidate Profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
        
        {/* Title */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">Student Profile Settings</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">Manage your professional bio, academic background, and technical skill sets.</p>
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

        <form onSubmit={handleSaveProfile} className="space-y-8">
          
          {/* Card 1: Core details */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 flex items-center">
              <User className="h-5 w-5 mr-2 text-brand-500" /> General Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                    placeholder="Enter full name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Mobile Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-400">
                    <Phone className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                    placeholder="Mobile number"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-450">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-400 cursor-not-allowed text-sm font-medium"
                />
              </div>
              <span className="text-[10px] text-slate-400 block mt-1.5">Email address cannot be changed after registration.</span>
            </div>
          </div>

          {/* Card 2: Professional Education / Experience */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 flex items-center">
              <BookOpen className="h-5 w-5 mr-2 text-brand-500" /> Academic & Experience
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Education</label>
                <div className="relative">
                  <span className="absolute top-3 left-4 text-slate-400">
                    <BookOpen className="h-4.5 w-4.5" />
                  </span>
                  <textarea
                    rows={3}
                    value={education}
                    onChange={(e) => setEducation(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                    placeholder="e.g. Master of Computer Applications, University of San Francisco (2023 - 2025)"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Experience</label>
                <div className="relative">
                  <span className="absolute top-3 left-4 text-slate-400">
                    <Briefcase className="h-4.5 w-4.5" />
                  </span>
                  <textarea
                    rows={3}
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                    placeholder="e.g. Junior DevOps Engineer at SF Tech Corp (6 months internship)"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Skills CRUD */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 flex items-center">
              <Plus className="h-5 w-5 mr-2 text-brand-500" /> Technical Skills
            </h3>

            {/* Input to add skill */}
            <div className="flex gap-2">
              <select
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium appearance-none"
              >
                <option value="" disabled className="text-slate-500">
                  Select a technical skill to add...
                </option>
                {availableTopics.map(topic => (
                  <option key={topic.id} value={topic.name} className="dark:bg-slate-800 text-slate-900 dark:text-white">
                    {topic.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-md shadow-brand-500/10 transition-all duration-200"
              >
                Add Skill
              </button>
            </div>

            {/* Tags area */}
            <div className="flex flex-wrap gap-2 pt-2">
              {skills.length > 0 ? (
                skills.map((skill) => (
                  <span 
                    key={skill}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/10"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="ml-2 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400 italic">No skills registered yet. Add some skills to boost your profile stats.</span>
              )}
            </div>
          </div>

          {/* Card 4: Resume upload */}
          <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-700/50 pb-3 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-brand-500" /> Resume Upload (Optional)
            </h3>
            
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-6 text-center hover:bg-slate-50/50 dark:hover:bg-slate-750/30 transition-colors duration-200 cursor-pointer">
              <UploadCloud className="h-8 w-8 text-brand-500 mx-auto mb-3" />
              <span className="block text-sm font-bold text-slate-900 dark:text-white mb-1">Click to Upload Resume</span>
              <span className="block text-xs text-slate-400">PDF, DOC, DOCX up to 5MB (Simulation)</span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/20 hover:shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all duration-200 text-sm"
            >
              {saving ? 'Saving changes...' : 'Save Profile Details'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default StudentProfile;
