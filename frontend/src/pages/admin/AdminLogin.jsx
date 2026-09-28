import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  Mail, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  KeyRound,
  LockKeyhole
} from 'lucide-react';

export function AdminLogin({ onNavigate }) {
  const { loginWithEmail, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please provide administrative credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(email, password, 'ADMIN');
      if (res) {
        onNavigate('/admin/dashboard');
      }
    } catch (err) {
      let msg = err.message || 'Administrative authentication failed.';
      if (err.code === 'auth/invalid-credential' || msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        msg = 'Invalid credentials. Please verify your administrative email and password.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdminLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginAsDemo('ADMIN');
      if (res) {
        onNavigate('/admin/dashboard');
      }
    } catch (err) {
      setError('Demo admin login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-purple-500 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        {/* Back Link */}
        <button
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors mb-6 group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to Portal Selection</span>
        </button>

        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-rose-500 p-0.5 shadow-xl shadow-purple-500/25 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-purple-400" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 mb-2">
            <LockKeyhole className="w-3.5 h-3.5" />
            Restricted Officer Portal
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight text-center">
            Administrator Login
          </h2>
          <p className="mt-1 text-sm text-slate-400 text-center">
            Aggregated population analytics with strict K=10 differential privacy
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 backdrop-blur-xl py-8 px-6 sm:px-10 border border-slate-800/80 rounded-2xl shadow-2xl">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Official Administrator Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin.officer@healthdept.gov"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Security Passkey
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Authorization...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Admin Console</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoAdminLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-purple-500/40"
            >
              <KeyRound className="w-3.5 h-3.5 text-purple-400" />
              <span>One-Click Administrator Demo Access (Public Health Officer)</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
            <p className="text-[11px] text-slate-500">
              Public registration is disabled for administrator roles in accordance with HIPAA & GDPR security protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
