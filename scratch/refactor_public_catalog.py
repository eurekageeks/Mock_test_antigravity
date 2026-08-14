import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\PublicCatalog.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. Add state for showQA
code = code.replace('const [loadingLesson, setLoadingLesson] = useState(false);', 'const [loadingLesson, setLoadingLesson] = useState(false);\n  const [showQA, setShowQA] = useState(false);')

# 2. Reset showQA when selectedLessonId changes
fetch_lesson_start = 'const fetchLesson = async () => {'
fetch_lesson_replacement = 'const fetchLesson = async () => {\n      setShowQA(false);'
code = code.replace(fetch_lesson_start, fetch_lesson_replacement, 1)

# 3. Add Mobile QA button below title
title_regex = r'(<h1 className="text-4xl font-normal text-slate-900 mb-8 pb-4 border-b border-slate-200">\s*\{lessonDetail\.title\}\s*<\/h1>)'

mobile_button = r'''\1
                
                {lessonDetail.qa_button_text && (
                  <div className="xl:hidden mb-8">
                    <button 
                      onClick={() => setShowQA(!showQA)}
                      className="w-full py-3 bg-[#0ea5e9] hover:bg-sky-600 text-white font-bold rounded-lg transition-colors shadow-md flex items-center justify-center gap-2"
                    >
                      {showQA ? 'Back to Lesson Content' : lessonDetail.qa_button_text}
                    </button>
                  </div>
                )}
'''
code = re.sub(title_regex, mobile_button, code)

# 4. Render QA Content instead of Lesson Content if showQA is true
content_render_regex = r'\{\/\* Rich Text Content \*\/\}[\s\S]*?\{\/\* Video Content \*\/\}'

new_content_render = '''{/* Rich Text / QA Content */}
                {showQA ? (
                  lessonDetail.qa_content_html ? (
                    <div className="ql-container ql-snow border-0">
                      <div 
                        className="ql-editor text-slate-700 text-lg leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: lessonDetail.qa_content_html }}
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
                        dangerouslySetInnerHTML={{ __html: lessonDetail.content_html }}
                      />
                    </div>
                  ) : (
                    <div className="bg-[#E7E9EB] p-6 rounded-lg text-slate-600">
                      This lesson does not contain any text content yet.
                    </div>
                  )
                )}

                {/* Video Content */}'''

code = re.sub(content_render_regex, new_content_render, code)

# 5. Hide Video if showQA is true
video_regex = r'\{lessonDetail\.video_url && \('
code = code.replace(video_regex, '{!showQA && lessonDetail.video_url && (')

# 6. Add desktop button to right sidebar
sidebar_ad_regex = r'(<h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest text-center mb-4">Advertisement<\/h4>)'

desktop_button = r'''
            {lessonDetail && lessonDetail.qa_button_text && (
              <div className="bg-sky-50 rounded-lg p-4 text-center mb-6 border border-sky-100 shadow-sm">
                <p className="font-bold text-sky-800 mb-3">Interview Preparation</p>
                <button 
                  onClick={() => setShowQA(!showQA)}
                  className="w-full py-2.5 bg-[#0ea5e9] hover:bg-sky-600 text-white rounded font-bold text-sm transition-colors shadow-md"
                >
                  {showQA ? 'Back to Lesson Content' : lessonDetail.qa_button_text}
                </button>
              </div>
            )}
            \1'''
code = re.sub(sidebar_ad_regex, desktop_button, code)


with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\PublicCatalog.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
