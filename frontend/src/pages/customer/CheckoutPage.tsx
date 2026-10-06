import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, Utensils, CreditCard, ShieldCheck } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const { items, subtotal, restaurantSlug, tableToken, tableNumber, clearCart } = useCart();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'PAY_AT_RESTAURANT' | 'ONLINE'>('PAY_AT_RESTAURANT');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = subtotal + tax;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurantSlug) return;
    if (!tableToken) {
      setError('Scan this restaurant’s table QR code before placing an order.');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      const payload = {
        restaurantSlug,
        tableToken,
        customer: {
          name,
          phone,
        },
        items: items.map((i) => ({
          productId: i.product._id,
          quantity: i.quantity,
        })),
        paymentMethod,
        specialInstructions,
      };

      const res = await api.post('/orders', payload);
      const createdOrder = res.data.data;

      // Store phone for quick customer order history recall
      localStorage.setItem('customer_phone', phone);
      clearCart();

      // Navigate to real-time order tracking page
      navigate(`/order/${createdOrder._id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h1 className="text-xl font-black text-slate-900">Confirm Order</h1>
        <p className="text-xs text-slate-500">
          Restaurant: <strong className="text-slate-800">{restaurantSlug}</strong> • Table: <strong className="text-orange-600">{tableNumber || 'Table 1'}</strong>
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}
      {!tableToken && (
        <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl">
          <p className="font-semibold">A table QR code is required to place an order.</p>
          <p className="mt-1">
            Scan the QR code for your table. For local testing, sign in to the restaurant admin panel, open
            {' '}Tables &amp; QR Codes, choose View QR for a table, then select Open Customer Menu URL.
          </p>
        </div>
      )}

      {/* Order Item Overview */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-2 text-xs">
        <h3 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Order Items ({items.length})</h3>
        {items.map((i) => (
          <div key={i.product._id} className="flex justify-between text-slate-600">
            <span>{i.quantity}× {i.product.name}</span>
            <span className="font-semibold text-slate-900">₹{i.product.price * i.quantity}</span>
          </div>
        ))}
        <div className="pt-2 border-t border-slate-100 flex justify-between font-black text-sm text-slate-900">
          <span>Total Payable</span>
          <span className="text-orange-600">₹{total}</span>
        </div>
      </div>

      {/* Customer Contact Details */}
      <form onSubmit={handlePlaceOrder} className="space-y-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Your Details</h3>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Rahul Sharma"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone (for order updates)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Special Chef Instructions</label>
            <input
              type="text"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="e.g. Less spicy, extra sauce"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Payment Method Selector */}
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3">
          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Payment Method</h3>
          <div
            onClick={() => setPaymentMethod('PAY_AT_RESTAURANT')}
            className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
              paymentMethod === 'PAY_AT_RESTAURANT'
                ? 'border-orange-500 bg-orange-50/50 text-slate-900'
                : 'border-slate-200 text-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <Utensils className="w-5 h-5 text-orange-600" />
              <div>
                <p className="font-bold text-xs">Pay at Restaurant / Cash / Card</p>
                <p className="text-[11px] text-slate-500">Settle your bill directly after dining</p>
              </div>
            </div>
            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'PAY_AT_RESTAURANT' ? 'border-orange-600 bg-orange-600' : 'border-slate-300'}`}>
              {paymentMethod === 'PAY_AT_RESTAURANT' && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3 text-sm font-bold shadow-xl shadow-orange-950/20"
          isLoading={isLoading}
          disabled={!tableToken}
        >
          Place Order (₹{total}) →
        </Button>
      </form>
    </div>
  );
};
