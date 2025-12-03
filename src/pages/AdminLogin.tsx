import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Shield, Loader2, LogOut, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, signOut, user, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    // Redirect if already logged in as admin
    if (user && role === 'admin') {
      navigate('/admin');
    }
  }, [user, role, navigate]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      toast.success("Signed out successfully. You can now sign in as Admin.");
    } catch (error) {
      toast.error("Failed to sign out. Please try again.");
    } finally {
      setSigningOut(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      // Navigation will happen via useEffect when role updates
    } catch (error: any) {
      console.error("Login error:", error);
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Login failed. Please try again.");
      }
      setLoading(false);
    }
  };

  // Show loading while auth state is being determined
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isLoggedInAsNonAdmin = user && role && role !== 'admin';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <Card className="w-full max-w-md shadow-xl border-2">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl font-heading font-bold">
              Super Admin Login
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Access the SyriaMall Admin Dashboard
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {isLoggedInAsNonAdmin ? (
            <div className="space-y-4">
              <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-sm">
                  You are currently signed in as a <strong className="capitalize">{role}</strong>. 
                  To access the Admin Dashboard, please sign out first and then sign in with your admin credentials.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleSignOut}
                variant="default"
                className="w-full"
                size="lg"
                disabled={signingOut}
              >
                {signingOut ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing out...
                  </>
                ) : (
                  <>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out & Continue to Admin Login
                  </>
                )}
              </Button>

              <div className="text-center">
                <Button
                  variant="link"
                  className="text-muted-foreground"
                  onClick={() => navigate('/')}
                >
                  Return to Homepage
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Admin Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full" 
                size="lg"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In as Admin"
                )}
              </Button>
              <div className="text-center text-sm text-muted-foreground mt-4">
                Have an invite code?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => navigate('/admin/signup')}
                  type="button"
                >
                  Create Admin Account
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;
