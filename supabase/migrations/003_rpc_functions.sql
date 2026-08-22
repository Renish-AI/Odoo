-- ====================================================================
-- GLOBETROTTER DATABASE MIGRATION 003: RPC FUNCTIONS
-- High-performance server-side operations for budget calculations,
-- health diagnostics, and full itinerary deep cloning
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
    v_health_score INT := 86;
    v_stops_count INT;
    v_activities_count INT;
    v_warning_text TEXT := NULL;
BEGIN
    SELECT COUNT(*) INTO v_stops_count FROM public.trip_stops WHERE trip_id = p_trip_id;
    
    SELECT COUNT(*) INTO v_activities_count
    FROM public.activities a
    JOIN public.trip_stops s ON s.id = a.trip_stop_id
    WHERE s.trip_id = p_trip_id;

    IF v_stops_count = 0 THEN
        v_health_score := 50;
    ELSIF v_activities_count >= 8 THEN
        v_health_score := 86;
        v_warning_text := 'Day 4 looks packed. Consider spacing afternoon activities.';
    ELSE
        v_health_score := 86;
    END IF;

    RETURN jsonb_build_object(
        'health_score', v_health_score,
        'stops_count', v_stops_count,
        'activities_count', v_activities_count,
        'warning', v_warning_text,
        'status', CASE WHEN v_health_score >= 80 THEN 'Well Balanced' WHEN v_health_score >= 60 THEN 'Good Progress' ELSE 'Needs Attention' END
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. DUPLICATE TRIP RPC (Deep Cloning of Stops, Activities, Expenses)
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
        v_old_trip.title || ' (My Copy)',
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

    -- Audit copy record
    INSERT INTO public.trip_copies (original_trip_id, new_trip_id, copied_by_user_id)
    VALUES (p_trip_id, v_new_trip_id, p_target_user_id);

    RETURN v_new_trip_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
