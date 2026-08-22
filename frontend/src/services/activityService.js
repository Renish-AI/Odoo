import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips } from './localStore';

export const activityService = {
  async addActivity(tripId, tripStopId, activityData) {
    const newActivity = {
      id: 'act-' + Date.now(),
      tripStopId,
      dayNumber: activityData.dayNumber || 1,
      title: activityData.title || 'Sightseeing Stop',
      description: activityData.description || '',
      category: activityData.category || 'Sightseeing',
      cost: Number(activityData.cost) || 0,
      currency: activityData.currency || 'USD',
      startTime: activityData.startTime || '10:00',
      endTime: activityData.endTime || '12:00',
      orderIndex: activityData.orderIndex || 0,
      locationName: activityData.locationName || '',
      status: activityData.status || 'planned'
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('activities')
        .insert({
          trip_stop_id: tripStopId,
          day_number: newActivity.dayNumber,
          title: newActivity.title,
          description: newActivity.description,
          category: newActivity.category,
          cost: newActivity.cost,
          currency: newActivity.currency,
          start_time: newActivity.startTime,
          end_time: newActivity.endTime,
          order_index: newActivity.orderIndex,
          location_name: newActivity.locationName,
          status: newActivity.status
        })
        .select()
        .single();

      if (!error && data) {
        newActivity.id = data.id;
      }
    }

    // Update local state
    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      if (!trip.activities) trip.activities = [];
      trip.activities.push(newActivity);
      saveLocalTrips(trips);
    }

    return newActivity;
  },

  async updateActivity(tripId, activityId, updates) {
    if (isSupabaseConfigured() && supabase) {
      await supabase
        .from('activities')
        .update({
          title: updates.title,
          description: updates.description,
          category: updates.category,
          cost: updates.cost,
          day_number: updates.dayNumber,
          start_time: updates.startTime,
          end_time: updates.endTime,
          order_index: updates.orderIndex,
          status: updates.status
        })
        .eq('id', activityId);
    }

    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip && trip.activities) {
      const idx = trip.activities.findIndex((a) => a.id === activityId);
      if (idx !== -1) {
        trip.activities[idx] = { ...trip.activities[idx], ...updates };
        saveLocalTrips(trips);
        return trip.activities[idx];
      }
    }
    return null;
  },

  async deleteActivity(tripId, activityId) {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('activities').delete().eq('id', activityId);
    }

    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip && trip.activities) {
      trip.activities = trip.activities.filter((a) => a.id !== activityId);
      saveLocalTrips(trips);
      return true;
    }
    return false;
  }
};
