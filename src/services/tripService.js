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

const isUUID = (str) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

export const tripService = {
  async getTrips() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('trips')
          .select('*, trip_stops (*, activities (*)), expenses (*)')
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((t) => ({
            id: t.id,
            title: t.title,
            description: t.description,
            coverImage: t.cover_image,
            startDate: t.start_date,
            endDate: t.end_date,
            totalBudget: Number(t.total_budget),
            currency: t.currency || 'USD',
            travelersCount: Number(t.travelers_count) || 1,
            isPublic: Boolean(t.is_public || t.visibility === 'public'),
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
                transitMode: s.transit_mode || 'flight',
                transitDurationMins: Number(s.transit_duration_mins) || 150,
                transitCost: Number(s.transit_cost) || 80
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
              date: e.date || e.expense_date,
              description: e.description,
              paymentMethod: e.payment_method
            }))
          }));
        }
      } catch (err) {
        console.warn('Supabase fetch error, fallback to local:', err);
      }
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

    // Base trip structure
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
      travelersCount: Number(tripData.travelersCount) || 1,
      currency: tripData.currency || 'USD',
      isPublic: Boolean(tripData.isPublic),
      shareSlug: slug,
      tags: tripData.tags || ['Adventure', 'Discovery'],
      user: {
        fullName: user?.fullName || 'Alex Vance',
        avatarUrl: user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      },
      stops: (tripData.stops || []).map((s, idx) => ({
        ...s,
        id: s.id || `stop-${Date.now()}-${idx}`
      })),
      activities: (tripData.activities || []).map((a, idx) => ({
        ...a,
        id: a.id || `act-${Date.now()}-${idx}`
      })),
      expenses: (tripData.expenses || []).map((e, idx) => ({
        ...e,
        id: e.id || `exp-${Date.now()}-${idx}`
      }))
    };

    // If Supabase is connected
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        let userId = userData?.user?.id;

        // If no user is logged in, use or get current user
        if (userId) {
          // Ensure profile exists in profiles table
          await supabase.from('profiles').upsert({
            id: userId,
            email: userData.user.email,
            full_name: userData.user.user_metadata?.full_name || 'Traveler',
            avatar_url: userData.user.user_metadata?.avatar_url || newTrip.user.avatarUrl
          });

          const { data: tripRow, error: tripError } = await supabase
            .from('trips')
            .insert({
              user_id: userId,
              title: tripData.title,
              description: tripData.description || '',
              cover_image: newTrip.coverImage,
              start_date: tripData.startDate,
              end_date: tripData.endDate,
              total_budget: newTrip.totalBudget,
              currency: newTrip.currency,
              travelers_count: newTrip.travelersCount,
              is_public: newTrip.isPublic,
              visibility: newTrip.isPublic ? 'public' : 'private',
              share_slug: slug,
              tags: newTrip.tags
            })
            .select()
            .single();

          if (!tripError && tripRow) {
            newTrip.id = tripRow.id;

            // Insert initial stops into Supabase
            for (let i = 0; i < (tripData.stops || []).length; i++) {
              const s = tripData.stops[i];
              const { data: stopRow } = await supabase
                .from('trip_stops')
                .insert({
                  trip_id: tripRow.id,
                  city_name: s.cityName,
                  country_name: s.countryName || 'Destination',
                  country_code: s.countryCode || 'US',
                  lat: Number(s.lat) || 48.8566,
                  lng: Number(s.lng) || 2.3522,
                  arrival_date: s.arrivalDate || tripData.startDate,
                  departure_date: s.departureDate || tripData.endDate,
                  order_index: i,
                  transit_mode: s.transitMode || 'flight',
                  transit_duration_mins: Number(s.transitDurationMins) || 120,
                  transit_cost: Number(s.transitCost) || 80,
                  cover_image: s.coverImage || newTrip.coverImage
                })
                .select()
                .single();

              if (stopRow) {
                newTrip.stops[i].id = stopRow.id;
              }
            }
          }
        }
      } catch (err) {
        console.warn('Supabase createTrip warning:', err);
      }
    }

    // Always persist to local store
    const trips = getLocalTrips();
    trips.unshift(newTrip);
    saveLocalTrips(trips);
    return newTrip;
  },

  async syncLocalTripsToSupabase() {
    if (!isSupabaseConfigured() || !supabase) return false;

    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) return false;

      // Ensure profile exists
      await supabase.from('profiles').upsert({
        id: userId,
        email: userData.user.email,
        full_name: userData.user.user_metadata?.full_name || 'Traveler',
        avatar_url: userData.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });

      const localTrips = getLocalTrips();

      for (const trip of localTrips) {
        // Insert trip if not yet in Supabase
        const { data: existingTrip } = await supabase
          .from('trips')
          .select('id')
          .eq('share_slug', trip.shareSlug)
          .maybeSingle();

        let remoteTripId = existingTrip?.id;

        if (!remoteTripId) {
          const { data: insertedTrip } = await supabase
            .from('trips')
            .insert({
              user_id: userId,
              title: trip.title,
              description: trip.description || '',
              cover_image: trip.coverImage,
              start_date: trip.startDate,
              end_date: trip.endDate,
              total_budget: Number(trip.totalBudget) || 2500,
              currency: trip.currency || 'USD',
              travelers_count: Number(trip.travelersCount) || 1,
              is_public: Boolean(trip.isPublic),
              visibility: trip.isPublic ? 'public' : 'private',
              share_slug: trip.shareSlug,
              tags: trip.tags || []
            })
            .select()
            .single();

          if (insertedTrip) {
            remoteTripId = insertedTrip.id;
            trip.id = insertedTrip.id;

            // Insert stops
            for (let i = 0; i < (trip.stops || []).length; i++) {
              const stop = trip.stops[i];
              const { data: insertedStop } = await supabase
                .from('trip_stops')
                .insert({
                  trip_id: remoteTripId,
                  city_name: stop.cityName,
                  country_name: stop.countryName || 'Destination',
                  country_code: stop.countryCode || 'US',
                  lat: Number(stop.lat) || 48.8566,
                  lng: Number(stop.lng) || 2.3522,
                  arrival_date: stop.arrivalDate || trip.startDate,
                  departure_date: stop.departureDate || trip.endDate,
                  order_index: i,
                  transit_mode: stop.transitMode || 'flight',
                  transit_duration_mins: Number(stop.transitDurationMins) || 120,
                  transit_cost: Number(stop.transitCost) || 80,
                  cover_image: stop.coverImage
                })
                .select()
                .single();

              if (insertedStop) {
                stop.id = insertedStop.id;

                // Insert activities for this stop
                const stopActs = (trip.activities || []).filter((a) => a.tripStopId === stop.id || a.dayNumber === i + 1);
                for (const act of stopActs) {
                  await supabase
                    .from('activities')
                    .insert({
                      trip_stop_id: insertedStop.id,
                      day_number: act.dayNumber || 1,
                      title: act.title,
                      description: act.description || '',
                      category: act.category || 'Sightseeing',
                      cost: Number(act.cost) || 0,
                      currency: act.currency || 'USD',
                      start_time: act.startTime || '09:00',
                      end_time: act.endTime || '12:00',
                      location_name: act.locationName || stop.cityName,
                      status: act.status || 'planned'
                    });
                }
              }
            }

            // Insert expenses
            for (const exp of (trip.expenses || [])) {
              await supabase
                .from('expenses')
                .insert({
                  trip_id: remoteTripId,
                  category: exp.category || 'Other',
                  amount: Number(exp.amount) || 0,
                  currency: exp.currency || 'USD',
                  expense_date: exp.date || trip.startDate,
                  description: exp.description || 'Expense',
                  payment_method: exp.paymentMethod || 'Credit Card'
                });
            }
          }
        }
      }

      saveLocalTrips(localTrips);
      return true;
    } catch (err) {
      console.error('Error syncing trips to Supabase:', err);
      return false;
    }
  },

  async updateTrip(id, tripData) {
    if (isSupabaseConfigured() && supabase && isUUID(id)) {
      try {
        await supabase
          .from('trips')
          .update({
            title: tripData.title,
            description: tripData.description,
            cover_image: tripData.coverImage,
            start_date: tripData.startDate,
            end_date: tripData.endDate,
            total_budget: tripData.totalBudget,
            travelers_count: tripData.travelersCount,
            currency: tripData.currency,
            is_public: tripData.isPublic,
            visibility: tripData.isPublic ? 'public' : 'private',
            tags: tripData.tags,
            status: tripData.status
          })
          .eq('id', id);
      } catch (e) {
        console.warn('Supabase updateTrip failed:', e);
      }
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
    if (isSupabaseConfigured() && supabase && isUUID(id)) {
      try {
        await supabase.from('trips').delete().eq('id', id);
      } catch (e) {
        console.warn('Supabase deleteTrip failed:', e);
      }
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
      stops: (trip.stops || []).map((s, idx) => ({
        ...s,
        id: 'stop-' + Date.now() + '-' + idx
      })),
      activities: (trip.activities || []).map((a, idx) => ({
        ...a,
        id: 'act-' + Date.now() + '-' + idx
      })),
      expenses: (trip.expenses || []).map((e, idx) => ({
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