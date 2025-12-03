import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Package, ShoppingCart, TrendingUp, Bell, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

const weeklyData = [
  { day: "Mon", revenue: 1200 },
  { day: "Tue", revenue: 1900 },
  { day: "Wed", revenue: 1500 },
  { day: "Thu", revenue: 2100 },
  { day: "Fri", revenue: 2350 },
  { day: "Sat", revenue: 1800 },
  { day: "Sun", revenue: 2200 },
];

const notifications = [
  { id: 1, message: "New order received - ORD-20250118-000001", time: "5 min ago", unread: true },
  { id: 2, message: "Product stock low: Wireless Headphones", time: "1 hour ago", unread: true },
  { id: 3, message: "New review on Smart Watch", time: "2 hours ago", unread: false },
];

export default function VendorDashboard() {
  const { user } = useAuth();
  const { vendor, application, loading: vendorLoading } = useVendor();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayRevenue: 0,
    todayOrders: 0,
    pendingOrders: 0,
    totalProducts: 0,
    lowStockProducts: 0,
  });
  const [topProducts, setTopProducts] = useState<any[]>([]);

  const displayName = vendor?.store_name || application?.full_name || "Vendor";

  useEffect(() => {
    if (user) {
      fetchVendorStats();
    }
  }, [user]);

  const fetchVendorStats = async () => {
    try {
      // Get vendor ID
      const { data: vendorData } = await supabase
        .from("vendors")
        .select("id")
        .eq("user_id", user?.id)
        .single();

      if (!vendorData) return;

      // Fetch products count
      const { count: productsCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendorData.id);

      // Fetch low stock products
      const { count: lowStockCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendorData.id)
        .lte("stock_quantity", 5);

      // Fetch pending orders
      const { count: pendingCount } = await supabase
        .from("orders")
        .select("*", { count: "exact", head: true })
        .eq("vendor_id", vendorData.id)
        .eq("status", "pending");

      // Fetch today's orders and revenue
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data: todayOrders } = await supabase
        .from("orders")
        .select("total")
        .eq("vendor_id", vendorData.id)
        .gte("created_at", today.toISOString());

      const todayRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.total), 0) || 0;
      const todayOrderCount = todayOrders?.length || 0;

      // Fetch top selling products
      const { data: products } = await supabase
        .from("products")
        .select("id, name, images, sales_count, price")
        .eq("vendor_id", vendorData.id)
        .order("sales_count", { ascending: false })
        .limit(5);

      setTopProducts(products || []);

      setStats({
        todayRevenue,
        todayOrders: todayOrderCount,
        pendingOrders: pendingCount || 0,
        totalProducts: productsCount || 0,
        lowStockProducts: lowStockCount || 0,
      });
    } catch (error) {
      console.error("Error fetching vendor stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome, {displayName}!</h1>
        <p className="text-muted-foreground">Here's your store overview</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.todayRevenue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Today's earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground">Orders received today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">{stats.lowStockProducts} low stock</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link to="/vendor/products/new">
            <Button className="w-full">Add New Product</Button>
          </Link>
          <Link to="/vendor/orders">
            <Button variant="outline" className="w-full">View Orders</Button>
          </Link>
          <Link to="/vendor/inventory">
            <Button variant="outline" className="w-full">Manage Inventory</Button>
          </Link>
          <Link to="/vendor/analytics">
            <Button variant="outline" className="w-full">View Analytics</Button>
          </Link>
        </CardContent>
      </Card>

      {/* Weekly Performance Graph */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Weekly Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Notifications & Settlement Status */}
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Notifications</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {notifications.map((notif) => (
                <div key={notif.id} className="flex gap-3 items-start p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  {notif.unread && <div className="h-2 w-2 rounded-full bg-primary mt-2" />}
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4">View All</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settlement Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Next Payout</span>
              <span className="font-bold">Jan 25, 2025</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Amount</span>
              <span className="font-bold text-primary">$1,890.50</span>
            </div>
            <Link to="/vendor/settlements">
              <Button variant="outline" className="w-full">View Details</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Top Selling Products */}
      <Card className="lg:col-span-3">
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products yet</p>
              <Link to="/vendor/products/new">
                <Button className="mt-4">Add Your First Product</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {topProducts.map((product) => {
                const imageUrl = Array.isArray(product.images) && product.images.length > 0 
                  ? product.images[0] 
                  : null;
                return (
                  <div key={product.id} className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded bg-muted overflow-hidden">
                      {imageUrl ? (
                        <img src={imageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales_count || 0} sales</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${Number(product.price).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">Price</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
