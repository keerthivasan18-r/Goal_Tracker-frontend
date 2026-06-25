import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Target, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: any) => {
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await api.post('/auth/login', {
        email: data.email,
        password: data.password,
      });
      login(res.data.token, res.data.user);
      
      // Redirect based on onboarding status
      if (res.data.user.profile?.onboarded) {
        navigate('/');
      } else {
        navigate('/onboarding');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05),transparent_60%)] pointer-events-none" />

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 relative z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 rounded-xl bg-blue-600/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.25)] mb-3">
            <Target className="h-8 w-8 text-blue-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold tracking-wider gradient-text">GOAL TRACKER</h2>
          <p className="text-slate-400 text-xs mt-1">Sign in to your productivity dashboard</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3.5 mb-5 rounded-lg bg-red-950/20 border border-red-900/30 text-red-400 text-xs">
            <AlertCircle className="h-4.5 w-4.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4.5 w-4.5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 glass-input text-sm"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-[10px] mt-1 font-medium">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 disabled:text-slate-400 text-white font-bold text-sm transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_4px_25px_rgba(59,130,246,0.45)]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-400 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="text-blue-400 hover:underline font-semibold">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};
