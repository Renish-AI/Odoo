import React, { useState } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Receipt,
  PieChart as PieIcon,
  BarChart2,
  Sparkles,
  Plane,
  Home,
  Utensils,
  Ticket,
  Car,
  ShoppingBag,
  Package
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { useTrips } from '../../context/TripContext';
import { AnimatedCounter } from '../common/AnimatedCounter';
import { budgetService } from '../../services/budgetService';

const CATEGORY_ICONS = {
  'Transport': { icon: Plane, color: '#38bdf8' },
  'Accommodation': { icon: Home, color: '#818cf8' },
  'Food': { icon: Utensils, color: '#f59e0b' },
  'Activities': { icon: Ticket, color: '#10b981' },
  'Local Transport': { icon: Car, color: '#06b6d4' },
  'Shopping': { icon: ShoppingBag, color: '#ec4899' },
  'Other': { icon: Package, color: '#94a3b8' },
  'Flights': { icon: Plane, color: '#38bdf8' },
  'Stays': { icon: Home, color: '#818cf8' },
  'Food & Dining': { icon: Utensils, color: '#f59e0b' },
  'Miscellaneous': { icon: Package, color: '#94a3b8' }
};

const PIE_COLORS = ['#10b981', '#38bdf8', '#818cf8', '#f59e0b', '#ec4899', '#06b6d4', '#94a3b8'];

export const FinancialCockpit = ({ trip }) => {
  const { addExpense, deleteExpense, updateTrip } = useTrips();
  const [travelersCount, setTravelersCount] = useState(trip?.travelersCount || 1);
  const [showAddModal, setShowAddModal] = useState(false);

  // Expense form
  const [category, setCategory] = useState('Food');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState('All');

  const summary = budgetService.calculateTripBudgetSummary(trip);
  const expenses = trip?.expenses || [];
  const totalBudget = Number(trip?.totalBudget) || 2500;

  // Calculate duration in days
  const start = new Date(trip?.startDate || Date.now());
  const end = new Date(trip?.endDate || Date.now());
  const tripDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1);

  // Total Estimated Cost
  const totalEstimatedCost = summary.totalActualSpend;
  const remainingBudget = totalBudget - totalEstimatedCost;
  const avgCostPerDay = Math.round(totalEstimatedCost / tripDays);
  const costPerTraveler = Math.round(totalEstimatedCost / Math.max(1, travelersCount));
  const percentSpent = totalBudget > 0 ? Math.min(100, Math.round((totalEstimatedCost / totalBudget) * 100)) : 0;

  const handleUpdateTravelers = async (count) => {
    const val = Math.max(1, Number(count));
    setTravelersCount(val);
    await updateTrip(trip.id, { travelersCount: val });
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;

    await addExpense(trip.id, {
      category,
      amount: Number(amount),
      currency: trip?.currency || 'USD',
      description: description || `${category} expense`,
      paymentMethod,
      date
    });

    setAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const filteredExpenses = filterCategory === 'All'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory || (filterCategory === 'Food' && e.category === 'Food & Dining') || (filterCategory === 'Accommodation' && e.category === 'Stays'));

  // Budget status alert state
  let alertType = 'healthy';
  let alertMessage = '✓ Your trip is healthy and comfortably within budget.';
  if (remainingBudget < 0) {
    alertType = 'over';
    alertMessage = `⚠ You're $${Math.abs(remainingBudget).toLocaleString()} over your planned budget limit.`;
  } else if (percentSpent >= 85) {
    alertType = 'warning';
    alertMessage = `⚠ You're approaching your trip budget (over 85% allocated).`;
  }

  return (
    <div className="space-y-6">
      
      {/* 1. Trip Financial Cockpit Banner */}
      <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Receipt className="w-5 h-5 text-emerald-400" />
              <h3 className="text-lg font-extrabold text-white tracking-tight">Trip Financial Cockpit</h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live multi-category expenditure tracking, daily burn analytics, and per-traveler breakdown.
            </p>
          </div>

          {/* Travelers Counter */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-400 font-medium">Travelers:</span>
            <select
              value={travelersCount}
              onChange={(e) => handleUpdateTravelers(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              {[1, 2, 3, 4, 5, 6, 8, 10].map((num) => (
                <option key={num} value={num} className="bg-slate-900 text-white">
                  {num} {num === 1 ? 'Traveler' : 'Travelers'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Dynamic Animated Budget Alert Banner */}
        <div
          className={`p-4 rounded-2xl border flex items-center gap-3 transition-all duration-500 animate-in fade-in ${
            alertType === 'healthy'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : alertType === 'warning'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
          }`}
        >
          {alertType === 'healthy' && <CheckCircle2 className="w-5 h-5 shrink-0" />}
          {alertType === 'warning' && <AlertTriangle className="w-5 h-5 shrink-0" />}
          {alertType === 'over' && <AlertCircle className="w-5 h-5 shrink-0" />}
          <div className="text-xs font-bold">{alertMessage}</div>
        </div>

        {/* 5 Financial Metric Gauges with Number Counting */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Budget</div>
            <div className="text-xl font-extrabold text-white mt-1">
              <AnimatedCounter value={totalBudget} prefix="$" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Target Ceiling</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Cost</div>
            <div className="text-xl font-extrabold text-cyan-400 mt-1">
              <AnimatedCounter value={totalEstimatedCost} prefix="$" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{percentSpent}% Allocated</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining Buffer</div>
            <div className={`text-xl font-extrabold mt-1 ${remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              <AnimatedCounter value={remainingBudget} prefix="$" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{remainingBudget >= 0 ? 'Surplus Reserve' : 'Deficit'}</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Avg. Cost / Day</div>
            <div className="text-xl font-extrabold text-amber-400 mt-1">
              <AnimatedCounter value={avgCostPerDay} prefix="$" suffix="/day" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{tripDays} Days Total</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cost / Traveler</div>
            <div className="text-xl font-extrabold text-purple-400 mt-1">
              <AnimatedCounter value={costPerTraveler} prefix="$" />
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{travelersCount} Person Split</div>
          </div>
        </div>
      </div>

      {/* 2. Visual Charts & Ledger Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown Donut */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Category Allocation</h4>
            </div>
            <span className="text-xs text-slate-400">Live Breakdown</span>
          </div>

          <div className="h-64">
            {summary.categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No recorded expenditures yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summary.categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {summary.categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Bar Chart: Spending per category */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Expenses Comparison</h4>
            </div>
            <span className="text-xs text-slate-400">USD ($)</span>
          </div>

          <div className="h-64">
            {summary.categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No recorded expenditures yet.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px', color: '#fff' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Spent']}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* 3. Expense Ledger */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-white">Expense Ledger</h4>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {['Transport', 'Accommodation', 'Food', 'Activities', 'Local Transport', 'Shopping', 'Other'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Expense</span>
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
            No expenses logged in this view.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3">Method</th>
                  <th className="py-2.5 px-3 text-right">Amount</th>
                  <th className="py-2.5 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-slate-400">{exp.date || exp.expenseDate}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{exp.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-[10px] font-bold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{exp.paymentMethod || 'Card'}</td>
                    <td className="py-2.5 px-3 font-bold text-white text-right">
                      ${exp.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => deleteExpense(trip.id, exp.id)}
                        className="p-1 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <h4 className="text-base font-bold text-white mb-4">Log Travel Expense</h4>

            <form onSubmit={handleAddExpense} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Flight to Tokyo, Machiya Ryokan Booking, Ramen Dinner"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {['Transport', 'Accommodation', 'Food', 'Activities', 'Local Transport', 'Shopping', 'Other'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Credit Card">Credit Card</option>
                    <option value="Debit Card">Debit Card</option>
                    <option value="Cash / Local ATM">Cash / Local ATM</option>
                    <option value="Apple / Google Pay">Apple / Google Pay</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800 mt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-xs text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!amount}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};