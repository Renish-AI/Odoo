import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, AlertTriangle, CheckCircle2, Activity, ArrowRight
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { budgetService, toINR } from '../../services/budgetService';
import { AnimatedNumber } from '../common/AnimatedNumber';
import { SmartRecommendations } from './SmartRecommendations';

// ── SVG Gauge Ring ───────────────────────────────────────────
const GaugeRing = ({ score, size = 80 }) => {
  const radius = (size - 10) / 2;
  const circ   = 2 * Math.PI * radius;
  const dash   = (score / 100) * circ;

  const strokeColor = score >= 85 ? '#10b981' : score >= 70 ? '#f59e0b' : '#f43f5e';

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="#1e293b" strokeWidth={8} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={strokeColor} strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
      />
    </svg>
  );
};

// ── Score Badge ──────────────────────────────────────────────
const ScoreBadge = ({ score }) => {
  const colorClass = score >= 85
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : score >= 70
    ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-rose-400 border-rose-500/30 bg-rose-500/10';

  const label = score >= 85 ? 'Well Balanced' : score >= 70 ? 'Good Progress' : 'Needs Attention';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative flex items-center justify-center" style={{ width: 80, height: 80 }}>
        <GaugeRing score={score} size={80} />
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatedNumber value={score} className="text-xl font-extrabold text-white" duration={1200} />
        </div>
      </div>
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colorClass}`}
      >
        {label}
      </motion.span>
    </div>
  );
};

// ── Diagnostic Row ───────────────────────────────────────────
const DiagRow = ({ ok, text, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, x: -16 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
    className="flex items-start gap-2 text-xs"
  >
    <span className={ok ? 'text-emerald-400 mt-0.5' : 'text-amber-400 mt-0.5'}>
      {ok ? '✓' : '⚠️'}
    </span>
    <span className={ok ? 'text-slate-300' : 'text-slate-400'}>{text}</span>
  </motion.div>
);

// ── Main Component ───────────────────────────────────────────
export const TripHealthWidget = ({ trip, onOpenAIAssistant }) => {
  const health  = aiService.analyzeTripHealth(trip);
  const summary = budgetService.calculateTripBudgetSummary(trip);

  if (!health) return null;

  // Build diagnostic lines from strengths + issues
  const diagnostics = [
    ...health.strengths.map((s) => ({ ok: true,  text: `${s.title}: ${s.description}` })),
    ...health.issues.map((i)   => ({ ok: false, text: `${i.title}: ${i.description}` }))
  ].slice(0, 6);

  return (
    <div className="space-y-5">

      {/* ── Score Header Card ── */}
      <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <ScoreBadge score={health.score} />

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-base font-bold text-white">Trip Health &amp; Pacing Score</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Grade {health.grade}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">{health.summary}</p>

            {/* Diagnostic checklist */}
            <div className="space-y-1.5">
              {diagnostics.map((d, i) => (
                <DiagRow key={i} ok={d.ok} text={d.text} delay={0.2 + i * 0.1} />
              ))}
              {diagnostics.length === 0 && (
                <DiagRow ok={true} text="Add stops and activities to unlock full health diagnostics." delay={0.2} />
              )}
            </div>
          </div>

          <button
            onClick={onOpenAIAssistant}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" /> Ask AI Concierge
          </button>
        </div>
      </div>

      {/* ── 4 Pillar Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Destinations', value: `${health.metrics.totalStops} Cities`,    sub: 'Route Connected',    color: 'text-emerald-400' },
          { label: 'Experiences',  value: `${health.metrics.totalActivities} Planned`, sub: 'Timeline Scheduled', color: 'text-cyan-400' },
          { label: 'Vibe Spread',  value: `${health.metrics.categorySpread} Types`,  sub: 'Experience Balance',  color: 'text-purple-400' },
          { label: 'Daily Burn',   value: `₹${toINR(health.metrics.budgetBurnRate).toLocaleString('en-IN')}/day`, sub: 'Est. Pace', color: 'text-amber-400' }
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + i * 0.08 }}
            className="p-3 rounded-xl bg-slate-950/40 border border-slate-800"
          >
            <div className="text-[10px] font-semibold uppercase text-slate-500">{m.label}</div>
            <div className={`text-base font-bold mt-0.5 ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* ── Smart Recommendations ── */}
      <SmartRecommendations trip={trip} summary={summary} health={health} />
    </div>
  );
};
