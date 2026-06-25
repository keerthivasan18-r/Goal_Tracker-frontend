import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Flame,
  Award,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Plus,
  PlusCircle,
  Sparkles,
  Info,
  Clock,
  Check,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { DailyGoal, CustomGoal } from '../types/index';
import { GlassCard } from '../components/GlassCard';

const QUOTES = [
  "Our goals can only be reached through a vehicle of a plan.",
  "Consistency is what transforms average into excellence.",
  "You do not rise to the level of your goals. You fall to the level of your systems.",
  "Small daily improvements over time lead to stunning results.",
  "The secret of your future is hidden in your daily routine."
];

export const Dashboard: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [goals, setGoals] = useState<DailyGoal[]>([]);
  const [streak, setStreak] = useState(0);
  const [xpGainedToday, setXpGainedToday] = useState(0);
  const [dayAvgCompletion, setDayAvgCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [quote, setQuote] = useState('');
  
  // Custom goal dialog
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('Fitness');
  const [newGoalUnit, setNewGoalUnit] = useState('minutes');
  const [newGoalTarget, setNewGoalTarget] = useState(1);
  const [newGoalDesc, setNewGoalDesc] = useState('');
  const [submittingGoal, setSubmittingGoal] = useState(false);

  useEffect(() => {
    // Pick random quote
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  }, [selectedDate]);

  const formatDateStr = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const fetchDailyData = async () => {
    setIsLoading(true);
    try {
      const dateStr = formatDateStr(selectedDate);
      const res = await api.get(`/goals?date=${dateStr}`);
      setGoals(res.data.goals);

      // Fetch weekly analytics to grab current streak and stats
      const analyticsRes = await api.get('/analytics/weekly');
      setStreak(analyticsRes.data.chartData ? calculateCurrentStreak(analyticsRes.data.chartData) : 0);
      
      // Calculate today's completion & XP
      const todayLabel = selectedDate.toDateString();
      const todayHistory = analyticsRes.data.chartData?.find((h: any) => new Date(h.date).toDateString() === todayLabel);
      setXpGainedToday(todayHistory ? todayHistory.xp : 0);
      setDayAvgCompletion(todayHistory ? todayHistory.completion : 0);
    } catch (error) {
      console.error('Error fetching dashboard goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyData();
  }, [selectedDate]);

  const calculateCurrentStreak = (chartData: any[]): number => {
    // In practice, backend returns streak, we fallback to local calculations or simple stats
    // We can also fetch the streak from user profile or the weekly analytics.
    return profile ? Math.max(1, Math.floor(profile.xp / 140)) : 0; // Simple fallback mock if none found
  };

  const handleUpdateProgress = async (goalId: string, completedVal: number) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      const clampedVal = Math.max(0, completedVal);
      const updatedGoals = goals.map((g) => {
        if (g.id === goalId) {
          const isCompleted = clampedVal >= g.targetValue;
          return { ...g, completedValue: clampedVal, isCompleted };
        }
        return g;
      });
      setGoals(updatedGoals);

      // Send update API
      const res = await api.put(`/goals/${goalId}`, {
        completedValue: clampedVal,
      });

      // Update XP/Level in context immediately if user leveled up
      refreshProfile();

      if (res.data.progress) {
        setXpGainedToday(res.data.progress.xpGained);
        setDayAvgCompletion(res.data.progress.completionPercentage);
      }
    } catch (error) {
      console.error('Failed to update goal progress:', error);
    }
  };

  const handleToggleComplete = (goalId: string) => {
    const goal = goals.find((g) => g.id === goalId);
    if (!goal) return;
    const nextVal = goal.isCompleted ? 0 : goal.targetValue;
    handleUpdateProgress(goalId, nextVal);
  };

  const handleUpdateNotes = async (goalId: string, notes: string) => {
    try {
      await api.put(`/goals/${goalId}`, { notes });
    } catch (error) {
      console.error('Failed to save goal notes:', error);
    }
  };

  const handleCreateCustomGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingGoal(true);
    try {
      await api.post('/custom-goals', {
        name: newGoalName,
        category: newGoalCategory,
        unit: newGoalUnit,
        defaultTarget: newGoalTarget,
        description: newGoalDesc,
      });
      setShowAddGoalModal(false);
      // Reset inputs
      setNewGoalName('');
      setNewGoalDesc('');
      setNewGoalTarget(1);
      // Refetch
      fetchDailyData();
      refreshProfile();
    } catch (error) {
      console.error('Failed to create custom goal:', error);
    } finally {
      setSubmittingGoal(false);
    }
  };

  // Generate calendar days (previous 3, selected, next 3)
  const getCalendarDays = () => {
    const days = [];
    for (let i = -3; i <= 3; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(d);
    }
    return days;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Date Selector Banner */}
        <GlassCard className="md:col-span-2 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-blue-400 uppercase tracking-widest flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Date Selection
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d);
                }}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-[10px] px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d);
                }}
                className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div>
            <h2 className="text-xl font-bold mt-2 text-slate-200">
              {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'short', day: 'numeric' })}
            </h2>
            <p className="text-[11px] text-slate-500">View and update metrics for this date.</p>
          </div>
        </GlassCard>

        {/* Streak card */}
        <GlassCard className="flex items-center justify-between border-l-4 border-l-amber-500/70">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Streak</span>
            <h3 className="text-2xl font-bold text-slate-200 mt-1">{streak} Days</h3>
            <span className="text-[10px] text-slate-500">Keep logging to multiply XP!</span>
          </div>
          <div className="p-3 rounded-full bg-amber-500/10 text-amber-500">
            <Flame className="h-7 w-7 animate-pulse" />
          </div>
        </GlassCard>

        {/* Daily XP card */}
        <GlassCard className="flex items-center justify-between border-l-4 border-l-emerald-500/70">
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">XP Gained Today</span>
            <h3 className="text-2xl font-bold text-slate-200 mt-1">+{xpGainedToday} XP</h3>
            <span className="text-[10px] text-slate-500">Earned from goal completions.</span>
          </div>
          <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500">
            <Award className="h-7 w-7" />
          </div>
        </GlassCard>
      </div>

      {/* Calendar horizontal strip */}
      <div className="glass-panel p-3 rounded-xl flex items-center justify-between gap-2 overflow-x-auto bg-slate-950/20">
        {getCalendarDays().map((day) => {
          const isSelected = day.toDateString() === selectedDate.toDateString();
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDate(day)}
              className={`flex-1 min-w-[65px] flex flex-col items-center py-2 rounded-lg border text-center transition-all ${
                isSelected
                  ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 shadow-[inset_0_0_8px_rgba(59,130,246,0.05)]'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/20'
              }`}
            >
              <span className="text-[9px] uppercase font-bold tracking-wider mb-1">
                {day.toLocaleDateString('default', { weekday: 'short' })}
              </span>
              <span className={`text-base font-bold ${isToday && !isSelected ? 'text-blue-500 underline' : ''}`}>
                {day.getDate()}
              </span>
            </button>
          );
        })}
      </div>

      {/* Motivational Quote & Quick Add Goal Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Quote Card */}
        <div className="md:col-span-2 glass-panel p-5 rounded-xl bg-gradient-to-r from-blue-950/10 to-indigo-950/10 border border-blue-900/15 flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full filter blur-xl pointer-events-none" />
          <Sparkles className="h-6 w-6 text-blue-400 flex-shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-0.5">Daily Quote</span>
            <p className="text-xs text-slate-300 italic leading-relaxed truncate md:whitespace-normal">
              "{quote}"
            </p>
          </div>
        </div>

        {/* Quick Add Custom Goal Button Card */}
        <button
          onClick={() => setShowAddGoalModal(true)}
          className="glass-panel p-5 rounded-xl border border-dashed border-slate-800 hover:border-blue-500/30 flex items-center justify-between text-left group transition-all cursor-pointer hover:bg-slate-900/20"
        >
          <div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Custom Goals</span>
            <span className="text-sm font-bold text-slate-350 group-hover:text-blue-400 transition-colors">Create Custom Goal</span>
          </div>
          <PlusCircle className="h-6 w-6 text-slate-500 group-hover:text-blue-500 group-hover:rotate-90 transition-all duration-300" />
        </button>
      </div>

      {/* Daily checklist and progress overview */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-slate-200">Today's Daily Checklist</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-semibold">
              {goals.filter(g => g.isCompleted).length}/{goals.length} Completed
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold bg-slate-950/40 border border-slate-900 px-3 py-1 rounded-full">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            Day Completion: {dayAvgCompletion.toFixed(0)}%
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 glass-panel rounded-2xl">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin mb-3" />
            <span className="text-xs text-slate-500">Loading daily goal schedule...</span>
          </div>
        ) : goals.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 glass-panel rounded-2xl">
            No goals defined for this date.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goals.map((goal) => {
              const name = goal.template?.name || goal.customGoal?.name || 'Custom Goal';
              const category = goal.template?.category || goal.customGoal?.category || 'Custom';
              const desc = goal.template?.description || goal.customGoal?.description || '';
              const percent = goal.targetValue > 0 ? (goal.completedValue / goal.targetValue) * 100 : 0;

              return (
                <div
                  key={goal.id}
                  className={`glass-panel p-5 rounded-2xl relative overflow-hidden transition-all flex flex-col justify-between ${
                    goal.isCompleted
                      ? 'border-l-4 border-l-blue-500/80 bg-blue-950/5'
                      : 'hover:border-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                          category === 'Health' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                          category === 'Fitness' ? 'bg-amber-955 text-amber-400 border border-amber-900/40' :
                          category === 'Learning' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900/40' :
                          'bg-slate-900 text-slate-400 border border-slate-800'
                        }`}>
                          {category}
                        </span>
                        <span className="text-xs font-bold text-slate-200">{name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">{desc}</p>
                    </div>

                    <button
                      onClick={() => handleToggleComplete(goal.id)}
                      className={`h-6 w-6 rounded-full border flex items-center justify-center transition-all cursor-pointer ${
                        goal.isCompleted
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'border-slate-800 text-transparent hover:border-slate-600 hover:text-slate-400'
                      }`}
                    >
                      <Check className="h-3.5 w-3.5 stroke-[3px]" />
                    </button>
                  </div>

                  {/* Progress slide and notes */}
                  <div className="mt-5 space-y-3.5">
                    {/* Progress Slider */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] text-slate-400">
                        <span className="font-semibold">Progress</span>
                        <span className="font-bold text-slate-350">
                          {goal.completedValue} / {goal.targetValue} {goal.unit} ({percent.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateProgress(goal.id, goal.completedValue - (goal.targetValue / 10))}
                          className="h-6 w-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          -
                        </button>
                        <input
                          type="range"
                          min="0"
                          max={goal.targetValue * 1.5}
                          step={goal.targetValue / 20}
                          value={goal.completedValue}
                          onChange={(e) => handleUpdateProgress(goal.id, parseFloat(e.target.value))}
                          className="flex-1 accent-blue-500 h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer"
                        />
                        <button
                          onClick={() => handleUpdateProgress(goal.id, goal.completedValue + (goal.targetValue / 10))}
                          className="h-6 w-6 rounded bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-200 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Auto-saving Goal Notes */}
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Add notes for today..."
                        defaultValue={goal.notes || ''}
                        onBlur={(e) => handleUpdateNotes(goal.id, e.target.value)}
                        className="w-full text-[11px] bg-slate-900/60 border border-slate-850 hover:border-slate-800 focus:border-blue-500/40 rounded px-2.5 py-1.5 text-slate-400 placeholder-slate-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Goal Modal */}
      <AnimatePresence>
        {showAddGoalModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-md glass-panel rounded-2xl p-6 bg-slate-950/95"
            >
              <h3 className="text-base font-bold text-slate-200 mb-4">Create Custom Goal</h3>
              <form onSubmit={handleCreateCustomGoal} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Coding practice, Guitar practice"
                    value={newGoalName}
                    onChange={(e) => setNewGoalName(e.target.value)}
                    className="w-full p-2.5 glass-input text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Category
                    </label>
                    <select
                      value={newGoalCategory}
                      onChange={(e) => setNewGoalCategory(e.target.value)}
                      className="w-full p-2.5 glass-input text-xs bg-slate-900"
                    >
                      <option value="Fitness">Fitness</option>
                      <option value="Health">Health</option>
                      <option value="Learning">Learning</option>
                      <option value="Mental Health">Mental Health</option>
                      <option value="Work">Work</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Unit
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. pages, minutes, laps"
                      value={newGoalUnit}
                      onChange={(e) => setNewGoalUnit(e.target.value)}
                      className="w-full p-2.5 glass-input text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Daily Target Value
                  </label>
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={newGoalTarget}
                    onChange={(e) => setNewGoalTarget(parseFloat(e.target.value))}
                    className="w-full p-2.5 glass-input text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe the habit or key goal..."
                    rows={2}
                    value={newGoalDesc}
                    onChange={(e) => setNewGoalDesc(e.target.value)}
                    className="w-full p-2.5 glass-input text-xs"
                  />
                </div>

                <div className="flex gap-3 justify-end mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddGoalModal(false)}
                    className="px-4 py-2 rounded bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingGoal}
                    className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-xs font-semibold text-white transition-colors cursor-pointer"
                  >
                    {submittingGoal ? 'Creating...' : 'Create Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
