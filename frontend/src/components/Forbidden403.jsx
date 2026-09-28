import React from 'react';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';

export function Forbidden403({ onNavigate, currentRole, requiredRole, portalName }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-6 shadow-2xl shadow-rose-500/20">
        <ShieldAlert className="w-10 h-10" />
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 mb-3">
        HTTP 403 &bull; ACCESS FORBIDDEN
      </span>

      <h1 className="text-3xl font-black text-white tracking-tight mb-2">
        Restricted Access Portal
      </h1>

      <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-6">
        Your current session role <span className="text-white font-bold font-mono">[{currentRole || 'ANONYMOUS'}]</span> is not authorized to access the {portalName || 'requested portal'} (Requires <span className="text-rose-400 font-bold font-mono">[{requiredRole}]</span> role permissions).
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={() => {
            if (currentRole === 'DOCTOR') onNavigate('/doctor/dashboard');
            else if (currentRole === 'PATIENT') onNavigate('/patient/dashboard');
            else if (currentRole === 'ADMIN') onNavigate('/admin/dashboard');
            else onNavigate('/');
          }}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 cursor-pointer transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Authorized Dashboard</span>
        </button>

        <button
          onClick={() => onNavigate('/')}
          className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md shadow-rose-500/20"
        >
          <Lock className="w-4 h-4" />
          <span>Portal Selector</span>
        </button>
      </div>
    </div>
  );
}
