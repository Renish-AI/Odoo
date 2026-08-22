import React, { useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

// Category emoji map
const CATEGORY_EMOJI = {
  Culture:      '🏛️',
  Food:         '🍜',
  Sightseeing:  '🗼',
  Nature:       '🌿',
  Adventure:    '🧗',
  Relax:        '🧘',
  Shopping:     '🛍️',
  Nightlife:    '🎵',
  Transport:    '🚆',
  default:      '📍'
};

const TRANSIT_EMOJI = { flight: '✈️', train: '🚄', bus: '🚌', ferry: '⛴️', default: '🚗' };

// ── Stagger containers ──────────────────────────────────────
const routeLineVariants = {
  hidden: { scaleY: 0, originY: 0 },
  visible: { scaleY: 1, transition: { duration: 0.7, ease: 'easeInOut' } }
};

const cityVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (i) => ({
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', stiffness: 320, damping: 22, delay: i * 0.15 }
  })
};

const cardVariants = {
  hidden: { x: -40, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.45, ease: 'easeOut', delay: i * 0.15 + 0.1 }
  })
};

const activityVariants = {
  hidden: { x: -24, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: 'easeOut', delay: i * 0.08 }
  })
};

// ── City Marker ──────────────────────────────────────────────
const CityMarker = ({ stopIdx, cityName, custom }) => (
  <motion.div
    className="relative z-10 flex items-center gap-3 mb-4"
    variants={cityVariants}
    custom={custom}
    initial="hidden"
    animate="visible"
  >
    {/* Pulsing ring */}
    <div className="relative shrink-0">
      <span className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping" />
      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-sm flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-2 ring-emerald-500/40">
        {stopIdx + 1}
      </div>
    </div>
    <div>
      <div className="text-base font-extrabold text-white tracking-tight">{cityName}</div>
      <div className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Destination {stopIdx + 1}</div>
    </div>
  </motion.div>
);

// ── Stop Card ────────────────────────────────────────────────
const StopCard = ({ stop, custom }) => (
  <motion.div
    className="ml-14 mb-3 p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-sm flex flex-wrap items-center gap-3"
    variants={cardVariants}
    custom={custom}
    initial="hidden"
    animate="visible"
  >
    {stop.coverImage && (
      <img src={stop.coverImage} alt={stop.cityName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
    )}
    <div className="flex-1 min-w-0">
      <div className="text-sm font-bold text-white">{stop.cityName}, {stop.countryName}</div>
      {(stop.arrivalDate || stop.departureDate) && (
        <div className="text-[11px] text-slate-400 mt-0.5">
          📅 {stop.arrivalDate} → {stop.departureDate}
          {stop.transitDurationMins > 0 && (
            <span className="ml-2 text-emerald-400">• ~{Math.round(stop.transitDurationMins / 60)}h transit</span>
          )}
        </div>
      )}
    </div>
    {stop.transitCost > 0 && (
      <span className="text-[11px] font-bold text-cyan-400 shrink-0">₹{(stop.transitCost * 85).toLocaleString('en-IN')}</span>
    )}
  </motion.div>
);

// ── Activity Row ─────────────────────────────────────────────
const ActivityRow = ({ act, idx }) => {
  const emoji = CATEGORY_EMOJI[act.category] || CATEGORY_EMOJI.default;
  return (
    <motion.div
      className="ml-14 pl-4 py-2 flex items-center gap-3 border-l-2 border-slate-800 hover:border-emerald-500/50 group transition-colors"
      variants={activityVariants}
      custom={idx}
      initial="hidden"
      animate="visible"
    >
      <span className="text-base shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
          {act.title}
        </div>
        {act.startTime && (
          <div className="text-[10px] text-slate-500 mt-0.5 font-mono">{act.startTime} – {act.endTime || '?'}</div>
        )}
      </div>
      <div className="shrink-0 text-right">
        {act.cost > 0 ? (
          <span className="text-[11px] font-bold text-emerald-400">₹{(act.cost * 85).toLocaleString('en-IN')}</span>
        ) : (
          <span className="text-[10px] text-slate-500">Free</span>
        )}
      </div>
    </motion.div>
  );
};

// ── Transit Bridge ───────────────────────────────────────────
const TransitBridge = ({ mode, durationMins }) => {
  const emoji = TRANSIT_EMOJI[mode] || TRANSIT_EMOJI.default;
  return (
    <div className="ml-5 my-4 flex items-center gap-3">
      <div className="w-px h-8 bg-gradient-to-b from-emerald-500/50 to-teal-500/50 mx-[19px]" />
      <span className="text-xs font-semibold text-slate-400 bg-slate-900/80 border border-slate-800 px-3 py-1 rounded-full">
        {emoji} {durationMins > 0 ? `~${Math.round(durationMins / 60)}h transit` : 'Transit leg'}
      </span>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────
export const ItineraryTimeline = ({ trip }) => {
  const stops = trip?.stops || [];
  const activities = trip?.activities || [];
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  if (stops.length === 0) {
    return (
      <div className="text-center py-16 text-slate-500 text-sm">
        Add at least one destination stop to see the animated timeline.
      </div>
    );
  }

  return (
    <div ref={ref} className="relative space-y-2">
      {/* Vertical route spine */}
      <div className="absolute left-[19px] top-5 bottom-5 w-0.5 overflow-hidden rounded-full">
        <motion.div
          className="w-full h-full bg-gradient-to-b from-emerald-500 via-teal-400 to-emerald-500"
          variants={routeLineVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
        />
      </div>

      {stops.map((stop, stopIdx) => {
        const stopActivities = activities.filter((a) => a.tripStopId === stop.id)
          .sort((a, b) => (a.dayNumber - b.dayNumber) || (a.startTime || '').localeCompare(b.startTime || ''));

        return (
          <div key={stop.id}>
            {/* Transit bridge between stops */}
            {stopIdx > 0 && (
              <TransitBridge
                mode={stop.transitMode || 'flight'}
                durationMins={stop.transitDurationMins || 0}
              />
            )}

            <div className="space-y-1">
              <CityMarker stopIdx={stopIdx} cityName={stop.cityName} custom={stopIdx} />
              <StopCard stop={stop} custom={stopIdx} />

              {/* Activities */}
              {stopActivities.length > 0 && (
                <div className="space-y-0.5 mb-4">
                  {stopActivities.map((act, idx) => (
                    <ActivityRow key={act.id} act={act} idx={idx} />
                  ))}
                </div>
              )}

              {stopActivities.length === 0 && (
                <div className="ml-14 pl-4 text-[11px] text-slate-600 italic border-l-2 border-slate-800/60 py-2 mb-4">
                  No activities scheduled for {stop.cityName} yet.
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* End marker */}
      <motion.div
        className="ml-5 flex items-center gap-3 mt-2"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: stops.length * 0.15 + 0.3 }}
      >
        <div className="w-10 h-10 rounded-full border-2 border-dashed border-emerald-500/40 flex items-center justify-center text-emerald-500/60 text-lg">🏁</div>
        <span className="text-xs font-semibold text-slate-500">Journey Complete</span>
      </motion.div>
    </div>
  );
};
