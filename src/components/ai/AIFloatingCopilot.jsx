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
  Check,
  ChevronDown,
  Minimize2
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { useTrips } from '../../context/TripContext';

export const AIFloatingCopilot = () => {
  const { activeTrip, addActivity } = useTrips();
  const [isOpen, setIsOpen] = useState(false);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [addedActivityIds, setAddedActivityIds] = useState([]);

  const [messages, setMessages] = useState([
    {
      id: 'msg-init',
      sender: 'ai',
      text: `Hello traveler! I am **GlobeTrotter Copilot ✨**.\n\nI can help plan day itineraries, optimize your budget pacing, suggest hidden restaurants, or balance your schedule.`,
      suggestions: [
        'Plan 3 days in Paris under $500',
        'Which day is most expensive?',
        'Suggest cheaper activities to save $150',
        'Find authentic local street food spots'
      ]
    }
  ]);

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
      const response = await aiService.askTravelAssistant(textToSend, activeTrip);
      const aiMsg = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.reply,
        suggestions: response.suggestions,
        generatedActivities: response.generatedActivities
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Copilot error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInsertActivity = async (act, idx) => {
    if (!activeTrip) return;
    const firstStop = activeTrip.stops?.[0];
    if (!firstStop) return;

    await addActivity(activeTrip.id, firstStop.id, {
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
    <>
      {/* Floating Trigger Button (Bottom-Right) */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 text-slate-950 font-extrabold text-xs shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all group animate-bounce duration-1000"
        >
          <Sparkles className="w-4 h-4 stroke-[2.5] group-hover:rotate-12 transition-transform" />
          <span>GlobeTrotter Copilot ✨</span>
        </button>
      )}

      {/* Floating Chat Panel (Slide Up Animation) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] sm:w-[420px] max-h-[600px] h-[550px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md">
                <Sparkles className="w-4 h-4 stroke-[2.5]" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                  GlobeTrotter Copilot ✨
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </h4>
                <p className="text-[10px] text-slate-400">Contextual AI Travel Concierge</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    msg.sender === 'user'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-emerald-400 border border-slate-700'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>

                <div className="space-y-2 max-w-[85%]">
                  <div
                    className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-emerald-500 text-slate-950 font-medium rounded-tr-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-line'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Actionable AI Activities */}
                  {msg.generatedActivities && msg.generatedActivities.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                        ✨ Actionable Recommendations
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
                              disabled={isAdded || !activeTrip}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 transition-colors ${
                                isAdded
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                              }`}
                            >
                              {isAdded ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                              <span>{isAdded ? 'Added' : 'Add to Trip'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {msg.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(s)}
                          className="text-[10px] px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 text-slate-300 border border-slate-700/60 transition-colors text-left"
                        >
                          💡 {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* 3-Dot Typing Animation while generating (Section 48 requirement) */}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-1 pl-2">
                <div className="w-7 h-7 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
          </div>

          {/* Footer Input */}
          <div className="p-3 bg-slate-950/80 border-t border-slate-800">
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
                placeholder="Ask Copilot (e.g. Plan 3 days in Tokyo under $400)..."
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
      )}
    </>
  );
};