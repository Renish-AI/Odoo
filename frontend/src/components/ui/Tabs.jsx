import React from 'react';
import { motion } from 'framer-motion';

export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex bg-slate-900 rounded-lg p-1 relative">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors z-10 ${
            activeTab === tab.id ? 'text-teal-400' : 'text-slate-400 hover:text-white'
          }`}
        >
          {activeTab === tab.id && (
            <motion.div
              layoutId="active-tab-indicator"
              className="absolute inset-0 bg-slate-800 rounded-md -z-10"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          {tab.label}
        </button>
      ))}
    </div>
  );
};
