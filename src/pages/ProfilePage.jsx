import React, { useState } from 'react';
import {
  User,
  Mail,
  DollarSign,
  Compass,
  Sparkles,
  Shield,
  Save,
  Check,
  Globe2,
  Database
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';

export const ProfilePage = () => {
  const { user, updateProfile, isSupabaseReady } = useAuth();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [homeCurrency, setHomeCurrency] = useState(user?.homeCurrency || 'USD');
  const [travelStyle, setTravelStyle] = useState(user?.travelStyle || 'Balanced Explorer');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const travelStyles = [
    'Balanced Explorer',
    'Budget Backpacker',
    'Luxury Connoisseur',
    'Cultural & Historic',
    'Foodie & Culinary',
    'Adventure & Nature'
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await profileService.updateProfile({
        fullName,
        bio,
        avatarUrl,
        homeCurrency,
        travelStyle
      });
      updateProfile(updated);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl || user?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt="profile avatar"
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/30"
          />
          <div>
            <h1 className="text-xl font-bold text-white">{fullName || user?.fullName || 'Traveler'}</h1>
            <div className="text-xs text-slate-400">{user?.email || 'traveler@globetrotter.io'}</div>
            <div className="text-[11px] font-semibold text-emerald-400 mt-1">
              {travelStyle}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
          <Database className={`w-4 h-4 ${isSupabaseReady ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <div className="text-xs">
            <div className="font-semibold text-white">
              {isSupabaseReady ? 'Supabase Synchronized' : 'Offline / Demo Store'}
            </div>
            <div className="text-[10px] text-slate-500">
              {isSupabaseReady ? 'PostgreSQL RLS Active' : 'Zero Setup Local Persistence'}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Form */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Personal Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Avatar Image URL
                </label>
                <input
                  type="url"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Traveler Bio & Exploration Motto
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your travel philosophy..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-slate-800/80">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400">
              Travel Preferences & Currency
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Default Home Currency
                </label>
                <select
                  value={homeCurrency}
                  onChange={(e) => setHomeCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="JPY">JPY (¥ - Japanese Yen)</option>
                  <option value="CAD">CAD ($ - Canadian Dollar)</option>
                  <option value="AUD">AUD ($ - Australian Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Primary Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  {travelStyles.map((style) => (
                    <option key={style} value={style}>{style}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
            {savedSuccess ? (
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Profile updated successfully!
              </span>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loading ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
