import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, ShoppingCart, X } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";
import { useCart } from "@/hooks/useCart";

const Wishlist = () => {
  const navigate = useNavigate();
  const { wishlistItems, loading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleMoveToCart = async (productId: string) => {
    await addToCart(productId, 1);
    await removeFromWishlist(productId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const isEmpty = wishlistItems.length === 0;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold">My Wishlist</h1>
          <p className="text-muted-foreground">
            {isEmpty ? "Save your favorite items for later" : `${wishlistItems.length} items saved`}
          </p>
        </div>

        {isEmpty ? (
          <Card className="p-12 text-center">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">Start adding products you love</p>
            <Button onClick={() => navigate("/")}>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Continue Shopping
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => {
              const product = item.product;
              if (!product) return null;

              const displayPrice = product.sale_price || product.price;
              const hasDiscount = product.sale_price && product.sale_price < product.price;

              return (
                <Card key={item.id} className="overflow-hidden group">
                  {/* Product Image */}
                  <div 
                    className="relative aspect-square bg-muted cursor-pointer overflow-hidden"
                    onClick={() => navigate(`/product/${product.id}`)}
                  >
                    <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 group-hover:scale-105 transition-transform">
                      📦
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(product.id);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4 space-y-3">
                    <h3 
                      className="font-semibold text-sm line-clamp-2 hover:text-primary cursor-pointer"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {product.name}
                    </h3>

                    {/* Rating */}
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{product.rating_average?.toFixed(1) || "0.0"}</span>
                      <span className="text-muted-foreground">
                        ({product.rating_count || 0} reviews)
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-lg text-primary">
                        ${displayPrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => handleMoveToCart(product.id)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Move to Cart
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        size="sm"
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
