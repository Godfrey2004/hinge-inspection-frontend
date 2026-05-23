import { useState, useCallback, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import axios from 'axios';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import UploadPanel from './components/UploadPanel';
import VideoPreview from './components/VideoPreview';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ActivityConsole from './components/ActivityConsole';
import { getProcessedVideoUrl } from './services/api';
import { generateReport } from './utils/pdfGenerator';

function getTimestamp() {
  return new Date().toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function makeLog(type, msg) {
  return { id: Date.now() + Math.random(), time: getTimestamp(), type, msg };
}

// Map backend snake_case response → frontend camelCase results shape
function mapResults(data) {
  return {
    leftHinge:   data.left_hinge === 'OK' ? 'Present' : 'Missing',
    rightHinge:  data.right_hinge === 'OK' ? 'Present' : 'Missing',
    totalHinges: data.total_hinges ?? 0,
    result:      data.inspection === 'PASS' ? 'Good' : 'Missing',
    confidence:  data.confidence != null ? `${data.confidence}%` : 'N/A',
    outputVideo: data.output_video ?? null,
    timeline:    data.timeline ?? [],
  };
}

export default function App() {
  const [appState, setAppState] = useState('idle'); // idle | ready | processing | completed | error
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [processedVideoUrl, setProcessedVideoUrl] = useState(null);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([
    makeLog('system', 'System initialized. Awaiting video input.'),
  ]);
  const [liveStats, setLiveStats] = useState({ left: null, right: null });

  // Force scroll to top on refresh
  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
  }, []);

  const addLog = useCallback((type, msg) => {
    setLogs((prev) => [...prev, makeLog(type, msg)]);
  }, []);

  const handleExport = useCallback(() => {
    generateReport(results, file, logs, liveStats);
    addLog('system', 'PDF Inspection Report generated successfully.');
  }, [results, file, logs, liveStats, addLog]);

  const handleFileSelect = useCallback((f) => {
    setFile(f);
    setResults(null);
    setProcessedVideoUrl(null);
    setError(null);
    setUploadProgress(0);

    if (f) {
      setAppState('ready');
      setLogs([makeLog('info', `File selected: "${f.name}" (${(f.size / 1e6).toFixed(2)} MB)`)]);
    } else {
      setAppState('idle');
      setLogs([makeLog('system', 'System ready. Upload a video to begin.')]);
    }
  }, []);

  const handleRunInspection = useCallback(async () => {
    if (!file || appState !== 'ready') return;

    setError(null);
    setUploadProgress(0);
    addLog('info', 'Upload started — sending video to backend...');

    // ── Switch to processing immediately so UI never appears frozen ──────
    // On localhost, onUploadProgress doesn't fire intermediate events,
    // so we show the AI animation right away instead of waiting for pct===100.
    setAppState('processing');
    addLog('success', 'Video received. AI engine initializing...');
    addLog('info', 'Loading hinge detection model (YOLO)...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      // Send file + wait for YOLO to finish (backend is synchronous)
      const uploadResponse = await axios.post('http://127.0.0.1:8000/upload-video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // ── Phase 2: Response received ──────────────────────────────────────
      addLog('info', 'Processing frames — running YOLO inference...');

      const data = uploadResponse.data;

      // ── Phase 3: Parse & finish ─────────────────────────────────────────
      const mapped = mapResults(data);
      setResults(mapped);

      if (mapped.outputVideo) {
        setProcessedVideoUrl(getProcessedVideoUrl(mapped.outputVideo));
        addLog('info', 'Processed video ready.');
      }

      // Hinge-specific logs
      if (mapped.leftHinge === 'Present') {
        addLog('success', `Left hinge detected (Confidence: ${mapped.confidence}).`);
      } else {
        addLog('error', 'Left hinge not found in video region.');
      }

      if (mapped.rightHinge === 'Present') {
        addLog('success', `Right hinge detected (Confidence: ${mapped.confidence}).`);
      } else {
        addLog('error', 'Right hinge not found in video region.');
      }

      if (mapped.result === 'Good') {
        addLog('success', 'Inspection result: PASS — all components detected.');
      } else {
        addLog('error', `Inspection result: FAIL — ${mapped.totalHinges} of 2 hinges detected.`);
      }

      addLog('system', 'AI session complete. Report generated.');
      setAppState('completed');

    } catch (err) {
      const msg =
        err?.response?.data?.detail ??
        (err.code === 'ERR_NETWORK'
          ? 'Cannot reach backend. Make sure the server is running on http://127.0.0.1:8000.'
          : err.message ?? 'An unexpected error occurred.');

      setError(msg);
      addLog('error', `Error: ${msg}`);
      setAppState('error');
    }
  }, [file, appState, addLog]);

  useEffect(() => {
    if (appState === 'completed') {
      setTimeout(() => {
        document.getElementById('video-preview-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }
  }, [appState]);

  return (
    <div className="min-h-screen pb-28 relative overflow-x-hidden">
      {/* Background Blobs */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-300/15 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 right-0 w-[700px] h-[500px] bg-indigo-300/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="fixed top-1/2 left-0 w-[400px] h-[400px] bg-violet-200/10 blur-[100px] rounded-full pointer-events-none" />

      <Navbar />

      <main className="max-w-[1400px] mx-auto px-6 pt-6 space-y-6 relative z-10">
        <HeroSection />

        <UploadPanel
          file={file}
          appState={appState}
          uploadProgress={uploadProgress}
          error={error}
          onFileSelect={handleFileSelect}
          onRunInspection={handleRunInspection}
        />

        <div id="video-preview-section" className="scroll-mt-20 grid grid-cols-1 lg:grid-cols-[1fr_300px] xl:grid-cols-[1fr_340px] gap-7">
          {/* Left Column */}
          <div className="space-y-6 flex flex-col">
            <VideoPreview
              file={file}
              appState={appState}
              results={results}
              processedVideoUrl={processedVideoUrl}
              onLiveUpdate={setLiveStats}
            />
            <AnalyticsDashboard
              appState={appState}
              file={file}
              results={results}
              liveStats={liveStats}
              onExport={handleExport}
            />
          </div>

          {/* Right Column */}
          <div className="space-y-7 flex flex-col">
            <ActivityConsole logs={logs} results={results} appState={appState} />

            {/* Plain Timeline Summary */}
            {appState === 'completed' && results?.timeline && (
              <div className="glass-card p-5 mt-4 text-sm text-slate-600 space-y-3 font-medium">
                <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-800 uppercase tracking-widest text-[11px]">Video Composition (Frames)</span>
                </div>
                {(() => {
                  const video = document.querySelector('video');
                  const duration = (video && video.duration && !isNaN(video.duration)) ? video.duration : 
                                   (results.timeline.length > 1 ? results.timeline[results.timeline.length-1].time + 2 : 10);
                  
                  const chartData = results.timeline.map(f => ({
                    time: f.time,
                    left: f.left ? 1 : 0,
                    right: f.right ? 1 : 0
                  }));
                  
                  if (chartData.length > 0) {
                    chartData.push({
                      time: duration,
                      left: chartData[chartData.length - 1].left,
                      right: chartData[chartData.length - 1].right
                    });
                  }

                  return (
                    <div className="space-y-6 mt-4">
                      {/* Left Hinge Timeline */}
                      <div className="h-24">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 pl-4">Left Hinge Timeline</div>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -40, bottom: 0 }}>
                            <defs>
                              <linearGradient id="signalColor" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="40%" stopColor="#10b981" />
                                <stop offset="60%" stopColor="#f43f5e" />
                              </linearGradient>
                            </defs>
                            <XAxis dataKey="time" type="number" domain={[0, duration]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(val) => `${val}s`} />
                            <YAxis domain={[-0.2, 1.2]} tick={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                              labelFormatter={(v) => `${Number(v).toFixed(2)}s`}
                              formatter={(val) => [val === 1 ? 'Present' : 'Missing', 'Left Hinge']}
                            />
                            <Line type="stepAfter" dataKey="left" stroke="url(#signalColor)" strokeWidth={3} dot={false} isAnimationActive={true} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Right Hinge Timeline */}
                      <div className="h-24">
                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-2 pl-4">Right Hinge Timeline</div>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={chartData} margin={{ top: 5, right: 10, left: -40, bottom: 0 }}>
                            <XAxis dataKey="time" type="number" domain={[0, duration]} tick={{ fontSize: 9, fill: '#94a3b8' }} tickFormatter={(val) => `${val}s`} />
                            <YAxis domain={[-0.2, 1.2]} tick={false} axisLine={false} />
                            <Tooltip 
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                              labelFormatter={(v) => `${Number(v).toFixed(2)}s`}
                              formatter={(val) => [val === 1 ? 'Present' : 'Missing', 'Right Hinge']}
                            />
                            <Line type="stepAfter" dataKey="right" stroke="url(#signalColor)" strokeWidth={3} dot={false} isAnimationActive={true} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
