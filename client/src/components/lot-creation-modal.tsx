import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const lotSchema = z.object({
  farmerId: z.string().min(1, "Please select a farmer"),
  quantity: z.string().min(1, "Quantity is required").transform(Number),
  processingMethod: z.enum(["wet", "dry", "honey"]),
});

type LotFormData = z.infer<typeof lotSchema>;

interface LotCreationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LotCreationModal({ open, onOpenChange }: LotCreationModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: farmers = [] } = useQuery({
    queryKey: ["/api/farmers"],
  });

  const form = useForm<LotFormData>({
    resolver: zodResolver(lotSchema),
    defaultValues: {
      farmerId: "",
      quantity: "",
      processingMethod: "wet",
    },
  });

  const createLotMutation = useMutation({
    mutationFn: async (data: LotFormData) => {
      const response = await apiRequest("POST", "/api/lots", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Coffee lot created successfully",
        description: "QR code has been generated for tracking",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/lots"] });
      form.reset();
      onOpenChange(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error creating lot",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LotFormData) => {
    createLotMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="lot-creation-modal">
        <DialogHeader>
          <DialogTitle>Create New Coffee Lot</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="farmerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Farmer</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} data-testid="farmer-select">
                      <SelectTrigger>
                        <SelectValue placeholder="Select Farmer" />
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
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity (kg)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.1" 
                      placeholder="0.0" 
                      {...field} 
                      data-testid="quantity-input"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="processingMethod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Processing Method</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange} data-testid="processing-select">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wet">Wet Processing</SelectItem>
                        <SelectItem value="dry">Dry Processing</SelectItem>
                        <SelectItem value="honey">Honey Processing</SelectItem>
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
                onClick={() => onOpenChange(false)}
                data-testid="cancel-btn"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1" 
                disabled={createLotMutation.isPending}
                data-testid="create-lot-btn"
              >
                {createLotMutation.isPending ? "Creating..." : "Create & Generate QR"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
