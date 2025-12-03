import { useState, useEffect } from "react";
import ProductCard from "@/components/products/ProductCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const FeaturedProducts = () => {
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data: newData, error: newError } = await supabase
        .from("products")
        .select(`
          *,
          vendors (store_name)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (newError) throw newError;
      setNewArrivals(newData || []);

      const { data: trendingData, error: trendingError } = await supabase
        .from("products")
        .select(`
          *,
          vendors (store_name)
        `)
        .eq("is_active", true)
        .order("sales_count", { ascending: false })
        .limit(8);

      if (trendingError) throw trendingError;
      setTrending(trendingData || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <Tabs defaultValue="new" className="w-full">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4">
            <div>
              <h2 className="font-heading font-bold text-4xl md:text-5xl mb-2">Featured Products</h2>
              <p className="text-muted-foreground text-lg">Discover our latest and trending items</p>
            </div>
            <TabsList className="bg-muted">
              <TabsTrigger value="new" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                New Arrivals
              </TabsTrigger>
              <TabsTrigger value="trending" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Trending
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new">
            {newArrivals.length === 0 ? (
              <p className="text-center text-muted-foreground py-20 text-lg">No products available</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {newArrivals.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.sale_price}
                    rating={product.rating_average || 0}
                    reviews={product.rating_count || 0}
                    image={(product.images && product.images[0]) || ""}
                    vendor={product.vendors?.store_name || ""}
                    badge="New"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="trending">
            {trending.length === 0 ? (
              <p className="text-center text-muted-foreground py-20 text-lg">No trending products yet</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {trending.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.sale_price}
                    rating={product.rating_average || 0}
                    reviews={product.rating_count || 0}
                    image={(product.images && product.images[0]) || ""}
                    vendor={product.vendors?.store_name || ""}
                    badge={product.sales_count > 10 ? "Trending" : undefined}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default FeaturedProducts;
