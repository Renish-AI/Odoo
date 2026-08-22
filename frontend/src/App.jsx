import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TripWorkspacePage } from './pages/TripWorkspacePage';
import { PublicStoryView } from './components/share/PublicStoryView';
import { ExplorePage } from './pages/ExplorePage';
import { SavedDestinationsPage } from './pages/SavedDestinationsPage';
import { ProfilePage } from './pages/ProfilePage';
import PageTransition from './layouts/PageTransition';

export const App = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-background text-navyText">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
            <Route path="/trips" element={<PageTransition><DashboardPage /></PageTransition>} />
            <Route path="/trip/:id" element={<PageTransition><TripWorkspacePage /></PageTransition>} />
            <Route path="/trip/share/:slug" element={<PageTransition><PublicStoryView /></PageTransition>} />
            <Route path="/explore" element={<PageTransition><ExplorePage /></PageTransition>} />
            <Route path="/saved" element={<PageTransition><SavedDestinationsPage /></PageTransition>} />
            <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};
