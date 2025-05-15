import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Switch, Route, useLocation } from "wouter";
import { ThemeProvider } from "@/components/ThemeProvider";
import { queryClient } from "./lib/queryClient";
import { Suspense, lazy, useEffect } from "react";
import Login from "@/pages/Login";
import NotFound from "@/pages/not-found";
import Sidebar from "@/components/layout/Sidebar";
import Footer from "@/components/Footer";
import { AuthProvider, useAuth } from "@/context/AuthContext"; // ✅ NEW

// Lazy load pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Transcribe = lazy(() => import("@/pages/Transcribe"));
const Translate = lazy(() => import("@/pages/Translate"));
const TextToSpeech = lazy(() => import("@/pages/TextToSpeech"));
const SpeechToSpeech = lazy(() => import("@/pages/SpeechToSpeech"));
const History = lazy(() => import("@/pages/History"));
const LandingPage = lazy(() => import("@/pages/LandingPage"));
const RealtimeTranscribe = lazy(() => import("@/pages/RealtimeTranscribe"));
const ProfileSettings = lazy(() => import("@/pages/ProfileSettings"));
const About = lazy(() => import("@/pages/About"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));

const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-full">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);

function Router() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const isProtectedRoute = 
      location !== "/" &&
      location !== "/login" &&
      location !== "/about" &&
      !location.startsWith("/public");

    if (!loading && !user && isProtectedRoute) {
      setLocation("/login");
    }

    if (!loading && user && location === "/login") {
      setLocation("/dashboard");
    }
  }, [user, loading, location, setLocation]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/">
        <LandingPage />
      </Route>

      <Route path="/login">
        <Login />
      </Route>

      <Route path="/about">
        <Suspense fallback={<LoadingSpinner />}>
          <About />
        </Suspense>
      </Route>

      {/* Protected routes */}
      <Route path="/dashboard">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Dashboard />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/transcribe">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Transcribe />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/realtime-transcribe">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <RealtimeTranscribe />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/translate">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <Translate />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/text-to-speech">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <TextToSpeech />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/speech-to-speech">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <SpeechToSpeech />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/history">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <History />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      <Route path="/profile-settings">
        {user ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <ProfileSettings />
            </Suspense>
          </AppLayout>
        ) : (
          <Login />
        )}
      </Route>

      {/* Admin routes - accessible only to users with 'admin' role */}
      <Route path="/admin/dashboard">
        {user && user.role === 'admin' ? (
          <AppLayout>
            <Suspense fallback={<LoadingSpinner />}>
              <AdminDashboard />
            </Suspense>
          </AppLayout>
        ) : (
          <NotFound />
        )}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Sidebar />
      <main className="md:ml-64 flex-grow pt-4 px-4 pb-4 overflow-auto">
        <div className="max-w-6xl mx-auto w-full">
          {children}
        </div>
      </main>
      <div className="md:ml-64">
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <AuthProvider> {/* ✅ Wrap everything in the AuthProvider */}
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
