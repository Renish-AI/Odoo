-- ============================================================
-- Migration 005: Expenses Table + Budget RPC Function
-- ============================================================

-- Create expenses table
CREATE TABLE IF NOT EXISTS public.expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id        UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  category       TEXT NOT NULL DEFAULT 'Miscellaneous',
  description    TEXT,
  amount         NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency       TEXT NOT NULL DEFAULT 'USD',
  expense_date   DATE,
  payment_method TEXT DEFAULT 'Credit Card',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row-level security
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trip expenses"
  ON public.expenses FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert expenses for their trips"
  ON public.expenses FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their own expenses"
  ON public.expenses FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.trips
      WHERE trips.id = expenses.trip_id
        AND trips.user_id = auth.uid()
    )
  );

-- Index for fast trip-based queries
CREATE INDEX IF NOT EXISTS expenses_trip_id_idx ON public.expenses(trip_id);
CREATE INDEX IF NOT EXISTS expenses_expense_date_idx ON public.expenses(expense_date);

-- ============================================================
-- RPC: calculate_trip_budget(p_trip_id UUID)
-- Returns server-side budget aggregations by category
-- ============================================================
CREATE OR REPLACE FUNCTION public.calculate_trip_budget(p_trip_id UUID)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  v_total_budget     NUMERIC := 0;
  v_total_spent      NUMERIC := 0;
  v_category_totals  JSON;
  v_activity_costs   NUMERIC := 0;
  v_transit_costs    NUMERIC := 0;
  v_trip_record      RECORD;
BEGIN
  -- Fetch trip budget
  SELECT total_budget INTO v_total_budget
  FROM public.trips
  WHERE id = p_trip_id;

  -- Sum all recorded expenses
  SELECT COALESCE(SUM(amount), 0)
  INTO v_total_spent
  FROM public.expenses
  WHERE trip_id = p_trip_id;

  -- Sum activity costs
  SELECT COALESCE(SUM(cost), 0)
  INTO v_activity_costs
  FROM public.activities
  WHERE trip_id = p_trip_id;

  -- Sum transit costs from stops
  SELECT COALESCE(SUM(transit_cost), 0)
  INTO v_transit_costs
  FROM public.trip_stops
  WHERE trip_id = p_trip_id;

  -- Aggregate by category
  SELECT json_object_agg(category, total)
  INTO v_category_totals
  FROM (
    SELECT category, SUM(amount) AS total
    FROM public.expenses
    WHERE trip_id = p_trip_id
    GROUP BY category
  ) cat_summary;

  RETURN json_build_object(
    'totalBudget',       v_total_budget,
    'totalSpent',        v_total_spent,
    'remainingBudget',   v_total_budget - v_total_spent,
    'activityCosts',     v_activity_costs,
    'transitCosts',      v_transit_costs,
    'estimatedTotal',    v_total_spent + v_activity_costs + v_transit_costs,
    'categoryTotals',    COALESCE(v_category_totals, '{}'::json),
    'percentageUsed',    CASE WHEN v_total_budget > 0
                           THEN ROUND((v_total_spent / v_total_budget) * 100, 1)
                           ELSE 0 END
  );
END;
$$;
