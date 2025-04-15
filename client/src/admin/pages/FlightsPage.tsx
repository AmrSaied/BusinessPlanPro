import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Flight, Airport } from "@shared/schema";
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
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Plus, Edit, Trash2, AlertCircle } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FlightsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [airlineFilter, setAirlineFilter] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null);

  // Form state for adding/editing flights
  const [flightForm, setFlightForm] = useState({
    airlineCode: "",
    airlineName: "",
    flightNumber: "",
    departureAirport: "",
    arrivalAirport: "",
    departureTime: "",
    arrivalTime: "",
    aircraft: "",
    price: 0,
    currency: "USD",
    seatsAvailable: 0,
    status: "scheduled",
  });

  // Fetch flights data from API
  const {
    data: flights,
    isLoading: isFlightsLoading,
    error: flightsError,
  } = useQuery<Flight[]>({
    queryKey: ["/api/admin/flights"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Fetch airports data for select dropdowns
  const {
    data: airports,
    isLoading: isAirportsLoading,
    error: airportsError,
  } = useQuery<Airport[]>({
    queryKey: ["/api/admin/airports"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Create flight mutation
  const createFlightMutation = useMutation({
    mutationFn: async (flightData: Partial<Flight>) => {
      const res = await apiRequest("POST", "/api/admin/flights", flightData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Flight created",
        description: "New flight has been created successfully",
      });
      setIsAddModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flights"] });
      resetFlightForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update flight mutation
  const updateFlightMutation = useMutation({
    mutationFn: async (flightData: Partial<Flight>) => {
      if (!selectedFlight) return null;
      const res = await apiRequest("PATCH", `/api/admin/flights/${selectedFlight.id}`, flightData);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Flight updated",
        description: "Flight has been updated successfully",
      });
      setIsEditModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flights"] });
      resetFlightForm();
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete flight mutation
  const deleteFlightMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFlight) return null;
      await apiRequest("DELETE", `/api/admin/flights/${selectedFlight.id}`);
    },
    onSuccess: () => {
      toast({
        title: "Flight deleted",
        description: "Flight has been deleted successfully",
      });
      setIsDeleteModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/flights"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset flight form to initial state
  const resetFlightForm = () => {
    setFlightForm({
      airlineCode: "",
      airlineName: "",
      flightNumber: "",
      departureAirport: "",
      arrivalAirport: "",
      departureTime: "",
      arrivalTime: "",
      aircraft: "",
      price: 0,
      currency: "USD",
      seatsAvailable: 0,
      status: "scheduled",
    });
  };

  // Filter flights based on search and airline filter
  const filteredFlights = flights
    ? flights.filter((flight) => {
        const matchesSearch =
          searchQuery === "" ||
          flight.flightNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flight.departureAirport.toLowerCase().includes(searchQuery.toLowerCase()) ||
          flight.arrivalAirport.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesAirline =
          airlineFilter === "" || flight.airlineCode === airlineFilter;

        return matchesSearch && matchesAirline;
      })
    : [];

  // Extract unique airline codes for filter dropdown
  const uniqueAirlineCodes = flights
    ? [...new Set(flights.map((flight) => flight.airlineCode))]
    : [];

  // Helper function to format ISO date string for datetime-local input
  const formatDateTimeForInput = (isoString: string | null | undefined): string => {
    if (!isoString) return "";
    try {
      const date = parseISO(isoString);
      if (!isValid(date)) return "";
      return isoString.substring(0, 16); // YYYY-MM-DDThh:mm format required by datetime-local
    } catch (error) {
      return "";
    }
  };

  // Open edit modal with flight data
  const openEditModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setFlightForm({
      airlineCode: flight.airlineCode || "",
      airlineName: flight.airlineName || "",
      flightNumber: flight.flightNumber || "",
      departureAirport: flight.departureAirport || "",
      arrivalAirport: flight.arrivalAirport || "",
      departureTime: formatDateTimeForInput(flight.departureTime),
      arrivalTime: formatDateTimeForInput(flight.arrivalTime),
      aircraft: flight.aircraft || "",
      price: flight.price || 0,
      currency: flight.currency || "USD",
      seatsAvailable: flight.seatsAvailable || 0,
      status: flight.status || "scheduled",
    });
    setIsEditModalOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (flight: Flight) => {
    setSelectedFlight(flight);
    setIsDeleteModalOpen(true);
  };

  // Open add flight modal
  const openAddModal = () => {
    resetFlightForm();
    setIsAddModalOpen(true);
  };

  // Handle flight form submission
  const handleSubmitFlight = () => {
    if (selectedFlight) {
      updateFlightMutation.mutate(flightForm);
    } else {
      createFlightMutation.mutate(flightForm);
    }
  };

  // Loading state
  if (isFlightsLoading || isAirportsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (flightsError || airportsError) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load flight data. Please try again later.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Flights Management</h1>
          <p className="text-muted-foreground">
            Manage flights, routes, schedules and pricing.
          </p>
        </div>

        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active Flights</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            <TabsTrigger value="all">All Flights</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Flights</CardTitle>
                <CardDescription>
                  Manage flights that are currently active in your system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderFlightsTable(filteredFlights.filter(f => f.status === "active"))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Scheduled Flights</CardTitle>
                <CardDescription>
                  Manage upcoming scheduled flights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderFlightsTable(filteredFlights.filter(f => f.status === "scheduled"))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Flights</CardTitle>
                <CardDescription>
                  View and manage all flights in your system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderFlightsTable(filteredFlights)}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add/Edit Flight Dialog */}
      <Dialog open={isEditModalOpen || isAddModalOpen} onOpenChange={(open) => 
        open ? null : (isEditModalOpen ? setIsEditModalOpen(false) : setIsAddModalOpen(false))
      }>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditModalOpen ? "Edit Flight" : "Add New Flight"}
            </DialogTitle>
            <DialogDescription>
              {isEditModalOpen
                ? "Make changes to flight details below."
                : "Enter the details for the new flight."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="airlineCode">Airline Code</Label>
              <Input
                id="airlineCode"
                value={flightForm.airlineCode}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, airlineCode: e.target.value })
                }
                placeholder="EK"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airlineName">Airline Name</Label>
              <Input
                id="airlineName"
                value={flightForm.airlineName}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, airlineName: e.target.value })
                }
                placeholder="Emirates"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="flightNumber">Flight Number</Label>
              <Input
                id="flightNumber"
                value={flightForm.flightNumber}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, flightNumber: e.target.value })
                }
                placeholder="EK123"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="aircraft">Aircraft</Label>
              <Input
                id="aircraft"
                value={flightForm.aircraft}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, aircraft: e.target.value })
                }
                placeholder="Boeing 777-300ER"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="departureAirport">Departure Airport</Label>
              <Select
                value={flightForm.departureAirport}
                onValueChange={(value) =>
                  setFlightForm({ ...flightForm, departureAirport: value })
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
                value={flightForm.arrivalAirport}
                onValueChange={(value) =>
                  setFlightForm({ ...flightForm, arrivalAirport: value })
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
              <Label htmlFor="departureTime">Departure Time</Label>
              <Input
                id="departureTime"
                type="datetime-local"
                value={flightForm.departureTime}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, departureTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="arrivalTime">Arrival Time</Label>
              <Input
                id="arrivalTime"
                type="datetime-local"
                value={flightForm.arrivalTime}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, arrivalTime: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                value={flightForm.price}
                onChange={(e) =>
                  setFlightForm({ ...flightForm, price: parseFloat(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={flightForm.currency}
                onValueChange={(value) =>
                  setFlightForm({ ...flightForm, currency: value })
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
            <div className="space-y-2">
              <Label htmlFor="seatsAvailable">Seats Available</Label>
              <Input
                id="seatsAvailable"
                type="number"
                value={flightForm.seatsAvailable}
                onChange={(e) =>
                  setFlightForm({
                    ...flightForm,
                    seatsAvailable: parseInt(e.target.value),
                  })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={flightForm.status}
                onValueChange={(value) =>
                  setFlightForm({ ...flightForm, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                isEditModalOpen ? setIsEditModalOpen(false) : setIsAddModalOpen(false)
              }
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitFlight}
              disabled={createFlightMutation.isPending || updateFlightMutation.isPending}
            >
              {createFlightMutation.isPending || updateFlightMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditModalOpen ? "Save Changes" : "Add Flight"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Flight Confirmation Dialog */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flight</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this flight? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {selectedFlight && (
              <>
                <p>
                  Flight: <strong>{selectedFlight.airlineCode} {selectedFlight.flightNumber}</strong>
                </p>
                <p>
                  Route: <strong>{selectedFlight.departureAirport} → {selectedFlight.arrivalAirport}</strong>
                </p>
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFlight}
              disabled={deleteFlightMutation.isPending}
            >
              {deleteFlightMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Flight"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );

  // Helper function to handle delete flight
  function handleDeleteFlight() {
    deleteFlightMutation.mutate();
  }

  // Helper function to render the flights table
  function renderFlightsTable(flights: Flight[]) {
    return (
      <>
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search flights..."
                className="pl-10 w-full md:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={airlineFilter} onValueChange={setAirlineFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All airlines" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All airlines</SelectItem>
                {uniqueAirlineCodes.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="flex items-center gap-1" onClick={openAddModal}>
            <Plus className="h-4 w-4" /> Add New Flight
          </Button>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableCaption>
              A list of {flights.length} flights in your system.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Flight</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Departure</TableHead>
                <TableHead>Arrival</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.length > 0 ? (
                flights.map((flight) => (
                  <TableRow key={flight.id}>
                    <TableCell className="font-medium">
                      {flight.airlineCode} {flight.flightNumber}
                    </TableCell>
                    <TableCell>
                      {flight.departureAirport} → {flight.arrivalAirport}
                    </TableCell>
                    <TableCell>
                      {flight.departureTime
                        ? (() => {
                            try {
                              const date = parseISO(flight.departureTime);
                              return isValid(date) ? format(date, "PPp") : "Invalid date";
                            } catch (error) {
                              return "Invalid date";
                            }
                          })()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {flight.arrivalTime
                        ? (() => {
                            try {
                              const date = parseISO(flight.arrivalTime);
                              return isValid(date) ? format(date, "PPp") : "Invalid date";
                            } catch (error) {
                              return "Invalid date";
                            }
                          })()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {flight.currency} {flight.price}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          flight.status === "active"
                            ? "default"
                            : flight.status === "scheduled"
                            ? "outline"
                            : flight.status === "completed"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {flight.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditModal(flight)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openDeleteModal(flight)}
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
                    No flights found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </>
    );
  }
};

export default FlightsPage;