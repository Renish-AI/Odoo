import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, ChevronRight, Plus, Trash2, Edit3, X, Check, GripVertical
} from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useTrips } from '../../context/TripContext';

const CATEGORY_COLORS = {
  Culture:     'bg-purple-500/20 text-purple-300 border-purple-500/30',
  Food:        'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Sightseeing: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  Nature:      'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  Adventure:   'bg-rose-500/20 text-rose-300 border-rose-500/30',
  Relax:       'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Shopping:    'bg-pink-500/20 text-pink-300 border-pink-500/30',
  default:     'bg-slate-700/40 text-slate-300 border-slate-700'
};

// Build a date → array of activities mapping
function buildDateActivityMap(stops, activities) {
  const map = {};
  stops.forEach((stop) => {
    const start = stop.arrivalDate ? new Date(stop.arrivalDate) : null;
    if (!start) return;
    const stopActs = activities.filter((a) => a.tripStopId === stop.id);
    stopActs.forEach((act) => {
      const dayOffset = Math.max(0, (act.dayNumber || 1) - 1);
      const d = new Date(start);
      d.setDate(d.getDate() + dayOffset);
      const key = d.toISOString().split('T')[0];
      if (!map[key]) map[key] = { activities: [], stop };
      map[key].activities.push(act);
    });
  });
  return map;
}

// Build trip date range set
function buildTripDateSet(stops) {
  const set = new Set();
  stops.forEach((stop) => {
    if (!stop.arrivalDate || !stop.departureDate) return;
    const cur = new Date(stop.arrivalDate);
    const end = new Date(stop.departureDate);
    while (cur <= end) {
      set.add(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
  });
  return set;
}

// ── Sortable Activity ────────────────────────────────────────
const SortableActivity = ({ act, onDelete, onToggleBooked }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: act.id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  const colorClass = CATEGORY_COLORS[act.category] || CATEGORY_COLORS.default;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2.5 rounded-xl border bg-slate-950/60 transition-all ${
        isDragging ? 'shadow-2xl scale-[1.02] opacity-90 border-emerald-500/40' : 'border-slate-800'
      }`}
    >
      <button {...attributes} {...listeners} className="text-slate-600 hover:text-slate-400 cursor-grab active:cursor-grabbing shrink-0">
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-white truncate">{act.title}</div>
        {act.startTime && (
          <div className="text-[10px] text-slate-500 font-mono">{act.startTime} – {act.endTime || '?'}</div>
        )}
      </div>

      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${colorClass}`}>
        {act.category || 'Activity'}
      </span>

      <button
        onClick={() => onDelete(act.id)}
        className="p-1 text-slate-600 hover:text-rose-400 transition-colors shrink-0"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </div>
  );
};

// ── Day Drawer ───────────────────────────────────────────────
const DayDrawer = ({ dateKey, dayData, trip, onClose }) => {
  const { deleteActivity, addActivity } = useTrips();
  const [actItems, setActItems] = useState(dayData?.activities || []);
  const [showAdd, setShowAdd] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Sightseeing');
  const [newTime, setNewTime] = useState('09:00');
  const [newCost, setNewCost] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setActItems((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDelete = async (actId) => {
    await deleteActivity(trip.id, actId);
    setActItems((prev) => prev.filter((a) => a.id !== actId));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const stop = dayData?.stop;
    if (!stop) return;

    const newAct = await addActivity(trip.id, stop.id, {
      title: newTitle,
      category: newCategory,
      startTime: newTime,
      cost: Number(newCost) || 0,
      dayNumber: 1,
      status: 'planned'
    });
    if (newAct) setActItems((prev) => [...prev, newAct]);
    setNewTitle('');
    setNewCost('');
    setShowAdd(false);
  };

  const dateLabel = new Date(dateKey + 'T00:00:00').toLocaleDateString('en-IN', {
    weekday: 'long', month: 'long', day: 'numeric'
  });

  return (
    <motion.div
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-2xl max-h-[75vh] flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div>
          <div className="text-sm font-bold text-white">{dateLabel}</div>
          <div className="text-[11px] text-slate-400">
            {dayData?.stop?.cityName} • {actItems.length} activities
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showAdd && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleAdd}
            className="overflow-hidden border-b border-slate-800"
          >
            <div className="p-4 grid grid-cols-2 gap-2.5">
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Activity name"
                className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="time"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                value={newCost}
                onChange={(e) => setNewCost(e.target.value)}
                placeholder="Cost (₹)"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="col-span-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                {Object.keys(CATEGORY_COLORS).filter(k => k !== 'default').map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <div className="col-span-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-slate-400 px-3 py-1.5">
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400"
                >
                  Save Activity
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Sortable activity list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {actItems.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">No activities for this day yet. Add one above!</div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={actItems.map((a) => a.id)} strategy={verticalListSortingStrategy}>
              {actItems.map((act) => (
                <SortableActivity key={act.id} act={act} onDelete={handleDelete} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </motion.div>
  );
};

// ── Main Calendar ────────────────────────────────────────────
export const ItineraryCalendar = ({ trip }) => {
  const stops = trip?.stops || [];
  const activities = trip?.activities || [];

  // Default to month of first stop's arrival
  const firstStopDate = stops[0]?.arrivalDate ? new Date(stops[0].arrivalDate) : new Date();
  const [viewDate, setViewDate] = useState(new Date(firstStopDate.getFullYear(), firstStopDate.getMonth(), 1));
  const [selectedDay, setSelectedDay] = useState(null);
  const [slideDir, setSlideDir] = useState(1); // 1 = forward, -1 = back

  const dateActMap = useMemo(() => buildDateActivityMap(stops, activities), [stops, activities]);
  const tripDateSet = useMemo(() => buildTripDateSet(stops), [stops]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const changeMonth = (dir) => {
    setSlideDir(dir);
    setSelectedDay(null);
    setViewDate(new Date(year, month + dir, 1));
  };

  const monthLabel = viewDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const calendarVariants = {
    enter: (dir) => ({ x: dir * 40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: (dir) => ({ x: -dir * 40, opacity: 0, transition: { duration: 0.2 } })
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-4">
      {/* Month Nav Header */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
        <button
          onClick={() => changeMonth(-1)}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <AnimatePresence mode="wait" custom={slideDir}>
          <motion.div
            key={monthLabel}
            custom={slideDir}
            variants={calendarVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="text-sm font-bold text-white"
          >
            {monthLabel}
          </motion.div>
        </AnimatePresence>

        <button
          onClick={() => changeMonth(1)}
          className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-slate-500 uppercase py-1">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <AnimatePresence mode="wait" custom={slideDir}>
        <motion.div
          key={`${year}-${month}`}
          custom={slideDir}
          variants={calendarVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="grid grid-cols-7 gap-1"
        >
          {/* Leading blank cells */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const dayData = dateActMap[dateKey];
            const inTrip = tripDateSet.has(dateKey);
            const isToday = dateKey === today;
            const isSelected = selectedDay === dateKey;
            const actCount = dayData?.activities?.length || 0;

            return (
              <motion.button
                key={dateKey}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDay(isSelected ? null : dateKey)}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-bold transition-all border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/30'
                    : inTrip
                    ? 'bg-slate-800/60 text-white border-slate-700 hover:border-emerald-500/40'
                    : isToday
                    ? 'bg-slate-900 text-emerald-400 border-emerald-500/30'
                    : 'text-slate-600 border-transparent hover:bg-slate-900/50'
                }`}
              >
                <span>{dayNum}</span>
                {actCount > 0 && (
                  <div className="flex gap-0.5">
                    {Array.from({ length: Math.min(actCount, 3) }).map((_, dot) => (
                      <span
                        key={dot}
                        className={`w-1 h-1 rounded-full ${isSelected ? 'bg-slate-950/50' : 'bg-emerald-400'}`}
                      />
                    ))}
                  </div>
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Day Drawer */}
      <AnimatePresence>
        {selectedDay && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setSelectedDay(null)}
            />
            <DayDrawer
              key={selectedDay}
              dateKey={selectedDay}
              dayData={dateActMap[selectedDay] || { activities: [], stop: stops[0] }}
              trip={trip}
              onClose={() => setSelectedDay(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
