import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  MapPin, 
  Clock, 
  DollarSign, 
  Plus, 
  Compass, 
  Check, 
  Tag
} from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { GLOBAL_DESTINATIONS } from '../../data/destinations';

export const AddActivityModal = ({ tripId, stopId, dayNumber = 1, currentCityName = '', onClose }) => {
  const { addActivity } = useTrips();

  const [activeTab, setActiveTab] = useState('curated'); // curated | custom
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Sightseeing');
  const [cost, setCost] = useState('0');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:30');
  const [locationName, setLocationName] = useState('');
  const [status, setStatus] = useState('planned');
  const [loading, setLoading] = useState(false);

  // Find curated attractions for this stop's city
  const cityData = GLOBAL_DESTINATIONS.find(
    (d) => d.city.toLowerCase() === currentCityName.toLowerCase()
  ) || GLOBAL_DESTINATIONS[0];

  const handleAddCustom = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      await addActivity(tripId, stopId, {
        dayNumber: Number(dayNumber),
        title,
        description,
        category,
        cost: Number(cost) || 0,
        startTime,
        endTime,
        locationName: locationName || currentCityName,
        status
      });
      onClose();
    } catch (err) {
      console.error('Error adding activity:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCurated = async (attraction) => {
    setLoading(true);
    try {
      await addActivity(tripId, stopId, {
        dayNumber: Number(dayNumber),
        title: attraction.title,
        description: `Top rated experience in ${currentCityName}`,
        category: attraction.category || 'Sightseeing',
        cost: Number(attraction.cost) || 0,
        startTime: '10:00',
        endTime: '13:00',
        locationName: `${attraction.title}, ${currentCityName}`,
        status: 'planned'
      });
      onClose();
    } catch (err) {
      console.error('Error adding curated attraction:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Sightseeing',
    'Food',
    'Adventure',
    'Relax',
    'Culture',
    'Nightlife',
    'Transport',
    'Shopping'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Day {dayNumber} • {currentCityName}
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-1">Add Experience to Itinerary</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950/80 border border-slate-800/80 my-4">
          <button
            onClick={() => setActiveTab('curated')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'curated'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Curated Highlights for {currentCityName}</span>
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'custom'
                ? 'bg-emerald-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Custom Activity</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-4">
          {activeTab === 'curated' ? (
            <div className="space-y-2.5">
              <div className="text-xs text-slate-400">
                Click any top attraction to instantly schedule it into Day {dayNumber}:
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(cityData?.popularActivities || []).map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/40 flex items-center justify-between gap-3 group transition-all"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-white">{item.title}</span>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span>⏱️ ~{item.duration || '2h'}</span>
                        <span>💰 {item.cost > 0 ? `$${item.cost}` : 'Free Entry'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddCurated(item)}
                      disabled={loading}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-1 transition-all group-hover:scale-105"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleAddCustom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Activity Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Sunset drinks at Skybar, Morning temple walk"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Category
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`py-1.5 px-2 rounded-xl text-[11px] font-medium border text-center transition-all ${
                        category === cat
                          ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estimated Cost ($)
                  </label>
                  <input
                    type="number"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Booking Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="planned">Planned</option>
                    <option value="booked">Booked / Ticketed</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Location / Address (Optional)
                </label>
                <input
                  type="text"
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="e.g. 45 Grand Avenue, Downtown"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Notes & Tips
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Bring umbrella, tickets on phone, arrive 15m early..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !title.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Add Activity'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
