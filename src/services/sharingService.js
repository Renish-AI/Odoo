import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips, getLocalUser } from './localStore';

export const sharingService = {
  async getPublicTripBySlug(slug) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('trips')
        .select('*, profiles (full_name, avatar_url, bio), trip_stops (*, activities (*)), expenses (*)')
        .eq('share_slug', slug)
        .eq('is_public', true)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description,
          coverImage: data.cover_image,
          startDate: data.start_date,
          endDate: data.end_date,
          totalBudget: Number(data.total_budget),
          currency: data.currency || 'USD',
          isPublic: data.is_public,
          shareSlug: data.share_slug,
          tags: data.tags || [],
          user: {
            fullName: data.profiles?.full_name || 'GlobeTrotter Explorer',
            avatarUrl: data.profiles?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
            bio: data.profiles?.bio || ''
          },
          stops: (data.trip_stops || []).map((s) => ({
            id: s.id,
            cityName: s.city_name,
            countryName: s.country_name,
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
          activities: (data.trip_stops || []).flatMap((s) =>
            (s.activities || []).map((a) => ({
              id: a.id,
              tripStopId: a.trip_stop_id,
              dayNumber: a.day_number,
              title: a.title,
              description: a.description,
              category: a.category,
              cost: Number(a.cost),
              startTime: a.start_time,
              endTime: a.end_time,
              status: a.status
            }))
          ),
          expenses: (data.expenses || []).map((e) => ({
            id: e.id,
            category: e.category,
            amount: Number(e.amount),
            date: e.date,
            description: e.description
          }))
        };
      }
    }

    const trips = getLocalTrips();
    return trips.find((t) => t.shareSlug === slug || t.id === slug) || null;
  },

  async copyTripToMyAccount(trip) {
    const user = getLocalUser();
    const forkedTrip = {
      ...trip,
      id: 'trip-' + Date.now(),
      title: trip.title + ' (Forked)',
      shareSlug: (trip.shareSlug || 'trip') + '-copy-' + Math.random().toString(36).substring(2, 6),
      isPublic: false,
      user: {
        fullName: user?.fullName || 'My Account',
        avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      stops: (trip.stops || []).map((s, idx) => ({
        ...s,
        id: 'stop-copy-' + Date.now() + '-' + idx
      })),
      activities: (trip.activities || []).map((a, idx) => ({
        ...a,
        id: 'act-copy-' + Date.now() + '-' + idx
      })),
      expenses: (trip.expenses || []).map((e, idx) => ({
        ...e,
        id: 'exp-copy-' + Date.now() + '-' + idx
      }))
    };

    const trips = getLocalTrips();
    trips.unshift(forkedTrip);
    saveLocalTrips(trips);
    return forkedTrip;
  }
};
