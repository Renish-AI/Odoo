import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  DollarSign,
  Plus,
  Copy,
  Trash2,
  Share2,
  ExternalLink,
  Sparkles,
  Compass,
  CheckCircle2,
  Globe2
} from 'lucide-react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { CreateTripModal } from '../components/common/CreateTripModal';

export const DashboardPage = () => {
  const { trips, deleteTrip, duplicateTrip } = useTrips();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Overall statistics
  const totalStopsCount = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalPlannedBudget = trips.reduce((acc, t) => acc + (Number(t.totalBudget) || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">
            Traveler Dashboard
          </div>
          <h1 className="text-2xl font-bold text-white">
            Welcome, {user?.fullName || 'Travel Explorer'} 👋
          </h1>
          <p className="text-xs text-slate-400">
            Manage your multi-city journeys, track total spending, and craft new itineraries.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Plan New Journey</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Journeys
          </div>
          <div className="text-3xl font-extrabold text-white mt-1">
            {trips.length}
          </div>
          <div className="text-xs text-emerald-400 mt-1 font-medium">
            Active Multi-City Plans
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Destinations Connected
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1">
            {totalStopsCount} Cities
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Across global routes
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Budget Portfolio
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            ${totalPlannedBudget.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Estimated travel allocation
          </div>
        </div>
      </div>

      {/* Trips Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            Your Travel Journeys ({trips.length})
          </h3>
        </div>

        {trips.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-800 rounded-3xl bg-slate-950/40 space-y-3">
            <Globe2 className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-white">No journeys planned yet</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first multi-city trip to connect destinations, arrange day schedules, and track expenses.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
            >
              + Create First Trip
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => {
              const stops = trip.stops || [];
              const activities = trip.activities || [];
              const expenses = trip.expenses || [];
              const totalSpent = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);

              return (
                <div
                  key={trip.id}
                  className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Thumbnail Cover */}
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <img
                        src={trip.coverImage || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80'}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                      {/* Public / Private Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${
                          trip.isPublic
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800'
                        }`}>
                          {trip.isPublic ? '🌐 Public Story' : '🔒 Private'}
                        </span>
                      </div>

                      {/* Quick Card Action Buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => duplicateTrip(trip.id)}
                          className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-800"
                          title="Duplicate Trip"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteTrip(trip.id)}
                          className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-rose-400 hover:text-rose-300 border border-slate-800"
                          title="Delete Trip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom Title on Image */}
                      <div className="absolute bottom-3 left-3 right-3">
                        <h4 className="text-base font-bold text-white tracking-tight truncate">
                          {trip.title}
                        </h4>
                        <div className="text-xs text-emerald-400 font-medium truncate mt-0.5">
                          {stops.length > 0
                            ? stops.map((s) => s.cityName).join(' → ')
                            : 'No stops added yet'}
                        </div>
                      </div>
                    </div>

                    {/* Card Content Details */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          {trip.startDate} to {trip.endDate}
                        </span>
                        <span className="font-semibold text-white">
                          ${trip.totalBudget?.toLocaleString()}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                        <div>
                          <div className="text-slate-500">Activities</div>
                          <div className="font-bold text-slate-200">{activities.length} Planned</div>
                        </div>
                        <div>
                          <div className="text-slate-500">Spent to Date</div>
                          <div className="font-bold text-emerald-400">${totalSpent.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Footer */}
                  <div className="p-4 pt-0 flex items-center gap-2">
                    <Link
                      to={`/trip/${trip.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors"
                    >
                      Open Planner Workspace
                    </Link>
                    {trip.shareSlug && (
                      <Link
                        to={`/trip/share/${trip.shareSlug}`}
                        className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 transition-colors"
                        title="View Public Story"
                      >
                        <Share2 className="w-4 h-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showCreateModal && <CreateTripModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
