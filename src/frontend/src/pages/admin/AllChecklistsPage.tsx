import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  CheckCircle2,
  Eye,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  type ChecklistSubmissionRecord,
  SUBMISSIONS_KEY,
  getStoredSubmissions,
} from "../PublicChecklistPage";

export default function AllChecklistsPage() {
  const [submissions, setSubmissions] = useState<ChecklistSubmissionRecord[]>(
    () => getStoredSubmissions(),
  );
  const [selectedSubmission, setSelectedSubmission] =
    useState<ChecklistSubmissionRecord | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSubmissions = useMemo(() => {
    if (!searchQuery.trim()) return submissions;
    const q = searchQuery.toLowerCase();
    return submissions.filter((s) => s.driverName.toLowerCase().includes(q));
  }, [submissions, searchQuery]);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const formatTime = (ts: number) =>
    new Date(ts).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

  const handleDelete = (id: string) => {
    const updated = submissions.filter((s) => s.id !== id);
    setSubmissions(updated);
    localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(updated));
    if (selectedSubmission?.id === id) setSelectedSubmission(null);
    toast.success("Submission deleted");
  };

  if (submissions.length === 0) {
    return (
      <Card className="border-2" data-ocid="admin.checklists.empty_state">
        <CardHeader>
          <CardTitle>All Submitted Checklists</CardTitle>
          <CardDescription>
            View and monitor all driver pre-trip inspections
          </CardDescription>
        </CardHeader>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">No checklists submitted yet</p>
              <p className="text-sm text-muted-foreground">
                Checklists will appear here once drivers submit them
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-2" data-ocid="admin.checklists.table">
        <CardHeader>
          <CardTitle>All Submitted Checklists</CardTitle>
          <CardDescription>
            {filteredSubmissions.length} inspection
            {filteredSubmissions.length !== 1 ? "s" : ""}
            {searchQuery && ` (filtered from ${submissions.length} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by driver name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-ocid="admin.checklists.search_input"
            />
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Completion</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No checklists match your search
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSubmissions.map((submission, index) => {
                    const pct =
                      submission.totalItems > 0
                        ? Math.round(
                            (submission.checkedCount / submission.totalItems) *
                              100,
                          )
                        : 0;
                    return (
                      <TableRow
                        key={submission.id}
                        data-ocid={`admin.checklists.row.${index + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {formatDate(submission.timestamp)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatTime(submission.timestamp)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                {submission.driverName}
                              </div>
                              <div className="text-xs text-muted-foreground italic">
                                {submission.signature}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">
                              {submission.checkedCount} /{" "}
                              {submission.totalItems}
                            </div>
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pct === 100 ? (
                            <Badge variant="default" className="gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="gap-1">
                              <XCircle className="w-3 h-3" />
                              Partial
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedSubmission(submission)}
                              data-ocid={`admin.checklists.edit_button.${index + 1}`}
                            >
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(submission.id)}
                              className="text-destructive hover:text-destructive"
                              data-ocid={`admin.checklists.delete_button.${index + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      <Dialog
        open={!!selectedSubmission}
        onOpenChange={() => setSelectedSubmission(null)}
      >
        <DialogContent
          className="max-w-2xl max-h-[90vh] overflow-y-auto"
          data-ocid="admin.checklists.dialog"
        >
          <DialogHeader>
            <DialogTitle>Checklist Details</DialogTitle>
            <DialogDescription>
              Submitted by {selectedSubmission?.driverName} on{" "}
              {selectedSubmission && formatDate(selectedSubmission.timestamp)}{" "}
              at{" "}
              {selectedSubmission && formatTime(selectedSubmission.timestamp)}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-muted-foreground">Driver</p>
                  <p>{selectedSubmission.driverName}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">Signature</p>
                  <p>{selectedSubmission.signature}</p>
                </div>
                <div>
                  <p className="font-medium text-muted-foreground">
                    Items Checked
                  </p>
                  <p>
                    {selectedSubmission.checkedCount} /{" "}
                    {selectedSubmission.totalItems} (
                    {selectedSubmission.totalItems > 0
                      ? Math.round(
                          (selectedSubmission.checkedCount /
                            selectedSubmission.totalItems) *
                            100,
                        )
                      : 0}
                    %)
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedSubmission.sections.map((section) => (
                  <div key={section.title} className="border rounded-lg p-3">
                    <h4 className="font-semibold text-sm mb-2">
                      {section.emoji} {section.title}
                    </h4>
                    <div className="space-y-1">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          {item.checked ? (
                            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span
                            className={
                              item.checked ? "" : "text-muted-foreground"
                            }
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
