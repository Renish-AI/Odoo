import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips } from './localStore';

// INR conversion rate (USD × 85 approximation)
const INR_RATE = 85;
export const toINR = (usd) => Math.round((usd || 0) * INR_RATE);
export const formatINR = (usd) =>
  `₹${toINR(usd).toLocaleString('en-IN')}`;

export const budgetService = {
  calculateTripBudgetSummary(trip) {
    const totalBudget    = Number(trip?.totalBudget)    || 0;
    const travelers      = Number(trip?.travelers)       || 1;
    const expenses       = trip?.expenses               || [];
    const activities     = trip?.activities             || [];
    const stops          = trip?.stops                  || [];

    // --- Core sums ---
    const totalActualSpend            = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalPlannedActivitiesCost  = activities.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
    const totalTransitCost            = stops.reduce((acc, curr) => acc + (Number(curr.transitCost) || 0), 0);

    // Estimated total = recorded expenses + planned activity costs + transit
    const estimatedTotal = totalActualSpend + totalPlannedActivitiesCost + totalTransitCost;

    // Trip duration in days
    let tripDays = 1;
    if (stops.length > 0) {
      stops.forEach((s) => {
        if (s.arrivalDate && s.departureDate) {
          const d = Math.max(1, Math.round(
            (new Date(s.departureDate) - new Date(s.arrivalDate)) / (1000 * 60 * 60 * 24)
          ));
          tripDays += d;
        }
      });
    }
    const avgCostPerDay       = tripDays > 0 ? Math.round(estimatedTotal / tripDays) : 0;
    const costPerTraveler     = travelers > 0 ? Math.round(estimatedTotal / travelers) : estimatedTotal;
    const remainingBudget     = totalBudget - totalActualSpend;
    const percentageUsed      = totalBudget > 0
      ? Math.min(100, Math.round((totalActualSpend / totalBudget) * 100))
      : 0;

    // --- Category breakdown for Cockpit bars ---
    const CATEGORIES = {
      'Flights':        { emoji: '✈️', planned: totalTransitCost, actual: 0 },
      'Stays':          { emoji: '🏨', planned: 0, actual: 0 },
      'Food & Dining':  { emoji: '🍜', planned: 0, actual: 0 },
      'Activities':     { emoji: '🎟️', planned: totalPlannedActivitiesCost, actual: 0 },
      'Local Transit':  { emoji: '🚕', planned: 0, actual: 0 },
      'Shopping':       { emoji: '🛍️', planned: 0, actual: 0 },
      'Miscellaneous':  { emoji: '📦', planned: 0, actual: 0 }
    };

    expenses.forEach((e) => {
      const cat = CATEGORIES[e.category] !== undefined ? e.category : 'Miscellaneous';
      CATEGORIES[cat].actual += Number(e.amount) || 0;
    });

    const categoryBreakdown = Object.entries(CATEGORIES).map(([name, v]) => ({
      name,
      emoji: v.emoji,
      planned: Math.round(v.planned),
      actual: Math.round(v.actual),
      total: Math.round(v.planned + v.actual)
    })).filter(item => item.total > 0);

    // For pie/bar charts
    const categoryData = categoryBreakdown.map(c => ({ name: c.name, value: c.total }));

    // --- Alert level ---
    let alertLevel = 'healthy'; // healthy | warning | over
    let alertMessage = '✓ Your trip is within budget.';

    if (percentageUsed > 100) {
      alertLevel = 'over';
      const overBy = toINR(Math.abs(remainingBudget));
      alertMessage = `⚠️ You're ₹${overBy.toLocaleString('en-IN')} over budget.`;
    } else if (percentageUsed > 85) {
      alertLevel = 'warning';
      alertMessage = "⚠️ You're approaching your trip budget.";
    }

    // Legacy compat
    let healthStatus  = alertLevel === 'over' ? 'critical' : alertLevel === 'warning' ? 'warning' : 'optimal';
    let healthMessage = alertMessage;

    return {
      // Core
      totalBudget,
      totalActualSpend,
      estimatedTotal,
      remainingBudget,
      percentageUsed,
      avgCostPerDay,
      costPerTraveler,
      travelers,
      tripDays,
      // Category
      categoryBreakdown,
      categoryData,
      // Alert
      alertLevel,
      alertMessage,
      // Legacy
      totalPlannedActivitiesCost,
      totalTransitCost,
      healthStatus,
      healthMessage
    };
  },

  // Supabase RPC fallback: call calculate_trip_budget(p_trip_id)
  async calculateBudgetFromDB(tripId) {
    if (!isSupabaseConfigured() || !supabase) return null;
    try {
      const { data, error } = await supabase.rpc('calculate_trip_budget', { p_trip_id: tripId });
      if (error) throw error;
      return data;
    } catch {
      return null;
    }
  },

  async addExpense(tripId, expenseData) {
    const newExpense = {
      id: 'exp-' + Date.now(),
      category:      expenseData.category      || 'Miscellaneous',
      amount:        Number(expenseData.amount) || 0,
      currency:      expenseData.currency       || 'USD',
      date:          expenseData.date           || new Date().toISOString().split('T')[0],
      description:   expenseData.description   || 'Travel Expense',
      paymentMethod: expenseData.paymentMethod  || 'Credit Card'
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          trip_id:        tripId,
          category:       newExpense.category,
          amount:         newExpense.amount,
          currency:       newExpense.currency,
          expense_date:   newExpense.date,
          description:    newExpense.description,
          payment_method: newExpense.paymentMethod
        })
        .select()
        .single();

      if (!error && data) newExpense.id = data.id;
    }

    const trips = getLocalTrips();
    const trip  = trips.find((t) => t.id === tripId);
    if (trip) {
      if (!trip.expenses) trip.expenses = [];
      trip.expenses.unshift(newExpense);
      saveLocalTrips(trips);
    }

    return newExpense;
  },

  async deleteExpense(tripId, expenseId) {
    if (isSupabaseConfigured() && supabase) {
      await supabase.from('expenses').delete().eq('id', expenseId);
    }

    const trips = getLocalTrips();
    const trip  = trips.find((t) => t.id === tripId);
    if (trip && trip.expenses) {
      trip.expenses = trip.expenses.filter((e) => e.id !== expenseId);
      saveLocalTrips(trips);
      return true;
    }
    return false;
  }
};
