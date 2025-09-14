import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { RoleProvider } from "@/hooks/use-role";
import { Sidebar } from "@/components/layout/sidebar";
import Dashboard from "@/pages/dashboard";
import FarmerRegistry from "@/pages/farmer-registry";
import LotTracking from "@/pages/lot-tracking";
import Inventory from "@/pages/inventory";
import Marketplace from "@/pages/marketplace";
import Payments from "@/pages/payments";
import SmsAlerts from "@/pages/sms-alerts";
import Cooperatives from "@/pages/cooperatives";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/cooperatives" component={Cooperatives} />
          <Route path="/farmers" component={FarmerRegistry} />
          <Route path="/lots" component={LotTracking} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/marketplace" component={Marketplace} />
          <Route path="/payments" component={Payments} />
          <Route path="/sms" component={SmsAlerts} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <Toaster />
          <Router />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
