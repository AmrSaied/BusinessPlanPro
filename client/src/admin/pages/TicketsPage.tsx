import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { Booking, Flight, User } from "@shared/schema";
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
import { format, parseISO } from "date-fns";
import {
  Loader2,
  Search,
  Eye,
  FileCog,
  FileX,
  AlertCircle,
  Download,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Extended booking interface with additional ticket data
interface BookingWithTicket extends Booking {
  flight?: Flight;
  user?: User;
  ticketNumber?: string;
  ticketPdfUrl?: string;
}

const TicketsPage = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithTicket | null>(null);

  // Fetch bookings/tickets data
  const {
    data: bookings,
    isLoading,
    error,
  } = useQuery<BookingWithTicket[]>({
    queryKey: ["/api/admin/bookings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });

  // Regenerate ticket mutation
  const regenerateTicketMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const res = await apiRequest("POST", `/api/admin/bookings/${bookingId}/regenerate-ticket`);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Ticket regenerated",
        description: "Ticket has been regenerated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Regeneration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      await apiRequest("PATCH", `/api/admin/bookings/${bookingId}/cancel`);
    },
    onSuccess: () => {
      toast({
        title: "Booking cancelled",
        description: "Booking has been cancelled successfully",
      });
      setIsCancelModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/bookings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter bookings based on search and status filter
  const filteredBookings = bookings
    ? bookings.filter((booking) => {
        const matchesSearch =
          searchQuery === "" ||
          booking.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (booking.contactEmail && booking.contactEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (booking.ticketNumber && booking.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesStatus =
          statusFilter === "all" || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
      })
    : [];

  // Open booking/ticket details modal
  const openViewModal = (booking: BookingWithTicket) => {
    setSelectedBooking(booking);
    setIsViewModalOpen(true);
  };

  // Open cancel booking confirmation modal
  const openCancelModal = (booking: BookingWithTicket) => {
    setSelectedBooking(booking);
    setIsCancelModalOpen(true);
  };

  // Handle ticket regeneration
  const handleRegenerateTicket = (bookingId: number) => {
    regenerateTicketMutation.mutate(bookingId);
  };

  // Handle booking cancellation
  const handleCancelBooking = () => {
    if (selectedBooking) {
      cancelBookingMutation.mutate(selectedBooking.id);
    }
  };

  // Download ticket
  const handleDownloadTicket = (bookingId: number) => {
    window.open(`/api/bookings/${bookingId}/ticket/download`, "_blank");
  };

  // Loading state
  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load tickets data. Please try again later.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tickets Management</h1>
          <p className="text-muted-foreground">
            View and manage all tickets and bookings in your system.
          </p>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Tickets</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Tickets</CardTitle>
                <CardDescription>
                  View and manage all tickets in your system.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTicketsTable(filteredBookings)}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Confirmed Tickets</CardTitle>
                <CardDescription>
                  View and manage confirmed tickets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTicketsTable(filteredBookings.filter(b => b.status === "confirmed"))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Tickets</CardTitle>
                <CardDescription>
                  View and manage pending tickets awaiting confirmation.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTicketsTable(filteredBookings.filter(b => b.status === "pending"))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cancelled Tickets</CardTitle>
                <CardDescription>
                  View cancelled tickets.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {renderTicketsTable(filteredBookings.filter(b => b.status === "cancelled"))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Ticket Details Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Ticket Details</DialogTitle>
            <DialogDescription>
              View detailed information about this ticket.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Booking Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Reference:</span>
                      <span>{selectedBooking.bookingReference}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Status:</span>
                      <Badge
                        variant={
                          selectedBooking.status === "confirmed"
                            ? "default"
                            : selectedBooking.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {selectedBooking.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Price:</span>
                      <span>
                        {selectedBooking.currency} {selectedBooking.totalPrice}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Created:</span>
                      <span>
                        {selectedBooking.createdAt
                          ? format(typeof selectedBooking.createdAt === 'string' 
                              ? parseISO(selectedBooking.createdAt) 
                              : selectedBooking.createdAt, "PPp")
                          : "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Travel Purpose:</span>
                      <span>{selectedBooking.travelPurpose}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">User:</span>
                      <span>{selectedBooking.user?.username || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span>{selectedBooking.contactEmail || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span>{selectedBooking.contactPhone || "—"}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Flight Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {selectedBooking.flight ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium">Flight:</span>
                        <span>
                          {selectedBooking.flight.airlineCode} {selectedBooking.flight.flightNumber}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Route:</span>
                        <span>
                          {selectedBooking.flight.departureAirport} → {selectedBooking.flight.arrivalAirport}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Departure:</span>
                        <span>
                          {selectedBooking.flight.departureTime
                            ? format(typeof selectedBooking.flight.departureTime === 'string' 
                                ? parseISO(selectedBooking.flight.departureTime) 
                                : selectedBooking.flight.departureTime, "PPp")
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Arrival:</span>
                        <span>
                          {selectedBooking.flight.arrivalTime
                            ? format(typeof selectedBooking.flight.arrivalTime === 'string' 
                                ? parseISO(selectedBooking.flight.arrivalTime) 
                                : selectedBooking.flight.arrivalTime, "PPp")
                            : "—"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Aircraft:</span>
                        <span>{selectedBooking.flight.aircraft || "—"}</span>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">
                      No flight details available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Ticket Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium">Ticket Number:</span>
                    <span>{selectedBooking.ticketNumber || "—"}</span>
                  </div>
                  {selectedBooking.specialRequests && (
                    <div>
                      <span className="font-medium">Special Requests / Passenger Info:</span>
                      <p className="mt-1 text-muted-foreground">
                        {selectedBooking.specialRequests}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    className="flex items-center gap-1"
                    onClick={() => handleRegenerateTicket(selectedBooking.id)}
                    disabled={regenerateTicketMutation.isPending}
                  >
                    {regenerateTicketMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                    Regenerate Ticket
                  </Button>
                  <Button
                    className="flex items-center gap-1"
                    onClick={() => handleDownloadTicket(selectedBooking.id)}
                  >
                    <Download className="h-4 w-4" />
                    Download Ticket
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
            {selectedBooking?.status === "confirmed" && (
              <Button
                variant="destructive"
                onClick={() => {
                  setIsViewModalOpen(false);
                  openCancelModal(selectedBooking);
                }}
              >
                Cancel Booking
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Booking Confirmation Modal */}
      <Dialog open={isCancelModalOpen} onOpenChange={setIsCancelModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Booking</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this booking? This action will invalidate the ticket.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            {selectedBooking && (
              <>
                <p>
                  Booking Reference: <strong>{selectedBooking.bookingReference}</strong>
                </p>
                {selectedBooking.flight && (
                  <p>
                    Flight: <strong>{selectedBooking.flight.airlineCode} {selectedBooking.flight.flightNumber}</strong>
                  </p>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCancelModalOpen(false)}
            >
              No, Keep It
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelBooking}
              disabled={cancelBookingMutation.isPending}
            >
              {cancelBookingMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                "Yes, Cancel Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );

  // Helper function to render the tickets table
  function renderTicketsTable(bookings: BookingWithTicket[]) {
    return (
      <>
        <div className="flex flex-col md:flex-row gap-4 mb-6 justify-between">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
              <Input
                placeholder="Search by reference or email..."
                className="pl-10 w-full md:w-80"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableCaption>
              A list of {bookings.length} tickets in your system.
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Flight</TableHead>
                <TableHead>Travel Date</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bookings.length > 0 ? (
                bookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.bookingReference}
                      {booking.ticketNumber && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {booking.ticketNumber}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.user?.username || "—"}
                      {booking.contactEmail && (
                        <div className="text-xs text-muted-foreground mt-1">
                          {booking.contactEmail}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.flight ? (
                        <>
                          {booking.flight.airlineCode} {booking.flight.flightNumber}
                          <div className="text-xs text-muted-foreground mt-1">
                            {booking.flight.departureAirport} → {booking.flight.arrivalAirport}
                          </div>
                        </>
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      {booking.flight && booking.flight.departureTime
                        ? (() => {
                            try {
                              const date = typeof booking.flight.departureTime === 'string' 
                                ? parseISO(booking.flight.departureTime)
                                : new Date(booking.flight.departureTime);
                              return isNaN(date.getTime()) ? "Invalid date" : format(date, "PP");
                            } catch (e) {
                              return "Invalid date format";
                            }
                          })()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {booking.currency} {booking.totalPrice}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          booking.status === "confirmed"
                            ? "default"
                            : booking.status === "pending"
                            ? "outline"
                            : "destructive"
                        }
                      >
                        {booking.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openViewModal(booking)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDownloadTicket(booking.id)}
                          title="Download Ticket"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        {booking.status === "confirmed" ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openCancelModal(booking)}
                            title="Cancel Booking"
                          >
                            <FileX className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRegenerateTicket(booking.id)}
                            disabled={regenerateTicketMutation.isPending}
                            title="Regenerate Ticket"
                          >
                            <FileCog className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No tickets found.
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

export default TicketsPage;