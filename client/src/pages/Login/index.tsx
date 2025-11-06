import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/common';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import './Login.css';

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const ok = await login(email, password);
      if (ok) {
        toast.success('Login successful!');
        // Wait for React state to update before navigating
        // This ensures user context is fully set before Dashboard checks it
        await new Promise(resolve => setTimeout(resolve, 100));
        setLocation('/permissions');
      } else {
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = () => {
    toast.info('Please contact your administrator to request event posting access.');
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <CardHeader className="login-header">
          <div className="login-logo">
            <img src="/pillars-logo.png" alt="Pillars" className="h-16" />
          </div>
          <CardTitle className="login-title">Sign In</CardTitle>
          <CardDescription>
            Access the Pillars Events Calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-field">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="form-field">
              <Label htmlFor="password">Password</Label>
              <div className="password-input">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <div className="login-footer">
            <button
              type="button"
              onClick={() => setLocation('/register')}
              className="register-link"
            >
              Don't have an account? Create one
            </button>
            {/* <button
              type="button"
              onClick={handleRequestAccess}
              className="request-access-link"
            >
              Request Event Posting Access
            </button> */}
            <p className="login-note">
              Only verified Pillars members may post events.
            </p>
          </div>
          {/* <div className="demo-credentials">
            <p className="demo-title">Demo Credentials:</p>
            <div className="demo-list">
              <p><strong>Admin:</strong> admin@pillars.care / admin123</p>
              <p><strong>User (no access):</strong> user@pillars.care / user123</p>
              <p><strong>Doctor:</strong> doctor@pillars.care / doctor123</p>
            </div>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

