import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Tags,
  QrCode,
  ShoppingBag,
  Users,
  BarChart3,
  CreditCard,
  Settings,
  LogOut,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const AdminLayout: React.FC = () => {
  const { user, tenant, subscription, logout } = useAuth();
  const { socket } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();

  const [newOrderAlert, setNewOrderAlert] = useState<any>(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewOrder = (order: any) => {
      setNewOrderAlert(order);
      // Play alert beep if supported
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {}
    };

    socket.on('order:new', handleNewOrder);

    return () => {
      socket.off('order:new', handleNewOrder);
    };
  }, [socket]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Live Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Menu Products', path: '/admin/products', icon: UtensilsCrossed },
    { label: 'Categories', path: '/admin/categories', icon: Tags },
    { label: 'Tables & QR Codes', path: '/admin/tables', icon: QrCode },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Analytics & Reports', path: '/admin/reports', icon: BarChart3 },
    { label: 'Subscription & Billing', path: '/admin/subscription', icon: CreditCard },
  ];

  const isSuspended = subscription && subscription.status !== 'ACTIVE' && subscription.status !== 'GRACE_PERIOD';

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          {tenant?.logo ? (
            <img src={tenant.logo} alt="Logo" className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {tenant?.businessName?.charAt(0) || 'R'}
            </div>
          )}
          <div className="truncate">
            <h1 className="font-bold text-white text-sm truncate">{tenant?.businessName || 'Restaurant Admin'}</h1>
            <p className="text-xs text-slate-400">slug: {tenant?.slug}</p>
          </div>
        </div>

        {/* Subscription Alert Banner in Sidebar */}
        {subscription && subscription.status !== 'ACTIVE' && (
          <div className="p-3 mx-4 mt-4 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs">
            <div className="flex items-center gap-1.5 font-semibold mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Status: {subscription.status}</span>
            </div>
            <p className="text-[11px] text-amber-200/80 mb-2">Please renew to avoid interruption.</p>
            <Link to="/admin/subscription">
              <Button size="sm" variant="primary" className="w-full text-[11px] py-1">
                Renew Plan
              </Button>
            </Link>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm shadow-orange-900/40'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="truncate">
              <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Real-time Order Popup Banner */}
        {newOrderAlert && (
          <div className="bg-orange-600 text-white px-8 py-3 flex items-center justify-between shadow-lg animate-bounce">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 animate-pulse" />
              <div>
                <span className="font-bold text-sm">NEW ORDER {newOrderAlert.orderNumber}!</span>
                <span className="text-xs text-orange-100 ml-2">
                  Table {newOrderAlert.tableId?.tableNumber || 'N/A'} • Total: ₹{newOrderAlert.totalAmount}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  navigate(`/admin/orders`);
                  setNewOrderAlert(null);
                }}
              >
                View Orders
              </Button>
              <button
                onClick={() => setNewOrderAlert(null)}
                className="text-orange-200 hover:text-white text-xs px-2 py-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-800 capitalize">
              {location.pathname.split('/')[2]?.replace('-', ' ') || 'Dashboard'}
            </h2>
            {subscription && (
              <Badge variant={subscription.status === 'ACTIVE' ? 'success' : 'warning'}>
                {subscription.status}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {tenant?.slug && (
              <a
                href={`/menu/${tenant.slug}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 border border-orange-200 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors"
              >
                <span>View Public Menu</span>
                <span className="text-[10px]">↗</span>
              </a>
            )}
          </div>
        </header>

        <div className="p-8 flex-1">
          {isSuspended && location.pathname !== '/admin/subscription' ? (
            <div className="max-w-xl mx-auto my-12 bg-white rounded-2xl p-8 border border-amber-200 shadow-sm text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-800 mb-2">Subscription Suspended</h3>
              <p className="text-sm text-slate-600 mb-6">
                Your subscription has lapsed. Protected operations are paused until a renewal payment is completed.
              </p>
              <Link to="/admin/subscription">
                <Button variant="primary">Go to Subscription Payment</Button>
              </Link>
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
    </div>
  );
};
