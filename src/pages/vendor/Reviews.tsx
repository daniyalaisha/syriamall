import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Flag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const reviews = [
  {
    id: "1",
    product: "Wireless Headphones",
    customer: "John Doe",
    rating: 5,
    comment: "Excellent sound quality and very comfortable!",
    date: "2025-01-15",
    verified: true,
    response: null,
  },
  {
    id: "2",
    product: "Smart Watch",
    customer: "Jane Smith",
    rating: 4,
    comment: "Good product but battery could be better.",
    date: "2025-01-14",
    verified: true,
    response: "Thank you for your feedback! We're working on improving battery life.",
  },
  {
    id: "3",
    product: "Bluetooth Speaker",
    customer: "Mike Johnson",
    rating: 3,
    comment: "Average quality, expected more for the price.",
    date: "2025-01-13",
    verified: false,
    response: null,
  },
];

export default function VendorReviews() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reviews & Ratings</h1>
        <p className="text-muted-foreground">Manage customer feedback</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold">4.2</div>
              <div className="flex items-center justify-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`h-5 w-5 ${i <= 4 ? "fill-primary text-primary" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">Based on 234 reviews</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <span className="text-sm w-8">{rating}★</span>
                <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${rating * 20}%` }} />
                </div>
                <span className="text-sm text-muted-foreground w-12">{rating * 20}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending Responses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl font-bold">12</div>
              <p className="text-sm text-muted-foreground mt-2">Reviews awaiting response</p>
              <Button className="mt-4 w-full">View All</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold">{review.customer}</p>
                      {review.verified && <Badge className="bg-green-500">Verified Purchase</Badge>}
                    </div>
                    <p className="text-sm text-muted-foreground">{review.product}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${i <= review.rating ? "fill-primary text-primary" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <Button variant="ghost" size="sm">
                      <Flag className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-sm mb-2">{review.comment}</p>
                <p className="text-xs text-muted-foreground mb-4">{review.date}</p>

                {review.response ? (
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="font-medium text-sm mb-1">Your Response:</p>
                    <p className="text-sm">{review.response}</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Textarea placeholder="Write your response..." rows={3} />
                    <div className="flex gap-2">
                      <Button size="sm">Send Response</Button>
                      <Button size="sm" variant="outline">Save Draft</Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
