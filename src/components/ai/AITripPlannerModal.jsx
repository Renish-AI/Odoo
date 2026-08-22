import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  X,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Check,
  ArrowRight,
  Compass,
  Utensils,
  Palette,
  ShoppingBag,
  Moon,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTrips } from '../../context/TripContext';
import { GLOBAL_DESTINATIONS } from '../../data/destinations';

export const AITripPlannerModal = ({ onClose }) => {
  const { createTrip } = useTrips();
  const navigate = useNavigate();

  // Inputs
  const [startLocation, setStartLocation] = useState('New York, USA');
  const [destination, setDestination] = useState('Tokyo & Kyoto, Japan');
  const [daysCount, setDaysCount] = useState(7);
  const [budget, setBudget] = useState(2800);
  const [travelers, setTravelers] = useState(2);
  const [travelStyle, setTravelStyle] = useState('Balanced'); // Budget | Balanced | Luxury
  const [selectedInterests, setSelectedInterests] = useState(['Food', 'Culture', 'Adventure']);
  
  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);

  const availableInterests = [
    { name: 'Food', icon: Utensils },
    { name: 'Culture', icon: Palette },
    { name: 'Adventure', icon: Compass },
    { name: 'Nature', icon: Sparkles },
    { name: 'Shopping', icon: ShoppingBag },
    { name: 'Nightlife', icon: Moon }
  ];

  const toggleInterest = (name) => {
    if (selectedInterests.includes(name)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== name));
    } else {
      setSelectedInterests([...selectedInterests, name]);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);

    // Simulate multi-tier AI reasoning
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const startDate = new Date().toISOString().split('T')[0];
    const endDate = new Date(Date.now() + 86400000 * daysCount).toISOString().split('T')[0];

    const plan = {
      title: `AI Curated: ${destination} Odyssey`,
      description: `Custom ${daysCount}-day ${travelStyle.toLowerCase()} itinerary focusing on ${selectedInterests.join(', ')} for ${travelers} traveler(s).`,
      startDate,
      endDate,
      totalBudget: Number(budget),
      travelersCount: Number(travelers),
      currency: 'USD',
      tags: [...selectedInterests, travelStyle],
      coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=80',
      stops: [
        {
          cityName: 'Tokyo',
          countryName: 'Japan',
          countryCode: 'JP',
          lat: 35.6762,
          lng: 139.6503,
          arrivalDate: startDate,
          departureDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
          transitMode: 'flight',
          transitDurationMins: 0,
          transitCost: 0,
          coverImage: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80',
          orderIndex: 0
        },
        {
          cityName: 'Kyoto',
          countryName: 'Japan',
          countryCode: 'JP',
          lat: 35.0116,
          lng: 135.7681,
          arrivalDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
          departureDate: endDate,
          transitMode: 'train',
          transitDurationMins: 135,
          transitCost: 110,
          coverImage: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=800&q=80',
          orderIndex: 1
        }
      ],
      activities: [
        {
          dayNumber: 1,
          title: 'Shibuya Sky & Harajuku Vintage Exploration',
          category: 'Sightseeing',
          cost: 25,
          startTime: '10:00',
          endTime: '13:00',
          description: 'Panoramic skyline observation and boutique shopping in Harajuku.'
        },
        {
          dayNumber: 1,
          title: 'Tsukiji Market Omakase Tasting',
          category: 'Food',
          cost: 45,
          startTime: '13:30',
          endTime: '15:30',
          description: 'Fresh sushi, tamagoyaki, and artisanal matcha tasting.'
        },
        {
          dayNumber: 2,
          title: 'teamLab Planets Immersive Digital Exhibition',
          category: 'Culture',
          cost: 38,
          startTime: '10:30',
          endTime: '13:30',
          description: 'Walk through water and mirror floral installations.'
        },
        {
          dayNumber: 4,
          title: 'Fushimi Inari Sunrise Torii Hike & Tea Ceremony',
          category: 'Culture',
          cost: 20,
          startTime: '07:00',
          endTime: '10:30',
          description: 'Early morning vermilion shrine trail and traditional Uji matcha.'
        },
        {
          dayNumber: 5,
          title: 'Arashiyama Bamboo Forest & Sagano Scenic Railway',
          category: 'Nature',
          cost: 15,
          startTime: '09:30',
          endTime: '13:00',
          description: 'Lush green groves followed by riverside steam train ride.'
        }
      ]
    };

    setGeneratedPlan(plan);
    setIsGenerating(false);
  };

  const handleAcceptEntirePlan = async () => {
    if (!generatedPlan) return;

    const newTrip = await createTrip(generatedPlan);
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 }
    });
    onClose();
    navigate(`/trip/${newTrip.id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">AI Multi-City Journey Architect</h3>
              <p className="text-xs text-slate-400">Generate a complete multi-destination itinerary, schedule & budget in seconds</p>
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
        <div className="py-5 overflow-y-auto flex-1 space-y-6">
          {!generatedPlan ? (
            <form onSubmit={handleGenerate} className="space-y-4">
              
              {/* Row 1: Locations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Starting Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={startLocation}
                      onChange={(e) => setStartLocation(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Target Destinations / Region
                  </label>
                  <div className="relative">
                    <Compass className="w-4 h-4 text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g. Tokyo & Kyoto, Italy Grand Tour"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              {/* Row 2: Duration, Budget, Travelers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Trip Duration (Days)
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="2"
                      max="30"
                      value={daysCount}
                      onChange={(e) => setDaysCount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Total Target Budget ($)
                  </label>
                  <div className="relative">
                    <DollarSign className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      min="500"
                      value={budget}
                      onChange={(e) => setBudget(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Travelers Count
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <select
                      value={travelers}
                      onChange={(e) => setTravelers(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      {[1, 2, 3, 4, 5, 6].map((num) => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Solo' : 'Travelers'}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Row 3: Travel Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Travel Style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['Budget', 'Balanced', 'Luxury'].map((style) => (
                    <button
                      key={style}
                      type="button"
                      onClick={() => setTravelStyle(style)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                        travelStyle === style
                          ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {style} {travelStyle === style && '✓'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Interests */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Key Interests
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {availableInterests.map((interest) => {
                    const Icon = interest.icon;
                    const isSelected = selectedInterests.includes(interest.name);
                    return (
                      <button
                        key={interest.name}
                        type="button"
                        onClick={() => toggleInterest(interest.name)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all ${
                          isSelected
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{interest.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-3 border-t border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{isGenerating ? 'AI Architecting Journey...' : 'Generate Full Itinerary'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-5 animate-in fade-in">
              
              {/* Generated Plan Overview */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    ✨ AI Generated Itinerary Preview
                  </span>
                  <span className="text-xs font-bold text-white">${generatedPlan.totalBudget} Total Budget</span>
                </div>
                <h4 className="text-lg font-bold text-white">{generatedPlan.title}</h4>
                <p className="text-xs text-slate-400">{generatedPlan.description}</p>
                <div className="flex flex-wrap gap-2 text-xs text-slate-300 pt-1">
                  <span>📍 {generatedPlan.stops.map((s) => s.cityName).join(' → ')}</span>
                  <span>•</span>
                  <span>🗓️ {daysCount} Days</span>
                  <span>•</span>
                  <span>👥 {travelers} Traveler(s)</span>
                </div>
              </div>

              {/* Generated Activities Stream */}
              <div className="space-y-3">
                <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Curated Day-by-Day Highlights
                </h5>
                <div className="space-y-2">
                  {generatedPlan.activities.map((act, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                          Day {act.dayNumber}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-white">{act.title}</div>
                          <div className="text-[10px] text-slate-400">{act.description}</div>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">${act.cost}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setGeneratedPlan(null)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-white"
                >
                  ← Customize Inputs
                </button>

                <button
                  type="button"
                  onClick={handleAcceptEntirePlan}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-extrabold text-xs shadow-xl shadow-emerald-500/30 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Accept Entire Plan & Launch Trip</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};