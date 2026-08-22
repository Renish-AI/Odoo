-- Create trip_stops table
CREATE TABLE public.trip_stops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL,
    city_id UUID NOT NULL,
    arrival_date DATE NOT NULL,
    departure_date DATE NOT NULL,
    stop_order INTEGER NOT NULL,
    accommodation_cost NUMERIC DEFAULT 0,
    transport_cost NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create activities table
CREATE TABLE public.activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    city_id UUID NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT,
    duration_minutes INTEGER,
    estimated_cost NUMERIC DEFAULT 0,
    rating NUMERIC,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create itinerary_activities table
CREATE TABLE public.itinerary_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_stop_id UUID NOT NULL REFERENCES public.trip_stops(id) ON DELETE CASCADE,
    activity_id UUID NOT NULL REFERENCES public.activities(id) ON DELETE CASCADE,
    activity_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    custom_cost NUMERIC,
    notes TEXT,
    activity_order INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);
