import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Zap, Info, Award, Play } from 'lucide-react';
import api from '../services/api';
import { Notification } from '../types/index';

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      const list = res.data.notifications;
      setNotifications(list);
      setUnreadCount(list.filter((n: Notification) => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`);
      // Update local state
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleTriggerDemo = async () => {
    try {
      await api.post('/notifications/trigger-demo');
      // Re-fetch
      await fetchNotifications();
    } catch (error) {
      console.error('Error triggering demo notifications:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'ACHIEVEMENT':
        return <Award className="h-4 w-4 text-amber-400" />;
      case 'REMINDER':
        return <Zap className="h-4 w-4 text-blue-400" />;
      default:
        return <Info className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors hover:border-slate-700"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 glass-panel rounded-xl overflow-hidden shadow-2xl z-50 bg-slate-950/95 border-slate-800">
          <div className="flex items-center justify-between p-4 border-b border-slate-900 bg-slate-950/80">
            <h5 className="font-bold text-sm text-slate-200">Notifications</h5>
            <button
              onClick={handleTriggerDemo}
              title="Trigger Demo Reminders"
              className="flex items-center gap-1 text-[10px] bg-blue-950/80 hover:bg-blue-900/80 text-blue-300 font-semibold px-2 py-1 rounded border border-blue-800 transition-all"
            >
              <Play className="h-3 w-3 fill-current" /> Demo Reminders
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-900/60">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-3 transition-colors text-left flex gap-3 items-start ${
                    notif.isRead ? 'bg-transparent' : 'bg-blue-950/15'
                  }`}
                >
                  <div className="mt-0.5 p-1 rounded bg-slate-900 border border-slate-800">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-1">
                      <p className={`text-xs font-semibold ${notif.isRead ? 'text-slate-300' : 'text-slate-100'}`}>
                        {notif.title}
                      </p>
                      {!notif.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notif.id)}
                          title="Mark as read"
                          className="text-slate-500 hover:text-blue-400 transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {notif.message}
                    </p>
                    <span className="text-[9px] text-slate-500 mt-1 block">
                      {new Date(notif.sendAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
