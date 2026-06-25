import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart3,
  History,
  Award,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  Target
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { XPBar } from '../components/XPBar';
import { NotificationDropdown } from '../components/NotificationDropdown';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'History Logs', href: '/history', icon: History },
    { name: 'Achievements', href: '/achievements', icon: Award },
    { name: 'Settings', href: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-[#020617] flex flex-col md:flex-row text-slate-100">
      {/* Background radial glow */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)] pointer-events-none z-0" />

      {/* Mobile Top Navbar */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-900 bg-slate-950/80 backdrop-blur z-20">
        <div className="flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-500" />
          <span className="font-bold tracking-wider text-sm gradient-text">GOAL TRACKER</span>
        </div>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed md:sticky top-0 left-0 bottom-0 w-64 border-r border-slate-900 bg-slate-950/80 backdrop-blur p-6 flex flex-col justify-between z-30 transition-transform duration-300 md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-8">
          {/* Logo */}
          <div className="hidden md:flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-600/10 border border-blue-500/20 shadow-[0_0_12px_rgba(59,130,246,0.2)]">
              <Target className="h-6 w-6 text-blue-500 animate-pulse" />
            </div>
            <span className="font-black text-lg tracking-wider bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              GOAL TRACKER
            </span>
          </div>

          {/* User mini-card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-900 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-850 flex items-center justify-center text-xl border border-slate-800">
                {profile?.avatar || '🎯'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-slate-200 truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            {profile && (
              <XPBar xp={profile.xp} level={profile.level} compact={true} />
            )}
          </div>

          {/* Nav Links */}
          <nav className="flex flex-col gap-1.5">
            {navigation.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group border ${
                    active
                      ? 'bg-blue-600/10 border-blue-500/20 text-blue-400 font-semibold shadow-[inset_0_0_8px_rgba(59,130,246,0.05)]'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40 hover:border-slate-900'
                  }`}
                >
                  <Icon
                    className={`h-4.5 w-4.5 transition-colors ${
                      active ? 'text-blue-500' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Area */}
        <div className="flex flex-col gap-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/10 hover:border-red-900/20 border border-transparent transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
          <div className="text-[10px] text-slate-600 text-center">v1.0.0 &copy; 2026</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between p-6 border-b border-slate-900 bg-slate-950/20 backdrop-blur-sm">
          <div>
            <h1 className="text-lg font-bold text-slate-200">
              Welcome back, <span className="text-blue-400">{user?.name}</span>
            </h1>
            <p className="text-xs text-slate-500">Track your habits, earn XP, and unlock achievements.</p>
          </div>
          <div className="flex items-center gap-4">
            {profile && (
              <div className="w-56">
                <XPBar xp={profile.xp} level={profile.level} compact={true} />
              </div>
            )}
            <div className="h-6 w-px bg-slate-850" />
            <NotificationDropdown />
          </div>
        </header>

        {/* Dynamic page contents wrapper */}
        <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
