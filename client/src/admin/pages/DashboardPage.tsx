import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Loader2, AlertCircle, Users, Ticket, Plane, DollarSign, 
  BarChart, ListChecks, ArrowUpRight, Activity, CheckCircle2
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard stats from API
  const { data: stats, isLoading, error } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard/stats"],
    queryFn: getQueryFn({ on401: "throw" }),
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

  // If API not yet available, use default initial values
  const dashboardStats = stats || {
    users: { total: 0, active: 0, newToday: 0 },
    tickets: { total: 0, pendingPayment: 0, confirmedToday: 0 },
    flights: { total: 0, active: 0 },
    revenue: { total: 0, thisMonth: 0, lastMonth: 0, currency: "USD" }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your flight ticket system
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>System Operational</span>
            </div>
            <span>•</span>
            <span>Last updated: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Users Stats Card */}
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.users.total}</div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.users.active} active users
                </p>
                {dashboardStats.users.newToday > 0 && (
                  <div className="flex items-center text-xs font-medium text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {dashboardStats.users.newToday} new today
                  </div>
                )}
              </div>
              <Progress className="h-1 mt-3" value={dashboardStats.users.active / (dashboardStats.users.total || 1) * 100} />
            </CardContent>
          </Card>

          {/* Tickets Stats Card */}
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Sales</CardTitle>
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <Ticket className="h-4 w-4 text-indigo-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.tickets.total}</div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.tickets.pendingPayment} pending payment
                </p>
                {dashboardStats.tickets.confirmedToday > 0 && (
                  <div className="flex items-center text-xs font-medium text-green-600">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {dashboardStats.tickets.confirmedToday} today
                  </div>
                )}
              </div>
              <Progress className="h-1 mt-3" value={(dashboardStats.tickets.total - dashboardStats.tickets.pendingPayment) / (dashboardStats.tickets.total || 1) * 100} />
            </CardContent>
          </Card>

          {/* Flights Stats Card */}
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Flights</CardTitle>
              <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                <Plane className="h-4 w-4 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardStats.flights.total}</div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.flights.active} active flights
                </p>
                <div className="flex items-center text-xs font-medium text-blue-600">
                  <Activity className="h-3 w-3 mr-1" />
                  {Math.round(dashboardStats.flights.active / (dashboardStats.flights.total || 1) * 100)}% active
                </div>
              </div>
              <Progress className="h-1 mt-3" value={dashboardStats.flights.active / (dashboardStats.flights.total || 1) * 100} />
            </CardContent>
          </Card>

          {/* Revenue Stats Card */}
          <Card className="shadow-sm hover:shadow transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-amber-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardStats.revenue.currency} {dashboardStats.revenue.total.toLocaleString()}
              </div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.revenue.currency} {dashboardStats.revenue.thisMonth.toLocaleString()} this month
                </p>
                {dashboardStats.revenue.lastMonth > 0 && (
                  <div className={`flex items-center text-xs font-medium ${
                    dashboardStats.revenue.thisMonth >= dashboardStats.revenue.lastMonth 
                      ? "text-green-600" 
                      : "text-red-600"
                  }`}>
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {((Math.abs(dashboardStats.revenue.thisMonth - dashboardStats.revenue.lastMonth) / 
                      (dashboardStats.revenue.lastMonth || 1)) * 100).toFixed(0)}%
                  </div>
                )}
              </div>
              <Progress 
                className="h-1 mt-3" 
                value={Math.min(
                  dashboardStats.revenue.thisMonth / (dashboardStats.revenue.lastMonth || 1) * 100, 
                  100
                )} 
              />
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="overview">
              <ListChecks className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* System Status Card */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">System Status</CardTitle>
                  <CardDescription>
                    Current operational status of all systems
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">Web Application</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">100% uptime</span>
                    </div>
                    <Progress value={100} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">Database</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">100% uptime</span>
                    </div>
                    <Progress value={100} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">API Services</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">100% uptime</span>
                    </div>
                    <Progress value={100} className="h-1" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm font-medium">Payment Processing</span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">100% uptime</span>
                    </div>
                    <Progress value={100} className="h-1" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Summary */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Activity Summary</CardTitle>
                  <CardDescription>
                    Recent events and activities
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-2 border-green-500 pl-4 py-1">
                      <p className="text-sm font-medium">System Update</p>
                      <p className="text-xs text-muted-foreground">
                        All systems updated to latest version
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-blue-500 pl-4 py-1">
                      <p className="text-sm font-medium">User Activity</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats.users.newToday} new users registered today
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-indigo-500 pl-4 py-1">
                      <p className="text-sm font-medium">Ticket Sales</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats.tickets.confirmedToday} tickets issued today
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                    
                    <div className="border-l-2 border-amber-500 pl-4 py-1">
                      <p className="text-sm font-medium">Revenue Update</p>
                      <p className="text-xs text-muted-foreground">
                        {dashboardStats.revenue.currency} {dashboardStats.revenue.thisMonth.toLocaleString()} revenue this month
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Recent Activity Log</CardTitle>
                <CardDescription>
                  Detailed log of recent actions and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  <p>Activity log will be implemented in the next release.</p>
                  <p className="text-sm mt-1">Check back soon for updates.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed performance metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-6 text-muted-foreground">
                  <p>Analytics dashboard will be implemented in the next release.</p>
                  <p className="text-sm mt-1">Check back soon for detailed charts and insights.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;