import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Building2, ArrowLeft } from 'lucide-react';

export const CreateTenant: React.FC = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    businessName: '',
    ownerName: '',
    email: '',
    phone: '',
    password: 'ChangeMe123!',
    planId: '',
    rentAmount: 1999,
    billingCycle: 'MONTHLY',
    city: 'Bengaluru',
    state: 'Karnataka',
  });

  useEffect(() => {
    api.get('/platform/plans').then((res) => {
      setPlans(res.data.data);
      if (res.data.data.length > 0) {
        setFormData((prev) => ({
          ...prev,
          planId: res.data.data[0]._id,
          rentAmount: res.data.data[0].price,
        }));
      }
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'planId') {
      const selected = plans.find((p) => p._id === value);
      setFormData((prev) => ({
        ...prev,
        planId: value,
        rentAmount: selected ? selected.price : prev.rentAmount,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await api.post('/platform/tenants', {
        ...formData,
        rentAmount: Number(formData.rentAmount),
        address: {
          city: formData.city,
          state: formData.state,
          country: 'India',
        },
      });
      navigate('/platform/tenants');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create tenant');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/platform/tenants')}
          className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Create New Restaurant Tenant</h1>
          <p className="text-xs text-slate-500">Provisions Tenant, Admin Account, and initial Subscription</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        {error && (
          <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                required
                placeholder="e.g. Spice Route Cafe"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Owner Name</label>
              <input
                type="text"
                name="ownerName"
                value={formData.ownerName}
                onChange={handleChange}
                required
                placeholder="e.g. John Doe"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="admin@restaurant.com"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="+91 9876543210"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Password</label>
            <input
              type="text"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subscription Plan</label>
              <select
                name="planId"
                value={formData.planId}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {plans.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.name} (₹{p.price}/mo)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Rent Amount (₹)</label>
              <input
                type="number"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/platform/tenants')}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" isLoading={isLoading}>
              Create Business & Admin
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
