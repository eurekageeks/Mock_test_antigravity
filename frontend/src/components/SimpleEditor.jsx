import React, { useRef, useEffect } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';

export default function SimpleEditor({ value, onChange, className }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const exec = (command) => {
    document.execCommand(command, false, null);
    editorRef.current.focus();
    handleInput();
  };

  return (
    <div className={`flex flex-col border border-slate-350 dark:border-slate-700 rounded-xl overflow-hidden bg-white dark:bg-slate-800 focus-within:ring-2 focus-within:ring-brand-500 focus-within:border-brand-500 ${className || ''}`}>
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
        <button type="button" onClick={() => exec('bold')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"><Bold size={16}/></button>
        <button type="button" onClick={() => exec('italic')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"><Italic size={16}/></button>
        <button type="button" onClick={() => exec('underline')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"><Underline size={16}/></button>
        <div className="w-px h-4 bg-slate-300 dark:bg-slate-600 mx-1"></div>
        <button type="button" onClick={() => exec('insertUnorderedList')} className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300"><List size={16}/></button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        className="flex-1 p-4 focus:outline-none dark:text-white prose dark:prose-invert max-w-none overflow-y-auto"
        style={{ minHeight: '150px' }}
      />
    </div>
  );
}
