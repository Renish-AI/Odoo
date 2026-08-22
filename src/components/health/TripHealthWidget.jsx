import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  Zap,
  Activity,
  Compass,
  ArrowRight
} from 'lucide-react';
import { aiService } from '../../services/aiService';

export const TripHealthWidget = ({ trip, onOpenAIAssistant }) => {
  const health = aiService.analyzeTripHealth(trip);

  if (!health) return null;

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
    if (score >= 70) return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Top Banner with Score Gauge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center gap-4">
          
          {/* Circular Score Badge */}
          <div className={`w-16 h-16 rounded-2xl border-2 flex flex-col items-center justify-center shrink-0 ${getScoreColor(health.score)}`}>
            <span className="text-xl font-extrabold tracking-tight">{health.score}</span>
            <span className="text-[9px] uppercase font-bold tracking-wider -mt-0.5">Health</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">Trip Health & Pacing Score</h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Grade {health.grade}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {health.summary}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAIAssistant}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ask AI Concierge</span>
        </button>
      </div>

      {/* 4 Health Diagnostic Pillars */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-[10px] font-semibold uppercase text-slate-500">Destination Stops</div>
          <div className="text-base font-bold text-white mt-0.5">{health.metrics.totalStops} Cities</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">Route Connected</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-[10px] font-semibold uppercase text-slate-500">Experiences</div>
          <div className="text-base font-bold text-white mt-0.5">{health.metrics.totalActivities} Planned</div>
          <div className="text-[10px] text-cyan-400 mt-0.5">Timeline Scheduled</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-[10px] font-semibold uppercase text-slate-500">Experience Spread</div>
          <div className="text-base font-bold text-white mt-0.5">{health.metrics.categorySpread} Categories</div>
          <div className="text-[10px] text-purple-400 mt-0.5">Vibe Balance</div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-[10px] font-semibold uppercase text-slate-500">Est. Daily Burn</div>
          <div className="text-base font-bold text-white mt-0.5">${health.metrics.budgetBurnRate}/day</div>
          <div className="text-[10px] text-amber-400 mt-0.5">Sustainable Pace</div>
        </div>
      </div>

      {/* Issues and Recommendations List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Strengths */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <CheckCircle2 className="w-4 h-4" /> Trip Strengths & Highlights
          </div>
          {health.strengths.length === 0 ? (
            <div className="text-xs text-slate-500">Add more stops and activities to reveal strengths.</div>
          ) : (
            <div className="space-y-2">
              {health.strengths.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-emerald-400 mt-0.5">✓</span>
                  <div>
                    <span className="font-semibold text-slate-200">{item.title}: </span>
                    <span className="text-slate-400">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Potential Pitfalls / AI Warnings */}
        <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <AlertTriangle className="w-4 h-4" /> Optimization Opportunities
          </div>
          {health.issues.length === 0 ? (
            <div className="text-xs text-slate-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Zero issues found. Itinerary is in peak condition!</span>
            </div>
          ) : (
            <div className="space-y-2">
              {health.issues.map((item, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs">
                  <span className="text-amber-400 mt-0.5">⚠️</span>
                  <div>
                    <span className="font-semibold text-slate-200">{item.title}: </span>
                    <span className="text-slate-400">{item.description}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
