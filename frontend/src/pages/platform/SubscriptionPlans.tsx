import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Layers, Plus, Check } from 'lucide-react';

export const SubscriptionPlans: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/platform/plans')
      .then((res) => setPlans(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subscription Plans</h1>
          <p className="text-sm text-slate-500">Configure tier pricing, table limits, and platform features</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan._id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-orange-500/50 transition-all"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900">{plan.name}</h3>
                <Badge variant="success">Active</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-3xl font-extrabold text-slate-900">₹{plan.price}</span>
                <span className="text-xs text-slate-500 font-medium"> / {plan.billingCycle?.toLowerCase()}</span>
              </div>
              <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                {plan.features?.map((f: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Max Tables: {plan.maxTables}</span>
              <span>Max Products: {plan.maxProducts}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
