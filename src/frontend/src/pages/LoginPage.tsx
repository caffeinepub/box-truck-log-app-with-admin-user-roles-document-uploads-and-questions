import { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin } from '../hooks/useQueries';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, FileText, HelpCircle, Upload } from 'lucide-react';

export default function LoginPage() {
  const { identity, login, isLoggingIn } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const navigate = useNavigate();

  useEffect(() => {
    if (identity && !adminLoading) {
      if (isAdmin) {
        navigate({ to: '/admin/logs' });
      } else {
        navigate({ to: '/user/logs' });
      }
    }
  }, [identity, isAdmin, adminLoading, navigate]);

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <img src="/assets/generated/truck-logo.dim_512x512.png" alt="Truck Logo" className="w-24 h-24" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">Box Truck Log</h1>
          <p className="text-xl text-muted-foreground">Professional Fleet Management System</p>
        </div>

        <Card className="border-2">
          <CardHeader className="text-center">
            <CardTitle>Welcome</CardTitle>
            <CardDescription>Sign in to access your truck logs, documents, and more</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <FileText className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Truck Logs</h3>
                <p className="text-sm text-muted-foreground">Track daily operations and mileage</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <Upload className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Documents</h3>
                <p className="text-sm text-muted-foreground">Upload and manage files</p>
              </div>
              <div className="flex flex-col items-center text-center p-4 rounded-lg bg-muted/50">
                <HelpCircle className="w-8 h-8 mb-2 text-primary" />
                <h3 className="font-semibold mb-1">Questions</h3>
                <p className="text-sm text-muted-foreground">Get support from admins</p>
              </div>
            </div>

            <Button onClick={login} disabled={isLoggingIn} size="lg" className="w-full">
              {isLoggingIn ? 'Signing in...' : 'Sign In with Internet Identity'}
            </Button>
          </CardContent>
        </Card>

        <footer className="text-center text-sm text-muted-foreground">
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
          <p className="mt-1">© {new Date().getFullYear()} Box Truck Log. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
