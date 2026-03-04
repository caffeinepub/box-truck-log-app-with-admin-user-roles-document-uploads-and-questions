import { Button } from "@/components/ui/button";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Shield, Truck } from "lucide-react";
import {
  clearAdminSession,
  isAdminSessionActive,
} from "../../pages/AdminLoginPage";

export default function AppHeader() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const isAdminRoute = routerState.location.pathname.startsWith("/admin");
  const isAdminLoggedIn = isAdminSessionActive();

  const handleAdminLogout = () => {
    clearAdminSession();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          data-ocid="header.link"
        >
          <img
            src="/assets/generated/truck-logo.dim_512x512.png"
            alt="Berks Bus Service"
            className="h-10 w-10"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              (
                e.currentTarget.nextElementSibling as HTMLElement
              )?.classList.remove("hidden");
            }}
          />
          <Truck className="h-10 w-10 text-primary hidden" />
          <div className="flex flex-col items-start">
            <span className="font-bold text-lg leading-tight">
              Berks Bus Service
            </span>
            <span className="text-xs text-muted-foreground">
              Fleet Management
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {isAdminRoute && isAdminLoggedIn ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminLogout}
                data-ocid="header.secondary_button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </>
          ) : !isAdminRoute ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: "/admin/login" })}
              data-ocid="header.button"
            >
              <Shield className="w-4 h-4 mr-2" />
              <span>Admin</span>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
