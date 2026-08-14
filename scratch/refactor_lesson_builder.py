import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\admin\\LessonBuilder.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add activeTab state and default QA fields to initial state
code = code.replace('is_published: true', 'is_published: true,\n    qa_button_text: \'\',\n    qa_content_html: \'\'')
code = code.replace('const [loading, setLoading] = useState(false);', 'const [loading, setLoading] = useState(false);\n  const [activeTab, setActiveTab] = useState(\'lesson\');')

# Add UI for tabs
editor_section_regex = r'<div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">[\s\S]*?<\/div>\s*<\/div>'

new_editor_section = '''<div className="mb-4 flex space-x-2 border-b border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setActiveTab('lesson')}
                className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'lesson' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Lesson Tutorial
              </button>
              <button 
                onClick={() => setActiveTab('qa')}
                className={`px-4 py-2 font-bold text-sm border-b-2 transition-colors ${activeTab === 'qa' ? 'border-brand-500 text-brand-600 dark:text-brand-400' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                Interview Q&A
              </button>
            </div>

            {activeTab === 'lesson' ? (
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
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Q&A Button Text (Required to enable Q&A)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Docker Build Q&A" 
                    value={lesson.qa_button_text || ''}
                    onChange={(e) => setLesson({...lesson, qa_button_text: e.target.value})}
                    className="w-full px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                  <div className="p-4">
                    <SimpleEditor 
                      value={lesson.qa_content_html || ''} 
                      onChange={(val) => setLesson({...lesson, qa_content_html: val})} 
                      placeholder="Write the interview questions and answers here..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>'''

code = re.sub(editor_section_regex, new_editor_section, code)

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\admin\\LessonBuilder.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
