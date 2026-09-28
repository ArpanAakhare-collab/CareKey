import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bell, 
  Smartphone,
  CheckCircle2
} from 'lucide-react';

export function Settings() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 py-2 max-w-2xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Account & Security Settings</h1>
        <p className="text-xs text-slate-500">Configure security standards, notifications, and privacy options.</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 space-y-6">
        
        {saved && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Preferences updated successfully.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Security & Access */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Security & Access
            </h3>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Two-Factor Authentication (2FA)</span>
                </p>
                <p className="text-[11px] text-slate-500">Require cryptographic confirmation on new sign-ins.</p>
              </div>
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={(e) => setTwoFactorAuth(e.target.checked)}
                className="w-4 h-4 text-sky-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Communication Preferences
            </h3>

            <div className="space-y-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Bell className="w-4 h-4 text-sky-600" />
                    <span>Email Appointment Notices</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Receive booking confirmations and prescription updates via email.</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                />
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-teal-600" />
                    <span>SMS Urgent Health Alerts</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Direct mobile SMS notifications for critical diagnostic alerts.</p>
                </div>
                <input
                  type="checkbox"
                  checked={smsAlerts}
                  onChange={(e) => setSmsAlerts(e.target.checked)}
                  className="w-4 h-4 text-sky-600 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Save Preferences
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
