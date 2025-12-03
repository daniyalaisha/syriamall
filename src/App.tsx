import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Category from "./pages/Category";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import VendorStore from "./pages/VendorStore";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminSignup from "./pages/AdminSignup";
import VendorAuth from "./pages/VendorAuth";
import BecomeVendor from "./pages/BecomeVendor";
import VendorStatus from "./pages/VendorStatus";
import Account from "./pages/Account";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Wishlist from "./pages/Wishlist";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VendorLayout from "./components/layout/VendorLayout";
import VendorDashboard from "./pages/vendor/Dashboard";
import VendorOrders from "./pages/vendor/Orders";
import VendorProducts from "./pages/vendor/Products";
import ProductForm from "./pages/vendor/ProductForm";
import VendorInventory from "./pages/vendor/Inventory";
import VendorSettlements from "./pages/vendor/Settlements";
import VendorReviews from "./pages/vendor/Reviews";
import VendorProfile from "./pages/vendor/Profile";
import VendorSettings from "./pages/vendor/Settings";
import VendorSupport from "./pages/vendor/Support";
import VendorAnalytics from "./pages/vendor/Analytics";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminVendors from "./pages/admin/Vendors";
import AdminVendorApplications from "./pages/admin/VendorApplications";
import AdminProducts from "./pages/admin/Products";
import AdminOrders from "./pages/admin/Orders";
import AdminCategories from "./pages/admin/Categories";
import AdminUsers from "./pages/admin/Users";
import AdminPayouts from "./pages/admin/Payouts";
import AdminNotifications from "./pages/admin/Notifications";
import AdminCMSPages from "./pages/admin/CMSPages";
import AdminBanners from "./pages/admin/Banners";
import AdminSettings from "./pages/admin/Settings";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminInviteCodes from "./pages/admin/InviteCodes";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/vendor/:id" element={<VendorStore />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/signup" element={<AdminSignup />} />
          <Route path="/vendor/login" element={<VendorAuth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/become-vendor" element={<BecomeVendor />} />
            <Route path="/vendor-status" element={<VendorStatus />} />
            <Route path="/checkout" element={
              <ProtectedRoute>
                <Checkout />
              </ProtectedRoute>
            } />
            <Route path="/account" element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <Orders />
              </ProtectedRoute>
            } />
            <Route path="/orders/:id" element={
              <ProtectedRoute>
                <OrderDetail />
              </ProtectedRoute>
            } />
            <Route path="/wishlist" element={
              <ProtectedRoute>
                <Wishlist />
              </ProtectedRoute>
            } />
            
            {/* Vendor Routes */}
            <Route path="/vendor" element={
              <ProtectedRoute requiredRole="vendor">
                <VendorLayout />
              </ProtectedRoute>
            }>
              <Route index element={<VendorDashboard />} />
              <Route path="orders" element={<VendorOrders />} />
              <Route path="products" element={<VendorProducts />} />
              <Route path="products/new" element={<ProductForm />} />
              <Route path="products/:id/edit" element={<ProductForm />} />
              <Route path="inventory" element={<VendorInventory />} />
              <Route path="settlements" element={<VendorSettlements />} />
              <Route path="reviews" element={<VendorReviews />} />
              <Route path="profile" element={<VendorProfile />} />
              <Route path="settings" element={<VendorSettings />} />
              <Route path="support" element={<VendorSupport />} />
              <Route path="analytics" element={<VendorAnalytics />} />
            </Route>

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
                <Route index element={<AdminDashboard />} />
                <Route path="vendors" element={<AdminVendors />} />
                <Route path="applications" element={<AdminVendorApplications />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="payouts" element={<AdminPayouts />} />
                <Route path="notifications" element={<AdminNotifications />} />
                <Route path="cms-pages" element={<AdminCMSPages />} />
                <Route path="banners" element={<AdminBanners />} />
                <Route path="invite-codes" element={<AdminInviteCodes />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="analytics" element={<AdminAnalytics />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
