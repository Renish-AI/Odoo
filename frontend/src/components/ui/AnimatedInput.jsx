import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';

export const AnimatedInput = ({ label, error, success, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(props.value || props.defaultValue));

  const handleBlur = (e) => {
    setIsFocused(false);
    setHasValue(Boolean(e.target.value));
    if (props.onBlur) props.onBlur(e);
  };

  const isFloating = isFocused || hasValue;

  return (
    <div className="relative w-full">
      <motion.div
        animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="relative"
      >
        <input
          {...props}
          onFocus={(e) => {
            setIsFocused(true);
            if (props.onFocus) props.onFocus(e);
          }}
          onBlur={handleBlur}
          className={`peer w-full bg-slate-900/50 text-white rounded-xl px-4 pb-2 pt-6 border-2 outline-none transition-all duration-300 ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : success
              ? 'border-emerald-500 focus:border-emerald-500'
              : 'border-slate-800 focus:border-teal-500 focus:shadow-[0_0_15px_rgba(20,184,166,0.3)]'
          }`}
        />

        {/* Floating Label */}
        <label
          className={`absolute left-4 transition-all duration-300 pointer-events-none ${
            isFloating
              ? 'top-2 text-xs font-semibold'
              : 'top-1/2 -translate-y-1/2 text-sm'
          } ${
            error
              ? 'text-rose-400'
              : success
              ? 'text-emerald-400'
              : isFocused
              ? 'text-teal-400'
              : 'text-slate-400'
          }`}
        >
          {label}
        </label>

        {/* Status Icons */}
        <AnimatePresence>
          {success && !error && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500"
            >
              <CheckCircle className="w-5 h-5" />
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-rose-500"
            >
              <AlertCircle className="w-5 h-5" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-rose-400 text-xs mt-1.5 ml-1 absolute"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
