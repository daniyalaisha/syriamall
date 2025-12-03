import { ShoppingCart, Search, User, Menu, Heart, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const { cartItems } = useCart();

  // Calculate total items in cart
  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="container mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <NavLink to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-heading font-bold">
              <span className="text-foreground">Syria</span>
              <span className="text-primary">Mall</span>
            </div>
          </NavLink>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder="What are you looking for?"
                className="w-full pl-4 pr-10 h-11 bg-muted border-none"
              />
              <Button
                size="sm"
                className="absolute right-1 top-1 h-9 px-4 bg-primary hover:bg-primary-hover"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <NavLink to="/wishlist">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Heart className="h-5 w-5" />
              </Button>
            </NavLink>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild>
                      <NavLink to="/auth">Sign In</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <NavLink to="/auth">Sign Up</NavLink>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem disabled className="font-medium">
                      {user.email}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <NavLink to="/account">My Account</NavLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <NavLink to="/orders">My Orders</NavLink>
                    </DropdownMenuItem>
                    {role === 'vendor' && (
                      <DropdownMenuItem asChild>
                        <NavLink to="/vendor">Vendor Dashboard</NavLink>
                      </DropdownMenuItem>
                    )}
                    {role === 'admin' && (
                      <DropdownMenuItem asChild>
                        <NavLink to="/admin">Admin Panel</NavLink>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()} className="text-red-600">
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <NavLink to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {cartItemCount}
                </span>
              </Button>
            </NavLink>

            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="hidden lg:flex items-center space-x-6 h-12 border-t border-border">
          <NavLink
            to="/category/electronics"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Electronics
          </NavLink>
          <NavLink
            to="/category/fashion"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Fashion
          </NavLink>
          <NavLink
            to="/category/home-living"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Home & Living
          </NavLink>
          <NavLink
            to="/category/beauty"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Beauty
          </NavLink>
          <NavLink
            to="/category/sports"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Sports
          </NavLink>
          <NavLink
            to="/category/toys-games"
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            Toys & Games
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
