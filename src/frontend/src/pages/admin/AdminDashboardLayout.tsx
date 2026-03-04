import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Outlet } from "@tanstack/react-router";
import { ClipboardCheck, Users } from "lucide-react";
import { getStoredSubmissions } from "../PublicChecklistPage";

export default function AdminDashboardLayout() {
  const submissions = getStoredSubmissions();
  const totalChecklists = submissions.length;
  const uniqueDrivers = new Set(submissions.map((s) => s.driverName)).size;

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-7xl mx-auto py-8 px-4 space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage all submitted checklists — Berks Bus Service
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Checklists
              </CardTitle>
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalChecklists}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All submitted inspections
              </p>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Unique Drivers
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{uniqueDrivers}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Different driver accounts
              </p>
            </CardContent>
          </Card>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
