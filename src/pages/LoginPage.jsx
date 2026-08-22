import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('loading');
    try {
      await login(email, password);
      setStatus('success');
      setTimeout(() => {
        navigate('/trips');
      }, 1500);
    } catch (err) {
      console.error(err);
      setLoading(false);
      setStatus('idle');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-950">
      {/* Left side: Premium image/gradient */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1200&q=80" 
          alt="Ocean Travel" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-teal-950/40 to-transparent"></div>
        
        {/* Animated wave effect / float */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }} 
          animate={{ y: 0, opacity: 1 }} 
          transition={{ delay: 0.5, duration: 1 }}
          className="relative z-10 flex flex-col justify-end p-12 h-full text-white"
        >
          <h1 className="text-5xl font-bold mb-4 drop-shadow-xl">Journey Into The Unknown</h1>
          <p className="text-xl text-teal-50 drop-shadow-md">Connect destinations. Track budget. Explore more.</p>
        </motion.div>
      </div>

      {/* Right side: Login form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24">
        <motion.div 
          initial={{ x: 50, opacity: 0 }} 
          animate={{ x: 0, opacity: 1 }}
          className="max-w-md w-full mx-auto"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
            <p className="text-slate-400">Please enter your details to sign in.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <motion.div whileFocus={{ scale: 1.02 }} className="relative">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder="you@traveler.com"
                />
              </div>
            </motion.div>

            <motion.div whileFocus={{ scale: 1.02 }} className="relative">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </motion.div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-teal-500 focus:ring-teal-500 focus:ring-offset-slate-950" />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </div>
              <Link to="/forgot-password" className="text-sm text-teal-400 hover:text-teal-300">Forgot Password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all flex items-center justify-center h-14"
            >
              <AnimatePresence mode="wait">
                {status === 'idle' && (
                  <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Login
                  </motion.span>
                )}
                {status === 'loading' && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Loading
                  </motion.div>
                )}
                {status === 'success' && (
                  <motion.span key="success" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2">
                    Success! Redirecting...
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            Don't have an account? <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-semibold">Create Account</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
