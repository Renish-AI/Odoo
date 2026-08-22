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
  Globe2
} from 'lucide-react';
import { useTrips } from '../context/TripContext';
import { RouteVisualizer } from '../components/itinerary/RouteVisualizer';
import { DayItineraryPlanner } from '../components/itinerary/DayItineraryPlanner';
import { BudgetAnalytics } from '../components/budget/BudgetAnalytics';
import { TripHealthWidget } from '../components/health/TripHealthWidget';
import { TripTimelineView } from '../components/calendar/TripTimelineView';
import { DestinationExplorer } from '../components/discovery/DestinationExplorer';
import { AIAssistantDrawer } from '../components/health/AIAssistantDrawer';
import { TripCanvas } from '../components/itinerary/TripCanvas';
import { VisualJourney } from '../components/itinerary/VisualJourney';
import { TravelCopilot } from '../components/common/TravelCopilot';

export const TripWorkspacePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { trips, activeTrip, selectTrip, updateTrip, addStop } = useTrips();

  const [activeTab, setActiveTab] = useState('canvas'); // canvas | route | itinerary | budget | health | calendar | discover
  const [showAIDrawer, setShowAIDrawer] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (id) {
      selectTrip(id);
    }
  }, [id, selectTrip]);

  const trip = trips.find((t) => t.id === id || t.shareSlug === id) || activeTrip;

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">Journey Not Found</h3>
        <p className="text-xs text-slate-400">
          The requested trip does not exist or has been removed.
        </p>
        <Link
          to="/trips"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Go to My Trips
        </Link>
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

  const tabs = [
    { id: 'canvas', label: 'Trip Canvas', icon: Sparkles },
    { id: 'journey', label: 'Visual Journey', icon: Globe2 },
    { id: 'route', label: 'Multi-City Route', icon: Layers },
    { id: 'itinerary', label: 'Day-by-Day Itinerary', icon: CalendarDays },
    { id: 'budget', label: 'Budget & Expenses', icon: PieChart },
    { id: 'health', label: 'Trip Health & Pacing', icon: Activity },
    { id: 'calendar', label: 'Timeline View', icon: Calendar },
    { id: 'discover', label: 'Discover Places', icon: Compass },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. Hero Journey Workspace Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="relative aspect-[21/7] sm:aspect-[24/6] min-h-[220px]">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Journeys
            </Link>

            <div className="flex items-center gap-2">
              <button
                onClick={handleTogglePublic}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl backdrop-blur-md border text-xs font-semibold transition-all ${
                  trip.isPublic
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-950/80 text-slate-400 border-slate-800'
                }`}
              >
                {trip.isPublic ? <Globe2 className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{trip.isPublic ? 'Publicly Shared' : 'Private Trip'}</span>
              </button>

              {trip.isPublic && (
                <button
                  onClick={handleCopyShareLink}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white hover:border-emerald-500/40 transition-colors"
                  title="Copy share link"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLink ? 'Copied!' : 'Share Link'}</span>
                </button>
              )}

              <button
                onClick={() => setShowAIDrawer(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
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
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-900/80 text-emerald-400 border border-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight">
                {trip.title}
              </h1>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-300 shrink-0">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {trip.startDate} → {trip.endDate}
              </span>
              <span className="flex items-center gap-1 font-bold text-emerald-400">
                <DollarSign className="w-3.5 h-3.5" />
                Budget ${trip.totalBudget?.toLocaleString()}
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
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 border-transparent hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Active Tab Content Area */}
      <div>
        {activeTab === 'canvas' && <TripCanvas trip={trip} />}
        {activeTab === 'journey' && <VisualJourney trip={trip} />}
        {activeTab === 'route' && <RouteVisualizer trip={trip} />}
        {activeTab === 'itinerary' && <DayItineraryPlanner trip={trip} />}
        {activeTab === 'budget' && <BudgetAnalytics trip={trip} />}
        {activeTab === 'health' && (
          <TripHealthWidget
            trip={trip}
            onOpenAIAssistant={() => setShowAIDrawer(true)}
          />
        )}
        {activeTab === 'calendar' && <TripTimelineView trip={trip} />}
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

      {/* 5. Floating GlobeTrotter Copilot FAB */}
      <TravelCopilot trip={trip} />
    </div>
  );
};
