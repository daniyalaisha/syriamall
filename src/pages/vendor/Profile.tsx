import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Loader2, Save } from "lucide-react";
import { useVendor } from "@/hooks/useVendor";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function VendorProfile() {
  const { vendor, application, loading, updateVendor, refreshVendor } = useVendor();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    store_name: "",
    store_description: "",
    phone: "",
    email: "",
    address: "",
    working_hours: "",
    facebook: "",
    instagram: "",
    twitter: "",
    website: "",
    bank_name: "",
    account_title: "",
    account_number: "",
  });

  useEffect(() => {
    if (vendor) {
      const socialLinks = vendor.social_links || {};
      const bankDetails = vendor.bank_details || {};
      
      setFormData({
        store_name: vendor.store_name || "",
        store_description: vendor.store_description || "",
        phone: vendor.phone || "",
        email: vendor.email || "",
        address: vendor.address || "",
        working_hours: vendor.working_hours || "",
        facebook: socialLinks.facebook || "",
        instagram: socialLinks.instagram || "",
        twitter: socialLinks.twitter || "",
        website: socialLinks.website || "",
        bank_name: bankDetails.bank_name || "",
        account_title: bankDetails.account_title || "",
        account_number: bankDetails.account_number || "",
      });
    }
  }, [vendor]);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await updateVendor({
      store_name: formData.store_name,
      store_description: formData.store_description,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      working_hours: formData.working_hours,
      social_links: {
        facebook: formData.facebook,
        instagram: formData.instagram,
        twitter: formData.twitter,
        website: formData.website,
      },
      bank_details: {
        bank_name: formData.bank_name,
        account_title: formData.account_title,
        account_number: formData.account_number,
      },
    });

    setSaving(false);
    
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your store profile has been saved.",
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vendor) return;

    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${vendor.id}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('vendor-logos')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('vendor-logos')
        .getPublicUrl(filePath);

      await updateVendor({ store_logo: urlData.publicUrl });
      refreshVendor();
      
      toast({
        title: "Logo Uploaded",
        description: "Your store logo has been updated.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    }
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
      <div>
        <h1 className="text-3xl font-bold">Store Profile</h1>
        <p className="text-muted-foreground">Manage your store information</p>
      </div>

      {/* Application Details Card */}
      {application && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle>Application Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <Label className="text-muted-foreground text-xs">Full Name</Label>
                <p className="font-medium">{application.full_name}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Email</Label>
                <p className="font-medium">{application.email}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Phone</Label>
                <p className="font-medium">{application.phone}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Business Type</Label>
                <p className="font-medium">{application.business_type}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Main Category</Label>
                <p className="font-medium">{application.main_category}</p>
              </div>
              {application.sub_category && (
                <div>
                  <Label className="text-muted-foreground text-xs">Sub Category</Label>
                  <p className="font-medium">{application.sub_category}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs">City</Label>
                <p className="font-medium">{application.city || "N/A"}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Country</Label>
                <p className="font-medium">{application.country || "N/A"}</p>
              </div>
              {application.ntn_number && (
                <div>
                  <Label className="text-muted-foreground text-xs">NTN Number</Label>
                  <p className="font-medium">{application.ntn_number}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground text-xs">Status</Label>
                <p className="font-medium capitalize text-green-600">{application.status}</p>
              </div>
              <div>
                <Label className="text-muted-foreground text-xs">Applied On</Label>
                <p className="font-medium">
                  {application.created_at ? new Date(application.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store_name">Store Name *</Label>
              <Input 
                id="store_name" 
                value={formData.store_name}
                onChange={(e) => setFormData(prev => ({ ...prev, store_name: e.target.value }))}
                placeholder="Your Store Name" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Store Description</Label>
              <Textarea 
                id="description" 
                rows={4} 
                value={formData.store_description}
                onChange={(e) => setFormData(prev => ({ ...prev, store_description: e.target.value }))}
                placeholder="Tell customers about your store" 
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="store@example.com" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Store Address</Label>
              <Textarea 
                id="address" 
                rows={2} 
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Enter full address" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="working_hours">Working Hours</Label>
              <Input 
                id="working_hours" 
                value={formData.working_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, working_hours: e.target.value }))}
                placeholder="e.g., Mon-Fri: 9AM-5PM" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Logo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-square rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {vendor?.store_logo ? (
                  <img src={vendor.store_logo} alt="Store Logo" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <Button variant="outline" className="w-full" asChild>
                  <span>Upload Logo</span>
                </Button>
                <input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                />
              </Label>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Store Banner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                {vendor?.store_banner ? (
                  <img src={vendor.store_banner} alt="Store Banner" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="h-12 w-12 text-muted-foreground" />
                )}
              </div>
              <Button variant="outline" className="w-full">Upload Banner</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Links</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="facebook">Facebook</Label>
            <Input 
              id="facebook" 
              value={formData.facebook}
              onChange={(e) => setFormData(prev => ({ ...prev, facebook: e.target.value }))}
              placeholder="https://facebook.com/yourstore" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="instagram">Instagram</Label>
            <Input 
              id="instagram" 
              value={formData.instagram}
              onChange={(e) => setFormData(prev => ({ ...prev, instagram: e.target.value }))}
              placeholder="https://instagram.com/yourstore" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="twitter">Twitter</Label>
            <Input 
              id="twitter" 
              value={formData.twitter}
              onChange={(e) => setFormData(prev => ({ ...prev, twitter: e.target.value }))}
              placeholder="https://twitter.com/yourstore" 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input 
              id="website" 
              value={formData.website}
              onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://yourstore.com" 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bank Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank Name</Label>
            <Input 
              id="bank_name" 
              value={formData.bank_name}
              onChange={(e) => setFormData(prev => ({ ...prev, bank_name: e.target.value }))}
              placeholder="Enter bank name" 
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="account_title">Account Holder Name</Label>
              <Input 
                id="account_title" 
                value={formData.account_title}
                onChange={(e) => setFormData(prev => ({ ...prev, account_title: e.target.value }))}
                placeholder="Full name" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input 
                id="account_number" 
                value={formData.account_number}
                onChange={(e) => setFormData(prev => ({ ...prev, account_number: e.target.value }))}
                placeholder="Account number" 
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
        <Button variant="outline" onClick={() => refreshVendor()}>Cancel</Button>
      </div>
    </div>
  );
}
