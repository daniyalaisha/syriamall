import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface WishlistItem {
  id: string;
  product_id: string;
  product?: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    images: any;
    vendor_id: string;
    rating_average: number;
    rating_count: number;
  };
}

export const useWishlist = () => {
  const { user } = useAuth();
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    if (!user) {
      setWishlistItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("wishlist_items")
        .select(`
          id,
          product_id,
          product:products (
            id,
            name,
            price,
            sale_price,
            images,
            vendor_id,
            rating_average,
            rating_count
          )
        `)
        .eq("user_id", user.id);

      if (error) throw error;
      setWishlistItems(data || []);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const isInWishlist = (productId: string) => {
    return wishlistItems.some((item) => item.product_id === productId);
  };

  const addToWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Please sign in to add items to wishlist");
      return;
    }

    try {
      const { error } = await supabase
        .from("wishlist_items")
        .insert({
          user_id: user.id,
          product_id: productId,
        });

      if (error) throw error;
      await fetchWishlist();
      toast.success("Added to wishlist");
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      toast.error("Failed to add to wishlist");
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", user.id)
        .eq("product_id", productId);

      if (error) throw error;
      await fetchWishlist();
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await removeFromWishlist(productId);
    } else {
      await addToWishlist(productId);
    }
  };

  return {
    wishlistItems,
    loading,
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    refetch: fetchWishlist,
  };
};
