import React, { useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

export default function SimpleEditor({ value, onChange, className, placeholder = "Start typing..." }) {
  const editorRef = useRef(null);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }, { 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'align': [] }],
      ['link', 'image', 'video', 'formula'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video', 'formula',
    'color', 'background', 'align'
  ];

  return (
    <div className={`rich-text-editor-wrapper bg-white dark:bg-slate-800 rounded-xl overflow-hidden ${className || ''}`}>
      <ReactQuill 
        ref={editorRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="h-96 sm:h-[500px] md:h-[600px] flex flex-col"
      />
      <style>{`
        .rich-text-editor-wrapper .quill {
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .rich-text-editor-wrapper .ql-toolbar {
          background-color: #f8fafc;
          border-top-left-radius: 0.75rem;
          border-top-right-radius: 0.75rem;
          border-color: #e2e8f0;
        }
        .dark .rich-text-editor-wrapper .ql-toolbar {
          background-color: #1e293b;
          border-color: #334155;
        }
        .dark .rich-text-editor-wrapper .ql-toolbar button, 
        .dark .rich-text-editor-wrapper .ql-toolbar .ql-picker {
          color: #cbd5e1;
        }
        .dark .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
          stroke: #cbd5e1;
        }
        .dark .rich-text-editor-wrapper .ql-toolbar .ql-fill {
          fill: #cbd5e1;
        }
        .dark .rich-text-editor-wrapper .ql-toolbar .ql-picker-options {
          background-color: #1e293b;
          border-color: #334155;
        }
        .rich-text-editor-wrapper .ql-container {
          flex: 1;
          border-bottom-left-radius: 0.75rem;
          border-bottom-right-radius: 0.75rem;
          border-color: #e2e8f0;
          font-family: inherit;
          font-size: 1rem;
        }
        .dark .rich-text-editor-wrapper .ql-container {
          border-color: #334155;
          color: #f8fafc;
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: 400px;
          flex: 1;
        }
      `}</style>
    </div>
  );
}
