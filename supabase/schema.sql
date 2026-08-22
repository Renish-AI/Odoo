-- ====================================================================
-- GLOBETROTTER DATABASE SCHEMA
-- PostgreSQL / Supabase Schema with Row-Level Security (RLS)
-- ====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Passionate globetrotter exploring the world one city at a time.',
    home_currency TEXT DEFAULT 'USD',
    travel_style TEXT DEFAULT 'Balanced Explorer',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TRIPS TABLE
CREATE TABLE IF NOT EXISTS public.trips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    cover_image TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_budget NUMERIC(12, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    is_public BOOLEAN DEFAULT false,
    share_slug TEXT UNIQUE NOT NULL,
    tags TEXT[] DEFAULT ARRAY['Adventure', 'Culture'],
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'completed', 'archived')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TRIP STOPS (Destinations / Cities in multi-city journey)
CREATE TABLE IF NOT EXISTS public.trip_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
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
    transit_mode TEXT DEFAULT 'flight', -- flight, train, drive, ferry
    transit_duration_mins INT DEFAULT 180,
    transit_cost NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ACTIVITIES (Day-wise itinerary items)
CREATE TABLE IF NOT EXISTS public.activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_stop_id UUID NOT NULL REFERENCES public.trip_stops(id) ON DELETE CASCADE,
    day_number INT NOT NULL DEFAULT 1,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL DEFAULT 'Sightseeing' CHECK (category IN ('Sightseeing', 'Food', 'Adventure', 'Relax', 'Culture', 'Nightlife', 'Transport', 'Shopping')),
    cost NUMERIC(10, 2) DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    start_time TIME DEFAULT '09:00',
    end_time TIME DEFAULT '11:00',
    order_index INT NOT NULL DEFAULT 0,
    location_name TEXT,
    lat NUMERIC(9, 6),
    lng NUMERIC(9, 6),
    booking_url TEXT,
    status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'booked', 'completed')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPENSES (Real-time cost & budget tracker)
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('Flights', 'Stays', 'Food & Dining', 'Activities', 'Local Transit', 'Shopping', 'Miscellaneous')),
    amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'USD',
    date DATE NOT NULL,
    description TEXT NOT NULL,
    payment_method TEXT DEFAULT 'Credit Card',
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SAVED DESTINATIONS (Bucket list & discovery favorites)
CREATE TABLE IF NOT EXISTS public.saved_destinations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    city_name TEXT NOT NULL,
    country_name TEXT NOT NULL,
    image_url TEXT,
    rating NUMERIC(2, 1) DEFAULT 4.8,
    avg_daily_budget NUMERIC(10, 2) DEFAULT 120.00,
    tags TEXT[] DEFAULT ARRAY['Must Visit'],
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, city_name, country_name)
);

-- 7. TRIP FORKS / COPIES AUDIT
CREATE TABLE IF NOT EXISTS public.trip_copies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_trip_id UUID REFERENCES public.trips(id) ON DELETE SET NULL,
    new_trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
    copied_by_user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTO-UPDATE TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS 
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
 language 'plpgsql';

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_trips_updated_at ON public.trips;
CREATE TRIGGER set_trips_updated_at BEFORE UPDATE ON public.trips FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_stops_updated_at ON public.trip_stops;
CREATE TRIGGER set_stops_updated_at BEFORE UPDATE ON public.trip_stops FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

DROP TRIGGER IF EXISTS set_activities_updated_at ON public.activities;
CREATE TRIGGER set_activities_updated_at BEFORE UPDATE ON public.activities FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- AUTO CREATE PROFILE ON SIGNUP TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS 
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
 language 'plpgsql' SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_copies ENABLE ROW LEVEL SECURITY;

-- Profiles: Anyone can read profiles (for shared trips & creators), users can update their own
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Trips: Users can view own trips OR public trips
CREATE POLICY "Users can view own or public trips" ON public.trips FOR SELECT 
    USING (auth.uid() = user_id OR is_public = true);
CREATE POLICY "Users can insert own trips" ON public.trips FOR INSERT 
    WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trips" ON public.trips FOR UPDATE 
    USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own trips" ON public.trips FOR DELETE 
    USING (auth.uid() = user_id);

-- Trip Stops: Viewable if user owns trip OR trip is public
CREATE POLICY "View stops for accessible trips" ON public.trip_stops FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_stops.trip_id AND (trips.user_id = auth.uid() OR trips.is_public = true)
    ));
CREATE POLICY "Manage stops for own trips" ON public.trip_stops FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_stops.trip_id AND trips.user_id = auth.uid()
    ));

-- Activities: Viewable if user owns trip OR trip is public
CREATE POLICY "View activities for accessible trips" ON public.activities FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.trip_stops 
        JOIN public.trips ON trips.id = trip_stops.trip_id 
        WHERE trip_stops.id = activities.trip_stop_id AND (trips.user_id = auth.uid() OR trips.is_public = true)
    ));
CREATE POLICY "Manage activities for own trips" ON public.activities FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.trip_stops 
        JOIN public.trips ON trips.id = trip_stops.trip_id 
        WHERE trip_stops.id = activities.trip_stop_id AND trips.user_id = auth.uid()
    ));

-- Expenses: Viewable and manageable only by trip owner
CREATE POLICY "View expenses for own trips" ON public.expenses FOR SELECT 
    USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
    ));
CREATE POLICY "Manage expenses for own trips" ON public.expenses FOR ALL 
    USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = expenses.trip_id AND trips.user_id = auth.uid()
    ));

-- Saved Destinations: View and manage own bucket list
CREATE POLICY "View own saved destinations" ON public.saved_destinations FOR SELECT 
    USING (auth.uid() = user_id);
CREATE POLICY "Manage own saved destinations" ON public.saved_destinations FOR ALL 
    USING (auth.uid() = user_id);

-- 8. CITIES TABLE (Pre-populated travel destinations database)
CREATE TABLE IF NOT EXISTS public.cities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT,
    description TEXT,
    image_url TEXT,
    average_daily_cost NUMERIC DEFAULT 120.00,
    popularity_score NUMERIC DEFAULT 4.5,
    latitude NUMERIC(9, 6),
    longitude NUMERIC(9, 6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read access to everyone" ON public.cities FOR SELECT USING (true);

-- Storage bucket setup statement (run in Supabase Storage UI or CLI)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('trip-images', 'trip-images', true) ON CONFLICT DO NOTHING;
