import { RouterProvider, createRouter, createRoute, createRootRoute, redirect, Outlet } from '@tanstack/react-router';
import { LocalAuthProvider, useLocalAuth } from './hooks/useLocalAuth';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import { useRef, useEffect } from 'react';
import AppHeader from './components/header/AppHeader';
import UserDashboardLayout from './pages/user/UserDashboardLayout';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import MyLogsPage from './pages/user/MyLogsPage';
import MyDocumentsPage from './pages/user/MyDocumentsPage';
import MyQuestionsPage from './pages/user/MyQuestionsPage';
import MyChecklistsPage from './pages/user/MyChecklistsPage';
import AllLogsPage from './pages/admin/AllLogsPage';
import AllDocumentsPage from './pages/admin/AllDocumentsPage';
import AllQuestionsPage from './pages/admin/AllQuestionsPage';
import AllChecklistsPage from './pages/admin/AllChecklistsPage';
import LoginPage from './pages/LoginPage';

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

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LoginPage,
});

const userRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/user',
  component: UserDashboardLayout,
  beforeLoad: ({ context }: any) => {
    if (!context.isAuthenticated) {
      throw redirect({ to: '/' });
    }
  },
});

const userLogsRoute = createRoute({
  getParentRoute: () => userRoute,
  path: '/logs',
  component: MyLogsPage,
});

const userDocumentsRoute = createRoute({
  getParentRoute: () => userRoute,
  path: '/documents',
  component: MyDocumentsPage,
});

const userQuestionsRoute = createRoute({
  getParentRoute: () => userRoute,
  path: '/questions',
  component: MyQuestionsPage,
});

const userChecklistsRoute = createRoute({
  getParentRoute: () => userRoute,
  path: '/checklists',
  component: MyChecklistsPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminDashboardLayout,
  beforeLoad: ({ context }: any) => {
    if (!context.isAuthenticated || !context.isAdmin) {
      throw redirect({ to: '/' });
    }
  },
});

const adminLogsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/logs',
  component: AllLogsPage,
});

const adminDocumentsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/documents',
  component: AllDocumentsPage,
});

const adminQuestionsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/questions',
  component: AllQuestionsPage,
});

const adminChecklistsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/checklists',
  component: AllChecklistsPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  userRoute.addChildren([userLogsRoute, userDocumentsRoute, userQuestionsRoute, userChecklistsRoute]),
  adminRoute.addChildren([adminLogsRoute, adminDocumentsRoute, adminQuestionsRoute, adminChecklistsRoute]),
]);

function AppContent() {
  const { isAuthenticated, isInitializing } = useLocalAuth();
  const { data: userProfile, isLoading: profileLoading } = useGetCallerUserProfile();
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

  if (isInitializing || (isAuthenticated && (profileLoading || adminLoading))) {
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
