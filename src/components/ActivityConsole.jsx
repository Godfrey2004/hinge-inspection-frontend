import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TerminalSquare } from 'lucide-react';

const TYPE_STYLES = {
  info:    'text-blue-300',
  success: 'text-emerald-400',
  error:   'text-rose-400',
  warn:    'text-amber-400',
  system:  'text-slate-400',
};

const TYPE_DOT = {
  info:    'bg-blue-500',
  success: 'bg-emerald-500',
  error:   'bg-rose-500',
  warn:    'bg-amber-500',
  system:  'bg-slate-600',
};

export default function ActivityConsole({ logs, results, appState }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.55 }}
      className="glass-card p-5 flex flex-col"
      style={{ minHeight: 280 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <TerminalSquare className="w-4 h-4 text-blue-500" />
          AI Activity Console
        </h3>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Live</span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 bg-slate-950 rounded-xl p-4 overflow-y-auto max-h-64 font-mono text-[11px] space-y-1.5 scroll-smooth">
        <AnimatePresence initial={false}>
          {logs.map((log, i) => (
            <motion.div
              key={log.id ?? i}
              initial={{ opacity: 0, x: -8, height: 0 }}
              animate={{ opacity: 1, x: 0, height: 'auto' }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3 leading-relaxed"
            >
              <span className="text-slate-600 shrink-0 select-none">{log.time}</span>
              <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${TYPE_DOT[log.type] ?? TYPE_DOT.system}`} />
              <span className={TYPE_STYLES[log.type] ?? TYPE_STYLES.system}>
                {log.msg}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Blinking cursor */}
        <div className="flex items-center gap-3 mt-1">
          <span className="text-slate-700">{'>'}</span>
          <motion.span
            className="w-1.5 h-3.5 bg-blue-400 rounded-sm"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          />
        </div>
        <div ref={bottomRef} />
      </div>
    </motion.div>
  );
}
