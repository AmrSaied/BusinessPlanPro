import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { AlertCircle, Lock, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

const AdminLoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const { loginMutation } = useAuth();
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!username || !password) {
      setLoginError("Please enter both username and password");
      return;
    }

    try {
      const response = await loginMutation.mutateAsync({ 
        username, 
        password 
      });
      
      // Check if user has admin role
      if (response && response.role === "admin") {
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin panel",
        });
        navigate("/admin/dashboard");
      } else {
        setLoginError("You don't have admin privileges");
      }
    } catch (error) {
      setLoginError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User size={16} className="text-gray-400" />
                </span>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  className="pl-10"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock size={16} className="text-gray-400" />
                </span>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Logging in..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Not an admin? <a href="/" className="text-blue-600 hover:underline">Return to main site</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminLoginPage;