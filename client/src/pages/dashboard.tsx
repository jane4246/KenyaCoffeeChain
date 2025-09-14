import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LotCreationModal } from "@/components/lot-creation-modal";
import { useRole } from "@/hooks/use-role";
import { Users, QrCode, Warehouse, CreditCard, TrendingUp, DollarSign, Clock, Building } from "lucide-react";

export default function Dashboard() {
  const [showLotModal, setShowLotModal] = useState(false);
  const [location, setLocation] = useLocation();
  const { roleDisplay } = useRole();

  const { data: stats } = useQuery<{
    activeFarmers: number;
    coffeeLots: number;
    totalInventory: number;
    activeAuctions: number;
  }>({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: recentLots = [] } = useQuery<any[]>({
    queryKey: ["/api/lots"],
  });

  const statCards = [
    {
      title: "Active Farmers",
      value: stats?.activeFarmers || 0,
      icon: Users,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      change: "+12% from last season"
    },
    {
      title: "Coffee Lots", 
      value: stats?.coffeeLots || 0,
      icon: QrCode,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      change: "+8% this week"
    },
    {
      title: "Total Inventory",
      value: `${stats?.totalInventory?.toFixed(1) || '0'}t`,
      icon: Warehouse,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      change: "Ready for export: 23.8t"
    },
    {
      title: "Pending Payments",
      value: "KSh 2.8M",
      icon: CreditCard,
      color: "text-chart-4", 
      bgColor: "bg-chart-4/10",
      change: "Next payout: Dec 15"
    }
  ];

  const getStatusColor = (status: string) => {
    const colors = {
      harvested: "bg-gray-100 text-gray-800",
      wet_processing: "bg-chart-2/10 text-chart-2",
      dry_processing: "bg-chart-4/10 text-chart-4", 
      quality_testing: "bg-chart-3/10 text-chart-3",
      ready_for_auction: "bg-chart-1/10 text-chart-1",
      sold: "bg-green-100 text-green-800",
      exported: "bg-blue-100 text-blue-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      AA: "bg-chart-1/10 text-chart-1",
      AB: "bg-chart-3/10 text-chart-3", 
      C: "bg-chart-4/10 text-chart-4",
      PB: "bg-chart-2/10 text-chart-2",
      E: "bg-gray-100 text-gray-800"
    };
    return colors[grade as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <>
      <Header 
        title={`${roleDisplay} Dashboard`}
        subtitle="Kiambu Coffee Cooperative - Harvest Season 2024"
        onNewLot={() => setShowLotModal(true)}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} data-testid={`stat-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-muted-foreground text-sm">{stat.title}</p>
                      <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`${stat.color} h-6 w-6`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <TrendingUp className="text-chart-1 h-4 w-4 mr-1" />
                    <span className="text-muted-foreground">{stat.change}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Lots Table */}
          <div className="lg:col-span-2">
            <Card>
              <div className="p-6 border-b border-border">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Recent Coffee Lots</h3>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button size="sm">Export</Button>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="lots-table">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Lot ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Farmer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Quantity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Grade</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-card divide-y divide-border">
                    {recentLots.slice(0, 5).map((lot: any) => (
                      <tr key={lot.id} data-testid={`lot-row-${lot.lotId}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <QrCode className="text-muted-foreground h-4 w-4 mr-2" />
                            <span className="text-sm font-medium text-foreground">{lot.lotId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-foreground">Farm ID: {lot.farmerId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                          {parseFloat(lot.quantity).toFixed(1)} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getGradeColor(lot.grade || "C")}>
                            {lot.grade || "Ungraded"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge className={getStatusColor(lot.status)}>
                            {lot.status?.replace(/_/g, ' ') || "Unknown"}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Button variant="ghost" size="sm" className="mr-2" data-testid={`view-lot-${lot.lotId}`}>
                            View
                          </Button>
                          <Button variant="ghost" size="sm" data-testid={`edit-lot-${lot.lotId}`}>
                            Edit
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setLocation('/farmers')}
                    data-testid="quick-register-farmer"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Register New Farmer
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start" 
                    onClick={() => setLocation('/cooperatives')}
                    data-testid="quick-register-cooperative"
                  >
                    <Building className="h-4 w-4 mr-2" />
                    Register Cooperative
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setShowLotModal(true)}
                    data-testid="quick-create-lot"
                  >
                    <QrCode className="h-4 w-4 mr-2" />
                    Create Coffee Lot
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/sms')}
                    data-testid="quick-send-sms"
                  >
                    <i className="fas fa-sms mr-2"></i>
                    Send SMS Alert
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => setLocation('/payments')}
                    data-testid="quick-process-payment"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Process Payment
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Processing Status */}
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Processing Overview</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Wet Processing</span>
                    <span className="text-sm font-medium text-foreground">245 lots</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Dry Processing</span>
                    <span className="text-sm font-medium text-foreground">189 lots</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Quality Testing</span>
                    <span className="text-sm font-medium text-foreground">78 lots</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Ready for Export</span>
                    <span className="text-sm font-medium text-foreground">156 lots</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <LotCreationModal 
        open={showLotModal} 
        onOpenChange={setShowLotModal} 
      />
    </>
  );
}
