import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Plane,
  Ticket,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    // After initial mount, set initialLoad to false
    setInitialLoad(false);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  // Admin navigation links
  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="w-5 h-5" />,
    },
    {
      title: "Flights",
      href: "/admin/flights",
      icon: <Plane className="w-5 h-5" />,
    },
    {
      title: "Tickets",
      href: "/admin/tickets",
      icon: <Ticket className="w-5 h-5" />,
    },
    {
      title: "Pricing",
      href: "/admin/pricing",
      icon: <DollarSign className="w-5 h-5" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      window.location.href = "/"; // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // If initial load, don't render anything to prevent flash of content before redirect
  if (initialLoad) {
    return null;
  }

  // Check if user is logged in and has admin role
  if (!user || user.role !== "admin") {
    // If accessed directly, redirect to login
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
      window.location.href = "/admin/login";
    }
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Sidebar for desktop */}
      <div
        className={cn(
          "bg-white w-64 flex-shrink-0 border-r h-full fixed lg:static",
          mobileMenuOpen ? "block z-40" : "hidden lg:block"
        )}
      >
        <div className="flex flex-col h-full">
          <div className="p-4 border-b">
            <Link href="/admin/dashboard">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">A</span>
                </div>
                <h1 className="font-semibold text-lg">Admin Panel</h1>
              </div>
            </Link>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <a
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </a>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-white">
                    {user.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-gray-500">Administrator</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-5 w-5 text-gray-500" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b h-16 flex items-center justify-between px-6">
          <h1 className="text-xl font-semibold">
            {navItems.find((item) => item.href === location)?.title || "Admin Panel"}
          </h1>
          <div className="flex items-center space-x-4">
            <Avatar className="hidden lg:flex">
              <AvatarFallback className="bg-primary text-white">
                {user.username ? user.username.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>

        <footer className="bg-white border-t py-3 px-6">
          <div className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Flight Ticket Admin Panel. All rights reserved.
          </div>
        </footer>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;