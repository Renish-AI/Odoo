import React from 'react';
import { motion } from 'framer-motion';

export const Skeleton = ({ className = '', style = {} }) => {
  return (
    <motion.div
      initial={{ opacity: 0.5 }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`bg-slate-800/80 rounded-2xl relative overflow-hidden ${className}`}
      style={style}
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </motion.div>
  );
};

export const CardSkeleton = () => (
  <div className="flex flex-col gap-3 p-4 rounded-3xl bg-slate-900 border border-slate-800/60 shadow-lg">
    <Skeleton className="w-full h-40 rounded-xl" />
    <Skeleton className="w-3/4 h-5 mt-2" />
    <Skeleton className="w-1/2 h-4" />
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-800/60">
      <Skeleton className="w-8 h-8 rounded-full" />
      <Skeleton className="w-24 h-4" />
    </div>
  </div>
);

export const ListSkeleton = () => (
  <div className="flex flex-col gap-4">
    {[1, 2, 3].map(i => (
      <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <Skeleton className="w-12 h-12 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-1/4 h-3" />
        </div>
        <Skeleton className="w-16 h-8 rounded-lg" />
      </div>
    ))}
  </div>
);
