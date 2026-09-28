import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storageService';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Download, 
  X, 
  RefreshCw, 
  File
} from 'lucide-react';

export function MedicalRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Lab Report');
  const [selectedFile, setSelectedFile] = useState(null);

  const loadRecords = useCallback(async () => {
    if (!user?.uid) return;
    setLoading(true);
    try {
      const data = await firestoreService.getUserMedicalRecords(user.uid);
      setRecords(data || []);
    } catch (err) {
      console.warn('Failed to load medical records:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  const handleUpload = async (e) => {
    e.preventDefault();
    setError(null);
    if (!selectedFile) {
      setError('Please select a document or image file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a document title.');
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Firebase Storage (with instant fallback)
      const uploadResult = await storageService.uploadMedicalDocument(user?.uid || 'guest', selectedFile);

      // 2. Save metadata record into Firestore (with instant local store)
      const newRec = await firestoreService.createMedicalRecord({
        userId: user?.uid || 'guest',
        title: title.trim(),
        category,
        fileName: uploadResult.fileName,
        fileUrl: uploadResult.downloadUrl,
        storagePath: uploadResult.storagePath,
        fileSize: uploadResult.size,
        fileType: uploadResult.type,
        uploadedAt: new Date().toLocaleDateString()
      });

      // Update state immediately and close modal
      setRecords(prev => [newRec, ...(prev || [])]);
      setUploadModalOpen(false);
      setTitle('');
      setSelectedFile(null);
    } catch (err) {
      setError(err.message || 'File upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete "${record.title}"?`)) return;
    try {
      if (record.storagePath) {
        storageService.deleteDocument(record.storagePath).catch(() => {});
      }
      await firestoreService.deleteMedicalRecord(record.id, user?.uid);
      setRecords(prev => (prev || []).filter(r => r.id !== record.id));
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  return (
    <div className="space-y-6 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Medical Records</h1>
          <p className="text-xs text-slate-500">Secure repository for diagnostic scans, blood panels, and clinical encounter notes.</p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer w-fit"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* List or Empty State */}
      {loading ? (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading your medical files...</p>
        </div>
      ) : records.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {records.map((rec) => (
            <div key={rec.id} className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {rec.category || 'General Document'}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {rec.uploadedAt}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{rec.title}</h3>
                <p className="text-xs text-slate-500 truncate mt-1 flex items-center gap-1.5">
                  <File className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{rec.fileName || 'Attachment'}</span>
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={rec.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-indigo-600 hover:underline font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>View / Download</span>
                </a>

                <button
                  onClick={() => handleDelete(rec)}
                  className="text-slate-400 hover:text-rose-600 p-1 rounded-lg transition-colors cursor-pointer"
                  title="Delete Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
          <FileText className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">No medical records yet</h3>
            <p className="text-xs text-slate-400 mt-1">
              Your uploaded medical documents will appear here.
            </p>
          </div>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer inline-flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>
      )}

      {/* Upload Modal */}
      {uploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 text-white flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold">Upload Medical Document</h3>
              </div>
              <button 
                onClick={() => setUploadModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-6 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs border border-rose-200">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete Blood Count (CBC) Panel"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  <option value="Lab Report">Lab Report</option>
                  <option value="Imaging / Radiology">Imaging / Radiology (X-Ray, MRI, CT)</option>
                  <option value="Prescription">Prescription</option>
                  <option value="Discharge Summary">Discharge Summary</option>
                  <option value="Vaccination Record">Vaccination Record</option>
                  <option value="Insurance Claim">Insurance Claim</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select File (PDF, Image, Scan)</label>
                <input
                  type="file"
                  required
                  accept=".pdf,image/*,.docx"
                  onChange={(e) => setSelectedFile(e.target.files[0] || null)}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {uploading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Upload to Cloud</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
