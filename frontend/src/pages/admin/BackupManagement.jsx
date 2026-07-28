import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { 
  Database, Download, Upload, ShieldAlert, CheckCircle, 
  AlertCircle, FileText, FileSpreadsheet, Server, RefreshCw, 
  Info, ArrowLeft, HardDrive, Lock
} from 'lucide-react';

const BackupManagement = () => {
  const [downloading, setDownloading] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });
  const fileInputRef = useRef(null);

  const handleDownload = async (type, filenamePrefix) => {
    try {
      setDownloading(type);
      setStatusMsg({ type: '', text: '' });

      const response = await api.get(`/api/admin/backup/download/${type}`, {
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Try to get filename from content-disposition header or generate fallback
      const contentDisposition = response.headers['content-disposition'];
      let filename = `${filenamePrefix}_${new Date().toISOString().slice(0,19).replace(/[:-]/g, '')}`;
      if (type === 'db') filename += '.db';
      else if (type === 'sql') filename += '.sql';
      else if (type === 'csv') filename += '.zip';

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      setStatusMsg({
        type: 'success',
        text: `Successfully downloaded ${filenamePrefix.toUpperCase()} backup file.`
      });
    } catch (err) {
      console.error("Download failed:", err);
      let errMsg = "Failed to download backup file. Please ensure you have admin privileges.";
      if (err.response && err.response.data instanceof Blob) {
        try {
          const textData = await err.response.data.text();
          const json = JSON.parse(textData);
          if (json.detail) errMsg = json.detail;
        } catch (_) {}
      }
      setStatusMsg({ type: 'error', text: errMsg });
    } finally {
      setDownloading(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    if (!name.endsWith(".db") && !name.endsWith(".sqlite") && !name.endsWith(".sql") && !name.endsWith(".zip")) {
      setStatusMsg({
        type: 'error',
        text: 'Invalid file format. Please upload a .db, .sql, or .zip CSV archive backup file.'
      });
      return;
    }

    setUploadFile(file);
    setStatusMsg({ type: '', text: '' });
    setRestoreModalOpen(true);
  };

  const executeRestore = async () => {
    if (!uploadFile) return;

    try {
      setUploading(true);
      setStatusMsg({ type: '', text: '' });

      const formData = new FormData();
      formData.append('file', uploadFile);

      const response = await api.post('/api/admin/backup/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setStatusMsg({
        type: 'success',
        text: response.data.message || 'Database successfully restored from backup!'
      });
      setRestoreModalOpen(false);
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error("Restore failed:", err);
      const errMsg = err.response?.data?.detail || "Failed to restore database from backup file.";
      setStatusMsg({ type: 'error', text: errMsg });
      setRestoreModalOpen(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 min-h-screen p-6 sm:p-8 transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <div>
            <Link 
              to="/admin/dashboard" 
              className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700 transition-colors mb-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Admin Control Center</span>
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
              <div className="p-2.5 bg-brand-500/10 text-brand-500 rounded-2xl">
                <Database className="h-7 w-7" />
              </div>
              Database Backup & Restore Console
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm max-w-2xl">
              Safeguard your platform data. Export instant full-project database backups in multiple standard formats or restore your site automatically in one click if data is ever lost.
            </p>
          </div>
        </div>

        {/* Status Messages */}
        {statusMsg.text && (
          <div className={`p-4 rounded-2xl flex items-center justify-between gap-3 ${
            statusMsg.type === 'success' 
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}>
            <div className="flex items-center gap-3">
              {statusMsg.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <span className="text-sm font-semibold">{statusMsg.text}</span>
            </div>
            <button 
              onClick={() => setStatusMsg({ type: '', text: '' })}
              className="text-xs font-bold underline hover:opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Section 1: Export Backups */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="h-5 w-5 text-brand-500" />
            <span>Download Database Backups</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your preferred archive format to download a snapshot of all user profiles, topics, mock tests, questions, and attempt results.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            
            {/* Card 1: SQLite DB */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <HardDrive className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">SQLite Binary File (.db)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Direct raw database file clone. Best for quick full restorations or opening in visual SQLite database explorers like DBeaver.
                </p>
              </div>
              <button
                onClick={() => handleDownload('db', 'a1tiexam_db')}
                disabled={downloading !== null}
                className="mt-6 w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-indigo-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                {downloading === 'db' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download .DB File</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 2: SQL Dump */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Universal SQL Dump (.sql)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Relational SQL script with full table schemas and INSERT statements. Universal format compatible with SQLite, PostgreSQL, and MySQL.
                </p>
              </div>
              <button
                onClick={() => handleDownload('sql', 'a1tiexam_sql')}
                disabled={downloading !== null}
                className="mt-6 w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                {downloading === 'sql' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download .SQL Dump</span>
                  </>
                )}
              </button>
            </div>

            {/* Card 3: CSV ZIP Archive */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200/60 dark:border-slate-700/60 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileSpreadsheet className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">CSV Spreadsheets (.zip)</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  Packages every database table into a clean CSV spreadsheet inside a ZIP archive. Perfect for data analysis in Excel or Google Sheets.
                </p>
              </div>
              <button
                onClick={() => handleDownload('csv', 'a1tiexam_csv')}
                disabled={downloading !== null}
                className="mt-6 w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center space-x-2 transition-all"
              >
                {downloading === 'csv' ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    <span>Download .ZIP Archive</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Section 2: Upload & Restore */}
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-[32px] border border-slate-200/60 dark:border-slate-700/60 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/50 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Upload className="h-5 w-5 text-brand-500" />
                <span>Automatic Database Restoration</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload a previously saved `.db`, `.sql`, or `.zip` backup file to immediately recover lost site data.
              </p>
            </div>
            <div className="p-2.5 bg-amber-500/10 text-amber-500 rounded-2xl hidden sm:block">
              <ShieldAlert className="h-6 w-6" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            
            {/* Upload Zone */}
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-brand-500 dark:hover:border-brand-500 rounded-3xl p-8 text-center cursor-pointer bg-slate-50/50 dark:bg-slate-850/50 hover:bg-brand-500/5 transition-all group"
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept=".db,.sqlite,.sql,.zip" 
                className="hidden" 
              />
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <Upload className="h-7 w-7" />
              </div>
              <h4 className="font-bold text-base text-slate-800 dark:text-white">Click to select backup file</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports `.db` (SQLite), `.sql` (Dump), or `.zip` (CSV Archive)</p>
              <span className="inline-block mt-4 px-4 py-2 bg-white dark:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl shadow-sm border border-slate-200 dark:border-slate-600 group-hover:bg-brand-500 group-hover:text-white group-hover:border-brand-500 transition-colors">
                Browse System Files
              </span>
            </div>

            {/* Safety instructions */}
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="font-bold block text-slate-800 dark:text-white mb-1">Automatic Safety Checkpoint</strong>
                  Whenever you upload a backup file, our server automatically creates a timestamped safety copy of your active database before executing restoration.
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-3">
                <Lock className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  <strong className="font-bold block text-slate-800 dark:text-white mb-1">Admin Authorization Required</strong>
                  Restoration replaces or merges data across all user and examination tables. Ensure no students are actively taking an exam during restoration.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Confirmation Modal */}
      {restoreModalOpen && uploadFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-md w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center space-x-3 text-amber-600 dark:text-amber-400">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                <ShieldAlert className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Data Restoration</h3>
                <span className="text-xs text-slate-400">Disaster Recovery Action</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              You are about to restore the database from <strong className="text-slate-900 dark:text-white font-bold">"{uploadFile.name}"</strong> ({Math.round(uploadFile.size / 1024)} KB). 
              Existing records will be updated or replaced to match the backup state. Do you wish to proceed?
            </p>

            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => {
                  setRestoreModalOpen(false);
                  setUploadFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={uploading}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={executeRestore}
                disabled={uploading}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 flex items-center space-x-2 transition-all"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Restoring...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Yes, Restore Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BackupManagement;
