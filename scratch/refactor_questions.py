import re

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\admin\\QuestionManagement.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

code = re.sub(r'  const \[images, setImages\] = useState\(\[\]\);\n', '', code)
code = re.sub(r'  const \[imageUploading, setImageUploading\] = useState\(false\);\n', '', code)
code = re.sub(r'  const imageInputRef = useRef\(null\);\n', '', code)
code = re.sub(r'  const \[isDragging, setIsDragging\] = useState\(false\);\n', '', code)

code = re.sub(r'    setImages\(\[\]\);\n', '', code)
code = re.sub(r'    setImages\(q\.image_urls \|\| \[\]\);\n', '', code)

code = re.sub(r'      image_urls: images\.length > 0 \? images : null,\n', '', code)

code = re.sub(r'  const compressImage = .*?  const handleCreateOrUpdateQuestion =', '  const handleCreateOrUpdateQuestion =', code, flags=re.DOTALL)

code = re.sub(r'\s*onDragOver=\{handleImageDragOver\}\s*onDragEnter=\{handleImageDragOver\}\s*onDragLeave=\{handleImageDragLeave\}\s*onDrop=\{handleImageDrop\}\s*onPaste=\{handlePaste\}', '', code)
code = re.sub(r'border \$\{isDragging \? \'border-brand-500 ring-4 ring-brand-500/20\' : \'border-slate-200/50 dark:border-slate-700/50\'\}', 'border border-slate-200/50 dark:border-slate-700/50', code)

# Remove the isDragging overlay
overlay_regex = r'\s*\{isDragging && \(\s*<div.*?<\/div>\s*\)\}'
code = re.sub(overlay_regex, '', code, flags=re.DOTALL)

# Remove the Image Upload Section
img_section_regex = r'\s*\{\/\* Image Upload Section \*\/\}.*?<input type=\"file\" multiple accept=\"image/\*\" className=\"hidden\" ref=\{imageInputRef\} onChange=\{handleImageUpload\} \/>\s*<\/div>'
code = re.sub(img_section_regex, '', code, flags=re.DOTALL)

with open('d:\\anitigravity_mock_test\\frontend\\src\\pages\\admin\\QuestionManagement.jsx', 'w', encoding='utf-8') as f:
    f.write(code)
print('Done!')
