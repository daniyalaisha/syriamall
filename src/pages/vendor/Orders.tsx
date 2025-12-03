import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Download } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const mockOrders = [
  { id: "ORD-20250118-000001", customer: "John Doe", total: 245.99, status: "pending", items: 3 },
  { id: "ORD-20250118-000002", customer: "Jane Smith", total: 189.50, status: "processing", items: 2 },
  { id: "ORD-20250117-000045", customer: "Mike Johnson", total: 432.00, status: "shipped", items: 5 },
  { id: "ORD-20250117-000042", customer: "Sarah Wilson", total: 156.75, status: "completed", items: 1 },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500",
  processing: "bg-blue-500",
  shipped: "bg-purple-500",
  completed: "bg-green-500",
  cancelled: "bg-red-500",
  returned: "bg-orange-500",
};

export default function VendorOrders() {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderNotes, setOrderNotes] = useState<Record<string, string>>({});

  const handleStatusChange = (orderId: string, newStatus: string) => {
    console.log(`Order ${orderId} status changed to ${newStatus}`);
  };

  const handleNotesChange = (orderId: string, notes: string) => {
    setOrderNotes(prev => ({ ...prev, [orderId]: notes }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Orders Management</h1>
        <p className="text-muted-foreground">Manage and track all your orders</p>
      </div>

      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-bold">{order.id}</p>
                        <p className="text-sm text-muted-foreground">Customer: {order.customer}</p>
                        <p className="text-sm text-muted-foreground">{order.items} items</p>
                      </div>
                      <div className="text-right space-y-2">
                        <p className="font-bold">${order.total}</p>
                        <Select 
                          defaultValue={order.status}
                          onValueChange={(value) => handleStatusChange(order.id, value)}
                        >
                          <SelectTrigger className="w-[140px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                            <SelectItem value="returned">Returned</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {selectedOrder === order.id && (
                      <div className="space-y-3 pt-3 border-t">
                        <div>
                          <label className="text-sm font-medium">Vendor Notes</label>
                          <Textarea 
                            placeholder="Add notes for shipping or admin..."
                            value={orderNotes[order.id] || ""}
                            onChange={(e) => handleNotesChange(order.id, e.target.value)}
                            rows={3}
                            className="mt-1"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">Save Notes</Button>
                          <Button size="sm" variant="outline" onClick={() => setSelectedOrder(null)}>
                            Close
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedOrder(selectedOrder === order.id ? null : order.id)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        {selectedOrder === order.id ? "Hide" : "View"} Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Invoice
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
