import { Outlet, useNavigate, useRouterState } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { FileText, Upload, HelpCircle, ClipboardCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useGetAllLogEntries, useGetAllUploads, useGetAllQuestions, useGetAllSavedChecklists } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboardLayout() {
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const { data: allLogs = [] } = useGetAllLogEntries();
  const { data: allUploads = [] } = useGetAllUploads();
  const { data: allQuestions = [] } = useGetAllQuestions();
  const { data: allChecklists = [] } = useGetAllSavedChecklists();

  useEffect(() => {
    if (currentPath === '/admin') {
      navigate({ to: '/admin/logs' });
    }
  }, [currentPath, navigate]);

  const totalLogs = allLogs.reduce((sum, [_, logs]) => sum + logs.length, 0);
  const totalUploads = allUploads.reduce((sum, [_, uploads]) => sum + uploads.length, 0);
  const totalQuestions = allQuestions.reduce((sum, [_, questions]) => sum + questions.length, 0);
  const totalChecklists = allChecklists.reduce((sum, [_, checklists]) => sum + checklists.length, 0);
  const openQuestions = allQuestions.reduce(
    (sum, [_, questions]) => sum + questions.filter((q) => q.status === 'open').length,
    0
  );

  const navItems = [
    { path: '/admin/logs', label: 'All Logs', icon: FileText },
    { path: '/admin/documents', label: 'All Documents', icon: Upload },
    { path: '/admin/questions', label: 'All Questions', icon: HelpCircle },
    { path: '/admin/checklists', label: 'All Checklists', icon: ClipboardCheck },
  ];

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
        <p className="text-muted-foreground">Manage all users' logs, documents, questions, and checklists</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLogs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUploads}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalQuestions}</div>
            <p className="text-xs text-muted-foreground mt-1">{openQuestions} open</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Checklists</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChecklists}</div>
          </CardContent>
        </Card>
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
