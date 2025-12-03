import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Heart, Star, Truck, Shield, Loader2, Plus, Minus, ChevronRight, ZoomIn, MapPin, Clock, Package, Store, BadgeCheck, TrendingUp, HelpCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ProductCard from "@/components/products/ProductCard";
import ProductReviews from "@/components/products/ProductReviews";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    if (id) {
      fetchProduct();
      trackView();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(`
          *,
          vendors (store_name, id),
          categories (name, slug, id)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      setProduct(data);

      // Fetch related products
      if (data.category_id) {
        const { data: related } = await supabase
          .from("products")
          .select(`
            *,
            vendors (store_name)
          `)
          .eq("category_id", data.category_id)
          .eq("is_active", true)
          .neq("id", id)
          .limit(4);

        setRelatedProducts(related || []);
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      toast.error("Product not found");
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  const trackView = async () => {
    try {
      // Increment views count
      const { error } = await supabase
        .from("products")
        .update({ views_count: product?.views_count + 1 || 1 })
        .eq("id", id);
    } catch (error) {
      // Silent fail for analytics
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product.id, quantity);
    }
  };

  const handleToggleWishlist = () => {
    if (id) {
      toggleWishlist(id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  const inWishlist = isInWishlist(id || "");
  const discount = product.sale_price
    ? Math.round(((product.price - product.sale_price) / product.price) * 100)
    : 0;

  const displayPrice = product.sale_price || product.price;
  const images = product.images || [];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-6 md:py-8">
          {/* Premium Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm mb-8 flex-wrap">
            <span 
              className="text-muted-foreground hover:text-primary cursor-pointer transition-colors font-medium" 
              onClick={() => navigate("/")}
            >
              Home
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span 
              className="text-muted-foreground hover:text-primary cursor-pointer transition-colors font-medium"
              onClick={() => product.categories?.slug && navigate(`/category/${product.categories.slug}`)}
            >
              {product.categories?.name || "Products"}
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground font-semibold truncate max-w-[200px] md:max-w-none">
              {product.name}
            </span>
          </nav>

          {/* Premium Product Layout */}
          <div className="grid lg:grid-cols-12 gap-8 mb-12">
            {/* Image Gallery Section - 7 columns */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Image with Zoom */}
              <Card className="overflow-hidden border-2 relative group">
                <div 
                  className="aspect-square bg-muted/30 relative cursor-zoom-in overflow-hidden"
                  onClick={() => setIsZoomed(!isZoomed)}
                >
                  {images.length > 0 && images[selectedImage] ? (
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      className={`w-full h-full object-contain transition-transform duration-300 ${
                        isZoomed ? 'scale-150' : 'scale-100 group-hover:scale-105'
                      }`}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="h-32 w-32 text-muted-foreground/30" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-background/80 backdrop-blur-sm rounded-full p-2">
                    <ZoomIn className="h-5 w-5 text-foreground" />
                  </div>
                  {product.sale_price && (
                    <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground text-base px-3 py-1.5 font-bold">
                      {discount}% OFF
                    </Badge>
                  )}
                </div>
              </Card>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="grid grid-cols-5 gap-3">
                  {images.slice(0, 5).map((img: string, i: number) => (
                    <Card
                      key={i}
                      className={`cursor-pointer overflow-hidden transition-all hover:border-primary ${
                        selectedImage === i ? 'border-2 border-primary ring-2 ring-primary/20' : 'border-2'
                      }`}
                      onClick={() => setSelectedImage(i)}
                    >
                      <div className="aspect-square bg-muted/30 p-2">
                        <img 
                          src={img} 
                          alt={`${product.name} ${i + 1}`} 
                          className="w-full h-full object-contain" 
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section - 5 columns */}
            <div className="lg:col-span-5 space-y-6">
              {/* Product Title & Rating */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="font-heading font-bold text-3xl md:text-4xl leading-tight">
                    {product.name}
                  </h1>
                  <Button
                    size="icon"
                    variant={inWishlist ? "default" : "outline"}
                    onClick={handleToggleWishlist}
                    className="shrink-0"
                  >
                    <Heart className={`h-5 w-5 ${inWishlist ? "fill-current" : ""}`} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${
                            i < Math.floor(product.rating_average || 0)
                              ? "fill-primary text-primary"
                              : "text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="font-semibold">
                      {product.rating_average?.toFixed(1) || "0.0"}
                    </span>
                    <span className="text-muted-foreground">
                      ({product.rating_count || 0} reviews)
                    </span>
                  </div>
                  {product.sales_count > 0 && (
                    <>
                      <Separator orientation="vertical" className="h-4" />
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">{product.sales_count} sold</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Separator />

              {/* Premium Pricing Section */}
              <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
                <CardContent className="p-6">
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-heading font-bold text-5xl text-primary">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {product.sale_price && (
                      <span className="text-2xl text-muted-foreground line-through">
                        ${product.price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Inclusive of all taxes
                  </p>
                </CardContent>
              </Card>

              {/* Stock Status */}
              <div className="flex items-center gap-2">
                <Package className={`h-5 w-5 ${product.stock_quantity > 10 ? 'text-green-600' : 'text-destructive'}`} />
                <span className={`font-semibold ${product.stock_quantity > 10 ? 'text-green-600' : 'text-destructive'}`}>
                  {product.stock_quantity > 0
                    ? product.stock_quantity > 10
                      ? "In Stock - Ready to Ship"
                      : `Only ${product.stock_quantity} left in stock`
                    : "Out of Stock"}
                </span>
              </div>

              {/* Quantity Selector & Add to Cart */}
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-foreground min-w-[80px]">Quantity:</span>
                  <div className="flex items-center border-2 border-border rounded-lg overflow-hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 px-4 rounded-none hover:bg-primary/10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-16 text-center font-bold text-lg">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-12 px-4 rounded-none hover:bg-primary/10"
                      onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                      disabled={quantity >= product.stock_quantity}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button
                  size="lg"
                  className="w-full h-14 text-lg font-bold"
                  onClick={handleAddToCart}
                  disabled={product.stock_quantity === 0}
                >
                  <ShoppingCart className="mr-2 h-6 w-6" />
                  Add to Cart
                </Button>
              </div>

              <Separator />

              {/* Vendor Information Card */}
              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Store className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Sold by</p>
                        <p 
                          className="font-bold text-lg text-primary cursor-pointer hover:underline"
                          onClick={() => navigate(`/vendor/${product.vendors?.id}`)}
                        >
                          {product.vendors?.store_name}
                        </p>
                      </div>
                    </div>
                    <BadgeCheck className="h-6 w-6 text-green-600" />
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/vendor/${product.vendors?.id}`)}
                  >
                    Visit Store
                  </Button>
                </CardContent>
              </Card>

              {/* Delivery & Services Info */}
              <Card className="border-2">
                <CardContent className="p-6 space-y-4">
                  <h3 className="font-bold text-lg mb-4">Delivery & Services</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Truck className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Free Delivery</p>
                        <p className="text-sm text-muted-foreground">On orders over $50</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Fast Shipping</p>
                        <p className="text-sm text-muted-foreground">Delivery in 3-5 business days</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Secure Payment</p>
                        <p className="text-sm text-muted-foreground">100% secure transactions</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Easy Returns</p>
                        <p className="text-sm text-muted-foreground">7-day return policy</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Product Description */}
          <Card className="mb-12">
            <CardContent className="p-8">
              <h2 className="font-heading font-bold text-2xl mb-4">Product Description</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">
                {product.description || "No description available for this product."}
              </p>
            </CardContent>
          </Card>

          {/* FAQs Section */}
          {product.faqs && product.faqs.length > 0 && (
            <Card className="mb-12">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <HelpCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-heading font-bold text-2xl">Frequently Asked Questions</h2>
                    <p className="text-muted-foreground">Get answers to common questions about this product</p>
                  </div>
                </div>
                <Accordion type="single" collapsible className="w-full">
                  {product.faqs.map((faq: any, index: number) => (
                    <AccordionItem key={index} value={`faq-${index}`} className="border-2 rounded-lg px-6 mb-3">
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="text-left font-semibold text-base">{faq.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          )}

          {/* Reviews Section */}
          <div className="mb-12">
            <ProductReviews productId={id || ""} />
          </div>

          {/* Related Products Carousel */}
          {relatedProducts.length > 0 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-heading font-bold text-3xl mb-2">You May Also Like</h2>
                  <p className="text-muted-foreground">Similar products from the same category</p>
                </div>
              </div>
              
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-4">
                  {relatedProducts.map((relatedProduct) => (
                    <CarouselItem key={relatedProduct.id} className="pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                      <ProductCard
                        id={relatedProduct.id}
                        name={relatedProduct.name}
                        price={relatedProduct.price}
                        originalPrice={relatedProduct.sale_price}
                        rating={relatedProduct.rating_average || 0}
                        reviews={relatedProduct.rating_count || 0}
                        image={(relatedProduct.images && relatedProduct.images[0]) || ""}
                        vendor={relatedProduct.vendors?.store_name || ""}
                      />
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="-left-12 hidden lg:flex" />
                <CarouselNext className="-right-12 hidden lg:flex" />
              </Carousel>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetail;
