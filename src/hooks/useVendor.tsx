import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

interface Vendor {
  id: string;
  user_id: string;
  store_name: string;
  store_logo: string | null;
  store_banner: string | null;
  store_description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  working_hours: string | null;
  social_links: Record<string, string> | null;
  bank_details: Record<string, string> | null;
  commission_rate: number | null;
  wallet_balance: number | null;
  is_approved: boolean | null;
}

interface VendorApplication {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  store_name: string;
  store_description: string | null;
  store_address: string | null;
  city: string | null;
  country: string | null;
  business_type: string;
  main_category: string;
  sub_category: string | null;
  bank_name: string;
  account_title: string;
  account_number: string;
  ntn_number: string | null;
  status: string;
  created_at: string | null;
}

export function useVendor() {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [application, setApplication] = useState<VendorApplication | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchVendorData();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const fetchVendorData = async () => {
    if (!user?.id) return;

    try {
      // Fetch vendor record
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (vendorError) throw vendorError;
      
      if (vendorData) {
        setVendor({
          ...vendorData,
          social_links: vendorData.social_links as Record<string, string> | null,
          bank_details: vendorData.bank_details as Record<string, string> | null,
        });
      }

      // Fetch vendor application for additional details
      const { data: appData, error: appError } = await supabase
        .from("vendor_applications")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (appError) throw appError;
      setApplication(appData);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateVendor = async (updates: Partial<Vendor>) => {
    if (!vendor?.id) return { error: "No vendor found" };

    try {
      const { error } = await supabase
        .from("vendors")
        .update(updates)
        .eq("id", vendor.id);

      if (error) throw error;
      
      setVendor(prev => prev ? { ...prev, ...updates } : null);
      return { error: null };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  return {
    vendor,
    application,
    loading,
    updateVendor,
    refreshVendor: fetchVendorData,
  };
}
