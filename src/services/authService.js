import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalUser, saveLocalUser } from './localStore';
import { tripService } from './tripService';

export const authService = {
  async getCurrentUser() {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) return getLocalUser();
        
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        return {
          id: user.id,
          email: user.email,
          fullName: profile?.full_name || user.user_metadata?.full_name || 'Traveler',
          avatarUrl: profile?.avatar_url || user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
          bio: profile?.bio || '',
          homeCurrency: profile?.home_currency || 'USD',
          travelStyle: profile?.travel_style || 'Balanced Explorer',
        };
      } catch (e) {
        console.warn('Supabase getCurrentUser fallback:', e);
      }
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

      if (data.user) {
        // Ensure profile exists in profiles table
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: fullName || email.split('@')[0],
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        });

        // Automatically sync all sample / local trips to Supabase!
        await tripService.syncLocalTripsToSupabase();
      }

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

      if (data.user) {
        // Ensure profile exists
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || email.split('@')[0],
          avatar_url: data.user.user_metadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
        });

        // Automatically sync all trips to Supabase
        await tripService.syncLocalTripsToSupabase();
      }

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

  async resetPassword(email) {
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if (error) throw error;
      return true;
    }
    return true;
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