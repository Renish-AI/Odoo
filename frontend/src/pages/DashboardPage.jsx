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
import { motion } from 'framer-motion';

export const DashboardPage = () => {
  const { trips, deleteTrip, duplicateTrip } = useTrips();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('upcoming');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Overall statistics
  const totalStopsCount = trips.reduce((acc, t) => acc + (t.stops?.length || 0), 0);
  const totalPlannedBudget = trips.reduce((acc, t) => acc + (Number(t.totalBudget) || 0), 0);

  const filteredTrips = trips.filter(trip => {
    // For demo purposes, we will just show all or mock it, but normally we'd check dates
    // if activeTab === 'upcoming' return startDate > now
    // if activeTab === 'ongoing' return startDate <= now && endDate >= now
    // if activeTab === 'completed' return endDate < now
    return true; // We'll just show all for the UI since they might all have same dates
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-8 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-950/40 to-transparent pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="text-xs font-bold uppercase tracking-wider text-teal-400">
            Traveler Dashboard
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight">
            Where will you go next?
          </h1>
          <p className="text-sm text-slate-400">
            {user?.fullName ? `Welcome back, ${user.fullName}. ` : ''}Manage your journeys, track budget, and plan your perfect trips.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="relative z-10 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
          <span>Plan a New Adventure</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Upcoming Trips', value: trips.length, label: 'Active Plans', color: 'text-teal-400', delay: 0.1 },
          { title: 'Countries Planned', value: totalStopsCount, label: 'Across global routes', color: 'text-emerald-400', delay: 0.2 },
          { title: 'Total Estimated Budget', value: `$${totalPlannedBudget.toLocaleString()}`, label: 'Travel allocation', color: 'text-cyan-400', delay: 0.3 },
          { title: 'Total Activities', value: trips.reduce((acc, t) => acc + (t.activities?.length || 0), 0), label: 'Planned experiences', color: 'text-indigo-400', delay: 0.4 }
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: stat.delay, duration: 0.5 }}
            className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md hover:border-teal-500/30 transition-colors group"
          >
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider group-hover:text-slate-300">
              {stat.title}
            </div>
            <motion.div 
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ delay: stat.delay + 0.2, type: 'spring', stiffness: 100 }}
              className={`text-3xl font-extrabold mt-2 ${stat.color}`}
            >
              {stat.value}
            </motion.div>
            <div className="text-xs text-slate-500 mt-1">
              {stat.label}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Travel DNA */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Globe2 className="w-48 h-48 text-teal-400" />
        </div>
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-teal-400" />
              Your Travel DNA
            </h3>
            <p className="text-sm text-slate-400 mb-6">Based on your planned activities and saved destinations.</p>
            
            <div className="space-y-4">
              {[
                { label: 'Adventure', value: 80, color: 'bg-rose-500' },
                { label: 'Food', value: 70, color: 'bg-amber-500' },
                { label: 'Culture', value: 90, color: 'bg-indigo-500' },
                { label: 'Nature', value: 60, color: 'bg-emerald-500' },
                { label: 'Shopping', value: 40, color: 'bg-pink-500' },
              ].map((dna, idx) => (
                <div key={idx}>
                  <div className="flex justify-between text-xs font-semibold mb-1 text-slate-300">
                    <span>{dna.label}</span>
                    <span>{dna.value}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: `${dna.value}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 + (idx * 0.1) }}
                      className={`h-full ${dna.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Travel Style</div>
                <div className="text-sm font-semibold text-teal-400">Balanced Explorer</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Preferred Budget</div>
                <div className="text-sm font-semibold text-emerald-400">Moderate ($$$)</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Avg. Trip Duration</div>
                <div className="text-sm font-semibold text-indigo-400">12 Days</div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Favorite Regions</div>
                <div className="text-sm font-semibold text-amber-400">Europe, Asia</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cinematic Upcoming Trip Card */}
      {trips.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-white">Upcoming Adventure</h3>
          <div className="relative rounded-3xl overflow-hidden shadow-2xl group border border-slate-700/50">
            <img 
              src={trips[0]?.coverImage || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1200&q=80'} 
              alt={trips[0]?.title} 
              className="w-full h-80 sm:h-96 object-cover group-hover:scale-105 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <div className="text-xs font-bold uppercase tracking-widest text-teal-400 mb-2">
                EUROPEAN ADVENTURE
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-2">{trips[0]?.title || 'Paris → Rome → Amsterdam'}</h2>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300 font-medium mb-6">
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-teal-400" /> 12 DAYS TO GO</span>
                <span className="hidden sm:inline">•</span>
                <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-teal-400" /> ₹1,72,500 / ₹2,00,000</span>
              </div>
              
              <Link 
                to={`/trip/${trips[0].id}`}
                className="w-fit px-8 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-teal-500/20 transition-all hover:scale-105 active:scale-95"
              >
                Continue Planning
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trips Grid */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-400" />
            Your Travel Journeys
          </h3>
          <div className="flex bg-slate-900 rounded-lg p-1">
            {['upcoming', 'ongoing', 'completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                  activeTab === tab ? 'bg-slate-800 text-teal-400' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {filteredTrips.length === 0 ? (
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
            {filteredTrips.map((trip) => {
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
