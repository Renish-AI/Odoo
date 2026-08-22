import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, MapPin, Compass, DollarSign, Calendar, AlertCircle, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cityService } from '../../services/cityService';

export const CitySearch = ({ onSearch, placeholder = 'Search cities, countries, tags...' }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [matchingDestinations, setMatchingDestinations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 1. Debounce query input (200ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);

    return () => clearTimeout(handler);
  }, [query]);

  // 2. Fetch/generate suggestions on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setMatchingDestinations([]);
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const loadSuggestions = async () => {
      setLoading(true);
      try {
        const matches = await cityService.searchCities(debouncedQuery);
        setMatchingDestinations(matches.slice(0, 4));

        if (matches.length > 0) {
          const mainMatch = matches[0];
          const city = mainMatch.city;
          const country = mainMatch.country;
          const cost = mainMatch.avgDailyBudget || 120;

          // Find another city for combo recommendations
          let neighborCity = 'Rome';
          if (country === 'Japan') neighborCity = 'Kyoto';
          if (country === 'France') neighborCity = 'Barcelona';
          if (country === 'India') neighborCity = 'Jaipur';
          if (city === 'Rome') neighborCity = 'Barcelona';

          const budgetUSD = cost * 5;

          const generated = [
            {
              type: 'exact',
              label: `${city}, ${country}`,
              sublabel: `Top Destination in ${mainMatch.region}`,
              icon: MapPin,
              searchText: city
            },
            {
              type: 'combo',
              label: `${city} + ${neighborCity} Grand Route`,
              sublabel: 'Popular Multi-City Itinerary',
              icon: Sparkles,
              searchText: `${city}`
            },
            {
              type: 'duration',
              label: `${city} 5-Day Highlights Tour`,
              sublabel: 'Optimized Day-by-Day Pace',
              icon: Calendar,
              searchText: city
            },
            {
              type: 'budget',
              label: `${city} under $${budgetUSD}/week`,
              sublabel: `Avg ~$${cost}/day`,
              icon: DollarSign,
              searchText: city
            }
          ];
          setSuggestions(generated);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error('Error generating suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [debouncedQuery]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectSuggestion = (searchText) => {
    setQuery(searchText);
    setIsOpen(false);
    onSearch(searchText);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onSearch('');
    } else {
      onSearch(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    onSearch(query);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative w-full">
        <Search className="w-4 h-4 text-cyan-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-slate-950/80 border-2 border-slate-800 focus:border-cyan-400 rounded-2xl pl-11 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-cyan-400 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
        )}
      </form>

      {/* Suggestions Dropdown Modal */}
      <AnimatePresence>
        {isOpen && query.trim().length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 z-[500] bg-slate-900 border border-ocean-500/30 rounded-2xl shadow-2xl overflow-hidden p-2 space-y-2 max-h-96 overflow-y-auto"
          >
            {/* Matching Direct Cities Cards */}
            {matchingDestinations.length > 0 && (
              <div className="space-y-1 pb-2 border-b border-slate-800">
                <div className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider px-2 pt-1">
                  Destination Matches
                </div>
                {matchingDestinations.map((dest) => (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleSelectSuggestion(dest.city)}
                    className="w-full text-left p-2 hover:bg-slate-950/80 rounded-xl flex items-center justify-between gap-3 group transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={dest.image}
                        alt={dest.city}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-800"
                      />
                      <div className="truncate">
                        <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {dest.city}, {dest.country}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                          <span className="text-amber-400 flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-amber-400" /> {dest.rating}
                          </span>
                          <span>•</span>
                          <span>${dest.avgDailyBudget}/day</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-ocean-500/10 text-cyan-300 border border-ocean-500/20 shrink-0">
                      Select
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Smart Intent Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2">
                  Smart Recommendations
                </div>
                {suggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectSuggestion(item.searchText)}
                      className="w-full text-left p-2.5 hover:bg-slate-950/80 rounded-xl flex items-center gap-3 group transition-all"
                    >
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 group-hover:border-cyan-400/40 text-slate-400 group-hover:text-cyan-300 transition-colors">
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors block">
                          {item.label}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {item.sublabel}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Empty State */}
            {!loading && matchingDestinations.length === 0 && suggestions.length === 0 && (
              <div className="p-4 text-center space-y-1">
                <AlertCircle className="w-5 h-5 text-slate-600 mx-auto" />
                <span className="text-xs font-bold text-slate-400 block">No cities found</span>
                <p className="text-[10px] text-slate-500 max-w-[200px] mx-auto">
                  Try searching for destinations like "Paris", "Tokyo", "Rome", "Bali", or "Goa".
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};