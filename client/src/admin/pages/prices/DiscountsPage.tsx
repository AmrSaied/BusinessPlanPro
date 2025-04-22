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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Edit, Trash2, AlertCircle } from "lucide-react";

// Simplified model for discounts
interface Discount {
  id: number;
  code: string;
  name: string;
  description: string;
  type: "percentage" | "fixed";
  value: number;
  maxDiscount?: number;
  startDate: string;
  endDate?: string;
  minBookingValue?: number;
  maxUsage?: number;
  currentUsage: number;
  isActive: boolean;
  applicableClasses: string[]; // economy, business, first
}

const discountTypes = [
  { value: "percentage", label: "Percentage" },
  { value: "fixed", label: "Fixed Amount" },
];

const travelClasses = [
  { id: "economy", label: "Economy" },
  { id: "business", label: "Business" },
  { id: "first", label: "First Class" },
];

const DiscountFormSchema = z.object({
  code: z.string().min(3, { message: "Discount code is required" }),
  name: z.string().min(3, { message: "Discount name is required" }),
  description: z.string().min(3, { message: "Description is required" }),
  type: z.enum(["percentage", "fixed"]),
  value: z.number().min(0, { message: "Value must be a positive number" }),
  maxDiscount: z.number().optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().optional(),
  minBookingValue: z.number().optional(),
  maxUsage: z.number().int().optional(),
  isActive: z.boolean().default(true),
  applicableClasses: z.array(z.string()).min(1, { message: "At least one travel class must be selected" }),
});

const DiscountsPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

  // Example data - replace with actual API call
  const mockDiscounts: Discount[] = [
    {
      id: 1,
      code: "SUMMER2025",
      name: "Summer Special",
      description: "Summer vacation special discount",
      type: "percentage",
      value: 15,
      maxDiscount: 100,
      startDate: "2025-06-01",
      endDate: "2025-08-31",
      minBookingValue: 200,
      maxUsage: 1000,
      currentUsage: 453,
      isActive: true,
      applicableClasses: ["economy", "business"],
    },
    {
      id: 2,
      code: "WELCOME50",
      name: "First Booking",
      description: "Discount for first-time users",
      type: "fixed",
      value: 50,
      startDate: "2025-01-01",
      endDate: "2025-12-31",
      maxUsage: 500,
      currentUsage: 124,
      isActive: true,
      applicableClasses: ["economy", "business", "first"],
    },
    {
      id: 3,
      code: "FLASH25",
      name: "Flash Sale",
      description: "Limited time flash sale",
      type: "percentage",
      value: 25,
      maxDiscount: 150,
      startDate: "2025-04-15",
      endDate: "2025-04-20",
      minBookingValue: 300,
      maxUsage: 200,
      currentUsage: 45,
      isActive: false,
      applicableClasses: ["economy"],
    },
    {
      id: 4,
      code: "HOLIDAY100",
      name: "Holiday Discount",
      description: "Special holiday season offer",
      type: "fixed",
      value: 100,
      startDate: "2025-12-01",
      endDate: "2025-12-31",
      minBookingValue: 500,
      isActive: true,
      applicableClasses: ["business", "first"],
      currentUsage: 0,
    },
  ];

  // Fetch discounts
  const { data: discounts, isLoading } = useQuery<Discount[]>({
    queryKey: ["/api/admin/prices/discounts"],
    queryFn: () => mockDiscounts, // Replace with actual API call
  });

  // Filter discounts based on active tab
  const filteredDiscounts = discounts?.filter(
    (discount) => activeTab === "all" || 
                 (activeTab === "active" && discount.isActive) ||
                 (activeTab === "inactive" && !discount.isActive)
  );

  // Add new discount form
  const addForm = useForm<z.infer<typeof DiscountFormSchema>>({
    resolver: zodResolver(DiscountFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      startDate: new Date().toISOString().split("T")[0],
      isActive: true,
      applicableClasses: ["economy", "business", "first"],
    },
  });

  // Edit discount form
  const editForm = useForm<z.infer<typeof DiscountFormSchema>>({
    resolver: zodResolver(DiscountFormSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      type: "percentage",
      value: 0,
      startDate: "",
      isActive: true,
      applicableClasses: [],
    },
  });

  // Handle adding a new discount
  const handleAddDiscount = (data: z.infer<typeof DiscountFormSchema>) => {
    // Example - replace with actual API call
    toast({
      title: "Discount added",
      description: `Discount code ${data.code} has been added successfully.`,
    });
    setIsAddDialogOpen(false);
    addForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/discounts"] });
  };

  // Handle editing a discount
  const handleEditDiscount = (data: z.infer<typeof DiscountFormSchema>) => {
    if (!selectedDiscount) return;
    
    // Example - replace with actual API call
    toast({
      title: "Discount updated",
      description: `Discount code ${data.code} has been updated successfully.`,
    });
    setIsEditDialogOpen(false);
    setSelectedDiscount(null);
    editForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/discounts"] });
  };

  // Open edit dialog with selected discount data
  const openEditDialog = (discount: Discount) => {
    setSelectedDiscount(discount);
    editForm.reset({
      code: discount.code,
      name: discount.name,
      description: discount.description,
      type: discount.type,
      value: discount.value,
      maxDiscount: discount.maxDiscount,
      startDate: discount.startDate,
      endDate: discount.endDate,
      minBookingValue: discount.minBookingValue,
      maxUsage: discount.maxUsage,
      isActive: discount.isActive,
      applicableClasses: discount.applicableClasses,
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a discount
  const handleDeleteDiscount = (id: number) => {
    // Example - replace with actual API call
    toast({
      title: "Discount deleted",
      description: "The discount has been deleted successfully.",
    });
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/discounts"] });
  };

  // Toggle discount active status
  const toggleDiscountStatus = (discount: Discount) => {
    // Example - replace with actual API call
    toast({
      title: discount.isActive ? "Discount deactivated" : "Discount activated",
      description: `Discount code ${discount.code} has been ${discount.isActive ? "deactivated" : "activated"}.`,
    });
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/discounts"] });
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
          <h1 className="text-3xl font-bold tracking-tight">Discounts & Promotions</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Discount
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Discount</DialogTitle>
                <DialogDescription>
                  Create a new discount or promotional code that customers can use during booking.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddDiscount)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Code</FormLabel>
                          <FormControl>
                            <Input placeholder="SUMMER2025" {...field} />
                          </FormControl>
                          <FormDescription>
                            Code that customers will enter at checkout
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Summer Special" {...field} />
                          </FormControl>
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
                            placeholder="Describe the discount details" 
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
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Discount Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {discountTypes.map((type) => (
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
                    <FormField
                      control={addForm.control}
                      name="value"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            {addForm.watch("type") === "percentage" ? "Percentage (%)" : "Amount"}
                          </FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder={addForm.watch("type") === "percentage" ? "15" : "50"} 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  {addForm.watch("type") === "percentage" && (
                    <FormField
                      control={addForm.control}
                      name="maxDiscount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Discount Amount (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="100" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave blank for no maximum
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="startDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Start Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="endDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>Leave blank if no end date</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="minBookingValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Booking Value (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="200" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave blank for no minimum
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="maxUsage"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Usage Count (Optional)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="1000" 
                              {...field} 
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                            />
                          </FormControl>
                          <FormDescription>
                            Leave blank for unlimited usage
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={addForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Active</FormLabel>
                          <FormDescription>
                            Enable this discount for immediate use
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
                    name="applicableClasses"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Applicable Travel Classes</FormLabel>
                          <FormDescription>
                            Select which travel classes this discount can be applied to
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          {travelClasses.map((item) => (
                            <FormField
                              key={item.id}
                              control={addForm.control}
                              name="applicableClasses"
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
                    <Button type="submit">Add Discount</Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Manage Discounts & Promotions</CardTitle>
            <CardDescription>
              Create and manage promotional codes and discounts for customers.
            </CardDescription>
            <Tabs defaultValue="all" className="mt-6" onValueChange={setActiveTab}>
              <TabsList className="grid w-[400px] grid-cols-3">
                <TabsTrigger value="all">All Discounts</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code & Name</TableHead>
                  <TableHead>Discount Value</TableHead>
                  <TableHead>Validity</TableHead>
                  <TableHead>Usage / Limits</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDiscounts && filteredDiscounts.map((discount) => (
                  <TableRow key={discount.id}>
                    <TableCell className="font-medium">
                      <div className="text-primary">{discount.code}</div>
                      <div className="text-sm">{discount.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">{discount.description}</div>
                    </TableCell>
                    <TableCell>
                      {discount.type === "percentage" ? (
                        <div>
                          <div>{discount.value}% off</div>
                          {discount.maxDiscount && (
                            <div className="text-xs text-muted-foreground mt-1">
                              Max: {discount.maxDiscount}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>{discount.value} off</div>
                      )}
                      {discount.minBookingValue && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Min. purchase: {discount.minBookingValue}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>From: {discount.startDate}</div>
                      {discount.endDate ? (
                        <div>To: {discount.endDate}</div>
                      ) : (
                        <div className="text-xs text-muted-foreground">No end date</div>
                      )}
                    </TableCell>
                    <TableCell>
                      {discount.maxUsage ? (
                        <div>
                          {discount.currentUsage} / {discount.maxUsage} used
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${(discount.currentUsage / discount.maxUsage) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          {discount.currentUsage} used
                          <div className="text-xs text-muted-foreground">Unlimited</div>
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={discount.isActive ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => toggleDiscountStatus(discount)}
                      >
                        {discount.isActive ? "Active" : "Inactive"}
                      </Badge>
                      <div className="text-xs mt-2">
                        For: {discount.applicableClasses.map(c => c.charAt(0).toUpperCase() + c.slice(1)).join(", ")}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(discount)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteDiscount(discount.id)}
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
            <DialogTitle>Edit Discount</DialogTitle>
            <DialogDescription>
              Update the details for this discount or promotion.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditDiscount)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Code</FormLabel>
                      <FormControl>
                        <Input placeholder="SUMMER2025" {...field} />
                      </FormControl>
                      <FormDescription>
                        Code that customers will enter at checkout
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Summer Special" {...field} />
                      </FormControl>
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
                        placeholder="Describe the discount details" 
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
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discount Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {discountTypes.map((type) => (
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
                <FormField
                  control={editForm.control}
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {editForm.watch("type") === "percentage" ? "Percentage (%)" : "Amount"}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder={editForm.watch("type") === "percentage" ? "15" : "50"} 
                          {...field} 
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {editForm.watch("type") === "percentage" && (
                <FormField
                  control={editForm.control}
                  name="maxDiscount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Discount Amount (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="100" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank for no maximum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormDescription>Leave blank if no end date</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="minBookingValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Booking Value (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="200" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank for no minimum
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="maxUsage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Usage Count (Optional)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="1000" 
                          {...field} 
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormDescription>
                        Leave blank for unlimited usage
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Enable this discount for immediate use
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
                name="applicableClasses"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel className="text-base">Applicable Travel Classes</FormLabel>
                      <FormDescription>
                        Select which travel classes this discount can be applied to
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {travelClasses.map((item) => (
                        <FormField
                          key={item.id}
                          control={editForm.control}
                          name="applicableClasses"
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
              {selectedDiscount && (
                <div className="flex gap-2 items-center rounded-lg border p-3 shadow-sm bg-muted">
                  <AlertCircle className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">
                    This discount has been used {selectedDiscount.currentUsage} times.
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button type="submit">Update Discount</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default DiscountsPage;