import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const farmerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email required").optional(),
  phone: z.string().min(1, "Phone is required"),
  farmId: z.string().min(1, "Farm ID is required"),
  farmSize: z.string().min(1, "Farm size is required").transform(Number),
  location: z.string().min(1, "Location is required"),
  cooperativeId: z.string().min(1, "Please select a cooperative"),
});

type FarmerFormData = z.infer<typeof farmerSchema>;

export function FarmerForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: cooperatives = [] } = useQuery({
    queryKey: ["/api/cooperatives"],
  });

  const form = useForm<FarmerFormData>({
    resolver: zodResolver(farmerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      farmId: "",
      farmSize: "",
      location: "",
      cooperativeId: "",
    },
  });

  const createFarmerMutation = useMutation({
    mutationFn: async (data: FarmerFormData) => {
      // First create the user
      const userResponse = await apiRequest("POST", "/api/users", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: "farmer",
        cooperativeId: data.cooperativeId,
      });
      const user = await userResponse.json();

      // Then create the farmer profile
      const farmerResponse = await apiRequest("POST", "/api/farmers", {
        userId: user.id,
        farmId: data.farmId,
        farmSize: data.farmSize.toString(),
        location: data.location,
        cooperativeId: data.cooperativeId,
      });
      return farmerResponse.json();
    },
    onSuccess: () => {
      toast({
        title: "Farmer registered successfully",
        description: "The farmer has been added to the system",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/farmers"] });
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error registering farmer",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FarmerFormData) => {
    createFarmerMutation.mutate(data);
  };

  return (
    <Card className="max-w-2xl" data-testid="farmer-form">
      <CardHeader>
        <CardTitle>Register New Farmer</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter farmer's name" {...field} data-testid="name-input" />
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
                      <Input placeholder="+254..." {...field} data-testid="phone-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (Optional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="farmer@example.com" {...field} data-testid="email-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="farmId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm ID</FormLabel>
                    <FormControl>
                      <Input placeholder="F-0001" {...field} data-testid="farm-id-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farmSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Size (acres)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="0.0" {...field} data-testid="farm-size-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Farm location" {...field} data-testid="location-input" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cooperativeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cooperative</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} data-testid="cooperative-select">
                      <SelectTrigger>
                        <SelectValue placeholder="Select cooperative" />
                      </SelectTrigger>
                      <SelectContent>
                        {cooperatives.map((coop: any) => (
                          <SelectItem key={coop.id} value={coop.id}>
                            {coop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button 
              type="submit" 
              className="w-full" 
              disabled={createFarmerMutation.isPending}
              data-testid="submit-farmer-btn"
            >
              {createFarmerMutation.isPending ? "Registering..." : "Register Farmer"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
