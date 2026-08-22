import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe2,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Shield,
  Zap,
  TrendingUp,
  Calendar,
  DollarSign,
  Share2,
  CheckCircle2,
  Star,
  Users,
  Layers
} from 'lucide-react';
import { GLOBAL_DESTINATIONS, PRESET_TRIPS } from '../data/destinations';
import { useAuth } from '../context/AuthContext';
import { CreateTripModal } from '../components/common/CreateTripModal';

export const LandingPage = () => {
  const { user, switchDemo } = useAuth();
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchCity, setSearchCity] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchCity.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchCity)}`);
    } else {
      navigate('/explore');
    }
  };

  const handleQuickDemo = async () => {
    await switchDemo('nomad');
    navigate('/trips');
  };

  return (
    <div className="space-y-24 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Glowing atmospheric lights */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold tracking-wide animate-fade-in shadow-lg shadow-emerald-500/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Intelligent Multi-City Travel Planning & Budget Engine</span>
          </div>

          {/* Main Hero Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] max-w-5xl mx-auto">
            Your Journey, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">Visualized</span> & Perfectly Balanced.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Move beyond messy spreadsheets. Connect multi-city routes, drag-and-drop daily activities, track live budgets, and analyze trip health with AI.
          </p>

          {/* Interactive Search / CTA Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form
              onSubmit={handleSearchSubmit}
              className="p-2 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl flex flex-col sm:flex-row items-center gap-2"
            >
              <div className="relative flex-1 w-full">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  placeholder="Where to next? (e.g. Tokyo, Paris, Bali, Rome...)"
                  className="w-full bg-transparent pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
                >
                  Explore Cities
                </button>
              </div>
            </form>

            <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-xs text-slate-400">
              <span className="font-medium text-slate-500">Popular Routes:</span>
              <Link to="/trip/trip-euro-odyssey" className="hover:text-emerald-400 transition-colors">
                Paris → Rome → Barcelona
              </Link>
              <span>•</span>
              <Link to="/trip/trip-japan-golden-route" className="hover:text-emerald-400 transition-colors">
                Tokyo → Kyoto Express
              </Link>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Start Planning Free</span>
            </button>

            <button
              onClick={handleQuickDemo}
              className="px-6 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm hover:bg-slate-800/80 transition-all flex items-center gap-2"
            >
              <span>Try Interactive Demo</span>
              <ArrowRight className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </section>

      {/* 2. PRODUCT PHILOSOPHY WORKFLOW PIPELINE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            The GlobeTrotter Experience
          </h2>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white">
            Explore → Plan → Visualize → Optimize → Share
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Every step is engineered to turn the chaos of multi-destination logistics into an inspiring, cohesive journey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: '01',
              title: 'Explore',
              desc: 'Discover global cities with live daily cost benchmarks, best seasons, and top attractions.',
              icon: Compass,
              color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
            },
            {
              step: '02',
              title: 'Plan',
              desc: 'Create multi-stop routes and drag to reorder cities with real-time transit calculation.',
              icon: Layers,
              color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
            },
            {
              step: '03',
              title: 'Visualize',
              desc: 'Build day-by-day itineraries with time-slotted activity blocks and category tags.',
              icon: Calendar,
              color: 'text-purple-400 bg-purple-500/10 border-purple-500/20'
            },
            {
              step: '04',
              title: 'Optimize',
              desc: 'AI analyzes trip pacing, detects budget overruns, and suggests hidden gems.',
              icon: Sparkles,
              color: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
            },
            {
              step: '05',
              title: 'Share',
              desc: 'Publish public travel stories that friends and travelers can 1-click fork and copy.',
              icon: Share2,
              color: 'text-rose-400 bg-rose-500/10 border-rose-500/20'
            }
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500">{item.step}</span>
                <div className={`p-2 rounded-xl border ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                </div>
              </div>
              <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
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
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-1">
              Curated Masterpieces
            </h2>
            <h3 className="text-2xl font-extrabold text-white">
              Popular Multi-City Itineraries
            </h3>
          </div>
          <Link
            to="/trips"
            className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
          >
            View All Journeys <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PRESET_TRIPS.map((trip) => (
            <div
              key={trip.id}
              className="group bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 flex flex-col justify-between"
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
                    <div className="text-xs text-emerald-400 font-semibold mt-0.5">
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
                    <span className="flex items-center gap-1 font-bold text-emerald-400">
                      <DollarSign className="w-3.5 h-3.5" />
                      Est. ${trip.totalBudget?.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center gap-2">
                <Link
                  to={`/trip/${trip.id}`}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs text-center transition-colors"
                >
                  Open Itinerary Workspace
                </Link>
                <Link
                  to={`/trip/share/${trip.shareSlug}`}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-xs transition-colors flex items-center gap-1"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Public Story</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FEATURE SHOWCASE GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-2xl relative overflow-hidden space-y-8">
          
          <div className="max-w-xl space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              Complete Tech Ecosystem
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built for Modern Explorers & Travel Teams
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-emerald-400 font-bold text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" /> Drag & Drop Reordering
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Powered by @dnd-kit for seamless keyboard and pointer drag-and-drop of cities and time-ordered activities.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-cyan-400 font-bold text-sm flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Real-time Budget Analytics
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Visual Recharts donut and bar breakdowns comparing planned budget vs real-time categorized expenses.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
              <div className="text-purple-400 font-bold text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> AI Concierge & Pacing
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated health check detects overscheduled days, budget risks, and generates instant schedule insertions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA BANNER */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
        <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-tr from-emerald-950/80 via-slate-900 to-teal-950/80 border border-emerald-500/30 shadow-2xl space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Ready to plan your next epic adventure?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
            Join thousands of travelers building visual multi-city journeys with GlobeTrotter.
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create Your Journey Now</span>
            </button>
          </div>
        </div>
      </section>

      {showCreateModal && <CreateTripModal onClose={() => setShowCreateModal(false)} />}
    </div>
  );
};
