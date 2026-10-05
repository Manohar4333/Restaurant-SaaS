import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UtensilsCrossed } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('admin@royalspice.com');
  const [password, setPassword] = useState('ChangeMe123!');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl border border-slate-100">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-orange-600 text-white mx-auto flex items-center justify-center font-bold shadow-lg shadow-orange-950/20 mb-4">
            <UtensilsCrossed className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Restaurant Admin Portal</h2>
          <p className="text-sm text-slate-500 mt-1">Sign in to manage kitchen orders, tables & menu</p>
        </div>

        {error && (
          <div className="p-3 mb-6 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder="admin@restaurant.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              placeholder="••••••••••••"
            />
          </div>

          <Button type="submit" variant="primary" className="w-full mt-2" isLoading={isLoading}>
            Sign In to Restaurant
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-1 text-center text-xs text-slate-500">
          <p>
            Royal Spice: <span className="font-semibold text-slate-800">admin@royalspice.com</span> / <span className="font-semibold text-slate-800">ChangeMe123!</span>
          </p>
          <p>
            Bella Italia: <span className="font-semibold text-slate-800">admin@bellaitalia.com</span> / <span className="font-semibold text-slate-800">ChangeMe123!</span>
          </p>
        </div>
      </div>
    </div>
  );
};
