import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, TrendingDown, Clock, Hotel, Plane } from 'lucide-react';
import { toINR } from '../../services/budgetService';

// ── Rule Engine ──────────────────────────────────────────────
function generateRecommendations(trip, summary, health) {
  const recs = [];
  const { categoryBreakdown, totalActualSpend, avgCostPerDay, estimatedTotal } = summary;
  const activities = trip?.activities || [];
  const stops      = trip?.stops      || [];

  if (!estimatedTotal || estimatedTotal === 0) return [];

  // 1. Accommodation percentage
  const stays = categoryBreakdown.find(c => c.name === 'Stays');
  if (stays && estimatedTotal > 0) {
    const pct = Math.round((stays.total / estimatedTotal) * 100);
    if (pct > 40) {
      recs.push({
        icon: Hotel,
        color: 'text-amber-400',
        bg:    'bg-amber-500/10 border-amber-500/20',
        text:  `Accommodation represents ${pct}% of your budget. Switching to a 3-star property could free up ₹${toINR(stays.total * 0.25).toLocaleString('en-IN')}.`
      });
    }
  }

  // 2. Most expensive day
  const daySpend = {};
  activities.forEach((act) => {
    const key = `${act.tripStopId}-day-${act.dayNumber}`;
    daySpend[key] = (daySpend[key] || 0) + (Number(act.cost) || 0);
  });
  const maxDay = Object.entries(daySpend).sort((a, b) => b[1] - a[1])[0];
  if (maxDay && maxDay[1] > avgCostPerDay * 1.5) {
    const dayNum = maxDay[0].split('-day-')[1];
    recs.push({
      icon: TrendingDown,
      color: 'text-cyan-400',
      bg:    'bg-cyan-500/10 border-cyan-500/20',
      text:  `Day ${dayNum} is your most expensive day at ₹${toINR(maxDay[1]).toLocaleString('en-IN')}. Spreading costs across days could ease daily budget pressure.`
    });
  }

  // 3. Overscheduled day
  const actsByDay = {};
  activities.forEach((act) => {
    const key = `${act.tripStopId}-day-${act.dayNumber}`;
    actsByDay[key] = (actsByDay[key] || 0) + 1;
  });
  const overcrowded = Object.entries(actsByDay).find(([, count]) => count > 4);
  if (overcrowded) {
    const dayNum = overcrowded[0].split('-day-')[1];
    recs.push({
      icon: Clock,
      color: 'text-purple-400',
      bg:    'bg-purple-500/10 border-purple-500/20',
      text:  `Day ${dayNum} has ${overcrowded[1]} activities — moving one could create valuable free time for spontaneous exploration.`
    });
  }

  // 4. Transport vs. Activities imbalance
  const transport = categoryBreakdown.find(c => c.name === 'Flights' || c.name === 'Local Transit');
  const actCosts  = categoryBreakdown.find(c => c.name === 'Activities');
  if (transport && actCosts && transport.total > actCosts.total * 2) {
    recs.push({
      icon: Plane,
      color: 'text-rose-400',
      bg:    'bg-rose-500/10 border-rose-500/20',
      text:  `Transport is consuming a large share of your budget. Consider overnight trains or budget airlines to save ₹${toINR(transport.total * 0.2).toLocaleString('en-IN')}.`
    });
  }

  // 5. Budget headroom positive nudge
  if (summary.remainingBudget > summary.totalBudget * 0.3 && summary.totalBudget > 0) {
    recs.push({
      icon: Lightbulb,
      color: 'text-emerald-400',
      bg:    'bg-emerald-500/10 border-emerald-500/20',
      text:  `You have ₹${toINR(summary.remainingBudget).toLocaleString('en-IN')} in remaining budget — consider adding a premium experience like a private cooking class or sunset cruise.`
    });
  }

  return recs.slice(0, 4);
}

// ── Main Component ───────────────────────────────────────────
export const SmartRecommendations = ({ trip, summary, health }) => {
  const recs = useMemo(() => generateRecommendations(trip, summary, health), [trip, summary, health]);

  if (recs.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-4 h-4 text-amber-400" />
        <h4 className="text-sm font-bold text-white">Smart Recommendations</h4>
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
          {recs.length} insights
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {recs.map((rec, i) => {
          const Icon = rec.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className={`flex items-start gap-3 p-3.5 rounded-2xl border text-xs ${rec.bg}`}
            >
              <div className={`mt-0.5 shrink-0 ${rec.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-slate-300 leading-relaxed">{rec.text}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
