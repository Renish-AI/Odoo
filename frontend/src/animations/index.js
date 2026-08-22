export const transitionSettings = {
  type: "tween",
  ease: [0.22, 1, 0.36, 1],
  duration: 0.35, // SMOOTH default duration
};

export const pageTransitionVariants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitionSettings,
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      ...transitionSettings,
      duration: 0.25, // slightly faster on exit
    },
  },
};

// Reusable Presets
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: transitionSettings },
  exit: { opacity: 0, transition: transitionSettings },
};

export const slideUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: transitionSettings },
  exit: { opacity: 0, y: -20, transition: transitionSettings },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: transitionSettings },
  exit: { opacity: 0, scale: 0.95, transition: transitionSettings },
};
