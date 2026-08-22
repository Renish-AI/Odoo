import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Bot, User, Minimize2 } from 'lucide-react';
import { aiService } from '../../services/aiService';

// ── Typing Dots ──────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1.5 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <motion.span
        key={i}
        className="w-2 h-2 rounded-full bg-emerald-400"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15, ease: 'easeInOut' }}
      />
    ))}
  </div>
);

// ── Message Bubble ───────────────────────────────────────────
const Bubble = ({ msg }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className={`flex items-end gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
  >
    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
      msg.sender === 'user'
        ? 'bg-emerald-500 text-slate-950'
        : 'bg-slate-800 text-emerald-400 border border-slate-700'
    }`}>
      {msg.sender === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
    </div>

    <div className="max-w-[78%] space-y-1.5">
      <div className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed whitespace-pre-line ${
        msg.sender === 'user'
          ? 'bg-emerald-500 text-slate-950 font-medium rounded-br-none'
          : 'bg-slate-800 text-slate-200 border border-slate-700/60 rounded-bl-none'
      }`}>
        {msg.text}
      </div>

      {/* Quick reply chips */}
      {msg.suggestions && msg.suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {msg.suggestions.slice(0, 3).map((s, i) => (
            <span key={i} className="text-[10px] text-slate-400 bg-slate-700/60 border border-slate-700 px-2 py-0.5 rounded-full">
              {s}
            </span>
          ))}
        </div>
      )}
    </div>
  </motion.div>
);

// ── Copilot Panel ────────────────────────────────────────────
const CopilotPanel = ({ trip, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 'init',
      sender: 'ai',
      text: `Hi! I'm your GlobeTrotter Copilot ✨\n\nI've analyzed "${trip?.title || 'your trip'}". Ask me anything — budget tips, daily plans, activity ideas, or savings strategies.`,
      suggestions: ['Which day is most expensive?', 'Suggest cheaper activities', 'Plan 3 days in Paris under ₹30,000']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (text) => {
    const query = (text || inputQuery).trim();
    if (!query || loading) return;

    setMessages((prev) => [...prev, { id: 'u-' + Date.now(), sender: 'user', text: query }]);
    setInputQuery('');
    setLoading(true);

    try {
      const response = await aiService.askTravelAssistant(query, trip);
      setMessages((prev) => [...prev, {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: response.reply,
        suggestions: response.suggestions
      }]);
    } catch {
      setMessages((prev) => [...prev, {
        id: 'err-' + Date.now(),
        sender: 'ai',
        text: 'I had trouble processing that. Please try again.'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const examplePrompts = [
    'Plan 3 days in Paris under ₹30,000',
    'Which day is most expensive?',
    'Suggest cheaper activities',
    'Can I reduce my budget?'
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
      style={{ maxHeight: '70vh' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950">
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              GlobeTrotter Copilot ✨
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[9px] text-slate-400">AI-powered travel assistant</div>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
          <Minimize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {messages.map((msg) => <Bubble key={msg.id} msg={msg} />)}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-800 text-emerald-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-3 h-3" />
            </div>
            <div className="bg-slate-800 border border-slate-700/60 rounded-2xl rounded-bl-none">
              <TypingDots />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Example prompts — show only when fresh */}
      {messages.length === 1 && (
        <div className="px-3 pb-2 flex flex-wrap gap-1.5">
          {examplePrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="text-[10px] text-slate-300 bg-slate-800/80 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700 px-2.5 py-1 rounded-full transition-colors text-left"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/60">
        <form
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="Ask me anything about your trip..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors disabled:opacity-30"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </motion.div>
  );
};

// ── Floating FAB + Panel ─────────────────────────────────────
export const TravelCopilot = ({ trip }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl shadow-emerald-500/30 flex items-center justify-center text-slate-950 border-2 border-emerald-400/30"
        title="GlobeTrotter Copilot"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="w-5 h-5" />
            </motion.span>
          ) : (
            <motion.span key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <Sparkles className="w-5 h-5 stroke-[2.5]" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Label badge */}
      {!open && (
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          className="fixed bottom-[72px] right-4 sm:right-6 z-50 pointer-events-none"
        >
          <span className="text-[9px] font-bold text-emerald-400 bg-slate-900 border border-emerald-500/30 px-2 py-0.5 rounded-full shadow">
            Copilot
          </span>
        </motion.div>
      )}

      {/* Chat panel */}
      <AnimatePresence>
        {open && <CopilotPanel trip={trip} onClose={() => setOpen(false)} />}
      </AnimatePresence>
    </>
  );
};
