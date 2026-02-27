import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Suspense, lazy, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

// Lazy loading pages
const Index = lazy(() => import("./pages/Index"));
const Deals = lazy(() => import("./pages/Deals"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Login = lazy(() => import("./pages/Login"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const PageLoader = () => (
  <div className="h-[60vh] w-full flex flex-col items-center justify-center gap-4 animate-in fade-in duration-500">
    <RefreshCw className="w-8 h-8 animate-spin text-primary/40" />
    <p className="text-sm text-muted-foreground font-medium animate-pulse italic">
      Carregando...
    </p>
  </div>
);

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />

              {/* Private Routes */}
              <Route
                path="/"
                element={session ? <Layout><Index /></Layout> : <Navigate to="/login" />}
              />
              <Route
                path="/deals"
                element={session ? <Layout><Deals /></Layout> : <Navigate to="/login" />}
              />
              <Route
                path="/expenses"
                element={session ? <Layout><Expenses /></Layout> : <Navigate to="/login" />}
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
