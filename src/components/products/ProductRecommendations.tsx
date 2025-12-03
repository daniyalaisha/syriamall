import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RecommendationsProps {
  currentProductId: string;
  categoryId?: string;
}

const ProductRecommendations = ({ currentProductId, categoryId }: RecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [currentProductId, categoryId]);

  const fetchRecommendations = async () => {
    try {
      let query = supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .neq("id", currentProductId)
        .limit(4);

      if (categoryId) {
        query = query.eq("category_id", categoryId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setRecommendations(data || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || recommendations.length === 0) {
    return null;
  }

  return (
    <section className="py-12 bg-muted/30">
      <div className="container mx-auto px-4">
        <h2 className="font-heading font-bold text-2xl md:text-3xl mb-8">
          You May Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.sale_price || product.price}
              originalPrice={product.sale_price ? product.price : undefined}
              rating={product.rating_average || 0}
              reviews={product.rating_count || 0}
              image={product.images?.[0] || ""}
              vendor="SyriaMall"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRecommendations;
