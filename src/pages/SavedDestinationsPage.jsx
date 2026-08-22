import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Star, DollarSign, Trash2, Plus, Sparkles, MapPin, Check, ArrowRight } from 'lucide-react';
import { useTrips } from '../context/TripContext';
import { CreateTripModal } from '../components/common/CreateTripModal';

export const SavedDestinationsPage = () => {
  const { savedDestinations, toggleSaveDestination, trips, activeTrip, addStop } = useTrips();
  const [addedCities, setAddedCities] = useState([]);
  const [toastMessage, setToastMessage] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleAddStopFromSaved = async (item) => {
    const targetTrip = activeTrip || (trips.length > 0 ? trips[0] : null);

    if (!targetTrip) {
      setShowCreateModal(true);
      return;
    }

    await addStop(targetTrip.id, {
      cityName: item.cityName,
      countryName: item.countryName || 'Destination',
      transitMode: 'flight',
      transitDurationMins: 140,
      transitCost: 90,
      coverImage: item.imageUrl
    });

    setAddedCities((prev) => [...prev, item.cityName]);
    setToastMessage({
      city: item.cityName,
      tripId: targetTrip.id,
      tripTitle: targetTrip.title
    });

    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900 border border-cyan-400/50 shadow-2xl text-xs font-bold text-white animate-in slide-in-from-bottom duration-300">
          <div className="w-6 h-6 rounded-full bg-cyan-400/20 text-cyan-300 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span>Added <b>{toastMessage.city}</b> to <b>{toastMessage.tripTitle}</b>!</span>
          <Link
            to={`/trip/${toastMessage.tripId}`}
            className="ml-2 px-3 py-1 rounded-xl bg-cyan-400 text-slate-950 font-black hover:bg-cyan-300 transition-colors flex items-center gap-1"
          >
            <span>View Itinerary</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      )}

      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-ocean-500/20 shadow-xl">
        <div className="space-y-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
            Travel Wishlist
          </div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
            My Bucket List ({savedDestinations.length})
          </h1>
          <p className="text-xs text-slate-400">
            Dream destinations saved for your future multi-city journey plans.
          </p>
        </div>

        <Link
          to="/explore"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20 transition-all hover:scale-105"
        >
          <Sparkles className="w-4 h-4" />
          <span>Discover More Cities</span>
        </Link>
      </div>

      {savedDestinations.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-ocean-500/30 rounded-3xl bg-slate-950/40 space-y-3">
          <Heart className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Your Bucket List is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Explore global destinations and click the heart icon on any city card to save it here.
          </p>
          <Link
            to="/explore"
            className="inline-block mt-2 px-4 py-2 rounded-xl bg-slate-800 text-cyan-300 text-xs font-bold border border-slate-700"
          >
            Browse Destinations
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedDestinations.map((item) => {
            const isAdded = addedCities.includes(item.cityName);
            const targetTripTitle = activeTrip?.title || (trips.length > 0 ? trips[0].title : 'Trip');

            return (
              <div
                key={item.id || item.cityName}
                className="group bg-slate-900 border border-slate-800 hover:border-ocean-500/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
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
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <div className="absolute bottom-3 left-3 right-3">
                      <h3 className="text-lg font-bold text-white tracking-tight">{item.cityName}</h3>
                      <div className="text-xs text-cyan-300 font-semibold">{item.countryName}</div>
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        {item.rating || 4.8}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-cyan-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        Avg. ${item.avgDailyBudget || 120}/day
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
                  <button
                    onClick={() => handleAddStopFromSaved(item)}
                    disabled={isAdded}
                    className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      isAdded
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                        : 'bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" /> Added to {targetTripTitle}
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add to {targetTripTitle}
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && <CreateTripModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};