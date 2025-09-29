import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "./lib/auth";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Login from "@/pages/Login";
import Projects from "@/pages/Projects";
import Clients from "@/pages/Clients";
import Services from "@/pages/Services";
import CategoryApp from "@/pages/CategoryApp";
import Calculators from "@/pages/Calculators";
import Documents from "@/pages/Documents";
import DashboardAgent from "@/pages/DashboardAgent";
import UnifiedDashboard from "@/pages/UnifiedDashboard";
import DeliverableProcess from "@/pages/DeliverableProcess";
import DeliverablePreview from "@/pages/DeliverablePreview";

// ✅ AJOUT - Import nouvelle page Orchestrateur
import MCPOrchestrator from "@/pages/MCPOrchestrator";


import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/projects" component={Projects} />
        <Route path="/clients" component={Clients} />
        <Route path="/services" component={Services} />
        <Route path="/category/:categoryId" component={CategoryApp} />
        <Route path="/deliverable-process/:id" component={DeliverableProcess} />
        <Route path="/deliverable-preview/:id" component={DeliverablePreview} />
        <Route path="/calculators" component={Calculators} />
        <Route path="/documents" component={Documents} />

        {/* ✅ AJOUT - Routes Orchestrateur MCP */}
        <Route path="/orchestrateur" component={MCPOrchestrator} />
        <Route path="/mcp-orchestrator" component={MCPOrchestrator} />
        <Route path="/orchestration" component={MCPOrchestrator} />
        
        {/* ✅ AJOUT - Route alias pour historique MCP */}
        <Route path="/mcp/history" component={MCPOrchestrator} />


        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
