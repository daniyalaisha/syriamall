-- Create storage buckets for images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('vendor-logos', 'vendor-logos', true, 2097152, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('vendor-banners', 'vendor-banners', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('user-avatars', 'user-avatars', true, 1048576, ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]);

-- RLS policies for product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Vendors can upload product images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'product-images' 
  AND auth.uid() IN (SELECT user_id FROM vendors)
);

CREATE POLICY "Vendors can update their product images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IN (SELECT user_id FROM vendors)
);

CREATE POLICY "Vendors can delete their product images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'product-images'
  AND auth.uid() IN (SELECT user_id FROM vendors)
);

-- RLS policies for vendor logos
CREATE POLICY "Public can view vendor logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-logos');

CREATE POLICY "Vendors can upload their logo"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-logos'
  AND auth.uid() IN (SELECT user_id FROM vendors)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can update their logo"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-logos'
  AND auth.uid() IN (SELECT user_id FROM vendors)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can delete their logo"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-logos'
  AND auth.uid() IN (SELECT user_id FROM vendors)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policies for vendor banners
CREATE POLICY "Public can view vendor banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'vendor-banners');

CREATE POLICY "Vendors can upload their banner"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'vendor-banners'
  AND auth.uid() IN (SELECT user_id FROM vendors)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can update their banner"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'vendor-banners'
  AND auth.uid() IN (SELECT user_id FROM vendors)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Vendors can delete their banner"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'vendor-banners'
  AND auth.uid() IN (SELECT user_id FROM vendors)
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS policies for user avatars
CREATE POLICY "Public can view user avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload their avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'user-avatars'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Create cart_items table for shopping cart persistence
CREATE TABLE public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  variant_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id, variant_details)
);

-- Enable RLS on cart_items
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for cart_items
CREATE POLICY "Users can view their own cart items"
ON public.cart_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items"
ON public.cart_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items"
ON public.cart_items FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items"
ON public.cart_items FOR DELETE
USING (auth.uid() = user_id);

-- Trigger to update updated_at on cart_items
CREATE TRIGGER update_cart_items_updated_at
BEFORE UPDATE ON public.cart_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create wishlist table
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, product_id)
);

-- Enable RLS on wishlist_items
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;

-- RLS policies for wishlist_items
CREATE POLICY "Users can view their own wishlist items"
ON public.wishlist_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own wishlist items"
ON public.wishlist_items FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own wishlist items"
ON public.wishlist_items FOR DELETE
USING (auth.uid() = user_id);