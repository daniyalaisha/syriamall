-- Insert main categories only if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'electronics') THEN
    INSERT INTO public.categories (name, slug, description, is_active, display_order, parent_id)
    VALUES ('Electronics', 'electronics', 'Discover the latest in technology and electronics', true, 1, NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'fashion') THEN
    INSERT INTO public.categories (name, slug, description, is_active, display_order, parent_id)
    VALUES ('Fashion', 'fashion', 'Trendy clothing and accessories for everyone', true, 2, NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'home-living') THEN
    INSERT INTO public.categories (name, slug, description, is_active, display_order, parent_id)
    VALUES ('Home & Living', 'home-living', 'Everything you need for your home', true, 3, NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'beauty') THEN
    INSERT INTO public.categories (name, slug, description, is_active, display_order, parent_id)
    VALUES ('Beauty', 'beauty', 'Beauty and personal care products', true, 4, NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'sports') THEN
    INSERT INTO public.categories (name, slug, description, is_active, display_order, parent_id)
    VALUES ('Sports', 'sports', 'Sports equipment and fitness gear', true, 5, NULL);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'toys-games') THEN
    INSERT INTO public.categories (name, slug, description, is_active, display_order, parent_id)
    VALUES ('Toys & Games', 'toys-games', 'Fun toys and games for all ages', true, 6, NULL);
  END IF;
END $$;

-- Insert sub-categories
DO $$
DECLARE
  electronics_id uuid;
  fashion_id uuid;
  home_living_id uuid;
  beauty_id uuid;
  sports_id uuid;
  toys_games_id uuid;
BEGIN
  SELECT id INTO electronics_id FROM public.categories WHERE slug = 'electronics';
  SELECT id INTO fashion_id FROM public.categories WHERE slug = 'fashion';
  SELECT id INTO home_living_id FROM public.categories WHERE slug = 'home-living';
  SELECT id INTO beauty_id FROM public.categories WHERE slug = 'beauty';
  SELECT id INTO sports_id FROM public.categories WHERE slug = 'sports';
  SELECT id INTO toys_games_id FROM public.categories WHERE slug = 'toys-games';

  -- Electronics sub-categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'mobile-phones') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Mobile Phones', 'mobile-phones', electronics_id, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'laptops-computers') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Laptops & Computers', 'laptops-computers', electronics_id, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'cameras') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Cameras', 'cameras', electronics_id, true, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'audio-headphones') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Audio & Headphones', 'audio-headphones', electronics_id, true, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'gaming') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Gaming', 'gaming', electronics_id, true, 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'smart-home') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Smart Home', 'smart-home', electronics_id, true, 6);
  END IF;

  -- Fashion sub-categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'mens-clothing') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Men''s Clothing', 'mens-clothing', fashion_id, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'womens-clothing') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Women''s Clothing', 'womens-clothing', fashion_id, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'kids-clothing') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Kids'' Clothing', 'kids-clothing', fashion_id, true, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'shoes') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Shoes', 'shoes', fashion_id, true, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'accessories') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Accessories', 'accessories', fashion_id, true, 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'bags-luggage') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Bags & Luggage', 'bags-luggage', fashion_id, true, 6);
  END IF;

  -- Home & Living sub-categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'furniture') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Furniture', 'furniture', home_living_id, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'kitchen-dining') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Kitchen & Dining', 'kitchen-dining', home_living_id, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'bedding-bath') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Bedding & Bath', 'bedding-bath', home_living_id, true, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'home-decor') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Home Decor', 'home-decor', home_living_id, true, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'storage-organization') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Storage & Organization', 'storage-organization', home_living_id, true, 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'lighting') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Lighting', 'lighting', home_living_id, true, 6);
  END IF;

  -- Beauty sub-categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'skincare') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Skincare', 'skincare', beauty_id, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'makeup') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Makeup', 'makeup', beauty_id, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'haircare') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Haircare', 'haircare', beauty_id, true, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'fragrances') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Fragrances', 'fragrances', beauty_id, true, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'bath-body') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Bath & Body', 'bath-body', beauty_id, true, 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'beauty-tools') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Beauty Tools', 'beauty-tools', beauty_id, true, 6);
  END IF;

  -- Sports sub-categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'fitness-equipment') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Fitness Equipment', 'fitness-equipment', sports_id, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'sports-wear') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Sports Wear', 'sports-wear', sports_id, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'outdoor-recreation') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Outdoor Recreation', 'outdoor-recreation', sports_id, true, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'cycling') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Cycling', 'cycling', sports_id, true, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'team-sports') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Team Sports', 'team-sports', sports_id, true, 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'yoga-pilates') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Yoga & Pilates', 'yoga-pilates', sports_id, true, 6);
  END IF;

  -- Toys & Games sub-categories
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'action-figures') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Action Figures', 'action-figures', toys_games_id, true, 1);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'board-games') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Board Games', 'board-games', toys_games_id, true, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'educational-toys') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Educational Toys', 'educational-toys', toys_games_id, true, 3);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'dolls-plush') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Dolls & Plush', 'dolls-plush', toys_games_id, true, 4);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'building-construction') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Building & Construction', 'building-construction', toys_games_id, true, 5);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = 'remote-control') THEN
    INSERT INTO public.categories (name, slug, parent_id, is_active, display_order)
    VALUES ('Remote Control', 'remote-control', toys_games_id, true, 6);
  END IF;
END $$;