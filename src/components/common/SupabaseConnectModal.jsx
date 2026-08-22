import React, { useState } from 'react';
import {
  Database,
  X,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Terminal,
  ShieldCheck,
  Key,
  Globe
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';

export const SupabaseConnectModal = ({ onClose }) => {
  const isConnected = isSupabaseConfigured();
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedEnv, setCopiedEnv] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  const envSample = `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key`;

  const handleCopyEnv = () => {
    navigator.clipboard.writeText(envSample);
    setCopiedEnv(true);
    setTimeout(() => setCopiedEnv(false), 2000);
  };

  const handleCopySqlInstruction = () => {
    navigator.clipboard.writeText('supabase/schema.sql');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Pinging Supabase backend...');

    try {
      if (!isSupabaseConfigured() || !supabase) {
        throw new Error('No Supabase credentials detected in environment. Running in Interactive Demo Mode.');
      }

      const { data, error } = await supabase.from('trips').select('count', { count: 'exact', head: true });
      if (error) throw error;

      setTestStatus('success');
      setTestMessage('Successfully connected to Supabase PostgreSQL with active RLS!');
    } catch (err) {
      setTestStatus('error');
      setTestMessage(err.message || 'Connection failed.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-ocean-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-ocean-500/20 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Decorative oceanic glow */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-ocean-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ocean-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-ocean-500/30">
              <Database className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                Supabase Connection Hub
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isConnected
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                }`}>
                  {isConnected ? '● Connected' : '● Demo Mode (Zero-Config)'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage your real-time PostgreSQL database, authentication, and storage configuration.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="py-5 space-y-6 overflow-y-auto flex-1">
          
          {/* Status Alert */}
          <div className={`p-4 rounded-2xl border flex items-start gap-3 ${
            isConnected
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-ocean-500/10 border-ocean-500/30 text-cyan-300'
          }`}>
            {isConnected ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            )}
            <div className="text-xs space-y-1">
              <div className="font-bold text-white">
                {isConnected
                  ? 'Your application is connected to a live Supabase project!'
                  : 'Currently operating in Interactive Offline / Demo Store Mode.'}
              </div>
              <p className="text-slate-400 leading-relaxed">
                {isConnected
                  ? 'All trips, activities, expenses, and bucket lists are syncing directly to your PostgreSQL database with Row Level Security.'
                  : 'You have full editing and itinerary planning access out of the box with sample European & Asian tours. Connect your own Supabase project below whenever ready.'}
              </p>
            </div>
          </div>

          {/* Setup Guide Steps */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-ocean-400" /> How to Connect Your Supabase Project in 3 Steps
            </h4>

            {/* Step 1 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ocean-500/20 text-ocean-400 flex items-center justify-center text-[10px]">1</span>
                  Create Project & Copy API Keys
                </span>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-ocean-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  <span>Supabase Dashboard</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-400">
                In your Supabase project, go to <b>Project Settings → API</b> and copy the Project URL and Anon Public Key.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ocean-500/20 text-ocean-400 flex items-center justify-center text-[10px]">2</span>
                  Execute SQL Database Schema
                </span>
                <button
                  onClick={handleCopySqlInstruction}
                  className="text-xs text-ocean-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  {copiedSql ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedSql ? 'Path Copied' : 'supabase/schema.sql'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">
                In Supabase, open the <b>SQL Editor</b>, paste the schema from <code className="text-ocean-300 bg-slate-900 px-1 py-0.5 rounded">supabase/schema.sql</code>, and click <b>Run</b>.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-ocean-500/20 text-ocean-400 flex items-center justify-center text-[10px]">3</span>
                  Configure .env Variables
                </span>
                <button
                  onClick={handleCopyEnv}
                  className="text-xs text-ocean-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                >
                  {copiedEnv ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEnv ? 'Copied' : 'Copy .env Format'}</span>
                </button>
              </div>
              <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
{envSample}
              </pre>
            </div>
          </div>

          {/* Live Connection Test Button & Output */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white">Diagnostics & Connection Verification</span>
              <button
                onClick={handleTestConnection}
                disabled={testStatus === 'testing'}
                className="px-4 py-1.5 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${testStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>Test Live Connection</span>
              </button>
            </div>

            {testStatus && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                testStatus === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : testStatus === 'error'
                  ? 'bg-amber-500/10 border border-amber-500/30 text-amber-300'
                  : 'bg-slate-900 text-slate-300'
              }`}>
                {testStatus === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                {testStatus === 'error' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
                <span>{testMessage}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <span className="text-xs text-slate-500">Security: Anonymous public key only. Never expose Service Role Key in browser.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};