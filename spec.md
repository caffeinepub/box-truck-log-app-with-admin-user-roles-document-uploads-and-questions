# Burke's Bus Service

## Current State
The app has a single `location` text field where drivers enter a combined address and stop number. This is stored in `ChecklistSubmissionRecord` as a `location: string` and displayed in the admin dashboard and PDF export as a single field.

## Requested Changes (Diff)

### Add
- `stops` array field on `ChecklistSubmissionRecord` — each stop has `{ stopNumber: number; address: string }`
- "Add Stop" button in the driver form to append a new stop entry
- Remove button per stop row so drivers can delete a mistaken entry
- Stop numbers are auto-incremented (Stop 1, Stop 2, Stop 3...)
- Admin dashboard detail dialog shows all stops as a numbered list
- PDF export renders all stops as a numbered list

### Modify
- `PublicChecklistPage.tsx`: replace `location` state with `stops` array state; replace single location input with dynamic stop list UI
- `AllChecklistsPage.tsx`: update detail dialog Location row to render stops list; update table Location column to show stop count or first stop preview
- `pdfExport.ts`: update `buildSingleChecklistPDF` to render stops list instead of single location string
- `ChecklistSubmissionRecord` interface: add `stops` field, keep `location` for backward compatibility with old submissions

### Remove
- Single `location` text input replaced by the dynamic stop list

## Implementation Plan
1. Update `ChecklistSubmissionRecord` interface to include `stops?: Array<{stopNumber: number; address: string}>` alongside existing `location` for backward compat
2. Update `PublicChecklistPage.tsx` state and UI: `stops` array, Add Stop button, per-row address input and remove button, auto-increment stop numbers
3. Pass `stops` in submission object
4. Update `AllChecklistsPage.tsx` detail dialog to render stops list
5. Update `pdfExport.ts` to render stops in PDF
