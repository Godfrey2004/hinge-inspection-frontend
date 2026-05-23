import { Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  return (
    <header className="w-full border-b border-slate-200/60 bg-white/50 backdrop-blur-md relative z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-slate-800">
            AI Hinge Inspection Platform
          </span>
        </motion.div>

        {/* Right Status Badge */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 cursor-default"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500 top-[1px] left-[1px]"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-700 tracking-wider uppercase">
            System Active
          </span>
        </motion.div>
      </div>
    </header>
  );
}
