import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, TrendingUp, Download } from "lucide-react";

const settlements = [
  { id: "1", date: "2025-01-15", amount: 2450.00, status: "completed", reference: "PAY-20250115-001" },
  { id: "2", date: "2025-01-08", amount: 3200.00, status: "completed", reference: "PAY-20250108-001" },
  { id: "3", date: "2025-01-01", amount: 1890.50, status: "processing", reference: "PAY-20250101-001" },
];

export default function VendorSettlements() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Payments & Settlements</h1>
        <p className="text-muted-foreground">Track your earnings and payouts</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$4,560.50</div>
            <p className="text-xs text-muted-foreground">Available for withdrawal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,890.50</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,230.00</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Settlement History</CardTitle>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <div key={settlement.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-bold">{settlement.reference}</p>
                  <p className="text-sm text-muted-foreground">{settlement.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold">${settlement.amount.toFixed(2)}</p>
                    {settlement.status === "completed" && <Badge className="bg-green-500">Completed</Badge>}
                    {settlement.status === "processing" && <Badge className="bg-blue-500">Processing</Badge>}
                    {settlement.status === "pending" && <Badge className="bg-yellow-500">Pending</Badge>}
                  </div>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gross Revenue</span>
              <span className="font-bold">$5,060.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Platform Fee (10%)</span>
              <span className="font-bold text-red-500">-$506.00</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Processing</span>
              <span className="font-bold text-red-500">-$3.50</span>
            </div>
            <div className="border-t pt-4 flex justify-between">
              <span className="font-bold">Net Amount</span>
              <span className="font-bold text-green-500">$4,550.50</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
