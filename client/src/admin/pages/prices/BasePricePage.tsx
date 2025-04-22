import React, { useState } from "react";
import AdminLayout from "@/admin/components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, queryClient, apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlightPricing } from "@shared/schema";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

// Form schema for flight pricing
const FlightPricingFormSchema = z.object({
  basePrice: z.coerce.number().min(5, "Base price must be at least $5"),
  originAirport: z.string().min(3, "Origin airport is required"),
  destinationAirport: z.string().min(3, "Destination airport is required"),
  currency: z.string().default("USD"),
  travelClass: z.string().default("economy"),
  isActive: z.boolean().default(true),
});

export default function BasePricePage() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<FlightPricing | null>(null);

  // Fetch flight pricing from the API
  const { data: pricingList, isLoading } = useQuery<FlightPricing[]>({
    queryKey: ["/api/admin/flight-pricing"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Add new pricing form
  const addForm = useForm<z.infer<typeof FlightPricingFormSchema>>({
    resolver: zodResolver(FlightPricingFormSchema),
    defaultValues: {
      basePrice: 50,
      originAirport: "",
      destinationAirport: "",
      currency: "USD",
      travelClass: "economy",
      isActive: true,
    },
  });

  // Edit pricing form
  const editForm = useForm<z.infer<typeof FlightPricingFormSchema>>({
    resolver: zodResolver(FlightPricingFormSchema),
    defaultValues: {
      basePrice: 50,
      originAirport: "",
      destinationAirport: "",
      currency: "USD",
      travelClass: "economy",
      isActive: true,
    },
  });

  // Mutations for pricing operations
  const addMutation = useMutation({
    mutationFn: async (data: z.infer<typeof FlightPricingFormSchema>) => {
      const res = await apiRequest("POST", "/api/admin/flight-pricing", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add pricing");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pricing added",
        description: "The base pricing has been added successfully.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flight-pricing"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof FlightPricingFormSchema> }) => {
      const res = await apiRequest("PATCH", `/api/admin/flight-pricing/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update pricing");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Pricing updated",
        description: "The base pricing has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedPrice(null);
      editForm.reset();
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flight-pricing"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("DELETE", `/api/admin/flight-pricing/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete pricing");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Pricing deleted",
        description: "The base pricing has been deleted successfully.",
      });
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flight-pricing"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new pricing
  const handleAddPricing = (data: z.infer<typeof FlightPricingFormSchema>) => {
    addMutation.mutate(data);
  };

  // Handle editing a pricing
  const handleEditPricing = (data: z.infer<typeof FlightPricingFormSchema>) => {
    if (!selectedPrice) return;
    updateMutation.mutate({ id: selectedPrice.id, data });
  };

  // Open edit dialog with selected pricing data
  const openEditDialog = (pricing: FlightPricing) => {
    setSelectedPrice(pricing);
    editForm.reset({
      basePrice: pricing.basePrice,
      originAirport: pricing.originAirport,
      destinationAirport: pricing.destinationAirport,
      currency: pricing.currency || "USD",
      travelClass: pricing.travelClass || "economy",
      isActive: pricing.isActive === null ? true : pricing.isActive,
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a pricing
  const handleDeletePricing = (id: number) => {
    if (confirm("Are you sure you want to delete this base pricing?")) {
      deleteMutation.mutate(id);
    }
  };

  // Get travel class badge variant
  const getTravelClassBadgeVariant = (travelClass: string | null) => {
    switch (travelClass) {
      case "economy":
        return "default";
      case "business":
        return "secondary";
      case "first":
        return "outline";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Base Flight Pricing</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Base Price
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Base Price</DialogTitle>
                <DialogDescription>
                  Create a new base pricing for flight routes.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddPricing)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="originAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Airport</FormLabel>
                          <FormControl>
                            <Input placeholder="JFK" {...field} />
                          </FormControl>
                          <FormDescription>Enter the IATA code</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="destinationAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Airport</FormLabel>
                          <FormControl>
                            <Input placeholder="LHR" {...field} />
                          </FormControl>
                          <FormDescription>Enter the IATA code</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="travelClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="first">First</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Set this pricing as active
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Add Base Price</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Edit Base Price</DialogTitle>
                <DialogDescription>
                  Update the details of this base pricing.
                </DialogDescription>
              </DialogHeader>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(handleEditPricing)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="originAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Origin Airport</FormLabel>
                          <FormControl>
                            <Input placeholder="JFK" {...field} />
                          </FormControl>
                          <FormDescription>Enter the IATA code</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="destinationAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Destination Airport</FormLabel>
                          <FormControl>
                            <Input placeholder="LHR" {...field} />
                          </FormControl>
                          <FormDescription>Enter the IATA code</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="basePrice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Base Price</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={editForm.control}
                      name="travelClass"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Travel Class</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="economy">Economy</SelectItem>
                              <SelectItem value="business">Business</SelectItem>
                              <SelectItem value="first">First</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
                      name="isActive"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-end space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Active</FormLabel>
                            <FormDescription>
                              Set this pricing as active
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit">Update Base Price</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Base Price Management</CardTitle>
              <CardDescription>
                Manage the base prices for flight routes based on origin, destination, and class.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableCaption>List of current base pricing configurations</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Origin</TableHead>
                    <TableHead>Destination</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Base Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricingList && pricingList.length > 0 ? (
                    pricingList.map((pricing) => (
                      <TableRow key={pricing.id}>
                        <TableCell className="font-medium">{pricing.originAirport}</TableCell>
                        <TableCell>{pricing.destinationAirport}</TableCell>
                        <TableCell>
                          <Badge variant={getTravelClassBadgeVariant(pricing.travelClass)}>
                            {pricing.travelClass ? (pricing.travelClass.charAt(0).toUpperCase() + pricing.travelClass.slice(1)) : "Economy"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${pricing.basePrice.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant={pricing.isActive ? "default" : "secondary"}>
                            {pricing.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(pricing)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePricing(pricing.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-gray-500">
                        No base pricing defined yet. Add a new base price to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="text-sm text-gray-500">
                Base pricing will be applied to all bookings based on these rules.
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}