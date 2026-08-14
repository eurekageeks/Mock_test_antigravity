import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\PublicCatalog.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Remove the desktop button from the right sidebar
sidebar_ad_regex = r'\{\s*lessonDetail && lessonDetail\.qa_button_text && \(\s*<div className="bg-sky-50 rounded-lg p-4 text-center mb-6 border border-sky-100 shadow-sm">\s*<p className="font-bold text-sky-800 mb-3">Interview Preparation<\/p>\s*<button \s*onClick=\{\(\) => setShowQA\(!showQA\)\}\s*className="w-full py-2\.5 bg-\[#0ea5e9\] hover:bg-sky-600 text-white rounded font-bold text-sm transition-colors shadow-md"\s*>\s*\{showQA \? \'Back to Lesson Content\' : lessonDetail\.qa_button_text\}\s*<\/button>\s*<\/div>\s*\)\s*\}\s*'
code = re.sub(sidebar_ad_regex, '', code)


# 2. Replace the title and the mobile button with the new flex container title layout
title_and_mobile_btn_regex = r'<h1 className="text-4xl font-normal text-slate-900 mb-8 pb-4 border-b border-slate-200">\s*\{lessonDetail\.title\}\s*<\/h1>\s*\{\s*lessonDetail\.qa_button_text && \(\s*<div className="xl:hidden mb-8">\s*<button \s*onClick=\{\(\) => setShowQA\(!showQA\)\}\s*className="w-full py-3 bg-\[#0ea5e9\] hover:bg-sky-600 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"\s*>\s*\{showQA \? \'Back to Lesson Content\' : lessonDetail\.qa_button_text\}\s*<\/button>\s*<\/div>\s*\)\s*\}'

new_title_section = '''<div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-slate-200 gap-4">
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
                </div>'''

code = re.sub(title_and_mobile_btn_regex, new_title_section, code)


with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\PublicCatalog.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
