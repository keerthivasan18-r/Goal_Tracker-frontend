import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, ArrowRight, Loader2 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const AVATAR_OPTIONS = ['🎯', '🏋️‍♂️', '🧘‍♂️', '🏃‍♂️', '💡', '🎓', '📖', '🏊‍♂️', '🚴‍♂️', '💪', '🧠', '🎨'];

export const Onboarding: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedAvatar, setSelectedAvatar] = useState('🎯');
  const [bio, setBio] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.put('/profile', {
        avatar: selectedAvatar,
        bio,
        onboarded: true,
      });
      await refreshProfile();
      navigate('/');
    } catch (err) {
      console.error('Onboarding failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-xl glass-panel rounded-2xl p-8 relative z-10">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="p-2.5 rounded-xl bg-blue-600/10 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.2)] mb-3">
            <Target className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-slate-100 uppercase">Profile Setup</h2>
          <p className="text-slate-400 text-xs mt-1">Let's customize your profile to start tracking your goals</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-3 text-center">
              Choose your profile avatar emoji
            </label>
            <div className="grid grid-cols-6 gap-2">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-2xl p-3.5 rounded-xl bg-slate-900 border transition-all hover:bg-slate-800 ${
                    selectedAvatar === emoji
                      ? 'border-blue-500 bg-blue-600/10 shadow-[0_0_10px_rgba(59,130,246,0.15)]Scale-105'
                      : 'border-slate-850 text-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-2">
              Short Bio / Motto
            </label>
            <textarea
              placeholder="e.g. Dedicated to building healthy routines and learning something new every day."
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 glass-input text-sm leading-relaxed"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_15px_rgba(59,130,246,0.25)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving profile...
              </>
            ) : (
              <>
                Complete Setup <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
