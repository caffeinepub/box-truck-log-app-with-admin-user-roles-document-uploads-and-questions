import { useState } from 'react';
import { useGetCallerLogEntries, useCreateLogEntry, useUpdateLogEntry, useDeleteLogEntry } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2, Calendar } from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import type { LogEntry } from '../../backend';

export default function MyLogsPage() {
  const { data: logs = [], isLoading } = useGetCallerLogEntries();
  const createLog = useCreateLogEntry();
  const updateLog = useUpdateLogEntry();
  const deleteLog = useDeleteLogEntry();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<LogEntry | null>(null);
  const [deletingLog, setDeletingLog] = useState<LogEntry | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    notes: '',
    mileage: '',
  });

  const resetForm = () => {
    setFormData({ title: '', notes: '', mileage: '' });
    setEditingLog(null);
  };

  const handleCreate = () => {
    setIsCreateOpen(true);
    resetForm();
  };

  const handleEdit = (log: LogEntry) => {
    setEditingLog(log);
    setFormData({
      title: log.title || '',
      notes: log.notes,
      mileage: log.mileage ? log.mileage.toString() : '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const mileage = formData.mileage ? BigInt(formData.mileage) : null;
    const title = formData.title.trim() || null;

    if (editingLog) {
      await updateLog.mutateAsync({
        logId: editingLog.id,
        title,
        notes: formData.notes,
        mileage,
      });
      setEditingLog(null);
    } else {
      await createLog.mutateAsync({
        title,
        notes: formData.notes,
        mileage,
      });
      setIsCreateOpen(false);
    }
    resetForm();
  };

  const handleDelete = async () => {
    if (deletingLog) {
      await deleteLog.mutateAsync(deletingLog.id);
      setDeletingLog(null);
    }
  };

  const sortedLogs = [...logs].sort((a, b) => Number(b.timestamp - a.timestamp));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">My Truck Logs</h3>
          <p className="text-sm text-muted-foreground">Track your daily operations and mileage</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              New Log Entry
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Log Entry</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title (Optional)</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Morning delivery run"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes *</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Describe the trip, route, or any issues..."
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (Optional)</Label>
                <Input
                  id="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="e.g., 45000"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createLog.isPending || !formData.notes.trim()}>
                  {createLog.isPending ? 'Creating...' : 'Create Log'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No log entries yet</h3>
            <p className="text-muted-foreground mb-4">Create your first log entry to get started</p>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Log
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Log Entries ({sortedLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Mileage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(Number(log.timestamp) / 1000000).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.title || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.notes}</TableCell>
                      <TableCell>{log.mileage ? log.mileage.toString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Dialog open={editingLog?.id === log.id} onOpenChange={(open) => !open && setEditingLog(null)}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" onClick={() => handleEdit(log)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Edit Log Entry</DialogTitle>
                              </DialogHeader>
                              <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-title">Title (Optional)</Label>
                                  <Input
                                    id="edit-title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g., Morning delivery run"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-notes">Notes *</Label>
                                  <Textarea
                                    id="edit-notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    placeholder="Describe the trip, route, or any issues..."
                                    required
                                    rows={4}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-mileage">Mileage (Optional)</Label>
                                  <Input
                                    id="edit-mileage"
                                    type="number"
                                    value={formData.mileage}
                                    onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                                    placeholder="e.g., 45000"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button type="submit" disabled={updateLog.isPending || !formData.notes.trim()}>
                                    {updateLog.isPending ? 'Updating...' : 'Update Log'}
                                  </Button>
                                  <Button type="button" variant="outline" onClick={() => setEditingLog(null)}>
                                    Cancel
                                  </Button>
                                </div>
                              </form>
                            </DialogContent>
                          </Dialog>
                          <Button variant="outline" size="sm" onClick={() => setDeletingLog(log)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={!!deletingLog} onOpenChange={(open) => !open && setDeletingLog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Log Entry</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this log entry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteLog.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
