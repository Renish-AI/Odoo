import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips, getLocalUser } from './localStore';
import { PRESET_TRIPS } from '../data/destinations';

const generateSlug = (title) => {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') +
    '-' +
    Math.random().toString(36).substring(2, 7)
  );
};

export const tripService = {
  async getTrips() {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('trips')
        .select('*, trip_stops (*, activities (*)), expenses (*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching Supabase trips:', error);
        return getLocalTrips();
      }

      return data.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        coverImage: t.cover_image,
        startDate: t.start_date,
        endDate: t.end_date,
        totalBudget: Number(t.total_budget),
        currency: t.currency || 'USD',
        isPublic: t.is_public,
        shareSlug: t.share_slug,
        tags: t.tags || [],
        status: t.status,
        stops: (t.trip_stops || [])
          .sort((a, b) => a.order_index - b.order_index)
          .map((s) => ({
            id: s.id,
            cityName: s.city_name,
            countryName: s.country_name,
            countryCode: s.country_code,
            lat: Number(s.lat),
            lng: Number(s.lng),
            arrivalDate: s.arrival_date,
            departureDate: s.departure_date,
            orderIndex: s.order_index,
            notes: s.notes,
            coverImage: s.cover_image,
            transitMode: s.transit_mode,
            transitDurationMins: s.transit_duration_mins,
            transitCost: Number(s.transit_cost)
          })),
        activities: (t.trip_stops || []).flatMap((s) =>
          (s.activities || []).map((a) => ({
            id: a.id,
            tripStopId: a.trip_stop_id,
            dayNumber: a.day_number,
            title: a.title,
            description: a.description,
            category: a.category,
            cost: Number(a.cost),
            currency: a.currency,
            startTime: a.start_time,
            endTime: a.end_time,
            orderIndex: a.order_index,
            locationName: a.location_name,
            status: a.status
          }))
        ),
        expenses: (t.expenses || []).map((e) => ({
          id: e.id,
          category: e.category,
          amount: Number(e.amount),
          currency: e.currency,
          date: e.date,
          description: e.description,
          paymentMethod: e.payment_method
        }))
      }));
    }

    return getLocalTrips();
  },

  async getTripById(id) {
    const trips = await this.getTrips();
    return trips.find((t) => t.id === id || t.shareSlug === id) || null;
  },

  async createTrip(tripData) {
    const slug = generateSlug(tripData.title);
    const user = getLocalUser();

    if (isSupabaseConfigured() && supabase) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;

      const { data, error } = await supabase
        .from('trips')
        .insert({
          user_id: userId,
          title: tripData.title,
          description: tripData.description || '',
          cover_image:
            tripData.coverImage ||
            'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          total_budget: tripData.totalBudget || 2000,
          currency: tripData.currency || 'USD',
          is_public: Boolean(tripData.isPublic),
          share_slug: slug,
          tags: tripData.tags || ['Explorer', 'Adventure']
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to create trip in Supabase:', error);
      } else {
        return this.getTripById(data.id);
      }
    }

    // Local fallback
    const newTrip = {
      id: 'trip-' + Date.now(),
      title: tripData.title,
      description: tripData.description || 'An unforgettable multi-city travel adventure.',
      coverImage:
        tripData.coverImage ||
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1200&q=80',
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      totalBudget: Number(tripData.totalBudget) || 2500,
      currency: tripData.currency || 'USD',
      isPublic: Boolean(tripData.isPublic),
      shareSlug: slug,
      tags: tripData.tags || ['Adventure', 'Discovery'],
      user: {
        fullName: user?.fullName || 'Alex Vance',
        avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      stops: tripData.stops || [],
      activities: tripData.activities || [],
      expenses: tripData.expenses || []
    };

    const trips = getLocalTrips();
    trips.unshift(newTrip);
    saveLocalTrips(trips);
    return newTrip;
  },

  async updateTrip(id, tripData) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('trips')
        .update({
          title: tripData.title,
          description: tripData.description,
          cover_image: tripData.coverImage,
          start_date: tripData.startDate,
          end_date: tripData.endDate,
          total_budget: tripData.totalBudget,
          currency: tripData.currency,
          is_public: tripData.isPublic,
          tags: tripData.tags,
          status: tripData.status
        })
        .eq('id', id);

      if (error) console.error('Supabase updateTrip error:', error);
    }

    const trips = getLocalTrips();
    const idx = trips.findIndex((t) => t.id === id);
    if (idx !== -1) {
      trips[idx] = { ...trips[idx], ...tripData, id };
      saveLocalTrips(trips);
      return trips[idx];
    }
    return null;
  },

  async deleteTrip(id) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('trips').delete().eq('id', id);
      if (error) console.error('Supabase deleteTrip error:', error);
    }

    const trips = getLocalTrips().filter((t) => t.id !== id);
    saveLocalTrips(trips);
    return true;
  },

  async duplicateTrip(id) {
    const trip = await this.getTripById(id);
    if (!trip) return null;

    const cloned = {
      ...trip,
      id: 'trip-' + Date.now(),
      title: trip.title + ' (Copy)',
      shareSlug: generateSlug(trip.title + ' copy'),
      isPublic: false,
      stops: trip.stops.map((s, idx) => ({
        ...s,
        id: 'stop-' + Date.now() + '-' + idx
      })),
      activities: trip.activities.map((a, idx) => ({
        ...a,
        id: 'act-' + Date.now() + '-' + idx
      })),
      expenses: trip.expenses.map((e, idx) => ({
        ...e,
        id: 'exp-' + Date.now() + '-' + idx
      }))
    };

    const trips = getLocalTrips();
    trips.unshift(cloned);
    saveLocalTrips(trips);
    return cloned;
  }
};
