# 🌍 GlobeTrotter – Intelligent Multi-City Travel Planning Platform

**GlobeTrotter** is a modern, responsive travel planning web application that transforms travel logistics into an interactive visual experience: **"Your Journey, Visualized"**.

---

## 🚀 Core Product Capabilities

1. **Multi-City Route Builder**:
   - Visual connector linking stops with transit duration and estimated cost.
   - Smooth drag-and-drop reordering of destinations using `@dnd-kit`.
2. **Day-by-Day Itinerary Planner**:
   - Time-slotted activity blocks categorized by theme (*Sightseeing, Food & Dining, Adventure, Culture, Relax, Nightlife*).
   - Drag-and-drop ordering within daily schedules.
   - 1-click import from curated destination attractions or custom creation.
3. **Smart Budget & Expense Engine**:
   - Real-time comparison of planned budgets vs actual spend.
   - Category breakdowns with interactive **Recharts** donut and bar visualizations.
   - Expense ledger with category filters and payment method tagging.
4. **Trip Health & AI Travel Assistant**:
   - Pacing health rating (0-100) evaluating stop durations, schedule density, and budget sustainability.
   - AI concierge chat generating hidden gem recommendations and 1-click schedule insertions.
5. **Interactive Timeline / Calendar View**:
   - Full chronological Gantt & timeline view of stops and scheduled activities across trip dates.
6. **Destination Explorer & Bucket List**:
   - Search global cities with ratings, average daily budgets, best visiting seasons, and top attractions.
   - Wishlist toggle to save bucket list destinations.
7. **Social Sharing & 1-Click Forking**:
   - Public travel stories accessible via custom share slugs.
   - **"Copy / Fork Trip"** functionality allowing any visitor to clone the complete multi-city itinerary into their account.
8. **Supabase-First Architecture**:
   - Full PostgreSQL database schema with Row Level Security (`supabase/schema.sql`).
   - Clean reusable service layer (`src/services/`).
   - Seamless dual-mode: connects to live Supabase backend or runs in zero-friction interactive demo mode.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v7, Lucide Icons, Recharts, `@dnd-kit/core`, `@dnd-kit/sortable`, Framer Motion, Canvas Confetti.
- **Backend / Database**: Supabase PostgreSQL (`@supabase/supabase-js`) with Row Level Security (RLS) policies.
- **Service Layer Architecture**:
  - `src/lib/supabase.js`: Single client initialization.
  - `src/services/authService.js`: Supabase Auth & Demo profile switcher.
  - `src/services/tripService.js`: Multi-city trip CRUD and forking.
  - `src/services/cityService.js`: Destination discovery and highlights.
  - `src/services/activityService.js`: Itinerary activity management.
  - `src/services/itineraryService.js`: Multi-city stops & transit calculations.
  - `src/services/budgetService.js`: Budget analytics & expense tracking.
  - `src/services/aiService.js`: Travel assistant & trip pacing health diagnostics.
  - `src/services/sharingService.js`: Public story retrieval & 1-click cloning.
  - `src/services/profileService.js`: User profiles & saved bucket list.
  - `src/services/storageService.js`: Image uploads and preset photo library.

---

## ⚡ Quick Start Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```
> *Note: If no Supabase credentials are provided, GlobeTrotter automatically runs in rich Interactive Demo Mode with preloaded European and Asian itineraries, full CRUD, drag-and-drop, and AI assistant.*

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4. Setup Supabase Database (For Live Supabase Backend)
1. In your Supabase project dashboard, navigate to the **SQL Editor**.
2. Copy and paste the contents of `supabase/schema.sql` and click **Run**.
3. All tables (`profiles`, `trips`, `trip_stops`, `activities`, `expenses`, `saved_destinations`), RLS policies, and triggers will be created.

---

## 📁 Project Directory Structure

```
├── supabase/
│   └── schema.sql             # PostgreSQL schema, triggers & RLS policies
├── src/
│   ├── components/
│   │   ├── budget/            # Recharts donut & bar analytics + expense ledger
│   │   ├── calendar/          # Gantt & chronological timeline view
│   │   ├── common/            # Auth modal & Create trip multi-step wizard
│   │   ├── discovery/         # Global destination explorer
│   │   ├── health/            # AI health diagnostics & AI concierge chat
│   │   ├── itinerary/         # DnD-kit route visualizer & day planner
│   │   ├── layout/            # Navbar & modern footer
│   │   └── share/             # Public travel story & forking view
│   ├── context/
│   │   ├── AuthContext.jsx    # Authentication & demo mode state
│   │   └── TripContext.jsx    # Active trip, stops, and activities reactivity
│   ├── data/
│   │   └── destinations.js    # Seed global destinations and preset trips
│   ├── lib/
│   │   └── supabase.js        # Supabase client singleton
│   ├── pages/
│   │   ├── DashboardPage.jsx  # Trip management dashboard
│   │   ├── ExplorePage.jsx    # Destination discovery catalog
│   │   ├── LandingPage.jsx    # Modern landing hero & workflow showcase
│   │   ├── ProfilePage.jsx    # User preferences & stats
│   │   ├── SavedDestinationsPage.jsx # Wishlist bucket list
│   │   └── TripWorkspacePage.jsx # Comprehensive journey workspace
│   ├── services/              # Clean backend abstraction service layer
│   ├── App.jsx                # React routes
│   └── main.jsx               # App entry
├── package.json
└── vite.config.js
```