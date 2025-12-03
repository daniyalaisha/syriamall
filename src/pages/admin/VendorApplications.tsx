import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Search, Eye, CheckCircle, XCircle, Loader2, Store, User, Building, CreditCard, Package } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const VendorApplications = () => {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<any>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("vendor_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: string) => {
    try {
      setActionLoading(true);
      const { error } = await supabase.rpc("approve_vendor_application", { application_id: applicationId });
      if (error) throw error;

      if (adminNotes.trim()) {
        await supabase.from("vendor_applications").update({ admin_notes: adminNotes }).eq("id", applicationId);
      }

      toast.success("Vendor application approved!");
      setSelectedApplication(null);
      setAdminNotes("");
      fetchApplications();
    } catch (error: any) {
      toast.error(error.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      setActionLoading(true);
      const { error } = await supabase
        .from("vendor_applications")
        .update({ status: "rejected", admin_notes: adminNotes, reviewed_at: new Date().toISOString() })
        .eq("id", applicationId);

      if (error) throw error;
      toast.success("Application rejected");
      setSelectedApplication(null);
      setAdminNotes("");
      fetchApplications();
    } catch (error: any) {
      toast.error("Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: "bg-yellow-500/10 text-yellow-500",
      approved: "bg-green-500/10 text-green-500",
      rejected: "bg-red-500/10 text-red-500",
    };
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const filteredApplications = (status: string) =>
    applications.filter(
      (app) =>
        app.status === status &&
        (app.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.email.toLowerCase().includes(searchQuery.toLowerCase()))
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendor Applications</h1>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
      </div>

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending ({applications.filter((a) => a.status === "pending").length})</TabsTrigger>
          <TabsTrigger value="approved">Approved ({applications.filter((a) => a.status === "approved").length})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({applications.filter((a) => a.status === "rejected").length})</TabsTrigger>
        </TabsList>

        {["pending", "approved", "rejected"].map((status) => (
          <TabsContent key={status} value={status}>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Store Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Business Type</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApplications(status).length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      No {status} applications found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications(status).map((app) => (
                    <TableRow key={app.id}>
                      <TableCell className="font-medium">{app.store_name}</TableCell>
                      <TableCell>{app.full_name}</TableCell>
                      <TableCell>{app.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{app.main_category}</Badge>
                      </TableCell>
                      <TableCell className="capitalize">{app.business_type}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(app.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => { setSelectedApplication(app); setAdminNotes(app.admin_notes || ""); }}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={!!selectedApplication} onOpenChange={() => setSelectedApplication(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Vendor Application Details</DialogTitle>
            <DialogDescription>
              Review complete application information
            </DialogDescription>
          </DialogHeader>
          
          {selectedApplication && (
            <div className="space-y-6">
              {/* Personal Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Full Name:</span>
                      <p className="mt-1 font-medium">{selectedApplication.full_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Email:</span>
                      <p className="mt-1 font-medium">{selectedApplication.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Phone:</span>
                      <p className="mt-1 font-medium">{selectedApplication.phone}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Submission Date:</span>
                      <p className="mt-1 font-medium">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Store Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Store className="h-5 w-5 text-primary" />
                    Store Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Store Name:</span>
                      <p className="mt-1 font-medium">{selectedApplication.store_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Main Category:</span>
                      <p className="mt-1">
                        <Badge variant="outline">{selectedApplication.main_category}</Badge>
                      </p>
                    </div>
                    {selectedApplication.sub_category && (
                      <div>
                        <span className="font-medium text-muted-foreground">Sub Category:</span>
                        <p className="mt-1 font-medium">{selectedApplication.sub_category}</p>
                      </div>
                    )}
                    {selectedApplication.pricing_range && (
                      <div>
                        <span className="font-medium text-muted-foreground">Pricing Range:</span>
                        <p className="mt-1 font-medium">{selectedApplication.pricing_range}</p>
                      </div>
                    )}
                    {selectedApplication.planned_products && (
                      <div>
                        <span className="font-medium text-muted-foreground">Planned Products:</span>
                        <p className="mt-1 font-medium">{selectedApplication.planned_products} items</p>
                      </div>
                    )}
                  </div>
                  {selectedApplication.store_description && (
                    <div className="mt-4">
                      <span className="font-medium text-muted-foreground">Store Description:</span>
                      <p className="mt-1 text-sm leading-relaxed">{selectedApplication.store_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Business Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Building className="h-5 w-5 text-primary" />
                    Business Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Business Type:</span>
                      <p className="mt-1 font-medium capitalize">{selectedApplication.business_type}</p>
                    </div>
                    {selectedApplication.ntn_number && (
                      <div>
                        <span className="font-medium text-muted-foreground">NTN Number:</span>
                        <p className="mt-1 font-medium">{selectedApplication.ntn_number}</p>
                      </div>
                    )}
                    <div>
                      <span className="font-medium text-muted-foreground">Address:</span>
                      <p className="mt-1 font-medium">{selectedApplication.store_address}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">City:</span>
                      <p className="mt-1 font-medium">{selectedApplication.city}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Country:</span>
                      <p className="mt-1 font-medium">{selectedApplication.country}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bank Details */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Bank Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Bank Name:</span>
                      <p className="mt-1 font-medium">{selectedApplication.bank_name}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Account Title:</span>
                      <p className="mt-1 font-medium">{selectedApplication.account_title}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Account Number:</span>
                      <p className="mt-1 font-medium">{selectedApplication.account_number}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Separator />

              {/* Admin Notes */}
              <div>
                <Label className="text-base font-semibold">Admin Notes</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Add notes or feedback for this application
                </p>
                <Textarea 
                  value={adminNotes} 
                  onChange={(e) => setAdminNotes(e.target.value)} 
                  rows={3}
                  placeholder="Enter notes or reasons for approval/rejection..."
                  className="resize-none"
                />
              </div>

              {/* Action Buttons */}
              {selectedApplication.status === "pending" && (
                <div className="flex gap-4 pt-4">
                  <Button 
                    onClick={() => handleApprove(selectedApplication.id)} 
                    disabled={actionLoading}
                    className="flex-1"
                    size="lg"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-2" />
                    )}
                    Approve Application
                  </Button>
                  <Button 
                    onClick={() => handleReject(selectedApplication.id)} 
                    disabled={actionLoading} 
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <XCircle className="h-4 w-4 mr-2" />
                    )}
                    Reject Application
                  </Button>
                </div>
              )}

              {selectedApplication.status !== "pending" && (
                <div className="bg-muted p-4 rounded-lg">
                  <p className="text-sm text-center">
                    This application has been <span className="font-semibold capitalize">{selectedApplication.status}</span>
                    {selectedApplication.reviewed_at && (
                      <> on {new Date(selectedApplication.reviewed_at).toLocaleDateString()}</>
                    )}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VendorApplications;
