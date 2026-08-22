-- ====================================================================
-- GLOBETROTTER ADVANCED POSTGRESQL / SUPABASE SCHEMA
-- Includes RLS Policies, Storage Buckets, and PostgreSQL RPC Functions
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. CITIES (Global catalogue)
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

-- 2. PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT DEFAULT 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio TEXT DEFAULT 'Passionate globetrotter exploring the world.',
    country TEXT DEFAULT 'United States',
    language TEXT DEFAULT 'English',
    home_currency TEXT DEFAULT 'USD',
    travel_style TEXT DEFAULT 'Balanced Explorer',
    travel_dna JSONB DEFAULT '{"culture": 85, "nature": 70, "food": 95, "adventure": 60, "relaxation": 75}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Automatic Profile Creation Trigger for Supabase Auth Users
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
        full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT OR UPDATE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. TRIPS
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

-- 4. TRIP STOPS
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

-- 5. ACTIVITIES (Itinerary items)
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

-- 6. EXPENSES (Real-time tracking ledger)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Transport', 'Accommodation', 'Food', 'Activities', 'Local Transport', 'Shopping', 'Other', 'Flights', 'Stays', 'Food & Dining', 'Miscellaneous')),
    description TEXT,
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_method TEXT DEFAULT 'Credit Card',
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SAVED DESTINATIONS (Bucket list)
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

-- 8. TRIP COPIES AUDIT
CREATE TABLE IF NOT EXISTS public.trip_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    new_trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    copied_by_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cities are viewable by all" ON public.cities FOR SELECT USING (true);
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Profiles insertable" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users view own or public trips" ON public.trips FOR SELECT 
    USING (auth.uid() = user_id OR visibility = 'public' OR is_public = true);
CREATE POLICY "Users manage own trips" ON public.trips FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "View stops for accessible trips" ON public.trip_stops FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND (trips.user_id = auth.uid() OR trips.visibility = 'public' OR trips.is_public = true)));
CREATE POLICY "Manage stops for own trips" ON public.trip_stops FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = trip_stops.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "View activities for accessible trips" ON public.activities FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.trip_stops JOIN public.trips ON trips.id = trip_stops.trip_id WHERE trip_stops.id = activities.trip_stop_id AND (trips.user_id = auth.uid() OR trips.visibility = 'public' OR trips.is_public = true)));
CREATE POLICY "Manage activities for own trips" ON public.activities FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.trip_stops JOIN public.trips ON trips.id = trip_stops.trip_id WHERE trip_stops.id = activities.trip_stop_id AND trips.user_id = auth.uid()));

CREATE POLICY "Manage expenses for own trips" ON public.expenses FOR ALL 
    USING (EXISTS (SELECT 1 FROM public.trips WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()));

CREATE POLICY "Manage saved destinations" ON public.saved_destinations FOR ALL 
    USING (auth.uid() = user_id);