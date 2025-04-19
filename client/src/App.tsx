import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BookingProvider } from "./context/booking-context";
import { LanguageProvider } from "./context/language-context";
import { AuthProvider } from "./hooks/use-auth";
import { TranslationProvider } from "./hooks/use-translation";
import { ProtectedRoute } from "./lib/protected-route";
import ElectronAppWrapper from "@/components/desktop/electron-app-wrapper";
import { isElectron } from "@/lib/environment";
import { ThemeProvider } from "next-themes";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import FlightSearchPage from "@/pages/flight-search-page";
import FlightSelectionPage from "@/pages/flight-selection-page";
import PassengerInfoPage from "@/pages/passenger-info-page";
import OverviewPage from "@/pages/overview-page";
import PaymentPage from "@/pages/payment-page";
import ConfirmationPage from "@/pages/confirmation-page";
import FaqPage from "@/pages/faq-page";
import AuthPage from "@/pages/auth-page";
import SupportPage from "@/pages/support-page";
import HowToWorkPage from "@/pages/how-to-work-page";
import MainLayout from "./layout/main-layout";
import UserDashboard from "@/pages/user-dashboard";

// Admin Page imports
import { AdminProtectedRoute } from "@/admin/components/AdminProtectedRoute";
import AdminLoginPage from "@/admin/pages/AdminLoginPage";
import DashboardPage from "@/admin/pages/DashboardPage";
import UsersPage from "@/admin/pages/UsersPage";
import FlightsPage from "@/admin/pages/FlightsPage";
import TicketsPage from "@/admin/pages/TicketsPage";
import PricingPage from "@/admin/pages/PricingPage";
import SettingsPage from "@/admin/pages/SettingsPage";

function Router() {
  return (
    <Switch>
      {/* Main Application Routes */}
      <Route path="/" component={() => (
        <MainLayout>
          <HomePage />
        </MainLayout>
      )} />
      <Route path="/search" component={() => (
        <MainLayout>
          <FlightSearchPage />
        </MainLayout>
      )} />
      <Route path="/flights" component={() => (
        <MainLayout>
          <FlightSelectionPage />
        </MainLayout>
      )} />
      <Route path="/passenger" component={() => (
        <MainLayout>
          <PassengerInfoPage />
        </MainLayout>
      )} />
      <Route path="/overview" component={() => (
        <MainLayout>
          <OverviewPage />
        </MainLayout>
      )} />
      <Route path="/payment" component={() => (
        <MainLayout>
          <PaymentPage />
        </MainLayout>
      )} />
      {/* Route for direct bookingId parameter */}
      <Route path="/confirmation/:bookingId">
        {(params) => (
          <MainLayout>
            <ConfirmationPage bookingId={params.bookingId} />
          </MainLayout>
        )}
      </Route>
      
      {/* Route for Stripe callback with session_id query parameter */}
      <Route path="/confirmation">
        <MainLayout>
          <ConfirmationPage />
        </MainLayout>
      </Route>
      <Route path="/auth" component={() => (
        <MainLayout>
          <AuthPage />
        </MainLayout>
      )} />
      <Route path="/faq" component={() => (
        <MainLayout>
          <FaqPage />
        </MainLayout>
      )} />
      <Route path="/support" component={() => (
        <MainLayout>
          <SupportPage />
        </MainLayout>
      )} />
      <Route path="/how-it-works" component={() => (
        <MainLayout>
          <HowToWorkPage />
        </MainLayout>
      )} />
      
      {/* User Dashboard Routes */}
      <ProtectedRoute 
        path="/dashboard" 
        component={() => (
          <MainLayout>
            <UserDashboard />
          </MainLayout>
        )} 
      />
      
      {/* Admin Panel Routes (completely separate from user interface) */}
      <Route path="/admin/login" component={AdminLoginPage} />
      <AdminProtectedRoute path="/admin/dashboard" component={() => <DashboardPage />} />
      <AdminProtectedRoute path="/admin/users" component={() => <UsersPage />} />
      <AdminProtectedRoute path="/admin/flights" component={() => <FlightsPage />} />
      <AdminProtectedRoute path="/admin/tickets" component={() => <TicketsPage />} />
      <AdminProtectedRoute path="/admin/pricing" component={() => <PricingPage />} />
      <AdminProtectedRoute path="/admin/settings" component={() => <SettingsPage />} />
      
      {/* 404 Route */}
      <Route component={() => (
        <MainLayout>
          <NotFound />
        </MainLayout>
      )} />
    </Switch>
  );
}

function App() {
  const appContent = (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="light" 
      enableSystem={false}
      forcedTheme="light"
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <LanguageProvider>
          <AuthProvider>
            <TranslationProvider>
              <BookingProvider>
                <Toaster />
                <Router />
              </BookingProvider>
            </TranslationProvider>
          </AuthProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );

  // If running in Electron, wrap with ElectronAppWrapper
  if (isElectron()) {
    return <ElectronAppWrapper>{appContent}</ElectronAppWrapper>;
  }

  // Otherwise, just return the regular web app
  return appContent;
}

export default App;
