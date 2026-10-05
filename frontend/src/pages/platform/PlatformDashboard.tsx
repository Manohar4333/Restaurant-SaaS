import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import {
  Building2,
  Users,
  CreditCard,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Clock,
  IndianRupee,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const PlatformDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/platform/dashboard')
      .then((res) => setMetrics(res.data.data))
      .catch((err) => console.error('Failed to load metrics:', err))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded-md w-1/4"></div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Monthly Recurring Revenue',
      value: `₹${metrics?.mrr?.toLocaleString() || 0}`,
      icon: IndianRupee,
      bg: 'bg-emerald-500/10 text-emerald-600',
    },
    {
      label: 'Total Tenants',
      value: metrics?.totalTenants || 0,
      sub: `${metrics?.activeTenants || 0} active`,
      icon: Building2,
      bg: 'bg-orange-500/10 text-orange-600',
    },
    {
      label: 'Total Orders',
      value: metrics?.totalOrders || 0,
      sub: `Across all restaurants`,
      icon: ShoppingBag,
      bg: 'bg-blue-500/10 text-blue-600',
    },
    {
      label: 'Total Diners/Customers',
      value: metrics?.totalCustomers || 0,
      sub: `Registered phone contacts`,
      icon: Users,
      bg: 'bg-indigo-500/10 text-indigo-600',
    },
  ];

  const COLORS = ['#ea580c', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Overview</h1>
        <p className="text-sm text-slate-500">Live multi-tenant performance and recurring subscription revenue</p>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</p>
                <h3 className="text-2xl font-extrabold text-slate-900 mt-2">{card.value}</h3>
                {card.sub && <p className="text-xs text-slate-400 mt-1">{card.sub}</p>}
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tenant Growth */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Tenant Growth Over Time</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.monthlyGrowth || [{ _id: 'Oct 2026', count: 2 }]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="count" fill="#ea580c" radius={[6, 6, 0, 0]} name="New Tenants" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subscription Distribution */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <h3 className="text-base font-bold text-slate-800 mb-4">Subscription Distribution</h3>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics?.subscriptionDistribution || [{ _id: 'ACTIVE', count: 2 }]}
                  dataKey="count"
                  nameKey="_id"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {(metrics?.subscriptionDistribution || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Active Tenants:</span>
              <span className="font-bold text-emerald-600">{metrics?.activeTenants || 0}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Suspended Tenants:</span>
              <span className="font-bold text-rose-600">{metrics?.suspendedTenants || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
