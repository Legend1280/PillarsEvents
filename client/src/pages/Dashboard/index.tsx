import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle2, Lock } from 'lucide-react';
import RequestAccessModal from '@/components/RequestAccessModal';
import './Dashboard.css';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user, requestAccess, initializing } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalStatus, setModalStatus] = useState<'success' | 'error' | 'auth-error' | null>(null);
  const [modalMessage, setModalMessage] = useState<string>('');

  useEffect(() => {
    // Only redirect if initialization is complete AND user is still null
    // Add a small delay to ensure state has settled
    if (!initializing && !user) {
      const timer = setTimeout(() => {
        if (!user) {
          setLocation('/');
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [user, initializing, setLocation]);

  // Show nothing while initializing
  if (initializing) return null;
  
  // If still no user after initialization, show nothing (redirect will happen)
  if (!user) return null;

  const handleContinue = () => {
    setLocation('/calendar');
  };

  const handleRequestAccess = async () => {
    const result = await requestAccess();
    setModalStatus(result.type || null);
    setModalMessage(result.message || '');
    setModalOpen(true);
  };

  return (
    <div className="dashboard-container">
      <Card className="dashboard-card">
        <CardHeader className="dashboard-header">
          <div className="dashboard-logo">
            <img src="/pillars-logo.png" alt="Pillars" className="h-16" />
          </div>
          <CardTitle className="dashboard-title">Welcome, {user.name}!</CardTitle>
          <CardDescription>Your account permissions</CardDescription>
        </CardHeader>
        <CardContent className="dashboard-content">
          <div className="permissions-list">
            <div className="permission-item">
              {user.hasPostingAccess ? (
                <>
                  <CheckCircle2 className="permission-icon permission-granted" />
                  <div className="permission-details">
                    <h3 className="permission-title">Event Posting Access</h3>
                    <p className="permission-description">
                      You have permission to create and publish events on the calendar.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Lock className="permission-icon permission-denied" />
                  <div className="permission-details">
                    <h3 className="permission-title">Event Posting Access</h3>
                    <p className="permission-description">
                      You currently do not have permission to post events. You can view the calendar and request access from an administrator.
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="permission-item">
              <CheckCircle2 className="permission-icon permission-granted" />
              <div className="permission-details">
                <h3 className="permission-title">Calendar View Access</h3>
                <p className="permission-description">
                  You can view all published events and filter by department.
                </p>
              </div>
            </div>
          </div>

          <div className="dashboard-actions">
            <Button onClick={handleContinue} className="w-full" size="lg">
              Continue to Calendar
            </Button>
            {!user.hasPostingAccess && (
              <Button
                onClick={handleRequestAccess}
                variant="outline"
                className="w-full"
              >
                Request Access from Admin
              </Button>
            )}
          </div>

          <div className="dashboard-footer">
            <p className="footer-text">
              Need help? Contact your system administrator or visit the Pillars support portal.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Request Access Modal */}
      <RequestAccessModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        status={modalStatus}
        message={modalMessage}
      />
    </div>
  );
}

