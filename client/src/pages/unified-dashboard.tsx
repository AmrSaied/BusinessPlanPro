import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Link } from "wouter";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/language-context";
import UnifiedDashboardLayout from "@/components/unified-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Loader2,
  AlertCircle,
  Users,
  Ticket,
  Plane,
  DollarSign,
  BarChart,
  ListChecks,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  Clock,
  Calendar,
  TrendingUp,
  PieChart,
  Settings,
  Plus,
  User,
  Download,
  AlertTriangle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Dashboard stats interface
interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
  };
  tickets: {
    total: number;
    pendingPayment: number;
    confirmedToday: number;
  };
  flights: {
    total: number;
    active: number;
  };
  revenue: {
    total: number;
    thisMonth: number;
    lastMonth: number;
    currency: string;
  };
}

// Mock bookings for user view
interface Booking {
  id: number;
  userId: number;
  flightId: number;
  bookingReference: string;
  totalPrice: number;
  currency: string;
  status: string;
  expressProcessing: boolean;
  editableTicket: boolean;
  hotelReservation: boolean;
  insuranceLetter: boolean;
  createdAt: Date | string;
  contactEmail: string;
  contactPhone: string;
  travelPurpose: string;
  paymentId: string;
  specialRequests: string;
}

// Mock passenger for user view
interface Passenger {
  id: number;
  userId: number;
  title: string;
  firstName: string;
  lastName: string;
  nationality: string;
  dateOfBirth: string;
  passportNumber: string;
  passportExpiry: string;
  isSaved: boolean;
}

const UnifiedDashboard = () => {
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';
  const [activeTab, setActiveTab] = useState("overview");
  const [isAdminUser, setIsAdminUser] = useState(false);
  const userId = 1; // For demonstration, would normally come from auth context

  // Check if user has admin privileges
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch("/api/admin/check-auth");
        if (response.ok) {
          setIsAdminUser(true);
        } else {
          setIsAdminUser(false);
        }
      } catch (error) {
        setIsAdminUser(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch dashboard statistics (admin view)
  const { 
    data: stats, 
    isLoading: isLoadingStats, 
    error: statsError 
  } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: isAdminUser,
    refetchInterval: 60000, // Refresh every minute
  });

  // Fetch user bookings (user view)
  const {
    data: bookings,
    isLoading: isLoadingBookings,
    isError: isBookingsError
  } = useQuery<Booking[]>({
    queryKey: [`/api/users/${userId}/bookings`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Fetch saved passengers (user view)
  const {
    data: savedPassengers,
    isLoading: isLoadingPassengers,
    isError: isPassengersError
  } = useQuery<Passenger[]>({
    queryKey: [`/api/users/${userId}/passengers`],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Simulate some sample data for user view when needed
  const mockBookings: Booking[] = [
    {
      id: 1,
      userId: 1,
      flightId: 1,
      bookingReference: 'AB123456',
      totalPrice: 20,
      currency: 'USD',
      status: 'confirmed',
      expressProcessing: true,
      editableTicket: false,
      hotelReservation: false,
      insuranceLetter: false,
      createdAt: new Date('2023-10-15'),
      contactEmail: 'user@example.com',
      contactPhone: '+1234567890',
      travelPurpose: 'visa',
      paymentId: '1',
      specialRequests: ''
    },
    {
      id: 2,
      userId: 1,
      flightId: 2,
      bookingReference: 'CD789012',
      totalPrice: 35,
      currency: 'USD',
      status: 'confirmed',
      expressProcessing: true,
      editableTicket: true,
      hotelReservation: false,
      insuranceLetter: true,
      createdAt: new Date('2023-11-05'),
      contactEmail: 'user@example.com',
      contactPhone: '+1234567890',
      travelPurpose: 'immigration',
      paymentId: '2',
      specialRequests: ''
    }
  ];
  
  const mockPassengers: Passenger[] = [
    {
      id: 1,
      userId: 1,
      title: 'mr',
      firstName: 'John',
      lastName: 'Doe',
      nationality: 'us',
      dateOfBirth: '15/05/1985',
      passportNumber: 'A1234567',
      passportExpiry: '20/06/2028',
      isSaved: true
    },
    {
      id: 2,
      userId: 1,
      title: 'ms',
      firstName: 'Jane',
      lastName: 'Smith',
      nationality: 'gb',
      dateOfBirth: '03/11/1990',
      passportNumber: 'B7654321',
      passportExpiry: '15/03/2029',
      isSaved: true
    }
  ];

  if (isLoadingStats && isAdminUser) {
    return (
      <UnifiedDashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </UnifiedDashboardLayout>
    );
  }

  if (statsError && isAdminUser) {
    return (
      <UnifiedDashboardLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </UnifiedDashboardLayout>
    );
  }

  // If API not yet available or user is non-admin, use default initial values
  const dashboardStats = stats || {
    users: { total: 0, active: 0, newToday: 0 },
    tickets: { total: 0, pendingPayment: 0, confirmedToday: 0 },
    flights: { total: 0, active: 0 },
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, currency: "USD" }
  };

  // Get current user (would normally come from auth context)
  const currentUser = {
    name: "John Doe",
    email: "john.doe@example.com"
  };

  return (
    <UnifiedDashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {isAdminUser ? t("control_panel") : t("my_dashboard")}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isAdminUser 
                ? t("manage_your_system")
                : t("manage_your_bookings_and_information")}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-700 dark:text-green-400">
                {isAdminUser ? t("all_systems_online") : t("account_active")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Admin Dashboard View */}
        {isAdminUser ? (
          <>
            {/* Stats Overview */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              {/* Users Stats Card */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_users")}</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{dashboardStats.users.total}</div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.users.active} {t("active_users")}
                    </p>
                    {dashboardStats.users.newToday > 0 && (
                      <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {dashboardStats.users.newToday} {t("new_today")}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t("active_rate")}</span>
                      <span className="font-medium">
                        {Math.round(dashboardStats.users.active / (dashboardStats.users.total || 1) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      className="h-1.5 bg-blue-100 dark:bg-blue-900/20" 
                      value={dashboardStats.users.active / (dashboardStats.users.total || 1) * 100} 
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tickets Stats Card */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("ticket_sales")}</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                    <Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{dashboardStats.tickets.total}</div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.tickets.pendingPayment} {t("pending_payment")}
                    </p>
                    {dashboardStats.tickets.confirmedToday > 0 && (
                      <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {dashboardStats.tickets.confirmedToday} {t("today")}
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t("completion_rate")}</span>
                      <span className="font-medium">
                        {Math.round((dashboardStats.tickets.total - dashboardStats.tickets.pendingPayment) / (dashboardStats.tickets.total || 1) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      className="h-1.5 bg-indigo-100 dark:bg-indigo-900/20" 
                      value={(dashboardStats.tickets.total - dashboardStats.tickets.pendingPayment) / (dashboardStats.tickets.total || 1) * 100}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Flights Stats Card */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("active_flights")}</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <Plane className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{dashboardStats.flights.total}</div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.flights.active} {t("currently_active")}
                    </p>
                    <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                      <Activity className="h-3 w-3 mr-1" />
                      {Math.round(dashboardStats.flights.active / (dashboardStats.flights.total || 1) * 100)}% {t("active")}
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t("active_rate")}</span>
                      <span className="font-medium">
                        {Math.round(dashboardStats.flights.active / (dashboardStats.flights.total || 1) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      className="h-1.5 bg-emerald-100 dark:bg-emerald-900/20" 
                      value={dashboardStats.flights.active / (dashboardStats.flights.total || 1) * 100}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Stats Card */}
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{t("total_revenue")}</CardTitle>
                  <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">
                    {dashboardStats.revenue.currency} {dashboardStats.revenue.total.toLocaleString()}
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <p className="text-xs text-muted-foreground">
                      {dashboardStats.revenue.currency} {dashboardStats.revenue.thisMonth.toLocaleString()} {t("this_month")}
                    </p>
                    {dashboardStats.revenue.lastMonth > 0 && (
                      <div className={`flex items-center text-xs font-medium px-2 py-0.5 rounded-full ${
                        dashboardStats.revenue.thisMonth >= dashboardStats.revenue.lastMonth 
                          ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20" 
                          : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                      }`}>
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                        {((Math.abs(dashboardStats.revenue.thisMonth - dashboardStats.revenue.lastMonth) / 
                          (dashboardStats.revenue.lastMonth || 1)) * 100).toFixed(0)}%
                      </div>
                    )}
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">{t("monthly_progress")}</span>
                      <span className="font-medium">
                        {Math.min(
                          Math.round(dashboardStats.revenue.thisMonth / (dashboardStats.revenue.lastMonth || 1) * 100),
                          100
                        )}%
                      </span>
                    </div>
                    <Progress 
                      className="h-1.5 bg-amber-100 dark:bg-amber-900/20" 
                      value={Math.min(
                        dashboardStats.revenue.thisMonth / (dashboardStats.revenue.lastMonth || 1) * 100, 
                        100
                      )} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Admin Tab Content */}
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-8">
              <TabsList className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <TabsTrigger 
                  value="overview" 
                  className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  {t("overview")}
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  {t("activity")}
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics" 
                  className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
                >
                  <BarChart className="h-4 w-4 mr-2" />
                  {t("analytics")}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                {/* Key Metrics Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{t("weekly_performance")}</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <span className="text-sm text-muted-foreground">{t("tickets_sold")}</span>
                          <div className="text-2xl font-semibold">{dashboardStats.tickets.confirmedToday * 7}</div>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">{t("mon")}</div>
                            <div className="text-sm font-semibold">{dashboardStats.tickets.confirmedToday}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">{t("tue")}</div>
                            <div className="text-sm font-semibold">{dashboardStats.tickets.confirmedToday + 1}</div>
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">{t("wed")}</div>
                            <div className="text-sm font-semibold">{dashboardStats.tickets.confirmedToday - 1}</div>
                          </div>
                        </div>
                        <Progress className="h-1.5" value={75} />
                        <div className="text-xs text-muted-foreground">
                          {t("weekly_target_progress", { percentage: 75 })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{t("top_routes")}</CardTitle>
                        <PieChart className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-8 bg-blue-500 rounded-full"></div>
                            <div>
                              <div className="text-sm font-medium">NYC → LON</div>
                              <div className="text-xs text-muted-foreground">30% {t("of_sales")}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {Math.round(dashboardStats.tickets.total * 0.3)} {t("tickets")}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                            <div>
                              <div className="text-sm font-medium">LAX → TOK</div>
                              <div className="text-xs text-muted-foreground">25% {t("of_sales")}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {Math.round(dashboardStats.tickets.total * 0.25)} {t("tickets")}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                            <div>
                              <div className="text-sm font-medium">CHI → PAR</div>
                              <div className="text-xs text-muted-foreground">20% {t("of_sales")}</div>
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            {Math.round(dashboardStats.tickets.total * 0.2)} {t("tickets")}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">{t("system_health")}</CardTitle>
                        <Settings className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium">{t("web_platform")}</span>
                            </div>
                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">{t("operational")}</span>
                          </div>
                          <Progress value={100} className="h-1.5 bg-green-100 dark:bg-green-900/20" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium">{t("database")}</span>
                            </div>
                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">{t("operational")}</span>
                          </div>
                          <Progress value={100} className="h-1.5 bg-green-100 dark:bg-green-900/20" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium">{t("api_services")}</span>
                            </div>
                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">{t("operational")}</span>
                          </div>
                          <Progress value={100} className="h-1.5 bg-green-100 dark:bg-green-900/20" />
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 rounded-full bg-green-500"></div>
                              <span className="text-sm font-medium">{t("payment_system")}</span>
                            </div>
                            <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">{t("operational")}</span>
                          </div>
                          <Progress value={100} className="h-1.5 bg-green-100 dark:bg-green-900/20" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Activity Timeline */}
                <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                  <CardHeader>
                    <CardTitle>{t("recent_system_activity")}</CardTitle>
                    <CardDescription>
                      {t("latest_events_and_updates")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <div className="absolute top-0 bottom-0 left-4 w-0.5 bg-gray-200 dark:bg-gray-700"></div>
                      <div className="space-y-6">
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm font-medium">{t("system_update")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("system_update_message")}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm font-medium">{t("user_activity")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dashboardStats.users.newToday} {t("new_users_registered_today")}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center">
                            <Ticket className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm font-medium">{t("ticket_sales")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dashboardStats.tickets.confirmedToday} {t("tickets_issued_today")}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="relative pl-10">
                          <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center">
                            <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                            <p className="text-sm font-medium">{t("revenue_update")}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {dashboardStats.revenue.currency} {dashboardStats.revenue.thisMonth.toLocaleString()} {t("revenue_generated_this_month")}
                            </p>
                            <div className="flex items-center mt-2 text-xs text-muted-foreground">
                              <Clock className="h-3.5 w-3.5 mr-1" />
                              <span>{new Date().toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Activity Tab Content - For Admin */}
              <TabsContent value="activity" className="mt-6">
                <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                  <CardHeader>
                    <CardTitle>{t("activity_log")}</CardTitle>
                    <CardDescription>
                      {t("detailed_log_description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <Clock className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">{t("activity_log_coming_soon")}</p>
                      <p className="text-sm mt-2 max-w-md mx-auto">
                        {t("activity_log_dev_message")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Analytics Tab Content - For Admin */}
              <TabsContent value="analytics" className="mt-6">
                <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                  <CardHeader>
                    <CardTitle>{t("performance_analytics")}</CardTitle>
                    <CardDescription>
                      {t("detailed_performance_metrics")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-16 text-muted-foreground">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                        <BarChart className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium">{t("analytics_dashboard_coming_soon")}</p>
                      <p className="text-sm mt-2 max-w-md mx-auto">
                        {t("analytics_dashboard_dev_message")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            {/* User Dashboard View */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                <div className={cn("bg-primary/10 rounded-full p-3", isRTL ? "ml-4" : "mr-4")}>
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div className={cn(isRTL && "text-right")}>
                  <h1 className="font-heading text-2xl font-bold text-gray-800">
                    {t('dashboard_title')}
                  </h1>
                  <p className="text-gray-600">
                    {isRTL ? `${currentUser.name} ،${t('dashboard_welcome')}` : `${t('dashboard_welcome')}, ${currentUser.name}`}
                  </p>
                </div>
                <div className={cn(isRTL ? "mr-auto" : "ml-auto")}>
                  <Link href="/search">
                    <Button className="bg-primary text-white hover:bg-primary/90">
                      <Plus className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                      {t('dashboard_create_booking')}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Dashboard Tabs - For User */}
            <Tabs defaultValue="bookings">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="bookings">{t('dashboard_bookings')}</TabsTrigger>
                <TabsTrigger value="passengers">{t('dashboard_saved_passengers')}</TabsTrigger>
              </TabsList>
              
              {/* Bookings Tab */}
              <TabsContent value="bookings">
                <Card>
                  <CardHeader className={cn(isRTL && "text-right")}>
                    <CardTitle>{t('dashboard_bookings')}</CardTitle>
                    <CardDescription>
                      {t('dashboard_bookings_description', 'View and manage your flight reservations')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingBookings ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : isBookingsError ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-gray-600">{t('error_loading_bookings', 'Error loading bookings')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(bookings || mockBookings).length > 0 ? (
                          (bookings || mockBookings).map((booking) => (
                            <div 
                              key={booking.id}
                              className={cn(
                                "border border-gray-200 rounded-lg p-4 flex flex-col md:items-center",
                                isRTL ? "md:flex-row-reverse" : "md:flex-row",
                                "md:justify-between"
                              )}
                            >
                              <div className={cn("mb-4 md:mb-0", isRTL && "text-right")}>
                                <div className="font-medium">
                                  {isRTL ? `${booking.bookingReference} :${t('booking_reference')}` : `${t('booking_reference', 'Booking Reference')}: ${booking.bookingReference}`}
                                </div>
                                <div className="text-sm text-gray-600">
                                  {booking.createdAt instanceof Date ? booking.createdAt.toLocaleDateString() : new Date(booking.createdAt as any).toLocaleDateString()}
                                </div>
                              </div>
                              
                              <div className={cn("flex flex-col mb-4 md:mb-0", isRTL ? "md:items-end" : "md:items-center")}>
                                <div className="text-sm text-gray-600">{t('dashboard_booking_status')}</div>
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                                  booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                </span>
                              </div>
                              
                              <div className={cn("flex flex-col mb-4 md:mb-0", isRTL ? "md:items-end" : "md:items-center")}>
                                <div className="text-sm text-gray-600">{t('dashboard_booking_amount')}</div>
                                <div className="font-medium">${booking.totalPrice.toFixed(2)} {booking.currency}</div>
                              </div>
                              
                              <div>
                                <Link href={`/confirmation/${booking.id}`}>
                                  <Button size="sm" className="w-full md:w-auto">
                                    <Download className={cn("h-4 w-4", isRTL ? "ml-2" : "mr-2")} />
                                    {t('dashboard_view_ticket')}
                                  </Button>
                                </Link>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">{t('dashboard_no_bookings')}</p>
                            <Link href="/search">
                              <Button className="bg-primary text-white hover:bg-primary/90">
                                {t('dashboard_create_booking')}
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Passengers Tab */}
              <TabsContent value="passengers">
                <Card>
                  <CardHeader className={cn(isRTL && "text-right")}>
                    <CardTitle>{t('dashboard_saved_passengers')}</CardTitle>
                    <CardDescription>
                      {t('dashboard_passengers_description', 'Your saved passenger information for quick booking')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingPassengers ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : isPassengersError ? (
                      <div className="text-center py-8">
                        <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-gray-600">{t('error_loading_passengers', 'Error loading passengers')}</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(savedPassengers || mockPassengers).length > 0 ? (
                          (savedPassengers || mockPassengers).map((passenger) => (
                            <div 
                              key={passenger.id}
                              className="border border-gray-200 rounded-lg p-4"
                            >
                              <div className={cn(
                                "flex justify-between items-start",
                                isRTL && "flex-row-reverse"
                              )}>
                                <div className={cn(isRTL && "text-right")}>
                                  <div className="font-medium">
                                    {passenger.title.toUpperCase()}. {passenger.firstName} {passenger.lastName}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    {isRTL 
                                      ? `${passenger.nationality.toUpperCase()} :${t('nationality')} | ${passenger.passportNumber} :${t('passport')}`
                                      : `${t('passport', 'Passport')}: ${passenger.passportNumber} | ${t('nationality', 'Nationality')}: ${passenger.nationality.toUpperCase()}`
                                    }
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {isRTL 
                                      ? `${passenger.passportExpiry} :${t('passport_expiry')} | ${passenger.dateOfBirth} :${t('dob')}`
                                      : `${t('dob', 'DOB')}: ${passenger.dateOfBirth} | ${t('passport_expiry', 'Passport Expiry')}: ${passenger.passportExpiry}`
                                    }
                                  </div>
                                </div>
                                <div>
                                  <Link href="/search">
                                    <Button size="sm" variant="outline">
                                      {t('book_ticket', 'Book Ticket')}
                                    </Button>
                                  </Link>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8">
                            <p className="text-gray-600">{t('dashboard_no_passengers')}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </UnifiedDashboardLayout>
  );
};

export default UnifiedDashboard;