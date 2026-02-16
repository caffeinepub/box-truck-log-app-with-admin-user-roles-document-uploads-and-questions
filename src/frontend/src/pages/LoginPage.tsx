import { useState, useEffect } from 'react';
import { useLocalAuth } from '../hooks/useLocalAuth';
import { useRegisterUser, useIsCallerAdmin } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText, HelpCircle, Upload, ClipboardCheck, Truck } from 'lucide-react';

export default function LoginPage() {
  const { isAuthenticated, login } = useLocalAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const registerUser = useRegisterUser();
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !adminLoading) {
      if (isAdmin) {
        navigate({ to: '/admin/logs' });
      } else {
        navigate({ to: '/user/logs' });
      }
    }
  }, [isAuthenticated, isAdmin, adminLoading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Create local identity and login
      await login(displayName.trim());
      
      // Register with backend
      await registerUser.mutateAsync(displayName.trim());
    } catch (error) {
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-6xl space-y-8">
        <div className="text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">Berks Bus Service</h1>
          <p className="text-2xl text-muted-foreground">Professional Fleet Management</p>
          
          <div className="relative w-full max-w-4xl mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-primary/20">
            {!imageError ? (
              <img 
                src="/assets/generated/truck-sketch-boxes-hero.dim_1600x900.png" 
                alt="Box truck with cargo" 
                className="w-full h-auto"
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Truck className="w-24 h-24 mx-auto text-primary/40" />
                  <p className="text-muted-foreground">Fleet Management System</p>
                </div>
              </div>
            )}
          </div>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Streamline your daily operations with our comprehensive fleet management system. 
            Track logs, manage documents, complete pre-trip checklists, and get support—all in one place.
          </p>
        </div>

        <Card className="max-w-md mx-auto border-2">
          <CardHeader className="text-center">
            <CardTitle>Sign In / Create Account</CardTitle>
            <CardDescription>Enter your name to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="displayName">Your Name</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Enter your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
              <Button type="submit" className="w-full" disabled={isSubmitting || !displayName.trim()}>
                {isSubmitting ? 'Signing in...' : 'Continue'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>What You Can Do</CardTitle>
            <CardDescription>Everything you need for safe and efficient fleet operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <ClipboardCheck className="w-10 h-10 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Pre-Trip Checklists</h3>
                <p className="text-sm text-muted-foreground">Complete vehicle inspections before every trip</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <FileText className="w-10 h-10 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Vehicle Logs</h3>
                <p className="text-sm text-muted-foreground">Track daily operations and mileage</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <Upload className="w-10 h-10 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Documents</h3>
                <p className="text-sm text-muted-foreground">Upload and manage important files</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <HelpCircle className="w-10 h-10 mb-3 text-primary" />
                <h3 className="font-semibold mb-1">Support</h3>
                <p className="text-sm text-muted-foreground">Get help from management</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground space-y-2">
          <p>
            Built with ❤️ using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
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
