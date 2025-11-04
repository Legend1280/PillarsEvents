import { Button, Card, CardContent } from '@/components/common';
import { AlertCircle, Home } from 'lucide-react';
import { useLocation } from 'wouter';
import './NotFound.css';

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation('/');
  };

  return (
    <div className="notfound-container">
      <Card className="notfound-card">
        <CardContent className="notfound-content">
          <div className="notfound-icon-wrapper">
            <div className="notfound-icon-pulse" />
            <AlertCircle className="notfound-icon" />
          </div>

          <h1 className="notfound-title">404</h1>

          <h2 className="notfound-subtitle">
            Page Not Found
          </h2>

          <p className="notfound-message">
            Sorry, the page you are looking for doesn't exist.
            <br />
            It may have been moved or deleted.
          </p>

          <div className="notfound-actions">
            <Button
              onClick={handleGoHome}
              className="notfound-button"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

