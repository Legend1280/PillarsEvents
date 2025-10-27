import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import { EventsProvider } from "./contexts/EventsContext";
import Login from "./pages/Login";
import Permissions from "./pages/Permissions";
import Calendar from "./pages/Calendar";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Login} />
      <Route path={"/permissions"} component={Permissions} />
      <Route path={"/calendar"} component={Calendar} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <EventsProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </EventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

