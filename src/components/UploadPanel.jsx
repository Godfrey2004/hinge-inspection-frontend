import { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileVideo, X, Play, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function UploadPanel({ onFileSelect, onRunInspection, file, appState, uploadProgress, error }) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const isIdle       = appState === 'idle';
  const isReady      = appState === 'ready';
  const isProcessing = appState === 'processing';
  const isCompleted  = appState === 'completed';
  const isError      = appState === 'error';

  const handleFile = useCallback((f) => {
    if (f && f.type.startsWith('video/')) {
      onFileSelect(f);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = () => setIsDragOver(false);

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const isActive = isProcessing;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-card p-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/60 to-indigo-50/40 pointer-events-none" />

      <div className="relative z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center">
            <UploadCloud className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Upload Inspection Video</h3>
            <p className="text-xs text-slate-400">MP4, MOV, AVI up to 500MB</p>
          </div>
        </div>

        {/* Drop Zone */}
        <AnimatePresence mode="wait">
          {!file ? (
            <motion.div
              key="dropzone"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => inputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`
                relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
                transition-all duration-300 select-none
                ${isDragOver
                  ? 'border-blue-400 bg-blue-50/80 shadow-inner scale-[0.99]'
                  : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40'
                }
              `}
            >
              <motion.div
                animate={{ y: isDragOver ? -8 : 0 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className="flex flex-col items-center gap-4"
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-colors ${isDragOver ? 'bg-blue-100' : 'bg-white border border-slate-100 shadow-sm'}`}>
                  <UploadCloud className={`w-7 h-7 transition-colors ${isDragOver ? 'text-blue-600' : 'text-blue-400'}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {isDragOver ? 'Drop to upload' : 'Drag & drop or click to upload'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Video files only (.mp4, .mov, .avi)</p>
                </div>
              </motion.div>
              <input
                ref={inputRef}
                type="file"
                accept="video/*"
                className="sr-only"
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </motion.div>
          ) : (
            <motion.div
              key="file-info"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl border border-slate-100 bg-white/60 p-4 flex items-center gap-4"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <FileVideo className="w-5 h-5 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{file.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{formatSize(file.size)} · Ready for inspection</p>
              </div>
              {!isActive && !isCompleted && (
                <button
                  onClick={() => onFileSelect(null)}
                  className="w-7 h-7 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500 transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {isCompleted && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Banner */}
        <AnimatePresence>
          {isError && error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-rose-50 border border-rose-100 p-3 flex items-start gap-2.5 overflow-hidden"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-rose-700">Inspection Failed</p>
                <p className="text-xs text-rose-500 mt-0.5">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Section */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2.5 overflow-hidden"
            >
              {/* Status label */}
              <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3 h-3 animate-spin text-blue-500" />
                  Sending video to backend & running YOLO inference...
                </span>
                <span className="text-blue-500 font-semibold">
                  Analyzing
                </span>
              </div>

              {/* AI processing indeterminate bar */}
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full w-1/3 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full"
                  animate={{ x: ['0%', '250%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                />
              </div>

              {/* Steps */}
              <div className="flex gap-1">
                {['Upload', 'Frame Extract', 'AI Inference', 'Report'].map((step, i) => (
                  <motion.div
                    key={step}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.4 }}
                    className="flex-1 text-center text-[9px] text-slate-400 font-medium"
                  >
                    {step}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Run Inspection Button */}
        <AnimatePresence>
          {file && !isActive && (
            <motion.button
              id="run-inspection-btn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              whileHover={{ scale: isCompleted ? 1 : 1.01 }}
              whileTap={{ scale: isCompleted ? 1 : 0.98 }}
              onClick={onRunInspection}
              disabled={isCompleted}
              className={`
                w-full py-3 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2
                transition-all duration-300 shadow-md
                ${isCompleted
                  ? 'bg-emerald-500 text-white shadow-emerald-500/25 cursor-default'
                  : isError
                  ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/15 cursor-pointer'
                  : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/15 cursor-pointer'
                }
              `}
            >
              {isCompleted ? (
                <><CheckCircle2 className="w-4 h-4" /> Inspection Complete</>
              ) : (
                <><Play className="w-4 h-4" /> Run AI Inspection</>
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
