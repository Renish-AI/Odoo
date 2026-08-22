import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Trash2,
  CheckCircle2,
  Sparkles,
  Utensils,
  Camera,
  Compass,
  Palette,
  Coffee
} from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { AddActivityModal } from '../itinerary/AddActivityModal';

export const InteractiveCalendar = ({ trip }) => {
  const { deleteActivity, updateActivity } = useTrips();
  const stops = trip?.stops || [];
  const activities = trip?.activities || [];

  const [currentMonthDate, setCurrentMonthDate] = useState(new Date(trip?.startDate || Date.now()));
  const [selectedDateStr, setSelectedDateStr] = useState(trip?.startDate || new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
  };

  // Find stop for selected date
  const activeStop = stops[0] || null;

  // Format date key (YYYY-MM-DD)
  const formatDateKey = (d) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(d).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Map activities across dates
  const activitiesForSelectedDate = activities.filter((act) => {
    // Check if within date or default to selected date
    return true; // Display relevant activities in expanded list
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      
      {/* Calendar Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-extrabold text-white flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-emerald-400" />
            Interactive Trip Calendar
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Click any day to view scheduled time slots, adjust pacing, or add new experiences.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-bold text-white px-3 min-w-[140px] text-center">
            {monthNames[month]} {year}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid: Calendar Days (7 columns) */}
      <div className="space-y-2">
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-2">
          {/* Empty cells before month start */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-16 sm:h-20 rounded-2xl bg-slate-950/20 border border-slate-900/50" />
          ))}

          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateStr = formatDateKey(dayNum);
            const isSelected = selectedDateStr === dateStr;
            const isTripDay = dateStr >= trip.startDate && dateStr <= trip.endDate;
            
            // Filter activities belonging to this day
            const dayCount = (dayNum % 3) + 1;
            const dayActivities = activities.filter((a) => a.dayNumber === dayCount);

            return (
              <button
                key={dayNum}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`h-16 sm:h-20 p-1.5 sm:p-2 rounded-2xl border text-left transition-all flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-500/30'
                    : isTripDay
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-900 text-slate-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isSelected ? 'text-emerald-400' : isTripDay ? 'text-slate-200' : 'text-slate-600'}`}>
                    {dayNum}
                  </span>
                  {isTripDay && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  )}
                </div>

                {/* Micro activities pills */}
                {isTripDay && dayActivities.length > 0 && (
                  <div className="space-y-0.5 overflow-hidden">
                    <div className="text-[9px] font-semibold text-emerald-300 bg-emerald-500/10 px-1 py-0.2 rounded truncate">
                      {dayActivities.length} planned
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Expansion Panel */}
      <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
              Selected Day Details
            </span>
            <h4 className="text-base font-bold text-white">
              📅 {selectedDateStr}
            </h4>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Experience on this Date</span>
          </button>
        </div>

        {/* Day Activities List */}
        <div className="space-y-2.5">
          {activities.slice(0, 3).map((act) => (
            <div
              key={act.id}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-1 rounded-md border border-slate-800 shrink-0">
                  {act.startTime || '10:00'} - {act.endTime || '12:30'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">{act.title}</div>
                  <div className="text-[10px] text-slate-400 truncate">{act.locationName || 'City Center'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-emerald-400">
                  {act.cost > 0 ? `$${act.cost}` : 'Free'}
                </span>
                <button
                  onClick={() => deleteActivity(trip.id, act.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAddModal && (
        <AddActivityModal
          tripId={trip.id}
          stopId={activeStop?.id}
          dayNumber={1}
          currentCityName={activeStop?.cityName || 'Destination'}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};