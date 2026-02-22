/**
 * Utility functions for detecting and handling authorization errors from backend
 */

export function isAuthorizationError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('unauthorized') ||
    message.includes('not registered') ||
    message.includes('only registered users') ||
    message.includes('access denied') ||
    message.includes('permission denied')
  );
}

export function getAuthErrorMessage(error: Error): string {
  if (isAuthorizationError(error)) {
    if (error.message.includes('not registered') || error.message.includes('only registered users')) {
      return 'Setting up your account. Please wait...';
    }
    return 'Authentication required. Please sign in to continue.';
  }
  return error.message;
}

export function isTransientAuthError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes('not registered') ||
    message.includes('only registered users')
  );
}
