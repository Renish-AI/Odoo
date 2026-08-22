import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Map, Calendar, DollarSign, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const MobileNav = () => {
  const navItems = [
    { id: 'discover', icon: <Compass className="w-6 h-6" />, label: 'Discover', to: '/explore' },
    { id: 'trips', icon: <Map className="w-6 h-6" />, label: 'Trips', to: '/dashboard' },
    { id: 'calendar', icon: <Calendar className="w-6 h-6" />, label: 'Calendar', to: '/calendar' },
    { id: 'budget', icon: <DollarSign className="w-6 h-6" />, label: 'Budget', to: '/budget' },
    { id: 'profile', icon: <User className="w-6 h-6" />, label: 'Profile', to: '/profile' }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map(item => (
          <NavLink
            key={item.id}
            to={item.to}
            className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-1 relative transition-colors ${
              isActive ? 'text-teal-400' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-nav-indicator"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-1 rounded-b-full bg-teal-500 shadow-[0_2px_8px_rgba(20,184,166,0.5)]"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
