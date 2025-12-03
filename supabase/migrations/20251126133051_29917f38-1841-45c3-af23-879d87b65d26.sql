-- Fix 1: Create vendor_applications table for secure vendor signup workflow
CREATE TABLE public.vendor_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Personal Information
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  
  -- Store Information
  store_name TEXT NOT NULL,
  store_logo TEXT,
  store_banner TEXT,
  store_address TEXT,
  city TEXT,
  country TEXT,
  business_type TEXT NOT NULL,
  ntn_number TEXT,
  store_description TEXT,
  
  -- Product Details
  main_category TEXT NOT NULL,
  sub_category TEXT,
  planned_products INTEGER,
  pricing_range TEXT,
  
  -- Bank Information
  bank_name TEXT NOT NULL,
  account_title TEXT NOT NULL,
  account_number TEXT NOT NULL,
  
  -- Application Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  
  UNIQUE(user_id)
);

ALTER TABLE public.vendor_applications ENABLE ROW LEVEL SECURITY;

-- RLS for vendor_applications
CREATE POLICY "Users can insert their own application"
  ON public.vendor_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own application"
  ON public.vendor_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all applications"
  ON public.vendor_applications FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update applications"
  ON public.vendor_applications FOR UPDATE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Fix 2: Create secure public view for vendor data (only non-sensitive fields)
CREATE OR REPLACE VIEW public.vendors_public AS
SELECT 
  id,
  user_id,
  store_name,
  store_logo,
  store_banner,
  store_description,
  working_hours,
  social_links,
  created_at,
  is_approved
FROM public.vendors
WHERE is_approved = true;

-- Fix 3: Update vendors RLS to restrict sensitive data exposure
DROP POLICY IF EXISTS "Public can view approved vendors" ON public.vendors;

CREATE POLICY "Public can view limited vendor data"
  ON public.vendors FOR SELECT
  USING (
    is_approved = true 
    AND (
      auth.uid() = user_id 
      OR has_role(auth.uid(), 'admin'::app_role)
    )
  );

-- Fix 4: Auto-assign customer role on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Auto-assign customer role to all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'customer'::app_role);
  
  -- Create profile
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix 5: Add RLS INSERT policies for orders
CREATE POLICY "Customers can create their own orders"
  ON public.orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Fix 6: Add RLS INSERT policies for order_items
CREATE POLICY "Users can create order items for their orders"
  ON public.order_items FOR INSERT
  WITH CHECK (
    order_id IN (
      SELECT id FROM public.orders 
      WHERE customer_id = auth.uid()
    )
  );

-- Function to approve vendor application and create vendor record
CREATE OR REPLACE FUNCTION public.approve_vendor_application(application_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  app_record RECORD;
BEGIN
  -- Get application details
  SELECT * INTO app_record FROM public.vendor_applications WHERE id = application_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found';
  END IF;
  
  -- Create vendor record
  INSERT INTO public.vendors (
    user_id,
    store_name,
    store_logo,
    store_banner,
    store_description,
    address,
    phone,
    email,
    bank_details,
    is_approved
  ) VALUES (
    app_record.user_id,
    app_record.store_name,
    app_record.store_logo,
    app_record.store_banner,
    app_record.store_description,
    app_record.store_address || ', ' || app_record.city || ', ' || app_record.country,
    app_record.phone,
    app_record.email,
    jsonb_build_object(
      'bank_name', app_record.bank_name,
      'account_title', app_record.account_title,
      'account_number', app_record.account_number
    ),
    true
  );
  
  -- Assign vendor role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (app_record.user_id, 'vendor'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update application status
  UPDATE public.vendor_applications
  SET status = 'approved',
      reviewed_at = NOW(),
      reviewed_by = auth.uid()
  WHERE id = application_id;
END;
$$;