import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TripWorkspacePage } from './pages/TripWorkspacePage';
import { PublicStoryView } from './components/share/PublicStoryView';
import { ExplorePage } from './pages/ExplorePage';
import { SavedDestinationsPage } from './pages/SavedDestinationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AIFloatingCopilot } from './components/ai/AIFloatingCopilot';

export const App = () => {
  return (
    <div className="flex flex-col min-h-screen text-slate-100 selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Layer (Fixed) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-slate-950" />
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50"
          style={{ backgroundImage: 'url("/background.jpg")' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-950/80" />
      </div>
      
      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/trips" element={<DashboardPage />} />
          <Route path="/trip/:id" element={<TripWorkspacePage />} />
          <Route path="/trip/share/:slug" element={<PublicStoryView />} />
          <Route path="/explore" element={<ExplorePage />} />
          <Route path="/saved" element={<SavedDestinationsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/admin" element={<AdminDashboardPage />} />
        </Routes>
      </main>
      <Footer />
      
      {/* Floating Global AI Travel Copilot */}
      <AIFloatingCopilot />
      </div>
    </div>
  );
};
export default App;