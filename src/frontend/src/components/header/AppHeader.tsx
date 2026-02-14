import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from '../../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, LogOut, LogIn } from 'lucide-react';
import { useNavigate, useRouterState } from '@tanstack/react-router';

export default function AppHeader() {
  const { identity, login, clear, isLoggingIn } = useInternetIdentity();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: isAdmin } = useIsCallerAdmin();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routerState = useRouterState();

  const isAuthenticated = !!identity;

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
      navigate({ to: '/' });
    } else {
      try {
        await login();
      } catch (error: any) {
        console.error('Login error:', error);
        if (error.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  const handleLogoClick = () => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate({ to: '/admin/logs' });
      } else {
        navigate({ to: '/user/logs' });
      }
    } else {
      navigate({ to: '/' });
    }
  };

  return (
    <header className="border-b border-border bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button onClick={handleLogoClick} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/assets/generated/truck-logo.dim_512x512.png" alt="Truck Logo" className="w-10 h-10" />
            <div className="flex flex-col items-start">
              <h1 className="text-xl font-bold text-foreground">Box Truck Log</h1>
              <p className="text-xs text-muted-foreground">28ft Fleet Management</p>
            </div>
          </button>

          <div className="flex items-center gap-4">
            {isAuthenticated && userProfile && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {userProfile.name}
                </span>
                {isAdmin && (
                  <Badge variant="default" className="bg-primary text-primary-foreground">
                    Admin
                  </Badge>
                )}
              </div>
            )}
            <Button
              onClick={handleAuth}
              disabled={isLoggingIn}
              variant={isAuthenticated ? 'outline' : 'default'}
              size="sm"
            >
              {isLoggingIn ? (
                'Logging in...'
              ) : isAuthenticated ? (
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Login
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
