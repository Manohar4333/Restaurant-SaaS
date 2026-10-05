import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Badge } from '../../components/ui/Badge';
import { Receipt } from 'lucide-react';

export const PlatformPayments: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api
      .get('/platform/payments')
      .then((res) => setPayments(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Payments</h1>
        <p className="text-sm text-slate-500">Global transaction records and subscription invoice ledger</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Transaction / Order ID</th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Provider</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <p className="font-mono text-xs font-semibold text-slate-900">{p.transactionId || p.orderId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{p.tenantId?.businessName || 'Tenant'}</p>
                      <p className="text-xs text-slate-400">{p.tenantId?.email}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">₹{p.amount}</td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-500">{p.paymentProvider}</td>
                    <td className="px-6 py-4">
                      <Badge variant={p.status === 'SUCCESS' ? 'success' : 'neutral'}>{p.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(p.createdAt).toLocaleDateString()}
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
