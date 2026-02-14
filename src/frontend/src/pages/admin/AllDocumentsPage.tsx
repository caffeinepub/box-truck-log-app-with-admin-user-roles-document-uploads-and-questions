import { useState, useMemo } from 'react';
import { useGetAllUploads, useGetUserProfile } from '../../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { Principal } from '@dfinity/principal';

export default function AllDocumentsPage() {
  const { data: allUploads = [], isLoading } = useGetAllUploads();
  const [selectedUser, setSelectedUser] = useState<string>('all');

  const users = useMemo(() => {
    return allUploads.map(([principal]) => principal);
  }, [allUploads]);

  const filteredUploads = useMemo(() => {
    if (selectedUser === 'all') {
      return allUploads.flatMap(([principal, uploads]) =>
        uploads.map((upload) => ({ ...upload, owner: principal }))
      );
    }
    const userUploads = allUploads.find(([principal]) => principal.toString() === selectedUser);
    return userUploads ? userUploads[1].map((upload) => ({ ...upload, owner: userUploads[0] })) : [];
  }, [allUploads, selectedUser]);

  const sortedUploads = [...filteredUploads].sort((a, b) => Number(b.timestamp - a.timestamp));

  const handleDownload = async (upload: any) => {
    try {
      const bytes = await upload.blob.getBytes();
      const blob = new Blob([bytes], { type: upload.contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = upload.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download file');
    }
  };

  const handleView = (upload: any) => {
    const url = upload.blob.getDirectURL();
    window.open(url, '_blank');
  };

  const formatFileSize = (bytes: bigint) => {
    const size = Number(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-xl font-semibold">All Documents</h3>
          <p className="text-sm text-muted-foreground">View documents from all users</p>
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

      {sortedUploads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No documents found</h3>
            <p className="text-muted-foreground">
              {selectedUser === 'all' ? 'No users have uploaded documents yet' : 'This user has no documents'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Documents ({sortedUploads.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedUploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <UserDisplay principal={upload.owner} />
                      </TableCell>
                      <TableCell className="font-medium">{upload.name}</TableCell>
                      <TableCell>{upload.contentType}</TableCell>
                      <TableCell>{formatFileSize(upload.size)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        {new Date(Number(upload.timestamp) / 1000000).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => handleView(upload)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDownload(upload)}>
                            <Download className="w-4 h-4" />
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
    </div>
  );
}

function UserDisplay({ principal }: { principal: Principal }) {
  const { data: profile } = useGetUserProfile(principal);
  return <span className="font-mono text-xs">{profile?.name || principal.toString().slice(0, 10) + '...'}</span>;
}
