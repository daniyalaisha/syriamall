-- Add category_id to banners table for category-specific promotional banners
ALTER TABLE public.banners 
ADD COLUMN category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_banners_category_id ON public.banners(category_id);

-- Add comment
COMMENT ON COLUMN public.banners.category_id IS 'Optional category ID for category-specific banners. NULL means global banner.';