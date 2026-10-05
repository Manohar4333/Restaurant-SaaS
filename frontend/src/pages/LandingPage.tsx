import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, UtensilsCrossed, QrCode, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navbar */}
      <header className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-black text-xl shadow-lg">
            🍽️
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight">RestoSaaS</span>
            <span className="text-xs bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-full ml-2">
              Multi-Tenant
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/login">
            <Button variant="ghost" className="text-slate-300 hover:text-white">
              Restaurant Login
            </Button>
          </Link>
          <Link to="/platform/login">
            <Button variant="primary">Super Admin</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-12 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs font-semibold text-orange-400 mb-6">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          Live MERN Multi-Tenant Architecture
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Next-Gen Multi-Tenant Restaurant <br className="hidden sm:inline" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400">
            Ordering & Management SaaS
          </span>
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          Platform owners manage independent restaurant tenants with subscription billing. Restaurants receive real-time order alerts, and customers order directly from table QR codes.
        </p>

        {/* Portals Grid */}
        <div className="grid sm:grid-cols-3 gap-6 text-left max-w-5xl mx-auto mt-12">
          {/* Super Admin Card */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-xl flex flex-col justify-between hover:border-orange-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Super Admin</h3>
              <p className="text-xs text-slate-400 mb-4">
                Platform owner control center: Manage restaurant tenants, subscriptions, plans, and revenue metrics.
              </p>
              <div className="text-xs text-slate-400 space-y-1 mb-6 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <p>Email: <code className="text-orange-300">superadmin@example.com</code></p>
                <p>Password: <code className="text-orange-300">ChangeMe123!</code></p>
              </div>
            </div>
            <Link to="/platform/login">
              <Button variant="primary" className="w-full">
                Enter Platform Console →
              </Button>
            </Link>
          </div>

          {/* Restaurant Admin Card */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-xl flex flex-col justify-between hover:border-orange-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Restaurant Admin</h3>
              <p className="text-xs text-slate-400 mb-4">
                Tenant manager: Live orders, kitchen status, menu categories, products, and table QR codes.
              </p>
              <div className="text-xs text-slate-400 space-y-1 mb-6 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <p>Email: <code className="text-amber-300">admin@royalspice.com</code></p>
                <p>Password: <code className="text-amber-300">ChangeMe123!</code></p>
              </div>
            </div>
            <Link to="/admin/login">
              <Button variant="secondary" className="w-full">
                Enter Admin Portal →
              </Button>
            </Link>
          </div>

          {/* Customer QR Ordering */}
          <div className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-slate-700/80 shadow-xl flex flex-col justify-between hover:border-orange-500/50 transition-all">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-4">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-1">Customer QR Menu</h3>
              <p className="text-xs text-slate-400 mb-4">
                Mobile-first ordering interface: Scan table QR, select food items, place order, and track real-time kitchen status.
              </p>
              <div className="text-xs text-slate-400 space-y-1.5 mb-6 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
                <Link to="/menu/royal-spice" className="text-emerald-400 hover:underline block">
                  👉 Royal Spice Menu
                </Link>
                <Link to="/menu/bella-italia" className="text-emerald-400 hover:underline block">
                  👉 Bella Italia Menu
                </Link>
              </div>
            </div>
            <Link to="/menu/royal-spice">
              <Button variant="outline" className="w-full text-slate-900">
                Open Customer Menu →
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
