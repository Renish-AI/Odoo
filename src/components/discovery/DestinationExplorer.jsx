import React, { useState } from 'react';
import {
  Search,
  Compass,
  Star,
  DollarSign,
  Heart,
  Calendar,
  Plus,
  Check,
  Sparkles,
  MapPin
} from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { GLOBAL_DESTINATIONS } from '../../data/destinations';

export const DestinationExplorer = ({ onAddCityToTrip }) => {
  const { savedDestinations, toggleSaveDestination, activeTrip, addStop } = useTrips();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedTag, setSelectedTag] = useState('All');
  const [addedCities, setAddedCities] = useState([]);

  const regions = ['All', 'Europe', 'Asia', 'North America', 'Middle East'];
  const tags = ['All', 'Culture', 'Nature', 'Foodie Paradise', 'Beaches', 'Adventure', 'Luxury', 'Budget Friendly'];

  const filteredDestinations = GLOBAL_DESTINATIONS.filter((dest) => {
    const matchesRegion = selectedRegion === 'All' || dest.region.toLowerCase() === selectedRegion.toLowerCase();
    const matchesTag = selectedTag === 'All' || dest.tags.some((t) => t.toLowerCase().includes(selectedTag.toLowerCase()));
    const matchesSearch = !searchQuery.trim() ||
      dest.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRegion && matchesTag && matchesSearch;
  });

  const handleAddCity = async (dest) => {
    if (!activeTrip) return;

    if (onAddCityToTrip) {
      onAddCityToTrip(dest);
    } else {
      await addStop(activeTrip.id, {
        cityName: dest.city,
        countryName: dest.country,
        transitMode: 'flight',
        transitDurationMins: 150,
        transitCost: 90
      });
    }

    setAddedCities((prev) => [...prev, dest.city]);
  };

  return (
    <div className="space-y-6">
      
      {/* Search and Filters Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-bold text-white">Global Destination Explorer</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Discover curated world cities with live budget estimates, seasonal guides, and top attractions.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities, countries, vibes..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-3 border-t border-slate-800/80">
          
          {/* Regions */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Region:</span>
            {regions.map((reg) => (
              <button
                key={reg}
                onClick={() => setSelectedRegion(reg)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedRegion === reg
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-950/60 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {reg}
              </button>
            ))}
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none sm:ml-auto">
            <span className="text-[11px] font-bold text-slate-500 uppercase mr-1">Vibe:</span>
            {tags.slice(0, 5).map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all ${
                  selectedTag === tag
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Destination Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDestinations.map((dest) => {
          const isSaved = savedDestinations.some(
            (d) => d.cityName.toLowerCase() === dest.city.toLowerCase()
          );
          const isAdded = addedCities.includes(dest.city);

          return (
            <div
              key={dest.id}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Image Cover with Badges */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={dest.image}
                    alt={dest.city}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  {/* Rating Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-bold text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{dest.rating}</span>
                  </div>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleSaveDestination(dest)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-300 hover:text-rose-400 transition-colors"
                    title={isSaved ? 'Saved to Wishlist' : 'Save to Wishlist'}
                  >
                    <Heart className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  </button>

                  {/* City and Country Title */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="text-lg font-bold text-white tracking-tight">{dest.city}</div>
                    <div className="text-xs text-emerald-400 font-medium">{dest.country} • {dest.region}</div>
                  </div>
                </div>

                {/* Details Body */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {dest.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 py-2 border-y border-slate-800/80">
                    <div className="flex items-center gap-1.5">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Avg. ${dest.avgDailyBudget}/day</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="truncate">{dest.bestSeason}</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {dest.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => handleAddCity(dest)}
                  disabled={isAdded}
                  className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    isAdded
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Added to Journey
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" /> Add to Journey
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
