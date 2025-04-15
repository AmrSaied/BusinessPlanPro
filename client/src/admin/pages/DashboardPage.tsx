import { useEffect, useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { Loader2, AlertCircle, Users, Ticket, Plane, DollarSign } from "lucide-react";

// Mock dashboard stats interface
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

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard stats from API
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: getQueryFn(),
    refetchInterval: 60000, // Refresh every minute
  });

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load dashboard data. Please try again later.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  // If API not yet available, use placeholder data
  const dashboardStats = stats || {
    users: { total: 0, active: 0, newToday: 0 },
    tickets: { total: 0, pendingPayment: 0, confirmedToday: 0 },
    flights: { total: 0, active: 0 },
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, currency: "USD" }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your flight ticket system's performance and statistics.
          </p>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Users Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.users.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.users.active} active users
                  </p>
                  <div className="mt-2 text-xs font-medium text-green-500">
                    +{dashboardStats.users.newToday} new today
                  </div>
                </CardContent>
              </Card>

              {/* Tickets Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
                  <Ticket className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.tickets.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.tickets.pendingPayment} pending payment
                  </p>
                  <div className="mt-2 text-xs font-medium text-green-500">
                    +{dashboardStats.tickets.confirmedToday} confirmed today
                  </div>
                </CardContent>
              </Card>

              {/* Flights Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
                  <Plane className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardStats.flights.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.flights.active} active flights
                  </p>
                </CardContent>
              </Card>

              {/* Revenue Stats Card */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardStats.revenue.currency} {dashboardStats.revenue.total.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dashboardStats.revenue.currency} {dashboardStats.revenue.thisMonth.toLocaleString()} this month
                  </p>
                  {dashboardStats.revenue.thisMonth > dashboardStats.revenue.lastMonth ? (
                    <div className="mt-2 text-xs font-medium text-green-500">
                      +{(((dashboardStats.revenue.thisMonth - dashboardStats.revenue.lastMonth) / dashboardStats.revenue.lastMonth) * 100).toFixed(1)}% from last month
                    </div>
                  ) : (
                    <div className="mt-2 text-xs font-medium text-red-500">
                      {(((dashboardStats.revenue.thisMonth - dashboardStats.revenue.lastMonth) / dashboardStats.revenue.lastMonth) * 100).toFixed(1)}% from last month
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>System Summary</CardTitle>
                <CardDescription>
                  Overview of your flight ticket system status
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Recent activity</h3>
                    <p className="text-sm">
                      Your system is running smoothly with {dashboardStats.tickets.confirmedToday} tickets issued today and {dashboardStats.users.newToday} new user registrations.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm mb-2">System health</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">All systems operational</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Database connected</span>
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">API services operational</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Recent actions and events in your system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Activity log will appear here once implemented.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Detailed analytics and insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Detailed analytics will appear here once implemented.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;