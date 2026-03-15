# Berks Bus Service – Pre-Trip Checklist App

## Current State
- Public checklist page with 9 sections, Driver Information (name, signature, role), progress saving, and submission
- Admin dashboard with password "Berksbus", showing all submissions with PDF download and delete
- Submissions stored in localStorage with: id, driverName, signature, role, sections, timestamp, totalItems, checkedCount

## Requested Changes (Diff)

### Add
- `timeIn` and `timeOut` optional fields (ISO string) to `ChecklistSubmissionRecord`
- Time In / Time Out buttons in the Driver Information card on `PublicChecklistPage`
  - Tapping "Clock In" records current timestamp automatically
  - Tapping "Clock Out" records current timestamp automatically
  - Recorded times displayed next to each button
  - Times are persisted with localStorage progress
- Shift time columns (Time In / Time Out) in the admin `AllChecklistsPage` table
- Shift times shown in the submission detail dialog
- Shift times included in PDF export (driver info grid)

### Modify
- `ChecklistSubmissionRecord` type: add optional `timeIn?: string` and `timeOut?: string`
- `PublicChecklistPage`: add shift time state, Clock In/Out UI, persist in progress, include in submission record
- `AllChecklistsPage`: add Time In / Time Out columns to table and detail dialog
- `pdfExport.ts`: add shift times to driver info grid in PDF

### Remove
- Nothing removed

## Implementation Plan
1. Update `ChecklistSubmissionRecord` type with `timeIn?` and `timeOut?` fields
2. Add shift time state and Clock In/Out buttons to `PublicChecklistPage` Driver Information card
3. Include timeIn/timeOut in progress save/restore and final submission record
4. Update `AllChecklistsPage` table to show Time In / Time Out columns
5. Update submission detail dialog to include shift times
6. Update `pdfExport.ts` to include shift times in driver info grid
