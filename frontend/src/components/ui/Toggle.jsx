import React from 'react';
import { motion } from 'framer-motion';

export const Toggle = ({ enabled, onChange, icon }) => {
  return (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-950 ${
        enabled ? 'bg-teal-500' : 'bg-slate-700'
      }`}
    >
      <span className="sr-only">Use setting</span>
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 700, damping: 30 }}
        className={`pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-300 ease-in-out flex items-center justify-center ${
          enabled ? 'translate-x-2.5' : '-translate-x-2.5'
        }`}
      >
        <AnimateIcon isVisible={enabled} icon={icon} />
      </motion.span>
    </button>
  );
};

const AnimateIcon = ({ isVisible, icon }) => {
  if (!icon) return null;
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.5 }}
      transition={{ duration: 0.2 }}
      className="absolute text-teal-600 w-3 h-3 flex items-center justify-center"
    >
      {icon}
    </motion.span>
  );
};
