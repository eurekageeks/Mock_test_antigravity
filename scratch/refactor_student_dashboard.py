import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\student\\StudentDashboard.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Add states
state_addition = '''  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');
  
  // Skills Modal state'''
code = code.replace('  // Skills Modal state', state_addition, 1)

# Modify initializeDashboard
init_addition = '''      if (topicsRes?.data) {
        setTopics(topicsRes.data);
        setAvailableSkillsList(topicsRes.data.map(t => t.name));
      }'''
code = code.replace('''      if (topicsRes?.data) {
        setAvailableSkillsList(topicsRes.data.map(t => t.name));
      }''', init_addition, 1)

# Replace Profile Status card with Filter card
profile_status_regex = r'\{\/\* Profile completion card \*\/\}[\s\S]*?\{\/\* Completed Tests \*\/\}'
filter_card = '''{/* Topic Filter Card */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Filter Mock Tests</span>
              <FileText className="h-5 w-5 text-brand-500" />
            </div>
            <div>
              <span className="text-sm text-slate-400 block mb-2">Select a topic to filter</span>
              <select
                value={selectedTopicId}
                onChange={(e) => setSelectedTopicId(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium mb-4 transition-colors"
              >
                <option value="">All Topics</option>
                {topics.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button 
                onClick={() => setSelectedTopicId('')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold rounded-xl text-xs transition-colors"
              >
                Clear Filter
              </button>
            </div>
          </div>

          {/* Completed Tests */}'''

code = re.sub(profile_status_regex, filter_card, code, count=1)

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\student\\StudentDashboard.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
