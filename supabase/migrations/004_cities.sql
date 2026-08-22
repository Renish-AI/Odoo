-- ====================================================================
-- CITIES TABLE
-- ====================================================================

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

-- RLS policies
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to everyone" ON public.cities;
CREATE POLICY "Allow read access to everyone" ON public.cities FOR SELECT USING (true);
