import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  vendor: string;
  badge?: string;
}

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  rating,
  reviews,
  image,
  vendor,
  badge,
}: ProductCardProps) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const inWishlist = isInWishlist(id);
  
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(id, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist(id);
  };

  return (
    <Card className="group hover:shadow-xl transition-all duration-300 overflow-hidden border border-border hover:border-primary/30">
      <NavLink to={`/product/${id}`}>
        <div className="relative aspect-square overflow-hidden bg-muted">
          {badge && (
            <div className="absolute top-3 left-3 z-10 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
              {badge}
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 right-14 z-10 bg-destructive text-destructive-foreground text-xs font-bold px-3 py-1.5 rounded-md shadow-md">
              -{discount}%
            </div>
          )}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-3 right-3 z-10 bg-background/90 backdrop-blur-sm hover:bg-background shadow-md",
              inWishlist && "text-red-500"
            )}
            onClick={handleToggleWishlist}
          >
            <Heart className={cn("h-5 w-5", inWishlist && "fill-current")} />
          </Button>
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 group-hover:scale-105 transition-transform">
              📦
            </div>
          )}
        </div>
      </NavLink>

      <div className="p-5 space-y-3">
        <div className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
          {vendor}
        </div>
        <NavLink to={`/product/${id}`}>
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] hover:text-primary transition-colors leading-snug">
            {name}
          </h3>
        </NavLink>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-semibold">{rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <span className="font-heading font-bold text-xl text-primary">
            ${price.toFixed(2)}
          </span>
          {originalPrice && (
            <span className="text-sm text-muted-foreground line-through">
              ${originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        <Button 
          className="w-full bg-primary hover:bg-primary-hover shadow-md hover:shadow-lg transition-all" 
          size="default"
          onClick={handleAddToCart}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          Add to Cart
        </Button>
      </div>
    </Card>
  );
};

export default ProductCard;
