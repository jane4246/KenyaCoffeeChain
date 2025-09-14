import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Warehouse, Package, TrendingUp, TrendingDown } from "lucide-react";

export default function Inventory() {
  const [facilityType, setFacilityType] = useState("cooperative");
  const [facilityId, setFacilityId] = useState("default-coop");

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory", { facilityType, facilityId }],
    enabled: !!facilityType && !!facilityId,
  });

  const { data: allLots = [] } = useQuery({
    queryKey: ["/api/lots"],
  });

  // Calculate inventory summary
  const totalQuantity = inventory.reduce((sum: number, item: any) => 
    sum + parseFloat(item.quantity || "0"), 0
  );

  const inventoryByStatus = allLots.reduce((acc: any, lot: any) => {
    const status = lot.status || "unknown";
    acc[status] = (acc[status] || 0) + parseFloat(lot.quantity || "0");
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <>
      <Header 
        title="Inventory Management"
        subtitle="Track coffee inventory across wet mills, dry mills, and cooperatives"
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Facility Selection */}
        <div className="mb-6 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Facility Type:</label>
            <Select value={facilityType} onValueChange={setFacilityType} data-testid="facility-type-select">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="wet_mill">Wet Mill</SelectItem>
                <SelectItem value="dry_mill">Dry Mill</SelectItem>
                <SelectItem value="cooperative">Cooperative</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-foreground">Facility ID:</label>
            <Input 
              value={facilityId}
              onChange={(e) => setFacilityId(e.target.value)}
              className="w-40"
              placeholder="Enter facility ID"
              data-testid="facility-id-input"
            />
          </div>
        </div>

        {/* Inventory Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="total-inventory-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Inventory</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {totalQuantity.toFixed(1)} kg
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <Warehouse className="text-chart-1 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="wet-processing-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Wet Processing</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {(inventoryByStatus.wet_processing || 0).toFixed(1)} kg
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Package className="text-chart-2 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="dry-processing-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Dry Processing</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {(inventoryByStatus.dry_processing || 0).toFixed(1)} kg
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Package className="text-chart-3 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="ready-export-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Ready for Export</p>
                  <p className="text-2xl font-semibold text-foreground">
                    {(inventoryByStatus.ready_for_auction || 0).toFixed(1)} kg
                  </p>
                </div>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-chart-4 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Detail Table */}
        <Card>
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Inventory Details</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">Add Stock</Button>
                <Button variant="outline" size="sm">Transfer</Button>
                <Button size="sm">Export Report</Button>
              </div>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="inventory-table">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lot ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quantity</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Facility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Last Updated</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {inventory.map((item: any) => (
                  <tr key={item.id} data-testid={`inventory-row-${item.lotId}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">{item.lotId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{parseFloat(item.quantity).toFixed(1)} kg</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-foreground">
                        <div className="capitalize">{item.facilityType?.replace('_', ' ')}</div>
                        <div className="text-muted-foreground">{item.facilityId}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button variant="ghost" size="sm" className="mr-2" data-testid={`update-${item.lotId}`}>
                        Update
                      </Button>
                      <Button variant="ghost" size="sm" data-testid={`transfer-${item.lotId}`}>
                        Transfer
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {inventory.length === 0 && (
          <Card className="p-12 text-center mt-6">
            <Warehouse className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Inventory Records</h3>
            <p className="text-muted-foreground mb-4">
              No inventory found for the selected facility. Add stock or check your facility settings.
            </p>
            <Button data-testid="add-inventory-btn">Add Inventory</Button>
          </Card>
        )}
      </div>
    </>
  );
}
