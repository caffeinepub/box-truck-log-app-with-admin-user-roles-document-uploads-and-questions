import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from "@tanstack/react-router";
import { ThemeProvider } from "next-themes";
import { useRef } from "react";
import AppHeader from "./components/header/AppHeader";
import { LocalAuthProvider, useLocalAuth } from "./hooks/useLocalAuth";
import AdminLoginPage, { isAdminSessionActive } from "./pages/AdminLoginPage";
import PublicChecklistPage from "./pages/PublicChecklistPage";
import AdminDashboardLayout from "./pages/admin/AdminDashboardLayout";
import AllChecklistsPage from "./pages/admin/AllChecklistsPage";

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
  path: "/",
  component: PublicChecklistPage,
});

// Admin login route
const adminLoginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/login",
  component: AdminLoginPage,
});

// Admin routes (require password session)
const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboardLayout,
  beforeLoad: () => {
    if (!isAdminSessionActive()) {
      throw redirect({ to: "/admin/login" });
    }
  },
});

const adminChecklistsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: "/checklists",
  component: AllChecklistsPage,
});

const routeTree = rootRoute.addChildren([
  publicChecklistRoute,
  adminLoginRoute,
  adminRoute.addChildren([adminChecklistsRoute]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

function AppContent() {
  const { isInitializing } = useLocalAuth();
  const routerRef = useRef(router);

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
