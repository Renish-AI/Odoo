import React from 'react';
import { MapPin, Calendar, Compass, ArrowRight, DollarSign, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export const VisualJourney = ({ trip }) => {
  const stops = trip?.stops || [];
  const activities = trip?.activities || [];

  // Helper to format date
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Calculate total stops cost
  const getStopCost = (stop) => {
    // 1. Transit cost
    const transit = Number(stop.transitCost) || 0;
    // 2. Activities cost
    const stopActs = activities.filter((a) => a.tripStopId === stop.id);
    const actsCost = stopActs.reduce((acc, a) => acc + (Number(a.cost) || 0), 0);
    // Total
    return transit + actsCost;
  };

  // If no stops, display empty state
  if (stops.length === 0) {
    return (
      <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40 space-y-4">
        <Compass className="w-12 h-12 text-slate-600 mx-auto animate-spin-slow" />
        <h4 className="text-lg font-bold text-white">Your Journey is Empty</h4>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Add stops to your route to construct your visual milestone timeline.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-8 relative overflow-hidden">
      
      {/* Title */}
      <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-400 animate-pulse" />
            YOUR JOURNEY
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Every destination is a milestone. Explore the chronological stops of your adventure.
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-500 font-bold uppercase block">Total Stop Cost</span>
          <span className="text-lg font-black text-emerald-400">
            ${stops.reduce((acc, s) => acc + getStopCost(s), 0).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Timeline stack */}
      <div className="max-w-3xl mx-auto py-4 relative">
        {/* Continuous background connector line */}
        <div className="absolute left-6 md:left-1/2 top-8 bottom-8 w-0.5 bg-gradient-to-b from-teal-500 via-emerald-500 to-cyan-500 transform md:-translate-x-1/2 opacity-20 pointer-events-none" />

        <div className="space-y-12">
          {stops.map((stop, idx) => {
            const stopActs = activities.filter((a) => a.tripStopId === stop.id);
            const totalCost = getStopCost(stop);
            const isEven = idx % 2 === 0;

            return (
              <div key={stop.id} className="relative flex flex-col md:flex-row md:items-center">
                
                {/* Milestone Node Pin */}
                <div className="absolute left-6 md:left-1/2 w-4 h-4 rounded-full bg-slate-950 border-4 border-emerald-400 transform md:-translate-x-1/2 z-10 shadow-lg shadow-emerald-500/20" />

                {/* Left/Right alignment wrappers */}
                <div className={`pl-14 md:pl-0 w-full md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:order-2 md:pl-12'}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/30 transition-all shadow-xl group space-y-4"
                  >
                    {/* Cover image of milestone */}
                    <div className="relative h-40 rounded-xl overflow-hidden shadow-inner border border-slate-900">
                      <img 
                        src={stop.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=800&q=80'} 
                        alt={stop.cityName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3 text-left">
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950 px-2 py-0.5 rounded">
                          Stop #{idx + 1}
                        </span>
                        <h4 className="text-lg font-black text-white mt-1 leading-none">{stop.cityName}</h4>
                        <span className="text-[11px] text-teal-400 font-bold block mt-0.5">{stop.countryName}</span>
                      </div>
                    </div>

                    {/* Meta info: Dates & Cost */}
                    <div className="text-left space-y-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{formatDate(stop.arrivalDate)} to {formatDate(stop.departureDate)}</span>
                      </div>
                      
                      <div className="flex justify-between items-center bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                        <div>
                          <span className="text-[10px] text-slate-500 uppercase font-black block">Transit ({stop.transitMode})</span>
                          <span className="text-slate-300 font-bold">${Number(stop.transitCost) || 0}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-500 uppercase font-black block">Stop Cost</span>
                          <span className="text-emerald-400 font-black">${totalCost.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    {/* Activities List */}
                    <div className="text-left">
                      <span className="text-[10px] text-slate-500 uppercase font-black block mb-2">Activities ({stopActs.length})</span>
                      {stopActs.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic">No experiences planned for this milestone.</p>
                      ) : (
                        <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 scrollbar-thin">
                          {stopActs.map((act) => (
                            <div key={act.id} className="flex items-center justify-between text-[11px] bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                              <span className="text-slate-300 truncate max-w-[140px]">{act.title}</span>
                              <span className="font-semibold text-emerald-400 font-mono">${act.cost}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Arrow connectors */}
                {idx < stops.length - 1 && (
                  <div className="absolute left-6 md:left-1/2 top-full -mt-2 h-12 flex items-center justify-center transform md:-translate-x-1/2 z-20">
                    <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-lg text-emerald-400 font-black animate-bounce">
                      ↓
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
