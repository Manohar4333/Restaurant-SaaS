import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { ShoppingBag, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';

export const CustomerLayout: React.FC = () => {
  const {
    items,
    itemCount,
    subtotal,
    restaurantSlug,
    tableNumber,
    isDifferentRestaurantModalOpen,
    closeDifferentRestaurantModal,
    confirmResetAndAdd,
  } = useCart();

  const navigate = useNavigate();
  const location = useLocation();

  const isMenuPage = location.pathname.startsWith('/menu/');
  const isCartOrCheckout = location.pathname === '/cart' || location.pathname === '/checkout';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-200">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {!isMenuPage && (
            <button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Digital Menu</h1>
            {tableNumber && (
              <span className="inline-block text-[11px] font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                Table: {tableNumber}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {restaurantSlug && (
            <Link
              to="/orders"
              className="text-xs text-slate-600 hover:text-slate-900 font-medium px-2 py-1"
            >
              My Orders
            </Link>
          )}
        </div>
      </header>

      {/* Main Page Area */}
      <main className="flex-1 pb-24">
        <Outlet />
      </main>

      {/* Mobile Floating Bottom Cart Bar */}
      {itemCount > 0 && !isCartOrCheckout && (
        <div className="fixed bottom-4 left-0 right-0 max-w-md mx-auto px-4 z-40">
          <Link
            to="/cart"
            className="flex items-center justify-between bg-orange-600 hover:bg-orange-700 text-white p-3.5 rounded-2xl shadow-xl shadow-orange-950/20 transition-all transform active:scale-98"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-orange-700 flex items-center justify-center font-bold text-xs">
                {itemCount}
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight">{itemCount} {itemCount === 1 ? 'item' : 'items'} in cart</p>
                <p className="text-[11px] text-orange-100">Click to review order</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base">₹{subtotal}</span>
              <span className="text-sm font-semibold ml-1">View Cart →</span>
            </div>
          </Link>
        </div>
      )}

      {/* Cross-Restaurant Guard Modal */}
      <Modal
        isOpen={isDifferentRestaurantModalOpen}
        onClose={closeDifferentRestaurantModal}
        title="Start New Order?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-200">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Your cart currently contains dishes from another restaurant. Adding this item will clear your current cart.
            </p>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button variant="outline" size="sm" onClick={closeDifferentRestaurantModal}>
              Keep Existing Cart
            </Button>
            <Button variant="primary" size="sm" onClick={confirmResetAndAdd}>
              Clear & Add New Dish
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
