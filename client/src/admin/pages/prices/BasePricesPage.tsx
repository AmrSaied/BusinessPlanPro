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
import { Label } from "@/components/ui/label";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";

// Simplified model for base prices
interface BasePrice {
  id: number;
  fromAirport: string;
  toAirport: string;
  basePrice: number;
  businessClassMultiplier: number;
  firstClassMultiplier: number;
  currency: string;
  effectiveDate: string;
  expiryDate?: string;
}

const BasePricesFormSchema = z.object({
  fromAirport: z.string().min(3, { message: "From airport is required" }),
  toAirport: z.string().min(3, { message: "To airport is required" }),
  basePrice: z.number().min(1, { message: "Base price must be greater than 0" }),
  businessClassMultiplier: z.number().min(1, { message: "Business class multiplier must be at least 1" }),
  firstClassMultiplier: z.number().min(1, { message: "First class multiplier must be at least 1" }),
  currency: z.string().min(1, { message: "Currency is required" }),
  effectiveDate: z.string(),
  expiryDate: z.string().optional(),
});

const BasePricesPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState<BasePrice | null>(null);

  // Example data - replace with actual API call
  const mockBasePrices: BasePrice[] = [
    {
      id: 1,
      fromAirport: "LAX",
      toAirport: "JFK",
      basePrice: 250,
      businessClassMultiplier: 2.5,
      firstClassMultiplier: 4.0,
      currency: "USD",
      effectiveDate: "2025-01-01",
    },
    {
      id: 2,
      fromAirport: "LHR",
      toAirport: "CDG",
      basePrice: 120,
      businessClassMultiplier: 2.2,
      firstClassMultiplier: 3.5,
      currency: "EUR",
      effectiveDate: "2025-01-01",
    },
    {
      id: 3,
      fromAirport: "SYD",
      toAirport: "MEL",
      basePrice: 150,
      businessClassMultiplier: 2.0,
      firstClassMultiplier: 3.0,
      currency: "AUD",
      effectiveDate: "2025-01-01",
    },
  ];

  // Fetch base prices
  const { data: basePrices, isLoading } = useQuery<BasePrice[]>({
    queryKey: ["/api/admin/prices/base"],
    queryFn: () => mockBasePrices, // Replace with actual API call
  });

  // Add new base price form
  const addForm = useForm<z.infer<typeof BasePricesFormSchema>>({
    resolver: zodResolver(BasePricesFormSchema),
    defaultValues: {
      fromAirport: "",
      toAirport: "",
      basePrice: 0,
      businessClassMultiplier: 2.0,
      firstClassMultiplier: 3.5,
      currency: "USD",
      effectiveDate: new Date().toISOString().split("T")[0],
    },
  });

  // Edit base price form
  const editForm = useForm<z.infer<typeof BasePricesFormSchema>>({
    resolver: zodResolver(BasePricesFormSchema),
    defaultValues: {
      fromAirport: "",
      toAirport: "",
      basePrice: 0,
      businessClassMultiplier: 2.0,
      firstClassMultiplier: 3.5,
      currency: "USD",
      effectiveDate: "",
    },
  });

  // Handle adding a new base price
  const handleAddBasePrice = (data: z.infer<typeof BasePricesFormSchema>) => {
    // Example - replace with actual API call
    toast({
      title: "Base price added",
      description: `Base price for route ${data.fromAirport} to ${data.toAirport} added successfully.`,
    });
    setIsAddDialogOpen(false);
    addForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/base"] });
  };

  // Handle editing a base price
  const handleEditBasePrice = (data: z.infer<typeof BasePricesFormSchema>) => {
    if (!selectedPrice) return;
    
    // Example - replace with actual API call
    toast({
      title: "Base price updated",
      description: `Base price for route ${data.fromAirport} to ${data.toAirport} updated successfully.`,
    });
    setIsEditDialogOpen(false);
    setSelectedPrice(null);
    editForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/base"] });
  };

  // Open edit dialog with selected price data
  const openEditDialog = (price: BasePrice) => {
    setSelectedPrice(price);
    editForm.reset({
      fromAirport: price.fromAirport,
      toAirport: price.toAirport,
      basePrice: price.basePrice,
      businessClassMultiplier: price.businessClassMultiplier,
      firstClassMultiplier: price.firstClassMultiplier,
      currency: price.currency,
      effectiveDate: price.effectiveDate,
      expiryDate: price.expiryDate,
    });
    setIsEditDialogOpen(true);
  };

  // Handle deleting a base price
  const handleDeleteBasePrice = (id: number) => {
    // Example - replace with actual API call
    toast({
      title: "Base price deleted",
      description: "Base price deleted successfully.",
    });
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/base"] });
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
          <h1 className="text-3xl font-bold tracking-tight">Base Prices</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Base Price
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Base Price</DialogTitle>
                <DialogDescription>
                  Set the base price for a specific route. This will be used as the starting point for all fare calculations.
                </DialogDescription>
              </DialogHeader>
              <Form {...addForm}>
                <form onSubmit={addForm.handleSubmit(handleAddBasePrice)} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="fromAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>From Airport (IATA)</FormLabel>
                          <FormControl>
                            <Input placeholder="LAX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="toAirport"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>To Airport (IATA)</FormLabel>
                          <FormControl>
                            <Input placeholder="JFK" {...field} />
                          </FormControl>
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
                          <FormLabel>Base Price (Economy)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="150" 
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
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="businessClassMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Class Multiplier</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="2.5" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Multiply economy price by this factor</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="firstClassMultiplier"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Class Multiplier</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.1"
                              placeholder="4.0" 
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>Multiply economy price by this factor</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={addForm.control}
                      name="effectiveDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Effective Date</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Expiry Date (Optional)</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>Leave blank if no expiry</FormDescription>
                          <FormMessage />
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
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Route Base Prices</CardTitle>
            <CardDescription>
              Base prices for different routes. These prices are used as the foundation for calculating final fares.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route</TableHead>
                  <TableHead>Base Price</TableHead>
                  <TableHead>Multipliers</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Effective Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {basePrices && basePrices.map((price) => (
                  <TableRow key={price.id}>
                    <TableCell className="font-medium">
                      {price.fromAirport} → {price.toAirport}
                    </TableCell>
                    <TableCell>{price.basePrice}</TableCell>
                    <TableCell>
                      <div className="text-sm">Business: {price.businessClassMultiplier}x</div>
                      <div className="text-sm">First: {price.firstClassMultiplier}x</div>
                    </TableCell>
                    <TableCell>{price.currency}</TableCell>
                    <TableCell>
                      <div>{price.effectiveDate}</div>
                      {price.expiryDate && (
                        <div className="text-sm text-muted-foreground">
                          Expires: {price.expiryDate}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(price)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBasePrice(price.id)}
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
            <DialogTitle>Edit Base Price</DialogTitle>
            <DialogDescription>
              Update the base price for a specific route.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditBasePrice)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="fromAirport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>From Airport (IATA)</FormLabel>
                      <FormControl>
                        <Input placeholder="LAX" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="toAirport"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>To Airport (IATA)</FormLabel>
                      <FormControl>
                        <Input placeholder="JFK" {...field} />
                      </FormControl>
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
                      <FormLabel>Base Price (Economy)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="150" 
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
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="businessClassMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Class Multiplier</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="2.5" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Multiply economy price by this factor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="firstClassMultiplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Class Multiplier</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1"
                          placeholder="4.0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>Multiply economy price by this factor</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="effectiveDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Effective Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Date (Optional)</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormDescription>Leave blank if no expiry</FormDescription>
                      <FormMessage />
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
    </AdminLayout>
  );
};

export default BasePricesPage;