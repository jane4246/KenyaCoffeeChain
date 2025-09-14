import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Gavel, Clock, DollarSign, TrendingUp } from "lucide-react";

const bidSchema = z.object({
  amount: z.string().min(1, "Bid amount is required").transform(Number),
});

type BidFormData = z.infer<typeof bidSchema>;

export default function Marketplace() {
  const [selectedAuction, setSelectedAuction] = useState<any>(null);
  const [showBidModal, setShowBidModal] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: auctions = [], isLoading } = useQuery({
    queryKey: ["/api/auctions"],
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["/api/auctions", selectedAuction?.id, "bids"],
    enabled: !!selectedAuction?.id,
  });

  const form = useForm<BidFormData>({
    resolver: zodResolver(bidSchema),
    defaultValues: {
      amount: "",
    },
  });

  const bidMutation = useMutation({
    mutationFn: async (data: BidFormData) => {
      const response = await apiRequest("POST", "/api/bids", {
        auctionId: selectedAuction.id,
        bidderId: "current-user-id", // This would come from auth context
        amount: data.amount.toString(),
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bid placed successfully",
        description: "Your bid has been submitted to the auction",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auctions"] });
      form.reset();
      setShowBidModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error placing bid",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitBid = (data: BidFormData) => {
    bidMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      closed: "bg-gray-100 text-gray-800",
      cancelled: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
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
        title="Coffee Marketplace"
        subtitle={`${auctions.length} active auctions available for bidding`}
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Marketplace Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="active-auctions-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Active Auctions</p>
                  <p className="text-2xl font-semibold text-foreground">{auctions.length}</p>
                </div>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <Gavel className="text-chart-1 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="avg-price-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Avg. Price/kg</p>
                  <p className="text-2xl font-semibold text-foreground">KSh 245</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="text-chart-2 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="total-volume-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Volume</p>
                  <p className="text-2xl font-semibold text-foreground">2.8t</p>
                </div>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-chart-3 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="market-activity-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Market Activity</p>
                  <p className="text-2xl font-semibold text-foreground">High</p>
                </div>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-chart-4 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {auctions.map((auction: any) => (
            <Card key={auction.id} data-testid={`auction-card-${auction.id}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Gavel className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">Lot {auction.lotId}</h3>
                      <p className="text-sm text-muted-foreground">Seller: {auction.sellerId}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(auction.status)}>
                    {auction.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Starting Price</p>
                    <p className="font-semibold text-foreground">
                      KSh {parseFloat(auction.startingPrice).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Bid</p>
                    <p className="font-semibold text-chart-1">
                      KSh {parseFloat(auction.currentPrice || auction.startingPrice).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <div className="text-xs text-muted-foreground mb-4">
                  Started: {new Date(auction.startTime).toLocaleDateString()}
                  {auction.endTime && (
                    <div>Ends: {new Date(auction.endTime).toLocaleDateString()}</div>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => setSelectedAuction(auction)}
                    data-testid={`view-auction-${auction.id}`}
                  >
                    View Details
                  </Button>
                  {auction.status === "active" && (
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedAuction(auction);
                        setShowBidModal(true);
                      }}
                      data-testid={`bid-auction-${auction.id}`}
                    >
                      Place Bid
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {auctions.length === 0 && (
          <Card className="p-12 text-center">
            <Gavel className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Active Auctions</h3>
            <p className="text-muted-foreground mb-4">
              No coffee lots are currently available for auction.
            </p>
            <Button data-testid="create-auction-btn">Create Auction</Button>
          </Card>
        )}
      </div>

      {/* Bid Modal */}
      <Dialog open={showBidModal} onOpenChange={setShowBidModal}>
        <DialogContent className="max-w-md" data-testid="bid-modal">
          <DialogHeader>
            <DialogTitle>Place Bid - Lot {selectedAuction?.lotId}</DialogTitle>
          </DialogHeader>
          
          <div className="mb-4 p-4 bg-muted rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Current Highest Bid:</span>
              <span className="font-semibold text-foreground">
                KSh {parseFloat(selectedAuction?.currentPrice || selectedAuction?.startingPrice || "0").toLocaleString()}
              </span>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitBid)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Bid (KSh)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        placeholder="Enter bid amount" 
                        {...field} 
                        data-testid="bid-amount-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => setShowBidModal(false)}
                  data-testid="cancel-bid-btn"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={bidMutation.isPending}
                  data-testid="submit-bid-btn"
                >
                  {bidMutation.isPending ? "Placing..." : "Place Bid"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
