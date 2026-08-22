import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Globe2,
  Calendar,
  DollarSign,
  MapPin,
  Share2,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  User,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { sharingService } from '../../services/sharingService';
import { useTrips } from '../../context/TripContext';

export const PublicStoryView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { fetchTrips } = useTrips();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedLink, setCopiedLink] = useState(false);
  const [forking, setForking] = useState(false);

  useEffect(() => {
    const loadSharedTrip = async () => {
      try {
        setLoading(true);
        const data = await sharingService.getPublicTripBySlug(slug);
        setTrip(data);
      } catch (err) {
        console.error('Error loading public trip:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSharedTrip();
  }, [slug]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleForkTrip = async () => {
    if (!trip) return;
    setForking(true);
    try {
      const cloned = await sharingService.copyTripToMyAccount(trip);
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
      await fetchTrips();
      setTimeout(() => {
        navigate(`/trip/${cloned.id}`);
      }, 800);
    } catch (err) {
      console.error('Error copying trip:', err);
    } finally {
      setForking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
        <p className="text-xs text-slate-400">Loading travel story...</p>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <Globe2 className="w-12 h-12 text-slate-600 mx-auto" />
        <h3 className="text-lg font-bold text-white">Travel Story Not Found</h3>
        <p className="text-xs text-slate-400">
          This itinerary may be private or the share link has expired.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs"
        >
          Return to Home
        </Link>
      </div>
    );
  }

  const stops = trip.stops || [];
  const activities = trip.activities || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
        <div className="relative aspect-[21/9] sm:aspect-[24/9] min-h-[320px]">
          <img
            src={trip.coverImage || 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80'}
            alt={trip.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />

          {/* Top Bar Actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-white hover:border-emerald-500/40 transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Share Story'}</span>
            </button>

            <button
              onClick={handleForkTrip}
              disabled={forking}
              className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{forking ? 'Cloning...' : 'Copy Trip to My Account'}</span>
            </button>
          </div>

          {/* Bottom Title & Traveler Details */}
          <div className="absolute bottom-6 left-6 right-6 space-y-3">
            <div className="flex flex-wrap gap-2">
              {(trip.tags || ['Epic Journey']).map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              {trip.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <img
                  src={trip.user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
                  alt="creator"
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-emerald-400"
                />
                <span className="font-semibold text-white">By {trip.user?.fullName || 'Travel Explorer'}</span>
              </div>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {trip.startDate} → {trip.endDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Est. Budget ${trip.totalBudget?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {trip.description && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-sm text-slate-300 leading-relaxed">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">About This Journey</div>
          {trip.description}
        </div>
      )}

      {/* Stops Route Visualizer */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-emerald-400" />
          Journey Stops & Route ({stops.length} Cities)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {stops.map((stop, idx) => (
            <div
              key={stop.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="relative h-32 rounded-xl overflow-hidden">
                <img src={stop.coverImage} alt={stop.cityName} className="w-full h-full object-cover" />
                <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center">
                  {idx + 1}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{stop.cityName}</h4>
                <p className="text-xs text-slate-400">{stop.countryName}</p>
                <div className="text-[11px] text-emerald-400 mt-1">
                  {stop.arrivalDate} to {stop.departureDate}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Day by Day Activities */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Day-by-Day Story & Activities
        </h3>

        <div className="space-y-3">
          {activities.map((act) => (
            <div
              key={act.id}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                    Day {act.dayNumber}
                  </span>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    {act.category}
                  </span>
                  <h5 className="text-sm font-bold text-white">{act.title}</h5>
                </div>
                {act.description && (
                  <p className="text-xs text-slate-400 leading-relaxed">{act.description}</p>
                )}
                <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {act.startTime || '10:00'} - {act.endTime || '12:00'}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                {act.cost > 0 ? (
                  <span className="text-xs font-bold text-emerald-400">${act.cost}</span>
                ) : (
                  <span className="text-[11px] text-slate-500 font-medium">Free</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fork CTA Footer */}
      <div className="p-8 rounded-3xl bg-gradient-to-tr from-emerald-950/60 via-slate-900 to-teal-950/60 border border-emerald-500/30 text-center space-y-4 shadow-2xl">
        <h3 className="text-xl font-bold text-white">Inspired by this journey?</h3>
        <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
          Clone this entire itinerary into your private workspace with a single click. Customize stops, fine-tune budgets, and make it your own.
        </p>
        <button
          onClick={handleForkTrip}
          disabled={forking}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all"
        >
          <Sparkles className="w-4 h-4" />
          <span>{forking ? 'Copying Journey...' : 'Copy Trip to My Account'}</span>
        </button>
      </div>
    </div>
  );
};
