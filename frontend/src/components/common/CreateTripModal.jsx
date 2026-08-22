import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Sparkles, 
  Plus, 
  Check, 
  ArrowRight, 
  ArrowLeft,
  Image as ImageIcon 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTrips } from '../../context/TripContext';
import { storageService } from '../../services/storageService';
import { GLOBAL_DESTINATIONS } from '../../data/destinations';

export const CreateTripModal = ({ onClose }) => {
  const { createTrip } = useTrips();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0]
  );
  const [totalBudget, setTotalBudget] = useState('3000');
  const [currency, setCurrency] = useState('USD');
  const [selectedTags, setSelectedTags] = useState(['Adventure', 'Culture']);
  const [selectedStops, setSelectedStops] = useState(['Tokyo', 'Kyoto']);
  const [coverImage, setCoverImage] = useState(
    'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=1600&q=80'
  );

  const availableTags = [
    'Culture',
    'Food & Wine',
    'Adventure',
    'Romantic',
    'Beach & Sun',
    'Road Trip',
    'Budget Friendly',
    'Luxury'
  ];

  const curatedCovers = storageService.getCuratedCoverImages();

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleStopCity = (cityName) => {
    if (selectedStops.includes(cityName)) {
      setSelectedStops(selectedStops.filter((c) => c !== cityName));
    } else {
      setSelectedStops([...selectedStops, cityName]);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Build stops data from selected cities
      const stops = selectedStops.map((cityName, idx) => {
        const dest = GLOBAL_DESTINATIONS.find((d) => d.city === cityName);
        return {
          id: `stop-init-${Date.now()}-${idx}`,
          cityName,
          countryName: dest?.country || '',
          countryCode: dest?.countryCode || 'US',
          lat: dest?.lat || 35.6762,
          lng: dest?.lng || 139.6503,
          arrivalDate: startDate,
          departureDate: endDate,
          orderIndex: idx,
          transitMode: idx === 0 ? 'flight' : 'train',
          transitDurationMins: 120,
          transitCost: 80,
          coverImage: dest?.image || coverImage
        };
      });

      const newTrip = await createTrip({
        title: title || 'My Multi-City Journey',
        description,
        startDate,
        endDate,
        totalBudget: Number(totalBudget) || 2500,
        currency,
        tags: selectedTags,
        coverImage,
        stops,
        activities: [],
        expenses: []
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onClose();
      navigate(`/trip/${newTrip.id}`);
    } catch (err) {
      console.error('Error creating trip:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/20">
              {step}/3
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Multi-City Trip</h3>
              <p className="text-xs text-slate-400">
                {step === 1 && 'Step 1: Journey Basics & Trip Style'}
                {step === 2 && 'Step 2: Dates, Budget & Destinations'}
                {step === 3 && 'Step 3: Cover Visual & Finish'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="py-5 overflow-y-auto flex-1 space-y-5">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Trip Name / Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Grand Autumn Tour of Japan & Korea"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Trip Description / Travel Vibe
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your travel dreams, companions, or key highlights..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Trip Style Tags
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {tag} {isSelected && '✓'}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Estimated Budget
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      value={totalBudget}
                      onChange={(e) => setTotalBudget(e.target.value)}
                      placeholder="3000"
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="JPY">JPY (¥)</option>
                    <option value="CAD">CAD ($)</option>
                    <option value="AUD">AUD ($)</option>
                    <option value="INR">INR (₹)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Select Initial City Stops (You can add or reorder more later)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {GLOBAL_DESTINATIONS.slice(0, 6).map((dest) => {
                    const isSelected = selectedStops.includes(dest.city);
                    return (
                      <button
                        key={dest.city}
                        type="button"
                        onClick={() => toggleStopCity(dest.city)}
                        className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-500/15 border-emerald-500/60 text-white'
                            : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <img
                          src={dest.image}
                          alt={dest.city}
                          className="w-7 h-7 rounded-lg object-cover"
                        />
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-200">{dest.city}</div>
                          <div className="text-[10px] text-slate-500">{dest.country}</div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 ml-auto" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose Journey Cover Visual
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {curatedCovers.map((img, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCoverImage(img)}
                      className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group ${
                        coverImage === img
                          ? 'border-emerald-400 ring-2 ring-emerald-400/30'
                          : 'border-transparent hover:opacity-90'
                      }`}
                    >
                      <img src={img} alt="cover option" className="w-full h-full object-cover" />
                      {coverImage === img && (
                        <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                          <Check className="w-5 h-5 text-emerald-400 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Card */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Journey Summary Preview
                </div>
                <div className="text-base font-bold text-white">{title || 'Untitled Journey'}</div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span>📅 {startDate} to {endDate}</span>
                  <span>💰 {currency} {Number(totalBudget).toLocaleString()}</span>
                  <span>📍 {selectedStops.join(' → ')}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              disabled={step === 1 && !title.trim()}
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {loading ? 'Creating Trip...' : 'Launch Journey!'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
