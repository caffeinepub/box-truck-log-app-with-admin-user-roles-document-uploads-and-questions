# Berks Bus Service – Pre-Trip Checklist App

## Current State
- Public checklist page (no login required): drivers enter name + signature, check all 9 sections, submit. Progress saved in localStorage.
- Admin section: password-protected ("Berksbus"), accessible via `/admin/login`. Admin dashboard shows stats (total checklists, unique drivers, completion rate) and a table of all submissions with view/delete actions.
- Submissions stored in localStorage under `berks_bus_checklist_submissions`.
- `ChecklistSubmissionRecord` interface has: id, driverName, signature, sections, timestamp, totalItems, checkedCount.

## Requested Changes (Diff)

### Add
- **Driver Role selection**: On the public checklist page, before the checklist sections, add a "Driver Role" field where the user selects either "Driver" or "Helper" (radio buttons or segmented toggle). This selection is required before submission.
- **Role stored in submission**: `ChecklistSubmissionRecord` gains a new `role: "Driver" | "Helper"` field. Saved to localStorage with each submission.
- **Role shown in admin table**: Admin `AllChecklistsPage` table adds a "Role" column showing the driver's selected role (Driver/Helper) as a badge.
- **Role shown in submission detail dialog**: The detail dialog in admin shows the role field alongside driver name and signature.
- **PDF download in admin**: Add a "Download PDF" button in the admin `AllChecklistsPage`. Clicking it generates and downloads a PDF of all (or filtered) submissions. Each submission in the PDF includes: driver name, role, submission date/time, completion status, and the full checklist with checked/unchecked items per section.
- **PDF per-submission**: Also add a small "PDF" icon button per row in the admin table to download a PDF for just that individual submission.

### Modify
- `ChecklistSubmissionRecord` interface: add `role: "Driver" | "Helper"`.
- `PublicChecklistPage`: add role selection UI; pass role into the submission record; validate role is selected before submit.
- `AllChecklistsPage`: add Role column to table; add bulk "Download PDF" button in header; add per-row PDF download button; show role in detail dialog.
- localStorage save/load: role field included automatically since it's part of the record object.

### Remove
- Nothing removed.

## Implementation Plan
1. Add `jsPDF` and `jspdf-autotable` (or `@react-pdf/renderer` / pure `jsPDF`) npm dependency for PDF generation — use `jspdf` + `jspdf-autotable` (already common in similar stacks).
2. Update `ChecklistSubmissionRecord` interface in `PublicChecklistPage.tsx` to add `role: "Driver" | "Helper"`.
3. Add role radio/toggle UI to `PublicChecklistPage` in the Driver Information card, above the submit button validation.
4. Include `role` in the submission record object when saving.
5. Update `AllChecklistsPage.tsx`:
   - Add Role column to table header and rows (badge).
   - Add role field to detail dialog.
   - Add per-row PDF download button.
   - Add bulk "Download All as PDF" button in card header.
6. Implement PDF generation utility: `generateChecklistPDF(submissions)` and `generateSingleChecklistPDF(submission)` using jsPDF.
