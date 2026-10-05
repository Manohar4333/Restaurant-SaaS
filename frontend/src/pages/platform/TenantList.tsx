import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Plus, Search, Building2, CheckCircle2, XCircle } from 'lucide-react';

export const TenantList: React.FC = () => {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTenants = () => {
    setIsLoading(true);
    api
      .get(`/platform/tenants?search=${search}`)
      .then((res) => setTenants(res.data.data.items))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTenants();
  }, [search]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const action = currentStatus === 'ACTIVE' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${action} this tenant account?`)) return;

    try {
      await api.patch(`/platform/tenants/${id}/${action}`);
      fetchTenants();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update tenant status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Tenants & Businesses</h1>
          <p className="text-sm text-slate-500">Manage independent restaurant tenants, admin owners, and access</p>
        </div>
        <Link to="/platform/tenants/create">
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-1.5" />
            Add New Tenant
          </Button>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by restaurant name, owner email, or slug..."
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Restaurant / Business</th>
                <th className="px-6 py-4">Owner Contact</th>
                <th className="px-6 py-4">Plan & Amount</th>
                <th className="px-6 py-4">Subscription</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading tenants...
                  </td>
                </tr>
              ) : tenants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No tenants found matching your query.
                  </td>
                </tr>
              ) : (
                tenants.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-sm">
                          {t.businessName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{t.businessName}</p>
                          <p className="text-xs text-slate-400">slug: {t.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-800">{t.owner?.name || 'Admin'}</p>
                      <p className="text-xs text-slate-400">{t.email} • {t.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{t.subscription?.planName || 'Standard'}</p>
                      <p className="text-xs text-slate-500">₹{t.subscription?.amount || 0}/mo</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.subscription?.status === 'ACTIVE' ? 'success' : 'warning'}>
                        {t.subscription?.status || 'PENDING'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={t.status === 'ACTIVE' ? 'success' : 'danger'}>
                        {t.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleStatus(t.id, t.status)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
                          t.status === 'ACTIVE'
                            ? 'border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        {t.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
