import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";

interface TimelineItem {
  status: string;
  label: string;
  date?: string;
  active: boolean;
  completed: boolean;
}

interface OrderTimelineProps {
  status: string;
  createdAt: string;
}

const OrderTimeline = ({ status, createdAt }: OrderTimelineProps) => {
  const statusFlow = ["pending", "processing", "shipped", "delivered"];
  const currentIndex = statusFlow.indexOf(status);

  const timelineItems: TimelineItem[] = [
    {
      status: "pending",
      label: "Order Placed",
      date: createdAt,
      active: currentIndex === 0,
      completed: currentIndex > 0,
    },
    {
      status: "processing",
      label: "Processing",
      active: currentIndex === 1,
      completed: currentIndex > 1,
    },
    {
      status: "shipped",
      label: "Shipped",
      active: currentIndex === 2,
      completed: currentIndex > 2,
    },
    {
      status: "delivered",
      label: "Delivered",
      active: currentIndex === 3,
      completed: false,
    },
  ];

  const getIcon = (itemStatus: string, active: boolean, completed: boolean) => {
    const className = `h-6 w-6 ${completed ? "text-green-500" : active ? "text-primary" : "text-muted-foreground"}`;
    
    if (status === "cancelled") {
      return <XCircle className="h-6 w-6 text-destructive" />;
    }

    switch (itemStatus) {
      case "pending":
        return <Clock className={className} />;
      case "processing":
        return <Package className={className} />;
      case "shipped":
        return <Truck className={className} />;
      case "delivered":
        return <CheckCircle className={className} />;
      default:
        return <Clock className={className} />;
    }
  };

  if (status === "cancelled") {
    return (
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Order Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            This order has been cancelled. If you have any questions, please contact support.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Tracking</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {timelineItems.map((item, index) => (
            <div key={item.status} className="relative">
              <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 rounded-full p-2 ${
                  item.completed ? "bg-green-500/10" : 
                  item.active ? "bg-primary/10" : "bg-muted"
                }`}>
                  {getIcon(item.status, item.active, item.completed)}
                </div>
                <div className="flex-1 pt-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-semibold ${
                        item.completed || item.active ? "text-foreground" : "text-muted-foreground"
                      }`}>
                        {item.label}
                      </p>
                      {item.date && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(item.date).toLocaleDateString()} at{" "}
                          {new Date(item.date).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </p>
                      )}
                    </div>
                    {item.active && (
                      <Badge className="bg-primary">Current</Badge>
                    )}
                    {item.completed && (
                      <Badge className="bg-green-500">Completed</Badge>
                    )}
                  </div>
                </div>
              </div>
              {index < timelineItems.length - 1 && (
                <div className={`ml-6 h-12 w-0.5 ${
                  item.completed ? "bg-green-500" : "bg-border"
                }`} />
              )}
            </div>
          ))}
        </div>

        {status === "shipped" && (
          <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
            <p className="text-sm font-medium mb-1">Tracking Number</p>
            <p className="text-sm text-muted-foreground font-mono">
              TRACK{Math.random().toString(36).substring(2, 15).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Estimated delivery: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderTimeline;
