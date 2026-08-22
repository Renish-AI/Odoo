import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  Plus,
  Compass,
  Zap,
  Check
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useTrips } from '../../context/TripContext';

export const AIAssistantDrawer = ({ trip, isOpen, onClose }) => {
  const { addActivity } = useTrips();
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello! I am your **GlobeTrotter AI Concierge**. I have analyzed **${trip?.title || 'your trip'}**. How can I help you refine your journey today?`,
      suggestions: [
        'Suggest 3 hidden gems for this trip',
        'How can I save $300 on this budget?',
        'Plan an optimized full-day itinerary',
        'Recommend top authentic local dishes'
      ]
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedActivityIds, setAddedActivityIds] = useState([]);

  if (!isOpen) return null;

  const handleSendMessage = async (queryText) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: textToSend
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await aiService.askTravelAssistant(textToSend, trip);
      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.reply,
        suggestions: response.suggestions,
        generatedActivities: response.generatedActivities
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('AI assistant error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertActivity = async (act, idx) => {
    const firstStop = trip?.stops?.[0];
    if (!firstStop) return;

    await addActivity(trip.id, firstStop.id, {
      dayNumber: 1,
      title: act.title,
      description: act.description,
      category: act.category || 'Culture',
      cost: act.cost || 0,
      startTime: '11:00',
      endTime: '13:30',
      locationName: firstStop.cityName,
      status: 'planned'
    });

    setAddedActivityIds((prev) => [...prev, `${act.title}-${idx}`]);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              GlobeTrotter AI Concierge
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h3>
            <p className="text-[10px] text-slate-400">Intelligent Journey Co-Pilot</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-slate-800 text-emerald-400 border border-slate-700'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div className={`space-y-2 max-w-[85%]`}>
              <div
                className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.text}
              </div>

              {/* Generated Actionable Activities from AI */}
              {msg.generatedActivities && msg.generatedActivities.length > 0 && (
                <div className="space-y-2 pt-1">
                  <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    ✨ AI Suggested Experiences
                  </div>
                  {msg.generatedActivities.map((act, idx) => {
                    const isAdded = addedActivityIds.includes(`${act.title}-${idx}`);
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-white truncate">{act.title}</div>
                          <div className="text-[10px] text-slate-400 truncate">{act.description}</div>
                        </div>

                        <button
                          onClick={() => handleInsertActivity(act, idx)}
                          disabled={isAdded}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shrink-0 transition-colors ${
                            isAdded
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                          }`}
                        >
                          {isAdded ? (
                            <>
                              <Check className="w-3 h-3" /> Added
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" /> Add
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Prompt Suggestions */}
              {msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {msg.suggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(s)}
                      className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700/60 transition-colors text-left"
                    >
                      💡 {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-400 italic py-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>AI Concierge is reasoning...</span>
          </div>
        )}
      </div>

      {/* Drawer Input Form */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/80">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask AI Concierge anything about this trip..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3.5 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="absolute right-2 p-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
