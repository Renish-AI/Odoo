import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  CheckCircle,
  Sparkles,
  GripVertical,
  Utensils,
  Camera,
  Compass,
  Palette,
  Coffee,
  Moon,
  Ticket
} from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { AddActivityModal } from './AddActivityModal';

const getCategoryTheme = (category) => {
  switch (category) {
    case 'Food':
      return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', icon: Utensils };
    case 'Culture':
      return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', icon: Palette };
    case 'Adventure':
      return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', icon: Compass };
    case 'Relax':
      return { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', icon: Coffee };
    case 'Nightlife':
      return { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20', icon: Moon };
    default:
      return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', icon: Camera };
  }
};

import { motion, AnimatePresence } from 'framer-motion';

const SortableActivityItem = ({ activity, tripId, onDelete, onToggleStatus }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.6 : 1
  };

  const theme = getCategoryTheme(activity.category);
  const CategoryIcon = theme.icon;

  return (
    <div ref={setNodeRef} style={style}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 transition-all shadow-md flex items-start gap-3.5"
      >
        {/* Drag Handle */}
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-800 text-slate-600 hover:text-slate-300 mt-1"
          title="Drag to reorder time order"
        >
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Category Icon Badge */}
        <div className={`p-2.5 rounded-xl ${theme.bg} ${theme.border} border shrink-0 mt-0.5`}>
          <CategoryIcon className={`w-4 h-4 ${theme.text}`} />
        </div>

        {/* Main Details */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${theme.bg} ${theme.text}`}>
                {activity.category}
              </span>
              <h4 className="text-sm font-bold text-white truncate">{activity.title}</h4>
            </div>

            <div className="flex items-center gap-2">
              {activity.cost > 0 ? (
                <span className="text-xs font-semibold text-emerald-400">
                  ${activity.cost}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-500">Free</span>
              )}

              <button
                onClick={() => onDelete(activity.id)}
                className="p-1 text-slate-600 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete activity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {activity.description && (
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              {activity.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{activity.startTime || '09:00'} - {activity.endTime || '11:00'}</span>
            </div>

            {activity.locationName && (
              <div className="flex items-center gap-1 truncate max-w-[200px]">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate">{activity.locationName}</span>
              </div>
            )}

            <button
              onClick={() => onToggleStatus(activity)}
              className={`ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1 ${
                activity.status === 'booked'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle className="w-3 h-3" />
              <span>{activity.status === 'booked' ? 'Booked' : 'Mark Booked'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export const DayItineraryPlanner = ({ trip }) => {
  const { deleteActivity, updateActivity } = useTrips();
  const stops = trip?.stops || [];
  
  const [selectedStopId, setSelectedStopId] = useState(stops[0]?.id || '');
  const [selectedDay, setSelectedDay] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const activeStop = stops.find((s) => s.id === selectedStopId) || stops[0];

  // Calculate days for active stop
  const stopDaysCount = 3; // Default 3 days per city stop
  const dayTabs = Array.from({ length: stopDaysCount }, (_, i) => i + 1);

  // Filter activities for this stop and day
  const dayActivities = (trip?.activities || [])
    .filter((a) => a.tripStopId === (activeStop?.id || '') && a.dayNumber === selectedDay)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = dayActivities.findIndex((a) => a.id === active.id);
      const newIndex = dayActivities.findIndex((a) => a.id === over?.id);
      const reordered = arrayMove(dayActivities, oldIndex, newIndex);
      
      // Update order index
      reordered.forEach((act, idx) => {
        updateActivity(trip.id, act.id, { orderIndex: idx });
      });
    }
  };

  const handleToggleStatus = (activity) => {
    const nextStatus = activity.status === 'booked' ? 'planned' : 'booked';
    updateActivity(trip.id, activity.id, { status: nextStatus });
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
      
      {/* Stops Selector Tabs */}
      <div>
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
          Select City Destination
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {stops.map((stop, idx) => {
            const isSelected = (activeStop?.id === stop.id);
            return (
              <button
                key={stop.id}
                onClick={() => {
                  setSelectedStopId(stop.id);
                  setSelectedDay(1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-slate-700'
                }`}
              >
                <span>{idx + 1}. {stop.cityName}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  isSelected ? 'bg-slate-950/30 text-slate-900' : 'bg-slate-800 text-slate-400'
                }`}>
                  {stop.countryCode}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Day Selector & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {dayTabs.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Activity to Day {selectedDay}</span>
        </button>
      </div>

      {/* Activities List */}
      <div>
        {dayActivities.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/30">
            <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-300">No activities scheduled for Day {selectedDay}</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Add iconic sightseeing, neighborhood food tours, or relaxing afternoon walks to complete this day.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-slate-700 hover:border-emerald-500/30 transition-all"
            >
              + Discover & Add Experiences
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={dayActivities.map((a) => a.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {dayActivities.map((activity) => (
                    <SortableActivityItem
                      key={activity.id}
                      activity={activity}
                      tripId={trip.id}
                      onDelete={(id) => deleteActivity(trip.id, id)}
                      onToggleStatus={handleToggleStatus}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {showAddModal && (
        <AddActivityModal
          tripId={trip.id}
          stopId={activeStop?.id}
          dayNumber={selectedDay}
          currentCityName={activeStop?.cityName || 'Destination'}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
};
