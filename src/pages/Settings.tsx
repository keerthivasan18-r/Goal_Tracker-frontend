import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, User, Check, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { GlassCard } from '../components/GlassCard.js';

const AVATAR_OPTIONS = ['🎯', '🏋️‍♂️', '🧘‍♂️', '🏃‍♂️', '💡', '🎓', '📖', '🏊‍♂️', '🚴‍♂️', '💪', '🧠', '🎨'];

export const Settings: React.FC = () => {
  const { user, profile, settings, refreshProfile, updateContextProfile, updateContextSettings } = useAuth();

  // Profile Form States
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('🎯');
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Settings Toggles States
  const [morning, setMorning] = useState(true);
  const [hydration, setHydration] = useState(true);
  const [workout, setWorkout] = useState(true);
  const [reading, setReading] = useState(true);
  const [sleep, setSleep] = useState(true);
  const [weeklyEmail, setWeeklyEmail] = useState(true);
  const [monthlyEmail, setMonthlyEmail] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Sync state with Context values when loaded
  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
    if (profile) {
      setBio(profile.bio || '');
      setAvatar(profile.avatar || '🎯');
    }
    if (settings) {
      setMorning(settings.morningReminder);
      setHydration(settings.hydrationReminder);
      setWorkout(settings.workoutReminder);
      setReading(settings.readingReminder);
      setSleep(settings.sleepReminder);
      setWeeklyEmail(settings.weeklyReportEmail);
      setMonthlyEmail(settings.monthlyReportEmail);
    }
  }, [user, profile, settings]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    setProfileSuccess(false);
    try {
      const res = await api.put('/profile', {
        name,
        bio,
        avatar,
      });
      updateContextProfile(res.data.profile);
      await refreshProfile(); // Refresh root contexts
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to update profile settings:', error);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingSettings(true);
    setSettingsSuccess(false);
    try {
      const res = await api.put('/settings', {
        morningReminder: morning,
        hydrationReminder: hydration,
        workoutReminder: workout,
        readingReminder: reading,
        sleepReminder: sleep,
        weeklyReportEmail: weeklyEmail,
        monthlyReportEmail: monthlyEmail,
      });
      updateContextSettings(res.data.settings);
      setSettingsSuccess(true);
      setTimeout(() => setSettingsSuccess(false), 3000);
    } catch (error) {
      console.error('Failed to save settings details:', error);
    } finally {
      setUpdatingSettings(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-200">Settings</h2>
        <p className="text-xs text-slate-500">Configure your profile, reminders, and report preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Card */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-900/60">
            <User className="h-5 w-5 text-blue-400" />
            <h3 className="font-bold text-sm text-slate-200">Profile Settings</h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Short Bio / Motto
              </label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full p-2.5 glass-input text-xs"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2.5">
                Avatar Emoji
              </label>
              <div className="grid grid-cols-6 gap-2">
                {AVATAR_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setAvatar(emoji)}
                    className={`text-xl p-2 rounded-lg border transition-all ${
                      avatar === emoji
                        ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_8px_rgba(59,130,246,0.15)]'
                        : 'border-slate-850 bg-slate-900 hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-900/60">
              {profileSuccess ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Check className="h-4 w-4" /> Profile saved successfully!
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">Auto-saves to database dashboard.</span>
              )}
              <button
                type="submit"
                disabled={updatingProfile}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {updatingProfile ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </GlassCard>

        {/* Notifications & Reminders Card */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-900/60">
            <Bell className="h-5 w-5 text-indigo-400" />
            <h3 className="font-bold text-sm text-slate-200">Alerts & Notifications</h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-3.5">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                Reminders schedule (in-app alerts)
              </span>

              {/* Morning Reminder */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-200">Morning Reminder</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Alert to plan goals daily at 8:00 AM.</p>
                </div>
                <input
                  type="checkbox"
                  checked={morning}
                  onChange={(e) => setMorning(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2 focus:ring-offset-slate-950"
                />
              </label>

              {/* Hydration Reminder */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-200">Hydration Reminder</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Drink water logs alert every 4 hours.</p>
                </div>
                <input
                  type="checkbox"
                  checked={hydration}
                  onChange={(e) => setHydration(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2"
                />
              </label>

              {/* Workout Reminder */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-200">Workout Reminder</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Evening alert to complete exercise routines.</p>
                </div>
                <input
                  type="checkbox"
                  checked={workout}
                  onChange={(e) => setWorkout(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2"
                />
              </label>

              {/* Reading Reminder */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-200">Reading Reminder</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Daily reminder to allocate quiet reading times.</p>
                </div>
                <input
                  type="checkbox"
                  checked={reading}
                  onChange={(e) => setReading(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2"
                />
              </label>

              {/* Sleep Reminder */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-200">Sleep Reminder</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Bedtime recovery warning alert at 10:00 PM.</p>
                </div>
                <input
                  type="checkbox"
                  checked={sleep}
                  onChange={(e) => setSleep(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2"
                />
              </label>

              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest pt-3 border-t border-slate-900/60 mb-1">
                Email Dispatch reports
              </span>

              {/* Weekly report Email */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-200">Weekly PDF Email</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Receive Weekly report compilation PDFs.</p>
                </div>
                <input
                  type="checkbox"
                  checked={weeklyEmail}
                  onChange={(e) => setWeeklyEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2"
                />
              </label>

              {/* Monthly report Email */}
              <label className="flex items-center justify-between cursor-pointer group">
                <div>
                  <span className="text-xs font-semibold text-slate-300 group-hover:text-slate-200">Monthly PDF Email</span>
                  <p className="text-[10px] text-slate-500 mt-0.5">Receive Monthly consolidated report PDFs.</p>
                </div>
                <input
                  type="checkbox"
                  checked={monthlyEmail}
                  onChange={(e) => setMonthlyEmail(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-800 focus:ring-blue-500 focus:ring-2"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-5 border-t border-slate-900/60">
              {settingsSuccess ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                  <Check className="h-4 w-4" /> Reminders updated!
                </span>
              ) : (
                <span className="text-[10px] text-slate-500">Saves preference states.</span>
              )}
              <button
                type="submit"
                disabled={updatingSettings}
                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                {updatingSettings ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
};
