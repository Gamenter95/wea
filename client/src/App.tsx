import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Register from "@/pages/Register";
import WWIDSetup from "@/pages/WWIDSetup";
import PINSetup from "@/pages/PINSetup";
import Login from "@/pages/Login";
import PINVerify from "@/pages/PINVerify";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Register} />
      <Route path="/register" component={Register} />
      <Route path="/wwid-setup" component={WWIDSetup} />
      <Route path="/pin-setup" component={PINSetup} />
      <Route path="/login" component={Login} />
      <Route path="/pin-verify" component={PINVerify} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
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
