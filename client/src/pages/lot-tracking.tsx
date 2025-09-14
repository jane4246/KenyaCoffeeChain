import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { LotCreationModal } from "@/components/lot-creation-modal";
import { QrCode, Search, Eye, Edit } from "lucide-react";

export default function LotTracking() {
  const [showLotModal, setShowLotModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: lots = [], isLoading } = useQuery({
    queryKey: ["/api/lots"],
  });

  const filteredLots = lots.filter((lot: any) => 
    lot.lotId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.farmerId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    const colors = {
      harvested: "bg-gray-100 text-gray-800",
      wet_processing: "bg-yellow-100 text-yellow-800",
      dry_processing: "bg-orange-100 text-orange-800", 
      quality_testing: "bg-blue-100 text-blue-800",
      ready_for_auction: "bg-green-100 text-green-800",
      sold: "bg-purple-100 text-purple-800",
      exported: "bg-indigo-100 text-indigo-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getGradeColor = (grade: string) => {
    const colors = {
      AA: "bg-emerald-100 text-emerald-800",
      AB: "bg-blue-100 text-blue-800", 
      C: "bg-amber-100 text-amber-800",
      PB: "bg-purple-100 text-purple-800",
      E: "bg-gray-100 text-gray-800"
    };
    return colors[grade as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

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
        title="Coffee Lot Tracking"
        subtitle={`Tracking ${lots.length} coffee lots through the value chain`}
        onNewLot={() => setShowLotModal(true)}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Search and Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search lots by ID or farmer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-lots"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">Filter by Status</Button>
            <Button variant="outline" size="sm">Export</Button>
          </div>
        </div>

        {/* Lots Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredLots.map((lot: any) => (
            <Card key={lot.id} data-testid={`lot-card-${lot.lotId}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <QrCode className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{lot.lotId}</h3>
                      <p className="text-sm text-muted-foreground">Farm: {lot.farmerId}</p>
                    </div>
                  </div>
                  {lot.qrCode && (
                    <img 
                      src={lot.qrCode} 
                      alt="QR Code" 
                      className="w-12 h-12 border rounded"
                      data-testid={`qr-code-${lot.lotId}`}
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-semibold text-foreground">{parseFloat(lot.quantity).toFixed(1)} kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processing</p>
                    <p className="font-semibold text-foreground capitalize">
                      {lot.processingMethod?.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <Badge className={getGradeColor(lot.grade || "C")}>
                    {lot.grade || "Ungraded"}
                  </Badge>
                  <Badge className={getStatusColor(lot.status)}>
                    {lot.status?.replace(/_/g, ' ') || "Unknown"}
                  </Badge>
                </div>
                
                <div className="text-xs text-muted-foreground mb-4">
                  Harvested: {new Date(lot.harvestDate || lot.createdAt).toLocaleDateString()}
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`view-lot-${lot.lotId}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" data-testid={`edit-lot-${lot.lotId}`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Update Status
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredLots.length === 0 && lots.length > 0 && (
          <Card className="p-12 text-center">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Lots Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </Card>
        )}

        {lots.length === 0 && (
          <Card className="p-12 text-center">
            <QrCode className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Coffee Lots</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your coffee lots with QR codes for full traceability.
            </p>
            <Button onClick={() => setShowLotModal(true)} data-testid="create-first-lot">
              Create First Lot
            </Button>
          </Card>
        )}
      </div>

      <LotCreationModal 
        open={showLotModal} 
        onOpenChange={setShowLotModal} 
      />
    </>
  );
}
