-- ====================================================================
-- GLOBETROTTER DATABASE MIGRATION 002: ROW-LEVEL SECURITY (RLS) POLICIES
-- Ensures bulletproof data isolation and public travel story sharing
-- ====================================================================

-- 1. Enable RLS on all tables
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_copies ENABLE ROW LEVEL SECURITY;

-- 2. CITIES POLICIES
DROP POLICY IF EXISTS "Cities are viewable by all" ON public.cities;
CREATE POLICY "Cities are viewable by all" ON public.cities 
    FOR SELECT USING (true);

-- 3. PROFILES POLICIES
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles 
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles 
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
    FOR UPDATE USING (auth.uid() = id);

-- 4. TRIPS POLICIES
DROP POLICY IF EXISTS "Users can view own or public trips" ON public.trips;
CREATE POLICY "Users can view own or public trips" ON public.trips 
    FOR SELECT USING (auth.uid() = user_id OR visibility = 'public' OR is_public = true);

DROP POLICY IF EXISTS "Users can insert own trips" ON public.trips;
CREATE POLICY "Users can insert own trips" ON public.trips 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trips" ON public.trips;
CREATE POLICY "Users can update own trips" ON public.trips 
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own trips" ON public.trips;
CREATE POLICY "Users can delete own trips" ON public.trips 
    FOR DELETE USING (auth.uid() = user_id);

-- 5. TRIP STOPS POLICIES
DROP POLICY IF EXISTS "View stops for accessible trips" ON public.trip_stops;
CREATE POLICY "View stops for accessible trips" ON public.trip_stops 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_stops.trip_id 
        AND (trips.user_id = auth.uid() OR trips.visibility = 'public' OR trips.is_public = true)
    ));

DROP POLICY IF EXISTS "Manage stops for own trips" ON public.trip_stops;
CREATE POLICY "Manage stops for own trips" ON public.trip_stops 
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_stops.trip_id 
        AND trips.user_id = auth.uid()
    ));

-- 6. ACTIVITIES POLICIES
DROP POLICY IF EXISTS "View activities for accessible trips" ON public.activities;
CREATE POLICY "View activities for accessible trips" ON public.activities 
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM public.trip_stops 
        JOIN public.trips ON trips.id = trip_stops.trip_id 
        WHERE trip_stops.id = activities.trip_stop_id 
        AND (trips.user_id = auth.uid() OR trips.visibility = 'public' OR trips.is_public = true)
    ));

DROP POLICY IF EXISTS "Manage activities for own trips" ON public.activities;
CREATE POLICY "Manage activities for own trips" ON public.activities 
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.trip_stops 
        JOIN public.trips ON trips.id = trip_stops.trip_id 
        WHERE trip_stops.id = activities.trip_stop_id 
        AND trips.user_id = auth.uid()
    ));

-- 7. EXPENSES POLICIES
DROP POLICY IF EXISTS "Manage expenses for own trips" ON public.expenses;
CREATE POLICY "Manage expenses for own trips" ON public.expenses 
    FOR ALL USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = expenses.trip_id 
        AND trips.user_id = auth.uid()
    ));

-- 8. SAVED DESTINATIONS POLICIES
DROP POLICY IF EXISTS "Manage own saved destinations" ON public.saved_destinations;
CREATE POLICY "Manage own saved destinations" ON public.saved_destinations 
    FOR ALL USING (auth.uid() = user_id);

-- 9. TRIP COPIES AUDIT POLICIES
DROP POLICY IF EXISTS "Manage own trip copies audit" ON public.trip_copies;
CREATE POLICY "Manage own trip copies audit" ON public.trip_copies 
    FOR ALL USING (auth.uid() = copied_by_user_id);
