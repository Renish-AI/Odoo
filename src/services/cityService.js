import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GLOBAL_DESTINATIONS } from '../data/destinations';

export const cityService = {
  async getDestinationByCity(cityName) {
    if (!cityName) return null;
    const clean = cityName.trim().toLowerCase();
    const found = GLOBAL_DESTINATIONS.find(
      (d) => d.city.toLowerCase() === clean || d.country.toLowerCase() === clean
    );
    return found || null;
  },

  /**
   * Search for cities based on a text query
   * Matches name, country, region, or tags.
   */
  async searchCities(query) {
    const trimmedQuery = (query || '').trim().toLowerCase();
    if (!trimmedQuery) return [];

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .or(`name.ilike.%${trimmedQuery}%,country.ilike.%${trimmedQuery}%,region.ilike.%${trimmedQuery}%`);

        if (!error && data && data.length > 0) {
          return data.map((c) => ({
            id: c.id,
            city: c.name,
            country: c.country,
            region: c.region,
            description: c.description,
            image: c.cover_image || c.image_url,
            avgDailyBudget: Number(c.avg_daily_budget || c.average_daily_cost || 120),
            rating: Number(c.rating || c.popularity_score || 4.8),
            lat: Number(c.lat || c.latitude || 48.8566),
            lng: Number(c.lng || c.longitude || 2.3522)
          }));
        }
      } catch (err) {
        console.warn('Supabase searchCities failed, using local fallback:', err);
      }
    }

    // Local fallback matching GLOBAL_DESTINATIONS
    return GLOBAL_DESTINATIONS.filter(
      (dest) =>
        dest.city.toLowerCase().includes(trimmedQuery) ||
        dest.country.toLowerCase().includes(trimmedQuery) ||
        dest.region.toLowerCase().includes(trimmedQuery) ||
        (dest.tags && dest.tags.some((t) => t.toLowerCase().includes(trimmedQuery)))
    );
  }
};