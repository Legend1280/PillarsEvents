import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Lock } from 'lucide-react';

export default function Permissions() {
  const [, setLocation] = useLocation();
  const { user, requestAccess } = useAuth();

  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user) return null;

  const handleContinue = () => {
    setLocation('/calendar');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/pillars-logo.png" alt="Pillars" className="h-16" />
          </div>
          <CardTitle className="text-2xl font-bold">Welcome, {user.name}!</CardTitle>
          <CardDescription>Your account permissions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              {user.hasPostingAccess ? (
                <>
                  <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Event Posting Access</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have permission to create and publish events on the calendar.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="h-6 w-6 text-muted-foreground flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Event Posting Access</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      You currently do not have permission to post events. You can view the calendar and request access from an administrator.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">Calendar View Access</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You can view all published events and filter by department.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continue to Calendar
            </Button>
            {!user.hasPostingAccess && (
              <Button
                onClick={requestAccess}
                variant="outline"
                className="w-full"
              >
                Request Access from Admin
              </Button>
            )}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Need help? Contact your system administrator or visit the Pillars support portal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

