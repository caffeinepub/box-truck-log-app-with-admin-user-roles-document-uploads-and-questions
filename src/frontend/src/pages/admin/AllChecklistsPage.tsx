import { useState, useMemo } from 'react';
import { useGetAllSavedChecklists, useGetChecklistConfig, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, ClipboardCheck } from 'lucide-react';
import ChecklistDetails from '../../components/checklists/ChecklistDetails';
import type { SavedChecklist } from '../../backend';
import { Principal } from '@dfinity/principal';

export default function AllChecklistsPage() {
  const { data: allChecklists = [], isLoading } = useGetAllSavedChecklists();
  const { data: config } = useGetChecklistConfig();
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [viewingChecklist, setViewingChecklist] = useState<{ checklist: SavedChecklist; owner: Principal } | null>(null);

  const flatChecklists = useMemo(() => {
    return allChecklists.flatMap(([principal, checklists]) =>
      checklists.map((checklist) => ({ checklist, owner: principal }))
    );
  }, [allChecklists]);

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(allChecklists.map(([principal]) => principal.toString())));
  }, [allChecklists]);

  const filteredChecklists = useMemo(() => {
    if (selectedUser === 'all') return flatChecklists;
    return flatChecklists.filter(({ owner }) => owner.toString() === selectedUser);
  }, [flatChecklists, selectedUser]);

  const sortedChecklists = [...filteredChecklists].sort(
    (a, b) => Number(b.checklist.timestamp - a.checklist.timestamp)
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading checklists...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">All Pre-Trip Checklists</h3>
          <p className="text-sm text-muted-foreground">View all users' completed inspections</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Completed Checklists ({sortedChecklists.length})</CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filter by user:</span>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All users</SelectItem>
                  {uniqueUsers.map((user) => (
                    <SelectItem key={user} value={user}>
                      {user.slice(0, 8)}...{user.slice(-6)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedChecklists.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardCheck className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No checklists found</h3>
              <p className="text-muted-foreground">
                {selectedUser === 'all' ? 'No checklists have been completed yet' : 'This user has not completed any checklists'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Driver Name</TableHead>
                    <TableHead>User Principal</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Items Checked</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedChecklists.map(({ checklist, owner }, index) => {
                    const checkedCount = checklist.checked.filter(([_, checked]) => checked).length;
                    return (
                      <ChecklistRow
                        key={`${owner.toString()}-${index}`}
                        checklist={checklist}
                        owner={owner}
                        checkedCount={checkedCount}
                        totalItems={checklist.items.length}
                        onView={() => setViewingChecklist({ checklist, owner })}
                      />
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!viewingChecklist} onOpenChange={(open) => !open && setViewingChecklist(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Checklist Details</DialogTitle>
          </DialogHeader>
          {viewingChecklist && config && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Principal ID</p>
                      <p className="font-mono text-sm">{viewingChecklist.owner.toString()}</p>
                    </div>
                    <UserDisplayName principal={viewingChecklist.owner} />
                  </div>
                </CardContent>
              </Card>
              <ChecklistDetails checklist={viewingChecklist.checklist} categories={config.categories} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ChecklistRow({
  checklist,
  owner,
  checkedCount,
  totalItems,
  onView,
}: {
  checklist: SavedChecklist;
  owner: Principal;
  checkedCount: number;
  totalItems: number;
  onView: () => void;
}) {
  return (
    <TableRow>
      <TableCell className="whitespace-nowrap">
        {new Date(Number(checklist.timestamp) / 1000000).toLocaleString()}
      </TableCell>
      <TableCell>{checklist.driverName}</TableCell>
      <TableCell className="font-mono text-xs">
        {owner.toString().slice(0, 8)}...{owner.toString().slice(-6)}
      </TableCell>
      <TableCell>
        <UserDisplayName principal={owner} />
      </TableCell>
      <TableCell>
        {checkedCount} / {totalItems}
      </TableCell>
      <TableCell className="text-right">
        <Button variant="outline" size="sm" onClick={onView}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </Button>
      </TableCell>
    </TableRow>
  );
}

function UserDisplayName({ principal }: { principal: Principal }) {
  const { data: profile, isLoading } = useGetUserProfile(principal);

  if (isLoading) {
    return <span className="text-muted-foreground text-sm">Loading...</span>;
  }

  return <span className="text-sm">{profile?.name || 'No name set'}</span>;
}
