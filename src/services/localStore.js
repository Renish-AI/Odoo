import { GLOBAL_DESTINATIONS, PRESET_TRIPS } from '../data/destinations';

const STORAGE_KEY_TRIPS = 'globetrotter_trips';
const STORAGE_KEY_USER = 'globetrotter_user';
const STORAGE_KEY_SAVED = 'globetrotter_saved_destinations';

// Initialize default state
export const initLocalStore = () => {
  if (!localStorage.getItem(STORAGE_KEY_TRIPS)) {
    localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(PRESET_TRIPS));
  }
  if (!localStorage.getItem(STORAGE_KEY_USER)) {
    const defaultUser = {
      id: 'usr-demo-1',
      email: 'alex.globetrotter@example.com',
      fullName: 'Alex Vance',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      bio: 'Travel photographer & culinary explorer. 24 countries and counting.',
      homeCurrency: 'USD',
      travelStyle: 'Balanced Cultural Explorer',
      createdAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(defaultUser));
  }
  if (!localStorage.getItem(STORAGE_KEY_SAVED)) {
    const defaultSaved = [
      { id: 'save-1', cityName: 'Tokyo', countryName: 'Japan', rating: 4.9, avgDailyBudget: 160, imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80', tags: ['Culture', 'Food'] },
      { id: 'save-2', cityName: 'Bali', countryName: 'Indonesia', rating: 4.9, avgDailyBudget: 75, imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80', tags: ['Tropical', 'Wellness'] },
      { id: 'save-3', cityName: 'Reykjavik', countryName: 'Iceland', rating: 4.9, avgDailyBudget: 230, imageUrl: 'https://images.unsplash.com/photo-1504893524553-b855bce32c67?auto=format&fit=crop&w=800&q=80', tags: ['Aurora', 'Nature'] }
    ];
    localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(defaultSaved));
  }
};

export const getLocalTrips = () => {
  initLocalStore();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_TRIPS) || '[]');
  } catch (e) {
    return PRESET_TRIPS;
  }
};

export const saveLocalTrips = (trips) => {
  localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(trips));
};

export const getLocalUser = () => {
  initLocalStore();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_USER) || '{}');
  } catch (e) {
    return null;
  }
};

export const saveLocalUser = (user) => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
};

export const getLocalSavedDestinations = () => {
  initLocalStore();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_SAVED) || '[]');
  } catch (e) {
    return [];
  }
};

export const saveLocalSavedDestinations = (destinations) => {
  localStorage.setItem(STORAGE_KEY_SAVED, JSON.stringify(destinations));
};
