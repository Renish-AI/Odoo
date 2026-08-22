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
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT DEFAULT 'Passionate globetrotter exploring the world.',
    country TEXT DEFAULT 'United States',
    language TEXT DEFAULT 'English',
    home_currency TEXT DEFAULT 'USD',
    travel_style TEXT DEFAULT 'Balanced Explorer',
    travel_dna JSONB DEFAULT '{"culture": 85, "nature": 70, "food": 95, "adventure": 60, "relaxation": 75}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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
-- SUPABASE POSTGRESQL RPC FUNCTIONS
-- ====================================================================

-- 1. CALCULATE TRIP BUDGET RPC
CREATE OR REPLACE FUNCTION public.calculate_trip_budget(p_trip_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_total_budget NUMERIC(12, 2);
    v_travelers INT;
    v_transport_cost NUMERIC(12, 2);
    v_stay_cost NUMERIC(12, 2);
    v_activities_cost NUMERIC(12, 2);
    v_expenses_cost NUMERIC(12, 2);
    v_total_estimated NUMERIC(12, 2);
    v_remaining NUMERIC(12, 2);
    v_trip_days INT;
    v_avg_cost_per_day NUMERIC(10, 2);
    v_cost_per_traveler NUMERIC(10, 2);
BEGIN
    SELECT total_budget, GREATEST(1, COALESCE(travelers_count, 1)), GREATEST(1, (end_date - start_date + 1))
    INTO v_total_budget, v_travelers, v_trip_days
    FROM public.trips WHERE id = p_trip_id;

    -- Transport between stops
    SELECT COALESCE(SUM(transit_cost), 0) INTO v_transport_cost
    FROM public.trip_stops WHERE trip_id = p_trip_id;

    -- Accommodation in stops
    SELECT COALESCE(SUM(accommodation_cost), 0) INTO v_stay_cost
    FROM public.trip_stops WHERE trip_id = p_trip_id;

    -- Activities cost
    SELECT COALESCE(SUM(a.cost), 0) INTO v_activities_cost
    FROM public.activities a
    JOIN public.trip_stops s ON s.id = a.trip_stop_id
    WHERE s.trip_id = p_trip_id;

    -- Recorded expenses
    SELECT COALESCE(SUM(amount), 0) INTO v_expenses_cost
    FROM public.expenses WHERE trip_id = p_trip_id;

    v_total_estimated := v_transport_cost + v_stay_cost + v_activities_cost + v_expenses_cost;
    v_remaining := v_total_budget - v_total_estimated;
    v_avg_cost_per_day := ROUND(v_total_estimated / v_trip_days, 2);
    v_cost_per_traveler := ROUND(v_total_estimated / v_travelers, 2);

    RETURN jsonb_build_object(
        'total_budget', v_total_budget,
        'total_estimated', v_total_estimated,
        'remaining', v_remaining,
        'transport_cost', v_transport_cost,
        'accommodation_cost', v_stay_cost,
        'activities_cost', v_activities_cost,
        'expenses_cost', v_expenses_cost,
        'avg_cost_per_day', v_avg_cost_per_day,
        'cost_per_traveler', v_cost_per_traveler,
        'trip_days', v_trip_days,
        'travelers', v_travelers
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. CALCULATE TRIP HEALTH RPC
CREATE OR REPLACE FUNCTION public.calculate_trip_health(p_trip_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_health_score INT := 90;
    v_budget_status TEXT := 'healthy';
    v_stops_count INT;
    v_activities_count INT;
    v_over_budget NUMERIC;
BEGIN
    SELECT COUNT(*) INTO v_stops_count FROM public.trip_stops WHERE trip_id = p_trip_id;
    
    SELECT COUNT(*) INTO v_activities_count
    FROM public.activities a
    JOIN public.trip_stops s ON s.id = a.trip_stop_id
    WHERE s.trip_id = p_trip_id;

    IF v_stops_count = 0 THEN
        v_health_score := v_health_score - 30;
    END IF;

    IF v_activities_count > (v_stops_count * 5) THEN
        v_health_score := v_health_score - 10;
    END IF;

    v_health_score := GREATEST(10, LEAST(98, v_health_score));

    RETURN jsonb_build_object(
        'health_score', v_health_score,
        'stops_count', v_stops_count,
        'activities_count', v_activities_count,
        'status', CASE WHEN v_health_score >= 80 THEN 'Well Balanced' WHEN v_health_score >= 60 THEN 'Moderate' ELSE 'Attention Needed' END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DUPLICATE TRIP RPC (Cloning)
CREATE OR REPLACE FUNCTION public.duplicate_trip(p_trip_id UUID, p_target_user_id UUID)
RETURNS UUID AS $$
DECLARE
    v_old_trip RECORD;
    v_new_trip_id UUID;
    v_old_stop RECORD;
    v_new_stop_id UUID;
    v_old_act RECORD;
    v_old_exp RECORD;
    v_new_slug TEXT;
BEGIN
    SELECT * INTO v_old_trip FROM public.trips WHERE id = p_trip_id;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Trip not found';
    END IF;

    v_new_slug := v_old_trip.share_slug || '-copy-' || SUBSTRING(md5(random()::text) FROM 1 FOR 6);

    INSERT INTO public.trips (
        user_id, title, description, cover_image, start_date, end_date,
        total_budget, currency, travelers_count, visibility, is_public, share_slug, tags, status
    ) VALUES (
        p_target_user_id,
        v_old_trip.title || ' (Copy)',
        v_old_trip.description,
        v_old_trip.cover_image,
        v_old_trip.start_date,
        v_old_trip.end_date,
        v_old_trip.total_budget,
        v_old_trip.currency,
        v_old_trip.travelers_count,
        'private',
        false,
        v_new_slug,
        v_old_trip.tags,
        'planning'
    ) RETURNING id INTO v_new_trip_id;

    -- Clone stops & activities
    FOR v_old_stop IN SELECT * FROM public.trip_stops WHERE trip_id = p_trip_id LOOP
        INSERT INTO public.trip_stops (
            trip_id, city_id, city_name, country_name, country_code, lat, lng,
            arrival_date, departure_date, order_index, notes, cover_image,
            transit_mode, transit_duration_mins, transit_cost, accommodation_cost
        ) VALUES (
            v_new_trip_id, v_old_stop.city_id, v_old_stop.city_name, v_old_stop.country_name,
            v_old_stop.country_code, v_old_stop.lat, v_old_stop.lng, v_old_stop.arrival_date,
            v_old_stop.departure_date, v_old_stop.order_index, v_old_stop.notes,
            v_old_stop.cover_image, v_old_stop.transit_mode, v_old_stop.transit_duration_mins,
            v_old_stop.transit_cost, v_old_stop.accommodation_cost
        ) RETURNING id INTO v_new_stop_id;

        -- Clone activities for this stop
        FOR v_old_act IN SELECT * FROM public.activities WHERE trip_stop_id = v_old_stop.id LOOP
            INSERT INTO public.activities (
                trip_stop_id, day_number, title, description, category, cost, currency,
                start_time, end_time, order_index, location_name, image_url, booking_url, status
            ) VALUES (
                v_new_stop_id, v_old_act.day_number, v_old_act.title, v_old_act.description,
                v_old_act.category, v_old_act.cost, v_old_act.currency, v_old_act.start_time,
                v_old_act.end_time, v_old_act.order_index, v_old_act.location_name,
                v_old_act.image_url, v_old_act.booking_url, 'planned'
            );
        END LOOP;
    END LOOP;

    -- Clone expenses
    FOR v_old_exp IN SELECT * FROM public.expenses WHERE trip_id = p_trip_id LOOP
        INSERT INTO public.expenses (
            trip_id, category, description, amount, currency, expense_date, payment_method
        ) VALUES (
            v_new_trip_id, v_old_exp.category, v_old_exp.description, v_old_exp.amount,
            v_old_exp.currency, v_old_exp.expense_date, v_old_exp.payment_method
        );
    END LOOP;

    -- Audit copy
    INSERT INTO public.trip_copies (original_trip_id, new_trip_id, copied_by_user_id)
    VALUES (p_trip_id, v_new_trip_id, p_target_user_id);

    RETURN v_new_trip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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