import { useState, useEffect } from "react";
import { Route, Redirect, useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

interface AdminProtectedRouteProps {
  path: string;
  component: () => JSX.Element;
}

export function AdminProtectedRoute({ path, component: Component }: AdminProtectedRouteProps) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await apiRequest("GET", "/api/admin/check-auth");
        if (response.ok) {
          setIsAdmin(true);
        } else {
          setIsAdmin(false);
          setLocation("/admin/login");
        }
      } catch (error) {
        setIsAdmin(false);
        setLocation("/admin/login");
      }
    };

    checkAdminStatus();
  }, [setLocation]);

  if (isAdmin === null) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (isAdmin === false) {
    return (
      <Route path={path}>
        <Redirect to="/admin/login" />
      </Route>
    );
  }

  return (
    <Route path={path}>
      <Component />
    </Route>
  );
}