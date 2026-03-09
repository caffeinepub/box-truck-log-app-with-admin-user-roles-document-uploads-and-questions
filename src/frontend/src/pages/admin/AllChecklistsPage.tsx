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
  ClipboardList,
  Eye,
  FileDown,
  Loader2,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  generateAllChecklistsPDF,
  generateSingleChecklistPDF,
} from "../../utils/pdfExport";
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
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadingAll, setDownloadingAll] = useState(false);

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

  const handleDownloadSingle = async (
    submission: ChecklistSubmissionRecord,
  ) => {
    setDownloadingId(submission.id);
    try {
      await generateSingleChecklistPDF(submission);
      toast.success(`PDF downloaded for ${submission.driverName}`);
    } catch {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDownloadAll = async () => {
    if (filteredSubmissions.length === 0) {
      toast.error("No submissions to download");
      return;
    }
    setDownloadingAll(true);
    try {
      await generateAllChecklistsPDF(filteredSubmissions);
      toast.success(
        `PDF downloaded with ${filteredSubmissions.length} submission${filteredSubmissions.length !== 1 ? "s" : ""}`,
      );
    } catch {
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingAll(false);
    }
  };

  if (submissions.length === 0) {
    return (
      <Card
        className="border-2 shadow-md"
        data-ocid="admin.checklists.empty_state"
      >
        <CardHeader>
          <CardTitle className="font-display font-bold text-xl">
            All Submitted Checklists
          </CardTitle>
          <CardDescription>
            View and monitor all driver pre-trip inspections
          </CardDescription>
        </CardHeader>
        <CardContent className="py-16">
          <div className="text-center space-y-4">
            <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/15 to-primary/10 flex items-center justify-center">
              <ClipboardList className="w-10 h-10 text-accent" />
            </div>
            <div>
              <p className="font-display font-bold text-lg">
                No checklists submitted yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
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
      <Card className="border-2 shadow-md" data-ocid="admin.checklists.table">
        <CardHeader>
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="font-display font-bold text-xl">
                All Submitted Checklists
              </CardTitle>
              <CardDescription>
                {filteredSubmissions.length} inspection
                {filteredSubmissions.length !== 1 ? "s" : ""}
                {searchQuery && ` (filtered from ${submissions.length} total)`}
              </CardDescription>
            </div>
            <Button
              onClick={handleDownloadAll}
              disabled={downloadingAll || filteredSubmissions.length === 0}
              className="shrink-0 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:opacity-90 font-semibold shadow-md"
              data-ocid="admin.checklists.primary_button"
            >
              {downloadingAll ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 mr-2" />
                  Download All PDF
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by driver name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 border-2 focus:border-accent"
              data-ocid="admin.checklists.search_input"
            />
          </div>

          <ScrollArea className="h-[600px] pr-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-bold">Date</TableHead>
                  <TableHead className="font-bold">Driver</TableHead>
                  <TableHead className="font-bold">Role</TableHead>
                  <TableHead className="font-bold">Completion</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="text-right font-bold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubmissions.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                        className="hover:bg-secondary/30 transition-colors"
                        data-ocid={`admin.checklists.row.${index + 1}`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">
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
                            <div className="w-8 h-8 rounded-full bg-accent/15 flex items-center justify-center shrink-0">
                              <User className="w-4 h-4 text-accent" />
                            </div>
                            <div>
                              <div className="font-semibold text-sm">
                                {submission.driverName}
                              </div>
                              <div className="text-xs text-muted-foreground italic">
                                {submission.signature}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {submission.role === "Driver" ? (
                            <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold">
                              🚛 Driver
                            </Badge>
                          ) : submission.role === "Helper" ? (
                            <Badge
                              variant="secondary"
                              className="font-semibold"
                            >
                              🤝 Helper
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-muted-foreground font-medium"
                            >
                              —
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-semibold">
                              {submission.checkedCount} /{" "}
                              {submission.totalItems}
                            </div>
                            <div className="w-24 h-2.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-accent to-chart-5 transition-all rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pct === 100 ? (
                            <Badge className="gap-1 bg-accent/15 text-accent border-accent/30 font-semibold">
                              <CheckCircle2 className="w-3 h-3" />
                              Complete
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="gap-1 font-semibold"
                            >
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
                              className="border-primary/30 text-primary hover:bg-primary/10 font-semibold"
                              data-ocid={`admin.checklists.edit_button.${index + 1}`}
                            >
                              <Eye className="w-4 h-4 mr-1.5" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadSingle(submission)}
                              disabled={downloadingId === submission.id}
                              className="border-accent/30 text-accent hover:bg-accent/10"
                              data-ocid={`admin.checklists.secondary_button.${index + 1}`}
                            >
                              {downloadingId === submission.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <FileDown className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(submission.id)}
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
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
          className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 border-primary/20"
          data-ocid="admin.checklists.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display font-bold text-xl">
              Checklist Details
            </DialogTitle>
            <DialogDescription>
              Submitted by{" "}
              <span className="font-semibold text-accent">
                {selectedSubmission?.driverName}
              </span>{" "}
              on{" "}
              {selectedSubmission && formatDate(selectedSubmission.timestamp)}{" "}
              at{" "}
              {selectedSubmission && formatTime(selectedSubmission.timestamp)}
            </DialogDescription>
          </DialogHeader>
          {selectedSubmission && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-secondary/40 p-3">
                  <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-1">
                    Driver
                  </p>
                  <p className="font-bold">{selectedSubmission.driverName}</p>
                </div>
                <div className="rounded-lg bg-secondary/40 p-3">
                  <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-1">
                    Role
                  </p>
                  <p className="font-bold">
                    {selectedSubmission.role === "Driver" ? (
                      <span className="text-primary">🚛 Driver</span>
                    ) : selectedSubmission.role === "Helper" ? (
                      <span className="text-muted-foreground">🤝 Helper</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/40 p-3 col-span-2">
                  <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-1">
                    Signature
                  </p>
                  <p className="italic">{selectedSubmission.signature}</p>
                </div>
                <div className="rounded-lg bg-accent/10 p-3 col-span-2">
                  <p className="font-semibold text-muted-foreground text-xs uppercase tracking-wide mb-1">
                    Items Checked
                  </p>
                  <p className="font-bold text-accent text-lg">
                    {selectedSubmission.checkedCount} /{" "}
                    {selectedSubmission.totalItems}{" "}
                    <span className="text-sm text-muted-foreground font-normal">
                      (
                      {selectedSubmission.totalItems > 0
                        ? Math.round(
                            (selectedSubmission.checkedCount /
                              selectedSubmission.totalItems) *
                              100,
                          )
                        : 0}
                      % complete)
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadSingle(selectedSubmission)}
                  disabled={downloadingId === selectedSubmission.id}
                  className="border-accent/30 text-accent hover:bg-accent/10 font-semibold"
                  data-ocid="admin.checklists.save_button"
                >
                  {downloadingId === selectedSubmission.id ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-3">
                {selectedSubmission.sections.map((section) => (
                  <div key={section.title} className="border-2 rounded-xl p-4">
                    <h4 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
                      <span className="text-lg">{section.emoji}</span>
                      {section.title}
                    </h4>
                    <div className="space-y-1.5">
                      {section.items.map((item) => (
                        <div
                          key={item.id}
                          className={`flex items-center gap-2.5 text-sm p-2 rounded-lg ${item.checked ? "bg-accent/8" : "bg-muted/30"}`}
                        >
                          {item.checked ? (
                            <CheckCircle2 className="w-4 h-4 text-accent shrink-0" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground shrink-0" />
                          )}
                          <span
                            className={
                              item.checked
                                ? "font-medium"
                                : "text-muted-foreground line-through"
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
