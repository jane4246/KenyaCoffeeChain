import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FarmerForm } from "@/components/farmer-form";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Phone, MapPin, Building } from "lucide-react";

export default function FarmerRegistry() {
  const [showForm, setShowForm] = useState(false);

  const { data: farmers = [], isLoading } = useQuery({
    queryKey: ["/api/farmers"],
  });

  const { data: cooperatives = [] } = useQuery({
    queryKey: ["/api/cooperatives"],
  });

  const getCooperativeName = (cooperativeId: string) => {
    const coop = cooperatives.find((c: any) => c.id === cooperativeId);
    return coop?.name || "Unknown Cooperative";
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
        title="Farmer Registry"
        subtitle={`Managing ${farmers.length} registered farmers`}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Users className="h-5 w-5" />
              <span>{farmers.length} Total Farmers</span>
            </div>
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Building className="h-5 w-5" />
              <span>{cooperatives.length} Cooperatives</span>
            </div>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button data-testid="new-farmer-btn">
                <Users className="h-4 w-4 mr-2" />
                Register New Farmer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Farmer</DialogTitle>
              </DialogHeader>
              <FarmerForm />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {farmers.map((farmer: any) => (
            <Card key={farmer.id} data-testid={`farmer-card-${farmer.farmId}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-1">
                      Farm ID: {farmer.farmId}
                    </h3>
                    <Badge variant="outline" className="mb-2">
                      {farmer.farmSize ? `${farmer.farmSize} acres` : "Size not specified"}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{farmer.location || "Location not specified"}</span>
                  </div>
                  
                  <div className="flex items-center space-x-3 text-sm">
                    <Building className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{getCooperativeName(farmer.cooperativeId)}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Registered {new Date(farmer.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" data-testid={`view-farmer-${farmer.farmId}`}>
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`edit-farmer-${farmer.farmId}`}>
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {farmers.length === 0 && (
          <Card className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Farmers Registered</h3>
            <p className="text-muted-foreground mb-4">
              Start by registering farmers in your cooperative system.
            </p>
            <Button onClick={() => setShowForm(true)} data-testid="register-first-farmer">
              Register First Farmer
            </Button>
          </Card>
        )}
      </div>
    </>
  );
}
