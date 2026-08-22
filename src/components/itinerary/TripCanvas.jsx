import React, { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
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
  Sparkles,
  Utensils,
  Camera,
  Compass,
  Palette,
  Coffee,
  Moon,
  CheckCircle,
  Edit2
} from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { GLOBAL_DESTINATIONS } from '../../data/destinations';
import { AddActivityModal } from './AddActivityModal';

// --- STYLES & THEMING ---
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

// --- SORTABLE CITY/STOP CARD ---
const SortableStopItem = ({ stop, index, totalStops, onSelect, isActive, onDelete, onUpdateDates }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(stop.id)}
      className={`group relative p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
        isActive 
          ? 'bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10' 
          : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
      } ${isDragging ? 'scale-105 shadow-2xl border-emerald-400 rotate-1' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-[10px] font-black flex items-center justify-center">
            {index + 1}
          </span>
          <h4 className="text-xs font-black text-white truncate max-w-[110px]">
            {stop.cityName}
          </h4>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(stop.id);
            }}
            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Remove Stop"
          >
            <Trash2 className="w-3 h-3" />
          </button>
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-350"
            onClick={(e) => e.stopPropagation()}
            title="Drag to reorder"
          >
            <GripVertical className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Dates Fields */}
      <div className="space-y-1.5 pt-1 text-[10px] text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3 text-slate-500" />
          <input
            type="date"
            value={stop.arrivalDate || ''}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdateDates(stop.id, { arrivalDate: e.target.value })}
            className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-[10px] text-slate-300 focus:outline-none"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <ArrowRight className="w-3 h-3 text-slate-500" />
          <input
            type="date"
            value={stop.departureDate || ''}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => onUpdateDates(stop.id, { departureDate: e.target.value })}
            className="bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 text-[10px] text-slate-300 focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};

// --- SORTABLE ACTIVITY ITEM ---
const SortableActivityCard = ({ activity, onDelete, onUpdateStatus, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: activity.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 1,
  };

  const theme = getCategoryTheme(activity.category);
  const CategoryIcon = theme.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative bg-slate-950/80 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 shadow-md flex items-start gap-3 transition-all ${
        isDragging ? 'scale-105 shadow-2xl border-emerald-400 rotate-1 bg-slate-900' : ''
      }`}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-slate-850 text-slate-650 hover:text-slate-300 mt-0.5"
        title="Drag to reorder"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      {/* Category icon */}
      <div className={`p-2 rounded-lg ${theme.bg} ${theme.border} border shrink-0`}>
        <CategoryIcon className={`w-3.5 h-3.5 ${theme.text}`} />
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-white truncate">{activity.title}</h4>
          <span className="text-[10px] text-emerald-400 font-mono shrink-0">
            {activity.cost > 0 ? `$${activity.cost}` : 'Free'}
          </span>
        </div>

        {activity.description && (
          <p className="text-[11px] text-slate-450 mt-1 line-clamp-1 leading-normal">
            {activity.description}
          </p>
        )}

        <div className="flex items-center justify-between gap-2 text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-900">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3 text-slate-550" />
            <span>{activity.startTime || '10:00'} - {activity.endTime || '12:00'}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onUpdateStatus(activity)}
              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border transition-colors ${
                activity.status === 'booked'
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-slate-850 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {activity.status === 'booked' ? '✓ Booked' : 'Book'}
            </button>
            <button
              onClick={() => onDelete(activity.id)}
              className="p-1 text-slate-650 hover:text-rose-400 rounded transition-colors opacity-0 group-hover:opacity-100"
              title="Delete Activity"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MAIN TRIP CANVAS COMPONENT ---
export const TripCanvas = ({ trip }) => {
  const { 
    addStop, 
    deleteStop, 
    updateStop, 
    reorderStops,
    addActivity, 
    updateActivity, 
    deleteActivity 
  } = useTrips();

  const stops = trip?.stops || [];
  const activities = trip?.activities || [];

  const [activeStopId, setActiveStopId] = useState(stops[0]?.id || '');
  const [activeDay, setActiveDay] = useState(1);
  const [showAddCityModal, setShowAddCityModal] = useState(false);
  const [showAddActivityModal, setShowAddActivityModal] = useState(false);
  const [selectedCityToAdd, setSelectedCityToAdd] = useState('');
  
  // Custom states for drag styling highlights
  const [isDraggingStop, setIsDraggingStop] = useState(false);
  const [isDraggingActivity, setIsDraggingActivity] = useState(false);

  // Fallback stop
  const currentStop = stops.find((s) => s.id === activeStopId) || stops[0];

  // Curated activity library list
  const cityData = GLOBAL_DESTINATIONS.find(
    (d) => d.city.toLowerCase() === currentStop?.cityName.toLowerCase()
  );
  const curatedActivities = cityData?.popularActivities || [];

  // Filter activities for this stop and day
  const filteredActivities = activities
    .filter((a) => a.tripStopId === (currentStop?.id || '') && a.dayNumber === activeDay)
    .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));

  // --- DND KIT SENSORS ---
  const stopSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const actSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- HANDLERS ---
  const handleStopDragStart = () => {
    setIsDraggingStop(true);
  };

  const handleStopDragEnd = (event) => {
    setIsDraggingStop(false);
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over?.id);
      const reordered = arrayMove(stops, oldIndex, newIndex);
      reorderStops(trip.id, reordered);
    }
  };

  const handleActDragStart = () => {
    setIsDraggingActivity(true);
  };

  const handleActDragEnd = (event) => {
    setIsDraggingActivity(false);
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = filteredActivities.findIndex((a) => a.id === active.id);
      const newIndex = filteredActivities.findIndex((a) => a.id === over?.id);
      const reordered = arrayMove(filteredActivities, oldIndex, newIndex);
      
      // Commit updates
      reordered.forEach((act, idx) => {
        updateActivity(trip.id, act.id, { orderIndex: idx });
      });
    }
  };

  const handleAddStop = async (e) => {
    e.preventDefault();
    if (!selectedCityToAdd) return;
    const dest = GLOBAL_DESTINATIONS.find((d) => d.city === selectedCityToAdd);
    
    // Default dates from trip
    const lastStop = stops[stops.length - 1];
    const arrivalDate = lastStop ? lastStop.departureDate : trip.startDate;
    const departureDate = trip.endDate;

    const stopData = {
      cityName: selectedCityToAdd,
      countryName: dest?.country || 'Destination',
      countryCode: dest?.countryCode || 'US',
      lat: dest?.lat || 0,
      lng: dest?.lng || 0,
      arrivalDate,
      departureDate,
      transitMode: 'flight',
      transitDurationMins: 120,
      transitCost: 150,
      coverImage: dest?.image || ''
    };

    const newStop = await addStop(trip.id, stopData);
    if (newStop) setActiveStopId(newStop.id);
    setSelectedCityToAdd('');
    setShowAddCityModal(false);
  };

  const handleAddCuratedActivity = async (item) => {
    if (!currentStop) return;
    await addActivity(trip.id, currentStop.id, {
      dayNumber: activeDay,
      title: item.title,
      description: `Top attraction in ${currentStop.cityName}`,
      category: item.category || 'Sightseeing',
      cost: Number(item.cost) || 0,
      startTime: '10:00',
      endTime: '12:30',
      locationName: `${item.title}, ${currentStop.cityName}`,
      status: 'planned'
    });
  };

  const handleUpdateStopDates = async (stopId, updates) => {
    await updateStop(trip.id, stopId, updates);
  };

  const handleActivityStatus = async (activity) => {
    const nextStatus = activity.status === 'booked' ? 'planned' : 'booked';
    await updateActivity(trip.id, activity.id, { status: nextStatus });
  };

  // 3-day itinerary limit default
  const daysRange = [1, 2, 3];

  return (
    <div className="space-y-6">
      
      {/* Canvas Dashboard Metrics */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-5 shadow-lg flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            TRIP CANVAS
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Construct your perfect travel blueprint. Reorder cities, customize schedules, and add experiences.
          </p>
        </div>
        
        {/* Real-time Health summary */}
        <div className="flex items-center gap-6">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Budget Allocations</span>
            <span className="text-xs font-bold text-slate-350">
              ${activities.reduce((acc, a) => acc + (Number(a.cost) || 0), 0).toLocaleString()} / ${trip.totalBudget?.toLocaleString()}
            </span>
          </div>
          <div className="text-right border-l border-slate-800 pl-6">
            <span className="text-[10px] text-slate-500 uppercase font-black block">Destinations</span>
            <span className="text-xs font-bold text-emerald-400">
              {stops.length} Cities Milestone
            </span>
          </div>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* COLUMN 1: DESTINATIONS (Col Span 3) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
            <h4 className="text-xs font-black uppercase text-slate-300 tracking-wider">Destinations</h4>
            <button
              onClick={() => setShowAddCityModal(true)}
              className="p-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-450 border border-emerald-500/30 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div 
            className={`p-1.5 rounded-2xl space-y-3 transition-colors ${
              isDraggingStop ? 'bg-slate-900/20 border border-dashed border-emerald-500/30' : ''
            }`}
          >
            {stops.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl bg-slate-950/20">
                <MapPin className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <span className="text-[11px] text-slate-450 block">No stops added</span>
              </div>
            ) : (
              <DndContext
                sensors={stopSensors}
                collisionDetection={closestCenter}
                onDragStart={handleStopDragStart}
                onDragEnd={handleStopDragEnd}
              >
                <SortableContext
                  items={stops.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {stops.map((stop, idx) => (
                      <SortableStopItem
                        key={stop.id}
                        stop={stop}
                        index={idx}
                        totalStops={stops.length}
                        isActive={currentStop?.id === stop.id}
                        onSelect={setActiveStopId}
                        onDelete={(id) => deleteStop(trip.id, id)}
                        onUpdateDates={handleUpdateStopDates}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* COLUMN 2: DAY-BY-DAY ITINERARY (Col Span 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl space-y-3.5">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider">Itinerary Builder</h4>
                <span className="text-[10px] text-slate-500 font-bold">
                  {currentStop ? `${currentStop.cityName} Stop Details` : 'Select a Stop'}
                </span>
              </div>

              {currentStop && (
                <button
                  onClick={() => setShowAddActivityModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 text-slate-950 font-black text-[10px] tracking-wider uppercase transition-all shadow-md shadow-emerald-500/10 hover:scale-105"
                >
                  + Add Experience
                </button>
              )}
            </div>

            {/* Days Tabs selector */}
            <div className="flex gap-1.5 border-t border-slate-900 pt-3 overflow-x-auto scrollbar-none">
              {daysRange.map((d) => (
                <button
                  key={d}
                  onClick={() => setActiveDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    activeDay === d
                      ? 'bg-slate-950 text-emerald-450 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-950/40'
                  }`}
                >
                  Day {d}
                </button>
              ))}
            </div>
          </div>

          <div 
            className={`p-1.5 rounded-2xl space-y-3 min-h-[220px] transition-colors ${
              isDraggingActivity ? 'bg-slate-900/20 border border-dashed border-emerald-500/30' : ''
            }`}
          >
            {filteredActivities.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-slate-800/80 rounded-2xl bg-slate-950/20 space-y-2">
                <Sparkles className="w-6 h-6 text-slate-650 mx-auto" />
                <span className="text-xs font-bold text-slate-400 block">No activities on Day {activeDay}</span>
                <p className="text-[10px] text-slate-500 max-w-[220px] mx-auto leading-relaxed">
                  Drag items from the local activity library or click Add Experience to populate this day!
                </p>
              </div>
            ) : (
              <DndContext
                sensors={actSensors}
                collisionDetection={closestCenter}
                onDragStart={handleActDragStart}
                onDragEnd={handleActDragEnd}
              >
                <SortableContext
                  items={filteredActivities.map((a) => a.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {filteredActivities.map((act) => (
                      <SortableActivityCard
                        key={act.id}
                        activity={act}
                        onDelete={(id) => deleteActivity(trip.id, id)}
                        onUpdateStatus={handleActivityStatus}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* COLUMN 3: ACTIVITY LIBRARY (Col Span 4) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-2xl">
            <h4 className="text-xs font-black uppercase text-slate-350 tracking-wider">Activity Library</h4>
            <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
              Curated highlights & hot spots for {currentStop?.cityName || 'current stop'}
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1 scrollbar-thin">
            {!currentStop ? (
              <div className="text-center py-10 text-[11px] text-slate-500 italic">
                Select a stop milestone to view curated attractions.
              </div>
            ) : curatedActivities.length === 0 ? (
              <div className="text-center py-10 text-[11px] text-slate-500 italic">
                No curated highlights loaded for {currentStop.cityName}.
              </div>
            ) : (
              curatedActivities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/30 flex items-center justify-between gap-3 group transition-all"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-900 text-teal-450 border border-slate-800">
                        {item.category}
                      </span>
                      <span className="text-xs font-bold text-white leading-tight">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-1.5">
                      <span>⏱️ ~{item.duration || '2.5h'}</span>
                      <span>💰 {item.cost > 0 ? `$${item.cost}` : 'Free'}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAddCuratedActivity(item)}
                    className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 border border-emerald-500/20 hover:border-emerald-500 text-[10px] font-black uppercase transition-all group-hover:scale-105"
                    title="Add directly to current day"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Stop Modal */}
      {showAddCityModal && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h4 className="text-base font-black text-white mb-1">Add Stop Milestone</h4>
            <p className="text-xs text-slate-450 mb-4">Select a destination city to connect to your journey.</p>
            <form onSubmit={handleAddStop} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-350 mb-1">Choose Destination</label>
                <select
                  required
                  value={selectedCityToAdd}
                  onChange={(e) => setSelectedCityToAdd(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="">-- Choose city --</option>
                  {GLOBAL_DESTINATIONS.filter(
                    (d) => !stops.some((s) => s.cityName.toLowerCase() === d.city.toLowerCase())
                  ).map((d) => (
                    <option key={d.city} value={d.city}>
                      {d.city}, {d.country}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCityModal(false)}
                  className="px-3 py-2 text-xs text-slate-455 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedCityToAdd}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/10 disabled:opacity-50"
                >
                  Add Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Activity Modal */}
      {showAddActivityModal && currentStop && (
        <AddActivityModal
          tripId={trip.id}
          stopId={currentStop.id}
          dayNumber={activeDay}
          currentCityName={currentStop.cityName}
          onClose={() => setShowAddActivityModal(false)}
        />
      )}

    </div>
  );
};
