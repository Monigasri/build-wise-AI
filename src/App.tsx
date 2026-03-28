import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
import Dashboard from "./pages/Dashboard";
import Planner from "./pages/Planner";
import RiskAnalysis from "./pages/RiskAnalysis";
import CostAnalysis from "./pages/CostAnalysis";
import ProgressTracker from "./pages/ProgressTracker";
import AIAssistant from "./pages/AIAssistant";
import Alerts from "./pages/Alerts";
import Documentation from "./pages/Documentation";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/risks" element={<RiskAnalysis />} />
            <Route path="/costs" element={<CostAnalysis />} />
            <Route path="/progress" element={<ProgressTracker />} />
            <Route path="/assistant" element={<AIAssistant />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/docs" element={<Documentation />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
