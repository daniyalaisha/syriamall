import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  customer_id: string;
  vendor_response: string | null;
  is_verified_purchase: boolean;
}

interface ProductReviewsProps {
  productId: string;
}

const ProductReviews = ({ productId }: ProductReviewsProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const { data, error } = await supabase
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to leave a review",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) {
      toast({
        title: "Comment required",
        description: "Please write a comment",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.from("reviews").insert({
        product_id: productId,
        customer_id: user.id,
        rating: newRating,
        comment: newComment,
      });

      if (error) throw error;

      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });

      setNewComment("");
      setNewRating(5);
      fetchReviews();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast({
        title: "Failed to submit review",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onSelect?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? "fill-primary text-primary" : "text-muted-foreground"
            } ${interactive ? "cursor-pointer hover:scale-110 transition-transform" : ""}`}
            onClick={() => interactive && onSelect && onSelect(star)}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  return (
    <Card className="border-2">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <CardTitle className="text-2xl mb-1">Customer Reviews</CardTitle>
            <p className="text-muted-foreground text-sm">See what our customers are saying</p>
          </div>
          <div className="flex items-center gap-3 bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-3 rounded-lg">
            <Star className="h-6 w-6 fill-primary text-primary" />
            <div>
              <span className="text-3xl font-bold text-foreground">{averageRating}</span>
              <p className="text-xs text-muted-foreground">
                {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Write a Review */}
        {user && (
          <div className="border-2 border-dashed rounded-lg p-6 space-y-4">
            <h3 className="font-bold text-xl">Share Your Experience</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-3 block">Your Rating</label>
                {renderStars(newRating, true, setNewRating)}
              </div>
              <Textarea
                placeholder="Tell us what you think about this product..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={4}
                className="resize-none text-base"
              />
              <Button
                onClick={handleSubmitReview}
                disabled={loading}
                size="lg"
                className="w-full md:w-auto"
              >
                {loading ? "Submitting..." : "Submit Review"}
              </Button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-lg font-medium">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="border-2 rounded-lg p-6 hover:border-primary/30 transition-colors">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                      {review.customer_id?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">Customer</span>
                        {review.is_verified_purchase && (
                          <Badge className="bg-green-600 text-white text-xs">
                            ✓ Verified Purchase
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderStars(review.rating)}
                      <span className="font-semibold text-sm">{review.rating}.0</span>
                    </div>
                    <p className="text-foreground leading-relaxed text-base">{review.comment}</p>
                    {review.vendor_response && (
                      <Card className="bg-gradient-to-r from-muted/50 to-muted/30 border-2 mt-4">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-xs font-bold text-primary">V</span>
                            </div>
                            <p className="text-sm font-bold text-foreground">Vendor Response</p>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{review.vendor_response}</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductReviews;
