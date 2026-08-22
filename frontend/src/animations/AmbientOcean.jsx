import React from 'react';
import { motion } from 'framer-motion';

export const AmbientOcean = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      {/* Wave Gradients */}
      <motion.div
        animate={{
          x: ['-5%', '5%', '-5%'],
          y: ['-5%', '5%', '-5%'],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-1/4 -right-1/4 w-[150%] h-[150%] bg-gradient-to-br from-teal-900/10 via-cyan-900/5 to-slate-950/20 rounded-[100%] blur-[120px] opacity-70"
      />
      <motion.div
        animate={{
          x: ['5%', '-5%', '5%'],
          y: ['5%', '-5%', '5%'],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute -bottom-1/4 -left-1/4 w-[150%] h-[150%] bg-gradient-to-tr from-emerald-900/10 via-slate-900/5 to-slate-950/20 rounded-[100%] blur-[100px] opacity-60"
      />
      
      {/* Floating Bubbles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: ['100vh', '-10vh'],
            x: [Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.5, 0.5]
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: 'linear'
          }}
          className="absolute w-4 h-4 bg-teal-500/20 rounded-full blur-[2px]"
          style={{ left: `${Math.random() * 100}%` }}
        />
      ))}
    </div>
  );
};
