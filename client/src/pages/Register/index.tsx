import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/common';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';
import './Register.css';

export default function Register() {
  const [, setLocation] = useLocation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'member' | 'doctor'>('member');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name, role }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Registration successful! Logging you in...');
        
        // Store tokens
        localStorage.setItem('token', data.token);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Navigate to permissions page
        await new Promise(resolve => setTimeout(resolve, 100));
        setLocation('/permissions');
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    setLocation('/');
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <CardHeader className="register-header">
          <div className="register-logo">
            <img src="/pillars-logo.png" alt="Pillars" className="h-16" />
          </div>
          <CardTitle className="register-title">Create Account</CardTitle>
          <CardDescription>
            Register for Pillars Events Calendar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-field">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="form-field">
              <Label htmlFor="role">Register as</Label>
              <Select value={role} onValueChange={(value) => setRole(value as 'member' | 'doctor')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member (Requires Admin Approval for Posting)</SelectItem>
                  <SelectItem value="doctor">Doctor (Posting Access Granted)</SelectItem>
                </SelectContent>
              </Select>
              <p className="role-note">
                {role === 'doctor' 
                  ? '✅ Doctors get event posting access immediately' 
                  : 'ℹ️ Members need admin approval to post events'}
              </p>
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

            <div className="form-field">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="password-input">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="password-toggle"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="register-footer">
            <button
              type="button"
              onClick={handleBackToLogin}
              className="back-to-login-link"
            >
              Already have an account? Sign In
            </button>
            <p className="register-note">
              Only verified Pillars members may register.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

