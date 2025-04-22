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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Form schema for standard pricing
const StandardPricingFormSchema = z.object({
  basePrice: z.coerce.number().min(5, "Base price must be at least $5"),
  currency: z.string().default("USD"),
  travelClass: z.string().default("economy"),
  tripType: z.string().default("one-way"),
  isActive: z.boolean().default(true),
});

// Form schema for custom route pricing
const RoutePricingFormSchema = z.object({
  basePrice: z.coerce.number().min(5, "Base price must be at least $5"),
  originAirport: z.string().min(3, "Origin airport is required"),
  destinationAirport: z.string().min(3, "Destination airport is required"),
  currency: z.string().default("USD"),
  travelClass: z.string().default("economy"),
  tripType: z.string().default("one-way"),
  isActive: z.boolean().default(true),
});

export default function BasePricePage() {
  const { toast } = useToast();
  const [isEditStandardOpen, setIsEditStandardOpen] = useState(false);
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isEditRouteOpen, setIsEditRouteOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<FlightPricing | null>(null);
  const [activeTab, setActiveTab] = useState("standard");

  // Fetch flight pricing from the API
  const { data: pricingList, isLoading } = useQuery<FlightPricing[]>({
    queryKey: ["/api/admin/flight-pricing"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Edit standard pricing form
  const editStandardForm = useForm<z.infer<typeof StandardPricingFormSchema>>({
    resolver: zodResolver(StandardPricingFormSchema),
    defaultValues: {
      basePrice: 50,
      currency: "USD",
      travelClass: "economy",
      tripType: "one-way",
      isActive: true,
    },
  });

  // Add custom route pricing form
  const addRouteForm = useForm<z.infer<typeof RoutePricingFormSchema>>({
    resolver: zodResolver(RoutePricingFormSchema),
    defaultValues: {
      basePrice: 50,
      originAirport: "",
      destinationAirport: "",
      currency: "USD",
      travelClass: "economy",
      tripType: "one-way",
      isActive: true,
    },
  });

  // Edit custom route pricing form
  const editRouteForm = useForm<z.infer<typeof RoutePricingFormSchema>>({
    resolver: zodResolver(RoutePricingFormSchema),
    defaultValues: {
      basePrice: 50,
      originAirport: "",
      destinationAirport: "",
      currency: "USD",
      travelClass: "economy",
      tripType: "one-way",
      isActive: true,
    },
  });

  // Mutations for pricing operations
  const addMutation = useMutation({
    mutationFn: async (data: z.infer<typeof RoutePricingFormSchema>) => {
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
      setIsAddRouteOpen(false);
      addRouteForm.reset();
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
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
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
      setIsEditStandardOpen(false);
      setIsEditRouteOpen(false);
      setSelectedPrice(null);
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

  // Handle adding a standard pricing
  const handleEditStandardPricing = (data: z.infer<typeof StandardPricingFormSchema>) => {
    if (!selectedPrice) return;
    updateMutation.mutate({ id: selectedPrice.id, data });
  };

  // Handle adding a route pricing
  const handleAddRoutePricing = (data: z.infer<typeof RoutePricingFormSchema>) => {
    addMutation.mutate(data);
  };

  // Handle editing a route pricing
  const handleEditRoutePricing = (data: z.infer<typeof RoutePricingFormSchema>) => {
    if (!selectedPrice) return;
    updateMutation.mutate({ id: selectedPrice.id, data });
  };

  // Open standard pricing edit dialog
  const openEditStandardDialog = (pricing: FlightPricing) => {
    setSelectedPrice(pricing);
    editStandardForm.reset({
      basePrice: pricing.basePrice,
      currency: pricing.currency || "USD",
      travelClass: pricing.travelClass || "economy",
      tripType: pricing.tripType || "one-way",
      isActive: pricing.isActive === null ? true : pricing.isActive,
    });
    setIsEditStandardOpen(true);
  };

  // Open route pricing edit dialog
  const openEditRouteDialog = (pricing: FlightPricing) => {
    setSelectedPrice(pricing);
    editRouteForm.reset({
      basePrice: pricing.basePrice,
      originAirport: pricing.originAirport,
      destinationAirport: pricing.destinationAirport,
      currency: pricing.currency || "USD",
      travelClass: pricing.travelClass || "economy",
      tripType: pricing.tripType || "one-way",
      isActive: pricing.isActive === null ? true : pricing.isActive,
    });
    setIsEditRouteOpen(true);
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
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="standard">Standard Pricing</TabsTrigger>
            <TabsTrigger value="custom">Custom Routes</TabsTrigger>
          </TabsList>
          
          {/* Standard Pricing Tab Content */}
          <TabsContent value="standard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Standard Pricing</CardTitle>
                <CardDescription>Standard prices for different trip types and travel classes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Standard pricing across all routes</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Travel Class</TableHead>
                      <TableHead>Trip Type</TableHead>
                      <TableHead>Base Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingList && pricingList.length > 0 ? (
                      // Filter for standard pricing (where origin and destination are 'ANY')
                      pricingList
                        .filter(p => p.originAirport === 'ANY' && p.destinationAirport === 'ANY')
                        .map((pricing) => (
                          <TableRow key={pricing.id}>
                            <TableCell>
                              <Badge variant={getTravelClassBadgeVariant(pricing.travelClass)}>
                                {pricing.travelClass ? 
                                  pricing.travelClass.charAt(0).toUpperCase() + pricing.travelClass.slice(1) 
                                  : "Economy"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {pricing.tripType ? 
                                pricing.tripType.charAt(0).toUpperCase() + pricing.tripType.slice(1).replace('-', ' ') 
                                : "One-way"}
                            </TableCell>
                            <TableCell>
                              {pricing.basePrice} {pricing.currency || "USD"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={pricing.isActive ? "default" : "outline"}>
                                {pricing.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditStandardDialog(pricing)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">
                          No standard pricing found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Custom Routes Tab Content */}
          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Custom Route Pricing</CardTitle>
                  <CardDescription>Special pricing for specific routes</CardDescription>
                </div>
                <Dialog open={isAddRouteOpen} onOpenChange={setIsAddRouteOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Add Custom Price
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                      <DialogTitle>Add Custom Route Price</DialogTitle>
                      <DialogDescription>
                        Create a special price for a specific route.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...addRouteForm}>
                      <form onSubmit={addRouteForm.handleSubmit(handleAddRoutePricing)} className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={addRouteForm.control}
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
                            control={addRouteForm.control}
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
                            control={addRouteForm.control}
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
                            control={addRouteForm.control}
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
                        <div className="grid grid-cols-3 gap-4">
                          <FormField
                            control={addRouteForm.control}
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
                            control={addRouteForm.control}
                            name="tripType"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Trip Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select trip type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="one-way">One-way</SelectItem>
                                    <SelectItem value="round-trip">Round-trip</SelectItem>
                                    <SelectItem value="multi-city">Multi-city</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addRouteForm.control}
                            name="isActive"
                            render={({ field }) => (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                <FormControl>
                                  <input
                                    type="checkbox"
                                    className="h-4 w-4 text-primary"
                                    checked={field.value}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <div className="space-y-1 leading-none">
                                  <FormLabel>Active</FormLabel>
                                  <FormDescription>
                                    Make this pricing active
                                  </FormDescription>
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>
                        <DialogFooter>
                          <Button type="submit">
                            {addMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Add Custom Price
                          </Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableCaption>Custom pricing for specific routes</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Origin</TableHead>
                      <TableHead>Destination</TableHead>
                      <TableHead>Travel Class</TableHead>
                      <TableHead>Trip Type</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pricingList && pricingList.length > 0 ? (
                      // Filter for custom pricing (where origin and destination are NOT 'ANY')
                      pricingList
                        .filter(p => p.originAirport !== 'ANY' || p.destinationAirport !== 'ANY')
                        .map((pricing) => (
                          <TableRow key={pricing.id}>
                            <TableCell className="font-medium">{pricing.originAirport}</TableCell>
                            <TableCell>{pricing.destinationAirport}</TableCell>
                            <TableCell>
                              <Badge variant={getTravelClassBadgeVariant(pricing.travelClass)}>
                                {pricing.travelClass ? 
                                  pricing.travelClass.charAt(0).toUpperCase() + pricing.travelClass.slice(1) 
                                  : "Economy"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {pricing.tripType ? 
                                pricing.tripType.charAt(0).toUpperCase() + pricing.tripType.slice(1).replace('-', ' ') 
                                : "One-way"}
                            </TableCell>
                            <TableCell>
                              {pricing.basePrice} {pricing.currency || "USD"}
                            </TableCell>
                            <TableCell>
                              <Badge variant={pricing.isActive ? "default" : "outline"}>
                                {pricing.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => openEditRouteDialog(pricing)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
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
                        <TableCell colSpan={7} className="text-center">
                          No custom route pricing found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Standard Pricing Dialog */}
      <Dialog open={isEditStandardOpen} onOpenChange={setIsEditStandardOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Standard Price</DialogTitle>
            <DialogDescription>
              Update standard pricing for a travel class and trip type.
            </DialogDescription>
          </DialogHeader>
          <Form {...editStandardForm}>
            <form onSubmit={editStandardForm.handleSubmit(handleEditStandardPricing)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editStandardForm.control}
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
                  control={editStandardForm.control}
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
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editStandardForm.control}
                  name="travelClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Travel Class</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
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
                  control={editStandardForm.control}
                  name="tripType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one-way">One-way</SelectItem>
                          <SelectItem value="round-trip">Round-trip</SelectItem>
                          <SelectItem value="multi-city">Multi-city</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editStandardForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Make this pricing active
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Price
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Custom Route Pricing Dialog */}
      <Dialog open={isEditRouteOpen} onOpenChange={setIsEditRouteOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Custom Route Price</DialogTitle>
            <DialogDescription>
              Update pricing for a specific custom route.
            </DialogDescription>
          </DialogHeader>
          <Form {...editRouteForm}>
            <form onSubmit={editRouteForm.handleSubmit(handleEditRoutePricing)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editRouteForm.control}
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
                  control={editRouteForm.control}
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
                  control={editRouteForm.control}
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
                  control={editRouteForm.control}
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
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editRouteForm.control}
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
                  control={editRouteForm.control}
                  name="tripType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Trip Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select trip type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="one-way">One-way</SelectItem>
                          <SelectItem value="round-trip">Round-trip</SelectItem>
                          <SelectItem value="multi-city">Multi-city</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editRouteForm.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <input
                          type="checkbox"
                          className="h-4 w-4 text-primary"
                          checked={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Active</FormLabel>
                        <FormDescription>
                          Make this pricing active
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <DialogFooter>
                <Button type="submit">
                  {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Price
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}