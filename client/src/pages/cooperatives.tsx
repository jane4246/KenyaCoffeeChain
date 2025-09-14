import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CooperativeForm } from "@/components/cooperative-form";
import { Building, MapPin, Phone, Mail } from "lucide-react";
import { type Cooperative } from "@shared/schema";

export default function Cooperatives() {
  const [showForm, setShowForm] = useState(false);

  const { data: cooperatives = [], isLoading } = useQuery<Cooperative[]>({
    queryKey: ["/api/cooperatives"],
  });

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
        title="Cooperative Management"
        subtitle={`Managing ${cooperatives.length} registered cooperatives`}
      />
      
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <Building className="h-5 w-5" />
              <span>{cooperatives.length} Total Cooperatives</span>
            </div>
          </div>
          
          <Dialog open={showForm} onOpenChange={setShowForm}>
            <DialogTrigger asChild>
              <Button data-testid="new-cooperative-btn">
                <Building className="h-4 w-4 mr-2" />
                Register New Cooperative
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Register New Cooperative</DialogTitle>
              </DialogHeader>
              <CooperativeForm onSuccess={() => setShowForm(false)} />
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cooperatives.map((cooperative) => (
            <Card key={cooperative.id} data-testid={`cooperative-card-${cooperative.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {cooperative.name}
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{cooperative.location}</span>
                      </div>
                      {cooperative.contactPhone && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{cooperative.contactPhone}</span>
                        </div>
                      )}
                      {cooperative.contactEmail && (
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{cooperative.contactEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground">
                    Registered {cooperative.createdAt ? new Date(cooperative.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" data-testid={`view-cooperative-${cooperative.id}`}>
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" data-testid={`edit-cooperative-${cooperative.id}`}>
                      Edit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {cooperatives.length === 0 && (
          <Card className="p-12 text-center">
            <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Cooperatives Registered</h3>
            <p className="text-muted-foreground mb-4">
              Start by registering cooperatives in the coffee value chain system.
            </p>
            <Button onClick={() => setShowForm(true)} data-testid="register-first-cooperative">
              Register First Cooperative
            </Button>
          </Card>
        )}
      </div>
    </>
  );
}