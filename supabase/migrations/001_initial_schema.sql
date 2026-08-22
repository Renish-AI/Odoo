-- ====================================================================
-- GLOBETROTTER DATABASE MIGRATION 001: INITIAL SCHEMA
-- Core relational tables, UUID extensions, and auto-update triggers
-- ====================================================================

-- 1. Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. CITIES (Global catalogue of destinations)
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    country_code VARCHAR(3) DEFAULT 'US',
    region TEXT,
    lat NUMERIC(9, 6),
    lng NUMERIC(9, 6),
    cover_image TEXT,
    avg_daily_budget NUMERIC(10, 2) DEFAULT 120.00,
    currency TEXT DEFAULT 'USD',
    best_season TEXT,
    description TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.8,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES (Extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Passionate globetrotter exploring the world one city at a time.',
    country TEXT DEFAULT 'United States',
    language TEXT DEFAULT 'English',
    home_currency TEXT DEFAULT 'USD',
    travel_style TEXT DEFAULT 'Balanced Explorer',
    travel_dna JSONB DEFAULT '{"culture": 85, "nature": 70, "food": 95, "adventure": 60, "relaxation": 75}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TRIPS (Multi-city journeys)
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget NUMERIC(12, 2) DEFAULT 2500.00,
    currency TEXT DEFAULT 'USD',
    travelers_count INT DEFAULT 1,
    visibility TEXT DEFAULT 'private' CHECK (visibility IN ('private', 'public')),
    is_public BOOLEAN DEFAULT false,
    share_slug TEXT UNIQUE NOT NULL,
    tags TEXT[] DEFAULT ARRAY['Adventure', 'Culture'],
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TRIP STOPS (Destinations / Cities along the route)
CREATE TABLE IF NOT EXISTS public.trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
    city_name TEXT NOT NULL,
    country_name TEXT NOT NULL,
    country_code VARCHAR(3) DEFAULT 'US',
    lat NUMERIC(9, 6),
    lng NUMERIC(9, 6),
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    order_index INT NOT NULL DEFAULT 0,
    notes TEXT,
    cover_image TEXT,
    transit_mode TEXT DEFAULT 'flight' CHECK (transit_mode IN ('flight', 'train', 'drive', 'ferry')),
    transit_duration_mins INT DEFAULT 150,
    transit_cost NUMERIC(10, 2) DEFAULT 80.00,
    accommodation_cost NUMERIC(10, 2) DEFAULT 120.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ACTIVITIES (Day-by-day itinerary schedule)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_stop_id UUID NOT NULL REFERENCES public.trip_stops(id) ON DELETE CASCADE,
    day_number INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Sightseeing' CHECK (category IN ('Sightseeing', 'Food', 'Adventure', 'Relax', 'Culture', 'Nightlife', 'Transport', 'Shopping', 'Other')),
    cost NUMERIC(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    start_time TIME DEFAULT '09:00',
    end_time TIME DEFAULT '11:00',
    order_index INT NOT NULL DEFAULT 0,
    location_name TEXT,
    image_url TEXT,
    booking_url TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'booked', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXPENSES (Real-time tracking ledger)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Transport', 'Accommodation', 'Food', 'Activities', 'Local Transport', 'Shopping', 'Other', 'Flights', 'Stays', 'Food & Dining', 'Miscellaneous')),
    description TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Credit Card',
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. SAVED DESTINATIONS (Bucket list & favorites)
CREATE TABLE IF NOT EXISTS public.saved_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    city_name TEXT NOT NULL,
    country_name TEXT NOT NULL,
    image_url TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.8,
    avg_daily_budget NUMERIC(10, 2) DEFAULT 120.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, city_name, country_name)
);

-- 9. TRIP COPIES AUDIT
CREATE TABLE IF NOT EXISTS public.trip_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    new_trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    copied_by_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- PERFORMANCE INDEXES
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trips_share_slug ON public.trips(share_slug);
CREATE INDEX IF NOT EXISTS idx_trip_stops_trip_id ON public.trip_stops(trip_id);
CREATE INDEX IF NOT EXISTS idx_activities_trip_stop_id ON public.activities(trip_stop_id);
CREATE INDEX IF NOT EXISTS idx_expenses_trip_id ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS idx_saved_destinations_user_id ON public.saved_destinations(user_id);

-- ====================================================================
-- TRIGGERS FOR TIMESTAMPS & USER INITIALIZATION
-- ====================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_trips_updated_at ON public.trips;
CREATE TRIGGER set_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_stops_updated_at ON public.trip_stops;
CREATE TRIGGER set_stops_updated_at BEFORE UPDATE ON public.trip_stops FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_activities_updated_at ON public.activities;
CREATE TRIGGER set_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Auto create profile on Supabase auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
