import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Clock, CheckCircle, XCircle, PartyPopper, Phone, Mail, RefreshCw } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const VendorStatus = () => {
  const navigate = useNavigate();
  const { user, role, loading: authLoading, refreshRole } = useAuth();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [canReapply, setCanReapply] = useState(false);
  const [daysUntilReapply, setDaysUntilReapply] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Function to refresh role and check if user now has vendor access
  const handleRefreshStatus = async () => {
    setRefreshing(true);
    try {
      const newRole = await refreshRole();
      if (newRole === 'vendor') {
        navigate("/vendor");
      } else {
        // Re-fetch application to get latest status
        await fetchApplication();
      }
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const checkStatus = async () => {
      // First refresh the role from database to get latest
      if (user) {
        const currentRole = await refreshRole();
        if (currentRole === "vendor") {
          navigate("/vendor");
          return;
        }
      }

      if (!authLoading && !user) {
        navigate("/auth");
        return;
      }

      if (!authLoading && user) {
        fetchApplication();
      }
    };
    
    checkStatus();
  }, [user, authLoading, navigate]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendor_applications")
        .select("*")
        .eq("user_id", user?.id)
        .maybeSingle();

      if (error) {
        throw error;
      }

      setApplication(data);

      // Calculate reapply eligibility for rejected applications
      if (data?.status === "rejected" && data?.reviewed_at) {
        const reviewedDate = new Date(data.reviewed_at);
        const reapplyDate = new Date(reviewedDate.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days
        const now = new Date();
        
        if (now >= reapplyDate) {
          setCanReapply(true);
        } else {
          const diffTime = reapplyDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setDaysUntilReapply(diffDays);
        }
      }

      // If approved, refresh role to check if vendor role was assigned
      if (data?.status === "approved") {
        const currentRole = await refreshRole();
        if (currentRole === "vendor") {
          navigate("/vendor");
          return;
        }
      }
    } catch (error) {
      console.error("Error fetching application:", error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center">No Application Found</CardTitle>
              <CardDescription className="text-center">
                You haven't submitted a vendor application yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => navigate("/become-vendor")} className="w-full">
                Apply to Become a Vendor
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  // Approved vendor with vendor role - show congratulations screen
  if (application?.status === "approved") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <PartyPopper className="w-20 h-20 mx-auto mb-4 text-green-500" />
              <CardTitle className="text-3xl text-green-600">Congratulations!</CardTitle>
              <CardDescription className="text-lg mt-2">
                Your vendor application has been approved. Welcome to SyriaMall!
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-6 rounded-lg text-center">
                <h3 className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">
                  You're now a verified vendor!
                </h3>
                <p className="text-green-600 dark:text-green-400">
                  Start selling your products and reach thousands of customers across Syria.
                </p>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Store Name:</span>
                  <span className="text-muted-foreground">{application.store_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Approved On:</span>
                  <span className="text-muted-foreground">
                    {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>

              {application.admin_notes && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Message from Admin:</h4>
                  <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button onClick={() => navigate("/vendor")} className="w-full" size="lg">
                  Go to Vendor Dashboard
                </Button>
                <Button 
                  onClick={handleRefreshStatus} 
                  variant="outline" 
                  className="w-full"
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh Status
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  // Rejected application - show rejection screen with reapply option
  if (application?.status === "rejected") {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        
        <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
          <Card className="max-w-2xl w-full">
            <CardHeader className="text-center">
              <XCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
              <CardTitle className="text-3xl text-red-600">❌ Application Rejected</CardTitle>
              <CardDescription className="text-lg mt-2">
                Sorry, your vendor application was not approved at this time.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 p-6 rounded-lg">
                <p className="text-red-700 dark:text-red-300 mb-4">
                  You may reapply after 15 days or contact our support team for more information.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Phone className="h-4 w-4" />
                    <span>03xx-xxxxxxx</span>
                  </div>
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <Mail className="h-4 w-4" />
                    <span>support@syriamall.com</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Store Name:</span>
                  <span className="text-muted-foreground">{application.store_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Submitted:</span>
                  <span className="text-muted-foreground">
                    {new Date(application.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Reviewed:</span>
                  <span className="text-muted-foreground">
                    {application.reviewed_at ? new Date(application.reviewed_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>

              {application.admin_notes && (
                <div className="bg-muted p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Rejection Reason:</h4>
                  <p className="text-sm text-muted-foreground">{application.admin_notes}</p>
                </div>
              )}

              <div className="flex gap-4">
                <Button 
                  onClick={() => navigate("/become-vendor")} 
                  disabled={!canReapply}
                  className="flex-1"
                >
                  {canReapply ? 'Reapply Now' : `Reapply in ${daysUntilReapply} days`}
                </Button>
                <Button onClick={() => navigate("/")} variant="outline" className="flex-1">
                  Back to Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>

        <Footer />
      </div>
    );
  }

  // Pending application - show pending screen
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <Clock className="w-20 h-20 mx-auto mb-4 text-yellow-500 animate-pulse" />
            <CardTitle className="text-3xl text-yellow-600">Application Under Review</CardTitle>
            <CardDescription className="text-lg mt-2">
              Your vendor application has been submitted and is currently being reviewed by our team.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-6 rounded-lg text-center">
              <p className="text-yellow-700 dark:text-yellow-300">
                We'll notify you via email once a decision is made. This usually takes 1-3 business days.
              </p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Application ID:</span>
                <span className="text-muted-foreground">{application?.id?.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Store Name:</span>
                <span className="text-muted-foreground">{application?.store_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Submitted:</span>
                <span className="text-muted-foreground">
                  {application?.created_at ? new Date(application.created_at).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="font-semibold capitalize text-yellow-600">
                  Pending Review
                </span>
              </div>
            </div>

            <Button onClick={() => navigate("/")} variant="outline" className="w-full">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default VendorStatus;
