import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Bell, Send } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminNotifications() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient: "all_users",
    title: "",
    message: "",
    type: "info",
  });

  const handleSendNotification = async () => {
    if (!formData.title || !formData.message) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch recipient user IDs based on selection
      let userIds: string[] = [];

      if (formData.recipient === "all_users") {
        const { data: profiles } = await supabase.from("profiles").select("id");
        userIds = profiles?.map((p) => p.id) || [];
      } else if (formData.recipient === "all_vendors") {
        const { data: vendors } = await supabase.from("vendors").select("user_id");
        userIds = vendors?.map((v) => v.user_id) || [];
      } else if (formData.recipient === "all_customers") {
        const { data: roles } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "customer");
        userIds = roles?.map((r) => r.user_id) || [];
      }

      // Create notification records for each user
      const notifications = userIds.map((userId) => ({
        user_id: userId,
        title: formData.title,
        message: formData.message,
        type: formData.type,
      }));

      const { error } = await supabase.from("notifications").insert(notifications);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Notification sent to ${userIds.length} users`,
      });

      // Reset form
      setFormData({
        recipient: "all_users",
        title: "",
        message: "",
        type: "info",
      });
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Error",
        description: "Failed to send notification",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Notification Center</h1>
        <p className="text-muted-foreground">Send notifications to users and vendors</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Send New Notification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Recipients *</Label>
              <RadioGroup
                value={formData.recipient}
                onValueChange={(value) => setFormData({ ...formData, recipient: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_users" id="all_users" />
                  <Label htmlFor="all_users">All Users</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_vendors" id="all_vendors" />
                  <Label htmlFor="all_vendors">All Vendors</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all_customers" id="all_customers" />
                  <Label htmlFor="all_customers">All Customers</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Notification Type *</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value })}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="info" id="info" />
                  <Label htmlFor="info">Info</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="success" id="success" />
                  <Label htmlFor="success">Success</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="warning" id="warning" />
                  <Label htmlFor="warning">Warning</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="error" id="error" />
                  <Label htmlFor="error">Error</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label>Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Notification title..."
              />
            </div>

            <div>
              <Label>Message *</Label>
              <Textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Notification message..."
                rows={5}
              />
            </div>

            <Button onClick={handleSendNotification} disabled={loading} className="w-full">
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Sending..." : "Send Notification"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notification Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div>
              <p className="font-semibold text-foreground mb-1">📱 Dashboard Alerts</p>
              <p>Notifications appear in users' dashboard notification panel</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">🎯 Targeting</p>
              <p>Send to all users, vendors only, or customers only</p>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">📝 Best Practices</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Keep titles under 50 characters</li>
                <li>Be clear and concise in messages</li>
                <li>Use appropriate notification types</li>
                <li>Avoid sending too frequently</li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-foreground mb-1">⚠️ Important</p>
              <p>Notifications cannot be recalled once sent. Double-check before sending.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
