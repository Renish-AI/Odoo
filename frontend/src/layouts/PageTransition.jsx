import React from 'react';
import { motion } from 'framer-motion';
import { pageTransitionVariants } from '../animations';

const PageTransition = ({ children, className = '' }) => {
  return (
    <motion.div
      variants={pageTransitionVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
