import React, { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn, queryClient } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
  Plane,
  Tags,
  ChevronDown,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Fetch current user data
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Check if user is authenticated and has admin role
  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      toast({
        title: "Access denied",
        description: "You must be logged in as an administrator to access this area",
        variant: "destructive",
      });
      navigate("/admin/login");
    }
  }, [isLoading, user, navigate, toast]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
      queryClient.setQueryData(["/api/user"], null);
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      navigate("/admin/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "An error occurred while trying to log out",
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

  const navigationItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: "Users", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
    { name: "Tickets", href: "/admin/tickets", icon: <Ticket className="h-5 w-5" /> },
    { name: "Pricing", href: "/admin/pricing", icon: <Tags className="h-5 w-5" /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:relative bg-card border-r shadow-sm">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
            <h1 className="ml-2 text-xl font-bold text-primary">
              Admin Panel
            </h1>
          </div>
          <div className="mt-5 flex-grow flex flex-col">
            <nav className="flex-1 px-2 space-y-1">
              {navigationItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`mr-3 ${
                        isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
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
          <div className="flex-shrink-0 flex border-t p-4">
            <div className="flex items-center w-full">
              <div>
                <Avatar className="h-9 w-9">
                  <AvatarImage src="" alt="Profile" />
                  <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3 flex-grow">
                <p className="text-sm font-medium text-foreground">
                  {user?.username || "Admin"}
                </p>
                <p className="text-xs font-medium text-muted-foreground">
                  {user?.role === "admin" ? "Administrator" : "User"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Container */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b shadow-sm bg-card w-full">
          <div className="flex items-center">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                    <span className="ml-2 text-primary font-bold">Admin Panel</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <nav className="space-y-1 px-2">
                    {navigationItems.map((item) => {
                      const isActive = location === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          className={`group flex items-center px-3 py-2 text-base font-medium rounded-md transition-colors ${
                            isActive
                              ? "bg-primary text-primary-foreground"
                              : "text-foreground hover:bg-muted"
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <div
                            className={`mr-3 ${
                              isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
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
                <div className="absolute bottom-0 left-0 right-0 border-t p-4">
                  <div className="flex items-center w-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src="" alt="Profile" />
                      <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
                    </Avatar>
                    <div className="ml-3 flex-grow">
                      <p className="text-sm font-medium text-foreground">
                        {user?.username || "Admin"}
                      </p>
                      <p className="text-xs font-medium text-muted-foreground">
                        {user?.role === "admin" ? "Administrator" : "User"}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="destructive" className="w-full" onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <div className="ml-4 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
              <h1 className="ml-2 text-xl font-bold text-primary">
                Admin
              </h1>
            </div>
          </div>
          <div className="flex items-center space-x-2">

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
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
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Desktop Header */}
        <div className="sticky top-0 z-10 md:flex items-center justify-end h-16 bg-card border-b shadow-sm px-4 hidden">
          <div className="flex items-center space-x-4">

            <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
              Visit Site
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{user?.username?.charAt(0).toUpperCase() || "A"}</AvatarFallback>
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
                <DropdownMenuItem onClick={() => navigate("/admin/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;