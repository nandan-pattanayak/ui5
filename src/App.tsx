import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LeadGenerationPage from "./pages/LeadGenerationPage";
import LeadManagementPage from "./pages/LeadManagementPage";
import LeadEnrichmentPage from "./pages/LeadEnrichmentPage";
import CompetitorAnalysisPage from "./pages/CompetitorAnalysisPage";
import BulkLeadPage from "./pages/BulkLeadPage";
import SlotSchedulerPage from "./pages/SlotSchedulerPage";
import OAuthSuccessPage from "./pages/OAuthSuccessPage";
import NotFound from "./pages/NotFound";
import LoadingSpinner from "./components/LoadingSpinner";

const queryClient = new QueryClient();

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if logged in)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }
  
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route 
              path="/login" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/register" 
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              } 
            />
            
            {/* Protected Routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/lead-generation" 
              element={
                <ProtectedRoute>
                  <LeadGenerationPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/lead-management" 
              element={
                <ProtectedRoute>
                  <LeadManagementPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/lead-enrichment" 
              element={
                <ProtectedRoute>
                  <LeadEnrichmentPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/competitor-analysis" 
              element={
                <ProtectedRoute>
                  <CompetitorAnalysisPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/bulk-leads" 
              element={
                <ProtectedRoute>
                  <BulkLeadPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Public Slot Routes */}
            <Route path="/dashboard/slot" element={<SlotSchedulerPage />} />
            <Route path="/dashboard/slot/:id" element={<SlotSchedulerPage />} />
            
            {/* OAuth Success Route */}
            <Route path="/oauth-success" element={<OAuthSuccessPage />} />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
