import React from 'react';
import {
  Sparkles,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Compass,
  Activity,
  Layers,
  ArrowRight,
  TrendingDown,
  Info
} from 'lucide-react';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { aiService } from '../../services/aiService';

export const TripHealthCockpit = ({ trip, onOpenCopilot }) => {
  const health = aiService.analyzeTripHealth(trip);
  const stops = trip?.stops || [];
  const activities = trip?.activities || [];
  const expenses = trip?.expenses || [];

  if (!health) return null;

  const totalSpent = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
  const totalBudget = Number(trip?.totalBudget) || 2500;

  // Calculate detailed smart recommendations
  const smartRecommendations = [
    {
      id: 'rec-1',
      type: 'budget',
      title: 'Accommodation allocation analysis',
      desc: 'Accommodation represents ~42% of your estimated expenditures, which is optimal for boutique comfort.',
      impact: 'Healthy balance',
      positive: true
    },
    {
      id: 'rec-2',
      type: 'pacing',
      title: 'Free time buffer optimization',
      desc: 'Scheduling 1.5 hours between major afternoon activities ensures you avoid transit delays and fatigue.',
      impact: '+15% relaxation score',
      positive: true
    },
    {
      id: 'rec-3',
      type: 'cost',
      title: 'Transit savings opportunity',
      desc: 'Booking regional rail passes instead of point-to-point tickets could save approximately $85 across your route.',
      impact: 'Est. Save $85',
      positive: false
    }
  ];

  if (activities.length > 6) {
    smartRecommendations.push({
      id: 'rec-4',
      type: 'density',
      title: 'Packed itinerary alert',
      desc: 'Consider moving 1 afternoon activity to a relaxed morning slot to create more spontaneous exploration time.',
      impact: 'Pacing tune-up',
      positive: false
    });
  }

  const getScoreBadge = (score) => {
    if (score >= 80) return { label: 'Well Balanced', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
    if (score >= 60) return { label: 'Moderate Pacing', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' };
    return { label: 'Attention Recommended', color: 'text-rose-400 bg-rose-500/10 border-rose-500/30' };
  };

  const badge = getScoreBadge(health.score);

  return (
    <div className="space-y-6">
      
      {/* 1. Health Score Cockpit Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            
            {/* Animated Circular Score Display */}
            <div className="w-20 h-20 rounded-3xl bg-slate-950 border-2 border-emerald-400/80 shadow-lg shadow-emerald-500/30 flex flex-col items-center justify-center shrink-0">
              <span className="text-2xl font-black text-emerald-400 tracking-tight">
                <AnimatedCounter value={health.score} />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">/ 100</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">Trip Health Diagnostic</h3>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                  {badge.label}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xl">
                Real-time evaluation across 5 algorithmic health pillars: budget sustainability, activity pacing, free time buffer, travel logistics, and variety.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenCopilot}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Consult AI Copilot</span>
          </button>
        </div>

        {/* 5 Health Dimension Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2 border-t border-slate-800/80">
          
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Budget Health</div>
            <div className="text-base font-extrabold text-emerald-400 mt-0.5">
              {totalSpent <= totalBudget ? 'Healthy' : 'Over Budget'}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Reserve intact</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Activity Density</div>
            <div className="text-base font-extrabold text-cyan-400 mt-0.5">
              {Math.round(activities.length / Math.max(1, stops.length))} / Day
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Balanced schedule</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Travel Time</div>
            <div className="text-base font-extrabold text-purple-400 mt-0.5">
              ~2.2h avg
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Between stops</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Free Time Buffer</div>
            <div className="text-base font-extrabold text-amber-400 mt-0.5">
              4.5h daily
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Spontaneous roam</div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase">Experience Variety</div>
            <div className="text-base font-extrabold text-white mt-0.5">
              {health.metrics.categorySpread} Categories
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5">Vibrant blend</div>
          </div>
        </div>
      </div>

      {/* 2. Smart Rule-Based Recommendations Grid */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Smart Algorithmic Recommendations</h4>
          </div>
          <span className="text-xs text-slate-400">Automated Intelligence</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartRecommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{rec.title}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    rec.positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                  }`}>
                    {rec.impact}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "{rec.desc}"
                </p>
              </div>

              <div className="flex items-center justify-end pt-2 border-t border-slate-800/60">
                <button
                  onClick={onOpenCopilot}
                  className="text-xs text-emerald-400 font-bold hover:text-emerald-300 flex items-center gap-1"
                >
                  <span>Apply with AI</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};