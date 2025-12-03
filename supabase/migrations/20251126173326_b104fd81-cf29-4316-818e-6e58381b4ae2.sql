-- Update the handle_new_user function to auto-assign admin role for admin@testing.com
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if this is the super admin email
  IF NEW.email = 'admin@testing.com' THEN
    -- Assign admin role to super admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role);
  ELSE
    -- Auto-assign customer role to all other users
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'customer'::app_role);
  END IF;
  
  -- Create profile for all users
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$function$;

-- If admin@testing.com already exists, assign admin role
DO $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Find the user ID for admin@testing.com
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@testing.com';
  
  -- If found, ensure they have admin role
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (admin_user_id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
END $$;