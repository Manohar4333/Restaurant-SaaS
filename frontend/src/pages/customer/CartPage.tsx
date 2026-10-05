import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CartPage: React.FC = () => {
  const { items, subtotal, updateQuantity, removeItem, clearCart, restaurantSlug, tableNumber } = useCart();
  const navigate = useNavigate();

  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const grandTotal = subtotal + tax;

  if (items.length === 0) {
    return (
      <div className="p-8 text-center my-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500">Add mouth-watering dishes from the restaurant menu</p>
        <Link to={`/menu/${restaurantSlug || 'royal-spice'}`}>
          <Button variant="primary" className="mt-2">
            Browse Menu
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900">Your Order Cart</h1>
          {tableNumber && <p className="text-xs text-orange-600 font-semibold">Table: {tableNumber}</p>}
        </div>
        <button onClick={clearCart} className="text-xs text-rose-600 hover:underline">
          Clear All
        </button>
      </div>

      {/* Cart Items */}
      <div className="space-y-3">
        {items.map((item) => (
          <div
            key={item.product._id}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-3"
          >
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-sm">{item.product.name}</h3>
              <p className="text-xs text-slate-500">₹{item.product.price} each</p>
              <p className="text-xs font-extrabold text-orange-600 mt-1">₹{item.product.price * item.quantity}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                  className="w-6 h-6 rounded-lg bg-white text-slate-700 flex items-center justify-center font-bold text-xs shadow-xs"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="font-extrabold text-xs text-slate-900 px-1">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                  className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-xs"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>

              <button
                onClick={() => removeItem(item.product._id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Financial Summary */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-2.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span className="font-bold text-slate-900">₹{subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span>Estimated GST (5%)</span>
          <span className="font-bold text-slate-900">₹{tax}</span>
        </div>
        <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
          <span>Grand Total</span>
          <span className="text-orange-600">₹{grandTotal}</span>
        </div>
      </div>

      <Button
        variant="primary"
        className="w-full py-3 text-sm font-bold shadow-lg shadow-orange-950/20"
        onClick={() => navigate('/checkout')}
      >
        Proceed to Checkout →
      </Button>
    </div>
  );
};
