import { Button } from '@/components/common';
import { LogOut, Users } from 'lucide-react';

interface HeaderProps {
  userName?: string;
  userRole?: 'admin' | 'user';
  onLogout: () => void;
  onViewRequests?: () => void;
}

export const Header = ({ userName, userRole, onLogout, onViewRequests }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card">
      <div className="container py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-4">
            <img src="/pillars-logo.png" alt="Pillars" className="h-10" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">Events Calendar</h1>
              <p className="text-sm text-muted-foreground">Pillars MSO + Health and Wellness Center</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {userName && (
              <span className="text-sm text-muted-foreground text-center sm:text-left">{userName}</span>
            )}
            {userRole === 'admin' && onViewRequests && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onViewRequests}
                className="w-full sm:w-auto"
              >
                <Users className="h-4 w-4 mr-2" />
                View Requests
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onLogout} className="w-full sm:w-auto">
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

