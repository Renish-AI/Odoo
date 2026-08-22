import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, DollarSign, Trash2, Plus, Sparkles, MapPin } from 'lucide-react';
import { useTrips } from '../context/TripContext';

export const SavedDestinationsPage = () => {
  const { savedDestinations, toggleSaveDestination, activeTrip, addStop } = useTrips();

  const handleAddStopFromSaved = async (item) => {
    if (!activeTrip) return;
    await addStop(activeTrip.id, {
      cityName: item.cityName,
      countryName: item.countryName,
      transitMode: 'flight',
      transitDurationMins: 140,
      transitCost: 90
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Travel Wishlist
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            My Bucket List ({savedDestinations.length})
          </h1>
          <p className="text-xs text-slate-400">
            Dream destinations saved for your future multi-city journey plans.
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Discover More Cities</span>
        </Link>
      </div>

      {savedDestinations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40 space-y-3">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Your Bucket List is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore global destinations and click the heart icon on any city card to save it here.
          </p>
          <Link
            to="/explore"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 text-emerald-400 text-xs font-bold border border-slate-700"
          >
            Browse Destinations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDestinations.map((item) => (
            <div
              key={item.id || item.cityName}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={item.imageUrl || 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80'}
                    alt={item.cityName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                  <button
                    onClick={() => toggleSaveDestination({ city: item.cityName })}
                    className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-rose-400 hover:text-rose-300"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-lg font-bold text-white tracking-tight">{item.cityName}</h3>
                    <div className="text-xs text-emerald-400 font-medium">{item.countryName}</div>
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {item.rating || 4.8}
                    </span>
                    <span className="flex items-center gap-1 font-semibold text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      Avg. ${item.avgDailyBudget}/day
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                    {(item.tags || ['Bucket List']).map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-slate-950 text-slate-400 border border-slate-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0">
                {activeTrip ? (
                  <button
                    onClick={() => handleAddStopFromSaved(item)}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-bold text-xs flex items-center justify-center gap-1.5 transition-all border border-slate-700 hover:border-transparent"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to {activeTrip.title}</span>
                  </button>
                ) : (
                  <Link
                    to="/trips"
                    className="w-full py-2.5 rounded-xl bg-slate-800 text-white font-bold text-xs flex items-center justify-center transition-colors text-center"
                  >
                    Select Active Trip
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
