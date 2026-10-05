import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { BarChart3, TrendingUp, DollarSign } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export const AdminReports: React.FC = () => {
  const [salesReport, setSalesReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/reports/sales')
      .then((res) => setSalesReport(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Sales & Performance Analytics</h1>
        <p className="text-sm text-slate-500">MongoDB aggregated sales trend and product item performance</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Daily Sales Volume</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesReport?.dailySales || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="_id" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                  formatter={(val: any) => [`₹${val}`, 'Daily Revenue']}
                />
                <Bar dataKey="sales" fill="#ea580c" radius={[6, 6, 0, 0]} name="Sales" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-4">Top 5 Best Sellers</h3>
          <div className="space-y-3">
            {(salesReport?.topProducts || []).map((p: any, i: number) => (
              <div key={i} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="font-bold text-slate-900 text-xs">{p._id}</p>
                  <p className="text-[11px] text-slate-500">{p.quantity} portions served</p>
                </div>
                <span className="font-extrabold text-xs text-orange-600">₹{p.revenue}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
