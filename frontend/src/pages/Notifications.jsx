import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { firestoreService } from '../services/firestoreService';
import { 
  Bell, 
  RefreshCw,
  Inbox
} from 'lucide-react';

export function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifications() {
      if (!user?.uid) return;
      setLoading(true);
      try {
        const data = await firestoreService.getUserNotifications(user.uid);
        setNotifications(data || []);
      } catch (err) {
        console.warn('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    }
    loadNotifications();
  }, [user]);

  const handleMarkRead = async (id) => {
    await firestoreService.markNotificationRead(id);
    setNotifications((prev) => 
      prev.map((n) => n.id === id ? { ...n, read: true } : n)
    );
  };

  return (
    <div className="space-y-6 py-2 max-w-3xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Notifications</h1>
        <p className="text-xs text-slate-500">Alerts, appointment updates, and clinical test report notices.</p>
      </div>

      {loading ? (
        <div className="py-16 text-center space-y-2">
          <RefreshCw className="w-6 h-6 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Checking for notifications...</p>
        </div>
      ) : notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div 
              key={notif.id}
              onClick={() => handleMarkRead(notif.id)}
              className={`p-4 bg-white border rounded-2xl shadow-xs transition-colors flex items-start justify-between gap-4 cursor-pointer ${
                notif.read ? 'border-slate-200' : 'border-sky-300 bg-sky-50/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  notif.read ? 'bg-slate-100 text-slate-500' : 'bg-sky-100 text-sky-700'
                }`}>
                  <Bell className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{notif.title || 'System Notification'}</h4>
                  <p className="text-xs text-slate-600 mt-0.5">{notif.message}</p>
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-mono shrink-0">
                {notif.time || 'Recent'}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <div className="max-w-sm mx-auto">
            <h3 className="text-sm font-bold text-slate-800">You're all caught up.</h3>
            <p className="text-xs text-slate-400 mt-1">
              No new alerts or notifications at this time.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
