import { useAuth } from "@/hooks/useAuth";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'vendor' | 'customer';
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to appropriate login page based on required role
    if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
    if (requiredRole === 'vendor') {
      return <Navigate to="/vendor/login" replace />;
    }
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    // User is logged in but doesn't have the required role
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
