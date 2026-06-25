import React from 'react';
import { motion } from 'framer-motion';

interface XPBarProps {
  xp: number;
  level: number;
  compact?: boolean;
}

export const XPBar: React.FC<XPBarProps> = ({ xp, level, compact = false }) => {
  const currentXPInLevel = xp % 100;
  const progressPercent = Math.min(100, Math.max(0, currentXPInLevel));
  const xpNeeded = 100 - currentXPInLevel;

  if (compact) {
    return (
      <div className="w-full">
        <div className="flex justify-between items-center text-xs text-slate-400 mb-1">
          <span className="font-semibold text-blue-400">Lv. {level}</span>
          <span>{xp} XP</span>
        </div>
        <div className="h-2 w-full bg-slate-900/80 rounded-full overflow-hidden border border-slate-800">
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full glass-panel p-4 rounded-xl bg-slate-950/40">
      <div className="flex justify-between items-end mb-2">
        <div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Level Progress</span>
          <h4 className="text-xl font-bold text-slate-200 mt-0.5">Level {level}</h4>
        </div>
        <div className="text-right">
          <span className="text-sm font-bold text-blue-400">{xp}</span>
          <span className="text-xs text-slate-400"> Total XP</span>
          <div className="text-xs text-slate-500">{xpNeeded} XP to Level {level + 1}</div>
        </div>
      </div>
      <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800/80">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 font-medium">
        <span>0 XP</span>
        <span>{currentXPInLevel}% towards Level {level + 1}</span>
        <span>100 XP</span>
      </div>
    </div>
  );
};
