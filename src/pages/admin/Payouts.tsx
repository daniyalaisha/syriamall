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
import { Search, Check, X, Eye, Loader2, DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminPayouts() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayout, setSelectedPayout] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    fetchPayouts();
  }, []);

  const fetchPayouts = async () => {
    try {
      const { data, error } = await supabase
        .from("payout_requests")
        .select(`
          *,
          vendors (
            store_name,
            email,
            phone,
            bank_details
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (error) {
      console.error("Error fetching payouts:", error);
      toast({
        title: "Error",
        description: "Failed to load payout requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedPayout) return;

    try {
      const { error } = await supabase
        .from("payout_requests")
        .update({
          status: "approved",
          admin_notes: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", selectedPayout.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payout request approved",
      });

      setShowDialog(false);
      setAdminNotes("");
      fetchPayouts();
    } catch (error) {
      console.error("Error approving payout:", error);
      toast({
        title: "Error",
        description: "Failed to approve payout",
        variant: "destructive",
      });
    }
  };

  const handleReject = async () => {
    if (!selectedPayout) return;

    try {
      const { error } = await supabase
        .from("payout_requests")
        .update({
          status: "rejected",
          admin_notes: adminNotes,
          processed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", selectedPayout.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payout request rejected",
      });

      setShowDialog(false);
      setAdminNotes("");
      fetchPayouts();
    } catch (error) {
      console.error("Error rejecting payout:", error);
      toast({
        title: "Error",
        description: "Failed to reject payout",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-600">Approved</Badge>;
      case "pending":
        return <Badge className="bg-primary">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayouts = payouts.filter((payout) =>
    payout.vendors?.store_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-3xl font-heading font-bold">Payout Management</h1>
          <p className="text-muted-foreground">Manage vendor payout requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {payouts.filter((p) => p.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Amount (Pending)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {payouts
                .filter((p) => p.status === "pending")
                .reduce((sum, p) => sum + parseFloat(p.amount), 0)
                .toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Approved This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {
                payouts.filter(
                  (p) =>
                    p.status === "approved" &&
                    new Date(p.processed_at).getMonth() === new Date().getMonth()
                ).length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by vendor name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {["pending", "approved", "rejected"].map((status) => (
              <TabsContent key={status} value={status} className="m-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vendor</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Requested</TableHead>
                      {status !== "pending" && <TableHead>Processed</TableHead>}
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayouts
                      .filter((p) => p.status === status)
                      .map((payout) => (
                        <TableRow key={payout.id}>
                          <TableCell className="font-medium">
                            {payout.vendors?.store_name}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 font-bold">
                              <DollarSign className="h-4 w-4" />
                              {parseFloat(payout.amount).toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>{new Date(payout.created_at).toLocaleDateString()}</TableCell>
                          {status !== "pending" && (
                            <TableCell>
                              {payout.processed_at
                                ? new Date(payout.processed_at).toLocaleDateString()
                                : "-"}
                            </TableCell>
                          )}
                          <TableCell>{getStatusBadge(payout.status)}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedPayout(payout);
                                  setShowDialog(true);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {status === "pending" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      handleApprove();
                                    }}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedPayout(payout);
                                      handleReject();
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TabsContent>
            ))}
          </CardContent>
        </Card>
      </Tabs>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payout Request Details</DialogTitle>
            <DialogDescription>Review and process payout request</DialogDescription>
          </DialogHeader>
          {selectedPayout && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-bold">Vendor</Label>
                  <p>{selectedPayout.vendors?.store_name}</p>
                </div>
                <div>
                  <Label className="font-bold">Amount</Label>
                  <p className="text-lg font-bold">${parseFloat(selectedPayout.amount).toFixed(2)}</p>
                </div>
                <div>
                  <Label className="font-bold">Contact Email</Label>
                  <p>{selectedPayout.vendors?.email}</p>
                </div>
                <div>
                  <Label className="font-bold">Contact Phone</Label>
                  <p>{selectedPayout.vendors?.phone}</p>
                </div>
                <div className="col-span-2">
                  <Label className="font-bold">Bank Details</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm">
                    {JSON.stringify(selectedPayout.vendors?.bank_details, null, 2)}
                  </pre>
                </div>
              </div>
              {selectedPayout.status === "pending" && (
                <div>
                  <Label>Admin Notes</Label>
                  <Textarea
                    placeholder="Add notes about your decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                  />
                </div>
              )}
              {selectedPayout.admin_notes && (
                <div>
                  <Label className="font-bold">Admin Notes</Label>
                  <p className="text-sm text-muted-foreground">{selectedPayout.admin_notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Close
            </Button>
            {selectedPayout?.status === "pending" && (
              <>
                <Button variant="destructive" onClick={handleReject}>
                  Reject
                </Button>
                <Button onClick={handleApprove}>Approve</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
