# Burke's Bus Service - Driver Log Enhancement

## Current State
The app has a pre-trip checklist and driver log. The driver log currently includes driver name, role (Driver/Helper), and Clock In/Out buttons. Admins view submissions with PDF export.

## Requested Changes (Diff)

### Add
- Start Time button (auto-records current time)
- End Time button (auto-records current time)
- Total Hours (auto-calculated from Start Time and End Time)
- Driving Hours (manual numeric input)
- Truck Number dropdown (options 1-10)
- Admin dashboard shows all five new fields
- PDF export includes all five new fields

### Modify
- Driver log section on user form
- Admin submission table and detail view
- PDF generation logic

### Remove
- Nothing

## Implementation Plan
1. Update backend submission type to include startTime, endTime, drivingHours, truckNumber
2. Update submitChecklist function to accept new fields
3. Update PublicChecklistPage: add Start/End Time buttons, auto-calc total hours, driving hours input, truck number dropdown
4. Update admin dashboard to show new fields
5. Update PDF export to include new fields
