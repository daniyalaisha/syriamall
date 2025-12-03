-- Add FAQ field to products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS faqs JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.products.faqs IS 'Array of FAQ items with question and answer fields';