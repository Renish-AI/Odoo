import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips } from './localStore';

export const budgetService = {
  calculateTripBudgetSummary(trip) {
    const totalBudget = Number(trip?.totalBudget) || 2500;
    const travelers = Number(trip?.travelersCount) || Number(trip?.travelers) || 1;
    const expenses = trip?.expenses || [];
    const activities = trip?.activities || [];
    const stops = trip?.stops || [];

    // Calculate core expenditures
    const totalExpenses = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const totalActivityCosts = activities.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);
    const totalTransitCosts = stops.reduce((acc, curr) => acc + (Number(curr.transitCost) || 0), 0);

    // Total estimated spend = logged expenses + planned activities + inter-city transit
    const totalActualSpend = totalExpenses + totalActivityCosts + totalTransitCosts;

    // Calculate trip duration in days
    let tripDays = 1;
    if (trip?.startDate && trip?.endDate) {
      const s = new Date(trip.startDate);
      const e = new Date(trip.endDate);
      const diff = Math.max(1, Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1);
      tripDays = diff;
    } else if (stops.length > 0) {
      tripDays = Math.max(1, stops.length * 3);
    }

    const avgCostPerDay = tripDays > 0 ? Math.round(totalActualSpend / tripDays) : 0;
    const costPerTraveler = travelers > 0 ? Math.round(totalActualSpend / travelers) : totalActualSpend;
    const remainingBudget = totalBudget - totalActualSpend;
    const percentageUsed = totalBudget > 0 ? Math.min(100, Math.round((totalActualSpend / totalBudget) * 100)) : 0;

    // Category Aggregator
    const CATEGORY_MAP = {
      'Transport': totalTransitCosts,
      'Accommodation': 0,
      'Food': 0,
      'Activities': totalActivityCosts,
      'Local Transport': 0,
      'Shopping': 0,
      'Other': 0
    };

    // Map logged expenses into categories
    expenses.forEach((e) => {
      const cat = e.category || 'Other';
      if (cat === 'Food' || cat === 'Food & Dining') {
        CATEGORY_MAP['Food'] += Number(e.amount) || 0;
      } else if (cat === 'Accommodation' || cat === 'Stays' || cat === 'Hotel') {
        CATEGORY_MAP['Accommodation'] += Number(e.amount) || 0;
      } else if (cat === 'Transport' || cat === 'Flights' || cat === 'Flight') {
        CATEGORY_MAP['Transport'] += Number(e.amount) || 0;
      } else if (cat === 'Local Transport' || cat === 'Local Transit' || cat === 'Taxi') {
        CATEGORY_MAP['Local Transport'] += Number(e.amount) || 0;
      } else if (cat === 'Activities' || cat === 'Sightseeing' || cat === 'Tickets') {
        CATEGORY_MAP['Activities'] += Number(e.amount) || 0;
      } else if (cat === 'Shopping') {
        CATEGORY_MAP['Shopping'] += Number(e.amount) || 0;
      } else {
        CATEGORY_MAP['Other'] += Number(e.amount) || 0;
      }
    });

    const categoryData = Object.entries(CATEGORY_MAP)
      .map(([name, value]) => ({
        name,
        value: Math.round(value)
      }))
      .filter((item) => item.value > 0);

    // If all are zero, provide empty placeholder categoryData
    const finalCategoryData = categoryData.length > 0
      ? categoryData
      : [{ name: 'Planned Budget Buffer', value: totalBudget }];

    // Alert levels
    let alertLevel = 'healthy';
    let alertMessage = '✓ Your trip is healthy and comfortably within budget.';

    if (remainingBudget < 0) {
      alertLevel = 'over';
      alertMessage = `⚠ You're $${Math.abs(remainingBudget).toLocaleString()} over your planned budget limit.`;
    } else if (percentageUsed >= 85) {
      alertLevel = 'warning';
      alertMessage = `⚠ You're approaching your trip budget (over 85% allocated).`;
    }

    return {
      totalBudget,
      totalActualSpend,
      estimatedTotal: totalActualSpend,
      remainingBudget,
      percentageUsed,
      avgCostPerDay,
      costPerTraveler,
      travelers,
      tripDays,
      categoryData: finalCategoryData,
      alertLevel,
      alertMessage
    };
  },

  async addExpense(tripId, expenseData) {
    const newExpense = {
      id: 'exp-' + Date.now(),
      category: expenseData.category || 'Other',
      amount: Number(expenseData.amount) || 0,
      currency: expenseData.currency || 'USD',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      description: expenseData.description || 'Travel Expense',
      paymentMethod: expenseData.paymentMethod || 'Credit Card'
    };

    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .insert({
            trip_id: tripId,
            category: newExpense.category,
            amount: newExpense.amount,
            currency: newExpense.currency,
            expense_date: newExpense.date,
            description: newExpense.description,
            payment_method: newExpense.paymentMethod
          })
          .select()
          .single();

        if (!error && data) newExpense.id = data.id;
      } catch (err) {
        console.warn('Supabase expense error:', err);
      }
    }

    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip) {
      if (!trip.expenses) trip.expenses = [];
      trip.expenses.unshift(newExpense);
      saveLocalTrips(trips);
    }

    return newExpense;
  },

  async deleteExpense(tripId, expenseId) {
    if (isSupabaseConfigured() && supabase) {
      try {
        await supabase.from('expenses').delete().eq('id', expenseId);
      } catch (err) {
        console.warn('Supabase delete expense error:', err);
      }
    }

    const trips = getLocalTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (trip && trip.expenses) {
      trip.expenses = trip.expenses.filter((e) => e.id !== expenseId);
      saveLocalTrips(trips);
      return true;
    }
    return false;
  }
};