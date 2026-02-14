import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { FileText, Upload, HelpCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function UserDashboardLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  useEffect(() => {
    if (currentPath === '/user') {
      navigate({ to: '/user/logs' });
    }
  }, [currentPath, navigate]);

  const navItems = [
    { path: '/user/logs', label: 'My Logs', icon: FileText },
    { path: '/user/documents', label: 'My Documents', icon: Upload },
    { path: '/user/questions', label: 'My Questions', icon: HelpCircle },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">User Dashboard</h2>
        <p className="text-muted-foreground">Manage your truck logs, documents, and questions</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6 border-b border-border pb-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <Button
              key={item.path}
              onClick={() => navigate({ to: item.path })}
              variant={isActive ? 'default' : 'outline'}
              size="sm"
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
}
