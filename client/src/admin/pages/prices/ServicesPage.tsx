import { useState } from "react";
import AdminLayout from "../../components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Edit, Trash2, SlidersHorizontal, RefreshCw } from "lucide-react";

// Simplified model for additional services
interface AdditionalService {
  id: number;
  name: string;
  description: string;
  price: number;
  type: "baggage" | "seat" | "meal" | "priority" | "insurance" | "other";
  isRequired: boolean;
  isPerPassenger: boolean;
  isPerFlight: boolean;
  currency: string;
  availableClasses: string[]; // economy, business, first
}

const serviceTypes = [
  { value: "baggage", label: "Baggage" },
  { value: "seat", label: "Seat Selection" },
  { value: "meal", label: "Meal Options" },
  { value: "priority", label: "Priority Services" },
  { value: "insurance", label: "Insurance" },
  { value: "other", label: "Other" },
];

const travelClasses = [
  { id: "economy", label: "Economy" },
  { id: "business", label: "Business" },
  { id: "first", label: "First Class" },
];

const ServiceFormSchema = z.object({
  name: z.string().min(3, { message: "Service name is required" }),
  description: z.string().min(3, { message: "Description is required" }),
  price: z.number().min(0, { message: "Price must be a positive number" }),
  type: z.enum(["baggage", "seat", "meal", "priority", "insurance", "other"]),
  currency: z.string().min(1, { message: "Currency is required" }),
  // Keep these fields in schema for backward compatibility but don't display in UI
  isRequired: z.boolean().default(false),
  isPerPassenger: z.boolean().default(true),
  isPerFlight: z.boolean().default(false),
  availableClasses: z.array(z.string()).default(["economy", "business", "first"]),
});

const ServicesPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<AdditionalService | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Fetch services from the API
  const { data: services, isLoading } = useQuery<AdditionalService[]>({
    queryKey: ["/api/admin/services"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Filter services based on active tab
  const filteredServices = services?.filter(
    (service) => activeTab === "all" || service.type === activeTab
  );

  // Add new service form
  const addForm = useForm<z.infer<typeof ServiceFormSchema>>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      type: "other",
      isRequired: false,
      isPerPassenger: true,
      isPerFlight: false,
      currency: "USD",
      availableClasses: ["economy", "business", "first"],
    },
  });

  // Edit service form
  const editForm = useForm<z.infer<typeof ServiceFormSchema>>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      type: "other",
      isRequired: false,
      isPerPassenger: true,
      isPerFlight: false,
      currency: "USD",
      availableClasses: [],
    },
  });

  // Reset services mutation
  const resetServicesMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/services/reset");
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to reset services");
      }
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Services Reset",
        description: `Services reset successfully with ${data.services.length} default services.`,
      });
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Mutations for service operations
  const addMutation = useMutation({
    mutationFn: async (data: z.infer<typeof ServiceFormSchema>) => {
      const res = await apiRequest("POST", "/api/admin/services", data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to add service");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service added",
        description: "The service has been added successfully.",
      });
      setIsAddDialogOpen(false);
      addForm.reset();
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
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
    mutationFn: async ({ id, data }: { id: number; data: z.infer<typeof ServiceFormSchema> }) => {
      const res = await apiRequest("PATCH", `/api/admin/services/${id}`, data);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to update service");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service updated",
        description: "The service has been updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedService(null);
      editForm.reset();
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
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
      const res = await apiRequest("DELETE", `/api/admin/services/${id}`);
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to delete service");
      }
      return true;
    },
    onSuccess: () => {
      toast({
        title: "Service deleted",
        description: "The service has been deleted successfully.",
      });
      // Refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/admin/services"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle adding a new service
  const handleAddService = (data: z.infer<typeof ServiceFormSchema>) => {
    addMutation.mutate(data);
  };

  // Handle editing a service
  const handleEditService = (data: z.infer<typeof ServiceFormSchema>) => {
    if (!selectedService) return;
    updateMutation.mutate({ id: selectedService.id, data });
  };

  // Open edit dialog with selected service data
  const openEditDialog = (service: AdditionalService) => {
    setSelectedService(service);
    editForm.reset({
      name: service.name,
      description: service.description,
      price: service.price,
      type: service.type,
      currency: service.currency,
      isRequired: service.isRequired || false,
      isPerPassenger: service.isPerPassenger || true,
      isPerFlight: service.isPerFlight || false,
      availableClasses: service.availableClasses || ["economy", "business", "first"],
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a service
  const handleDeleteService = (id: number) => {
    if (confirm("Are you sure you want to delete this service?")) {
      deleteMutation.mutate(id);
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

  // Get type badge variant
  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case "baggage":
        return "default";
      case "seat":
        return "secondary";
      case "meal":
        return "outline";
      case "priority":
        return "destructive";
      case "insurance":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Additional Services</h1>
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => {
                if (confirm("Reset all services to defaults? This will delete all existing services.")) {
                  resetServicesMutation.mutate();
                }
              }}
              disabled={resetServicesMutation.isPending}
              className="flex items-center gap-2"
            >
              {resetServicesMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Reset to Defaults
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add New Service
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Add New Service</DialogTitle>
                  <DialogDescription>
                    Create a new additional service that can be offered to customers during booking.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddService)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Extra Baggage" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {serviceTypes.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe the service details" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="price"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Price</FormLabel>
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
                                <SelectItem value="EUR">EUR</SelectItem>
                                <SelectItem value="GBP">GBP</SelectItem>
                                <SelectItem value="AUD">AUD</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {/* Fields for per-passenger, per-flight, required, and travel classes removed per requirements */}
                    <DialogFooter>
                      <Button type="submit">Add Service</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Additional Services</CardTitle>
            <CardDescription>
              Add, edit or remove additional services that customers can purchase during booking.
            </CardDescription>
            <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-7 max-w-screen-lg">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="baggage">Baggage</TabsTrigger>
                <TabsTrigger value="seat">Seats</TabsTrigger>
                <TabsTrigger value="meal">Meals</TabsTrigger>
                <TabsTrigger value="priority">Priority</TabsTrigger>
                <TabsTrigger value="insurance">Insurance</TabsTrigger>
                <TabsTrigger value="other">Other</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices && filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <TableRow key={service.id}>
                      <TableCell>
                        <div>{service.name}</div>
                        <div className="text-xs text-muted-foreground mt-1">{service.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getTypeBadgeVariant(service.type) as any}>
                          {serviceTypes.find(t => t.value === service.type)?.label || service.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {service.price.toFixed(2)} {service.currency}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                      No services found. Add a new service to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Service</DialogTitle>
              <DialogDescription>
                Update the details of this additional service.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditService)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Extra Baggage" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Service Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {serviceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the service details" 
                          className="resize-none" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
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
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                            <SelectItem value="AUD">AUD</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Update Service</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default ServicesPage;