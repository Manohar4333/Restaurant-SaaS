import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Layouts
import { PlatformLayout } from '../layouts/PlatformLayout';
import { AdminLayout } from '../layouts/AdminLayout';
import { CustomerLayout } from '../layouts/CustomerLayout';

// Landing Page
import { LandingPage } from '../pages/LandingPage';

// Super Admin Pages
import { PlatformLogin } from '../pages/platform/PlatformLogin';
import { PlatformDashboard } from '../pages/platform/PlatformDashboard';
import { TenantList } from '../pages/platform/TenantList';
import { CreateTenant } from '../pages/platform/CreateTenant';
import { SubscriptionPlans } from '../pages/platform/SubscriptionPlans';
import { PlatformPayments } from '../pages/platform/PlatformPayments';

// Restaurant Admin Pages
import { AdminLogin } from '../pages/admin/AdminLogin';
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { OrderList } from '../pages/admin/OrderList';
import { ProductList } from '../pages/admin/ProductList';
import { CategoryList } from '../pages/admin/CategoryList';
import { TableList } from '../pages/admin/TableList';
import { CustomerList } from '../pages/admin/CustomerList';
import { AdminReports } from '../pages/admin/AdminReports';
import { AdminSubscription } from '../pages/admin/AdminSubscription';

// Customer Pages
import { CustomerMenu } from '../pages/customer/CustomerMenu';
import { CartPage } from '../pages/customer/CartPage';
import { CheckoutPage } from '../pages/customer/CheckoutPage';
import { OrderTrackingPage } from '../pages/customer/OrderTrackingPage';
import { CustomerOrdersPage } from '../pages/customer/CustomerOrdersPage';

// Guard for Super Admin
const RequireSuperAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-slate-400">Verifying credentials...</div>;
  if (!user || user.role !== 'SUPER_ADMIN') {
    return <Navigate to="/platform/login" replace />;
  }
  return <>{children}</>;
};

// Guard for Restaurant Admin
const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-center text-slate-400">Verifying session...</div>;
  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/admin/login" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Super Admin Public Auth */}
      <Route path="/platform/login" element={<PlatformLogin />} />

      {/* Super Admin Protected Area */}
      <Route
        path="/platform"
        element={
          <RequireSuperAdmin>
            <PlatformLayout />
          </RequireSuperAdmin>
        }
      >
        <Route index element={<Navigate to="/platform/dashboard" replace />} />
        <Route path="dashboard" element={<PlatformDashboard />} />
        <Route path="tenants" element={<TenantList />} />
        <Route path="tenants/create" element={<CreateTenant />} />
        <Route path="plans" element={<SubscriptionPlans />} />
        <Route path="subscriptions" element={<SubscriptionPlans />} />
        <Route path="payments" element={<PlatformPayments />} />
        <Route path="reports" element={<PlatformDashboard />} />
        <Route path="settings" element={<PlatformDashboard />} />
      </Route>

      {/* Restaurant Admin Public Auth */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Restaurant Admin Protected Area */}
      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="orders" element={<OrderList />} />
        <Route path="products" element={<ProductList />} />
        <Route path="products/create" element={<ProductList />} />
        <Route path="categories" element={<CategoryList />} />
        <Route path="categories/create" element={<CategoryList />} />
        <Route path="tables" element={<TableList />} />
        <Route path="tables/create" element={<TableList />} />
        <Route path="customers" element={<CustomerList />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="subscription" element={<AdminSubscription />} />
        <Route path="payments" element={<AdminSubscription />} />
        <Route path="profile" element={<AdminDashboard />} />
        <Route path="settings" element={<AdminDashboard />} />
      </Route>

      {/* Customer Mobile Ordering Area */}
      <Route element={<CustomerLayout />}>
        <Route path="/menu/:restaurantSlug" element={<CustomerMenu />} />
        <Route path="/menu/:restaurantSlug/category/:categoryId" element={<CustomerMenu />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:orderId" element={<OrderTrackingPage />} />
        <Route path="/orders" element={<CustomerOrdersPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
