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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  Loader2, 
  Plus, 
  Edit, 
  Trash2, 
  RefreshCw,
  ArrowUpDown,
  Check,
  DollarSign,
  AlertCircle,
  Info
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Simplified model for currency
interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number; // relative to base currency
  lastUpdated: string;
  isBaseRate: boolean;
  isEnabled: boolean;
}

const CurrencyFormSchema = z.object({
  code: z.string().length(3, { message: "Currency code must be 3 characters" }),
  name: z.string().min(2, { message: "Currency name is required" }),
  symbol: z.string().min(1, { message: "Symbol is required" }),
  exchangeRate: z.number().positive({ message: "Exchange rate must be positive" }),
  isEnabled: z.boolean().default(true),
});

const CurrencyPage = () => {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdateRatesDialogOpen, setIsUpdateRatesDialogOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null);

  // Example data - replace with actual API call
  const mockCurrencies: Currency[] = [
    {
      id: 1,
      code: "USD",
      name: "US Dollar",
      symbol: "$",
      exchangeRate: 1.0,
      lastUpdated: "2025-04-22T10:00:00",
      isBaseRate: true, // Base currency
      isEnabled: true,
    },
    {
      id: 2,
      code: "EUR",
      name: "Euro",
      symbol: "€",
      exchangeRate: 0.92,
      lastUpdated: "2025-04-22T10:00:00",
      isBaseRate: false,
      isEnabled: true,
    },
    {
      id: 3,
      code: "GBP",
      name: "British Pound",
      symbol: "£",
      exchangeRate: 0.77,
      lastUpdated: "2025-04-22T10:00:00",
      isBaseRate: false,
      isEnabled: true,
    },
    {
      id: 4,
      code: "JPY",
      name: "Japanese Yen",
      symbol: "¥",
      exchangeRate: 150.45,
      lastUpdated: "2025-04-22T10:00:00",
      isBaseRate: false,
      isEnabled: true,
    },
    {
      id: 5,
      code: "AUD",
      name: "Australian Dollar",
      symbol: "A$",
      exchangeRate: 1.48,
      lastUpdated: "2025-04-22T10:00:00",
      isBaseRate: false,
      isEnabled: true,
    },
    {
      id: 6,
      code: "CAD",
      name: "Canadian Dollar",
      symbol: "C$",
      exchangeRate: 1.35,
      lastUpdated: "2025-04-22T10:00:00",
      isBaseRate: false,
      isEnabled: false,
    },
  ];

  // Fetch currencies
  const { data: currencies, isLoading } = useQuery<Currency[]>({
    queryKey: ["/api/admin/prices/currencies"],
    queryFn: () => mockCurrencies, // Replace with actual API call
  });

  // Add new currency form
  const addForm = useForm<z.infer<typeof CurrencyFormSchema>>({
    resolver: zodResolver(CurrencyFormSchema),
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
      exchangeRate: 1.0,
      isEnabled: true,
    },
  });

  // Edit currency form
  const editForm = useForm<z.infer<typeof CurrencyFormSchema>>({
    resolver: zodResolver(CurrencyFormSchema),
    defaultValues: {
      code: "",
      name: "",
      symbol: "",
      exchangeRate: 1.0,
      isEnabled: true,
    },
  });

  // Handle adding a new currency
  const handleAddCurrency = (data: z.infer<typeof CurrencyFormSchema>) => {
    // Example - replace with actual API call
    toast({
      title: "Currency added",
      description: `${data.name} (${data.code}) has been added successfully.`,
    });
    setIsAddDialogOpen(false);
    addForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/currencies"] });
  };

  // Handle editing a currency
  const handleEditCurrency = (data: z.infer<typeof CurrencyFormSchema>) => {
    if (!selectedCurrency) return;
    
    // Example - replace with actual API call
    toast({
      title: "Currency updated",
      description: `${data.name} (${data.code}) has been updated successfully.`,
    });
    setIsEditDialogOpen(false);
    setSelectedCurrency(null);
    editForm.reset();
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/currencies"] });
  };

  // Open edit dialog with selected currency data
  const openEditDialog = (currency: Currency) => {
    setSelectedCurrency(currency);
    editForm.reset({
      code: currency.code,
      name: currency.name,
      symbol: currency.symbol,
      exchangeRate: currency.exchangeRate,
      isEnabled: currency.isEnabled,
    });
    setIsEditDialogOpen(true);
  };

  // Handle setting a currency as base
  const handleSetAsBase = (currency: Currency) => {
    // Example - replace with actual API call
    toast({
      title: "Base currency changed",
      description: `${currency.name} (${currency.code}) is now the base currency.`,
    });
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/currencies"] });
  };

  // Handle toggling currency enabled status
  const handleToggleEnabled = (currency: Currency) => {
    // Example - replace with actual API call
    toast({
      title: currency.isEnabled ? "Currency disabled" : "Currency enabled",
      description: `${currency.name} (${currency.code}) is now ${currency.isEnabled ? "disabled" : "enabled"}.`,
    });
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/currencies"] });
  };

  // Handle deleting a currency
  const handleDeleteCurrency = (id: number) => {
    // Example - replace with actual API call
    toast({
      title: "Currency deleted",
      description: "The currency has been deleted successfully.",
    });
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/currencies"] });
  };

  // Handle updating exchange rates
  const handleUpdateRates = () => {
    // Example - replace with actual API call
    toast({
      title: "Exchange rates updated",
      description: "All currency exchange rates have been updated from the latest market data.",
    });
    setIsUpdateRatesDialogOpen(false);
    // Invalidate query to refresh data
    // queryClient.invalidateQueries({ queryKey: ["/api/admin/prices/currencies"] });
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

  // Get base currency
  const baseCurrency = currencies?.find((currency) => currency.isBaseRate) || currencies?.[0];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Currency Settings</h1>
          <div className="flex gap-2">
            <Dialog open={isUpdateRatesDialogOpen} onOpenChange={setIsUpdateRatesDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Update Rates
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Exchange Rates</DialogTitle>
                  <DialogDescription>
                    This will update all currency exchange rates using the latest market data.
                    The base currency ({baseCurrency?.code}) will remain at 1.0.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      Updating exchange rates will affect all prices displayed to customers in non-base currencies.
                      This operation cannot be automatically undone.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsUpdateRatesDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateRates}>
                    Update All Rates
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Currency
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Currency</DialogTitle>
                  <DialogDescription>
                    Add a new currency to support payments in multiple currencies.
                  </DialogDescription>
                </DialogHeader>
                <Form {...addForm}>
                  <form onSubmit={addForm.handleSubmit(handleAddCurrency)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={addForm.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency Code</FormLabel>
                            <FormControl>
                              <Input placeholder="USD" {...field} maxLength={3} />
                            </FormControl>
                            <FormDescription>
                              3-letter ISO code (e.g., USD, EUR)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={addForm.control}
                        name="symbol"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Symbol</FormLabel>
                            <FormControl>
                              <Input placeholder="$" {...field} />
                            </FormControl>
                            <FormDescription>
                              Currency symbol (e.g., $, €)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={addForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency Name</FormLabel>
                          <FormControl>
                            <Input placeholder="US Dollar" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="exchangeRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Exchange Rate (to {baseCurrency?.code})</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.0001"
                              placeholder="1.0" 
                              {...field} 
                              onChange={(e) => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormDescription>
                            1 {baseCurrency?.code} = ? (your currency)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={addForm.control}
                      name="isEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Enabled</FormLabel>
                            <FormDescription>
                              Allow customers to use this currency
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
                    <DialogFooter>
                      <Button type="submit">Add Currency</Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Currency Management</CardTitle>
            <CardDescription>
              Configure currency settings and exchange rates for your application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-6 p-3 bg-muted rounded-md">
              <Info className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium">Base Currency: <span className="font-bold">{baseCurrency?.name} ({baseCurrency?.code})</span></p>
                <p className="text-xs text-muted-foreground">All exchange rates are calculated relative to the base currency. Set a different currency as base to recalculate all rates.</p>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead>Exchange Rate</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currencies && currencies.map((currency) => (
                  <TableRow key={currency.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-1.5">
                        {currency.isBaseRate && (
                          <Badge variant="outline" className="border-primary mr-1">
                            Base
                          </Badge>
                        )}
                        <span className="text-lg">{currency.symbol}</span>
                        <div>
                          <div>{currency.code}</div>
                          <div className="text-xs text-muted-foreground">{currency.name}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {currency.isBaseRate ? (
                        <div className="text-sm font-medium">1.0 (Base)</div>
                      ) : (
                        <div className="text-sm font-medium">{currency.exchangeRate.toFixed(4)}</div>
                      )}
                      {!currency.isBaseRate && (
                        <div className="text-xs text-muted-foreground">
                          1 {baseCurrency?.code} = {currency.exchangeRate.toFixed(4)} {currency.code}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(currency.lastUpdated).toLocaleDateString()} 
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(currency.lastUpdated).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={currency.isEnabled ? "default" : "secondary"}
                        className="cursor-pointer"
                        onClick={() => !currency.isBaseRate && handleToggleEnabled(currency)}
                      >
                        {currency.isEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {!currency.isBaseRate && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleSetAsBase(currency)}
                                >
                                  <DollarSign className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Set as base currency</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(currency)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {!currency.isBaseRate && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteCurrency(currency.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Currency</DialogTitle>
            <DialogDescription>
              Update the details for this currency.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditCurrency)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency Code</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="USD" 
                          {...field} 
                          maxLength={3} 
                          disabled={selectedCurrency?.isBaseRate}
                        />
                      </FormControl>
                      <FormDescription>
                        3-letter ISO code (e.g., USD, EUR)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="symbol"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input placeholder="$" {...field} />
                      </FormControl>
                      <FormDescription>
                        Currency symbol (e.g., $, €)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency Name</FormLabel>
                    <FormControl>
                      <Input placeholder="US Dollar" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="exchangeRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exchange Rate (to {baseCurrency?.code})</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.0001"
                        placeholder="1.0" 
                        {...field} 
                        onChange={(e) => field.onChange(parseFloat(e.target.value))}
                        disabled={selectedCurrency?.isBaseRate}
                      />
                    </FormControl>
                    <FormDescription>
                      {selectedCurrency?.isBaseRate ? 
                        "Base currency rate is always 1.0" : 
                        `1 ${baseCurrency?.code} = ? (your currency)`}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="isEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Enabled</FormLabel>
                      <FormDescription>
                        Allow customers to use this currency
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={selectedCurrency?.isBaseRate}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              {selectedCurrency?.isBaseRate && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Base Currency Restrictions</AlertTitle>
                  <AlertDescription>
                    Some settings are disabled because this is the base currency. 
                    To fully edit this currency, set another one as base first.
                  </AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="submit">Update Currency</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CurrencyPage;