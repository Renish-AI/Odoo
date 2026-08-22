import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GLOBAL_DESTINATIONS } from '../data/destinations';

export const cityService = {
  /**
   * Search for cities based on a text query
   * Matches name, country, region, or tags.
   */
  async searchCities(query) {
    const trimmedQuery = query.trim().toLowerCase();
    if (!trimmedQuery) return [];

    if (isSupabaseConfigured() && supabase) {
      try {
        // Query cities from Supabase
        const { data, error } = await supabase
          .from('cities')
          .select('*')
          .or(`name.ilike.%${trimmedQuery}%,country.ilike.%${trimmedQuery}%,region.ilike.%${trimmedQuery}%`);

        if (error) throw error;
        if (data && data.length > 0) {
          return data.map(c => ({
            id: c.id,
            city: c.name,
            country: c.country,
            region: c.region,
            description: c.description,
            image: c.image_url,
            avgDailyBudget: Number(c.average_daily_cost),
            rating: Number(c.popularity_score),
            lat: Number(c.latitude),
            lng: Number(c.longitude)
          }));
        }
      } catch (err) {
        console.error('Supabase searchCities failed, using fallback:', err);
      }
    }

    // Local fallback matching GLOBAL_DESTINATIONS
    return GLOBAL_DESTINATIONS.filter(dest => 
      dest.city.toLowerCase().includes(trimmedQuery) ||
      dest.country.toLowerCase().includes(trimmedQuery) ||
      dest.region.toLowerCase().includes(trimmedQuery) ||
      dest.tags.some(t => t.toLowerCase().includes(trimmedQuery))
    );
  }
};
