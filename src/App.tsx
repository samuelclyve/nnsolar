import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WorkspaceProvider } from "@/hooks/useWorkspace";
import { AppLayout } from "@/components/AppLayout";
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
import Materials from "./pages/Materials";
import Integrations from "./pages/Integrations";
import FeatureDetail from "./pages/FeatureDetail";
import Reports from "./pages/Reports";
import Financeiro from "./pages/Financeiro";
import Subscription from "./pages/Subscription";
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
            <Route path="/blog" element={<Blog />} />
            <Route path="/materiais" element={<Materials />} />
            <Route path="/integracoes" element={<Integrations />} />
            <Route path="/funcionalidades/:slug" element={<FeatureDetail />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/s/:slug" element={<TenantSite />} />
            <Route path="/super-admin" element={<SuperAdmin />} />

            {/* Dashboard routes share AppLayout — mounts once, no white flash */}
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/crm" element={<CRM />} />
              <Route path="/installations" element={<Installations />} />
              <Route path="/clients" element={<Clients />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/documents" element={<Documents />} />
              <Route path="/site-editor" element={<SiteEditor />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/payment-history" element={<PaymentHistory />} />
              <Route path="/company-profile" element={<CompanyProfile />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/financeiro" element={<Financeiro />} />
              <Route path="/subscription" element={<Subscription />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </WorkspaceProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
