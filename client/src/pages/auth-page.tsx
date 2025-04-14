import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";
import MainLayout from "@/layout/main-layout";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/context/language-context";
import { cn } from "@/lib/utils";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  preferredLanguage: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

function AuthPage() {
  console.log("Auth page component rendering");
  const { t } = useTranslation();
  const { currentLanguage } = useLanguage();
  const isRTL = currentLanguage === 'ar' || currentLanguage === 'he';
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { toast } = useToast();
  const [_, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  console.log("Auth page - current user:", user ? `ID: ${user.id}, Username: ${user.username}` : "Not logged in");

  // Redirect to home if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
      preferredLanguage: "en",
    },
  });

  // Handle login form submission
  const onLoginSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
      toast({
        title: "Success",
        description: t("auth_success_login"),
      });
      navigate("/");
    } catch (error) {
      // Error is handled by the mutation's onError callback
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (values: RegisterFormValues) => {
    try {
      console.log("Submitting registration form with values:", {
        username: values.username,
        email: values.email,
        hasPassword: !!values.password
      });
      
      const { confirmPassword, ...userData } = values;
      
      await registerMutation.mutateAsync(userData);
      toast({
        title: "Success",
        description: t("auth_success_register"),
      });
      navigate("/");
    } catch (error) {
      console.error("Registration error in component:", error);
      // Show error toast in addition to the one from the mutation
      toast({
        title: t("auth_failed_register"),
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Background with styling matching home page */}
      <section className="relative py-16 md:py-24 overflow-hidden bg-gradient-to-b from-blue-900 to-blue-800">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          {/* White particles */}
          <div className="absolute inset-0 bg-white opacity-25">
            <svg className="absolute inset-0 w-full h-full opacity-70" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="url(#starsPattern)" />
              <defs>
                <pattern id="starsPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1.5" fill="white" />
                </pattern>
              </defs>
            </svg>
          </div>
          
          {/* Airplane silhouettes */}
          <div className="absolute top-20 right-10 text-white opacity-40 transform rotate-12 scale-150 animate-pulse">
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.9L17.5 12.4V8.49999C17.5 8.19999 17.3 7.99999 17 7.99999H16C15.7 7.99999 15.5 8.19999 15.5 8.49999V10.4L13 7.89999V5.99999C13 4.29999 10.5 2.99999 9.5 2.99999C8.5 2.99999 6 4.29999 6 5.99999V7.89999L3.5 10.4V8.49999C3.5 8.19999 3.3 7.99999 3 7.99999H2C1.7 7.99999 1.5 8.19999 1.5 8.49999V12.4L7 16.9H1V18.9H10V17.9L12 15.9L14 17.9V18.9H23V16.9H22Z" fill="currentColor"/>
            </svg>
          </div>
          
          <div className="absolute top-40 left-10 text-white opacity-30 transform -rotate-12 scale-125 animate-pulse delay-700">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.9L17.5 12.4V8.49999C17.5 8.19999 17.3 7.99999 17 7.99999H16C15.7 7.99999 15.5 8.19999 15.5 8.49999V10.4L13 7.89999V5.99999C13 4.29999 10.5 2.99999 9.5 2.99999C8.5 2.99999 6 4.29999 6 5.99999V7.89999L3.5 10.4V8.49999C3.5 8.19999 3.3 7.99999 3 7.99999H2C1.7 7.99999 1.5 8.19999 1.5 8.49999V12.4L7 16.9H1V18.9H10V17.9L12 15.9L14 17.9V18.9H23V16.9H22Z" fill="currentColor"/>
            </svg>
          </div>
        </div>
        
        {/* Curved shape at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 100" className="w-full h-16 text-white fill-current">
            <path d="M0,64L80,58.7C160,53,320,43,480,48C640,53,800,75,960,80C1120,85,1280,75,1360,69.3L1440,64L1440,100L1360,100C1280,100,1120,100,960,100C800,100,640,100,480,100C320,100,160,100,80,100L0,100Z"></path>
          </svg>
        </div>
      
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Left side - Auth forms */}
            <div className="w-full md:w-1/2 backdrop-blur-sm bg-white/10 p-6 rounded-xl shadow-xl border border-white/20">
              <div className="bg-white rounded-lg shadow-xl p-6">
                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as "login" | "register")}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">{t("auth_login_tab")}</TabsTrigger>
                    <TabsTrigger value="register">{t("auth_register_tab")}</TabsTrigger>
                  </TabsList>

                  {/* Login Tab */}
                  <TabsContent value="login">
                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-4">
                        <CardTitle className={cn("text-2xl font-bold text-blue-900", isRTL && "text-right")}>{t("auth_login_title")}</CardTitle>
                        <CardDescription className={cn(isRTL && "text-right")}>
                          {t("auth_login_description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(isRTL && "text-right w-full")}>{t("auth_username_label")}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t("auth_username_placeholder")} 
                                      className={cn(isRTL && "text-right")}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage className={cn(isRTL && "text-right")} />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(isRTL && "text-right w-full")}>{t("auth_password_label")}</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input 
                                        type={showLoginPassword ? "text" : "password"}
                                        placeholder={t("auth_password_placeholder")} 
                                        className={cn(isRTL && "text-right")}
                                        {...field} 
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "absolute top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600",
                                        isRTL ? "left-0" : "right-0"
                                      )}
                                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                                      tabIndex={-1}
                                    >
                                      {showLoginPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <FormMessage className={cn(isRTL && "text-right")} />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              className="w-full bg-amber-500 text-gray-900 hover:bg-amber-400"
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? (
                                <>
                                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                                  {t("auth_logging_in")}
                                </>
                              ) : (
                                t("auth_login_button")
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                      <CardFooter className="flex flex-col space-y-4">
                        <Separator />
                        <div className="text-sm text-muted-foreground text-center">
                          {t("auth_no_account")}{" "}
                          <Button
                            variant="link"
                            className="p-0 text-blue-600"
                            onClick={() => setActiveTab("register")}
                          >
                            {t("auth_register_link")}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>

                  {/* Register Tab */}
                  <TabsContent value="register">
                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-4">
                        <CardTitle className={cn("text-2xl font-bold text-blue-900", isRTL && "text-right")}>{t("auth_register_title")}</CardTitle>
                        <CardDescription className={cn(isRTL && "text-right")}>
                          {t("auth_register_description")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Form {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <FormField
                              control={registerForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(isRTL && "text-right w-full")}>{t("auth_username_label")}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder={t("auth_register_username_placeholder")} 
                                      className={cn(isRTL && "text-right")}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage className={cn(isRTL && "text-right")} />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(isRTL && "text-right w-full")}>{t("auth_email_label")}</FormLabel>
                                  <FormControl>
                                    <Input 
                                      type="email" 
                                      placeholder={t("auth_email_placeholder")} 
                                      className={cn(isRTL && "text-right")}
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormMessage className={cn(isRTL && "text-right")} />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(isRTL && "text-right w-full")}>{t("auth_password_label")}</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input 
                                        type={showRegisterPassword ? "text" : "password"} 
                                        placeholder={t("auth_create_password_placeholder")} 
                                        className={cn(isRTL && "text-right")}
                                        {...field} 
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "absolute top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600",
                                        isRTL ? "left-0" : "right-0"
                                      )}
                                      onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                      tabIndex={-1}
                                    >
                                      {showRegisterPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <FormMessage className={cn(isRTL && "text-right")} />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={registerForm.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(isRTL && "text-right w-full")}>{t("auth_confirm_password_label")}</FormLabel>
                                  <div className="relative">
                                    <FormControl>
                                      <Input 
                                        type={showConfirmPassword ? "text" : "password"} 
                                        placeholder={t("auth_confirm_password_placeholder")} 
                                        className={cn(isRTL && "text-right")}
                                        {...field} 
                                      />
                                    </FormControl>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "absolute top-0 h-full px-3 py-2 text-gray-400 hover:text-gray-600",
                                        isRTL ? "left-0" : "right-0"
                                      )}
                                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                      tabIndex={-1}
                                    >
                                      {showConfirmPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                      ) : (
                                        <Eye className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                  <FormMessage className={cn(isRTL && "text-right")} />
                                </FormItem>
                              )}
                            />
                            <Button
                              type="submit"
                              className="w-full bg-amber-500 text-gray-900 hover:bg-amber-400"
                              disabled={registerMutation.isPending}
                            >
                              {registerMutation.isPending ? (
                                <>
                                  <Loader2 className={cn("h-4 w-4 animate-spin", isRTL ? "ml-2" : "mr-2")} />
                                  {t("auth_registering")}
                                </>
                              ) : (
                                t("auth_register_button")
                              )}
                            </Button>
                          </form>
                        </Form>
                      </CardContent>
                      <CardFooter className="flex flex-col space-y-4">
                        <Separator />
                        <div className="text-sm text-muted-foreground text-center">
                          {t("auth_have_account")}{" "}
                          <Button
                            variant="link"
                            className="p-0 text-blue-600"
                            onClick={() => setActiveTab("login")}
                          >
                            {t("auth_login_link")}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right side - Hero section */}
            <div className="w-full md:w-1/2 flex flex-col justify-center text-white">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-xl border border-white/20 shadow-xl">
                <h2 className={cn("text-3xl font-bold mb-4 text-white", isRTL && "text-right")}>{t("auth_hero_title")}</h2>
                <p className={cn("mb-6 text-white/90", isRTL && "text-right")}>
                  {t("auth_hero_subtitle")}
                </p>
                <ul className="space-y-3">
                  <li className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                    <span className={cn("bg-white/20 rounded-full p-1 text-white", isRTL ? "ml-2" : "mr-2")}>✓</span>
                    <span className={cn(isRTL && "text-right")}>{t("auth_benefit_1")}</span>
                  </li>
                  <li className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                    <span className={cn("bg-white/20 rounded-full p-1 text-white", isRTL ? "ml-2" : "mr-2")}>✓</span>
                    <span className={cn(isRTL && "text-right")}>{t("auth_benefit_2")}</span>
                  </li>
                  <li className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                    <span className={cn("bg-white/20 rounded-full p-1 text-white", isRTL ? "ml-2" : "mr-2")}>✓</span>
                    <span className={cn(isRTL && "text-right")}>{t("auth_benefit_3")}</span>
                  </li>
                  <li className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                    <span className={cn("bg-white/20 rounded-full p-1 text-white", isRTL ? "ml-2" : "mr-2")}>✓</span>
                    <span className={cn(isRTL && "text-right")}>{t("auth_benefit_4")}</span>
                  </li>
                  <li className={cn("flex items-start", isRTL && "flex-row-reverse")}>
                    <span className={cn("bg-white/20 rounded-full p-1 text-white", isRTL ? "ml-2" : "mr-2")}>✓</span>
                    <span className={cn(isRTL && "text-right")}>{t("auth_benefit_5")}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* White section below for proper page height */}
      <section className="bg-white py-8">
        <div className="container mx-auto px-4">
          {/* This section is intentionally left empty, just to provide proper page balance */}
        </div>
      </section>
    </div>
  );
}

export default AuthPage;