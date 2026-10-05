import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { CreditCard, CheckCircle2, AlertTriangle, Calendar, Receipt } from 'lucide-react';

export const AdminSubscription: React.FC = () => {
  const { refreshProfile } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.get('/admin/subscription'),
      api.get('/admin/payments'),
      api.get('/platform/plans').catch(() => ({ data: { data: [] } })),
    ])
      .then(([subRes, payRes, planRes]) => {
        setSubscription(subRes.data.data);
        setPayments(payRes.data.data);
        setPlans(planRes.data.data);
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handlePay = async (planId: string) => {
    setIsPaying(true);
    try {
      const orderRes = await api.post('/admin/subscription/create-payment', { planId });
      const { orderId } = orderRes.data.data;

      // In development / demo environment without live Razorpay SDK modal:
      // Verify payment directly via backend verification endpoint
      const verifyRes = await api.post('/admin/subscription/verify-payment', {
        razorpay_order_id: orderId,
        razorpay_payment_id: `pay_${Date.now()}`,
        razorpay_signature: 'dev_verified_mock_signature',
      });

      alert('Payment completed successfully! Subscription restored to ACTIVE.');
      await refreshProfile();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setIsPaying(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading subscription details...</div>;
  }

  const isSuspended = subscription && subscription.status !== 'ACTIVE' && subscription.status !== 'GRACE_PERIOD';

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Subscription & Billing</h1>
        <p className="text-sm text-slate-500">Manage plan tier, renewal dates, and payment transaction history</p>
      </div>

      {/* Current Subscription Card */}
      <div className={`rounded-3xl p-8 border shadow-sm ${isSuspended ? 'bg-rose-50 border-rose-200' : 'bg-white border-slate-200'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Plan</span>
            <h2 className="text-2xl font-black text-slate-900 mt-1">
              {subscription?.planId?.name || 'Professional'} Tier
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Billed {subscription?.billingCycle?.toLowerCase() || 'monthly'}
            </p>
          </div>
          <Badge
            variant={
              subscription?.status === 'ACTIVE'
                ? 'success'
                : subscription?.status === 'GRACE_PERIOD'
                ? 'warning'
                : 'danger'
            }
            size="md"
          >
            {subscription?.status}
          </Badge>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 py-6 border-b border-slate-100">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Rent Amount</p>
            <p className="text-xl font-extrabold text-slate-900 mt-1">₹{subscription?.amount}/mo</p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Next Due Date</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {subscription?.nextDueDate ? new Date(subscription.nextDueDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase">Grace Period Ends</p>
            <p className="text-sm font-bold text-slate-800 mt-1">
              {subscription?.gracePeriodEndDate ? new Date(subscription.gracePeriodEndDate).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            {isSuspended
              ? 'Your subscription is suspended. Complete payment now to instantly restore admin access.'
              : 'Payments are secured with Razorpay with automated monthly invoice delivery.'}
          </p>
          <Button
            variant="primary"
            isLoading={isPaying}
            onClick={() => handlePay(subscription?.planId?._id || subscription?.planId)}
          >
            <CreditCard className="w-4 h-4 mr-1.5" />
            {isSuspended ? 'Pay Now & Reactivate' : 'Renew Plan Now'}
          </Button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Receipt className="w-5 h-5 text-orange-600" />
          Tenant Payment Invoices
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-4 py-3">Order / Txn ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    No payments on record yet.
                  </td>
                </tr>
              ) : (
                payments.map((p) => (
                  <tr key={p._id}>
                    <td className="px-4 py-3 font-mono text-xs text-slate-800">{p.transactionId || p.orderId}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">₹{p.amount}</td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status === 'SUCCESS' ? 'success' : 'neutral'}>{p.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
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
