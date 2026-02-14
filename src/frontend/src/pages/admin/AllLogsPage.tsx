import { useState, useMemo } from 'react';
import { useGetAllLogEntries, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import type { Principal } from '@dfinity/principal';

export default function AllLogsPage() {
  const { data: allLogs = [], isLoading } = useGetAllLogEntries();
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const users = useMemo(() => {
    return allLogs.map(([principal]) => principal);
  }, [allLogs]);

  const filteredLogs = useMemo(() => {
    if (selectedUser === 'all') {
      return allLogs.flatMap(([principal, logs]) =>
        logs.map((log) => ({ ...log, owner: principal }))
      );
    }
    const userLogs = allLogs.find(([principal]) => principal.toString() === selectedUser);
    return userLogs ? userLogs[1].map((log) => ({ ...log, owner: userLogs[0] })) : [];
  }, [allLogs, selectedUser]);

  const sortedLogs = [...filteredLogs].sort((a, b) => Number(b.timestamp - a.timestamp));

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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold">All Truck Logs</h3>
          <p className="text-sm text-muted-foreground">View logs from all users</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Filter by user:</span>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((principal) => (
                <SelectItem key={principal.toString()} value={principal.toString()}>
                  <UserDisplay principal={principal} />
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {sortedLogs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No log entries found</h3>
            <p className="text-muted-foreground">
              {selectedUser === 'all' ? 'No users have created log entries yet' : 'This user has no log entries'}
            </p>
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
                    <TableHead>User</TableHead>
                    <TableHead>Date/Time</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Mileage</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <UserDisplay principal={log.owner} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(Number(log.timestamp) / 1000000).toLocaleString()}
                      </TableCell>
                      <TableCell>{log.title || '-'}</TableCell>
                      <TableCell className="max-w-xs truncate">{log.notes}</TableCell>
                      <TableCell>{log.mileage ? log.mileage.toString() : '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function UserDisplay({ principal }: { principal: Principal }) {
  const { data: profile } = useGetUserProfile(principal);
  return <span className="font-mono text-xs">{profile?.name || principal.toString().slice(0, 10) + '...'}</span>;
}
