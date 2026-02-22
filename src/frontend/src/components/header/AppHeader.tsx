import { useLocalAuth } from '../../hooks/useLocalAuth';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Truck, LogOut, Shield } from 'lucide-react';

export default function AppHeader() {
  const { isAuthenticated, logout } = useLocalAuth();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isAdminRoute = routerState.location.pathname.startsWith('/admin');

  const handleLogout = async () => {
    await logout();
    navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <button
          onClick={() => navigate({ to: '/' })}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <img
            src="/assets/generated/truck-logo.dim_512x512.png"
            alt="Berks Bus Service"
            className="h-10 w-10"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <Truck className="h-10 w-10 text-primary hidden" />
          <div className="flex flex-col items-start">
            <span className="font-bold text-lg leading-tight">Berks Bus Service</span>
            <span className="text-xs text-muted-foreground">Fleet Management</span>
          </div>
        </button>

        <div className="flex items-center gap-4">
          {isAdminRoute && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Admin</span>
            </div>
          )}
          
          {isAuthenticated && (
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Sign Out</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
