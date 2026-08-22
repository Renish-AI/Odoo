import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalUser, saveLocalUser, getLocalSavedDestinations, saveLocalSavedDestinations } from './localStore';

export const profileService = {
  async getProfile() {
    return getLocalUser();
  },

  async updateProfile(updates) {
    if (isSupabaseConfigured() && supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({
            full_name: updates.fullName,
            bio: updates.bio,
            avatar_url: updates.avatarUrl,
            home_currency: updates.homeCurrency,
            travel_style: updates.travelStyle
          })
          .eq('id', user.id);
      }
    }

    const current = getLocalUser();
    const updated = { ...current, ...updates };
    saveLocalUser(updated);
    return updated;
  },

  async getSavedDestinations() {
    return getLocalSavedDestinations();
  },

  async saveDestination(dest) {
    const list = getLocalSavedDestinations();
    const exists = list.some((d) => d.cityName.toLowerCase() === dest.city.toLowerCase());
    if (!exists) {
      const item = {
        id: 'save-' + Date.now(),
        cityName: dest.city,
        countryName: dest.country,
        rating: dest.rating || 4.8,
        avgDailyBudget: dest.avgDailyBudget || 150,
        imageUrl: dest.image,
        tags: dest.tags || ['Bucket List']
      };
      list.unshift(item);
      saveLocalSavedDestinations(list);
      return item;
    }
    return null;
  },

  async removeSavedDestination(cityName) {
    const list = getLocalSavedDestinations().filter(
      (d) => d.cityName.toLowerCase() !== cityName.toLowerCase()
    );
    saveLocalSavedDestinations(list);
    return true;
  }
};
