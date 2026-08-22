import React, { useState, useRef } from 'react';
import { X, Upload, Check, Image as ImageIcon, AlertCircle, Sparkles } from 'lucide-react';
import { storageService } from '../../services/storageService';

export const ImageUploadModal = ({ bucket = 'trip-covers', onUploaded, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const curatedPresets = storageService.getCuratedCoverImages();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file must be under 5MB.');
      return;
    }

    setError('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result);
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile && !previewUrl) return;

    setUploading(true);
    setProgress(20);

    try {
      let finalUrl = previewUrl;
      if (selectedFile) {
        setProgress(50);
        finalUrl = await storageService.uploadImage(selectedFile, bucket);
        setProgress(100);
      }
      onUploaded(finalUrl);
      onClose();
    } catch (err) {
      setError(err.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSelectPreset = (url) => {
    setSelectedFile(null);
    setPreviewUrl(url);
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              Upload Image to Supabase Storage
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Bucket: <span className="font-mono text-emerald-400 font-semibold">{bucket}</span></p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-4 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-slate-800/40 group"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <div className="text-xs font-semibold text-white">Click or drag image file here</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Supports PNG, JPG, WebP up to 5MB</div>
          </div>

          {/* Image Preview */}
          {previewUrl && (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 shadow-md">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-3">
                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Selected for Upload
                </span>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          {uploading && (
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading to Supabase Storage...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Preset Stock Photography */}
          <div className="pt-2">
            <div className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> Or pick a high-res travel preset:
            </div>
            <div className="grid grid-cols-4 gap-2">
              {curatedPresets.slice(0, 4).map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectPreset(url)}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                    previewUrl === url
                      ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                      : 'border-transparent hover:opacity-90'
                  }`}
                >
                  <img src={url} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!previewUrl || uploading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-40 transition-all"
          >
            {uploading ? 'Uploading...' : 'Confirm Image'}
          </button>
        </div>
      </div>
    </div>
  );
};