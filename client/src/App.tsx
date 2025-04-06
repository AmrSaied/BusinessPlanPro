import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BookingProvider } from "./context/booking-context";
import { LanguageProvider } from "./context/language-context";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import FlightSearchPage from "@/pages/flight-search-page";
import FlightSelectionPage from "@/pages/flight-selection-page";
import PassengerInfoPage from "@/pages/passenger-info-page";
import PaymentPage from "@/pages/payment-page";
import ConfirmationPage from "@/pages/confirmation-page";
import FaqPage from "@/pages/faq-page";
import UserDashboard from "@/pages/user-dashboard";
import AuthPage from "@/pages/auth-page";
import SupportPage from "@/pages/support-page";
import MainLayout from "./layout/main-layout";

function Router() {
  return (
    <Switch>
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
      <ProtectedRoute 
        path="/dashboard" 
        component={() => (
          <MainLayout>
            <UserDashboard />
          </MainLayout>
        )} 
      />
      <Route component={() => (
        <MainLayout>
          <NotFound />
        </MainLayout>
      )} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <AuthProvider>
          <BookingProvider>
            <Toaster />
            <Router />
          </BookingProvider>
        </AuthProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
