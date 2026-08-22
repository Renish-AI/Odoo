import React, { useState } from 'react';
import { List, GitCommit, Calendar, Layers } from 'lucide-react';
import { DayItineraryPlanner } from './DayItineraryPlanner';
import { TimelineView } from './TimelineView';
import { InteractiveCalendar } from '../calendar/InteractiveCalendar';

export const ItineraryViewSwitcher = ({ trip }) => {
  const [viewMode, setViewMode] = useState('list'); // list | timeline | calendar

  const views = [
    { id: 'list', label: 'Day-by-Day List', icon: List },
    { id: 'timeline', label: 'Visual Timeline', icon: GitCommit },
    { id: 'calendar', label: 'Date Calendar', icon: Calendar },
  ];

  return (
    <div className="space-y-6">
      
      {/* Animated View Toggle Tabs */}
      <div className="flex items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-1.5">
          {views.map((v) => {
            const Icon = v.icon;
            const isActive = viewMode === v.id;
            return (
              <button
                key={v.id}
                onClick={() => setViewMode(v.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{v.label}</span>
              </button>
            );
          })}
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 pr-2">
          <span>Mode:</span>
          <span className="font-bold text-emerald-400 capitalize">{viewMode} View</span>
        </div>
      </div>

      {/* View Component Content */}
      <div className="transition-all duration-300">
        {viewMode === 'list' && <DayItineraryPlanner trip={trip} />}
        {viewMode === 'timeline' && <TimelineView trip={trip} />}
        {viewMode === 'calendar' && <InteractiveCalendar trip={trip} />}
      </div>
    </div>
  );
};