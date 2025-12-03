import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ProductCard from "@/components/products/ProductCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Store, MapPin, Phone, Mail, Star, Package, BadgeCheck, Loader2, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VendorStore = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchVendorData();
    }
  }, [id]);

  useEffect(() => {
    filterProducts();
  }, [products, selectedCategory]);

  const fetchVendorData = async () => {
    try {
      // Fetch vendor details
      const { data: vendorData, error: vendorError } = await supabase
        .from("vendors")
        .select("*")
        .eq("id", id)
        .single();

      if (vendorError) throw vendorError;
      setVendor(vendorData);

      // Fetch vendor products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select(`
          *,
          categories (id, name, slug)
        `)
        .eq("vendor_id", id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;
      setProducts(productsData || []);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(productsData?.map((p) => p.categories?.id).filter(Boolean))
      ).map((categoryId) => {
        const product = productsData?.find((p) => p.categories?.id === categoryId);
        return product?.categories;
      }).filter(Boolean);

      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching vendor data:", error);
      toast.error("Failed to load vendor store");
    } finally {
      setLoading(false);
    }
  };

  const filterProducts = () => {
    if (selectedCategory === "all") {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(
        products.filter((p) => p.categories?.id === selectedCategory)
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Vendor Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The vendor you're looking for doesn't exist
            </p>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const averageRating = vendor.rating_average || 4.5;
  const reviewCount = vendor.review_count || 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        {/* Premium Vendor Banner */}
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-primary/10 via-primary/5 to-muted overflow-hidden">
          {vendor.store_banner && (
            <img
              src={vendor.store_banner}
              alt={vendor.store_name}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
        </div>

        <div className="container mx-auto px-4 -mt-32 relative z-10 pb-12">
          {/* Vendor Header Card */}
          <Card className="border-2 shadow-2xl mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                {/* Vendor Logo */}
                <div className="relative">
                  <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-background shadow-xl flex items-center justify-center overflow-hidden">
                    {vendor.store_logo ? (
                      <img
                        src={vendor.store_logo}
                        alt={vendor.store_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Store className="h-16 w-16 text-primary" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-green-600 rounded-full p-2">
                    <BadgeCheck className="h-6 w-6 text-white" />
                  </div>
                </div>

                {/* Vendor Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between flex-wrap gap-4 mb-3">
                    <div>
                      <h1 className="font-heading font-bold text-4xl mb-2">
                        {vendor.store_name}
                      </h1>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 px-4 py-2 rounded-lg">
                          <Star className="h-5 w-5 fill-primary text-primary" />
                          <span className="font-bold text-lg">{averageRating.toFixed(1)}</span>
                          <span className="text-muted-foreground text-sm">
                            ({reviewCount} reviews)
                          </span>
                        </div>
                        <Badge className="bg-green-600 text-white text-sm py-1.5 px-3">
                          Verified Vendor
                        </Badge>
                      </div>
                    </div>
                    <Button size="lg" className="font-semibold">
                      <Mail className="mr-2 h-5 w-5" />
                      Contact Store
                    </Button>
                  </div>

                  <p className="text-muted-foreground text-lg leading-relaxed mb-6 max-w-3xl">
                    {vendor.store_description || "Quality products and excellent service"}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Package className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{products.length}</p>
                        <p className="text-sm text-muted-foreground">Products</p>
                      </div>
                    </div>
                    {vendor.address && (
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{vendor.address}</p>
                          <p className="text-xs text-muted-foreground">Location</p>
                        </div>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{vendor.phone}</p>
                          <p className="text-xs text-muted-foreground">Contact</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="font-heading font-bold text-3xl mb-1">
                  Store Products
                </h2>
                <p className="text-muted-foreground">
                  Browse {filteredProducts.length} {selectedCategory === "all" ? "" : "filtered"} products
                </p>
              </div>
              {categories.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">Filter by:</span>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {filteredProducts.length === 0 ? (
              <Card className="border-2">
                <CardContent className="py-16 text-center">
                  <Package className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="font-bold text-xl mb-2">No Products Found</h3>
                  <p className="text-muted-foreground">
                    {selectedCategory === "all"
                      ? "This store doesn't have any products yet"
                      : "No products in this category"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.sale_price}
                    rating={product.rating_average || 0}
                    reviews={product.rating_count || 0}
                    image={(product.images && product.images[0]) || ""}
                    vendor={vendor.store_name}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default VendorStore;
