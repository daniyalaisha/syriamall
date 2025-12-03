import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

interface Address {
  id: string;
  full_name: string;
  phone: string;
  address_title: string;
  street_address: string;
  building_unit: string | null;
  city: string;
  state_province: string;
  country: string;
  postal_code: string | null;
  is_default: boolean;
}

interface AddressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  onSuccess: () => void;
}

const AddressDialog = ({ open, onOpenChange, address, onSuccess }: AddressDialogProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    address_title: "Home",
    street_address: "",
    building_unit: "",
    city: "",
    state_province: "",
    country: "Syria",
    postal_code: "",
    is_default: false,
  });

  useEffect(() => {
    if (address) {
      setFormData({
        full_name: address.full_name,
        phone: address.phone,
        address_title: address.address_title,
        street_address: address.street_address,
        building_unit: address.building_unit || "",
        city: address.city,
        state_province: address.state_province,
        country: address.country,
        postal_code: address.postal_code || "",
        is_default: address.is_default,
      });
    } else {
      setFormData({
        full_name: "",
        phone: "",
        address_title: "Home",
        street_address: "",
        building_unit: "",
        city: "",
        state_province: "",
        country: "Syria",
        postal_code: "",
        is_default: false,
      });
    }
  }, [address, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const addressData = {
        user_id: user?.id,
        full_name: formData.full_name,
        phone: formData.phone,
        address_title: formData.address_title,
        street_address: formData.street_address,
        building_unit: formData.building_unit || null,
        city: formData.city,
        state_province: formData.state_province,
        country: formData.country,
        postal_code: formData.postal_code || null,
        is_default: formData.is_default,
      };

      if (address) {
        const { error } = await supabase
          .from("addresses")
          .update(addressData)
          .eq("id", address.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("addresses")
          .insert(addressData);

        if (error) throw error;
      }

      toast({
        title: "Success",
        description: address ? "Address updated successfully" : "Address added successfully",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{address ? "Edit Address" : "Add New Address"}</DialogTitle>
          <DialogDescription>
            {address ? "Update your shipping address" : "Add a new shipping address"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="full_name">Full Name *</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address_title">Address Title *</Label>
              <Select
                value={formData.address_title}
                onValueChange={(value) => setFormData({ ...formData, address_title: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Home">Home</SelectItem>
                  <SelectItem value="Office">Office</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="street_address">Street Address *</Label>
              <Input
                id="street_address"
                value={formData.street_address}
                onChange={(e) => setFormData({ ...formData, street_address: e.target.value })}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="building_unit">Building / Unit / Flat #</Label>
              <Input
                id="building_unit"
                value={formData.building_unit}
                onChange={(e) => setFormData({ ...formData, building_unit: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="state_province">State / Province *</Label>
                <Input
                  id="state_province"
                  value={formData.state_province}
                  onChange={(e) => setFormData({ ...formData, state_province: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="postal_code">Postal / ZIP Code</Label>
                <Input
                  id="postal_code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="is_default">Set as default address</Label>
              <Switch
                id="is_default"
                checked={formData.is_default}
                onCheckedChange={(checked) => setFormData({ ...formData, is_default: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Address"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddressDialog;
