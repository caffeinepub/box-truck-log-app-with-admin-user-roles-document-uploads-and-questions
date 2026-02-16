# Specification

## Summary
**Goal:** Stop the login/sign-in “Your Name” input from clearing, losing focus, or flickering while typing by preventing TanStack Router from being recreated on every render.

**Planned changes:**
- Update `frontend/src/App.tsx` to keep a single, stable TanStack Router instance across renders while still receiving updated auth context.
- Ensure the login route component is not remounted on each keystroke so its local state (e.g., `displayName`) remains intact.
- Verify existing route-guards/redirect behavior remains unchanged for `/user/*` and `/admin/*`.

**User-visible outcome:** On `/`, users can type their name into the sign-in input without it blinking, clearing, or losing focus, and navigation/redirects continue to work as before.
