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
  Globe2,
  Waves
} from 'lucide-react';
import { useTrips } from '../context/TripContext';
import { useAuth } from '../context/AuthContext';
import { CreateTripModal } from '../components/common/CreateTripModal';
import { AITripPlannerModal } from '../components/ai/AITripPlannerModal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

export const DashboardPage = () => {
  const { trips, deleteTrip, duplicateTrip } = useTrips();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIPlannerModal, setShowAIPlannerModal] = useState(false);

  // Overall statistics
  const totalStopsCount = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalPlannedBudget = trips.reduce((acc, t) => acc + (Number(t.totalBudget) || 0), 0);
  const totalActivitiesCount = trips.reduce((acc, t) => acc + (t.activities?.length || 0), 0);

  const filteredTrips = trips.filter((trip) => {
    if (activeTab === 'public') return trip.isPublic;
    if (activeTab === 'private') return !trip.isPublic;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Hero Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900/70 border border-ocean-500/30 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="text-xs font-extrabold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Waves className="w-4 h-4" /> Multi-City Journey Portfolio
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Where will you journey next?
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {user?.fullName ? `Welcome back, ${user.fullName}. ` : ''}Manage multi-stop routes, analyze financial pacing, and craft experiences.
          </p>
        </div>

        <div className="flex items-center gap-2.5 relative z-10">
          <button
            onClick={() => setShowAIPlannerModal(true)}
            className="px-4 py-3 rounded-2xl bg-slate-900 border border-ocean-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-xs shadow-md transition-all hover:scale-105 flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>AI Architect</span>
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Plan New Trip</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-ocean-500/30 transition-colors">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Active Trips</div>
          <div className="text-2xl font-black text-white mt-1.5">
            <AnimatedCounter value={trips.length} />
          </div>
          <div className="text-xs text-cyan-400 mt-0.5">Multi-destination routes</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-ocean-500/30 transition-colors">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">City Stops Planned</div>
          <div className="text-2xl font-black text-cyan-300 mt-1.5">
            <AnimatedCounter value={totalStopsCount} />
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Across global milestones</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-ocean-500/30 transition-colors">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Budget Reserve</div>
          <div className="text-2xl font-black text-ocean-400 mt-1.5">
            <AnimatedCounter value={totalPlannedBudget} prefix="$" />
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Travel allocation ceiling</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-ocean-500/30 transition-colors">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Planned Experiences</div>
          <div className="text-2xl font-black text-teal-300 mt-1.5">
            <AnimatedCounter value={totalActivitiesCount} />
          </div>
          <div className="text-xs text-slate-400 mt-0.5">Time-slotted activities</div>
        </div>
      </div>

      {/* Trips Grid & Filter Header */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            Your Travel Journeys ({filteredTrips.length})
          </h3>

          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            {[
              { id: 'all', label: 'All Trips' },
              { id: 'public', label: 'Public Stories' },
              { id: 'private', label: 'Private Only' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === tab.id
                    ? 'bg-ocean-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTrips.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-ocean-500/30 rounded-3xl bg-slate-950/40 space-y-4">
            <Globe2 className="w-12 h-12 text-cyan-400/50 mx-auto" />
            <h4 className="text-lg font-bold text-white">No travel journeys found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Create your first multi-city trip or generate an itinerary with the AI Architect.
            </p>
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
              >
                + Plan a New Trip
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => {
              const stops = trip.stops || [];
              const activities = trip.activities || [];
              const expenses = trip.expenses || [];
              const totalSpent = expenses.reduce((acc, e) => acc + (Number(e.amount) || 0), 0);
              const budgetLimit = Number(trip.totalBudget) || 2500;
              const percentSpent = Math.min(100, Math.round((totalSpent / budgetLimit) * 100));

              return (
                <div
                  key={trip.id}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-ocean-500/40 rounded-3xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Cover Image */}
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-inner border border-slate-800">
                      <img
                        src={trip.coverImage || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=800&q=80'}
                        alt={trip.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                      {/* Public / Private Badge */}
                      <div className="absolute top-3 left-3">
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-md border ${
                          trip.isPublic
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-950/80 text-slate-400 border-slate-800'
                        }`}>
                          {trip.isPublic ? '🌐 Public Story' : '🔒 Private'}
                        </span>
                      </div>

                      {/* Quick Card Action Buttons */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <button
                          onClick={(e) => { e.preventDefault(); duplicateTrip(trip.id); }}
                          className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-slate-300 hover:text-white border border-slate-800 transition-colors"
                          title="Duplicate Trip"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            if (window.confirm(`Delete journey "${trip.title}"?`)) {
                              deleteTrip(trip.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md text-rose-400 hover:text-rose-300 border border-slate-800 transition-colors"
                          title="Delete Trip"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 px-1">
                      <div>
                        <h4 className="text-sm font-black uppercase tracking-wider text-cyan-300 truncate">
                          {trip.title}
                        </h4>
                        <div className="text-xs font-bold text-white truncate mt-1">
                          {stops.length > 0
                            ? stops.map((s) => s.cityName).join(' → ')
                            : 'No destination stops added yet'}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-500" />
                          <span>{trip.startDate} - {trip.endDate}</span>
                        </div>
                        <span className="font-semibold text-slate-300">
                          {stops.length} {stops.length === 1 ? 'City' : 'Cities'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Budget: ${budgetLimit.toLocaleString()}</span>
                        <span className="font-bold text-cyan-300">
                          {activities.length} Activities
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <Link
                      to={`/trip/${trip.id}`}
                      className="flex-1 py-2 px-4 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 font-black text-xs text-center tracking-wider transition-all shadow-md active:scale-95"
                    >
                      Open Itinerary Workspace
                    </Link>
                    {trip.shareSlug && (
                      <Link
                        to={`/trip/share/${trip.shareSlug}`}
                        className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
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
      {showAIPlannerModal && <AITripPlannerModal onClose={() => setShowAIPlannerModal(false)} />}
    </div>
  );
};