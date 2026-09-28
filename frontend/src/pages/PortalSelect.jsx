import React from 'react';
import { 
  Stethoscope, 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Lock, 
  Sparkles,
  QrCode,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function PortalSelect({ onNavigate }) {
  const { loginAsDemo } = useAuth();

  const handleQuickDemo = (role) => {
    loginAsDemo(role);
    if (role === 'DOCTOR') onNavigate('/doctor/dashboard');
    else if (role === 'ADMIN') onNavigate('/admin/dashboard');
    else onNavigate('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="max-w-6xl mx-auto w-full flex items-center justify-between py-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 p-0.5 shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div>
            <h1 className="text-base font-black tracking-tight text-white flex items-center gap-2">
              <span>SecureQR Health</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                CareKey v2.0
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">Privacy-Preserving Healthcare Platform</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <Lock className="w-3.5 h-3.5 text-emerald-400" />
          <span>Role-Based End-to-End Cryptographic Security</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto w-full py-8 md:py-12 relative z-10 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-sky-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-sky-400" />
            <span>Select Your Secure Gateway</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            Universal Healthcare Access, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
              Zero-PII Privacy Protection
            </span>
          </h2>
          <p className="text-xs md:text-sm text-slate-400">
            Choose your designated portal below to proceed with authorized medical access.
          </p>
        </div>

        {/* 3 Portals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. DOCTOR PORTAL */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-sky-500/10 group backdrop-blur-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20 group-hover:scale-110 transition-transform">
                <Stethoscope className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-sky-300 transition-colors">
                  Doctor Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For verified medical practitioners. Manage connected patients, clinical encounters, review patient requests, and perform QR consultations.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Accept / Reject Patient Requests</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Secure QR Patient Record Access</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Gemini Clinical Decision Copilot</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              <button
                onClick={() => onNavigate('/doctor/login')}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-sky-600/30 cursor-pointer"
              >
                <span>Doctor Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/doctor/register')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Doctor Registration</span>
              </button>
            </div>
          </div>

          {/* 2. PATIENT PORTAL */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-emerald-500/10 group backdrop-blur-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <User className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Patient Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For individuals & patients. Search and connect with registered doctors, manage diagnostic records, view prescriptions, and generate your secure QR.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Real Dynamic "Find a Doctor" Search</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Request & Connect with Real Doctors</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Cryptographic Non-PII QR Token</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              <button
                onClick={() => onNavigate('/patient/login')}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/30 cursor-pointer"
              >
                <span>Patient Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => onNavigate('/patient/register')}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700/80 transition-all flex items-center justify-center cursor-pointer"
              >
                <span>Patient Registration</span>
              </button>
            </div>
          </div>

          {/* 3. ADMINISTRATOR PORTAL */}
          <div className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-3xl p-6 md:p-7 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-purple-500/10 group backdrop-blur-md">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                  Administrator Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  For public-health epidemiologists and surveillance leads. Access anonymized aggregate disease statistics protected by server-side K=10 suppression.
                </p>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>K ≥ 10 Minimum Group-Size Protection</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Regional & Temporal Disease Trends</span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  <span>Zero PII: 403 On Patient Queries</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-2.5">
              <button
                onClick={() => onNavigate('/admin/login')}
                className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-purple-600/30 cursor-pointer"
              >
                <span>Administrator Login</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="py-2.5 px-4 text-center">
                <span className="text-[11px] text-slate-500 font-medium">
                  Public Registration Disabled (Admin Only)
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* 1-Click Evaluation / Demo Bar */}
        <div className="bg-slate-900/60 border border-slate-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Instant Testing & Evaluation Switcher</h4>
              <p className="text-[11px] text-slate-400">Test all three portals immediately with pre-configured verified sessions.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => handleQuickDemo('DOCTOR')}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 border border-sky-800/60 text-sky-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Test Doctor
            </button>
            <button
              onClick={() => handleQuickDemo('PATIENT')}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-800/60 text-emerald-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Test Patient
            </button>
            <button
              onClick={() => handleQuickDemo('ADMIN')}
              className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-800/60 text-purple-300 font-bold text-xs transition-colors cursor-pointer"
            >
              Test Admin
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto w-full py-4 text-center border-t border-slate-900 text-[11px] text-slate-500 relative z-10">
        CareKey • SecureQR Health Platform • Compliant with HIPAA, GDPR & K-Anonymity Privacy Standards
      </footer>
    </div>
  );
}
