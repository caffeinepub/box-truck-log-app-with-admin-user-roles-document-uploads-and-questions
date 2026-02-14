import { RouterProvider, createRouter, createRoute, createRootRoute, redirect } from '@tanstack/react-router';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile, useIsCallerAdmin } from './hooks/useQueries';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from 'next-themes';
import ProfileSetupModal from './components/auth/ProfileSetupModal';
import AppHeader from './components/header/AppHeader';
import UserDashboardLayout from './pages/user/UserDashboardLayout';
import AdminDashboardLayout from './pages/admin/AdminDashboardLayout';
import MyLogsPage from './pages/user/MyLogsPage';
import MyDocumentsPage from './pages/user/MyDocumentsPage';
import MyQuestionsPage from './pages/user/MyQuestionsPage';
import AllLogsPage from './pages/admin/AllLogsPage';
import AllDocumentsPage from './pages/admin/AllDocumentsPage';
import AllQuestionsPage from './pages/admin/AllQuestionsPage';
import LoginPage from './pages/LoginPage';

const rootRoute = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        {/* Router outlet will render here */}
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

const routeTree = rootRoute.addChildren([
  loginRoute,
  userRoute.addChildren([userLogsRoute, userDocumentsRoute, userQuestionsRoute]),
  adminRoute.addChildren([adminLogsRoute, adminDocumentsRoute, adminQuestionsRoute]),
]);

function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();

  const isAuthenticated = !!identity;

  const router = createRouter({
    routeTree,
    context: {
      isAuthenticated,
      isAdmin: isAdmin || false,
    },
    defaultPreload: 'intent',
  });

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing || (isAuthenticated && (profileLoading || adminLoading))) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <RouterProvider router={router} />
      <Toaster />
      {showProfileSetup && <ProfileSetupModal />}
    </ThemeProvider>
  );
}

export default App;
