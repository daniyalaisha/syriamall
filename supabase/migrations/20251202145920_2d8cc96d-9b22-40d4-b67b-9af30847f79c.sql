-- Create admin invite codes table for secure Super Admin signup
CREATE TABLE public.admin_invite_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  created_by uuid REFERENCES auth.users(id),
  used_by uuid REFERENCES auth.users(id),
  used_at timestamp with time zone,
  expires_at timestamp with time zone NOT NULL,
  is_used boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_invite_codes ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage invite codes
CREATE POLICY "Admins can manage invite codes"
ON public.admin_invite_codes
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Anyone can check if a code is valid (for signup)
CREATE POLICY "Anyone can validate codes for signup"
ON public.admin_invite_codes
FOR SELECT
USING (is_used = false AND expires_at > now());

-- Function to validate and use an invite code
CREATE OR REPLACE FUNCTION public.use_admin_invite_code(
  _code text,
  _user_id uuid
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite_id uuid;
BEGIN
  -- Find valid invite code
  SELECT id INTO _invite_id
  FROM public.admin_invite_codes
  WHERE code = _code
    AND is_used = false
    AND expires_at > now();
  
  IF _invite_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Mark code as used
  UPDATE public.admin_invite_codes
  SET is_used = true,
      used_by = _user_id,
      used_at = now()
  WHERE id = _invite_id;
  
  -- Assign admin role to user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Insert initial invite code (valid for 7 days) - CHANGE THIS CODE IN PRODUCTION
INSERT INTO public.admin_invite_codes (code, expires_at)
VALUES ('SYRIAMALL-ADMIN-2024', now() + interval '7 days');