import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  Layers,
  Receipt,
  FileText,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export const PlatformLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/platform/login');
  };

  const navItems = [
    { label: 'Overview', path: '/platform/dashboard', icon: LayoutDashboard },
    { label: 'Tenants & Admins', path: '/platform/tenants', icon: Building2 },
    { label: 'Subscription Plans', path: '/platform/plans', icon: Layers },
    { label: 'Subscriptions', path: '/platform/subscriptions', icon: CreditCard },
    { label: 'Platform Payments', path: '/platform/payments', icon: Receipt },
    { label: 'Growth Reports', path: '/platform/reports', icon: FileText },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col border-r border-slate-800">
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-orange-900/50">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">Platform Owner</h1>
            <p className="text-xs text-slate-400">Super Admin Console</p>
          </div>
        </div>

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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Platform</span>
            <span>/</span>
            <span className="text-slate-900 capitalize">
              {location.pathname.split('/')[2] || 'Dashboard'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              System Live
            </span>
          </div>
        </header>

        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
