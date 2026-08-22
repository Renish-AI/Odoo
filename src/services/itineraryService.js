import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips } from './localStore';
import { cityService } from './cityService';

export const itineraryService = {
  async addStop(tripId, stopData) {
    const dest = await cityService.getDestinationByCity(stopData.cityName);
    
    const newStop = {
      id: 'stop-' + Date.now(),
      cityName: stopData.cityName,
      countryName: stopData.countryName || dest?.country || '',
      countryCode: dest?.countryCode || 'US',
      lat: dest?.lat || 48.8566,
      lng: dest?.lng || 2.3522,
      arrivalDate: stopData.arrivalDate || new Date().toISOString().split('T')[0],
      departureDate: stopData.departureDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      orderIndex: stopData.orderIndex || 0,
      notes: stopData.notes || '',
      coverImage: dest?.image || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80',
      transitMode: stopData.transitMode || 'flight',
      transitDurationMins: stopData.transitDurationMins || 120,
      transitCost: Number(stopData.transitCost) || 75
    };

    if (isSupabaseConfigured() && supabase) {
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
    }

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
    if (isSupabaseConfigured() && supabase) {
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
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('trip_stops').delete().eq('id', stopId);
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

    if (isSupabaseConfigured() && supabase) {
      for (const s of updatedStops) {
        await supabase
          .from('trip_stops')
          .update({ order_index: s.orderIndex })
          .eq('id', s.id);
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
