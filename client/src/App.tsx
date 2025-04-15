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
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import FlightSearchPage from "@/pages/flight-search-page";
import FlightSelectionPage from "@/pages/flight-selection-page";
import PassengerInfoPage from "@/pages/passenger-info-page";
import PaymentPage from "@/pages/payment-page";
import ConfirmationPage from "@/pages/confirmation-page";
import FaqPage from "@/pages/faq-page";
import AuthPage from "@/pages/auth-page";
import SupportPage from "@/pages/support-page";
import HowToWorkPage from "@/pages/how-to-work-page";
import MainLayout from "./layout/main-layout";
import UnifiedDashboard from "@/pages/unified-dashboard";

// Admin Page imports (to be used inside the unified dashboard)
import AdminLoginPage from "@/admin/pages/AdminLoginPage";
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
      <Route path="/payment" component={() => (
        <MainLayout>
          <PaymentPage />
        </MainLayout>
      )} />
      <Route path="/confirmation/:bookingId">
        {(params) => (
          <MainLayout>
            <ConfirmationPage bookingId={params.bookingId} />
          </MainLayout>
        )}
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
      
      {/* Unified Dashboard and Control Panel Routes */}
      <Route path="/admin/login" component={AdminLoginPage} />
      
      {/* All dashboard routes use the unified dashboard component */}
      <ProtectedRoute path="/dashboard" component={UnifiedDashboard} />
      <ProtectedRoute path="/dashboard/bookings" component={UnifiedDashboard} />
      <ProtectedRoute path="/dashboard/profile" component={UnifiedDashboard} />
      <ProtectedRoute path="/admin/dashboard" component={UnifiedDashboard} />
      <ProtectedRoute path="/admin/users" component={UnifiedDashboard} />
      <ProtectedRoute path="/admin/flights" component={UnifiedDashboard} />
      <ProtectedRoute path="/admin/tickets" component={UnifiedDashboard} />
      <ProtectedRoute path="/admin/pricing" component={UnifiedDashboard} />
      <ProtectedRoute path="/admin/settings" component={UnifiedDashboard} />
      
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
  );

  // If running in Electron, wrap with ElectronAppWrapper
  if (isElectron()) {
    return <ElectronAppWrapper>{appContent}</ElectronAppWrapper>;
  }

  // Otherwise, just return the regular web app
  return appContent;
}

export default App;
