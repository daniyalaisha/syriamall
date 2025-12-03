import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  DollarSign,
  Star,
  User,
  Settings,
  HelpCircle,
  BarChart3,
  Menu,
  X,
  LogOut,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useVendor } from "@/hooks/useVendor";

const navigation = [
  { name: "Dashboard", href: "/vendor", icon: LayoutDashboard },
  { name: "Orders", href: "/vendor/orders", icon: ShoppingCart },
  { name: "Products", href: "/vendor/products", icon: Package },
  { name: "Inventory", href: "/vendor/inventory", icon: Warehouse },
  { name: "Settlements", href: "/vendor/settlements", icon: DollarSign },
  { name: "Reviews", href: "/vendor/reviews", icon: Star },
  { name: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { name: "Profile", href: "/vendor/profile", icon: User },
  { name: "Settings", href: "/vendor/settings", icon: Settings },
  { name: "Support", href: "/vendor/support", icon: HelpCircle },
];

export default function VendorLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { signOut } = useAuth();
  const { vendor, application, loading } = useVendor();

  // Get display name from vendor or application
  const displayName = vendor?.store_name || application?.store_name || application?.full_name || "Vendor";

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-primary" />
            <span className="text-xl font-bold">SyriaMall</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <Button variant="outline" className="w-full" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 bg-card border-b">
          <div className="flex items-center justify-between px-6 py-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-4 ml-auto">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <div className="flex items-center gap-3">
                  {vendor?.store_logo ? (
                    <img 
                      src={vendor.store_logo} 
                      alt={displayName}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-medium">{displayName}</p>
                    <p className="text-xs text-muted-foreground">Vendor Dashboard</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
