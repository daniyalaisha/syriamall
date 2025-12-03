import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function VendorSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_orders">New Order Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when you receive new orders</p>
            </div>
            <Switch id="email_orders" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_reviews">Review Notifications</Label>
              <p className="text-sm text-muted-foreground">Get notified when customers leave reviews</p>
            </div>
            <Switch id="email_reviews" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email_low_stock">Low Stock Alerts</Label>
              <p className="text-sm text-muted-foreground">Get notified when products run low</p>
            </div>
            <Switch id="email_low_stock" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms_orders">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive important updates via SMS</p>
            </div>
            <Switch id="sms_orders" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">Current Password</Label>
            <Input id="current_password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new_password">New Password</Label>
            <Input id="new_password" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm_password">Confirm New Password</Label>
            <Input id="confirm_password" type="password" />
          </div>
          <Button>Update Password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="flex gap-2">
              <Input value="sk_live_*********************" readOnly />
              <Button variant="outline">Regenerate</Button>
            </div>
            <p className="text-sm text-muted-foreground">Use this key to integrate with third-party applications</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
