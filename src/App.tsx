import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import ChatHistory from "./pages/ChatHistory";
import Dashboard from "./pages/Dashboard";
import Journal from "./pages/Journal";
import AIRoutine from "./pages/AIRoutine";
import RoutineHistory from "./pages/RoutineHistory";
import Inspiration from "./pages/Inspiration";
import Helpline from "./pages/Helpline";
import SettingsPage from "./pages/SettingsPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">Loading...</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = localStorage.getItem("theme");
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);
  return <>{children}</>;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeInitializer>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/" element={<PublicRoute><Index /></PublicRoute>} />
              <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              <Route path="/chat-history" element={<ProtectedRoute><ChatHistory /></ProtectedRoute>} />
              <Route path="/journal" element={<ProtectedRoute><Journal /></ProtectedRoute>} />
              <Route path="/ai-routine" element={<ProtectedRoute><AIRoutine /></ProtectedRoute>} />
              <Route path="/routine-history" element={<ProtectedRoute><RoutineHistory /></ProtectedRoute>} />
              <Route path="/inspiration" element={<ProtectedRoute><Inspiration /></ProtectedRoute>} />
              <Route path="/helpline" element={<ProtectedRoute><Helpline /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ThemeInitializer>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
