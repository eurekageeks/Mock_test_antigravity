import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\student\\StudentDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add searchQuery state
code = code.replace("const [selectedTopicId, setSelectedTopicId] = useState('');", "const [selectedTopicId, setSelectedTopicId] = useState('');\n  const [searchQuery, setSearchQuery] = useState('');")

# Replace Exam History card
exam_history_regex = r'\{\/\* Completed Tests \*\/\}[\s\S]*?\{\/\* Average Score \*\/\}'
search_card = '''{/* Search Tests */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Search Exams</span>
              <Search className="h-5 w-5 text-emerald-500" />
            </div>
            <div>
              <span className="text-sm text-slate-400 block mb-2">Search by test title</span>
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium transition-colors"
                  placeholder="e.g. Python Basics..."
                />
              </div>
              <button 
                onClick={() => setSearchQuery('')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs transition-colors"
              >
                Clear Search
              </button>
            </div>
          </div>

          {/* Average Score */}'''

code = re.sub(exam_history_regex, search_card, code, count=1)

# Add Search icon to imports
if 'Search' not in code.split('import {')[1].split('} from \'lucide-react\'')[0]:
    code = code.replace('User, Sparkles', 'User, Sparkles, Search')

# Update tests filtering logic
filter_logic_regex = r'const displayTests = selectedTopicId \s*\?\s*tests\.filter\(t => t\.topic_id === parseInt\(selectedTopicId\)\)\s*:\s*\(tests\.filter\(t => t\.is_recommended\)\.length > 0 \? tests\.filter\(t => t\.is_recommended\)\.slice\(0, 6\) : tests\.slice\(0, 6\)\);'
new_filter_logic = '''let displayTests = selectedTopicId 
              ? tests.filter(t => t.topic_id === parseInt(selectedTopicId))
              : (tests.filter(t => t.is_recommended).length > 0 ? tests.filter(t => t.is_recommended).slice(0, 6) : tests.slice(0, 6));
              
            if (searchQuery.trim()) {
              const query = searchQuery.toLowerCase();
              displayTests = (selectedTopicId ? tests : tests).filter(t => 
                (selectedTopicId ? t.topic_id === parseInt(selectedTopicId) : true) &&
                t.title.toLowerCase().includes(query)
              );
            }'''
            
code = re.sub(filter_logic_regex, new_filter_logic, code)

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\student\\StudentDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
