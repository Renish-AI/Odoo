import React from 'react';
import {
  Users,
  MapPin,
  Globe2,
  DollarSign,
  TrendingUp,
  BarChart2,
  PieChart as PieIcon,
  ShieldCheck,
  Sparkles,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { useTrips } from '../context/TripContext';
import { GLOBAL_DESTINATIONS } from '../data/destinations';

const PIE_COLORS = ['#10b981', '#38bdf8', '#818cf8', '#f59e0b', '#ec4899', '#06b6d4'];

export const AdminDashboardPage = () => {
  const { trips } = useTrips();

  const totalUsersCount = 1420;
  const totalTripsCount = trips.length + 840;
  const publicTripsCount = trips.filter((t) => t.isPublic).length + 320;
  const avgBudget = 3250;

  const monthlyTrendData = [
    { month: 'Jan', trips: 120 },
    { month: 'Feb', trips: 145 },
    { month: 'Mar', trips: 190 },
    { month: 'Apr', trips: 230 },
    { month: 'May', trips: 310 },
    { month: 'Jun', trips: 420 },
    { month: 'Jul', trips: 490 },
    { month: 'Aug', trips: 560 }
  ];

  const popularCitiesData = [
    { city: 'Tokyo', count: 480 },
    { city: 'Paris', count: 420 },
    { city: 'Rome', count: 390 },
    { city: 'Kyoto', count: 350 },
    { city: 'Barcelona', count: 310 },
    { city: 'Bali', count: 290 }
  ];

  const categoryDistributionData = [
    { name: 'Sightseeing', value: 45 },
    { name: 'Food & Dining', value: 25 },
    { name: 'Culture & Art', value: 15 },
    { name: 'Adventure', value: 10 },
    { name: 'Relaxation', value: 5 }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="w-4 h-4" /> Global Platform Administration
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-1">Admin Intelligence Dashboard</h1>
          <p className="text-xs text-slate-400">Platform analytics, user growth metrics, and destination demand trends.</p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-emerald-400 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System Healthy • Live RLS</span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Registered Users</div>
          <div className="text-3xl font-extrabold text-white mt-1">{totalUsersCount.toLocaleString()}</div>
          <div className="text-xs text-emerald-400 mt-1 font-medium">+18% this month</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Trips Created</div>
          <div className="text-3xl font-extrabold text-cyan-400 mt-1">{totalTripsCount.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Across 85 countries</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Public Shared Stories</div>
          <div className="text-3xl font-extrabold text-purple-400 mt-1">{publicTripsCount.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">Read-only travel guides</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Average Trip Budget</div>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">${avgBudget.toLocaleString()}</div>
          <div className="text-xs text-slate-400 mt-1">USD per multi-city journey</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trips Created Line Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-white">Trips Created Monthly Growth</h4>
            </div>
            <span className="text-xs text-slate-400">2026 Season</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Line type="monotone" dataKey="trips" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Cities Bar Chart */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <h4 className="text-sm font-bold text-white">Most Planned Destinations</h4>
            </div>
            <span className="text-xs text-slate-400">By Stop Count</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={popularCitiesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="city" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};