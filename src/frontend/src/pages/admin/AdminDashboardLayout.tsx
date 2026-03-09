import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Outlet } from "@tanstack/react-router";
import { ClipboardCheck, TrendingUp, Users } from "lucide-react";
import { getStoredSubmissions } from "../PublicChecklistPage";

export default function AdminDashboardLayout() {
  const submissions = getStoredSubmissions();
  const totalChecklists = submissions.length;
  const uniqueDrivers = new Set(submissions.map((s) => s.driverName)).size;
  const completedCount = submissions.filter(
    (s) => s.checkedCount === s.totalItems,
  ).length;
  const completionRate =
    totalChecklists > 0
      ? Math.round((completedCount / totalChecklists) * 100)
      : 0;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-secondary/25">
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground font-medium">
            Monitor and manage all submitted checklists — Berks Bus Service
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border-2 border-l-4 border-l-accent shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Total Checklists
              </CardTitle>
              <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-accent" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-display text-4xl font-bold text-foreground">
                {totalChecklists}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                All submitted inspections
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-l-4 border-l-primary shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Unique Drivers
              </CardTitle>
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-display text-4xl font-bold text-foreground">
                {uniqueDrivers}
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Different drivers logged
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-l-4 border-l-chart-3 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Completion Rate
              </CardTitle>
              <div className="w-9 h-9 rounded-lg bg-chart-3/15 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-chart-3" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="font-display text-4xl font-bold text-foreground">
                {completionRate}%
              </div>
              <p className="text-xs text-muted-foreground mt-1 font-medium">
                Fully completed checklists
              </p>
            </CardContent>
          </Card>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
