import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Package, History } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

const stockHistory = [
  { id: 1, product: "Wireless Headphones", change: +20, newStock: 45, date: "2025-01-18", reason: "Restocked" },
  { id: 2, product: "Smart Watch", change: -3, newStock: 12, date: "2025-01-18", reason: "Sales" },
  { id: 3, product: "Bluetooth Speaker", change: -7, newStock: 3, date: "2025-01-17", reason: "Sales" },
  { id: 4, product: "USB-C Cable", change: -5, newStock: 0, date: "2025-01-17", reason: "Sales" },
];

const inventoryItems = [
  { id: "1", name: "Wireless Headphones", sku: "WH-001", stock: 45, threshold: 10, status: "good" },
  { id: "2", name: "Smart Watch", sku: "SW-002", stock: 12, threshold: 15, status: "low" },
  { id: "3", name: "Bluetooth Speaker", sku: "BS-003", stock: 3, threshold: 10, status: "critical" },
  { id: "4", name: "USB-C Cable", sku: "UC-004", stock: 0, threshold: 5, status: "out" },
];

export default function VendorInventory() {
  const [autoDisable, setAutoDisable] = useState<Record<string, boolean>>({
    "1": false,
    "2": true,
    "3": true,
    "4": true,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage your stock levels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">12</div>
            <p className="text-xs text-muted-foreground">Need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">4</div>
            <p className="text-xs text-muted-foreground">Require immediate action</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Stock Alerts</TabsTrigger>
          <TabsTrigger value="history">Stock History</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Stock Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inventoryItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded bg-muted" />
                      <div>
                        <p className="font-bold">{item.name}</p>
                        <p className="text-sm text-muted-foreground">SKU: {item.sku}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold">{item.stock} units</p>
                        <p className="text-sm text-muted-foreground">Threshold: {item.threshold}</p>
                      </div>
                      <div className="w-24">
                        {item.status === "good" && <Badge className="bg-green-500">Good</Badge>}
                        {item.status === "low" && <Badge className="bg-yellow-500">Low Stock</Badge>}
                        {item.status === "critical" && <Badge className="bg-orange-500">Critical</Badge>}
                        {item.status === "out" && <Badge className="bg-red-500">Out</Badge>}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex flex-col items-start gap-1">
                          <Label htmlFor={`auto-${item.id}`} className="text-xs">Auto-disable</Label>
                          <Switch 
                            id={`auto-${item.id}`}
                            checked={autoDisable[item.id]}
                            onCheckedChange={(checked) => setAutoDisable({...autoDisable, [item.id]: checked})}
                          />
                        </div>
                        <Button size="sm">Restock</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Stock History</CardTitle>
              <History className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stockHistory.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-bold">{entry.product}</p>
                      <p className="text-sm text-muted-foreground">{entry.reason}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className={`font-bold ${entry.change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {entry.change > 0 ? '+' : ''}{entry.change}
                        </p>
                        <p className="text-sm text-muted-foreground">New: {entry.newStock}</p>
                      </div>
                      <p className="text-sm text-muted-foreground w-24">{entry.date}</p>
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
