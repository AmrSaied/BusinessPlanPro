import { useState, useEffect } from "react";
import AdminLayout from "../components/AdminLayout";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, AlertCircle, CheckCircle, Info } from "lucide-react";

// Settings interfaces
interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  defaultCurrency: string;
  maintenanceMode: boolean;
  termsAndConditionsUrl: string;
  privacyPolicyUrl: string;
}

interface EmailSettings {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  emailFrom: string;
  emailReplyTo: string;
  emailTemplatesPath: string;
  enableEmailNotifications: boolean;
}

interface ApiSettings {
  amadeusApiEnabled: boolean;
  aviationstackApiEnabled: boolean;
  openaiEnabled: boolean;
  stripeEnabled: boolean;
  allowThirdPartyApiCalls: boolean;
  rateLimit: number;
  timeoutSeconds: number;
}

// Log interfaces
interface LogEntry {
  id: number;
  timestamp: string;
  level: "info" | "warn" | "error" | "debug";
  service: string;
  message: string;
}

interface LogPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const SettingsPage = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("general");
  const [isRestartRequired, setIsRestartRequired] = useState(false);
  
  // Logs state
  const [logLevel, setLogLevel] = useState("all");
  const [logPage, setLogPage] = useState(1);
  const [logLimit] = useState(50);
  const [logSearch, setLogSearch] = useState("");

  // Settings form states
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    siteName: "Global Air Travel Services",
    siteDescription: "Providing dummy tickets for visa applications",
    supportEmail: "support@example.com",
    defaultCurrency: "USD",
    maintenanceMode: false,
    termsAndConditionsUrl: "/terms",
    privacyPolicyUrl: "/privacy",
  });

  const [emailSettings, setEmailSettings] = useState<EmailSettings>({
    smtpHost: "",
    smtpPort: 587,
    smtpUser: "",
    smtpPassword: "",
    emailFrom: "",
    emailReplyTo: "",
    emailTemplatesPath: "/templates/email",
    enableEmailNotifications: false,
  });

  const [apiSettings, setApiSettings] = useState<ApiSettings>({
    amadeusApiEnabled: true,
    aviationstackApiEnabled: true,
    openaiEnabled: false,
    stripeEnabled: false,
    allowThirdPartyApiCalls: true,
    rateLimit: 100,
    timeoutSeconds: 30,
  });

  // Fetch settings from API
  const {
    data: settings,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery({
    queryKey: ["/api/admin/settings"],
    queryFn: getQueryFn({ on401: "throw" }),
  });
  
  // Fetch logs from API
  const {
    data: logs,
    isLoading: logsLoading,
    error: logsError,
    refetch: refetchLogs
  } = useQuery<{ logs: LogEntry[], pagination: LogPagination }>({
    queryKey: ["/api/admin/logs", logPage, logLimit, logLevel, logSearch],
    queryFn: getQueryFn({ on401: "throw" }),
    enabled: activeTab === "logs"
  });

  // Update settings mutations
  const updateGeneralSettingsMutation = useMutation({
    mutationFn: async (data: GeneralSettings) => {
      const res = await apiRequest("PUT", "/api/admin/settings/general", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "General settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setIsRestartRequired(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (data: EmailSettings) => {
      const res = await apiRequest("PUT", "/api/admin/settings/email", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "Email settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateApiSettingsMutation = useMutation({
    mutationFn: async (data: ApiSettings) => {
      const res = await apiRequest("PUT", "/api/admin/settings/api", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Settings updated",
        description: "API settings have been updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setIsRestartRequired(true);
    },
    onError: (error: Error) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handler functions
  const handleSaveGeneralSettings = () => {
    updateGeneralSettingsMutation.mutate(generalSettings);
  };

  const handleSaveEmailSettings = () => {
    updateEmailSettingsMutation.mutate(emailSettings);
  };

  const handleSaveApiSettings = () => {
    updateApiSettingsMutation.mutate(apiSettings);
  };

  const handleTestEmailConnection = async () => {
    try {
      await apiRequest("POST", "/api/admin/settings/email/test", emailSettings);
      toast({
        title: "Email test successful",
        description: "Test email was sent successfully",
      });
    } catch (error: any) {
      toast({
        title: "Email test failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleTestApiConnection = async (api: string) => {
    try {
      await apiRequest("POST", `/api/admin/settings/api/test/${api}`);
      toast({
        title: "API test successful",
        description: `Connection to ${api} API was successful`,
      });
    } catch (error: any) {
      toast({
        title: "API test failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const handleRestartServer = async () => {
    try {
      await apiRequest("POST", "/api/admin/settings/restart-server");
      toast({
        title: "Server restarting",
        description: "The server is now restarting. This may take a few moments.",
      });
      setIsRestartRequired(false);
    } catch (error: any) {
      toast({
        title: "Restart failed",
        description: error.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (settingsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  // Error state
  if (settingsError) {
    return (
      <AdminLayout>
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load settings. Please try again later.
          </AlertDescription>
        </Alert>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application settings and configurations.
          </p>
        </div>

        {isRestartRequired && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <Info className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800">Restart Required</AlertTitle>
            <AlertDescription className="text-yellow-700">
              Some changes require a server restart to take effect.
              <Button
                variant="outline"
                className="ml-4 border-yellow-400 hover:bg-yellow-100"
                onClick={handleRestartServer}
              >
                Restart Server
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="general" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="api">API Integration</TabsTrigger>
            <TabsTrigger value="logs">Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>
                  Manage core site settings and configurations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={generalSettings.siteName}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          siteName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      type="email"
                      value={generalSettings.supportEmail}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          supportEmail: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={generalSettings.siteDescription}
                    onChange={(e) =>
                      setGeneralSettings({
                        ...generalSettings,
                        siteDescription: e.target.value,
                      })
                    }
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Select
                      value={generalSettings.defaultCurrency}
                      onValueChange={(value) =>
                        setGeneralSettings({
                          ...generalSettings,
                          defaultCurrency: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                        <SelectItem value="GBP">GBP - British Pound</SelectItem>
                        <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    <div className="flex items-center space-x-2 pt-2">
                      <Switch
                        id="maintenanceMode"
                        checked={generalSettings.maintenanceMode}
                        onCheckedChange={(checked) =>
                          setGeneralSettings({
                            ...generalSettings,
                            maintenanceMode: checked,
                          })
                        }
                      />
                      <Label htmlFor="maintenanceMode">
                        {generalSettings.maintenanceMode ? "Enabled" : "Disabled"}
                      </Label>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="termsAndConditionsUrl">Terms & Conditions URL</Label>
                    <Input
                      id="termsAndConditionsUrl"
                      value={generalSettings.termsAndConditionsUrl}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          termsAndConditionsUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="privacyPolicyUrl">Privacy Policy URL</Label>
                    <Input
                      id="privacyPolicyUrl"
                      value={generalSettings.privacyPolicyUrl}
                      onChange={(e) =>
                        setGeneralSettings({
                          ...generalSettings,
                          privacyPolicyUrl: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleSaveGeneralSettings}
                  disabled={updateGeneralSettingsMutation.isPending}
                >
                  {updateGeneralSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="email" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
                <CardDescription>
                  Configure email server settings and notification preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Switch
                    id="enableEmailNotifications"
                    checked={emailSettings.enableEmailNotifications}
                    onCheckedChange={(checked) =>
                      setEmailSettings({
                        ...emailSettings,
                        enableEmailNotifications: checked,
                      })
                    }
                  />
                  <Label htmlFor="enableEmailNotifications">
                    Enable Email Notifications
                  </Label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpHost">SMTP Host</Label>
                    <Input
                      id="smtpHost"
                      value={emailSettings.smtpHost}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpHost: e.target.value,
                        })
                      }
                      placeholder="smtp.example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPort">SMTP Port</Label>
                    <Input
                      id="smtpPort"
                      type="number"
                      value={emailSettings.smtpPort}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpPort: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtpUser">SMTP Username</Label>
                    <Input
                      id="smtpUser"
                      value={emailSettings.smtpUser}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpUser: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtpPassword">SMTP Password</Label>
                    <Input
                      id="smtpPassword"
                      type="password"
                      value={emailSettings.smtpPassword}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          smtpPassword: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emailFrom">From Email Address</Label>
                    <Input
                      id="emailFrom"
                      type="email"
                      value={emailSettings.emailFrom}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          emailFrom: e.target.value,
                        })
                      }
                      placeholder="noreply@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emailReplyTo">Reply-To Email Address</Label>
                    <Input
                      id="emailReplyTo"
                      type="email"
                      value={emailSettings.emailReplyTo}
                      onChange={(e) =>
                        setEmailSettings({
                          ...emailSettings,
                          emailReplyTo: e.target.value,
                        })
                      }
                      placeholder="support@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailTemplatesPath">Email Templates Path</Label>
                  <Input
                    id="emailTemplatesPath"
                    value={emailSettings.emailTemplatesPath}
                    onChange={(e) =>
                      setEmailSettings({
                        ...emailSettings,
                        emailTemplatesPath: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="pt-4">
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      You can test the email configuration by sending a test email.
                    </AlertDescription>
                  </Alert>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handleTestEmailConnection}
                  disabled={!emailSettings.smtpHost || !emailSettings.emailFrom}
                >
                  Send Test Email
                </Button>
                <Button
                  onClick={handleSaveEmailSettings}
                  disabled={updateEmailSettingsMutation.isPending}
                >
                  {updateEmailSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Integrations</CardTitle>
                <CardDescription>
                  Configure third-party API integrations and settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Amadeus API</h3>
                      <p className="text-sm text-muted-foreground">
                        Real flight data integration
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={apiSettings.amadeusApiEnabled ? "default" : "outline"}>
                        {apiSettings.amadeusApiEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={apiSettings.amadeusApiEnabled}
                        onCheckedChange={(checked) =>
                          setApiSettings({
                            ...apiSettings,
                            amadeusApiEnabled: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  {apiSettings.amadeusApiEnabled && (
                    <div className="flex flex-col space-y-2 pl-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestApiConnection("amadeus")}
                      >
                        Test Connection
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">AviationStack API</h3>
                      <p className="text-sm text-muted-foreground">
                        Flight status and information data
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={apiSettings.aviationstackApiEnabled ? "default" : "outline"}>
                        {apiSettings.aviationstackApiEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={apiSettings.aviationstackApiEnabled}
                        onCheckedChange={(checked) =>
                          setApiSettings({
                            ...apiSettings,
                            aviationstackApiEnabled: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  {apiSettings.aviationstackApiEnabled && (
                    <div className="flex flex-col space-y-2 pl-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestApiConnection("aviationstack")}
                      >
                        Test Connection
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">OpenAI API</h3>
                      <p className="text-sm text-muted-foreground">
                        AI-powered features and translations
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={apiSettings.openaiEnabled ? "default" : "outline"}>
                        {apiSettings.openaiEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={apiSettings.openaiEnabled}
                        onCheckedChange={(checked) =>
                          setApiSettings({
                            ...apiSettings,
                            openaiEnabled: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  {apiSettings.openaiEnabled && (
                    <div className="flex flex-col space-y-2 pl-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestApiConnection("openai")}
                      >
                        Test Connection
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">Stripe API</h3>
                      <p className="text-sm text-muted-foreground">
                        Payment processing integration
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge variant={apiSettings.stripeEnabled ? "default" : "outline"}>
                        {apiSettings.stripeEnabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <Switch
                        checked={apiSettings.stripeEnabled}
                        onCheckedChange={(checked) =>
                          setApiSettings({
                            ...apiSettings,
                            stripeEnabled: checked,
                          })
                        }
                      />
                    </div>
                  </div>
                  {apiSettings.stripeEnabled && (
                    <div className="flex flex-col space-y-2 pl-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTestApiConnection("stripe")}
                      >
                        Test Connection
                      </Button>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">API General Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rateLimit">API Rate Limit (requests per minute)</Label>
                      <Input
                        id="rateLimit"
                        type="number"
                        value={apiSettings.rateLimit}
                        onChange={(e) =>
                          setApiSettings({
                            ...apiSettings,
                            rateLimit: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeoutSeconds">API Timeout (seconds)</Label>
                      <Input
                        id="timeoutSeconds"
                        type="number"
                        value={apiSettings.timeoutSeconds}
                        onChange={(e) =>
                          setApiSettings({
                            ...apiSettings,
                            timeoutSeconds: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      id="allowThirdPartyApiCalls"
                      checked={apiSettings.allowThirdPartyApiCalls}
                      onCheckedChange={(checked) =>
                        setApiSettings({
                          ...apiSettings,
                          allowThirdPartyApiCalls: checked,
                        })
                      }
                    />
                    <Label htmlFor="allowThirdPartyApiCalls">
                      Allow Third-Party API Calls
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={handleSaveApiSettings}
                  disabled={updateApiSettingsMutation.isPending}
                >
                  {updateApiSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  View and analyze system logs for troubleshooting.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <div className="bg-gray-50 p-4 border-b">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Select 
                          value={logLevel}
                          onValueChange={(value) => setLogLevel(value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Log level" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Levels</SelectItem>
                            <SelectItem value="error">Errors</SelectItem>
                            <SelectItem value="warn">Warnings</SelectItem>
                            <SelectItem value="info">Info</SelectItem>
                            <SelectItem value="debug">Debug</SelectItem>
                          </SelectContent>
                        </Select>
                        <Input
                          placeholder="Search logs..."
                          className="w-64"
                          value={logSearch}
                          onChange={(e) => setLogSearch(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="outline"
                        onClick={() => refetchLogs()}
                        disabled={logsLoading}
                      >
                        {logsLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading...
                          </>
                        ) : (
                          "Refresh Logs"
                        )}
                      </Button>
                    </div>
                  </div>
                  <div className="p-4 bg-black text-white font-mono text-sm h-96 overflow-auto">
                    {logsLoading ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      </div>
                    ) : logsError ? (
                      <div className="text-red-400 p-4">
                        Failed to load logs. Please try again.
                      </div>
                    ) : logs?.logs && logs.logs.length > 0 ? (
                      logs.logs.map((log) => (
                        <p 
                          key={log.id}
                          className={`mb-1 ${
                            log.level === "info" ? "text-gray-400" :
                            log.level === "warn" ? "text-yellow-400" :
                            log.level === "error" ? "text-red-400" :
                            log.level === "debug" ? "text-blue-400" : "text-gray-400"
                          }`}
                        >
                          [{log.timestamp}] [{log.level.toUpperCase()}] {log.service ? `[${log.service}]` : ""} {log.message}
                        </p>
                      ))
                    ) : (
                      <p className="text-gray-500">No logs matching the current filters.</p>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-muted-foreground">
                  {logs?.pagination ? (
                    <>
                      Showing {logs.pagination.limit * (logs.pagination.page - 1) + 1} to {Math.min(logs.pagination.limit * logs.pagination.page, logs.pagination.total)} of {logs.pagination.total} log entries
                    </>
                  ) : (
                    "Loading log information..."
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => logPage > 1 && setLogPage(logPage - 1)}
                    disabled={!logs?.pagination || logs.pagination.page <= 1}
                  >
                    Previous
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => logs?.pagination && logs.pagination.page < logs.pagination.pages && setLogPage(logPage + 1)}
                    disabled={!logs?.pagination || logs.pagination.page >= logs.pagination.pages}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;