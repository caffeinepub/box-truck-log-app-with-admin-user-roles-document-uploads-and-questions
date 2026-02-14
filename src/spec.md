# Specification

## Summary
**Goal:** Build a web-based 28ft box truck log app with Internet Identity sign-in, Admin/User roles, truck log entries, document uploads, and a questions workflow.

**Planned changes:**
- Add Internet Identity authentication and role-based access control (Admin vs User) with backend-enforced authorization.
- Implement truck log CRUD for users (date/time, optional title, notes, optional numeric field) and an admin view for all users’ logs with filtering/grouping by user.
- Implement document upload/storage (bytes + metadata) with user-only access to own files and admin access to all users’ files; include download/view and clear upload error handling.
- Implement questions submission for users and admin management (status Open/Answered and optional admin reply) with proper access restrictions.
- Create separate Admin and User dashboards with navigation across Logs, Documents, and Questions; restrict/guard admin routes for non-admins.
- Apply a consistent “fleet/truck operations log” visual theme (not blue/purple-dominant) across layouts, forms, and lists/tables with responsive design.
- Add and display the required generated image asset from `frontend/public/assets/generated` in a primary UI surface (e.g., header/login/dashboard).

**User-visible outcome:** Users can sign in, manage their own truck logs, upload and download their documents, and submit questions; admins can sign in to view all users’ logs/documents/questions and manage question status/replies from an admin dashboard.
