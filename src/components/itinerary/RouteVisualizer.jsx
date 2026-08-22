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
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plane,
  Train,
  Car,
  Ship,
  MapPin,
  Calendar,
  GripVertical,
  Plus,
  Trash2,
  Clock,
  DollarSign,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { GLOBAL_DESTINATIONS } from '../../data/destinations';
import { InteractiveMap } from './InteractiveMap';

import { motion, AnimatePresence } from 'framer-motion';

const SortableStopCard = ({ stop, index, totalStops, onEdit, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 30 : 1,
    opacity: isDragging ? 0.7 : 1
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

  const TransitIcon = getTransitIcon(stop.transitMode);

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.8, x: 20 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center"
      >
        {/* City Stop Card */}
        <div className="relative group w-64 bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-lg hover:border-emerald-500/40 transition-all flex flex-col justify-between">
          
          {/* Drag handle & order badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                {index + 1}
              </span>
              <span className="text-xs font-bold text-white truncate max-w-[120px]">
                {stop.cityName}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(stop.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-0 group-hover:opacity-100"
                title="Remove Stop"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <div
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300"
                title="Drag to reorder"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Thumbnail Image */}
          <div className="relative h-24 rounded-xl overflow-hidden mb-2.5">
            <img
              src={stop.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80'}
              alt={stop.cityName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[11px] text-slate-200 font-medium">
              <span>{stop.countryName}</span>
              <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm">
                {stop.transitDurationMins > 0 ? `${Math.round(stop.transitDurationMins / 60)}h transit` : 'Origin'}
              </span>
            </div>
          </div>

          {/* Dates & Quick notes */}
          <div className="space-y-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>{stop.arrivalDate} → {stop.departureDate}</span>
            </div>
            {stop.notes && (
              <div className="text-[10px] text-slate-400 truncate italic">
                "{stop.notes}"
              </div>
            )}
          </div>
        </div>

        {/* Transit Connector between stops */}
        {index < totalStops - 1 && (
          <div className="flex flex-col items-center px-3 text-slate-500">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-semibold text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors">
              <TransitIcon className="w-3 h-3 text-emerald-400" />
              <span>~{stop.transitDurationMins || 120}m</span>
            </div>
            <div className="w-8 h-[2px] bg-gradient-to-r from-emerald-500/40 via-teal-500/60 to-emerald-500/40 my-1" />
            <div className="text-[9px] text-slate-500 font-medium">${stop.transitCost || 60}</div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export const RouteVisualizer = ({ trip }) => {
  const { reorderStops, addStop, deleteStop } = useTrips();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState('');
  const [transitMode, setTransitMode] = useState('flight');
  const [transitDuration, setTransitDuration] = useState(150);
  const [transitCost, setTransitCost] = useState(85);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5
      }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const stops = trip?.stops || [];

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over?.id);
      const reordered = arrayMove(stops, oldIndex, newIndex);
      reorderStops(trip.id, reordered);
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedCity) return;

    const dest = GLOBAL_DESTINATIONS.find((d) => d.city === selectedCity);
    await addStop(trip.id, {
      cityName: selectedCity,
      countryName: dest?.country || 'Destination',
      transitMode,
      transitDurationMins: Number(transitDuration),
      transitCost: Number(transitCost),
      arrivalDate: trip.startDate,
      departureDate: trip.endDate
    });

    setSelectedCity('');
    setShowAddModal(false);
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl">
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Multi-City Route & Stops</h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {stops.length} Cities
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Drag and reorder cities to instantly optimize your travel route and transit calculations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 hover:border-emerald-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5 text-emerald-400" />
          <span>Add City Stop</span>
        </button>
      </div>

      {/* Interactive Map */}
      <div className="mb-6">
        <InteractiveMap stops={stops} activities={trip?.activities || []} />
      </div>

      {/* Horizontal Sortable Stops Container */}
      <div className="overflow-x-auto pb-4 pt-1 scrollbar-thin scrollbar-thumb-slate-800">
        {stops.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl">
            <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-xs text-slate-400">No destinations added to this journey yet.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold"
            >
              Add First City
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={stops.map((s) => s.id)}
              strategy={horizontalListSortingStrategy}
            >
              <div className="flex items-center min-w-max gap-1">
                <AnimatePresence mode="popLayout">
                  {stops.map((stop, idx) => (
                    <SortableStopCard
                      key={stop.id}
                      stop={stop}
                      index={idx}
                      totalStops={stops.length}
                      onDelete={(id) => deleteStop(trip.id, id)}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add Stop Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-1">Add City Stop to Journey</h4>
            <p className="text-xs text-slate-400 mb-4">
              Select a city and estimated transit from your previous stop.
            </p>

            <form onSubmit={handleAddStop} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Choose Destination
                </label>
                <select
                  required
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Select a city --</option>
                  {GLOBAL_DESTINATIONS.map((d) => (
                    <option key={d.city} value={d.city}>
                      {d.city}, {d.country} (${d.avgDailyBudget}/day)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Transit Mode
                  </label>
                  <select
                    value={transitMode}
                    onChange={(e) => setTransitMode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="flight">✈️ Flight</option>
                    <option value="train">🚄 Train / Rail</option>
                    <option value="drive">🚗 Road / Car</option>
                    <option value="ferry">🚢 Ferry / Boat</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Est. Transit Cost ($)
                  </label>
                  <input
                    type="number"
                    value={transitCost}
                    onChange={(e) => setTransitCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCity}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  Add Stop
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
