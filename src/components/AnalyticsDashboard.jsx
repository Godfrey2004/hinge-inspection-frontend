import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Activity, Hash, ShieldCheck, BarChart3, FileDown } from 'lucide-react';

const SHIMMER = (
  <div className="animate-pulse h-6 w-20 rounded-lg bg-slate-200" />
);

function StatCard({ id, title, value, icon: Icon, status, delay, isLoading }) {
  const variants = {
    pass:    'text-emerald-600 bg-emerald-50 border-emerald-100',
    fail:    'text-rose-600    bg-rose-50    border-rose-100',
    warning: 'text-amber-600  bg-amber-50   border-amber-100',
    neutral: 'text-blue-500   bg-blue-50    border-blue-100',
    idle:    'text-slate-400  bg-slate-50   border-slate-100',
  };

  const dotVariants = {
    pass: 'bg-emerald-400',
    fail: 'bg-rose-400',
    warning: 'bg-amber-400',
    neutral: 'bg-blue-400',
    idle: 'bg-slate-300',
  };

  const color = variants[status] ?? variants.idle;
  const dot = dotVariants[status] ?? dotVariants.idle;

  return (
    <motion.div
      id={id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay }}
      whileHover={{ y: -2, boxShadow: '0 12px 30px -8px rgba(0,0,0,0.08)' }}
      className="glass-card p-5 flex items-start gap-4 transition-shadow cursor-default"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-2">{title}</p>
        {isLoading ? (
          SHIMMER
        ) : (
          <p className="text-xl font-bold text-slate-900 leading-none">
            {value}
          </p>
        )}
      </div>
      <div className={`w-2 h-2 rounded-full mt-1 ${dot} ${status !== 'idle' ? 'animate-pulse' : ''}`} />
    </motion.div>
  );
}

export default function AnalyticsDashboard({ appState, file, results, liveStats, onExport }) {
  const isProcessing = appState === 'processing';
  const isCompleted  = appState === 'completed';
  const hasFile      = appState !== 'idle';

  const r = results ?? {};
  
  // Use live stats if video is playing, fallback to final aggregated results
  const leftVal  = liveStats?.left  ?? r.leftHinge  ?? 'N/A';
  const rightVal = liveStats?.right ?? r.rightHinge ?? 'N/A';
  
  // Dynamically compute inspection based on current left/right status
  const inspectionVal = (leftVal === 'Present' && rightVal === 'Present') ? 'Good' : 'Missing';

  const cards = [
    {
      id: 'card-left-hinge',
      title: 'Left Hinge',
      value: isCompleted ? (leftVal ?? 'N/A') : hasFile ? '---' : 'Waiting',
      icon: isCompleted ? (leftVal === 'Present' ? CheckCircle2 : XCircle) : CheckCircle2,
      status: isCompleted ? (leftVal === 'Present' ? 'pass' : 'fail') : hasFile ? 'neutral' : 'idle',
      delay: 0,
    },
    {
      id: 'card-right-hinge',
      title: 'Right Hinge',
      value: isCompleted ? (rightVal ?? 'N/A') : hasFile ? '---' : 'Waiting',
      icon: isCompleted ? (rightVal === 'Present' ? CheckCircle2 : XCircle) : CheckCircle2,
      status: isCompleted ? (rightVal === 'Present' ? 'pass' : 'fail') : hasFile ? 'neutral' : 'idle',
      delay: 0.07,
    },
    {
      id: 'card-total-hinges',
      title: 'Total Hinges',
      value: isCompleted ? String(r.totalHinges ?? 0) : hasFile ? '---' : '0',
      icon: Hash,
      status: isCompleted ? 'neutral' : 'idle',
      delay: 0.14,
    },
    {
      id: 'card-inspection',
      title: 'Inspection',
      value: isCompleted ? inspectionVal : hasFile ? '---' : 'Pending',
      icon: ShieldCheck,
      status: isCompleted ? (inspectionVal === 'Good' ? 'pass' : 'fail') : 'idle',
      delay: 0.21,
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2 px-1 mb-1">
        <BarChart3 className="w-4 h-4 text-blue-500" />
        <h3 className="text-sm font-semibold text-slate-800">Live Analytics</h3>
        
        <AnimatePresence>
          {isProcessing && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full"
            >
              ANALYZING
            </motion.span>
          )}
          {isCompleted && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onExport}
              className="ml-auto flex items-center gap-1.5 text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
            >
              <FileDown className="w-3 h-3" />
              EXPORT REPORT
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <StatCard key={card.id} {...card} isLoading={isProcessing} />
        ))}
      </div>
    </motion.div>
  );
}
