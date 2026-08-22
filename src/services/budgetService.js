import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getLocalTrips, saveLocalTrips } from './localStore';

export const budgetService = {
  calculateTripBudgetSummary(trip) {
    const totalBudget = Number(trip?.totalBudget) || 0;
    const expenses = trip?.expenses || [];
    const activities = trip?.activities || [];
    const stops = trip?.stops || [];

    // Sum recorded expenses
    const totalActualSpend = expenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    // Sum planned activity costs
    const totalPlannedActivitiesCost = activities.reduce((acc, curr) => acc + (Number(curr.cost) || 0), 0);

    // Sum planned transit costs between stops
    const totalTransitCost = stops.reduce((acc, curr) => acc + (Number(curr.transitCost) || 0), 0);

    const remainingBudget = totalBudget - totalActualSpend;
    const percentageUsed = totalBudget > 0 ? Math.min(100, Math.round((totalActualSpend / totalBudget) * 100)) : 0;

    // Group expenses by category
    const categoryTotals = {
      'Flights': 0,
      'Stays': 0,
      'Food & Dining': 0,
      'Activities': 0,
      'Local Transit': 0,
      'Shopping': 0,
      'Miscellaneous': 0
    };

    expenses.forEach((e) => {
      const cat = categoryTotals[e.category] !== undefined ? e.category : 'Miscellaneous';
      categoryTotals[cat] += Number(e.amount) || 0;
    });

    const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value: Math.round(value)
    })).filter(item => item.value > 0);

    // Health calculation
    let healthStatus = 'optimal'; // optimal, warning, critical
    let healthMessage = 'Your budget is well-balanced with healthy reserves.';

    if (percentageUsed > 100) {
      healthStatus = 'critical';
      healthMessage = 'Budget exceeded by $' + Math.abs(remainingBudget).toLocaleString() + '! Consider cutting non-essential expenses.';
    } else if (percentageUsed > 85) {
      healthStatus = 'warning';
      healthMessage = 'Approaching budget ceiling (over 85% allocated). Monitor remaining days.';
    }

    return {
      totalBudget,
      totalActualSpend,
      remainingBudget,
      percentageUsed,
      totalPlannedActivitiesCost,
      totalTransitCost,
      categoryData,
      healthStatus,
      healthMessage
    };
  },

  async addExpense(tripId, expenseData) {
    const newExpense = {
      id: 'exp-' + Date.now(),
      category: expenseData.category || 'Miscellaneous',
      amount: Number(expenseData.amount) || 0,
      currency: expenseData.currency || 'USD',
      date: expenseData.date || new Date().toISOString().split('T')[0],
      description: expenseData.description || 'Travel Expense',
      paymentMethod: expenseData.paymentMethod || 'Credit Card'
    };

    if (isSupabaseConfigured() && supabase) {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          trip_id: tripId,
          category: newExpense.category,
          amount: newExpense.amount,
          currency: newExpense.currency,
          date: newExpense.date,
          description: newExpense.description,
          payment_method: newExpense.paymentMethod
        })
        .select()
        .single();

      if (!error && data) {
        newExpense.id = data.id;
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
      await supabase.from('expenses').delete().eq('id', expenseId);
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
