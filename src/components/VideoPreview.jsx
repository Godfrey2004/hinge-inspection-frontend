import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Loader2, TerminalSquare } from 'lucide-react';



export default function VideoPreview({ file, appState, results, processedVideoUrl, onLiveUpdate }) {
  const videoRef = useRef(null);
  const objectUrlRef = useRef(null);

  const isIdle = appState === 'idle';
  const isProcessing = appState === 'processing';
  const isCompleted = appState === 'completed';

  // Show backend processed video once done, otherwise preview local file
  useEffect(() => {
    if (!videoRef.current) return;

    if (isCompleted && processedVideoUrl) {
      // Revoke any existing blob URL
      if (objectUrlRef.current) { URL.revokeObjectURL(objectUrlRef.current); objectUrlRef.current = null; }
      videoRef.current.src = processedVideoUrl;
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
    } else if (file && !isCompleted) {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      videoRef.current.src = url;
      videoRef.current.load();
      videoRef.current.play().catch(e => console.log('Autoplay prevented:', e));
    }

    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, [file, isCompleted, processedVideoUrl]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || !results?.timeline || !isCompleted) return;
    
    const currentTime = videoRef.current.currentTime;
    let currentState = null;
    
    // Find the state in timeline that applies to the current time
    for (let i = 0; i < results.timeline.length; i++) {
      if (results.timeline[i].time <= currentTime) {
        currentState = results.timeline[i];
      } else {
        break;
      }
    }
    
    if (currentState && onLiveUpdate) {
      onLiveUpdate({
        left: currentState.left ? 'Present' : 'Missing',
        right: currentState.right ? 'Present' : 'Missing'
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.45 }}
      className="glass-panel p-2 relative"
    >

      {/* Video Container */}
      <div className="w-full aspect-video rounded-2xl bg-slate-900 relative overflow-hidden">
        {/* Empty State */}
        <AnimatePresence>
          {isIdle && (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-slate-600"
            >
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Video className="w-7 h-7 text-slate-600" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-slate-500">Video Preview</p>
                <p className="text-xs text-slate-600 mt-1">Upload a video to begin</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Video Player (shows when file is selected) */}
        <AnimatePresence>
          {file && (
            <motion.div
              className="relative w-full h-full bg-slate-50 rounded-2xl overflow-hidden border border-slate-200"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <video
                ref={videoRef}
                autoPlay
                loop
                muted
                playsInline
                onTimeUpdate={handleTimeUpdate}
                className="w-full h-full object-contain bg-black"
                controls={isCompleted}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Processing Overlay */}
        <AnimatePresence>
          {isProcessing && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-6"
            >
              {/* Scanning animation */}
              <div className="relative w-32 h-32">
                <motion.div
                  className="absolute inset-0 rounded-xl border-2 border-blue-400/60"
                  animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ repeat: Infinity, duration: 1.6 }}
                />
                <motion.div
                  className="absolute inset-3 rounded-lg border border-indigo-400/40"
                  animate={{ scale: [1, 0.92, 1], opacity: [0.4, 0.8, 0.4] }}
                  transition={{ repeat: Infinity, duration: 1.6, delay: 0.2 }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                </div>
                {/* Scanning line */}
                <motion.div
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">Analyzing Hinge Components</p>
                <p className="text-slate-400 text-xs mt-1">AI vision model processing frames...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>


      </div>

    </motion.div>
  );
}
