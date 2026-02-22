import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { LocalAuthProvider, useLocalAuth } from './hooks/useLocalAuth';
import { useIsCallerAdmin } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useRef, useEffect } from 'react';
import AppHeader from './components/header/AppHeader';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import AllChecklistsPage from './pages/admin/AllChecklistsPage';
import PublicChecklistPage from './pages/PublicChecklistPage';
import AdminLoginPage from './pages/AdminLoginPage';

const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

// Public checklist route (no authentication required)
const publicChecklistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: PublicChecklistPage,
});

// Admin login route
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin/login',
  component: AdminLoginPage,
});

// Admin routes (require authentication)
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardLayout,
  beforeLoad: ({ context }: any) => {
    if (!context.isAuthenticated || !context.isAdmin) {
      throw redirect({ to: '/admin/login' });
    }
  },
});

const adminChecklistsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/checklists',
  component: AllChecklistsPage,
});

const routeTree = rootRoute.addChildren([
  publicChecklistRoute,
  adminLoginRoute,
  adminRoute.addChildren([adminChecklistsRoute]),
]);

function AppContent() {
  const { isAuthenticated, isInitializing } = useLocalAuth();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  // Create router once and store in ref
  const routerRef = useRef<ReturnType<typeof createRouter> | null>(null);

  if (!routerRef.current) {
    routerRef.current = createRouter({
      routeTree,
      context: {
        isAuthenticated: false,
        isAdmin: false,
      },
      defaultPreload: 'intent',
    });
  }

  // Update router context when auth state changes without recreating the router
  useEffect(() => {
    if (routerRef.current) {
      routerRef.current.update({
        context: {
          isAuthenticated,
          isAdmin: isAdmin || false,
        },
      });
    }
  }, [isAuthenticated, isAdmin]);

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <RouterProvider router={routerRef.current} />
      <Toaster />
    </>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <LocalAuthProvider>
        <AppContent />
      </LocalAuthProvider>
    </ThemeProvider>
  );
}

export default App;
