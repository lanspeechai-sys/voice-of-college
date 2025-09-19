import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import ErrorBoundary from "./components/ErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import LoadingSpinner from "./components/LoadingSpinner";

// Lazy load components for better performance
const Index = lazy(() => import("./pages/Index"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Auth = lazy(() => import("./pages/Auth"));
const EssayBuilder = lazy(() => import("./pages/EssayBuilder"));
const EssayResult = lazy(() => import("./pages/EssayResult"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const HumanReview = lazy(() => import("./pages/HumanReview"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Refunds = lazy(() => import("./pages/Refunds"));
const AcademicIntegrity = lazy(() => import("./pages/AcademicIntegrity"));
const ReviewerDashboard = lazy(() => import("./pages/ReviewerDashboard"));
const SubscriptionManagement = lazy(() => import("./pages/SubscriptionManagement"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Optimized query client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <LoadingSpinner size="lg" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ErrorBoundary>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refunds" element={<Refunds />} />
              <Route path="/academic-integrity" element={<AcademicIntegrity />} />
              <Route path="/essay-builder" element={
                <ProtectedRoute>
                  <EssayBuilder />
                </ProtectedRoute>
              } />
              <Route path="/essay-result" element={
                <ProtectedRoute>
                  <EssayResult />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/human-review" element={
                <ProtectedRoute>
                  <HumanReview />
                </ProtectedRoute>
              } />
              <Route path="/reviewer-dashboard" element={
                <ProtectedRoute>
                  <ReviewerDashboard />
                </ProtectedRoute>
              } />
              <Route path="/subscription-management" element={
                <ProtectedRoute>
                  <SubscriptionManagement />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </ErrorBoundary>
  </QueryClientProvider>
);

export default App;
