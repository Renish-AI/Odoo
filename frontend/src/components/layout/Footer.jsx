import React from 'react';
import { Link } from 'react-router-dom';
import { Globe2, Compass, ShieldCheck, Heart, Sparkles, MapPin, Share2 } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/60 bg-slate-950/60 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                <Globe2 className="w-5 h-5 text-slate-950 stroke-[2.2]" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">
                GLOBE<span className="text-emerald-400">TROTTER</span>
              </span>
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              The intelligent multi-city travel planning platform designed to transform complex journeys into interactive, visual adventures.
            </p>
            <div className="text-xs text-emerald-400 font-medium">
              "Your Journey, Visualized"
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/explore" className="hover:text-emerald-400 transition-colors">Destination Explorer</Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-emerald-400 transition-colors">Multi-City Itinerary Builder</Link>
              </li>
              <li>
                <Link to="/saved" className="hover:text-emerald-400 transition-colors">Saved Travel Bucket List</Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Features</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" /> AI Pacing & Travel Health Check
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Compass className="w-3.5 h-3.5 text-cyan-400" /> Drag & Drop Stop Reordering
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <Share2 className="w-3.5 h-3.5 text-amber-400" /> Social Travel Stories & 1-Click Fork
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">Powered By</h4>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Supabase PostgreSQL & RLS
              </div>
              <p className="text-[11px] text-slate-400">
                Enterprise-grade security, live synchronization, and lightning-fast client reactivity.
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} GlobeTrotter Inc. Crafted for wanderers worldwide.
          </div>
          <div className="flex items-center gap-4">
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-300 transition-colors cursor-pointer">Terms of Service</span>
            <span className="text-emerald-400 font-medium">v1.0.0 Production</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
