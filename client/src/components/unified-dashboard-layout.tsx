import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useTheme } from "next-themes";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Settings,
  Users,
  Ticket,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Plane,
  Sun,
  Tags,
  ChevronDown,
  Laptop,
  CreditCard,
  UserCircle,
  Home,
  Globe,
} from "lucide-react";

interface UnifiedDashboardLayoutProps {
  children: React.ReactNode;
}

const UnifiedDashboardLayout: React.FC<UnifiedDashboardLayoutProps> = ({ children }) => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const [isAdminUser, setIsAdminUser] = useState(false);

  // Check if user has admin privileges
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) return;
      
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
  }, [user]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: t("logout_success"),
        description: t("logout_success_message"),
      });
      navigate("/");
    } catch (error) {
      toast({
        title: t("logout_failed"),
        description: t("logout_failed_message"),
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Base navigation items (for regular users)
  const baseNavigationItems = [
    { name: t("dashboard"), href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: t("my_bookings"), href: "/dashboard/bookings", icon: <Ticket className="h-5 w-5" /> },
    { name: t("my_profile"), href: "/dashboard/profile", icon: <UserCircle className="h-5 w-5" /> },
  ];

  // Admin navigation items (only shown to admin users)
  const adminNavigationItems = [
    { name: t("users_management"), href: "/admin/users", icon: <Users className="h-5 w-5" /> },
    { name: t("flights_management"), href: "/admin/flights", icon: <Plane className="h-5 w-5" /> },
    { name: t("tickets_management"), href: "/admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { name: t("pricing_management"), href: "/admin/pricing", icon: <Tags className="h-5 w-5" /> },
    { name: t("system_settings"), href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  // Combine navigation items based on user role
  const navigationItems = isAdminUser 
    ? [...baseNavigationItems, ...adminNavigationItems]
    : baseNavigationItems;

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="Logo"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/32x32";
              }}
            />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              {isAdminUser ? t("control_panel") : t("my_account")}
            </h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {/* Site Navigation */}
              <div className="mb-2">
                <Link
                  href="/"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Home className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                  {t("back_to_home")}
                </Link>
                <Link
                  href="/search"
                  className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Globe className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                  {t("search_flights")}
                </Link>
              </div>

              <div className="px-3 py-2">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {isAdminUser ? t("management") : t("my_account")}
                </h3>
              </div>

              {/* Dashboard Navigation */}
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div
                      className={`mr-3 ${
                        isActive ? "text-primary-foreground" : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                      }`}
                    >
                      {item.icon}
                    </div>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center">
              <div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.username || "User"}
                </p>
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {isAdminUser ? t("administrator") : t("member")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 w-full">
        <div className="flex items-center">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetHeader className="p-4 border-b border-gray-200 dark:border-gray-700">
                <SheetTitle className="flex items-center">
                  <img
                    className="h-8 w-auto"
                    src="/logo.svg"
                    alt="Logo"
                    onError={(e) => {
                      e.currentTarget.src = "https://via.placeholder.com/32x32";
                    }}
                  />
                  <span className="ml-2">
                    {isAdminUser ? t("control_panel") : t("my_account")}
                  </span>
                </SheetTitle>
              </SheetHeader>
              <div className="py-4">
                <nav className="space-y-1 px-2">
                  {/* Site Navigation */}
                  <div className="mb-2">
                    <Link
                      href="/"
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Home className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                      {t("back_to_home")}
                    </Link>
                    <Link
                      href="/search"
                      className="group flex items-center px-2 py-2 text-base font-medium rounded-md text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Globe className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300" />
                      {t("search_flights")}
                    </Link>
                  </div>

                  <div className="px-3 py-2">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {isAdminUser ? t("management") : t("my_account")}
                    </h3>
                  </div>
                  
                  {navigationItems.map((item) => {
                    const isActive = location === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <div
                          className={`mr-4 ${
                            isActive ? "text-primary-foreground" : "text-gray-400 group-hover:text-gray-500 dark:group-hover:text-gray-300"
                          }`}
                        >
                          {item.icon}
                        </div>
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src="" alt="Profile" />
                    <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {user?.username || "User"}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {isAdminUser ? t("administrator") : t("member")}
                    </p>
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="destructive" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("logout")}
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div className="ml-4 flex items-center">
            <img
              className="h-8 w-auto"
              src="/logo.svg"
              alt="Logo"
              onError={(e) => {
                e.currentTarget.src = "https://via.placeholder.com/32x32";
              }}
            />
            <h1 className="ml-2 text-xl font-bold text-gray-900 dark:text-gray-100">
              {isAdminUser ? t("control") : t("account")}
            </h1>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                {theme === "light" ? (
                  <Sun className="h-5 w-5" />
                ) : theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Laptop className="h-5 w-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Sun className="mr-2 h-4 w-4" />
                <span>{t("light_theme")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Moon className="mr-2 h-4 w-4" />
                <span>{t("dark_theme")}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Laptop className="mr-2 h-4 w-4" />
                <span>{t("system_theme")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>{t("logout")}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex flex-col flex-1">
        {/* Desktop Header */}
        <div className="sticky top-0 z-10 md:flex items-center justify-end h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 hidden">
          <div className="flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 gap-1">
                  {theme === "light" ? (
                    <Sun className="h-4 w-4" />
                  ) : theme === "dark" ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Laptop className="h-4 w-4" />
                  )}
                  <span>{t("theme")}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>{t("light_theme")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>{t("dark_theme")}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  <Laptop className="mr-2 h-4 w-4" />
                  <span>{t("system_theme")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-8" />

            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              {t("visit_site")}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.username}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>{t("profile")}</span>
                </DropdownMenuItem>
                {isAdminUser && (
                  <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t("settings")}</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UnifiedDashboardLayout;