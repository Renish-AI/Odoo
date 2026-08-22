import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Globe2, 
  Compass, 
  MapPin, 
  Heart, 
  Sparkles, 
  Plus, 
  User, 
  LogOut, 
  CheckCircle2, 
  ChevronDown,
  Menu,
  X,
  Waves
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTrips } from '../../context/TripContext';
import { AuthModal } from '../common/AuthModal';
import { CreateTripModal } from '../common/CreateTripModal';
import { AITripPlannerModal } from '../ai/AITripPlannerModal';

export const Navbar = () => {
  const { user, logout, isDemoMode, switchDemo } = useAuth();
  const { trips, activeTrip, selectTrip } = useTrips();
  const location = useLocation();
  const navigate = useNavigate();

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAIPlannerModal, setShowAIPlannerModal] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [tripDropdownOpen, setTripDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Explore', path: '/explore', icon: Compass },
    { name: 'My Trips', path: '/trips', icon: MapPin },
    { name: 'Bucket List', path: '/saved', icon: Heart }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-ocean-500/20 bg-slate-950/85 backdrop-blur-xl transition-all shadow-lg shadow-ocean-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo with Ocean Theme */}
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-ocean-500 via-cyan-400 to-teal-400 flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-105 transition-transform">
                  <Waves className="w-6 h-6 text-slate-950 stroke-[2.4]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
                    GLOBE<span className="text-transparent bg-clip-text bg-gradient-to-r from-ocean-400 to-cyan-300">TROTTER</span>
                  </span>
                  <span className="text-[10px] tracking-wider uppercase font-bold text-cyan-400/90 -mt-1">
                    Multi-City Travel
                  </span>
                </div>
              </Link>

              {/* Active Trip Quick Selector */}
              {activeTrip && (
                <div className="hidden lg:flex items-center ml-2 relative">
                  <button
                    onClick={() => setTripDropdownOpen(!tripDropdownOpen)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-ocean-500/30 hover:border-cyan-400/50 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800/60 shadow-sm"
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="truncate max-w-[140px] text-slate-200 font-semibold">{activeTrip.title}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />
                  </button>

                  {tripDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-slate-900 border border-ocean-500/30 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Switch Active Journey
                      </div>
                      {trips.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => {
                            selectTrip(t.id);
                            setTripDropdownOpen(false);
                            navigate(`/trip/${t.id}`);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                            t.id === activeTrip.id
                              ? 'bg-ocean-500/20 text-cyan-300 font-semibold'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="truncate">{t.title}</span>
                          {t.id === activeTrip.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                        </button>
                      ))}
                      <div className="border-t border-slate-800 mt-2 pt-2 px-2">
                        <button
                          onClick={() => {
                            setTripDropdownOpen(false);
                            setShowCreateModal(true);
                          }}
                          className="w-full py-1.5 px-2 rounded-xl bg-ocean-500/10 hover:bg-ocean-500/20 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" /> Plan New Trip
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-cyan-300 bg-ocean-500/15 border border-ocean-500/30 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Bar */}
            <div className="flex items-center gap-2.5">
              
              {/* AI Trip Planner Action Button */}
              <button
                onClick={() => setShowAIPlannerModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-ocean-500/40 hover:border-cyan-400 text-cyan-300 text-xs font-bold shadow-md transition-all hover:scale-105"
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                <span>AI Architect</span>
              </button>

              {/* Plan Trip CTA Button */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 hover:from-ocean-400 hover:to-cyan-300 text-slate-950 text-xs font-extrabold shadow-lg shadow-cyan-500/25 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>New Trip</span>
              </button>

              {/* User Avatar & Dropdown */}
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-full border border-ocean-500/40 hover:border-cyan-400 transition-colors bg-slate-900 shadow-md"
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400/40"
                    />
                  </button>

                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-slate-900 border border-ocean-500/30 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95">
                      <div className="px-3 py-2.5 border-b border-slate-800/80">
                        <div className="font-bold text-sm text-white truncate">{user.fullName}</div>
                        <div className="text-xs text-slate-400 truncate">{user.email}</div>
                        <div className="mt-1 text-[11px] text-cyan-400 font-semibold">
                          {user.travelStyle || 'Balanced Explorer'}
                        </div>
                      </div>

                      <div className="py-1">
                        <Link
                          to="/profile"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <User className="w-3.5 h-3.5 text-cyan-400" />
                          Profile & Travel DNA
                        </Link>
                        <Link
                          to="/saved"
                          onClick={() => setUserDropdownOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                          <Heart className="w-3.5 h-3.5 text-rose-400" />
                          Saved Bucket List
                        </Link>
                      </div>

                      <div className="border-t border-slate-800/80 pt-1.5 mt-1">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                          Switch Demo Traveler
                        </div>
                        <div className="grid grid-cols-2 gap-1 px-1 py-1">
                          <button
                            onClick={() => {
                              switchDemo('nomad');
                              setUserDropdownOpen(false);
                            }}
                            className="text-[11px] py-1 px-2 rounded-lg bg-slate-800 hover:bg-ocean-500/20 hover:text-cyan-300 text-slate-300 transition-colors"
                          >
                            Alex (Nomad)
                          </button>
                          <button
                            onClick={() => {
                              switchDemo('backpacker');
                              setUserDropdownOpen(false);
                            }}
                            className="text-[11px] py-1 px-2 rounded-lg bg-slate-800 hover:bg-ocean-500/20 hover:text-cyan-300 text-slate-300 transition-colors"
                          >
                            Sam (Backpacker)
                          </button>
                        </div>

                        <button
                          onClick={() => {
                            logout();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 transition-colors mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Sign In
                </button>
              )}

              {/* Mobile menu trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-ocean-500/20 bg-slate-950 px-4 pt-2 pb-6 space-y-3">
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-slate-900"
                >
                  <link.icon className="w-4 h-4 text-cyan-400" />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowAIPlannerModal(true);
                }}
                className="py-2.5 rounded-xl bg-slate-900 border border-ocean-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" /> AI Planner
              </button>

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowCreateModal(true);
                }}
                className="py-2.5 rounded-xl bg-gradient-to-r from-ocean-500 to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> New Trip
              </button>
            </div>
          </div>
        )}
      </header>

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
      {showCreateModal && <CreateTripModal onClose={() => setShowCreateModal(false)} />}
      {showAIPlannerModal && <AITripPlannerModal onClose={() => setShowAIPlannerModal(false)} />}
    </>
  );
};