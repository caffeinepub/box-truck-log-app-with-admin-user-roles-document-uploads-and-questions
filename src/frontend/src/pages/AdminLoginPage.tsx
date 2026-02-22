import { useState, useEffect } from 'react';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useNavigate } from '@tanstack/react-router';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Truck } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const { isAuthenticated, login } = useLocalAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect to admin dashboard if already authenticated as admin
  useEffect(() => {
    if (isAuthenticated && !adminLoading && isAdmin) {
      navigate({ to: '/admin/checklists' });
    }
  }, [isAuthenticated, isAdmin, adminLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await login(displayName.trim());
      // Wait for admin check
      // Navigation will happen via useEffect when isAdmin becomes true
    } catch (error) {
      console.error('Login error:', error);
      const err = error as Error;
      toast.error(`Login failed: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // Show access denied if authenticated but not admin
  if (isAuthenticated && !adminLoading && !isAdmin) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
        <Card className="max-w-md w-full border-2 border-destructive/20">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <Shield className="w-10 h-10 text-destructive" />
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>You do not have administrator privileges.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Only authorized administrators (Brent Berkemeier and Wendell) can access the admin dashboard.
            </p>
            <Button onClick={() => navigate({ to: '/' })} className="w-full">
              Return to Checklist
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Truck className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">Berks Bus Service</h1>
          </div>
          <p className="text-xl text-muted-foreground">Administrator Login</p>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <CardTitle>Admin Access</CardTitle>
            <CardDescription>Enter your credentials to access the admin dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Administrator Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  autoFocus
                  disabled={isSubmitting}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !displayName.trim()}>
                {isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
            ← Back to Public Checklist
          </Button>
        </div>

        <footer className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                window.location.hostname
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground transition-colors"
            >
              caffeine.ai
            </a>
          </p>
          <p>© {new Date().getFullYear()} Berks Bus Service. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
