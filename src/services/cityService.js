import { GLOBAL_DESTINATIONS } from '../data/destinations';

export const cityService = {
  async getAllDestinations() {
    return GLOBAL_DESTINATIONS;
  },

  async searchDestinations(query = '', region = 'All', tag = 'All') {
    let list = GLOBAL_DESTINATIONS;

    if (region && region !== 'All') {
      list = list.filter((d) => d.region.toLowerCase() === region.toLowerCase());
    }

    if (tag && tag !== 'All') {
      list = list.filter((d) =>
        d.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
      );
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(
        (d) =>
          d.city.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  },

  async getDestinationByCity(cityName) {
    return (
      GLOBAL_DESTINATIONS.find(
        (d) => d.city.toLowerCase() === cityName.toLowerCase()
      ) || null
    );
  }
};
