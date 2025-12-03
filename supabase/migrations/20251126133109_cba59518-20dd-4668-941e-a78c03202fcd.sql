-- Remove the security definer view and adjust vendors RLS policy instead
DROP VIEW IF EXISTS public.vendors_public;

-- Update the vendors RLS policy to properly restrict column access
-- Note: RLS works at row level, so we'll handle column filtering in application code
-- But we can at least ensure unauthenticated users can only see approved vendors
DROP POLICY IF EXISTS "Public can view limited vendor data" ON public.vendors;

CREATE POLICY "Public can view approved vendors basic info"
  ON public.vendors FOR SELECT
  USING (
    CASE 
      -- Authenticated users who own the vendor or are admins see everything
      WHEN auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role) THEN true
      -- Unauthenticated or other users only see approved vendors
      WHEN is_approved = true THEN true
      ELSE false
    END
  );

-- Add comment to remind developers to filter sensitive columns in queries
COMMENT ON TABLE public.vendors IS 'SECURITY NOTE: When querying for public vendor display, only select non-sensitive columns: id, user_id, store_name, store_logo, store_banner, store_description, working_hours, social_links, created_at, is_approved. Do NOT expose: email, phone, address, bank_details, wallet_balance, commission_rate.';