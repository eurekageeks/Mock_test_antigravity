import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\student\\TestResults.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# The breakdown grid to inject
detailed_breakdown_grid = '''        {/* Detailed Scores Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          {/* Objective Score */}
          <div className={`p-4 rounded-3xl border ${attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/50' : 'bg-rose-50 border-rose-200 dark:bg-rose-900/10 dark:border-rose-800/50'}`}>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Objective (MCQ)</p>
            <p className={`text-3xl font-black ${attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'text-emerald-600' : 'text-rose-600'}`}>
              {attempt.result?.objective_score || 0} <span className="text-sm font-medium opacity-60">/ {attempt.result?.objective_total_marks || 0}</span>
            </p>
            <p className={`text-xs font-bold mt-2 ${attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'text-emerald-500' : 'text-rose-500'}`}>
              {attempt.result?.objective_score >= (attempt.result?.objective_total_marks * 0.5) ? 'PASSED' : 'FAILED'}
            </p>
          </div>

          {/* Subjective Score */}
          <div className={`p-4 rounded-3xl border ${attempt.pending_subjective_count > 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800/50' : 'bg-sky-50 border-sky-200 dark:bg-sky-900/10 dark:border-sky-800/50'}`}>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Subjective</p>
            {attempt.pending_subjective_count > 0 ? (
              <div className="flex flex-col items-center justify-center h-full pb-6">
                <p className="text-amber-600 dark:text-amber-400 font-bold text-sm">Submitted to Admin</p>
                <p className="text-amber-500/80 text-xs mt-1 animate-pulse">Pending Score...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pb-2">
                <p className="text-3xl font-black text-sky-600">
                  {attempt.result?.subjective_score || 0} <span className="text-sm font-medium opacity-60">/ {attempt.result?.subjective_total_marks || 0}</span>
                </p>
                <p className="text-xs font-bold text-sky-500 mt-2">GRADED</p>
              </div>
            )}
          </div>

          {/* Final Score */}
          <div className={`p-4 rounded-3xl border ${attempt.pending_subjective_count > 0 ? 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700' : (attempt.result?.is_passed ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700' : 'bg-rose-50 border-rose-300 dark:bg-rose-900/20 dark:border-rose-700')} shadow-inner`}>
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 uppercase tracking-wide">Final Result</p>
            {attempt.pending_subjective_count > 0 ? (
              <div className="flex items-center justify-center h-full pb-6">
                <p className="text-slate-400 dark:text-slate-500 font-bold text-sm">Awaiting Final Grade</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center pb-2">
                <p className={`text-4xl font-black ${attempt.result?.is_passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {attempt.result?.score || 0} <span className="text-sm font-medium opacity-60">/ {attempt.mock_test_total_marks}</span>
                </p>
                <p className={`text-sm font-black mt-2 tracking-widest ${attempt.result?.is_passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {attempt.result?.is_passed ? 'PASSED OVERALL' : 'FAILED OVERALL'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Metric Cards grid */}'''

code = code.replace('{/* Metric Cards grid */}', detailed_breakdown_grid)

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\student\\TestResults.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
