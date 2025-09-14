import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const cooperativeSchema = z.object({
  name: z.string().min(1, "Cooperative name is required"),
  location: z.string().min(1, "Location is required"),
  contactEmail: z.string().email("Valid email required").optional().or(z.literal("")),
  contactPhone: z.string().min(1, "Contact phone is required"),
});

type CooperativeFormData = z.infer<typeof cooperativeSchema>;

interface CooperativeFormProps {
  onSuccess?: () => void;
}

export function CooperativeForm({ onSuccess }: CooperativeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CooperativeFormData>({
    resolver: zodResolver(cooperativeSchema),
    defaultValues: {
      name: "",
      location: "",
      contactEmail: "",
      contactPhone: "",
    },
  });

  const createCooperativeMutation = useMutation({
    mutationFn: async (data: CooperativeFormData) => {
      const response = await apiRequest("POST", "/api/cooperatives", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Cooperative created successfully",
        description: "The cooperative has been registered in the system",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cooperatives"] });
      form.reset();
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating cooperative",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CooperativeFormData) => {
    createCooperativeMutation.mutate(data);
  };

  return (
    <Card className="max-w-2xl" data-testid="cooperative-form">
      <CardHeader>
        <CardTitle>Register New Cooperative</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooperative Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter cooperative name" {...field} data-testid="name-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} data-testid="location-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="cooperative@example.com" {...field} data-testid="email-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="+254..." {...field} data-testid="phone-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createCooperativeMutation.isPending}
              data-testid="submit-cooperative-btn"
            >
              {createCooperativeMutation.isPending ? "Creating..." : "Create Cooperative"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}