import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Check, X, Eye, Ban, MoreVertical, Loader2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const mockVendors = [
  { id: 1, name: "TechStore Syria", email: "tech@store.sy", phone: "+963 11 2345678", status: "pending", joinDate: "2024-01-15", products: 0 },
  { id: 2, name: "Fashion Hub", email: "info@fashionhub.sy", phone: "+963 11 3456789", status: "pending", joinDate: "2024-01-16", products: 0 },
  { id: 3, name: "HomeEssentials", email: "contact@home.sy", phone: "+963 11 4567890", status: "active", joinDate: "2024-01-10", products: 156 },
  { id: 4, name: "Beauty Corner", email: "beauty@corner.sy", phone: "+963 11 5678901", status: "active", joinDate: "2024-01-05", products: 89 },
  { id: 5, name: "Sports World", email: "sports@world.sy", phone: "+963 11 6789012", status: "suspended", joinDate: "2024-01-12", products: 34 },
];

export default function AdminVendors() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [vendors, setVendors] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<any>(null);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [approvalNotes, setApprovalNotes] = useState("");

  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const { data, error } = await supabase
        .from("vendors")
        .select(`
          *,
          vendor_application:vendor_applications!vendor_applications_user_id_fkey(
            business_license_url,
            ntn_certificate_url,
            id_proof_url,
            bank_statement_url
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch product counts for each vendor and flatten vendor_application
      const vendorsWithCounts = await Promise.all(
        (data || []).map(async (vendor) => {
          const { count } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("vendor_id", vendor.id);

          return { 
            ...vendor, 
            productCount: count || 0,
            vendor_application: Array.isArray(vendor.vendor_application) 
              ? vendor.vendor_application[0] 
              : vendor.vendor_application
          };
        })
      );

      setVendors(vendorsWithCounts);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast({
        title: "Error",
        description: "Failed to load vendors",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedVendor) return;

    try {
      const { error } = await supabase
        .from("vendors")
        .update({ is_approved: true })
        .eq("id", selectedVendor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor approved successfully",
      });

      fetchVendors();
    } catch (error) {
      console.error("Error approving vendor:", error);
      toast({
        title: "Error",
        description: "Failed to approve vendor",
        variant: "destructive",
      });
    } finally {
      setShowApprovalDialog(false);
      setApprovalNotes("");
      setSelectedVendor(null);
    }
  };

  const handleReject = async () => {
    if (!selectedVendor) return;

    try {
      const { error } = await supabase
        .from("vendors")
        .delete()
        .eq("id", selectedVendor.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor rejected and removed",
      });

      fetchVendors();
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      toast({
        title: "Error",
        description: "Failed to reject vendor",
        variant: "destructive",
      });
    } finally {
      setShowApprovalDialog(false);
      setApprovalNotes("");
      setSelectedVendor(null);
    }
  };

  const handleSuspend = async (vendorId: string) => {
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ is_approved: false })
        .eq("id", vendorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Vendor suspended",
      });

      fetchVendors();
    } catch (error) {
      console.error("Error suspending vendor:", error);
      toast({
        title: "Error",
        description: "Failed to suspend vendor",
        variant: "destructive",
      });
    }
  };

  const handleUpdateCommission = async (vendorId: string, rate: number) => {
    try {
      const { error } = await supabase
        .from("vendors")
        .update({ commission_rate: rate })
        .eq("id", vendorId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Commission rate updated",
      });

      fetchVendors();
    } catch (error) {
      console.error("Error updating commission:", error);
      toast({
        title: "Error",
        description: "Failed to update commission rate",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: boolean) => {
    if (status) {
      return <Badge className="bg-green-600">Active</Badge>;
    }
    return <Badge className="bg-primary">Pending</Badge>;
  };

  const filteredVendors = vendors.filter(vendor =>
    vendor.store_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingVendors = filteredVendors.filter(v => !v.is_approved);
  const activeVendors = filteredVendors.filter(v => v.is_approved);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-heading font-bold">Vendor Management</h1>
          <p className="text-muted-foreground">Manage vendor approvals and accounts</p>
        </div>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Vendors</TabsTrigger>
          <TabsTrigger value="pending">Pending Approval</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="suspended">Suspended</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <TabsContent value="all" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell className="font-medium">{vendor.store_name}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{vendor.email}</div>
                          <div className="text-muted-foreground">{vendor.phone}</div>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>{vendor.productCount}</TableCell>
                      <TableCell>{getStatusBadge(vendor.is_approved)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedVendor(vendor);
                              setShowApprovalDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!vendor.is_approved && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  handleApprove();
                                }}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setSelectedVendor(vendor);
                                  handleReject();
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {vendor.is_approved && (
                            <Button variant="outline" size="sm">
                              <Ban className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="pending" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Join Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingVendors
                    .map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{vendor.email}</div>
                            <div className="text-muted-foreground">{vendor.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{vendor.joinDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedVendor(vendor);
                                handleApprove();
                              }}
                            >
                              <Check className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedVendor(vendor);
                                handleReject();
                              }}
                            >
                              <X className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="active" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeVendors
                    .map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{vendor.email}</div>
                            <div className="text-muted-foreground">{vendor.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{vendor.products}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            <Ban className="h-4 w-4 mr-1" /> Suspend
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="suspended" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vendor Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Products</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockVendors
                    .filter((v) => v.status === "suspended")
                    .map((vendor) => (
                      <TableRow key={vendor.id}>
                        <TableCell className="font-medium">{vendor.name}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{vendor.email}</div>
                            <div className="text-muted-foreground">{vendor.phone}</div>
                          </div>
                        </TableCell>
                        <TableCell>{vendor.products}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="default" size="sm">
                            <Check className="h-4 w-4 mr-1" /> Reactivate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vendor Details & Documents</DialogTitle>
            <DialogDescription>
              Review vendor application and uploaded documents
            </DialogDescription>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Vendor Name</Label>
                  <p>{selectedVendor.store_name}</p>
                </div>
                <div>
                  <Label className="font-bold">Email</Label>
                  <p>{selectedVendor.email}</p>
                </div>
                <div>
                  <Label className="font-bold">Phone</Label>
                  <p>{selectedVendor.phone}</p>
                </div>
                <div>
                  <Label className="font-bold">Join Date</Label>
                  <p>{new Date(selectedVendor.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="font-bold">Products</Label>
                  <p>{selectedVendor.productCount}</p>
                </div>
                <div>
                  <Label className="font-bold">Wallet Balance</Label>
                  <p>${parseFloat(selectedVendor.wallet_balance || 0).toFixed(2)}</p>
                </div>
              </div>

              {/* Commission Rate */}
              <div>
                <Label className="font-bold">Commission Rate Override</Label>
                <div className="flex items-center gap-2 mt-2">
                  <Input
                    type="number"
                    step="0.1"
                    defaultValue={selectedVendor.commission_rate || 10}
                    onChange={(e) => {
                      const newRate = parseFloat(e.target.value);
                      if (newRate >= 0 && newRate <= 100) {
                        handleUpdateCommission(selectedVendor.id, newRate);
                      }
                    }}
                    className="w-24"
                  />
                  <span>%</span>
                  <span className="text-sm text-muted-foreground">
                    (Default: 10%)
                  </span>
                </div>
              </div>

              {/* KYC Documents Section */}
              {selectedVendor.vendor_application && (
                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-bold text-lg">KYC Documents</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedVendor.vendor_application.business_license_url && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Business License</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(selectedVendor.vendor_application.business_license_url, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    )}
                    {selectedVendor.vendor_application.ntn_certificate_url && (
                      <div className="space-y-2">
                        <Label className="font-semibold">NTN Certificate</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(selectedVendor.vendor_application.ntn_certificate_url, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    )}
                    {selectedVendor.vendor_application.id_proof_url && (
                      <div className="space-y-2">
                        <Label className="font-semibold">ID Proof</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(selectedVendor.vendor_application.id_proof_url, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    )}
                    {selectedVendor.vendor_application.bank_statement_url && (
                      <div className="space-y-2">
                        <Label className="font-semibold">Bank Statement</Label>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => window.open(selectedVendor.vendor_application.bank_statement_url, "_blank")}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Document
                        </Button>
                      </div>
                    )}
                  </div>
                  {!selectedVendor.vendor_application.business_license_url &&
                   !selectedVendor.vendor_application.ntn_certificate_url &&
                   !selectedVendor.vendor_application.id_proof_url &&
                   !selectedVendor.vendor_application.bank_statement_url && (
                    <p className="text-sm text-muted-foreground">No documents uploaded yet</p>
                  )}
                </div>
              )}

              {/* Admin Notes */}
              {!selectedVendor.is_approved && (
                <div>
                  <Label>Notes / Reason</Label>
                  <Textarea
                    placeholder="Add notes or reason for approval/rejection..."
                    value={approvalNotes}
                    onChange={(e) => setApprovalNotes(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>
              Close
            </Button>
            {selectedVendor && !selectedVendor.is_approved && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
                <Button onClick={handleApprove}>Approve</Button>
              </>
            )}
            {selectedVendor && selectedVendor.is_approved && (
              <Button variant="destructive" onClick={() => handleSuspend(selectedVendor.id)}>
                <Ban className="h-4 w-4 mr-2" />
                Suspend Vendor
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
