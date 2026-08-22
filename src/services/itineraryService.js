import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips } from './localStore';
import { GLOBAL_DESTINATIONS } from '../data/destinations';

const isUUID = (str) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const itineraryService = {
  async addStop(tripId, stopData) {
    const cityNameClean = (stopData.cityName || '').trim().toLowerCase();
    const dest = GLOBAL_DESTINATIONS.find(
      (d) => d.city.toLowerCase() === cityNameClean || d.country.toLowerCase() === cityNameClean
    );

    const newStop = {
      id: 'stop-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      cityName: stopData.cityName,
      countryName: stopData.countryName || dest?.country || 'Destination',
      countryCode: dest?.countryCode || 'US',
      lat: Number(stopData.lat || dest?.lat || 48.8566),
      lng: Number(stopData.lng || dest?.lng || 2.3522),
      arrivalDate: stopData.arrivalDate || new Date().toISOString().split('T')[0],
      departureDate: stopData.departureDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      orderIndex: Number(stopData.orderIndex) || 0,
      notes: stopData.notes || '',
      coverImage: stopData.coverImage || dest?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
      transitMode: stopData.transitMode || 'flight',
      transitDurationMins: Number(stopData.transitDurationMins) || 120,
      transitCost: Number(stopData.transitCost) || 75
    };

    // Safely insert into Supabase if configured and UUID is valid
    if (isSupabaseConfigured() && supabase && isUUID(tripId)) {
      try {
        const { data, error } = await supabase
          .from('trip_stops')
          .insert({
            trip_id: tripId,
            city_name: newStop.cityName,
            country_name: newStop.countryName,
            country_code: newStop.countryCode,
            lat: newStop.lat,
            lng: newStop.lng,
            arrival_date: newStop.arrivalDate,
            departure_date: newStop.departureDate,
            order_index: newStop.orderIndex,
            notes: newStop.notes,
            cover_image: newStop.coverImage,
            transit_mode: newStop.transitMode,
            transit_duration_mins: newStop.transitDurationMins,
            transit_cost: newStop.transitCost
          })
          .select()
          .single();

        if (!error && data) {
          newStop.id = data.id;
        }
      } catch (err) {
        console.warn('Supabase addStop error, persisting locally:', err);
      }
    }

    // Always update local store
    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      if (!trip.stops) trip.stops = [];
      newStop.orderIndex = trip.stops.length;
      trip.stops.push(newStop);
      saveLocalTrips(trips);
    }

    return newStop;
  },

  async updateStop(tripId, stopId, updates) {
    if (isSupabaseConfigured() && supabase && isUUID(stopId)) {
      try {
        await supabase
          .from('trip_stops')
          .update({
            arrival_date: updates.arrivalDate,
            departure_date: updates.departureDate,
            notes: updates.notes,
            transit_mode: updates.transitMode,
            transit_duration_mins: updates.transitDurationMins,
            transit_cost: updates.transitCost
          })
          .eq('id', stopId);
      } catch (err) {
        console.warn('Supabase updateStop skipped:', err);
      }
    }

    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip && trip.stops) {
      const idx = trip.stops.findIndex((s) => s.id === stopId);
      if (idx !== -1) {
        trip.stops[idx] = { ...trip.stops[idx], ...updates };
        saveLocalTrips(trips);
        return trip.stops[idx];
      }
    }
    return null;
  },

  async deleteStop(tripId, stopId) {
    if (isSupabaseConfigured() && supabase && isUUID(stopId)) {
      try {
        await supabase.from('trip_stops').delete().eq('id', stopId);
      } catch (err) {
        console.warn('Supabase deleteStop skipped:', err);
      }
    }

    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip && trip.stops) {
      trip.stops = trip.stops.filter((s) => s.id !== stopId);
      if (trip.activities) {
        trip.activities = trip.activities.filter((a) => a.tripStopId !== stopId);
      }
      saveLocalTrips(trips);
      return true;
    }
    return false;
  },

  async reorderStops(tripId, reorderedStops) {
    const updatedStops = reorderedStops.map((stop, index) => ({
      ...stop,
      orderIndex: index
    }));

    if (isSupabaseConfigured() && supabase && isUUID(tripId)) {
      try {
        for (const s of updatedStops) {
          if (isUUID(s.id)) {
            await supabase
              .from('trip_stops')
              .update({ order_index: s.orderIndex })
              .eq('id', s.id);
          }
        }
      } catch (err) {
        console.warn('Supabase reorderStops skipped:', err);
      }
    }

    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      trip.stops = updatedStops;
      saveLocalTrips(trips);
    }
    return updatedStops;
  }
};