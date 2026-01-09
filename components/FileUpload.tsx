
import React, { useRef, useState } from 'react';
import { Upload, FileAudio, FileVideo, X, Loader2, Music } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (base64: string, mimeType: string) => void;
  isProcessing: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isProcessing }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const base64 = result.split(',')[1];
        onFileSelect(base64, file.type);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {!selectedFile ? (
        <label 
          className={`relative group flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-[2.5rem] cursor-pointer transition-all duration-500 overflow-hidden ${
            dragActive ? 'border-indigo-500 bg-indigo-500/5 ring-4 ring-indigo-500/20' : 'border-zinc-800 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-700 shadow-2xl'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="relative flex flex-col items-center justify-center p-12 text-center">
            <div className="p-6 bg-zinc-900 border border-zinc-800 rounded-3xl mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-all duration-500 shadow-xl group-hover:shadow-indigo-500/20 group-hover:border-indigo-500/50">
              <Upload className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="mb-3 text-3xl font-display font-bold text-white tracking-tight">
              Import Source Media
            </h3>
            <div className="flex items-center space-x-6 text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em] mt-4">
              <div className="flex items-center space-x-2 group-hover:text-indigo-300 transition-colors">
                <FileVideo className="w-4 h-4" />
                <span>Video Assets</span>
              </div>
              <div className="w-1.5 h-1.5 bg-zinc-800 rounded-full" />
              <div className="flex items-center space-x-2 group-hover:text-cyan-300 transition-colors">
                <Music className="w-4 h-4" />
                <span>Audio Uploads</span>
              </div>
            </div>
            <p className="mt-8 text-zinc-600 text-xs font-medium max-w-xs">
              Drag & drop MP4, MOV, MP3, or WAV files up to 20MB for precision analysis.
            </p>
          </div>
          <input ref={inputRef} type="file" className="hidden" accept="video/*,audio/*" onChange={handleChange} />
        </label>
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <div className="flex items-center space-x-6">
            <div className="p-5 bg-black/50 border border-zinc-800 rounded-2xl shadow-inner">
              {selectedFile.type.startsWith('video/') ? (
                <FileVideo className="w-8 h-8 text-indigo-400" />
              ) : (
                <FileAudio className="w-8 h-8 text-cyan-400" />
              )}
            </div>
            <div className="space-y-1">
              <p className="font-display font-bold text-xl text-white truncate max-w-xs md:max-w-md">{selectedFile.name}</p>
              <div className="flex items-center space-x-3">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-2 py-0.5 rounded">
                  {selectedFile.type.split('/')[1].toUpperCase()}
                </span>
                <span className="text-xs text-zinc-600">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            {isProcessing && (
              <div className="flex items-center space-x-3 bg-indigo-500/10 border border-indigo-500/20 px-6 py-3 rounded-2xl">
                <Loader2 className="w-5 h-5 text-indigo-400 animate-spin" />
                <span className="text-sm font-bold text-indigo-300 uppercase tracking-widest animate-pulse">Deep Analysis</span>
              </div>
            )}
            <button 
              onClick={() => setSelectedFile(null)}
              className="p-3 hover:bg-red-500/10 rounded-2xl transition-all text-zinc-600 hover:text-red-400 border border-transparent hover:border-red-500/20"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
