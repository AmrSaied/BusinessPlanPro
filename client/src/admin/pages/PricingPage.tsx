import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Airport } from "@shared/schema";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2,
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  DollarSign,
  PercentIcon,
  Tags,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Interfaces for different pricing models
interface BasePricing {
  id: number;
  route: string;
  departureAirport: string;
  arrivalAirport: string;
  basePrice: number;
  currency: string;
  isActive: boolean;
}

interface DiscountRule {
  id: number;
  name: string;
  description: string;
  discountType: "percentage" | "fixed";
  discountValue: number;
  validFrom: string;
  validTo: string;
  applicableRoutes: string[];
  minimumBookingValue?: number;
  isActive: boolean;
  couponCode?: string;
}

interface ServiceFee {
  id: number;
  name: string;
  description: string;
  feeType: "percentage" | "fixed";
  feeValue: number;
  isOptional: boolean;
  isActive: boolean;
}

const PricingPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("base-pricing");
  const [isBaseModalOpen, setIsBaseModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedBasePricing, setSelectedBasePricing] = useState<BasePricing | null>(null);
  const [selectedDiscount, setSelectedDiscount] = useState<DiscountRule | null>(null);
  const [selectedFee, setSelectedFee] = useState<ServiceFee | null>(null);
  const [deleteType, setDeleteType] = useState<"base" | "discount" | "fee">("base");
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Form states
  const [basePricingForm, setBasePricingForm] = useState<Partial<BasePricing>>({
    departureAirport: "",
    arrivalAirport: "",
    basePrice: 100,
    currency: "USD",
    isActive: true,
  });

  const [discountForm, setDiscountForm] = useState<Partial<DiscountRule>>({
    name: "",
    description: "",
    discountType: "percentage",
    discountValue: 10,
    validFrom: new Date().toISOString().split("T")[0],
    validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    applicableRoutes: [],
    minimumBookingValue: 0,
    isActive: true,
    couponCode: "",
  });

  const [feeForm, setFeeForm] = useState<Partial<ServiceFee>>({
    name: "",
    description: "",
    feeType: "fixed",
    feeValue: 25,
    isOptional: true,
    isActive: true,
  });

  // Fetch pricing data
  const { data: basePricing, isLoading: isBasePricingLoading } = useQuery<BasePricing[]>({
    queryKey: ["/api/admin/pricing/base"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: discounts, isLoading: isDiscountsLoading } = useQuery<DiscountRule[]>({
    queryKey: ["/api/admin/pricing/discounts"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  const { data: fees, isLoading: isFeesLoading } = useQuery<ServiceFee[]>({
    queryKey: ["/api/admin/pricing/fees"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch airports for route selection
  const { data: airports } = useQuery<Airport[]>({
    queryKey: ["/api/airports"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // CRUD mutations for base pricing
  const createBasePricingMutation = useMutation({
    mutationFn: async (data: Partial<BasePricing>) => {
      const res = await apiRequest("POST", "/api/admin/pricing/base", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Base pricing created",
        description: "Base pricing has been created successfully",
      });
      setIsBaseModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/base"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateBasePricingMutation = useMutation({
    mutationFn: async (data: Partial<BasePricing>) => {
      if (!selectedBasePricing) return null;
      const res = await apiRequest("PATCH", `/api/admin/pricing/base/${selectedBasePricing.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Base pricing updated",
        description: "Base pricing has been updated successfully",
      });
      setIsBaseModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/base"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // CRUD mutations for discount rules
  const createDiscountMutation = useMutation({
    mutationFn: async (data: Partial<DiscountRule>) => {
      const res = await apiRequest("POST", "/api/admin/pricing/discounts", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Discount rule created",
        description: "Discount rule has been created successfully",
      });
      setIsDiscountModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/discounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateDiscountMutation = useMutation({
    mutationFn: async (data: Partial<DiscountRule>) => {
      if (!selectedDiscount) return null;
      const res = await apiRequest("PATCH", `/api/admin/pricing/discounts/${selectedDiscount.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Discount rule updated",
        description: "Discount rule has been updated successfully",
      });
      setIsDiscountModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/discounts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // CRUD mutations for service fees
  const createFeeMutation = useMutation({
    mutationFn: async (data: Partial<ServiceFee>) => {
      const res = await apiRequest("POST", "/api/admin/pricing/fees", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service fee created",
        description: "Service fee has been created successfully",
      });
      setIsFeeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/fees"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: async (data: Partial<ServiceFee>) => {
      if (!selectedFee) return null;
      const res = await apiRequest("PATCH", `/api/admin/pricing/fees/${selectedFee.id}`, data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Service fee updated",
        description: "Service fee has been updated successfully",
      });
      setIsFeeModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/fees"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (deleteId === null) return;
      
      let endpoint = "";
      switch (deleteType) {
        case "base":
          endpoint = `/api/admin/pricing/base/${deleteId}`;
          break;
        case "discount":
          endpoint = `/api/admin/pricing/discounts/${deleteId}`;
          break;
        case "fee":
          endpoint = `/api/admin/pricing/fees/${deleteId}`;
          break;
      }
      
      await apiRequest("DELETE", endpoint);
    },
    onSuccess: () => {
      toast({
        title: "Item deleted",
        description: "Item has been deleted successfully",
      });
      setIsDeleteModalOpen(false);
      
      switch (deleteType) {
        case "base":
          queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/base"] });
          break;
        case "discount":
          queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/discounts"] });
          break;
        case "fee":
          queryClient.invalidateQueries({ queryKey: ["/api/admin/pricing/fees"] });
          break;
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const openBaseModal = (pricing?: BasePricing) => {
    if (pricing) {
      setSelectedBasePricing(pricing);
      setBasePricingForm({
        departureAirport: pricing.departureAirport,
        arrivalAirport: pricing.arrivalAirport,
        basePrice: pricing.basePrice,
        currency: pricing.currency,
        isActive: pricing.isActive,
      });
    } else {
      setSelectedBasePricing(null);
      setBasePricingForm({
        departureAirport: "",
        arrivalAirport: "",
        basePrice: 100,
        currency: "USD",
        isActive: true,
      });
    }
    setIsBaseModalOpen(true);
  };

  const openDiscountModal = (discount?: DiscountRule) => {
    if (discount) {
      setSelectedDiscount(discount);
      setDiscountForm({
        name: discount.name,
        description: discount.description,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        validFrom: discount.validFrom,
        validTo: discount.validTo,
        applicableRoutes: discount.applicableRoutes,
        minimumBookingValue: discount.minimumBookingValue,
        isActive: discount.isActive,
        couponCode: discount.couponCode,
      });
    } else {
      setSelectedDiscount(null);
      setDiscountForm({
        name: "",
        description: "",
        discountType: "percentage",
        discountValue: 10,
        validFrom: new Date().toISOString().split("T")[0],
        validTo: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        applicableRoutes: [],
        minimumBookingValue: 0,
        isActive: true,
        couponCode: "",
      });
    }
    setIsDiscountModalOpen(true);
  };

  const openFeeModal = (fee?: ServiceFee) => {
    if (fee) {
      setSelectedFee(fee);
      setFeeForm({
        name: fee.name,
        description: fee.description,
        feeType: fee.feeType,
        feeValue: fee.feeValue,
        isOptional: fee.isOptional,
        isActive: fee.isActive,
      });
    } else {
      setSelectedFee(null);
      setFeeForm({
        name: "",
        description: "",
        feeType: "fixed",
        feeValue: 25,
        isOptional: true,
        isActive: true,
      });
    }
    setIsFeeModalOpen(true);
  };

  const openDeleteModal = (type: "base" | "discount" | "fee", id: number) => {
    setDeleteType(type);
    setDeleteId(id);
    setIsDeleteModalOpen(true);
  };

  const handleSubmitBasePricing = () => {
    if (selectedBasePricing) {
      updateBasePricingMutation.mutate(basePricingForm);
    } else {
      createBasePricingMutation.mutate(basePricingForm);
    }
  };

  const handleSubmitDiscount = () => {
    if (selectedDiscount) {
      updateDiscountMutation.mutate(discountForm);
    } else {
      createDiscountMutation.mutate(discountForm);
    }
  };

  const handleSubmitFee = () => {
    if (selectedFee) {
      updateFeeMutation.mutate(feeForm);
    } else {
      createFeeMutation.mutate(feeForm);
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Loading state
  if (isBasePricingLoading && activeTab === "base-pricing" ||
      isDiscountsLoading && activeTab === "discounts" ||
      isFeesLoading && activeTab === "fees") {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Management</h1>
          <p className="text-muted-foreground">
            Manage pricing, discounts, and fees for your flight tickets.
          </p>
        </div>

        <Tabs defaultValue="base-pricing" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="base-pricing">Base Pricing</TabsTrigger>
            <TabsTrigger value="discounts">Discounts & Promotions</TabsTrigger>
            <TabsTrigger value="fees">Service Fees</TabsTrigger>
          </TabsList>

          <TabsContent value="base-pricing" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Base Route Pricing</CardTitle>
                  <CardDescription>
                    Set up base pricing for different routes in your system.
                  </CardDescription>
                </div>
                <Button onClick={() => openBaseModal()}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Route
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>A list of base pricing for different routes.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Route</TableHead>
                        <TableHead>Base Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {basePricing && basePricing.length > 0 ? (
                        basePricing.map((pricing) => (
                          <TableRow key={pricing.id}>
                            <TableCell className="font-medium">
                              {pricing.departureAirport} → {pricing.arrivalAirport}
                            </TableCell>
                            <TableCell>
                              {pricing.currency} {pricing.basePrice.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={pricing.isActive ? "default" : "secondary"}
                              >
                                {pricing.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openBaseModal(pricing)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteModal("base", pricing.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            No base pricing data found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discounts" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Discounts & Promotions</CardTitle>
                  <CardDescription>
                    Manage discount rules and promotional offers.
                  </CardDescription>
                </div>
                <Button onClick={() => openDiscountModal()}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Discount
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>A list of discount rules and promotions.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead>Validity</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discounts && discounts.length > 0 ? (
                        discounts.map((discount) => (
                          <TableRow key={discount.id}>
                            <TableCell className="font-medium">
                              {discount.name}
                              {discount.couponCode && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Code: {discount.couponCode}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {discount.discountType === "percentage"
                                ? `${discount.discountValue}%`
                                : `${discount.discountValue} ${discount.couponCode ? "off" : ""}`}
                            </TableCell>
                            <TableCell>
                              <div className="text-xs">
                                From: {new Date(discount.validFrom).toLocaleDateString()}
                              </div>
                              <div className="text-xs">
                                To: {new Date(discount.validTo).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={discount.isActive ? "default" : "secondary"}
                              >
                                {discount.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDiscountModal(discount)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteModal("discount", discount.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No discount rules found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle>Service Fees</CardTitle>
                  <CardDescription>
                    Manage additional service fees and charges.
                  </CardDescription>
                </div>
                <Button onClick={() => openFeeModal()}>
                  <Plus className="mr-2 h-4 w-4" /> Add New Fee
                </Button>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableCaption>A list of service fees.</TableCaption>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Fee</TableHead>
                        <TableHead>Optional</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fees && fees.length > 0 ? (
                        fees.map((fee) => (
                          <TableRow key={fee.id}>
                            <TableCell className="font-medium">
                              {fee.name}
                              <div className="text-xs text-muted-foreground mt-1">
                                {fee.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              {fee.feeType === "percentage"
                                ? `${fee.feeValue}%`
                                : `${fee.feeValue}`}
                            </TableCell>
                            <TableCell>
                              {fee.isOptional ? "Yes" : "No"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={fee.isActive ? "default" : "secondary"}
                              >
                                {fee.isActive ? "Active" : "Inactive"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openFeeModal(fee)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => openDeleteModal("fee", fee.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center">
                            No service fees found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Base Pricing Modal */}
      <Dialog open={isBaseModalOpen} onOpenChange={setIsBaseModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedBasePricing ? "Edit Base Pricing" : "Add New Base Pricing"}
            </DialogTitle>
            <DialogDescription>
              {selectedBasePricing
                ? "Make changes to the base pricing for this route."
                : "Set up base pricing for a new route."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureAirport">Departure Airport</Label>
                <Select
                  value={basePricingForm.departureAirport}
                  onValueChange={(value) =>
                    setBasePricingForm({ ...basePricingForm, departureAirport: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select airport" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports?.map((airport) => (
                      <SelectItem key={airport.iataCode} value={airport.iataCode}>
                        {airport.iataCode} - {airport.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="arrivalAirport">Arrival Airport</Label>
                <Select
                  value={basePricingForm.arrivalAirport}
                  onValueChange={(value) =>
                    setBasePricingForm({ ...basePricingForm, arrivalAirport: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select airport" />
                  </SelectTrigger>
                  <SelectContent>
                    {airports?.map((airport) => (
                      <SelectItem key={airport.iataCode} value={airport.iataCode}>
                        {airport.iataCode} - {airport.city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  <Input
                    id="basePrice"
                    type="number"
                    className="pl-10"
                    value={basePricingForm.basePrice}
                    onChange={(e) =>
                      setBasePricingForm({
                        ...basePricingForm,
                        basePrice: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={basePricingForm.currency}
                  onValueChange={(value) =>
                    setBasePricingForm({ ...basePricingForm, currency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={basePricingForm.isActive}
                onCheckedChange={(checked) =>
                  setBasePricingForm({ ...basePricingForm, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsBaseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitBasePricing}
              disabled={
                createBasePricingMutation.isPending ||
                updateBasePricingMutation.isPending
              }
            >
              {createBasePricingMutation.isPending ||
              updateBasePricingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Discount Modal */}
      <Dialog open={isDiscountModalOpen} onOpenChange={setIsDiscountModalOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDiscount ? "Edit Discount Rule" : "Add New Discount Rule"}
            </DialogTitle>
            <DialogDescription>
              {selectedDiscount
                ? "Make changes to the discount rule."
                : "Create a new discount rule."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Discount Name</Label>
                <Input
                  id="name"
                  value={discountForm.name}
                  onChange={(e) =>
                    setDiscountForm({ ...discountForm, name: e.target.value })
                  }
                  placeholder="Early Bird Discount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="couponCode">Coupon Code (Optional)</Label>
                <Input
                  id="couponCode"
                  value={discountForm.couponCode}
                  onChange={(e) =>
                    setDiscountForm({ ...discountForm, couponCode: e.target.value })
                  }
                  placeholder="SUMMER2025"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={discountForm.description}
                onChange={(e) =>
                  setDiscountForm({ ...discountForm, description: e.target.value })
                }
                placeholder="Book early and save"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="discountType">Discount Type</Label>
                <Select
                  value={discountForm.discountType}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setDiscountForm({ ...discountForm, discountType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountValue">
                  {discountForm.discountType === "percentage" ? "Percentage (%)" : "Amount"}
                </Label>
                <div className="relative">
                  {discountForm.discountType === "percentage" ? (
                    <PercentIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  )}
                  <Input
                    id="discountValue"
                    type="number"
                    className="pl-10"
                    value={discountForm.discountValue}
                    onChange={(e) =>
                      setDiscountForm({
                        ...discountForm,
                        discountValue: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valid From</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={discountForm.validFrom}
                  onChange={(e) =>
                    setDiscountForm({ ...discountForm, validFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={discountForm.validTo}
                  onChange={(e) =>
                    setDiscountForm({ ...discountForm, validTo: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimumBookingValue">Minimum Booking Value (0 for no minimum)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                <Input
                  id="minimumBookingValue"
                  type="number"
                  className="pl-10"
                  value={discountForm.minimumBookingValue}
                  onChange={(e) =>
                    setDiscountForm({
                      ...discountForm,
                      minimumBookingValue: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={discountForm.isActive}
                onCheckedChange={(checked) =>
                  setDiscountForm({ ...discountForm, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDiscountModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitDiscount}
              disabled={
                createDiscountMutation.isPending ||
                updateDiscountMutation.isPending
              }
            >
              {createDiscountMutation.isPending ||
              updateDiscountMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Fee Modal */}
      <Dialog open={isFeeModalOpen} onOpenChange={setIsFeeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedFee ? "Edit Service Fee" : "Add New Service Fee"}
            </DialogTitle>
            <DialogDescription>
              {selectedFee
                ? "Make changes to the service fee."
                : "Create a new service fee."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="name">Fee Name</Label>
              <Input
                id="name"
                value={feeForm.name}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, name: e.target.value })
                }
                placeholder="Express Processing"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={feeForm.description}
                onChange={(e) =>
                  setFeeForm({ ...feeForm, description: e.target.value })
                }
                placeholder="Fast 24-hour processing of your ticket"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="feeType">Fee Type</Label>
                <Select
                  value={feeForm.feeType}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFeeForm({ ...feeForm, feeType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="feeValue">
                  {feeForm.feeType === "percentage" ? "Percentage (%)" : "Amount"}
                </Label>
                <div className="relative">
                  {feeForm.feeType === "percentage" ? (
                    <PercentIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  ) : (
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
                  )}
                  <Input
                    id="feeValue"
                    type="number"
                    className="pl-10"
                    value={feeForm.feeValue}
                    onChange={(e) =>
                      setFeeForm({
                        ...feeForm,
                        feeValue: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isOptional"
                checked={feeForm.isOptional}
                onCheckedChange={(checked) =>
                  setFeeForm({ ...feeForm, isOptional: !!checked })
                }
              />
              <Label htmlFor="isOptional">Optional (can be selected by user)</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={feeForm.isActive}
                onCheckedChange={(checked) =>
                  setFeeForm({ ...feeForm, isActive: checked })
                }
              />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsFeeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFee}
              disabled={
                createFeeMutation.isPending ||
                updateFeeMutation.isPending
              }
            >
              {createFeeMutation.isPending ||
              updateFeeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this item? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PricingPage;