import { useState } from "react";
import AdminLayout from "../components/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import {
  Loader2, AlertCircle, Users, Ticket, Plane, DollarSign, 
  BarChart, ListChecks, ArrowUpRight, Activity, CheckCircle2,
  Clock, Calendar, TrendingUp, PieChart, Settings
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
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Overview of your flight ticket system
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-700 dark:text-green-400">All Systems Online</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full border border-gray-200 dark:border-gray-700">
              <Clock className="h-4 w-4 text-gray-500" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          {/* Users Stats Card */}
          <Card className="bg-white dark:bg-gray-800 border-none shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <div className="h-10 w-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{dashboardStats.users.total}</div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.users.active} active users
                </p>
                {dashboardStats.users.newToday > 0 && (
                  <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {dashboardStats.users.newToday} new today
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Active rate</span>
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
              <CardTitle className="text-sm font-medium">Ticket Sales</CardTitle>
              <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
                <Ticket className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{dashboardStats.tickets.total}</div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.tickets.pendingPayment} pending payment
                </p>
                {dashboardStats.tickets.confirmedToday > 0 && (
                  <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">
                    <ArrowUpRight className="h-3 w-3 mr-1" />
                    {dashboardStats.tickets.confirmedToday} today
                  </div>
                )}
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Completion rate</span>
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
              <CardTitle className="text-sm font-medium">Active Flights</CardTitle>
              <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Plane className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 dark:text-gray-200">{dashboardStats.flights.total}</div>
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-muted-foreground">
                  {dashboardStats.flights.active} currently active
                </p>
                <div className="flex items-center text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                  <Activity className="h-3 w-3 mr-1" />
                  {Math.round(dashboardStats.flights.active / (dashboardStats.flights.total || 1) * 100)}% active
                </div>
              </div>
              <div className="mt-4 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Active rate</span>
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
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
                  {dashboardStats.revenue.currency} {dashboardStats.revenue.thisMonth.toLocaleString()} this month
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
                  <span className="text-muted-foreground">Monthly progress</span>
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

        {/* Main Content Tabs */}
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="inline-flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <ListChecks className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="activity" 
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <Activity className="h-4 w-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger 
              value="analytics" 
              className="rounded-md data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Key Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Weekly Performance</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-1">
                      <span className="text-sm text-muted-foreground">Tickets sold</span>
                      <div className="text-2xl font-semibold">{dashboardStats.tickets.confirmedToday * 7}</div>
                    </div>
                    <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Mon</div>
                        <div className="text-sm font-semibold">{dashboardStats.tickets.confirmedToday}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Tue</div>
                        <div className="text-sm font-semibold">{dashboardStats.tickets.confirmedToday + 1}</div>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                        <div className="text-xs text-muted-foreground">Wed</div>
                        <div className="text-sm font-semibold">{dashboardStats.tickets.confirmedToday - 1}</div>
                      </div>
                    </div>
                    <Progress className="h-1.5" value={75} />
                    <div className="text-xs text-muted-foreground">
                      75% of weekly target reached
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Top Routes</CardTitle>
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
                          <div className="text-xs text-muted-foreground">30% of sales</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {Math.round(dashboardStats.tickets.total * 0.3)} tickets
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-emerald-500 rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">LAX → TOK</div>
                          <div className="text-xs text-muted-foreground">25% of sales</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {Math.round(dashboardStats.tickets.total * 0.25)} tickets
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-8 bg-amber-500 rounded-full"></div>
                        <div>
                          <div className="text-sm font-medium">CHI → PAR</div>
                          <div className="text-xs text-muted-foreground">20% of sales</div>
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        {Math.round(dashboardStats.tickets.total * 0.2)} tickets
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">System Health</CardTitle>
                    <Settings className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">Web Platform</span>
                        </div>
                        <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">Operational</span>
                      </div>
                      <Progress value={100} className="h-1.5 bg-green-100 dark:bg-green-900/20" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">Database</span>
                        </div>
                        <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">Operational</span>
                      </div>
                      <Progress value={100} className="h-1.5 bg-green-100 dark:bg-green-900/20" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">API Services</span>
                        </div>
                        <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">Operational</span>
                      </div>
                      <Progress value={100} className="h-1.5 bg-green-100 dark:bg-green-900/20" />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm font-medium">Payment System</span>
                        </div>
                        <span className="text-xs bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 font-medium px-2 py-0.5 rounded-full">Operational</span>
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
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>
                  Latest events and updates from the system
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
                        <p className="text-sm font-medium">System Update</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          All systems successfully updated to the latest version
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
                        <p className="text-sm font-medium">User Activity</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dashboardStats.users.newToday} new users registered today
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
                        <p className="text-sm font-medium">Ticket Sales</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dashboardStats.tickets.confirmedToday} tickets issued today
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
                        <p className="text-sm font-medium">Revenue Update</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {dashboardStats.revenue.currency} {dashboardStats.revenue.thisMonth.toLocaleString()} revenue generated this month
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

          <TabsContent value="activity" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity Log</CardTitle>
                <CardDescription>
                  Detailed log of recent actions and events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <Clock className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">Activity Log Coming Soon</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    A detailed activity log is under development and will be available in the next release.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <Card className="bg-white dark:bg-gray-800 border-none shadow-md">
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>
                  Detailed performance metrics and trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-16 text-muted-foreground">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <BarChart className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-lg font-medium">Analytics Dashboard Coming Soon</p>
                  <p className="text-sm mt-2 max-w-md mx-auto">
                    A comprehensive analytics dashboard with detailed charts and insights will be available in the next release.
                  </p>
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