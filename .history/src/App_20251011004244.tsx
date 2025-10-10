import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/home" element={
                <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute allowedRoles={['seller']}>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['buyer', 'seller', 'admin']}>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
