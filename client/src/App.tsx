import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { MobileOptimization } from "./components/mobile/MobileOptimization";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Trips from "./pages/Trips";
import JoinTrip from "./pages/JoinTrip";
import NotFound from "./pages/NotFound";
import ExpenseTracking from "./pages/ExpenseTracking";
import ExpensePayments from "./pages/ExpensePayments";
import GroupChatPage from "./pages/GroupChatPage";
import Settings from "./pages/Settings";
import ActivityPlanning from "./pages/ActivityPlanning";
import PaymentVerification from "./pages/PaymentVerification";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-sky flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <MobileOptimization />
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/join/:token" element={<JoinTrip />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Index />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/trips" element={
              <ProtectedRoute>
                <Trips />
              </ProtectedRoute>
            } />

            <Route path="/expense-tracking" element={
              <ProtectedRoute>
                <ExpenseTracking />
              </ProtectedRoute>
            } />
            <Route path="/expense-payments" element={
              <ProtectedRoute>
                <ExpensePayments />
              </ProtectedRoute>
            } />
            <Route path="/trips/:tripId/payments" element={
              <ProtectedRoute>
                <ExpensePayments />
              </ProtectedRoute>
            } />
            <Route path="/chat" element={
              <ProtectedRoute>
                <GroupChatPage />
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/trips/:tripId/activities" element={
              <ProtectedRoute>
                <ActivityPlanning />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="/payment-verification" element={
              <ProtectedRoute>
                <PaymentVerification />
              </ProtectedRoute>
            } />
            <Route path="/trips/:tripId/payment-verification" element={
              <ProtectedRoute>
                <PaymentVerification />
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
