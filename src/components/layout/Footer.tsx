import { Facebook, Instagram, Twitter } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";

const Footer = () => {
  const { user, role } = useAuth();

  return (
    <footer className="bg-secondary text-secondary-foreground mt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">
              <span className="text-secondary-foreground">Syria</span>
              <span className="text-primary">Mall</span>
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted digital marketplace for all your shopping needs. Quality products from verified vendors.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </NavLink>
              </li>
              <li>
                <NavLink to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </NavLink>
              </li>
              {/* Show vendor-specific links based on role */}
              {role === 'vendor' ? (
                <li>
                  <NavLink to="/vendor" className="text-muted-foreground hover:text-primary transition-colors">
                    Vendor Dashboard
                  </NavLink>
                </li>
              ) : (
                <>
                  <li>
                    <NavLink to="/become-vendor" className="text-muted-foreground hover:text-primary transition-colors">
                      Become a Vendor
                    </NavLink>
                  </li>
                  <li>
                    <NavLink to="/vendor/login" className="text-muted-foreground hover:text-primary transition-colors">
                      Vendor Login
                    </NavLink>
                  </li>
                </>
              )}
              <li>
                <NavLink to="/careers" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/help" className="text-muted-foreground hover:text-primary transition-colors">
                  Help Center
                </NavLink>
              </li>
              <li>
                <NavLink to="/shipping" className="text-muted-foreground hover:text-primary transition-colors">
                  Shipping Info
                </NavLink>
              </li>
              <li>
                <NavLink to="/returns" className="text-muted-foreground hover:text-primary transition-colors">
                  Returns
                </NavLink>
              </li>
              <li>
                <NavLink to="/track" className="text-muted-foreground hover:text-primary transition-colors">
                  Track Order
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <NavLink to="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </NavLink>
              </li>
              <li>
                <NavLink to="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </NavLink>
              </li>
              <li>
                <NavLink to="/cookies" className="text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} SyriaMall. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;