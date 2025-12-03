import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import electronicsImg from "@/assets/category-electronics.jpg";
import fashionImg from "@/assets/category-fashion.jpg";
import homeImg from "@/assets/category-home.jpg";
import beautyImg from "@/assets/category-beauty.jpg";

const categoryImages: Record<string, string> = {
  electronics: electronicsImg,
  fashion: fashionImg,
  "home-living": homeImg,
  beauty: beautyImg,
};

const CategoryGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("is_active", true)
        .is("parent_id", null)
        .order("display_order", { ascending: true })
        .limit(4);

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-heading font-bold text-5xl md:text-6xl mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Shop by Category
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Discover premium products across our curated categories
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {categories.map((category, index) => {
            const categoryImage = categoryImages[category.slug];
            
            return (
              <Card
                key={category.id}
                className="group hover:shadow-2xl transition-all duration-500 cursor-pointer border-2 hover:border-primary/40 overflow-hidden relative"
                onClick={() => navigate(`/category/${category.slug}`)}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {/* Category Image Background */}
                <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
                  {categoryImage && (
                    <img 
                      src={categoryImage} 
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                <CardContent className="p-8 md:p-10 text-center relative">
                  <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg backdrop-blur-sm">
                    <span className="text-5xl md:text-6xl">{category.icon || "📦"}</span>
                  </div>
                  <h3 className="font-heading font-bold text-xl md:text-2xl mb-2 group-hover:text-primary transition-colors">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {category.description}
                    </p>
                  )}
                  <div className="mt-4 inline-flex items-center gap-2 text-primary font-semibold text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default CategoryGrid;
