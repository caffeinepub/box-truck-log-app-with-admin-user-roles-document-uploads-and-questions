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
    <header className="sticky top-0 z-50 w-full bg-gradient-to-r from-primary to-primary/90 shadow-lg shadow-primary/20">
      <div className="container flex h-16 items-center justify-between px-4">
        <button
          type="button"
          onClick={() => navigate({ to: "/" })}
          className="flex items-center gap-3 hover:opacity-85 transition-opacity"
          data-ocid="header.link"
        >
          <div className="relative h-11 w-11 rounded-lg overflow-hidden bg-white/10 flex items-center justify-center shrink-0">
            <img
              src="/assets/generated/berks-bus-truck-logo-transparent.dim_512x512.png"
              alt="Berks Bus Service"
              className="h-10 w-10 object-contain"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                (
                  e.currentTarget.nextElementSibling as HTMLElement
                )?.classList.remove("hidden");
              }}
            />
            <Truck className="h-8 w-8 text-accent hidden" />
          </div>
          <div className="flex flex-col items-start">
            <span className="font-display font-bold text-xl text-primary-foreground leading-tight tracking-tight">
              Berks Bus Service
            </span>
            <span className="text-xs text-primary-foreground/65 font-medium tracking-wide uppercase">
              Fleet Management
            </span>
          </div>
        </button>

        <div className="flex items-center gap-2">
          {isAdminRoute && isAdminLoggedIn ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 text-primary-foreground text-sm font-semibold">
                <Shield className="w-4 h-4 text-accent" />
                <span className="hidden sm:inline">Admin</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAdminLogout}
                className="border-white/40 text-white hover:bg-white/15 hover:text-white bg-transparent"
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
              className="border-white/40 text-white hover:bg-white/15 hover:text-white bg-transparent font-semibold"
              data-ocid="header.button"
            >
              <Shield className="w-4 h-4 mr-2 text-accent" />
              <span>Admin</span>
            </Button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
