import React, { useEffect, useRef, useState } from 'react';
import { MapPin, Calendar, Clock, Sparkles, DollarSign, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InteractiveMap = ({ stops, activities = [] }) => {
  const mapRef = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [mapError, setMapError] = useState(false);
  const [activeStop, setActiveStop] = useState(null);

  // Helper: calculate stop details
  const getStopDetails = (stop, index) => {
    if (!stop) return null;
    
    // Calculate Days
    let days = 3; // Default fallback
    if (stop.arrivalDate && stop.departureDate) {
      const s = new Date(stop.arrivalDate);
      const e = new Date(stop.departureDate);
      const diff = Math.abs(e - s);
      days = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
    }

    // Filter Activities
    const stopActs = activities.filter(a => a.tripStopId === stop.id);

    // Calculate Cost: Stop activities + transit cost
    const transitCost = Number(stop.transitCost) || 0;
    const actsCost = stopActs.reduce((acc, a) => acc + (Number(a.cost) || 0), 0);
    const totalCostINR = (transitCost + actsCost) * 85; // Approx USD to INR conversion (e.g. ₹42,000)

    // Format dates
    const formatDate = (dStr) => {
      if (!dStr) return '';
      const date = new Date(dStr);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    return {
      cityName: stop.cityName,
      countryName: stop.countryName,
      dates: stop.arrivalDate && stop.departureDate 
        ? `${formatDate(stop.arrivalDate)} – ${formatDate(stop.departureDate)}`
        : 'Dates unconfigured',
      days,
      activitiesCount: stopActs.length,
      costFormatted: `₹${totalCostINR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
      index: index + 1
    };
  };

  // 1. LEAFLET MAP INJECTION
  useEffect(() => {
    if (mapError || stops.length === 0 || !mapRef.current) return;

    let map = null;
    try {
      // Find bounding box or center
      const validStops = stops.filter(s => s.lat !== undefined && s.lng !== undefined);
      if (validStops.length === 0) {
        setMapError(true);
        return;
      }

      const centerLat = validStops.reduce((acc, s) => acc + Number(s.lat), 0) / validStops.length;
      const centerLng = validStops.reduce((acc, s) => acc + Number(s.lng), 0) / validStops.length;

      // Initialize Map
      map = window.L?.map ? window.L.map(mapRef.current) : null;
      
      // Fallback if Leaflet isn't loaded globally via window
      if (!map) {
        import('leaflet').then((L) => {
          const newMap = L.map(mapRef.current).setView([centerLat, centerLng], validStops.length > 1 ? 4 : 8);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
          }).addTo(newMap);

          // Custom Marker Icon
          const customIcon = L.divIcon({
            className: 'custom-marker-icon',
            html: `<div class="w-6 h-6 rounded-full bg-slate-900 border-2 border-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-emerald-400 text-[10px] font-black animate-pulse">📍</div>`,
            iconSize: [24, 24]
          });

          // Plot markers & bind click events
          const latlngs = [];
          validStops.forEach((stop, idx) => {
            const lat = Number(stop.lat);
            const lng = Number(stop.lng);
            latlngs.push([lat, lng]);

            const marker = L.marker([lat, lng], { icon: customIcon }).addTo(newMap);
            
            // Marker Click Event to show custom card
            marker.on('click', () => {
              setActiveStop({ stop, index: idx });
            });
          });

          // Draw animated routing line
          if (latlngs.length > 1) {
            L.polyline(latlngs, {
              color: '#10b981',
              weight: 3,
              opacity: 0.8,
              dashArray: '5, 10'
            }).addTo(newMap);
            newMap.fitBounds(L.polyline(latlngs).getBounds(), { padding: [50, 50] });
          }

          setMapInstance(newMap);
        }).catch((err) => {
          console.warn('Leaflet failed to import asynchronously:', err);
          setMapError(true);
        });
        return;
      }
    } catch (e) {
      console.warn('Failed to load Leaflet map. Rendering SVG Fallback Map:', e);
      setMapError(true);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [stops, mapError]);

  // 2. SVG PROJECTED FALLBACK COMPUTATION
  const getSvgContent = () => {
    const validStops = stops.filter(s => s.lat !== undefined && s.lng !== undefined);
    if (validStops.length === 0) return null;

    const padding = 60;
    const width = 760;
    const height = 360;

    const lats = validStops.map(s => Number(s.lat));
    const lngs = validStops.map(s => Number(s.lng));

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const getX = (lng) => {
      if (maxLng === minLng) return width / 2;
      return padding + ((Number(lng) - minLng) / (maxLng - minLng)) * (width - 2 * padding);
    };

    const getY = (lat) => {
      if (maxLat === minLat) return height / 2;
      // Invert Y coordinate for SVG space
      return height - (padding + ((Number(lat) - minLat) / (maxLat - minLat)) * (height - 2 * padding));
    };

    const points = validStops.map(s => ({
      x: getX(s.lng),
      y: getY(s.lat),
      stop: s
    }));

    // Create polyline path
    const pathD = points.reduce((acc, p, idx) => {
      return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return { points, pathD, width, height };
  };

  const svgData = getSvgContent();
  const activeDetails = getStopDetails(activeStop?.stop, activeStop?.index);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/60 shadow-inner">
      {/* Map Header details */}
      <div className="absolute top-4 left-4 z-[400] pointer-events-none">
        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full backdrop-blur-md">
          {mapError ? 'SVG Fallback Map Activated' : 'OpenStreetMap Live Routing'}
        </span>
      </div>

      {/* 1. Leaflet Container */}
      {!mapError && (
        <div 
          ref={mapRef} 
          className="w-full h-[400px] z-10" 
          style={{ background: '#0b0f19' }}
        />
      )}

      {/* 2. SVG Fallback Container */}
      {(mapError || !svgData) && svgData && (
        <div className="relative w-full bg-slate-950/90 py-8 px-4 flex flex-col items-center justify-center min-h-[400px]">
          {/* Animated SVG canvas */}
          <svg 
            viewBox={`0 0 ${svgData.width} ${svgData.height}`} 
            className="w-full max-w-[760px] h-auto drop-shadow-lg"
          >
            {/* Grid pattern lines background */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(51, 65, 85, 0.15)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Route path line */}
            {svgData.pathD && (
              <motion.path
                d={svgData.pathD}
                fill="none"
                stroke="url(#routeGradient)"
                strokeWidth="4"
                strokeDasharray="8, 6"
                initial={{ strokeDashoffset: 1000 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: 12, ease: 'linear', repeat: Infinity }}
              />
            )}

            {/* Path Gradients */}
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" />
                <stop offset="50%" stopColor="#10b981" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>

            {/* Animated marker nodes */}
            {svgData.points.map((p, idx) => (
              <g 
                key={p.stop.id}
                className="cursor-pointer group"
                onClick={() => setActiveStop({ stop: p.stop, index: idx })}
              >
                {/* Node pulsing halo */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="14" 
                  className="fill-emerald-400/10 stroke-emerald-500/30 stroke-1 animate-ping origin-center"
                  style={{ transformOrigin: `${p.x}px ${p.y}px` }}
                />
                
                {/* Outer solid marker border */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="8" 
                  className="fill-slate-900 stroke-emerald-400 stroke-2 group-hover:fill-emerald-500 transition-colors"
                />

                {/* Core pin point */}
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="3" 
                  className="fill-emerald-400 group-hover:fill-slate-900 transition-colors"
                />

                {/* Text labels below markers */}
                <text 
                  x={p.x} 
                  y={p.y + 20} 
                  textAnchor="middle" 
                  className="text-[10px] font-black fill-slate-300 tracking-wider group-hover:fill-emerald-400 transition-colors pointer-events-none drop-shadow-md select-none"
                >
                  {p.stop.cityName}
                </text>
              </g>
            ))}
          </svg>
        </div>
      )}

      {/* 3. Interactive details popup overlay (Click Marker Card) */}
      <AnimatePresence>
        {activeDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="absolute bottom-6 right-6 z-[450] max-w-sm w-[280px] bg-slate-900/95 border-2 border-emerald-500/40 rounded-3xl p-5 shadow-2xl backdrop-blur-md"
          >
            <div className="space-y-4">
              {/* Stop header details */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Stop #{activeDetails.index}
                  </span>
                  <h4 className="text-base font-black text-white mt-1.5 leading-none">
                    {activeDetails.cityName}
                  </h4>
                  <span className="text-[11px] text-teal-400 font-bold block mt-0.5">
                    {activeDetails.countryName}
                  </span>
                </div>
                <button
                  onClick={() => setActiveStop(null)}
                  className="text-xs text-slate-500 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors leading-none"
                >
                  ✕
                </button>
              </div>

              {/* Grid values: dates, duration, activities, total stop cost */}
              <div className="space-y-2 text-[11px] text-slate-400 pt-2 border-t border-slate-850">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{activeDetails.dates} ({activeDetails.days} Days)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{activeDetails.activitiesCount} Activities Scheduled</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-slate-800 mt-2 font-mono">
                  <span className="text-slate-500 uppercase text-[9px] font-bold">Estimated Cost</span>
                  <span className="text-emerald-400 font-black text-xs">{activeDetails.costFormatted}</span>
                </div>
              </div>

              {/* View stop action button */}
              <button
                onClick={() => {
                  setActiveStop(null);
                  // Optional scroll to itinerary action
                  const tabBtn = document.querySelector('[data-tab-id="itinerary"]');
                  if (tabBtn) tabBtn.click();
                }}
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-md shadow-emerald-500/20"
              >
                [ View Stop ]
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
