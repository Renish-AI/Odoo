import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Shield,
  TrendingUp,
  Calendar,
  DollarSign,
  Share2,
  Users,
  Layers,
  Waves
} from 'lucide-react';
import { GLOBAL_DESTINATIONS, PRESET_TRIPS } from '../data/destinations';
import { useAuth } from '../context/AuthContext';
import { CreateTripModal } from '../components/common/CreateTripModal';
import { AITripPlannerModal } from '../components/ai/AITripPlannerModal';

export const LandingPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIPlannerModal, setShowAIPlannerModal] = useState(false);

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. OCEAN THEME HERO SECTION */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Glowing atmospheric oceanic waves */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-ocean-500/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[400px] h-[350px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 w-[350px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-ocean-500/10 border border-ocean-500/30 text-cyan-300 text-xs font-extrabold tracking-wide shadow-lg shadow-cyan-500/10">
            <Waves className="w-4 h-4 text-cyan-400" />
            <span>Intelligent Multi-City Travel Planning & Financial Cockpit</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Your Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-400 via-cyan-300 to-teal-300">Visualized</span> & Intelligently Guided.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Connect multi-city routes, drag-and-drop daily activities, track live expenses, and optimize trip pacing with real-time AI.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              to="/explore"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Destinations</span>
            </Link>

            <button
              onClick={() => setShowAIPlannerModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 border border-ocean-500/40 hover:border-cyan-400 text-cyan-300 font-bold text-sm hover:bg-slate-800/80 transition-all flex items-center gap-2 shadow-md hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>AI Trip Architect</span>
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white font-bold text-sm transition-all flex items-center gap-2 hover:scale-105"
            >
              <span>Plan Custom Trip</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT PIPELINE STEPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400">
            End-to-End Travel Architecture
          </h2>
          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Explore → Plan → Visualize → Optimize → Share
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            From discovering vibrant world cities to building drag-and-drop itineraries, tracking budgets, and generating public travel stories.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Explore',
              desc: 'Discover global cities with live daily cost benchmarks, best seasons, and top attractions.',
              icon: Compass,
              color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30'
            },
            {
              step: '02',
              title: 'Plan',
              desc: 'Connect multi-stop routes and drag to reorder cities with real-time transit calculation.',
              icon: Layers,
              color: 'text-ocean-400 bg-ocean-500/10 border-ocean-500/30'
            },
            {
              step: '03',
              title: 'Visualize',
              desc: 'Day-by-day itineraries with List, Visual Timeline Flow, and Interactive Calendar views.',
              icon: Calendar,
              color: 'text-purple-400 bg-purple-500/10 border-purple-500/30'
            },
            {
              step: '04',
              title: 'Optimize',
              desc: 'Financial cockpit calculates daily burn rate, category breakdowns & AI pacing score.',
              icon: TrendingUp,
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/30'
            },
            {
              step: '05',
              title: 'Share',
              desc: 'Publish public travel stories with 1-click cloning for friends and the community.',
              icon: Share2,
              color: 'text-rose-400 bg-rose-500/10 border-rose-500/30'
            }
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-ocean-500/40 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500">{item.step}</span>
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. POPULAR MULTI-CITY JOURNEY SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-400 mb-1">
              Curated Masterpieces
            </h2>
            <h3 className="text-2xl font-black text-white">
              Featured Multi-City Itineraries
            </h3>
          </div>
          <Link
            to="/trips"
            className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            View All Journeys <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRESET_TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="group bg-slate-900 border border-slate-800 hover:border-ocean-500/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="relative aspect-[16/9] overflow-hidden">
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                  {/* Creator tag */}
                  <div className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white">
                    <img
                      src={trip.user.avatarUrl}
                      alt={trip.user.fullName}
                      className="w-4 h-4 rounded-full object-cover"
                    />
                    <span>{trip.user.fullName}</span>
                  </div>

                  {/* Title & Route on image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h4 className="text-lg font-bold text-white tracking-tight">{trip.title}</h4>
                    <div className="text-xs text-cyan-300 font-semibold mt-0.5">
                      {trip.stops.map((s) => s.cityName).join(' → ')}
                    </div>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {trip.description}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {trip.startDate} - {trip.endDate}
                    </span>
                    <span className="flex items-center gap-1 font-bold text-cyan-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      Est. ${trip.totalBudget?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <Link
                  to={`/trip/${trip.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-ocean-600 text-white font-bold text-xs text-center transition-colors shadow-sm"
                >
                  Open Itinerary Workspace
                </Link>
                <Link
                  to={`/trip/share/${trip.shareSlug}`}
                  className="px-4 py-2.5 rounded-xl bg-ocean-500/10 hover:bg-ocean-500/20 text-cyan-300 font-bold text-xs transition-colors flex items-center gap-1 border border-ocean-500/30"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Public Story</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-ocean-950/80 via-slate-900 to-cyan-950/80 border border-ocean-500/40 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Ready to experience effortless multi-city travel?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Design your personalized journey with AI assistance, real-time budgeting, and interactive timelines.
          </p>
          <div className="flex justify-center gap-3">
            <Link
              to="/explore"
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-ocean-500 to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-cyan-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Destinations</span>
            </Link>
          </div>
        </div>
      </section>

      {showCreateModal && <CreateTripModal onClose={() => setShowCreateModal(false)} />}
      {showAIPlannerModal && <AITripPlannerModal onClose={() => setShowAIPlannerModal(false)} />}
    </div>
  );
};