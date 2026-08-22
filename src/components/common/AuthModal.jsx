import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, CheckCircle2, Shield, ArrowLeft, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ onClose }) => {
  const { login, signup, resetPassword, switchDemo, isSupabaseReady } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (mode === 'forgot') {
      if (!email.trim()) {
        setError('Please enter your email address.');
        return;
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccessMessage('Password reset link has been sent to your email address!');
      } catch (err) {
        setError(err.message || 'Failed to send reset link. Please check the email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please verify your password.');
        return;
      }
    }

    setLoading(true);

    try {
      if (mode === 'signup') {
        await signup(email, password, fullName);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = (role) => {
    switchDemo(role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-ocean-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        
        {/* Decorative background glow */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-ocean-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-ocean-500/10 text-cyan-400 mb-3 border border-ocean-500/20">
            {mode === 'forgot' ? <KeyRound className="w-6 h-6" /> : <Sparkles className="w-6 h-6" />}
          </div>
          <h3 className="text-xl font-bold text-white">
            {mode === 'signup' && 'Create Traveler Account'}
            {mode === 'signin' && 'Welcome Back Traveler'}
            {mode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {mode === 'signup' && 'Start building visual multi-city itineraries and budget forecasts'}
            {mode === 'signin' && 'Sign in to access your saved journeys and interactive plans'}
            {mode === 'forgot' && 'Enter your email address and we’ll send you a recovery link'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* 1-Click Demo Profiles (Shown only in signin mode) */}
        {mode === 'signin' && (
          <div className="mb-6 p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Instant 1-Click Demo Logins
              </span>
              <span className="text-[10px] text-cyan-400 font-semibold px-2 py-0.5 rounded-full bg-ocean-500/10">
                Zero Signup Needed
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo('nomad')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-ocean-500/20 hover:border-cyan-400/40 border border-slate-700/50 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-cyan-300">Alex Vance</div>
                <div className="text-[10px] text-slate-400">Digital Nomad (USD)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('backpacker')}
                className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-ocean-500/20 hover:border-cyan-400/40 border border-slate-700/50 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-cyan-300">Sam Rivers</div>
                <div className="text-[10px] text-slate-400">Backpacker (EUR)</div>
              </button>
            </div>
          </div>
        )}

        {mode !== 'forgot' && (
          <div className="relative flex items-center justify-center mb-6">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider absolute">
              Or {mode === 'signup' ? 'Sign Up with Email' : 'Sign In with Email'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maya Lin"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@traveler.com"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError('');
                      setSuccessMessage('');
                    }}
                    className="text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 mt-4"
          >
            {loading ? 'Processing...' : mode === 'signup' ? 'Create Account' : mode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 text-center space-y-2">
          {mode === 'forgot' ? (
            <button
              onClick={() => {
                setMode('signin');
                setError('');
                setSuccessMessage('');
              }}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1.5 mx-auto font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setMode(mode === 'signup' ? 'signin' : 'signup');
                setError('');
                setPassword('');
                setConfirmPassword('');
              }}
              className="text-xs text-slate-400 hover:text-cyan-300 transition-colors"
            >
              {mode === 'signup'
                ? 'Already have an account? Sign In'
                : "Don't have an account? Sign Up"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};