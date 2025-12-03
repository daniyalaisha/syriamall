import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<any>({});

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from("system_settings").select("*");

      if (error) throw error;

      const settingsMap: any = {};
      data?.forEach((setting) => {
        const settingValue = setting.setting_value as any;
        settingsMap[setting.setting_key] = settingValue?.value || "";
      });

      setSettings(settingsMap);
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        title: "Error",
        description: "Failed to load settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: any) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("system_settings")
        .update({ setting_value: { value } })
        .eq("setting_key", key);

      if (error) throw error;

      toast({ title: "Success", description: "Setting updated successfully" });
      setSettings({ ...settings, [key]: value });
    } catch (error) {
      console.error("Error updating setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = async (settingsToSave: { [key: string]: any }) => {
    setSaving(true);
    try {
      await Promise.all(
        Object.entries(settingsToSave).map(([key, value]) =>
          supabase
            .from("system_settings")
            .update({ setting_value: { value } })
            .eq("setting_key", key)
        )
      );

      toast({ title: "Success", description: "Settings saved successfully" });
      fetchSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Manage platform configuration and settings</p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic platform information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site-name">Website Name</Label>
                <Input
                  id="site-name"
                  value={settings.site_name || ""}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  placeholder="SyriaMall"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="site-email">Contact Email</Label>
                <Input
                  id="site-email"
                  type="email"
                  value={settings.site_email || ""}
                  onChange={(e) => setSettings({ ...settings, site_email: e.target.value })}
                  placeholder="info@syriamall.com"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="site-phone">Contact Phone</Label>
                <Input
                  id="site-phone"
                  value={settings.site_phone || ""}
                  onChange={(e) => setSettings({ ...settings, site_phone: e.target.value })}
                  placeholder="+963 11 1234567"
                />
              </div>

              <Button
                onClick={() =>
                  handleSave({
                    site_name: settings.site_name,
                    site_email: settings.site_email,
                    site_phone: settings.site_phone,
                  })
                }
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save General Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commission & Fees</CardTitle>
              <CardDescription>Configure platform commission and charges</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="default-commission">Default Commission (%)</Label>
                <Input
                  id="default-commission"
                  type="number"
                  value={settings.default_commission || ""}
                  onChange={(e) =>
                    setSettings({ ...settings, default_commission: e.target.value })
                  }
                  placeholder="10"
                />
                <p className="text-sm text-muted-foreground">
                  Percentage taken from each sale (can be overridden per vendor)
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="delivery-charge">Delivery Charge (SYP)</Label>
                <Input
                  id="delivery-charge"
                  type="number"
                  value={settings.delivery_charge || ""}
                  onChange={(e) => setSettings({ ...settings, delivery_charge: e.target.value })}
                  placeholder="5000"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="tax-percentage">Tax Percentage (%)</Label>
                <Input
                  id="tax-percentage"
                  type="number"
                  value={settings.tax_percentage || ""}
                  onChange={(e) => setSettings({ ...settings, tax_percentage: e.target.value })}
                  placeholder="0"
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="payout-minimum">Minimum Payout Threshold (SYP)</Label>
                <Input
                  id="payout-minimum"
                  type="number"
                  value={settings.payout_minimum || ""}
                  onChange={(e) => setSettings({ ...settings, payout_minimum: e.target.value })}
                  placeholder="50000"
                />
                <p className="text-sm text-muted-foreground">
                  Minimum balance required for vendor payout requests
                </p>
              </div>

              <Button
                onClick={() =>
                  handleSave({
                    default_commission: settings.default_commission,
                    delivery_charge: settings.delivery_charge,
                    tax_percentage: settings.tax_percentage,
                    payout_minimum: settings.payout_minimum,
                  })
                }
                disabled={saving}
                className="w-full"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Save Financial Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
              <CardDescription>Configure available payment options</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Cash on Delivery</p>
                    <p className="text-sm text-muted-foreground">Payment upon delivery</p>
                  </div>
                  <Switch
                    checked={settings.payment_cod_enabled === true}
                    onCheckedChange={(checked) =>
                      updateSetting("payment_cod_enabled", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">Wallet Payments</p>
                    <p className="text-sm text-muted-foreground">Mobile payment services</p>
                  </div>
                  <Switch
                    checked={settings.payment_wallet_enabled === true}
                    onCheckedChange={(checked) =>
                      updateSetting("payment_wallet_enabled", checked)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Enable to take the platform offline for maintenance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                <div>
                  <p className="font-medium">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Platform will be inaccessible to regular users
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode === true}
                  onCheckedChange={(checked) =>
                    updateSetting("maintenance_mode", checked)
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
