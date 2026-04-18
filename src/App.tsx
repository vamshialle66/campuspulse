import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import AppLayout from "./components/layout/AppLayout";
import LoginOverlay from "./components/LoginOverlay";
import RequireAuth from "./components/RequireAuth";
import RequireRole from "./components/RequireRole";

import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import FreeRooms from "./pages/FreeRooms";
import Notices from "./pages/Notices";
import Timeline from "./pages/Timeline";
import Schedule from "./pages/Schedule";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />

        <BrowserRouter>
          {/* optional logout button */}
          <LoginOverlay />

          <Routes>

            {/* 🔥 LOGIN */}
            <Route path="/login" element={<Auth />} />

            {/* 🔥 PROTECTED APP */}
            <Route
              element={
                <RequireAuth>
                  <AppLayout />
                </RequireAuth>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/classes" element={<Classes />} />
              <Route path="/rooms" element={<FreeRooms />} />
              <Route path="/notices" element={<Notices />} />
              <Route path="/timeline" element={<Timeline />} />
              <Route path="/schedule" element={<Schedule />} />

              {/* 🔥 ROLE BASED */}
              <Route
                path="/admin"
                element={
                  <RequireRole role="admin">
                    <div>Admin Panel</div>
                  </RequireRole>
                }
              />
            </Route>

            {/* 🔥 AUTO REDIRECT */}
            <Route path="*" element={<Navigate to="/login" />} />

          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;