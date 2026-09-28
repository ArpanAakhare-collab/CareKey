import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  RefreshCw, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  User
} from 'lucide-react';

export function Login({ onLoginSuccess }) {
  const { 
    loginWithGoogle, 
    loginWithEmail, 
    registerWithEmail, 
    resetPassword,
    setupRecaptcha,
    sendPhoneOTP,
    verifyPhoneOTP,
    loginAsDemo
  } = useAuth();

  // Mode: 'overview' | 'email-login' | 'email-signup' | 'forgot-password' | 'phone'
  const [authMode, setAuthMode] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Email form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Phone form state
  const [countryCode, setCountryCode] = useState('+1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend OTP
  useEffect(() => {
    let timer = null;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  // Google Login
  const handleGoogleLogin = async () => {
    clearMessages();
    setLoading(true);
    try {
      await loginWithGoogle();
      onLoginSuccess?.();
    } catch (err) {
      setError(err.message || 'Google authentication failed.');
      setLoading(false);
    }
  };

  // Email Login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }
    setLoading(true);
    try {
      await loginWithEmail(email, password);
      onLoginSuccess?.();
    } catch (err) {
      let msg = err.message || 'Invalid email or password.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        msg = 'Invalid email address or password. Please verify and try again.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'The email address is improperly formatted.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  // Email Sign Up
  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!fullName.trim()) {
      setError('Please provide your full legal or practitioner name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }
    setLoading(true);
    try {
      await registerWithEmail(fullName.trim(), email, password);
      onLoginSuccess?.();
    } catch (err) {
      let msg = err.message || 'Sign up failed.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'An account with this email address already exists. Please sign in.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'The password chosen is too weak. Please use letters and numbers.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  // Instant Evaluation Demo Access
  const handleDemoAccess = (role = 'patient') => {
    loginAsDemo(role);
    onLoginSuccess?.();
  };

  // Forgot Password
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!email) {
      setError('Please enter your account email address.');
      return;
    }
    setLoading(true);
    try {
      await resetPassword(email);
      setSuccessMessage('Password reset link sent! Check your inbox.');
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
      setLoading(false);
    }
  };

  // Phone Send OTP
  const handleSendPhoneOTP = async (e) => {
    e.preventDefault();
    clearMessages();
    const cleanNum = phoneNumber.replace(/[^0-9]/g, '');
    if (!cleanNum || cleanNum.length < 7) {
      setError('Please enter a valid phone number.');
      return;
    }
    const fullPhone = `${countryCode}${cleanNum}`;
    setLoading(true);
    try {
      const verifier = setupRecaptcha('recaptcha-container');
      const confirmation = await sendPhoneOTP(fullPhone, verifier);
      setConfirmationResult(confirmation);
      setCountdown(60);
      setSuccessMessage(`Verification code sent to ${fullPhone}`);
      setLoading(false);
    } catch (err) {
      console.error('Phone OTP error:', err);
      let msg = err.message || 'Failed to send OTP code.';
      if (err.code === 'auth/invalid-phone-number') {
        msg = 'The provided phone number is invalid.';
      } else if (err.code === 'auth/quota-exceeded') {
        msg = 'SMS quota exceeded for this project. Please use Google or Email login.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  // Phone Verify OTP
  const handleVerifyPhoneOTP = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!otp || otp.length < 6) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    setLoading(true);
    try {
      await verifyPhoneOTP(confirmationResult, otp);
      onLoginSuccess?.();
    } catch (err) {
      let msg = err.message || 'Invalid or expired verification code.';
      if (err.code === 'auth/invalid-verification-code') {
        msg = 'The 6-digit code entered is incorrect. Please try again.';
      } else if (err.code === 'auth/code-expired') {
        msg = 'Verification code has expired. Please request a new code.';
      }
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div id="recaptcha-container"></div>

      <div className="max-w-md w-full">
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-md overflow-hidden">
          
          {/* Header */}
          <div className="p-8 text-center border-b border-slate-800/80 bg-gradient-to-b from-slate-900 to-slate-900/60">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-teal-400 p-0.5 mx-auto mb-4 shadow-lg shadow-sky-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-sky-400" />
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">CareKey Healthcare</h1>
            <p className="text-xs text-slate-400 mt-1.5 font-medium">
              Your intelligent, zero-trust healthcare companion
            </p>
          </div>

          {/* Body */}
          <div className="p-8 space-y-6">
            
            {/* Status alerts */}
            {error && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* OVERVIEW MODE: 3 Primary Options */}
            {authMode === 'overview' && (
              <div className="space-y-4">
                
                {/* 1. Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition-all shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center py-2">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 absolute">
                    OR
                  </span>
                </div>

                {/* 2. Continue with Email */}
                <button
                  type="button"
                  onClick={() => { clearMessages(); setAuthMode('email-login'); }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-3 border border-slate-700/80 transition-all hover:border-slate-600 cursor-pointer"
                >
                  <Mail className="w-4 h-4 text-sky-400" />
                  <span>Continue with Email</span>
                </button>

                <div className="relative flex items-center justify-center py-2">
                  <div className="border-t border-slate-800 w-full" />
                  <span className="bg-slate-900 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 absolute">
                    OR
                  </span>
                </div>

                {/* 3. Continue with Phone */}
                <button
                  type="button"
                  onClick={() => { clearMessages(); setAuthMode('phone'); }}
                  className="w-full py-3.5 px-4 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-3 border border-slate-700/80 transition-all hover:border-slate-600 cursor-pointer"
                >
                  <Phone className="w-4 h-4 text-teal-400" />
                  <span>Continue with Phone</span>
                </button>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => handleDemoAccess('patient')}
                    className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-sky-500/10 to-teal-500/10 hover:from-amber-500/20 hover:to-teal-500/20 text-slate-300 hover:text-white font-semibold text-xs border border-slate-800 hover:border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-4 h-4 text-amber-400" />
                    <span>Instant Evaluation Mode (1-Click Test Drive)</span>
                  </button>
                </div>
              </div>
            )}

            {/* EMAIL LOGIN MODE */}
            {authMode === 'email-login' && (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@healthcare.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => { clearMessages(); setAuthMode('forgot-password'); }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                </button>

                <div className="pt-2 text-center flex items-center justify-between text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setAuthMode('overview'); }}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    ← Other Options
                  </button>
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setAuthMode('email-signup'); }}
                    className="text-sky-400 hover:underline font-semibold cursor-pointer"
                  >
                    Create account →
                  </button>
                </div>
              </form>
            )}

            {/* EMAIL SIGN UP MODE */}
            {authMode === 'email-signup' && (
              <form onSubmit={handleEmailSignUp} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Legal Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@healthcare.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Password (min. 6 characters)</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer mt-2"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Create Account</span>}
                </button>

                <div className="pt-2 text-center text-xs text-slate-400">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setAuthMode('email-login'); }}
                    className="text-sky-400 hover:underline font-semibold cursor-pointer"
                  >
                    Sign In
                  </button>
                </div>
              </form>
            )}

            {/* FORGOT PASSWORD MODE */}
            {authMode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <p className="text-xs text-slate-400 mb-3 leading-relaxed">
                    Enter the email associated with your account. We will send a secure password reset link to your inbox.
                  </p>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      placeholder="name@healthcare.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send Password Reset Link</span>}
                </button>

                <div className="pt-2 text-center text-xs">
                  <button
                    type="button"
                    onClick={() => { clearMessages(); setAuthMode('email-login'); }}
                    className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* PHONE AUTHENTICATION MODE */}
            {authMode === 'phone' && (
              <div>
                {!confirmationResult ? (
                  <form onSubmit={handleSendPhoneOTP} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">Country & Phone Number</label>
                      <div className="flex gap-2">
                        <select
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-28 px-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                        >
                          <option value="+1">🇺🇸 +1 (US)</option>
                          <option value="+91">🇮🇳 +91 (IN)</option>
                          <option value="+44">🇬🇧 +44 (UK)</option>
                          <option value="+61">🇦🇺 +61 (AU)</option>
                          <option value="+81">🇯🇵 +81 (JP)</option>
                          <option value="+49">🇩🇪 +49 (DE)</option>
                          <option value="+33">🇫🇷 +33 (FR)</option>
                          <option value="+971">🇦🇪 +971 (AE)</option>
                        </select>

                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                          <input
                            type="tel"
                            required
                            placeholder="555 123 4567"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1.5">
                        Firebase will verify your device with an SMS authentication code.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Send Verification Code</span><ArrowRight className="w-4 h-4" /></>}
                    </button>

                    <div className="pt-2 text-center text-xs">
                      <button
                        type="button"
                        onClick={() => { clearMessages(); setAuthMode('overview'); }}
                        className="text-slate-400 hover:text-white transition-colors cursor-pointer"
                      >
                        ← Other Options
                      </button>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOTP} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-semibold text-slate-300">Enter 6-Digit Code</label>
                        <span className="text-[11px] font-mono text-teal-400">
                          {countryCode} {phoneNumber}
                        </span>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="••••••"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full py-3 text-center tracking-[0.5em] font-mono font-black text-lg bg-slate-950/80 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || otp.length < 6}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Verify & Authenticate</span>}
                    </button>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                      <button
                        type="button"
                        onClick={() => { setConfirmationResult(null); setOtp(''); }}
                        className="hover:text-white cursor-pointer"
                      >
                        ← Edit number
                      </button>

                      {countdown > 0 ? (
                        <span className="text-slate-500">Resend in {countdown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleSendPhoneOTP}
                          className="text-teal-400 hover:underline font-semibold cursor-pointer"
                        >
                          Resend Code
                        </button>
                      )}
                    </div>
                  </form>
                )}
              </div>
            )}

          </div>

          {/* Footer note */}
          <div className="px-8 py-4 bg-slate-950/60 border-t border-slate-800/80 text-center">
            <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5 font-medium">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>HIPAA Compliant & End-to-End Cryptographically Protected</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
