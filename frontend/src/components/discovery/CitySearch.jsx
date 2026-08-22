import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2, Sparkles, MapPin, Compass, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cityService } from '../../services/cityService';

export const CitySearch = ({ onSearch, placeholder = 'Where do you want to go?' }) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // 1. Debounce query input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [query]);

  // 2. Fetch/generate suggestions on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    const loadSuggestions = async () => {
      setLoading(true);
      try {
        // Query cities matching text
        const matches = await cityService.searchCities(debouncedQuery);
        
        if (matches.length > 0) {
          const mainMatch = matches[0];
          const city = mainMatch.city;
          const country = mainMatch.country;
          const cost = mainMatch.avgDailyBudget || 120;

          // Generate the 4 specific suggestion options requested:
          // 1. Paris, France
          // 2. Paris + Rome (Combo)
          // 3. Paris for 5 days (Duration)
          // 4. Paris under ₹50,000 (Budget constraint)
          
          // Find another city in same region/country for combo recommendation
          let neighborCity = 'Rome';
          if (country === 'Japan') neighborCity = 'Kyoto';
          if (country === 'India') neighborCity = 'Jaipur';
          if (city === 'Rome') neighborCity = 'Barcelona';

          const budgetINR = cost * 5 * 85; // Est 5 days budget in INR

          const generated = [
            {
              type: 'exact',
              label: `${city}, ${country}`,
              icon: MapPin,
              searchText: city
            },
            {
              type: 'combo',
              label: `${city} + ${neighborCity}`,
              icon: Sparkles,
              searchText: `${city} ${neighborCity}`
            },
            {
              type: 'duration',
              label: `${city} for 5 days`,
              icon: Calendar,
              searchText: city
            },
            {
              type: 'budget',
              label: `${city} under ₹${budgetINR.toLocaleString(undefined, { maximumFractionDigits: 0 })}`,
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

  const handleSelectSuggestion = (suggestion) => {
    setQuery(suggestion.label);
    setIsOpen(false);
    onSearch(suggestion.searchText);
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setIsOpen(true);
    if (!e.target.value) {
      onSearch('');
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
        <Search className="w-4 h-4 text-slate-500 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full bg-slate-950/80 border-2 border-slate-800 focus:border-emerald-500 rounded-2xl pl-11 pr-10 py-3 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors shadow-inner"
        />
        {loading && (
          <Loader2 className="w-4 h-4 text-emerald-400 absolute right-4 top-1/2 -translate-y-1/2 animate-spin" />
        )}
      </form>

      {/* Suggestions Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (query.trim().length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 z-[500] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-2"
          >
            {/* Loading Skeletons */}
            {loading && suggestions.length === 0 && (
              <div className="p-3 space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="flex items-center gap-3 animate-pulse">
                    <div className="w-7 h-7 rounded-lg bg-slate-850" />
                    <div className="h-3 bg-slate-850 rounded w-2/3" />
                  </div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {!loading && suggestions.length === 0 && (
              <div className="p-4 text-center space-y-1">
                <AlertCircle className="w-5 h-5 text-slate-650 mx-auto" />
                <span className="text-[11px] font-bold text-slate-400 block">No suggestions found</span>
                <p className="text-[10px] text-slate-550 max-w-[200px] mx-auto">
                  Try searching for destinations like "Paris", "Tokyo", or "Jaipur".
                </p>
              </div>
            )}

            {/* Suggestions List */}
            {suggestions.length > 0 && (
              <ul className="space-y-1">
                {suggestions.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <li key={idx}>
                      <button
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full text-left p-3 hover:bg-slate-950/60 rounded-xl flex items-center gap-3 group transition-all"
                      >
                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-850 group-hover:border-emerald-500/20 text-slate-500 group-hover:text-emerald-450 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                          {item.label}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
