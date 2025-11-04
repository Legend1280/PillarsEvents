import { Route, Switch } from 'wouter';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { EventsProvider } from './contexts/EventsContext';
import { Login, Register, Dashboard, Events, NotFound } from './pages';
import { ROUTES } from './routes';

function Router() {
  return (
    <Switch>
      <Route path={ROUTES.root} component={Login} />
      <Route path={ROUTES.register} component={Register} />
      <Route path={ROUTES.permissions} component={Dashboard} />
      <Route path={ROUTES.calendar} component={Events} />
      <Route path={ROUTES.notFound} component={NotFound} />
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
            <Toaster />
            <Router />
          </EventsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
