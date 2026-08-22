import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Sparkles,
  Plane,
  Train,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

export const TripTimelineView = ({ trip }) => {
  const stops = trip?.stops || [];
  const activities = trip?.activities || [];
  const [selectedFilterStop, setSelectedFilterStop] = useState('All');

  const filteredStops = selectedFilterStop === 'All'
    ? stops
    : stops.filter((s) => s.cityName === selectedFilterStop);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Journey Calendar & Timeline</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Full chronological visual timeline of your stops, transit legs, and day-by-day activities.
          </p>
        </div>

        {/* Filter Stop */}
        <select
          value={selectedFilterStop}
          onChange={(e) => setSelectedFilterStop(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="All">All Cities Timeline</option>
          {stops.map((s) => (
            <option key={s.id} value={s.cityName}>{s.cityName}</option>
          ))}
        </select>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-emerald-500 before:via-teal-500 before:to-emerald-500">
        {filteredStops.map((stop, stopIdx) => {
          const stopActivities = activities.filter((a) => a.tripStopId === stop.id);

          return (
            <div key={stop.id} className="relative space-y-4">
              
              {/* City Stop Marker */}
              <div className="relative">
                <div className="absolute -left-[30px] sm:-left-[38px] top-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-500/30">
                  {stopIdx + 1}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={stop.coverImage}
                      alt={stop.cityName}
                      className="w-10 h-10 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-white">{stop.cityName}, {stop.countryName}</h4>
                      <div className="text-xs text-slate-400 flex items-center gap-2">
                        <span>📅 {stop.arrivalDate} to {stop.departureDate}</span>
                        {stop.transitDurationMins > 0 && (
                          <span className="text-emerald-400 font-medium">
                            • ~{Math.round(stop.transitDurationMins / 60)}h transit
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
                    {stopActivities.length} Scheduled Activities
                  </span>
                </div>
              </div>

              {/* Day Activities for this stop */}
              <div className="pl-4 space-y-2.5">
                {stopActivities.length === 0 ? (
                  <div className="text-xs text-slate-500 italic py-2 pl-2 border-l border-slate-800">
                    No scheduled activities logged for this destination yet.
                  </div>
                ) : (
                  stopActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 shrink-0">
                          {act.startTime || '09:00'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-400 px-1.5 py-0.2 rounded bg-emerald-500/10">
                              Day {act.dayNumber}
                            </span>
                            <span className="text-xs font-semibold text-white truncate">
                              {act.title}
                            </span>
                          </div>
                          {act.locationName && (
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5" />
                              <span className="truncate">{act.locationName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {act.cost > 0 ? (
                          <span className="text-xs font-bold text-emerald-400">${act.cost}</span>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-medium">Free</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
