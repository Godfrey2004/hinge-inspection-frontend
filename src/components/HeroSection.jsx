import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';

export default function HeroSection() {
  return (
    <div className="relative py-16 text-center space-y-6">
      {/* System Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold tracking-wide uppercase shadow-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        System Active · AI Vision Ready
      </motion.div>

      {/* Headline */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1 }}
        className="text-5xl md:text-6xl font-bold text-slate-900 tracking-tight leading-tight"
      >
        Intelligent Industrial
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-600">
          Hinge Inspection
        </span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.2 }}
        className="max-w-xl mx-auto text-lg text-slate-500 leading-relaxed font-light"
      >
        AI-powered left/right hinge analysis with real-time industrial monitoring.
        Upload video feeds to detect anomalies instantly with high precision.
      </motion.p>

      {/* Stats Strip */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.35 }}
        className="flex flex-wrap justify-center gap-6 pt-2"
      >
        {[
          { label: 'Accuracy', value: '98.4%' },
          { label: 'Avg. Inspect Time', value: '< 2s' },
          { label: 'Models Running', value: '1 Active' },
        ].map((stat) => (
          <div key={stat.label} className="flex items-center gap-2 text-sm">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-semibold text-slate-800">{stat.value}</span>
            <span className="text-slate-400">{stat.label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
