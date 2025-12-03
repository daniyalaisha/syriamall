import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, MessageCircle, Loader2, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useVendor } from "@/hooks/useVendor";
import { useToast } from "@/hooks/use-toast";

interface Ticket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

const statusColors: Record<string, string> = {
  open: "bg-yellow-500",
  in_progress: "bg-blue-500",
  resolved: "bg-green-500",
  closed: "bg-muted",
};

const priorityColors: Record<string, string> = {
  low: "bg-muted",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  urgent: "bg-red-500",
};

export default function VendorSupport() {
  const { vendor } = useVendor();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "medium",
    message: "",
  });

  useEffect(() => {
    if (vendor?.id) {
      fetchTickets();
    }
  }, [vendor?.id]);

  const fetchTickets = async () => {
    if (!vendor?.id) return;

    try {
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("vendor_id", vendor.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTickets(data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!vendor?.id || !newTicket.subject || !newTicket.message) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from("support_tickets").insert({
        vendor_id: vendor.id,
        subject: newTicket.subject,
        message: newTicket.message,
        priority: newTicket.priority,
        status: "open",
      });

      if (error) throw error;

      toast({
        title: "Ticket Created",
        description: "Your support ticket has been submitted successfully.",
      });

      setNewTicket({ subject: "", priority: "medium", message: "" });
      setCreateDialogOpen(false);
      fetchTickets();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const viewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support & Help</h1>
          <p className="text-muted-foreground">Get help from our support team</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Brief description of your issue"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={newTicket.priority}
                  onValueChange={(value) => setNewTicket(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={newTicket.message}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Describe your issue in detail..."
                />
              </div>

              <Button onClick={handleCreateTicket} disabled={submitting} className="w-full">
                {submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
                Submit Ticket
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Your Support Tickets ({tickets.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No support tickets yet</p>
                <p className="text-sm">Create a ticket if you need help</p>
              </div>
            ) : (
              <div className="space-y-4">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="space-y-1">
                      <p className="font-bold">{ticket.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(ticket.created_at).toLocaleDateString()}
                      </p>
                      <div className="flex gap-2">
                        <Badge className={statusColors[ticket.status]}>
                          {ticket.status.replace("_", " ")}
                        </Badge>
                        <Badge className={priorityColors[ticket.priority]}>
                          {ticket.priority}
                        </Badge>
                      </div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => viewTicket(ticket)}>
                      <MessageCircle className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Help</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Contact Support</h3>
              <p className="text-sm text-muted-foreground">Phone: 03xx-xxxxxxx</p>
              <p className="text-sm text-muted-foreground">Email: support@syriamall.com</p>
            </div>
            <div>
              <h3 className="font-medium mb-2">Response Time</h3>
              <p className="text-sm text-muted-foreground">We typically respond within 24-48 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knowledge Base</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-bold">Getting Started</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">• How to add products</li>
                <li className="hover:text-foreground cursor-pointer">• Managing orders</li>
                <li className="hover:text-foreground cursor-pointer">• Setting up your store</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Payments</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">• Understanding commissions</li>
                <li className="hover:text-foreground cursor-pointer">• Withdrawal process</li>
                <li className="hover:text-foreground cursor-pointer">• Payment methods</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Shipping</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">• Shipping policies</li>
                <li className="hover:text-foreground cursor-pointer">• Tracking orders</li>
                <li className="hover:text-foreground cursor-pointer">• Returns & refunds</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-bold">Account</h3>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li className="hover:text-foreground cursor-pointer">• Profile settings</li>
                <li className="hover:text-foreground cursor-pointer">• Security & privacy</li>
                <li className="hover:text-foreground cursor-pointer">• Notifications</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ticket Detail Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
          </DialogHeader>
          {selectedTicket && (
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-muted-foreground text-xs">Subject</Label>
                <p className="font-medium">{selectedTicket.subject}</p>
              </div>
              <div className="flex gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Status</Label>
                  <Badge className={statusColors[selectedTicket.status]}>
                    {selectedTicket.status.replace("_", " ")}
                  </Badge>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Priority</Label>
                  <Badge className={priorityColors[selectedTicket.priority]}>
                    {selectedTicket.priority}
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Created</Label>
                <p className="text-sm">{new Date(selectedTicket.created_at).toLocaleString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Your Message</Label>
                <div className="bg-muted p-3 rounded-lg mt-1">
                  <p className="text-sm">{selectedTicket.message}</p>
                </div>
              </div>
              {selectedTicket.admin_response && (
                <div>
                  <Label className="text-muted-foreground text-xs">Admin Response</Label>
                  <div className="bg-primary/10 p-3 rounded-lg mt-1 border border-primary/20">
                    <p className="text-sm">{selectedTicket.admin_response}</p>
                  </div>
                </div>
              )}
              {!selectedTicket.admin_response && (
                <p className="text-sm text-muted-foreground italic">Awaiting admin response...</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
