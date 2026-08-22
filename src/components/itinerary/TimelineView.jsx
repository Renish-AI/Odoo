import React from 'react';
import { 
  MapPin, 
  Clock, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Plane, 
  Train, 
  Car, 
  Ship,
  CheckCircle2,
  Camera,
  Utensils,
  Palette,
  Compass,
  Coffee,
  Moon
} from 'lucide-react';

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Food':
      return { icon: Utensils, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
    case 'Culture':
      return { icon: Palette, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
    case 'Adventure':
      return { icon: Compass, color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' };
    case 'Relax':
      return { icon: Coffee, color: 'text-teal-400', bg: 'bg-teal-500/10 border-teal-500/30' };
    case 'Nightlife':
      return { icon: Moon, color: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30' };
    default:
      return { icon: Camera, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
  }
};

const getTransitIcon = (mode) => {
  switch (mode) {
    case 'train':
      return Train;
    case 'drive':
      return Car;
    case 'ferry':
      return Ship;
    default:
      return Plane;
  }
};

export const TimelineView = ({ trip }) => {
  const stops = trip?.stops || [];
  const activities = trip?.activities || [];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="text-lg font-extrabold text-white tracking-tight">Visual Journey Flow & Timeline</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Staggered chronological visual story showing every connected city and time-slotted experience.
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-950/80 border border-slate-800 px-3.5 py-1.5 rounded-full">
          <span>{stops.length} Connected Cities</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">{activities.length} Experiences</span>
        </div>
      </div>

      {/* Main Visual Stream with Animated Connecting Route Line */}
      <div className="relative pl-6 sm:pl-10 space-y-12">
        
        {/* Continuous Animated Vertical Route Line */}
        <div className="absolute left-[11px] sm:left-[15px] top-6 bottom-6 w-[3px] bg-gradient-to-b from-emerald-500 via-teal-400 to-cyan-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />

        {stops.map((stop, stopIdx) => {
          const stopActivities = activities.filter((a) => a.tripStopId === stop.id);
          const TransitIcon = getTransitIcon(stop.transitMode);

          return (
            <div key={stop.id} className="relative space-y-6">
              
              {/* 1. Glowing City Node Marker */}
              <div className="relative flex items-center gap-4">
                <div className="absolute -left-[32px] sm:-left-[41px] w-8 h-8 rounded-full bg-slate-950 border-4 border-emerald-400 shadow-lg shadow-emerald-500/50 flex items-center justify-center text-[11px] font-extrabold text-emerald-400 z-10">
                  ●
                </div>

                <div className="flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-slate-950/90 border border-slate-800 shadow-xl hover:border-emerald-500/40 transition-all">
                  <div className="flex items-center gap-4">
                    <img
                      src={stop.coverImage}
                      alt={stop.cityName}
                      className="w-14 h-14 rounded-2xl object-cover shadow-md"
                    />
                    <div>
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        Stop {stopIdx + 1}
                      </div>
                      <h4 className="text-lg font-extrabold text-white tracking-tight">
                        {stop.cityName.toUpperCase()}, {stop.countryName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {stop.arrivalDate} → {stop.departureDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {stop.transitDurationMins > 0 && (
                      <span className="text-xs font-semibold px-3 py-1 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                        <TransitIcon className="w-3.5 h-3.5 text-emerald-400" />
                        ~{Math.round(stop.transitDurationMins / 60)}h transit
                      </span>
                    )}
                    <span className="text-xs font-bold px-3 py-1 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {stopActivities.length} Experiences
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. Staggered Sub-Activities Cards */}
              <div className="pl-4 sm:pl-6 space-y-3">
                {stopActivities.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-2 pl-3 border-l-2 border-slate-800">
                    No scheduled activities logged for {stop.cityName} yet.
                  </div>
                ) : (
                  stopActivities.map((act, actIdx) => {
                    const theme = getCategoryIcon(act.category);
                    const CatIcon = theme.icon;

                    return (
                      <div
                        key={act.id}
                        className="relative group p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-emerald-500/40 shadow-lg transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        {/* Connecting branch line */}
                        <div className="absolute -left-[20px] sm:-left-[28px] top-1/2 w-4 h-[2px] bg-slate-700 group-hover:bg-emerald-400 transition-colors" />

                        <div className="flex items-start gap-3 min-w-0">
                          <div className={`p-2.5 rounded-xl border ${theme.bg} shrink-0 mt-0.5`}>
                            <CatIcon className={`w-4 h-4 ${theme.color}`} />
                          </div>
                          
                          <div className="space-y-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                                Day {act.dayNumber} • {act.startTime || '09:00'} - {act.endTime || '11:00'}
                              </span>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${theme.color}`}>
                                {act.category}
                              </span>
                              <h5 className="text-sm font-bold text-white truncate">{act.title}</h5>
                            </div>

                            {act.description && (
                              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                                {act.description}
                              </p>
                            )}

                            {act.locationName && (
                              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{act.locationName}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                          {act.cost > 0 ? (
                            <span className="text-xs font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                              ${act.cost}
                            </span>
                          ) : (
                            <span className="text-xs font-medium text-slate-500 px-2 py-1 rounded-lg bg-slate-950">
                              Free
                            </span>
                          )}

                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            act.status === 'booked'
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-slate-800 border-slate-700 text-slate-400'
                          }`}>
                            {act.status === 'booked' ? '✓ Booked' : 'Planned'}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Transit connector between cities */}
              {stopIdx < stops.length - 1 && (
                <div className="pl-4 sm:pl-6 py-2 flex items-center gap-3 text-xs text-slate-500">
                  <div className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400">
                    <TransitIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-slate-400">
                    Transit from {stop.cityName} to {stops[stopIdx + 1]?.cityName} (~{stop.transitDurationMins || 150} mins)
                  </span>
                  <span className="text-emerald-400 font-bold ml-auto">${stop.transitCost || 80}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};