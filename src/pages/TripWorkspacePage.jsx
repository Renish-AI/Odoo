import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  DollarSign,
  Share2,
  Sparkles,
  Layers,
  PieChart,
  Activity,
  CalendarDays,
  Compass,
  Check,
  Copy,
  ArrowLeft,
  Lock,
  Globe2,
  Camera,
  RefreshCw,
  Waves
} from 'lucide-react';
import { useTrips } from '../context/TripContext';
import { getLocalTrips } from '../services/localStore';
import { RouteVisualizer } from '../components/itinerary/RouteVisualizer';
import { ItineraryViewSwitcher } from '../components/itinerary/ItineraryViewSwitcher';
import { FinancialCockpit } from '../components/budget/FinancialCockpit';
import { TripHealthCockpit } from '../components/health/TripHealthCockpit';
import { DestinationExplorer } from '../components/discovery/DestinationExplorer';
import { AIAssistantDrawer } from '../components/health/AIAssistantDrawer';
import { ImageUploadModal } from '../components/common/ImageUploadModal';
import { AnimatedCounter } from '../components/common/AnimatedCounter';

export const TripWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, activeTrip, selectTrip, updateTrip, addStop, loading } = useTrips();

  const [activeTab, setActiveTab] = useState('itinerary'); // itinerary | route | budget | health | discover
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [showCoverUploadModal, setShowCoverUploadModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Sync active trip when URL parameter changes (forward/back browser navigation)
  useEffect(() => {
    if (id) {
      selectTrip(id);
    }
  }, [id, selectTrip]);

  // Robust multi-tier trip locator that never fails on navigation or reload
  const trip = trips.find((t) => t.id === id || t.shareSlug === id) ||
    getLocalTrips().find((t) => t.id === id || t.shareSlug === id) ||
    activeTrip;

  if (loading && !trip) {
    return (
      <div className="max-w-4xl mx-auto my-20 p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-full border-2 border-ocean-500 border-t-transparent animate-spin mx-auto" />
        <h3 className="text-base font-bold text-white">Loading Itinerary Workspace...</h3>
        <p className="text-xs text-slate-400">Retrieving multi-city route, budget ledger, and activity flow.</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4 shadow-2xl">
        <MapPin className="w-12 h-12 text-cyan-400/50 mx-auto" />
        <h3 className="text-lg font-bold text-white">Journey Not Found</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          The requested trip is unavailable or you may have navigated from an expired session.
        </p>
        <div className="pt-2">
          <Link
            to="/trips"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 text-slate-950 font-black text-xs shadow-lg shadow-cyan-500/20"
          >
            <ArrowLeft className="w-4 h-4" /> Back to My Trips
          </Link>
        </div>
      </div>
    );
  }

  const handleTogglePublic = async () => {
    await updateTrip(trip.id, { isPublic: !trip.isPublic });
  };

  const handleCopyShareLink = () => {
    const shareUrl = `${window.location.origin}/trip/share/${trip.shareSlug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddCityFromDiscovery = async (dest) => {
    await addStop(trip.id, {
      cityName: dest.city,
      countryName: dest.country,
      transitMode: 'flight',
      transitDurationMins: 150,
      transitCost: 90
    });
    setActiveTab('route');
  };

  const handleCoverUploaded = async (newUrl) => {
    await updateTrip(trip.id, { coverImage: newUrl });
  };

  const tabs = [
    { id: 'itinerary', label: 'Interactive Itinerary (List / Timeline / Cal)', icon: CalendarDays },
    { id: 'route', label: 'Multi-City Route Builder', icon: Layers },
    { id: 'budget', label: 'Financial Cockpit & Budget', icon: PieChart },
    { id: 'health', label: 'Trip Health & Pacing', icon: Activity },
    { id: 'discover', label: 'Discover Places', icon: Compass },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. Hero Journey Workspace Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-ocean-500/20 shadow-2xl">
        <div className="relative aspect-[21/7] sm:aspect-[24/6] min-h-[240px]">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Bar Actions */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <Link
              to="/trips"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Journeys
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCoverUploadModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                title="Change Cover Image via Supabase Storage"
              >
                <Camera className="w-3.5 h-3.5 text-cyan-400" />
                <span>Upload Cover</span>
              </button>

              <button
                onClick={handleTogglePublic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-semibold transition-all ${
                  trip.isPublic
                    ? 'bg-ocean-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-950/85 text-slate-400 border-slate-800'
                }`}
              >
                {trip.isPublic ? <Globe2 className="w-3.5 h-3.5 text-cyan-400" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{trip.isPublic ? 'Public Story Live' : 'Private Trip'}</span>
              </button>

              {trip.isPublic && (
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white hover:border-cyan-400/40 transition-colors"
                  title="Copy share link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Share Story'}</span>
                </button>
              )}

              <button
                onClick={() => setShowAIDrawer(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/25 transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Concierge</span>
              </button>
            </div>
          </div>

          {/* Bottom Title & Details */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex flex-wrap gap-1.5 mb-1.5">
                {(trip.tags || []).map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/80 text-cyan-300 border border-ocean-500/30 backdrop-blur-md"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {trip.title}
              </h1>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 shrink-0 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-800">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {trip.startDate} → {trip.endDate}
              </span>
              <span className="flex items-center gap-1 font-bold text-cyan-400">
                <DollarSign className="w-3.5 h-3.5" />
                Budget <AnimatedCounter value={trip.totalBudget} prefix="$" />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Workspace Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800/80 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                isActive
                  ? 'bg-ocean-500/20 text-cyan-300 border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 text-cyan-400" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Tab Content Area */}
      <div>
        {activeTab === 'itinerary' && <ItineraryViewSwitcher trip={trip} />}
        {activeTab === 'route' && <RouteVisualizer trip={trip} />}
        {activeTab === 'budget' && <FinancialCockpit trip={trip} />}
        {activeTab === 'health' && (
          <TripHealthCockpit
            trip={trip}
            onOpenCopilot={() => setShowAIDrawer(true)}
          />
        )}
        {activeTab === 'discover' && (
          <DestinationExplorer onAddCityToTrip={handleAddCityFromDiscovery} />
        )}
      </div>

      {/* 4. AI Assistant Co-Pilot Drawer */}
      <AIAssistantDrawer
        trip={trip}
        isOpen={showAIDrawer}
        onClose={() => setShowAIDrawer(false)}
      />

      {/* 5. Supabase Storage Cover Upload Modal */}
      {showCoverUploadModal && (
        <ImageUploadModal
          bucket="trip-covers"
          onUploaded={handleCoverUploaded}
          onClose={() => setShowCoverUploadModal(false)}
        />
      )}
    </div>
  );
};