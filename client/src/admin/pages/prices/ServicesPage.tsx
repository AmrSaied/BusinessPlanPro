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
import { Loader2, Plus, Edit, Trash2, SlidersHorizontal } from "lucide-react";

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
  isRequired: z.boolean().default(false),
  isPerPassenger: z.boolean().default(true),
  isPerFlight: z.boolean().default(false),
  currency: z.string().min(1, { message: "Currency is required" }),
  availableClasses: z.array(z.string()).min(1, { message: "At least one travel class must be selected" }),
});

const ServicesPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<AdditionalService | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Example data - replace with actual API call
  const mockServices: AdditionalService[] = [
    {
      id: 1,
      name: "Extra Baggage",
      description: "Additional baggage allowance (23kg per piece)",
      price: 50,
      type: "baggage",
      isRequired: false,
      isPerPassenger: true,
      isPerFlight: false,
      currency: "USD",
      availableClasses: ["economy", "business", "first"],
    },
    {
      id: 2,
      name: "Premium Seat Selection",
      description: "Select seats with extra legroom",
      price: 25,
      type: "seat",
      isRequired: false,
      isPerPassenger: true,
      isPerFlight: false,
      currency: "USD",
      availableClasses: ["economy"],
    },
    {
      id: 3,
      name: "Special Meal",
      description: "Special dietary meals (vegetarian, kosher, etc.)",
      price: 15,
      type: "meal",
      isRequired: false,
      isPerPassenger: true,
      isPerFlight: true,
      currency: "USD",
      availableClasses: ["economy", "business"],
    },
    {
      id: 4,
      name: "Priority Boarding",
      description: "Board the aircraft before other passengers",
      price: 20,
      type: "priority",
      isRequired: false,
      isPerPassenger: true,
      isPerFlight: true,
      currency: "USD",
      availableClasses: ["economy"],
    },
    {
      id: 5,
      name: "Travel Insurance",
      description: "Comprehensive travel insurance coverage",
      price: 45,
      type: "insurance",
      isRequired: false,
      isPerPassenger: true,
      isPerFlight: false,
      currency: "USD",
      availableClasses: ["economy", "business", "first"],
    },
  ];

  // Fetch services
  const { data: services, isLoading } = useQuery<AdditionalService[]>({
    queryKey: ["/api/admin/prices/services"],
    queryFn: () => mockServices, // Replace with actual API call
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

  // Handle adding a new service
  const handleAddService = (data: z.infer<typeof ServiceFormSchema>) => {
    // Example - replace with actual API call
    toast({
      title: "Service added",
      description: `${data.name} has been added successfully.`,
    });
    setIsAddDialogOpen(false);
    addForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/services"] });
  };

  // Handle editing a service
  const handleEditService = (data: z.infer<typeof ServiceFormSchema>) => {
    if (!selectedService) return;
    
    // Example - replace with actual API call
    toast({
      title: "Service updated",
      description: `${data.name} has been updated successfully.`,
    });
    setIsEditDialogOpen(false);
    setSelectedService(null);
    editForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/services"] });
  };

  // Open edit dialog with selected service data
  const openEditDialog = (service: AdditionalService) => {
    setSelectedService(service);
    editForm.reset({
      name: service.name,
      description: service.description,
      price: service.price,
      type: service.type,
      isRequired: service.isRequired,
      isPerPassenger: service.isPerPassenger,
      isPerFlight: service.isPerFlight,
      currency: service.currency,
      availableClasses: service.availableClasses,
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a service
  const handleDeleteService = (id: number) => {
    // Example - replace with actual API call
    toast({
      title: "Service deleted",
      description: "The service has been deleted successfully.",
    });
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/services"] });
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
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={addForm.control}
                      name="isRequired"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Required</FormLabel>
                            <FormDescription>
                              Must be purchased
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="isPerPassenger"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Per Passenger</FormLabel>
                            <FormDescription>
                              Apply to each passenger
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="isPerFlight"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Per Flight</FormLabel>
                            <FormDescription>
                              Apply to each flight segment
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={addForm.control}
                    name="availableClasses"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Available for Travel Classes</FormLabel>
                          <FormDescription>
                            Select which travel classes this service is available for
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {travelClasses.map((item) => (
                            <FormField
                              key={item.id}
                              control={addForm.control}
                              name="availableClasses"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={item.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(item.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, item.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== item.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <DialogFooter>
                    <Button type="submit">Add Service</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Additional Services</CardTitle>
            <CardDescription>
              Add, edit or remove additional services that customers can purchase during booking.
            </CardDescription>
            <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-7">
                <TabsTrigger value="all" className="text-xs md:text-sm">All</TabsTrigger>
                {serviceTypes.map((type) => (
                  <TabsTrigger 
                    key={type.value} 
                    value={type.value}
                    className="text-xs md:text-sm"
                  >
                    {type.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead>Options</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices && filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">
                      <div>{service.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{service.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getTypeBadgeVariant(service.type) as any}>
                        {serviceTypes.find(t => t.value === service.type)?.label || "Other"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {service.price} {service.currency}
                    </TableCell>
                    <TableCell>
                      {service.availableClasses.map((cls) => (
                        <div key={cls} className="text-xs capitalize">
                          {cls}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-xs">
                        {service.isRequired && <div>Required</div>}
                        {service.isPerPassenger && <div>Per passenger</div>}
                        {service.isPerFlight && <div>Per flight</div>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update the details for this additional service.
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
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="isRequired"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Required</FormLabel>
                        <FormDescription>
                          Must be purchased
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isPerPassenger"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Per Passenger</FormLabel>
                        <FormDescription>
                          Apply to each passenger
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isPerFlight"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Per Flight</FormLabel>
                        <FormDescription>
                          Apply to each flight segment
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="availableClasses"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Available for Travel Classes</FormLabel>
                      <FormDescription>
                        Select which travel classes this service is available for
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {travelClasses.map((item) => (
                        <FormField
                          key={item.id}
                          control={editForm.control}
                          name="availableClasses"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={item.id}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(item.id)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, item.id])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== item.id
                                            )
                                          )
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {item.label}
                                </FormLabel>
                              </FormItem>
                            )
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Update Service</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default ServicesPage;