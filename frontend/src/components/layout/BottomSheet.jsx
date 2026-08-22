import React, { useEffect } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';

export const BottomSheet = ({ isOpen, onClose, title, children }) => {
  const dragControls = useDragControls();

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[200] bg-slate-950/70 backdrop-blur-sm md:hidden"
          />
          <motion.div
            drag="y"
            dragControls={dragControls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[201] bg-slate-900 border-t border-slate-800 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] max-h-[85vh] flex flex-col md:hidden overflow-hidden"
          >
            {/* Drag Handle */}
            <div 
              className="w-full flex justify-center py-4 cursor-grab active:cursor-grabbing shrink-0"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-12 h-1.5 rounded-full bg-slate-700" />
            </div>

            {title && (
              <div className="px-6 pb-4 border-b border-slate-800 shrink-0">
                <h2 className="text-xl font-bold text-white text-center">{title}</h2>
              </div>
            )}

            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
