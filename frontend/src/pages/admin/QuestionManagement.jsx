import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import { getImageUrl, processHtmlImages } from '../../utils/imageHelper';
import SimpleEditor from '../../components/SimpleEditor';
import {
  Plus, Edit3, Trash2, Copy, GripVertical, ChevronLeft,
  HelpCircle, Save, X, AlertCircle, Upload, FileText,
  CheckCircle, Loader, Eye
} from 'lucide-react';
import Swal from 'sweetalert2';

const QuestionManagement = () => {
  const { test_id } = useParams();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedIdx, setDraggedIdx] = useState(null);

  // Active tab: 'manual' | 'pdf'
  const [activeTab, setActiveTab] = useState('manual');

  // Manual add/edit modal
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [type, setType] = useState('mcq');
  const [questionText, setQuestionText] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [correctAnswerMulti, setCorrectAnswerMulti] = useState([]);
  const [marks, setMarks] = useState(2.0);
  const [explanation, setExplanation] = useState('');
  const [optA, setOptA] = useState('');
  const [optB, setOptB] = useState('');
  const [optC, setOptC] = useState('');
  const [optD, setOptD] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // PDF upload states
  const fileInputRef = useRef(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfResult, setPdfResult] = useState(null); // { imported_count, questions }
  const [pdfError, setPdfError] = useState('');

  const [message, setMessage] = useState({ text: '', type: '' });

  // Bulk management states
  const [selectedQuestionIds, setSelectedQuestionIds] = useState([]);
  const [bulkMarksValue, setBulkMarksValue] = useState(2.0);

  const handleSelectAllQuestions = (e) => {
    if (e.target.checked) {
      setSelectedQuestionIds(questions.map(q => q.id));
    } else {
      setSelectedQuestionIds([]);
    }
  };

  const handleSelectQuestion = (id) => {
    setSelectedQuestionIds(prev =>
      prev.includes(id) ? prev.filter(qId => qId !== id) : [...prev, id]
    );
  };

  const handleBulkDeleteQuestions = async () => {
    if (questions.length === 0) {
      return showMessage("No questions to delete.", "error");
    }
    const count = selectedQuestionIds.length > 0 ? selectedQuestionIds.length : questions.length;

    const result = await Swal.fire({
      title: selectedQuestionIds.length > 0 ? `Delete ${count} Selected Questions?` : 'Delete ALL Questions?',
      text: "This action cannot be undone and will permanently remove the questions from this mock test.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: selectedQuestionIds.length > 0 ? 'Yes, delete selected!' : 'Yes, delete ALL!'
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/api/admin/tests/${test_id}/questions/bulk-delete`, {
        question_ids: selectedQuestionIds.length > 0 ? selectedQuestionIds : []
      });
      showMessage(`Successfully deleted ${count} question(s)!`);
      setSelectedQuestionIds([]);
      fetchQuestions();
    } catch (err) {
      console.error("Bulk delete failed:", err);
      showMessage("Failed to delete questions.", "error");
    }
  };

  const handleBulkUpdateMarks = async () => {
    if (questions.length === 0) {
      return showMessage("No questions to update marks for.", "error");
    }
    if (!bulkMarksValue || isNaN(bulkMarksValue) || Number(bulkMarksValue) <= 0) {
      return showMessage("Please enter a valid positive marks value.", "error");
    }

    const count = selectedQuestionIds.length > 0 ? selectedQuestionIds.length : questions.length;

    const result = await Swal.fire({
      title: selectedQuestionIds.length > 0 ? `Set ${bulkMarksValue} Marks for ${count} Selected Questions?` : `Set ${bulkMarksValue} Marks for ALL Questions?`,
      text: "This will overwrite the marks assigned to these questions.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#3b82f6',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, update marks!'
    });

    if (!result.isConfirmed) return;

    try {
      await api.post(`/api/admin/tests/${test_id}/questions/bulk-update-marks`, {
        question_ids: selectedQuestionIds.length > 0 ? selectedQuestionIds : [],
        marks: Number(bulkMarksValue)
      });
      showMessage(`Successfully set marks to ${bulkMarksValue} for ${count} question(s)!`);
      setSelectedQuestionIds([]);
      fetchQuestions();
    } catch (err) {
      console.error("Bulk marks update failed:", err);
      showMessage("Failed to update marks.", "error");
    }
  };

  const fetchQuestions = async () => {
    try {
      const [testRes, qRes] = await Promise.all([
        api.get(`/api/admin/tests/${test_id}`),
        api.get(`/api/admin/tests/${test_id}/questions`)
      ]);
      setTest(testRes.data);
      setQuestions(qRes.data);
      setSelectedQuestionIds([]);
    } catch (err) {
      console.error("Failed to load question logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [test_id]);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 5000);
  };

  const openCreateModal = () => {
    setEditingQuestion(null);
    setType('mcq');
    setQuestionText('');
    setCorrectAnswer('A');
    setCorrectAnswerMulti([]);
    setMarks(2.0);
    setExplanation('');
    setOptA(''); setOptB(''); setOptC(''); setOptD('');
    setShowModal(true);
  };

  const openEditModal = (q) => {
    setEditingQuestion(q);
    setType(q.type);
    setQuestionText(q.question_text);
    setCorrectAnswer(q.correct_answer);
    setCorrectAnswerMulti(q.type === 'mcq_multi' && q.correct_answer ? q.correct_answer.split(',') : []);
    setMarks(q.marks);
    setExplanation(q.explanation || '');
    if (q.type === 'mcq' || q.type === 'mcq_multi') {
      setOptA(q.options.find(o => o.option_key === 'A')?.option_text || '');
      setOptB(q.options.find(o => o.option_key === 'B')?.option_text || '');
      setOptC(q.options.find(o => o.option_key === 'C')?.option_text || '');
      setOptD(q.options.find(o => o.option_key === 'D')?.option_text || '');
    }
    setShowModal(true);
  };

  const handleCreateOrUpdateQuestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const optionsPayload = (type === 'mcq' || type === 'mcq_multi') ? [
      { option_key: 'A', option_text: optA },
      { option_key: 'B', option_text: optB },
      { option_key: 'C', option_text: optC },
      { option_key: 'D', option_text: optD }
    ] : null;

    const payload = {
      type,
      question_text: questionText,
      correct_answer: type === 'mcq_multi' ? correctAnswerMulti.sort().join(',') : correctAnswer,
      marks: parseFloat(marks),
      explanation: explanation || null,
      options: optionsPayload
    };

    try {
      if (editingQuestion) {
        await api.put(`/api/admin/questions/${editingQuestion.id}`, payload);
        showMessage("Question updated successfully!");
      } else {
        await api.post(`/api/admin/tests/${test_id}/questions`, payload);
        showMessage("New question added successfully!");
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      console.error("Failed to save question:", err);
      showMessage("Failed to save question. Check all fields.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDuplicateQuestion = async (qId) => {
    try {
      await api.post(`/api/admin/questions/${qId}/duplicate`);
      showMessage("Question duplicated successfully!");
      fetchQuestions();
    } catch (err) {
      showMessage("Failed to duplicate question.", 'error');
    }
  };

  const handleDeleteQuestion = async (qId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!'
    });
    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/admin/questions/${qId}`);
      fetchQuestions();
      setMessage({ text: "Question deleted successfully.", type: "success" });
    } catch (err) {
      console.error("Failed to delete question:", err);
      setMessage({ text: "Failed to delete question.", type: "error" });
    }
  };

  const handleDragStart = (idx) => setDraggedIdx(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = async (targetIdx) => {
    if (draggedIdx === null || draggedIdx === targetIdx) return;
    const reordered = [...questions];
    const [draggedItem] = reordered.splice(draggedIdx, 1);
    reordered.splice(targetIdx, 0, draggedItem);
    setQuestions(reordered);
    setDraggedIdx(null);
    try {
      await api.post(`/api/admin/tests/${test_id}/questions/reorder`, {
        question_ids: reordered.map(q => q.id)
      });
      showMessage("Question order saved!");
    } catch (err) {
      showMessage("Failed to save reordered positions.", 'error');
      fetchQuestions();
    }
  };

  // PDF upload handlers
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setPdfError('Please select a valid PDF file.');
      return;
    }
    setPdfFile(file);
    setPdfResult(null);
    setPdfError('');
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    setPdfUploading(true);
    setPdfError('');
    setPdfResult(null);

    const formData = new FormData();
    formData.append('file', pdfFile);

    try {
      const res = await api.post(
        `/api/admin/tests/${test_id}/questions/upload-pdf`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setPdfResult(res.data);
      fetchQuestions();
      showMessage(`✅ Imported ${res.data.imported_count} question(s) from PDF!`);
    } catch (err) {
      const detail = err.response?.data?.detail || 'Upload failed. Check the PDF format.';
      setPdfError(detail);
    } finally {
      setPdfUploading(false);
    }
  };

  const resetPdf = () => {
    setPdfFile(null);
    setPdfResult(null);
    setPdfError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  if (loading) {
    return (
      <div className="bg-slate-50 dark:bg-slate-900 min-h-screen p-6 sm:p-8 flex justify-center items-center">
        <div className="space-y-4 text-center">
          <div className="h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading Questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <Link to="/admin/tests" className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-slate-600">
                <ChevronLeft className="h-4 w-4 mr-0.5" /> Back to mock test configuration
              </Link>
              <Link to={`/admin/tests?edit=${test_id}`} className="inline-flex items-center px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg transition-colors">
                <Edit3 className="h-3 w-3 mr-1" /> Edit Test Settings
              </Link>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Manage Questions
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Test: <span className="font-bold text-brand-500">{test?.title}</span> • Category: <span className="font-semibold text-slate-600 dark:text-slate-300">{test?.topic_name}</span>
            </p>
          </div>
          {/* Tab Toggle Buttons */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200/50 dark:border-slate-700 rounded-2xl p-1 gap-1 self-start shadow-sm">
            <button
              onClick={() => setActiveTab('manual')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'manual'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Plus className="h-3.5 w-3.5" /> Add Manually
            </button>
            <button
              onClick={() => setActiveTab('pdf')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                activeTab === 'pdf'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              <Upload className="h-3.5 w-3.5" /> Upload PDF
            </button>
          </div>
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

        {/* ─── PDF Upload Panel ─── */}
        {activeTab === 'pdf' && (
          <div className="bg-white dark:bg-slate-800 rounded-[28px] border border-slate-200/50 dark:border-slate-700/50 shadow-sm p-8 space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-indigo-500" /> Import Questions from PDF
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Upload a PDF containing numbered questions with options A–D and answer keys. The system will automatically parse and import them.
              </p>
            </div>

            {/* Format guide */}
            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 space-y-3">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Expected PDF Format</p>
              <pre className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-mono whitespace-pre-wrap">{`1. What is the capital of France?
A) London
B) Berlin
C) Paris
D) Rome
Answer: C
Explanation: Paris is the capital city of France.

2. Which data structure uses LIFO?
A) Queue
B) Stack
C) Tree
D) Graph
Answer: B`}</pre>
              <p className="text-[10px] text-slate-400 italic">Supported markers: 1. / Q1. / Question 1: and A) / (A) / A. for options</p>
            </div>

            {/* File picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex flex-col items-center space-y-3">
                <div className="p-4 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl group-hover:bg-indigo-100 dark:group-hover:bg-indigo-500/20 transition-colors">
                  <FileText className="h-8 w-8 text-indigo-500" />
                </div>
                {pdfFile ? (
                  <div>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{pdfFile.name}</p>
                    <p className="text-xs text-slate-400 mt-1">{(pdfFile.size / 1024).toFixed(1)} KB — Click to change file</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">Click to choose PDF file</p>
                    <p className="text-xs text-slate-400 mt-1">Only PDF files are accepted (text-based, not scanned)</p>
                  </div>
                )}
              </div>
            </div>

            {pdfError && (
              <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-2xl">
                <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 dark:text-red-400 font-semibold">{pdfError}</p>
              </div>
            )}

            {/* Upload actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={handlePdfUpload}
                disabled={!pdfFile || pdfUploading}
                className="flex items-center px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all duration-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pdfUploading ? (
                  <><Loader className="h-4 w-4 mr-2 animate-spin" /> Parsing PDF...</>
                ) : (
                  <><Upload className="h-4 w-4 mr-2" /> Parse & Import</>
                )}
              </button>
              {(pdfFile || pdfResult) && (
                <button
                  onClick={resetPdf}
                  className="px-4 py-3 border border-slate-300 dark:border-slate-700 text-sm font-semibold rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-750 transition-colors"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Results preview */}
            {pdfResult && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-2xl">
                  <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                  <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                    {pdfResult.detail}
                  </p>
                </div>

                {pdfResult.questions?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> Imported Questions Preview
                    </p>
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                      {pdfResult.questions.map((q, i) => (
                        <div key={q.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                          <span className="shrink-0 w-6 h-6 flex items-center justify-center bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-black rounded-lg">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-slate-800 dark:text-white line-clamp-2">{q.question_text}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">{q.type}</span>
                              {q.type === 'mcq' && (
                                <span className="text-[10px] text-slate-400">{q.options_count} options</span>
                              )}
                              <span className="text-[10px] font-bold text-emerald-500">Answer: {q.correct_answer}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── Manual Add Panel ─── */}
        {activeTab === 'manual' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center justify-center px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/10 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 text-xs"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Question
              </button>
            </div>

            {questions.length > 1 && (
              <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-[10px] text-slate-400 flex items-center justify-center space-x-2 font-semibold">
                <GripVertical className="h-4 w-4" /> <span>Tip: Drag and drop the handles to reorder questions!</span>
              </div>
            )}

            {/* Bulk Actions Toolbar */}
            {questions.length > 0 && (
              <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={questions.length > 0 && selectedQuestionIds.length === questions.length}
                      onChange={handleSelectAllQuestions}
                      className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-slate-50 dark:bg-slate-900 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {selectedQuestionIds.length > 0 ? `Selected (${selectedQuestionIds.length})` : 'Select All'}
                    </span>
                  </label>

                  <button
                    onClick={handleBulkDeleteQuestions}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-bold flex items-center transition-colors shadow-sm"
                    title="Delete Selected or All Questions"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    {selectedQuestionIds.length > 0 ? `Delete Selected (${selectedQuestionIds.length})` : 'Delete All Questions'}
                  </button>
                </div>

                <div className="flex items-center gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-700">
                  <span className="text-xs font-bold text-slate-400 uppercase">Set Marks:</span>
                  <select
                    value={bulkMarksValue}
                    onChange={(e) => setBulkMarksValue(e.target.value)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-xs font-bold dark:text-white"
                  >
                    <option value="1">1.0 Mark</option>
                    <option value="2">2.0 Marks</option>
                    <option value="3">3.0 Marks</option>
                    <option value="4">4.0 Marks</option>
                    <option value="5">5.0 Marks</option>
                    <option value="10">10.0 Marks</option>
                  </select>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={bulkMarksValue}
                    onChange={(e) => setBulkMarksValue(e.target.value)}
                    className="w-16 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-xs font-bold dark:text-white text-center"
                    placeholder="Marks"
                  />
                  <button
                    onClick={handleBulkUpdateMarks}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                  >
                    Apply {selectedQuestionIds.length > 0 ? `to (${selectedQuestionIds.length})` : 'to All'}
                  </button>
                </div>
              </div>
            )}

            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={handleDragOver}
                    onDrop={() => handleDrop(idx)}
                    className={`bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm flex items-start gap-4 transition-all duration-200 ${
                      draggedIdx === idx ? 'opacity-30 border-dashed border-brand-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 shrink-0 self-center">
                      <input
                        type="checkbox"
                        checked={selectedQuestionIds.includes(q.id)}
                        onChange={() => handleSelectQuestion(q.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 bg-slate-50 dark:bg-slate-900 h-4 w-4 cursor-pointer"
                      />
                      <div className="cursor-grab p-1 text-slate-300 dark:text-slate-600 hover:text-brand-500">
                        <GripVertical className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="flex-1 space-y-3 min-w-0">
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-750/30 pb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          Question {idx + 1} ({q.marks} Marks)
                        </span>
                        <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 rounded text-[9px] font-bold uppercase text-slate-500 dark:text-slate-400">
                          {q.type}
                        </span>
                      </div>
                      <div 
                        className="font-bold text-sm text-slate-900 dark:text-white leading-relaxed whitespace-pre-wrap prose dark:prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: processHtmlImages(q.question_text) }}
                      />
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold space-y-2 pt-1 border-t border-slate-150 dark:border-slate-700/60">
                        <div className="flex items-start gap-1.5 flex-wrap md:flex-nowrap">
                          <span className="shrink-0 mt-1">Correct Answer:</span>
                          <span className="font-mono whitespace-pre-wrap text-emerald-600 dark:text-emerald-400 font-bold bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-150 dark:border-slate-750/30 block w-full max-w-3xl">
                            {q.correct_answer}
                          </span>
                        </div>
                        {(q.type === 'mcq' || q.type === 'mcq_multi') && (
                          <div className="text-[10px] text-slate-400 font-bold pl-1">
                            • {q.options?.length || 0} Options
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5 shrink-0 self-center">
                      <button
                        onClick={() => handleDuplicateQuestion(q.id)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-350 transition-colors"
                        title="Duplicate Question"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(q)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-600 dark:text-slate-350 transition-colors"
                        title="Edit Question"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 text-center bg-white dark:bg-slate-800 rounded-[32px] border border-dashed border-slate-200 dark:border-slate-700 max-w-md mx-auto">
                <HelpCircle className="h-12 w-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No Questions Added</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                  Add questions manually or switch to the <strong>Upload PDF</strong> tab to import them automatically.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={openCreateModal}
                    className="px-5 py-2.5 bg-brand-600 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5 inline mr-1" /> Add Manually
                  </button>
                  <button
                    onClick={() => setActiveTab('pdf')}
                    className="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-xs shadow-md"
                  >
                    <Upload className="h-3.5 w-3.5 inline mr-1" /> Upload PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* CRUD Form Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div 
            className={`bg-white dark:bg-slate-800 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[32px] p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-2xl relative animate-scale-up transition-all`}
          >


            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4 mb-6">
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {editingQuestion ? 'Edit Question' : 'Add Question'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-650 text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrUpdateQuestion} className="space-y-6">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question Type</label>
                  <select
                    value={type}
                    onChange={(e) => {
                      setType(e.target.value);
                      setCorrectAnswer(e.target.value === 'text' ? '' : 'A');
                    }}
                    className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium dark:bg-slate-800"
                  >
                    <option value="mcq">Multiple Choice (Single Correct)</option>
                    <option value="mcq_multi">Multiple Choice (Multiple Correct)</option>
                    <option value="text">Text Entry Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={marks}
                    onChange={(e) => setMarks(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-355 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Question Text</label>
                <SimpleEditor 
                  value={questionText}
                  onChange={setQuestionText}
                />
              </div>


              {(type === 'mcq' || type === 'mcq_multi') && (
                <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-205 dark:border-slate-700 space-y-4">
                  <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Multiple Choice Options</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[['A', optA, setOptA], ['B', optB, setOptB], ['C', optC, setOptC], ['D', optD, setOptD]].map(([key, val, setter]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Option {key}</label>
                          <label className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={type === 'mcq' ? correctAnswer === key : correctAnswerMulti.includes(key)}
                              onChange={(e) => {
                                if (type === 'mcq') {
                                  if (e.target.checked) {
                                    if (correctAnswer && correctAnswer !== key) {
                                      Swal.fire('Info', 'Only one correct answer is allowed. The answer has been changed to ' + key + '.', 'info');
                                    }
                                    setCorrectAnswer(key);
                                  } else {
                                    Swal.fire('Warning', 'A single choice question must have one correct answer selected.', 'warning');
                                  }
                                } else {
                                  if (e.target.checked) {
                                    setCorrectAnswerMulti(prev => [...prev, key]);
                                  } else {
                                    setCorrectAnswerMulti(prev => prev.filter(k => k !== key));
                                  }
                                }
                              }}
                              className="w-3.5 h-3.5 text-brand-600 rounded focus:ring-brand-500 bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-600 cursor-pointer"
                            />
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Correct</span>
                          </label>
                        </div>
                        <input
                          type="text"
                          required
                          value={val}
                          onChange={(e) => setter(e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border ${
                            (type === 'mcq' && correctAnswer === key) || (type === 'mcq_multi' && correctAnswerMulti.includes(key)) 
                              ? 'border-emerald-500 ring-1 ring-emerald-500/20 bg-emerald-50/10' 
                              : 'border-slate-300 dark:border-slate-750 bg-white dark:bg-slate-800'
                          } text-xs dark:text-white font-medium`}
                          placeholder={`Option ${key} description`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {type === 'text' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Correct Answer</label>
                    <textarea
                      rows={4}
                      required
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-355 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                      placeholder="Expected exact text match..."
                    />
                  </div>
                )}
                <div className={type === 'text' ? '' : 'sm:col-span-2'}>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Explanation (Optional)</label>
                  <textarea
                    rows={4}
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-350 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-brand-500 focus:border-brand-500 text-sm dark:text-white font-medium"
                    placeholder="Brief explanation of solution..."
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700/50 pt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3.5 border border-slate-300 dark:border-slate-700 text-sm font-semibold rounded-2xl text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/15 transition-all duration-200 text-sm flex items-center"
                >
                  <Save className="h-4 w-4 mr-2" /> {submitting ? 'Saving...' : editingQuestion ? 'Update Question' : 'Add Question'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuestionManagement;
