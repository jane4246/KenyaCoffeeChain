import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MessageSquare, Send, Clock, CheckCircle, AlertCircle, Users, Plus, Search } from "lucide-react";

const smsSchema = z.object({
  recipientType: z.enum(["individual", "group", "all"]),
  recipientId: z.string().optional(),
  phone: z.string().min(1, "Phone number is required"),
  message: z.string().min(1, "Message is required").max(160, "Message must be 160 characters or less"),
  messageType: z.enum(["price_alert", "weather", "payment", "general"]),
});

type SmsFormData = z.infer<typeof smsSchema>;

const messageTemplates = {
  price_alert: "Coffee prices updated: AA grade KSh {price}/kg. Current market trends favorable for selling.",
  weather: "Weather Alert: {weather_condition} expected tomorrow. Please take necessary precautions for your coffee.",
  payment: "Payment notification: KSh {amount} has been processed for lot {lot_id}. Thank you for your business.",
  general: ""
};

export default function SmsAlerts() {
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: smsNotifications = [], isLoading } = useQuery({
    queryKey: ["/api/sms"],
  });

  const { data: farmers = [] } = useQuery({
    queryKey: ["/api/farmers"],
  });

  const { data: users = [] } = useQuery({
    queryKey: ["/api/users", "cooperative"],
  });

  const form = useForm<SmsFormData>({
    resolver: zodResolver(smsSchema),
    defaultValues: {
      recipientType: "individual",
      recipientId: "",
      phone: "",
      message: "",
      messageType: "general",
    },
  });

  const sendSmsMutation = useMutation({
    mutationFn: async (data: SmsFormData) => {
      if (data.recipientType === "group" && selectedRecipients.length > 0) {
        // Send to multiple recipients
        const promises = selectedRecipients.map(recipientId => {
          const recipient = [...farmers, ...users].find((r: any) => r.id === recipientId);
          return apiRequest("POST", "/api/sms/send", {
            recipientId,
            phone: recipient?.phone || data.phone,
            message: data.message,
          });
        });
        return Promise.all(promises);
      } else {
        // Send to single recipient
        const response = await apiRequest("POST", "/api/sms/send", {
          recipientId: data.recipientId || "unknown",
          phone: data.phone,
          message: data.message,
        });
        return response.json();
      }
    },
    onSuccess: () => {
      toast({
        title: "SMS sent successfully",
        description: "Your message has been delivered",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sms"] });
      form.reset();
      setSelectedRecipients([]);
      setShowSmsModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error sending SMS",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitSms = (data: SmsFormData) => {
    sendSmsMutation.mutate(data);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="h-4 w-4" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredNotifications = smsNotifications.filter((sms: any) => {
    const matchesSearch = sms.phone?.includes(searchTerm) || 
                         sms.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sms.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalSent = smsNotifications.filter((s: any) => s.status === "sent").length;
  const totalPending = smsNotifications.filter((s: any) => s.status === "pending").length;
  const totalFailed = smsNotifications.filter((s: any) => s.status === "failed").length;

  const handleRecipientSelection = (recipientId: string, checked: boolean) => {
    if (checked) {
      setSelectedRecipients([...selectedRecipients, recipientId]);
    } else {
      setSelectedRecipients(selectedRecipients.filter(id => id !== recipientId));
    }
  };

  const handleMessageTypeChange = (messageType: string) => {
    form.setValue("messageType", messageType as any);
    const template = messageTemplates[messageType as keyof typeof messageTemplates];
    if (template) {
      form.setValue("message", template);
    }
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
        title="SMS Alert System"
        subtitle="Send notifications and alerts to farmers and stakeholders"
      />
      
      <div className="flex-1 overflow-auto p-6">
        {/* SMS Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card data-testid="total-sms-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Total Messages</p>
                  <p className="text-2xl font-semibold text-foreground">{smsNotifications.length}</p>
                </div>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-chart-1 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="sent-sms-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Sent</p>
                  <p className="text-2xl font-semibold text-foreground">{totalSent}</p>
                </div>
                <div className="w-12 h-12 bg-chart-2/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="text-chart-2 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="pending-sms-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Pending</p>
                  <p className="text-2xl font-semibold text-foreground">{totalPending}</p>
                </div>
                <div className="w-12 h-12 bg-chart-3/10 rounded-lg flex items-center justify-center">
                  <Clock className="text-chart-3 h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card data-testid="failed-sms-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">Failed</p>
                  <p className="text-2xl font-semibold text-foreground">{totalFailed}</p>
                </div>
                <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center">
                  <AlertCircle className="text-chart-4 h-6 w-6" />
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
                placeholder="Search by phone or message content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-sms"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter} data-testid="status-filter">
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={() => setShowSmsModal(true)} data-testid="new-sms-btn">
            <Plus className="h-4 w-4 mr-2" />
            Send SMS
          </Button>
        </div>

        {/* SMS History Table */}
        <Card>
          <div className="p-6 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">SMS History</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full" data-testid="sms-table">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Recipient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Message</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Sent At</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {filteredNotifications.map((sms: any) => (
                  <tr key={sms.id} data-testid={`sms-row-${sms.id}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-foreground">{sms.recipientId}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-foreground">{sms.phone}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-foreground max-w-xs truncate">
                        {sms.message}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getStatusColor(sms.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(sms.status)}
                          <span className="capitalize">{sms.status}</span>
                        </div>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {sms.sentAt ? new Date(sms.sentAt).toLocaleString() : "Not sent"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Button variant="ghost" size="sm" className="mr-2" data-testid={`view-sms-${sms.id}`}>
                        View
                      </Button>
                      {sms.status === "failed" && (
                        <Button variant="ghost" size="sm" data-testid={`resend-sms-${sms.id}`}>
                          Resend
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {filteredNotifications.length === 0 && smsNotifications.length > 0 && (
          <Card className="p-12 text-center mt-6">
            <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Messages Found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </Card>
        )}

        {smsNotifications.length === 0 && (
          <Card className="p-12 text-center mt-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No SMS Messages</h3>
            <p className="text-muted-foreground mb-4">
              Start communicating with farmers and stakeholders through SMS alerts.
            </p>
            <Button onClick={() => setShowSmsModal(true)} data-testid="send-first-sms">
              Send First SMS
            </Button>
          </Card>
        )}
      </div>

      {/* SMS Creation Modal */}
      <Dialog open={showSmsModal} onOpenChange={setShowSmsModal}>
        <DialogContent className="max-w-2xl" data-testid="sms-modal">
          <DialogHeader>
            <DialogTitle>Send SMS Alert</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitSms)} className="space-y-4">
              <FormField
                control={form.control}
                name="messageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message Type</FormLabel>
                    <FormControl>
                      <Select 
                        value={field.value} 
                        onValueChange={handleMessageTypeChange} 
                        data-testid="message-type-select"
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="price_alert">Price Alert</SelectItem>
                          <SelectItem value="weather">Weather Alert</SelectItem>
                          <SelectItem value="payment">Payment Notification</SelectItem>
                          <SelectItem value="general">General Message</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="recipientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Send To</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} data-testid="recipient-type-select">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="individual">Individual</SelectItem>
                          <SelectItem value="group">Selected Group</SelectItem>
                          <SelectItem value="all">All Farmers</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("recipientType") === "individual" && (
                <>
                  <FormField
                    control={form.control}
                    name="recipientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Recipient</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange} data-testid="recipient-select">
                            <SelectTrigger>
                              <SelectValue placeholder="Select recipient" />
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
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="+254..." 
                            {...field} 
                            data-testid="phone-input"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {form.watch("recipientType") === "group" && (
                <div className="space-y-2">
                  <FormLabel>Select Recipients</FormLabel>
                  <div className="max-h-40 overflow-y-auto border rounded-md p-4 space-y-2">
                    {farmers.map((farmer: any) => (
                      <div key={farmer.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={farmer.id}
                          checked={selectedRecipients.includes(farmer.id)}
                          onCheckedChange={(checked) => handleRecipientSelection(farmer.id, checked as boolean)}
                          data-testid={`recipient-checkbox-${farmer.id}`}
                        />
                        <label htmlFor={farmer.id} className="text-sm text-foreground">
                          {farmer.farmId}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Message ({field.value?.length || 0}/160)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Enter your message..."
                        rows={4}
                        {...field} 
                        data-testid="message-input"
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
                  onClick={() => setShowSmsModal(false)}
                  data-testid="cancel-sms-btn"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={sendSmsMutation.isPending}
                  data-testid="send-sms-btn"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {sendSmsMutation.isPending ? "Sending..." : "Send SMS"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
