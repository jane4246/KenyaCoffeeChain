import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CreditCard, DollarSign, Clock, CheckCircle, AlertCircle, Search, Plus } from "lucide-react";

const paymentSchema = z.object({
  payeeId: z.string().min(1, "Please select a payee"),
  amount: z.string().min(1, "Amount is required").transform(Number),
  paymentMethod: z.enum(["m-pesa", "bank", "cash"]),
  lotId: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

export default function Payments() {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["/api/payments", "current-user-id"], // This would come from auth context
  });

  const { data: farmers = [] } = useQuery({
    queryKey: ["/api/farmers"],
  });

  const { data: lots = [] } = useQuery({
    queryKey: ["/api/lots"],
  });

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payeeId: "",
      amount: "",
      paymentMethod: "m-pesa",
      lotId: "",
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const response = await apiRequest("POST", "/api/payments", {
        payerId: "current-user-id", // This would come from auth context
        payeeId: data.payeeId,
        amount: data.amount.toString(),
        paymentMethod: data.paymentMethod,
        lotId: data.lotId || null,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment created successfully",
        description: "The payment has been processed",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      form.reset();
      setShowPaymentModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating payment",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitPayment = (data: PaymentFormData) => {
    createPaymentMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      case "processing":
        return <Clock className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredPayments = payments.filter((payment: any) => {
    const matchesSearch = payment.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.payeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalPending = payments.filter((p: any) => p.status === "pending").reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
  const totalCompleted = payments.filter((p: any) => p.status === "completed").reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);
  const totalProcessing = payments.filter((p: any) => p.status === "processing").reduce((sum: number, p: any) => sum + parseFloat(p.amount || "0"), 0);

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
        title="Payment Management"
        subtitle="Track and process payments for coffee transactions"
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="total-payments-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Payments</p>
                  <p className="text-2xl font-semibold text-foreground">{payments.length}</p>
                </div>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <CreditCard className="text-chart-1 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="pending-payments-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-2xl font-semibold text-foreground">KSh {totalPending.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-chart-2 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="processing-payments-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Processing</p>
                  <p className="text-2xl font-semibold text-foreground">KSh {totalProcessing.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-chart-3 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="completed-payments-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Completed</p>
                  <p className="text-2xl font-semibold text-foreground">KSh {totalCompleted.toLocaleString()}</p>
                </div>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-chart-4 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1 max-w-lg">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID or payee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-payments"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => setShowPaymentModal(true)} data-testid="new-payment-btn">
            <Plus className="h-4 w-4 mr-2" />
            New Payment
          </Button>
        </div>

        {/* Payments Table */}
        <Card>
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Payment Transactions</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="payments-table">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Transaction ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Payee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredPayments.map((payment: any) => (
                  <tr key={payment.id} data-testid={`payment-row-${payment.transactionId}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">{payment.transactionId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{payment.payeeId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">
                        KSh {parseFloat(payment.amount).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground capitalize">
                        {payment.paymentMethod?.replace('-', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(payment.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(payment.status)}
                          <span className="capitalize">{payment.status}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button variant="ghost" size="sm" className="mr-2" data-testid={`view-payment-${payment.transactionId}`}>
                        View
                      </Button>
                      {payment.status === "pending" && (
                        <Button variant="ghost" size="sm" data-testid={`process-payment-${payment.transactionId}`}>
                          Process
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredPayments.length === 0 && payments.length > 0 && (
          <Card className="p-12 text-center mt-6">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Payments Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </Card>
        )}

        {payments.length === 0 && (
          <Card className="p-12 text-center mt-6">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Payments</h3>
            <p className="text-muted-foreground mb-4">
              Start processing payments for your coffee transactions.
            </p>
            <Button onClick={() => setShowPaymentModal(true)} data-testid="create-first-payment">
              Create First Payment
            </Button>
          </Card>
        )}
      </div>

      {/* Payment Creation Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md" data-testid="payment-modal">
          <DialogHeader>
            <DialogTitle>Create New Payment</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitPayment)} className="space-y-4">
              <FormField
                control={form.control}
                name="payeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payee</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} data-testid="payee-select">
                        <SelectTrigger>
                          <SelectValue placeholder="Select payee" />
                        </SelectTrigger>
                        <SelectContent>
                          {farmers.map((farmer: any) => (
                            <SelectItem key={farmer.id} value={farmer.id}>
                              {farmer.farmId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (KSh)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="1" 
                        placeholder="0" 
                        {...field} 
                        data-testid="amount-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} data-testid="payment-method-select">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="m-pesa">M-Pesa</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lotId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Related Lot (Optional)</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} data-testid="lot-select">
                        <SelectTrigger>
                          <SelectValue placeholder="Select lot (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {lots.map((lot: any) => (
                            <SelectItem key={lot.id} value={lot.id}>
                              {lot.lotId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                  onClick={() => setShowPaymentModal(false)}
                  data-testid="cancel-payment-btn"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={createPaymentMutation.isPending}
                  data-testid="create-payment-btn"
                >
                  {createPaymentMutation.isPending ? "Creating..." : "Create Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
