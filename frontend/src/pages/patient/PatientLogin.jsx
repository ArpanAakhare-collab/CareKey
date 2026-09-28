import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  HeartPulse, 
  Mail, 
  Lock, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  ArrowLeft,
  KeyRound
} from 'lucide-react';

export function PatientLogin({ onNavigate }) {
  const { loginWithEmail, loginAsDemo } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter both your registered patient email address and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await loginWithEmail(email, password, 'PATIENT');
      if (res) {
        onNavigate('/patient/dashboard');
      }
    } catch (err) {
      let msg = err.message || 'Authentication failed. Please verify your patient credentials.';
      if (err.code === 'auth/invalid-credential' || msg.includes('invalid-credential') || msg.includes('wrong-password') || msg.includes('user-not-found')) {
        msg = 'Invalid email or password. Please check your credentials or register a new account.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoPatientLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginAsDemo('PATIENT');
      if (res) {
        onNavigate('/patient/dashboard');
      }
    } catch (err) {
      setError('Failed to log in as demo patient: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

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
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 p-0.5 shadow-xl shadow-sky-500/25 mb-4">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <HeartPulse className="w-7 h-7 text-sky-400" />
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Patient Health Records
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight text-center">
            Patient Login
          </h2>
          <p className="mt-1 text-sm text-slate-400 text-center">
            Access your medical history, doctors, prescriptions and cryptographic QR
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
                Registered Email Address
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
                  placeholder="patient@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Patient</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Login Option */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDemoPatientLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer hover:border-sky-500/40"
            >
              <KeyRound className="w-3.5 h-3.5 text-sky-400" />
              <span>One-Click Patient Demo Access (Rahul Sharma &mdash; CK-10482)</span>
            </button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/60 text-center">
            <p className="text-xs text-slate-400">
              Don't have a patient account yet?{' '}
              <button
                type="button"
                onClick={() => onNavigate('/patient/register')}
                className="font-bold text-sky-400 hover:text-sky-300 underline underline-offset-4 cursor-pointer ml-1"
              >
                Register as Patient
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
