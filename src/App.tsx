import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Signup from "./pages/Signup";
import Checkout from "./pages/Checkout";
import Dashboard from "./pages/Dashboard";
import CRM from "./pages/CRM";
import Installations from "./pages/Installations";
import Clients from "./pages/Clients";
import Schedule from "./pages/Schedule";
import Documents from "./pages/Documents";
import SiteEditor from "./pages/SiteEditor";
import UserManagement from "./pages/UserManagement";
import SuperAdmin from "./pages/SuperAdmin";
import TenantSite from "./pages/TenantSite";
import PaymentHistory from "./pages/PaymentHistory";
import CompanyProfile from "./pages/CompanyProfile";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <WorkspaceProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/crm" element={<CRM />} />
            <Route path="/installations" element={<Installations />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/site-editor" element={<SiteEditor />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/super-admin" element={<SuperAdmin />} />
            <Route path="/payment-history" element={<PaymentHistory />} />
            <Route path="/company-profile" element={<CompanyProfile />} />
            <Route path="/s/:slug" element={<TenantSite />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
