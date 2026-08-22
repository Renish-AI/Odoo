import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import {
  DollarSign, TrendingUp, CreditCard, Plus, Trash2,
  AlertTriangle, CheckCircle2, PieChart as PieIcon,
  BarChart2, Receipt, X, Users, Calendar, Zap
} from 'lucide-react';
import { useTrips } from '../../context/TripContext';
import { budgetService, formatINR, toINR } from '../../services/budgetService';
import { AnimatedNumber } from '../common/AnimatedNumber';

const COLORS = ['#10b981','#06b6d4','#8b5cf6','#f59e0b','#ec4899','#3b82f6','#64748b'];

// ── Budget Alert Banner ──────────────────────────────────────
const BudgetAlert = ({ level, message }) => {
  const styles = {
    healthy: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-500/10  border-amber-500/30  text-amber-300',
    over:    'bg-rose-500/10   border-rose-500/30    text-rose-300'
  };
  const icons = {
    healthy: <CheckCircle2 className="w-4 h-4 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 shrink-0" />,
    over:    <AlertTriangle className="w-4 h-4 shrink-0 animate-pulse" />
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border text-sm font-semibold ${styles[level]}`}
    >
      {icons[level]}
      <span>{message}</span>
    </motion.div>
  );
};

// ── KPI Card with animated number ───────────────────────────
const KpiCard = ({ icon: Icon, label, value, valueUSD, sub, color = 'text-white', iconColor = 'text-slate-400' }) => (
  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md space-y-1.5">
    <div className="flex items-center justify-between text-slate-400">
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      <Icon className={`w-4 h-4 ${iconColor}`} />
    </div>
    <div className={`text-xl font-extrabold ${color}`}>
      <AnimatedNumber value={valueUSD} prefix="₹" decimals={0} />
    </div>
    {sub && <div className="text-[10px] text-slate-500">{sub}</div>}
  </div>
);

// ── Category Bar Row ─────────────────────────────────────────
const CategoryBar = ({ emoji, name, actual, planned, maxTotal }) => {
  const total = actual + planned;
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-2 font-semibold text-slate-300">
          <span>{emoji}</span><span>{name}</span>
        </span>
        <span className="font-bold text-white">₹{toINR(total).toLocaleString('en-IN')}</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
        />
      </div>
    </div>
  );
};

// ── Main Component ───────────────────────────────────────────
export const BudgetAnalytics = ({ trip }) => {
  const { addExpense, deleteExpense } = useTrips();
  const [showAddModal, setShowAddModal] = useState(false);
  const [category, setCategory]         = useState('Food & Dining');
  const [amount, setAmount]             = useState('');
  const [description, setDescription]   = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [date, setDate]                 = useState(new Date().toISOString().split('T')[0]);
  const [filterCategory, setFilterCategory] = useState('All');
  const [chartMode, setChartMode]       = useState('pie'); // 'pie' | 'bar'

  const summary  = budgetService.calculateTripBudgetSummary(trip);
  const expenses = trip?.expenses || [];

  const maxCategoryTotal = Math.max(...summary.categoryBreakdown.map(c => c.total), 1);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) return;
    await addExpense(trip.id, {
      category, amount: Number(amount),
      currency: trip.currency || 'USD',
      description: description || `${category} expense`,
      paymentMethod, date
    });
    setAmount('');
    setDescription('');
    setShowAddModal(false);
  };

  const filteredExpenses = filterCategory === 'All'
    ? expenses
    : expenses.filter((e) => e.category === filterCategory);

  const categories = ['Flights','Stays','Food & Dining','Activities','Local Transit','Shopping','Miscellaneous'];

  return (
    <div className="space-y-6">

      {/* Budget Alert Banner */}
      <AnimatePresence>
        <BudgetAlert key={summary.alertLevel} level={summary.alertLevel} message={summary.alertMessage} />
      </AnimatePresence>

      {/* KPI Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard
          icon={DollarSign} label="Total Budget"
          valueUSD={toINR(summary.totalBudget)}
          sub="Planned allocation"
          iconColor="text-slate-500"
        />
        <KpiCard
          icon={TrendingUp} label="Estimated Cost"
          valueUSD={toINR(summary.estimatedTotal)}
          sub="Expenses + activities + transit"
          color="text-cyan-400" iconColor="text-cyan-400"
        />
        <KpiCard
          icon={Receipt} label="Remaining"
          valueUSD={toINR(Math.max(0, summary.remainingBudget))}
          sub={summary.remainingBudget >= 0 ? 'Buffer available' : 'Deficit'}
          color={summary.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}
          iconColor={summary.remainingBudget >= 0 ? 'text-emerald-400' : 'text-rose-400'}
        />
        <KpiCard
          icon={Calendar} label="Avg / Day"
          valueUSD={toINR(summary.avgCostPerDay)}
          sub={`Over ${summary.tripDays} days`}
          color="text-amber-400" iconColor="text-amber-400"
        />
        <KpiCard
          icon={Users} label="Per Traveler"
          valueUSD={toINR(summary.costPerTraveler)}
          sub={`${summary.travelers} traveler${summary.travelers !== 1 ? 's' : ''}`}
          color="text-purple-400" iconColor="text-purple-400"
        />
      </div>

      {/* Overall progress bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold">Budget Used</span>
          <span className="font-bold text-white">{summary.percentageUsed}%</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${summary.percentageUsed}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              summary.percentageUsed > 100 ? 'bg-rose-500' :
              summary.percentageUsed > 85  ? 'bg-amber-500' :
              'bg-gradient-to-r from-emerald-500 to-teal-400'
            }`}
          />
        </div>
        <div className="flex justify-between text-[10px] text-slate-500">
          <span>₹0</span>
          <span>₹{toINR(summary.totalBudget).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Category Cockpit + Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Category Bars */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Spend by Category</h4>
          </div>
          {summary.categoryBreakdown.length === 0 ? (
            <div className="text-xs text-slate-500 text-center py-6">
              Log expenses to see category breakdown.
            </div>
          ) : (
            <div className="space-y-4">
              {summary.categoryBreakdown.map((cat) => (
                <CategoryBar
                  key={cat.name}
                  emoji={cat.emoji}
                  name={cat.name}
                  actual={cat.actual}
                  planned={cat.planned}
                  maxTotal={maxCategoryTotal}
                />
              ))}
            </div>
          )}
        </div>

        {/* Chart Toggle */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Distribution</h4>
            </div>
            <div className="flex items-center gap-1 bg-slate-950 rounded-lg p-0.5">
              {['pie', 'bar'].map((m) => (
                <button
                  key={m}
                  onClick={() => setChartMode(m)}
                  className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-colors ${
                    chartMode === m ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m === 'pie' ? <PieIcon className="w-3 h-3 inline" /> : <BarChart2 className="w-3 h-3 inline" />}
                </button>
              ))}
            </div>
          </div>

          <div className="h-56">
            {summary.categoryData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500">
                No expenses recorded yet.
              </div>
            ) : chartMode === 'pie' ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={summary.categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                    {summary.categoryData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor:'#0f172a', borderColor:'#334155', borderRadius:'12px', fontSize:'11px', color:'#fff' }}
                    formatter={(v) => [`₹${toINR(v).toLocaleString('en-IN')}`, 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} tickFormatter={(v) => `₹${toINR(v / 1000)}K`} />
                  <Tooltip contentStyle={{ backgroundColor:'#0f172a', borderColor:'#334155', borderRadius:'12px', fontSize:'11px', color:'#fff' }}
                    formatter={(v) => [`₹${toINR(v).toLocaleString('en-IN')}`, 'Spent']} />
                  <Bar dataKey="value" fill="#10b981" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80 mt-2">
            {summary.categoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center gap-1.5 text-[10px] text-slate-300">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expense Ledger */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <h4 className="text-sm font-bold text-white">Expense Ledger</h4>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" /> Log Expense
          </button>
        </div>

        {filteredExpenses.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-800 rounded-2xl text-xs text-slate-500">
            No expenses logged. Click "Log Expense" to track spending.
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
                  <th className="py-2.5 px-3 text-center">Del</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredExpenses.map((exp) => (
                  <motion.tr
                    key={exp.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-400">{exp.date}</td>
                    <td className="py-2.5 px-3 font-semibold text-white">{exp.description}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-800 text-emerald-400 text-[10px] font-bold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{exp.paymentMethod || 'Card'}</td>
                    <td className="py-2.5 px-3 font-bold text-white text-right">
                      ₹{toINR(exp.amount).toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => deleteExpense(trip.id, exp.id)}
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <h4 className="text-base font-bold text-white">Log Travel Expense</h4>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Description *</label>
                  <input type="text" required value={description} onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Michelin Star Dinner in Paris"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Amount (USD) *</label>
                    <input type="number" required min="1" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="120"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select value={category} onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                      {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Method</label>
                    <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500">
                      <option>Credit Card</option>
                      <option>Debit Card</option>
                      <option>Cash / Local ATM</option>
                      <option>Apple / Google Pay</option>
                    </select>
                  </div>
                </div>

                {amount > 0 && (
                  <div className="text-[11px] text-slate-400 bg-slate-950/60 rounded-lg px-3 py-2 border border-slate-800">
                    ≈ ₹{toINR(Number(amount)).toLocaleString('en-IN')} at current exchange
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-3 py-2 text-xs text-slate-400 hover:text-white">Cancel</button>
                  <button type="submit" disabled={!amount}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 disabled:opacity-50">
                    Save Expense
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
