import React, { useState, useEffect } from 'react';
import { Award, ShieldAlert, Flame, Zap, CheckCircle2, Trophy, Crown, UserPlus, Footprints, Lock, Loader2 } from 'lucide-react';
import api from '../services/api.js';
import { Achievement } from '../types/index.js';
import { GlassCard } from '../components/GlassCard.js';

const BADGE_TEMPLATES = [
  {
    name: 'First Step',
    description: 'Logged your very first daily goal activity.',
    iconName: 'Footprints',
  },
  {
    name: 'Perfect Day',
    description: 'Achieved 100% completion rate on all planned goals for a single day.',
    iconName: 'CheckCircle',
  },
  {
    name: 'Streak Starter',
    description: 'Maintained a daily goal streak of 3 consecutive days.',
    iconName: 'Zap',
  },
  {
    name: 'Consistent Tracker',
    description: 'Maintained a daily goal streak of 7 consecutive days.',
    iconName: 'CalendarDays',
  },
  {
    name: 'Unstoppable',
    description: 'Maintained a daily goal streak of 30 consecutive days.',
    iconName: 'Flame',
  },
  {
    name: 'Goal Crusher',
    description: 'Completed 10 goals in total.',
    iconName: 'Trophy',
  },
  {
    name: 'Centurion',
    description: 'Completed 100 goals in total.',
    iconName: 'Crown',
  },
  {
    name: 'XP Novice',
    description: 'Earned 100 XP and reached Level 2.',
    iconName: 'UserPlus',
  },
  {
    name: 'XP Expert',
    description: 'Earned 500 XP and reached Level 6.',
    iconName: 'ShieldAlert',
  },
];

export const Achievements: React.FC = () => {
  const [unlocked, setUnlocked] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAchievements = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/achievements');
      setUnlocked(res.data.achievements);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const isUnlocked = (badgeName: string) => {
    return unlocked.find((u) => u.badgeName.toLowerCase() === badgeName.toLowerCase());
  };

  const getBadgeIcon = (iconName: string, active: boolean) => {
    const size = 32;
    const colorClass = active ? 'text-amber-400' : 'text-slate-650';

    switch (iconName) {
      case 'Footprints':
        return <Footprints size={size} className={colorClass} />;
      case 'CheckCircle':
        return <CheckCircle2 size={size} className={colorClass} />;
      case 'Zap':
        return <Zap size={size} className={active ? 'text-blue-400 animate-pulse' : 'text-slate-650'} />;
      case 'Flame':
        return <Flame size={size} className={active ? 'text-amber-500 animate-bounce' : 'text-slate-650'} />;
      case 'Trophy':
        return <Trophy size={size} className={colorClass} />;
      case 'Crown':
        return <Crown size={size} className={colorClass} />;
      case 'UserPlus':
        return <UserPlus size={size} className={colorClass} />;
      case 'ShieldAlert':
        return <ShieldAlert size={size} className={colorClass} />;
      default:
        return <Award size={size} className={colorClass} />;
    }
  };

  const pct = BADGE_TEMPLATES.length > 0 ? (unlocked.length / BADGE_TEMPLATES.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header Summary */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-200">Achievements & Badges</h2>
          <p className="text-xs text-slate-500">Collect XP, build streaks, and unlock milestone badges.</p>
        </div>
      </div>

      {/* Summary Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-gradient-to-r from-slate-950/20 to-slate-900/10 border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-400">{unlocked.length}</span>
            <span className="text-slate-450 text-sm font-semibold">/ {BADGE_TEMPLATES.length} Badges Unlocked</span>
          </div>
          <p className="text-xs text-slate-500">Maintain daily habits to earn achievements and raise your tier.</p>
        </div>

        {/* Progress bar */}
        <div className="w-full md:w-80 space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>Collection Completion</span>
            <span>{pct.toFixed(0)}%</span>
          </div>
          <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-amber-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,0.3)] transition-all duration-800"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-24 glass-panel rounded-2xl">
          <Loader2 className="h-7 w-7 animate-spin text-blue-500 mb-2" />
          <span className="text-xs text-slate-550">Loading achievement vault...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BADGE_TEMPLATES.map((tmpl) => {
            const unlockRecord = isUnlocked(tmpl.name);
            const active = !!unlockRecord;

            return (
              <div
                key={tmpl.name}
                className={`glass-panel p-5 rounded-2xl relative overflow-hidden flex items-center gap-4 transition-all ${
                  active
                    ? 'border-amber-500/25 bg-amber-955/5 shadow-[0_0_12px_rgba(245,158,11,0.02)]'
                    : 'opacity-50'
                }`}
              >
                {/* Badge Icon circle */}
                <div className={`p-4 rounded-xl flex items-center justify-center border ${
                  active
                    ? 'bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]'
                    : 'bg-slate-950/60 border-slate-900'
                }`}>
                  {getBadgeIcon(tmpl.iconName, active)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-bold text-slate-200 truncate">{tmpl.name}</h4>
                    {!active && <Lock className="h-3 w-3 text-slate-600 flex-shrink-0" />}
                  </div>
                  <p className="text-[10px] text-slate-450 mt-1 leading-relaxed">{tmpl.description}</p>
                  
                  {active && (
                    <span className="text-[8px] text-amber-500/70 font-semibold block mt-1.5 uppercase tracking-wider">
                      Unlocked {new Date(unlockRecord.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
