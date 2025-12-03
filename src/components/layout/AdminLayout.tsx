import { Outlet } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  BarChart3,
  LogOut,
  KeyRound,
  Bell,
  FileText,
  Image,
  DollarSign,
  FolderTree,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";

const AdminLayout = () => {
  const { signOut } = useAuth();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
    { icon: Users, label: "Vendors", path: "/admin/vendors" },
    { icon: Users, label: "Applications", path: "/admin/applications" },
    { icon: Package, label: "Products", path: "/admin/products" },
    { icon: ShoppingCart, label: "Orders", path: "/admin/orders" },
    { icon: FolderTree, label: "Categories", path: "/admin/categories" },
    { icon: Users, label: "Users", path: "/admin/users" },
    { icon: DollarSign, label: "Payouts", path: "/admin/payouts" },
    { icon: Bell, label: "Notifications", path: "/admin/notifications" },
    { icon: FileText, label: "CMS Pages", path: "/admin/cms-pages" },
    { icon: Image, label: "Banners", path: "/admin/banners" },
    { icon: KeyRound, label: "Invite Codes", path: "/admin/invite-codes" },
    { icon: Settings, label: "Settings", path: "/admin/settings" },
    { icon: BarChart3, label: "Analytics", path: "/admin/analytics" },
  ];

  return (
    <div className="flex h-screen bg-muted/30">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border">
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-heading font-bold">
            <span className="text-foreground">Syria</span>
            <span className="text-primary">Mall</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
        </div>

        <ScrollArea className="h-[calc(100vh-180px)]">
          <nav className="p-4 space-y-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
                activeClassName="bg-accent text-accent-foreground"
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full justify-start" size="lg" onClick={() => signOut()}>
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
