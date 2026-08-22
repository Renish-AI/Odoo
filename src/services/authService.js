import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalUser, saveLocalUser } from './localStore';

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured() && supabase) {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return null;
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      return {
        id: user.id,
        email: user.email,
        fullName: profile?.full_name || user.user_metadata?.full_name || 'Traveler',
        avatarUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: profile?.bio || '',
        homeCurrency: profile?.home_currency || 'USD',
        travelStyle: profile?.travel_style || 'Balanced Explorer',
      };
    }
    return getLocalUser();
  },

  async signUp(email, password, fullName = '') {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
          }
        }
      });
      if (error) throw error;
      return data.user;
    } else {
      const newUser = {
        id: 'usr-' + Date.now(),
        email,
        fullName: fullName || email.split('@')[0],
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Explorer in love with new cities and culture.',
        homeCurrency: 'USD',
        travelStyle: 'Curious Adventurer',
        createdAt: new Date().toISOString()
      };
      saveLocalUser(newUser);
      return newUser;
    }
  },

  async signIn(email, password) {
    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return data.user;
    } else {
      let user = getLocalUser();
      if (!user || user.email !== email) {
        user = {
          id: 'usr-' + Date.now(),
          email,
          fullName: email.split('@')[0],
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: 'Passionate globetrotter discovering world wonders.',
          homeCurrency: 'USD',
          travelStyle: 'Balanced Explorer'
        };
        saveLocalUser(user);
      }
      return user;
    }
  },

  async signOut() {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    return true;
  },

  async switchDemoAccount(profileType = 'nomad') {
    const demoProfiles = {
      nomad: {
        id: 'usr-demo-1',
        email: 'alex.vance@globetrotter.io',
        fullName: 'Alex Vance',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Travel photographer & culinary explorer. 24 countries and counting.',
        homeCurrency: 'USD',
        travelStyle: 'Cultural Explorer'
      },
      backpacker: {
        id: 'usr-demo-2',
        email: 'sam.rivers@globetrotter.io',
        fullName: 'Sam Rivers',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
        bio: 'Backpacking through scenic routes, finding hidden local street food.',
        homeCurrency: 'EUR',
        travelStyle: 'Budget Backpacker'
      }
    };
    const selected = demoProfiles[profileType] || demoProfiles.nomad;
    saveLocalUser(selected);
    return selected;
  }
};
